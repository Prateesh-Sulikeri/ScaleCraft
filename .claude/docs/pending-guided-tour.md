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

## Scoping decision (2026-08-09), before `feature/tour-reconciler`: what hard-gate-derived completion means

The one open call flagged above, resolved via AskUserQuestion before any slice-3
code: **the tour self-completes early if every `hard`-tagged step's condition is
met, regardless of script order** - not just stepIndex-based completion with
`hard` feeding the chapter gate as a side signal. Concretely: `TourController`
evaluates every `hard` step's own `waitFor` against the live `TourContext`
(order-free - a step's `waitFor` is already a pure function of `ctx`, nothing
about "is this the current step"), and once all of them are true, the run's
persisted status becomes `completed` even if `stepIndex` never reached the
final step.

Scoped conservatively for slice 3: this check only *acts* (writes `completed`)
while the tour is NOT actively on screen (idle pill, paused, or skipped) - never
mid-step, so a learner reading an active card never has it yanked away by a
background completion check. A learner who satisfies everything while the tour
is actively running still finishes the normal way, through the last step's
Next/Done button; the early-completion path exists for the Skip/pause-and-
finish-manually/reload-after-solving-out-of-order cases the addendum names.
Revisitable if that turns out to feel wrong in practice.

### Slice-3 design call: what `requires` actually is, versus reusing `waitFor`

All six of `design-editor-tour.ts`'s `waitFor` predicates already read only
from live `TourContext` state (level-triggered, per the addendum's own
principle) - once `fix-edge`'s hardcoded-edge-id predicate below is converted
to a role-based check, the level-vs-edge audit passes with no other changes.
That means hard-gate completion above can reuse `waitFor` directly; it does
not need a second field.

`requires` is kept as its own, distinct, new field anyway - not a rename of
`waitFor` - because its job is different: `waitFor` gates *advancing* the
current step; `requires`, evaluated continuously while a step is active, is
for the "state drifted out from under an already-satisfied step, while the
learner is still lingering on it reading" case mechanism 4 names (e.g. a
resumed/pre-satisfied step where the learner deletes the very thing that
satisfied it before clicking Next). This is the reason `requires-broke`/
`reconciled-via` were already reserved in `tour-log.ts`'s `TourLogEvent`
union back in slice 1 - they were always meant for a field distinct from the
`predicate-threw` machinery. Applied to `picker-tour` and `fix-edge` via
shared helper predicates (not duplicated inline), since for those two steps
`requires` and `waitFor` describe the same underlying structural fact.

Not implemented this slice: the "reuses `narrowAvailableComponentIds` as a
restore affordance" enhancement the addendum mentions for a placeable missing
thing - scoped down to a truthful note only (no auto-narrowing) to keep the
mechanism's first landing small; `Start Over` remains the actual recovery
path, as the addendum itself calls out as the nuclear fallback.

### Slice-3 finding: router navigation away and tab close needed no new code

Re-reading `TourController.tsx` against mechanism 2 ("pause on surface loss")
before writing anything: navigating away from the chapter route unmounts
`TourController` entirely, but the persisted run state is left as `running`
(never rewritten to `paused` on unmount) - and the *existing* mount-time
session derivation already treats `status: "running"` as "resume active,
no pill" on the next mount. That already IS "auto-resume on return" for
navigation-away and tab-close, correctly, with no code change. The actual gap
is narrower than the addendum's list implies: **focus mode** is the only
surface-loss case that doesn't unmount `TourController` (it stays mounted,
session stays `active`, and AppHeader/ChapterSidebar - and therefore most
`data-tour` targets - vanish out from under a still-running step, currently
handled only by the airbag's ambient-degrade fallback rather than a clean
pause). Slice 3's pause-on-surface-loss work is scoped to just that case.

## Bug found live, same slice-2 branch (2026-08-09): the watchdog/resolution-failed rows could render off-screen

