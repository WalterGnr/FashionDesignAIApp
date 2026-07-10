# Database Documentation

Last updated: 2026-07-09

Status: Sprint 06 initial PostgreSQL schema and migration implemented.

Implemented tables:

- `users`
- `designs`
- `design_versions`

The initial Alembic revision is `20260709_0001`. It stores full spec snapshots as PostgreSQL JSONB, enforces one version number per design, and installs a trigger that prevents saved version history from being rewritten.

Local PostgreSQL runs through `compose.yaml`. The first migration has been applied and verified against PostgreSQL 17 in Docker.

See:

- `docs/backend/database_schema_plan.md`
- `docs/backend/versioning_persistence_rules.md`
- `services/api/alembic/versions/20260709_0001_design_versioning.py`
