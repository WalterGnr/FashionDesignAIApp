# Sprint 07 Development Completion Record

Date: 2026-07-09

Status: Completed first fast visual preview implementation.

## Sprint Goal

Replace the diagnostic CSS dress shape with a fast, interactive, structured-spec-driven 3D preview that is useful for design direction and honest about its limitations.

## Implemented Scope

- Three.js rendering through React Three Fiber
- established OrbitControls and contact-shadow helpers
- pure `DressSpec` to `PreviewParameters` mapping boundary
- explicit visual fallback notices that never mutate the dress spec
- neutral low-poly mannequin
- procedural bodice and skirt geometry
- A-line, column, full, bias, fit-and-flare, ball-gown, empire, shift, and mermaid directions
- mapped hem lengths
- mapped neckline cutouts and straps
- fitted, puff, bishop, bell, flutter, off-shoulder, and one-sleeve directions
- color palette and safe hexadecimal color handling
- broad fabric roughness, sheen, metalness, and opacity cues
- front, three-quarter, side, back, and reset camera controls
- constrained orbit and zoom behavior
- on-demand scene rendering
- geometry disposal when skirt profiles change
- 2D fallback for WebGL failure
- browser-safe renderer mode when Electron preload is absent
- 1024px fallback layout without horizontal overflow

## Key Files

- `apps/desktop/src/renderer/src/preview/preview-parameters.ts`
- `apps/desktop/src/renderer/src/preview/preview-mapper.ts`
- `apps/desktop/src/renderer/src/preview/DressPreviewCanvas.tsx`
- `apps/desktop/src/renderer/src/preview/DressScene.tsx`
- `apps/desktop/src/renderer/src/preview/Mannequin.tsx`
- `apps/desktop/src/renderer/src/preview/Garment.tsx`
- `apps/desktop/src/renderer/src/preview/PreviewFallback.tsx`
- `apps/desktop/tests/preview-mapper.test.ts`

## Acceptance Check

### Preview consumes the selected structured spec.

Met. The mapper receives the selected immutable version snapshot. Selecting or creating another version updates the canvas and summary from that same snapshot.

### Visual assumptions do not alter technical data.

Met. Unit tests confirm mapping does not mutate the source spec. Unknown values produce documented fallback notices.

### Supported field changes are visibly meaningful.

Met. Red satin, off-shoulder, floor-length, full-skirt, mermaid, sleeve, neckline, finish, and color mappings produce distinct parameters and visible geometry/material changes.

### The preview is interactive and framed.

Met. Front, three-quarter, side, back, and reset controls work. Camera limits prevent losing the model, and full-length gowns remain fully framed.

### The canvas is nonblank and responsive.

Met. Browser inspection found one active 821 by 502 canvas at the default desktop viewport. Pixel analysis reported entropy 4.382 with broad channel variance. The 1024px layout had no preview/inspector overlap and no horizontal document or inspector overflow.

### A safe fallback exists.

Met. WebGL creation failure or scene errors render a deterministic 2D dress fallback while the rest of the workspace remains usable.

## Verification

- TypeScript type checks: passed
- TypeScript tests: 36 passed
- Backend tests: 7 passed
- Total tests: 43 passed
- Desktop production build: passed
- npm high-severity audit: 0 vulnerabilities
- Browser runtime errors: none
- Camera preset interaction checks: passed
- Desktop 1280 by 720 visual review: passed
- Constrained 1024 by 720 layout review: passed
- Canvas pixel-variance check: passed

## Known Limitations

- This preview is directional geometry, not cloth simulation or fit validation.
- The neutral mannequin has no anatomical detail or measurement-profile mapping yet.
- Unsupported fine details and embellishments remain textual rather than geometric.
- React Three Fiber currently emits an upstream warning because a dependency still uses Three.js's deprecated `Clock` class.
- The first renderer bundle is larger after adding Three.js; code splitting and mesh/asset streaming remain packaging optimizations.

## Next Step

Plan Sprint 09, then implement Sprint 08's mocked render-job, worker, idempotency, and storage pipeline before any live image provider integration.
