# Realtime Session Security

Last updated: 2026-07-08

Status: Sprint 05 planning artifact.

## Goal

Define secure handling for realtime voice sessions.

## Non-Negotiable Rule

Long-lived OpenAI API keys must never be stored in the Electron renderer or bundled into frontend code.

## Recommended Session Pattern

Use a backend-controlled session broker.

Flow:

```text
Renderer requests voice session
  -> Backend authenticates user/app session
  -> Backend creates Realtime session or ephemeral credential
  -> Renderer connects with short-lived session material
  -> Renderer sends audio through WebRTC
  -> Final transcript is routed to command interpretation
```

## Backend Responsibilities

- hold standard API keys
- enforce rate limits
- limit session duration
- attach session to user/design context
- avoid logging raw audio
- sanitize transcript logs
- revoke or expire credentials quickly

## Renderer Responsibilities

- show active listening state
- request microphone permission only after user action
- store short-lived session material only in memory
- clear session state on stop/error/app close

## Electron Security Notes

- keep `contextIsolation` enabled
- keep `nodeIntegration` disabled
- avoid exposing generic network or filesystem APIs through preload
- validate any future voice IPC input with schemas

## Risk Controls

### Secret Exposure

Mitigation:

- backend-only standard API keys
- ephemeral or backend-mediated sessions
- no secrets in logs

### Over-Collection

Mitigation:

- no raw audio persistence by default
- transcript retention controls later
- clear listening indicator

### Cost Spikes

Mitigation:

- explicit start/stop control
- idle timeout
- session duration cap
- backend rate limiting

