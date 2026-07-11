import hashlib
import json
from datetime import UTC, datetime, timedelta
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, sessionmaker

from fashion_api.config import Settings
from fashion_api.models import (
    Design,
    DesignVersion,
    OutboxEvent,
    RenderAsset,
    TechPackAsset,
    TechPackInput,
    TechPackJob,
)
from fashion_api.schemas import (
    TechPackAssetRead,
    TechPackCreate,
    TechPackCreateRead,
    TechPackIssueRead,
    TechPackJobRead,
    TechPackReadinessRead,
)
from fashion_api.services import ResourceNotFoundError, VersionConflictError
from fashion_api.tech_pack_renderers import PDF_CONTENT_TYPE, XLSX_CONTENT_TYPE, render_pdf, render_xlsx
from fashion_api.tech_pack_storage import LocalTechPackStorage

SNAPSHOT_CONTRACT_VERSION = "dress-tech-pack-snapshot-v1"
TEMPLATE_VERSION = "dress-tech-pack-v1"
ACTIVE_STATES = {"queued", "running", "retrying", "cancel_requested"}
TERMINAL_STATES = {"blocked", "canceled", "succeeded", "succeeded_with_partial_formats", "failed"}


class TransientTechPackError(Exception):
    pass


def canonical_json(value: Any) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=True)


def _at(value: dict[str, Any], path: str) -> Any:
    current: Any = value
    for part in path.split("."):
        if not isinstance(current, dict):
            return None
        current = current.get(part)
    return current


def _unwrap(value: Any) -> Any:
    if isinstance(value, dict) and "value" in value:
        return value.get("value")
    return value


def _known(value: Any) -> bool:
    value = _unwrap(value)
    return value not in (None, "", "unknown")


def _status(value: Any) -> str:
    if isinstance(value, dict):
        return str(value.get("status") or "unknown")
    return "unknown"


def _label(path: str) -> str:
    return path.rsplit(".", 1)[-1].replace("_", " ").title()


def _field_label(path: str) -> str:
    labels = {
        "identity.dress_type": "Dress Type",
        "identity.occasion": "Occasion",
        "neckline.type": "Neckline Type",
        "neckline.depth": "Neckline Depth",
        "sleeves.type": "Sleeve Type",
        "sleeves.length_category": "Sleeve Length",
        "bodice.fit": "Bodice Fit",
        "bodice.waistline": "Waistline",
        "skirt.shape": "Skirt Shape",
        "length.category": "Dress Length",
        "closures.type": "Closure Type",
        "closures.placement": "Closure Placement",
        "lining.coverage": "Lining Coverage",
    }
    return labels.get(path, _label(path))


def _display(value: Any) -> str:
    value = _unwrap(value)
    if value in (None, "", "unknown"):
        return "Not specified"
    if isinstance(value, list):
        return ", ".join(_display(item) for item in value) if value else "Not specified"
    if isinstance(value, dict):
        if "name" in value:
            return _display(value["name"])
        return ", ".join(f"{_label(str(key))}: {_display(item)}" for key, item in value.items())
    return str(value).replace("_", " ")


def _issue(severity: str, code: str, message: str, field_path: str | None = None) -> dict[str, Any]:
    return {"severity": severity, "code": code, "field_path": field_path, "message": message}


