# Tooling Knowledge Base

Last updated: 2026-07-09

Purpose: keep a durable memory of the tools, frameworks, and engineering decisions needed to build the AI fashion design desktop software.

## Product Context

The app is a desktop fashion design tool where designers use fast voice interaction with AI to create and revise dresses. The software must preserve designer control while helping companies move faster from idea to production-ready technical specification.

The most important technical principle is that the structured garment spec is the source of truth. Image generation and 3D previews are visual outputs from that source of truth, not the primary data model.

## Implemented Preview Tooling

Sprint 07 added:

- Three.js 0.185.1
- React Three Fiber 9.6.1
- React Three Drei 10.7.7
- procedural `LatheGeometry` dress profiles
- on-demand rendering with constrained orbit controls
- explicit Three.js geometry disposal
- browser screenshot, interaction, constrained-viewport, and canvas pixel-variance checks

Current rule:

- keep Three.js dependencies inside the Electron renderer
- keep the domain and AI packages renderer-independent
- map the complete selected `DressSpec` through a pure function before rendering
- preserve a deterministic 2D fallback when WebGL is unavailable

## Implemented Async Render Tooling

Sprint 08 added:

- Redis 8 with append-only persistence and `noeviction`
- Celery 5.6 with late acknowledgements, solo-pool Windows worker, and separate Beat scheduler
- OpenAI Python SDK 2.45 with a backend-only GPT Image 2 provider adapter
- Pillow 12.3 for bounded PNG generation and verification
- PostgreSQL render jobs, immutable input snapshots, asset metadata, and transactional outbox
- private local development storage with atomic publication and SHA-256 checksums
- typed Electron IPC for version synchronization and render operations

Current rules:

- PostgreSQL owns durable job state; Redis is transport, not truth
- the API commits the job and outbox event before queue publication
- workers consume exact immutable version/input snapshots
- provider bytes never enter PostgreSQL or general logs
- live provider credentials stay in backend settings as secret values
- Windows runs Celery worker and Beat as separate processes
- sandboxed Electron preload bundles must be CommonJS; sandboxed ESM preloads are unsupported
- local mock images are visibly labeled development output and never represented as AI output

## Recommended Starting Stack

### Desktop Shell

Recommended starting choice: Electron.

Why:

- Fastest path to a real desktop application using web technologies.
- Strong ecosystem for Windows desktop packaging.
- Easier early integration with React, Vite, local files, microphone permissions, and native OS affordances.

Risks:

- Security must be handled carefully.
- Node integration should not be exposed directly to renderer code.
- IPC contracts between main and renderer processes must be explicit and typed.

Senior rule:

- Treat Electron as a privileged native wrapper, not as a normal browser.
- Keep `contextIsolation` enabled.
- Avoid direct Node access in the renderer.
- Use a small preload API with typed IPC channels.
- Load trusted local app content only.

Official docs:

- Electron security: https://electronjs.org/docs/latest/tutorial/security

Alternative: Tauri.

Why consider later:

- Smaller app binaries.
- Rust-backed native layer.
- Strong security posture and permission model.

Why not first:

- More initial complexity if the project team is not already comfortable with Rust and Tauri's command model.

Official docs:

- Tauri security: https://v2.tauri.app/security/
- Tauri architecture: https://v2.tauri.app/concept/architecture/

## Frontend App

### React

Role:

- Main UI framework for the desktop app.
- Good fit for a design surface with panels, preview components, transcript state, version history, and tool controls.

Senior rule:

- Model UI as predictable components.
- Keep business logic out of visual components.
- Prefer controlled state and typed domain objects over loose prompt strings.

Official docs:

- React docs: https://react.dev/

### TypeScript

Role:

- Type safety across garment specs, design operations, API contracts, and renderer/main process messaging.

Senior rule:

- Use strict TypeScript from the start.
- Define shared types for dress specs, model profiles, design versions, render jobs, and AI operations.
- Avoid `any` except at validated external boundaries.

Official docs:

- TypeScript docs: https://www.typescriptlang.org/docs/
- TypeScript handbook: https://www.typescriptlang.org/docs/handbook/intro.html
- React with TypeScript: https://www.typescriptlang.org/docs/handbook/react.html

### Vite

Role:

- Frontend build tool and development server.
- Good fit for React + TypeScript and Electron renderer development.

Senior rule:

