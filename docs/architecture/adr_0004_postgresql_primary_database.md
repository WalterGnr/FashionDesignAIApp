# ADR 0004: Use PostgreSQL as the Primary Database

Date: 2026-06-19

Status: Accepted

## Context

The product needs to store users, designs, immutable versions, structured dress specs, model profiles, render records, materials, and tech pack records. The data must support relationships, traceability, search, and flexible structured fields.

## Decision

Use PostgreSQL as the primary database.

## Consequences

Positive:

- Strong relational integrity.
- Good support for foreign keys and version traceability.
- JSONB can support flexible structured spec sections.
- Mature indexing and query capabilities.
- Suitable for local development and future managed production hosting.

Negative:

- Requires schema discipline and migrations.
- Requires local setup or Docker.
- JSONB overuse could make data harder to query.

## Alternatives Considered

### SQLite

Useful for small local prototypes, but not the best long-term fit for multi-user, production, and query-heavy workflows.

### MongoDB

Flexible document storage, but weaker fit for relational traceability across versions, renders, model profiles, and exports.

## Review Trigger

Revisit only if the product becomes intentionally local-only or if another persistence layer is introduced for offline sync.
