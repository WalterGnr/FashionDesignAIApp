# MVP Scope and Exit Criteria

## Release Tiers

### Tier 0: Developer Build

Runs from source with developer tools. This is the current state and is not distributed.

### Tier 1: Internal Windows Alpha

The Sprint 10 target. Distributed only to approved testers, may use deterministic mock AI services, and requires the documented local backend stack.

### Tier 2: External Customer MVP

Not in Sprint 10. Requires authenticated users, hosted services, production voice, signed distribution, operational monitoring, data lifecycle controls, and support ownership.

## Tier 1 Supported Scope

- dresses only
- one local development identity
- typed design commands
- sample/local voice capture flow with user review before apply
- structured dress spec and validated operations
- immutable design versions
- interactive spec-driven 3D preview
- deterministic mock concept renders
- production-readiness checks
- PDF and XLSX tech-pack exports
- Windows 11 on x64 hardware

## Release-Blocking Gaps to Close in Sprint 10

| Gap | Required outcome |
| --- | --- |
| Desktop cannot discover and reopen designs | Add list/load/recover behavior using the existing backend resources |
| Shell health does not prove service readiness | Report API, database, queue, worker, and storage readiness separately |
| No packaged installer | Produce and smoke-test a versioned NSIS installer |
| No full workflow automation | Add Windows Playwright Electron coverage and packaged-app smoke tests |
| Incomplete Electron hardening | Validate IPC senders, deny permissions by default, review protocol/CSP/fuses |
| Limited diagnostics | Add redacted structured logs and a user-controlled diagnostic export |
| No release process | Add CI gates, artifact checksums, notes, rollback, and sign-off records |

## Go/No-Go Gates

### Gate A: Source Integrity

- tagged commit and clean worktree
- lockfiles committed and reproducible dependency install
- version agrees across desktop, backend, installer, and release notes
- migration head recorded

### Gate B: Functional Quality

- all automated suites pass
- the core workflow passes in a packaged application
- restart recovery passes
- generated PDF and XLSX refer to the same immutable version and snapshot hash

### Gate C: Safety and Security

- locked-field and unsupported-operation invariants pass
- no secret or sensitive design content leaks through artifacts or logs
- release-blocking security findings are closed or explicitly rejected by the owner with rationale

### Gate D: Operational Readiness

- service startup, failure, recovery, and shutdown instructions are verified
- diagnostic collection and issue template are tested
- backup/restore rehearsal succeeds for the internal test data set
- rollback procedure is rehearsed

### Gate E: Product Honesty

- mock and sample capabilities are labeled accurately
- concept images are never described as technical proof
- known limitations are included with the release
- Tier 2 blockers remain visible and are not waived by Tier 1 approval

## Supported Environment

- Windows 11, current supported updates, x64
- hardware acceleration available for the preferred preview path
- WebGL fallback remains usable when acceleration is unavailable
- Docker Desktop with PostgreSQL 17 and Redis 8 for the internal local stack
- sufficient disk space for installer, containers, generated images, and exports

Exact CPU, memory, GPU, and disk minimums will be measured during implementation and recorded from clean-machine tests. They must not be guessed in release notes.

## Exit Decision

Sprint 10 implementation is complete only when every Tier 1 gate has evidence. Any open blocker results in a no-go decision and a new candidate version after correction.
