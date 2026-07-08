# Preload and IPC Contract Plan

Last updated: 2026-07-08

Status: Sprint 03 planning artifact.

## Goal

Define the first safe IPC surface for the Electron desktop app.

The renderer should never call raw Electron APIs. It should call a small typed API exposed by preload.

## Planned Preload Namespace

```ts
window.fashionDesktop
```

## Planned Type Shape

Future implementation can start with a declaration like:

```ts
type FashionDesktopApi = {
  app: {
    getInfo(): Promise<AppInfo>;
  };
  health: {
    ping(): Promise<HealthPingResult>;
  };
  shell: {
    openExternal(url: string): Promise<OpenExternalResult>;
  };
  dialog: {
    chooseExportFolder(): Promise<ChooseFolderResult>;
  };
};
```

This is a planning shape, not implementation code.

## Initial IPC Channel Inventory

### `app:get-info`

Purpose:

- Return safe desktop app metadata.

Request:

- none

Response:

- app name
- app version
- platform
- environment mode

Security notes:

- No secrets.
- No local paths unless specifically needed.

### `health:ping`

Purpose:

- Verify preload and main-process IPC wiring.

Request:

- optional request ID

Response:

- status
- timestamp

Security notes:

- Useful for early tests.
- Should not expose process details beyond what is safe.

### `shell:open-external`

Purpose:

- Open trusted external links in the user's default browser.

Request:

- URL

Response:

- success or rejected reason

Security notes:

- Allow only `https:` URLs.
- Consider an allowlist for documentation/help links.
- Never use this for local executable paths.

### `dialog:choose-export-folder`

Purpose:

- Let the designer choose a folder for future exported tech packs.

Request:

- optional dialog title

Response:

- canceled flag
- selected folder path token or path, depending on final security model

Security notes:

- Should be implemented only when export workflow begins.
- Avoid giving renderer broad filesystem control.
- Prefer main process owning actual writes later.

### `file:save-export`

Purpose:

- Future controlled save flow for generated exports.

Status:

- Not part of first implementation unless export needs arrive early.

Security notes:

- Main process should write known generated artifacts only.
- Renderer should not receive arbitrary write capability.

## Contract Rules

Every IPC channel should have:

- a stable string name
- request type
- response type
- runtime validation
- clear error shape
- owner module
- tests when implemented

## Error Shape

Planned error shape:

```text
{
  ok: false,
  code: string,
  message: string
}
```

Planned success shape:

```text
{
  ok: true,
  data: ...
}
```

## Validation Strategy

Preferred:

- Use Zod for IPC payload validation, matching the domain package pattern.

Why:

- The project already uses Zod in `@fashion-design-ai/domain`.
- Runtime validation protects the main process from malformed renderer input.
- Shared validation style reduces mental overhead.

## Placement Recommendation

For the first desktop implementation:

```text
apps/desktop/src/shared/ipc-contracts.ts
```

Move later to:

```text
packages/contracts
```

Move trigger:

- backend contracts are added
- IPC types need reuse outside desktop
- contract count becomes difficult to manage locally

## Testing Plan

When implemented, add tests for:

- IPC contract schemas accept valid payloads
- IPC contract schemas reject invalid payloads
- preload exposes only expected functions
- renderer cannot access raw Node/Electron APIs
- main handler returns consistent error shapes

## Non-Goals

- No broad filesystem API.
- No direct database API.
- No AI API key access.
- No shell command execution.
- No arbitrary native module access.
