# Guided Tour + Chapter 0.1 "Welcome to ScaleCraft" - Plan of Action (for Sonnet)

You are building two things in one branch:

1. An interactive, HowdyGo-style guided tour of the **Design Editor** (spotlight
   overlay, step popovers, real interactions that advance steps). Design Editor
   only - the Learning Path, Reader, and Home need no tour.
2. Chapter **0.1 Welcome to ScaleCraft** wired end to end: a real
   `ChapterDefinition`, a placeholder lesson file (Opus rewrites the prose
   later - your job is the code path, not the writing), and the manifest flip
   so the chapter is reachable. The tour auto-starts the first time a user
   opens this chapter's Design Editor.

Read before writing any code: `DESIGN.md` (tokens, z-index scale, motion
rules), `CLAUDE.md` product principles (not a game; hints never auto-surface;
motion communicates state only), and orient with graphify first
(`graphify query "..."`) before opening source files - mandatory repo hook,
applies to you.

## Why the tour exists (context, not speculation)

CURRICULUM.md §14 specifies 0.1 as: "tour of the seed graph, read-only ...
the tour is the chapter. Exercise: none." The editor's one insertion surface
is a command-palette dialog (`src/canvas/ComponentPicker.tsx`) reachable only
via `/` or right-click on empty canvas - invisible to a first-time user
(the Sandbox ships a one-time hint pill for exactly this reason, see
`src/app/sandbox/page.tsx` around `useDismissedFlag("sc-insert-hint-dismissed")`).
The tour replaces that discoverability gap for chapter users and doubles as
product onboarding, since 0.1 is the first chapter everyone meets.

## The editor surface you are touring (verified against code, 2026-08-01)

