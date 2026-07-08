# Main Workspace Layout

Last updated: 2026-07-08

Status: Sprint 04 planning artifact.

## Goal

Define the first desktop workspace layout for the designer workflow.

The layout should support fast command-driven dress design while keeping the preview/canvas visually dominant.

## Layout Structure

```text
┌────────────────────────────────────────────────────────────┐
│ Command Bar                                                │
├───────────────────────────────┬────────────────────────────┤
│                               │ Change Review / Inspector  │
│                               │                            │
│ Preview / Canvas              ├────────────────────────────┤
│                               │ Version Timeline / Locks   │
│                               │                            │
└───────────────────────────────┴────────────────────────────┘
```

## Command Bar

Primary role:

- accept typed command in early UI
- host microphone control later
- show command processing status
- keep save/export status visible

Elements:

- command text input
- send/apply command button
- microphone button placeholder
- status indicator
- app/backend availability indicator later
- export action placeholder

Design rule:

- compact and persistent, not hero-sized.

## Preview / Canvas

Primary role:

- show current selected design state
- eventually host 2D/3D preview
- preserve the sense of a creative workspace

Initial implementation can use:

- structured placeholder preview
- dominant color swatch
- simple dress silhouette label
- current version marker

Future implementation:

- visual preview from structured spec
- 2D/3D canvas
- render status overlays

Design rule:

- use stable dimensions and avoid layout shift.

## Right-Side Panels

Panels should be dense but calm.

Suggested panel stack:

- AI Change Review
- Spec Inspector
- Version Timeline
- Locked Fields

For the first UI implementation, panels can be tabs or collapsible sections.

## Responsive Direction

Desktop first.

Minimum useful desktop width:

- 1280px target
- 1024px fallback

Small-width behavior:

- command bar remains top
- preview remains first
- panels become tabs below or slide-over panels

## Visual Tone

The UI should be:

- quiet
- precise
- production-aware
- creative but not decorative
- dense enough for repeated use

Avoid:

- landing-page hero layout
- marketing cards
- oversized decorative sections
- gradients or decoration that compete with the dress preview
