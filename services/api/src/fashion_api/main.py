import logging
from uuid import UUID

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from fashion_api.config import Settings, get_settings
from fashion_api.database import get_session
from fashion_api.rendering import (
    cancel_render_job,
    create_render_jobs,
    get_render_asset,
    get_render_job,
    list_render_jobs,
)
from fashion_api.schemas import (
    DesignCreate,
    DesignRead,
    DesignSummary,
    DesignVersionCreate,
    DesignVersionRead,
    HealthRead,
    RenderBatchRead,
    RenderCreate,
    RenderJobRead,
    TechPackCreate,
    TechPackCreateRead,
    TechPackJobRead,
    TechPackReadinessRead,
    TechPackReadinessRequest,
)
from fashion_api.services import (
    ResourceNotFoundError,
    VersionConflictError,
    create_design,
    create_design_version,
    get_design,
    get_design_version,
    list_design_versions,
    list_designs,
)
from fashion_api.storage import LocalRenderStorage
from fashion_api.tech_pack_storage import LocalTechPackStorage
from fashion_api.tech_packs import (
    cancel_tech_pack,
    create_tech_pack,
    get_tech_pack,
    get_tech_pack_asset,
    list_tech_packs,
    readiness_for_version,
)

settings = get_settings()
app = FastAPI(title=settings.app_name, version=settings.app_version)
logger = logging.getLogger(__name__)


def current_owner_id(config: Settings = Depends(get_settings)) -> UUID:
    return config.development_user_id


def not_found_or_conflict(error: Exception) -> HTTPException:
    if isinstance(error, ResourceNotFoundError):
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error))
    return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(error))


@app.get("/health", response_model=HealthRead)
def health(session: Session = Depends(get_session), config: Settings = Depends(get_settings)) -> HealthRead:
    try:
        session.execute(text("SELECT 1"))
    except SQLAlchemyError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is unavailable.",
        ) from error

    return HealthRead(
        status="ok",
        service=config.app_name,
        version=config.app_version,
        environment=config.app_env,
        database="reachable",
    )


@app.post("/designs", response_model=DesignRead, status_code=status.HTTP_201_CREATED)
def post_design(
    payload: DesignCreate,
    session: Session = Depends(get_session),
    owner_user_id: UUID = Depends(current_owner_id),
) -> DesignRead:
    return create_design(session, payload, owner_user_id)


@app.get("/designs", response_model=list[DesignSummary])
def get_designs(
    session: Session = Depends(get_session),
    owner_user_id: UUID = Depends(current_owner_id),
) -> list[DesignSummary]:
    return list_designs(session, owner_user_id)


@app.get("/designs/{design_id}", response_model=DesignRead)
def get_design_by_id(
    design_id: UUID,
    session: Session = Depends(get_session),
    owner_user_id: UUID = Depends(current_owner_id),
) -> DesignRead:
    try:
        return get_design(session, design_id, owner_user_id)
    except (ResourceNotFoundError, VersionConflictError) as error:
        raise not_found_or_conflict(error) from error


@app.post("/designs/{design_id}/versions", response_model=DesignVersionRead, status_code=status.HTTP_201_CREATED)
def post_design_version(
    design_id: UUID,
    payload: DesignVersionCreate,
    session: Session = Depends(get_session),
    owner_user_id: UUID = Depends(current_owner_id),
) -> DesignVersionRead:
    try:
        return create_design_version(session, design_id, payload, owner_user_id)
    except (ResourceNotFoundError, VersionConflictError) as error:
        raise not_found_or_conflict(error) from error


@app.get("/designs/{design_id}/versions", response_model=list[DesignVersionRead])
def get_versions(
    design_id: UUID,
    session: Session = Depends(get_session),
    owner_user_id: UUID = Depends(current_owner_id),
) -> list[DesignVersionRead]:
    try:
        return list_design_versions(session, design_id, owner_user_id)
    except ResourceNotFoundError as error:
        raise not_found_or_conflict(error) from error


@app.get("/designs/{design_id}/versions/{version_id}", response_model=DesignVersionRead)
def get_version_by_id(
    design_id: UUID,
    version_id: UUID,
    session: Session = Depends(get_session),
    owner_user_id: UUID = Depends(current_owner_id),
) -> DesignVersionRead:
    try:
        return get_design_version(session, design_id, version_id, owner_user_id)
    except ResourceNotFoundError as error:
        raise not_found_or_conflict(error) from error


@app.post("/renders", response_model=RenderBatchRead, status_code=status.HTTP_202_ACCEPTED)
def post_render(
    payload: RenderCreate,
    session: Session = Depends(get_session),
    owner_user_id: UUID = Depends(current_owner_id),
    config: Settings = Depends(get_settings),
) -> RenderBatchRead:
    try:
        batch = create_render_jobs(session, payload, owner_user_id, config)
    except (ResourceNotFoundError, VersionConflictError) as error:
        raise not_found_or_conflict(error) from error
    if config.render_dispatch_enabled and not batch.reused_existing:
        try:
            from fashion_api.tasks import wake_render_dispatcher

            wake_render_dispatcher()
        except Exception:
            logger.exception("Render dispatcher wake-up failed; the durable outbox will retry.")
    return batch


