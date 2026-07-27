# Pending: Track 2 — Validation Pattern Engine (`feature/validation-pattern-engine`)

**Full spec:** `.claude/docs/validation_agent_design.md` §8 (blueprints/mastery) and
§9 (implementation spec). This file is the phase-by-phase execution plan against
that spec — not a parallel design doc. If the two ever disagree, §8/§9 win; fix
this file, not the other way around.

**Why this branch, why now:** per `.claude/docs/NEXT_STEPS.md` Step 4.5, this
blocks Step 5 (real Building Blocks chapters) — there is currently no working
chapter pass/fail gate (`hasErrors()` is dead code, `requiredComponentIds` checks
presence only, `solutionGraph` is unused). Cut from
`release/2.0.0-validation-engine-overhaul`, per `CLAUDE.md`'s branching rules.

**Ground rule for every phase below:** the 10 existing rule files
(`src/validation-engine/rules/*.ts`, excluding this doc's new additions) must
change **zero lines**. Each phase's "done when" includes re-running their
existing test files unmodified and green — that's the concrete proof the
"additive, not a rewrite" claim in §9 actually holds, not just an assertion.

**Testing split, throughout:** I run and report every automated check
(`typecheck`, `lint`, `test`, `build`) before claiming a phase done — that's
non-negotiable per `CLAUDE.md`'s pre-push CI section regardless. Real
browser interaction is capped to the minimum needed to catch a genuinely
visual bug (layout, theme, dropdown collision) — not a substitute for you
driving it. Every phase that touches anything clickable ends with an exact,
numbered **"You verify"** script: what to click, what you should see, what
would mean something's wrong. Run those yourself and tell me what you saw
before I call that phase closed.

---

## Phase 1 — Graph index (`src/validation-engine/graph-index.ts`, new) — DONE (2026-07-27)

**Status:** implemented on this branch, commit follows this doc update.
`reachable()` memoizes by reference (stronger than the "value equality"
fallback this doc allowed for — same Set instance returned on a repeat call
with the same `from`/`kinds`), so no confirmation round-trip was needed.
`typecheck`, `lint`, `test` (720/720, including all 10 existing rules'
suites unmodified), and `build` all ran clean; `git diff
release/2.0.0-validation-engine-overhaul...HEAD -- src/validation-engine/rules/`
is empty, confirming zero changes to the existing rule files.

**Scope:** `GraphIndex` type + `buildGraphIndex()`, per §9.1 — `nodeById`,
`defById` (reuse `component-lookup.ts`, don't re-derive), `outEdges`/`inEdges`
maps, `entryPoints` set, and a memoized, **iterative** (never recursive)
`reachable(from, kinds?)` BFS. Nothing calls this yet — purely additive, no
existing file changes.

**Why first:** every later phase (matcher, engine, chapter-outcome) takes a
`GraphIndex` as input. Getting `reachable()` right in isolation, before the
pattern matcher exists to obscure a bug in it, is the cheapest place to catch
an off-by-one or a missed cycle-guard.

**Not in scope yet:** wiring the index into any existing rule
(`single-instance-load-balancer.ts` etc. keep their own `graph.nodes.find()`
loops for now — §9.1 flags this as a "when convenient" cleanup, not required
here).

**Automated tests (mine), `graph-index.test.ts`:**
1. `outEdges`/`inEdges` correctness on a 5-node graph with mixed edge kinds.
2. `reachable()` direct neighbor, multi-hop, and unreachable-node cases.
3. `reachable(from, ["request-flow"])` — kind-filtered traversal excludes a
   path that only exists via a `control`/`async`/`replication` edge.
4. `reachable()` on a graph containing a cycle terminates and returns the
   correct reachable set (proves iterative BFS, not just "doesn't throw" —
   assert a specific expected Set, not just that it completed).
5. Calling `reachable()` twice with the same `from`/`kinds` returns
   memoized-equal results (value equality; implementation may or may not
   reuse the same Set instance — test the content, not identity, unless the
   spec's "memoized" is read as instance-identity, in which case say so and
   I'll confirm which before writing the test).
6. `entryPoints` populated from `graph.entryPointIds` unchanged.
7. A ~150-node synthetic graph (near `TRD.md`'s "low hundreds" bar) —
   `buildGraphIndex` + a handful of `reachable()` calls complete well under a
   loose ms budget (a sanity bound, not a strict perf test).

**Done when:** all of the above green, `npm run typecheck && npm run lint`
clean, and the existing 10 rules' test files still pass unmodified (nothing
touches them yet, so this is really "still true," but confirmed by an actual
run, not assumed).

**You verify:** nothing — this phase has no UI surface. Skip straight to
reviewing the diff/tests if you want eyes on it before Phase 2 starts.

---

## Phase 2 — Pattern language and matcher (`src/validation-engine/pattern.ts`, new) — DONE (2026-07-27)

**Status:** implemented on this branch. One deliberate, additive deviation
from §9.2's illustrative type: `GraphPattern` gained an optional `id?:
string` field, since "console.warn the pattern id" needs *something* to
name — the spec's shown type had no id anywhere on `GraphPattern`. Callers
(a `PatternRule.forbid`, a `Blueprint.require` in Phase 4) should set it to
their own rule/blueprint id. All 22 tests green, including every
`ConfigPredicate` operator, `via: "direct"`/`"path"`, injective bindings,
`absent` (both the negative-constraint and outer-alias-reference cases),
the budget guard (verified it actually hits `MAX_MATCHES=200` on a dense
60-node pathological graph and warns), determinism, and two composite
curriculum-shaped patterns (cache-aside, hot-path-via-any-route).
`typecheck`, `lint`, `test` (101 files / 742 tests, all 10 existing rule
suites unmodified), and `build` all ran clean; the rules-directory diff
against the release branch is still empty.

**Scope:** `ConfigPredicate`, `PatternNode`, `PatternEdge`, `GraphPattern`,
`Binding`, `matchPattern()`, `patternMatches()` — the backtracking search from
§9.2: selectivity ordering (`componentId` > `category` > unconstrained, then by
edge-constraint count), `via: "direct"` (adjacency) vs. `via: "path"`
(`reachable()`), **injective bindings** (no opt-out), `absent` sub-pattern
rejection, and the `MAX_MATCHES = 200` / `MAX_STEPS = 50_000` budget guard
with a `console.warn` on exhaustion. This is the highest-risk phase in the
whole track — it's new algorithmic code, not a refactor of something that
already works, so it gets the most test weight.

**Automated tests (mine), `pattern.test.ts`:**
1. Single-node match by `componentId`, by `category`, by both.
2. Every `ConfigPredicate` operator (`eq`/`neq`/`gt`/`gte`/`lt`/`lte`/`in`)
   against a node's config, independently.
3. Two-node pattern with a `via: "direct"` edge, kind-constrained and
   kind-unconstrained variants.
4. `via: "path"` — a pattern matching across an intermediate node it never
   names (proves it's using `reachable()`, not adjacency).
5. **Injective bindings**, the one the spec calls out as non-negotiable: a
   pattern requiring two distinct aliases bound to two distinct nodes, run
   against a graph with only one candidate node — must produce zero matches,
   not reuse that node for both aliases.
6. `absent` sub-pattern: a pattern that matches without the negative
   constraint, then confirm it's correctly rejected once the forbidden shape
   is added to the graph; and confirm an `absent` block referencing an outer
   alias resolves against the *current* binding, not in isolation.
7. Budget guard: a deliberately pathological pattern/graph pair (e.g. a dense
   near-complete graph against an under-constrained pattern) — assert it
   returns within the step cap rather than hanging, and that `console.warn`
   fires with the pattern id.
8. Determinism: same pattern + same graph run twice returns the same binding
   set (order-independent comparison is fine; just no flakiness).
9. Two or three **composite, curriculum-shaped** patterns as end-to-end
   sanity checks — e.g. a "cache-aside" shape (App Server → Cache direct,
   App Server → Database direct) matched against a graph that has it and one
   that doesn't; a "hot-path anti-pattern" using `via: "path"` (something
   reaching a component it shouldn't via any route). These aren't shipped
   rules yet (that's Step 5's job) — they exist here purely to prove the
   matcher handles a shape resembling what real content will actually need,
   not just synthetic unit cases.

**Done when:** all of the above green, `typecheck`/`lint` clean, existing 10
rules' tests still pass unmodified.

**You verify:** nothing yet — still no UI surface. This is the phase I'd most
want you to skim the actual matcher code for (not just trust the test count),
since it's the piece most likely to need a second pair of eyes on the
backtracking logic itself.

---

## Phase 3 — Rule kinds + engine dispatch (`types.ts`, `engine.ts` — modified) — DONE (2026-07-27)

**Status:** implemented on this branch. Matches §9.3/§9.4 as spec'd, no
deviations. `ValidationViolation.severity` widened to `Severity` too (it has
to be, to carry a `PatternRule`'s severity through) — no downstream code
does an exhaustive switch over it today, so this didn't require touching
`ValidationIndicator.tsx`/`QuestionPane.tsx`/etc.; they still just compare
`=== "error"`, and Phase 6 is where `note` actually gets its own rendering.
`typecheck`, `lint`, `test` (101 files / 745 tests, all 10 existing rule
suites unmodified), and `build` all ran clean; the rules-directory diff
against the release branch is still empty.

**Scope:** `Severity = "error" | "warning" | "note"`, the `ImperativeRule` /
`PatternRule` union, `engine.ts` builds the index once and dispatches on
`kind` (absent/`"imperative"` → `.match`, `"pattern"` → the Phase 2 matcher),
and **wraps every rule call in try/catch** — a throwing rule is skipped with
a `console.error`, never surfaced to the learner, never kills the run.

**Automated tests (mine), extend `engine.test.ts`:**
1. A deliberately throwing test rule mixed into the rule list — assert the
   run completes, other rules' violations still appear, and `console.error`
   was called (spy) with the rule's id.
2. A test `PatternRule` (using Phase 2's matcher) produces violations with
   `offendingNodeIds = Object.values(binding)` and `offendingEdgeIds`
   resolved for `via: "direct"` constraints, per §9.3.
3. One `runValidation` call mixing an `ImperativeRule` and a `PatternRule` —
   confirm both contribute to the same `ValidationViolation[]` output shape,
   nothing branches downstream on which kind produced a given violation.
4. **Regression, not a new test:** run the full existing suite for all 10
   shipped rules (`no-direct-client-database`, `single-instance-load-balancer`,
   `permissive-firewall`, `split-brain-risk`, `queue-without-dead-letter-queue`,
   `orphan-read-replica`, `orphan-component`, `request-flow-cycle`,
   `missing-input-connection`, `component-relations`) unmodified and green —
   this is the actual proof the union type is backward-compatible, not an
   assumption from reading the diff.

**Done when:** all of the above green, `typecheck`/`lint` clean, `npm run
build` succeeds (first phase where a broken type in `engine.ts` could
plausibly break the whole app, since every existing caller goes through it).

**You verify:** nothing new to click — `runValidation`'s signature and every
caller are unchanged, so Sandbox/chapter validation should look and behave
identically to today. If you want a spot-check: open Sandbox, build any small
graph, hit Validate — it should look pixel-identical to before this phase.
If it doesn't, that's a real regression, not expected.

---

## Phase 4 — Blueprints + chapter outcome (`content/chapters/types.ts`,
## `validation-engine/chapter-outcome.ts` — new) — DONE (2026-07-27)

**Status:** implemented on this branch, matches §9.5 as spec'd, no
deviations. All 9 spec'd test cases present in `chapter-outcome.test.ts`.
`connectedNodeIds` exported from `orphan-component.ts` — the one line-level
change that file needed, called out explicitly rather than folded into a
"zero changes" claim (`orphan-component.ts` itself keeps zero behavior
change, just a refactor-for-export). `solutionGraph` confirmed gone from
`src/` via grep (zero matches). `typecheck`, `lint`, `test` (102 files / 754
tests, all 10 existing rule suites unmodified), and `build` all ran clean;
the rules-directory diff against the release branch is empty for the other
9 rule files.

**Scope:** `Blueprint` type (`id`, `label`, `require`, `forbid?`, `commentary`,
`referenceGraph?`), `ChapterDefinition` gains `blueprints: Blueprint[]` and
**loses `solutionGraph?`** (confirmed via grep: referenced nowhere in `src/`
today except its own declaration — safe to delete outright, not deprecate).
`evaluateChapter(graph, chapter): ChapterOutcome` implementing §8.3's four
pass criteria. Per spec: **reuse `orphan-component.ts`'s exact connectivity
predicate** for the "required component is connected" check — this likely
means exporting that predicate (or a small shared helper) from
`orphan-component.ts` rather than re-deriving it, so there is exactly one
definition of "connected" in the codebase, not two that can drift apart.

**Automated tests (mine), `chapter-outcome.test.ts`:**
1. Zero-error, no-blueprints-declared chapter → passes (rules alone decide,
   per §8.3 point 4's "or the chapter declares none" clause).
2. A required component entirely missing from the canvas → fails,
   `missingRequiredComponentIds` populated.
3. A required component present but with zero incident edges and not an
   entry point → fails, `disconnectedRequiredComponentIds` populated (not
   `missingRequiredComponentIds` — these are distinct failure reasons and the
   type keeps them separate on purpose).
4. A required component present and connected only via an `entryPointIds`
   marker (no real edge) → counts as connected, matching
   `orphan-component.ts`'s own predicate exactly (this is the "why entry
   points count" case §2.4/§8.3 both reference).
5. One declared blueprint, graph contains it → passes,
   `matchedBlueprintId` set to that blueprint's id.
6. Two declared blueprints, only the second matches → passes with the
   second's id (proves "at least one," not "the first").
7. A single `error`-severity violation present → fails even when a blueprint
   would otherwise match (errors are the hard gate; nothing overrides them).
8. `warning` and `note` severity violations present, zero errors, blueprint
   matches → still passes (§8.3: only error-severity blocks).
9. Blueprint's own `forbid` patterns: a graph that satisfies `require` but
   also matches one of the blueprint's `forbid` patterns → that blueprint
   does not count as matched (test this explicitly — it's easy to
   accidentally only check `require` and forget `forbid` exists on
   `Blueprint` too).

**Done when:** all of the above green, `typecheck`/`lint` clean, and a repo
grep confirms `solutionGraph` no longer appears anywhere in `src/` (docs
mentions in `ARCHITECTURE.md`/`CURRICULUM.md`/etc. get a follow-up doc pass
in Phase 7, not here).

**You verify:** nothing yet — `evaluateChapter` isn't wired into any UI
until Phase 5.

---

## Phase 5 — Wire into ChapterWorkspace + Dexie v3 (`chapters/ChapterWorkspace.tsx`,
## `persistence/db.ts` — modified) — CODE DONE (2026-07-27), awaiting your
## manual IndexedDB verification pass below before I call this fully closed

**Status:** implemented on this branch, matches §9.5 as spec'd. `chapterOutcome`
(a `ChapterOutcome | null`) replaces the old bare `violations` state in
`ChapterWorkspaceContent`; `violations` is now derived from it
(`chapterOutcome?.violations ?? null`) so `AppHeader`/`ChapterSidebar`/
`QuestionPane` need no prop-shape changes yet — that's Phase 6's job. Dexie
v3 adds `chapterProgress` (keyed on `chapterId`, so a re-pass just updates the
existing row rather than duplicating). `typecheck`, `lint`, `test` (102 files
/ 757 tests, all 10 existing rule suites unmodified), and `build` all ran
clean. I did **not** drive the real-browser migration check myself — that's
the one thing only a real browser/IndexedDB catches, and it's explicitly your
pass per the "You verify" list below, not something I fake or skip past.

**Scope:**
- `ChapterWorkspace.tsx:221`'s `handleValidate` calls `evaluateChapter(graph,
  selectedChapter)` instead of `runValidation(graph, getRules(...))` directly
  — `evaluateChapter` internally resolves the chapter's `validationRuleIds`
  and runs them, so this is a like-for-like swap at the call site, not a
  parallel code path.
- Dexie **schema v3**: add `chapterProgress` table (`ChapterProgress`:
  `chapterId`, `completedAt`, `matchedBlueprintId`), listing every existing
  table too per the v1→v2 convention already established in `db.ts`.
- On a passing `evaluateChapter` result, write/update that chapter's
  `chapterProgress` row (`completedAt: Date.now()`, `matchedBlueprintId` from
  the outcome). **Explicitly not building the unlock graph** — §8.6 scopes
  that out; this phase only records completion.

**Automated tests (mine):**
1. `db.test.ts` extended: a `chapterProgress` round-trip
   (`put`/`get`/`update`) against `fake-indexeddb`, same pattern as the
   existing `saves` round-trip test.
2. A `ChapterWorkspace`-level test (or a focused test of whatever
   `handleValidate` becomes) confirming a passing graph triggers exactly one
   `chapterProgress` write with the right `matchedBlueprintId`, and a failing
   graph writes nothing.
3. Existing `ChapterWorkspace`/chapter-related tests (if any exist beyond
   `content/chapters/index.test.ts`) still pass — confirm via a full `npm
   test` run, not assumption.

**Done when:** above green, `typecheck && lint && test && build` all clean
(this is the phase most likely to touch a live Dexie migration, so `build`
passing isn't enough on its own — see "You verify" below for the one thing
only a real browser catches).

**You verify — this phase has a real migration risk, worth your own pass:**
1. `npm run dev`, open a chapter mode (`/building-blocks` or
   `/real-world-extraction`) with an **existing** browser profile that
   already has v2 data (any prior Sandbox save is enough) — confirm the app
   loads with no console errors about a Dexie version conflict, and your
   existing save is still intact (Sandbox still shows what you last saved
   there).
2. Open DevTools → Application → IndexedDB → `scalecraft` → confirm a
   `chapterProgress` object store now exists at version 3.
3. This phase alone won't yet make a real chapter "passable" (no real
   blueprint exists until Phase 6's fixture) — so there's nothing to click
   through to a pass state yet. Just confirm no migration error and no
   regression to your existing Sandbox save.

---

## Phase 6 — UI: QuestionPane, ValidationIndicator, Debrief + a throwaway
## blueprint fixture for manual QA — CODE DONE (2026-07-27), awaiting your
## click-through pass below before I call this fully closed

**Status:** implemented on this branch. Went with the doc's own default on
the flagged judgment call — Debrief shows every declared blueprint, matched
one badged "Your approach", not hidden. **One more judgment call, not
pinned down by §8.4 either:** `referenceGraph` renders as a lightweight
component-label edge list (`"Application Server → Cache"`), not a full
React Flow canvas — pulling in a second, read-only canvas instance for a
debrief aside felt disproportionate, and the text summary still shows the
actual shape. Say now if you want a real mini-canvas render instead.
`QuestionPane`'s required-components line now falls back to the old live
presence-only count before the first Validate click (or once stale), then
upgrades to `ChapterOutcome`-driven present-*and*-connected once a fresh
result exists — otherwise the line would just read "Not yet validated" for
something the user can see building in front of them pre-Validate.
`ValidationIndicator` now sorts error → warning → note, and note-severity
violations no longer count toward `hasViolations`/`isValid` at all (a
graph with only notes now shows the valid checkmark, not the error X) —
broader than literally just "excluded from the header counts," but the
narrower reading left the icon contradicting the "notes don't block"
framing. `typecheck`, `lint`, `test` (103 files / 770 tests, all 10
existing rule suites unmodified), and `build` all ran clean. I also ran the
existing `e2e/chapter-hints-validation.spec.ts` (still green — the
Validate/hint invariants it guards are untouched) and took light/dark
screenshots of the placeholder chapter's QuestionPane post-Validate to
sanity-check no obvious layout break; I did **not** script a full
drag-and-drop e2e build of the fixture blueprint's graph — that's exactly
the click-through this section already asks you to run yourself, and
scripting it would just be a worse version of your own pass.

**Scope:**
- `QuestionPane.tsx`: replace the presence-only "N / M required components
  present" counter with one driven by `ChapterOutcome` — present *and*
  connected, plus a plain (non-celebratory, "not a game") completion line
  once `passed` is true.
- `ValidationIndicator.tsx`: render `note`-severity violations in a visibly
  muted style, excluded from the error/warning counts in the header summary
  row (today's `:103-112`), but still with full message+explanation shown —
  notes are informational, not hidden.
- New `Debrief` component: appears only once `evaluateChapter(...).passed`
  is true, pull-only (a button/disclosure, never auto-opens), revealing
  every declared blueprint's `label` + `commentary` + `referenceGraph`
  (matched one visually distinguished from the others, not hidden — seeing
  the alternate valid shapes is part of the payoff once you've already
  earned it). **Flagging this as a judgment call, not something the spec
  pins down exactly** — §8.4 says "reveal each blueprint's label/commentary/
  referenceGraph" without saying whether that means only the matched one or
  all of them; I'm defaulting to "all, matched one distinguished" since RWE's
  whole point is multiple valid answers, but say now if you want it scoped
  to just the matched blueprint.
- **Temporary fixture, not real content:** extend the existing
  `bb-dummy-1` placeholder chapter (`src/content/chapters/index.ts`) with one
  real `Blueprint` (e.g. requiring Client → Load Balancer → App Server,
  connected) purely so there's something concrete to click through end to
  end before Step 5 authors real curriculum. Marked inline as throwaway,
  same convention the file already uses for its `placeholder: true` chapters
  — Step 5 replaces this, doesn't build on it.

**Automated tests (mine):** component-level tests for the `QuestionPane`
counter logic and `ValidationIndicator`'s note-exclusion, plus a `Debrief`
render test (closed by default, opens on click, shows commentary text).
`typecheck && lint && test && build` clean.

**You verify — this is the phase with a real visual surface, run this
yourself in both themes:**
1. Go to `/building-blocks`, open the (now blueprint-backed) placeholder
   chapter. Build **any wrong graph** (e.g. just a Client, nothing else) and
   hit Validate — confirm: no Debrief affordance appears, the required-
   components line shows the accurate present/connected count, and normal
   error/warning violations still show message+explanation same as always.
2. Build the graph the new fixture blueprint actually requires (Client → LB
   → App Server, all connected) and hit Validate — confirm: it now reports
   passing, a Debrief affordance appears, and clicking it — not
   auto-opening — reveals the blueprint's commentary. Refresh the page and
   confirm the Debrief does **not** auto-open on load even though the
   chapter is already completed.
3. Deliberately trigger a `note`-severity violation if the fixture has one
   (or temporarily point one at the chapter's rule ids for this check only,
   then revert) — confirm it renders visibly but muted, and does **not**
   inflate the header's error/warning count.
4. Toggle light/dark theme (the existing toggle) while the Debrief panel is
   open — confirm it isn't unreadable or unstyled in either theme.
5. Resize the window narrow (or use a laptop-width viewport) with the
   Debrief panel open — confirm it doesn't overflow/collide with the canvas
   or the validation dropdown the way a couple of past panels have (see
   `CRITIQUE.md`'s tooltip/z-index history) — this is the one thing worth a
   deliberate look given this app's track record on exactly this kind of
   bug.

---

## Phase 7 — Hardening, full regression, docs sync — DONE (2026-07-27)

**Status:** `typecheck`, `lint`, `test` (103 files / 770 tests), `build`, and
the full `e2e/` Playwright suite (3 specs) all green. The 9-of-10 rule-file
zero-diff invariant holds across the whole branch
(`git diff release/2.0.0-validation-engine-overhaul...HEAD --
src/validation-engine/rules/{...9 files...}` empty); `orphan-component.ts`'s
diff is exactly the one exported helper Phase 4 called out, nothing more.
Doc sync done: `validation_agent_design.md`'s header/Rollout Status,
`MILESTONES.md` milestone 5, and `NEXT_STEPS.md` (top status line, Step
4.5's header/branch list/done-when bar) all now say "Track 2 implemented,
pending merge" rather than "not built" or "done." Not emptying this file
out yet, per its own convention — that's for once this actually merges, and
per `CLAUDE.md` I don't merge my own branches. Everything above is
committed locally on `feature/validation-pattern-engine`; pushing to origin
is still your call to make, not something I do unprompted.

**Scope:**
- Full pipeline run: `npm run typecheck && npm run lint && npm test && npm
  run build` — green, not "green last time I checked."
- Confirm (grep, not memory) the 10 original rule files truly have zero line
  changes across the whole branch (`git diff release/2.0.0-validation-engine-overhaul...HEAD -- src/validation-engine/rules/{no-direct-client-database,single-instance-load-balancer,permissive-firewall,split-brain-risk,queue-without-dead-letter-queue,orphan-read-replica,orphan-component,request-flow-cycle,missing-input-connection,component-relations}.ts` should be empty, **except** whatever
  small export change Phase 4 needed from `orphan-component.ts` to share its
  connectivity predicate — call that out explicitly if it happens, don't
  let it hide inside a "zero changes" claim).
- Doc sync: `validation_agent_design.md`'s Rollout Status (Track 2 → done),
  `MILESTONES.md` milestone 5, `NEXT_STEPS.md` Step 4.5 — mark done, note
  what shipped vs. what's still Track 3.
- This file (`pending.md`) gets each phase's checkbox-equivalent marked, or
  gets emptied out entirely once merged — matching this repo's existing
  convention of pending.md being a live session-task list, not an archive.

**Done when:** pipeline green, doc cross-references consistent, nothing left
half-updated.

**You verify:** a final free-form click-through of both chapter modes and
Sandbox on your own, since this is the "does the whole thing still feel
right" pass, not a scripted one. If something feels off, that's the signal
to hold the merge, not push through it.

---

## Sequencing note

Phases 1–4 are pure logic, no UI, and I'd expect to move through them fairly
quickly with tests as the only gate. Phase 5 is the one with real migration
risk (Dexie v3) — worth pausing there for your IndexedDB check before
continuing. Phase 6 is the one actually worth your time clicking through.
Each phase lands as its own commit on `feature/validation-pattern-engine`
(not its own branch — this whole track is the one branch per
`NEXT_STEPS.md`); I'll stop after each phase and report rather than
batching multiple phases into one silent push.
