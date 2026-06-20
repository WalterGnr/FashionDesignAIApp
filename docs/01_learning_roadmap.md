# Learning Roadmap for Building the AI Fashion Design App

Last updated: 2026-06-19

Purpose: define the order in which we should learn and prototype the tools needed for this project.

## Guiding Principle

This project should be learned and built from the inside out:

1. Domain model
2. AI command interpretation
3. Desktop interaction
4. Fast preview
5. Persistence and versioning
6. Export
7. High-quality rendering
8. Manufacturing accuracy

The biggest mistake would be starting with beautiful image generation before the design data model is reliable.

## Phase 0: Senior Developer Foundation

Goal: establish how we will work before writing production code.

Learn:

- Git workflow
- Markdown documentation
- TypeScript strict typing
- Basic architecture decision records
- Testing strategy
- Secure handling of API keys and secrets

Deliverables:

- Project README
- Architecture decision records folder
- Contribution/development guide
- Environment variable documentation
- Initial test strategy

Definition of ready:

- We can explain how the app is structured before coding it.
- We know where decisions are recorded.
- We know how secrets will be handled.

## Phase 1: Garment Spec and Design-State Engine

Goal: create the structured representation of a dress.

Learn:

- TypeScript interfaces/types
- JSON Schema or Zod validation
- Domain modeling
- Immutable state updates
- Version history patterns

Tools:

- TypeScript
- Zod or JSON Schema
- Vitest

Key concepts:

- Dress spec as source of truth
- Design operation model
- Undo/redo
- Locked fields
- Change summaries
- Version snapshots

Prototype:

- Input: a structured operation like `change_sleeve_length`.
- Output: updated dress spec plus version metadata.

Definition of ready:

- A dress design can be represented without images.
- Every change can be validated.
- Every change can be saved as a version.

## Phase 2: AI Command Interpretation

Goal: convert designer speech/text into structured garment operations.

Learn:

- OpenAI function calling/tools
- Structured outputs
- Prompt design for domain operations
- Schema validation
- Ambiguity handling
- Guardrails

Tools:

- OpenAI Responses API
- OpenAI function calling/tools
- JSON Schema or Zod
- FastAPI service layer

Key concepts:

- Raw transcript is not the same as design intent.
- AI output is a proposal until validated.
- Impossible or ambiguous design requests should trigger clarification.

Prototype:

- User text: "Make it a red satin evening gown with off-shoulder sleeves."
- AI output: structured operations applied to the dress spec.

Definition of ready:

- AI can produce valid design operations.
- Invalid operations are rejected.
- Ambiguous commands are detected.

## Phase 3: Voice Interaction

Goal: make designer interaction fast and natural.

Learn:

- Real-time speech-to-text
- WebRTC or WebSocket streaming
- Microphone permissions in desktop apps
- Transcript event handling
- Interruption and correction UX

Tools:

- OpenAI Realtime API
- Electron desktop APIs
- Backend session broker

Key concepts:

- The renderer should not hold long-lived API secrets.
- Voice events should be logged enough to debug mistakes.
- Partial transcripts can preview intent, but committed design changes should happen at clear turn boundaries or after confirmation rules.

Prototype:

- Press microphone.
- Speak a command.
- Live transcript appears.
- The command becomes a structured design operation.

Definition of ready:

- The app can reliably capture speech.
- Transcripts are usable for design commands.
- The designer can correct a misunderstood command.

## Phase 4: Desktop App Shell

Goal: create a real desktop software experience.

Learn:

- Electron app lifecycle
- Main process vs renderer process
- Preload scripts
- Secure IPC
- Local file dialogs
- App packaging basics

Tools:

- Electron
- Vite
- React
- TypeScript

Key concepts:

- Main process handles privileged desktop access.
- Renderer handles UI.
- Preload exposes a limited bridge.
- IPC channels must be typed and validated.

Prototype:

- Desktop window opens.
- Renderer shows design canvas and controls.
- Main/renderer IPC is tested with a small typed API.

Definition of ready:

- App launches as desktop software.
- Security settings are intentional.
- No direct Node access in renderer.

## Phase 5: UI and Designer Workflow

Goal: build the first usable designer interface.

Learn:

- React components
- State management
- Layout systems
- Accessibility basics
- Interaction design for creative tools

Tools:

- React
- TypeScript
- Tailwind CSS
- Zustand

Key concepts:

- The canvas/preview is the main focus.
- Controls should be minimal and fast.
- Voice, version history, fabric/material panels, and export should support the creative flow without taking over the screen.

Prototype:

- Main preview area
- Microphone button
- Transcript panel
- Structured spec inspector
- Version timeline

Definition of ready:

- A designer can understand the interface without reading instructions.
- Current design state is always visible.
- Revisions are easy to inspect.

## Phase 6: Visual Preview

Goal: show quick visual feedback from the structured spec.

Learn:

- Three.js scene basics
- React Three Fiber
- Cameras, lights, materials
- Loading 3D models
- Simple garment geometry
- Canvas testing limitations

Tools:

- Three.js
- React Three Fiber
- Playwright screenshot checks

Key concepts:

- Preview should be fast, even if approximate.
- It should show silhouette, color, neckline, length, sleeves, and model profile changes.
- It does not need physically accurate draping in the MVP.

Prototype:

- A mannequin view changes when spec fields change.
- Different model measurement profiles affect proportions.
- Render is checked to avoid blank canvas failures.

