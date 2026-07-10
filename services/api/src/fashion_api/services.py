from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from fashion_api.models import Design, DesignVersion, User
from fashion_api.schemas import DesignCreate, DesignRead, DesignSummary, DesignVersionCreate, DesignVersionRead


class ResourceNotFoundError(Exception):
    pass


class VersionConflictError(Exception):
    pass


def _version_read(version: DesignVersion) -> DesignVersionRead:
    return DesignVersionRead.model_validate(version)


def _design_read(design: Design, current_version: DesignVersion) -> DesignRead:
    if design.current_version_id is None:
        raise VersionConflictError("Design has no current version.")

    return DesignRead(
        id=design.id,
        owner_user_id=design.owner_user_id,
        name=design.name,
        garment_category="dress",
        status=design.status,
        current_version_id=design.current_version_id,
        current_version=_version_read(current_version),
        created_at=design.created_at,
        updated_at=design.updated_at,
    )


def _ensure_development_user(session: Session, owner_user_id: UUID) -> None:
    if session.get(User, owner_user_id) is None:
        session.add(
            User(
                id=owner_user_id,
                email=None,
                display_name="Local Designer",
                role="designer",
            )
        )
        session.flush()


def create_design(session: Session, payload: DesignCreate, owner_user_id: UUID) -> DesignRead:
    with session.begin():
        _ensure_development_user(session, owner_user_id)
        design = Design(
            owner_user_id=owner_user_id,
            name=payload.name,
            garment_category="dress",
            status=payload.status,
        )
        session.add(design)
        session.flush()

        initial = payload.initial_version
        version = DesignVersion(
            design_id=design.id,
            version_number=1,
            parent_version_id=None,
            branch_id=initial.branch_id,
            variation_label=initial.variation_label,
            source=initial.source,
            created_by_actor=initial.created_by_actor,
            raw_input_ref=initial.raw_input_ref,
            change_summary=initial.change_summary,
            spec_snapshot=initial.spec_snapshot.model_dump(mode="json"),
            locked_fields_snapshot=initial.locked_fields_snapshot,
            operation_ids=initial.operation_ids,
        )
        session.add(version)
        session.flush()
        design.current_version_id = version.id
        session.flush()

    return _design_read(design, version)


def get_design(session: Session, design_id: UUID, owner_user_id: UUID) -> DesignRead:
    design = session.scalar(select(Design).where(Design.id == design_id, Design.owner_user_id == owner_user_id))
    if design is None or design.current_version_id is None:
        raise ResourceNotFoundError("Design not found.")

    version = session.scalar(
        select(DesignVersion).where(
            DesignVersion.id == design.current_version_id,
            DesignVersion.design_id == design.id,
        )
    )
    if version is None:
        raise VersionConflictError("Current design version is missing.")
    return _design_read(design, version)


def list_designs(session: Session, owner_user_id: UUID) -> list[DesignSummary]:
    designs = session.scalars(
        select(Design).where(Design.owner_user_id == owner_user_id).order_by(Design.updated_at.desc(), Design.id)
    ).all()
    return [DesignSummary.model_validate(design) for design in designs if design.current_version_id is not None]


def create_design_version(
    session: Session,
    design_id: UUID,
    payload: DesignVersionCreate,
    owner_user_id: UUID,
) -> DesignVersionRead:
    with session.begin():
        design = session.scalar(
            select(Design).where(Design.id == design_id, Design.owner_user_id == owner_user_id).with_for_update()
        )
        if design is None:
            raise ResourceNotFoundError("Design not found.")

        parent_id = payload.parent_version_id or design.current_version_id
        if parent_id is not None:
            parent = session.scalar(
                select(DesignVersion).where(DesignVersion.id == parent_id, DesignVersion.design_id == design.id)
            )
            if parent is None:
                raise VersionConflictError("Parent version does not belong to this design.")

        highest_version = session.scalar(
            select(func.coalesce(func.max(DesignVersion.version_number), 0)).where(DesignVersion.design_id == design.id)
        )
        version = DesignVersion(
            design_id=design.id,
            version_number=int(highest_version or 0) + 1,
            parent_version_id=parent_id,
            branch_id=payload.branch_id,
            variation_label=payload.variation_label,
            source=payload.source,
            created_by_actor=payload.created_by_actor,
            raw_input_ref=payload.raw_input_ref,
            change_summary=payload.change_summary,
            spec_snapshot=payload.spec_snapshot.model_dump(mode="json"),
            locked_fields_snapshot=payload.locked_fields_snapshot,
            operation_ids=payload.operation_ids,
        )
        session.add(version)
        session.flush()
        design.current_version_id = version.id
        session.flush()

    return _version_read(version)


def list_design_versions(session: Session, design_id: UUID, owner_user_id: UUID) -> list[DesignVersionRead]:
    design_exists = session.scalar(
        select(Design.id).where(Design.id == design_id, Design.owner_user_id == owner_user_id)
    )
    if design_exists is None:
        raise ResourceNotFoundError("Design not found.")

    versions = session.scalars(
        select(DesignVersion).where(DesignVersion.design_id == design_id).order_by(DesignVersion.version_number.asc())
    ).all()
    return [_version_read(version) for version in versions]


def get_design_version(
    session: Session,
    design_id: UUID,
    version_id: UUID,
    owner_user_id: UUID,
) -> DesignVersionRead:
    version = session.scalar(
        select(DesignVersion)
        .join(Design, Design.id == DesignVersion.design_id)
        .where(
            DesignVersion.id == version_id,
            DesignVersion.design_id == design_id,
            Design.owner_user_id == owner_user_id,
        )
    )
    if version is None:
        raise ResourceNotFoundError("Design version not found.")
    return _version_read(version)
