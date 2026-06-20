# ADR 0005: Backend Owns AI Secrets and Validates AI Output

Date: 2026-06-19

Status: Accepted

## Context

The app will use AI for voice interaction, command interpretation, and image generation. The desktop renderer is not an appropriate place to store long-lived API keys. AI output can also be wrong, malformed, or unsafe to apply directly.

## Decision

The backend will own long-lived AI secrets and will validate AI output before design state is changed.

The Electron renderer must not receive `OPENAI_API_KEY`.

## Consequences

Positive:

- Reduces risk of leaking API keys.
- Gives one place to validate AI-proposed operations.
- Keeps AI behavior auditable.
- Makes future rate limiting, logging, and policy enforcement easier.

Negative:

- Adds backend dependency to AI workflows.
- Requires session brokering for realtime voice features.
- Adds some latency compared with direct renderer calls.

## Alternatives Considered

### Renderer calls OpenAI directly

Rejected because it would expose long-lived secrets and weaken control over validation and logging.

### Fully local AI models for MVP

Not selected because realtime voice, structured reasoning, and image generation would be much harder to deliver early.

## Review Trigger

Revisit if secure local model execution becomes a product requirement or if OpenAI's client-side ephemeral session model changes the risk profile.
