# API Documentation

Last updated: 2026-07-09

Status: Sprint 06 initial API implementation completed.

The FastAPI service lives in `services/api`. Its generated OpenAPI interface is available at `/docs` while the service is running.

Implemented resources:

- health and database reachability
- create and list dress designs
- fetch a dress design with its current version
- create immutable design versions
- list and fetch version history

Current development identity uses a fixed local designer ID. Production authentication, model profiles, renders, voice session brokering, and tech packs remain future work.

See:

- `docs/backend/api_resource_plan.md`
- `services/api/README.md`
- `docs/sprints/06_sprint_development_completion_record.md`
