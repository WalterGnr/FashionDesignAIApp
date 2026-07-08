# Designer Workflow UI Planning

Last updated: 2026-07-08

Status: Sprint 04 planning artifacts plus initial implementation.

## Purpose

This folder defines the first designer-facing workflow UI before implementation begins.

The UI should feel like a professional creative production tool: canvas first, command-driven, transparent about AI changes, and grounded in the structured dress spec.

## Core UI Principle

```text
The preview/canvas is the focus.
The command bar accelerates action.
The side panels explain state, changes, locks, and versions.
```

## Sprint 04 Documents

- `main_workspace_layout.md`
- `core_components.md`
- `designer_interaction_flows.md`
- `ui_state_model.md`
- `empty_error_loading_states.md`
- `accessibility_and_keyboard.md`

## Implemented UI Slice

Implemented in:

- `apps/desktop/src/renderer/src/main.tsx`
- `apps/desktop/src/renderer/src/styles.css`
- `apps/desktop/src/renderer/src/designer-session.ts`

Current capabilities:

- typed command bar
- AI change review
- spec inspector
- selectable version timeline
- locked fields panel
- structured preview driven by the selected dress spec

## Implementation Reminder

Do not build a landing page as the first screen.

The first screen should be the usable designer workspace.

The UI should reuse:

- `@fashion-design-ai/domain`
- `@fashion-design-ai/ai`

The UI must not treat raw AI text or generated images as the source of truth.
