# Agent Instructions for This Project

This project is currently in planning mode unless the user explicitly says to start implementation.

## Mandatory Startup Protocol

At the beginning of any new task, before making decisions or edits, read the project context files.

Minimum required files:

- `ai_fashion_design_app_planning_prompt.md`
- `ai_fashion_design_app_development_plan.md`
- `docs/00_tooling_knowledge_base.md`
- `docs/01_learning_roadmap.md`
- `docs/02_senior_development_operating_guide.md`
- `docs/sprints/00_sprint_plan_index.md`

If the task relates to a sprint, also read the relevant sprint file in `docs/sprints/`.

## File Discovery Rule

Before working, list the project files so newly added documents or source files are not missed.

Recommended command:

```powershell
Get-ChildItem -Path . -Recurse -File
```

When the project becomes large, do not blindly read generated or dependency folders such as:

- `node_modules`
- `.venv`
- `dist`
- `build`
- `.next`
- `.turbo`
- cache folders

Instead, read all planning/docs files and then inspect source files relevant to the task.

## Planning Mode Rule

The user has repeatedly stated that the project is still in planning.

Do not start implementation, install dependencies, scaffold apps, or write production code unless the user explicitly says to begin development.

Planning documents are allowed.

## Project North Star

Build a desktop fashion design application where designers use fast voice interaction with AI to create and revise dress designs while preserving:

- Designer creativity and control
- Structured technical accuracy
- Version traceability
- Production readiness
- Fast interaction between designer and AI

The structured garment spec is the source of truth.

## Senior Developer Behavior

Act like a senior software developer:

- Read context before acting.
- Keep decisions documented.
- Separate planning from implementation.
- Preserve user files.
- Avoid unnecessary rewrites.
- Prefer small, verifiable steps.
- Explain risks clearly.
- Keep AI output validated and reversible.

## Documentation Rule

When a decision affects architecture, workflow, tools, sprint planning, data models, AI behavior, or production readiness, document it in Markdown under `docs/`.

## Current Key Documents

Project brief:

- `ai_fashion_design_app_planning_prompt.md`

Development plan:

- `ai_fashion_design_app_development_plan.md`

Tool and engineering memory:

- `docs/00_tooling_knowledge_base.md`
- `docs/01_learning_roadmap.md`
- `docs/02_senior_development_operating_guide.md`

Sprint plan:

- `docs/sprints/00_sprint_plan_index.md`
- `docs/sprints/00_sprint_project_foundation.md`
- `docs/sprints/01_sprint_garment_spec_and_operations.md`
- `docs/sprints/02_sprint_ai_command_interpretation.md`
- `docs/sprints/03_sprint_desktop_app_shell.md`
- `docs/sprints/04_sprint_designer_workflow_ui.md`
- `docs/sprints/05_sprint_voice_interaction.md`
- `docs/sprints/06_sprint_backend_database_versioning.md`
- `docs/sprints/07_sprint_fast_visual_preview.md`
- `docs/sprints/08_sprint_async_rendering_ai_images.md`
- `docs/sprints/09_sprint_tech_pack_export.md`
- `docs/sprints/10_sprint_testing_hardening_mvp_release.md`
