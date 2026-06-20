# ADR 0003: Use FastAPI for the Backend

Date: 2026-06-19

Status: Accepted

## Context

The backend must broker AI access, validate structured operations, persist designs, create render/export jobs, and eventually support image/PDF/spreadsheet workflows.

Python has a strong ecosystem for AI orchestration, validation, document export, and data processing.

## Decision

Use FastAPI as the backend framework for the MVP.

## Consequences

Positive:

- FastAPI provides typed request/response validation through Pydantic.
- Python is a strong fit for AI and export workflows.
- It supports clean API development and testing.
- It can later coordinate background workers.

Negative:

- The project will use both TypeScript and Python.
- Shared contracts will need careful management.
- Some domain logic may need equivalent schemas across frontend and backend.

## Alternatives Considered

### Node.js / NestJS

Attractive for a full TypeScript stack, but Python is better aligned with AI and document-processing workflows for this project.

### Flask

Possible, but FastAPI provides stronger built-in typing and OpenAPI support.

## Review Trigger

Revisit if maintaining TypeScript/Python contracts becomes too costly or if the team strongly prefers a single-language backend.
