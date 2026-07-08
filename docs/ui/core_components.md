# Core Components

Last updated: 2026-07-08

Status: Sprint 04 planning artifact.

## Goal

Define the component inventory for the first designer workflow UI.

## Component List

### `WorkspaceShell`

Owns the main layout.

Contains:

- command bar
- preview workspace
- side panel area

### `CommandBar`

Owns command input and command status.

Controls:

- text input
- submit button
- microphone button placeholder
- command status indicator

States:

- idle
- interpreting
- applying
- needs clarification
- rejected
- accepted
- no-op

### `PreviewWorkspace`

Owns current design visualization area.

Initial content:

- selected version ID
- design summary
- major spec fields
- placeholder dress preview driven by structured data

Future content:

- 2D/3D preview
- render status overlay
- model profile selection

### `AIChangeReview`

Shows what happened after a command.

Content:

- raw command
- interpreted intent
- result status
- operation list
- changed field paths
- clarification question
- rejection reason

### `SpecInspector`

Shows structured dress spec.

Field display should distinguish:

- unknown
- assumed
- confirmed
- locked

### `VersionTimeline`

Shows version history.

Content:

- version number
- change summary
- created time
- source
- selected/current indicator

### `LockedFieldsPanel`

Shows locked fields.

Content:

- field label
- field path
- reason
- lock source

### `StatusBanner`

Shows high-priority state:

- backend unavailable later
- command rejected
- clarification required
- unsaved local state later

### `FieldStatusBadge`

Small reusable visual indicator for:

- unknown
- assumed
- confirmed
- locked

## Component Ownership Rules

UI components should not:

- mutate dress specs directly
- parse raw AI output
- own domain validation rules
- access Electron APIs directly

UI components may:

- call typed app services
- display domain objects
- dispatch UI state actions
- call preload API wrappers when needed

## Data Dependencies

Use:

- `DressSpec`
- `DesignVersion`
- `LockedField`
- AI interpretation/execution results

Avoid:

- duplicated UI-only garment schemas
- raw prompt text as design state
- unvalidated AI JSON
