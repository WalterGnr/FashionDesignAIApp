# Scene Interaction And Camera

Last updated: 2026-07-09

Status: Sprint 07 planning artifact.

## Goal

Make the preview useful for quick visual inspection without turning the workspace into a 3D modeling tool.

## First Controls

- drag to rotate around the model
- mouse wheel or trackpad to zoom within limits
- reset-view icon button
- front, three-quarter, side, and back view presets
- optional slow turntable mode, off by default

Use established orbit controls. Do not implement custom camera physics.

## Camera Rules

- perspective camera centered on the full garment
- camera automatically frames supported hem lengths
- vertical orientation remains constrained
- zoom cannot enter or pass through the mannequin
- changing design versions preserves the designer's current view when framing remains valid
- reset restores the three-quarter studio view

## Layout Rules

The canvas remains full-bleed inside the existing preview workspace rather than appearing inside a decorative card. Toolbar controls overlay the preview at stable corners and use icons with tooltips.

The selected version, approximation label, and spec summary remain readable outside or over a quiet region of the canvas.

## Motion Rules

- spec changes may interpolate simple geometry/material values for 150 to 250 ms
- camera does not jump on every field change
- respect `prefers-reduced-motion`
- no continuous animation is required when idle

## Error Interaction

If WebGL initialization fails, replace the canvas with the 2D fallback and a compact retry action. The rest of the designer workflow remains usable.
