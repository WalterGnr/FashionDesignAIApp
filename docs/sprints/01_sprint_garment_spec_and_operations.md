# Sprint 01: Garment Spec and Design Operations

Status: Completed domain contract artifacts on 2026-06-20.

Suggested duration: 1 to 2 weeks.

## Goal

Design the structured garment spec and operation model that will become the source of truth for the entire application.

## Why This Sprint Matters

The app should not be a random image generator. It should be a professional design tool where every creative choice can be stored, revised, queried, rendered, and exported.

The garment spec is the center of the product.

## Primary Deliverables

- Draft dress spec schema
- Draft model profile schema
- Draft design operation list
- Draft locked-field behavior
- Draft validation rules
- Draft version metadata model
- Examples of before/after spec updates

## Key Planning Tasks

- Define core dress fields:
  - Category
  - Silhouette
  - Neckline
  - Sleeve type
  - Sleeve length
  - Dress length
  - Bodice structure
  - Skirt structure
  - Fabric
  - Color
  - Embellishments
  - Closures
  - Lining
  - Construction notes
  - Pattern notes
  - Measurements
- Define model profile fields:
  - Height
  - Bust
  - Waist
  - Hips
  - Shoulder width
  - Inseam
  - Optional body shape notes
- Define operation types:
  - Set field
  - Add detail
  - Remove detail
  - Modify measurement
  - Lock field
  - Unlock field
  - Create variation
  - Revert to version
- Define what counts as a meaningful version.
- Define validation constraints.
- Define how unknown or assumed values are marked.

## Non-Goals

- No frontend UI.
- No AI calls.
- No database implementation.
- No image generation.

## Acceptance Criteria

- The first dress spec can describe a useful dress without images.
- A command can be represented as a structured operation.
- Locked fields are clearly defined.
- Version snapshots are clearly defined.
- The schema is practical enough for AI, UI, database, and export systems.

## Risks

- Schema could become too broad too early.
- Schema could be too vague for manufacturing.
- Overusing flexible JSON could make future querying difficult.

## Senior Developer Notes

Keep the first schema useful but not enormous. The MVP should cover dresses well before expanding into every garment category.

## Learning Prep

Sprint 01 learning notes were added before implementation:

- `docs/sprints/01_sprint_skill_learning_notes.md`
- `docs/sprints/01_sprint_progress_tracker.md`
- `docs/sprints/01_sprint_completion_record.md`
- `docs/domain/README.md`
- `docs/domain/dress_spec_schema.md`
- `docs/domain/model_profile_schema.md`
- `docs/domain/design_operations_contract.md`
- `docs/domain/versioning_and_locked_fields.md`
- `docs/domain/validation_rules.md`
- `docs/domain/before_after_spec_examples.md`
- `docs/domain/sprint_01_test_plan.md`
- `docs/domain/dress_domain_vocabulary.md`
- `docs/domain/design_operation_model_notes.md`
- `docs/domain/schema_validation_strategy.md`

These documents define the Sprint 01 domain contracts. No desktop app, UI, backend, database, AI integration, image generation, dependency installation, or production code was created in Sprint 01.
