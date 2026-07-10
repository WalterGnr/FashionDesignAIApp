# Sprint 06: Backend, Database, and Versioning Planning

Status: Planning completed on 2026-07-08; initial implementation completed on 2026-07-09.

Suggested duration: 1 to 2 weeks.

## Goal

Plan the backend API, database schema, and immutable versioning model.

## Why This Sprint Matters

The app must preserve design traceability. Designers need to return to earlier versions, manufacturers need exact specs, and renders/exports must point to the version they came from.

## Primary Deliverables

- Backend service map
- API resource plan
- Database schema plan
- Migration strategy
- Versioning rules
- Model profile relationship plan
- Auth and user ownership plan
- Sprint 06 progress tracker
- Sprint 06 completion record
- FastAPI service skeleton and health endpoint
- PostgreSQL Docker Compose service
- SQLAlchemy design/version models
- Alembic initial migration
- design and immutable version endpoints
- backend and PostgreSQL integration tests
- Sprint 06 development completion record

## Planning Artifacts

- `docs/backend/README.md`
- `docs/backend/service_map.md`
- `docs/backend/api_resource_plan.md`
- `docs/backend/database_schema_plan.md`
- `docs/backend/versioning_persistence_rules.md`
- `docs/backend/model_profile_relationship_plan.md`
- `docs/backend/migration_strategy.md`
- `docs/backend/auth_ownership_and_security.md`
- `docs/sprints/06_sprint_progress_tracker.md`
- `docs/sprints/06_sprint_completion_record.md`
- `docs/sprints/06_sprint_development_completion_record.md`
- `services/api`
- `compose.yaml`

## Key Planning Tasks

- Define backend resources:
  - Users
  - Designs
  - Design versions
  - Dress specs
  - Model profiles
  - Renders
  - Materials
  - Tech packs
- Define API endpoints at a high level.
- Define immutable version behavior.
- Define current version behavior.
- Define how designs render on different model profiles.
- Define JSONB usage.
- Define indexes likely needed later.
- Define migration strategy.

## Implementation Scope Preserved

- No authentication implementation.
- No model profile endpoint yet.
- No command event or operation persistence yet.
- No render/export workers.
- No live AI session broker.

## Current Architecture Direction

Use:

- FastAPI for the API service
- PostgreSQL as the primary database
- SQLAlchemy for ORM/persistence modeling
- Alembic for migrations
- JSONB for immutable spec snapshots and flexible metadata

Keep stable query fields as relational columns and keep the full dress spec snapshot as JSONB on immutable design versions.

## Acceptance Criteria

- Data entities and relationships are clear.
- The schema supports version history.
- Renders and exports are traceable to design versions.
- Model profiles are reusable across designs.
- Migration and ownership strategy are documented.

## Risks

- Bad schema decisions can make later production features difficult.
- Too much JSONB can weaken queryability.
- Mutable version records can destroy traceability.

## Senior Developer Notes

Versioning is not optional. It is core to designer trust and manufacturer accountability.

## Implementation Result

The first vertical slice now creates a dress and its initial version in one transaction, creates subsequent versions while locking the design row, advances the current-version pointer, and reads immutable history. PostgreSQL independently rejects updates to version snapshots through a database trigger.
