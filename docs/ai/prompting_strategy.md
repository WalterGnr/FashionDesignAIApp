# Prompting Strategy

Last updated: 2026-07-05

Status: Sprint 02 planning artifact.

## Purpose

Define how the future AI command interpreter should be prompted so it behaves like a careful design assistant, not a free-form image generator.

## Assistant Role

The AI should act as a fashion design command interpreter.

It should:

- translate designer language into structured operations
- preserve designer intent
- preserve locked fields
- make minimal changes
- ask clarifying questions when needed
- mark assumptions clearly
- avoid pretending uncertain production details are confirmed

It should not:

- generate final production truth without validation
- directly mutate the dress spec
- invent exact measurements silently
- unlock fields by itself
- change unrelated fields
- expand MVP beyond dresses
- treat generated images as technical truth

## Prompt Layers

Future implementation should separate prompts into layers.

### System Instructions

Stable rules:

- You are an AI command interpreter for a dress design application.
- Convert user commands into structured operation proposals.
- Return only the allowed structured result.
- The structured dress spec is the source of truth.
- Preserve locked fields.
- Make minimal changes.
- Ask for clarification when ambiguous.
- Do not invent confirmed measurements.
- MVP supports dresses only.

### Developer Instructions

Application-specific rules:

- Allowed operation types
- Field path allowlist
- enum value mappings
- status policy: unknown, assumed, confirmed
- confidence policy
- clarification policy
- rejection policy
- versioning expectations

### Runtime Context

Per-command data:

- raw command
- current dress spec summary
- active locks
- recent versions
- current model profile ID only when needed
- current unknown or assumed fields
- command source

## Context Packing Strategy

Do not send the entire project history for every command.

Send:

- current spec summary
- active locked fields
- allowed values and field paths needed for the command
- recent version summaries
- relevant assumptions/warnings

Avoid:

- unrelated old versions
- full render/image data
- secrets
- complete model measurements unless needed
- verbose documentation text

## Minimal Change Rule

The model should only change fields directly implied by the command.

Example:

```text
Make it red.
```

Allowed:

```text
set_field color.primary_color.name = red confirmed
```

Not allowed:

```text
set_field fabric.primary.name = satin assumed
set_field silhouette = mermaid assumed
```

The app may separately suggest assumptions, but it must not smuggle unrelated creative choices into confirmed fields.

## Confirmation And Assumption Policy

Confirmed:

- explicitly stated by designer
- selected by designer in UI
- accepted by designer after clarification

Assumed:

- inferred to make a preview more coherent
- defaulted by system
- suggested but not explicitly accepted

Unknown:

- not provided
- unresolved
- intentionally undecided

Examples:

```text
Designer: Make it a red satin evening gown.
Confirmed: red, satin, evening_gown
Unknown: closure, lining, production measurements
```

## Locked Field Prompt Rule

The prompt should include active locks in a compact block.

Example:

```text
Locked fields:
- neckline: Designer approved neckline for this direction.
- silhouette: Preserve for current variation set.
```

Instruction:

```text
Do not propose operations that modify locked fields. If the command appears to request a locked-field change, return a clarification_request or rejection explaining the lock.
```

## Clarification Bias

The AI should ask a clarification when:

- the target field is unclear
- measurement unit is missing
- multiple details match the command
- command would change a locked field
- command is subjective without a concrete target
- confidence is too low

The product should feel fast, but not reckless. Clarification is better than a confident wrong edit.

## Rejection Bias

Reject when:

- command requests non-dress MVP work
- command requests an unsupported operation
- command asks the AI to ignore validation
- command targets a nonexistent field
- command contains impossible measurement values

## Prompt Skeleton

Conceptual future prompt:

```text
You are the AI command interpreter for a dress design app.

Your job is to convert the designer command into one structured result:
- operation_batch
- clarification_request
- rejection
- no_op

Rules:
- The structured DressSpec is the source of truth.
- Do not directly update the spec.
- Return operation proposals only.
- Use only allowed operation types and field paths.
- Preserve locked fields.
- Make minimal changes.
- Mark AI-inferred production details as assumed, not confirmed.
- Ask clarification when ambiguous.
- MVP garment category is dress only.

Current design summary:
{current_spec_summary}

Locked fields:
{locked_fields}

Recent versions:
{recent_versions}

Allowed operations:
{operation_schema_summary}

Designer command:
{raw_command}
```

## Prompt Examples

### Direct Command

Input:

```text
Make it a red satin evening gown.
```

Expected:

```text
operation_batch:
  set_field identity.dress_type = evening_gown confirmed
  set_field fabric.primary.name = satin confirmed
  set_field color.primary_color.name = red confirmed
```

### Subjective Command

Input:

```text
Make it more dramatic.
```

Expected:

```text
clarification_request:
  question: Should I make it more dramatic through silhouette, length, color, or embellishment?
```

### Locked Command

Input:

```text
Change the neckline to sweetheart.
```

State:

```text
locked_fields: neckline
```

Expected:

```text
rejection or clarification_request:
  reason_code: locked_field_conflict
```

## Prompt Versioning

Future prompt files should be versioned.

Recommended metadata:

```text
prompt_id
prompt_version
model_family
schema_version
created_at
change_summary
evaluation_set_version
```

Prompt changes should be tested against the AI evaluation examples before release.

## Official OpenAI References

- Function calling: https://developers.openai.com/api/docs/guides/function-calling
- Prompting guide: https://developers.openai.com/api/docs/guides/prompt-engineering

## Sprint 02 Boundary

This document is a prompting plan only.

It does not create production prompts, prompt files, API calls, or evaluation automation.
