# Reliability, Observability, and Error Handling

## Reliability Objective

A designer must never lose track of which immutable version produced a preview, render, or export. Failures must be recoverable without duplicating paid work or silently changing the design.

## Health Model

Replace the current shell-only ping with separate states:

| Component | Ready means | User action when unavailable |
| --- | --- | --- |
| Desktop shell | preload and IPC contract respond | restart app or collect diagnostics |
| API | versioned health endpoint responds | start/restart local service |
| PostgreSQL | API query succeeds and migration head matches | start database or run migration repair |
| Redis | queue connection responds | start Redis |
| Worker | heartbeat is recent and queue is consumable | start/restart worker |
| Render storage | write/read probe succeeds | repair path/permissions/disk space |
| Export storage | write/read probe succeeds | repair path/permissions/disk space |

Health responses must not expose credentials, paths outside safe diagnostics, or stack traces.

## Failure Classes

- validation: user input or generated operation is invalid
- conflict: selected version is stale or parent no longer current
- unavailable: API, database, queue, worker, or provider cannot be reached
- timeout: operation exceeded its bounded wait time
- rate/cost limit: provider or local budget denied work
- asset invalid: type, size, checksum, or decode validation failed
- permission: microphone, filesystem, or OS action was denied
- internal: unexpected failure with a correlation ID and safe message

Each class has a stable machine code, plain-language message, retry policy, and diagnostic context.

## Retry and Idempotency

- validation, permission, and permanent asset failures are never retried automatically
- transient API reads use bounded exponential backoff with jitter
- mutations use idempotency keys and are retried only when duplicate execution is safe
- worker retries remain bounded and record each attempt
- cancellation is best effort and reports whether work had already completed
- renderer polling stops on terminal state, unmount, or a documented deadline
- restart recovery lists existing active jobs instead of creating replacements

## Persistence and Recovery

Sprint 10 must add:

- design list and load through existing owner-scoped API resources
- last selected backend design ID stored in a non-sensitive local preference
- safe fallback to a design picker when the saved ID is missing or inaccessible
- active render/export rediscovery for the selected version
- stale local-session detection and conflict guidance
- backup and restore instructions for PostgreSQL and local asset directories

The backend remains the authority for persisted versions and jobs. Local preferences may point to data but must not replace it.

## Logging

Use structured JSON lines for backend/worker logs and structured local records for Electron main-process events.

Allowed by default:

- timestamp, severity, component, app version, environment
- correlation/request/job/design/version IDs
- operation name, state transition, duration, safe error code
- dependency readiness and retry count

Disallowed by default:

- API keys, tokens, passwords, connection strings
- raw transcripts or prompts
- complete garment specs
- base64 images, PDF/XLSX contents, or filesystem contents
- stack traces in user-visible messages

## Diagnostic Bundle

A user-initiated bundle may include app/backend versions, OS version, health summary, migration head, redacted recent logs, configuration key names without values, and checksums. It excludes design content and generated assets unless the user explicitly opts in after seeing the file list.

## Performance Budgets

Measure on the clean test machine and fail regressions against the recorded baseline:

- app window visible and interactive time
- typed command interpretation/application time
- preview update time after an accepted operation
- API p95 latency for local CRUD reads/writes
- mock render and tech-pack queue-to-completion time
- idle CPU and memory
- renderer bundle size and installer size

The first implementation run establishes numeric budgets. Release notes must report measured values, not estimates.

## Recovery Drills

- API stopped during read and during mutation
- PostgreSQL stopped and restarted
- Redis stopped with queued work
- worker killed during render and export
- app closed during active jobs
- malformed or missing asset file
- disk full or unwritable storage path
- duplicate create request
- stale selected version conflict
- corrupted local preference

Each drill must demonstrate safe state, understandable messaging, and successful recovery or explicit escalation.
