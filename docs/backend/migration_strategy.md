# Migration Strategy

Last updated: 2026-07-08

Status: Sprint 06 planning artifact.

## Goal

Define how database changes should be managed once backend implementation begins.

## Tooling Direction

Use Alembic with SQLAlchemy metadata.

Reason:

- Alembic is the migration tool built for SQLAlchemy.
- It supports explicit schema revisions.
- It can autogenerate candidate migrations from metadata, but generated scripts still need review.

## Rules

- every schema change gets a migration
- migrations are reviewed before commit
- never rely on automatic table creation in production
- test upgrades on a local database
- prefer additive migrations early
- avoid destructive migrations until backups/export paths exist

## Initial Migration Sequence

1. create users
2. create designs without current version FK
3. create design_versions
4. add designs.current_version_id FK
5. create design_operations
6. create command_events
7. create model_profiles
8. create renders
9. create materials
10. create tech_packs
11. add indexes and constraints

## Local Development Database

Use PostgreSQL locally for persistence work, not SQLite, once JSONB and constraints matter.

SQLite may be useful for lightweight tests, but it cannot fully represent PostgreSQL JSONB/index behavior.

