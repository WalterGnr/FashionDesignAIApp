# AI Fashion Design App

Status: Sprint 01 through Sprint 08 implementation completed; Sprint 09 planning completed.

## Product Goal

Build a desktop fashion design application where designers can use fast AI interaction, primarily through voice, to create and revise dress designs while preserving creative control, structured technical accuracy, version traceability, and production readiness.

MVP scope: dresses only.

## Core Principle

The structured garment spec is the source of truth.

Voice commands, AI interpretation, visual previews, image renders, and tech pack exports should all read from or update structured design data. Generated images are useful communication artifacts, but they are not the technical truth of the design.

## Approved Initial Stack

- Desktop: Electron
- Frontend: React, TypeScript, Vite
- Backend: FastAPI
- Database: PostgreSQL
- Future job queue/cache: Redis
- AI: OpenAI Realtime, structured tool/function calling, image generation
- Preview: Three.js or React Three Fiber
- Testing: Vitest, Playwright, pytest/FastAPI TestClient

## Current Phase

Sprint 01 implementation completed: shared domain package.

Sprint 02 completed: AI Command Interpretation Planning.

Sprint 02 implementation completed: provider-free AI command interpretation package.

Sprint 03 completed: Desktop App Shell Planning.

Sprint 03 implementation completed: secure Electron desktop shell.

Sprint 04 implementation completed: Designer Workflow UI.

Sprint 05 implementation completed: Voice Interaction.

Sprint 06 completed: Backend, Database, and Versioning Planning.

Sprint 07 completed: Fast Visual Preview Planning.

Sprint 08 completed: Async Rendering and AI Images Planning.

Sprint 09 completed: Tech Pack Export Planning.

Sprint 06 implementation completed: FastAPI and PostgreSQL immutable design persistence.

Sprint 07 implementation completed: Spec-driven interactive Three.js dress preview.

Sprint 08 implementation completed: durable async concept render jobs, Redis/Celery worker, validated assets, provider adapters, and desktop comparison workflow.

Sprint 00 deliverables:

- Project README
- Folder structure proposal
- Architecture decision record format
- Initial architecture decision records
- Environment variable strategy
- Security rules for AI keys and desktop permissions
- Development workflow plan
- Testing strategy outline

Sprint 01 deliverables:

- Dress spec schema
- Model profile schema
- Design operation contract
- Versioning and locked-field rules
- Validation rules
- Before/after examples
- Sprint 01 future test plan
- TypeScript/Zod domain package in `packages/domain`
- Operation application functions for accepted, rejected, clarification, no-op, variation, and revert outcomes
- Vitest coverage for the initial domain contract

Sprint 02 deliverables:

- AI command interpretation flow
- Operation tool schema plan
- Prompting strategy
- Validation and clarification rules
- AI evaluation examples
- Error handling plan
- TypeScript/Zod AI command interpretation result schemas in `packages/ai`
- Provider-free MVP command interpreter for Sprint 02 evaluation examples
- Execution layer that validates/applies AI-proposed operations through `@fashion-design-ai/domain`
- Vitest coverage for AI output validation and command interpretation examples

Sprint 03 deliverables:

- Electron process model plan
- Main/preload/renderer responsibility boundaries
- Initial preload and IPC contract plan
- Electron security checklist
- Desktop development and packaging direction
- Electron + React + Vite desktop app shell in `apps/desktop`
- Secure BrowserWindow defaults
- Typed preload API under `window.fashionDesktop`
- IPC channels for app info, health ping, and safe external HTTPS links
- Vitest coverage for IPC contract validation

Sprint 04 deliverables:

- Main workspace layout plan
- Core component inventory
- Designer interaction flows
- UI state model
- Empty/error/loading state plan
- Accessibility and keyboard notes
- First Electron designer workspace UI
- Typed command bar connected to the AI/domain packages
- AI change review panel
- Structured spec inspector
- Version timeline
- Locked fields panel
- Spec-driven structured preview
- Desktop tests for designer session behavior

Sprint 05 deliverables:

- Voice interaction architecture
- Voice event state model
- Transcript handling rules
- Correction and interruption flow
- Realtime session security plan
- Latency and quality targets
- Local voice session state machine
- Microphone permission path
- Partial/final transcript panel
- Sample transcript flow
- Final transcript command application
- Desktop tests for voice session behavior

Sprint 06 deliverables:

- Backend service map
- API resource plan
- Database schema plan
- Versioning persistence rules
- Model profile relationship plan
- Migration strategy
- Auth, ownership, and security plan
- FastAPI service in `services/api`
- PostgreSQL 17 local service in `compose.yaml`
- SQLAlchemy models and Alembic migration
- Design and immutable version API endpoints
- Database-level version immutability enforcement
- Backend and PostgreSQL integration tests

Sprint 07 planning deliverables:

