# Export Lifecycle And Storage

Last updated: 2026-07-09

Status: Sprint 09 planning artifact.

## Lifecycle

```text
validating -> blocked
validating -> queued -> running -> succeeded
validating -> queued -> running -> succeeded_with_partial_formats
validating -> queued -> running -> retrying -> running
validating -> queued -> running -> failed
queued | running -> cancel_requested -> canceled | succeeded
```

## Persistence

### `tech_pack_jobs`

- owner, design, and exact design-version IDs
- status and readiness state
- export contract/template versions
- snapshot hash and idempotency key
- requested formats and per-format statuses
- attempts, lease, safe error, and timestamps

### `tech_pack_inputs`

- immutable normalized snapshot JSONB
- readiness issues JSONB
- selected visual asset IDs/checksums
- presentation locale, unit preference, and page-size preset

### `tech_pack_assets`

- job ID, format, storage object key, MIME type, byte size, SHA-256, and timestamp

## Idempotency

The key includes owner, version, contract/template versions, selected render checksum, locale, unit preference, page size, and requested formats. Repeating the same request returns the existing active/completed job. A deliberate regeneration includes a new nonce.

## Object Keys

```text
owners/{owner_id}/designs/{design_id}/versions/{version_id}/tech-packs/{job_id}/{asset_id}.{ext}
```

## Regeneration

- never overwrite an asset
- retain the old export record and checksums
- create a new job when template, locale, selected render, or source version changes
- show stale-template status without mutating prior exports

## Security

- private storage only
- ownership check before download
- short-lived delivery URL or API streaming response
- no signed URLs or sensitive measurements in general logs
- bounded generation time and file size
