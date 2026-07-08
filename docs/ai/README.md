# AI Documentation

Last updated: 2026-07-08

This folder holds AI-specific design notes, prompt strategies, structured operation schemas, voice interaction decisions, and future AI evaluation fixtures.

## Current Status

Sprint 02 planning artifacts define how designer text or future speech becomes validated structured design operations.

Sprint 02 implementation has started with a provider-free TypeScript package.

Implemented package:

- `packages/ai`

Implemented scope:

- AI command interpretation result schemas
- command normalization and context helpers
- deterministic MVP interpreter for evaluation examples
- execution layer that validates/applies proposed operations through `@fashion-design-ai/domain`
- Vitest coverage for Sprint 02 evaluation examples

Live OpenAI integration has not started.

## Core Rule

```text
AI proposes structured operations.
Software validates operations.
The structured dress spec remains the source of truth.
```

## Sprint 02 Artifacts

- `command_interpretation_flow.md`
- `operation_tool_schema_plan.md`
- `prompting_strategy.md`
- `validation_and_clarification_rules.md`
- `evaluation_examples.md`
- `error_handling_plan.md`

## Boundaries

These documents and `packages/ai` do not implement:

- OpenAI API calls
- voice streaming
- FastAPI routes
- database writes
- Electron UI
- production prompt tuning
