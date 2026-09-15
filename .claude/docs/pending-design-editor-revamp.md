# Pending: Design Editor revamp

**Status: ALL STEPS DONE, INCLUDING THE STEP 6 VERIFICATION AUDIT.** Release **7.2.0-alpha**, all work on
`feat/design-editor-revamp` (D20). **D1-D20 are all locked, no open
questions.** D13 was delegated to Claude; the rest are the user's. Steps
1-5f are **committed and pushed** as `a797b91`; Step 6's tests and this
doc update follow it. The branch is ready for the user's code review and
their own merge (D20) - what still has to happen before it merges is the
`chore(release):` version bump and release-notes entry, which live at
release-branch level, not here.

| Step | State |
|---|---|
| 1 - Component card | done 2026-09-11 |
| 1b - Card revision after user review (140x100 -> 120x96) | done 2026-09-11 |
| 1c - Icon plate enlarged after a second user review (32px -> 44px) | done 2026-09-11 |
| 2 - Edge connections | done 2026-09-11 |
| 3 - Inspector (`NodeConfigPopover` + `EdgeInspector`) | done 2026-09-11 |
| 4 - Starter graph relayout + D19 migration | done 2026-09-11 |
| 5a - `ReferenceGraphCanvas` | done 2026-09-11 |
| 5b - 12 chapters of `referenceGraph` | done 2026-09-12 |
| 5c - Auto-layout, Start badge, flow-diagram pass | done 2026-09-12 |
| 5d - Flow-diagram rules on the live canvas + all 14 starter graphs | done 2026-09-12 |
| 5e - Ports rebuilt (connection bugs), layout tightened | done 2026-09-12 |
| 5f - Connect band, two-way + blocked edges, armed-click cancel | done 2026-09-12 |
| 6 - Verification audit (full pipeline, e2e, 2 new test files) | done 2026-09-15 |

**Scope in one line:** shrink and redraw the component card, make edges easy to
connect, move the information the card loses into a redesigned inspector, then
re-author every starter graph and blueprint to suit.

**Not in scope:** the Reader, the quiz, walkthrough diagrams
(`src/chapters/walkthrough/`, separate renderer and geometry), chapter teaching
content. The brief/`exerciseGoal`/`successCriteria` work is already done - see
`pending-design-editor-exercise.md`, all of T0-T9 landed 2026-08-23.

---

## Locked decisions

| # | Decision | Choice |
|---|---|---|
| D1 | Card visual direction | Full re-imagination in the "engineering spec sheet" language Home's `ModeCard` already uses: bordered wireframe icon tile, rectangular uppercase short code, dimension-line divider. Not a refinement of the current anatomy. |
| D2 | Card footprint | **120 x 96** (settled 2026-09-11 after the user reviewed the first 140 x 100 build and found it still too big / too airy). Down from 200 x 65. |
| D3 | Description line | **Removed from the card entirely.** It moves to the inspector. |
| D4 | What stays on the card | Category short code, instance name (when set), config-state signal. **Not** inline config values. |
| D5 | Inspector shape | Stays the anchored popover (`NodeConfigPopover`), redesigned - wider, richer, modern ScaleCraft look. Not a docked rail, not a floating window. |
| D6 | Connection ergonomics | Whole card is a drop target + big hover port affordances + click-to-connect mode. |
| D7 | Handle sides | Four sides. Right/bottom source, left/top target, edge auto-picks the shortest clean pair. |
| D8 | Starter graph pitch | **260 x 195** (120px horizontal / 95px vertical gap, unchanged from today). Density comes from the smaller card, not smaller gaps. |
| D9 | Layout production | Fully hand-authored, per chapter. No script, no runtime auto-layout. |
| D10 | Blueprint deliverable | Author `referenceGraph` for the chapters that have `blueprints`, **and** replace the textual `ReadOnlyGraphSummary` with a real read-only canvas render. |
| D11 | Card resizing | **Kept.** `NodeResizer` stays; min sizes re-derived from the new default. |
| D12 | Click-to-connect edge kind | **Unchanged flow.** The edge is created first, kind set afterward in `EdgeInspector`, exactly as drag-connect does today. |
| D13 | `start-target` handle collision | **Merge into one handle** (decided by Claude, see Step 2). |
| D14 | `EdgeInspector` | **In scope.** Redesigned alongside `NodeConfigPopover` in Step 3. |
| D15 | Old-pitch saved graphs | **One-time migration.** Not left to drift. |
| D16 | `referenceGraph` chapter set | **The real editor chapters.** 12 at Step 5b; corrected to **13** in Step 5c - `bb-0-1-welcome` is no longer a placeholder and does mount a Debrief. See Step 5b for why it is not 25. |
| D17 | `DiagramQuestion` | **Out of scope.** Quiz diagrams keep the existing textual `ReadOnlyGraphSummary` untouched. |
| D18 | Release | **7.2.0-alpha.** |
| D19 | Save migration mechanism | **Dexie `version(15)` `.upgrade()` + a per-save `pitchVersion` marker carried through cloud sync.** The version bump alone cannot prevent a double-squash on a second device. |
| D20 | Branching | **All work happens on `feat/design-editor-revamp`.** No `type/*` branches, no touching the release branch. Branching and merging are the user's, not Claude's. |

### Why D8's gap did not shrink with the card

The 120/95 gap was sized for what an *edge* needs (visible direction, room for a
mid-edge label, a click target), not for the card. That requirement does not
shrink because the card did. Holding the gap while the card drops from 200 to 140
wide is what produces the density: roughly 4x4 nodes at fit-zoom 1.0 against
today's effective 3 columns.

---

## Measured baseline

Everything below is read out of the repo today, not estimated.

| Fact | Value | Source |
|---|---|---|
| Card width | 200px (`data.width ?? 200`) | `src/canvas/ComponentNode.tsx:96` |
| Card min height | 65px (`MIN_HEIGHT`) | `src/canvas/ComponentNode.tsx:14` |
| Resize floor | 160 x 65 (`MIN_WIDTH`/`MIN_HEIGHT`) | `src/canvas/ComponentNode.tsx:13-14` |
| Handles | Left target (conditional), Right source (conditional), plus an invisible unconditional `start-target` on Top | `ComponentNode.tsx` |
| Handle styling | **None.** No `.react-flow__handle` rule exists in `globals.css`. Stock ~6px dots. | grep, `src/app/globals.css` |
| `connectionRadius` | **Never set.** React Flow default (20px). | `src/canvas/Canvas.tsx:636-641` |
| Current pitch | 320 x 160 | `CURRICULUM.md` §11.5, `DESIGN.md` Node Card |
| Invariant gates | `MIN_HORIZONTAL_GAP = 120`, `MIN_VERTICAL_GAP = 95`, aspect <= 2.5:1 for 4+ nodes | `authoring-invariants.test.ts:123-167` |
| Zone geometry formula | `position = (x0 - 28, y0 - 48)`, `width = 320 * (cols - 1) + 256`, `height = 137` | `CURRICULUM.md` §11.6 |
| Chapters with `starterGraph` | **14** | see list below |
| Chapters with `blueprints` | **25** | see list below |
| Chapters with `referenceGraph` | **0** | grep |
| Debrief reference render | `ReadOnlyGraphSummary` - a textual shape list, positions ignored | `src/chapters/ReadOnlyGraphSummary.tsx` |

**14 chapters with a `starterGraph`:** `bb-0-1-welcome`,
`bb-1-2-designing-the-system`, `bb-3-1-networking-fundamentals`, `bb-3-2-dns`,
`bb-3-3-reverse-proxy`, `bb-3-4-load-balancer`, `bb-3-5-api-gateway`,
`bb-3-6-stateless-services`, `bb-3-7-sessions-and-state-management`,
`bb-3-8-horizontal-scaling`, `bb-3-9-service-discovery`, `bb-3-11-sql-vs-nosql`,
`bb-3-12-replication`, `rwe-dummy-1`.

**25 chapters with `blueprints`:** the 14 above plus
`bb-0-2-what-is-system-design`,
`bb-0-3-interview-design-vs-production-engineering`,
`bb-0-4-the-system-design-lifecycle`, `bb-1-1-framing-the-problem`,
`bb-1-3-defending-the-design`, `bb-1-4-driving-the-interview`,
`bb-2-1-from-browser-to-backend`, `bb-2-2-where-can-things-go-wrong`,
`bb-2-3-evolution-of-modern-architectures`, `bb-3-10-databases`,
`bb-3-13-sharding`.

---

## Derived constants (computed 2026-09-11, use these - do not re-derive)

**Label fit at 140px.** 27 components in the registry. Longest label is
"Serverless Function" (19 chars); longest single *word* is 11 chars
("Application", "Distributed", "Coordinator"); median label is 11 chars. At
140px wide with 12px side padding, the label line has ~116px. The longest word
is ~71px at 12px/600, so **nothing needs to hyphenate or break mid-word** and
two lines covers the whole registry. D2's 140px is confirmed viable.

**Zone geometry for §11.6.** The padding semantics carry over unchanged (28px
left/right, 48px above for the label, 24px below); only the card-size terms
move:

| | Old (card 200x65, pitch 320x160) | New (card 120x96, pitch 260x195) |
|---|---|---|
| `position` | `(x0 - 28, y0 - 48)` | `(x0 - 28, y0 - 48)` unchanged |
| `width` | `320 * (cols - 1) + 256` | `260 * (cols - 1) + 176` |
| `height` | `137` | `168` |

Gaps between adjacent zones are unchanged in both axes (64px horizontal, 23px
vertical), because the node gap itself did not change.

**Bounding boxes at the new pitch.** `width = 260 * (cols - 1) + 120`,
`height = 195 * (rows - 1) + 96`. The canvas pane at 1440x900 is 1116x842, and
`fitView` uses `padding: 0.1, maxZoom: 1`, so a box up to ~1015 x 765 renders at
zoom 1.0.

