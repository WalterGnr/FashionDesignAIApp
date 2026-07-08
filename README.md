# AI Fashion Design App

Status: Sprint 01 and Sprint 02 implementation completed; Sprint 03 planning completed; ready to plan Sprint 04 or implement the next selected sprint.

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

## Implemented Code

- `packages/domain`: shared TypeScript package for the dress-only domain contract.
- `packages/ai`: provider-free AI command interpretation contracts, deterministic MVP interpreter, and execution boundary.
- Root npm workspace scripts:
  - `npm run typecheck`
  - `npm test`
  - `npm run build`

## Development Rule

Before starting a new task, follow [AGENTS.md](AGENTS.md). Read the project context first, then work in small, documented, verifiable steps.

## Not Yet Implemented

This repository does not yet contain the Electron app, FastAPI backend, database schema, or live OpenAI integration. Sprint 03 produced planning contracts only; Sprint 01 and Sprint 02 now have executable shared packages.
