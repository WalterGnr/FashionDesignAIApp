# Sprint 07: Fast Visual Preview Planning

Status: Planning completed on 2026-07-09.

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
- Sprint 07 progress tracker
- Sprint 07 completion record

## Planning Artifacts

- `docs/preview/README.md`
- `docs/preview/preview_architecture.md`
- `docs/preview/spec_to_visual_mapping.md`
- `docs/preview/scene_interaction_and_camera.md`
- `docs/preview/performance_and_fallback_strategy.md`
- `docs/preview/visual_test_strategy.md`
- `docs/sprints/07_sprint_progress_tracker.md`
- `docs/sprints/07_sprint_completion_record.md`

## Architecture Decision

Use React Three Fiber over Three.js for the primary preview. Build a parameterized low-poly mannequin and dress from reusable procedural geometry, render on demand, and preserve a deterministic 2D fallback for WebGL failure.

The first implementation maps silhouette, skirt shape/fullness, hem length, neckline, sleeves, color, and broad fabric finish. It does not implement cloth physics, pattern accuracy, or production fit approval.

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

- No Three.js implementation during planning.
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

## Next Implementation Slice

- add Three.js, React Three Fiber, and established camera controls
- implement a pure `DressSpec` to preview-parameter mapper
- build the mannequin and modular dress scene
- add constrained view controls and reset
- keep the current 2D geometry as the safe fallback
- verify with automated screenshots and canvas pixel checks
