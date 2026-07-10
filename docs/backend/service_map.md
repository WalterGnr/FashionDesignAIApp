# Backend Service Map

Last updated: 2026-07-08

Status: Sprint 06 planning artifact.

## Goal

Define the backend service responsibilities before implementation.

## Recommended Backend Shape

Initial service:

- `services/api`: FastAPI application

Future service:

- `services/workers`: background jobs for renders, image generation, and exports

## Backend Responsibilities

### API Layer

Responsibilities:

- expose typed HTTP resources
- validate requests with Pydantic schemas
- return stable API errors
- keep route handlers thin

### Domain/Application Service Layer

Responsibilities:

- create designs
- create immutable versions
- move current version pointers
- enforce ownership checks
- prepare records for render/export jobs later

### Persistence Layer

Responsibilities:

- SQLAlchemy models
- repository-style database operations
- PostgreSQL transactions
- Alembic migrations

### AI Session Broker

Responsibilities:

- hold standard AI API keys
- mint realtime sessions or ephemeral credentials later
- enforce session duration and rate limits
- keep AI secrets out of the Electron renderer

### Worker Layer Later

Responsibilities:

- async concept renders
- tech pack exports
- retryable long-running jobs
- status updates persisted to PostgreSQL

## Non-Goals For First Backend Slice

- no full auth provider integration
- no render workers
- no export generation
- no live OpenAI integration in initial persistence slice
- no multi-user collaboration

