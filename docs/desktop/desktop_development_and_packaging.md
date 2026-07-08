# Desktop Development and Packaging Plan

Last updated: 2026-07-08

Status: Sprint 03 planning artifact.

## Goal

Plan how the future Electron desktop app should be developed, tested, and eventually packaged.

Sprint 03 does not create the app. It defines the direction so implementation can start cleanly.

## Planned App Location

```text
apps/desktop
```

## Planned Package Role

The desktop package should contain:

- Electron main process
- preload script
- React renderer
- Vite configuration
- desktop-specific tests
- desktop-specific IPC contracts if still small

It should consume:

- `@fashion-design-ai/domain`

It should not duplicate:

- dress spec schemas
- design operation schemas
- versioning rules
- locked-field logic

## Workspace Direction

The repo already uses npm workspaces:

```json
{
  "workspaces": ["packages/*"]
}
```

When `apps/desktop` is implemented, the workspace config should expand to include:

```text
apps/*
packages/*
```

## Recommended Development Scripts

Future root scripts:

```text
npm run dev:desktop
npm run build:desktop
npm run test:desktop
npm run typecheck:desktop
```

Future desktop package scripts:

```text
dev
build
typecheck
test
package
```

## First Implementation Milestone

The first desktop milestone should prove:

- Electron starts.
- One BrowserWindow opens.
- React renderer loads.
- preload bridge is available.
- IPC ping succeeds.
- security settings are intentional.
- renderer can import domain types or consume domain-safe fixtures.
- no app secrets exist in the renderer.

This milestone should not attempt to build the full design UI.

## Development Server Flow

Development mode:

```text
Vite dev server starts
Electron main process starts
BrowserWindow loads localhost renderer URL
preload bridge attaches
main process registers IPC handlers
```

Production mode:

```text
renderer builds static files
Electron main process loads packaged renderer files
preload bridge attaches
IPC handlers behave the same as development
```

## Testing Direction

### Unit Tests

Use Vitest for:

- IPC contract schemas
- utility functions
- renderer state helpers
- preload-safe wrapper tests where practical

### Desktop Smoke Tests

Use Playwright or an Electron-capable test setup later for:

- app launches
- renderer is visible
- preload API exists
- IPC ping works
- unexpected navigation is blocked

### Manual Verification

Early manual checklist:

- start app
- confirm window opens
- confirm no console security errors
- confirm app info displays through preload
- confirm reload works in development
- confirm app quits cleanly

## Packaging Direction

Packaging should wait until:

- the secure shell works
- the first designer UI shell exists
- basic smoke tests exist
- runtime secrets are separated

Candidate tools to evaluate later:

- Electron Forge
- Electron Builder

Initial recommendation:

- Delay final packaging tool choice until the first shell exists.
- Pick the tool that best supports Windows packaging with minimal project complexity.
- Do not introduce auto-update, code signing, or installer customization until release hardening.

## Windows First

The user's current development machine is Windows.

Initial packaging target:

- Windows

Future targets:

- macOS
- Linux

## Versioning Direction

Desktop app version should eventually align with:

- package version
- release notes
- database/API compatibility notes
- domain schema version

For early development, package versions can remain private and internal.

## Known Limits

This plan does not decide:

- final installer technology
- code signing certificate strategy
- auto-update service
- crash reporting service
- telemetry policy

Those belong closer to Sprint 10 release hardening.
