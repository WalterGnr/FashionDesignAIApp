# Validation and Clarification Rules

Last updated: 2026-07-05

Status: Sprint 02 planning artifact.

## Purpose

Define how AI-proposed design operations should be validated, rejected, clarified, or accepted.

This document extends the Sprint 01 validation rules specifically for AI command interpretation.

## Validation Pipeline

```text
AI response
  -> parse
  -> schema validation
  -> operation contract validation
  -> domain validation
  -> lock validation
  -> version behavior validation
  -> accepted, rejected, needs_clarification, or no_op
```

## Result Categories

Allowed outcomes:

- `accepted`
- `rejected`
- `needs_clarification`
- `no_op`

No design version should be created until an operation is accepted.

## Parse Validation

Reject if:

- AI output is not parseable
- output is not an object
- output contains multiple top-level result types
- output omits required discriminator fields

Error code:

- `ai_parse_error`

## Schema Validation

Reject if:

- result type is unknown
- operation type is unknown
- required payload fields are missing
- unexpected properties are present in strict mode
- confidence is missing or outside `0` to `1`
- operation target is missing

Error codes:

- `schema_violation`
- `missing_required_payload`
- `unknown_operation_type`

## Domain Validation

Reject if:

- target field path does not exist
- value is outside allowed enum
- garment category is not `dress`
- operation attempts to modify unsupported MVP category
- detail shape is incomplete
- measurement is invalid
- revert target is invalid
- variation parent version is invalid

Error codes:

- `unknown_field`
- `invalid_value`
- `unsupported_category`
- `invalid_measurement`
- `invalid_version_reference`

## Lock Validation

Reject if:

- operation targets a locked field
- operation targets a child of a locked parent
- AI proposes unlocking a field without explicit user request

Error code:

- `locked_field`

Clarify if:

- user wording implies they may want to override a lock
- the command combines locked and unlocked changes

Example:

```text
The neckline is locked. Do you want to unlock it before changing it to sweetheart?
```

## Confirmation Status Validation

AI may mark a value as `confirmed` only when it is directly stated by the designer.

Examples:

```text
Designer says: Make it red.
color.primary_color.name = red confirmed
```

```text
Designer says: Make it elegant.
silhouette = mermaid confirmed
```

The second example should be rejected or clarified. The designer did not specify mermaid.

AI-inferred values should be:

- `assumed`
- added to assumptions
- shown to the designer later

## Measurement Clarification Rules

Needs clarification when:

- numeric value has no unit
- command says "a bit", "slightly", "much shorter", or other non-numeric adjustment without an established default
- target measurement is unclear
- measurement would create implausible result

Examples:

```text
Shorten it by 2.
```

Clarify:

```text
Should the dress be shortened by 2 inches or 2 centimeters?
```

```text
Make the waist 10 inches.
```

Reject or warn:

```text
That waist measurement appears implausible. Please confirm the intended value and unit.
```

## Subjective Language Clarification

Needs clarification when the command is subjective and not tied to a field.

Examples:

- "Make it more dramatic."
- "Make it prettier."
- "Make it more luxury."
- "Make it Gen Z."
- "Make it more editorial."

Clarification pattern:

```text
Should I apply that direction through silhouette, color, fabric, length, or embellishments?
```

If the command includes a target, proceed.

Example:

```text
Make the skirt more dramatic.
```

Possible operation:

```text
set_field skirt.shape = full assumed
```

Even here, "full" may be assumed unless the designer accepts it.

## Multiple Match Clarification

Needs clarification when several details match.

Example:

```text
Remove the trim.
```

State:

```text
embellishments:
- pearl trim at neckline
- lace trim at hem
```

Clarify:

```text
Which trim should I remove: pearl trim at neckline or lace trim at hem?
```

## Out-Of-Scope Handling

Reject or clarify when the command leaves MVP scope.

Reject:

```text
Design matching pants.
```

Reason:

```text
MVP supports dresses only.
```

Clarify:

```text
Make the outfit more formal.
```

Question:

```text
Do you want to update the dress design? MVP supports dresses only.
```

## No-Op Rules

Return no-op when:

- requested value is already present
- requested lock already exists
- duplicate embellishment already exists
- command is purely conversational and not a design instruction

Example:

```text
Make it red.
```

State:

```text
color.primary_color.name = red confirmed
```

Result:

```text
no_op: Primary color is already red.
```

## Error Severity

Use severity levels:

- `info`: does not block operation
- `warning`: operation may proceed but should be surfaced
- `blocking`: operation cannot proceed

Examples:

- info: no-op duplicate request
- warning: assumed fabric drape
- blocking: locked field conflict

## Designer Control Rules

The designer must be able to:

- see what the AI understood
- see what changed
- reject an AI proposal
- answer clarification
- lock details
- unlock details intentionally
- revert to earlier versions

## Validation Acceptance Criteria

The AI command interpretation plan is acceptable only if:

- invalid AI output cannot mutate design state
- ambiguous commands do not silently create versions
- locks cannot be bypassed
- unsupported garment categories are blocked
- AI assumptions are visible
- every accepted operation can be traced to raw input

## Sprint 02 Boundary

This document defines rules only.

It does not implement validators, UI messages, or backend error handling.
