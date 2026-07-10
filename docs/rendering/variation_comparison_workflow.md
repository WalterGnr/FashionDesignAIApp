# Variation Comparison Workflow

Last updated: 2026-07-09

Status: Sprint 08 planning artifact.

## Goal

Let designers compare concept images without confusing image preference with technical spec changes.

## Workflow

1. Designer chooses one immutable dress version.
2. Designer requests one to four concept variations.
3. The API creates sibling render jobs with shared immutable input and distinct variation nonces.
4. Results arrive independently and fill stable comparison slots.
5. Designer may favorite, hide, or approve one image as the communication reference.
6. Selecting an image does not modify the dress spec.
7. A requested design change returns through the normal text/voice operation flow and creates a new design version.

## Comparison Metadata

Show:

- design version number
- model profile name or neutral model
- render style and view
- job status
- created time
- concept-only label

Do not display provider prompt internals as ordinary designer controls. Provide an advanced audit view later if needed.

## Failure Behavior

One failed variation does not discard successful siblings. Retry creates a new attempt for the failed slot and preserves the original job history.

## Approval Meaning

`approved_reference` means approved for visual communication. It does not mean production-ready, fit-approved, pattern-approved, or manufacturer-approved.
