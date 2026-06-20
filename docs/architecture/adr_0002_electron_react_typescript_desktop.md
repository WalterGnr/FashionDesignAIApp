# ADR 0002: Use Electron, React, TypeScript, and Vite for the Desktop App

Date: 2026-06-19

Status: Accepted

## Context

The user wants real computer software. The MVP needs a desktop interface with microphone controls, a visual design surface, future file export, and a fast development path.

## Decision

Use Electron for the desktop shell, React for the UI, TypeScript for type safety, and Vite for frontend build tooling.

## Consequences

Positive:

- Fast path to a Windows desktop application.
- Strong ecosystem and documentation.
- React is well suited to the app's canvas, panels, timeline, and inspector UI.
- TypeScript helps protect design specs, IPC contracts, and API contracts.
- Vite gives a fast development loop.

Negative:

- Electron apps require careful security work.
- App size may be larger than alternatives.
- Main/renderer process boundaries must be maintained deliberately.

## Alternatives Considered

### Tauri

Attractive for smaller binaries and strong security posture, but adds Rust/Tauri-specific complexity. It remains a future option if app size and security model outweigh Electron's speed of development.

### Web-only app

Rejected for the current direction because the user explicitly wants computer software.

### Native Windows app

Not selected because it would slow early iteration and reduce reuse of web/AI tooling.

## Review Trigger

Revisit if Electron security, packaging, or performance becomes a serious blocker.
