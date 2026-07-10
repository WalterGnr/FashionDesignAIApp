# Sprint 08: Async Rendering and AI Images

Status: Planning and implementation completed on 2026-07-09.

Suggested duration: 1 to 2 weeks.

## Goal

Plan high-quality concept rendering through asynchronous jobs and AI image generation.

## Why This Sprint Matters

High-quality images can inspire and communicate the design, but they are slower and less consistent than structured spec updates. They should not block the designer's flow.

## Primary Deliverables

- Render job model
- Background worker plan
- AI image generation strategy
- Object storage plan
- Render traceability rules
- Variation comparison plan
- Cost, safety, and privacy plan
- Sprint 08 progress tracker
- Sprint 08 completion record

## Planning Artifacts

- `docs/rendering/README.md`
- `docs/rendering/render_job_lifecycle.md`
- `docs/rendering/image_generation_strategy.md`
- `docs/rendering/render_prompt_contract.md`
- `docs/rendering/worker_and_queue_architecture.md`
- `docs/rendering/asset_storage_plan.md`
- `docs/rendering/traceability_and_idempotency.md`
- `docs/rendering/variation_comparison_workflow.md`
- `docs/rendering/cost_safety_and_privacy.md`
- `docs/sprints/08_sprint_progress_tracker.md`
- `docs/sprints/08_sprint_completion_record.md`

## Architecture Decision

Persist render jobs in PostgreSQL, dispatch them through a Redis-backed Python worker, call image providers behind an adapter, and store final assets through a private object-storage abstraction.

Use the OpenAI Image API with GPT Image 2 for the first one-shot concept render. Reserve the Responses API image-generation tool for intentionally conversational, multi-turn image edits.

## Key Planning Tasks

- Define render job lifecycle:
  - Queued
  - Running
  - Succeeded
  - Failed
  - Retrying
- Define render inputs:
  - Design version ID
  - Model profile ID
  - Structured spec snapshot
  - Optional reference image
  - Render style
- Define render outputs:
  - Image URL
  - Metadata
  - Prompt or prompt summary
  - Cost/latency metadata if available
- Define object storage approach.
- Define how users compare image variations.
- Define how generated images remain separate from production truth.

## Non-Goals

- No AI image API calls during planning.
- No Redis setup during planning.
- No worker implementation during planning.
- No image storage implementation during planning.

## Acceptance Criteria

- Render jobs are clearly separate from design versions.
- Every render can be traced back to an exact design version and model profile.
- Slow rendering does not block design edits.
- The product clearly separates concept render from technical spec.

## Risks

- Image outputs may be inconsistent across edits.
- Rendering can become expensive.
- Users may treat beautiful images as production-ready.

## Senior Developer Notes

The app should update the spec instantly and let rich renders arrive later. This is the right UX and the right architecture.

## Next Implementation Slice

- add render-job, immutable input, asset, attempt, and outbox tables
- add Redis and a Python worker
- implement provider and storage interfaces with local fakes
- prove idempotency, retry, cancellation, and stale-version behavior
- integrate a live image provider only after mocked end-to-end tests pass
