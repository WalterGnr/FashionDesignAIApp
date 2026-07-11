from datetime import datetime
from typing import Any
from uuid import UUID, uuid4

from sqlalchemy import (
    JSON,
    BigInteger,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
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


class RenderJob(Base):
    __tablename__ = "render_jobs"
    __table_args__ = (
        CheckConstraint(
            "status IN ('queued', 'running', 'retrying', 'cancel_requested', 'canceled', 'succeeded', 'failed')",
            name="ck_render_jobs_status",
        ),
        CheckConstraint("quality IN ('low', 'medium', 'high')", name="ck_render_jobs_quality"),
        CheckConstraint(
            "view_preset IN ('front', 'three_quarter', 'side', 'back')",
            name="ck_render_jobs_view_preset",
        ),
        CheckConstraint("attempt_count >= 0", name="ck_render_jobs_attempt_count"),
        CheckConstraint("max_attempts > 0", name="ck_render_jobs_max_attempts"),
        CheckConstraint("variation_index > 0", name="ck_render_jobs_variation_index"),
        Index("ix_render_jobs_owner_created", "owner_user_id", "created_at"),
        Index("ix_render_jobs_design_version", "design_version_id", "created_at"),
    )

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    owner_user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"))
    design_id: Mapped[UUID] = mapped_column(ForeignKey("designs.id", ondelete="CASCADE"))
    design_version_id: Mapped[UUID] = mapped_column(ForeignKey("design_versions.id", ondelete="RESTRICT"))
    render_style: Mapped[str] = mapped_column(String(60))
    view_preset: Mapped[str] = mapped_column(String(40))
    quality: Mapped[str] = mapped_column(String(20))
    output_size: Mapped[str] = mapped_column(String(30))
    status: Mapped[str] = mapped_column(String(30), default="queued")
    prompt_contract_version: Mapped[str] = mapped_column(String(40))
    provider: Mapped[str] = mapped_column(String(40))
    provider_model: Mapped[str] = mapped_column(String(100))
    provider_request_id: Mapped[str | None] = mapped_column(String(200))
    variation_index: Mapped[int] = mapped_column(Integer, default=1)
    attempt_count: Mapped[int] = mapped_column(Integer, default=0)
    max_attempts: Mapped[int] = mapped_column(Integer, default=3)
    idempotency_key: Mapped[str] = mapped_column(String(64), unique=True)
    safe_error_code: Mapped[str | None] = mapped_column(String(80))
    safe_error_message: Mapped[str | None] = mapped_column(String(500))
    lease_owner: Mapped[str | None] = mapped_column(String(120))
    lease_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    next_attempt_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class RenderJobInput(Base):
    __tablename__ = "render_job_inputs"

    render_job_id: Mapped[UUID] = mapped_column(ForeignKey("render_jobs.id", ondelete="CASCADE"), primary_key=True)
    spec_snapshot: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE)
    locked_fields_snapshot: Mapped[list[dict[str, Any]]] = mapped_column(JSON_VALUE, default=list)
    normalized_prompt: Mapped[str] = mapped_column(Text)
    input_hash: Mapped[str] = mapped_column(String(64), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class RenderAsset(Base):
    __tablename__ = "render_assets"
    __table_args__ = (
        CheckConstraint("byte_size > 0", name="ck_render_assets_byte_size"),
        CheckConstraint("width > 0 AND height > 0", name="ck_render_assets_dimensions"),
        Index("ix_render_assets_version_created", "design_version_id", "created_at"),
    )

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    render_job_id: Mapped[UUID] = mapped_column(ForeignKey("render_jobs.id", ondelete="CASCADE"), unique=True)
    design_version_id: Mapped[UUID] = mapped_column(ForeignKey("design_versions.id", ondelete="RESTRICT"))
    storage_provider: Mapped[str] = mapped_column(String(40))
    object_key: Mapped[str] = mapped_column(String(500), unique=True)
    content_type: Mapped[str] = mapped_column(String(100))
    byte_size: Mapped[int] = mapped_column(BigInteger)
    sha256: Mapped[str] = mapped_column(String(64))
    width: Mapped[int] = mapped_column(Integer)
    height: Mapped[int] = mapped_column(Integer)
    output_format: Mapped[str] = mapped_column(String(20))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class TechPackJob(Base):
    __tablename__ = "tech_pack_jobs"
    __table_args__ = (
        CheckConstraint(
            "status IN ('blocked', 'queued', 'running', 'retrying', 'cancel_requested', 'canceled', "
            "'succeeded', 'succeeded_with_partial_formats', 'failed')",
            name="ck_tech_pack_jobs_status",
        ),
        CheckConstraint(
            "readiness_status IN ('ready', 'ready_with_warnings', 'blocked')",
            name="ck_tech_pack_jobs_readiness",
        ),
        CheckConstraint("page_size IN ('letter', 'a4')", name="ck_tech_pack_jobs_page_size"),
        CheckConstraint("attempt_count >= 0", name="ck_tech_pack_jobs_attempt_count"),
        CheckConstraint("max_attempts > 0", name="ck_tech_pack_jobs_max_attempts"),
        Index("ix_tech_pack_jobs_owner_created", "owner_user_id", "created_at"),
        Index("ix_tech_pack_jobs_design_version", "design_version_id", "created_at"),
    )

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    owner_user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"))
    design_id: Mapped[UUID] = mapped_column(ForeignKey("designs.id", ondelete="CASCADE"))
    design_version_id: Mapped[UUID] = mapped_column(ForeignKey("design_versions.id", ondelete="RESTRICT"))
    status: Mapped[str] = mapped_column(String(40), default="queued")
    readiness_status: Mapped[str] = mapped_column(String(40))
    requested_formats: Mapped[list[str]] = mapped_column(JSON_VALUE)
    format_statuses: Mapped[dict[str, str]] = mapped_column(JSON_VALUE)
    page_size: Mapped[str] = mapped_column(String(20), default="letter")
    locale: Mapped[str] = mapped_column(String(20), default="en-US")
    unit_preference: Mapped[str] = mapped_column(String(20), default="source")
    draft_acknowledged: Mapped[bool] = mapped_column(default=False)
    snapshot_hash: Mapped[str] = mapped_column(String(64), index=True)
    snapshot_contract_version: Mapped[str] = mapped_column(String(40))
    template_version: Mapped[str] = mapped_column(String(40))
    idempotency_key: Mapped[str] = mapped_column(String(64), unique=True)
    selected_render_asset_id: Mapped[UUID | None] = mapped_column(ForeignKey("render_assets.id", ondelete="SET NULL"))
    attempt_count: Mapped[int] = mapped_column(Integer, default=0)
    max_attempts: Mapped[int] = mapped_column(Integer, default=3)
    safe_error_code: Mapped[str | None] = mapped_column(String(80))
    safe_error_message: Mapped[str | None] = mapped_column(String(500))
    lease_owner: Mapped[str | None] = mapped_column(String(120))
    lease_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class TechPackInput(Base):
    __tablename__ = "tech_pack_inputs"

    tech_pack_job_id: Mapped[UUID] = mapped_column(
        ForeignKey("tech_pack_jobs.id", ondelete="CASCADE"), primary_key=True
    )
    snapshot: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE)
    readiness_issues: Mapped[list[dict[str, Any]]] = mapped_column(JSON_VALUE)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class TechPackAsset(Base):
    __tablename__ = "tech_pack_assets"
    __table_args__ = (
        CheckConstraint("format IN ('pdf', 'xlsx')", name="ck_tech_pack_assets_format"),
        CheckConstraint("byte_size > 0", name="ck_tech_pack_assets_byte_size"),
        UniqueConstraint("tech_pack_job_id", "format", name="uq_tech_pack_assets_job_format"),
    )

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    tech_pack_job_id: Mapped[UUID] = mapped_column(ForeignKey("tech_pack_jobs.id", ondelete="CASCADE"))
    format: Mapped[str] = mapped_column(String(20))
    storage_provider: Mapped[str] = mapped_column(String(40), default="local")
    object_key: Mapped[str] = mapped_column(String(500), unique=True)
    content_type: Mapped[str] = mapped_column(String(120))
    byte_size: Mapped[int] = mapped_column(BigInteger)
    sha256: Mapped[str] = mapped_column(String(64))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class OutboxEvent(Base):
    __tablename__ = "outbox_events"
    __table_args__ = (Index("ix_outbox_events_pending", "delivered_at", "created_at"),)

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    event_type: Mapped[str] = mapped_column(String(100))
    aggregate_id: Mapped[UUID]
    payload: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE)
    attempt_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    delivered_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