- React Three Fiber and Three.js preview architecture
- Deterministic spec-to-visual mapping
- Camera and interaction plan
- Performance and WebGL fallback strategy
- Visual and canvas-pixel verification strategy
- Pure `DressSpec` preview mapper
- Interactive mannequin and modular dress scene
- Mapped silhouette, skirt, length, neckline, sleeve, color, and fabric cues
- Front, three-quarter, side, back, and reset camera controls
- WebGL error fallback and visual verification

Sprint 08 planning deliverables:

- Durable render-job lifecycle
- GPT Image provider strategy and versioned prompt contract
- Redis worker and transactional outbox architecture
- Private object-storage plan
- Render traceability, idempotency, and signed webhook rules
- Variation comparison, cost, safety, and privacy plans

Sprint 08 implementation deliverables:

- PostgreSQL render jobs, immutable inputs, assets, and transactional outbox
- Redis 8 and Celery worker/Beat processing
- deterministic local mock provider and backend-only GPT Image 2 adapter
- private local asset storage with PNG validation and SHA-256 checksums
- render create/list/get/cancel/download API resources
- selected-version synchronization through typed Electron IPC
- background render controls, polling, cancellation, and comparison slots

Sprint 09 planning deliverables:

- canonical tech-pack snapshot contract
- PDF and XLSX generation strategies
- export readiness and missing-data rules
- immutable export lifecycle and storage plan
- manufacturer readability checklist

## Important Documents

- [Project planning prompt](ai_fashion_design_app_planning_prompt.md)
- [Development plan](ai_fashion_design_app_development_plan.md)
- [Agent instructions](AGENTS.md)
- [Tooling knowledge base](docs/00_tooling_knowledge_base.md)
- [Learning roadmap](docs/01_learning_roadmap.md)
- [Senior development operating guide](docs/02_senior_development_operating_guide.md)
- [Sprint plan index](docs/sprints/00_sprint_plan_index.md)
- [Sprint 01 development completion record](docs/sprints/01_sprint_development_completion_record.md)
- [Sprint 02 development completion record](docs/sprints/02_sprint_development_completion_record.md)
- [Desktop planning docs](docs/desktop/README.md)
- [Sprint 03 completion record](docs/sprints/03_sprint_completion_record.md)
- [Sprint 03 development completion record](docs/sprints/03_sprint_development_completion_record.md)
- [Designer workflow UI planning docs](docs/ui/README.md)
- [Sprint 04 completion record](docs/sprints/04_sprint_completion_record.md)
- [Sprint 04 development completion record](docs/sprints/04_sprint_development_completion_record.md)
- [Voice interaction planning docs](docs/voice/README.md)
- [Sprint 05 completion record](docs/sprints/05_sprint_completion_record.md)
- [Sprint 05 development completion record](docs/sprints/05_sprint_development_completion_record.md)
- [Backend planning docs](docs/backend/README.md)
- [Sprint 06 completion record](docs/sprints/06_sprint_completion_record.md)
- [Sprint 06 development completion record](docs/sprints/06_sprint_development_completion_record.md)
- [Fast visual preview planning docs](docs/preview/README.md)
- [Sprint 07 completion record](docs/sprints/07_sprint_completion_record.md)
- [Sprint 07 development completion record](docs/sprints/07_sprint_development_completion_record.md)
- [Async concept rendering planning docs](docs/rendering/README.md)
- [Sprint 08 completion record](docs/sprints/08_sprint_completion_record.md)
- [Sprint 08 development completion record](docs/sprints/08_sprint_development_completion_record.md)
- [Tech pack export planning docs](docs/exports/README.md)
- [Sprint 09 completion record](docs/sprints/09_sprint_completion_record.md)

## Implemented Code

- `packages/domain`: shared TypeScript package for the dress-only domain contract.
- `packages/ai`: provider-free AI command interpretation contracts, deterministic MVP interpreter, and execution boundary.
- `apps/desktop`: Electron + React desktop workspace with typed preload IPC, voice workflow, versioned design editing, interactive Three.js preview, and async concept comparison.
- `services/api`: FastAPI + SQLAlchemy service with PostgreSQL persistence, Redis/Celery render jobs, provider adapters, and validated private render assets.
- Root npm workspace scripts:
  - `npm run typecheck`
  - `npm test`
  - `npm run build`
  - `npm run dev:desktop`

## Development Rule

Before starting a new task, follow [AGENTS.md](AGENTS.md). Read the project context first, then work in small, documented, verifiable steps.

## Not Yet Implemented

This repository now contains the Electron designer workspace, local voice interaction, interactive fast 3D preview, immutable persistence, and an asynchronous concept-render workflow. General desktop save/load, production live transcription, tech-pack export, production authentication, and a live paid OpenAI image request are not yet implemented.
