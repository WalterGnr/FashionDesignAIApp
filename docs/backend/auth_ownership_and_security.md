# Auth, Ownership, And Security Plan

Last updated: 2026-07-08

Status: Sprint 06 planning artifact.

## Goal

Define ownership and security boundaries for the backend.

## Ownership Rules

Every durable user-owned object should have an ownership path.

Examples:

- designs belong to an owner user
- design versions belong to a design
- model profiles belong to an owner user
- renders belong to a design version and optionally a model profile
- tech packs belong to a design version

## MVP Auth Strategy

Early local development can use a seeded local user or development-only user context.

Production direction:

- authenticated users
- workspace/team ownership later
- role-based access for designer, patternmaker, manufacturer, admin

## Security Rules

- renderer never connects directly to PostgreSQL
- renderer never stores OpenAI API keys
- backend validates all writes
- backend verifies design ownership before reads/writes
- command transcripts are treated as sensitive
- model profile measurements are treated as sensitive

## AI Session Broker Security

When implemented:

- backend owns standard provider keys
- renderer receives only short-lived session material
- session is linked to user/design context
- sessions expire quickly
- raw audio is not persisted by default

