# Architecture Overview

Last updated: 2026-06-19

Status: Sprint 00 foundation document.

## MVP Scope

The MVP is dresses only.

The first production direction is a desktop app where a designer can describe and revise a dress through voice or text, with the system maintaining a structured garment spec as the source of truth.

## High-Level Architecture

```text
Designer
  |
  v
Electron Desktop App
  - React UI
  - Voice controls
  - Preview/canvas
  - Spec inspector
  - Version timeline
  |
  v
FastAPI Backend
  - AI orchestration
  - Design operation validation
  - User/design/model APIs
  - Render/export job creation
  |
  v
PostgreSQL
  - Designs
  - Immutable versions
  - Dress specs
  - Model profiles
  - Render records
  - Tech pack records
```

Future asynchronous path:

```text
FastAPI Backend
  |
  v
Redis / Job Queue
  |
  v
Workers
  - AI image rendering
  - PDF export
  - Spreadsheet export
  |
  v
Object Storage / Local Artifacts
```

## Source of Truth

The structured garment spec is the source of truth.

The system should not use generated images as the primary design record. Images, previews, and tech packs are outputs from saved structured data.

## Main Runtime Boundaries

### Electron Main Process

Owns:

- App lifecycle
- Window management
- Native desktop permissions
- Limited local file operations

Does not own:

- AI keys
- Database writes
- Garment business logic

### Electron Renderer

Owns:

- Designer UI
- Preview surface
- Transcript display
- Spec inspector
- Version timeline

Does not own:

- Long-lived secrets
- Direct database access
- Raw Node.js access

### FastAPI Backend

Owns:

- AI session brokering
- AI output validation
- Design and version APIs
- Database writes
- Render/export job creation

### PostgreSQL

Owns:

- Persistent product data
- Immutable design versions
- Model profiles
- Render and export traceability

## First Build Order

1. Foundation and architecture
2. Garment spec and design operations
3. AI command interpretation
4. Desktop shell
5. Designer UI
6. Voice interaction
7. Backend/database persistence
8. Preview rendering
9. Async image rendering
10. Tech pack export

## Critical Risks

- AI may misunderstand fashion commands.
- Image generation may be inconsistent.
- Real-time rendering can be too slow if designed incorrectly.
- Garment simulation can become too complex too early.
- Desktop security can be weakened if renderer access is too broad.

## Core Mitigation

Use structured, validated, versioned garment data as the central system. Let AI propose changes, let software validate them, and let previews/exports render from saved versions.