| Grid | Box | Aspect | Fits at zoom 1.0 |
|---|---|---|---|
| 3 x 2 | 640 x 291 | 2.20 | yes |
| 3 x 3 | 640 x 486 | 1.32 | yes |
| 4 x 2 | 900 x 291 | **3.09** | fails the 2.5 aspect gate |
| 4 x 3 | 900 x 486 | 1.85 | yes |
| 4 x 4 | 900 x 681 | 1.32 | yes |
| 5 x 3 | 1160 x 486 | 2.39 | no, too wide |

So the usable grid is **max 4 columns x 4 rows = 16 nodes** at zoom 1.0, and
a 4-column row needs at least 3 rows to stay under the aspect ceiling.

**Invariant gate change.** `authoring-invariants.test.ts` computes the gap by
subtracting the card size from the centre-to-centre distance. The 120/95
minimums stay (D8) and are now their *own* exported constants in
`card-geometry.ts` rather than `PITCH - CARD` derivations - the minimum gap is
a property of the edge, not of the card, and deriving it meant it silently
tracked every card resize. The subtracted card size changes from `200`/`65` to
`120`/`96`.

**Category short codes** (Step 1 item 1), proposed:

| Category | Code |
|---|---|
| `networking` | `NET` |
| `compute` | `COMP` |
| `data` | `DATA` |
| `caching` | `CACHE` |
| `messaging` | `MSG` |
| `distributed-systems` | `DIST` |

`COMP` rather than `CPU` - the category is compute in the architectural sense
(app servers, workers, serverless), not processors.

---

## Build log

### Step 1 - The component card: DONE (2026-09-11)

Full CI green: typecheck, lint, 2388 passed / 2 skipped, build.

Files: `src/canvas/ComponentNode.tsx` (rewritten), `src/canvas/card-geometry.ts`
(new), `src/canvas/config-state.ts` (new), `src/canvas/category-colors.ts`
(+`categoryShortCode`), both new test files, `ComponentNode.test.tsx`
(rewritten), `authoring-invariants.test.ts`, `DESIGN.md`.

Three things worth knowing that were not in the plan:

1. **`card-geometry.ts` exists now.** The invariant gate had `CARD_WIDTH = 200`
   / `CARD_HEIGHT = 65` hand-copied as literals, with a comment asking whoever
   resized the card to remember to update them. Nobody would have. Geometry is
   now exported from one module and imported by both the card and the gate, so
   this class of drift cannot recur.

2. **The state ring gained a glyph.** `DESIGN.md` §2 requires validation state
   to carry a second, non-hue channel; the old card used an identical solid 2px
   outline for all three states, separating valid from error by hue alone. The
   footer now carries a labelled check / triangle / cross. This was a
   pre-existing violation of the project's own stated rule, fixed while the card
   was open rather than left in place.

3. **Two invariant gates are `it.skip`ped, deliberately.** The spacing and
   aspect gates are correct but currently unsatisfiable: the card is 140x100
   while every starter graph is still authored at the old 320x160 pitch, which
   leaves a real vertical gap of 60px against the 95px minimum. **Step 4 must
   re-enable both** - they are the acceptance test for the relayout. They were
   skipped rather than loosened (which would quietly lower the standard) and
   rather than left green against stale constants (which would be a lie).

**Not done in Step 1, by design:** handles are untouched. D7's four sides, D6's
whole-card drop target and hover ports, and D13's `start-target` merge are all
Step 2. The card still renders exactly the conditional left-target /
right-source / invisible-top-anchor set it had before.

**Open for the user's eye:** the 140x100 dimensions are frozen in
`card-geometry.ts` and Step 4 derives from them, so a visual review of the card
before Step 4 starts is worth more than one after.

### Step 1b - Card revision after review: DONE (2026-09-11)

The user reviewed the 140x100 build: *"not sure about the component look. It
still looks quite big and this design feels like a lot of wasted space too."*
Both true, and the second explains the first.

What was wrong: the icon was a 26px tile in the top-left corner, so the card's
focal point was a corner ornament and the middle of the card was slack. The
footer reserved a row for an instance name that is usually unset and a
validation glyph that does not exist until Validate runs, so on a fresh canvas
the bottom third of every card was empty - with a dimension-line rule drawn
above it, separating content from nothing.

What changed:

- **120 x 96** (aspect 1.25, was 1.40). 11,520 px² against 14,000 - 18% less
  area, and meaningfully squarer, which was D2's original ask.
- **Icon-forward.** A centred 32px category-tinted plate with a 19px glyph is
  now the focal point, and it owns the `flex-1` - so the card's spare height
  frames the icon instead of pooling under the text. Whitespace around a focal
  element reads as composition; the same whitespace under a label reads as a
  card that failed to fill itself. This is also the honest reading of the
  user's original "make them icon recognizable."
- **The instance-name row is conditional.** No name, no row.
- **The dimension-line divider is cut.** It was ModeCard's drafting motif, but
  at 120px wide with an icon already carrying the composition it was a rule
  separating content from an empty row. Motif consistency is not worth a line
  that divides nothing.
- Resize floors follow the card down to 96 x 76.
- `MIN_HORIZONTAL_GAP`/`MIN_VERTICAL_GAP` are now explicit constants rather
  than `PITCH - CARD`. The pitch stays 260 x 195, which now yields 140/99 of
  real gap - deliberately above the 120/95 floor rather than exactly on it, so
  a learner nudging a card a few pixels does not drop an authored layout under
  the standard.

Label fit re-checked at 120px: the longest *component* label is "Serverless
Function" (19 chars); no single word exceeds ~62px at 11px/600 against ~106px
of line, so two lines still covers the whole registry.

### Step 1c - Icon plate enlarged after a second user review: DONE (2026-09-11)

The user, after actually looking at the 120x96 card (screenshotted via a
Playwright script against the running dev server, not eyeballed from code):
*"They feel like a lot of wasted space."* True even after Step 1b's rework -
the 32px icon plate sat centred inside the icon row's `flex-1` slack, and at
the card's default proportions (12px meta row + ~13px single-line label)
that slack is ~59px tall, leaving ~13px of dead air above and below a 32px
tile. Enlarging the *tile*, not the whitespace strategy, was the fix -
**44px plate, 24px glyph** (`h-11 w-11`, `size={24}`, up from `h-8 w-8` /
`size={19}`). Verified against the registry's worst real cases in the running
app: "Serverless Function" (19 chars) and "Distributed Cache" + a 25-char
instance name both still render on one line with no overflow at 120x96 -
D2's footprint holds. `ComponentNode.tsx`, `DESIGN.md` updated; no test
asserted the old pixel values, so nothing else needed changing.

### Step 2 - Edge connections: DONE (2026-09-11)

The user: *"Edge connection is even worse now. I hate the crosshair that
appears and some edges don't connect at all."* All three parts were real, and
"even worse now" was literally true - shrinking the card made an existing bug
worse rather than introducing one.

**Root cause of "some edges don't connect at all", traced in the xyflow
source, not guessed.** Every card carried an unconditional `start-target`
handle at top centre - invisible, `isConnectable={false}`, there only to anchor
a Start marker's pointer arrow. `getClosestHandle`
(`@xyflow/system`) iterates `handleBounds` with **no connectability filter**,
so it happily returns that handle as the snap target; `isValidHandle` then
reads the `connectable` class off the DOM node, finds it absent, and returns
`isValid: false`. The connection silently never happens.

Why it got worse at 140x100: top-centre moved from (100, 0) to (70, 0) while
the left target moved from (0, 32.5) to (0, 50). The dead zone near each
card's top-left corner grew in exactly the region a left-to-right drag
approaches from.

**The crosshair** is `.react-flow__handle.connectionindicator { cursor:
crosshair }` in xyflow's own stylesheet. No project CSS touched
`.react-flow__handle` at all, so every handle was also still xyflow's stock
6px `#1a192b` dot - a colour belonging to no token in this app.

Five changes, each covering a different part of the gesture:

1. **`start-target` merged into a real top target** (D13). Same id, still
   unconditionally rendered, but `isConnectable` now follows
   `definition.inputs.length > 0`. It stays inert only on components that
   genuinely cannot receive a connection, where there was nothing to snap to
   anyway.
2. **Four sides** (D7): Left/Top receive, Right/Bottom send. The first handle
   of each type stays id-less on purpose - every persisted edge carries a null
   `sourceHandle`/`targetHandle`, and xyflow resolves null to
   `handleBounds[0]`, which follows DOM order. Left-before-Top and
   Right-before-Bottom is load-bearing; there is a test pinning it.
3. **`connectionRadius` 60** (default 20), chosen so the four catch radii
   union to cover the entire card: the worst-covered point on a 120 x 96 card
   is its centre, exactly 60px from the left and right handles. That delivers
   D6's whole-card drop target through geometry alone, with no hit-test code.
   Safe against a neighbour's handles - the tightest authored spacing is a
   120px gap, more than twice the radius.
4. **`connectionMode="loose"` + `isValidConnection`.** Four-sided handles in
   strict mode create a *new* dead zone: approaching a card's bottom-left, its
   bottom *source* handle is nearer than its left target, so the snap lands on
   a source, strict mode rejects it, and the drag dies silently - the same
   failure shape as the bug being fixed. Loose mode accepts the nearest handle
   whatever its type; direction is restated in `canvas/connection-rules.ts`,
   deliberately narrow: it rejects only connections with nowhere to attach (a
   Client declares no inputs at all), never ones that merely look like bad
   architecture. Judging architecture stays the validation engine's job,
   because it owes the user an explanation and a refused drag gives none.
5. **Port styling** (`globals.css`, first `.react-flow__handle` rules in the
   project): 9px dot on our own tokens with a **31px transparent hit disc**
   (`::after`, negative inset); `grab`/`grabbing` instead of crosshair; hidden
   at rest, revealed on card hover/selection and on every legal destination
   for the duration of a drag (the `sc-canvas-connecting` class Canvas.tsx
   sets from its existing `onConnectStart`/`End` state); and the port under
   the cursor turns `--state-valid` or `--state-error` before release, so a
   refused drop says so rather than doing nothing.

