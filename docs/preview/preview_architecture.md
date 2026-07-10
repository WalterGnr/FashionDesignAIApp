# Preview Architecture

Last updated: 2026-07-09

Status: Sprint 07 planning artifact.

## Architecture Decision

Build the first preview with:

- Three.js as the rendering engine
- React Three Fiber as the React integration
- `@react-three/drei` for established camera controls and scene helpers
- reusable procedural geometry for the mannequin and garment
- on-demand rendering when scene inputs change
- a deterministic 2D fallback for WebGL failure

This keeps the scene inside the existing React renderer while preserving a clear mapping boundary between domain data and render parameters.

## Runtime Flow

```text
selected DesignVersion
  -> validated DressSpec snapshot
  -> pure preview mapping function
  -> PreviewParameters
  -> React Three Fiber scene
  -> visible approximate dress preview
```

The React component must not inspect arbitrary spec paths. A pure mapper owns defaults, supported values, and unknown-value behavior.

## Proposed Modules

```text
apps/desktop/src/renderer/src/preview/
  preview-parameters.ts
  preview-mapper.ts
  DressPreviewCanvas.tsx
  DressScene.tsx
  Mannequin.tsx
  Garment.tsx
  PreviewFallback.tsx
```

## Scene Composition

The scene should contain:

- neutral mannequin torso, neck, head, arms, and lower body
- bodice geometry
- optional left and right sleeve geometry
- skirt geometry selected by silhouette and skirt shape
- simple neckline cut or neckline overlay
- neutral floor and soft studio lighting
- fixed perspective camera with constrained orbit controls

Garment parts should be separate reusable meshes so changing sleeves does not require rebuilding unrelated geometry.

## State Ownership

Domain state owns:

- selected design version
- spec snapshot
- locked fields

Preview mapping owns:

- visual defaults for unknown values
- normalized dimensions and colors
- supported geometry variants
- approximation notices

Scene-local state owns:

- camera orientation
- temporary pointer interaction
- WebGL readiness/error state

## Update Behavior

An accepted command creates a new design version. Selecting that version computes new preview parameters and invalidates the scene once. Partial voice transcripts do not mutate or redraw the saved preview.

When the designer inspects an older version, both the spec inspector and preview consume that same selected version.

## Dependency Boundary

The renderer may depend on `three`, `@react-three/fiber`, and `@react-three/drei`. The domain and AI packages must remain independent of rendering libraries.

## Resource Lifecycle

Procedural geometry and materials should be memoized where inputs are stable. Replaced geometries, materials, textures, render targets, and controls must be disposed when no longer used. Three.js does not automatically release all GPU resources.

## Accessibility

The canvas is supplemental. A nearby text summary must expose the selected version and visible spec fields. Keyboard users must be able to reset the camera without entering a pointer-only workflow.

## References

- Three.js renderer: https://threejs.org/docs/pages/WebGLRenderer.html
- Three.js responsive rendering: https://threejs.org/manual/en/responsive.html
- Three.js cleanup: https://threejs.org/manual/en/cleanup.html
- React Three Fiber Canvas: https://r3f.docs.pmnd.rs/api/canvas
