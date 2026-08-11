# Release 5.1.0-alpha - Diagram Topology Update: Implementation POA

Status: **scoped and specced, ready to implement.** Compiled 2026-08-11 from a
live scoping conversation (decision record below) on top of the 5.0.0-alpha
walkthrough renderer (`src/chapters/walkthrough/`, branch
`feature/walkthrough-renderer`, awaiting merge). This doc is the working
implementation plan for the diagram authoring pipeline - update it in place as
items land. Branching strategy is handled by the user, not this doc.

---

## Scoped items (tracking checklist)

Phases are ordered by dependency. Within a phase, items are ordered by
implementation sequence. Check items off as they land.

### Phase 0 - Prep and cleanup
- [ ] **P0.1** Extract `renderMdx` test helper into `src/lib/mdx/mdx-test-utils.ts`
- [ ] **P0.2** Split walkthrough types: authoring input vs resolved internal shape

### Phase 1 - Normalization core (the pipeline)
- [ ] **P1.1** `layout.ts` - auto-layout from the request-flow DAG
- [ ] **P1.2** `normalize.ts` - shorthand expansion, validation issues, viewBox derivation
- [ ] **P1.3** Wire `Walkthrough.tsx` through `normalizeWalkthrough` (useMemo) + dev-only issue banner
- [ ] **P1.4** Unit tests: `layout.test.ts`, `normalize.test.ts`

### Phase 2 - Repo-wide validation harness
- [ ] **P2.1** `walkthrough-invariants.test.ts` - compile every MDX chapter, capture props, assert zero issues

### Phase 3 - Pilot migration and editorial rule
- [ ] **P3.1** Migrate `bb-3-4-load-balancer.mdx` to auto-layout + `focus` shorthand
- [ ] **P3.2** Remove the duplicate mermaid topology from 3.4; add the one-diagram-per-topology rule to CURRICULUM.md (own commit)

### Phase 4 - Authoring lab
- [ ] **P4.1** `/dev/walkthrough-lab` page with fixtures, JSON editor, issue panel, layout debug overlay
- [ ] **P4.2** Lab tests

### Phase 5 - Deferred (do NOT build without an explicit trigger)
- [ ] **P5.1** Topology presets - only after ~10 real diagrams exist and boilerplate is still painful
- [ ] **P5.2** Canvas-to-walkthrough export - only if a Tier 4 RWE diagram defeats auto-layout

---

## Decision record (locked 2026-08-11, do not relitigate casually)

1. **Definitions stay inline in MDX**, next to the prose. Rejected: typed TS
   modules referenced by id (breaks prose co-location; the harness covers the
   real failure modes, including ones types cannot express - overlap, caption
   length, highlight-id resolution). This is the one decision worth revisiting
   if the harness proves too loose; it gets more expensive to reverse as
   diagrams accumulate.
2. **Positions are auto-laid-out** (layered left-to-right from the request-flow
   DAG), with `column` hints and explicit `position` overrides. Rejected for
   now: canvas-authored export (most work, may be unnecessary; see P5.2).

### Why this release exists

~160 diagrams are coming (~40 across BB Groups A-G at 1-2 per component
chapter, ~110 across 32 RWE projects at 3-4 each per CURRICULUM.md §15.1's
Phase A / Phase B / >=2 debrief references). The renderer is fine; the
authoring format fails silently. MDX lesson bodies are strings in
`public/content/chapters/` compiled at runtime by `/api/lessons/[chapterId]` -
`npm run typecheck` never sees a walkthrough prop. Current silent failures,
each traced through real code:

| Mistake | Mechanism | Result |
|---|---|---|
| Typo in `componentId` | `getComponent` returns undefined, `WalkthroughNodeCard.tsx:51` returns null | node vanishes |
| Typo in `highlightNodeIds` | nothing matches but `hasHighlight` is true | everything dims, nothing highlights |
| Typo in `highlightEdgeIds` | no edge matches | no highlight, no packet |
| Edge endpoint not declared | `computeEdgeGeometry` skips it, `pathById.get` returns undefined | edge vanishes |
| `variants` key not a declared algorithm id | variant never selected | variant dead content |

