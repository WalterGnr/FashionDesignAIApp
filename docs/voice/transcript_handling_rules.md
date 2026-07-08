# Transcript Handling Rules

Last updated: 2026-07-08

Status: Sprint 05 planning artifact.

## Goal

Define how partial and final speech transcripts should affect design state.

## Transcript Types

### Partial Transcript

Use for:

- live text feedback
- confidence-building UI
- future lightweight preview hints

Do not use for:

- saved design versions
- irreversible operations
- locked field changes
- production exports

### Final Transcript

Use for:

- command boundary evaluation
- AI command interpretation
- clarification or rejection
- accepted operations that create versions

## Command Boundary Rules

A final transcript may become a command when:

- the user pauses long enough
- the user explicitly stops listening
- the user says an action phrase such as "apply that"
- the interaction mode is push-to-talk and the button is released

A final transcript should not become a command when:

- it is an obvious thinking fragment
- it contradicts itself
- it references "that" without enough context
- it tries to change a locked field without explicit unlock intent

## Storage Rules

For MVP planning:

- keep recent transcript text in memory during the session
- persist only final transcript text linked to accepted, rejected, no-op, or clarification command records later
- do not store raw audio by default

## Privacy Notes

Voice may include body measurements, fit notes, client names, or private brand direction.

The app should eventually expose:

- session transcript retention setting
- clear indicator when listening
- way to clear local transcript history
- policy for whether transcript text is sent to backend logs

