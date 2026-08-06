# Release 4.0.0 - Content Release - Shopping List

Status: **scoping, not started**. Compiled 2026-08-04 from `pending-guided-tour.md` and
`pending-content.md`, cross-checked against `MILESTONES.md`, `NEXT_STEPS.md` (Step 5 is
where the 3.2.0/3.3.0/3.4.0 detour interrupted us - real Building Blocks content,
unblocked since Step 4.5 landed), and the current code via graphify. No branch cut yet,
nothing pushed. This doc is the working release plan; update it in place as tracks land,
same convention `NEXT_STEPS.md` uses.

**Scope note, 2026-08-04:** the simulation engine (`pending-simulation-engine.md`) is
**out of scope for 4.0.0** - user call: it's big enough to earn its own independent
release rather than ride along with the tour/content work. See "Deferred" at the bottom
for what was explored and where that thinking left off.

**Housekeeping resolved 2026-08-04:** release 3.4.0 is live - confirmed on `origin/main`
(`ee43d02`, PR #83 merging `develop`, which includes the `v3.4.0-test-updates` release
merge `dd9463d`). Local `main` fast-forwarded to match exactly. Local `develop` is still
~20 commits behind `origin/develop` as of this writing - sync it before cutting
`release/v4.0.0-guided-tour-and-curriculum` from it.

**Branch plan (not yet executed):** `release/v4.0.0-guided-tour-and-curriculum`, cut from
`develop` once synced. Individual `feature/*`/`docs/*` branches per unit of work underneath
it, per `CLAUDE.md`'s branching convention. Claude pushes, never merges.

---

## Track A - Guided Tour + Chapter 0.1 infrastructure

Fully spec'd in `pending-guided-tour.md`, code-only (real lesson prose is Track B's job).
Written for Sonnet; this is mine to build first.

- `src/tour/` module: `types.ts` (`TourStep` shape), `design-editor-tour.ts` (the 11-step
  script), `TourOverlay.tsx` (four-rectangle spotlight technique, portal to
  `document.body`, popover card, reduced-motion path), `TourController.tsx`
  (auto-start gated on `useDismissedFlag` + `hasLoadedInitialState`, replay pill).
- `data-tour` anchor attributes: `AppHeader.tsx` (undo-redo, validate, header-tools),
  `ChapterSidebar.tsx` (question-pane), `ChapterWorkspace.tsx` (canvas),
  `ComponentPicker.tsx` (component-picker).
- `ChapterDefinition.editorTourId?: "design-editor"` field + `TourController` mount in
  `ChapterWorkspaceContent`, gated on the open chapter declaring it.
