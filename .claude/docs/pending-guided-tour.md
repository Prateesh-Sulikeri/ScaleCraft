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

## Addendum (2026-08-06): Start over + sidebar docking

Two follow-ups landed after real use of the 0.1 tour:

- **Start over** (`TourController` -> `ChapterWorkspace.handleResetToStarter`).
  Replay alone was not enough: the tour narrates a deliberately broken
  starter graph, but by the time a learner wants it again their board is
  fixed and autosaved, so every "fix it" step opens pre-satisfied and the
  replay teaches nothing. Start over discards the chapter's save slot,
  restores `starterGraph` via the new `store.resetGraph` (loadGraph plus a
  wiped undo history - a leftover `past` entry pre-satisfies the undo step),
  clears the Validate/Submit outcomes, and restarts the run at step 1.
  Two-step confirm, since it throws away work.
  - Deliberately does NOT clear `chapterProgress`. Completion has its own
    reset on the Learning Path (`ChapterRow` -> `progress-store.resetChapter`)
    and un-passing a chapter from a tour button would be a surprise. The
    visible consequence: for an already-passed chapter the Submit step opens
    pre-satisfied (a Next button), which is the normal pre-satisfied path,
    not a dead end.
  - Scoped by construction to chapters declaring `editorTourId` (only 0.1),
    since the controls live inside `TourController`. No new chapter field.
- **Idle controls moved into the sidebar footer.** The `fixed bottom-4
  left-4` pill covered the bottom of the sidebar's own content. They now
  portal into a slot `ChapterSidebar` renders (`tourSlotRef` ->
  `idleSlot`), falling back to the floating position only in focus mode,
  which unmounts the sidebar. Copy that pointed at "the pill in the corner"
  (chapter 0.1 problem statement, hint, lesson body, tour steps 1 and 21)
  was updated to match.

## Addendum (2026-08-08): Resilience redesign - plan of action (scoping, not started)

The 26-item punch list above is closed, but it is reactive: each fix answers
one specific way a real session broke the script. The user flagged two
classes of problem it does not solve structurally - a curious/distracted
user doing something no step anticipated, and a live bug (bad predicate,
missing selector) leaving the user stuck with no generic recovery. Produced
via deep ideation with Fable (full brief and reasoning in session history,
not reproduced here - this is the distilled plan). Not yet started; no
branch cut, no code written.

### Diagnosis

All 26 fixes share one root cause: the engine treats the script as ground
truth and the app as scenery, when it is the reverse. It cannot currently
tell apart "user hasn't done the thing yet," "the world stopped supporting
this step" (an anchor vanished, a node got deleted), and "the tour's own
code is broken" (a throwing predicate, a renamed selector) - all three
render as identical silent waiting today. The fix is not "handle more
deviations," it is giving the engine a way to distinguish those three
situations and respond truthfully to each.

### Position: additive hardening, not a rewrite

Keep the linear step-index + predicate script. Do not move to a pure
milestone/achievement model - sequenced pedagogy (see the failure
explanation before the fix) and the pre-satisfied mechanism both depend on
a cursor, and an order-free milestone system would silently check boxes,
which is the exact silent-skip bug pre-satisfied detection was built to
prevent. No state-machine library either (five states, shipped,
browser-tested - a library rewrite buys formality with regression risk).

What does change, all additive to `TourStep`/`TourContext`/the persisted
run-state:

- **The cursor gets revalidated, never trusted.** A new optional `requires`
  field per step: role-based structural queries ("a cache node exists,"
  never "node #47 exists"), evaluated continuously while a step is active,
  not just on entry. Referencing by role instead of instance id means
  delete-then-replace, rename, and "fixed the wrong way" are non-events -
  the requirement is satisfied however the state got there.
