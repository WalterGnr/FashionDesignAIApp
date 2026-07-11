# Sprint 10: Testing, Hardening, and MVP Release

Status: Planning completed. Implementation not started.

Suggested duration: 2 weeks.

Last updated: 2026-07-11

## Goal

Turn the implemented dress workflow into a repeatable, secure, observable, and installable Windows internal release candidate, with evidence for every quality claim and an honest boundary around what is not customer ready.

## Release Decision

Sprint 10 targets an **internal Windows alpha / MVP release candidate**.

It does not authorize an external customer release. The application currently depends on separately running FastAPI, PostgreSQL, Redis, and Celery services, uses a fixed development owner, and does not provide production live transcription. Those are explicit external-release blockers, not small-print limitations.

## Product Outcome

An approved internal tester can install a versioned Windows build, start the documented local service stack, complete the core dress workflow, recover from expected failures, and provide a diagnostic bundle that contains no secrets or design content by default.

## Core Workflow Under Test

1. Launch the desktop application and verify service readiness.
2. Create a dress design from a typed or sample voice command.
3. Review and apply validated structured operations.
4. Inspect the resulting dress spec and immutable version history.
5. View a nonblank spec-driven 3D preview.
6. Generate and compare deterministic mock concept renders.
7. Review production-readiness warnings.
8. Generate and open matching PDF and XLSX tech packs.
9. Restart the application and recover the persisted design context.

Step 9 is a release-blocking gap in the current desktop experience and must be implemented before the internal release candidate is approved.

## Workstreams

### 1. Test Foundation and CI

- Preserve the current 42 TypeScript tests, 12 default backend tests, and 3 PostgreSQL integration tests as the starting baseline.
- Add deterministic coverage for uncovered domain, AI, IPC, API, worker, export, and recovery behavior.
- Add Playwright Electron end-to-end tests for the packaged core workflow.
- Add canvas-pixel and responsive screenshot assertions at supported viewports.
- Add Windows packaging and clean-machine smoke jobs.
- Publish test reports, screenshots, traces, and installer checksums as CI artifacts.

### 2. Release-Blocking Product Hardening

- Add desktop design discovery, load, and selected-design recovery.
- Replace the shell-only health ping with API, database, Redis, and worker readiness reporting.
- Define bounded timeouts, retries, cancellation, and safe user messages for every remote or background operation.
- Add a top-level renderer error boundary and main-process error logging.
- Prevent duplicate actions during in-flight mutations and preserve idempotency keys.
- Verify graceful behavior when the backend, database, queue, worker, or network is unavailable.

### 3. Security and Privacy

- Validate the sender and frame origin for every privileged IPC handler.
- Add an explicit Electron permission request handler that permits microphone access only for the trusted app origin and denies all other permissions.
- Replace production `file://` loading with a restricted custom application protocol, or record a reviewed exception if that cannot be completed safely in this sprint.
- Review and tighten the production Content Security Policy.
- Flip appropriate Electron fuses during packaging and verify them in the packaged binary.
- Scan JavaScript and Python dependencies and block release on exploitable high or critical findings.
- Verify that API keys, database credentials, transcripts, design content, and generated assets are absent from logs and packaged files.

### 4. AI Quality Evaluation

- Create a versioned dress-command evaluation corpus with happy paths, ambiguity, corrections, locked fields, unsupported requests, and adversarial text.
- Run the deterministic interpreter and operation executor without network access.
- Measure schema validity, accepted-operation correctness, clarification correctness, locked-field protection, and unintended-change rate.
- Require exact passing results for safety invariants and approved thresholds for command interpretation.
- Keep live-provider evaluations separate, opt-in, budget-capped, and non-blocking for the internal alpha.

### 5. Windows Packaging and Release

- Use `electron-builder` with NSIS for the first Windows installer because it integrates directly with the existing electron-vite build and supports Windows signing.
- Build on a pinned GitHub Actions Windows runner and produce an installer plus SHA-256 checksum manifest.
- Keep automatic updates out of the first internal alpha; use manual versioned prereleases.
- Allow clearly labeled unsigned internal artifacts only for controlled testing.
- Require Azure Artifact Signing or another publicly trusted Authenticode identity before external distribution.
- Produce release notes, system requirements, setup steps, known limitations, rollback instructions, and a support bundle procedure.

## Acceptance Criteria

### Automated Quality

- All TypeScript and Python tests pass from a clean checkout.
- PostgreSQL migration upgrade and downgrade rehearsal passes against a disposable database.
- End-to-end tests pass on Windows for the packaged core workflow.
- The preview canvas is nonblank and materially changes for mapped spec edits.
- PDF and XLSX outputs pass structural and cross-format consistency checks.
- No flaky release-gate test is accepted; a quarantined test cannot satisfy a gate.

### Security

- Electron security checklist has evidence for every applicable item.
- Every privileged IPC call validates payload and sender.
- Permission requests default to deny.
- No secret is present in renderer globals, logs, artifacts, installer contents, or test reports.
- Dependency scans have no unaccepted high or critical vulnerability.
- Installer hash verification succeeds after artifact download.

### Reliability and Usability

- A tester can reopen a persisted design after restarting the app.
- Backend, database, queue, and worker failures produce distinct recovery guidance.
- Active render and export jobs can be resumed or rediscovered after restart.
- Core actions are keyboard accessible and visible text does not overlap at supported sizes.
- The app never claims that a concept render proves production accuracy.

### Release Evidence

- A release candidate is built from a tagged commit with a clean worktree.
- CI stores test reports, screenshots, traces, SBOM or dependency inventory, installer, and checksums.
- Two clean-machine installation and workflow checks pass on supported Windows versions.
- Known limitations and external-release blockers are visible in the release notes.
- The go/no-go checklist is signed off by engineering and product ownership.

## Explicit Non-Goals

- production authentication or multi-user authorization
- hosted backend deployment and cloud object storage
- production OpenAI Realtime transcription
- a paid image-generation acceptance run unless separately approved
- automatic updates
- Microsoft Store submission
- macOS or Linux packaging
- physically accurate cloth simulation, pattern generation, grading, or PLM integration

## Dependencies

- Sprint 01 through Sprint 09 implementations
- Windows 11 development and clean-test machines
- Docker Desktop for the internal local service stack
- GitHub Actions access for CI artifacts
- a signing identity only if a signed prerelease is requested

## Risks

- Packaging only Electron can create a misleading impression that the complete product is standalone.
- End-to-end tests can become flaky when worker timing is uncontrolled.
- A passing mock-provider suite does not prove live-provider quality.
- General design recovery is currently missing from the desktop workflow.
- Electron IPC sender validation and permission handling need additional hardening.
- Signing and SmartScreen behavior depend on publisher identity and distribution channel.

## Planning Documents

- `docs/release/README.md`
- `docs/release/mvp_scope_and_exit_criteria.md`
- `docs/release/test_strategy_and_ci_matrix.md`
- `docs/release/ai_evaluation_and_quality_gates.md`
- `docs/release/security_and_privacy_hardening.md`
- `docs/release/reliability_observability_and_error_handling.md`
- `docs/release/desktop_packaging_and_distribution.md`
- `docs/release/release_checklist_and_rollback.md`
- `docs/release/known_limitations.md`

## Senior Developer Note

Sprint 10 is not a ceremony that renames a prototype as an MVP. It is the point where claims become evidence, failures become understandable, and release boundaries become explicit.
