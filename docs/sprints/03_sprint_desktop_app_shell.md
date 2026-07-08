# Sprint 03: Desktop App Shell Planning

Status: Planning completed on 2026-07-08.

Suggested duration: 1 week.

## Goal

Plan the secure Electron desktop application shell that will host the AI fashion design tool.

Sprint 03 does not create the app yet. It defines the process boundaries, preload bridge, IPC contract, security rules, development workflow, and packaging direction needed before the first desktop implementation pass.

## Why This Sprint Matters

The user wants real computer software, not only a web page. The desktop shell will eventually touch microphone access, local files, exports, previews, and native dialogs. If the Electron boundary is loose, the product can accidentally expose secrets, user files, or privileged desktop APIs to the renderer.

The desktop app must feel fast for designers while remaining strict internally:

```text
Electron main process: privileged desktop shell
Electron preload: tiny typed bridge
React renderer: unprivileged design UI
FastAPI backend: AI, persistence, secrets, validation
packages/domain: dress spec and operation rules
```

## Primary Deliverables

- Electron process model plan
- Main process responsibility plan
- Renderer responsibility plan
- Preload bridge/API plan
- Initial IPC channel inventory
- Desktop security checklist
- Local development workflow plan
- Packaging direction
- Sprint 03 progress tracker
- Sprint 03 completion record

## Planning Artifacts

- `docs/desktop/README.md`
- `docs/desktop/electron_process_model.md`
- `docs/desktop/preload_ipc_contract_plan.md`
- `docs/desktop/electron_security_checklist.md`
- `docs/desktop/desktop_development_and_packaging.md`
- `docs/sprints/03_sprint_progress_tracker.md`
- `docs/sprints/03_sprint_completion_record.md`

## Key Planning Tasks

### 1. Define Main Process Responsibilities

The main process should own:

- app lifecycle
- single-window startup for MVP
- window creation and restoration
- native dialogs
- external URL handling
- safe app metadata access
- tightly controlled local file/export actions later
- production security settings

The main process should not own:

- garment business logic
- AI prompting
- OpenAI API keys
- database writes
- direct dress spec mutation

### 2. Define Renderer Responsibilities

The renderer should own:

- React UI
- design canvas surface
- transcript display
- spec inspector
- version timeline
- local UI state
- calls to the preload API

The renderer should not receive:

- raw Node.js APIs
- filesystem primitives
- shell execution APIs
- backend secrets
- OpenAI API keys
- direct database credentials

### 3. Define Preload API

The preload API should expose a tiny typed surface under one namespace, such as:

```text
window.fashionDesktop
```

Initial planned groups:

- `app.getInfo`
- `dialog.chooseExportFolder`
- `shell.openExternal`
- `file.saveExportLater`
- `health.ping`

The first implementation should keep the preload bridge intentionally boring. It should prove the boundary before adding powerful desktop actions.

### 4. Define IPC Contract Rules

IPC channels should be:

- named in one place
- typed from a shared contract package or local desktop contract module
- validated at runtime
- one-purpose per channel
- unavailable from arbitrary renderer code except through preload wrappers

### 5. Plan Local Development

The desktop implementation should use:

- Electron
- React
- TypeScript
- Vite
- the existing npm workspace

Recommended future package:

```text
apps/desktop
```

The app package should depend on:

- `@fashion-design-ai/domain`

The app should not duplicate dress spec or design operation types.

### 6. Plan Packaging Direction

Packaging should not be the first implementation milestone. The first milestone is a secure dev shell that launches consistently.

Future packaging plan:

- use a standard Electron packaging tool after the shell is stable
- package for Windows first
- avoid code signing decisions until release hardening
- document any required installer or signing tools before Sprint 10

## Non-Goals

- No Electron app scaffold in this planning sprint.
- No React UI implementation.
- No microphone integration.
- No backend integration.
- No database integration.
- No production packaging.
- No AI calls from the renderer.
- No local file write implementation beyond planning.

## Acceptance Criteria

Sprint 03 planning is complete when:

- The desktop process model is documented.
- Main, renderer, and preload responsibilities are clearly separated.
- Initial IPC needs are listed.
- Security rules are specific enough to guide implementation.
- Development and packaging direction is documented.
- Future desktop implementation can begin without guessing where code should live or which APIs are safe.

## Risks

### Renderer Privilege Leakage

Risk:

- Exposing Node.js or broad desktop APIs to the renderer would make future UI bugs more dangerous.

Mitigation:

- Keep `nodeIntegration` disabled.
- Keep `contextIsolation` enabled.
- Use preload wrappers only.
- Validate IPC payloads.

### Secret Exposure

Risk:

- AI keys or backend credentials could accidentally enter the renderer bundle.

Mitigation:

- Backend owns AI secrets.
- Renderer receives only short-lived safe data through API calls.
- Never use `VITE_` variables for secrets.

### Desktop Scope Creep

Risk:

- Packaging, installers, menus, auto-updates, and native integrations can consume time before the core design loop exists.

Mitigation:

- Start with one secure window.
- Add native features only when needed by a designer workflow.

### Typed Contract Drift

Risk:

- IPC, backend API, and domain types can drift apart.

Mitigation:

- Reuse `@fashion-design-ai/domain`.
- Add shared IPC/API contracts when implementation begins.
- Test IPC handlers and preload wrappers.

## Senior Developer Notes

Keep the desktop layer thin. The renderer handles the design experience, the backend handles AI and persistence, the domain package handles dress rules, and the main process handles native desktop affordances.

Sprint 03 should make the first desktop implementation feel calm: one secure window, one typed preload bridge, one clear place for IPC contracts, and no secrets anywhere near the renderer.
