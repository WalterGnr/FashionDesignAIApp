# Error Handling Plan

Last updated: 2026-07-05

Status: Sprint 02 planning artifact.

## Purpose

Define how the app should handle failures during AI command interpretation.

The goal is to keep the designer in control even when AI output is malformed, ambiguous, blocked, or unavailable.

## Error Handling Principle

```text
Failures must not mutate design state.
```

If the app is unsure, it should ask, reject, or retry safely. It should not create silent design changes.

## Error Categories

### Input Errors

Examples:

- empty command
- command too long
- command language unsupported or unclear
- voice transcript incomplete

Handling:

- return `no_op` for empty input
- ask for clarification for incomplete input
- store raw input for traceability when useful

### AI Availability Errors

Examples:

- API timeout
- network failure
- provider unavailable
- rate limit
- authentication failure

Handling:

- do not create version
- show recoverable error
- allow retry
- preserve typed command
- log safely without secrets

### AI Output Errors

Examples:

- invalid JSON
- missing required fields
- unsupported operation type
- schema mismatch
- low confidence

Handling:

- reject malformed output
- optionally retry once with stricter repair instruction later
- ask designer to rephrase if repeated
- never apply malformed operation

### Domain Validation Errors

Examples:

- unknown field path
- unsupported garment category
- invalid enum value
- invalid measurement
- locked field conflict

Handling:

- return `rejected` or `needs_clarification`
- include reason code
- include field path when available
- do not create version

### Persistence Errors Later

Examples:

- database write failure
- version conflict
- duplicate ID
- transaction rollback

Handling:

- do not mark command accepted until save succeeds
- keep proposed operation available for retry
- show that no saved version was created

### Security Errors

Examples:

- API key missing
- frontend attempts to access AI secret
- unsafe file/reference payload
- excessive sensitive body measurement logging

Handling:

- block request
- record safe diagnostic
- do not expose secret values
- route setup issue to developer/admin workflow

## User-Facing Message Style

Messages should be:

- short
- specific
- actionable
- calm

Examples:

```text
I need the unit before shortening the dress. Do you mean 2 inches or 2 centimeters?
```

```text
The neckline is locked. Unlock it before changing neckline details.
```

```text
I could not interpret that safely. Please rephrase the design change.
```

Avoid:

- raw stack traces
- model/provider jargon
- blamey language
- exposing prompt or API internals

## Retry Policy

Suggested future retry rules:

- Network timeout: retry once automatically if safe
- Rate limit: do not auto-loop; show wait/retry state
- Invalid AI output: one repair attempt maximum
- Locked field: no retry; ask designer
- Missing measurement unit: no retry; ask designer

## Logging Policy

Safe to log:

- command ID
- result status
- reason code
- operation types
- field paths
- timing
- model/provider request ID if available

Avoid logging:

- real API keys
- complete body measurement profiles unless explicitly permitted
- full private reference files
- sensitive user identity fields

Raw commands may be logged for debugging, but future privacy settings should allow reducing or disabling this.

## Backend Error Boundary Later

The backend should be the boundary for:

- AI credentials
- provider errors
- AI request/response audit records
- rate-limit handling
- safety identifiers

The Electron renderer should receive sanitized errors only.

## Error Codes

Recommended AI interpretation error codes:

- `empty_input`
- `input_too_long`
- `ai_timeout`
- `ai_rate_limited`
- `ai_auth_missing`
- `ai_parse_error`
- `schema_violation`
- `unknown_operation_type`
- `unknown_field`
- `invalid_value`
- `invalid_measurement`
- `unsupported_category`
- `locked_field`
- `low_confidence`
- `needs_clarification`
- `persistence_failed`

## Recovery Paths

| Error | Recovery |
| --- | --- |
| `empty_input` | Ask designer to enter a command |
| `ai_timeout` | Retry command |
| `ai_rate_limited` | Wait and retry |
| `ai_parse_error` | Retry once with repair prompt later |
| `unknown_field` | Reject and log schema mismatch |
| `invalid_measurement` | Ask for corrected measurement |
| `unsupported_category` | Explain MVP is dresses only |
| `locked_field` | Ask whether designer wants to unlock |
| `low_confidence` | Ask clarifying question |
| `persistence_failed` | Retry save before claiming success |

## Sprint 02 Boundary

This document is an error handling plan only.

It does not implement:

- error classes
- API responses
- UI toasts/dialogs
- retry queues
- logs
- telemetry
