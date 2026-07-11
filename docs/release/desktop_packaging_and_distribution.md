# Desktop Packaging and Distribution

## Decision

Use `electron-builder` with the NSIS target for the Sprint 10 Windows package.

This matches the existing electron-vite build without introducing a second application bundler. The electron-vite distribution guide documents direct electron-builder integration, and electron-builder supports NSIS artifacts and Windows signing.

## Artifact Set

- versioned x64 Windows installer
- SHA-256 checksum manifest
- release notes
- system requirements and local service setup guide
- known limitations
- test and security evidence summary
- dependency inventory or SBOM

Portable archives are optional diagnostic artifacts and are not the supported install path.

## Package Configuration

Implementation must define:

- stable application ID and product name
- semantic version copied consistently into desktop, backend, and release metadata
- Windows icon resources at required sizes
- `asar` packaging with an explicit allowlist of shipped files
- no source maps, `.env` files, credentials, tests, local data, or development tools in production artifacts
- NSIS per-user installation by default unless a tested requirement demands elevation
- deterministic artifact naming with version and architecture
- uninstall behavior and application-data retention policy
- package-time Electron fuse configuration

## Runtime Boundary

The installer packages the Electron desktop only. It does not hide or silently install PostgreSQL, Redis, Celery, or the FastAPI service.

Internal testers receive a documented local service setup and readiness check. This is acceptable for Tier 1 only. A customer-ready installer requires either a hosted authenticated backend or a deliberately designed bundled local runtime, which is a separate architecture decision.

## Signing

### Internal Alpha

An unsigned installer may be used only in a controlled group and must be labeled `UNSIGNED INTERNAL TEST BUILD`. Testers verify its SHA-256 checksum from a separate trusted channel.

### External Distribution

External artifacts require a publicly trusted Authenticode signature. The preferred current path is Azure Artifact Signing, subject to identity eligibility and account approval. Signing credentials remain in protected CI secrets and are never stored in the repository.

Code signing establishes publisher and integrity evidence, but Microsoft SmartScreen can still warn for newly distributed file hashes. Release communication must not promise warning-free first installs.

## Release Channel

- GitHub prerelease artifacts for Tier 1
- manual update installation for the first alpha
- no in-app auto-update in Sprint 10
- immutable version tags and release artifacts
- previous approved installer retained for rollback

Automatic updates are deferred until signing, hosted release metadata, integrity verification, rollback, and update testing are complete.

## CI Build Rules

- build Windows artifacts on a Windows runner
- use clean dependency installation from lockfiles
- package only after source quality and integration gates pass
- inspect installer contents for forbidden files and secrets
- verify executable metadata, app version, fuses, checksum, install, launch, and uninstall
- upload artifacts with restricted retention and release only after approval
- pin third-party CI actions by commit SHA

## Clean-Machine Test

Test on at least two clean, supported Windows 11 environments:

1. verify installer checksum
2. install as a standard user
3. launch without development tools
4. confirm expected service-not-ready guidance before local services start
5. start the documented service stack
6. complete the core workflow
7. restart the app and reopen the design
8. open generated PDF and XLSX files
9. uninstall and verify the documented data-retention behavior

## References

- [electron-vite distribution](https://electron-vite.org/guide/distribution)
- [electron-builder Windows signing](https://www.electron.build/code-signing-win.html)
- [Microsoft SmartScreen reputation](https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/smartscreen-reputation)
