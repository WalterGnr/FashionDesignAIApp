# Sprint 07: Fast Visual Preview Planning

Status: Planning only.

Suggested duration: 1 to 2 weeks.

## Goal

Plan the first fast visual preview that updates from the structured dress spec.

## Why This Sprint Matters

Designers need immediate visual feedback. However, the MVP should not wait for perfect garment simulation. A fast approximate preview is more valuable early than a slow perfect one.

## Primary Deliverables

- Preview architecture plan
- 2D vs 3D decision notes
- Mapping from spec fields to visual features
- Mannequin/model profile strategy
- Rendering performance expectations
- Visual test strategy

## Key Planning Tasks

- Decide first preview approach:
  - Simple 2D silhouette preview
  - Simple 3D mannequin preview
  - Hybrid approach
- Define spec-to-preview mapping:
  - Color to material
  - Length to geometry
  - Sleeve type to geometry
  - Neckline to shape
  - Silhouette to mesh/outline
  - Model measurements to proportions
- Define what the preview will not claim:
  - Perfect draping
  - Production pattern accuracy
  - Final fabric behavior
- Define visual testing expectations.

## Non-Goals

- No Three.js implementation.
- No garment physics.
- No AI image generation.
- No production pattern logic.

## Acceptance Criteria

- Preview scope is realistic.
- Spec-to-visual mapping is documented.
- Limitations are clear.
- The preview remains a consumer of structured spec data.

## Risks

- Designers may expect more realism than the MVP can provide.
- 3D scope can expand quickly.
- Preview inaccuracies could be mistaken for production truth.

## Senior Developer Notes

Label the initial preview internally as approximate. It should be useful for design direction, not final fit approval.
