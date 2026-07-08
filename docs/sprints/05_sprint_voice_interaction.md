# Sprint 05: Voice Interaction Planning

Status: Planning completed on 2026-07-08.

Suggested duration: 1 to 2 weeks.

## Goal

Plan the real-time voice workflow that lets designers speak naturally and revise dresses quickly while keeping the structured garment spec as the source of truth.

## Why This Sprint Matters

Voice is the primary interaction method. The product succeeds only if speaking feels faster than typing and accurate enough to trust.

## Primary Deliverables

- Voice interaction architecture
- Speech-to-text event flow
- Realtime session security plan
- Transcript handling rules
- Correction and interruption flow
- Latency expectations
- Privacy and retention expectations
- Voice implementation readiness criteria

## Planning Artifacts

- `docs/voice/README.md`
- `docs/voice/voice_interaction_architecture.md`
- `docs/voice/voice_event_state_model.md`
- `docs/voice/transcript_handling_rules.md`
- `docs/voice/correction_and_interruption_flow.md`
- `docs/voice/realtime_session_security.md`
- `docs/voice/latency_and_quality_targets.md`
- `docs/sprints/05_sprint_progress_tracker.md`
- `docs/sprints/05_sprint_completion_record.md`

## Key Planning Tasks

- Decide how microphone input starts/stops.
- Define voice session states from idle through listening, applying, clarification, interruption, permission denied, and error.
- Define transcript handling for partial transcript, final transcript, command boundary, and correction command.
- Define voice correction examples:
  - "No, undo that."
  - "Keep the neckline."
  - "I meant satin, not silk."
- Define secure AI session handling.
- Define how much transcript history is stored.
- Define privacy expectations.
- Define latency expectations for the first usable voice workflow.

## Current Architecture Decision

The first production-minded voice architecture should use a backend-controlled session broker.

Renderer:

- requests microphone permission
- manages local listening state
- shows partial/final transcript feedback
- sends final transcript into the typed command flow

Backend:

- holds standard AI API keys
- creates realtime sessions or ephemeral credentials
- enforces rate limits and session duration
- avoids raw audio persistence by default

Domain/AI packages:

- interpret final transcript text
- validate structured operations
- create immutable versions only after accepted changes

## First Implementation Slice For Future Sprint 05

Build:

- microphone button state machine
- transcript panel state
- mock voice adapter or backend placeholder
- final transcript submission through existing command handler
- permission/error/clarification states

Do not build yet:

- production Realtime API call from renderer
- long-lived API keys in desktop app
- raw audio storage
- voice synthesis

## Non-Goals

- No live microphone code.
- No Realtime API integration.
- No prompt implementation.
- No UI implementation beyond planning.

## Acceptance Criteria

- Voice flow is documented from microphone to validated operation.
- Correction behavior is clear.
- API secrets are never planned for the renderer.
- Latency expectations are realistic.
- Transcript retention and privacy expectations are documented.
- The first implementation slice can be built without guessing the session state model.

## Risks

- Speech recognition mistakes can damage trust.
- Real-time APIs can add cost and complexity.
- Designers may speak in fragments while thinking.

## Senior Developer Notes

Do not apply every partial transcript as a committed change. Partial speech can inform previews, but saved design changes need clear operation boundaries.
