# Domain Documentation

Last updated: 2026-07-08

## Purpose

This folder defines the internal design language for the AI Fashion Design App.

The domain model is the bridge between designer creativity and production-ready structure. The structured dress spec is the source of truth.

## Sprint 01 Core Artifacts

Read these first for Sprint 01 output:

- `dress_spec_schema.md`
- `model_profile_schema.md`
- `design_operations_contract.md`
- `versioning_and_locked_fields.md`
- `validation_rules.md`
- `before_after_spec_examples.md`
- `sprint_01_test_plan.md`

## Supporting Learning Notes

- `dress_domain_vocabulary.md`
- `design_operation_model_notes.md`
- `schema_validation_strategy.md`

## Main Concepts

```text
DressSpec
ModelProfile
DesignOperation
LockedField
DesignVersion
ValidationResult
ChangeSummary
```

## Boundary

These documents remain the source contracts and planning artifacts.

The first executable implementation now lives in:

- `packages/domain`

That package currently implements:

- TypeScript domain types
- Zod validation schemas
- operation application functions
- test fixtures
- Vitest coverage

Still not implemented here:

- database tables
- UI
- AI calls
- image generation
- voice interaction