- **Validate/Submit split - finalized 2026-08-04, scoped down from the earlier
  LeetCode/simulation framing now that Track C is deferred:**
  - **Validate** (existing button): graph validation only - the chapter's structural
    checks (orphans, category-adjacency, edge-kind/relations contracts) plus its
    curated `validationRuleIds`. No blueprint/completion check. Quick, repeatable,
    exactly what a learner clicks while still building.
  - **Submit** (new button, top bar, Building Blocks *and* RWE): graph validation
    (same as Validate) *plus* blueprint matching - confirms the graph actually
    satisfies one of the chapter's `blueprints`, i.e. today's `evaluateChapter()`
    behavior essentially unchanged, just moved behind its own button and framed as
    the completion gate rather than something Validate does implicitly. **Not
    redundant with Validate** precisely because it checks a different thing
    (blueprint conformance vs. bare structural correctness) - a graph can be
    validation-clean and still not match any blueprint.
  - **Two-stage, short-circuiting - resolved 2026-08-04, user question:** Submit
    runs the structural check first (identical to Validate); if that fails, Submit
    stops there and surfaces those violations - it never attempts the blueprint/
    variance comparison against a structurally broken graph. Only a structurally
    clean graph proceeds to the drift-report stage below. Mirrors the original
    compile-then-test-cases framing: a graph that doesn't "compile" gets no partial
    variance score. This means Submit's result is one of two distinct shapes, never
    blended: "fix these structural errors" or "here's your variance report" -
    never a drift percentage computed against a graph with an orphan node or a
    broken connection still in it.
  - **Submit's real output is a drift/variance report, not just pass/fail** -
    revised 2026-08-04, user call: on submit, show *how far* the design is from the
    nearest/target blueprint, not only whether it matched - missing required
    components, extra components the blueprint didn't call for, present-but-
    mismatched connections (wrong source/target or wrong edge kind), framed as
    specific, explanation-carrying deltas rather than a bare yes/no. This is
    "matched" continuing to gate completion, with the report as the teaching
    surface underneath it - same explanation-first posture as validation.
  - **Open engineering question, check before implementing:** does the current
    pattern matcher (`graph-index.ts` + blueprint containment in `evaluateChapter`)
    already expose *why* a match failed (which required node/edge was missing or
    mismatched), or only a boolean containment result? If only boolean today, the
    drift report needs the matcher to surface its near-miss/partial-match state,
    not just add UI on top of an existing yes/no - that's the real scope of this
    bullet, not a rendering task.
  - **Before implementing, verify current wiring**: check whether `ChapterWorkspace`'s
    existing Validate button already calls `evaluateChapter` (rules + blueprint,
    per Track 2/PR #47) or only the rule engine's `runValidation` (rules only). If
    it's already the former, Validate needs to be *scoped down* to rules-only as part
    of this split, not just have Submit added alongside it unchanged.
  - Submit gates chapter-complete/progression (Dexie `chapterProgress`, per Track 2);
    Validate does not.
  - Simulation-engine integration (the original reason Submit was proposed) is
    deferred with Track C - Submit ships in 4.0.0 as blueprint-completion-only, with
    room to grow into the simulation gate later without a rename or a second button.
- Chapter 0.1 (`bb-0-1-welcome`) wired end-to-end: manifest entry flipped from
  `chapterDefinitionId: null`, starter graph (Client -> App Server -> SQL Database),
  one containing blueprint, one hint (points at the replay pill), placeholder lesson
  markdown (`placeholder: true`, draft-quality, flagged in an HTML comment for Track B
  to rewrite).
- `--z-tour: 55` token in `globals.css` (between modal 50 and tooltip 60) + one short
  "Guided tour" note in `DESIGN.md`'s z-index table.
- Tests (Vitest/jsdom): step-id/target-resolution/predicate coverage for the tour script,
  overlay behavior (Next/Skip/Esc, click-blocking on non-interactive steps), controller
  auto-start/replay logic, `evaluateChapter` passing on 0.1's authored starter graph, and
  the Validate/Submit split (Validate ignores blueprint state, Submit requires it).
- Definition of done: full local pipeline green, manual click-through in both themes
  (Learning Path -> 0.1 -> Reader -> Begin exercise -> tour auto-runs, all 4 interactive
  steps advance on the real gesture, skip/replay work, second visit doesn't auto-start,
  Validate vs Submit behave as specified above), `graphify update .`, ask before any push.

## Track B - Wave 1 curriculum content

Spec'd in `pending-content.md`, an authoring pass (not an engineering pass) - written for
an Opus lead-author role, likely a separate delegated pass rather than this session's
direct work.

Five chapters, each producing all 6 deliverables per `pending-content.md` §"Per-chapter
deliverables" (spec, lesson markdown, `ChapterDefinition`, validation rules, quiz,
playtest-sequencing check), in curriculum order:

1. **0.1 Welcome to ScaleCraft** - real prose replacing Track A's placeholder.
2. **0.2 What is System Design?** - small, no canvas, fast Reader+quiz win.
3. **1.6 Drawing the First Architecture** - first build + first fix, introduces the 3
   primitive components.
4. **3.4 Load Balancer** - the wave's flagship Building Blocks chapter, replaces
   `bb-dummy-1`.