def evaluate_readiness(spec: dict[str, Any], *, has_visual_reference: bool = False) -> tuple[str, list[dict[str, Any]]]:
    issues: list[dict[str, Any]] = []
    required_fields = [
        ("identity.dress_type", "Dress type is required."),
        ("silhouette", "Silhouette is required."),
        ("color.primary_color.name", "Primary color is required."),
        ("fabric.primary.name", "Primary fabric is required."),
        ("length.category", "Dress length category is required."),
        ("closures.type", "Closure must be specified or marked not applicable."),
        ("lining.coverage", "Lining must be specified or marked not applicable."),
    ]
    for path, message in required_fields:
        if not _known(_at(spec, path)):
            issues.append(_issue("blocker", f"missing_{path.replace('.', '_')}", message, path))

    measurement_units: set[str] = set()
    for name in ("bust", "waist", "hip", "dress_length"):
        path = f"measurements.{name}"
        measurement = _at(spec, path)
        raw_value = measurement.get("value") if isinstance(measurement, dict) else None
        unit = measurement.get("unit") if isinstance(measurement, dict) else None
        if not isinstance(raw_value, (int, float)) or isinstance(raw_value, bool) or not unit:
            issues.append(
                _issue(
                    "blocker",
                    f"missing_measurement_{name}",
                    f"{_label(name)} requires a numeric value and unit.",
                    path,
                )
            )
        else:
            measurement_units.add(str(unit))

    construction_notes = spec.get("construction_notes")
    if not isinstance(construction_notes, list) or not any(
        isinstance(item, dict) and str(item.get("text", "")).strip() for item in construction_notes
    ):
        issues.append(
            _issue(
                "blocker",
                "missing_construction_note",
                "At least one construction note is required.",
                "construction_notes",
            )
        )

    assumptions = spec.get("assumptions") if isinstance(spec.get("assumptions"), list) else []
    if assumptions:
        issues.append(_issue("warning", "contains_assumptions", "The specification contains unresolved assumptions."))
    if len(measurement_units) > 1:
        issues.append(_issue("warning", "mixed_measurement_units", "Measurements use mixed units."))
    if not has_visual_reference:
        issues.append(_issue("warning", "no_approved_visual", "No approved concept visual is attached."))
    for path, message in [
        ("fabric.primary.fiber_content", "Primary fabric fiber content is not specified."),
        ("fabric.primary.weight", "Primary fabric weight is not specified."),
        ("fabric.primary.stretch", "Primary fabric stretch is not specified."),
        ("fabric.primary.drape", "Primary fabric drape is not specified."),
    ]:
        if not _known(_at(spec, path)):
            issues.append(_issue("warning", f"missing_{path.replace('.', '_')}", message, path))
    for warning in spec.get("warnings", []) if isinstance(spec.get("warnings"), list) else []:
        text = warning.get("text") if isinstance(warning, dict) else warning
        if text:
            issues.append(_issue("warning", "spec_warning", str(text)))

    if any(item["severity"] == "blocker" for item in issues):
        return "blocked", issues
    if issues:
        return "ready_with_warnings", issues
    return "ready", issues


def _measurement_rows(spec: dict[str, Any]) -> list[dict[str, Any]]:
    measurements = spec.get("measurements") if isinstance(spec.get("measurements"), dict) else {}
    rows: list[dict[str, Any]] = []
    for name, measurement in measurements.items():
        if not isinstance(measurement, dict):
            measurement = {}
        value = measurement.get("value")
        rows.append(
            {
                "point_of_measure": _label(str(name)),
                "value": value if isinstance(value, (int, float)) and not isinstance(value, bool) else None,
                "unit": measurement.get("unit") or "",
                "status": measurement.get("status") or "unknown",
                "note": measurement.get("note") or "",
            }
        )
    return rows


def _note_rows(spec: dict[str, Any], key: str, note_type: str) -> list[dict[str, Any]]:
    rows = []
    for note in spec.get(key, []) if isinstance(spec.get(key), list) else []:
        if isinstance(note, dict) and note.get("text"):
            rows.append(
                {
                    "type": note_type,
                    "text": str(note["text"]),
                    "status": str(note.get("status") or "unknown"),
                    "source": str(note.get("source") or "unknown"),
                }
            )
    return rows


