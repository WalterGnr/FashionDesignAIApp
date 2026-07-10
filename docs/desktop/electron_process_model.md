# Electron Process Model Plan

Last updated: 2026-07-08

Status: Sprint 03 planning artifact.

## Goal

Define the runtime responsibilities for the future Electron desktop app.

The first implementation should be intentionally small: a secure shell with one main window, a React renderer, a narrow preload bridge, and no direct backend or AI secrets in the UI.

## Planned Runtime Shape

```text
apps/desktop
  electron main process
    creates BrowserWindow
    registers IPC handlers
    owns native desktop APIs

  preload script
    exposes window.fashionDesktop
    validates or wraps renderer requests

  renderer process
    React app
    unprivileged designer UI
    calls window.fashionDesktop only

packages/domain
  shared dress/domain package

services/api
  future backend for AI, persistence, and database writes
```

## Main Process Responsibilities

The Electron main process should own:

- app startup and shutdown
- BrowserWindow creation
- secure web preferences
- native app menu later
- native dialogs later
- external URL allowlisting
- IPC handler registration
- app version and environment metadata
- controlled export/save flows later

The main process should not own:

- dress spec mutation
- design operation validation beyond IPC payload validation
- AI command interpretation
- OpenAI API keys
- PostgreSQL credentials
- long-running render jobs
- business workflows that belong in the backend or domain package

## Renderer Responsibilities

The renderer should own:

- React components
- user interaction state
- canvas/preview area
- transcript panel
- spec inspector
- version timeline
- calls to backend APIs through safe app services
- calls to preload-exposed desktop helpers

The renderer should not have:

- `require`
- `process`
- direct filesystem access
- raw Electron APIs
- shell execution
- database credentials
- AI provider keys

## Preload Responsibilities

The preload script should:

- use `contextBridge.exposeInMainWorld`
- expose one stable namespace
- hide raw `ipcRenderer`

Because the renderer sandbox is enabled, the preload bundle is CommonJS. Electron does not support ESM imports in
sandboxed preload scripts. The build emits `out/preload/index.js` while keeping the exposed API narrow and typed.
- wrap each IPC channel in a typed function
- avoid exposing event emitters directly unless carefully scoped
- validate or normalize inputs where practical

Planned namespace:

```ts
window.fashionDesktop
```

## BrowserWindow Security Defaults

Planned `webPreferences`:

```text
contextIsolation: true
nodeIntegration: false
sandbox: true where compatible
preload: explicit preload path
webSecurity: true
allowRunningInsecureContent: false
```

Planned navigation rules:

- Load local Vite dev URL only in development.
- Load packaged local assets in production.
- Block unexpected navigation.
- Open allowed external URLs in the user's browser.
- Do not load arbitrary remote content in the app window.

## Environment Boundaries

Development:

- renderer loaded from Vite dev server
- main process launched by Electron tooling
- IPC available through preload

Production:

- renderer loaded from packaged static files
- no dev server
- no development-only debugging shortcuts by default

Secrets:

- not available in renderer
- not stored in desktop package
- future backend owns AI and database secrets

## First Implementation Slice

The first desktop implementation should prove:

- app launches
- window opens
- renderer loads
- preload bridge exists
- IPC ping works
- security settings are intentional
- domain package can be imported by renderer code without duplicating types

It should not implement the full designer UI yet.

## Open Questions

- Which Electron packaging tool should be selected later: Electron Forge, Electron Builder, or another option?
- Should the first shell use Tailwind immediately or wait until Sprint 04 UI planning is accepted?
- Should IPC contracts live inside `apps/desktop` at first or in a future `packages/contracts` package?

Recommended initial answer:

- Keep IPC contracts local to `apps/desktop` for the first shell if only a few channels exist.
- Move them to `packages/contracts` when backend API contracts or cross-package reuse begin.
