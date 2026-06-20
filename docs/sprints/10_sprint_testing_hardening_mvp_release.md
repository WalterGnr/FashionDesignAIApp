# Sprint 10: Testing, Hardening, and MVP Release Planning

Status: Planning only.

Suggested duration: 1 to 2 weeks.

## Goal

Plan the testing, security, packaging, and release-readiness work needed before calling the first version an MVP.

## Why This Sprint Matters

The app deals with designer work, AI decisions, local desktop access, voice input, and production documentation. It must be trustworthy, not just functional.

## Primary Deliverables

- Test plan
- AI evaluation set plan
- Security checklist
- Error handling checklist
- MVP release checklist
- Packaging and distribution plan
- Known limitations document

## Key Planning Tasks

- Define unit test coverage:
  - Garment spec updates
  - Operation validation
  - Locked fields
  - Version creation
  - AI output parsing
- Define integration tests:
  - Save design
  - Save version
  - Link model profile
  - Create render job
  - Export tech pack
- Define E2E tests:
  - Create a design
  - Edit design by command
  - View version history
  - Revert version
  - Export tech pack
- Define visual tests:
  - Preview is not blank
  - Preview changes after spec changes
  - UI does not overlap at common screen sizes
- Define release checklist.
- Define known limitations for MVP.

## Non-Goals

- No tests written yet.
- No packaging performed.
- No release build.
- No deployment.

## Acceptance Criteria

- MVP quality bar is defined.
- Known limitations are documented.
- Security review areas are listed.
- The release is not considered done without tests and traceability.

## Risks

- AI workflows can be hard to test deterministically.
- Desktop packaging can reveal late environment issues.
- Skipping security review could expose secrets or local file risks.

## Senior Developer Notes

Testing should focus hardest on the design-state engine, AI operation validation, versioning, and export traceability. Those are the bones of the product.
