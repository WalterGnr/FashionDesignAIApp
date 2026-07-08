# Latency And Quality Targets

Last updated: 2026-07-08

Status: Sprint 05 planning artifact.

## Goal

Set realistic expectations for voice responsiveness and trust.

## Latency Targets

Early MVP target:

- microphone state response: under 200 ms after click
- partial transcript visibility: under 800 ms during speech when service supports it
- final transcript to command result: under 2 seconds for local/provider-free interpreter
- accepted command to UI update: under 300 ms after domain validation

Future production target:

- final transcript to visible proposed change: under 1.5 seconds for common commands
- clarification prompt: under 2 seconds
- no UI blocking during transcription

## Quality Targets

The voice system is acceptable when:

- the user always knows whether the app is listening
- partial text does not commit design changes
- final command text is visible before or alongside the applied change
- unclear commands become clarifications
- locked fields are protected
- command results are traceable to versions

## Failure Budget

Prefer a clarification over a wrong mutation.

Wrongly changing a dress detail is more harmful than asking one extra question.

## Measurement Plan

Track later:

- time from microphone press to listening
- time from speech stop to final transcript
- time from final transcript to accepted/rejected/clarification result
- clarification rate
- rejected command rate
- undo after voice command rate

