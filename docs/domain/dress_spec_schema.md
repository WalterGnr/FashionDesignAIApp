# Dress Spec Schema

Last updated: 2026-06-20

Status: Sprint 01 draft.

## Purpose

The dress spec is the source of truth for a dress design in the MVP.

It must be structured enough for:

- AI command interpretation
- UI inspection
- fast visual preview
- version history
- PostgreSQL persistence
- tech pack export
- future manufacturing workflows

Generated images and visual previews are outputs from this spec. They are not the design record.

## MVP Scope

Supported garment category:

- Dress

Out of scope for MVP:

- Tops
- Pants
- Jackets
- Activewear
- Accessories
- automatic production pattern generation
- physically accurate draping

## Field Status Model

Many fields need to distinguish certainty.

Use these statuses:

- `unknown`: value has not been provided or inferred.
- `assumed`: value was inferred by AI or system and should be reviewed.
- `confirmed`: value was explicitly provided or accepted by the designer.

Recommended conceptual shape:

```text
SpecValue<T>
  value: T | null
  status: unknown | assumed | confirmed
  source: user | ai | system | import | null
  note: optional string
```

Sprint 01 decision:

- Important production-facing fields should carry status metadata.
- Do not silently treat AI assumptions as confirmed production truth.

## Top-Level Dress Spec

Conceptual fields:

```text
DressSpec
  schema_version
  garment_category
  identity
  silhouette
  neckline
  sleeves
  bodice
  skirt
  length
  fabric
  color
  embellishments
  closures
  lining
  measurements
  construction_notes
  pattern_notes
  assumptions
  warnings
```

## Required Fields

Required for every valid MVP dress spec:

- `schema_version`
- `garment_category`
- `identity`
- `silhouette`
- `neckline`
- `sleeves`
- `bodice`
- `skirt`
- `length`
- `fabric`
- `color`
- `embellishments`
- `closures`
- `lining`
- `measurements`
- `construction_notes`
- `pattern_notes`
- `assumptions`
- `warnings`

Important nuance:

- Required object fields may contain `unknown` values.
- This keeps the structure stable even when the designer has not decided every detail.

## Identity

Purpose:

Describe the design at a high level.

Fields:

- `name`: optional human-readable design name
- `dress_type`: evening_gown, cocktail_dress, casual_dress, bridal_dress, formal_dress, runway_dress, unknown
- `occasion`: evening, bridal, work, casual, gala, performance, editorial, unknown
- `season`: spring, summer, fall, winter, seasonless, unknown
- `design_intent`: list of descriptors such as elegant, dramatic, minimalist, romantic, structured, fluid

## Garment Category

Allowed value for MVP:

- `dress`

Validation:

- Any other category should be rejected in Sprint 01/MVP.

## Silhouette

Purpose:

Defines the main outer shape of the dress.

Allowed values:

- a_line
- sheath
- fit_and_flare
- mermaid
- trumpet
- ball_gown
- empire_waist
- shift
- slip
- column
- wrap
- tent
- unknown

Validation:

- One primary silhouette is required.
- Additional silhouette notes may be free text, but the primary value should be controlled.

## Neckline

Purpose:

Defines the top opening and upper bodice style.

Allowed values:

- crew
- scoop
- v_neck
- sweetheart
- square
- boat
- halter
- off_shoulder
- one_shoulder
- strapless
- cowl
- high_neck
- unknown

Fields:

- `type`
- `depth`: high, medium, low, unknown
- `notes`

Locking:

- Neckline should be lockable.

## Sleeves

Purpose:

Defines sleeve presence, shape, and length.

Allowed sleeve types:

- sleeveless
- cap
- short
- elbow
- three_quarter
- long
- puff
- bishop
- bell
- flutter
- off_shoulder
- one_sleeve
- unknown

Fields:

- `type`
- `length_category`: none, cap, short, elbow, three_quarter, wrist, dramatic_extension, unknown
- `measurement`: optional sleeve length measurement
- `notes`

Validation:

- If `type` is `sleeveless`, `length_category` should usually be `none`.
- If a sleeve measurement is present, it must include a unit.

## Bodice

Purpose:

Describes torso structure and fit.

Fields:

- `fit`: fitted, relaxed, unknown
- `structure`: corset, boned, draped, ruched, wrap, asymmetric, princess_seams, unknown
- `waistline`: empire, natural, drop, none, unknown
- `support`: boning, cups, interfacing, none, unknown
- `notes`

Validation:

- Multiple structure details may be allowed.
- Support details should not be assumed as production-ready unless confirmed.

## Skirt

Purpose:

Describes lower dress shape and construction direction.

Fields:

- `shape`: straight, a_line, full, gathered, pleated, circle, tiered, bias_cut, wrap, mermaid_flare, unknown
- `features`: list such as slit, train, high_low, godets
- `slit`: optional placement and height
- `train`: optional train type and length
- `notes`

Validation:

- If `length` is short, train should usually require clarification.
- Slit placement should be explicit if production-facing.

## Length

Purpose:

Defines dress length.

Allowed category values:

- mini
- above_knee
- knee
- midi
- tea
- ankle
- floor
- high_low
- train
- unknown

Fields:

- `category`
- `front_measurement`: optional measurement
- `back_measurement`: optional measurement
- `train_length`: optional measurement
- `notes`

Validation:

- Measurements must include units.
- High-low should support separate front/back values when known.

## Fabric

