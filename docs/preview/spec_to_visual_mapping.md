# Spec-To-Visual Mapping

Last updated: 2026-07-09

Status: Sprint 07 planning artifact.

## Goal

Define deterministic visual behavior for the first preview without inventing technical garment facts.

## Mapping Contract

The mapper receives a validated `DressSpec` and returns a renderer-neutral `PreviewParameters` object. It must be a pure function with unit tests.

Proposed parameter groups:

- palette and material finish
- mannequin proportions
- bodice shape
- neckline shape
- sleeve geometry
- skirt geometry
- hem position
- visible detail markers
- approximation messages

## Supported MVP Mapping

| Spec field | Preview effect | Unknown behavior |
| --- | --- | --- |
| `color.primary_color.name.value` | Garment base color | Muted wine default with `assumed` notice |
| `fabric.primary.name.value` | Roughness, sheen, and subtle surface response | Matte woven finish |
| `silhouette.value` | Overall bodice-to-skirt proportion | Balanced A-line |
| `skirt.shape.value` | A-line, straight, pencil, circle/full, or mermaid lower geometry | A-line |
| `skirt.fullness.value` | Skirt radius and panel spread | Medium fullness |
| `length.hem_length_category.value` | Mini, knee, midi, tea, ankle, or floor hem position | Midi |
| `neckline.type.value` | Neckline contour or overlay | Jewel/round neckline |
| `sleeves.type.value` | Sleeve geometry family | Sleeveless |
| `sleeves.length_category.value` | Sleeve endpoint | Compatible default for type |
| `sleeves.volume.value` | Sleeve radius/volume | Fitted |
| `bodice.waistline.value` | Waist seam position | Natural waist |
| `embellishments` and `trims` | Small, restrained markers only when supported | Omitted with no invented detail |

## Fabric Finish Approximation

The first implementation may map broad fabric words to material characteristics:

- satin: low roughness, moderate specular response
- silk: low-to-medium roughness and softer highlight
- velvet: high roughness, deep color response
- chiffon: light transparency only if readability remains good
- cotton, linen, denim, wool: progressively matte finishes

These are visual cues, not physical simulation.

## Silhouette Geometry Families

- A-line: fitted bodice, skirt widens steadily from waist
- sheath/column: narrow near-parallel body line
- fit-and-flare: fitted through waist/upper hip, then expands
- ball gown: fitted bodice with large skirt volume
- empire: raised waist seam with fabric falling from under bust
- mermaid: fitted through thigh with lower flare

Unsupported values use the documented neutral fallback and add an approximation message.

## Model Profile Scope

Sprint 07 may support normalized bust, waist, hip, height, and shoulder-width proportions when a model profile is available. Values must be clamped to a visually stable range and must never imply fit validation.

When no profile is selected, use one neutral mannequin profile.

## Color Handling

Known color names map through a maintained palette. Valid CSS colors may be parsed in the renderer. Invalid or unknown names use the default color and produce a non-blocking mapping notice.

## No Invention Rule

The mapper may choose a documented visual fallback for an unknown field, but it must not write that fallback back into the dress spec. A visual assumption is not a design decision.
