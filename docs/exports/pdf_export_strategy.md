# PDF Export Strategy

Last updated: 2026-07-09

Status: Sprint 09 planning artifact.

## Decision

Use ReportLab to create a deterministic, print-oriented PDF directly from `TechPackSnapshot`.

## Page Structure

- A4 and US Letter presets, with one configured default per workspace
- cover page with design identity, version, readiness, and concept-reference disclaimer
- repeated header with design name, version number, and export ID fragment
- repeated footer with page number, snapshot hash fragment, and generation timestamp
- section-aware page breaks
- landscape pages only for wide measurement/BOM tables

## Layout Components

- title and revision block
- bounded visual-reference frame preserving aspect ratio
- key-value specification tables
- measurement table with repeated headers
- BOM/material table
- notes and warnings blocks
- revision-history table
- sign-off area

## Rendering Rules

- never split a single short warning or sign-off row across pages
- allow long tables to paginate with repeated headers
- wrap long words and IDs without clipping
- use embedded Unicode-capable fonts approved for redistribution
- define a restrained neutral palette with high contrast in grayscale printing
- keep a 10 mm minimum printable margin
- downsample visual references to a bounded print resolution and strip metadata

## Verification

- parse the generated PDF and assert identifiers, readiness labels, and section headings
- render every page to PNG and inspect for clipping, overlap, missing glyphs, and blank pages
- test long notes, many embellishments, mixed units, and missing-data fixtures
- verify page count and stable content for a fixed snapshot fixture

## Failure Behavior

PDF failure does not discard a successfully generated XLSX. The export job records per-format status and a safe error code.
