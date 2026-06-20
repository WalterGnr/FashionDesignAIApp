# AI Fashion Design App

Status: Sprint 00 foundation work started on 2026-06-19.

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

Sprint 01 completed: Garment Spec and Design Operations.

Sprint 00 deliverables:

- Project README
- Folder structure proposal
- Architecture decision record format
- Initial architecture decision records
- Environment variable strategy
- Security rules for AI keys and desktop permissions
- Development workflow plan
- Testing strategy outline

## Important Documents

- [Project planning prompt](ai_fashion_design_app_planning_prompt.md)
- [Development plan](ai_fashion_design_app_development_plan.md)
- [Agent instructions](AGENTS.md)
- [Tooling knowledge base](docs/00_tooling_knowledge_base.md)
- [Learning roadmap](docs/01_learning_roadmap.md)
- [Senior development operating guide](docs/02_senior_development_operating_guide.md)
- [Sprint plan index](docs/sprints/00_sprint_plan_index.md)

## Development Rule

Before starting a new task, follow [AGENTS.md](AGENTS.md). Read the project context first, then work in small, documented, verifiable steps.

## Not Yet Implemented

This repository does not yet contain the Electron app, FastAPI backend, database schema, or AI integration. Sprint 01 produced domain contracts only, not application code.
