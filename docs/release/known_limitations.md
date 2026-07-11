# Known Limitations

Last updated: 2026-07-11

## Internal Alpha Limitations

- The product supports dresses only.
- Windows 11 x64 is the only Sprint 10 target.
- The Electron installer does not include the backend, PostgreSQL, Redis, or Celery worker.
- Internal testers must run the documented local service stack, currently using Docker Desktop.
- The API uses one fixed development owner and is not suitable for multiple users or an exposed network.
- The primary voice path captures microphone state and supports sample/local transcript review; it is not production OpenAI Realtime transcription.
- Deterministic mock rendering is the Tier 1 quality gate. Live OpenAI image generation requires credentials, cost approval, and separate evaluation.
- Concept renders are visual communication references and are not proof of fit, construction, fabric physics, or manufacturability.
- Tech packs disclose missing and assumed data but do not replace pattern making, grading, costing, compliance, or manufacturer review.
- Rendering and export assets use local filesystem storage.
- No automatic update channel is provided.
- Unsigned internal installers may trigger strong Windows warnings and are not for public distribution.
- Offline synchronization and multi-device use are not supported.
- Real-time collaboration, comments, approvals, and organizational roles are not supported.

## Current Gaps Sprint 10 Must Close for Tier 1

- desktop design discovery and restart recovery
- service and worker readiness reporting
- packaged installer and clean-machine verification
- automated Electron end-to-end and visual regression tests
- redacted diagnostics and recovery instructions
- IPC sender validation, permission denial policy, protocol/CSP/fuse review

## External Customer Release Blockers

- production authentication and authorization
- hosted backend and private object storage, or a separately approved bundled-runtime architecture
- TLS and production network perimeter
- production voice transcription and consent/privacy flow
- public code signing and distribution ownership
- operational monitoring, alerting, backup, restore, retention, and incident ownership
- legal/privacy terms for designer content and AI provider processing
- live-provider quality, latency, cost, and abuse testing
- formal supported hardware requirements and customer support process

## Not Claimed

The application does not claim physically accurate draping, automatic sewing patterns, automatic grading, regulatory compliance, supplier availability, final costing, or error-free manufacturer instructions.

This document must ship with every internal alpha and be updated whenever a limitation is added, removed, or materially changed.
