# Image Generation Strategy

Last updated: 2026-07-09

Status: Sprint 08 planning artifact.

## Provider Direction

The initial provider adapter should support OpenAI GPT Image 2 while keeping model and endpoint selection configurable on the backend.

## API Selection

Use the Image API when:

- creating one concept image from one normalized prompt
- editing an image from explicit uploaded bytes
- predictable job inputs and outputs matter more than conversation state

Use the Responses API image-generation tool when:

- the designer is making multi-turn image edits
- File IDs or prior response context materially improve the workflow
- a conversational image session is intentionally persisted and governed

The first Sprint 08 implementation should prefer the Image API because the product already owns durable design/version state. It should not make provider conversation state a second design source of truth.

## Model Selection

- development default: `gpt-image-2`
- production/evaluation option: pinned model snapshot such as `gpt-image-2-2026-04-21`
- persist the actual model identifier returned/used for every render
- review model changes through visual regression fixtures before changing defaults

## Inputs

Required:

- exact design version ID
- immutable dress spec snapshot
- render style preset
- view preset
- output size and quality

Optional:

- model profile ID and normalized body description
- approved reference-image asset IDs
- prior concept-render asset ID for an edit job
- negative constraints derived from locked fields

## Outputs

- generated image bytes
- provider request ID where available
- provider model identifier
- output format, width, and height
- timing and retry metadata
- sanitized prompt summary
- storage asset record and checksum

Provider base64 output is decoded in worker memory, uploaded, then released. It is not stored in the database or general logs.

## Consistency Strategy

- derive prompts from the complete selected spec, not only the latest command
- include locked fields as preserve constraints
- include explicit view, background, model, and garment-only requirements
- edit from an approved prior render when continuity matters
- generate variations as sibling jobs sharing one immutable input record
- never overwrite an existing render asset

## Limits

Concept images do not prove:

- pattern correctness
- fit approval
- seam/construction accuracy
- fabric physics
- final color under production lighting
