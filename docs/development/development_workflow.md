# Development Workflow

Last updated: 2026-06-19

Status: Sprint 00 foundation document.

## Working Style

Development should happen in small, verifiable slices. Each sprint should start by reading the relevant sprint document and end with a short summary of what changed, what was verified, and what remains.

## Standard Task Flow

1. Read `AGENTS.md`.
2. Read the project plan and relevant sprint file.
3. Inspect existing files before editing.
4. Identify the smallest useful deliverable.
5. Make scoped changes.
6. Update documentation when decisions change.
7. Run relevant checks when implementation exists.
8. Summarize changes and known gaps.

## Sprint Boundaries

Sprint 00 is foundation-only:

- Documentation is allowed.
- Repo guardrails are allowed.
- Architecture decisions are allowed.
- No app scaffolding.
- No dependency installation.
- No database setup.
- No AI integration.

Future implementation sprints should preserve the same boundary discipline.

## Branching and Commits

Recommended once Git workflow begins:

- `main`: stable project state
- `sprint-00-foundation`: foundation work
- `sprint-01-garment-spec`: garment spec work

Commit style:

- `docs: add project foundation`
- `docs: record architecture decision for electron`
- `feat: add garment spec domain model`
- `test: cover design operation validation`

## Documentation Expectations

Update docs when changes affect:

- Architecture
- Tooling
- Data models
- AI behavior
- Security
- User workflow
- Sprint scope
- Testing strategy

## Definition of Done

For planning/foundation work:

- The artifact exists.
- It is readable.
- It explains why the decision matters.
- It names risks and non-goals.

For future implementation work:

- Code is typed.
- Core behavior is tested.
- Secrets are protected.
- AI output is validated.
- Version traceability is preserved.
- Relevant docs are updated.

## Local Development Expectations

Before implementation begins, verify:

- Node.js is installed.
- Python is installed.
- Git is installed.
- Docker Desktop is available or an alternate PostgreSQL setup is chosen.

Do not install dependencies until the user approves the implementation sprint that requires them.