5. **RWE Tier 1: Bitly** - Phase A (guided) + Phase B (open) + debrief + retrospective
   quiz, replaces `rwe-dummy-1`. Proves the full RWE template once.

**Gates checked, not assumed:**
- Quiz UI: appears already built (`QuizLauncher.tsx`, `ExamShell`, `QUIZ_FRAMEWORK.md`
  present in code; no outstanding `pending-quiz-ui.md` left in `.claude/docs/`) - verify
  by exercising it, don't take absence-of-a-pending-doc as final proof.
  **Resolved 2026-08-05:** wiring confirmed - `ChapterReader.tsx:131` renders
  `QuizLauncher` straight off `chapter.quiz`, and `appendKnowledgeCheckHeading` adds
  the TOC entry. Authoring the array is sufficient; no engineering work needed.
  Still wants one real click-through of `ExamShell` now that 0.1 has a live quiz.
- Stages UI: not required for this wave - none of the five Wave 1 chapters are staged
  Part-1 Process chapters.
- ~~**Not yet checked:** `pending-content.md`'s claim that "manifest migration to v2
  structure precedes Wave 1"~~ - **resolved 2026-08-05, no work needed.** The claim is
  stale: `src/curriculum/manifest.ts` is already the v3 map (79 entries, migrated per
  §21.4, see its header comment). Every Wave 1 slug exists today
  (`0-1-welcome-to-scalecraft`, `0-2-what-is-system-design`,
  `1-6-drawing-the-first-architecture`, `3-4-load-balancer` -> `bb-dummy-1`,
  `rwe-t1-bitly-url-shortener` -> `rwe-dummy-1`). Authoring 3.4 and Bitly means
  repointing those two rows off the dummies, which §21.4 explicitly permits (dummies
  "carry no migration weight"). Nothing blocks Track B.

### Track B progress

**Per-chapter detail lives in `.claude/docs/pending-chapters.md`** - the completion
ledger (what is authored, on which branch, judgment calls, gates already verified).
Append there when a chapter lands; this section stays release-level only.

**Wave 1: 2 of 5 authored.**

1. **0.1 Welcome to ScaleCraft - done 2026-08-05**, commit `250b5eb`, branch
   `feature/content-0-1-welcome` (stacked on `feature/guided-tour-track-a`, since
   0.1's content builds on Track A's chapter definition). All 6 deliverables in,
   pipeline green. New `src/content/chapters/authoring-invariants.test.ts` enforces
   the authoring contract registry-wide, so a later chapter that breaks it fails CI
   rather than shipping.
2. **0.2 What is System Design? - authored 2026-08-06, not yet committed**,
   branch `feature/content-0-1-welcome`. All 6 deliverables in, pipeline green.
   **One-chapter process experiment (user-directed):** authored directly by
   Sonnet rather than delegated to Opus, pending an Opus proofread/correction
   pass the user will review before deciding whether to make this the standing
   process. User review of Sonnet's draft caught two real gaps before that
   Opus pass even ran - the forces were named but never explained, and
   `DesignEditorCTA` showing "Begin exercise" for a canvas-less chapter turned
   out to also break completion tracking (no reachable Submit to write the
   `chapterProgress` row `deriveStatus` required). Both fixed in-session; new
   `ChapterDefinition.hasEditorExercise?: boolean` field now covers every
   future canvas-less Concept chapter. Full detail in the ledger entry.
3-5. Not started.

**Open decisions raised while authoring** (full detail in the ledger): CURRICULUM
§14's 0.1 row contradicts the chapter as built; §16's component budget needed a
declared exception at 0.1; and **the Reader has no renderer for ScaleCraft graph
JSON**, which §7.2 assumes for topology diagrams - `MarkdownRenderer.tsx` handles
Mermaid and nothing else. That last one **blocks 1.6 and 3.4** (topology chapters)
while leaving Part 0 unaffected, and needs a decision before Wave 1 chapter 3: build
a markdown graph block, or amend §7.2. None were authored around, per
`pending-content.md`'s working process.

---

## Net new surfaces this release touches

