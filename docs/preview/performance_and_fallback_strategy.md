# Preview Performance And Fallback Strategy

Last updated: 2026-07-09

Status: Sprint 07 planning artifact.

## Performance Goal

The designer should see a preview response almost immediately after a validated local spec update.

Initial targets on the supported Windows development machine:

- parameter mapping: under 16 ms
- visible local update: under 100 ms after accepted version selection
- interaction: target 60 fps, minimum acceptable 30 fps
- first usable scene: under 2 seconds in development build
- idle GPU use: minimized through on-demand rendering

## Rendering Strategy

- render on demand rather than continuously
- keep mesh count and material count small
- reuse geometry and materials
- avoid large textures in the first implementation
- cap device pixel ratio for high-density displays
- disable expensive shadows/post-processing initially
- use simple studio lights and contact cues

## Resize Strategy

The canvas follows its parent container. Camera aspect and drawing buffer update only when display dimensions change. Device pixel ratio is capped to avoid unnecessary GPU work.

## Resource Safety

- dispose obsolete geometry and materials
- dispose controls and event listeners on unmount
- monitor renderer memory and draw-call information during development
- avoid recreating the whole scene for a color-only change

## Fallback Levels

1. Primary: WebGL 2 Three.js preview.
2. Reduced: lower pixel ratio and simplified lighting when performance is poor.
3. Safe fallback: existing deterministic 2D silhouette driven by the same `PreviewParameters`.
4. Last resort: textual spec summary if both visual paths fail.

The fallback must never block editing, version history, or persistence.

## WebGL Failure Cases

Handle:

- context creation failure
- context loss
- unsupported/blocked graphics acceleration
- shader compile failure
- scene error boundary activation

Errors shown to the designer must be concise and must not include GPU driver dumps or stack traces.
