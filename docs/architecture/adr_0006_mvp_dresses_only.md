# ADR 0006: MVP Supports Dresses Only

Date: 2026-06-19

Status: Accepted

## Context

Fashion production software can expand into many garment categories, but each category introduces different pattern, fit, construction, measurement, and rendering requirements.

The user explicitly approved dresses only for the MVP.

## Decision

The MVP will focus on dresses only.

## Consequences

Positive:

- Keeps the first garment spec manageable.
- Lets the app focus deeply on dress-specific fields like silhouette, neckline, sleeve type, bodice, skirt, length, embellishments, and occasion.
- Reduces rendering and tech pack complexity.

Negative:

- The app will not initially support tops, pants, jackets, activewear, or accessories.
- Some schema decisions may need generalization later.

## Alternatives Considered

### All garment categories from the start

Rejected because it would expand scope too quickly and weaken the MVP.

### Evening gowns only

Too narrow for an MVP, though evening gowns may be a strong first demo category.

## Review Trigger

Revisit after the dress workflow is reliable enough to support another garment category without weakening the core design-state engine.
