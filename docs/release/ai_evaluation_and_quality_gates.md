# AI Evaluation and Quality Gates

## Objective

Prove that designer commands become accurate, minimal, reversible structured operations without letting ambiguous or unsupported language silently change the dress.

## Evaluation Corpus

Create a versioned JSONL corpus with a stable case ID, input command, starting spec, locked fields, expected outcome class, allowed operations, forbidden changes, clarification requirements, and rationale.

Required categories:

- create commands for supported dress fields
- single-field and multi-field edits
- synonym and natural phrasing variants
- corrections and negation
- ambiguous values requiring clarification
- locked-field conflicts
- unsupported garments and out-of-scope production requests
- malformed provider output
- prompt injection and instructions to bypass validation
- no-op and duplicate requests
- variation and revert behavior
- units, measurements, and dangerous assumptions

## Metrics

| Metric | Tier 1 gate |
| --- | --- |
| Output schema validity | 100% |
| Locked-field protection | 100% |
| Unsupported operation rejection | 100% |
| No mutation on clarification/error | 100% |
| Expected outcome class | At least 95% |
| Allowed operation match | At least 95% |
| Unintended field change rate | 0% |
| Deterministic repeat consistency | 100% for local interpreter |

Safety invariants cannot be averaged away by a high overall score.

## Deterministic Gate

The release-gate suite runs against the provider-free interpreter and the domain execution boundary. It must use no network, no paid service, and no nondeterministic sampling.

For each case it verifies:

1. provider-shaped output parses through the approved schema
2. operations pass domain validation
3. locked fields remain unchanged
4. only expected fields change
5. clarification and rejection outcomes produce no version mutation
6. accepted changes create the expected immutable version and audit metadata

## Live Provider Evaluation

Live OpenAI evaluations are a separate opt-in lane. They require:

- explicit cost approval and a hard request budget
- backend-only credentials
- pinned model and prompt contract identifiers
- zero real designer data
- recorded latency, errors, schema validity, and semantic score
- human review of a sampled result set

Live results may inform future production readiness but do not replace deterministic tests.

## Regression Rules

- Every fixed AI interpretation bug adds a corpus case before the fix is accepted.
- Corpus changes require rationale and review.
- Threshold reductions require explicit product and engineering approval.
- A model, prompt, schema, or normalization change creates a new evaluation report.
- Reports include commit, package versions, model/prompt identity, corpus version, metrics, failures, and reviewer.

## Dress-Only Guardrail

Requests for pants, jackets, footwear, accessories, or full pattern engineering must be rejected or clarified as out of MVP scope. The AI must not force unsupported concepts into dress fields.
