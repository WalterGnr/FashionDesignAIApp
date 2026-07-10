# Model Profile Relationship Plan

Last updated: 2026-07-08

Status: Sprint 06 planning artifact.

## Goal

Define how body measurement profiles relate to dress designs and renders.

## Model Profile Role

Model profiles are reusable records owned by a user or workspace.

They are not embedded permanently inside a dress spec because:

- the same dress can be rendered on multiple bodies
- one model profile can be reused across many designs
- body measurement data has separate privacy concerns

## Relationships

```text
user
  -> model_profiles

design
  -> design_versions
  -> renders
       -> design_version
       -> model_profile
```

## Rendering Rule

A render should always point to:

- design ID
- exact design version ID
- model profile ID when a body profile is used

This allows the app to answer:

- which dress version was rendered
- which body measurements were used
- whether a render is stale after a design change

## Privacy Rule

Model measurements should be treated as sensitive.

Store:

- profile privacy flags
- whether export is allowed
- whether transcript/logging is allowed

Avoid:

- putting body measurements into generic logs
- embedding model profile snapshots into every command event unless needed

