# Preview Visual Test Strategy

Last updated: 2026-07-09

Status: Sprint 07 planning artifact.

## Test Layers

### Mapper Unit Tests

Test deterministic `DressSpec` to `PreviewParameters` behavior for:

- all supported silhouette families
- skirt shape and fullness
- hem-length ordering
- sleeve type, length, and volume
- neckline variants
- named colors and invalid colors
- fabric finish mapping
- unknown-value fallbacks
- model profile clamping

### Component Tests

Verify:

- canvas receives parameters from the selected version
- version changes update the preview
- partial voice transcript does not update the committed preview
- reset-view and view-preset controls are keyboard accessible
- WebGL errors activate the fallback

### Visual Verification

Use Playwright screenshots at desktop and constrained-width layouts.

Required fixture set:

- red satin off-shoulder evening gown
- black sleeveless column dress
- ivory ball gown with full floor-length skirt
- short A-line dress with fitted sleeves
- unknown/default dress

For each fixture verify:

- canvas is nonblank using pixel checks
- garment stays fully framed
- silhouette differences are visibly meaningful
- color and fabric finish changes render
- controls and labels do not overlap
- fallback remains readable

### Interaction Verification

- rotate, zoom, reset, and preset views work
- camera constraints prevent losing the model
- scene remains responsive after repeated version changes
- GPU resource counts do not grow without bound across repeated fixture swaps

## Acceptance Threshold

The sprint implementation is not complete from tests alone. A human review must confirm that each supported parameter produces a recognizable, professionally framed dress approximation.