def build_snapshot(
    design: Design,
    version: DesignVersion,
    revision_history: list[DesignVersion],
    readiness_status: str,
    selected_render_asset: RenderAsset | None,
) -> dict[str, Any]:
    spec = version.spec_snapshot
    overview_paths = [
        "identity.dress_type",
        "identity.occasion",
        "silhouette",
        "neckline.type",
        "sleeves.type",
        "bodice.fit",
        "skirt.shape",
        "length.category",
        "closures.type",
        "lining.coverage",
    ]
    detail_paths = overview_paths + [
        "neckline.depth",
        "sleeves.length_category",
        "bodice.waistline",
        "color.pattern_or_print",
        "color.finish",
        "closures.placement",
    ]
    material_paths = [
        ("Primary fabric", "Name", "fabric.primary.name"),
        ("Primary fabric", "Fiber content", "fabric.primary.fiber_content"),
        ("Primary fabric", "Weight", "fabric.primary.weight"),
        ("Primary fabric", "Drape", "fabric.primary.drape"),
        ("Primary fabric", "Stretch", "fabric.primary.stretch"),
        ("Primary fabric", "Sheerness", "fabric.primary.sheerness"),
        ("Primary fabric", "Finish", "fabric.primary.finish"),
        ("Lining", "Coverage", "lining.coverage"),
        ("Lining", "Fabric", "lining.fabric.name"),
        ("Closure", "Type", "closures.type"),
        ("Closure", "Placement", "closures.placement"),
    ]
    primary_color = _display(_at(spec, "color.primary_color.name"))
    secondary_colors = _unwrap(_at(spec, "color.secondary_colors"))
    if not isinstance(secondary_colors, list):
        secondary_colors = []
    snapshot: dict[str, Any] = {
        "contract_version": SNAPSHOT_CONTRACT_VERSION,
        "template_version": TEMPLATE_VERSION,
        "generated_from_version_at": version.created_at.isoformat(),
        "design": {"id": str(design.id), "name": design.name, "garment_category": design.garment_category},
        "version": {
            "id": str(version.id),
            "version_number": version.version_number,
            "change_summary": version.change_summary,
            "source": version.source,
            "created_at": version.created_at.isoformat(),
        },
        "readiness_status": readiness_status,
        "spec_snapshot": spec,
        "locked_fields_snapshot": version.locked_fields_snapshot,
        "overview": [{"label": _field_label(path), "value": _display(_at(spec, path))} for path in overview_paths],
        "details": [
            {"field": _field_label(path), "value": _display(_at(spec, path)), "status": _status(_at(spec, path))}
            for path in detail_paths
        ],
        "materials": [
            {
                "component": component,
                "attribute": attribute,
                "value": _display(_at(spec, path)),
                "status": _status(_at(spec, path)),
            }
            for component, attribute, path in material_paths
        ],
        "measurements": _measurement_rows(spec),
        "colorways": [
            [_display(_at(spec, "color.colorway_name")), "Primary", primary_color, _display(_at(spec, "color.finish"))],
            *[
                [
                    _display(_at(spec, "color.colorway_name")),
                    "Secondary",
                    _display(color),
                    _display(_at(spec, "color.pattern_or_print")),
                ]
                for color in secondary_colors
            ],
        ],
        "construction_notes": _note_rows(spec, "construction_notes", "Construction"),
        "pattern_notes": _note_rows(spec, "pattern_notes", "Pattern"),
        "assumptions": [
            str(item.get("text") if isinstance(item, dict) else item) for item in spec.get("assumptions", []) if item
        ],
        "revision_history": [
            {
                "version_number": item.version_number,
                "created_at": item.created_at.isoformat(),
                "source": item.source,
                "change_summary": item.change_summary,
            }
            for item in revision_history
        ],
        "visual_reference": (
            {
                "render_asset_id": str(selected_render_asset.id),
                "sha256": selected_render_asset.sha256,
                "disclaimer": "Concept reference only - not a pattern or fit approval.",
            }
            if selected_render_asset
            else None
        ),
    }
    snapshot["snapshot_hash"] = hashlib.sha256(canonical_json(snapshot).encode("utf-8")).hexdigest()
    return snapshot


