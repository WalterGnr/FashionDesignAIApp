# Backend Planning

Last updated: 2026-07-09

Status: Sprint 06 planning and initial implementation completed.

## Purpose

This folder defines the first backend and persistence plan for the AI fashion design app.

The backend owns durable design records, version traceability, model profiles, render/export records, user ownership, and AI session brokering. The desktop renderer should never store backend secrets or write directly to PostgreSQL.

## Core Principle

```text
The desktop app creates and reviews design intent.
The backend persists validated design truth.
PostgreSQL stores traceable versions.
The current version pointer can move, but version records do not mutate.
```

## Sprint 06 Documents

- `service_map.md`
- `api_resource_plan.md`
- `database_schema_plan.md`
- `versioning_persistence_rules.md`
- `model_profile_relationship_plan.md`
- `migration_strategy.md`
- `auth_ownership_and_security.md`

## Implemented Slice

The first backend slice is implemented in `services/api`:

- FastAPI health and OpenAPI interface
- create a design
- save an immutable design version
- fetch a design with its current version
- list designs and version history
- PostgreSQL 17 local service through Docker Compose
- SQLAlchemy models and Alembic revision `20260709_0001`
- ownership-scoped queries using a development user context
- PostgreSQL trigger enforcement for immutable versions
- SQLite-fast tests and opt-in real PostgreSQL integration coverage

Render jobs, exports, collaboration, production authentication, and live AI session brokering remain future work.