Every one of these must become either a red test (P2.1) or a visible dev
banner (P1.3), or both.

---

## Current file map (what exists, post-5.0.0)

```
src/chapters/walkthrough/
  Walkthrough.tsx              shell: fixed-height bands, keyboard, fullscreen wiring
  WalkthroughControls.tsx      transport bar (play/pause, scrubber, speed, fullscreen)
  WalkthroughEdges.tsx         SVG edges + arrowheads + packet mount
  WalkthroughPacket.tsx        rAF-driven packet (SMIL was broken, do not reintroduce)
  WalkthroughNodeCard.tsx      node card, %-sized against viewBox
  WalkthroughAlgorithmSelect.tsx  native <select> dropdown
  geometry.ts                  NODE_WIDTH/NODE_HEIGHT, computeEdgeGeometry, parseCubic, pointOnCubic
  hooks.ts                     useReducedMotion, useFullscreen (useSyncExternalStore based)
  player.ts                    useWalkthroughPlayer, SPEEDS, STEP_HOLD_MS, PACKET_TRAVEL_MS
  types.ts                     WalkthroughNode/Edge/Step/Algorithm/Props
  Walkthrough.test.tsx         10 tests
  geometry.test.ts             5 tests

src/lib/mdx/compile-lesson-mdx.ts        compileLessonMdx(source) -> compiled JS string
src/lib/mdx/compile-lesson-mdx.test.ts   has the local renderMdx helper (P0.1 extracts it)
src/canvas/docs-panel/markdown/mdx-components.tsx  maps { Walkthrough } into MDX scope
src/content/chapters/authoring-invariants.test.ts  the established home for mechanical authoring rules
src/content/components/registry.ts       componentRegistry (27 entries), getComponent(id)
public/content/chapters/bb-3-4-load-balancer.mdx   the only walkthrough instance today
src/app/dev/diagram-question-lab/        the dev-lab pattern to copy for P4.1
```

Key invariants already in the code that the pipeline must respect:

- `request-flow` edges are acyclic by product invariant (`src/lib/graph.ts`).
  Auto-layout may assume a DAG; it must still not crash on a cycle (see P1.1).
- Node positions are **centers**, in viewBox units. Cards are
  `NODE_WIDTH x NODE_HEIGHT` (148 x 46) in that same space (`geometry.ts`).
- Every band of `Walkthrough.tsx` is fixed-height by design (header h-9,
  diagram aspect-ratio, caption strip h-20 line-clamp-3, transport h-11).
  Nothing in this release may make a band's height content-dependent.
- The diagram SVG is `aria-hidden`; the caption is the only accessible channel.
- Components are never forked per chapter; `custom`-kind nodes exist for
  illustration-only concepts (unused so far).

---

## Phase 0 - Prep and cleanup

### P0.1 Extract `renderMdx` into `src/lib/mdx/mdx-test-utils.ts`

`compile-lesson-mdx.test.ts` lines 10-14 define the exact
compile-run-renderToStaticMarkup helper P2.1 needs. Move it verbatim:

```ts
// src/lib/mdx/mdx-test-utils.ts
import { run } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import type { MDXComponents } from "mdx/types";
import { compileLessonMdx } from "./compile-lesson-mdx";

/** Compile + run + render a lesson MDX source, as MdxContent.tsx would. */
export async function renderMdx(source: string, components?: MDXComponents): Promise<string> {
  const compiled = await compileLessonMdx(source);
  const mod = await run(compiled, runtime as Parameters<typeof run>[1]);
  return renderToStaticMarkup(createElement(mod.default, components ? { components } : undefined));
}
```

Update `compile-lesson-mdx.test.ts` to import it. No behavior change; both the
existing tests and P2.1 consume the same helper. It is a test-only module -
name and placement make that clear; do not import it from app code.

### P0.2 Split authoring input types from resolved internal types

In `types.ts`, today `WalkthroughProps` is both what authors write and what
components consume. After this release they differ (authors may omit
`position` and `viewBox*`; steps may use `focus`). Restructure:

