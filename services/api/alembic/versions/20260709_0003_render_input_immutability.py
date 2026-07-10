"""Enforce immutable render inputs in PostgreSQL.

Revision ID: 20260709_0003
Revises: 20260709_0002
Create Date: 2026-07-09
"""

from collections.abc import Sequence

from alembic import op

revision: str = "20260709_0003"
down_revision: str | None = "20260709_0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute(
        """
        CREATE FUNCTION prevent_render_job_input_update()
        RETURNS trigger AS $$
        BEGIN
          RAISE EXCEPTION 'render_job_inputs are immutable';
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER trg_render_job_inputs_immutable
        BEFORE UPDATE ON render_job_inputs
        FOR EACH ROW EXECUTE FUNCTION prevent_render_job_input_update();
        """
    )


def downgrade() -> None:
    op.execute("DROP TRIGGER IF EXISTS trg_render_job_inputs_immutable ON render_job_inputs")
    op.execute("DROP FUNCTION IF EXISTS prevent_render_job_input_update")
