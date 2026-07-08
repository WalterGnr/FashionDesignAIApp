# UI State Model

Last updated: 2026-07-08

Status: Sprint 04 planning artifact.

## Goal

Define the state needed for the first designer workflow UI.

## State Categories

### Domain State

Comes from domain packages or future backend.

Includes:

- current `DesignVersion`
- selected `DesignVersion`
- version history
- current `DressSpec`
- locked fields
- latest operation results

Rule:

- domain state is source-of-truth design data.

### Command State

Local UI state.

Includes:

- command input
- command source
- raw command history
- command status
- current clarification
- latest AI interpretation result
- latest execution result

Statuses:

- `idle`
- `interpreting`
- `applying`
- `accepted`
- `rejected`
- `needs_clarification`
- `no_op`

### Panel State

Local UI state.

Includes:

- active side panel
- collapsed panels
- selected field path
- selected version ID
- preview mode

### Environment State

App/system state.

Includes:

- desktop app info
- IPC health
- backend availability later
- renderer mode
- safe error messages

## Suggested Store Shape

Future implementation may use Zustand.

Conceptual shape:

```text
designerSessionStore
  currentVersion
  selectedVersionId
  versionHistory
  commandInput
  commandStatus
  latestInterpretation
  latestExecution
  currentClarification
  activePanel
  selectedFieldPath
```

## State Ownership Rules

Use local UI state for:

- panel visibility
- input text
- transient command status
- selected view state

Use domain/backend state for:

- saved design versions
- dress spec snapshots
- locked fields
- operation results

Do not:

- store unvalidated AI JSON as current design state
- mutate a spec object directly from a component
- treat generated image output as a saved version

## Initial Implementation Direction

First UI implementation can use React state if small.

Move to Zustand when:

- command state and panel state become shared across multiple components
- version selection affects preview and inspector together
- UI workflows become difficult to follow through prop passing