- Keep environment variables explicit.
- Separate frontend-only config from backend secrets.
- Never ship API keys in the renderer bundle.

Official docs:

- Vite guide: https://vite.dev/guide/

### Tailwind CSS

Role:

- Fast styling for early product UI.
- Useful if kept restrained and paired with design tokens.

Senior rule:

- Use Tailwind for layout, spacing, and utility styling.
- Avoid creating a generic dashboard look.
- Define domain-specific visual hierarchy: canvas first, controls second.
- Build reusable components for controls, panels, menus, and inspectors.

Official docs:

- Tailwind docs: https://tailwindcss.com/docs

## State Management

### Zustand

Recommended starting choice for local UI/design state.

Role:

- Manage current design session state, selected version, transcript state, UI panel state, preview options, and local command queue.

Why:

- Lightweight.
- Works well with React.
- Less ceremony than Redux for early prototypes.

Senior rule:

- Keep stores small and domain-oriented.
- Do not make one giant global store.
- Separate persistent server state from local UI state.

Official docs:

- Zustand TypeScript guide: https://zustand.docs.pmnd.rs/learn/guides/beginner-typescript

### Redux Toolkit

Alternative if client-side state becomes highly complex.

Role:

- Useful later if the app needs strict event history, complex collaboration state, offline sync, or time-travel debugging.

Senior rule:

- Do not add Redux just because the app is important.
- Add it only if state transitions become hard to reason about without it.

Official docs:

- Redux Toolkit docs: https://redux-toolkit.js.org/
- Redux Toolkit TypeScript: https://redux-toolkit.js.org/usage/usage-with-typescript

## 3D and Visual Preview

### Three.js

Role:

- Render a simple mannequin and garment preview.
- Show silhouette, color, length, neckline, sleeves, and approximate fit.

Senior rule:

- Use 3D preview for quick feedback, not manufacturing-perfect garment simulation in the MVP.
- Keep garment geometry modular.
- Do not let the 3D system become the source of truth. It reads from the structured dress spec.

Official docs:

- Three.js docs: https://threejs.org/docs/
- Three.js manual: https://threejs.org/manual/

### React Three Fiber

Recommended if using React heavily.

Role:

- Declarative Three.js inside React.
- Useful for building preview components that respond to app state.

Senior rule:

- Use React Three Fiber for app-integrated scenes.
- Keep performance-sensitive animation and geometry logic carefully isolated.
- Test canvas rendering visually, not only with unit tests.

Official docs:

- React Three Fiber introduction: https://r3f.docs.pmnd.rs/getting-started/introduction

## Backend

### FastAPI

Recommended starting choice.

Role:

- API server for users, designs, versions, model profiles, render jobs, tech packs, and AI orchestration.

Why:

- Strong Python ecosystem for AI workflows, image processing, PDF/spreadsheet export, and background workers.
- Type hints and Pydantic validation are useful for structured garment specs.

Senior rule:

- Keep API boundaries typed.
- Validate all AI outputs before writing to the database.
- Separate route handlers from service/domain logic.
- Design idempotent job endpoints where possible.

Official docs:

- FastAPI docs: https://fastapi.tiangolo.com/
- FastAPI SQL databases: https://fastapi.tiangolo.com/tutorial/sql-databases/
- FastAPI async/concurrency: https://fastapi.tiangolo.com/async/

### SQLAlchemy / SQLModel

Role:

- ORM/database mapping layer.

Senior rule:

- Use migrations from day one.
- Keep domain models and API schemas distinct when the app grows.
- Be careful with JSON fields: flexible data is useful, but important query fields should be first-class columns.

Official docs:

- SQLAlchemy docs: https://docs.sqlalchemy.org/
- SQLAlchemy ORM quick start: https://docs.sqlalchemy.org/orm/quickstart.html

## Database and Jobs

### PostgreSQL

Recommended primary database.

Role:

- Store users, designs, versions, dress specs, model profiles, render jobs, materials, and tech packs.

Why:

- Strong relational integrity.
- Good indexing.
- JSONB support for flexible garment spec substructures.

Senior rule:

- Use relational columns for stable searchable fields.
- Use JSONB for flexible structured spec sections.
- Add GIN indexes only when query patterns justify them.
- Track design versions immutably.

Official docs:

