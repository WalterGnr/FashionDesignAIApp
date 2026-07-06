# AI Evaluation Examples

Last updated: 2026-07-05

Status: Sprint 02 planning artifact.

## Purpose

Define a small evaluation set for future AI command interpretation tests.

These examples should later become fixtures for unit tests, integration tests, or AI evals.

## Evaluation Method

Each example includes:

- starting state
- designer command
- expected result type
- expected operation categories or clarification/rejection
- important assertions

The future implementation should compare the AI output against these expectations before accepting prompt or schema changes.

## Result Types

Allowed result types:

- `operation_batch`
- `clarification_request`
- `rejection`
- `no_op`

## Example 1: Create Red Satin Evening Gown

Starting state:

```text
Empty/minimal dress spec.
No locked fields.
```

Designer command:

```text
Make it a red satin evening gown with an off-shoulder neckline.
```

Expected result:

```text
operation_batch
```

Expected operations:

- set `identity.dress_type` to `evening_gown` confirmed
- set `fabric.primary.name` to `satin` confirmed
- set `color.primary_color.name` to `red` confirmed
- set `neckline.type` to `off_shoulder` confirmed
- set `sleeves.type` to `off_shoulder` confirmed or assumed, depending on schema decision

Assertions:

- no non-dress garment category
- no production measurements invented
- closure remains unknown
- lining remains unknown

## Example 2: Shorten Missing Unit

Starting state:

```text
length.category = floor confirmed
measurements.dress_length = unknown
```

Designer command:

```text
Shorten the dress by 2.
```

Expected result:

```text
clarification_request
```

Expected clarification:

- asks whether `2` means inches or centimeters
- target field is `measurements.dress_length`

Assertions:

- no version created
- no assumed unit silently applied

## Example 3: Keep Neckline, Fuller Skirt

Starting state:

```text
neckline.type = off_shoulder confirmed
skirt.shape = a_line confirmed
```

Designer command:

```text
Keep the neckline but make the skirt fuller.
```

Expected result:

```text
operation_batch
```

Expected operations:

- lock `neckline`
- set `skirt.shape` to `full` confirmed or assumed

Assertions:

- neckline is not changed
- lock operation creates traceable designer intent
- skirt change creates a new version

## Example 4: Locked Neckline Conflict

Starting state:

```text
neckline.type = off_shoulder confirmed
locked_fields = [neckline]
```

Designer command:

```text
Change the neckline to sweetheart.
```

Expected result:

```text
rejection
```

Expected rejection:

- reason code `locked_field`
- field path `neckline`

Assertions:

- no operation is accepted
- no version is created
- message explains unlock requirement

## Example 5: Subjective Direction

Starting state:

```text
Basic red satin gown.
No locked fields.
```

Designer command:

```text
Make it more dramatic.
```

Expected result:

```text
clarification_request
```

Expected clarification:

- asks whether to change silhouette, length, color, fabric, or embellishments

Assertions:

- does not invent mermaid silhouette
- does not add embellishments without target
- does not change multiple fields silently

## Example 6: Add Pearl Trim

Starting state:

```text
neckline.type = off_shoulder confirmed
embellishments = []
```

Designer command:

```text
Add pearl trim around the neckline.
```

Expected result:

```text
operation_batch
```

Expected operations:

- add detail to `embellishments`
- type maps to pearl/pearls
- placement is `neckline`

Assertions:

- density may be assumed, not confirmed
- no unrelated embellishments added

## Example 7: Create Sleeve Variations

Starting state:

```text
version_id = version_5
neckline.type = off_shoulder confirmed
```

Designer command:

```text
Show me three different sleeve options, but keep the neckline.
```

Expected result:

```text
operation_batch
```

Expected operations:

- lock or preserve `neckline`
- create variation with three sleeve options

Assertions:

- all variations reference parent version
- neckline remains unchanged
- variation labels are present

## Example 8: Revert To Version

Starting state:

```text
Versions 1 through 4 exist.
Current version = version_4
```

Designer command:

```text
No, go back to version 2.
```

Expected result:

```text
operation_batch
```

Expected operation:

- `revert_to_version` targeting `version_2`

Assertions:

- revert creates a new version
- versions 3 and 4 remain in history

## Example 9: Unsupported Garment Category

Starting state:

```text
MVP category = dress
```

Designer command:

```text
Design matching pants for this look.
```

Expected result:

```text
rejection
```

Expected rejection:

- reason code `unsupported_category`
- message explains MVP supports dresses only

Assertions:

- no pants fields are created
- no app scope expansion occurs

## Example 10: Remove Ambiguous Trim

Starting state:

```text
embellishments:
- pearl trim at neckline
- lace trim at hem
```

Designer command:

```text
Remove the trim.
```

Expected result:

```text
clarification_request
```

Expected clarification:

- asks which trim to remove
- offers pearl neckline trim and lace hem trim

Assertions:

- does not remove both
- does not guess

## Example 11: Already Red

Starting state:

```text
color.primary_color.name = red confirmed
```

Designer command:

```text
Make it red.
```

Expected result:

```text
no_op
```

Expected no-op:

- reason code `already_set`

Assertions:

- no duplicate version unless metadata intentionally changes

## Example 12: AI Should Not Confirm Assumed Construction

Starting state:

```text
fabric.primary.name = satin confirmed
lining.coverage = unknown
```

Designer command:

```text
Make it production ready.
```

Expected result:

```text
clarification_request
```

Expected clarification:

- asks which production details to confirm or review

Assertions:

- does not silently set lining to fully lined confirmed
- does not invent measurements
- may warn that measurements, closure, lining, and construction notes are incomplete

## Minimum Evaluation Set For Sprint 02 Completion

The first implementation should include at least these six as fixtures:

- Example 1
- Example 2
- Example 4
- Example 5
- Example 6
- Example 9

The full set should be used before serious prompt tuning.

## Sprint 02 Boundary

This document defines evaluation examples only.

It does not implement test files, AI eval jobs, or automated scoring.
