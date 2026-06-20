# Environment Strategy

Last updated: 2026-06-19

Status: Sprint 00 foundation document.

## Goals

- Keep secrets out of source control.
- Keep API keys out of the Electron renderer.
- Make local setup repeatable.
- Leave room for cloud deployment later.

## Environment Files

Use `.env.example` as the committed template.

Use `.env` locally for real values.

Rules:

- `.env` must never be committed.
- Real API keys must never appear in docs, frontend code, screenshots, or logs.
- Renderer code must never receive `OPENAI_API_KEY`.

## Planned Variables

### Backend

- `APP_ENV`
- `APP_HOST`
- `APP_PORT`

### Database

- `DATABASE_URL`

### Redis

- `REDIS_URL`

### OpenAI

- `OPENAI_API_KEY`

### Storage

- `STORAGE_PROVIDER`
- `STORAGE_BUCKET`
- `STORAGE_REGION`
- `STORAGE_ACCESS_KEY_ID`
- `STORAGE_SECRET_ACCESS_KEY`

## Secret Ownership

The backend owns:

- OpenAI API key
- Database credentials
- Storage credentials
- Redis credentials

The Electron renderer may receive:

- Non-secret API base URL
- Short-lived session state
- User-facing configuration

The Electron renderer must not receive:

- Long-lived OpenAI API keys
- Database URLs
- Storage secret keys

## Local Development Plan

Initial local development should use:

- Backend at `http://127.0.0.1:8000`
- PostgreSQL local or Docker-managed
- Redis later when background jobs begin
- Local filesystem storage for early exports/renders

## Future Production Plan

Production should use:

- Managed PostgreSQL
- Managed Redis or queue service
- Object storage for generated renders and tech packs
- Backend-issued short-lived AI sessions
- Centralized logging with secret redaction

## Logging Rules

Never log:

- API keys
- Full `.env` contents
- Raw uploaded file paths if sensitive
- Private user measurements unless needed in a secure development trace

AI event logs should prefer:

- Request ID
- Design ID
- Version ID
- Operation names
- Validation result
- Error category

Avoid logging full body measurement profiles unless explicitly needed and protected.
