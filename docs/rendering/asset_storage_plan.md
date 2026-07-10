# Render Asset Storage Plan

Last updated: 2026-07-09

Status: Sprint 08 planning artifact.

## Storage Direction

Use an object-storage abstraction:

- local filesystem adapter for development
- S3-compatible adapter for production

The database stores asset metadata and object keys, never image blobs or expiring signed URLs.

## Asset Record

Proposed `render_assets` columns:

- `id` UUID
- `render_job_id` UUID
- `design_version_id` UUID
- `model_profile_id` UUID nullable
- `storage_provider` text
- `object_key` text unique
- `content_type` text
- `byte_size` bigint
- `sha256` text
- `width` integer
- `height` integer
- `output_format` text
- `created_at` timestamptz
- `deleted_at` timestamptz nullable

## Object Key Shape

```text
owners/{owner_id}/designs/{design_id}/versions/{version_id}/renders/{render_job_id}/{asset_id}.png
```

Object keys are internal identifiers. The API returns short-lived signed download URLs after ownership checks.

## Upload Safety

- decode provider output with maximum-size limits
- verify actual image type from bytes
- reject unsupported dimensions or decompression bombs
- compute checksum before final publication
- upload to a temporary key, then promote atomically when possible
- keep buckets private
- remove EXIF/metadata unless explicitly needed and approved

## Retention

- do not delete an asset solely because a newer version exists
- allow explicit soft deletion from active UI
- retain audit metadata after asset deletion
- define workspace retention and legal policies before production
