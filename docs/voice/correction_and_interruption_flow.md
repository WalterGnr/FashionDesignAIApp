# Correction And Interruption Flow

Last updated: 2026-07-08

Status: Sprint 05 planning artifact.

## Goal

Plan how designers correct voice mistakes without losing creative momentum.

## Correction Categories

### Immediate Speech Correction

Examples:

- "I meant satin, not silk."
- "No, say floor length."
- "Actually make it off shoulder."

Behavior:

- treat the correction as a new final command
- show what field will change
- create a new version only after validation

### Undo Or Revert

Examples:

- "No, undo that."
- "Go back to version 3."
- "Use the neckline from version 2."

Behavior:

- map to existing version/revert operations
- never silently erase prior versions
- show selected target version before applying when ambiguous

### Protected Detail Correction

Examples:

- "Keep the neckline."
- "Lock the fabric."
- "Do not change the skirt shape."

Behavior:

- map to lock operations where supported
- show lock reason and field path
- future commands that conflict should be rejected or clarified

### Interruption

Examples:

- user stops listening mid-sentence
- user says "cancel"
- user presses escape

Behavior:

- discard uncommitted partial transcript
- keep the last accepted version unchanged
- display a calm canceled state

## Clarification Handling

When AI asks a clarification:

- do not create a version
- show question and options
- allow voice or typed answer
- preserve the original command context

## Trust Rule

The designer should always see:

- what the app heard
- what the AI thought it meant
- what changed
- which version was created

