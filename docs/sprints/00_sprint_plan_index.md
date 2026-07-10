# Sprint Plan Index

Last updated: 2026-07-08

Status: Sprint 00 planning, Sprint 01 implementation, Sprint 02 implementation, Sprint 03 implementation, Sprint 04 implementation, Sprint 05 implementation, and Sprint 06 planning are complete. Sprint 06 implementation is the next recommended implementation target.

## Planning Assumption

These sprints are written for a careful solo/small-team development pace with AI assistance. Each sprint is scoped to produce a useful, verifiable slice without pretending that complex AI, desktop, 3D, database, and manufacturing workflows can all be solved at once.

Suggested sprint length: 1 to 2 weeks each.

## Product North Star

Build a desktop fashion design application where designers can use fast voice interaction with AI to create and revise dress designs while preserving creative control, technical accuracy, version traceability, and production readiness.

The structured garment spec is the source of truth.

## Sprint Sequence

### Sprint 00: Project Foundation and Architecture

Create the documentation, repository structure, architecture decisions, and development standards needed before coding.

File: `00_sprint_project_foundation.md`

Current status: foundation artifacts completed.

### Sprint 01: Garment Spec and Design Operations

Define the structured dress data model and the operations that can safely modify it.

File: `01_sprint_garment_spec_and_operations.md`

Current status: domain contract artifacts completed; initial TypeScript/Zod domain package implemented in `packages/domain`.

### Sprint 02: AI Command Interpretation Planning

Design how spoken or typed designer commands become validated structured operations.

File: `02_sprint_ai_command_interpretation.md`

Current status: AI planning artifacts completed; initial provider-free TypeScript AI command interpretation package implemented in `packages/ai`.

### Sprint 03: Desktop App Shell Planning

Plan the Electron desktop structure, security boundaries, renderer/main process communication, and packaging direction.

File: `03_sprint_desktop_app_shell.md`

Current status: desktop app shell planning and initial implementation completed.

### Sprint 04: Designer Workflow UI Planning

Plan the core interface: canvas-first layout, microphone control, transcript area, spec inspector, and version timeline.

File: `04_sprint_designer_workflow_ui.md`

Current status: designer workflow UI planning artifacts and initial implementation completed.

### Sprint 05: Voice Interaction Planning

Plan real-time speech-to-text, voice event handling, correction flow, and AI session security.

File: `05_sprint_voice_interaction.md`

Current status: voice interaction planning artifacts and initial implementation completed.

### Sprint 06: Backend, Database, and Versioning Planning

Plan the API, database schema, persistence model, immutable design versions, and model profiles.

File: `06_sprint_backend_database_versioning.md`

Current status: backend, database, and versioning planning artifacts completed.

### Sprint 07: Fast Visual Preview Planning

Plan the first simple visual preview driven by structured spec data, using 2D/3D approximation.

File: `07_sprint_fast_visual_preview.md`

### Sprint 08: Async Rendering and AI Images Planning

Plan background render jobs, image generation, render traceability, and object storage.

File: `08_sprint_async_rendering_ai_images.md`

### Sprint 09: Tech Pack Export Planning

Plan PDF/spreadsheet tech pack exports for manufacturer-facing documentation.

File: `09_sprint_tech_pack_export.md`

### Sprint 10: Testing, Hardening, and MVP Release Planning

Plan quality, security, testing, packaging, and MVP release criteria.

File: `10_sprint_testing_hardening_mvp_release.md`

## Why This Order

The order protects the project from becoming a pretty demo with weak internals.

First we define the design data model, then the AI operation model, then the desktop experience, then persistence, previews, rendering, export, and release hardening.

## Work Not Included In MVP Sprints

These are important but should wait until after the MVP:

- Full physically accurate garment simulation
- Automatic production pattern generation
- Size grading automation
- PLM integrations
- Vendor portal
- Advanced supplier marketplace
- Offline sync
- Multi-user real-time collaboration
- Brand-wide AI design memory

## Sprint Completion Rule

A sprint is complete only when its planning artifacts are clear enough that implementation can begin without guessing the intent, data contracts, risks, and acceptance criteria.
