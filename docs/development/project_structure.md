# Project Structure Plan

Last updated: 2026-07-09

Status: Foundation plus Sprint 01 through Sprint 07 implementation and Sprint 08 planning. The Electron app now includes the first Three.js dress preview.

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
    ai/
    contracts/
  docs/
    ai/
    api/
    architecture/
    backend/
    database/
    development/
    product/
    preview/
    security/
    sprints/
    ui/
    voice/
  tests/
    e2e/
    fixtures/
  exports/
  uploads/
  renders/
```

## Directory Responsibilities

### `apps/desktop`

Implemented Electron + React + TypeScript desktop shell and first designer workflow UI.

Responsibilities:

- Electron main process
- Secure BrowserWindow setup
- Preload bridge
- Typed IPC contracts
- Designer workflow React renderer
- Typed command bar
- Structured preview surface
- React Three Fiber canvas
- procedural mannequin and modular dress geometry
- pure spec-to-preview mapping
- camera presets and 2D WebGL fallback
- AI change review
- Spec inspector
- Version timeline
- Locked fields panel
- Microphone controls
- Transcript display
- Local voice session state
- Secure IPC usage

Should not contain:

- OpenAI API keys
- Direct database access
- Backend secrets

Planning docs:

- `docs/desktop/README.md`
- `docs/desktop/electron_process_model.md`
- `docs/desktop/preload_ipc_contract_plan.md`
- `docs/desktop/electron_security_checklist.md`
- `docs/desktop/desktop_development_and_packaging.md`
- `docs/ui/README.md`

Current implementation:

- TypeScript package named `@fashion-design-ai/desktop`
- Electron main process in `apps/desktop/src/main`
- preload bridge in `apps/desktop/src/preload`
- IPC contracts in `apps/desktop/src/shared`
- React renderer in `apps/desktop/src/renderer`
- Designer session service in `apps/desktop/src/renderer/src/designer-session.ts`
- Voice session service in `apps/desktop/src/renderer/src/voice-session.ts`
- Preview modules in `apps/desktop/src/renderer/src/preview`
- Vitest IPC contract, designer session, voice session, and preview mapper tests

### `services/api`

Implemented initial FastAPI and PostgreSQL persistence service.

Responsibilities:

- Auth/session handling
- AI session brokering
- Design/version/model profile APIs
- Database writes
- Render/export job creation
- Validation of AI-proposed operations

Current implementation:

- FastAPI application package named `fashion_api`
- Pydantic request and response contracts
- SQLAlchemy models for users, designs, and immutable design versions
- Alembic migration configuration and initial revision
- PostgreSQL JSONB spec snapshots
- transaction-safe version creation and current-version pointer updates
- ownership-scoped reads and writes using a development user context
- unit/API tests plus an opt-in PostgreSQL integration test

Local infrastructure:

- PostgreSQL 17 in `compose.yaml`
- local Python dependencies in ignored `.venv`

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

### `packages/ai`

Implemented shared AI command interpretation package.

Responsibilities:

- AI command interpretation result schemas
- command normalization and context assembly helpers
- provider-free MVP command interpreter
- execution boundary that validates/applies AI-proposed operations through `@fashion-design-ai/domain`
- evaluation-style tests for Sprint 02 examples

Current implementation:

- TypeScript package named `@fashion-design-ai/ai`
- Zod schemas for operation batch, clarification, rejection, and no-op AI result shapes
- deterministic interpreter for the first Sprint 02 command examples
- command execution helper that rejects malformed AI output before domain mutation
- no live OpenAI calls

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
