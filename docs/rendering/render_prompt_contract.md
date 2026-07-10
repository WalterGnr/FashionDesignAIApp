# Render Prompt Contract

Last updated: 2026-07-09

Status: Sprint 08 planning artifact.

## Goal

Turn an immutable dress spec into a stable, reviewable concept-render request without letting raw user prose override locked technical facts.

## Prompt Builder Inputs

- prompt contract version
- full dress spec snapshot
- locked fields snapshot
- selected model profile summary
- render style preset
- camera/view preset
- approved reference assets and their roles
- output constraints

## Prompt Sections

1. Task: create one fashion concept render.
2. Garment identity: dress type, occasion, and design intent.
3. Construction-visible attributes: silhouette, bodice, neckline, sleeves, skirt, length, closures, lining cues.
4. Materials: primary/secondary fabrics, finish, color, embellishments.
5. Model/body: normalized, consented profile attributes only when selected.
6. Composition: full garment visible, view preset, quiet studio background, no cropping.
7. Preservation constraints: locked fields and details that must not change.
8. Accuracy disclaimer target: concept visualization, not a technical pattern.

## Determinism And Audit

Persist:

- `prompt_contract_version`
- hash of canonicalized input data
- sanitized prompt text or structured prompt sections
- provider/model identifier
- reference asset IDs and checksums

Do not persist secrets, signed storage URLs, or raw body-profile data in general logs.

## Prompt Injection Boundary

Reference image filenames, user notes, and imported metadata are untrusted text. Delimit and label them as content. They may influence visual style but cannot change system constraints, ownership, locked fields, storage rules, or the dress-only MVP boundary.

## Locked Field Translation

Translate locks into explicit visual preservation statements. Example:

```text
Preserve exactly: off-shoulder neckline, floor length, red primary color.
Do not add sleeves or change the skirt silhouette.
```

Locks remain enforced by structured domain logic. Prompt wording is only a visual consistency aid.