Route: `/building-blocks/[chapterSlug]` renders `ChapterWorkspace`
(`src/chapters/ChapterWorkspace.tsx`). Reached from the Reader at
`/building-blocks/[chapterSlug]/lesson` via `DesignEditorCTA` ("Begin
exercise"). Layout:

- **Header** (`src/app/AppHeader.tsx`), left to right: logo + ModeBadge,
  then Undo/Redo split button, `ValidationIndicator` (the Validate button),
  `DeepCheckButton`, Save (Ctrl+S, autosave also runs ~800ms after edits),
  `ProjectMenu` (image/JSON export), `BoardMenu`, Docs panel toggle
  (BookOpen icon), `ShortcutsButton`, `ThemeToggle`.
- **Left sidebar** (`SidebarShell` > `src/chapters/ChapterSidebar.tsx`):
  "Back to lesson" link on top, then `QuestionPane` (title, difficulty,
  status, problem statement, objectives, required-components count,
  validation summary, opt-in hints, reading links, Debrief after pass).
- **Canvas** (`src/canvas/Canvas.tsx`): React Flow board. Nodes drag; pan
  with middle-drag / selection with left-drag; `Controls` bottom-right
  (zoom/fit/lock); bottom-left corner is reserved for the Release Notes
  button. Component insertion: `/` or right-click empty pane opens
  `ComponentPicker`; picking a component enters placement mode (ghost tile
  follows cursor, "Click to place X, Hold Shift to place another, Esc to
  cancel" pill at top). Connect by dragging between node handles; a legal
  default edge kind is auto-picked (`pickDefaultKind`); selecting an edge
  opens `EdgeInspector` to change kind. Click a node: `NodeConfigPopover`.
  Right-click node/edge: `ContextMenu`. Tools group in the picker places
  zones/comments/start markers.

## The tour script (step list - implement exactly this, copy is draft-quality)

Steps marked **interactive** advance when the described action happens (via
canvas-store subscription), not on a Next click. Every step also has Back
(where sensible) and "Skip tour". Copy rules: senior voice, second person,
2-3 sentences max per step, no em dashes (use "-"), no exclamation-mark
enthusiasm, no game language.

1. `welcome` (centered, no target): what the Design Editor is; the tour
   takes about two minutes, can be skipped now and replayed later.
2. `canvas` (target: canvas): the board with the seed graph. Nodes are real
   architecture components, edges are the connections between them. Drag
   nodes; zoom/pan; point out Controls bottom-right.
3. `question-pane` (target: sidebar): where the chapter brief lives -
   problem statement, objectives, progress. Mention hints are opt-in and
   the product never pushes them. Mention "Back to lesson" at the top.
4. `open-picker` (**interactive**, target: canvas): "Press / or right-click
   empty canvas to open the component palette." Advances when
   `componentPicker` becomes true in the store.
5. `picker` (target: the open picker dialog): search, categories, Tools
   group. Note: in chapters the palette is filtered to components the
   curriculum has introduced so far.
6. `place` (**interactive**, target: canvas): "Choose Cache and click
   anywhere to place it." Advances when the component-node count exceeds
   the baseline captured at step entry.
7. `connect` (**interactive**, target: canvas): "Drag from the App Server's
   handle to the Cache to connect them." Advances when edge count exceeds
   baseline. Mention: edge kind is chosen automatically; click an edge to
   change it.
8. `undo` (**interactive**, target: undo/redo buttons): "Press Ctrl+Z twice
   to put the board back the way it was." Advances when node and edge
   counts are back at the step-6 baseline. This both teaches undo and
   restores the seed graph so the next step validates cleanly.
9. `validate` (**interactive**, target: Validate button): "Click Validate."
   Advances when a validation outcome exists. Copy states the product's core
   loop: when validation fails, the explanation of why is always shown -
   reading it is how you learn here. (If the user skipped step 8 and left an
   orphan component, the failure plus explanation IS the lesson - the copy
   must read correctly in both the pass and fail case.)
10. `header-tools` (target: the right header cluster): Deep Check (optional
    AI review, bring-your-own key), Save + autosave, Project/Board menus,
    shortcuts, theme.
11. `finish` (centered): recap in one line; point at "Back to lesson" to
    continue to the next chapter. No celebration animation.

Here is where I suggest another change, let us add another button in the top-bar called submit for BB and RWE, this button runs the Validation engine, checks against the blue-prints and if correct then confirms the assigment is complete and can move ahead. 

Interactive steps must keep the target area clickable (see overlay spec) and
each shows a subdued "or skip this step" text action, so a user who cannot
or will not perform the gesture is never stuck.

## Code actions

Work on a fresh branch `feature/guided-tour` cut from the release branch the
user names (ask which; do not guess). Never merge; ask before pushing.

### 1. New module `src/tour/`

- `types.ts` - `TourStep`:
  - `id: string` (stable, used in tests)
  - `target: string | null` - CSS selector, `null` = centered card. Prefer
    `[data-tour="..."]` selectors; the one sanctioned exception is React
    Flow's own `.react-flow__controls` for step 2's mention.
  - `title: string`, `body: string` (plain text/light markdown)
  - `placement?: "top" | "bottom" | "left" | "right"` with auto-flip on
    viewport overflow
  - `advance: { kind: "next" } | { kind: "store"; predicate: (state, baseline) => boolean }`
    where `baseline` is `{ nodeCount, edgeCount }` captured on step entry
  - `allowInteraction?: boolean` - true on interactive steps
- `design-editor-tour.ts` - the 11 steps above.
- `TourOverlay.tsx` - portal to `document.body`:
  - Spotlight via the **four-rectangle technique** (four absolutely
    positioned dim divs boxing the target rect), NOT an SVG mask - the gap
    between the four rects is naturally click-through, which is what makes
    interactive steps work. On non-interactive steps add a fifth transparent
    div over the hole to block clicks.
  - Target measurement: `getBoundingClientRect` on step entry +
    `ResizeObserver` on the target + window `resize` listener. Re-measure on
    step change.
  - Popover card: DESIGN.md tokens (`bg-panel`, `border-border`, existing
    radius/shadow patterns), step counter ("3 of 11"), Back / Next / Skip
    tour. `role="dialog"`, labelled by the step title, focus moves to the
    popover on step change. Esc = skip tour.
  - Motion: spotlight and popover transition position ~200ms; under
    `prefers-reduced-motion` they jump with no animation.
  - z-index: add `--z-tour: 55` to `src/app/globals.css` (between modal 50
    and tooltip 60, so the tour sits above the ComponentPicker during steps
    5-6 while tooltips/toasts stay above everything). Document the new token
    in DESIGN.md's z-index table in the same commit.
- `TourController.tsx` - client component mounted inside
  `ChapterWorkspaceContent` (must be inside `CanvasStoreProvider`; use
  `useCanvasStoreApi().subscribe` for advance predicates). Props:
  `{ tourId: string }`. Behavior:
  - Persistence via the existing `useDismissedFlag` hook
    (`src/lib/use-dismissed-flag.ts`), key `sc-tour-design-editor-v1`.
    localStorage is acceptable for now; note in a comment that this migrates
    to synced account data when Clerk lands (milestone 10).
  - Auto-start only when the flag is unset AND the workspace's
    `hasLoadedInitialState` is true (pass it down as a prop) so the seed
    graph is on screen before the spotlight points at it.
  - Completing or skipping sets the flag.
  - When the flag is set, render a small "Replay tour" pill bottom-center of
    the canvas area (same styling family as the placement-hint pill in
    Canvas.tsx). Pill only renders in chapters that declare the tour (see
    §3). Clicking restarts at step 1. No cross-component event plumbing.

### 2. Anchor attributes

Add `data-tour` attributes (wrappers where the target is a child component;
use `inline-flex` wrappers, never `display: contents` - it returns an empty
rect from `getBoundingClientRect`):

- `AppHeader.tsx`: `data-tour="undo-redo"` (the split-button container),
  `data-tour="validate"` (wrapper around ValidationIndicator),
  `data-tour="header-tools"` (one wrapper spanning DeepCheckButton through
  ThemeToggle - a single anchor, do not tag each button).
- `ChapterSidebar.tsx`: `data-tour="question-pane"` on the root div.
- `ChapterWorkspace.tsx`: `data-tour="canvas"` on the div wrapping
  `<Canvas>`.
- `ComponentPicker.tsx`: `data-tour="component-picker"` on the dialog root.

### 3. Declaring the tour on a chapter

Add an optional field to `ChapterDefinition` (`src/content/chapters/types.ts`):

```ts
/** Id of a guided tour that auto-runs on first visit to this chapter's
 * Design Editor. Only "design-editor" exists today (0.1). */
editorTourId?: "design-editor";
```

`ChapterWorkspaceContent` renders `<TourController tourId={...} />` only when
the open chapter sets it. Nothing else changes for tour-less chapters.

### 4. Chapter 0.1 content (placeholder quality, real wiring)

- New entry in `src/content/chapters/index.ts` (do NOT touch the two dummy
  entries): id `bb-0-1-welcome`, mode `building-blocks`, title
  "Welcome to ScaleCraft", `placeholder: true` (Draft badge stays honest
  until Opus authors the real prose), `editorTourId: "design-editor"`.
  - `availableComponentIds`: `["client", "app-server", "sql-database", "cache"]`
    (the three seed components plus Cache for tour steps 6-7).
  - `requiredComponentIds`: `[]`.
  - `validationRuleIds`: the same four general rules the dummy uses:
    `orphan-component`, `missing-input-connection`, `request-flow-cycle`,
    `component-relations`.
  - `starterGraph`: client -> app-server -> sql-database, request-flow
    edges, laid out left to right, `entryPointIds: ["<client node id>"]`.
    This is the seed graph the tour points at.
  - `blueprints`: one, requiring exactly that seed shape (matching is
    containment, so a leftover extra component is fine, but remember the
    orphan rule still fails an unconnected one - that interplay is
    deliberate, see tour step 9).
  - `hints`: one, telling the user the tour can be replayed from the pill at
    the bottom of the canvas.
  - `quiz`: none. `readingLinks`: `[]`.
  - `curriculumContext`: position "Building Blocks, Part 0: Foundations -
    Chapter 0.1", empty masteredConcepts, notYetIntroducedConcepts listing
    the obvious (every component and pattern; this is the first chapter),
    simplifications noting the seed graph is illustrative only.
- Lesson file `src/content/chapters/lessons/bb-0-1-welcome.md`: short
  placeholder prose (a few paragraphs: what ScaleCraft is, how the
  Reader -> Editor loop works, that validation explains failures, hints are
  optional), no top-level `#` heading (ChapterReader renders the h1), ending
  by pointing at the Begin exercise button. Mark it clearly as draft in an
  HTML comment for Opus. No em dashes anywhere.
- `src/curriculum/manifest.ts`: on the existing `0-1-welcome-to-scalecraft`
  entry, set `chapterDefinitionId: "bb-0-1-welcome"`. Do not touch the slug,
  number, title, or prerequisites.

### 5. Tests (Vitest, jsdom - follow existing patterns in src/chapters/*.test.tsx)

- `design-editor-tour.test.ts`: step ids unique; every non-null target
  selector resolves to exactly one element in a rendered `ChapterWorkspace`
  for chapter 0.1 (mock `getBoundingClientRect` as other canvas tests do);
  interactive steps' predicates fire on the store changes they describe
  (picker open, node added, edge added, counts back to baseline, outcome
  set).
- `TourOverlay.test.tsx`: renders title/body/counter; Next advances; Skip
  and Esc dismiss and persist the flag; non-interactive steps block clicks
  on the target, interactive steps do not; reduced-motion path renders.
- `TourController.test.tsx`: auto-starts when flag unset and initial state
  loaded; does not start when flag set; replay pill appears once completed
  and restarts the tour; no pill on a chapter without `editorTourId`.
- `bb-0-1-welcome` chapter test: `evaluateChapter(starterGraph, chapter)`
  passes as authored (guards tour step 9's "seed graph validates clean"
  promise); manifest entry resolves via `findEntry` and the registry.
- Run existing suites - the AppHeader wrapper edits may touch snapshots or
  queries in `AppHeader`/`ChapterWorkspace` tests; fix them properly, do not
  loosen assertions.

### 6. Definition of done

- Full local pipeline green: `npm run typecheck && npm run lint && npm test
  && npm run build` - non-negotiable before claiming done or asking to push.
- Manual click-through: Learning Path -> 0.1 -> Reader -> Begin exercise ->
  tour auto-runs; every step's spotlight lands on the right element in both
  themes; all four interactive steps advance on the real gesture; skip works
  at every step; replay pill works; second visit does not auto-start.
- `graphify update .` after the code lands.
- DESIGN.md updated: `--z-tour` token, one short "Guided tour" component
  note. No other doc edits.
- Ask the user before any push. Never merge.

## Explicitly out of scope

- No third-party tour library (driver.js, shepherd, etc.) - hand-rolled to
  stay on the design system and avoid a dependency for one feature.
- No read-only canvas mode - the editor stays editable during the tour.
- No tours for Reader / Learning Path / Sandbox (Sandbox keeps its existing
  hint pill; leave it alone).
- No confetti, badges, or completion celebration - finishing the tour is
  quiet (CLAUDE.md: not a game).
- No real lesson prose - that is Opus's job per `pending-content.md` Wave 1.
- No changes to the Sandbox, exam/quiz system, or Deep Check.
