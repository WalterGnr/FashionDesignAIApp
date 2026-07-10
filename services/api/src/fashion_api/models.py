from datetime import datetime
from typing import Any
from uuid import UUID, uuid4

from sqlalchemy import (
    JSON,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from fashion_api.database import Base

JSON_VALUE = JSON().with_variant(JSONB(), "postgresql")


class User(Base):
    __tablename__ = "users"
    __table_args__ = (CheckConstraint("role IN ('designer', 'admin')", name="ck_users_role"),)

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    email: Mapped[str | None] = mapped_column(String(320), unique=True)
    display_name: Mapped[str] = mapped_column(String(120))
    role: Mapped[str] = mapped_column(String(40), default="designer")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class Design(Base):
    __tablename__ = "designs"
    __table_args__ = (
        CheckConstraint("garment_category = 'dress'", name="ck_designs_dress_only"),
        CheckConstraint("status IN ('draft', 'active', 'archived')", name="ck_designs_status"),
        Index("ix_designs_owner_updated", "owner_user_id", "updated_at"),
    )

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    owner_user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), index=False)
    name: Mapped[str] = mapped_column(String(160))
    garment_category: Mapped[str] = mapped_column(String(40), default="dress")
    status: Mapped[str] = mapped_column(String(40), default="draft")
    current_version_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("design_versions.id", name="fk_designs_current_version", ondelete="SET NULL", use_alter=True),
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class DesignVersion(Base):
    __tablename__ = "design_versions"
    __table_args__ = (
        CheckConstraint("version_number > 0", name="ck_design_versions_positive_number"),
        UniqueConstraint("design_id", "version_number", name="uq_design_versions_number"),
        Index("ix_design_versions_design_created", "design_id", "created_at"),
    )

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    design_id: Mapped[UUID] = mapped_column(ForeignKey("designs.id", ondelete="CASCADE"))
    version_number: Mapped[int] = mapped_column(Integer)
    parent_version_id: Mapped[UUID | None] = mapped_column(ForeignKey("design_versions.id", ondelete="RESTRICT"))
    branch_id: Mapped[UUID | None]
    variation_label: Mapped[str | None] = mapped_column(String(120))
    source: Mapped[str] = mapped_column(String(40))
    created_by_actor: Mapped[str] = mapped_column(String(80))
    raw_input_ref: Mapped[str | None] = mapped_column(String(200))
    change_summary: Mapped[str] = mapped_column(String(500))
    spec_snapshot: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE)
    locked_fields_snapshot: Mapped[list[dict[str, Any]]] = mapped_column(JSON_VALUE, default=list)
    operation_ids: Mapped[list[str]] = mapped_column(JSON_VALUE, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
