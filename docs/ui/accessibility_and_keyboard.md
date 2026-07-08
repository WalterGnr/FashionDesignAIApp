# Accessibility And Keyboard Plan

Last updated: 2026-07-08

Status: Sprint 04 planning artifact.

## Goal

Plan basic accessibility and keyboard behavior for the first designer workflow UI.

## Keyboard Priorities

Important actions should be reachable without a mouse:

- focus command input
- submit command
- move between panels
- select version
- answer clarification
- open command history later

Suggested future shortcuts:

- `Ctrl+L`: focus command input
- `Ctrl+Enter`: submit command
- `Esc`: cancel transient panel or clear active selection

Shortcuts should not conflict with expected text editing behavior.

## Focus Management

Rules:

- command input receives focus on app start
- clarification options are keyboard reachable
- after command submission, focus should remain predictable
- rejected command should not steal focus unnecessarily

## Screen Reader Direction

Use semantic structure:

- buttons for actions
- tabs for panel switching
- status regions for command outcomes
- labels for inputs

Command result status should be announced through an appropriate live region later.

## Color And Status

Status should not rely on color only.

Use:

- text labels
- icons later
- badges with readable labels

Status categories:

- unknown
- assumed
- confirmed
- locked
- accepted
- rejected
- needs clarification

## Motion

Avoid motion that distracts from design work.

Use subtle transitions only when they clarify:

- panel open/close
- command status changes
- selected version changes

Respect reduced-motion preferences later.
