# Sprint 09: Tech Pack Export

Status: Planning completed. Implementation has not started.

Suggested duration: 1 to 2 weeks.

Last updated: 2026-07-09

## Goal

Generate deterministic PDF and XLSX tech packs from one immutable dress version while communicating missing production data honestly.

## Product Outcome

A designer can select an exact dress version, review its export-readiness result, request a tech pack, and receive two manufacturer-facing files that share the same IDs, revision, assumptions, warnings, and source snapshot.

## Core Rules

- The immutable design version is the technical source of truth.
- PDF and XLSX are generated from one canonical export snapshot.
- Export generation never modifies a design version.
- Concept renders are labeled as visual references, not technical proof.
- Missing data is visible in the output and cannot be converted into invented facts.
- A regenerated export creates a new export record and never overwrites an earlier artifact.

## Primary Deliverables

- canonical tech-pack snapshot contract
- readiness and missing-data rules
- PDF layout and pagination plan
- XLSX workbook and worksheet plan
- measurement and bill-of-materials normalization rules
- immutable export-job and artifact lifecycle
- manufacturer readability and visual QA checklist
- implementation progress and completion records

## Planned Implementation Slice

### Backend

- `tech_pack_jobs`, `tech_pack_inputs`, and `tech_pack_assets` persistence
- `POST /tech-packs` and ownership-safe read/download endpoints
- canonical snapshot builder and readiness evaluator
- ReportLab PDF renderer
- XlsxWriter workbook renderer
- local filesystem storage adapter, reusing the Sprint 08 object-storage boundary
- background execution through the existing worker architecture

### Desktop

- enable export for a selected persisted design version
- show readiness as `ready`, `ready_with_warnings`, or `blocked`
- list missing fields before generation
- show PDF/XLSX completion independently
- open or save generated artifacts through privileged Electron IPC

## Acceptance Criteria

- Both files resolve to the same design ID, version ID, export ID, and snapshot hash.
- Export output is deterministic for the same contract version and input snapshot.
- Required unknown fields produce a blocked result or explicit warning according to policy.
- Measurements retain value, unit, status, and source.
- BOM entries distinguish known, assumed, and missing procurement facts.
- PDF tables paginate without clipped rows or unreadable text.
- XLSX cells use typed numbers where possible and disable string-to-formula interpretation.
- Generated files pass automated structure checks and visual inspection.
- Earlier exports remain accessible after regeneration.

## Non-Goals

- pattern files or DXF/AAMA export
- automatic grading across size ranges
- PLM or manufacturer portal integration
- supplier purchasing workflows
- compliance certification
- claims that an AI concept image is production accurate

## Dependencies

- Sprint 06 immutable persistence
- Sprint 08 asset storage and worker boundaries
- complete `DressSpec` snapshots from the domain package
- approved render asset selection when a visual reference is included

## Risks

- False completeness could cause manufacturing errors.
- Large tables and long notes can damage PDF layout.
- Formula injection is possible if imported text is written unsafely to XLSX.
- PDF and workbook implementations can drift without one normalized input contract.
- Fabric, trim, and cost fields are not yet a full sourcing database.

## Verification Strategy

- unit-test canonical snapshot normalization and readiness classification
- golden-structure tests for PDF page text and workbook sheets/cells
- render PDF pages to images and inspect every page
- open XLSX with a parser and validate sheet names, types, filters, freezes, and formulas
- test missing, assumed, confirmed, and mixed-unit fixtures
- verify artifact checksums and immutable traceability in PostgreSQL

## Planning Documents

- `docs/exports/README.md`
- `docs/exports/tech_pack_content_contract.md`
- `docs/exports/readiness_and_missing_data.md`
- `docs/exports/pdf_export_strategy.md`
- `docs/exports/spreadsheet_export_strategy.md`
- `docs/exports/export_lifecycle_and_storage.md`
- `docs/exports/manufacturer_readability_checklist.md`

## Senior Developer Notes

The export should help a manufacturer ask fewer questions, not hide unanswered ones. Professional honesty is a functional requirement.
