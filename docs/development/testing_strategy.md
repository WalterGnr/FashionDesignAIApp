# Testing Strategy

Last updated: 2026-06-19

Status: Sprint 00 foundation document.

## Testing Philosophy

The most important parts of this product are not the prettiest parts. The core risk is that AI changes a design incorrectly, loses traceability, or produces production-facing information that cannot be trusted.

Testing should focus first on:

- Garment spec validation
- Design operation application
- Locked fields
- Version creation
- AI output parsing
- Database traceability
- Export determinism

## Planned Test Layers

### Unit Tests

Future tools:

- Vitest for TypeScript domain logic
- pytest for Python backend logic

Primary coverage:

- Dress spec updates
- Design operation validation
- Locked field behavior
- Measurement conversions
- Version metadata creation
- Cost calculations when added
- AI response parsing

### Integration Tests

Future tools:

- pytest
- FastAPI TestClient
- Test database

Primary coverage:

- Create design
- Save immutable version
- Save model profile
- Link render to design version and model profile
- Create tech pack export record
- Reject invalid AI operation

### End-to-End Tests

Future tool:

- Playwright

Primary coverage:

- Start a design
- Apply command
- Review changed fields
- Lock a field
- Attempt conflicting command
- View version history
- Revert to earlier version
- Export tech pack

### Visual Tests

Future tool:

- Playwright screenshots

Primary coverage:

- Preview canvas is not blank.
- Preview changes after spec changes.
- Model profile changes affect proportions.
- UI controls do not overlap at common screen sizes.

## AI Evaluation Set

Maintain examples of designer commands with expected structured operations.

Example categories:

- Simple creation command
- Single-field edit
- Multi-field edit
- Locked-field conflict
- Ambiguous instruction
- Correction command
- Version reference
- Variation request

The evaluation set should live under `tests/fixtures` or `docs/ai` once implementation begins.

## Release Quality Bar

The MVP should not be considered ready unless:

- Core domain tests pass.
- Backend API tests pass.
- Critical UI flow passes.
- Preview is visually verified.
- Tech pack export is tied to an immutable version.
- Secrets are not exposed in frontend code.

## Sprint 00 Non-Goal

No tests are implemented in Sprint 00 because no application code exists yet. This document defines the future quality bar.
