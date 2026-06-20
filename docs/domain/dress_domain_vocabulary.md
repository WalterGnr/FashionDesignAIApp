# Dress Domain Vocabulary

Last updated: 2026-06-20

Status: Sprint 01 learning note. This is not a final schema.

## Purpose

Sprint 01 needs fashion language that can become structured software data. This document collects useful dress-related vocabulary for the first garment spec.

## Core Dress Identity

Possible fields:

- Garment category: dress
- Dress type: evening gown, cocktail dress, casual dress, bridal dress, formal dress, runway dress
- Occasion: evening, bridal, work, casual, gala, performance, editorial
- Intended season: spring, summer, fall, winter, seasonless
- Design intent: elegant, dramatic, minimalist, romantic, structured, fluid

## Silhouette

Possible values:

- A-line
- Sheath
- Fit-and-flare
- Mermaid
- Trumpet
- Ball gown
- Empire waist
- Shift
- Slip
- Column
- Wrap
- Tent

Sprint 01 note:

Silhouette is a high-value field because it affects preview, construction, pattern notes, and user expectation.

## Neckline

Possible values:

- Crew
- Scoop
- V-neck
- Sweetheart
- Square
- Boat
- Halter
- Off-shoulder
- One-shoulder
- Strapless
- Cowl
- High neck

Sprint 01 note:

Neckline should be lockable because designers often want to preserve it across variations.

## Sleeves

Possible sleeve types:

- Sleeveless
- Cap sleeve
- Short sleeve
- Elbow sleeve
- Three-quarter sleeve
- Long sleeve
- Puff sleeve
- Bishop sleeve
- Bell sleeve
- Flutter sleeve
- Off-shoulder sleeve
- One-sleeve

Possible sleeve length values:

- None
- Cap
- Short
- Elbow
- Three-quarter
- Wrist
- Floor-length extension for dramatic designs

## Dress Length

Possible values:

- Mini
- Above knee
- Knee
- Midi
- Tea length
- Ankle
- Floor
- High-low
- Train

Sprint 01 note:

Length should include both categorical value and optional numeric measurement if known.

## Bodice

Possible fields:

- Fitted
- Relaxed
- Corset
- Boned
- Draped
- Ruched
- Wrap
- Asymmetric
- Princess seams
- Empire waist
- Natural waist
- Drop waist

## Skirt

Possible fields:

- Straight
- A-line
- Full
- Gathered
- Pleated
- Circle
- Tiered
- Bias cut
- Slit
- Wrap
- Mermaid flare
- Train

## Fabric

Possible fabric names:

- Silk
- Satin
- Chiffon
- Organza
- Tulle
- Crepe
- Jersey
- Velvet
- Lace
- Cotton poplin
- Linen
- Brocade
- Mikado

Useful fabric properties:

- Weight
- Drape
- Stretch
- Sheerness
- Texture
- Fiber content
- Finish

Sprint 01 note:

Fabric should not be just a string forever. For MVP, allow a name plus structured properties when known.

## Color

Possible fields:

- Primary color
- Secondary colors
- Colorway name
- Pattern or print
- Finish: matte, glossy, metallic, iridescent

Sprint 01 note:

Color should support plain language early, but the future preview may need normalized color values.

## Embellishments and Trims

Possible values:

- Beading
- Sequins
- Pearls
- Applique
- Embroidery
- Lace trim
- Rhinestones
- Feathers
- Fringe
- Ruffles
- Bows
- Piping

Useful fields:

- Type
- Placement
- Density
- Color
- Material
- Notes

## Closures

Possible values:

- Invisible zipper
- Exposed zipper
- Button
- Hook and eye
- Corset lacing
- Snap
- Tie
- Pull-on

## Lining

Possible fields:

- Fully lined
- Partially lined
- Unlined
- Lining fabric
- Lining color
- Support structure

## Measurements

Possible design measurements:

- Bust
- Waist
- Hip
- Shoulder width
- Back length
- Front length
- Sleeve length
- Bicep
- Wrist
- Dress length
- Hem circumference
- Train length

Measurement rule:

Every numeric measurement needs a unit.

Supported units for MVP should likely be:

- inches
- centimeters

## Construction Notes

Examples:

- Side seam zipper
- Princess seams through bodice
- Fully lined bodice
- Boning at front and side seams
- Hem finished with narrow rolled hem
- Waist seam stabilized with stay tape

## Pattern Notes

Examples:

- Bias-cut skirt
- Two-piece bodice pattern
- Separate lining pattern
- Added wearing ease at bust
- Slash-and-spread fullness at skirt

## Unknown and Assumed Values

Sprint 01 should distinguish:

- Unknown: not provided by designer or system
- Assumed: inferred by AI or app, should be reviewable
- Confirmed: explicitly chosen or accepted by designer

This distinction protects production accuracy.
