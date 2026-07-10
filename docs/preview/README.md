# Fast Visual Preview

Last updated: 2026-07-09

Status: Sprint 07 planning and initial implementation completed.

## Purpose

This folder defines the first useful visual preview for the dress-only MVP. The preview consumes a validated `DressSpec` snapshot and gives the designer immediate directional feedback while richer concept renders remain asynchronous.

## Decision

Use React Three Fiber over Three.js for the primary preview, with a lightweight 2D fallback when WebGL is unavailable.

The first scene will use reusable, parameterized geometry for a neutral mannequin and dress components. It will not attempt cloth simulation or pattern accuracy.

## Documents

- `preview_architecture.md`
- `spec_to_visual_mapping.md`
- `scene_interaction_and_camera.md`
- `performance_and_fallback_strategy.md`
- `visual_test_strategy.md`

## Product Rule

The preview is a fast visual interpretation of the selected immutable design version. It is never the source of truth and must not be presented as fit approval, fabric simulation, or a production pattern.

## Current Implementation

The renderer implementation lives in `apps/desktop/src/renderer/src/preview` and includes:

- pure spec mapping
- procedural mannequin and dress geometry
- garment color and broad material cues
- constrained camera controls
- on-demand rendering
- safe 2D fallback
- mapper tests and browser visual verification
