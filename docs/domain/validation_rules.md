# Validation Rules

Last updated: 2026-06-20

Status: Sprint 01 completed planning artifact.

## Purpose

Validation rules protect the dress spec from malformed, unsafe, unsupported, or ambiguous changes.

Validation is required before applying any design operation.

## Validation Philosophy

AI, imports, and user inputs are not automatically trusted.

The app should validate:

- dress specs
- model profiles
- design operations
- measurements
- locked field conflicts
- version metadata

## Validation Result Categories

Allowed outcomes:

- `accepted`
- `rejected`
- `needs_clarification`
- `no_op`

## General Operation Validation

Every operation must have:

- `operation_id`
- `type`
- `actor`
- `source`
- `target`
- `payload`
- `created_at`

Reject if:

- operation type is unknown
- required payload fields are missing
- target field path is invalid
- value does not match schema
- operation targets unsupported garment category
- operation conflicts with locked field

## Garment Category Validation

MVP supports only:

- `dress`

Reject:

- tops
- pants
- jackets
- activewear
- accessories
- unspecified non-dress categories

Clarify:

- Ambiguous phrases like "outfit", "look", "set", or "garment" when category is not clear.

## Field Path Validation

Field paths must refer to known paths in the schema.

Valid examples:

- `silhouette`
- `neckline.type`
- `fabric.primary.name`
- `color.primary_color.name`
- `measurements.dress_length`

Invalid examples:

- `moodboard`
- `pants.leg_shape`
- `neck.type`

Reject invalid paths with:

- `reason_code: unknown_field`

## Required vs Unknown

Required objects may contain unknown values.

Example:

- `closures` object is required.
- `closures.type` may be `unknown`.

Reason:

- Stable schema is better than missing objects.
- Unknown fields can be surfaced in export warnings.

## Status Validation

Allowed value statuses:

- `unknown`
- `assumed`
- `confirmed`

Rules:

- AI-inferred values should default to `assumed`.
- Designer-provided values may be `confirmed`.
- Missing undecided values should be `unknown`.

Reject:

- Any unrecognized status.

## Measurement Validation

Every numeric measurement must include:

- `value`
- `unit`
- `status`

Supported units:

- `in`
- `cm`

Reject:

- missing unit when value is numeric
- non-numeric value
- negative value
- unsupported unit

Flag or reject implausible ranges.

Initial reasonable body measurement guards:

- height: 36 to 96 in, or 90 to 245 cm
- bust: 20 to 80 in, or 50 to 205 cm
- waist: 18 to 80 in, or 45 to 205 cm
- hips: 20 to 90 in, or 50 to 230 cm

Initial reasonable garment measurement guards:

- dress length: 10 to 120 in, or 25 to 305 cm
- sleeve length: 0 to 60 in, or 0 to 155 cm
- train length: 0 to 180 in, or 0 to 460 cm

Sprint 01 note:

These are early guardrails, not final patternmaking standards.

## Locked Field Validation

Before applying an operation:

1. Normalize target field path.
2. Check exact locked path.
3. Check parent locked paths.
4. Reject if conflict exists.

Example:

- Locked path: `fabric`
- Operation target: `fabric.primary.name`
- Result: rejected

Reason code:

- `locked_field`

## Clarification Rules

Return `needs_clarification` when:

- target field is ambiguous
- measurement unit is missing
- operation affects multiple possible fields
- requested style is subjective without a concrete target
- AI confidence is too low
- command conflicts with locked fields but might indicate the user wants to unlock

Examples:

```text
"Make it more dramatic."
```

Clarify:

- More dramatic silhouette, color, embellishment, or length?

```text
"Shorten it by 2."
```

Clarify:

- 2 inches or 2 centimeters?

## Rejection Rules

Return `rejected` when:

- operation is unsupported
- field path does not exist
- value is invalid
- measurement range is impossible
- locked field conflict exists
- garment category is not supported

## No-Op Rules

Return `no_op` when:

- requested value already exists
- requested lock already exists with same reason
- requested unlock targets an already unlocked field and strict mode allows it

Sprint 01 recommendation:

- Prefer explicit no-op messages over silent success.

## Version Metadata Validation

Every new version must have:

- `version_id`
- `design_id`
- `version_number`
- `spec_snapshot`
- `change_summary`
- `created_by`
- `created_from`
- `created_at`

Reject version creation if:

- spec snapshot is missing
- change summary is empty
- version number is missing
- parent relationship is invalid

## Export Readiness Validation

This is not required for Sprint 01 implementation, but the schema should support it.

Blocking export warnings may include:

- missing required measurements
- unknown fabric
- unknown closure
- vague embellishment placement
- missing construction notes
- AI assumptions not confirmed

## Sprint 01 Boundary

This document defines validation rules only.

It does not implement:

- Zod schemas
- JSON Schema files
- TypeScript code
- backend validators
- database constraints
