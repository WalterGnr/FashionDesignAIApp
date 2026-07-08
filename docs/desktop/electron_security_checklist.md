# Electron Security Checklist

Last updated: 2026-07-08

Status: Sprint 03 planning artifact.

## Purpose

Define the minimum security bar for the future Electron desktop shell.

This app will eventually interact with voice input, design data, body measurements, local exports, generated renders, and AI services. The renderer must remain unprivileged.

## Required Before First Desktop Commit

- `nodeIntegration` disabled.
- `contextIsolation` enabled.
- preload script used for all renderer-to-main communication.
- no raw `ipcRenderer` exposed to renderer.
- no OpenAI API key in renderer.
- no database credentials in renderer.
- no direct filesystem API in renderer.
- no shell execution API in renderer.
- unexpected navigation blocked.
- external links opened through a controlled main-process helper.

## Required Before Loading Any Remote URL

The MVP should avoid loading arbitrary remote content in the Electron window.

If remote content is ever needed:

- document why
- allowlist exact origins
- enforce HTTPS
- disable unsafe redirects
- review Content Security Policy
- test navigation blocking

## Required Before File Access

Before adding any file access:

- define the workflow need
- keep file access in the main process
- validate file type and size
- avoid writing to executable app paths
- avoid sending broad local paths into renderer state unless required
- handle cancellation and permission errors

## Required Before Microphone Access

Before adding voice:

- document user consent flow
- keep long-lived AI credentials out of renderer
- decide whether audio streams go to backend, browser WebRTC, or brokered short-lived session
- log enough state to debug transcript issues without storing sensitive audio unnecessarily

## Required Before Backend Integration

Before connecting to FastAPI:

- define API base URL strategy
- keep secrets in backend environment variables
- use typed API client responses
- handle offline/backend unavailable states
- avoid silent failed saves

## Required Before Packaging

- run production build.
- verify renderer uses packaged local files.
- verify devtools behavior is intentional.
- review app permissions.
- review dependency audit.
- confirm no `.env` or generated private artifacts are packaged.
- confirm no source maps expose secrets.
- confirm app cannot navigate to unexpected origins.

## Content Security Policy Direction

The first implementation should plan for a strict CSP.

Starting direction:

```text
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
connect-src 'self' http://localhost:* https://localhost:*;
```

Notes:

- Development may need localhost exceptions.
- Production should be narrower.
- Any AI/backend URLs should be explicit when integration begins.

## Security Tests To Add During Implementation

- renderer has no `require`
- renderer has no raw `process`
- preload namespace exists
- unknown IPC channels are unavailable
- invalid IPC payloads are rejected
- external URL helper rejects non-HTTPS URLs
- app blocks unexpected navigation

## Red Flags

- Exposing `ipcRenderer` directly.
- Adding `window.fs` or broad file helpers.
- Putting API keys in `.env` variables consumed by Vite.
- Using remote web pages as the main renderer.
- Allowing arbitrary `shell.openExternal` URLs.
- Treating generated AI data as trusted UI state without validation.