**Click-to-connect** (D6) needed no work: xyflow's `connectOnClick` already
defaults to true, and the ports are now large enough to hit. It was
unreachable before purely because the target was 6px.

**Also removed:** `overflow-hidden` on the card root. Handles are centred on
the card's edges, so the clip was cutting every port in half.

**Persistence note for Step 4/review:** loose mode means a new edge can carry
a `targetHandle` naming a handle registered as a *source* (e.g.
`source-bottom`). xyflow resolves that correctly while `connectionMode` is
loose; switching back to strict later would strand those edges. Recorded here
so the decision is visible rather than discovered.

**Verified in a browser during Step 3's testing pass (2026-09-11):** a
Playwright script dragged from Client's right handle to the SQL Database
card and the connection landed - a real end-to-end exercise of the
`connectionRadius`/loose-mode/`isValidConnection` path, not just the
arithmetic. Hover reveal and the exact 31px disc geometry are still
unclicked; a manual pass is still worth doing before Step 4 relayouts 14
chapters against this geometry.

---

### Step 3 - The inspector: DONE (2026-09-11)

Full CI green: typecheck, lint, 2398 passed / 2 skipped, build. Verified live
against the running dev server via Playwright screenshots, including a
real failing graph (Client wired directly to a SQL Database) to confirm the
new validation-explanation surfacing actually renders real engine output,
not just its own empty state.

Files: `src/canvas/NodeConfigPopover.tsx` (rewritten), `src/canvas/
EdgeInspector.tsx` (rewritten), `src/canvas/validation-visuals.ts` (new -
`stateRingVar`/`stateGlyph`/`stateLabel` pulled out of `ComponentNode.tsx` so
the card and both inspectors share one state->color/glyph/label mapping),
`src/canvas/Canvas.tsx` (new `violations` prop, forwarded to both panels
alongside the existing `nodeStates`), `sandbox/page.tsx` and
`ChapterWorkspace.tsx` (pass `violations` down, already had it in scope for
`ValidationIndicator`), `Canvas.test.tsx` (one test scoped to
`within(nodeEl)` - see below), `DESIGN.md` (new Inspector section).

Three things worth knowing that weren't spelled out in the brief:

1. **Validation results still don't enter the store.**
   `ComponentNodeData.validationState`'s own doc comment says the store holds
   the graph being edited, not validation results - so `nodeStates` and the
   new `violations` prop are threaded through as props (Canvas.tsx ->
   NodeConfigPopover/EdgeInspector), the same pattern `nodeStates` already
   used for the card's ring color. No new store field, no architecture
   change.
2. **The connections list reuses `componentDisplayNames`**, the same helper
   the Start marker's target picker uses to turn a node id into "label" or
   "label #2" or "label - instance-name" - rather than re-deriving that
   formatting a second time in the popover, which is exactly the kind of
   drift a shared inspector/card language is supposed to prevent.
3. **One pre-existing test broke, correctly.** `Canvas.test.tsx`'s "clicking
   a node selects it" test used an unscoped `screen.getByText("Client")`;
   with an edge selected, EdgeInspector's new source -> target header also
   renders "Client", so the query started matching twice. Fixed by scoping
   the query to `within(document.querySelector('.react-flow__node[data-id="n1"]'))`
   - a real ambiguity the new feature introduced, not a flaky test.

**Validation-issue surfacing went further than the brief's "an argument for"
phrasing asked.** The Step 3 planning section only committed to "the node's
connection list, and its validation state" for the popover, and floated
edge-issue surfacing as something to weigh, not a locked decision. Both
panels now filter the full Validate-run result to `offendingNodeIds`/
`offendingEdgeIds` and render the matching message + explanation in full,
symmetrically on both panels - implemented because `connection-rules.ts`
(Step 2) already means most bad connections have nowhere else to explain
themselves, and CLAUDE.md's "an explanation is always shown on failure" rule
reads as unconditional, not "unconditional except inside a panel that
happens to already know which node failed."

### Step 4 - Starter graph re-authoring + D19 migration: DONE (2026-09-11)

Full CI green: typecheck, lint, **2410 passed** (up from 2398/2 skipped -
both previously-skipped invariant gates are re-enabled and passing, plus 8
new tests for `pitch-migration.ts`), build. Verified live in a browser
(Playwright against the real dev server, using the e2e test user's
storage state) against all three of `bb-3-6-stateless-services`,
`bb-3-9-service-discovery` and `bb-3-12-replication` - zones wrap the right
tier with no overlap, the comment box clears the cards, edges connect
correctly, and the 3x4/2x5 grids fit at a reasonable zoom.

**All 14 starter graphs were a coordinate rescale, not a re-layout** -
D9 says "no script" for *runtime* layout, but this is a one-time authoring
migration converting already-hand-placed positions from one pitch to
another, not generating a layout. Every one of the 14 graphs turned out to
be authored on an exact grid (columns at a fixed 320px pitch from a common
x0=60, rows at a fixed 160px pitch from y=0), so the conversion was exact
integer arithmetic (`newX = 60 + col * 260`, `newY = row * 195`), not a
lossy float rescale - re-derived from `CURRICULUM.md`'s own zone-geometry
formula rather than guessed. Decorator zones were recomputed from that same
formula (`position = colX0 - 28, rowY0 - 48`, `width = 260*(cols-1)+176`,
`height = 168`) rather than linearly scaled, so they land exactly on the new
grid instead of accumulating rounding drift. The one off-grid exception
(`rwe-dummy-1`'s single placeholder node) got a plain continuous scale
instead, since it was never grid-aligned to begin with and nothing checks
its position.

**The column cap moved from 3 to 4** in `CURRICULUM.md` §11.5 (the new card
makes a 4th column fit at zoom 1.0 - see "Derived constants" above), but no
existing chapter needed re-tiering to pass the re-enabled gates, so none
were re-tiered. The cap change is documented for future authoring, not
exercised by this pass.

**D19's migration landed as a new `src/persistence/pitch-migration.ts`**
module (`CURRENT_PITCH_VERSION`, `needsPitchMigration`,
`migrateNodesToCurrentPitch`), consumed from two call sites, matching the
doc's own hazard analysis:

1. `db.ts`'s new `version(15)` Dexie upgrade - rescales every existing local
   `saves` row's nodes (component position only; zone/comment position *and*
   `width`/`height`, since D11 exempts only component resizes) relative to
   the graph's own bounding-box origin (0.8125x / 1.21875y, per the doc's own
   formula for saved data - this is arbitrary user-placed content, not the
   clean grid above, so a formula recompute doesn't apply). Skips the
   revision/dirty bump for a save with zero nodes, since there's nothing to
   rescale and no reason to force a pointless re-push (this was originally
   unconditional and broke a pre-existing v13 test's "stays in sync" 
   assertion on an empty seeded row - fixed by gating on `nodes.length > 0`
   rather than loosening that test).
2. `save-revisions.ts`'s `remoteSaveRow()` - migrates a *pulled* remote save
   too, for the case the Dexie upgrade can't reach: a fresh browser with no
   local `saves` row never runs v15's upgrade against data that arrives
   later via cloud sync.

`pitchVersion` rides inside the existing `canvasState` jsonb blob
(`cloud-sync.ts`'s `CanvasState` type, `db/sync/schemas.ts`'s
`canvasStateSchema`) rather than a new Postgres column or migration - the
server already stores/returns that blob verbatim, so this is a client-only
schema change with no `drizzle-kit` migration to run.

**One acknowledged, unclosed edge case** (inherent to any client-versioned
schema riding on a server-versioned API, not something this pass could
close): if Device B is still running pre-this-feature client code when it
pulls a save Device A already migrated, Device B's old `remoteSaveRow`
doesn't know `pitchVersion` exists and drops it when writing the row
locally. When Device B later updates, its own v15 upgrade sees that row
missing the marker and re-migrates already-current-pitch data, squashing it
a second time. Old code cannot be made retroactively field-aware, so this is
a real but narrow window (both devices mid-transition at once) rather than a
gap in the implementation.

**A verification-only detour worth recording**: the first browser pass
showed zero decorators for two of the three checked chapters, which looked
like a real rendering bug. It wasn't - the e2e test user's account already
had cloud/local saves for those chapters from earlier e2e runs, and
`ChapterWorkspace.tsx` correctly prefers an existing save over the
`starterGraph`+`starterDecorators` fallback. The first two delete attempts
targeted `chapter:<route-slug>` (e.g. `chapter:3-6-stateless-services`)
instead of `chapter:<chapter.id>` (`chapterSaveId` keys off
`ChapterDefinition.id`, e.g. `chapter:bb-3-6-stateless-services`) and so
silently deleted nothing; fixing the scope id resolved it. No app code
changed as a result - flagged here only so a future verification pass
doesn't re-spend the time rediscovering it.

### Step 5a - `ReferenceGraphCanvas`: DONE (2026-09-11)

Full CI green: typecheck, lint, **2418 passed** (up from 2410 - 8 new tests
across `ReferenceGraphCanvas.test.tsx` and `ReferenceComponentNode.test.tsx`;
one pre-existing, unrelated flake in `sandbox/page.test.tsx` - the same
two-setState race noted after Step 3 - failed once in the full run and
passed clean in isolation), build. Verified live in a browser: a throwaway
`/dev/debrief-lab` route (deleted before this entry was written, following
the existing `blueprint-lab`/`diagram-question-lab` scratch-harness
convention) rendered a real `Debrief` with a five-node reference graph
(Client -> Load Balancer -> Application Server -> Distributed Cache ->
SQL Database, plus a diagonal async edge) - category short codes, icons,
the configured dot, and per-kind edge color/dash all rendered correctly,
and both a horizontal and a vertical edge routed through the right handle
pair.

