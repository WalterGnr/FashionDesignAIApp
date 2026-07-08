# Desktop Planning

Last updated: 2026-07-08

Status: Sprint 03 planning artifacts plus initial desktop shell implementation.

## Purpose

This folder defines how the desktop app should be built before implementation begins.

The desktop app is the designer-facing software surface. It should feel like real computer software while keeping strict boundaries around privileged APIs, secrets, local files, AI sessions, and future production exports.

## Stack Decision

Accepted stack:

- Electron
- React
- TypeScript
- Vite

Related ADR:

- `docs/architecture/adr_0002_electron_react_typescript_desktop.md`

## Core Boundary

```text
Electron main process
  owns native desktop privileges

Electron preload
  exposes a small typed bridge

React renderer
  owns the designer interface

FastAPI backend
  owns AI secrets, persistence, and database writes

packages/domain
  owns dress spec and operation rules
```

## Sprint 03 Documents

- `electron_process_model.md`
- `preload_ipc_contract_plan.md`
- `electron_security_checklist.md`
- `desktop_development_and_packaging.md`

## Implementation Reminder

Do not expose raw Node.js APIs to the renderer.

Do not put OpenAI keys or backend secrets in Electron renderer code.

Do not duplicate dress spec or design operation rules in the desktop app. Reuse `@fashion-design-ai/domain`.

## Implemented Shell

Implemented package:

- `apps/desktop`

Implemented scope:

- Electron main process
- secure BrowserWindow defaults
- typed preload bridge exposed as `window.fashionDesktop`
- IPC handlers for app info, health ping, and HTTPS external links
- minimal React renderer shell
- IPC contract tests

Not implemented yet:

- full designer workflow UI
- live microphone
- backend persistence
- live AI calls
- file export
- production packaging