@app.get("/renders", response_model=list[RenderJobRead])
def get_renders(
    design_id: UUID | None = None,
    design_version_id: UUID | None = None,
    session: Session = Depends(get_session),
    owner_user_id: UUID = Depends(current_owner_id),
) -> list[RenderJobRead]:
    return list_render_jobs(session, owner_user_id, design_id, design_version_id)


@app.get("/renders/{render_job_id}", response_model=RenderJobRead)
def get_render_by_id(
    render_job_id: UUID,
    session: Session = Depends(get_session),
    owner_user_id: UUID = Depends(current_owner_id),
) -> RenderJobRead:
    try:
        return get_render_job(session, render_job_id, owner_user_id)
    except ResourceNotFoundError as error:
        raise not_found_or_conflict(error) from error


@app.post("/renders/{render_job_id}/cancel", response_model=RenderJobRead)
def post_render_cancel(
    render_job_id: UUID,
    session: Session = Depends(get_session),
    owner_user_id: UUID = Depends(current_owner_id),
) -> RenderJobRead:
    try:
        return cancel_render_job(session, render_job_id, owner_user_id)
    except ResourceNotFoundError as error:
        raise not_found_or_conflict(error) from error


@app.get("/render-assets/{asset_id}")
def get_render_asset_file(
    asset_id: UUID,
    session: Session = Depends(get_session),
    owner_user_id: UUID = Depends(current_owner_id),
    config: Settings = Depends(get_settings),
) -> FileResponse:
    try:
        asset = get_render_asset(session, asset_id, owner_user_id)
        storage = LocalRenderStorage(config.render_storage_root, config.render_max_asset_bytes)
        path = storage.path_for(asset.object_key)
    except (ResourceNotFoundError, FileNotFoundError) as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Render asset not found.") from error
    return FileResponse(path, media_type=asset.content_type, filename=f"fashion-render-{asset.id}.png")


@app.post("/tech-packs/readiness", response_model=TechPackReadinessRead)
def post_tech_pack_readiness(
    payload: TechPackReadinessRequest,
    session: Session = Depends(get_session),
    owner_user_id: UUID = Depends(current_owner_id),
) -> TechPackReadinessRead:
    try:
        return readiness_for_version(session, payload.design_id, payload.design_version_id, owner_user_id)
    except (ResourceNotFoundError, VersionConflictError) as error:
        raise not_found_or_conflict(error) from error


@app.post("/tech-packs", response_model=TechPackCreateRead, status_code=status.HTTP_202_ACCEPTED)
def post_tech_pack(
    payload: TechPackCreate,
    session: Session = Depends(get_session),
    owner_user_id: UUID = Depends(current_owner_id),
    config: Settings = Depends(get_settings),
) -> TechPackCreateRead:
    try:
        result = create_tech_pack(session, payload, owner_user_id, config)
    except (ResourceNotFoundError, VersionConflictError) as error:
        raise not_found_or_conflict(error) from error
    if config.render_dispatch_enabled and not result.reused_existing and result.job.status == "queued":
        try:
            from fashion_api.tasks import wake_tech_pack_dispatcher

            wake_tech_pack_dispatcher()
        except Exception:
            logger.exception("Tech-pack dispatcher wake-up failed; the durable outbox will retry.")
    return result


@app.get("/tech-packs", response_model=list[TechPackJobRead])
def get_tech_packs(
    design_id: UUID | None = None,
    design_version_id: UUID | None = None,
    session: Session = Depends(get_session),
    owner_user_id: UUID = Depends(current_owner_id),
) -> list[TechPackJobRead]:
    return list_tech_packs(session, owner_user_id, design_id, design_version_id)


@app.get("/tech-packs/{tech_pack_job_id}", response_model=TechPackJobRead)
def get_tech_pack_by_id(
    tech_pack_job_id: UUID,
    session: Session = Depends(get_session),
    owner_user_id: UUID = Depends(current_owner_id),
) -> TechPackJobRead:
    try:
        return get_tech_pack(session, tech_pack_job_id, owner_user_id)
    except ResourceNotFoundError as error:
        raise not_found_or_conflict(error) from error


@app.post("/tech-packs/{tech_pack_job_id}/cancel", response_model=TechPackJobRead)
def post_tech_pack_cancel(
    tech_pack_job_id: UUID,
    session: Session = Depends(get_session),
    owner_user_id: UUID = Depends(current_owner_id),
) -> TechPackJobRead:
    try:
        return cancel_tech_pack(session, tech_pack_job_id, owner_user_id)
    except ResourceNotFoundError as error:
        raise not_found_or_conflict(error) from error


@app.get("/tech-pack-assets/{asset_id}")
def get_tech_pack_asset_file(
    asset_id: UUID,
    session: Session = Depends(get_session),
    owner_user_id: UUID = Depends(current_owner_id),
    config: Settings = Depends(get_settings),
) -> FileResponse:
    try:
        asset = get_tech_pack_asset(session, asset_id, owner_user_id)
        storage = LocalTechPackStorage(config.tech_pack_storage_root, config.tech_pack_max_asset_bytes)
        path = storage.path_for(asset.object_key)
    except (ResourceNotFoundError, FileNotFoundError) as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tech-pack asset not found.") from error
    filename = f"fashion-tech-pack-{asset.tech_pack_job_id}.{asset.format}"
    return FileResponse(path, media_type=asset.content_type, filename=filename)
