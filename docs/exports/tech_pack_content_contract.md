# Tech Pack Content Contract

Last updated: 2026-07-09

Status: Sprint 09 planning artifact.

## Canonical Snapshot

`TechPackSnapshot` is an immutable normalized structure built before either file renderer runs.

Required envelope:

- export contract version
- export ID
- owner ID
- design ID and design name
- exact design version ID and version number
- source snapshot SHA-256
- generated-at timestamp
- garment category fixed to `dress`
- readiness status and issue list
- selected visual-reference asset metadata, if any

## Sections

### Identity And Revision

- dress type, occasion, design intent
- design/version/export identifiers
- change summary, parent version, branch/variation label
- created by, source, and timestamps

### Visual References

- approved concept render, if selected
- fast preview capture or future flat sketch, if available
- visible label: `Concept reference only - not a pattern or fit approval`
- asset ID, originating render job ID, and design version ID

### Design Details

- silhouette
- bodice structure and fit
- neckline
- sleeve type, length, volume, cuff, and attachment notes
- skirt shape, fullness, waist treatment, slit, layers, and train
- closure type and placement
- lining coverage and support notes
- embellishments and placements

### Materials And Colorways

- primary and secondary fabric descriptors
- fiber, weight, stretch, drape, finish, supplier, and code when known
- primary and secondary colors with name/code/status/source
- trims, closures, lining, embellishments, and procurement notes

### Measurements

Each row carries:

- point-of-measure code
- human-readable description
- value and unit
- tolerance when known
- status: confirmed, assumed, unknown, or not_applicable
- source
- measuring instructions or notes

Unknown values remain blank and are labeled; they are never written as zero.

### Construction And Pattern Notes

- stable note ID
- note text
- author/source
- status
- relevant garment area

### Assumptions, Warnings, And Sign-Off

- assumptions grouped separately from confirmed facts
- compatibility and production warnings
- unresolved readiness issues
- designer/patternmaker/technical-designer sign-off placeholders

### Revision History

- relevant design versions through the exported version
- version number, version ID, date, actor, source, and change summary

## Normalization Rules

- Preserve original units; add converted display values only when conversion is deterministic and labeled.
- Sort lists by explicit display order, then stable ID.
- Sanitize control characters but preserve user-authored wording.
- Resolve enums through a versioned presentation dictionary.
- Never infer supplier, tolerance, consumption, cost, seam type, or pattern facts from a concept image.
- Treat formulas and URLs from imported text as inert text unless the export contract explicitly creates them.
