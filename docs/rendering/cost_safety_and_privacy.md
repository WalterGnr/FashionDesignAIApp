# Render Cost, Safety, And Privacy

Last updated: 2026-07-09

Status: Sprint 08 planning artifact.

## Cost Controls

- limit variations per request
- default to one medium-quality portrait render
- require explicit action for high-quality batches
- enforce per-user/workspace daily budgets
- cap queue depth and concurrent provider calls
- record estimated and actual usage when available
- retry only transient failures with a small maximum attempt count
- deduplicate identical requests through idempotency keys

Do not hard-code pricing in domain logic. Cost configuration and displayed estimates must be versioned because provider pricing changes.

## Safety

- validate render requests against dress-only MVP scope
- preserve provider refusals as safe terminal states
- do not repeatedly modify prompts to evade safety systems
- rate-limit render creation separately from normal design editing
- sanitize errors returned to Electron

## Body Profile Privacy

- use the minimum measurements needed for the selected visualization
- send normalized descriptive attributes when exact measurements are unnecessary
- require ownership and consent checks
- never include body measurements in generic logs or object keys
- make retention/export permissions explicit

## Reference Image Privacy

- record uploader, consent, purpose, and retention metadata
- scan and validate files before provider submission
- use private object storage and short-lived signed URLs
- do not train internal style memory from references without separate consent

## Provider Data Handling

Background Responses API mode has provider-side retention implications and is not suitable for a Zero Data Retention guarantee. The first render worker should therefore own its durable job state and use the narrowest provider request mode that meets the product need.