- `WalkthroughProps` stays the **authoring** type (it is what MDX passes):
  - `WalkthroughNode.position` becomes optional; add optional `column?: number`
  - `viewBoxWidth` / `viewBoxHeight` become optional
  - `WalkthroughStep` gains `focus?: string | string[]` (edge ids);
    `highlightNodeIds` / `highlightEdgeIds` become optional
  - `WalkthroughStepVariant` gains the same `focus` and optionality
- New `ResolvedWalkthrough` type (lives in `normalize.ts`, not `types.ts`):
  every field required, positions concrete, viewBox concrete, steps fully
  expanded. `WalkthroughEdges`, `WalkthroughNodeCard`, and the internals of
  `Walkthrough.tsx` consume resolved shapes only.

Keep the doc comments on `types.ts` but trim to match: the coordinate-space
comment moves to "when `position` is given, it is a center in viewBox units;
omit it to auto-layout".

---

## Phase 1 - Normalization core

All new modules are pure functions in `src/chapters/walkthrough/`. No React,
no DOM. This is what makes P2.1 cheap and the lab (P4.1) trivial.

### P1.1 `layout.ts` - auto-layout

```ts
export type LayoutInput = {
  nodes: WalkthroughNode[];   // position/column optional per P0.2
  edges: WalkthroughEdge[];
};
export type LayoutResult = {
  positions: Map<string, XY>;      // center per node id, viewBox units
  viewBoxWidth: number;
  viewBoxHeight: number;
};
export function computeLayout(input: LayoutInput): LayoutResult;
```

Algorithm (layered left-to-right):

1. **Column assignment.** Build adjacency over `request-flow` edges only.
   `column(n)` = longest path length from any request-flow source to `n`
   (memoized DFS). Precedence per node: explicit `column` hint wins; else
   longest-path if the node touches any request-flow edge; else the column of
   its first neighbor via any edge kind (so a control-only or
   replication-only node sits beside what it talks to); else 0.
   Cycle guard: track the DFS stack; on revisit, stop deepening and keep the
   value found so far (the product invariant says this cannot happen, but a
   malformed authored diagram must produce a layout plus a `cycle` issue from
   P1.2, never a hang or throw).
2. **Row assignment.** Within a column, nodes keep declaration order.
3. **Coordinates.** Constants (exported, single source of truth). These are
   **calibrated, not guessed** - they were solved against the 3.4 pilot's
   hand-placed coordinates (see the check below):
   ```ts
   export const MARGIN_X = 6;
   export const MARGIN_Y = 40;
   export const COL_GAP = 72;
   export const ROW_GAP = 80;
   ```
   - `viewBoxWidth = 2*MARGIN_X + cols*NODE_WIDTH + (cols-1)*COL_GAP`
   - `rowsMax` = max node count in any column;
     `viewBoxHeight = 2*MARGIN_Y + rowsMax*NODE_HEIGHT + (rowsMax-1)*ROW_GAP`
   - x(center) for column c: `MARGIN_X + c*(NODE_WIDTH+COL_GAP) + NODE_WIDTH/2`
   - y(centers) for a column of k nodes, distributed across the content band:
     ```
     k === 1  ->  [viewBoxHeight / 2]
     k > 1    ->  top = MARGIN_Y + NODE_HEIGHT/2
                  bot = viewBoxHeight - MARGIN_Y - NODE_HEIGHT/2
                  y_i = top + i * (bot - top) / (k - 1)
     ```
4. **Overrides.** A node with explicit `position` uses it verbatim and is
   excluded from row distribution in its column (it still occupies its column
   for width purposes if it has no position-independent column). If the
   author supplies explicit `viewBoxWidth`/`viewBoxHeight` on the props, those
   win over the derived ones (needed for fully hand-placed diagrams, which
   remain legal).

**Calibration check (use as the first `layout.test.ts` case).** The 3.4 pilot
was hand-placed at viewBox 600x250 with client(80,125), lb(296,125),
app1(520,62), app2(520,188). The constants above reproduce it:

