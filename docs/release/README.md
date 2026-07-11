# Sprint 10 Release Readiness

Status: Planning completed. Implementation not started.

Last updated: 2026-07-11

## Purpose

This folder is the implementation memory for Sprint 10. It defines what will be tested, hardened, packaged, and approved before the project is called an internal Windows release candidate.

## Release Tier

The Sprint 10 target is an internal Windows alpha / MVP release candidate for controlled testers.

An external customer release remains blocked by production identity, hosted infrastructure, production voice transcription, public code signing, operational ownership, and privacy/legal review.

## Documents

- `mvp_scope_and_exit_criteria.md`: release tiers, supported workflow, and go/no-go gates
- `test_strategy_and_ci_matrix.md`: test pyramid, CI jobs, environments, artifacts, and flake policy
- `ai_evaluation_and_quality_gates.md`: deterministic command corpus, metrics, and AI safety gates
- `security_and_privacy_hardening.md`: Electron, API, secret, dependency, and privacy controls
- `reliability_observability_and_error_handling.md`: health, failure behavior, logs, recovery, and diagnostics
- `desktop_packaging_and_distribution.md`: Windows installer, signing, versioning, and release channel
- `release_checklist_and_rollback.md`: executable release procedure and rollback rules
- `known_limitations.md`: current product boundaries and external-release blockers

## Evidence Rule

No release gate is satisfied by a statement alone. Each gate must link to a test report, CI run, screenshot, trace, scan result, signed review, or reproducible manual verification record.

## Decision Log

- Windows is the only supported Sprint 10 desktop platform.
- The internal alpha may require Docker Desktop and the local service stack.
- `electron-builder` plus NSIS is the selected packaging path.
- Automatic updates are deferred; internal releases use versioned GitHub prerelease artifacts.
- Mock render generation is the deterministic release gate. Live paid rendering requires separate approval and is not evidence for deterministic correctness.
- The app cannot be presented as customer ready while it uses a fixed development owner or sample/local voice transcription.

## Official References

- [Electron security guidance](https://www.electronjs.org/docs/latest/tutorial/security)
- [Electron distribution overview](https://www.electronjs.org/docs/latest/tutorial/distribution-overview)
- [electron-vite distribution guide](https://electron-vite.org/guide/distribution)
- [Playwright Electron API](https://playwright.dev/docs/api/class-electron)
- [GitHub Actions workflow artifacts](https://docs.github.com/en/actions/concepts/workflows-and-actions/workflow-artifacts)
- [Microsoft SmartScreen guidance](https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/smartscreen-reputation)
