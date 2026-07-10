"""Create users, designs, and immutable design versions.

Revision ID: 20260709_0001
Revises:
Create Date: 2026-07-09
"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "20260709_0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=True),
        sa.Column("display_name", sa.String(length=120), nullable=False),
        sa.Column("role", sa.String(length=40), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.CheckConstraint("role IN ('designer', 'admin')", name="ck_users_role"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )

    op.create_table(
        "designs",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("owner_user_id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("garment_category", sa.String(length=40), nullable=False),
        sa.Column("status", sa.String(length=40), nullable=False),
        sa.Column("current_version_id", sa.Uuid(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.CheckConstraint("garment_category = 'dress'", name="ck_designs_dress_only"),
        sa.CheckConstraint("status IN ('draft', 'active', 'archived')", name="ck_designs_status"),
        sa.ForeignKeyConstraint(["owner_user_id"], ["users.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_designs_owner_updated", "designs", ["owner_user_id", "updated_at"], unique=False)

    op.create_table(
        "design_versions",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("design_id", sa.Uuid(), nullable=False),
        sa.Column("version_number", sa.Integer(), nullable=False),
        sa.Column("parent_version_id", sa.Uuid(), nullable=True),
        sa.Column("branch_id", sa.Uuid(), nullable=True),
        sa.Column("variation_label", sa.String(length=120), nullable=True),
        sa.Column("source", sa.String(length=40), nullable=False),
        sa.Column("created_by_actor", sa.String(length=80), nullable=False),
        sa.Column("raw_input_ref", sa.String(length=200), nullable=True),
        sa.Column("change_summary", sa.String(length=500), nullable=False),
        sa.Column("spec_snapshot", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("locked_fields_snapshot", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("operation_ids", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.CheckConstraint("version_number > 0", name="ck_design_versions_positive_number"),
        sa.ForeignKeyConstraint(["design_id"], ["designs.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["parent_version_id"], ["design_versions.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("design_id", "version_number", name="uq_design_versions_number"),
    )
    op.create_index("ix_design_versions_design_created", "design_versions", ["design_id", "created_at"], unique=False)

    op.create_foreign_key(
        "fk_designs_current_version",
        "designs",
        "design_versions",
        ["current_version_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_index("ix_designs_current_version_id", "designs", ["current_version_id"], unique=False)

    op.execute(
        """
        CREATE FUNCTION prevent_immutable_design_version_update()
        RETURNS trigger AS $$
        BEGIN
          IF NEW.design_id IS DISTINCT FROM OLD.design_id
             OR NEW.version_number IS DISTINCT FROM OLD.version_number
             OR NEW.parent_version_id IS DISTINCT FROM OLD.parent_version_id
             OR NEW.branch_id IS DISTINCT FROM OLD.branch_id
             OR NEW.variation_label IS DISTINCT FROM OLD.variation_label
             OR NEW.source IS DISTINCT FROM OLD.source
             OR NEW.created_by_actor IS DISTINCT FROM OLD.created_by_actor
             OR NEW.raw_input_ref IS DISTINCT FROM OLD.raw_input_ref
             OR NEW.change_summary IS DISTINCT FROM OLD.change_summary
             OR NEW.spec_snapshot IS DISTINCT FROM OLD.spec_snapshot
             OR NEW.locked_fields_snapshot IS DISTINCT FROM OLD.locked_fields_snapshot
             OR NEW.operation_ids IS DISTINCT FROM OLD.operation_ids
             OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
            RAISE EXCEPTION 'design_versions are immutable';
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER trg_design_versions_immutable
        BEFORE UPDATE ON design_versions
        FOR EACH ROW EXECUTE FUNCTION prevent_immutable_design_version_update();
        """
    )


def downgrade() -> None:
    op.execute("DROP TRIGGER IF EXISTS trg_design_versions_immutable ON design_versions")
    op.execute("DROP FUNCTION IF EXISTS prevent_immutable_design_version_update")
    op.drop_index("ix_designs_current_version_id", table_name="designs")
    op.drop_constraint("fk_designs_current_version", "designs", type_="foreignkey")
    op.drop_index("ix_design_versions_design_created", table_name="design_versions")
    op.drop_table("design_versions")
    op.drop_index("ix_designs_owner_updated", table_name="designs")
    op.drop_table("designs")
    op.drop_table("users")