| Value | Derived | Pilot (hand-placed) |
|---|---|---|
| viewBoxWidth | 600 | 600 |
| viewBoxHeight | 252 | 250 |
| col 0 center x | 80 | 80 |
| col 1 center x | 300 | 296 |
| col 2 center x | 520 | 520 |
| k=1 center y | 126 | 125 |
| k=2 center ys | 63, 189 | 62, 188 |

Within 1-4px everywhere, which is what makes P3.1's migration a visual no-op.
Assert these numbers exactly in the test; if a later constants change breaks
them, that is a deliberate design decision and the table above must be
updated with it.

### P1.2 `normalize.ts` - the single entry point

```ts
export type WalkthroughIssue = {
  code:
    | "unknown-component"     | "duplicate-node-id"    | "duplicate-edge-id"
    | "edge-endpoint-missing" | "highlight-node-missing" | "highlight-edge-missing"
    | "focus-edge-missing"    | "variant-unknown-algorithm"
    | "node-overlap"          | "node-outside-viewbox"
    | "caption-too-long"      | "too-few-steps"        | "cycle";
  message: string;            // names the offending id and the step index where relevant
};

export type ResolvedWalkthrough = { /* per P0.2 */ };

export function normalizeWalkthrough(props: WalkthroughProps): {
  resolved: ResolvedWalkthrough;
  issues: WalkthroughIssue[];
};
```

Behavior:

1. **Referential checks** (before layout): duplicate node/edge ids; edge
   endpoints resolve; `componentId` resolves via
   `getComponent` (import from `@/content/components/registry` - note this
   also resolves user-custom components, which is correct: lesson content only
   ever uses built-ins, and the harness runs without a custom store populated).
2. **Step expansion**: for each step and each variant, if `focus` is present,
   `highlightEdgeIds = focus edges union explicit highlightEdgeIds`,
   `highlightNodeIds = endpoints of focus edges union explicit highlightNodeIds`.
   A `focus` id that is not a declared edge id -> `focus-edge-missing`.
   Missing `highlight*` with no `focus` -> empty arrays (legal: a step may
   highlight nothing, e.g. an establishing step).
3. **Highlight checks** (after expansion): every id in the expanded arrays
   resolves, per step and per variant. Every `variants` key must be a declared
   `algorithms[].id` -> `variant-unknown-algorithm` otherwise.
4. **Layout**: call `computeLayout`; merge explicit positions/viewBox per
   P1.1's override rules.
5. **Geometry checks** (after layout, so they also validate auto-layout
   output and any overrides): no two card rects
   (center +- NODE_WIDTH/2, NODE_HEIGHT/2) intersect -> `node-overlap`; every
   card rect inside the viewBox -> `node-outside-viewbox`.
6. **Caption budget**: export `CAPTION_MAX_CHARS = 220` (fits the fixed h-20
   line-clamp-3 strip at text-sm); longer captions (step or variant) ->
   `caption-too-long`. `steps.length < 2` -> `too-few-steps`.
7. **Never throw.** Always return a best-effort `resolved` (skip unresolvable
   references the same way the renderer already does) plus the issues array.
   The renderer stays production-safe; the harness turns issues into failures.

Explicitly NOT checked (decided during scoping): "caption must name a
highlighted node's label". The existing pilot's step 4 caption legitimately
violates it ("The chosen instance answers..." while highlighting App Server 1).
It stays a human-review rule in the chapter spec, not a mechanical one.

### P1.3 Wire `Walkthrough.tsx` through normalize

- `const { resolved, issues } = useMemo(() => normalizeWalkthrough(props), [props])`.
  Note: MDX re-creates prop literals per render of the lesson body, but the
  lesson body renders once per chapter load, so identity-keyed useMemo is fine.
- All internals consume `resolved` (positions, viewBox, expanded steps).
  `computeEdgeGeometry` moves inside the same useMemo chain so edge paths are
  not recomputed on every step change (they only depend on nodes/edges).
- Dev-only issue banner: when `issues.length > 0` and
  `process.env.NODE_ENV !== "production"`, render a compact amber strip above
  the header band listing `code: message` lines. In production, render
  best-effort exactly as today. The banner is a fixed-position addition above
  the component, not inside a band - do not disturb band heights.
- `WalkthroughEdges` / `WalkthroughNodeCard` prop shapes: switch to resolved
  types; behavior unchanged.

