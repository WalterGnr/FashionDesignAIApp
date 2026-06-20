# Schema Validation Strategy

Last updated: 2026-06-20

Status: Sprint 01 learning note. This is not implementation.

## Purpose

Sprint 01 needs a validation strategy for dress specs, model profiles, and design operations.

The future code should use TypeScript types for development safety and runtime schemas for untrusted data.

## Why Static Types Are Not Enough

TypeScript helps while writing code, but it does not validate runtime data from:

- AI output
- API responses
- Imported files
- Saved JSON
- Future collaboration events

Runtime validation is required at these boundaries.

## Recommended Direction

Use Zod in the TypeScript domain package first.

Reasons:

- TypeScript-friendly.
- Runtime validation.
- Type inference from schema.
- Good fit for early domain modeling.

Future compatibility:

- Keep schemas JSON-compatible where practical.
- Generate or mirror JSON Schema for AI tools and backend contracts when needed.

## Boundary Validation Rules

Validate:

- Design operations before applying them.
- Dress specs before saving/exporting/importing.
- Model profiles before rendering.
- Version snapshots before restoration.

Do not trust:

- AI output
- User imports
- Network responses
- Local files

## Unknown, Assumed, and Confirmed Values

The schema should support value confidence/status:

- Unknown: value is missing or intentionally not known.
- Assumed: value was inferred and needs review.
- Confirmed: value was explicitly set or accepted.

This may be represented with metadata near the field or in a parallel assumptions list. Sprint 01 should decide which structure is cleaner.

## Measurement Validation

Every measurement should include:

- Value
- Unit
- Optional source/status

Supported units for MVP:

- inches
- centimeters

Validation should reject:

- Missing unit
- Non-numeric value
- Negative value
- Clearly impossible ranges
- Unsupported units

## Field Lock Validation

Before applying an operation:

1. Identify target field path.
2. Check whether target path or parent path is locked.
3. Reject or clarify if locked.
4. Preserve lock metadata in the next version.

## JSON Schema Compatibility Notes

Avoid TypeScript-only constructs that cannot serialize cleanly.

Prefer:

- Plain objects
- Strings
- Numbers
- Booleans
- Arrays
- Null only where meaningful
- Literal enums

Avoid:

- Functions in domain data
- Class instances as persisted state
- Dates without serialization rules
- `undefined` in persisted JSON

## Sprint 01 Validation Deliverables

When implementation starts, define validation for:

- `DressSpec`
- `ModelProfile`
- `DesignOperation`
- `LockedField`
- `DesignVersion`
- `Measurement`

## Official References

- Zod basics: https://zod.dev/basics
- JSON Schema getting started: https://json-schema.org/learn/getting-started-step-by-step
- TypeScript narrowing: https://www.typescriptlang.org/docs/handbook/2/narrowing.html