Definition of ready:

- Designers get immediate visual feedback.
- Preview is driven by the structured spec.
- Rendering does not block the voice workflow.

## Phase 7: Backend and Database

Goal: persist designs, versions, specs, model profiles, renders, and exports.

Learn:

- FastAPI routing
- Pydantic validation
- SQLAlchemy or SQLModel
- PostgreSQL schema design
- Alembic migrations
- Auth basics
- API error design

Tools:

- FastAPI
- PostgreSQL
- SQLAlchemy / SQLModel
- Alembic

Key concepts:

- Design versions should be immutable.
- Current design points to a current version.
- JSONB is useful for flexible spec sections, but stable searchable fields should be columns.

Prototype:

- Create design
- Save version
- Save model profile
- Link render to design version and model profile

Definition of ready:

- App can restore a design from the database.
- Same design can be rendered on multiple model profiles.
- Schema supports export and future manufacturing workflows.

## Phase 8: Background Jobs and Rendering Queue

Goal: prevent slow tasks from blocking the designer.

Learn:

- Redis queues or streams
- Worker processes
- Retry logic
- Job status tracking
- Async UI progress states

Tools:

- Redis
- FastAPI worker process
- PostgreSQL job records

Key concepts:

- High-quality image generation should be asynchronous.
- PDF/spreadsheet export can be asynchronous.
- Job state should be recoverable after app restart.

Prototype:

- Create render job.
- Worker generates placeholder output.
- UI polls or subscribes to status.

Definition of ready:

- Slow tasks do not freeze the app.
- Failed jobs can be retried.
- Job history is visible.

## Phase 9: AI Image Generation

Goal: generate richer concept renders from the structured spec.

Learn:

- Image generation prompts
- Image editing workflows
- Reference image inputs
- Render consistency strategies
- Cost and latency management

Tools:

- OpenAI image generation
- Object storage
- Render job queue

Key concepts:

- Generated images should be tied to a design version.
- The app should distinguish concept render from technical spec.
- Designers need variation comparison and field locking.

Prototype:

- Generate concept render from a saved version.
- Save image URL to render record.
- Compare render with previous version.

Definition of ready:

- Renders are traceable to design versions.
- Cost and latency are visible enough for product decisions.
- Designer does not lose control when images vary.

## Phase 10: Tech Pack Export

Goal: bridge creative design and production.

Learn:

- PDF generation
- Spreadsheet generation
- Technical fashion documentation structure
- Measurement tables
- BOM tables
- Versioned exports

Tools:

- Python PDF library or HTML-to-PDF
- openpyxl or xlsxwriter
- Backend export workers

Key concepts:

- A tech pack should be generated from a saved design version.
- It must include the version ID.
- Exported data should be deterministic and auditable.

Prototype:

- Generate PDF with design summary, measurements, materials, construction notes, and render.
- Generate spreadsheet with BOM and measurements.

Definition of ready:

- Manufacturer-facing output is useful.
- Exports can be regenerated from the same version.
- Export files are stored and linked to design records.

## Phase 11: Testing and Quality

Goal: make the software reliable enough for serious creative work.

Learn:

- Unit tests
- Integration tests
- E2E tests
- Visual regression checks
- API contract tests
- AI evaluation sets

Tools:

- Vitest
- Playwright
- pytest
- FastAPI TestClient

Key concepts:

- Test design-state transitions heavily.
- Test schema validation heavily.
- Test common voice command examples.
- Test export determinism.
- Test canvas is nonblank and responds to spec changes.

Prototype:

- Golden test suite of designer commands.
- E2E flow from voice/text command to saved version.

Definition of ready:

- We can change the app without fear of breaking core workflows.
- The most important AI mistakes are caught by tests/evals.

## Phase 12: Advanced Fashion Production Features

Goal: move from creative concept tool to production-grade software.

Learn:

- Patternmaking data models
- Garment grading
- Fabric drape and stretch rules
- PLM concepts
- Vendor collaboration workflows
- CAD interoperability

Possible tools/integrations:

- CLO3D
- Browzwear
- Blender
- DXF/AAMA/ASTM-style export workflows
- PLM APIs

Key concepts:

- Production accuracy is a separate level beyond image quality.
- Human review remains important.
- The software should surface risk, not pretend every design is manufacturable.

Definition of ready:

- The app can produce production-aware warnings.
- Technical data can flow to sample making or manufacturing workflows.

## First Learning Milestones

Milestone 1:

- Understand TypeScript domain modeling.
- Draft the first garment spec schema.
- Write examples of design operations.

Milestone 2:

- Learn OpenAI structured tool calling.
- Convert text commands into garment operations.

Milestone 3:

- Learn Electron security basics.
- Create a secure desktop app skeleton.

Milestone 4:

- Learn React state management with Zustand.
- Build a session UI that displays spec changes.

Milestone 5:

- Learn Three.js/R3F enough to render a simple dress preview.

Milestone 6:

- Learn FastAPI/PostgreSQL persistence.
- Save designs and immutable versions.

Milestone 7:

- Learn queues, AI image generation, and tech pack export.

## What Not To Rush

- Physically accurate draping.
- Pattern generation.
- Full manufacturing integrations.
- Marketplace/supplier integrations.
- Complex collaboration.
- Offline sync.

These are important, but they should not come before the design-state engine and voice-to-spec loop are solid.
