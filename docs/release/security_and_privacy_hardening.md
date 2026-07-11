# Security and Privacy Hardening

## Threat Boundary

The renderer is treated as untrusted. The Electron main process and FastAPI backend are privileged boundaries. AI output, transcripts, filenames, URLs, database content, and generated assets are untrusted input until validated.

## Current Strengths

- renderer Node integration is disabled
- context isolation, sandboxing, and web security are enabled
- insecure mixed content is disabled
- preload exposes narrow typed methods instead of raw Electron APIs
- IPC payloads use Zod validation
- external links allow HTTPS only
- navigation and new windows are restricted
- AI credentials remain backend-only
- asset type and size validation exists
- backend queries enforce owner-scoped resources, although the owner is currently fixed

## Sprint 10 Required Work

### Electron

- validate `event.senderFrame` for every IPC handler against the trusted application origin
- centralize IPC registration so sender and payload checks cannot be skipped
- configure `session.setPermissionRequestHandler`; permit microphone only for the trusted app and deny every other request
- verify permission checks for subframes and navigation attempts
- use a restrictive production CSP and separate development allowances
- prefer a custom app protocol over `file://` for packaged content
- retain context isolation, sandbox, disabled Node integration, enabled web security, and blocked mixed content
- deny all window creation and route approved HTTPS links through a strict URL parser/allowlist
- configure package-time Electron fuses, including disabling `RunAsNode`; reconcile test requirements before disabling Node CLI inspection
- disable DevTools in normal release builds or gate them behind an explicit internal diagnostic mode

### IPC and Files

- keep renderer APIs capability-specific and never expose raw `ipcRenderer`
- validate sender before privileged file, shell, backend, render, or export actions
- constrain temporary export paths to an application-owned directory
- sanitize generated filenames and prevent traversal
- verify content type, extension, size, and checksum before opening an asset
- remove stale temporary export files according to a documented retention policy

### Backend

- bind internal alpha services to loopback only
- do not expose FastAPI, PostgreSQL, or Redis ports beyond the test machine
- reject production mode when the fixed development owner is active
- enforce request/body limits and safe error responses
- verify ownership on every design, version, job, and asset route
- keep provider credentials in backend environment variables only
- redact secrets and sensitive payloads from exceptions and logs
- add security headers where HTTP responses can reach a browser context

### Dependencies and Supply Chain

- use lockfile-based installs
- run npm and Python vulnerability audits in CI
- generate a dependency inventory or SBOM for release artifacts
- inspect licenses for shipped runtime dependencies
- pin GitHub Actions by immutable commit SHA before release automation is trusted
- review Electron, Chromium, Node, Python, PostgreSQL, Redis, and Celery support status at release time

## Privacy Rules

- collect no telemetry by default in Tier 1
- logs contain identifiers, state transitions, timings, and safe error codes, not raw prompts, transcripts, specs, images, or exports
- diagnostic export is user initiated and shows what will be included
- real designer data is prohibited in CI and evaluation fixtures
- local render and export assets have documented location, retention, backup, and deletion behavior
- paid/live provider use requires an explicit disclosure and separate approval

## Release-Blocking Findings

- any renderer access to Node or raw IPC
- missing sender validation on privileged IPC
- unrestricted permission requests or navigation
- exposed provider secret or credential
- unauthenticated non-loopback API exposure
- path traversal or arbitrary file opening
- high or critical exploitable dependency vulnerability without written acceptance
- sensitive content in default logs or CI artifacts

## Verification Evidence

- automated IPC negative tests using untrusted sender/frame cases
- CSP and navigation tests
- packaged fuse inspection
- secret scans of repository, logs, bundle, installer, and CI artifacts
- dependency audit reports
- loopback exposure check
- temporary-file cleanup test
- manual Electron security checklist with reviewer and evidence links

## Reference

The implementation review follows the current [Electron security checklist](https://www.electronjs.org/docs/latest/tutorial/security), including sender validation, custom protocols, restrictive permissions, current Electron versions, and package fuses.
