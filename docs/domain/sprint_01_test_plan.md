# Sprint 01 Test Planning Notes

Last updated: 2026-06-20

Status: Sprint 01 draft.

## Purpose

This document lists the future tests needed when Sprint 01 domain contracts become implementation code.

No tests are implemented in Sprint 01 because this sprint is still documentation/domain contract work.

## Future Test Tool

Recommended first tool:

- Vitest for TypeScript domain logic

Later backend tests:

- pytest
- FastAPI TestClient

## Test Area 1: Dress Spec Validation

Test cases:

- Valid minimal dress spec passes validation.
- Non-dress garment category is rejected.
- Required top-level objects may contain unknown values.
- Invalid silhouette is rejected.
- Invalid neckline is rejected.
- Invalid sleeve type is rejected.
- Fabric with unknown name is allowed.
- Confirmed AI-only assumption is rejected or downgraded to assumed.

## Test Area 2: Model Profile Validation

Test cases:

- Valid minimal model profile passes validation.
- Measurement with value but no unit is rejected.
- Negative measurement is rejected.
- Unsupported unit is rejected.
- Implausible body measurement is rejected or flagged.
- Missing optional extended measurements is allowed.
- Privacy defaults prevent logging sensitive measurements.

## Test Area 3: Design Operation Validation

Test cases:

- `set_field` with valid path and value is accepted.
- `set_field` with unknown field path is rejected.
- `add_detail` adds valid embellishment.
- `remove_detail` rejects missing detail ID in strict mode.
- `modify_measurement` rejects missing unit.
- `lock_field` accepts valid lockable field.
- `unlock_field` rejects field that is not locked.
- `create_variation` requires parent version ID.
- `revert_to_version` requires valid target version ID.

## Test Area 4: Locked Field Behavior

Test cases:

- Locking `neckline` prevents changing `neckline.type`.
- Locking `fabric` prevents changing `fabric.primary.name`.
- Locking `neckline.type` does not block `neckline.depth`.
- Operation against locked field returns `rejected`.
- Rejection includes reason code `locked_field`.
- AI actor cannot bypass locked field.
- Unlock creates a metadata version.

## Test Area 5: Immutability

Test cases:

- Applying an operation creates a new spec object.
- Previous spec remains unchanged.
- Previous version snapshot remains unchanged.
- Revert creates a new version instead of deleting history.
- Variation creates child version linked to parent.

## Test Area 6: Version Metadata

Test cases:

- New version has version ID.
- New version has design ID.
- New version has version number.
- New version has spec snapshot.
- New version has change summary.
- Change summary is not empty.
- Parent version ID is preserved for variations.
- Revert target version ID is recorded.

## Test Area 7: Clarification Behavior

Test cases:

- "Shorten by 2" needs clarification for unit.
- "Make it more dramatic" needs clarification for target field.
- Unknown target field returns clarification or rejection based on source.
- Low AI confidence returns clarification.

## Golden Command Examples

These examples should become fixtures later:

```text
Make it a red satin evening gown with an off-shoulder neckline.
```

Expected operation categories:

- set dress type
- set neckline
- set sleeve type
- set fabric
- set color

```text
Add pearl trim around the neckline.
```

Expected operation category:

- add embellishment

```text
Shorten the dress by 2.
```

Expected result:

- needs clarification

```text
Change the neckline to sweetheart.
```

When neckline is locked:

- rejected with locked_field

```text
No, go back to version 2.
```

Expected operation:

- revert_to_version

## Minimum Test Readiness For Implementation

Before Sprint 01 code is written later, create fixtures for:

- minimal valid dress spec
- rich valid dress spec
- valid model profile
- locked neckline scenario
- invalid measurement scenario
- variation scenario
- revert scenario

## Sprint 01 Boundary

This is a planning artifact only.

It does not add:

- test files
- test runner configuration
- TypeScript code
- package dependencies
