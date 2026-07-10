# Versioning Persistence Rules

Last updated: 2026-07-08

Status: Sprint 06 planning artifact.

## Goal

Define how version history remains traceable and reversible.

## Core Rules

### Versions Are Immutable

After `design_versions` rows are inserted:

- do not update `spec_snapshot`
- do not update `locked_fields_snapshot`
- do not rewrite `operation_ids`
- do not rewrite `change_summary`

If a correction is needed, create a new version.

### Designs Hold The Current Pointer

The `designs.current_version_id` field may change.

Use cases:

- new accepted operation
- user selects a prior version as current
- explicit revert creates a new version based on a prior version

### Revert Creates A New Version

Reverting should not delete or overwrite history.

Flow:

```text
current V5
user says revert to V2
backend creates V6 from V2 snapshot
design.current_version_id = V6
```

### Operations Explain Changes

Each accepted operation should have a durable operation record when persistence is implemented.

The resulting version should reference operation IDs.

### Raw Inputs Are Separate From Versions

The final transcript or typed command should be stored as a command event, not as the only explanation for a version.

Versions store:

- technical spec snapshot
- locks snapshot
- operation IDs
- change summary

Command events store:

- raw/final input text
- interpreted result
- execution status

## Transaction Rule

Creating an accepted version should happen in one transaction:

1. insert command event
2. insert operation records
3. insert design version
4. update design current version pointer

If any step fails, the transaction rolls back.

