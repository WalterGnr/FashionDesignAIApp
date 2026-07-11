"""Add retrying state to tech-pack jobs.

Revision ID: 20260711_0005
Revises: 20260710_0004
Create Date: 2026-07-11
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "20260711_0005"
down_revision: str | None = "20260710_0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.drop_constraint("ck_tech_pack_jobs_status", "tech_pack_jobs", type_="check")
    op.create_check_constraint(
        "ck_tech_pack_jobs_status",
        "tech_pack_jobs",
        sa.text(
            "status IN ('blocked', 'queued', 'running', 'retrying', 'cancel_requested', "
            "'canceled', 'succeeded', 'succeeded_with_partial_formats', 'failed')"
        ),
    )


def downgrade() -> None:
    op.drop_constraint("ck_tech_pack_jobs_status", "tech_pack_jobs", type_="check")
    op.create_check_constraint(
        "ck_tech_pack_jobs_status",
        "tech_pack_jobs",
        sa.text(
            "status IN ('blocked', 'queued', 'running', 'cancel_requested', 'canceled', "
            "'succeeded', 'succeeded_with_partial_formats', 'failed')"
        ),
    )