- **Predicates must be level-triggered, not edge-triggered** - assert a
  state ("lastValidationErrorCount === 0"), never an event ("user just
  clicked Validate"). Mostly true already; audit all 21 steps against it.
  Level-triggered predicates are what make undo storms, out-of-order
  gestures, and non-mouse input (keyboard, screen reader) all naturally
  tolerable without bespoke handling.
- **"Taught" becomes hard-gate-derived, not cursor-derived.** Tag each step
  `hard` (see the failure explanation, fix both faults, revalidate clean,
  submit) or `soft` (everything else). Completion is defined by the hard
  gate set, order-free, not by "reached step 21."

### The airbag invariant (covers: stuck-on-a-live-bug)

Every active step must present a working advance-or-exit affordance within
about 3 seconds of entry, always, even when the tour's own machinery is
broken. Three failure classes, one policy: degrade to ambient rendering
(the >45%-viewport fallback already shipped, generalized), tell the truth,
keep moving.

- **Target resolution failure** (selector doesn't resolve): retry for
  2-3s via ResizeObserver/rAF (absorbs legitimate mount races), then render
  ambient with the full step content and a Next button.
- **Throwing predicate**: one try/catch at the evaluator, never per-step.
  On throw, treat the step as manually advanceable and log it. A typo in
  one step's closure must never soft-lock the whole tour for every future
  user.
- **Predicate that can never become true**: indistinguishable from "hasn't
  done it yet" at runtime. Two nets: `requires` catches the "world drifted"
  case deterministically; the watchdog (below) catches the residue.
- **Static "tour doctor" test** (Vitest, runs pre-runtime): grep every
  `data-tour` usage and assert every step's `target`/`spotlightAlso`/
  `popoverAnchor` resolves to one that exists; run every `waitFor` against
  synthetic `TourContext` fixtures (empty/solved/mid-fix board) asserting
  none throws and each is satisfiable by at least one fixture. Turns
  "anchor renamed in an unrelated future refactor" from a silent runtime
  dead end into a red CI check at the moment of the refactor. Likely the
  single highest-leverage item in this plan for the effort involved.

### Watchdog (covers: user stuck without a live bug)

Foreground-time-only (Page Visibility API, so a 20-minute tab-switch never
fires it - that is what the persisted run-state already handles correctly),
interactive steps only, threshold ~60-75s of visible unsatisfied time.
Fires a quiet additional row on the existing card, not a modal: restate the
mechanic, offer "Skip this step" (new - advances the cursor by one, unlike
today's Skip which abandons the whole tour) and "Pause tour." `role="status"`
so a screen-reader user who cannot perform a pointer gesture at all gets a
spoken exit.

Principle check: this does not violate "hints never auto-surface based on
attempt count" - that principle governs solution content for the design
problem; the watchdog only ever offers an exit, never a fix. Hold this line
precisely on `fix-component`/`fix-edge`: the watchdog row restates the
mechanic only, never what to fix.

### Five mechanisms for the "curious user" catalog (not per-scenario patches)

Every deviation scenario (deleted/renamed node, undo-storm, placed
something irrelevant, right-click into an unrelated context-menu action,
keyboard-only input, tab-switch, window resize/zoom, browser back/forward,
focus mode unmounting the sidebar, two tabs on one chapter) collapses into
one of five:

1. **`requires` + reconciler** - role-based structural queries (above).
   Never auto-mutates the user's graph and never silently moves the
   cursor (both are trust violations); shows a truthful one-line note and,
   where the missing thing is placeable, reuses `narrowAvailableComponentIds`
   as a restore affordance. Start Over remains the nuclear fallback.
2. **Pause on surface loss** - the tour auto-pauses (reusing the existing
   `paused(stepIndex)` state) the instant its host surface unmounts:
   focus mode, router navigation away, browser back/forward, tab close.
   A `pauseReason` bit distinguishes surface-loss (auto-resume on return)
   from user-initiated Escape (resume pill). One tested code path instead
   of a special case per navigation trigger.
3. **Modal steps own the keyboard; interactive steps own nothing.** The
   existing focus-trap scoping (dimmed + non-interactive steps only)
   extends to swallowing app hotkeys on those same steps. Interactive
   steps swallow nothing - explicitly do not sandbox the user's input
   during a gesture step; let mechanisms 1 and 4 absorb whatever results.
   A tour that fights input feels broken even when it isn't.
4. **Continuous live-state evaluation** - mostly already built
   (`TourContext` is assembled fresh, pre-satisfied detection exists).
   Addition: `requires` evaluated during the step, not just on entry, so
   state drifting out from under an already-active step is caught live.
5. **Environment re-measure + multi-tab adoption** - observer-driven
   spotlight/popover measurement (finishing work on shipped code, not new
   architecture). Multi-tab: listen for the `storage` event on the tour
   key and re-hydrate through the same resume-reconcile path as mechanism
   2 on change. No tab leadership election - overbuilding for a
   permanently single-player product; last writer wins, worst case is one
   re-narrated step.

### Local signal, no backend

No telemetry infra exists and none should be built speculatively. A capped
localStorage ring buffer (~200 entries) of tour events (`step-entered`,
`advanced-via`, `watchdog-fired`, `resolution-failed`, `predicate-threw`,
`requires-broke`, `reconciled-via`, `tour-exited-via`); a stale orphaned
`running(stepIndex)` on reload is itself the tab-close-abandonment record.
Dev channel: `window.__scaleTour.dump()`. User channel: a "Report a
problem" affordance on the watchdog/blocked-step cards that opens a
prefilled GitHub issue with the buffer contents, visible before sending.
Honest limitation: this proves existence of a problem, not its rate -
silent abandoners are silent by definition. A one-route anonymous counter
(no user id, day-granularity) is an explicit, deferred slice 4, built only
if beta evidence demands rates the existence-proof channel can't give.

### Sequencing (4 independently-shippable branches, no rewrite, no migration)

All new fields (`requires`, `hard`) are optional additions to `TourStep`;
`waitFor` keeps its name and shape. The persisted run-state shape is
unchanged, so a user mid-tour when this ships needs no migration - their
stored `stepIndex` is revalidated against the live board by the new
reconcile path exactly as intended, not specially handled. Add a `version`
field to the persisted state now regardless, as a door for the next change.

1. `feature/tour-airbag` (~1-2 days): safe predicate evaluator,
   resolution-failure fallback into ambient mode, breadcrumb ring buffer,
   the tour-doctor static test. After this slice, "stuck on a live bug" is
   structurally closed regardless of what breaks next.
2. `feature/tour-watchdog` (~2 days): the timeout row, per-step skip,
   `hard` tag + no-solution-content rule for fix-step watchdog copy,
   Report-a-problem wiring.
3. `feature/tour-reconciler` (~3-4 days, the largest slice): `requires`,
   pause-on-surface-loss with `pauseReason`, modal hotkey scoping,
   `storage`-event multi-tab adoption, observer-driven re-measure,
   hard-gate-derived completion, the level-vs-edge predicate audit.
4. `feature/tour-beacon` (deferred): the anonymous counter route, only if
   evidence demands it.

**Explicitly rejected**: milestone/achievement engine rewrite, state-machine
library adoption, automatic graph mutation to "repair" a step, input
sandboxing during interactive steps, tab leadership election, and - going
forward - any more per-scenario patches. A new deviation that the five
mechanisms above don't absorb means generalizing a mechanism, not adding a
line to a punch list.

### Verified against code (2026-08-08, before `feature/tour-airbag`)

Checked every claim above against the actual `src/tour/` implementation so
the next session starts from confirmed facts, not re-derived ones.

**Holds up, and cheaper than it reads** - the plan is additive on plumbing
that already exists, not speculative:
- The 0.45 broad-target ambient fallback is real (`TourOverlay.tsx`
  `BROAD_TARGET_AREA_RATIO`) - the airbag's "degrade to ambient rendering"
  is generalizing this, not building it.
- Pre-satisfied detection exists (`TourController.tsx`'s `entry`/
  `preSatisfied` state), as does the `paused(stepIndex)` run status
  (`tour-state.ts`'s `TourRunState`).
- `TourContext` is already a `useMemo` recomputed on every relevant store
  change, and `stepSatisfied` is already computed fresh every render
  (`TourController.tsx` L130/L144). `requires` needs no new continuous-
  evaluation plumbing - it reuses the exact path `waitFor` already runs
  through, just interpreted as a failure signal instead of an advance
  trigger. This is the main reason the plan is Sonnet-sized: the hard part
  (live, render-time predicate evaluation) is already shipped.
- `parseTourState` destructures only known fields and silently drops the
  rest, so adding the `version` field is non-breaking today with no
  migration code needed.
- `TourStepTarget` is a closed 14-value string-literal union (`types.ts`)
  with every `data-tour` usage attributable across exactly 7 named files
  (per that file's own doc comment). The tour-doctor test is mechanical to
  write against it - confirms the "highest-leverage item for the effort"
  claim.
- No telemetry, ring-buffer, or GitHub-issue-prefill code exists anywhere
  in `src/` today - slice 2 is genuinely greenfield, nothing to reconcile.

**A live bug that proves the diagnosis, not a hypothetical** - the
`fix-edge` step's predicate (`design-editor-tour.ts`) is
`ctx.edgeKindById["bb-0-1-edge-client-app"] === "request-flow"`, keyed to
one hardcoded starter-graph edge id. Delete that specific edge and draw a
fresh, correctly-kinded one instead of editing it in place, and the
predicate can never become true again - exactly the class of bug `requires`
exists to close. Use this step as the mechanism's first real conversion
(a role-based check: "an edge from Client to Application Server exists with
kind request-flow") instead of inventing a synthetic test case for slice 3.

**One claim that doesn't hold**: mechanism 3 says modal-step keyboard
scoping "extends" the existing focus-trap. It doesn't exist yet.
`TourOverlay`'s own keydown handler only intercepts Escape/Enter/Tab.
`useCanvasShortcuts` (`src/canvas/use-canvas-shortcuts.ts`) is a fully
separate `window` keydown listener - Ctrl+Z, Ctrl+D, Shift+L, `/`, all of
it - with zero awareness the tour exists. Concretely: on any blocking step
today (e.g. "welcome", "validate-intro"), if focus is still on the canvas
from before the tour opened, those shortcuts fire for real underneath the
backdrop. This is new integration work for `feature/tour-reconciler`, not
an extension. The clean hook-in point: `useCanvasShortcuts` already gates
several branches on `componentPicker`/`focusMode` booleans read from the
store; add a matching store flag TourController sets on modal steps
(mirroring the existing `document.body.dataset.tourActive` pattern it
already sets) rather than trying to coordinate `stopPropagation` ordering
between two independent listeners.

**Needs a one-line scoping decision before coding, not a blocker for
`feature/tour-airbag`**: today the tour's own "completed" is purely
`stepIndex >= steps.length - 1` (`TourController.tsx`'s `advance()`), and
it's already a separate concept from the chapter's real completion gate
(`hasSubmittedPassing`, sourced from `chapterProgress`, independent of
tour position). Before building "hard-gate-derived completion," pin down
whether it's about letting the tour register itself as done when a learner
solves things out of script order, or something else - the mechanism list
doesn't fully disambiguate it, and it only matters for slice 3.

## Slice 1 (2026-08-09): `feature/tour-airbag` - done

Branched from `release/v4.1.0-part-1-curriculum`. Closes "stuck on a live
bug" per the airbag invariant above. All four planned pieces landed:

- **Safe predicate evaluator** (`TourController.tsx`). `step.waitFor(ctx)` is
  now called inside a `try`/`catch`; a throw is treated as `stepSatisfied =
  true`, which renders exactly like a step with no `waitFor` at all (a
  normal Next button, no auto-advance, since `preSatisfied` is derived from
  the same value). One typo in one step's closure can no longer soft-lock
  the tour for every future user. Logging the throw has to happen in a
  `useEffect`, not inline in the `try`/`catch` - `react-hooks/refs` disallows
  reading or writing a ref during render, so the dedupe-per-step-id check
  (via a ref) had to move out of the render body.
- **Resolution-failure fallback** (`TourOverlay.tsx`). A waiting step whose
  declared target hasn't resolved after `RESOLUTION_GRACE_MS` (2.5s - long
  enough to absorb a legitimate mount race, short enough not to strand a
  learner on a genuinely broken selector) gets a manual Next button and an
  honest one-line note ("Couldn't find what this step is pointing at - you
  can continue manually."), reusing `text-state-error` rather than adding a
  token. The ambient rendering itself (no dimming, no ring) was already
  automatic whenever `rect` is null - only the interaction affordance was
  missing. The "reset to not-timed-out" side is handled with the
  adjust-state-during-render pattern (same one `TourController`'s `entry`/
  `preSatisfied` already uses), not a second effect - `react-hooks/set-
  state-in-effect` flags an unconditional `setState` as the first statement
  of an effect body, and the reset needs to fire the instant `rect` goes
  non-null, not on a delay.
- **Breadcrumb ring buffer** (`tour-log.ts`, new file). Capped-at-200
  localStorage ring buffer, `logTourEvent(tourId, event)` /
  `dumpTourLog()` / `clearTourLog()`, plus `window.__scaleTour.dump()` for
  dev inspection. The `TourLogEvent` union carries all eight event names the
  addendum names (`step-entered`, `advanced-via`, `predicate-threw`,
  `resolution-failed`, `watchdog-fired`, `requires-broke`, `reconciled-via`,
  `tour-exited-via`), but only `predicate-threw` and `resolution-failed`
  have call sites yet - the rest are slice 2/3's to wire up. No backend,
  per the addendum's "local signal, no backend" section.
- **Tour-doctor static test** (`tour-doctor.test.ts`, new file). Greps every
  `data-tour="..."` literal actually present in `src/` (excluding
  `src/tour/` itself, which only ever contains the interpolated
  `` `data-tour="${target}"` `` template, not a literal one) and asserts
  every registered tour's `target`/`spotlightAlso`/`popoverAnchor` resolves
  to one of them - a stronger check than the pre-existing
  `design-editor-tour.test.ts` assertion, which only validated against the
  `TourStepTarget` type union, not what's actually still wired into JSX
  anywhere. Also runs every `waitFor` against three synthetic `TourContext`
  fixtures (empty/mid-fix/solved) confirming none throws and each is
  satisfiable by at least one - generalizes over future steps/tours instead
  of relying on someone remembering to hand-write a predicate test per step.

**Not touched, correctly**: `requires`, pause-on-surface-loss, modal hotkey
scoping, the watchdog, hard-gate completion, multi-tab adoption - all slice
2/3. `fix-edge`'s hardcoded-edge-id predicate itself is still unconverted;
slice 1 makes it fail safely (manual Next, logged) rather than fixing the
underlying fragility, which is `requires`' job in slice 3.

**Verification**: full pipeline green (`typecheck`, `lint`, 1587 tests
across 187 files including 5 new/changed in `src/tour/`, `build`). No
`DESIGN.md` change - no new token or component, and the one new bit of UI
copy reuses the existing `text-state-error` token. Manual click-through not
yet done this pass.

**Next**: `feature/tour-watchdog` (slice 2), branched from
`release/v4.1.0-part-1-curriculum` same as this one.

## Two bugs found in real-browser use, same slice-1 branch (2026-08-09)

Reported from an actual session: clicking the real Validate button early
(while step 10 "validate-intro" was still showing, before advancing) and
placing `sql-database` early via "picker-tour"'s open picker, unconnected.
Both fixed here rather than deferred, since they're narrowly scoped and one
is a real bug independent of the deviation that surfaced it.

- **`ValidationIndicator.tsx`'s outside-click-to-close didn't exempt the
  tour's own UI.** Its document-level mousedown listener closes the
  violations dropdown on anything outside the button itself (with an
  existing exemption for `.react-flow__node` clicks). The tour's Next/Back/
  Skip buttons weren't exempted, so clicking Next while the dropdown was
  open (only reachable by clicking Validate on a non-`waitFor` step like
  validate-intro, since the intended gesture-driven path auto-advances
  without ever touching Next) closed it in the same tick the tour advanced
  to a step that wanted to spotlight it via `spotlightAlso` — it then
  measured as gone and the spotlight silently dropped it. Fixed with one
  more exemption clause, `target.closest("[data-tour-step]")`, matching
  TourOverlay's own portal-root marker — the same pattern the existing
  react-flow exemption already uses. This is a real, general bug (not
  tied to the deviation that surfaced it) — worth noting as a small,
  independent example of the exact class of "the tour's assumed order
  isn't enforced anywhere" the resilience addendum diagnoses at a system
  level.
- **validate-click's body hardcoded "two real problems."** True only on the
  one path where nothing was touched before this step — "picker-tour" (a
  few steps earlier) deliberately leaves the picker open
  (`allowsComponentPicker`), so a learner who places a component early can
  genuinely change what Validate finds (an unconnected `sql-database` adds
  a third issue). Reworded to not name a count at all, rather than trying
  to compute one — `TourStep.body` is a plain string, not a function of
  `TourContext`, and making it one is squarely the "level-triggered, not
  hardcoded" territory slice 3's `requires`/hard-gate work already claims,
  not a slice-1 patch.
- **Not fixed, flagged instead**: `content/chapters/index.ts`'s
  `problemStatement` for bb-0-1-welcome has the identical "two real faults"
  claim, same staleness risk. Left alone — this is authored chapter content
  (chapter-author skill's domain per `CLAUDE.md`), not tour UI chrome, and
  wasn't touched here.

Verified: full pipeline green (`typecheck`, `lint`, 1588 tests, `build`).

## A third bug, same real-browser session (2026-08-09): auto-advance ate the read

The dropdown-close fix above wasn't the whole story - after it landed, the
step still "sort of gets skipped as soon as the validate button is clicked."
Root cause: `validate-click`'s `waitFor` is satisfied the instant any
Validate result exists, and the controller's ~600ms acknowledgement timer
(`ADVANCE_DELAY_MS`, tuned for a step whose only content is the gesture
itself - see its own doc comment) then auto-advances to `fix-component`
regardless of how many violation cards are actually in the dropdown it just
opened. The dropdown staying open (the previous fix) was necessary but not
sufficient - the tour's own spotlight and popover had already moved on to a
different part of the screen before there was time to read it.

Fixed with a new opt-out, `TourStep.noAutoAdvance` (`types.ts`), set on
`validate-click` and `revalidate-clean` - the only two steps whose real
payload is something the gesture *reveals* rather than the gesture itself.
Once satisfied, such a step now renders exactly like an already-satisfied
one on entry: a normal Next button, on the learner's own pace, no timer.
Implemented by folding it into the existing `preSatisfied` branch of
`interactionState` rather than adding a third state value - the auto-advance
effect only fires on `"satisfied"`, which these two steps now never reach.

New test in `design-editor-tour.test.ts` asserts `noAutoAdvance` is set on
exactly those two ids and that both are ones spotlighting
`validation-details`, so a future step with the same "reveals a dropdown to
read" shape doesn't silently miss the same fix. Verified: full pipeline
green (`typecheck`, `lint`, 1590 tests, `build`).

## Flow change, same real-browser session (2026-08-09): move component placement earlier

User-requested reorder, confirmed via AskUserQuestion before touching code
(two structurally different readings of "step 13 stays the edge change"
were on the table - picked "place and connect both merge into picker-tour",
not "split placement into its own new step").

- **`picker-tour` (step 7) now requires placing AND connecting SQL
  Database**, not just browsing the picker. `waitFor: (ctx) =>
  presentComponentIds.includes("sql-database") &&
  connectedComponentIds.includes("sql-database")`. `narrowAvailableComponentIds`
  deliberately NOT set - the step's whole point is demonstrating search/
  browse, which a picker narrowed to one item can't teach.
- **The old `fix-component` step (12) is deleted**, not repurposed - its
  entire job moved to picker-tour. `fix-edge` (was 13, now 12) and every
  step after it are unchanged in content, just shifted down by one
  position. Total step count 21 -> 20 (welcome's copy and every
  `stepIndex/total` test string updated).
- **New `TourContext.connectedComponentIds` field** (`types.ts`,
  `TourController.tsx`) - componentIds with at least one edge touching
  either endpoint. Generically useful (not scenario-specific): the old
  `fix-component` step's `waitFor` only ever checked placement, never the
  connection its own body text told the learner to make - this closes that
  gap rather than carrying it forward into picker-tour.
- **Deleted, not adapted**: the integration test for
  `narrowAvailableComponentIds` (`TourController.test.tsx`), since no
  step in this tour sets that field anymore now that fix-component is
  gone. The mechanism itself is untouched in `TourController.tsx` and
  still available to a future step - it's just currently dormant. Worth
  knowing before assuming it's dead code.
- **Not touched, flagged instead**: `content/chapters/index.ts`'s
  `problemStatement` and `specs/bb-0-1-welcome.spec.md` both still describe
  the old fix-component/fix-edge split. Chapter-author's domain, not
  engineering's - left alone.

Verified: full pipeline green (`typecheck`, `lint`, 1589 tests, `build`).

## Cut, same real-browser session (2026-08-09): the undo-redo step

User's call: nobody needs a dedicated step teaching what Undo is. Removed
outright, not repurposed - 19 steps now.

- Deleted the `undo-redo` step (`design-editor-tour.ts`) and its sole
  `TourContext` consumer, `canUndo` (`types.ts`, `TourController.tsx`) - no
  step reads it anymore, so it was dead plumbing, not dormant capability
  like `narrowAvailableComponentIds` (which a future step could still
  legitimately use).
- **`"undo-redo"` stays a valid `TourStepTarget`** - `AppHeader.tsx`'s
  `data-tour="undo-redo"` marker is untouched, since Undo/Redo remain real
  app features, just no longer narrated. The type documents anchors that
  exist, not anchors a step currently uses.
- Every step after undo-redo in the array shifts down one position;
  content otherwise unchanged. `header-tools` now advances straight to
  `open-picker`.
- Test harness's `make-undoable` button removed (no consumer left).

Verified: full pipeline green (`typecheck`, `lint`, 1588 tests, `build`).

## New capability, same real-browser session (2026-08-09): highlight one picker item

User's ask: highlight SQL Database in picker-tour (step 6) so it's easy to
find, without narrowing the palette (which would undercut the step's own
"search or browse by category" copy).

- **New store field, `highlightedComponentId: string | null`**
  (`canvas/store.tsx`), read by `ComponentPicker.tsx` to pre-select that
  item's roving-active ring (`aria-selected`/`ring-2 ring-foreground/40`) -
  the same visual the picker's own keyboard navigation already draws, not a
  new spotlight mechanism. Reused deliberately: no new UI language for the
  learner to parse.
- **Keyed on the id changing, not on the picker's open transition.** The
  obvious first design (highlight on open, mirroring
  `narrowAvailableComponentIds`'s pattern) doesn't fire in practice - the
  picker is opened by the *previous* step (`open-picker`) and stays open
  straight into `picker-tour` (`allowsComponentPicker`), so there's no
  fresh open transition left to hook into by the time the highlight should
  appear. `ComponentPicker.tsx` tracks `highlightedComponentId` itself
  (adjust-state-during-render, mirroring the existing `wasOpen`/`lastQuery`
  pattern) and re-applies whenever the id changes, regardless of `isOpen`.
- **New `TourStep.highlightComponentId`** (`types.ts`) +
  `TourController.tsx` effect setting/clearing the store field, mirroring
  `narrowAvailableComponentIds`'s active-gated effect but simpler - no
  prior value to restore, since the highlight is entirely tour-owned.
- A learner moving the keyboard cursor themselves overrides the highlight
  immediately (same roving-index state either way) - never fights real
  input, consistent with the airbag's "never sandbox input during an
  interactive step" principle.
- Set on `picker-tour` only: `highlightComponentId: "sql-database"`,
  `narrowAvailableComponentIds` left unset (confirmed via a dedicated test)
  so the step's own "search or browse" copy stays true.

Verified: full pipeline green (`typecheck`, `lint`, 1591 tests, `build`).

## Slice 2 (2026-08-09): `feature/tour-watchdog` - done

Stacked on `feature/tour-airbag`'s tip, not branched fresh from
`release/v4.1.0-part-1-curriculum` as the addendum above originally said -
that instruction predates the same-day bug-fix cascade that landed on
`feature/tour-airbag` after slice 1's own "done" entry above; Report-a-
problem (below) needs `tour-log.ts`, which only exists on that branch, and
building against the stale base would have fought the current 19-step script
instead of the 21-step one the addendum was written against. All four
planned pieces landed:

- **Timeout row** (`use-watchdog.ts`, new file). `useWatchdog(enabled,
  resetKey, thresholdMs)` — one scheduled `setTimeout` carrying a
  remaining-time budget across Page Visibility toggles, not a poll loop.
  `visibilitychange` to hidden subtracts elapsed time from the budget and
  clears the timeout; the next visible transition reschedules with what's
  left, so a 20-minute tab-switch never fires it (foreground-time-only, per
  the addendum). Threshold is `WATCHDOG_THRESHOLD_MS = 70_000`
  (`TourController.tsx`), the middle of the addendum's suggested 60-75s
  band. `resetKey` is the step id, so a step change restarts the budget.
  Enabled only while `interactionState === "waiting"` — never on a
  non-interactive step, never once the gesture has landed. Two effects, not
  one: `react-hooks/refs` disallows touching a ref during render, so the
  budget-reset ref writes and the `fired` state's own reset (the sanctioned
  adjust-state-during-render pattern, same one `TourController`'s `entry`
  already uses) can't share a code path — see the file's own doc comment.
- **Per-step skip.** `TourOverlay.onSkipStep` is the same function as
  `onNext` (`TourController` passes `advance` for both) — exposed under a
  second name so the watchdog row can offer it while `interactionState` is
  still "waiting", the one state the regular Next button never renders in.
  Distinct from the existing "Skip tour" link, which ends the whole run.
- **`TourStep.hard` tag** (`types.ts`) - set on `picker-tour`,
  `validate-click`, `fix-edge`, `revalidate-clean`, `submit-click`: the
  addendum's "see the failure explanation, fix each fault, confirm clean,
  submit". Data only, nothing reads it yet - it exists so slice 3's
  hard-gate-derived completion doesn't need every step retroactively
  annotated.
- **No-solution-content rule for fix-step watchdog copy** - held by
  construction rather than a per-step check: the watchdog row's text
  (`TourOverlay.tsx`) is a single hardcoded string, never interpolated from
  step content, so it structurally cannot restate more than "the
  instructions above are everything this step gives you" regardless of
  which step - hard or soft - fired it. Covered by a test asserting the
  rendered copy is byte-identical whether the active step is `fix-edge` or a
  plain browsing step.
- **Report-a-problem wiring.** `tour-log.ts`'s new `buildReportUrl(tourId,
  stepId)` builds a `github.com/.../issues/new?title=...&body=...` link
  (title names the tour/step; body is the current `dumpTourLog()` buffer as
  JSON, capped at 6000 chars with a truncation note past that). Nothing is
  auto-submitted - the link hands the learner to GitHub's own compose form,
  which is the "visible before sending" review step the addendum asks for.
  Wired as a real `<a target="_blank">` (not a `window.open` click handler)
  on both the watchdog row and the existing slice-1 resolution-failed
  fallback card.

**Not touched, correctly**: `requires`, pause-on-surface-loss, modal hotkey
scoping, `storage`-event multi-tab adoption, and hard-gate-derived
completion (`hard` is tagged but not yet wired into what "taught" means) -
all slice 3's job per the addendum's sequencing.

**Verification**: full pipeline green (`typecheck`, `lint`, 1614 tests across
188 files, `build`). New tests: `use-watchdog.test.ts` (fires/doesn't fire,
resets on key change, pauses across `visibilitychange`, starts already-paused
if the document is hidden at mount), watchdog-row and Report-a-problem
coverage in `TourOverlay.test.tsx`, a `hard` tag test in
`design-editor-tour.test.ts`, `buildReportUrl` coverage in `tour-log.test.ts`,
and a watchdog integration test in `TourController.test.tsx` (fires once,
logs once, Skip this step advances, row clears once the gesture lands).
Manual click-through not yet done this pass.

**Next**: `feature/tour-reconciler` (slice 3), per the addendum's sequencing
- the largest remaining slice (`requires`, pause-on-surface-loss with
`pauseReason`, modal hotkey scoping, `storage`-event multi-tab adoption,
observer-driven re-measure, hard-gate-derived completion, the level-vs-edge
predicate audit).
