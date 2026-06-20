# Before and After Spec Examples

Last updated: 2026-06-20

Status: Sprint 01 draft.

## Purpose

These examples prove that the Sprint 01 domain model can represent useful dress changes without images.

The examples are conceptual. They are not implementation code.

## Example 1: Create a Red Satin Evening Gown

### Designer Command

```text
Make it a red satin evening gown with an off-shoulder neckline.
```

### Starting Spec

```text
garment_category: dress
identity.dress_type: unknown
silhouette: unknown
neckline.type: unknown
sleeves.type: unknown
length.category: unknown
fabric.primary.name: unknown
color.primary_color.name: unknown
embellishments: []
closures.type: unknown
lining.coverage: unknown
measurements: all unknown
```

### Operations

```text
set_field identity.dress_type = evening_gown confirmed
set_field neckline.type = off_shoulder confirmed
set_field sleeves.type = off_shoulder confirmed
set_field fabric.primary.name = satin confirmed
set_field color.primary_color.name = red confirmed
```

### Resulting Spec Summary

```text
garment_category: dress
identity.dress_type: evening_gown confirmed
neckline.type: off_shoulder confirmed
sleeves.type: off_shoulder confirmed
fabric.primary.name: satin confirmed
color.primary_color.name: red confirmed
closures.type: unknown
lining.coverage: unknown
measurements: all unknown
```

### Version Behavior

Creates a new version.

Change summary:

```text
Created red satin evening gown direction with off-shoulder neckline.
```

### Warnings

```text
Closure is unknown.
Lining is unknown.
Production measurements are unknown.
Silhouette remains unknown.
```

## Example 2: Change Silhouette and Length

### Designer Command

```text
Make it a floor-length mermaid silhouette.
```

### Starting Spec Summary

```text
identity.dress_type: evening_gown confirmed
silhouette: unknown
length.category: unknown
fabric.primary.name: satin confirmed
color.primary_color.name: red confirmed
```

### Operations

```text
set_field silhouette = mermaid confirmed
set_field length.category = floor confirmed
```

### Resulting Spec Summary

```text
identity.dress_type: evening_gown confirmed
silhouette: mermaid confirmed
length.category: floor confirmed
fabric.primary.name: satin confirmed
color.primary_color.name: red confirmed
```

### Version Behavior

Creates a new version.

Change summary:

```text
Set silhouette to mermaid and length to floor.
```

## Example 3: Locked Neckline Conflict

### Starting State

```text
neckline.type: off_shoulder confirmed
locked_fields:
  - field_path: neckline
    reason: Designer approved neckline for this direction.
```

### Designer or AI Command

```text
Change the neckline to sweetheart.
```

### Proposed Operation

```text
set_field neckline.type = sweetheart confirmed
```

### Validation Result

```text
status: rejected
reason_code: locked_field
field_path: neckline
message: Neckline is locked. Unlock it before changing neckline details.
```

### Version Behavior

No new version is created because the operation is rejected.

### Why This Matters

This proves the operation model protects designer intent.

## Example 4: Add Pearl Trim

### Designer Command

```text
Add pearl trim around the neckline.
```

### Starting Spec Summary

```text
neckline.type: off_shoulder confirmed
embellishments: []
```

### Operation

```text
add_detail embellishments:
  type: pearls
  placement: neckline
  density: moderate assumed
  material: pearl trim
  status: confirmed for type and placement, assumed for density
```

### Resulting Spec Summary

```text
embellishments:
  - type: pearls
    placement: neckline
    density: moderate assumed
    material: pearl trim
```

### Version Behavior

Creates a new version.

Change summary:

```text
Added pearl trim around neckline.
```

### Assumptions

```text
Pearl trim density assumed as moderate.
```

## Example 5: Measurement Change With Missing Unit

### Designer Command

```text
Shorten the dress by 2.
```

### Proposed Operation

```text
modify_measurement measurements.dress_length:
  mode: adjust
  value: -2
  unit: missing
```

### Validation Result

```text
status: needs_clarification
question: Should the dress be shortened by 2 inches or 2 centimeters?
field_path: measurements.dress_length
options: in, cm
```

### Version Behavior

No new version is created until the unit is clarified.

## Example 6: Create Sleeve Variations

### Designer Command

```text
Show me three different sleeve options, but keep the neckline.
```

### Starting State

```text
neckline.type: off_shoulder confirmed
locked_fields:
  - field_path: neckline
```

### Operation

```text
create_variation:
  parent_version_id: version_5
  variation_label: Sleeve options
  operations:
    variation A: set_field sleeves.type = cap confirmed
    variation B: set_field sleeves.type = long confirmed
    variation C: set_field sleeves.type = flutter confirmed
```

### Resulting Versions

```text
Version 6: Sleeve option A, parent Version 5, neckline preserved
Version 7: Sleeve option B, parent Version 5, neckline preserved
Version 8: Sleeve option C, parent Version 5, neckline preserved
```

### Version Behavior

Creates three new versions linked to the same parent.

## Example 7: Revert To Earlier Version

### Designer Command

```text
No, go back to version 2.
```

### Starting History

```text
Version 1: black sheath dress
Version 2: red satin evening gown
Version 3: red satin mermaid gown
Version 4: red satin mermaid gown with pearl trim
```

### Operation

```text
revert_to_version:
  target_version_id: version_2
  reason: Designer rejected later direction.
```

### Resulting History

```text
Version 5: spec snapshot matches Version 2
```

Version 3 and Version 4 remain in history.

### Version Behavior

Creates a new version.

Change summary:

```text
Reverted to version 2.
```

## Sprint 01 Acceptance Evidence

These examples show:

- A dress can be described without images.
- Commands can become structured operations.
- Locked fields can block unwanted changes.
- Ambiguous measurements can request clarification.
- Variations can preserve ancestry.
- Reverts preserve history instead of deleting it.
