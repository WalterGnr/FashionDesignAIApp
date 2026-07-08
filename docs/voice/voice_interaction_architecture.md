# Voice Interaction Architecture

Last updated: 2026-07-08

Status: Sprint 05 planning artifact.

## Goal

Define the architecture for turning spoken designer commands into validated dress design operations.

## Recommended Flow

```text
Designer speech
  -> Electron renderer microphone capture
  -> realtime transcription session
  -> transcript event stream
  -> command boundary detection
  -> AI command interpretation
  -> domain operation validation
  -> accepted version or clarification/rejection
  -> UI preview/spec/version update
```

## Runtime Boundaries

### Electron Renderer

Responsibilities:

- request microphone permission
- show listening/processing/applying states
- display partial and final transcript text
- submit final command text into the same command path used by typed input
- never hold long-lived AI API keys

### Electron Main/Preload

Responsibilities:

- expose a narrow microphone/session support API if native desktop help is required later
- keep privileged desktop APIs out of React components
- provide safe app/environment status

### Backend

Responsibilities:

- create Realtime sessions or ephemeral client credentials
- hold standard OpenAI API keys
- enforce user/session policy
- log safe voice event metadata
- eventually persist transcript and command records by design version

### AI Command Interpreter

Responsibilities:

- convert final transcript text into structured operation proposals
- detect ambiguity and request clarification
- refuse out-of-scope garment categories
- preserve locked fields

### Domain Engine

Responsibilities:

- validate and apply accepted operations
- create immutable design versions
- reject invalid or locked-field changes

## Recommended Connection Choice

Use WebRTC for renderer-to-Realtime audio when the backend layer exists.

Current OpenAI documentation recommends WebRTC for browser-based client connections to realtime models, with either a unified backend session interface or an ephemeral token flow. For this product, the key rule is not the exact transport shape; the rule is that standard API keys stay server-side.

Reference docs:

- OpenAI Realtime overview: `https://developers.openai.com/api/docs/guides/realtime`
- OpenAI Realtime WebRTC: `https://developers.openai.com/api/docs/guides/realtime-webrtc`
- OpenAI realtime transcription: `https://developers.openai.com/api/docs/guides/realtime-transcription`

## First Implementation Slice For Sprint 05

The first voice implementation should be intentionally narrow:

- microphone button requests permission
- local voice state machine exists
- transcript display has partial/final slots
- session creation uses a mocked or backend-placeholder adapter until FastAPI exists
- final transcript reuses the typed command path from Sprint 04

Do not implement:

- production Realtime API credentials in the renderer
- background persistence
- continuous dictation that applies every partial phrase
- voice synthesis

