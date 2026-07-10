from uuid import UUID

from fastapi import Depends, FastAPI, HTTPException, status
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from fashion_api.config import Settings, get_settings
from fashion_api.database import get_session
from fashion_api.schemas import (
    DesignCreate,
    DesignRead,
    DesignSummary,
    DesignVersionCreate,
    DesignVersionRead,
    HealthRead,
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

settings = get_settings()
app = FastAPI(title=settings.app_name, version=settings.app_version)


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