`src/tour/` (new), `AppHeader.tsx` (Submit button), `src/content/chapters/` (5 real
chapters + 0.1's placeholder), `src/curriculum/manifest.ts`, `DESIGN.md`.

## Sequencing note

User-confirmed starting point (2026-08-04): **Track A first.** Track B is scoped here so
nothing is rework, not because it's next in strict sequence - re-check this section
before assuming order once Track A is underway.

---

## Deferred - Simulation Engine (its own future release, not 4.0.0)

Currently a brainstorm (`pending-simulation-engine.md`), not a spec, and explicitly
pulled out of this release's scope on 2026-08-04. Exploratory thinking from this
release's scoping conversation, kept here so it isn't lost, all open/unlocked:

- Fully deterministic, no AI in the loop (hosting/metering cost was the explicit
  reason) - hand-authored explanation strings per scenario-outcome, same pattern as
  `ValidationRule.explanation` today.
- Data-driven scenario templates, not hand-coded per chapter - avoids repeating the
  rule-authoring scaling mistake Track 2 already paid down once.
- A LeetCode Run/Submit framing was explored: Validate/Run stays cheap, Submit was
  going to gate into the scenario audit. **That coupling is dropped for now** - 4.0.0's
  Submit is blueprint-completion only, per Track A above. Whenever the simulation
  engine's own release starts, Submit is the natural place to extend, not a new button.
- Mode asymmetry floated: Building Blocks gets simple graph-validity + a few
  chapter-scoped scenarios; RWE is where scenario depth matters (traffic patterns,
  component/network failure, data loss, slow components, etc.), matching
  `ChapterDefinition.mode`'s existing looser-validation intent for RWE.
- Threshold-gated percentage completion (toggleable per chapter) is consistent with
  `CLAUDE.md`'s existing quiz-exam exception (real score, pass/fail line, no
  celebration) - not a "not a game" violation.
- Whatever engine results from this should live under `src/engines/` (the existing
  `Engine<TInput,TConfig,TResult>` + lazy-registry boundary), not a standalone package.
- Next step whenever this release starts: a real design doc, same weight
  `validation_agent_design.md` had for Track 2/3, before any code.

---

# To-do tour fixes

Findings from a real-browser walkthrough of the Chapter 0.1 guided tour
(`src/tour/`) on 2026-08-05, driven through Chromium at 768x1024 through
2560x1440. Ordered by severity. Every item was reproduced live unless
explicitly marked "inferred".

**Status 2026-08-05: all 26 items addressed in code** - see "Resolution log"
at the bottom for what was done per item, and for the three that still need a
real-browser re-walkthrough to confirm (they were never reproducible in
jsdom). The findings below are kept verbatim as the record of what was wrong.

**Why the test suite is green anyway (read this first):** all 1497 Vitest tests
pass while every issue below is present. jsdom has no layout engine
(`getBoundingClientRect` returns zeros, so no popover can ever measure as
off-screen), no real hit-testing (a covered element still receives a synthetic
click), and no stacking contexts (z-index conflicts are invisible). The entire
class of bug below is undetectable by the current tests by construction. A fix
pass needs real-browser coverage, not more jsdom assertions.

## Blockers - the tour cannot be finished, or actively defeats its own lesson

