"""Create durable tech-pack jobs, immutable snapshots, and export assets.

Revision ID: 20260710_0004
Revises: 20260709_0003
Create Date: 2026-07-10
"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "20260710_0004"
down_revision: str | None = "20260709_0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "tech_pack_jobs",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("owner_user_id", sa.Uuid(), nullable=False),
        sa.Column("design_id", sa.Uuid(), nullable=False),
        sa.Column("design_version_id", sa.Uuid(), nullable=False),
        sa.Column("status", sa.String(length=40), nullable=False),
        sa.Column("readiness_status", sa.String(length=40), nullable=False),
        sa.Column("requested_formats", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("format_statuses", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("page_size", sa.String(length=20), nullable=False),
        sa.Column("locale", sa.String(length=20), nullable=False),
        sa.Column("unit_preference", sa.String(length=20), nullable=False),
        sa.Column("draft_acknowledged", sa.Boolean(), nullable=False),
        sa.Column("snapshot_hash", sa.String(length=64), nullable=False),
        sa.Column("snapshot_contract_version", sa.String(length=40), nullable=False),
        sa.Column("template_version", sa.String(length=40), nullable=False),
        sa.Column("idempotency_key", sa.String(length=64), nullable=False),
        sa.Column("selected_render_asset_id", sa.Uuid(), nullable=True),
        sa.Column("attempt_count", sa.Integer(), nullable=False),
        sa.Column("max_attempts", sa.Integer(), nullable=False),
        sa.Column("safe_error_code", sa.String(length=80), nullable=True),
        sa.Column("safe_error_message", sa.String(length=500), nullable=True),
        sa.Column("lease_owner", sa.String(length=120), nullable=True),
        sa.Column("lease_expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.CheckConstraint("attempt_count >= 0", name="ck_tech_pack_jobs_attempt_count"),
        sa.CheckConstraint("max_attempts > 0", name="ck_tech_pack_jobs_max_attempts"),
        sa.CheckConstraint("page_size IN ('letter', 'a4')", name="ck_tech_pack_jobs_page_size"),
        sa.CheckConstraint(
            "readiness_status IN ('ready', 'ready_with_warnings', 'blocked')",
            name="ck_tech_pack_jobs_readiness",
        ),
        sa.CheckConstraint(
            "status IN ('blocked', 'queued', 'running', 'cancel_requested', 'canceled', "
            "'succeeded', 'succeeded_with_partial_formats', 'failed')",
            name="ck_tech_pack_jobs_status",
        ),
        sa.ForeignKeyConstraint(["design_id"], ["designs.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["design_version_id"], ["design_versions.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["owner_user_id"], ["users.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["selected_render_asset_id"], ["render_assets.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("idempotency_key"),
    )
    op.create_index("ix_tech_pack_jobs_design_version", "tech_pack_jobs", ["design_version_id", "created_at"])
    op.create_index("ix_tech_pack_jobs_owner_created", "tech_pack_jobs", ["owner_user_id", "created_at"])
    op.create_index("ix_tech_pack_jobs_snapshot_hash", "tech_pack_jobs", ["snapshot_hash"])

    op.create_table(
        "tech_pack_inputs",
        sa.Column("tech_pack_job_id", sa.Uuid(), nullable=False),
        sa.Column("snapshot", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("readiness_issues", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["tech_pack_job_id"], ["tech_pack_jobs.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("tech_pack_job_id"),
    )

    op.create_table(
        "tech_pack_assets",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("tech_pack_job_id", sa.Uuid(), nullable=False),
        sa.Column("format", sa.String(length=20), nullable=False),
        sa.Column("storage_provider", sa.String(length=40), nullable=False),
        sa.Column("object_key", sa.String(length=500), nullable=False),
        sa.Column("content_type", sa.String(length=120), nullable=False),
        sa.Column("byte_size", sa.BigInteger(), nullable=False),
        sa.Column("sha256", sa.String(length=64), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.CheckConstraint("byte_size > 0", name="ck_tech_pack_assets_byte_size"),
        sa.CheckConstraint("format IN ('pdf', 'xlsx')", name="ck_tech_pack_assets_format"),
        sa.ForeignKeyConstraint(["tech_pack_job_id"], ["tech_pack_jobs.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("object_key"),
        sa.UniqueConstraint("tech_pack_job_id", "format", name="uq_tech_pack_assets_job_format"),
    )

    op.execute(
        """
        CREATE FUNCTION prevent_tech_pack_input_update()
        RETURNS trigger AS $$
        BEGIN
          RAISE EXCEPTION 'tech_pack_inputs are immutable';
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER trg_tech_pack_inputs_immutable
        BEFORE UPDATE ON tech_pack_inputs
        FOR EACH ROW EXECUTE FUNCTION prevent_tech_pack_input_update();
        """
    )


def downgrade() -> None:
    op.execute("DROP TRIGGER IF EXISTS trg_tech_pack_inputs_immutable ON tech_pack_inputs")
    op.execute("DROP FUNCTION IF EXISTS prevent_tech_pack_input_update")
    op.drop_table("tech_pack_assets")
    op.drop_table("tech_pack_inputs")
    op.drop_index("ix_tech_pack_jobs_snapshot_hash", table_name="tech_pack_jobs")
    op.drop_index("ix_tech_pack_jobs_owner_created", table_name="tech_pack_jobs")
    op.drop_index("ix_tech_pack_jobs_design_version", table_name="tech_pack_jobs")
    op.drop_table("tech_pack_jobs")
