# Tech Pack Export

Last updated: 2026-07-11

Status: Sprint 09 planning artifacts and implementation completed.

## Purpose

Define deterministic manufacturer-facing PDF and XLSX tech packs derived from one immutable dress version.

## Architecture Decision

1. Build one canonical `TechPackSnapshot` from the selected design version.
2. Evaluate readiness before queueing generation.
3. Persist the snapshot hash, contract version, warnings, and exact source IDs.
4. Render PDF and XLSX from that same snapshot in a background worker.
5. Store files through the shared private asset-storage abstraction.
6. Preserve every completed export as an immutable historical artifact.

## Tool Direction

- ReportLab for programmatic PDF generation and controlled tables/pagination.
- XlsxWriter for deterministic XLSX generation, formatting, images, validation, and typed cells.
- Pillow only for safe image metadata checks and bounded image preparation.
- pypdf/openpyxl-style readers may be used in tests to inspect generated structure, but generation remains ReportLab/XlsxWriter.

## Implementation Map

- `services/api/src/fashion_api/tech_packs.py`: snapshot, readiness, lifecycle, and worker processing
- `services/api/src/fashion_api/tech_pack_renderers.py`: PDF and XLSX generation
- `services/api/src/fashion_api/tech_pack_storage.py`: private atomic local storage
- `services/api/alembic/versions/20260710_0004_tech_pack_exports.py`: persistence and immutability trigger
- `apps/desktop/src/renderer/src/TechPackExportDialog.tsx`: designer export workflow
- `services/api/tests/test_tech_packs.py`: cross-format and injection-safety coverage

## Documents

- `tech_pack_content_contract.md`
- `readiness_and_missing_data.md`
- `pdf_export_strategy.md`
- `spreadsheet_export_strategy.md`
- `export_lifecycle_and_storage.md`
- `manufacturer_readability_checklist.md`

## Official References

- https://docs.reportlab.com/reportlab/userguide/ch1_intro/
- https://docs.reportlab.com/reportlab/userguide/ch2_graphics/
- https://xlsxwriter.readthedocs.io/
- https://xlsxwriter.readthedocs.io/workbook.html
