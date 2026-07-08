# Project Structure Plan

Last updated: 2026-07-08

Status: Sprint 00 foundation document with Sprint 01 domain implementation update. Most application folders remain planned, but `packages/domain` now exists.

## Goals

- Keep desktop, backend, shared contracts, documentation, and generated artifacts clearly separated.
- Make the structured garment spec easy to share across frontend, backend, tests, and AI validation.
- Keep secrets out of renderer code and source control.

## Planned Top-Level Structure

```text
FashionDesign App/
  AGENTS.md
  README.md
  .env.example
  .gitignore
  ai_fashion_design_app_planning_prompt.md
  ai_fashion_design_app_development_plan.md
  apps/
    desktop/
  services/
    api/
    workers/
  packages/
    domain/
    contracts/
  docs/
    ai/
    api/
    architecture/
    database/
    development/
    product/
    security/
    sprints/
  tests/
    e2e/
    fixtures/
  exports/
  uploads/
  renders/
```

## Directory Responsibilities

### `apps/desktop`

Future Electron + React + TypeScript desktop app.

Responsibilities:

- Designer UI
- Preview/canvas surface
- Microphone controls
- Transcript display
- Version timeline
- Secure IPC usage

Should not contain:

- OpenAI API keys
- Direct database access
- Backend secrets

### `services/api`

Future FastAPI backend.

Responsibilities:

- Auth/session handling
- AI session brokering
- Design/version/model profile APIs
- Database writes
- Render/export job creation
- Validation of AI-proposed operations

### `services/workers`

Future background workers.

Responsibilities:

- AI image render jobs
- PDF/spreadsheet export jobs
- Long-running asynchronous tasks

### `packages/domain`

Implemented shared domain package.

Responsibilities:

- Dress spec types
- Design operation types
- Validation rules
- Versioning logic
- Measurement utilities

Current implementation:

- TypeScript package named `@fashion-design-ai/domain`
- Zod schemas for dress specs, model profiles, design operations, locked fields, design versions, and validation results
- Operation application helpers for set field, add/remove detail, modify measurement, lock/unlock field, create variation, and revert to version
- Vitest unit tests for the first domain contract

### `packages/contracts`

Future shared API and IPC contracts.

Responsibilities:

- API request/response contracts
- Electron IPC channel contracts
- AI operation schemas

### `docs`

Architecture, product, sprint, security, and development documentation.

### `exports`, `uploads`, `renders`

Local development artifact folders. These should not be committed with generated user content.

## Naming Conventions

- Markdown docs: `snake_case.md`
- ADRs: `adr_0001_short_decision_name.md`
- TypeScript files: `kebab-case.ts` for modules, `PascalCase.tsx` for React components when implementation begins
- Python files: `snake_case.py`
- Database tables: `snake_case`
- API routes: plural resource names, such as `/designs`, `/model-profiles`, `/renders`

## Boundary Rule

The renderer is not trusted with secrets or privileged access. The backend owns AI keys and database access. The Electron main process owns native desktop privileges. Shared contracts keep those boundaries explicit.
