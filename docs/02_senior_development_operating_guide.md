# Senior Development Operating Guide

Last updated: 2026-06-19

Purpose: define how development should be approached on this project so it grows into serious software instead of a fragile prototype.

## Engineering Posture

This project needs the mindset of a professional creative production tool. The app should feel fast and fluid for designers, but its internal systems must be structured, testable, auditable, and production-aware.

The guiding balance:

- Speed for company production workflows.
- Control for the designer.
- Traceability for manufacturing.
- Safety around AI output.

## Core Technical Beliefs

### 1. The Dress Spec Is the Source of Truth

The app must not depend on generated images as the main design record.

Every design should be represented as structured data:

- Silhouette
- Neckline
- Sleeve shape
- Length
- Fabric
- Color
- Measurements
- Embellishments
- Construction notes
- Pattern notes
- Locked fields
- Version metadata

Images, 3D previews, PDFs, and spreadsheets are outputs from the spec.

### 2. AI Suggests, Software Validates

AI should not directly write final production data without validation.

The safe flow:

1. User speaks or types.
2. AI interprets intent.
3. AI returns structured operation.
4. App validates operation.
5. App applies operation to the spec.
6. App saves a new version.
7. Preview/export systems render from saved data.

### 3. Versions Are Immutable

Designers need freedom to explore. The software must make it easy to go back.

Rule:

- A saved design version should never be silently overwritten.
- New meaningful changes create new versions.
- Current design points to a selected version.
- Exports must reference the exact version they came from.

### 4. Fast Preview Beats Perfect Rendering in the MVP

The MVP should prioritize quick feedback.

The initial preview only needs to communicate major design properties:

- Color
- Silhouette
- Dress length
- Sleeve type
- Neckline
- Approximate model proportions

Physically accurate fabric draping can come later.

### 5. Production Readiness Is Separate From Visual Beauty

A beautiful render does not prove manufacturability.

The app should eventually score or flag production risks:

- Fabric does not match intended drape.
- Construction detail is underspecified.
- Measurements are incomplete.
- Embellishments increase labor complexity.
- Pattern details are missing.

## Documentation Rules

### Always Document

Important decisions should be recorded in Markdown.

Recommended documentation folders:

- `docs/`
- `docs/architecture/`
- `docs/api/`
- `docs/database/`
- `docs/ai/`
- `docs/product/`

### Architecture Decision Records

Use ADRs for major decisions.

Example decisions:

- Electron vs Tauri
- FastAPI vs Node backend
- PostgreSQL schema strategy
- Zustand vs Redux Toolkit
- Three.js preview strategy
- OpenAI Realtime voice strategy

ADR format:

```md
# ADR 0001: Decision Title

Date:
Status: Proposed | Accepted | Superseded

## Context

## Decision

## Consequences

## Alternatives Considered
```

### Documentation Must Stay Close To Code

When we create a subsystem, we document:

- What it does
- Why it exists
- Public interfaces
- Data contracts
- Known limitations
- Test strategy

## Coding Rules

### TypeScript

- Use strict mode.
- Use shared domain types.
- Avoid `any`.
- Prefer discriminated unions for design operations.
- Validate external data at boundaries.

### React

- Keep visual components presentational where possible.
- Move domain logic into services/stores.
- Keep state predictable.
- Avoid hiding important workflow state inside deeply nested components.

### Electron

- Keep renderer unprivileged.
- Use preload bridge for limited APIs.
- Keep IPC channels typed.
- Validate IPC inputs.
- Never expose backend secrets to renderer.

### Backend

- Keep route handlers thin.
- Put business logic in services.
- Use Pydantic schemas for request/response validation.
- Use migrations for schema changes.
- Log job state and AI decisions enough to debug issues.

### Database

- Use relational tables for stable entities.
- Use JSONB for flexible spec sections.
- Add indexes based on real query patterns.
- Keep immutable version records.
- Use foreign keys for traceability.

## AI Rules

### AI Output Validation

All AI responses that affect design state should be parsed and validated.

Reject:

- Invalid JSON
- Unknown operation names
- Operations on locked fields
- Measurements outside reasonable ranges
- Fabric choices incompatible with required constraints, when known

Clarify:

- Ambiguous garment terms
- Missing measurement units
- Contradictory commands
- Commands that affect multiple locked fields

### Prompting Strategy

Prompts should emphasize:

- Preserve locked fields.
- Make minimal changes.
- Return structured operations only when asked.
- Ask clarifying questions when needed.
- Do not invent measurements without marking them as assumptions.

### AI Evaluation Set

Maintain a test set of fashion design commands.

Examples:

- "Make it a red satin evening gown."
- "Shorten the sleeves but keep the neckline."
- "Use the fabric from version 3."
- "Make it more dramatic without changing the silhouette."
- "Add pearl trim around the neckline."
- "No, undo that and make the bodice fitted."

Each example should define expected structured operations.

## Testing Rules

### Unit Tests

Required for:

- Dress spec updates
- Design operation validation
- Locked field behavior
- Version creation
- Measurement conversions
- Cost calculations
- AI output parsing

### Integration Tests

Required for:

- Saving design versions
- Re-rendering a design on a model profile
- Creating render jobs
- Creating tech packs
- API validation errors

### End-to-End Tests

Required for:

- Designer creates a design
- Designer edits via voice/text command
- Designer views version history
- Designer reverts to an earlier version
- Designer exports a tech pack

### Visual/Canvas Tests

Required for:

- Preview is not blank.
- Preview changes after spec changes.
- Model profile changes affect the preview.
- UI controls do not overlap the canvas.

## Security Rules

### Secrets

- Never put API keys in frontend code.
- Never commit `.env` files with real secrets.
- Use backend session brokering for AI services.

### User Files

- Treat uploaded references as untrusted files.
- Validate file type and size.
- Store files outside executable paths.
- Avoid loading arbitrary local files into privileged contexts.

### Desktop App

- Disable unnecessary Electron capabilities.
- Keep dependencies updated.
- Review Electron security checklist before packaging.

## Product Quality Rules

### Designer Control

The designer must be able to:

- See what changed.
- Undo changes.
- Lock important details.
- Compare versions.
- Correct AI misunderstandings.

### Production Traceability

Every export should answer:

- Which design?
- Which version?
- Which model profile?
- Which render?
- Which measurements?
- Which material assumptions?

### Fast Interaction

The app should feel responsive even when expensive AI jobs are running.

Use:

- Immediate spec update
- Fast preview
- Background render queue
- Progress states
- Non-blocking exports

## Initial Definition of Done

A feature is not done until:

- It has typed data contracts.
- It is documented if it affects architecture or workflow.
- It has tests appropriate to its risk.
- It handles error cases.
- It preserves design version traceability.
- It does not expose secrets.
- It does not make AI output the unchecked source of truth.

## Early Project Red Flags

Watch for:

- Image generation becoming the main design record.
- No immutable version history.
- Loose unvalidated JSON stored everywhere.
- AI prompts scattered across the codebase.
- Electron renderer having direct access to secrets or filesystem APIs.
- No tests for spec updates.
- Tech pack exports not tied to exact versions.
- UI hiding what the AI changed.

## Working Agreement

When development starts, I should:

1. Read the project plan and docs first.
2. Explain major architectural moves before making them.
3. Keep changes scoped.
4. Document decisions.
5. Build in small verifiable slices.
6. Run tests or explain why they could not run.
7. Protect the user's existing files and changes.

This operating guide should be updated as the project matures.
