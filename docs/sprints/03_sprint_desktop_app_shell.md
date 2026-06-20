# Sprint 03: Desktop App Shell Planning

Status: Planning only.

Suggested duration: 1 week.

## Goal

Plan the secure desktop application shell that will host the design tool.

## Why This Sprint Matters

The app is intended to be real computer software, not only a web page. The desktop shell needs careful security boundaries because it may access microphones, local files, previews, and exported documents.

## Primary Deliverables

- Electron architecture plan
- Main process responsibilities
- Renderer process responsibilities
- Preload bridge/API plan
- IPC channel list
- Security checklist
- Packaging direction

## Key Planning Tasks

- Define main process responsibilities:
  - App lifecycle
  - Window management
  - Native dialogs
  - Secure local file operations where needed
  - Desktop permissions
- Define renderer responsibilities:
  - UI
  - Design canvas
  - Transcript display
  - Spec inspector
  - Version timeline
- Define preload API:
  - Limited, typed bridge
  - No raw Node exposure
  - Validated IPC calls
- Plan local development with Vite.
- Plan app packaging later.
- Record Electron security rules.

## Non-Goals

- No Electron app creation yet.
- No window implementation.
- No UI.
- No packaging.

## Acceptance Criteria

- The desktop process model is documented.
- Security boundaries are clear.
- Initial IPC needs are listed.
- Future implementation can avoid exposing secrets or Node APIs in the renderer.

## Risks

- Desktop apps can accidentally expose powerful APIs.
- API keys could be leaked if the architecture is careless.
- Packaging complexity can distract from core product work.

## Senior Developer Notes

Keep the desktop layer thin. The renderer handles the design experience, the backend handles AI and persistence, and the main process handles native desktop affordances.
