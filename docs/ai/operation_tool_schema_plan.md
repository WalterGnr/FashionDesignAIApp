# Operation Tool Schema Plan

Last updated: 2026-07-05

Status: Sprint 02 planning artifact.

## Purpose

Plan the structured schema the AI will use to propose dress design operations.

The schema should align with Sprint 01 domain contracts and future OpenAI function/tool calling patterns.

## Recommended Direction

Use a tool/function-style schema for AI operation proposals.

Reason:

- The AI is being asked to propose actions for the application.
- OpenAI function calling is designed for models to call application-defined tools with JSON-schema arguments.
- The app remains responsible for validating and applying the proposed tool arguments.

Use Structured Outputs separately when the model should produce a non-tool structured response, such as a pure classification or inspection summary.

## Core Tool Concept

Future tool name:

```text
propose_design_operations
```

Purpose:

```text
Convert a designer command into one validated-intent result:
operation batch, clarification request, rejection, or no-op.
```

Important:

- The tool call should not directly apply changes.
- The tool arguments are a proposal.
- The domain engine validates the proposal before creating versions.

## Top-Level Result Shape

Conceptual schema:

```text
AICommandInterpretationResult
  result_id
  raw_input_ref
  result_type
  confidence
  command_intent
  operation_batch
  clarification_request
  rejection
  no_op
  assumptions
  warnings
```

Allowed `result_type` values:

- `operation_batch`
- `clarification_request`
- `rejection`
- `no_op`

Only the matching detail object should be populated.

## Operation Batch Shape

```text
operation_batch
  batch_id
  operations
  batch_summary
  creates_versions
```

Rules:

- `operations` must contain at least one operation.
- Operations must use the Sprint 01 `DesignOperation` contract.
- Batch should preserve operation order when order matters.
- Batch should not mix unrelated commands unless the designer clearly requested them.

## Operation Envelope

Every proposed operation should include:

```text
operation_id
type
actor
source
target
payload
raw_input_ref
confidence
creates_version
created_at
```

AI-generated values:

- `actor`: `ai`
- `source`: `text` or `voice`
- `confidence`: required
- `raw_input_ref`: required when available

## Supported Operation Types

Sprint 02 supports the Sprint 01 operation list:

- `set_field`
- `add_detail`
- `remove_detail`
- `modify_measurement`
- `lock_field`
- `unlock_field`
- `create_variation`
- `revert_to_version`

Unknown operation types must be rejected.

## Tool Schema Sketch

This is conceptual JSON Schema, not implementation code.

```json
{
  "type": "object",
  "required": [
    "result_id",
    "raw_input_ref",
    "result_type",
    "confidence",
    "command_intent"
  ],
  "additionalProperties": false,
  "properties": {
    "result_id": { "type": "string" },
    "raw_input_ref": { "type": "string" },
    "result_type": {
      "type": "string",
      "enum": [
        "operation_batch",
        "clarification_request",
        "rejection",
        "no_op"
      ]
    },
    "confidence": {
      "type": "number",
      "minimum": 0,
      "maximum": 1
    },
    "command_intent": {
      "type": "string",
      "enum": [
        "create_or_update_design",
        "modify_existing_detail",
        "add_detail",
        "remove_detail",
        "modify_measurement",
        "lock_or_unlock",
        "create_variation",
        "revert_version",
        "clarification_answer",
        "unsupported_or_out_of_scope"
      ]
    },
    "operation_batch": {
      "type": ["object", "null"]
    },
    "clarification_request": {
      "type": ["object", "null"]
    },
    "rejection": {
      "type": ["object", "null"]
    },
    "no_op": {
      "type": ["object", "null"]
    },
    "assumptions": {
      "type": "array"
    },
    "warnings": {
      "type": "array"
    }
  }
}
```

Implementation note:

- Future code should represent the one-of relationship as a discriminated union in TypeScript/Zod.
- JSON Schema support may require careful structure to keep model outputs reliable.

## Payload Plans By Operation Type

### set_field

```text
payload
  field_path
  value
  value_status
```

Rules:

- `field_path` must be a known dress spec path.
- `value_status` should be `confirmed` only when the designer explicitly said it.
- AI-inferred production details should be `assumed`.

### add_detail

```text
payload
  field_path
  detail
```

