# Render Traceability And Idempotency

Last updated: 2026-07-09

Status: Sprint 08 planning artifact.

## Traceability Chain

Every visible concept render must resolve to:

```text
owner
  -> design
  -> immutable design version
  -> optional model profile
  -> immutable render input
  -> render job attempts
  -> stored render asset
```

## Idempotency Key

Build from canonical inputs:

- owner ID
- design version ID
- model profile ID or `none`
- render style and view
- quality and output size
- prompt contract version
- provider/model configuration
- sorted reference asset checksums

A repeated request with the same client idempotency key returns the existing active/completed job. A deliberate new variation gets a new variation nonce.

## Provider Correlation

Persist provider request/response IDs when available. They support debugging and reconciliation but are not primary keys.

## Webhook Rules

- verify signatures using the official SDK helper
- parse the raw request body before any JSON transformation
- store a provider event ID with a unique constraint
- acknowledge duplicate events without repeating side effects
- fetch/reconcile provider state rather than trusting arbitrary callback payload fields
- never expose the webhook signing secret to Electron

## Stale Render Rule

A render remains valid for its exact design version. If another version becomes current, mark the render as `from_prior_version` in the UI; do not mutate or silently regenerate it.
