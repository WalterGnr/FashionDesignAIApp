# Sprint 08: Async Rendering and AI Images Planning

Status: Planning only.

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

- No AI image API calls.
- No Redis setup.
- No worker implementation.
- No image storage implementation.

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
