# Empty, Error, And Loading States

Last updated: 2026-07-08

Status: Sprint 04 planning artifact.

## Goal

Plan states that make the UI feel reliable even before every feature exists.

## Empty States

### No Design Started

Show:

- neutral preview area
- command input ready
- short empty spec summary
- initial version state

Avoid:

- marketing copy
- setup friction
- blank unexplained screen

### No Command Yet

Change review should show:

- no recent command
- ready state

### No Locked Fields

Locked panel should show:

- no locked fields yet
- future lock action context

## Loading States

### Interpreting Command

Show:

- command status as interpreting
- command text preserved
- preview remains stable

### Applying Operation

Show:

- applying state
- avoid optimistic hidden changes unless result is safe

### Loading App Info

Show:

- minimal shell state
- IPC health pending

## Error States

### Rejected Command

Show:

- reason
- affected field if available
- suggested next action

### Clarification Required

Show:

- question
- options if available
- free-text answer if allowed

### IPC Error

Show:

- safe message
- retry option if useful

Do not show:

- stack traces
- internal channel details
- secrets

### Backend Unavailable Later

Show:

- backend unavailable state
- commands requiring backend disabled
- local UI remains readable

## Disabled Future Features

Features planned but unavailable should be visibly disabled:

- live microphone
- tech pack export
- high-quality render
- backend save

Disabled controls should have clear labels or tooltips.
