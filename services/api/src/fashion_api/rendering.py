import hashlib
import json
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import TYPE_CHECKING, Any
from uuid import UUID, uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session, sessionmaker

from fashion_api.config import Settings
from fashion_api.models import Design, DesignVersion, OutboxEvent, RenderAsset, RenderJob, RenderJobInput
from fashion_api.schemas import RenderAssetRead, RenderBatchRead, RenderCreate, RenderJobRead
from fashion_api.services import ResourceNotFoundError, VersionConflictError

if TYPE_CHECKING:
    from fashion_api.providers import RenderProvider
    from fashion_api.storage import LocalRenderStorage

PROMPT_CONTRACT_VERSION = "dress-concept-v1"
ACTIVE_RENDER_STATES = {"queued", "running", "retrying", "cancel_requested"}
TERMINAL_RENDER_STATES = {"canceled", "succeeded", "failed"}


class TransientRenderError(Exception):
    pass


class PermanentRenderError(Exception):
    pass


@dataclass(frozen=True)
class GeneratedRender:
    image_bytes: bytes
    content_type: str
    provider_request_id: str | None = None


def canonical_json(value: Any) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=True)


def sha256_text(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def _value_at(spec: dict[str, Any], path: str, fallback: str = "unspecified") -> str:
    current: Any = spec
    for part in path.split("."):
        if not isinstance(current, dict) or part not in current:
            return fallback
        current = current[part]
    if isinstance(current, dict) and "value" in current:
        current = current["value"]
    if current in (None, "", "unknown"):
        return fallback
    return str(current).replace("_", " ")


def build_render_prompt(
    spec: dict[str, Any],
    locked_fields: list[dict[str, Any]],
    payload: RenderCreate,
    variation_index: int,
) -> str:
    locked = ", ".join(str(item.get("field_path", "")) for item in locked_fields if item.get("field_path"))
    locked_text = locked or "none"
    sections = [
        "Create one full-body professional fashion concept render of a dress on a neutral adult mannequin.",
        f"Garment: {_value_at(spec, 'identity.dress_type')} for {_value_at(spec, 'identity.occasion')}.",
        f"Silhouette: {_value_at(spec, 'silhouette')}; bodice: {_value_at(spec, 'bodice.structure')}; "
        f"neckline: {_value_at(spec, 'neckline.type')}.",
        f"Sleeves: {_value_at(spec, 'sleeves.type')}; skirt: {_value_at(spec, 'skirt.shape')}; "
        f"length: {_value_at(spec, 'length.category')}.",
        f"Primary fabric: {_value_at(spec, 'fabric.primary.name')}; primary color: "
        f"{_value_at(spec, 'color.primary_color.name')}; finish: {_value_at(spec, 'color.finish')}.",
        f"Closure: {_value_at(spec, 'closures.type')} at {_value_at(spec, 'closures.placement')}; "
        f"lining: {_value_at(spec, 'lining.coverage')}.",
        f"Composition: {payload.view_preset.replace('_', ' ')} view, {payload.render_style.replace('_', ' ')}, "
        "quiet light-gray studio background, entire garment and feet visible, no cropping.",
        f"Preserve locked structured fields: {locked_text}.",
        f"Variation slot {variation_index}: vary only pose and fabric drape, never the structured garment facts.",
        "This is a concept visualization. Do not add text, logos, extra garments, or unsupported construction details.",
    ]
    return "\n".join(sections)


def provider_configuration(settings: Settings) -> tuple[str, str]:
    if settings.render_provider == "openai":
        return "openai", settings.openai_image_model
    return "mock", "local-fashion-concept-v1"


def _asset_read(asset: RenderAsset) -> RenderAssetRead:
    return RenderAssetRead(
        id=asset.id,
        render_job_id=asset.render_job_id,
        content_type=asset.content_type,
        byte_size=asset.byte_size,
        sha256=asset.sha256,
        width=asset.width,
        height=asset.height,
        output_format=asset.output_format,
        download_path=f"/render-assets/{asset.id}",
        created_at=asset.created_at,
    )


def render_job_read(session: Session, job: RenderJob) -> RenderJobRead:
    asset = session.scalar(
        select(RenderAsset).where(RenderAsset.render_job_id == job.id, RenderAsset.deleted_at.is_(None))
    )
    return RenderJobRead(
        id=job.id,
        design_id=job.design_id,
        design_version_id=job.design_version_id,
        render_style=job.render_style,
        view_preset=job.view_preset,
        quality=job.quality,
        output_size=job.output_size,
        status=job.status,
        provider=job.provider,
        provider_model=job.provider_model,
        variation_index=job.variation_index,
        attempt_count=job.attempt_count,
        max_attempts=job.max_attempts,
        safe_error_code=job.safe_error_code,
        safe_error_message=job.safe_error_message,
        created_at=job.created_at,
        started_at=job.started_at,
        completed_at=job.completed_at,
        updated_at=job.updated_at,
        asset=_asset_read(asset) if asset else None,
    )


def create_render_jobs(
    session: Session,
    payload: RenderCreate,
    owner_user_id: UUID,
    settings: Settings,
) -> RenderBatchRead:
    provider, provider_model = provider_configuration(settings)
    jobs: list[RenderJob] = []
    reused_count = 0

    with session.begin():
        design = session.scalar(
            select(Design)
            .where(Design.id == payload.design_id, Design.owner_user_id == owner_user_id)
            .with_for_update()
        )
        if design is None:
            raise ResourceNotFoundError("Design not found.")
        version = session.scalar(
            select(DesignVersion).where(
                DesignVersion.id == payload.design_version_id,
                DesignVersion.design_id == payload.design_id,
            )
        )
        if version is None:
            raise VersionConflictError("Design version does not belong to this design.")

        input_snapshot = {
            "spec_snapshot": version.spec_snapshot,
            "locked_fields_snapshot": version.locked_fields_snapshot,
        }
        input_hash = sha256_text(canonical_json(input_snapshot))

        for variation_index in range(1, payload.variation_count + 1):
            identity = {
                "owner_user_id": str(owner_user_id),
                "design_version_id": str(version.id),
                "render_style": payload.render_style,
                "view_preset": payload.view_preset,
                "quality": payload.quality,
                "output_size": payload.output_size,
                "prompt_contract_version": PROMPT_CONTRACT_VERSION,
                "provider": provider,
                "provider_model": provider_model,
                "variation_index": variation_index,
                "client_idempotency_key": payload.client_idempotency_key,
                "input_hash": input_hash,
            }
            idempotency_key = sha256_text(canonical_json(identity))
            existing = session.scalar(select(RenderJob).where(RenderJob.idempotency_key == idempotency_key))
            if existing is not None:
                jobs.append(existing)
                reused_count += 1
                continue

            prompt = build_render_prompt(
                version.spec_snapshot,
                version.locked_fields_snapshot,
                payload,
                variation_index,
            )
            job = RenderJob(
                owner_user_id=owner_user_id,
                design_id=design.id,
                design_version_id=version.id,
                render_style=payload.render_style,
                view_preset=payload.view_preset,
                quality=payload.quality,
                output_size=payload.output_size,
                status="queued",
                prompt_contract_version=PROMPT_CONTRACT_VERSION,
                provider=provider,
                provider_model=provider_model,
                variation_index=variation_index,
                attempt_count=0,
                max_attempts=3,
                idempotency_key=idempotency_key,
            )
            session.add(job)
            session.flush()
            session.add(
                RenderJobInput(
                    render_job_id=job.id,
                    spec_snapshot=version.spec_snapshot,
                    locked_fields_snapshot=version.locked_fields_snapshot,
                    normalized_prompt=prompt,
                    input_hash=input_hash,
                )
            )
            session.add(
                OutboxEvent(
                    event_type="render_job_requested",
                    aggregate_id=job.id,
                    payload={"render_job_id": str(job.id)},
                    attempt_count=0,
                )
            )
            jobs.append(job)

    return RenderBatchRead(
        jobs=[render_job_read(session, job) for job in jobs],
        reused_existing=reused_count == len(jobs),
    )


def get_render_job(session: Session, job_id: UUID, owner_user_id: UUID) -> RenderJobRead:
    job = session.scalar(select(RenderJob).where(RenderJob.id == job_id, RenderJob.owner_user_id == owner_user_id))
    if job is None:
        raise ResourceNotFoundError("Render job not found.")
    return render_job_read(session, job)


def list_render_jobs(
    session: Session,
    owner_user_id: UUID,
    design_id: UUID | None = None,
    design_version_id: UUID | None = None,
) -> list[RenderJobRead]:
    query = select(RenderJob).where(RenderJob.owner_user_id == owner_user_id)
    if design_id is not None:
        query = query.where(RenderJob.design_id == design_id)
    if design_version_id is not None:
        query = query.where(RenderJob.design_version_id == design_version_id)
    jobs = session.scalars(query.order_by(RenderJob.created_at.desc(), RenderJob.variation_index)).all()
    return [render_job_read(session, job) for job in jobs]


def cancel_render_job(session: Session, job_id: UUID, owner_user_id: UUID) -> RenderJobRead:
    with session.begin():
        job = session.scalar(
            select(RenderJob).where(RenderJob.id == job_id, RenderJob.owner_user_id == owner_user_id).with_for_update()
        )
        if job is None:
            raise ResourceNotFoundError("Render job not found.")
        if job.status in {"queued", "retrying"}:
            job.status = "canceled"
            job.completed_at = datetime.now(UTC)
        elif job.status == "running":
            job.status = "cancel_requested"
        job.updated_at = datetime.now(UTC)
    return render_job_read(session, job)


def get_render_asset(session: Session, asset_id: UUID, owner_user_id: UUID) -> RenderAsset:
    asset = session.scalar(
        select(RenderAsset)
        .join(RenderJob, RenderJob.id == RenderAsset.render_job_id)
        .where(
            RenderAsset.id == asset_id,
            RenderAsset.deleted_at.is_(None),
            RenderJob.owner_user_id == owner_user_id,
            RenderJob.status == "succeeded",
        )
    )
    if asset is None:
        raise ResourceNotFoundError("Render asset not found.")
    return asset


def claim_render_job(session: Session, job_id: UUID, worker_id: str) -> tuple[RenderJob, RenderJobInput] | None:
    now = datetime.now(UTC)
    with session.begin():
        job = session.scalar(select(RenderJob).where(RenderJob.id == job_id).with_for_update())
        if job is None or job.status in TERMINAL_RENDER_STATES:
            return None
        if job.status == "cancel_requested":
            job.status = "canceled"
            job.completed_at = now
            job.updated_at = now
            return None
        if job.status == "running" and job.lease_expires_at is not None and job.lease_expires_at > now:
            return None
        job_input = session.get(RenderJobInput, job.id)
        if job_input is None:
            raise PermanentRenderError("Render input is missing.")
        job.status = "running"
        job.attempt_count += 1
        job.started_at = job.started_at or now
        job.lease_owner = worker_id
        job.lease_expires_at = now + timedelta(minutes=10)
        job.safe_error_code = None
        job.safe_error_message = None
        job.updated_at = now
    return job, job_input


def mark_render_retry(session: Session, job_id: UUID, message: str) -> None:
    with session.begin():
        job = session.get(RenderJob, job_id)
        if job is None:
            return
        now = datetime.now(UTC)
        if job.attempt_count >= job.max_attempts:
            job.status = "failed"
            job.completed_at = now
            job.safe_error_code = "retry_exhausted"
            job.safe_error_message = "The render could not be completed after several attempts."
        else:
            job.status = "retrying"
            job.next_attempt_at = now + timedelta(seconds=2**job.attempt_count)
            job.safe_error_code = "temporary_provider_error"
            job.safe_error_message = message[:500]
        job.lease_owner = None
        job.lease_expires_at = None
        job.updated_at = now


def mark_render_failed(session: Session, job_id: UUID, code: str, message: str) -> None:
    with session.begin():
        job = session.get(RenderJob, job_id)
        if job is None:
            return
        now = datetime.now(UTC)
        job.status = "failed"
        job.safe_error_code = code[:80]
        job.safe_error_message = message[:500]
        job.completed_at = now
        job.lease_owner = None
        job.lease_expires_at = None
        job.updated_at = now


def complete_render_job(
    session: Session,
    job_id: UUID,
    generated: GeneratedRender,
    storage: "LocalRenderStorage",
) -> RenderJobRead:
    asset_id = uuid4()
    with session.begin():
        job = session.get(RenderJob, job_id)
        if job is None:
            raise ResourceNotFoundError("Render job not found.")
        owner_id = job.owner_user_id
        design_id = job.design_id
        design_version_id = job.design_version_id
    stored = storage.store(
        owner_id=owner_id,
        design_id=design_id,
        design_version_id=design_version_id,
        render_job_id=job_id,
        asset_id=asset_id,
        image_bytes=generated.image_bytes,
        content_type=generated.content_type,
    )

    with session.begin():
        locked_job = session.scalar(select(RenderJob).where(RenderJob.id == job_id).with_for_update())
        if locked_job is None:
            storage.delete(stored.object_key)
            raise ResourceNotFoundError("Render job not found.")
        now = datetime.now(UTC)
        if locked_job.status == "cancel_requested":
            storage.delete(stored.object_key)
            locked_job.status = "canceled"
            locked_job.completed_at = now
            locked_job.updated_at = now
            return render_job_read(session, locked_job)
        asset = RenderAsset(
            id=asset_id,
            render_job_id=locked_job.id,
            design_version_id=locked_job.design_version_id,
            storage_provider="local",
            object_key=stored.object_key,
            content_type=stored.content_type,
            byte_size=stored.byte_size,
            sha256=stored.sha256,
            width=stored.width,
            height=stored.height,
            output_format=stored.output_format,
        )
        session.add(asset)
        locked_job.status = "succeeded"
        locked_job.provider_request_id = generated.provider_request_id
        locked_job.completed_at = now
        locked_job.lease_owner = None
        locked_job.lease_expires_at = None
        locked_job.updated_at = now
        session.flush()
    return render_job_read(session, locked_job)


def process_render_job_once(
    session_factory: sessionmaker[Session],
    job_id: UUID,
    worker_id: str,
    provider: "RenderProvider",
    storage: "LocalRenderStorage",
) -> str:
    with session_factory() as session:
        claimed = claim_render_job(session, job_id, worker_id)
        if claimed is None:
            return "skipped"
        job, job_input = claimed
        try:
            generated = provider.generate(job, job_input)
            result = complete_render_job(session, job.id, generated, storage)
            return result.status
        except TransientRenderError as error:
            mark_render_retry(session, job.id, str(error) or "The image provider is temporarily unavailable.")
            raise
        except PermanentRenderError as error:
            mark_render_failed(session, job.id, "provider_rejected", str(error) or "The render request was rejected.")
            return "failed"
        except Exception:
            mark_render_failed(session, job.id, "render_failed", "The render could not be completed.")
            raise