### P1.4 Unit tests

`layout.test.ts` (pure, no DOM):
- **the calibration table above, asserted exactly** (LB-shaped input -> 3
  columns, the listed centers, viewBox 600x252)
- `column` hint overrides longest-path
- explicit `position` passes through verbatim
- control-only node adopts its neighbor's column
- a synthetic request-flow cycle terminates and yields a layout

`normalize.test.ts` (pure):
- one test per issue code, minimal fixture each, asserting the code and that
  the offending id/step appears in `message`
- `focus` expansion: single id, array, union with explicit arrays, variant focus
- clean input -> zero issues, resolved steps fully expanded
- never throws on garbage (empty nodes, empty steps, self-loop edge)

Update `Walkthrough.test.tsx`: existing 11 tests must keep passing with
position-less fixtures (drop the hand-placed coordinates from the test fixtures
to dogfood auto-layout); add one test that a bad `componentId` renders the dev
banner and still renders the rest.

---

## Phase 2 - Repo-wide validation harness

### P2.1 `src/content/chapters/walkthrough-invariants.test.ts`

Sits beside `authoring-invariants.test.ts` (the established home for
mechanical authoring rules - read its header comment and mirror its posture:
dummy/placeholder chapters exempt, real content held to the bar).

Mechanism:

1. Enumerate `public/content/chapters/*.mdx` with `readdirSync` (same
   `REPO_ROOT` path join pattern `authoring-invariants.test.ts` already uses).
2. For each file, compile and render via `renderMdx` (P0.1) with a **capture
   stub**: `{ ...mdxComponents, Walkthrough: (props) => { captured.push(props); return null; } }`.
   The stub prevents jsdom-dependent rendering entirely; only props matter.
3. For each captured props object, run `normalizeWalkthrough` and assert
   `issues` is empty - with the failure message printing the chapter filename,
   the diagram's index within the file, and every issue's `code: message` so a
   broken diagram is locatable without a debugger.
4. Additional repo-level assertion: each `<Walkthrough>` with `algorithms`
   declares >= 2 of them (a 1-entry dropdown is dead UI; the component already
   hides it, making it dead content too).

This runs on every `npm test` forever, covers diagrams that do not exist yet,
and requires no per-diagram opt-in. It is the single highest-value item in the
release; nothing in Phase 3 onward should be authored before it is green.

---

## Phase 3 - Pilot migration and editorial rule

### P3.1 Migrate `bb-3-4-load-balancer.mdx`

- Drop all four `position` literals and both `viewBox*` props; keep node
  declaration order (client, lb, app1, app2) since row order derives from it.
- Convert steps to `focus` where they are edge-plus-endpoints shaped
  (steps 1, 3, 5 and their variants). Steps 2 (control edges + three nodes)
  and 4 (node-only highlight) keep explicit arrays - step 2's highlight set
  is not the union shorthand produces, so leaving it explicit is correct,
  not lazy.
- Eyeball on the chapter page and in the lab; the shape must read the same as
  the hand-placed original.

### P3.2 One-diagram-per-topology rule

- Delete the mermaid block in 3.4 that draws the same client/lb/app/db
  topology the walkthrough draws (keep whichever mermaid blocks show
  topologies the walkthrough does not).
- Add to CURRICULUM.md (authoring rules section): a chapter draws a given
  topology exactly once - as a walkthrough if it benefits from stepping,
  else as a static diagram; never both. Doc edit in its own commit, per the
  repo convention for framework changes.

---

## Phase 4 - Authoring lab

### P4.1 `/dev/walkthrough-lab`

Copy the `diagram-question-lab` pattern exactly: `page.tsx` (server component
delegating), `WalkthroughLabContent.tsx` (`"use client"`, `PageEnter`, not
linked from any nav), `fixtures.ts`, tests. Content:

- **Fixture picker**: a `<select>` over `fixtures.ts` entries. Ship fixtures:
  the migrated LB diagram; an 8-node fan-out (client -> lb -> 3 servers ->
  cache + db, one async edge to a queue) to preview RWE-scale layout; a
  deliberately broken one (bad componentId, bad focus id) to show the issue
  panel working.
