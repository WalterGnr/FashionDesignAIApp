# Release Checklist and Rollback

## Candidate Preparation

- [ ] Select the candidate commit from a clean protected branch
- [ ] Set and verify the semantic version everywhere
- [ ] Record database migration head and supported downgrade target
- [ ] Freeze scope; defer unrelated changes
- [ ] Confirm release notes and known limitations match actual behavior
- [ ] Confirm external-release blockers are visible

## Automated Gates

- [ ] TypeScript typecheck, tests, and production build pass
- [ ] Python lint, tests, and coverage pass
- [ ] PostgreSQL integration and migration rehearsal pass
- [ ] Redis/Celery retry, cancellation, and recovery tests pass
- [ ] AI deterministic evaluation meets every threshold
- [ ] Electron E2E and visual matrix pass twice
- [ ] PDF/XLSX structure and consistency tests pass
- [ ] Dependency, secret, and package-content scans pass
- [ ] Windows installer smoke test passes

## Manual Verification

- [ ] Complete core workflow on two clean Windows machines
- [ ] Verify keyboard navigation, focus, contrast, clipping, and scaling
- [ ] Verify WebGL preferred path and fallback
- [ ] Rehearse backend, database, queue, worker, and disk failure messages
- [ ] Verify restart recovery for design and active jobs
- [ ] Inspect every PDF page and XLSX worksheet from the release fixture
- [ ] Verify logs and diagnostic bundle contain no sensitive content
- [ ] Verify installer checksum after download
- [ ] Verify uninstall and retained-data behavior

## Approval Record

Record in the release issue:

- version, tag, commit, build run, migration head
- installer filename, size, SHA-256, and signature status
- test/evaluation/security report links
- clean-machine testers and Windows versions
- accepted limitations and residual risks
- engineering approval
- product-owner approval
- decision: go, no-go, or internal-only exception

## Distribution

- [ ] Create a GitHub prerelease, not a general release
- [ ] Attach installer, checksum, notes, requirements, and limitations
- [ ] Label unsigned builds prominently when applicable
- [ ] Provide verified local service startup and shutdown instructions
- [ ] Retain the previous approved installer and schema backup instructions
- [ ] Open the support/issue intake channel before sharing the build

## Rollback Triggers

Rollback immediately for:

- data loss, version-history corruption, or broken migration
- ability to bypass locked fields or ownership boundaries
- secret exposure or arbitrary file/shell execution
- installer corruption, signature failure, or widespread launch failure
- incorrect tech-pack identity or silent production-data fabrication
- unrecoverable render/export queue duplication or loss

## Rollback Procedure

1. Stop distribution and mark the prerelease withdrawn.
2. Preserve logs and artifacts without collecting design content unnecessarily.
3. Notify testers with the affected version, impact, and safe immediate action.
4. Stop workers before database changes when job consistency is involved.
5. Back up the database and asset directories.
6. Restore the previous approved application version.
7. Apply a database downgrade only if the migration was explicitly tested as reversible and no newer data would be lost.
8. Otherwise roll forward with a corrective migration.
9. Verify design/version counts, job states, asset checksums, and core workflow.
10. Add regression tests and issue a new candidate version. Never replace an existing artifact in place.

## Incident Record

Every rollback creates a short incident record with timeline, user impact, technical cause, detection gap, corrective action, tests added, and release-process change.
