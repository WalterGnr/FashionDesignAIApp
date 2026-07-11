# Test Strategy and CI Matrix

## Principles

- Test the structured spec and operations most deeply because they are the source of truth.
- Keep network-free deterministic tests as the default.
- Exercise PostgreSQL and worker behavior in integration lanes.
- Use end-to-end tests for user outcomes, not every input combination.
- Treat visual checks as measurable evidence: screenshots, canvas pixels, dimensions, and output rendering.
- Never hide flakiness with automatic retries in release-gate reporting.

## Starting Baseline

At the end of Sprint 09 the repository has:

- 42 TypeScript tests across domain, AI, and desktop packages
- 12 default FastAPI/backend tests
- 3 PostgreSQL integration tests
- production desktop build verification
- manual responsive, PDF, XLSX, and live worker verification

Sprint 10 expands this baseline without replacing useful focused tests.

## Test Layers

| Layer | Primary scope | Tool | Release gate |
| --- | --- | --- | --- |
| Domain unit | schemas, operations, locks, versions, normalization | Vitest | Yes |
| AI contract | parsing, clarification, unsupported requests, safety invariants | Vitest | Yes |
| Desktop unit | sessions, IPC contracts, recovery state, polling | Vitest | Yes |
| API unit | validation, ownership, readiness, error mapping | pytest/TestClient | Yes |
| PostgreSQL integration | constraints, migrations, idempotency, immutability | pytest/PostgreSQL | Yes |
| Worker integration | outbox, Redis dispatch, retry, cancel, restart recovery | pytest/Redis/Celery | Yes |
| Electron E2E | core user workflow and degraded states | Playwright Electron | Yes |
| Visual | responsive UI, nonblank canvas, preview change | Playwright screenshots/pixels | Yes |
| Export | PDF render, workbook structure, cross-format identity | pytest plus render/parsers | Yes |
| Package smoke | install, launch, version, uninstall, artifact hash | PowerShell/Playwright | Yes |
| Live providers | OpenAI image or realtime service | opt-in harness | No for Tier 1 |

## Required End-to-End Scenarios

1. Fresh launch reports the local service state accurately.
2. A typed command creates a dress and a validated immutable version.
3. A second command changes only intended fields and updates the preview.
4. Ambiguous input asks for clarification without mutating state.
5. Unsupported input is rejected safely.
6. The sample voice path creates a reviewable final transcript before applying it.
7. Restarting the app restores or lets the user reopen the persisted design.
8. Mock concept renders complete, display, compare, cancel, and rediscover after restart.
9. Export readiness blocks unsafe completion until draft acknowledgement where allowed.
10. PDF and XLSX exports open and contain matching IDs, revision, warnings, and snapshot hash.
11. Backend, worker, and database outages show distinct, actionable states and recover after restoration.
12. The preview fallback appears when WebGL is unavailable.

## Visual Matrix

Test at minimum:

- 1024 x 720, minimum supported window
- 1360 x 860, default window
- 1920 x 1080, common desktop
- 2560 x 1440, high-resolution desktop
- Windows display scaling at 100% and 150% on a clean machine

Assertions cover no incoherent overlap, no clipped controls, keyboard focus visibility, readable dialogs, stable canvas dimensions, nonblank canvas pixels, and meaningful preview differences after mapped changes.

## CI Jobs

### `quality-typescript`

- clean npm install from lockfile
- typecheck
- domain, AI, and desktop tests
- production build
- dependency audit

### `quality-python`

- Python 3.12 environment
- Ruff format/lint check
- default pytest suite with coverage report
- Python dependency audit

### `integration-services`

- PostgreSQL 17 and Redis 8 service containers on Linux
- apply migrations from empty database
- PostgreSQL and worker integration tests
- migration downgrade and re-upgrade rehearsal

### `windows-e2e`

- Windows runner
- deterministic local services or controlled test doubles
- Playwright Electron workflow and visual tests
- upload traces and screenshots on failure

### `windows-package`

- build NSIS installer from the tested commit
- inspect packaged contents for forbidden files and secrets
- verify Electron fuses
- install, launch, version-check, and uninstall smoke tests
- publish installer and SHA-256 manifest as retained artifacts

## Flake Policy

- A release-gate test must pass twice consecutively on the candidate commit.
- CI retries may collect diagnostic evidence but do not convert an initial failure into a pass.
- Quarantined tests require an owner, issue, reason, and expiration date.
- A quarantined test cannot cover a release-blocking requirement.
- Time-based worker tests use controlled polling deadlines and deterministic provider behavior.

## Coverage Policy

Coverage percentage is a diagnostic, not the goal. The required target is complete behavioral coverage of:

- operation validation and locked-field protection
- immutable version creation and conflict handling
- AI schema validation and clarification
- ownership checks
- render/export idempotency, retry, cancellation, and traceability
- restart recovery
- privileged IPC validation

Initial line/branch thresholds will be recorded after the first Sprint 10 coverage run, then ratcheted upward. Existing coverage cannot decrease without written justification.

## Test Data

- use synthetic dress names, measurements, transcripts, and assets
- never place real designer work or API keys in fixtures
- seed deterministic UUIDs and timestamps where comparisons require stability
- version all golden fixtures and record the schema/contract version
- review golden updates as product changes, not mechanical snapshots