1. **The tour dead-ends permanently at step 12/23 ("fix it: add the missing
   component"). 12 of the 23 steps are unreachable in a real session.**
   `TourController.tsx:147-148` force-closes the component picker on every step
   whose id is not `open-picker`/`picker-tour`. `fix-component` is not in that
   set, so the moment the user opens the picker it is slammed shut in the same
   tick. Verified: the picker cannot be opened by `/`, by canvas-click-then-`/`,
   or by right-click while that step is active. Its predicate
   (`presentComponentIds.includes("sql-database")`) can therefore never be
   satisfied, the step has no Next button, and the only escape is Skip. This is
   the "component picker not available after the validate flow" report, and it
   makes `fix-edge`, `revalidate-clean`, `deep-check-overview`, `submit-intro`,
   `submit-click`, `progress-complete`, `debrief`, `right-click-config`,
   `decorations`, `canvas-navigation` and `wrap-up` dead code in practice.

2. **The tour hides the validation explanation it just told the user to go
   read - a direct violation of CLAUDE.md's non-negotiable "the explanation is
   always shown on failure, unconditionally".** The `validate-click` step says
   "Click Validate now to see exactly what and why". The violations dropdown
   renders at `--z-dropdown` (30); the tour overlay is `--z-tour` (55). Verified
   with `elementFromPoint`: the dimming backdrop is the topmost element over the
   dropdown (`coveredByTour: true`). Worse, the tour's own popover card
   physically overlaps the dropdown's right edge and truncates the explanation
   text mid-sentence (screenshot confirmed: "This connection isn't valid between
   these tw..."). The single most important teaching moment in the chapter is
   simultaneously dimmed and covered.

3. **The sidebar and the header disagree about how many issues there are.**
   On the same Validate run the header dropdown reads "2 ISSUES" while
   QuestionPane reads "Last validated: 1 issue". Cause: `QuestionPane.tsx` bases
   its count on `outcome.violations` (raw rule violations only), while the header
   uses the merged display list from `chapterDisplayViolations` (rule violations
   plus synthesised missing/disconnected-required-component entries). The
   synthetic entries are exactly what this chapter's broken starter graph
   produces, so the sidebar systematically undercounts. Regression from the
   Validate/Submit split, not tour-specific - it will misreport on any chapter.

## Positioning - the explainer renders outside the viewport

4. **Every canvas-targeted step renders the popover off-screen at x = -16, at
   every viewport size tested.** 8 steps target `canvas`; 7 are affected
   (`undo-redo` escapes only because its `popoverAnchor` repositions it).
   Verified directly on `canvas-intro`, `select-a-node`, `open-picker` and
   `fix-component`; `fix-edge`, `right-click-config` and `canvas-navigation`
   share an identical target + placement so they inherit it (inferred).
   Root cause: the canvas spotlight hole is ~95% of viewport height and 78-87%
   of width (e.g. 1116x842 inside 1440x900), so **no side has room** for a
   320x~190 card. `computePopoverPosition` (`TourOverlay.tsx:129`) falls back to
   `reduce(...)` "whichever side has the most space", picks `left`, and
   `positionForSide` deliberately does not clamp the primary axis (an
   intentional "never cover the target" choice), landing at
   `hole.left - width - gap` = -16.
   Measured off-screen with identical x = -16 at 1280x720, 1366x768, 1440x900,
   1680x1050, 1920x1080 and 2560x1440. A design flaw in the fallback, not a
   small-screen edge case.

5. **Resizing mid-tour does not recover.** 1440x900 -> 1024x640 with the tour
   open leaves the popover at exactly x = -16, y = 50: still off-screen.

6. **The tour does not render at all below ~1024px wide.** At 900x700 and
   768x1024 no tour card appears (the dialog is absent, not merely
   mispositioned). Root cause not determined - it may be an intentional
   small-screen gate elsewhere in the app, or the auto-start guard never firing.
   Either way the behaviour is silent and undocumented.

## Layering - other surfaces render underneath the tour

7. **Right-click context menus render below the tour overlay.** `ContextMenu` is
   `--z-dropdown` (30) with its own `fixed inset-0` catcher at (20), against the
   tour's (55). Verified: right-clicking the canvas during a tour step does
   create a menu in the DOM, but it paints beneath the tour's backdrop. This
   breaks the `right-click-config` step (step 20), which explicitly instructs
   the user to right-click a component to configure it.

8. **Same class of problem for every other `--z-dropdown` surface** used by a
   step: the Edge Inspector needed by `fix-edge`, and any menu opened during the
   tour. Only the Edge Inspector happens to escape, because it is positioned
   inside the canvas element and so falls within the spotlight hole (inferred -
   `fix-edge` is unreachable behind blocker #1 and could not be exercised).

## Lifecycle - leaving and coming back corrupts the run

9. **Tour position is not persisted, but canvas edits are.** Reloading mid-tour
   restarts the script at 1/23 while the canvas keeps every prior edit (Dexie
   autosave). Verified: reloaded on `header-tools`, returned on `welcome` with
   both nodes and prior changes intact. The tour and the board now tell two
   different stories.

10. **Consequence of #9: the teaching steps silently self-skip on a restart.**
    With an already-fixed graph, `fix-component` and `fix-edge` find their
    predicates already true and auto-advance after the 2s dwell with no user
    action - the exact moments the chapter exists to teach vanish without
    explanation. Meanwhile `validate-click` still demands a fresh click, because
    `lastValidationErrorCount` resets to `null` on mount. Same restart, two
    different behaviours.

11. **Escape permanently dismisses the tour.** One keypress writes
    `sc-tour-dismissed-design-editor = 1`, no confirmation, no undo. Verified.
    Escape conventionally means "close this", not "never show me this again" -
    and users press it reflexively at the popover, not the feature.

12. **There is no temporary exit.** Skip, Escape and finishing all write the
    same permanent flag. No "remind me later", no pause, no resume.

13. **Replay always restarts from step 1, and is fragile.** The pill cannot
    resume mid-tour, and the dismiss flag stays set *during* a replay, so a
    reload mid-replay silently kills it with no state explaining why.

14. **Submit completion does not survive a reload.** `hasSubmittedPassing` is
    in-memory only. After a reload the sidebar correctly shows "Chapter
    complete" (Dexie `chapterProgress`) while the tour's `submit-click` step
    would still demand another Submit - the tour contradicts the UI beside it.

## Accessibility - the overlay claims to be a modal but behaves as none

15. **Focus is never moved into the dialog and is never trapped.** Verified:
    `document.activeElement` is still `BODY` when the tour opens; one Tab lands
    on the header's "ScaleCraft" link, six Tabs reach the "Save" button - all
    outside the dialog, in UI the tour is supposedly blocking. `aria-modal="true"`
    is asserted on an element that implements none of the contract. A keyboard
    user can silently drive the app the overlay is dimming.

16. **Step changes are never announced.** No `aria-live` region anywhere in
    `TourOverlay.tsx` (grep: 0 matches for `aria-live`/`autoFocus`/`.focus()`/
    `tabIndex`). A screen-reader user gets no notification that the content
    changed, and the interactive steps' "Try it to continue" state is invisible
    to them.

## Interaction

17. **The tour traps the user.** "Back to lesson" is not clickable while the
    tour is active (verified), and the app behind the backdrop is inert. With
    #11/#12 the only two exits are both permanent.

18. **No Back/Previous control anywhere across 23 steps.** Misread a step, or
    get auto-advanced past one, and it is gone for the run.

19. **Forced 2s dwell on all 8 interactive steps, even when the user acts
    instantly.** `MIN_DWELL_MS = 2000` (`TourController.tsx:19`) was added to
    stop pre-satisfied steps flashing past, but it now also punishes the
    attentive user with up to ~16s of cumulative dead waiting on a
    "Nice - continuing…" label.

## Spotlight quality and content

20. **The spotlight frequently highlights nothing useful.** 8 steps ring the
    entire canvas; 4 more (`question-pane`, `hints`, `progress-complete`,
    `debrief`) ring the entire sidebar. The user sees the identical full-panel
    outline four times running with only the card text changing. That is not a
    highlight, it carries no information.

21. **The hints step points at prose, not at the control.** It says the hint is
    "further down this panel" while ringing the whole sidebar; the actual
    "Show hint" button sits at y~629 *inside* that ring, never distinguished.

22. **`undo-redo` draws two rings at once** - the interactive canvas hole plus
    the decorative `popoverAnchor` ring on the header buttons - with nothing
    indicating which is actionable. The step asks for a canvas drag while
    visually emphasising the header.

23. **The Deep Check step explains something the user cannot try.** With no AI
    provider configured it is a dead-end paragraph mid-tour, and the tour itself
    says it will not set one up.

24. **23 steps is very long for a first-run orientation, with no expectation
    set.** The counter reads "1 / 23" on the welcome card, no estimate, no way
    to skim. The last four steps are a "one more thing" tail that belongs in
    help/docs rather than a blocking overlay.

## Consistency with the rest of the chapter

25. **The lesson markdown now contradicts the chapter it introduces.**
    `public/content/chapters/bb-0-1-welcome.md` still says "Most chapters ask
    you to design something. This one doesn't" and calls it "a quick tour",
    written before the starter graph was deliberately broken. The chapter now
    *does* ask the learner to diagnose and fix two real faults across 23 steps.
    `problemStatement` and `curriculumContext` in `content/chapters/index.ts`
    were updated for the new premise; the lesson body was not.

26. **The tour runs on a chapter still flagged `placeholder: true`,** so the
    Reader and QuestionPane show a "Draft" badge throughout the onboarding
    experience that is meant to be a new user's very first impression.

## Resolution log - 2026-08-05

Worked in the order the sequencing note below recommended. Local pipeline
green (typecheck, lint, 1532 tests, build). Not pushed, no branch cut.

**Blockers**
- **#1** `TourStep.allowsComponentPicker` replaces the hardcoded two-id set;
  set on `open-picker`, `picker-tour`, `fix-component`, `more-to-explore`.
  Guarded by a test that fails if any step whose copy mentions the picker (or
  which narrows it) forgets the flag.
- **#2** New `TourStep.spotlightAlso`; the backdrop now frames the *union* of
  the target and any extra anchors, so `validate` + `validation-details`
  (new `data-tour` on the dropdown in `ValidationIndicator.tsx`) are lit and
  clickable as one hole, and the popover positions against that union rather
  than overlapping the explanation.
- **#3** `QuestionPane` no longer counts `outcome.violations`; it takes the
  same merged display list the header renders, passed down from
  `ChapterWorkspace` (drift excluded - that line is Validate-scoped, and
  Submit drift keeps its own "see Submit for details" branch).

**Positioning**
- **#4/#5** A target covering >45% of the viewport is now rendered *ambiently*
  - no dimming, no ring, nothing blocked, card docked bottom-right - instead
  of being spotlighted with an unplaceable popover. `computePopoverPosition`
  is exported and clamps both axes as a last resort. Covered by real-geometry
  unit tests at 1024x640 through 2560x1440, including the mid-tour resize.
- **#6** Root cause is still unproven, but the most likely explanation is a
  dismiss flag left set from earlier testing rather than a width gate (there
  is no small-screen gate anywhere in the app). The state rework in #9-#13
  makes that state visible and recoverable, and the clamping above fixes the
  mispositioning at those widths regardless. **Still needs a browser re-check
  at 900x700 and 768x1024.**

**Layering**
- **#7/#8** `TourController` sets `data-tour-active` on `<body>`;
  `globals.css` lifts `--z-dropdown-backdrop`/`--z-dropdown` to 56/57 for the
  duration. Ambient rendering of canvas steps also means the context menu and
  Edge Inspector are no longer competing with a backdrop at all. **The z-order
  itself is not assertable in jsdom - needs a browser re-check.**

**Lifecycle**
- **#9/#10/#12/#13** Run state moved to `src/tour/tour-state.ts`: a persisted
  `unseen | running | paused | skipped | completed` plus `stepIndex`, replacing
  the single dismiss boolean. A reload resumes where the learner was.
- **#11** Escape now pauses (resumable) instead of permanently dismissing;
  the pill reads "Resume tour (n/21)".
- **#14** `hasSubmittedPassing` now ORs in the persisted `chapterPassed`, so
  a reloaded, already-complete chapter doesn't demand another Submit.

**Accessibility**
- **#15** Focus moves into the card on every step change, and Tab is trapped -
  but only on steps that are genuinely blocking (dimmed *and* non-interactive).
  `aria-modal` now reports that honestly rather than claiming true always;
  trapping an interactive step would lock a keyboard user out of the gesture
  the step is asking for.
- **#16** `role="status"` on the gesture line announces the waiting/satisfied
  transition; focus movement announces the step change.

**Interaction**
- **#17** Ambient steps leave the app fully usable; Escape gives a
  non-destructive exit.
- **#18** Back control on every step after the first. Going back to an
  already-satisfied gesture step shows Next rather than bouncing forward.
- **#19** `MIN_DWELL_MS` (2s x 8 steps) is gone. A gesture already satisfied
  when the step opens shows a Next button; only a gesture performed *during*
  the step auto-advances, after a 600ms acknowledgement beat.

**Spotlight quality and content**
- **#20/#21/#22** Canvas/sidebar-wide rings are gone (ambient rendering);
  `hints`, `progress-complete` and `debrief` now target new `data-tour`
  anchors on the actual controls in `QuestionPane.tsx`. `undo-redo` draws one
  ring, on the header buttons it's describing.
- **#23** Deep Check step reworded as a "here's what this is, for later"
  pointer rather than a dead-end instruction.
- **#24** The three "one more thing" tail steps merged into one; welcome card
  now states the length ("21 steps, about five minutes") and that Esc pauses.
  23 steps -> 21.
- **#25** `public/content/chapters/bb-0-1-welcome.md` rewritten to match the
  chapter as built (diagnose and fix two faults), plus `problemStatement`,
  `learningObjectives` and the blueprint commentary in
  `content/chapters/index.ts`.
- **#26** `placeholder: true` dropped from `bb-0-1-welcome`, so no "Draft"
  badge on a new user's first impression. Track B still owns final prose
  polish (noted in the file).

### Follow-up from the second walkthrough - 2026-08-05

Two live findings after the fixes above, both the same root cause: the card
landing on the surface the learner has to click.

- **Step 7 (`picker-tour`) parked in the middle and blocked placement.**
  `ComponentPicker`'s `insert` doesn't drop the component - it arms
  click-to-place and closes the picker. That removed the step's own target,
  and an unresolved anchor fell back to *centering*, putting a
  `pointer-events-auto` card dead centre over the canvas the learner then had
  to click. `computePopoverPosition` now takes a `fallback` of "center" or
  "dock": centering belongs only to a step that declared no target at all
  (welcome/wrap-up, over a full backdrop). Any step that declared an anchor
  docks instead. Copy on `picker-tour`/`fix-component` now describes the real
  two-stage gesture.
- **Step 13 (`fix-edge`) covered the edge-kind select.** `EdgeInspector`
  renders at `absolute bottom-4 right-4` - exactly where an unanchored
  ambient card docks. Added `data-tour="edge-inspector"` and anchored the
  step to it with `placement: "top"`, so the card sits clear of the panel and
  rings it instead.

**Remaining verification** - #6, #7/#8, and the general "does it feel right"
pass all need the same real-browser walkthrough the findings came from; jsdom
still cannot see layout, hit-testing, or stacking contexts. Test coverage was
added where it *is* provable: `computePopoverPosition` against real geometry,
union-hole rect math, picker gating, resume/pause state, and focus trapping.

## Suggested sequencing when this gets picked up

Fix #1 first: it is a two-line condition and unblocks 12 steps that have never
been exercised end to end. #2/#3 next - #2 is a product-principle violation and
#3 is a live miscount on every chapter, not just this one. Then #4/#5/#6, where
the positioning fallback needs a real decision rather than more fallback math
(most likely: never spotlight a target larger than ~60% of the viewport, render
those as a centered card with no hole). #7/#8 are one z-index audit. #9-#14 are
a single coherent piece of work on persisting tour state alongside board state.
#15/#16 are the accessibility gap. #20-#26 are a content and authoring pass and
should wait until the mechanics are stable.
