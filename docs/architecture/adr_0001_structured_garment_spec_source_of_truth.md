# ADR 0001: Structured Garment Spec Is the Source of Truth

Date: 2026-06-19

Status: Accepted

## Context

The product needs to help designers create dress designs quickly with AI while preserving technical accuracy and production traceability. If the app treats generated images as the primary design record, edits may become inconsistent, manufacturing data may be incomplete, and designers may lose control over what changed.

## Decision

The structured garment spec will be the source of truth for the MVP and future production workflows.

Voice commands, AI interpretation, visual preview, image generation, version history, and tech pack exports must either update or read from structured garment data.

## Consequences

Positive:

- Designs can be versioned and compared.
- AI output can be validated before being applied.
- Production documents can be generated from deterministic data.
- The same dress can be rendered on different model profiles.
- Future database queries and manufacturing workflows become possible.

Negative:

- We must design a domain model before visual polish.
- The first preview may feel less magical than pure image generation.
- Some creative nuance will require careful schema design.

## Alternatives Considered

### Image-first design

Rejected for MVP because it would make technical accuracy, edit consistency, versioning, and manufacturing export too fragile.

### Prompt-only design record

Rejected because free text prompts are hard to validate, query, export, or turn into production instructions.

## Review Trigger

Revisit only if a future garment CAD or simulation system becomes the canonical source while still preserving structured exportable data.
