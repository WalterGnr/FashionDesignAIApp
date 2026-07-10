# Spreadsheet Export Strategy

Last updated: 2026-07-09

Status: Sprint 09 planning artifact.

## Decision

Use XlsxWriter to create a new deterministic XLSX workbook from `TechPackSnapshot`.

## Workbook Tabs

1. `Overview`
2. `Measurements`
3. `Bill of Materials`
4. `Colorways`
5. `Construction Notes`
6. `Warnings`
7. `Revision Log`

Do not use `History` as a worksheet name because Excel reserves it in some versions.

## Workbook Rules

- Freeze headers and enable filters on tabular sheets.
- Use typed numeric cells for measurements, quantity, and cost.
- Keep units in dedicated columns.
- Disable automatic string-to-formula and string-to-URL conversion for untrusted user text.
- Prefix text that begins with `=`, `+`, `-`, or `@` when needed to prevent formula injection.
- Use data validation only for intentionally editable downstream columns.
- Mark the workbook read-only recommended while allowing manufacturers to save a working copy.
- Add export/design/version IDs and snapshot hash as workbook properties and visible cells.
- Apply print areas, repeated header rows, and landscape orientation for wide sheets.

## Table Details

### Measurements

- POM code, description, value, unit, tolerance plus/minus, status, source, notes

### Bill Of Materials

- item number, category, placement, description, supplier, SKU, color, unit, consumption, unit cost, total cost, status, notes

Unknown consumption and cost remain blank. No formula calculates a deceptive zero total.

### Revision Log

- version number, version ID, date, actor, source, change summary, branch/variation

## Verification

- reopen generated files with a read library
- assert exact worksheet set and order
- validate cell types and formulas
- inspect freeze panes, filters, widths, print settings, and workbook properties
- open the workbook in Excel during final release QA
