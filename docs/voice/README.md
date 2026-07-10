# Voice Interaction Planning

Last updated: 2026-07-08

Status: Sprint 05 planning artifacts plus initial implementation.

## Purpose

This folder defines how voice interaction should work before implementation begins.

Voice is the product's primary acceleration layer, but it must not bypass the structured garment spec. Spoken input becomes transcript events, transcript events become validated design intent, and only validated operations can modify the dress version state.

## Core Principle

```text
Voice captures intent quickly.
AI interprets intent carefully.
The domain engine validates every change.
The designer stays in control.
```

## Sprint 05 Documents

- `voice_interaction_architecture.md`
- `voice_event_state_model.md`
- `transcript_handling_rules.md`
- `correction_and_interruption_flow.md`
- `realtime_session_security.md`
- `latency_and_quality_targets.md`

## Implementation Reminder

Sprint 05 implementation should not store long-lived AI API keys in the Electron renderer.

The future renderer may request microphone permission and manage local WebRTC state, but secure AI session creation belongs behind a backend-controlled boundary.

## Implemented Voice Slice

Implemented in:

- `apps/desktop/src/renderer/src/voice-session.ts`
- `apps/desktop/src/renderer/src/main.tsx`
- `apps/desktop/tests/voice-session.test.ts`

Current capabilities:

- local voice session state machine
- microphone permission request path
- partial/final transcript state
- sample transcript flow for development
- final transcript application through the validated command path

Still future:

- production Realtime API session broker
- live streamed transcription
- backend transcript persistence
- voice session cost controls
