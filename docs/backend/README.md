# Backend Planning

Last updated: 2026-07-08

Status: Sprint 06 planning artifacts.

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

## Implementation Reminder

When Sprint 06 implementation begins, start with a narrow FastAPI service skeleton and one persistence flow:

- create a design
- save an immutable design version
- fetch a design with its current version

Do not begin with render jobs, exports, or collaboration features.

