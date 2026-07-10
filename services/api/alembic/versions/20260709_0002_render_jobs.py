"""Create durable render jobs, immutable inputs, assets, and outbox events.

Revision ID: 20260709_0002
Revises: 20260709_0001
Create Date: 2026-07-09
"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "20260709_0002"
down_revision: str | None = "20260709_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "render_jobs",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("owner_user_id", sa.Uuid(), nullable=False),
        sa.Column("design_id", sa.Uuid(), nullable=False),
        sa.Column("design_version_id", sa.Uuid(), nullable=False),
        sa.Column("render_style", sa.String(length=60), nullable=False),
        sa.Column("view_preset", sa.String(length=40), nullable=False),
        sa.Column("quality", sa.String(length=20), nullable=False),
        sa.Column("output_size", sa.String(length=30), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False),
        sa.Column("prompt_contract_version", sa.String(length=40), nullable=False),
        sa.Column("provider", sa.String(length=40), nullable=False),
        sa.Column("provider_model", sa.String(length=100), nullable=False),
        sa.Column("provider_request_id", sa.String(length=200), nullable=True),
        sa.Column("variation_index", sa.Integer(), nullable=False),
        sa.Column("attempt_count", sa.Integer(), nullable=False),
        sa.Column("max_attempts", sa.Integer(), nullable=False),
        sa.Column("idempotency_key", sa.String(length=64), nullable=False),
        sa.Column("safe_error_code", sa.String(length=80), nullable=True),
        sa.Column("safe_error_message", sa.String(length=500), nullable=True),
        sa.Column("lease_owner", sa.String(length=120), nullable=True),
        sa.Column("lease_expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("next_attempt_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.CheckConstraint("attempt_count >= 0", name="ck_render_jobs_attempt_count"),
        sa.CheckConstraint("max_attempts > 0", name="ck_render_jobs_max_attempts"),
        sa.CheckConstraint("quality IN ('low', 'medium', 'high')", name="ck_render_jobs_quality"),
        sa.CheckConstraint(
            "status IN ('queued', 'running', 'retrying', 'cancel_requested', 'canceled', 'succeeded', 'failed')",
            name="ck_render_jobs_status",
        ),
        sa.CheckConstraint("variation_index > 0", name="ck_render_jobs_variation_index"),
        sa.CheckConstraint(
            "view_preset IN ('front', 'three_quarter', 'side', 'back')",
            name="ck_render_jobs_view_preset",
        ),
        sa.ForeignKeyConstraint(["design_id"], ["designs.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["design_version_id"], ["design_versions.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["owner_user_id"], ["users.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("idempotency_key"),
    )
    op.create_index("ix_render_jobs_design_version", "render_jobs", ["design_version_id", "created_at"])
    op.create_index("ix_render_jobs_owner_created", "render_jobs", ["owner_user_id", "created_at"])

    op.create_table(
        "render_job_inputs",
        sa.Column("render_job_id", sa.Uuid(), nullable=False),
        sa.Column("spec_snapshot", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("locked_fields_snapshot", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("normalized_prompt", sa.Text(), nullable=False),
        sa.Column("input_hash", sa.String(length=64), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["render_job_id"], ["render_jobs.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("render_job_id"),
    )
    op.create_index("ix_render_job_inputs_input_hash", "render_job_inputs", ["input_hash"])

    op.create_table(
        "render_assets",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("render_job_id", sa.Uuid(), nullable=False),
        sa.Column("design_version_id", sa.Uuid(), nullable=False),
        sa.Column("storage_provider", sa.String(length=40), nullable=False),
        sa.Column("object_key", sa.String(length=500), nullable=False),
        sa.Column("content_type", sa.String(length=100), nullable=False),
        sa.Column("byte_size", sa.BigInteger(), nullable=False),
        sa.Column("sha256", sa.String(length=64), nullable=False),
        sa.Column("width", sa.Integer(), nullable=False),
        sa.Column("height", sa.Integer(), nullable=False),
        sa.Column("output_format", sa.String(length=20), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("byte_size > 0", name="ck_render_assets_byte_size"),
        sa.CheckConstraint("width > 0 AND height > 0", name="ck_render_assets_dimensions"),
        sa.ForeignKeyConstraint(["design_version_id"], ["design_versions.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["render_job_id"], ["render_jobs.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("object_key"),
        sa.UniqueConstraint("render_job_id"),
    )
    op.create_index("ix_render_assets_version_created", "render_assets", ["design_version_id", "created_at"])

    op.create_table(
        "outbox_events",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("event_type", sa.String(length=100), nullable=False),
        sa.Column("aggregate_id", sa.Uuid(), nullable=False),
        sa.Column("payload", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("attempt_count", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("delivered_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_outbox_events_pending", "outbox_events", ["delivered_at", "created_at"])


def downgrade() -> None:
    op.drop_index("ix_outbox_events_pending", table_name="outbox_events")
    op.drop_table("outbox_events")
    op.drop_index("ix_render_assets_version_created", table_name="render_assets")
    op.drop_table("render_assets")
    op.drop_index("ix_render_job_inputs_input_hash", table_name="render_job_inputs")
    op.drop_table("render_job_inputs")
    op.drop_index("ix_render_jobs_owner_created", table_name="render_jobs")
    op.drop_index("ix_render_jobs_design_version", table_name="render_jobs")
    op.drop_table("render_jobs")
