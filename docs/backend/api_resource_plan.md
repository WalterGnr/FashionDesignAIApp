# API Resource Plan

Last updated: 2026-07-08

Status: Sprint 06 planning artifact.

## Goal

Define the first backend resources and endpoint direction.

## Resource Groups

### Health

- `GET /health`

Purpose:

- confirm API is reachable
- expose safe version/environment metadata

### Designs

- `POST /designs`
- `GET /designs`
- `GET /designs/{design_id}`
- `PATCH /designs/{design_id}`

Purpose:

- create and fetch dress design containers
- store high-level design metadata
- expose current version pointer

### Design Versions

- `POST /designs/{design_id}/versions`
- `GET /designs/{design_id}/versions`
- `GET /designs/{design_id}/versions/{version_id}`
- `POST /designs/{design_id}/current-version`

Purpose:

- create immutable design versions
- list version history
- select or revert current version pointer

Rule:

- never update a design version's spec snapshot after creation

### Model Profiles

- `POST /model-profiles`
- `GET /model-profiles`
- `GET /model-profiles/{model_profile_id}`
- `PATCH /model-profiles/{model_profile_id}`

Purpose:

- store reusable body measurement profiles
- support rendering the same design on different model bodies later

### Renders Later

- `POST /renders`
- `GET /renders/{render_id}`
- `GET /designs/{design_id}/renders`

Purpose:

- trace concept images or previews to design versions and model profiles

### Tech Packs Later

- `POST /tech-packs`
- `GET /tech-packs/{tech_pack_id}`
- `GET /designs/{design_id}/tech-packs`

Purpose:

- trace exports to exact design versions

### Voice Sessions Later

- `POST /voice-sessions`
- `POST /voice-sessions/{session_id}/events`
- `POST /voice-sessions/{session_id}/close`

Purpose:

- broker secure realtime sessions
- track transcript/command metadata without storing raw audio by default

## API Response Rules

Responses should include:

- stable IDs
- timestamps
- version IDs where relevant
- safe error messages

Errors should avoid:

- stack traces
- SQL details
- AI provider secrets
- raw sensitive transcript content

