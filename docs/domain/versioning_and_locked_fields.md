# Versioning and Locked Fields

Last updated: 2026-06-20

Status: Sprint 01 draft.

## Purpose

Versioning and locked fields protect designer control.

The designer should be free to explore ideas without losing earlier work, and the AI should not change protected details.

## Core Versioning Rule

Saved design versions are immutable.

Do not silently overwrite a previous version.

## Design Version Shape

Conceptual fields:

```text
DesignVersion
  version_id
  design_id
  version_number
  parent_version_id
  branch_id
  variation_label
  spec_snapshot
  locked_fields
  operation_ids
  change_summary
  created_by
  created_from
  created_at
```

## Field Definitions

### version_id

Stable unique ID for this version.

### design_id

ID of the design this version belongs to.

### version_number

Human-readable sequence number.

Example:

- `1`
- `2`
- `3`

### parent_version_id

The version this version came from.

Useful for:

- undo/revert traceability
- branching
- variation comparison

### branch_id

Optional grouping ID for variations or branches.

### variation_label

Optional label such as:

- Sleeve option A
- Bridal variation
- Lower-cost fabric variation

### spec_snapshot

Complete `DressSpec` snapshot at the time the version was created.

Rule:

- Snapshot must be self-contained enough to restore the version.

### locked_fields

List of active locked field records.

### operation_ids

Operations that produced this version.

### change_summary

Short human-readable summary of what changed.

Examples:

- Changed primary color from black to red.
- Added pearl trim to neckline.
- Reverted to version 2.

### created_by

Allowed values:

- user
- ai
- system

### created_from

Allowed values:

- voice
- text
- ui
- import
- system

## What Creates a Version

Creates a version:

- `set_field`
- `add_detail`
- `remove_detail`
- `modify_measurement`
- `lock_field`
- `unlock_field`
- `create_variation`
- `revert_to_version`

Sprint 01 decision:

- Locking and unlocking create versions because they represent designer intent and affect future AI behavior.

## What Does Not Create a Version

Does not create a version:

- invalid operation
- rejected operation
- clarification question
- no-op with no metadata change
- background render job
- viewing a different model profile

Important:

- Rendering a design on a new model profile creates a render record later, not a new design version.

## Revert Behavior

Reverting should not delete history.

Conceptual example:

```text
Version 1: black sheath dress
Version 2: red sheath dress
Version 3: red mermaid dress
User reverts to Version 1
Version 4: black sheath dress, created by revert_to_version targeting Version 1
```

Version 2 and Version 3 remain in history.

## Variation Behavior

Creating variations should preserve ancestry.

Example:

```text
Version 5: base satin gown
Version 6: Sleeve option A, parent Version 5
Version 7: Sleeve option B, parent Version 5
Version 8: Sleeve option C, parent Version 5
```

Each variation should:

- link to parent version
- keep locked fields intact
- carry variation label

## Locked Field Shape

Conceptual fields:

```text
LockedField
  lock_id
  field_path
  reason
  locked_by
  locked_from
  created_at
```

## Field Path Format

Use dot-separated field paths.

Examples:

- `silhouette`
- `neckline`
- `neckline.type`
- `fabric.primary`
- `fabric.primary.name`
- `color.primary_color`
- `measurements.dress_length`

## Lock Scope Rule

If a parent path is locked, child paths are locked.

Example:

- Locking `neckline` also locks `neckline.type` and `neckline.depth`.

If a child path is locked, sibling paths may remain editable.

Example:

- Locking `neckline.type` does not automatically lock `neckline.depth`.

## Recommended Lockable Fields

High-priority lockable fields:

- `silhouette`
- `neckline`
- `sleeves`
- `bodice`
- `skirt`
- `length`
- `fabric`
- `color`
- `embellishments`
- `closures`
- `lining`
- `measurements`

Production-facing lockable fields:

- `construction_notes`
- `pattern_notes`

## Locked Field Conflict Behavior

If an operation targets a locked field:

1. Reject the operation.
2. Return reason code `locked_field`.
3. Include the locked field path.
4. Include a user-readable message.
5. Suggest unlock only if the actor is user or the UI explicitly supports it.

Example:

```text
Operation: set_field neckline.type = sweetheart
Active lock: neckline
Result: rejected, reason locked_field
Message: Neckline is locked. Unlock it before changing neckline details.
```

## AI-Specific Lock Rule

Future AI operations must preserve locked fields.

If the AI suggests an operation that conflicts with a lock, the app should reject it even if the natural language was confident.

## Meaningful Version Rule

A meaningful version is created when:

- a visible design detail changes
- a production-facing spec changes
- a measurement changes
- a lock/unlock changes designer intent
- a variation is created
- a revert changes current design state

## Version Summary Rule

Every version should have a short change summary.

Examples:

- Set fabric to satin.
- Added pearl trim at neckline.
- Locked silhouette.
- Created bridal variation.
- Reverted to version 3.

## Sprint 01 Boundary

This document defines versioning and locked-field rules only.

It does not implement:

- database tables
- UI timeline
- undo controls
- operation application code
- AI behavior
