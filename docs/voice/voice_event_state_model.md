# Voice Event State Model

Last updated: 2026-07-08

Status: Sprint 05 planning artifact.

## Goal

Define the local state machine for voice interaction.

## Voice Session States

### `idle`

Meaning:

- microphone is off
- no active realtime session exists

Allowed transitions:

- `requesting_permission`

### `requesting_permission`

Meaning:

- user pressed the microphone control
- renderer is requesting microphone access

Allowed transitions:

- `connecting`
- `permission_denied`
- `error`

### `connecting`

Meaning:

- microphone is available
- session or adapter connection is being created

Allowed transitions:

- `listening`
- `error`

### `listening`

Meaning:

- audio is being captured
- partial transcripts may arrive

Allowed transitions:

- `processing_final_transcript`
- `interrupted`
- `idle`
- `error`

### `processing_final_transcript`

Meaning:

- a final transcript segment has been received
- the app is deciding whether it is a command boundary

Allowed transitions:

- `applying_command`
- `needs_confirmation`
- `listening`
- `idle`
- `error`

### `applying_command`

Meaning:

- final transcript is being sent to the AI command interpreter/domain engine

Allowed transitions:

- `listening`
- `needs_clarification`
- `idle`
- `error`

### `needs_clarification`

Meaning:

- transcript was understood enough to ask a follow-up question, not enough to safely mutate the dress

Allowed transitions:

- `listening`
- `applying_command`
- `idle`

### `interrupted`

Meaning:

- designer stopped or corrected the current utterance before it became a committed command

Allowed transitions:

- `listening`
- `idle`

### `permission_denied`

Meaning:

- OS/browser microphone access was denied

Allowed transitions:

- `idle`
- `requesting_permission`

### `error`

Meaning:

- recoverable technical error in audio capture, connection, or transcript handling

Allowed transitions:

- `idle`
- `requesting_permission`

## Voice Event Records

Store locally during a session:

- event ID
- event type
- timestamp
- partial transcript text if allowed
- final transcript text if allowed
- command boundary decision
- linked command result ID when applied

Do not store:

- raw audio by default
- sensitive measurement speech longer than needed
- API credentials

## UI State Mapping

- `idle`: microphone button neutral
- `requesting_permission`: pending
- `connecting`: connecting
- `listening`: active listening
- `processing_final_transcript`: processing
- `applying_command`: applying
- `needs_clarification`: clarification banner
- `permission_denied`: microphone permission message
- `error`: recoverable voice error message

