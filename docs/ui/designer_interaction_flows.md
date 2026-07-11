# Designer Interaction Flows

Last updated: 2026-07-08

Status: Sprint 04 planning artifact.

## Goal

Define the first designer workflow flows for the UI.

## Flow 1: Start A Design

1. Designer opens app.
2. Workspace displays initial dress design state.
3. Preview area shows an empty or minimal dress state.
4. Command bar is focused.
5. Spec inspector shows unknown fields.
6. Version timeline shows initial version.

Success criteria:

- designer can immediately enter a command
- canvas is visually dominant
- no setup wizard blocks creative work

## Flow 2: Apply Typed Command

1. Designer types command.
2. UI sets command status to interpreting.
3. Command routes to AI command interpretation package or future backend.
4. Proposed operations are validated/applied.
5. UI displays result in change review.
6. If accepted, preview/spec/timeline update.

Result branches:

- accepted
- rejected
- needs clarification
- no-op

## Flow 3: Clarification

1. Command returns clarification.
2. Change review shows the question.
3. Options are displayed if available.
4. Designer selects option or types answer.
5. Follow-up command is submitted with context.

Rule:

- no new version is created until a valid operation is accepted.

## Flow 4: Rejection

1. Command returns rejection.
2. UI shows reason and affected field if available.
3. Designer can rephrase or unlock intentionally.

Examples:

- unsupported garment category
- locked field
- invalid measurement
- unknown field

Rule:

- rejection should be calm and actionable.

## Flow 5: Lock A Detail

1. Designer selects field or uses command.
2. UI shows lock intent.
3. Operation creates a new metadata version.
4. Locked field appears in locked fields panel.
5. Future AI changes to that field are blocked.

## Flow 6: Inspect Versions

1. Designer opens version timeline.
2. Selects prior version.
3. Preview and spec inspector show selected version.
4. Current version remains clearly marked.
5. Future revert action creates a new version.

## Flow 7: Export Tech Pack

Sprint 09 implementation replaced the original placeholder with a version-scoped export workflow.

Current workflow:

- persist the exact selected version through the shared backend design session
- check production readiness before generation
- show blockers and warnings without hiding missing data
- require explicit acknowledgement before generating an incomplete draft
- generate PDF and XLSX independently through the background worker
- show per-format completion and open completed files through Electron IPC

## Flow 8: Backend Unavailable Later

When backend is introduced:

1. UI detects unavailable backend.
2. Command bar shows unavailable state.
3. Local preview remains usable if possible.
4. Saves/AI commands are blocked or queued according to future backend plan.

Sprint 04 only plans this state.
