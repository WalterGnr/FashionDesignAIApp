# Design Operations Contract

Last updated: 2026-06-20

Status: Sprint 01 draft.

## Purpose

Design operations are the safe internal language for modifying a dress spec.

Natural speech, UI controls, AI suggestions, imports, and future collaboration events should all become validated operations before changing design state.

## Core Rule

Do not mutate `DressSpec` directly.

Use this conceptual flow:

```text
current DesignVersion
  + DesignOperation
  + validation rules
  -> new DesignVersion or ValidationResult
```

## Operation Envelope

Every operation should carry metadata.

```text
DesignOperation
  operation_id
  type
  actor
  source
  target
  payload
  raw_input_ref
  confidence
  creates_version
  created_at
```

## Metadata Fields

### operation_id

Purpose:

- Stable ID for tracing and debugging.

### type

Allowed values:

- `set_field`
- `add_detail`
- `remove_detail`
- `modify_measurement`
- `lock_field`
- `unlock_field`
- `create_variation`
- `revert_to_version`

### actor

Allowed values:

- `user`
- `ai`
- `system`

### source

Allowed values:

- `voice`
- `text`
- `ui`
- `import`
- `system`

### target

Purpose:

- Field path or entity being changed.

Examples:

- `silhouette`
- `neckline.type`
- `fabric.primary.name`
- `embellishments`
- `measurements.dress_length`

### raw_input_ref

Purpose:

- Optional reference to transcript, prompt, UI action, import file, or system event.

Rule:

- Keep enough traceability to explain why an operation happened.

### confidence

Purpose:

- AI/system confidence score when applicable.

Rule:

- Required for AI-generated operations when the AI layer is added later.
- Not required for direct user UI actions.

### creates_version

Purpose:

- States whether applying this operation creates a new design version.

Rule:

- Meaningful design changes should create versions.

## Operation Types

## set_field

Purpose:

Replace a scalar or structured field.

Required payload:

```text
field_path
value
value_status
```

Examples:

- Set `color.primary_color.name` to `red`.
- Set `silhouette` to `mermaid`.
- Set `neckline.type` to `sweetheart`.

Validation:

- Field path must exist.
- Value must match field type.
- Field must not be locked.
- MVP must remain dress-only.

Version behavior:

- Creates a new version if value changes.
- No-op if value is identical and metadata does not change.

## add_detail

Purpose:

Add an item to a list-like field.

Required payload:

```text
field_path
detail
```

Supported MVP targets:

- `embellishments`
- `skirt.features`
- `construction_notes`
- `pattern_notes`
- `warnings`
- `assumptions`

Examples:

- Add pearl trim to neckline.
- Add side slit to skirt.
- Add construction note for boning.

Validation:

- Target must be a supported list.
- Detail must have required shape for that list.
- Locked target path must reject the operation.
- Duplicate behavior must be explicit.

Duplicate behavior:

- If same detail already exists, operation should return `no_op` or request clarification.

Version behavior:

- Creates a new version for user-visible design or production detail changes.

## remove_detail

Purpose:

Remove an item from a list-like field.

Required payload:

```text
field_path
detail_id
```

Validation:

- Detail ID must exist.
- Target field must not be locked.

Version behavior:

- Creates a new version if a detail is removed.
- No-op if detail does not exist and strict mode is disabled.
- Rejected if detail does not exist and strict mode is enabled.

Sprint 01 recommendation:

- Use strict mode for MVP to avoid silent AI mistakes.

## modify_measurement

Purpose:

Set or adjust a numeric measurement.

Required payload:

```text
field_path
mode: set | adjust
measurement
```

Measurement shape:

```text
value
unit
status
source
note
```

Examples:

- Set `measurements.dress_length` to `58 in`.
- Adjust `measurements.sleeve_length` by `-2 cm`.

Validation:

- Field must be a measurement.
- Numeric values require a unit.
- Supported units: `in`, `cm`.
- Negative resulting measurements are invalid.
- Implausible values should be rejected or flagged.
- Field must not be locked.

Version behavior:

- Creates a new version.

## lock_field

Purpose:

Protect a field from future changes.

Required payload:

```text
field_path
reason
```

Examples:

- Lock `neckline`.
- Lock `fabric.primary`.
- Lock `silhouette`.

Validation:

- Field path must be valid and lockable.
- Already locked field should be a no-op unless reason changes.

Version behavior:

- Creates a metadata version because designer intent changed.

Sprint 01 decision:

- Locking creates a version. This makes designer control traceable.

## unlock_field

Purpose:

Allow a locked field to change again.

Required payload:

```text
field_path
reason
```

Validation:

- Field must be locked.
- Unlock reason should be recorded.

Version behavior:

- Creates a metadata version.

## create_variation

Purpose:

Create a related branch or option from a parent version.

Required payload:

```text
parent_version_id
variation_label
operations
```

Examples:

- Create three sleeve options.
- Create a bridal variation.
- Create a lower-cost fabric variation.

Validation:

- Parent version must exist.
- Nested operations must be valid.
- Locked fields must be preserved.
- Variation label is required.

Version behavior:

- Creates one or more new versions linked to the parent.

## revert_to_version

Purpose:

Make an older version current without deleting history.

Required payload:

```text
target_version_id
reason
```

Validation:

- Target version must exist.
- Target must belong to same design.

Version behavior:

- Creates a new version whose spec snapshot matches the target version.
- Does not delete versions between current and target.

## Validation Result Contract

Every operation application should return one of:

- `accepted`
- `rejected`
- `needs_clarification`
- `no_op`

## accepted

Fields:

- `status`
- `operation_id`
- `new_version_id`
- `change_summary`

## rejected

Fields:

- `status`
- `operation_id`
- `reason_code`
- `message`
- `field_path`

Reason codes:

- `unknown_field`
- `invalid_value`
- `locked_field`
- `invalid_measurement`
- `unsupported_category`
- `schema_violation`
- `missing_required_payload`

## needs_clarification

Fields:

- `status`
- `operation_id`
- `question`
- `field_path`
- `options`

Use when:

- Instruction is ambiguous.
- Measurement unit is missing.
- Target field is unclear.
- AI confidence is too low.

## no_op

Fields:

- `status`
- `operation_id`
- `message`

Use when:

- Value is already set.
- Lock already exists with same reason.

## Design Command Examples

Natural command:

```text
Make it a red satin evening gown.
```

Possible operations:

```text
set_field identity.dress_type = evening_gown confirmed
set_field fabric.primary.name = satin confirmed
set_field color.primary_color.name = red confirmed
```

Natural command:

```text
Keep the neckline but make the skirt fuller.
```

Possible operations:

```text
lock_field neckline
set_field skirt.shape = full confirmed
```

Natural command:

```text
No, go back to version 2.
```

Possible operation:

```text
revert_to_version target_version_id = version_2
```

## Sprint 01 Boundary

This document defines the operation contract only.

It does not implement:

- TypeScript types
- Zod schemas
- operation application code
- UI controls
- AI command interpretation
- database persistence
