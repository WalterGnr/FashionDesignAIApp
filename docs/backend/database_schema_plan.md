# Database Schema Plan

Last updated: 2026-07-08

Status: Sprint 06 planning artifact.

## Goal

Define the first PostgreSQL schema direction for designs, versions, model profiles, renders, materials, and exports.

## Schema Principles

- Use relational columns for stable searchable fields.
- Use JSONB for full structured snapshots and flexible nested sections.
- Keep immutable design versions.
- Tie renders and exports to exact version IDs.
- Add indexes only for expected query patterns.

## Tables

### `users`

Purpose:

- app account ownership and future collaboration.

Key columns:

- `id` UUID primary key
- `email` text unique nullable in local/dev mode
- `display_name` text
- `role` text
- `created_at` timestamptz
- `updated_at` timestamptz

### `designs`

Purpose:

- top-level design container.

Key columns:

- `id` UUID primary key
- `owner_user_id` UUID foreign key to `users.id`
- `name` text
- `garment_category` text
- `status` text
- `current_version_id` UUID nullable foreign key to `design_versions.id`
- `created_at` timestamptz
- `updated_at` timestamptz

Rules:

- MVP garment category is `dress`.
- current version pointer can change.
- design versions remain immutable.

### `design_versions`

Purpose:

- immutable version history.

Key columns:

- `id` UUID primary key
- `design_id` UUID foreign key to `designs.id`
- `version_number` integer
- `parent_version_id` UUID nullable self-reference
- `branch_id` UUID nullable
- `variation_label` text nullable
- `source` text
- `created_by_actor` text
- `raw_input_ref` text nullable
- `change_summary` text
- `spec_snapshot` JSONB
- `locked_fields_snapshot` JSONB
- `operation_ids` JSONB
- `created_at` timestamptz

Constraints:

- unique `(design_id, version_number)`
- version numbers increase per design
- no update to `spec_snapshot` after insert

### `design_operations`

Purpose:

- auditable operation records that explain how versions were created.

Key columns:

- `id` UUID primary key
- `design_id` UUID foreign key
- `version_id` UUID nullable foreign key to resulting version
- `actor` text
- `source` text
- `operation_type` text
- `target` text
- `payload` JSONB
- `confidence` numeric nullable
- `raw_input_ref` text nullable
- `created_at` timestamptz

### `command_events`

Purpose:

- text/voice command traceability without storing raw audio.

Key columns:

- `id` UUID primary key
- `design_id` UUID foreign key
- `version_id` UUID nullable foreign key
- `input_source` text
- `raw_input_text` text nullable
- `normalized_input_text` text nullable
- `interpretation_result` JSONB nullable
- `execution_status` text
- `created_at` timestamptz

### `model_profiles`

Purpose:

- reusable body measurement profiles.

Key columns:

- `id` UUID primary key
- `owner_user_id` UUID foreign key to `users.id`
- `display_name` text
- `measurement_unit_preference` text
- `measurements` JSONB
- `proportions` JSONB
- `privacy` JSONB
- `created_at` timestamptz
- `updated_at` timestamptz

### `renders`

Purpose:

- preview/concept render traceability.

Key columns:

- `id` UUID primary key
- `design_id` UUID foreign key
- `design_version_id` UUID foreign key
- `model_profile_id` UUID nullable foreign key
- `render_type` text
- `status` text
- `asset_url` text nullable
- `job_metadata` JSONB
- `created_at` timestamptz
- `updated_at` timestamptz

### `materials`

Purpose:

- material library and future cost estimation.

Key columns:

- `id` UUID primary key
- `name` text
- `fiber_content` text nullable
- `weight` text nullable
- `drape` text nullable
- `stretch` text nullable
- `cost_per_yard` numeric nullable
- `supplier` text nullable
- `metadata` JSONB
- `created_at` timestamptz
- `updated_at` timestamptz

### `tech_packs`

Purpose:

- manufacturer-facing export traceability.

Key columns:

- `id` UUID primary key
- `design_id` UUID foreign key
- `design_version_id` UUID foreign key
- `status` text
- `pdf_url` text nullable
- `spreadsheet_url` text nullable
- `export_metadata` JSONB
- `created_at` timestamptz
- `updated_at` timestamptz

## JSONB Index Direction

Use B-tree indexes for stable columns:

- owner IDs
- design IDs
- current version IDs
- status
- created timestamps
- version numbers

Use JSONB GIN indexes only after query needs are proven:

- finding designs by nested spec fields
- searching operation payloads
- querying measurement profiles by nested properties

PostgreSQL's current docs support GIN indexes for efficiently searching keys or key/value pairs inside many JSONB documents. The project should still avoid indexing every JSONB field prematurely.

