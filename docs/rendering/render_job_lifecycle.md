# Render Job Lifecycle

Last updated: 2026-07-09

Status: Sprint 08 planning artifact.

## Goal

Define a durable, observable job lifecycle that survives desktop disconnects, worker restarts, provider latency, and retries.

## States

- `queued`: accepted and committed to PostgreSQL, awaiting dispatch or worker claim
- `running`: claimed by one worker with a renewable lease
- `succeeded`: asset persisted and final metadata committed
- `failed`: terminal failure requiring a new user action or operator intervention
- `retrying`: recoverable failure with a scheduled next attempt
- `cancel_requested`: user requested cancellation; worker should stop before the next irreversible boundary
- `canceled`: no more provider or storage work will be attempted

## State Transitions

```text
queued -> running -> succeeded
queued -> canceled
queued -> running -> retrying -> running
queued -> running -> failed
queued -> cancel_requested -> canceled
running -> cancel_requested -> canceled | succeeded
```

If cancellation arrives after the provider completed, the system may retain the generated asset for audit while hiding it from the active comparison set. The UI must explain that provider cost may already have occurred.

## Database Record

Proposed `render_jobs` columns:

- `id` UUID primary key
- `owner_user_id` UUID
- `design_id` UUID
- `design_version_id` UUID
- `model_profile_id` UUID nullable
- `render_style` text
- `status` text
- `quality` text
- `output_size` text
- `prompt_contract_version` text
- `provider` text
- `provider_model` text
- `provider_request_id` text nullable
- `attempt_count` integer
- `max_attempts` integer
- `idempotency_key` text unique
- `lease_owner` text nullable
- `lease_expires_at` timestamptz nullable
- `next_attempt_at` timestamptz nullable
- `error_code` text nullable
- `safe_error_message` text nullable
- `created_at`, `started_at`, `completed_at`, `updated_at`

The immutable input snapshot belongs in a separate `render_job_inputs` row or immutable JSONB column so a retry never silently picks up a newer design version.

## Retry Rules

Retry:

- network timeout before a confirmed provider result
- provider 429 using bounded exponential backoff and server hints
- provider 5xx
- transient object-storage failure
- expired worker lease when no terminal provider result exists

Do not automatically retry:

- invalid input contract
- unsupported image/reference format
- policy refusal
- ownership failure
- exhausted budget or quota
- permanent provider validation error

## Progress Events

Persist compact events for:

- job accepted
- worker claimed
- provider request started
- provider result received
- asset stored
- retry scheduled
- job failed, canceled, or completed

Do not store base64 image payloads or secrets in events.
