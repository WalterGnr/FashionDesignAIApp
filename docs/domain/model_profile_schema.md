# Model Profile Schema

Last updated: 2026-06-20

Status: Sprint 01 completed planning artifact.

## Purpose

The model profile describes the body measurements and display profile used to preview a dress on a specific body.

The same dress spec should be reusable across multiple model profiles.

## Important Distinction

`DressSpec.measurements` describes garment/design measurements.

`ModelProfile.measurements` describes a body or fit model.

Do not mix these.

## Privacy Note

Body measurements are sensitive. They should be stored only when needed, protected from logs, and referenced by model profile ID in renders and exports.

## Top-Level Model Profile

Conceptual fields:

```text
ModelProfile
  schema_version
  model_profile_id
  display_name
  measurement_unit_preference
  measurements
  proportions
  fit_notes
  privacy
  created_at
  updated_at
```

## Required Fields

Required:

- `schema_version`
- `model_profile_id`
- `display_name`
- `measurement_unit_preference`
- `measurements`
- `proportions`
- `fit_notes`
- `privacy`

Required fields may contain unknown measurement values.

## Measurement Shape

```text
BodyMeasurement
  value: number | null
  unit: in | cm | null
  status: unknown | assumed | confirmed
  source: user | ai | system | import | null
  note: optional string
```

Validation:

- Numeric values require a unit.
- Supported units: `in`, `cm`.
- Negative values are invalid.
- Implausible values should be rejected or flagged.

## Measurement Unit Preference

Allowed values:

- `in`
- `cm`

Rule:

- The profile may have a preferred display unit.
- Individual measurements must still carry their own unit.

## Core Body Measurements

Fields:

- `height`
- `bust`
- `waist`
- `hips`
- `shoulder_width`
- `inseam`

These are the MVP fields called out in the project plan.

## Extended Measurements

Optional fields useful for later fit and preview:

- `neck_circumference`
- `underbust`
- `high_hip`
- `torso_length`
- `back_length`
- `arm_length`
- `bicep`
- `wrist`
- `thigh`
- `calf`

Sprint 01 decision:

- Include these as optional/unknown fields in the schema so future fit work does not require a breaking change.
- Do not require them for MVP preview.

## Proportions

Purpose:

Support approximate preview scaling without claiming fit simulation accuracy.

Fields:

- `body_shape`: hourglass, pear, apple, rectangle, inverted_triangle, custom, unknown
- `posture_notes`: optional text
- `fit_model_notes`: optional text

Validation:

- Body shape should be optional and non-judgmental.
- Free-text notes should not be used for automated production decisions without later validation.

## Fit Notes

Purpose:

Store designer or fit model notes.

Examples:

- Prefers extra ease at waist.
- Narrow shoulders compared with size chart.
- Long torso adjustment needed.

Each note:

- `id`
- `text`
- `source`: user, system, import
- `created_at`

## Privacy

Fields:

- `contains_sensitive_measurements`: true
- `logging_allowed`: false by default
- `export_allowed`: false by default unless user chooses to include model profile data

Rule:

- Avoid logging complete body measurements.
- Reference model profiles by ID in renders.

## Relationship to Dress Designs

A model profile is independent from a dress spec.

Conceptual relationships:

```text
DesignVersion + ModelProfile -> Render
DesignVersion + ModelProfile -> Fit/preview context
```

This enables:

- same dress on multiple model profiles
- different bodies with same design version
- render traceability

## Minimum Useful Model Profile Example

```text
display_name: Sample fit model
measurement_unit_preference: in
height: 68 in confirmed
bust: 34 in confirmed
waist: 26 in confirmed
hips: 38 in confirmed
shoulder_width: unknown
inseam: unknown
body_shape: unknown
privacy.contains_sensitive_measurements: true
privacy.logging_allowed: false
```

This is enough to support the future requirement of previewing a dress on a body profile while keeping sensitive data handling explicit.