- **JSON editor**: a `<textarea>` holding `JSON.stringify` of the selected
  fixture's props; on change, `JSON.parse` in a try/catch (parse error shown
  inline, last-good render kept). Authors iterate in JSON here, then
  hand-convert to JSX props in the MDX - acceptable friction; do NOT build a
  JS/JSX evaluator.
- **Live render** of `<Walkthrough {...parsed} />` plus a panel listing
  `normalizeWalkthrough` issues (always visible in the lab, not just the
  dev banner).
- **Layout debug overlay** (checkbox): column guides and derived viewBox
  bounds drawn over the diagram - implemented in the lab (absolutely
  positioned divs computed from `computeLayout` output), NOT as a prop on
  `Walkthrough` itself. The shipped component gains no debug surface.

### P4.2 Lab tests

Mirror `DiagramQuestionLabContent.test.tsx` scope: renders fixtures, switching
fixtures swaps the rendered walkthrough, invalid JSON shows the parse error
and keeps the previous render, broken fixture lists its issues.

---

## Phase 5 - Deferred, with triggers

- **P5.1 Topology presets** (named expansions like
  `preset: "client-lb-n-servers"`): only if, after ~10 real diagrams,
  node/edge declarations are still the dominant authoring cost. Auto-layout
  plus `focus` may make this unnecessary indirection. Decide from evidence.
- **P5.2 Canvas export**: only if a Tier 4 RWE diagram (WhatsApp, Uber;
  12-14 nodes) produces a layered layout that manual `column`/`position`
  overrides cannot rescue. The canvas already emits positions via
  `toArchitectureGraph`, so the export is mechanical if ever needed.

## Open questions carried from scoping

| # | Question | Trigger |
|---|---|---|
| 1 | Do RWE debrief reference solutions get walkthroughs, or is `ReadOnlyGraphSummary` enough? Swings scope by ~60 diagrams. Content call, user decides. | Before first RWE project is authored |
| 2 | Does layered LR survive a 12-14 node flagship? | First Tier 4 diagram (feeds P5.2) |
| 3 | Do `custom`-kind nodes join auto-layout or stay hand-placed? Current spec: they join (neighbor-column rule); revisit on first real use. | First `custom` diagram |
| 4 | Side-by-side topology comparison for RWE Phase B, or do `algorithms` variants cover it? | First Phase B debrief |

---

## Implementation notes for the implementing agent

- **Read first**: `src/chapters/walkthrough/` in full (it is ~900 lines),
  `authoring-invariants.test.ts`'s header, `compile-lesson-mdx.test.ts`, and
  `DiagramQuestionLabContent.tsx`. Run `graphify query` before any broader
  exploration - repo rule.
- **Comment style**: this repo's walkthrough files carry long design-rationale
  comments; the user prefers new comments short and to the point. Keep the
  existing long comments where they explain locked decisions; write new ones
  brief. Never use the em dash character in any authored content or comments;
  use "-".
- **Verification cadence**: per-item, run only the scoped tests
  (`npx vitest run src/chapters/walkthrough/ src/content/chapters/walkthrough-invariants.test.ts`)
  plus `npm run lint` (the flat eslint config bites on setState-in-effect;
  `player.ts`/`hooks.ts` show the approved patterns - derive state or use
  `useSyncExternalStore`, no effect-driven setState). Full CI
  (`npm run typecheck && npm run lint && npm test && npm run build`) once at
  session end, not per feature. `typecheck` may emit `.next/dev/types` noise
  on a live dev server; only `src/` errors count.
- **Do not**: touch the live canvas, add props to `Walkthrough` for lab-only
  needs, reintroduce SMIL animation, make any fixed-height band
  content-sized, fork a component definition per chapter, auto-surface hints
  anywhere, merge or push branches (user does both).
- **Definition of done per phase**: its checklist items checked here, scoped
  tests green, and for Phase 3 a visual pass on `/building-blocks/.../lesson`
  for chapter 3.4. Update this doc's checkboxes and the status line as
  phases land; append a completion note per phase rather than rewriting
  history.