def _load_context(
    session: Session,
    design_id: UUID,
    design_version_id: UUID,
    owner_user_id: UUID,
    selected_render_asset_id: UUID | None = None,
) -> tuple[Design, DesignVersion, list[DesignVersion], RenderAsset | None]:
    design = session.scalar(select(Design).where(Design.id == design_id, Design.owner_user_id == owner_user_id))
    if design is None:
        raise ResourceNotFoundError("Design not found.")
    version = session.scalar(
        select(DesignVersion).where(DesignVersion.id == design_version_id, DesignVersion.design_id == design_id)
    )
    if version is None:
        raise ResourceNotFoundError("Design version not found.")
    if design.garment_category != "dress" or version.spec_snapshot.get("garment_category") != "dress":
        raise VersionConflictError("Tech-pack export currently supports dresses only.")
    history = list(
        session.scalars(
            select(DesignVersion).where(DesignVersion.design_id == design_id).order_by(DesignVersion.version_number)
        )
    )
    selected_asset = None
    if selected_render_asset_id:
        selected_asset = session.scalar(
            select(RenderAsset).where(
                RenderAsset.id == selected_render_asset_id,
                RenderAsset.design_version_id == design_version_id,
            )
        )
        if selected_asset is None:
            raise ResourceNotFoundError("Selected render asset not found for this dress version.")
    return design, version, history, selected_asset


def readiness_for_version(
    session: Session, design_id: UUID, design_version_id: UUID, owner_user_id: UUID
) -> TechPackReadinessRead:
    _, version, _, _ = _load_context(session, design_id, design_version_id, owner_user_id)
    readiness_status, issues = evaluate_readiness(version.spec_snapshot)
    return TechPackReadinessRead(
        design_id=design_id,
        design_version_id=design_version_id,
        status=readiness_status,
        issues=[TechPackIssueRead.model_validate(item) for item in issues],
    )


def _asset_read(asset: TechPackAsset) -> TechPackAssetRead:
    return TechPackAssetRead(
        id=asset.id,
        tech_pack_job_id=asset.tech_pack_job_id,
        format=asset.format,  # type: ignore[arg-type]
        content_type=asset.content_type,
        byte_size=asset.byte_size,
        sha256=asset.sha256,
        download_path=f"/tech-pack-assets/{asset.id}",
        created_at=asset.created_at,
    )


def _job_read(session: Session, job: TechPackJob) -> TechPackJobRead:
    job_input = session.get(TechPackInput, job.id)
    assets = list(session.scalars(select(TechPackAsset).where(TechPackAsset.tech_pack_job_id == job.id)))
    return TechPackJobRead(
        id=job.id,
        design_id=job.design_id,
        design_version_id=job.design_version_id,
        status=job.status,
        readiness_status=job.readiness_status,  # type: ignore[arg-type]
        requested_formats=job.requested_formats,
        format_statuses=job.format_statuses,
        page_size=job.page_size,  # type: ignore[arg-type]
        locale=job.locale,
        unit_preference=job.unit_preference,
        draft_acknowledged=job.draft_acknowledged,
        snapshot_hash=job.snapshot_hash,
        safe_error_code=job.safe_error_code,
        safe_error_message=job.safe_error_message,
        created_at=job.created_at,
        started_at=job.started_at,
        completed_at=job.completed_at,
        updated_at=job.updated_at,
        issues=[TechPackIssueRead.model_validate(item) for item in (job_input.readiness_issues if job_input else [])],
        assets=[_asset_read(asset) for asset in assets],
    )


