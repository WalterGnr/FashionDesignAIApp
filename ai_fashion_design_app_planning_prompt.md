# Planning Prompt: Real-Time AI Fashion Design App

> Paste this entire prompt into a new AI session to resume or migrate this planning project.

## Context
I am planning (not yet building) an AI-powered fashion design application. I want you to act as a technical product planner/architect and produce a detailed plan — do not write code or build anything yet.

## Core Concept
An app where an AI model generates a dress design in real time based on user input, primarily delivered through voice.

## Functional Requirements

**1. Input Method**
- Primary input: real-time voice recognition (speech-to-text → prompt for the design AI)
- User describes the dress verbally (style, color, fabric, occasion, etc.) and the AI updates the design live as they speak

**2. User Interface**
- Simple, minimal UI — the design canvas/preview should be the focus
- Voice input control (start/stop listening, visual feedback that it's listening)
- Live preview of the dress as it's generated/modified

**3. Technical Specification Storage**
- Every generated design must have a structured technical spec, including but not limited to:
  - Measurements
  - Fabric type
  - Pattern/cut details
  - Color(s)
  - Embellishments/trims
- Each design's specs are stored in a database, indexed by a unique design ID
- Specs should be structured (not just free text) so they can be queried, exported, or sent to manufacturing later

**4. Personalized Model Fitting**
- Ability to generate the dress visualization on a model body matching specific measurements (height, waist, bust, hips, etc.)
- Model measurement profiles should also be stored by ID, separately from dress design specs, so the same dress can be previewed on different body profiles
- Support re-rendering an existing design on a new/different model profile

## What I Want From You
1. Propose a system architecture (frontend, backend, AI/ML components, database schema) at a high level
2. Recommend specific technologies/APIs suited for:
   - Real-time speech-to-text
   - Real-time/fast image generation or design rendering (and how "real-time" feasibility constraints should shape the design)
   - Database choice for structured spec + model profile storage
3. Propose a database schema (tables/fields) for:
   - Dress design specs (by design ID)
   - Model measurement profiles (by model ID)
   - Relationship between a design and the model(s) it's been rendered on
4. Suggest additional features that would strengthen the product, such as:
   - Design version history / iteration tracking
   - Exporting specs as a tech pack (PDF/spreadsheet) for manufacturers
   - Saving/favoriting designs, design collections per user
   - Multi-turn voice editing ("make the sleeves shorter")
   - Fabric/material cost estimation
   - Style/reference image input in addition to voice
5. Identify the hardest technical risks (e.g., latency of real-time generation, consistency of the AI design across edits, garment realism/draping accuracy) and how to mitigate them
6. Propose a phased build roadmap (MVP → V2 → V3)

## Constraints / Notes
- This is a planning exercise only — produce a written plan, not code
- Keep the explanation organized with clear headers so it's easy to reference later
- Flag any assumptions you make explicitly

## Output Format
Structure your response with headers for: Architecture Overview, Recommended Tech Stack, Database Schema, Suggested Additional Features, Key Technical Risks, Phased Roadmap.