Reported directly from the running app ("clipping out"), not a walkthrough
finding. `TourOverlay.tsx`'s popover position was only recomputed on
`step.id`/`step.body`/viewport change (`useLayoutEffect`, one dependency
list). The watchdog row above and slice 1's resolution-failed row both add
content to the card well after that computation, with none of those
dependencies changing — so a bottom-docked or bottom-placed card's `top`
stayed anchored for the shorter, pre-row measurement, and the newly-grown
bottom rendered past the viewport edge. Exactly the class of bug this file's
own comments already name twice (the punch list's #4/#5/#6 off-screen
popovers, slice 1's `computePopoverPosition` fallback work) — jsdom has no
layout engine, so every `getBoundingClientRect` involved reports zero,
making this invisible to the whole suite by construction, same as those
earlier bugs.

Fixed with a `ResizeObserver` on the popover element itself
(`TourOverlay.tsx`), same pattern already used elsewhere in this codebase
(`Canvas.tsx`, `ComponentNode.tsx`, `ReadingProgress.tsx`) — reposition on
ANY size change to the card, not just the two cases the old dependency list
happened to name. This generalizes rather than patches: the next conditional
row added to the card doesn't need to remember to add itself anywhere.
Regression test in `TourOverlay.test.tsx` fakes a `ResizeObserver` callback
(same stub pattern as `ReadingProgress.test.tsx`) to grow the card's
measured height after mount and asserts `top` actually moves — this is the
one place in the suite that can prove the fix, since it drives the
recompute the same way a real resize would rather than asserting on the
(unmeasurable in jsdom) rendered position directly.

Verified: full pipeline green (`typecheck`, `lint`, 1615 tests, `build`).

## Slice 3 (2026-08-09): `feature/tour-reconciler` - done

Branched from `feature/tour-watchdog`'s tip (same stacking reasoning as
slice 2 - see its own entry above), after resolving the one open scoping
call via AskUserQuestion (recorded in the "Scoping decision" section above,
which also records the `requires`-vs-`waitFor` design call and the finding
that router-navigation-away/tab-close already need no new code). `git log`
on this branch is the precise record of what landed; this entry is the
narrative index into it plus what's left.

**Landed and verified (typecheck clean, full `src/tour/` suite green - 132
tests, 8 files - not yet the full pipeline):**

