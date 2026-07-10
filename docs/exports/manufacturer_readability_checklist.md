# Manufacturer Readability Checklist

Last updated: 2026-07-09

Status: Sprint 09 planning artifact.

## Content

- design, version, export, and revision identifiers are visible
- garment category and dress intent are unambiguous
- measurements include units, status, and tolerances when known
- materials and trims use stable item numbers
- construction notes reference garment areas clearly
- assumptions and warnings are separated from confirmed facts
- concept images carry a technical-accuracy disclaimer
- unknowns are visible and never represented as zero

## PDF

- no clipped, overlapping, or orphaned table content
- table headers repeat after page breaks
- text remains readable when printed in grayscale
- visual references preserve aspect ratio
- every page includes revision traceability
- long IDs and notes wrap safely

## XLSX

- sheet order is predictable
- headers are frozen and filters are enabled
- numeric values are numeric cells
- units are separate from values
- untrusted strings cannot execute as formulas
- print areas and orientations are usable
- workbook opens without repair warnings

## Cross-Format Consistency

- same source snapshot hash
- same readiness state and issue set
- same IDs and revision history
- same measurement values/statuses
- same BOM item numbers
- same selected visual-reference asset

## Human Review

Before MVP release, have a technical designer, patternmaker, or production specialist review at least three packs: minimally specified, typical, and complex. Record misunderstandings as contract defects, not only cosmetic feedback.
