# Sprint 01 Skill Learning Notes

Last updated: 2026-06-20

Status: Learning and preparation only. No Sprint 01 implementation has started.

## Sprint 01 Goal

Sprint 01 will define the structured garment spec and design operation model that become the source of truth for the app.

The MVP is dresses only.

## Required Skills

### 1. TypeScript Domain Modeling

Why it matters:

- The dress spec, model profile, design operation, locked field, and version snapshot should be represented as precise types.
- TypeScript should help prevent invalid design states before runtime.

What to learn:

- Interfaces and type aliases
- Literal union types
- Discriminated unions
- Type narrowing
- Exhaustive switch handling
- Readonly data structures where useful
- Avoiding `any`
- Separating domain types from UI types

How it applies:

- `DressSpec` should describe the design.
- `ModelProfile` should describe the body profile.
- `DesignOperation` should describe allowed changes.
- Each operation should have a `type` discriminator, such as `set_field`, `add_detail`, `lock_field`, or `create_variation`.

Official reference:

- TypeScript narrowing and discriminated unions: https://www.typescriptlang.org/docs/handbook/2/narrowing.html

### 2. Runtime Validation

Why it matters:

- TypeScript checks code during development, but AI output, API responses, and imported files are runtime data.
- Runtime validation protects the garment spec from malformed or unsafe changes.

Recommended tool:

- Zod

What to learn:

- Defining schemas
- Parsing unknown input
- `safeParse` for validation without throwing
- Inferring TypeScript types from schemas
- Nested object validation
- Enum/literal validation
- Optional vs nullable fields
- Custom refinements for domain rules

How it applies:

- AI-proposed design operations must be validated before being applied.
- Imported/exported spec data should be validated.
- Measurements should be checked for unit and range.
- Locked fields should reject conflicting operations.

Official reference:

- Zod basics: https://zod.dev/basics

### 3. JSON Schema Compatibility

Why it matters:

- Future AI tool/function calling, backend contracts, API docs, and database validation may need JSON-compatible schemas.
- The app should avoid a TypeScript-only model that is hard to share with Python/FastAPI or AI tooling.

What to learn:

- Object schemas
- Required fields
- Enumerated values
- Arrays
- Nested objects
- Additional properties rules
- Versioned schemas

How it applies:

- Design operations should eventually be expressible as JSON Schema for AI command interpretation.
- Dress specs should be serializable and stable enough for database storage.
- Flexible fields should be intentional, not accidental.

Official reference:

- JSON Schema getting started: https://json-schema.org/learn/getting-started-step-by-step

### 4. Immutable State Updates

Why it matters:

- Design versions must be traceable.
- Applying an operation should not silently mutate the previous version.

What to learn:

- Pure functions
- Copy-on-write object updates
- Operation application as a deterministic transformation
- Before/after snapshots
- Command history vs version snapshots

How it applies:

The future core function should conceptually behave like:

```text
previous dress spec + design operation -> new dress spec + change summary
```

The previous version must remain unchanged.

### 5. Versioning Model

Why it matters:

- Designers need to experiment freely.
- Manufacturers and exports need exact traceability.

What to learn:

- Immutable version snapshots
- Version numbers
- Change summaries
- Parent version IDs
- Revert behavior
- Branching or variation behavior

How it applies:

- Every meaningful design change should create a new version.
- Reverting should create a new version that points back to the chosen older snapshot.
- Variations should preserve ancestry.

### 6. Locked Field Rules

Why it matters:

- Designer control is central to the product.
- The AI must not change protected details.

What to learn:

- Field path representation
- Conflict detection
- Operation authorization against locked fields
- Clear rejection messages

How it applies:

If the neckline is locked, an operation that changes `neckline` should be rejected or turned into a clarification.

### 7. Fashion Domain Modeling for Dresses

Why it matters:

- A useful dress spec needs fashion-specific structure, not generic prompt text.

What to learn:

- Dress silhouettes
- Necklines
- Sleeve types and lengths
- Bodice structures
- Skirt structures
- Dress lengths
- Fabrics and drape characteristics
- Closures
- Linings
- Embellishments/trims
- Construction notes
- Pattern notes
- Measurements

How it applies:

The first schema should be broad enough to describe useful dresses but narrow enough to avoid becoming a full fashion PLM system too early.

### 8. Unit Testing With Vitest

Why it matters:

- The design-state engine is the most important logic in the product.
- We need confidence that operations are valid, reversible, and traceable.

What to learn:

- `describe`
- `test` / `it`
- `expect`
- Table-driven tests
- Testing thrown errors or validation failures
- Golden examples for design operations

How it applies:

Sprint 01 implementation should eventually test:

- Valid operation updates a spec.
- Invalid operation is rejected.
- Locked field cannot be changed.
- Version metadata is created.
- Previous version is not mutated.
- Unknown or assumed values are preserved clearly.

Official reference:

- Vitest guide: https://vitest.dev/guide/

## Sprint 01 Mental Model

Think of Sprint 01 as designing the app's grammar.

The designer may speak naturally later, but the software needs a controlled internal language:

```text
DressSpec
ModelProfile
DesignOperation
DesignVersion
LockedField
ValidationResult
ChangeSummary
```

This internal language must work for:

- AI interpretation
- React UI
- Fast preview rendering
- PostgreSQL persistence
- Tech pack export
- Future manufacturer workflows

## What To Avoid

- Do not start with image prompts.
- Do not make everything a free-text field.
- Do not store measurements without units.
- Do not let operations mutate previous versions.
- Do not ignore locked fields.
- Do not build a schema for every garment category yet.
- Do not overbuild a full PLM system in Sprint 01.

## Readiness Checklist

Before starting Sprint 01 implementation, we should be able to answer:

- What fields belong in the first `DressSpec`?
- Which fields are required vs optional?
- How do we mark unknown values?
- How do we mark AI-assumed values?
- What operation types are allowed?
- What operation types create versions?
- How are locked fields represented?
- What validation failures are possible?
- What examples prove the schema is useful?
- What unit tests must exist first?

## Recommended Sprint 01 Output

When Sprint 01 implementation starts, the safest first deliverables are:

1. Draft `DressSpec` and `ModelProfile` type definitions.
2. Draft runtime validation schemas.
3. Draft `DesignOperation` discriminated union.
4. Draft operation validation rules.
5. Draft example before/after specs.
6. Draft unit test plan or fixture examples.

No UI, backend, AI integration, database, image generation, or voice integration should be included in Sprint 01.