- **Role-based `TourContext.edges`** (`types.ts`, `TourController.tsx`)
  replaces `edgeKindById` (a `Record` keyed by the edge's own instance id)
  with `{ sourceComponentId, targetComponentId, kind }[]`, resolved from live
  node/edge state via a `componentIdByNodeId` map. `edgeKindById` had exactly
  one consumer (`fix-edge`'s `waitFor`) - fully removed, not deprecated
  alongside.
- **`fix-edge`'s `waitFor` converted to a role-based check**
  (`design-editor-tour.ts`'s new `hasClientAppRequestFlowEdge` helper) -
  closes the addendum's own "live bug that proves the diagnosis": deleting
  the starter graph's `bb-0-1-edge-client-app` and drawing a fresh edge
  between the same two components now still satisfies the step, in either
  direction.
- **`picker-tour`'s `waitFor` factored into a named helper too**
  (`hasSqlDatabase`) for the same reason - both helpers are now shared
  between `waitFor` and the new `requires` field on their respective steps
  (see the scoping decision above for why that's not considered
  duplication).
- **New `TourStep.requires` field** (`types.ts`) - continuously evaluated
  while a step is active, same safe try/catch pattern as `waitFor`
  (`TourController.tsx`). Only a true -> false transition counts as drift
  (tracked via a `requiresTracking` state keyed on `stepIndex`, same
  adjust-during-render pattern `entry`/`preSatisfied` already use) - a step
  that simply hasn't been satisfied yet reads as ordinary waiting, not
  drift. Logs `requires-broke` once per occurrence and `reconciled-via` once
  it resolves (both were reserved-but-unwired `TourLogEvent` variants since
  slice 1). `TourOverlay.tsx` renders a truthful one-line note
  (`requiresBroken` prop) - never blocks navigation, never auto-mutates
  anything, no restore-affordance UI (deliberately deferred, see the scoping
  decision). Set on `picker-tour` and `fix-edge` via the shared helpers
  above.
- **Test fixture fixes forced by the role-based change**:
  `TourController.test.tsx`'s `fix-edge-kind` test button now also seeds the
  two component nodes (`bb-0-1-client`/`bb-0-1-app-server`) the role-based
  lookup needs to resolve - the old id-keyed approach never needed the nodes
  to exist at all, which the role-based one silently would have failed
  against without this fix. Also added a `remove-sql-database` test button
  (mid-edit when the session was cut - see below) for the not-yet-written
  `requires-broke`/`reconciled-via` integration test.
- **Level-vs-edge predicate audit** (task 5): done via reading, not code -
  every remaining `waitFor` in `design-editor-tour.ts` already reads only
  from persisted `TourContext` state (recorded in the scoping decision
  section above). No further action expected here.

**In progress, left mid-edit when the session was cut**: a
`TourController.test.tsx` integration test exercising the `requires-broke`/
`reconciled-via` log events and the reconciled note end-to-end. Plan (not yet
written): drive to `picker-tour` (still waiting), click
`add-sql-database`+`connect-sql-database` (satisfies both `waitFor` and
`requires`, schedules the 600ms auto-advance), then immediately click the
already-added `remove-sql-database` button *before* advancing fake timers -
`requiresTracking` should flip to `broken`, the auto-advance effect's own
cleanup should cancel the pending `advance()` (dependency `interactionState`
drops back to `"waiting"`), and the reconciled note text plus a
`requires-broke` entry in `dumpTourLog()` should appear. Then re-click
add+connect to prove `reconciled-via` fires and the note clears. The
`TourOverlay.test.tsx` side of this (a direct `requiresBroken={true}` render
asserting the note text) also hasn't been added yet - `baseProps()` already
has `requiresBroken: false` wired in so existing tests don't need to change.

**Done, this session (tasks 1-2 from the list below the addendum)**:

1. **Pause-on-surface-loss (focus mode) with `pauseReason` - done.**
   `TourRunState`'s `paused` variant gained `pauseReason?: "user" |
   "surface-loss"` (`tour-state.ts`, with `parseTourState` dropping an
   unrecognised value rather than trusting it). `TourController` gained a
   `focusMode?: boolean` prop (default `false`, so existing callers/tests
   don't need to know it exists), wired from `ChapterWorkspace.tsx`'s
   existing `focusMode` local (it already had the value in scope for
   `idleSlot={focusMode ? null : tourSlot}`). `pause()` took an optional
   `reason` param, defaulting to `"user"`. The initial session-derivation
   block got the planned new branch: `status === "paused" &&
   pauseReason === "surface-loss" && !focusMode` resumes active with no
   pill, same as `running` - covers a reload landing after the surface is
   already back.
   - **One implementation deviation from the plan, forced by lint, not a
     design change**: the plan's "an effect on focusMode transitions"
     doesn't work as a single effect - `react-hooks/set-state-in-effect`
     flags calling this component's own `setSession` from inside a
     `useEffect` body, even indirectly through `pause()`/`resume()`. Landed
     as two separate flip-detectors instead, same "two effects, not one"
     shape `use-watchdog.ts` already documents for an analogous reason:
     a `useState`-based detector (`focusModeSeen`) adjusts `session` during
     render (the same pattern `entry`/`requiresTracking` already use), and
     a separate `useRef`-based detector in an actual effect persists the
     `paused`/`surface-loss` write to localStorage - guarded on
     `runState.status === "running"` rather than `active`, since by the
     time an effect runs after a render-time state adjustment, `active`
     already reflects the *new* value, not the value at the moment focus
     mode turned on. The resume write needed no new code at all: once the
     render-time block flips `session` back to active, the pre-existing
     checkpoint effect's own `active` dependency fires and persists
     `"running"`.
   - Tests: `tour-state.test.ts` round-trips both `pauseReason` values and
     drops a bogus one; `TourController.test.tsx` covers the full
     pause-on-focus-mode/resume-on-focus-mode-end round trip (asserting the
     persisted state and that the overlay disappears/reappears) plus the
     already-back-by-mount-time case.
2. **Modal hotkey scoping - done.** New canvas store boolean
   `tourModalActive` (`store.tsx`, alongside `setTourModalActive`, same
   shape as the existing `highlightedComponentId`/
   `setHighlightedComponentId` pair), set by `TourOverlay.tsx` from its own
   already-computed `isModal` local via a `useEffect` (cleared on unmount
   too, mirroring `TourController`'s `document.body.dataset.tourActive`
   effect). `use-canvas-shortcuts.ts` reads it and returns early right after
   the two Escape branches, before Shift+/ and bare-`/` - Escape itself
   stays unguarded on purpose, since the tour has its own Escape handler
   (`TourOverlay.tsx`, pauses the run) and letting `use-canvas-shortcuts`'s
   two Escape branches also run alongside it is pre-existing, unrelated
   behavior this doesn't touch. Closes the concrete bug named in
   `use-canvas-shortcuts.ts`'s own read last session: Ctrl+Z/Ctrl+D/
   Shift+L/`/` firing underneath a blocking step's backdrop if focus
   happened to still be on the canvas from before the tour opened.
   - **Test-infra fallout, not a design change**: `TourOverlay.tsx` now
     reads/writes the canvas store, so every one of `TourOverlay.test.tsx`'s
     ~40 standalone `render(<TourOverlay .../>)` calls needed a
     `CanvasStoreProvider` in the tree - added via RTL's `wrapper` render
     option (mechanically rewritten, not hand-edited one at a time; `rerender`
     calls needed the option stripped back off, since RTL's `rerender` reuses
     the wrapper from the initial `render` and errors if you pass it again).
   - **A second lint false-positive, worth recording so it isn't
     re-diagnosed from scratch next time it's hit**: the new
     `tourModalActive`-mirroring integration test (a `Capture` component
     reassigning an outer `let api` closure variable, the same pattern
     `use-canvas-shortcuts.test.tsx`'s own `withStoreApi()` already uses
     without issue) tripped `react-hooks/globals`' "cannot reassign
     variables declared outside the component" check purely because
     `TourOverlay.test.tsx` also has a **capitalized**, module-level
     `Wrapper` component (the one the `wrapper`-render-option rewrite
     above introduced). The rule appears to misattribute later components'
     closures once a PascalCase top-level component exists earlier in the
     same file - confirmed by bisection (isolated repro files) and fixed by
     renaming `Wrapper` to lowercase `wrapper` throughout the file (which
     also matches `use-canvas-shortcuts.test.tsx`'s own existing
     lowercase-`wrapper` convention, so this wasn't purely a workaround).
   - Tests: `use-canvas-shortcuts.test.tsx` gained three cases (hotkeys
     swallowed while `tourModalActive`, Escape still works through it,
     hotkeys resume once it clears). `TourOverlay.test.tsx` gained one
     asserting `tourModalActive` flips true on a blocking step, false on an
     interactive one, and false again on unmount.
   - Verified: `typecheck`, `lint`, and `src/tour` + `src/canvas` +
     `src/chapters` (77 files, 901 tests) all green. Not yet the full
     pipeline (`build` not run this pass).

**Done, next session (tasks 3-4 from the task list this session was
tracking)**:

1. **`storage`-event multi-tab adoption - done.** `tour-state.ts`'s
   `subscribe` set never registered for the native `storage` event at all -
   only same-tab writes ever notified it (each `setState` call manually
   `forEach`s the listener set after its own `localStorage.setItem`), so a
   write from another tab was silently invisible until this tab happened to
   re-render for an unrelated reason. Fixed with one module-level,
   `typeof window !== "undefined"`-guarded `window.addEventListener("storage",
   ...)` that forwards into the exact same `listeners` set same-tab writes
   already use - not a second, parallel notification path. Un-keyed by
   tourId deliberately, same reasoning `use-dismissed-flag.ts`'s existing
   shared-listener-set comment already gives for its own single set: the
   event carries no key this module would otherwise route by, and an
   unrelated tour's cross-tab write causing one extra (still-correct)
   snapshot re-check elsewhere isn't worth a per-tourId listener map.
   - **`TourController.tsx`'s mount-time `session` derivation generalized
     into a reconciler**, not left as the one-shot `if (session === null &&
     ...)` block the plan described. Extracted the exact same
     unseen/running/surface-loss-paused/else branching into a pure
     `deriveSession(runState, focusMode, clampIndex)` function, then replaced
     the `session === null` gate with a `lastSeenRunState` piece of state
     (adjust-during-render, same pattern `entry`/`requiresTracking`/
     `focusModeSeen` already use - not a ref, `react-hooks/refs` disallows a
     ref write during render) that re-runs `deriveSession` any time `runState`
     changes to an object reference this component hasn't already reacted to.
     Covers both the very first mount AND every later cross-tab adoption with
     one code path, not two.
   - **Verified safe for this tab's own writes, not just cross-tab ones**:
     every local mutation (`advance`, `pause`, `skip`, `resume`,
     `restartFromScratch`, the checkpoint effect) already keeps `session` and
     `runState` in agreement, so re-deriving `session` from `runState` after
     one of this tab's own writes reproduces the same value (idempotent, see
     `deriveSession`'s own doc comment) rather than fighting the write that
     just happened - confirmed by re-running the full pre-existing
     `TourController.test.tsx` suite unchanged, all of which still pass.
   - **`version: 1` added to `serializeTourState`'s output**, purely additive
     per the addendum's "a door for the next change" - `parseTourState`
     already ignores unknown keys, so this needed no migration and no reader
     changes anywhere.
   - Tests: `tour-state.test.ts` gained a `useTourState` describe block
     (`renderHook` + a real `StorageEvent` dispatch, mirroring
     `use-dismissed-flag.test.ts`'s existing hook-test shape) covering both
     adoption of another tab's write and ignoring an unrelated tour's key;
     plus `serializeTourState`/`parseTourState` round-trip coverage for the
     new `version` field and for a pre-`version` persisted value.
     `TourController.test.tsx` gained a "multi-tab adoption" describe block
     asserting a simulated cross-tab `completed` write closes this tab's
     active overlay for the replay pill, and that an unrelated tour's key
     changing is a no-op.
2. **Hard-gate-derived, order-free completion - done.** A memoized
   `allHardStepsTaught` in `TourController.tsx` evaluates every `hard`-tagged
   step's own `waitFor` against the live `ctx` (same try/catch-as-"not yet
   taught" safety as the per-step evaluation above - a throwing predicate
   reads as unmet, never crashes the check), reusing `waitFor` directly
   rather than introducing a second field - exactly the "`requires` is kept
   distinct, `waitFor` alone is enough for this" conclusion the "Slice-3
   design call" section above already reached. A second effect writes
   `runState = { status: "completed" }` the moment `allHardStepsTaught` is
   true, gated on `!active` (and on not already being `"completed"`, to
   avoid a redundant write once it lands) - so it can flip a `skipped` or
   `paused` run to `completed`, or leave a fresh `unseen`/`running` one
   alone, but never fires while a step is actively on screen.
   - Confirmed by construction, not just by test, that this can't rewrite an
     in-progress step: the effect's own first condition is `active`, and
     `active` is derived from `session`, which only the interactive-step
     gesture handlers and the reconciler above ever touch - the completion
     effect has no path to `active` itself.
   - Tests (`TourController.test.tsx`, new "hard-gate-derived, order-free
     completion" describe block): satisfying all five `hard` steps'
     conditions (`picker-tour`, `validate-click`, `fix-edge`,
     `revalidate-clean`, `submit-click`) while still sitting on `welcome`
     (step 0, genuinely out of script order) leaves `runState` at `running`
     until the run actually stops being active - Skip afterward lands on
     `completed` rather than the ordinary `skipped` a plain Skip test (above)
     already covers; Escape (pause) afterward lands on `completed` too; and a
     control case with none of the hard conditions met still leaves a Skip at
     the ordinary `skipped`.

**Verification**: full pipeline green - `typecheck`, `lint`, 1637 tests across
188 files (up from slice 2's 1615 - 8 new `src/tour` tests plus the
role-based-edges/`requires`/pause-on-surface-loss/modal-hotkey-scoping tests
from earlier in this same slice), `build`. Manual click-through not done this
pass (per this repo's working convention: full local pipeline is the
definition of done; an end-to-end pass happens only when explicitly asked
for).

**This closes the resilience addendum's four-slice plan through slice 3** -
`requires`, pause-on-surface-loss, modal hotkey scoping, multi-tab adoption,
and hard-gate-derived completion are all landed on `feature/tour-reconciler`.
Slice 4 (`feature/tour-beacon`, the anonymous-counter route) remains
explicitly deferred, per the addendum, until beta evidence demands rates the
existing local-signal channel (`tour-log.ts`'s ring buffer + Report-a-problem)
can't answer on its own. Not asked to push this branch; ask before doing so.

## Consolidated onto `bug-fix/guided-tour-fixes` (2026-08-09), for manual testing

`feature/tour-airbag`, `feature/tour-watchdog`, and `feature/tour-reconciler`
were a linear stack (each branched from the previous one's tip, confirmed via
`git merge-base --is-ancestor`), so this branch is that stack's tip plus the
slice-3 work that had been implemented and pipeline-verified but left
uncommitted in the working tree - nothing was actually merged, there was only
one line of history to consolidate. Cut for the user to check out and click
through end to end. Not pushed; ask before pushing.

### Summary of everything on this branch

The tour itself (built before this branch, not part of its diff): a
hand-rolled, 19-step spotlight tour (`src/tour/`) over the Design Editor -
welcome, canvas/node/header orientation, open the component picker, place +
connect SQL Database, question pane, hints, validate, fix a broken edge,
revalidate clean, Deep Check overview, submit, progress/debrief, wrap-up. 7
of the 19 steps are interactive (gesture-driven, not Next-click):
`select-a-node`, `open-picker`, `picker-tour`, `validate-click`, `fix-edge`,
`revalidate-clean`, `submit-click`. Auto-starts once on chapter 0.1, replayable
via a sidebar pill, with a "Start over" that resets the starter graph.

Three resilience slices layered on top (the addendum above):

- **Slice 1, `tour-airbag`**: predicates run in try/catch (a throw degrades
  to a plain Next instead of soft-locking); an unresolved target falls back
  to ambient rendering with a manual Next after a 2.5s grace period; a
  capped localStorage event log (`tour-log.ts`) plus
  `window.__scaleTour.dump()`; a static tour-doctor test that fails CI if a
  step points at a `data-tour` anchor that doesn't exist in the app. Plus
  three live-browser bugs fixed same-branch (a dropdown closing itself under
  the tour's own buttons, stale "two problems" copy, auto-advance eating the
  read time on validate/revalidate - `noAutoAdvance` exists because of this).
  SQL Database placement also moved earlier into the picker step, the
  dedicated undo-redo step was cut, and picker items can be highlighted
  without narrowing the palette.
- **Slice 2, `tour-watchdog`**: a visibility-aware watchdog
  (`use-watchdog.ts`) fires a quiet exit row after ~70s of unsatisfied
  foreground time on an interactive step, offering "Skip this step" (new,
  advances one step) alongside "Skip tour" (ends the run); steps tagged
  `hard` (picker-tour, validate-click, fix-edge, revalidate-clean,
  submit-click); a "Report a problem" link that opens a prefilled GitHub
  issue with the log buffer, reviewable before sending. Also fixed live: the
  popover not repositioning when a row's own content grew the card.
- **Slice 3, `tour-reconciler`**: role-based `TourContext.edges` (so
  `fix-edge` survives a delete-and-redraw, not just an in-place kind change);
  a new `requires` field, continuously re-checked while a step is active, so
  state drifting out from under an already-satisfied step surfaces a
  truthful reconciling note instead of going silently stale; pause-on-
  surface-loss for focus mode with a `pauseReason` distinguishing it from a
  deliberate Escape; modal steps now actually swallow app hotkeys via a new
  `tourModalActive` store flag; cross-tab adoption via the native `storage`
  event; hard-gate-derived, order-free completion (satisfying all five
  `hard` steps out of script order still registers the run as `completed`
  once it's not actively on screen).

### What's left after this branch

- Slice 4, `tour-beacon` (anonymous completion-rate counter route) -
  explicitly deferred, no branch cut, only build if beta evidence demands it.
- Two items flagged but not fixed, chapter-author's domain not engineering's:
  `content/chapters/index.ts`'s `problemStatement` and
  `specs/bb-0-1-welcome.spec.md` both still describe the old
  fix-component/fix-edge split that no longer exists.
- This branch's own manual click-through (checklist below) - has not been
  run yet as of this entry.

### Manual QA checklist

**Setup**
- [ ] Learning Path -> 0.1 -> Reader -> "Begin exercise" -> tour auto-starts
      on first visit
- [ ] Reload mid-tour -> resumes at the same step, no re-narration from
      step 1
- [ ] Second visit after finishing/skipping -> does not auto-start; replay
      pill visible in the sidebar footer
- [ ] Replay pill restarts cleanly at step 1
- [ ] "Start over" (two-step confirm) resets the starter graph, clears
      Validate/Submit outcomes, restarts at step 1, and does NOT un-pass an
      already-passed chapter

**Every step, both themes (light/dark)**
- [ ] Spotlight lands on the correct element for all 19 steps, no
      off-screen or clipped popovers
- [ ] Step counter, Back, Next, "Skip tour" all present and correct; Esc
      pauses (not skip) with a resume pill
- [ ] Popover repositions correctly if its own content grows (e.g. watchdog
      row or resolution-failed row appearing)

**The 7 interactive steps (must advance on the real gesture, not just Next)**
- [ ] `select-a-node` - clicking a node advances
- [ ] `open-picker` - `/` or right-click empty canvas opens the picker and
      advances
- [ ] `picker-tour` - placing AND connecting SQL Database advances (browsing
      alone should not)
- [ ] `validate-click` - clicking Validate advances only after a chance to
      read the dropdown (no auto-advance eating the read)
- [ ] `fix-edge` - fixing the Client -> App Server edge advances, including
      deleting the edge and drawing a fresh one (not just editing kind in
      place)
- [ ] `revalidate-clean` - re-running Validate clean advances, no
      auto-advance eating the read
- [ ] `submit-click` - Submit advances only once the board actually passes

**Resilience mechanisms (hardest to catch by code review alone)**
- [ ] Watchdog: sit idle ~70-75s on an interactive step -> exit row appears
      with "Skip this step" and "Report a problem"; "Skip this step"
      advances one step (not the whole tour)
- [ ] Report-a-problem link opens a prefilled, reviewable GitHub issue
      (nothing auto-sent)
- [ ] `requires` reconciliation: on `picker-tour` or `fix-edge`, satisfy the
      step then delete the thing that satisfied it while still on that step
      -> a truthful reconciling note appears, nothing auto-mutates the
      graph; redo it -> note clears
- [ ] Focus mode: enter focus mode mid-step -> tour pauses (not stuck
      spotlighting a vanished sidebar); leave focus mode -> resumes silently
      at the same step
- [ ] A deliberate Escape pause is NOT auto-resumed the same way (resume
      pill instead, unlike the silent focus-mode resume)
- [ ] Hotkeys (Ctrl+Z, `/`, Ctrl+D, Shift+L) do nothing on a modal
      (non-interactive) step; work normally again once that step ends
- [ ] Multi-tab: open the same chapter in two tabs, advance/skip in one ->
      the other tab reflects it (via `storage` event) without a manual
      refresh
- [ ] Hard-gate completion: skip the tour early after satisfying all 5
      `hard` steps out of order -> run registers as `completed`, not stuck
      at `skipped`
- [ ] Throwing/broken predicate and unresolvable target (if forceable) both
      degrade to a manual Next with an honest note, never a silent stall

**Cross-cutting**
- [ ] `prefers-reduced-motion` - spotlight/popover jump instead of animating
- [ ] Keyboard-only pass through at least the non-interactive steps
      (Tab/Enter/Esc)
- [ ] Everything above still holds after `npm run build` (production
      build), not just dev
