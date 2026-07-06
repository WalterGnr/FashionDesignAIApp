# AI Command Interpretation Flow

Last updated: 2026-07-05

Status: Sprint 02 planning artifact.

## Purpose

Define how a designer's typed command or future voice transcript becomes one or more validated design operations.

The flow protects designer control by ensuring AI never directly mutates the dress spec.

## Core Principle

```text
Raw designer input -> AI interpretation -> proposed operations -> software validation -> new design version
```

Generated images, raw transcripts, and AI reasoning are not the source of truth. The structured `DressSpec` and immutable `DesignVersion` are the source of truth.

## Inputs

The command interpretation layer needs:

- raw user input text
- source type: `text` now, `voice` later
- current `DressSpec`
- current `DesignVersion`
- active `LockedField` list
- recent version summaries
- allowed `DesignOperation` types
- field path vocabulary
- validation rules
- model profile context only when the command explicitly affects preview or fit

## Outputs

The layer must return exactly one of these conceptual results:

- `operation_batch`: one or more proposed design operations
- `clarification_request`: a question for the designer
- `rejection`: unsupported, unsafe, or out-of-scope command
- `no_op`: command maps to no meaningful change

## High-Level Flow

```text
Designer command
  -> normalize raw input
  -> assemble command context
  -> AI interpretation request
  -> parse AI response
  -> schema validation
  -> domain validation
  -> lock validation
  -> version behavior planning
  -> apply later in domain engine
```

## Step 1: Capture Raw Input

Text MVP:

- user types a command into a command box
- app stores raw command text
- source is `text`

Future voice:

- microphone captures speech
- speech-to-text creates transcript segments
- committed transcript becomes the raw command
- source is `voice`

Sprint 02 does not implement voice streaming. Voice remains a future input source that should produce the same command interpretation contract.

## Step 2: Normalize Input

Normalization should prepare the command for interpretation without changing meaning.

Examples:

- trim leading and trailing whitespace
- preserve original casing in raw input
- optionally create a lowercase copy for simple pre-checks
- attach language/locale later if detected

Do not rewrite the designer's wording before storing it. The raw wording is important for traceability and debugging.

## Step 3: Pre-Classify Command

Before calling AI, the app may classify obvious commands into broad intents.

Intent categories:

- `create_or_update_design`
- `modify_existing_detail`
- `add_detail`
- `remove_detail`
- `modify_measurement`
- `lock_or_unlock`
- `create_variation`
- `revert_version`
- `clarification_answer`
- `unsupported_or_out_of_scope`

This pre-classification should not replace AI interpretation. It is useful for selecting allowed operations and reducing unnecessary ambiguity.

## Step 4: Assemble AI Context

The AI request should include:

- current dress category, always `dress` for MVP
- current confirmed fields
- current assumed fields
- unknown production-critical fields
- locked fields
- allowed operation list
- recent version list
- command source
- raw command text

The request should not include:

- full unrelated design history
- real API keys
- hidden system secrets
- complete body measurements unless the command requires model profile context
- generated image data as technical truth

## Step 5: AI Proposes Operations

The AI should return either:

- a structured operation batch
- a clarification request
- a rejection with reason
- a no-op result

The AI should not:

- directly update `DressSpec`
- invent confirmed production measurements
- override locked fields
- create a non-dress garment in MVP
- treat an image description as a production-ready spec
- silently resolve ambiguous measurement units

## Step 6: Schema Validation

The app validates the AI response shape before looking at business rules.

Reject if:

- response is not valid JSON
- result type is unknown
- operation type is unknown
- required fields are missing
- unexpected fields appear in strict schemas
- target field path is malformed

Schema validation protects the system from malformed AI output.

## Step 7: Domain Validation

After schema validation, validate operations against the domain rules.

Check:

- garment category is `dress`
- field path exists in the dress spec
- value belongs to an allowed enum or expected structure
- measurements include valid units
- measurement ranges are plausible
- detail payloads include required placement/type
- variation payloads include parent version and labels
- revert target exists and belongs to the same design

Domain validation protects the design data model.

## Step 8: Locked Field Validation

Locked fields are checked after target paths are normalized.

Rules:

- exact locked path blocks changes
- locked parent path blocks child changes
- locked child path does not block siblings
- AI cannot bypass locks
- user commands that appear to challenge a lock should trigger clarification or a rejected operation with unlock guidance

Example:

```text
Locked: neckline
AI proposes: set_field neckline.type = sweetheart
Result: rejected, locked_field
```

## Step 9: Decide Version Behavior

Accepted design-changing operations create new versions.

Version-creating operations:

- `set_field`
- `add_detail`
- `remove_detail`
- `modify_measurement`
- `lock_field`
- `unlock_field`
- `create_variation`
- `revert_to_version`

Non-version events:

- rejected operation
- clarification question
- no-op without metadata change
- AI response parse failure

## Step 10: Return Designer-Facing Result

The app should be able to show:

- what the designer said
- what the AI understood
- what operation was proposed
- what changed
- what was rejected
- what needs clarification
- which fields remain assumptions
- which version was created

The designer should never need to inspect raw JSON to understand what happened.

## Example Flow: Simple Update

Raw command:

```text
Make it a red satin evening gown with an off-shoulder neckline.
```

AI proposal:

```text
operation_batch:
  - set_field identity.dress_type = evening_gown confirmed
  - set_field neckline.type = off_shoulder confirmed
  - set_field sleeves.type = off_shoulder confirmed
  - set_field fabric.primary.name = satin confirmed
  - set_field color.primary_color.name = red confirmed
```

Validation:

- schema valid
- fields valid
- values valid
- no locked conflicts

Result:

- accepted
- new version created
- summary: created red satin evening gown direction with off-shoulder neckline

## Example Flow: Clarification

Raw command:

```text
Shorten it by 2.
```

AI proposal:

```text
clarification_request:
  question: Should the dress be shortened by 2 inches or 2 centimeters?
  field_path: measurements.dress_length
  options: [in, cm]
```

Result:

- no version yet
- designer answer becomes follow-up input

## Example Flow: Locked Field Conflict

State:

```text
locked_fields:
  - neckline
```

Raw command:

```text
Change the neckline to sweetheart.
```

AI proposal:

```text
operation_batch:
  - set_field neckline.type = sweetheart confirmed
```

Validation:

- schema valid
- field valid
- locked field conflict

Result:

```text
rejected:
  reason_code: locked_field
  message: Neckline is locked. Unlock it before changing neckline details.
```

## Responsibility Boundaries

### Renderer Later

- captures typed command
- displays transcript later
- displays clarification prompts
- displays accepted/rejected summaries

### Backend Later

- owns AI credentials
- calls OpenAI APIs
- stores raw AI interaction logs safely
- returns structured proposals to app/domain layer

### Domain Layer Later

- validates operations
- applies operations immutably
- creates versions
- enforces locks

### Database Later

- persists designs
- persists immutable versions
- persists AI interaction records
- persists render/export records

## Official OpenAI References

- Function calling: https://developers.openai.com/api/docs/guides/function-calling
- Structured Outputs: https://developers.openai.com/api/docs/guides/structured-outputs
- Realtime API: https://developers.openai.com/api/docs/guides/realtime

## Sprint 02 Boundary

This document is planning only.

It does not implement:

- OpenAI calls
- prompt files
- TypeScript validators
- backend routes
- database tables
- UI behavior