- PostgreSQL JSON types: https://www.postgresql.org/docs/current/datatype-json.html
- PostgreSQL JSON functions/operators: https://www.postgresql.org/docs/current/functions-json.html
- PostgreSQL GIN indexes: https://www.postgresql.org/docs/current/gin.html

### Redis

Role:

- Background job coordination, render queues, export queues, temporary session state, and real-time event buffering.

Senior rule:

- Use Redis for ephemeral or queue-like data, not as the permanent source of truth.
- Persist important job records in PostgreSQL.
- Make workers retryable and observable.

Official docs:

- Redis docs: https://redis.io/docs/latest/
- Redis Streams: https://redis.io/docs/latest/develop/data-types/streams/

## AI and Voice

### OpenAI Realtime API

Role:

- Low-latency voice interaction and live transcription.
- Good fit for the designer speaking changes while the app updates.

Senior rule:

- Do not send API keys from the desktop renderer.
- Use the backend to issue ephemeral access or proxy secure sessions.
- Separate raw transcript from interpreted design operations.
- Capture enough event logs to debug misunderstood commands.

Official docs:

- Realtime docs: https://developers.openai.com/api/docs/guides/realtime
- Realtime with WebRTC: https://developers.openai.com/api/docs/guides/realtime-webrtc
- Speech-to-text docs: https://developers.openai.com/api/docs/guides/speech-to-text

### OpenAI Function Calling / Structured Outputs

Role:

- Convert natural language into safe structured operations like:
  - `set_fabric`
  - `change_length`
  - `add_embellishment`
  - `lock_field`
  - `create_variation`

Senior rule:

- The model should propose structured operations, not directly mutate database records.
- Validate operations with JSON schema and domain rules.
- Reject or clarify impossible instructions.

Official docs:

- Function calling: https://developers.openai.com/api/docs/guides/function-calling
- Tools guide: https://developers.openai.com/api/docs/guides/tools

### OpenAI Image Generation

Role:

- Generate concept renders, reference visuals, or edited previews.

Senior rule:

- Treat generated images as visual communication, not production truth.
- Avoid full image regeneration for every voice phrase.
- Use staged rendering: structured spec update first, fast preview second, high-quality render third.

Official docs:

- Image generation: https://developers.openai.com/api/docs/guides/image-generation
- Images and vision: https://developers.openai.com/api/docs/guides/images-vision

## Testing

### Vitest

Role:

- Unit tests for TypeScript utilities, design-state reducer logic, validators, and UI component behavior.

Senior rule:

- Test the garment spec update engine heavily.
- Test AI output validators with malformed and ambiguous examples.

Official docs:

- Vitest guide: https://vitest.dev/guide/

### Playwright

Role:

- End-to-end tests for the desktop renderer UI and web-based app flows.
- Visual verification of canvas/preview behavior where possible.

Senior rule:

- Use E2E tests for critical designer workflows.
- Verify that preview renders are not blank.
- Test command flows like "make sleeves shorter" and "undo to version 2".

Official docs:

- Playwright docs: https://playwright.dev/docs/intro

## Export and Production Documents

### PDF Tech Packs

Role:

- Export manufacturer-readable tech packs with measurements, materials, construction notes, render images, and version IDs.

Senior rule:

- Tech packs must be deterministic, versioned, and traceable.
- Never export from unsaved transient design state without recording the design version.

Possible tools:

- Python ReportLab
- WeasyPrint
- Playwright PDF export from HTML templates

### Spreadsheets

Role:

- Export BOM, material costs, measurement tables, grading tables, and vendor-facing production data.

Possible tools:

- Python openpyxl
- xlsxwriter

## Senior Development Priorities

1. Define the garment spec schema before building pretty rendering.
2. Build a reliable voice-to-structured-operation loop.
3. Keep AI outputs validated and reversible.
4. Save immutable design versions.
5. Make high-quality rendering asynchronous.
6. Build exportable technical documentation early.
7. Keep security tight because this is a desktop app with microphone, files, and AI credentials.

## Current Recommendation

For the first real build, start with:

- Electron
- React
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- React Three Fiber / Three.js
- FastAPI
- PostgreSQL
- Redis
- OpenAI Realtime API
- OpenAI function calling/structured operations
- OpenAI image generation for concept renders
- Vitest
- Playwright

This combination gives the fastest path to a working desktop product while keeping the architecture serious enough to become production software.