Supported targets:

- `embellishments`
- `skirt.features`
- `construction_notes`
- `pattern_notes`
- `warnings`
- `assumptions`

Rules:

- Detail must include type and placement when production-facing.
- Missing placement should usually trigger clarification.

### remove_detail

```text
payload
  field_path
  detail_id
```

Rules:

- Detail ID should exist.
- If the designer refers to "the pearls" and several pearl details exist, clarify.

### modify_measurement

```text
payload
  field_path
  mode: set | adjust
  measurement
```

Rules:

- Numeric value requires unit.
- Missing unit triggers clarification.
- Implausible values reject or warn depending on severity.

### lock_field

```text
payload
  field_path
  reason
```

Rules:

- Field path must be lockable.
- Locking creates a metadata version.

### unlock_field

```text
payload
  field_path
  reason
```

Rules:

- User intent should be explicit.
- AI should not unlock fields proactively.

### create_variation

```text
payload
  parent_version_id
  variation_label
  operations
```

Rules:

- Each variation operation must be valid.
- Locked fields must be preserved.
- The model may propose multiple child versions only when the designer asks for options.

### revert_to_version

```text
payload
  target_version_id
  reason
```

Rules:

- Target version must exist.
- Revert creates a new current version.
- Revert does not delete intervening versions.

## Clarification Request Shape

```text
clarification_request
  clarification_id
  question
  reason_code
  field_path
  options
  allows_free_text
```

Reason codes:

- `ambiguous_target`
- `missing_measurement_unit`
- `multiple_possible_details`
- `locked_field_conflict`
- `low_confidence`
- `unsupported_category_ambiguous`
- `insufficient_context`

Example:

```text
question: Should the dress be shortened by 2 inches or 2 centimeters?
field_path: measurements.dress_length
options: [in, cm]
allows_free_text: false
```

## Rejection Shape

```text
rejection
  reason_code
  message
  field_path
  recoverable
```

Reason codes:

- `unsupported_category`
- `unknown_field`
- `invalid_value`
- `invalid_measurement`
- `schema_violation`
- `locked_field`
- `unsafe_or_sensitive`
- `not_a_design_command`

## No-Op Shape

```text
no_op
  reason_code
  message
```

Reason codes:

- `already_set`
- `already_locked`
- `no_design_change_detected`
- `duplicate_detail`

## Field Path Allowlist

Sprint 02 should use an allowlist derived from Sprint 01 domain docs.

High-value paths:

- `identity.dress_type`
- `identity.occasion`
- `identity.season`
- `identity.design_intent`
- `silhouette`
- `neckline.type`
- `neckline.depth`
- `sleeves.type`
- `sleeves.length_category`
- `bodice.fit`
- `bodice.structure`
- `bodice.waistline`
- `skirt.shape`
- `skirt.features`
- `length.category`
- `fabric.primary.name`
- `fabric.primary.weight`
- `fabric.primary.drape`
- `fabric.primary.stretch`
- `fabric.primary.finish`
- `color.primary_color.name`
- `embellishments`
- `closures.type`
- `closures.placement`
- `lining.coverage`
- `measurements.dress_length`
- `measurements.sleeve_length`
- `measurements.train_length`
- `construction_notes`
- `pattern_notes`

Unknown paths must be rejected before any version is created.

## Confidence Policy

Suggested thresholds:

- `0.85` and above: allow validation to proceed normally
- `0.60` to `0.84`: allow validation, but add warning or assumption where relevant
- below `0.60`: prefer clarification unless the command is trivially clear

Confidence never bypasses validation.

## Batch Policy

Allow operation batches when:

- one natural command clearly maps to several fields
- variations require multiple child operations
- lock + modification is explicitly requested

Clarify instead of batching when:

- command combines unrelated goals
- command changes locked and unlocked fields ambiguously
- command asks for broad style direction without target

## Official OpenAI References

- Function calling: https://developers.openai.com/api/docs/guides/function-calling
- Structured Outputs: https://developers.openai.com/api/docs/guides/structured-outputs

## Sprint 02 Boundary

This is a schema plan, not executable schema code.

Future implementation should convert this into:

- TypeScript discriminated unions
- Zod schemas
- JSON Schema for AI tool definitions
- unit tests for valid and invalid examples