def create_tech_pack(
    session: Session,
    payload: TechPackCreate,
    owner_user_id: UUID,
    settings: Settings,
) -> TechPackCreateRead:
    with session.begin():
        design, version, history, selected_asset = _load_context(
            session,
            payload.design_id,
            payload.design_version_id,
            owner_user_id,
            payload.selected_render_asset_id,
        )
        readiness_status, issues = evaluate_readiness(
            version.spec_snapshot, has_visual_reference=selected_asset is not None
        )
        snapshot = build_snapshot(design, version, history, readiness_status, selected_asset)
        formats = sorted(set(payload.formats))
        idempotency_material = {
            "snapshot_hash": snapshot["snapshot_hash"],
            "formats": formats,
            "page_size": payload.page_size,
            "locale": payload.locale,
            "unit_preference": payload.unit_preference,
            "acknowledge_draft": payload.acknowledge_draft,
            "selected_render_asset_id": str(payload.selected_render_asset_id or ""),
            "client_key": payload.client_idempotency_key or "",
        }
        idempotency_key = hashlib.sha256(canonical_json(idempotency_material).encode("utf-8")).hexdigest()
        existing = session.scalar(select(TechPackJob).where(TechPackJob.idempotency_key == idempotency_key))
        if existing:
            return TechPackCreateRead(job=_job_read(session, existing), reused_existing=True)

        is_blocked = readiness_status == "blocked" and not payload.acknowledge_draft
        job = TechPackJob(
            owner_user_id=owner_user_id,
            design_id=design.id,
            design_version_id=version.id,
            status="blocked" if is_blocked else "queued",
            readiness_status=readiness_status,
            requested_formats=formats,
            format_statuses={item: "blocked" if is_blocked else "queued" for item in formats},
            page_size=payload.page_size,
            locale=payload.locale,
            unit_preference=payload.unit_preference,
            draft_acknowledged=payload.acknowledge_draft,
            snapshot_hash=snapshot["snapshot_hash"],
            snapshot_contract_version=SNAPSHOT_CONTRACT_VERSION,
            template_version=TEMPLATE_VERSION,
            idempotency_key=idempotency_key,
            selected_render_asset_id=payload.selected_render_asset_id,
        )
        session.add(job)
        session.flush()
        session.add(TechPackInput(tech_pack_job_id=job.id, snapshot=snapshot, readiness_issues=issues))
        if not is_blocked:
            session.add(
                OutboxEvent(
                    event_type="tech_pack_job_requested",
                    aggregate_id=job.id,
                    payload={"tech_pack_job_id": str(job.id)},
                )
            )
    session.refresh(job)
    return TechPackCreateRead(job=_job_read(session, job), reused_existing=False)


def get_tech_pack(session: Session, job_id: UUID, owner_user_id: UUID) -> TechPackJobRead:
    job = session.scalar(
        select(TechPackJob).where(TechPackJob.id == job_id, TechPackJob.owner_user_id == owner_user_id)
    )
    if job is None:
        raise ResourceNotFoundError("Tech-pack job not found.")
    return _job_read(session, job)


def list_tech_packs(
    session: Session, owner_user_id: UUID, design_id: UUID | None = None, design_version_id: UUID | None = None
) -> list[TechPackJobRead]:
    query = select(TechPackJob).where(TechPackJob.owner_user_id == owner_user_id)
    if design_id:
        query = query.where(TechPackJob.design_id == design_id)
    if design_version_id:
        query = query.where(TechPackJob.design_version_id == design_version_id)
    jobs = session.scalars(query.order_by(TechPackJob.created_at.desc())).all()
    return [_job_read(session, job) for job in jobs]


def cancel_tech_pack(session: Session, job_id: UUID, owner_user_id: UUID) -> TechPackJobRead:
    with session.begin():
        job = session.scalar(
            select(TechPackJob)
            .where(TechPackJob.id == job_id, TechPackJob.owner_user_id == owner_user_id)
            .with_for_update()
        )
        if job is None:
            raise ResourceNotFoundError("Tech-pack job not found.")
        if job.status == "queued":
            job.status = "canceled"
            job.format_statuses = {key: "canceled" for key in job.format_statuses}
            job.completed_at = datetime.now(UTC)
        elif job.status == "running":
            job.status = "cancel_requested"
    session.refresh(job)
    return _job_read(session, job)


def get_tech_pack_asset(session: Session, asset_id: UUID, owner_user_id: UUID) -> TechPackAsset:
    asset = session.scalar(
        select(TechPackAsset)
        .join(TechPackJob, TechPackJob.id == TechPackAsset.tech_pack_job_id)
        .where(TechPackAsset.id == asset_id, TechPackJob.owner_user_id == owner_user_id)
    )
    if asset is None:
        raise ResourceNotFoundError("Tech-pack asset not found.")
    return asset


