# Export Readiness And Missing Data

Last updated: 2026-07-09

Status: Sprint 09 planning artifact.

## Readiness States

- `ready`: required MVP fields are confirmed and no blocking issue exists
- `ready_with_warnings`: usable review pack, with assumptions or optional production details missing
- `blocked`: required identity, sizing, material, or construction information is absent or invalid

The user may export a clearly watermarked `draft` pack from a blocked state only after acknowledging the issue list. It must not be labeled production ready.

## MVP Blocking Checks

- selected design version exists and belongs to the owner
- garment category is `dress`
- schema version is supported
- dress type or silhouette is known
- primary color is known
- primary fabric name/type is known
- dress length category is known
- bust, waist, hip, and dress length measurements have numeric values and units for a production-ready pack
- closure and lining intent are known or explicitly not applicable
- at least one construction note exists for a production-ready pack

## Warning Checks

- assumed rather than confirmed values
- mixed measurement units
- unknown tolerances
- no approved visual reference
- unspecified fabric fiber, weight, stretch, or drape
- missing trim supplier/SKU/consumption/cost
- unsupported or conflicting fit notes
- concept render belongs to a different version
- unresolved domain warnings or assumptions

## Issue Contract

Each issue contains:

- stable code
- severity: blocker or warning
- field path
- short manufacturer-facing message
- remediation hint
- source status

Issue codes are versioned so tests and UI do not depend on display wording.

## Honest Defaults

- Blank means unknown, never zero.
- `Not applicable` requires an explicit state, not an empty value.
- Estimated consumption and cost are excluded until a supported calculator exists.
- A model-profile body measurement is not silently substituted for a finished-garment measurement.
- AI-generated values remain assumed until a designer confirms them.
