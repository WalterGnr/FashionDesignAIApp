# Sprint 04: Designer Workflow UI Planning

Status: Planning and initial implementation completed on 2026-07-08.

Suggested duration: 1 to 2 weeks.

## Goal

Plan the first usable designer interface around a fast, minimal, canvas-first workflow.

Sprint 04 first defined the designer-facing layout, core components, interaction flows, UI state model, and acceptance criteria. It now also includes the first implemented designer workspace in the Electron renderer.

## Why This Sprint Matters

The app must feel like a creative production tool, not a database form, chatbot, or generic dashboard. The UI should help a designer move quickly while keeping every AI-proposed change visible, reversible, and traceable.

The design canvas stays central. Panels and controls support the creative flow without burying the work.

## Primary Deliverables

- Main screen layout plan
- Core component inventory
- Designer interaction flow plan
- UI state model
- Change review and version visibility plan
- Empty/error/loading state plan
- Accessibility and keyboard interaction notes
- Sprint 04 progress tracker
- Sprint 04 completion record
- First designer workspace UI implementation
- Designer session command service
- Desktop tests for typed command workflow

## Planning Artifacts

- `docs/ui/README.md`
- `docs/ui/main_workspace_layout.md`
- `docs/ui/core_components.md`
- `docs/ui/designer_interaction_flows.md`
- `docs/ui/ui_state_model.md`
- `docs/ui/empty_error_loading_states.md`
- `docs/ui/accessibility_and_keyboard.md`
- `docs/sprints/04_sprint_progress_tracker.md`
- `docs/sprints/04_sprint_completion_record.md`
- `docs/sprints/04_sprint_development_completion_record.md`
- `apps/desktop/src/renderer/src/main.tsx`
- `apps/desktop/src/renderer/src/designer-session.ts`

## Main Workspace Direction

The first designer workspace should use a three-zone structure:

```text
Top command bar
  microphone control, text command, status, save/export actions

Center workspace
  large preview/canvas, immediate visual feedback, current selected version

Side panels
  spec inspector, AI change review, version timeline, locked fields
```

The center preview/canvas must remain the largest and most visually important area.

## Core Interface Areas

### Preview Canvas

Purpose:

- give immediate design feedback
- eventually host 2D/3D preview
- show selected version state

Sprint 04 planning rule:

- canvas should be a stable unframed workspace area, not a decorative card.

### Command Bar

Purpose:

- typed command entry in early implementation
- microphone control later
- listening/transcribing/interpreting status
- concise app state indicators

### AI Change Review

Purpose:

- show what the AI understood
- show proposed or applied operations
- show accepted/rejected/clarification outcomes
- prevent mysterious AI edits

### Spec Inspector

Purpose:

- show structured dress fields
- distinguish unknown, assumed, and confirmed values
- reveal production-critical gaps

### Version Timeline

Purpose:

- show immutable versions
- allow selecting prior versions
- support future revert/compare flows

### Locked Fields Panel

Purpose:

- show protected fields
- explain why a field is locked
- support future unlock workflow

## Key User Flows

### Start Design

Designer opens the app and sees:

- empty preview/canvas state
- command input ready
- minimal spec summary
- version timeline with initial state

### Type Or Speak Command

Early implementation:

- designer types a command
- command routes through the AI interpretation package
- result appears in change review

Future voice:

- designer presses microphone
- transcript appears
- committed transcript follows the same command flow

### Review AI Change

Designer sees:

- raw command
- interpreted intent
- proposed or applied operations
- fields changed
- version created or clarification required

### Correct Or Clarify

Designer can:

- answer a clarification
- rephrase command
- lock a field
- revert later

### Lock Detail

Designer can mark a detail as protected.

UI must show:

- field path
- friendly label
- reason
- lock source

### Compare Versions

Designer can inspect:

- current version
- previous version summaries
- field changes

Deep visual side-by-side comparison can wait.

### Export Tech Pack

Export stays visible as a future action but should be disabled or marked unavailable until backend/export implementation exists.

## State Management Direction

Use local UI state for:

- selected version
- active panel
- command input
- command status
- selected field
- current clarification
- preview mode
- panel collapsed/expanded state

Use domain data for:

- `DressSpec`
- `DesignVersion`
- `LockedField`
- operation results

Do not store ad hoc prompt strings as the design source of truth.

## Non-Goals

- No 3D rendering implementation.
- No live voice.
- No backend persistence.
- No export implementation.

## Acceptance Criteria

Sprint 04 planning is complete when:

- The first UI can be sketched from the documents.
- The designer's main workflow is clear.
- The UI does not hide AI decisions.
- The design canvas remains the focus.
- Empty, error, and clarification states are planned.
- State ownership is clear enough for implementation.

## Risks

### Crowded Interface

Risk:

- too many panels can slow creative flow.

Mitigation:

- prioritize canvas and command bar
- allow secondary panels to collapse
- reveal detail progressively

### Hidden AI Behavior

Risk:

- designer loses trust if changes appear without explanation.

Mitigation:

- always show change summary and affected fields
- distinguish accepted, rejected, clarification, and no-op states

### Generic Dashboard Feel

Risk:

- the app could feel operational but not creative.

Mitigation:

- avoid marketing layouts and oversized hero sections
- keep the workspace quiet, dense, and professional
- make visual preview the first-viewport signal

## Senior Developer Notes

The first UI should feel calm, direct, and professional. It should help the designer think faster, not make them manage a machine.

The implementation should begin with the actual workspace, not a landing page.