Purpose:

Captures material choice and production-relevant properties.

Fields:

- `primary`: fabric descriptor
- `secondary`: optional fabric descriptors
- `properties`: fabric property object
- `notes`

Fabric descriptor fields:

- `name`: silk, satin, chiffon, organza, tulle, crepe, jersey, velvet, lace, cotton_poplin, linen, brocade, mikado, unknown
- `fiber_content`: optional string
- `weight`: lightweight, medium, heavyweight, unknown
- `drape`: fluid, moderate, structured, crisp, unknown
- `stretch`: none, slight, moderate, high, unknown
- `sheerness`: opaque, semi_sheer, sheer, unknown
- `finish`: matte, glossy, metallic, iridescent, textured, unknown
- `status`

Validation:

- Fabric name may be unknown.
- Fabric properties should not be invented as confirmed.
- Fabric compatibility warnings may be added later.

## Color

Purpose:

Captures visual color direction.

Fields:

- `primary_color`
- `secondary_colors`
- `colorway_name`
- `pattern_or_print`
- `finish`

Color descriptor fields:

- `name`: human-readable color name
- `hex`: optional normalized color value
- `status`
- `notes`

Validation:

- `hex` is optional for MVP.
- Human-readable color is enough for early AI/UI work.

## Embellishments

Purpose:

List trims, surface details, and decorative elements.

Each embellishment:

- `id`: stable local identifier
- `type`: beading, sequins, pearls, applique, embroidery, lace_trim, rhinestones, feathers, fringe, ruffles, bows, piping, other
- `placement`: neckline, bodice, waist, skirt, hem, sleeves, all_over, custom
- `density`: sparse, moderate, heavy, unknown
- `material`: optional string
- `color`: optional color descriptor
- `status`
- `notes`

Validation:

- Placement is required for production-facing embellishments.
- Unknown placement should trigger clarification before export.

## Closures

Purpose:

Defines how the garment opens and fastens.

Allowed values:

- invisible_zipper
- exposed_zipper
- button
- hook_and_eye
- corset_lacing
- snap
- tie
- pull_on
- unknown

Fields:

- `type`
- `placement`: center_back, side_seam, shoulder, front, other, unknown
- `notes`

## Lining

Purpose:

Defines lining coverage and material assumptions.

Fields:

- `coverage`: fully_lined, partially_lined, unlined, unknown
- `fabric`: optional fabric descriptor
- `color`: optional color descriptor
- `support_notes`

Validation:

- Lining should not be assumed confirmed unless the designer or later production rule confirms it.

## Measurements

Purpose:

Stores design measurements, not body measurements. Body/model measurements belong in `ModelProfile`.

Fields:

- `bust`
- `waist`
- `hip`
- `shoulder_width`
- `back_length`
- `front_length`
- `sleeve_length`
- `bicep`
- `wrist`
- `dress_length`
- `hem_circumference`
- `train_length`

Measurement shape:

```text
Measurement
  value: number | null
  unit: in | cm | null
  status: unknown | assumed | confirmed
  source: user | ai | system | import | null
  note: optional string
```

Validation:

- Numeric measurements require unit.
- Supported units: `in`, `cm`.
- Negative values are invalid.
- Clearly impossible values should be rejected or flagged.

## Construction Notes

Purpose:

Production-facing construction instructions.

Shape:

- list of note objects

Each note:

- `id`
- `text`
- `status`: unknown, assumed, confirmed
- `source`

Rule:

- Notes can be free text, but they must be versioned and traceable.

## Pattern Notes

Purpose:

Patternmaking direction and technical pattern assumptions.

Shape:

- list of note objects with same structure as construction notes

Examples:

- Bias-cut skirt
- Two-piece bodice pattern
- Separate lining pattern
- Added wearing ease at bust

## Assumptions

Purpose:

Global list of inferred values that need review.

Each assumption:

- `id`
- `field_path`
- `value_summary`
- `reason`
- `source`: ai or system
- `created_at`

Rule:

- AI-inferred production values should create assumptions unless explicitly accepted.

## Warnings

Purpose:

Capture possible production or validation concerns.

Each warning:

- `id`
- `severity`: info, warning, blocking
- `field_path`
- `message`
- `source`

Examples:

- Fabric drape may not match requested silhouette.
- Train length is unknown.
- Embellishment placement is too vague for export.

## Lockable Fields

Recommended lockable fields:

- `identity.dress_type`
- `silhouette`
- `neckline`
- `sleeves`
- `bodice`
- `skirt`
- `length`
- `fabric`
- `color`
- `embellishments`
- `closures`
- `lining`
- `measurements`
- `construction_notes`
- `pattern_notes`

Lock details are defined separately in `versioning_and_locked_fields.md`.

## Minimum Useful Dress Example

```text
garment_category: dress
identity.dress_type: evening_gown confirmed
silhouette: mermaid confirmed
neckline.type: off_shoulder confirmed
sleeves.type: off_shoulder confirmed
length.category: floor confirmed
fabric.primary.name: satin confirmed
fabric.primary.drape: structured assumed
color.primary_color.name: red confirmed
embellishments: []
closures.type: unknown
lining.coverage: unknown
measurements: all unknown unless provided
construction_notes: []
pattern_notes: []
assumptions: structured satin drape needs review
warnings: closure and key measurements missing before tech pack export
```

This is useful enough for AI, UI, preview direction, and early export warnings without pretending to be production-complete.