def process_tech_pack_once(
    session_factory: sessionmaker[Session],
    job_id: UUID,
    worker_id: str,
    storage: LocalTechPackStorage,
) -> str:
    with session_factory() as session:
        with session.begin():
            job = session.scalar(select(TechPackJob).where(TechPackJob.id == job_id).with_for_update())
            if job is None:
                raise ResourceNotFoundError("Tech-pack job not found.")
            if job.status in TERMINAL_STATES:
                return job.status
            if job.status == "cancel_requested":
                job.status = "canceled"
                job.completed_at = datetime.now(UTC)
                return "canceled"
            if job.status == "running" and job.lease_expires_at and job.lease_expires_at > datetime.now(UTC):
                return "leased"
            job.status = "running"
            job.started_at = job.started_at or datetime.now(UTC)
            job.lease_owner = worker_id
            job.lease_expires_at = datetime.now(UTC) + timedelta(minutes=5)
            job.attempt_count += 1
            job.format_statuses = {key: "running" for key in job.requested_formats}
    with session_factory() as session:
        job = session.get(TechPackJob, job_id)
        job_input = session.get(TechPackInput, job_id)
        if job is None or job_input is None:
            raise RuntimeError("Immutable tech-pack input is missing.")
        requested_formats = list(job.requested_formats)
        page_size = job.page_size
        snapshot = job_input.snapshot
        readiness_issues = job_input.readiness_issues

    completed: list[tuple[str, str, Any]] = []
    failures: list[str] = []
    for output_format in requested_formats:
        try:
            if output_format == "pdf":
                content = render_pdf(snapshot, readiness_issues, page_size)
                content_type = PDF_CONTENT_TYPE
            elif output_format == "xlsx":
                content = render_xlsx(snapshot, readiness_issues)
                content_type = XLSX_CONTENT_TYPE
            else:
                raise ValueError("Unsupported tech-pack format.")
            stored = storage.write(job_id, output_format, content)
            completed.append((output_format, content_type, stored))
        except Exception as error:
            failures.append(str(error)[:200])

    with session_factory() as session:
        with session.begin():
            job = session.get(TechPackJob, job_id)
            assert job is not None
            completed_formats = {item[0] for item in completed}
            for output_format, content_type, stored in completed:
                existing = session.scalar(
                    select(TechPackAsset).where(
                        TechPackAsset.tech_pack_job_id == job.id,
                        TechPackAsset.format == output_format,
                    )
                )
                if existing is None:
                    session.add(
                        TechPackAsset(
                            tech_pack_job_id=job.id,
                            format=output_format,
                            object_key=stored.object_key,
                            content_type=content_type,
                            byte_size=stored.byte_size,
                            sha256=stored.sha256,
                        )
                    )
            statuses = {
                item: ("succeeded" if item in completed_formats else "failed") for item in job.requested_formats
            }
            job.format_statuses = statuses
            job.completed_at = datetime.now(UTC)
            job.lease_owner = None
            job.lease_expires_at = None
            if len(completed_formats) == len(job.requested_formats):
                job.status = "succeeded"
            elif completed_formats:
                job.status = "succeeded_with_partial_formats"
                job.safe_error_code = "partial_export_failure"
                job.safe_error_message = "One requested format could not be generated."
            elif job.attempt_count < job.max_attempts:
                job.status = "retrying"
                job.format_statuses = {item: "retrying" for item in job.requested_formats}
                job.safe_error_code = "transient_export_failure"
                job.safe_error_message = "The export worker will retry the tech pack."
            else:
                job.status = "failed"
                job.safe_error_code = "export_generation_failed"
                job.safe_error_message = "The tech pack could not be generated."
            result = job.status
    if result == "retrying":
        detail = failures[0] if failures else "Tech-pack generation failed transiently."
        raise TransientTechPackError(detail)
    return result
