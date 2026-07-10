# Async Concept Rendering

Last updated: 2026-07-09

Status: Sprint 08 planning and implementation completed.

## Purpose

This folder defines high-quality concept image rendering without slowing the designer's structured editing workflow.

## Core Rule

Concept images are derived, versioned communication assets. The immutable dress specification remains the technical source of truth.

## Architecture Decision

- Persist render requests and status in PostgreSQL.
- Dispatch work through Redis to a Python worker.
- Use a provider adapter so OpenAI-specific details do not leak into the API or database model.
- Use the OpenAI Image API with GPT Image 2 for a one-shot concept render.
- Consider the Responses API image-generation tool for multi-turn image editing or provider-managed reference-image context.
- Store final assets in object storage, not in PostgreSQL.
- Treat webhooks as verified notifications; workers and the API reconcile final state idempotently.

## Implemented Slice

- PostgreSQL render jobs, immutable inputs, assets, and outbox
- Redis/Celery worker and Windows-compatible separate Beat process
- deterministic mock provider plus configured OpenAI GPT Image 2 adapter
- private local storage with image validation and checksums
- render API and typed Electron IPC
- selected-version synchronization, background polling, cancellation, and comparison UI

The default local provider is `mock`. Set `RENDER_PROVIDER=openai` and configure `OPENAI_API_KEY` only in the backend environment to use live image generation.

## Documents

- `render_job_lifecycle.md`
- `image_generation_strategy.md`
- `render_prompt_contract.md`
- `worker_and_queue_architecture.md`
- `asset_storage_plan.md`
- `traceability_and_idempotency.md`
- `variation_comparison_workflow.md`
- `cost_safety_and_privacy.md`

## Official References

- https://developers.openai.com/api/docs/guides/image-generation
- https://developers.openai.com/api/docs/models/gpt-image-2
- https://developers.openai.com/api/docs/guides/background
- https://developers.openai.com/api/docs/guides/webhooks