Files: `src/canvas/ComponentCardVisual.tsx` (new), `src/canvas/ComponentNode.tsx`
(now a thin wrapper - handles, `NodeResizer`, outline/highlight styling -
around the shared visual), `src/chapters/ReferenceComponentNode.tsx` (new),
`src/chapters/ReferenceGraphCanvas.tsx` (new), `src/chapters/Debrief.tsx`
(swaps `ReadOnlyGraphSummary` for `ReferenceGraphCanvas`),
`src/chapters/ReadOnlyGraphSummary.tsx` (D17's comment update, see below),
plus new test files for all three new components and `Debrief.test.tsx`
updated for the new render.

Three decisions worth recording that the plan didn't spell out:

1. **Not a fork of `ComponentNode`, and not a reuse of it either - a third
   option.** `canvas/store.tsx`'s `useCanvasStore` turned out to be
   context-scoped (`CanvasStoreProvider`), not a global singleton as first
   assumed from reading `ComponentNode.tsx` alone - but `ChapterWorkspace.tsx`
   mounts exactly *one* provider per chapter route, and Debrief is rendered
   inside that same provider as the live editing canvas. Reusing the real
   `ComponentNode` for a reference graph would have subscribed it to the
   *live* graph's `resizeNode`/`highlight` state - harmless today only because
   nothing makes those handles interactive, but a real coupling to a store a
   read-only reference render has no business depending on, and one that
   breaks the moment `Debrief.test.tsx` or a future consumer renders it
   without a `CanvasStoreProvider` in scope. Extracted `ComponentCardVisual.tsx`
   instead - the meta-row/icon/label/name anatomy only, no `Handle`, no
   `NodeResizer`, no store read - so `ComponentNode` (live, store-driven) and
   `ReferenceComponentNode` (read-only, store-free) share one definition of
   what a card looks like without either owning the other's interactive
   chrome. This is D17's "genuinely different renderer for a different job"
   reasoning applied one layer deeper than the plan's own DiagramQuestion/
   Debrief split.
2. **Handle pairs are picked from geometry, not left null.** A `referenceGraph`
   edge (`lib/graph.ts`'s plain `GraphEdge`) carries no `sourceHandle`/
   `targetHandle` - that information only ever exists in the live canvas's
   xyflow edge state, never in the persisted/authored domain graph. Leaving
   both unset would resolve to `handleBounds[0]` (Left/Right) for every edge
   regardless of layout, which reads fine for a left-to-right row but wrong
   for anything with a vertical tier. `ReferenceGraphCanvas.tsx`'s
   `buildNodesAndEdges` (exported for direct unit testing, see below) instead
   compares each edge's two authored node positions and picks
   source-right/target-left when the horizontal separation dominates,
   source-bottom/target-top when the vertical does - the read-only equivalent
   of D7's "auto-pick the shortest clean pair," computed once since positions
   here are static rather than captured from a drag.
3. **jsdom can't render an actual edge `<path>`, so the edge/handle logic is
   tested as a pure function instead of through the DOM.** `@xyflow/react`
   needs its own `ResizeObserver`-driven node measurement to compute handle
   bounds before it will draw an edge; the existing `stubResizeObserver()`
   test helper is a no-op stub (matches Canvas.test.tsx's existing pattern),
   so an edge that depends on measured node dimensions never appears in a
   test's DOM at all - confirmed by two initially-written DOM-querying tests
   that failed with a null element until rewritten against
   `buildNodesAndEdges` directly. No existing test in the codebase asserts on
   `.react-flow__edge-path` for exactly this reason.

**D17's comment update** (`ReadOnlyGraphSummary.tsx`): replaced the old "do
not fork a second copy" instruction (now stale - Debrief no longer uses this
component at all) with an explanation of why `ReferenceGraphCanvas.tsx` is a
second, legitimate renderer rather than a fork of it: `DiagramQuestion.tsx`
keeps `ReadOnlyGraphSummary` untouched because a quiz question's graph *is*
its content (so the sr-only edge-kind captions matter), while a blueprint's
reference graph always sits next to prose (`commentary`) that already
explains the design - which is also why `ReferenceGraphCanvas` doesn't
attempt screen-reader parity for edge kind the way `ReadOnlyGraphSummary`
does; it's a visual supplement to already-complete prose, not the sole
source of the information.

**Also decided, not previously specified:** wheel/scroll interaction. The
reference canvas sits inside a scrollable disclosure panel, so both
`panOnScroll` and `zoomOnScroll` are off (wheel always falls through to page
scroll) - drag-to-pan and a small bottom-right `Controls` (zoom in/out/fit,
`showInteractive={false}` since nothing is lockable) are how a learner
explores a bigger reference graph instead. Not in the original plan text,
which didn't consider that this render lives inside a scrolling container
the way the full-page live canvas doesn't.

### Step 5b - 12 chapters of `referenceGraph`: DONE (2026-09-12)

Full CI green: typecheck clean, lint clean, **2419 passed** (0 skipped, up
from 2418/2), `npm run build` succeeded.

Files: `src/content/chapters/index.ts` only - one `referenceGraph` added to
the single `Blueprint` on each of the 12 chapters D16 names
(`bb-1-2-designing-the-system`, `bb-3-1` through `bb-3-9`, `bb-3-11`,
`bb-3-12`). Every one of these 12 chapters turned out to declare exactly one
`Blueprint`, so this was 12 reference graphs, not more - `Debrief.tsx` shows
every declared blueprint, so a chapter with several would have needed one
each, but none of the 12 did.

Three things worth knowing that weren't spelled out in the Step 5b starting
notes:

1. **Each chapter's own `require` pattern and `starterGraph` told the whole
   story of what to draw.** Six of the twelve (`bb-3-6`, `bb-3-7`, `bb-3-8`,
   `bb-3-9`, `bb-3-11`, `bb-3-12`) turned out to be "the starter graph, plus
   the one edge or config value the chapter is actually about" - their own
   commentary says so directly (e.g. bb-3-6: "Nothing about the topology
   changed - the same load balancer, the same single app-server node, the
   same edges. Only the Instances count moved"). For those, the reference
   graph reuses the starter's exact node positions, just with the missing
   edge added or the gated config value changed. The other six
   (`bb-1-2`, `bb-3-1` through `bb-3-5`) are missing an entire component from
   their starter (a firewall, a DNS+browser pair, a reverse proxy, a second
   app-server instance, an API gateway) - those needed an actual new node
   placed on the grid and wired in.
2. **A shared canonical layout emerged across bb-3-6 through bb-3-12**
   (browser (60,0), dns (320,0), fw (580,0), proxy (60,195), gateway
   (60,390), lb (320,390), app (580,390), db (60,585), nosql (320,585),
   replica (580,585)) - these are the exact coordinates those chapters'
   own `starterGraph`s already use, confirming the curriculum authors had
   already settled on one canonical shape for "the fully-built edge-to-data
   stack" and each later chapter's starter is a superset of the one before
   it. Reusing those exact coordinates for the reference graphs (rather than
   inventing new ones) keeps every chapter in this family visually
   consistent with its own neighbors.
3. **bb-3-12 required removing an edge, not just adding one** - the starter's
   `app -> replica` edge is the chapter's own deliberately-wrong starting
   point (a Replica's input only accepts a replication feed, never a query),
   so the reference graph drops it and adds `db -> replica` (kind
   `replication`) and `replica -> app` (kind `request-flow`) in its place,
   matching the blueprint's `require` pattern and the chapter's own
   commentary exactly.

Node/edge ids follow a `<chapter-id>-ref-<name>` / `<chapter-id>-ref-e<n>`
convention, scoped per chapter and distinct from that chapter's
`starterGraph` ids. `entryPointIds` is set on every reference graph (mirroring
the entry node a learner would naturally start from) even though
`ReferenceGraphCanvas`/`ReferenceComponentNode` confirmed to read neither
field today - `ArchitectureGraph.entryPointIds` isn't optional, and it costs
nothing to keep the data honest in case a future reference-graph feature
(e.g. a Start marker) ever reads it.

### Step 5c - Flow-diagram pass on the reference graphs: DONE (2026-09-12)

Full CI green. The user, looking at the Step 5b result: *"the existing
blueprints are stacked on top of each other which don't look that good... I
want these to look more like AWS architecture diagrams or flow diagrams, the
ones flowing from left to right. Also the start decorator is never used."*

**Scope note, because it is the most likely thing to be misread:** this
changes the **Debrief reference diagram only** - the read-only render behind
the "Debrief: other ways to design this" disclosure, which mounts only after
a Submit pass. The editable `starterGraph` on the Design Editor canvas is
**untouched**: it is hand-authored per D9, at the authored 260x195 pitch,
deliberately incomplete (that incompleteness is the exercise), and Step 4
already relaid it out. Nothing a learner edits moved.

Files: `src/chapters/reference-layout.ts` (new, auto-layout),
`ReferenceStartBadge.tsx` (new), `ReferenceGraphCanvas.tsx`,
`src/content/chapters/index.ts` (one new `referenceGraph`),
`src/content/chapters/authoring-invariants.test.ts` (four new gates),
`src/app/globals.css`, `DESIGN.md`, plus tests.

Five things worth knowing:

1. **The authored `position` fields are now dead data on a
   `referenceGraph`.** `reference-layout.ts` derives the whole layout from
   edges and `entryPointIds`: columns are the longest-path rank from the
   entry points, rows a barycenter pass over already-placed predecessors.
   Step 5b's hand-placed coordinates were what produced the "stacked on top
   of each other" look, and hand-authoring 12 more layouts would have meant
   12 more chances to produce it. `GraphNode.position` is still required by
   the shared `ArchitectureGraph` type, so the fields stay - they just are
   not read.
2. **The long diagonal was a handle-selection bug, not a layout one.** The
   first version picked `source-right`/`target-left` whenever `|dx| >= |dy|`,
   including for an edge travelling *backwards*. A lane-wrap edge therefore
   exited the right side of the last card in a lane, crossed the full width
   of the diagram and re-entered from the far left. Now only an edge that
   actually advances left-to-right gets the horizontal pair; everything else
   leaves the bottom and arrives at the top.
3. **Edges are `smoothstep` with an arrowhead.** Orthogonal connectors are
   what make the render read as an architecture diagram rather than a node
   graph, and they let a wrap edge run cleanly through the lane gap. The
   arrowhead states direction statically; kind stays color + dash per
   `edge-styles.ts`, so the arrow is never the only channel for anything.
4. **Three columns per lane, not four, and its own 200x150 pitch.** This
   panel lives in the 220-480px chapter sidebar (`SidebarShell`), where a
   wide-short diagram loses more to zoom than a square one. The authored
   260x195 pitch is sized for *grabbing* an edge - irrelevant to a render
   nobody can touch. The container also takes the diagram's own aspect ratio
   (clamped 170-380px) instead of a fixed `h-72`, so a 3-node row and an
   8-node three-lane pipeline render at about the same card size. A lane
   advance bug was fixed along the way: it counted a full `PITCH_Y` for a
   single-row lane, adding an empty row of dead space at every boundary.
5. **D16's count was stale: 13 chapters, not 12.** `bb-0-1-welcome` is no
   longer `placeholder: true` (Track B authored it out) and has a real editor
   exercise and a blueprint, so its Debrief mounts - and it was the one
   Debrief-capable blueprint shipping commentary with no diagram. It now has
   a `referenceGraph`. Four new gates in `authoring-invariants.test.ts` stop
   this recurring: every Debrief-capable blueprint has a reference graph,
   every reference graph names an entry point, every entry point and edge
   endpoint is a real node in that graph, and no node is unreachable from an
   entry point.

**Start badge, verified across all 13.** Every reference graph declares
exactly one `entryPointIds` entry, every one names a real node, and a Start
badge renders above it. All 13 were screenshotted at 290px (the real sidebar
width) through the `/dev/reference-layout-lab` harness.

**Still unverified:** the diagrams have not been seen inside a real Debrief,
only in the lab at matched width - that needs a chapter passed via Submit.

### Step 5d - Flow-diagram rules on the live canvas, and all 14 starter graphs: DONE (2026-09-12)

Full CI green. Step 5c fixed the Debrief diagram; the user then pointed at the
**Design Editor canvas** - *"this graph what I'm seeing here is what matters to
be the left to right flow diagram"* - and after two rounds landed on the shape
they wanted: *"you can group similar stuff into vertical top down groups"*,
with a mockup.

**The layout standard, settled after two rejected attempts.** Worth recording
all three, because each was rejected for a concrete reason and the next
attempt is only defensible against the ones before it:

| Attempt | Shape | Why it lost |
|---|---|---|
| Before | Horizontal tier bands, chain wraps to the next band | A right-to-left jump at every tier boundary, drawn as a diagonal across the whole canvas |
| Rejected | One unwrapped left-to-right row | *"the bigger graphs won't fit in 1080p screens properly"* - an 8-stage chapter is 1940px wide, `fitView` 0.5, 5px type |
| **Standard** | **One column per tier, members stacked top down inside it** | 640 x 681 for the same chapter, fits at zoom 1.0, and nothing ever steps left |

**The diagonals were a rendering bug, not a layout one.** Authored edges carry
no `sourceHandle`/`targetHandle` (see `store.tsx`'s `loadGraph`), and xyflow
resolves a null handle id to `handleBounds[0]` - Left/Right, on every edge,
whatever direction it actually travels. So every tier-change edge left its
source's right side and entered its target's left, crossing the canvas. That
one fact explains the whole "stacked / diagonal" complaint, and fixing it in
`Canvas.tsx` fixed all 14 chapters at once with no content edit.

Five app changes:

1. **`src/canvas/edge-routing.ts` (new)** - one definition of which sides an
   edge attaches to, imported by both the live canvas and
   `ReferenceGraphCanvas`. They had already drifted: the reference canvas
   picked from geometry, the live canvas picked nothing. The rule is `dx > 0`
   -> right/left, everything else bottom/top. Deliberately not
   `dx > 0 && |dx| >= |dy|`: the outer branches of a fan-out have a bigger
   vertical offset than horizontal, and the tighter test sent those out of a
   different side of the card than the inner ones.
2. **Handles are recomputed every render, never stored.** Which side an edge
   touches is presentation - nothing in the domain graph or validation engine
   reads it - so edges now re-route live as a learner drags a card.
3. **Orthogonal + arrowed.** `smoothstep` with a kind-coloured `markerEnd`,
   and `connectionLineType` matched so the drag preview does not snap to a
   different shape on release.
4. **Fan-out stubs.** Three edges out of one handle shared a vertical channel
   and read as one thick line sprouting arrowheads. Each branch now gets its
   own stub length, ordered by vertical distance so the furthest runs
   outermost and the channels nest instead of crossing.
5. **`fitGraphIntoView`** replaces the declarative `fitView` prop: a
   `MIN_FIT_ZOOM` floor, and when the floor bites the view anchors to the
   graph's **left** edge instead of centring, so a wide design opens at its
   entry point.

**All 14 starter graphs re-authored**, plus a systemic content bug found on
the way: seven chapters (bb-3-5 through bb-3-12) shipped an "Application" zone
holding only the Reverse Proxy, directly above a second zone also labelled
"Application" - a wasted band and two boxes a learner could not tell apart.
The proxy is an edge component and now sits in the Edge tier. A new gate
(`no chapter gives two starter-decorator zones the same label`) stops it
recurring.

**Invariant gates: one removed, three added.** The 2.5:1 bounding-box aspect
ceiling is gone - it existed to force a pipeline into stacked rows, which is
the thing being fixed. In its place: every request-flow edge advances left to
right, no graph uses more rows than its widest column needs, and no two zones
share a label. `CURRICULUM.md` §11.5/§11.6 rewritten to match, including the
zone formula's new `height = 195 * (rows - 1) + 168` term.

**The reference diagram follows the same shape** - `reference-layout.ts` now
groups four consecutive stages per vertical column instead of wrapping rows.
It has no tier labels to group by, so pipeline proximity stands in for them.

**A verification note that cost real time twice:** a saved graph shadows
`starterGraph`, and the e2e test user has cloud saves for these chapters, so
the chapter route kept rendering the *old* layout after the content changed -
and clearing local IndexedDB does not help, because cloud sync re-pulls it.
Authored layouts have to be verified through a lab route that calls
`loadGraph` directly (`/dev/starter-layout-lab`), never through the chapter
route.

---

### Step 5e - Ports rebuilt, and the layout tightened: DONE (2026-09-12)

Step 5d was rejected on review: *"The bugs in connections still exist. it
takes the wrong edges post connection or visually shows different edge
connections and connects different edges. And the starter graphs don't look
professional."* Both halves were real, and 5d's own diagnosis had been
incomplete.

**The connection bug was structural, not a routing choice.** A card carried
four single-purpose handles (Left/Top receive, Right/Bottom send), and that
shape cannot express half the edges a learner can draw:

| Symptom | Cause |
|---|---|
| An edge appears to join two cards it has nothing to do with | An edge to a card *above* its source had no upward side to leave from. It left the bottom, doubled straight back over itself and arrived at a top handle higher than where it started - one line laid on another. |
| Dragging a wire creates an edge pointing the wrong way | xyflow reads the *grabbed handle's type* to decide which end is the source, so pulling out of a target handle silently reversed the edge. |
| An authored edge renders nothing at all | Handles were conditional on the component declaring inputs/outputs, so an edge into an input-less component resolved to no handle and xyflow dropped it undrawn. |

**The fix: one `source` handle per side, always rendered, explicitly id'd**
(`port-left`/`top`/`right`/`bottom`, `canvas/edge-routing.ts`'s `PORT_IDS`).
Under loose `connectionMode` xyflow looks an edge's target up in
`target.concat(source)`, so a source handle serves as either end - but an
edge's *source* is only ever looked up in `handleBounds.source`, which is why
every side needs one. Direction is now enforced semantically by
`connection-rules.ts` rather than geometrically by which dot happened to
exist, and a drag always means "from the card I grabbed to the card I dropped
on". Explicit ids also retire the `handleBounds[0]`/DOM-order fragility.

Three routing rules follow, shared by both canvases:

- Any real horizontal offset takes the horizontal pair - right-to-left
  forward, **left-to-right backward** (5d sent backward edges out of the
  bottom, which is what produced the doubling-back).
- Column-aligned cards take the vertical pair, either direction.
- A column-aligned run with a third card standing in it leaves and re-enters
  the *same* side (`verticalRunBlocked`), which is how `smoothstep` is told to
  route around. This was drawing 3.12's replication feed clean through the
  NoSQL card.

**`pathOptions.offset` was the wrong lever for fan-out** and 5d used it. It
only lengthens the straight stub before the turn; the turn still happens at
the midpoint, so a fan's vertical runs still sat on top of each other.
`stepPosition` moves the turn itself - `fanOutStepPositions` now staggers it,
nearest branch innermost.

**Every edge kind set `animated: true`.** 5e turned it off everywhere as
decorative motion at rest. **Reverted on the live canvas (2026-09-12, see 5f)
- `animated: true` is back for all four kinds there.** It stays off on the
read-only reference diagram, which is a printed figure.

**Layout.** `PITCH_Y` 195 -> 160 (64px gap, down from 99), `MIN_VERTICAL_GAP`
95 -> 56, and zone padding tightened to `ZONE_PAD_SIDE/TOP/BOTTOM` = 28/44/16
- at the old 48/24 two zones stacked in one column would have overlapped by
8px at the new pitch. The Browser left the Edge group for a **Client** column
of its own (Slate, not Blue): it is the one thing on the board the learner
does not operate, and it drops Edge from four rows to three, which is what
cuts the tier-exit climb from 585px to 320px. Chapters with only two stacked
tiers (3.3, 3.5) now align the next tier's entry with the previous tier's exit
row, so their connectors are straight horizontals with no climb at all.

**`reference-layout.ts` broke columns on a stage count**, which silently
overflowed: four stages is four rows only while every stage holds one node,
and one stage fanning out to three made the same column six rows tall and the
sidebar panel cut the last card off at the frame. It now breaks on accumulated
rows (`MAX_ROWS_PER_COLUMN`).

New gates: `canvas/edge-routing.test.ts` (13 cases, one per failure mode
above, including the upward edge and the blocked vertical run) and a
row-cap case in `reference-layout.test.ts`. `ComponentNode.test.tsx`'s
handle assertions were rewritten - the old ones asserted the id-less
DOM-order convention, so they passed throughout every bug in the table above.

---

### Step 5f - The connect band, and three bugs behind it: DONE (2026-09-12)

Step 5e was rejected too: *"it doesn't connect a valid input with a valid
output and vice versa a lot of the times. it goes ahead to connect something
edges that are valid but not what I wanted."*

**This step was driven by measurement, not by reading the code.** A
`/dev/connection-lab` harness (new, kept) puts a real `Canvas` on screen and
exposes the store on `window.__scConn`; Playwright drivers then perform actual
pointer gestures and read back what landed. That mattered, because the first
three hypotheses were all wrong:

| Hypothesis | Verdict |
|---|---|
| `connectionRadius` 60 catches a neighbour's port | **No.** 53/53 drags landed on the intended card at the authored pitch, and 0 failures across 4 layouts down to a 24px gap - every port, every drop point. |
| Low zoom makes the radius grabbier | **No.** Ports and the radius both live in flow space, so zoom is neutral to *which* handle wins. |
| Loose mode reverses the edge | **No.** Every port is a `source`, so `fromType` is always `source` and the drag direction always survives. |

Landing a wire was never the problem. Three other things were.

**1. You could hardly pick a wire up.** A grid-scan of press-and-drag outcomes
over a whole card (`sim4`, 4px steps, classifying each point as connection /
node-drag / nothing) measured **180 connect points against 630 node-drag
points**: roughly four fifths of the card's surface moved it instead. The
ports are `opacity: 0` at rest, so hitting one meant hovering, finding a 9px
dot and landing within ~14px of its centre. That is the whole of "doesn't
connect a lot of the times".

The 31px disc became **a band running the length of each side** - the card
passes its own size to CSS as `--sc-card-w`/`--sc-card-h`, and each port's
`::after` stretches along its side, reaching ~13px inward and ~13px outward
with a 16px corner inset so a corner belongs to exactly one side. The
perimeter is now continuous: there is no dot to find, only an edge to grab.
Re-measured: **496 connect points, 472 node-drag** - 2.8x, and the interior
still drags. Handle *bounds* are measured from the handle element, never the
pseudo-element, so edges still attach at the side midpoints and nothing about
`edge-routing.ts` changed.

Consequence, taken deliberately: **corners resize, edges connect.**
`NodeResizer`'s side controls sit exactly where the band runs, so they are now
`pointerEvents: none` and transparent. All four corner handles still resize
(verified), and selection was already stated twice over by the card's outline
and glow, so the third indicator was redundant anyway.

**2. An armed click-to-connect was never cancelled.** React Flow arms
`connectionClickStartHandle` on a port click and has no public way to clear
it. Measured: **all four** of clicking empty canvas, pressing Escape, dragging
a card and clicking a card body left it armed - so a stray port click sat
there indefinitely and the next port click anywhere on the board produced an
edge between two cards the learner never meant to join. That is "connects
edges that are valid but not what I wanted", and the band made it far easier
to arm by accident.

Cancelled now by **one rule: the next `pointerdown` that isn't on a port**,
on the capture phase, attached only while armed. The first attempt hung it off
`onPaneClick`/`onNodeClick`/`onNodeDragStart` and *missed* - `onPaneClick` does
not fire while the pane is in selection mode, which is most of the time. The
arm also has visible state at last: it reveals every legal port, reusing the
`sc-canvas-connecting` class a drag already sets.

**3. Two edges drawn as one line, and edges drawn through cards.** A second
driver (`sim2`) samples every rendered SVG path and tests it against the card
boxes. Two failures, both real:

- **A -> B and B -> A were 101% coincident.** The two halves resolve to the
  same two ports in reverse order, so the learner saw one wire where they made
  two, and only the top one could be clicked, inspected or deleted.
  `reciprocalEdgeIds` now flags both halves and `pickEdgeHandles` detours
  whichever travels backwards - over the top for a row, out to the left for a
  column.
- **A horizontal edge ran straight through the card between its endpoints.**
  5e fixed the vertical case (`verticalRunBlocked`) and never mirrored it.
  `horizontalRunBlocked` is that mirror; a blocked row run leaves and re-enters
  the bottom, routing under. The detour and the route-around deliberately use
  opposite sides, so fixing one can never recreate the other.

Both canvases now route through one `routeEdge()` - it picks the axis, asks
the right blocking question and returns the pair. The live canvas and the
reference diagram had already drifted apart once; there is nothing left to
drift.

**4. Reversing an edge, where you actually look.** The user asked whether
making left/top inputs and right/bottom outputs would fix all this. It would
not - it is exactly the shape 5e removed, and it brings back three documented
bugs (an upward edge has no side to leave from and doubles back over itself;
xyflow reads the grabbed handle's *type* to decide which end is the source, so
pulling out of an input silently reverses the edge; a side-conditional handle
drops an authored edge undrawn). None of the three defects above are caused by
ports being direction-agnostic either.

The real grain of truth in the question is that direction is implicit - "from
the card you grabbed" - and easy to get backwards. `reverseEdge` already
existed but only on the edge's right-click menu, which is not where anyone
looks after clicking an edge and finding `EdgeInspector` open. It is now a
button on the inspector's `source -> target` line. Note that the *rendering*
already obeys the user's intuition: a forward edge leaves the right and enters
the left, a downward one leaves the bottom and enters the top. Four-way ports
only ever governed where a wire can be *grabbed*, never where it lands.

Files: `canvas/edge-routing.ts` (`routeEdge`, `horizontalRunBlocked`,
`reciprocalEdgeIds`, `RouteOptions`), `canvas/Canvas.tsx`,
`canvas/ComponentNode.tsx`, `canvas/EdgeInspector.tsx`, `app/globals.css`,
`chapters/ReferenceGraphCanvas.tsx`, `app/(protected)/dev/connection-lab/`
(new), plus `edge-routing.test.ts` (+9), `ReferenceGraphCanvas.test.tsx`
(one test re-pinned - it was asserting the through-the-card route) and two new
`e2e/canvas-interactions.spec.ts` cases.

**One thing left open, deliberately:** a click-to-connect completes only on a
port, so clicking the target card's *interior* cancels rather than connects.
The drag gesture does treat the whole card as a drop target (100% across every
layout tested), and widening the click's completion surface right after fixing
an accidental-edge bug is the wrong direction. Ports complete, everything else
cancels, is a rule worth keeping.

**Note for review:** `/dev/connection-lab` ships a `window.__scConn` handle
that can mutate the canvas store. It is behind auth and under `/dev/` with the
four existing lab routes, and it is what makes this class of bug reproducible
rather than argued about - but it is more invasive than the other labs, so
delete it if you would rather not carry it.

---

## Step 1 - The component card

`src/canvas/ComponentNode.tsx`, `DESIGN.md` Node Card section.

**Anatomy to build** (D1/D2/D4), roughly top to bottom in a 140 x 100 box:

```
┌────────────────┐
│ ┌──┐           │
│ │▢ │ NET-LB    │   bordered icon tile + category short code
│ └──┘           │
│ Load Balancer  │   component label, wraps to 2 lines
│ lb-edge-1      │   instance name, mono, only when set
└────────────────┘
```

Work items:

1. New short-code table. Six categories need uppercase codes
   (`src/canvas/category-colors.ts` is where `categoryLabel`/`categoryOrder`
   already live). Mirrors `modeShortCode` in `src/lib/modes.ts`.
2. Icon tile becomes bordered/wireframe rather than a 20%-tint filled badge,
   per the ModeCard language.
3. Config-state signal (D4). **This reverses a prior revert** - a
   Default/Configured badge was tried in Phase 3 and pulled in favour of the
   description (`ComponentNode.tsx` header comment). That trade no longer
   exists, because the description is gone. Note the reversal in `DESIGN.md`
   so it does not read as an unexplained flip-flop.
4. Label typography must survive the longest real component name at 140px.
   Check the registry's worst cases before fixing the width.
5. `MIN_WIDTH`/`MIN_HEIGHT` resize floors re-derived from the new default.
6. Two-line label kills the `ResizeObserver` description-clamp machinery
   (`ComponentNode.tsx:60-85`). That whole block and its
   `isManuallyResized` branch can go, which is a real simplification.

**D11 - resizing stays.** `NodeResizer` is kept. Two consequences:

- `MIN_WIDTH`/`MIN_HEIGHT` re-derive from 140x100, not 200x65. The floor
  should be the point where the label still fits on two lines.
- `data.width`/`data.height` keep their current semantics, so the Step 4
  migration (D15) does not have to touch them. A node the learner already
  resized keeps its explicit size; only never-resized nodes (`undefined`)
  pick up the new 140x100 default.

Item 6 above still holds: the description is gone regardless, so the
`ResizeObserver` line-clamp block goes with it. Resizing a card now changes
its box, not how much text it reveals.

---

## Step 2 - Edge connection ergonomics

`src/canvas/ComponentNode.tsx`, `src/canvas/Canvas.tsx`, `globals.css`.

1. **Whole card as drop target** (D6). A target `Handle` sized to the full card
   with a transparent background, so a release anywhere on the card connects.
2. **Four handle sides** (D7). Right + bottom as sources, left + top as targets.
   Needs a rule for which pair an edge picks - shortest clean route, computed
   from relative node positions. This is what makes tiered rows read as a
   diagram instead of edges looping back across a whole row.
3. **Hover port affordances** (D6). Invisible at rest, 16-20px visible ports on
   card hover, with a larger invisible hit area. First real
   `.react-flow__handle` styling in the codebase.
4. **`connectionRadius`** raised well above the stock 20px.
5. **Click-to-connect** (D6). Click source, click target, no drag. This is also
   the first keyboard-reachable path to edge creation - today there is none.
   Needs an armed-state cursor and an Escape to cancel, and should reuse the
   click-to-place pattern `ComponentPicker` already established.

**D12 - edge kind is unchanged.** Click-to-connect creates the edge and the
kind is set afterward in `EdgeInspector`, identical to drag-connect today. No
kind selection when arming the mode. This keeps one creation path and one
place where kind is decided.

**D13 - merge the start handle rather than stacking (Claude's call).** Today
`ComponentNode.tsx:126` renders an unconditional, `opacity: 0`,
`isConnectable={false}` target Handle at `Position.Top` with id
`"start-target"`, referenced by `Canvas.tsx:593` so a Start marker can point
at any component including ones with no real inputs (e.g. Client). D7 wants a
real top target handle in the same place.

Two handles at the same position would leave React Flow's connection
resolution ambiguous, so: **keep exactly one Handle at Top, keep its id
`"start-target"`, and make it conditionally connectable.**

- Id stays `"start-target"`, so `Canvas.tsx:593` and `StartNode.tsx:157`
  (`start-source`) need no change at all.
- It stays **unconditionally rendered** - that is the property the Start
  marker depends on, and dropping it would break pointing at input-less
  components.
- `isConnectable` becomes `definition.inputs.length > 0`, mirroring the
  existing Left target handle's conditional. A Client still anchors a Start
  marker but still cannot be connected into.
- Visibility follows the D6 hover-port treatment rather than staying
  `opacity: 0`, but only where it is connectable - an unconnectable handle
  must never render a port affordance that does nothing.

---

## Step 3 - The inspector

`src/canvas/NodeConfigPopover.tsx` (146 lines), `src/canvas/ConfigForm.tsx`.

Stays an anchored popover (D5), gets everything the card gave up plus more:
component identity header (icon tile + short code + label), the summary/
description the card no longer shows, the full config form, the node's
connection list, and its validation state. Currently 288px wide with a bare
uppercase-label header - that width almost certainly grows.

**D14 - `EdgeInspector` is in scope.** It gets the same redesign pass. At 59
lines it is the thinnest surface in the editor, and D6/D7 make edge creation
dramatically easier, so it goes from rarely-opened to a main interaction. It
is also where edge *kind* is chosen (D12), which is now the only step between
creating an edge and having a correct one - the two inspectors should read as
one system, not two generations of UI.

---

## Step 4 - Starter graph re-authoring

Hand-authored, per chapter (D9). 14 chapters.

1. Re-derive `CURRICULUM.md` §11.6's zone geometry formula for the new pitch.
   Today: `(x0 - 28, y0 - 48)`, `width = 320 * (cols - 1) + 256`, `height = 137`.
   All three constants are card- and pitch-derived and all three change.
2. Re-position every node in all 14 `starterGraph`s to the 260 x 195 pitch.
3. Re-rect every `starterDecorator` zone to the new formula.
4. Revisit the 3-column cap. At 140px wide, 4 columns fit at zoom 1.0, which
   may change the right tiering for the bigger chapters (3.6 through 3.12).
5. Update the `authoring-invariants.test.ts` gates. The 120/95 minimums stay
   (D8) but they are currently written against a 200x65 card - the gap
   computation subtracts the card size, so the constant it subtracts changes.
6. Update `CURRICULUM.md` §11.5 and `DESIGN.md`'s Node Card section.

**D15 - one-time migration.** Saved graphs are not left to drift.

Positions persist per learner (`db.saves`, cloud-synced since 6.1.0) and a save
shadows `starterGraph` on load, so without this every learner with a save gets
new-size cards stranded in old-pitch spacing.

The migration rescales authored-pitch positions from 320x160 to 260x195. Design
notes for whoever builds it:

- It is a **coordinate rescale, not a re-layout.** Multiply by 260/320 = 0.8125
  horizontally and 195/160 = 1.21875 vertically, relative to the graph's own
  bounding-box origin. Nodes the learner deliberately placed off-grid stay
  proportionally where they put them.
- **Decorator zones rescale too**, or tier boxes stop containing their tiers.
  Their new geometry is the §11.6 formula in Derived constants.
- `data.width`/`data.height` are **not** touched (see D11) - an explicitly
  resized node keeps the size the learner chose.
- It must be **idempotent and versioned**. A save needs a marker recording that
  it has been migrated, or a re-run squashes graphs a second time. This is the
  part most likely to go wrong.
- Cloud-synced saves mean the same save can arrive on a second device already
  migrated - the version marker has to travel with the save, not live in
  local-only state.

**D19 - the migration mechanism (locked).**

Correcting this doc's earlier note: the save/sync work is **already merged**.
`fix/db-fixes` is gone and commit `3b36cbb` ("Release 7.1.0-alpha ... save/sync
optimization") is in `develop`. `src/persistence/save-revisions.ts` exists with
`localRevision`/`cloudRevision`/`graphHash` today.

**Mechanism: the Dexie version chain.** `src/persistence/db.ts` is at
`this.version(14)` and already has a well-worn `.upgrade(async (trans) => ...)`
pattern (see v10 and v13). The position rescale becomes `this.version(15)`
with an upgrade hook. Dexie guarantees it runs exactly once per browser, so
per-browser idempotency is the framework's job, not a hand-rolled flag.

**But the Dexie version alone is not sufficient**, because saves are
cloud-synced. The hazard:

1. Device A updates, runs v15, rescales its saves, syncs them up.
2. Device B is still on the old build. It pulls A's **already-rescaled** save.
3. Device B updates and runs *its* v15 upgrade against data that was already
   migrated, and squashes it a second time.

The Dexie version tracks *the browser's schema*, not *whether this row's
coordinates have been converted* - and those are different facts the moment a
row can arrive from somewhere else.

**So: a per-save marker is required in addition to the version bump.** Add a
`pitchVersion` (or equivalent) field to the save row, written by the migration
and carried through cloud sync. The v15 upgrade converts only rows missing it,
and a row pulled from the cloud already bearing it is left alone.

Two details for whoever builds it:

- The upgrade rewrites local rows, so it must mark them dirty / bump
  `localRevision`, or the rescale never propagates up.
- `pitchVersion` has to travel in the synced payload, not sit in local-only
  state, or step 3 above still fires.

---

## Step 5 - Blueprints

Two independent jobs (D10).

**5a - Canvas renderer.** Replace `ReadOnlyGraphSummary`'s textual list with a
read-only React Flow render using the new cards. Note this reverses a
deliberate call documented in that file ("reusing React Flow here would drag in
a heavy dependency tree for what's always a read-only aside"). It also affects
`src/chapters/quiz/DiagramQuestion.tsx`, which shares the renderer - diagram
quiz questions would start rendering as real canvases too.

**5b - Author `referenceGraph`s.** 25 chapters declare `blueprints`; none ship a
`referenceGraph`. Once 5a lands, positions matter, so each one is a real
layout job at the new pitch, not just a node/edge list.

**D16 - the set is 12 chapters, not 25.** "All real blueprints" resolves to
this factually, not by preference. `Debrief.tsx`'s own contract: *"Only ever
mounted once a chapter has passed."* A chapter with no canvas exercise has
nothing to pass, so its Debrief never mounts and a `referenceGraph` on it is
content that can never render.

Of the 25 chapters declaring `blueprints`:

| Excluded | Count | Why |
|---|---|---|
| `placeholder: true` | 2 | `bb-0-1-welcome`, `rwe-dummy-1` - throwaway content |
| `hasEditorExercise: false` | 11 | Debrief never mounts |
| **Authored** | **12** | |

The 12: `bb-1-2-designing-the-system`, `bb-3-1-networking-fundamentals`,
`bb-3-2-dns`, `bb-3-3-reverse-proxy`, `bb-3-4-load-balancer`,
`bb-3-5-api-gateway`, `bb-3-6-stateless-services`,
`bb-3-7-sessions-and-state-management`, `bb-3-8-horizontal-scaling`,
`bb-3-9-service-discovery`, `bb-3-11-sql-vs-nosql`, `bb-3-12-replication`.

Those 11 no-exercise chapters keep their `blueprints` - the patterns still feed
validation and Deep Check. Only the *reference graph* is skipped.

**D17 - `DiagramQuestion` is out of scope.** Quiz diagrams keep the textual
renderer. This has a structural consequence for 5a that must not be missed:

`ReadOnlyGraphSummary.tsx` carries an explicit in-code instruction - *"Shared by
Debrief.tsx and chapters/quiz/DiagramQuestion.tsx - do not fork a second copy."*
Leaving `DiagramQuestion` untouched while giving Debrief a canvas render means
that file now has two consumers wanting two different things.

**Do not fork it.** Build a *new, separate* `ReferenceGraphCanvas` component for
Debrief and leave `ReadOnlyGraphSummary` entirely alone for `DiagramQuestion`.
That respects the instruction rather than violating it: a fork is a second copy
of the same renderer drifting apart, whereas this is a genuinely different
renderer for a different job (a rendered architecture vs. an accessible textual
shape summary a quiz question can be asked about). Update that comment to say
so, so the next reader understands why two renderers legitimately coexist.

---

## Sequencing and release shape

Steps 1-3 are app engineering and interlock (the card cannot lose its
description until the inspector can show it). Steps 4-5 are content and depend
on Step 1's final dimensions being frozen.

**D18 - the release is 7.2.0-alpha.** Current `VERSION` is `7.1.0-alpha`.

**Branching (D20).** All of this work lands on **`feat/design-editor-revamp`**.
Claude does not cut `type/*` branches, does not touch
`release/v7.2.0-design-editor-polish` or `staging/v7.2.0` (both already exist
and are currently identical to `develop`), and does not merge or push anything.
Promoting this branch onward is the user's, manually.

Steps stay separately *committed* even though they share a branch, so each is
still reviewable on its own.

Step order, and why it is this order:

| # | Commit | Depends on | State |
|---|---|---|---|
| 1 | Component card | nothing - freezes the real dimensions everything else uses | done |
| 1b | Card revision after review | user feedback on Step 1 | done |
| 1c | Icon plate enlarged after a second review | user feedback on Step 1b | done |
| 2 | Edge connections | Step 1 (handles are drawn on the card) | done |
| 3 | Inspector redesign (`NodeConfigPopover` + `EdgeInspector`) | Step 1 (it receives what the card gave up) | done |
| 4 | Starter graph relayout + the D19 migration | Step 1's frozen dimensions | **next** |
| 5a | `ReferenceGraphCanvas` | Steps 1-2 (it renders the new cards) | done |
| 5b | 12 chapters of `referenceGraph`s | 5a | not started |

Steps 1-3 interlock and come before 4, since the card cannot lose its
description until the inspector can show it.

`src/content/release-notes.ts` needs one entry written to the
`RELEASE_NOTES.md` contract - its mechanical rules are enforced by
`release-notes.test.ts`, so an off-pattern entry fails CI.

**Scope check before committing to one release.** 7.2.0 as scoped here is six
branches, a data migration, 12 chapters of content authoring, and a rewrite of
`ComponentNode.test.tsx` / `Canvas.test.tsx` (652 lines) / both inspector test
files, plus 6 of 8 e2e specs touch the canvas. If Steps 1-4 come in large, split
Step 5 out to **7.3.0-alpha** rather than letting one release sprawl - 5a/5b are
cleanly separable and nothing in Steps 1-4 depends on them.

---

## Test and doc surface this touches

- `src/canvas/ComponentNode.test.tsx` - card anatomy assertions, will need a rewrite
- `src/canvas/Canvas.test.tsx` - connection behaviour
- `src/canvas/NodeConfigPopover.test.tsx` - inspector
- `src/canvas/EdgeInspector.test.tsx`
- `src/content/chapters/authoring-invariants.test.ts` - spacing + aspect gates
- `src/chapters/ReadOnlyGraphSummary.test.tsx` + `Debrief.test.tsx` (Step 5)
- `src/canvas/ComponentCardVisual.tsx`, `src/chapters/ReferenceComponentNode.test.tsx`,
  `src/chapters/ReferenceGraphCanvas.test.tsx` (new, Step 5a)
- e2e specs touching the canvas
- `DESIGN.md` - Node Card, and a new Inspector/connection entry
- `.claude/docs/CURRICULUM.md` §11.5, §11.6
- `.claude/docs/pending-chapters.md` - one dated cross-cutting entry for Step 4

---

## Step 6 - Verification audit: DONE (2026-09-15)

The branch was committed (`a797b91`) and pushed. Full pipeline clean:
typecheck, lint, **2461 unit tests / 248 files**, build (22 routes). Full
Playwright suite **22 passed, 1 skipped** - the skip is
`global.setup.ts`'s CI-only route-warming step, not a disabled test.

Two test files close the gaps the earlier steps left:

**`src/canvas/card-geometry.test.ts`** (8 tests). The constants'
*relationships*, which nothing checked. `authoring-invariants.test.ts`
measures authored content **against** these numbers; it cannot notice the
numbers drifting out of agreement with each other. The failure it exists to
catch is a future card resize: pushing `CARD_WIDTH` back toward the old 200
silently degrades D6's whole-card drop target, and nothing renders
differently, so every other test stays green.

Its coverage test samples the card surface on a 2px grid rather than using a
closed form. The first draft asserted `CONNECTION_RADIUS >= min(w, h) / 2`
on the reasoning that the worst-covered point is the centre - **that is
false for a card much wider than it is tall**, and a mutation to
`CARD_WIDTH = 400` passed it. Sampling catches the same mutation at
(94, 0), 105.5px from any handle. Don't reintroduce the shortcut.

**`e2e/design-editor-geometry.spec.ts`** (3 tests). Only claims jsdom
structurally cannot settle, per playwright.config.ts's bar:

| Test | Why it can only run in a browser |
|---|---|
| no overlapping cards, all 14 starter graphs | jsdom gives every node a zero-sized rect, so the unit gates check authored *coordinates* and assume the renderer honours them |
| every authored edge draws a real path | xyflow measures nodes through a ResizeObserver jsdom never runs, so an unmeasured node draws no path at all |
| the 13 Debrief reference diagrams draw, and fit their column | same, and this was **explicitly unverified** - see the old note 2 below |
| ports hidden at rest, revealed on hover | CSS `:hover` and computed opacity |
| a drop on the card's dead centre still lands | real pointer hit-testing against `CONNECTION_RADIUS` |

The first three rows are **one test**, not three. They started as three, each
loading `/dev/starter-layout-lab` and looping all 14 chapters to check one
thing; they are now a single pass checking all three. That is why:

> Adding the 5-test version to the front of the suite made
> `multi-device-sync.spec.ts` fail intermittently at the tail of it - a
> different test each run. It is **not** state interference (running the new
> spec directly before it is clean, twice), it is cumulative load against a
> 20s cross-device poll budget. Full evidence table in
> `pending-e2e-quarantine.md`. Consolidating cut the cost; the underlying
> fragility in that spec is untouched and can resurface.

The lab reads authored content directly (a learner's save cannot shadow it)
and mounts no `useAutosave` - checked, and it matters, because the suite
shares one Clerk account at `workers: 1`.

**The loop guards are deliberate.** Every assertion in that merged test is
the body of a loop or an `if`, which is the exact shape of vacuous test
`pending-e2e-quarantine.md` found ~106 of - a loop over an empty list passes
having asserted nothing. So the counts are pinned
(`AUTHORED_STARTER_CHAPTERS = 14`, `AUTHORED_REFERENCE_GRAPHS = 13`, both
measured off the registry) and the inner bodies count their own iterations.
Update those constants when a chapter gains or loses a graph; do not relax
them to `> 0`.

Both files were mutation-tested, not just observed green: `CARD_WIDTH = 400`
makes the unit file fail 3 tests and the overlap assertion name the
colliding pair (`bb-0-1-welcome`: "NET Client" / "COMP Application
Server"). Re-verified after the merge, then reverted.

**Still not done, and deliberately not mine (D20):** `VERSION` and
`package.json` are still `7.1.0-alpha`, and there is no `7.2.0-alpha`
release-notes entry. Prior releases land both as their own `chore(release):`
commits at release-branch level (`a8ab69b`, `1a85f8b`), not on a feature
branch.

---

## Resume here - this doc's work is complete

**Branch:** `feat/design-editor-revamp`. **Nothing is committed, nothing is
pushed.** All of Steps 1-5b are sitting uncommitted in the working tree,
ready for the user's review and their own commit/push/merge (D20 -
branching and merging are the user's job, not Claude's). This was the last
open item in this doc; there is nothing left to resume.

Last verified state (2026-09-12, after Step 5b): `npm run typecheck` clean,
`npm run lint` clean, `npm test` **2419 passed, 0 skipped** (246 test
files), `npm run build` succeeded (22 routes, no errors).

### Two things that must not be forgotten

1. Both previously-skipped invariant gates in
   `src/content/chapters/authoring-invariants.test.ts` - "no starter graph
   packs two nodes closer than the minimum gap" and "no 4+ node starter graph
   exceeds a 2.5:1 bounding-box aspect ratio" - are **re-enabled and
   passing**. If a future chapter edit breaks either, that is a real
   authoring regression, not a stale constant - do not skip them again.
2. ~~Step 5b was verified only through the automated suite...~~
   **Closed by Step 6.** The reference diagrams, the hover-reveal states and
   the drop radius now all have real-browser coverage in
   `e2e/design-editor-geometry.spec.ts`. What that spec does *not* judge is
   whether the diagrams look *good* - it asserts they draw, don't overlap
   and fit their column, not that they read well. A human look at the 13
   diagrams is still worth it before merge, but it is now a design review,
   not a correctness gap.

---

### Step 5f - Live-canvas edges back to curved + animated: DONE (2026-09-12)

User review of 5e: *"Not satisfied with the 90deg edges can we make them as
they were before? And why are they not in the dotted animation?"* Both are
reverted, on the **editable canvas only**:

- `Canvas.tsx` no longer sets `type: "smoothstep"`, so edges fall back to
  xyflow's default bezier, and `connectionLineType` is `Bezier` so the drag
  preview matches. `pathOptions` (borderRadius/offset/stepPosition) and the
  `fanOutStepPositions` call went with it - none of them apply to a bezier
  path, and a bezier fan already spreads because each curve bends toward its
  own target.
- `store.tsx`'s `edgeStyle` is back to `animated: true` for all four kinds
  (the DESIGN.md `dashdraw` rule). 5e's read of CLAUDE.md ("motion
  communicates state only") was wrong here: on an *editable* board the motion
  says the wire is a live connection, which is state, and it was the
  established look the user had signed off on.

**What survives from 5e:** all of `edge-routing.ts` - `routeEdge` still picks
which side each edge attaches to from live geometry, including the
route-around and reciprocal-detour rules, which read fine as bezier arcs. The
four-port model, loose `connectionMode`, `connection-rules.ts` and the
click-to-connect cancel are untouched.

**Deliberately not changed:** `ReferenceGraphCanvas` (the Debrief reference
diagram) keeps `smoothstep` + `animated: false`. It is a printed figure, not
a board, and orthogonal connectors are the convention there.
`fanOutStepPositions`/`EDGE_STUB`/`EDGE_CORNER_RADIUS` are still live for it.
