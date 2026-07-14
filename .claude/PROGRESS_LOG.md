# Progress Log

Append-only, most recent entry at the bottom. This is the transferable session record —
read this first when picking the project back up in a new session, before re-deriving
context from git log or the planning docs. Each entry is written by a dedicated
logging subagent after a work session, not by whichever agent did the work, so it stays
an honest external summary rather than self-graded notes.

---

## 2026-07-13 — Planning docs + Next.js scaffold (first commit)

**Environment gotcha — read this first:** On this WSL box, plain `node`/`npm` on PATH
resolve to a *Windows* Node install via `/mnt/c/`, which breaks on WSL paths ("UNC
paths are not supported"). The working native Linux Node is via nvm at
`~/.nvm/versions/node/v22.22.3/bin`. Prefix commands with
`export PATH="$HOME/.nvm/versions/node/v22.22.3/bin:$PATH"`, or fix `.bashrc` to source
nvm properly, before running any node/npm command.

**What was built:** Six planning docs landed in `.claude/docs/` (RESEARCH,
ARCHITECTURE, TECH_STACK, DESIGN_LANGUAGE, MVP_SCOPE, OPEN_QUESTIONS) plus root
`CLAUDE.md` indexing them — these define the product and every architecture/stack/design
decision made so far; original vision is in `INITIAL_THOUGHTS.md`. A Next.js 16
(App Router, TS, Tailwind v4) scaffold followed: React Flow canvas (`src/canvas/`), a
seed `ComponentDefinition` registry with client/load-balancer/app-server/sql-database
(`src/content/components/registry.ts`), and a validation engine
(`src/validation-engine/`) with one real rule, `noDirectClientDatabase`, matching the
exact example from INITIAL_THOUGHTS.md's "Validation Philosophy" section (has a test:
`no-direct-client-database.test.ts`). `src/app/page.tsx` is a live smoke test toggling
between a valid and an invalid example graph so validation visibly reacts.

**Live and runnable now:** `npm run dev` (Next.js 16.2.10 + Turbopack) serves
http://localhost:3000, confirmed HTTP 200 with "ScaleCraft" rendering. Canvas +
registry + validation engine are wired end-to-end. `npm test` (vitest) covers the one
validation rule.

**Scaffolded but inert (needs external setup, not more coding):**
- `src/db/schema.ts` (Drizzle) + `src/db/client.ts` (lazy Neon client) — no
  `DATABASE_URL` yet, needs a Neon project provisioned.
- `src/auth/README.md` + `src/auth/beta-allowlist.ts` — Clerk plan only, NOT wired
  into `src/app/layout.tsx` (would crash without keys). Needs a Clerk project + keys,
  and the closed-beta allowlist mechanics spike flagged in OPEN_QUESTIONS.md.
- `src/simulation-engine/trace.ts` — bare request-flow tracer only; no animation UI,
  no per-component behavior stubs (cache hit/miss, etc.) yet.

**Repo state:** git-initialized, first commit `bfa7e43` ("Scaffold Next.js app: canvas,
component registry, validation engine"), pushed to
`git@github.com:Prateesh-Sulikeri/ScaleCraft.git` on `main` — confirmed
`origin/main` matches `HEAD`. 41 files, ~12.4k lines (bulk is `package-lock.json`).

**Product decisions to not accidentally violate:** Multiplayer/real-time collaboration
is REJECTED outright — never build it, never shape persistence around it. Validation
"explanations" (why it failed) must ALWAYS show on failure; "hints" (how to fix) must
NEVER auto-surface, only on deliberate user request. See "Hints vs. explanations" in
`.claude/docs/ARCHITECTURE.md`.

**Next steps (candidates, not ordered):**
- Build out the first real Building Blocks chapter content per MVP_SCOPE.md's
  "two chapters" requirement.
- Flesh out canvas UI: drag-from-palette, config panels, docs panel.
- Wire simulation engine to an animation UI; add per-component behavior stubs.
- Provision Neon + Clerk accounts to unblock persistence/auth (external, needs the
  user).

---

## 2026-07-13 — Milestone 1: interactive canvas (store-driven, drag/connect/delete + live validation)

**What was built:** The static demo graph in `src/app/page.tsx` is gone, replaced by a
fully interactive, store-driven canvas — Milestone 1 of `.claude/docs/MILESTONES.md`.
- `src/canvas/store.ts`: new Zustand store holding nodes/edges in React Flow's own
  shape (`ComponentNodeType`/`ArchitectureEdgeType`), not the domain `ArchitectureGraph`
  shape — deliberate choice to avoid fighting RF's controlled-component model. A pure
  `toArchitectureGraph(nodes, edges)` selector (line ~125) translates to the domain
  shape (`src/lib/graph.ts`) for the validation engine and future persistence.
  `src/canvas/store.test.ts` covers this selector.
- `src/canvas/Palette.tsx` + `Canvas.tsx`: draggable component cards, native HTML5
  drag-and-drop onto the canvas (`onDrop`/`onDragOver`, `screenToFlowPosition`).
- Connecting nodes uses RF's built-in pointer-based handle-drag (not HTML5 DnD); new
  edges default to `kind: "request-flow"`.
- `src/canvas/EdgeInspector.tsx`: floating panel on edge selection to change its kind
  (request-flow/control/replication/async).
- Delete via keyboard AND a right-click context menu (`src/canvas/ContextMenu.tsx`) —
  two paths, see bug list below for why.
- Validation is live: `src/app/page.tsx` computes violations via `useMemo` on every
  store change, derives a nodeId→validationState map, passed into `Canvas` as a prop
  and merged into node render data only at render time — never written back into the
  store, to avoid a render feedback loop (store change → validation → store write →
  store change → ...).

**Bugs found via live manual testing — fixed, root causes recorded so they aren't
rediscovered:**
- *Delete key did nothing:* `@xyflow/react`'s `deleteKeyCode` defaults to `'Backspace'`
  only. Fixed: `deleteKeyCode={["Backspace", "Delete"]}` in `Canvas.tsx`.
- *Zoom/pan controls light-themed on a dark page:* xyflow's own `colorMode` prop (its
  built-in chrome — Controls, Background, handles, selection outlines) defaults to
  `'light'` regardless of the page's Tailwind theme; it's a separate theming system.
  Fixed by adding `next-themes` (`src/app/theme-provider.tsx`, wired in
  `src/app/layout.tsx` with `attribute="class" defaultTheme="dark" enableSystem={false}`
  — dark is DESIGN_LANGUAGE.md's declared default, not OS-linked), a toggle button
  (`src/app/ThemeToggle.tsx`), `colorMode={...}` wired to `resolvedTheme` on
  `<ReactFlow>`, plus CSS overrides in `globals.css` for `.react-flow__controls*` onto
  our own tokens.
- *Drag-to-box-select didn't work, plain drag always panned:* xyflow defaults to
  `panOnDrag={true}` + `selectionOnDrag={false}`. Changed to `selectionOnDrag={true}` +
  `panOnDrag={[1]}` (pan only via middle-mouse-drag) — left-drag on empty canvas now
  box-selects, matching familiar diagramming-tool UX.
- *"React Flow" attribution watermark, unclear purpose to a user:* hidden via
  `proOptions={{ hideAttribution: true }}`. CAVEAT already logged in
  `.claude/docs/OPEN_QUESTIONS.md`: only permitted without a paid Pro subscription for
  non-commercial projects — true now (pre-revenue closed beta), must be re-checked
  before any monetized/public launch.
- *Confusing padlock icon in bottom-left Controls panel* (toggles global
  draggable/connectable/selectable state): hidden via `<Controls showInteractive={false} />`.
- *Right-click did nothing / showed the ugly native browser menu:* added
  `onNodeContextMenu`/`onEdgeContextMenu` (preventDefault + open `ContextMenu.tsx` with
  a Delete action) and `onPaneContextMenu` (preventDefault only, on empty canvas).

**Environment limitation — real browser E2E not runnable here:**
`npx playwright install chromium` succeeded, but launch failed with
`error while loading shared libraries: libnspr4.so: cannot open shared object file` —
needs `npx playwright install-deps` (apt-get, root), and this environment has no
passwordless sudo. A hand-written Playwright script was abandoned for this reason only,
not because the approach was wrong. Verification instead relied on tsc/eslint/vitest/
next-build passing, curl smoke checks, and — the decisive signal — the user manually
driving the real app in their own browser concurrently and reporting the exact bugs
above. A future session wanting real browser automation should get root to run
`playwright install-deps`, or check for a `chromium-cli` tool (referenced by this
project's `run` skill but not installed here) elsewhere.

**Repo state:** commit `02583ef` "Milestone 1: interactive canvas — drag/connect/delete
+ live validation", confirmed `origin/main` matches `HEAD`, working tree clean. 13 files
changed (new: `Canvas.tsx` rewrite, `ContextMenu.tsx`, `EdgeInspector.tsx`,
`Palette.tsx`, `store.ts`/`store.test.ts`, `theme-provider.tsx`, `ThemeToggle.tsx`).
Dev server still running in the background on http://localhost:3000, now serving the
interactive canvas.

**Milestone 1 status:** functionally complete (drag from palette, move/connect/delete,
edge-kind picker, live validation) and all UX/theming bugs from live testing fixed.

**Next steps:**
- Milestone 2 (not started): node inspector panel — click a node to view/edit its
  `config` and read its `docs`; currently there is no UI path to either at all.
- Milestone 3 (not started): dedicated `/sandbox` route; everything still lives on `/`.

---

## 2026-07-13 (continued) — Real headless-browser verification unblocked; box-select color fix

Same day, same working arc as the milestone 1 entry above — picks up right after it.

**Headless browser now works here WITHOUT root — read this before re-concluding it
doesn't.** The prior entry logged `playwright install-deps` as blocked (needs apt-get +
root, no passwordless sudo). Found a workaround: `apt-get download` does NOT need root
(it just fetches `.deb`s to the cwd), so:
```
apt-get download libnspr4 libnss3 libasound2t64
mkdir local-libs && for f in *.deb; do dpkg-deb -x "$f" local-libs; done
# launch with: LD_LIBRARY_PATH=<local-libs>/usr/lib/x86_64-linux-gnu
# chromium.launch({ args: ['--no-sandbox'], env: { ...process.env, LD_LIBRARY_PATH } })
```
Confirmed working end-to-end: real screenshots, real clicks, real computed-CSS reads
against the dev server at localhost:3000. The extracted libs lived under this session's
scratchpad (`.../scratchpad/local-libs`), which does NOT persist — a future session must
redo the `apt-get download` + `dpkg-deb -x` steps (under a minute), but now knows it
works and shouldn't waste time rediscovering it or giving up on browser verification.

**Used it to check three things the user flagged after manual testing:**
- *"Validation didn't work"* — false alarm. Reproduced Client→SQL-Database in the real
  browser; `noDirectClientDatabase` fired correctly with the right message/explanation.
  The screenshot that prompted this concern showed a 3-node subgraph with no database
  node at all — correctly zero violations, just a different graph state, not a bug.
- *Edge animation looked static* — false alarm, but instructive. Sampling
  `getComputedStyle(path).strokeDashoffset` twice, 500ms apart, gave identical values —
  looked like proof it wasn't animating. It IS animating
  (`animationName: "dashdraw"`, `animationPlayState: "running"`); the 500ms sampling gap
  exactly matched the animation's own period, so both samples caught the same phase
  (stroboscope/aliasing artifact). Lesson: check `animationPlayState` directly, don't
  infer motion from property snapshots at a fixed interval.
- *Box-select drag rectangle looked weird* — real bug, fixed. xyflow's
  `--xy-selection-background-color`/`--xy-selection-border` default to a hardcoded blue
  in both colorMode variants, colliding with the app's own "networking" category blue
  (see DESIGN_LANGUAGE.md's two-channel color system) and reading as an unstyled
  default. Fixed in `src/app/globals.css` (`.react-flow` block) with
  `color-mix(in srgb, var(--foreground) ...)` overrides for those two vars plus
  `--xy-node-boxshadow-selected`, so it adapts to light/dark automatically. Verified via
  screenshots in both themes.

**Also restored** the Controls panel's interactivity-lock (padlock) icon in
`src/canvas/Canvas.tsx` — hiding it via `showInteractive={false}` in the milestone 1
commit was a misread of feedback; the user explicitly wanted it back. One-line revert to
the default (`<Controls />`).

**Repo state:** three commits landed this round, `origin/main` confirmed matching
`HEAD`, working tree clean:
- `79c7b35` "Restore the Controls interactivity-lock icon"
- `644fc9b` "Theme the box-select overlay to match the app instead of xyflow's default
  blue"
(plus `a35c669` logging the milestone 1 entry above, already covered by that entry).
Dev server still running in the background on `localhost:3000`, hot-reloading
throughout.

**Next steps:** unchanged from the milestone 1 entry above (Milestone 2 node inspector
panel; Milestone 3 `/sandbox` route).

---

## 2026-07-13 (further continuation) — Three-zone layout restructure, doubling as Milestone 2

Same day, picks up right after the box-select/verification entry above.

**Layout restructured to three zones**, per explicit direction, replacing the milestone-1
left-sidebar + right-validation layout:
- **Left** — `src/app/QuestionPanel.tsx`: a placeholder for chapter problem statements
  (the chapter framework is milestone 5 and doesn't exist yet) plus the live validation
  feedback panel, moved here from the right side on the reasoning that "how am I doing
  against the question" belongs with the question.
- **Right** — `src/canvas/NodeInspector.tsx`: Config/Docs tab switcher, backed by
  `src/canvas/ConfigForm.tsx` for the actual form.
- **Bottom** — `src/canvas/Palette.tsx` rewritten from a `flex-col` sidebar to a `flex`
  row with `overflow-x-auto` + `shrink-0` cards, anticipating the registry outgrowing one
  screen width as chapters add components.
- `src/app/page.tsx` recomposed around these three zones (confirmed: `QuestionPanel` left,
  `Canvas`+`Palette` center column, `NodeInspector` in a `w-96` right aside).

**This is effectively Milestone 2** from `.claude/docs/MILESTONES.md` ("node inspector
panel"), folded into the layout work rather than done separately. Confirmed in
`src/canvas/store.ts`: `selectedNodeId` state, `setSelectedNodeId`, and
`updateNodeConfig` were added; `Canvas.tsx`'s `onNodeClick` sets the selected node and
clears edge selection (and `onEdgeClick` does the reverse) so only one of node/edge is
ever selected at a time.

**Architecture decision worth flagging for reuse**: `ConfigForm.tsx` is genuinely
schema-driven, not a per-component form. It reads `definition.configSchema` (a Zod
object) at runtime — `schema.shape` for the field map, then `instanceof z.ZodEnum /
ZodNumber / ZodBoolean / ZodString` to pick a control (`ZodEnum.options` for select
choices, `ZodNumber.minValue`/`.maxValue` for input bounds) — confirmed this reads
correctly against the installed zod v4.4.3 runtime API. Driven by react-hook-form; a
`useWatch` + `useEffect` gated on `formState.isValid` writes into the store only on
valid state, so partially-invalid input never reaches the graph. Mounted `key={node.id}`
in `NodeInspector` so switching nodes remounts with fresh `defaultValues` rather than
carrying stale state. One documented TS friction point: `zodResolver()` doesn't
type-check against a schema type-erased to `z.ZodType<Record<string, unknown>>`, worked
around with `zodResolver(schema as never)` rather than fighting the generics — noted
inline as deliberate, not sloppy. Docs tab renders `definition.docs` as plain text by
design (current docs content has no markdown syntax), with a code comment flagging
`react-markdown` for whenever that changes.

**Bug fix**: multi-select right-click did nothing. Root cause, confirmed in `Canvas.tsx`
and `ContextMenu.tsx`: xyflow fires a separate `onSelectionContextMenu` callback (not
`onNodeContextMenu`) when the selection bounding-box overlay is under the cursor instead
of an individual node; it wasn't wired at all. Fixed by wiring it, adding a bulk
`deleteNodes(nodeIds: string[])` action to the store, and extending `ContextMenuTarget`
to a discriminated union (`"node" | "edge" | "selection"`) with a "Delete N components"
label for the selection case — all three confirmed present in the current files. Other
right-click options (per-node Duplicate, a Docs-tab shortcut, edge Reverse direction,
empty-canvas quick-add) were proposed to the user but not built, pending their pick.

**Verification**: exercised in a real headless browser (the `local-libs`/
`LD_LIBRARY_PATH` workaround from the prior entry, scratchpad-local so it won't survive
into a new session) rather than trusted from typecheck/build alone — node click opens a
working Config tab, the Load Balancer's algorithm select persists a change, the Docs tab
renders real content, and box-selecting two nodes then right-clicking shows "Delete 2
components" and deletes both.

**Repo state:** commit `5252128` "Restructure layout: left=question/validation,
right=config+docs, bottom=palette" — confirmed `origin/main` matches `HEAD`, working
tree clean. Dev server still running in the background on `localhost:3000`,
hot-reloading throughout.

**Milestone status:** Milestone 2 (node inspector) now effectively done, ahead of its
original sequence position. Milestone 1's earlier multi-select context-menu gap is also
closed. **Next steps:** Milestone 3 (`/sandbox` route — everything still lives on `/`)
not started; the additional context-menu options above are pending the user's choice.

---

## 2026-07-13 (further continuation) — Node card redesign; a zoom-tuning misdiagnosis worth reading before touching Canvas sizing again

Same day, picks up right after the layout-restructure entry above.

**Node card redesigned**, based on a reference screenshot the user shared (a
hellointerview.com-style bit.ly diagram) showing an icon-badge + title + short-description
card pattern. Explicitly not a copy: same general UI pattern (common/generic, not
proprietary to that site), our own colors/icons/layout per DESIGN_LANGUAGE.md.
- `ComponentDefinition` (`src/content/components/types.ts`) gained a `summary` field — one
  short caption (~40-60 chars) shown on the canvas node, distinct from the existing longer
  `docs` field (still inspector-only, Docs tab). Confirmed all four registry entries in
  `src/content/components/registry.ts` have one (client, load-balancer, app-server,
  sql-database).
- `src/canvas/ComponentNode.tsx` rewritten: category color now drives a tinted icon badge
  (`color-mix(in srgb, ${categoryColor} 20%, transparent)` behind the Lucide icon) instead
  of the old left border stripe; card fixed at `w-[200px]`; title + summary stacked under
  the badge. The validation-state ring (2px outline) is unchanged.
- `.claude/docs/ARCHITECTURE.md`'s `ComponentDefinition` snippet updated to include
  `summary` — confirmed in sync with the actual type.

**Separately, the user reported the canvas "feels like either the components are too
large or we are too zoomed in" by default — this took two wrong turns before landing on
the actual cause, worth recording so a future session doesn't repeat them:**
- *First attempt*: shrunk node padding/text AND increased `fitView` padding to 0.4 at the
  same time. Screenshotted it — made things worse (text went tiny and hard to read, nodes
  looked lost in too much empty space). Reverted the node-size shrink immediately.
- *Second attempt* (after the redesign above made nodes wider, 200px): tried tightening
  `fitView` padding to 0.15, then 0.1, with `maxZoom` capped at 1/1.2. Screenshots showed
  only marginal improvement (~0.66-0.69 computed zoom) — legible but not solid.
- *Root cause*, found by directly measuring the rendered node's bounding box in the
  headless browser rather than guessing from screenshots: it was never a node-size or
  fitView-padding problem. Four 200px-wide cards in one horizontal row need ~900px, but the
  center canvas column is only ~700px wide once the left (Question) and right (Inspector)
  panels from the layout-restructure commit are accounted for — `fitView` is mathematically
  forced below 100% no matter how padding/maxZoom get tuned. Confirmed in
  `src/app/page.tsx`: the seed graph's original layout was one row, all four nodes at the
  same `y` with `x: 0/240/480/720`.
- *Actual fix*: rearranged the seed graph into two rows of two — Client/Load-Balancer at
  `y:0`, App-Server/SQL-Database at `y:160`, `x: 0/280` within each row (confirmed in the
  current `src/app/page.tsx`, lines ~22-49) — halving the required horizontal span. This
  alone brought fitView's computed zoom to exactly 1.0, confirmed by measuring the
  rendered node's screen bounding box (200x76.5px under `matrix(1,0,0,1,...)`, i.e.
  genuinely native/unscaled). Also widened `minZoom` from xyflow's default 0.5 to 0.25 in
  `src/canvas/Canvas.tsx` (confirmed: `minZoom={0.25}`, `fitViewOptions={{ padding: 0.1,
  maxZoom: 1 }}`) so future, bigger graphs (real chapters, RWE) have room to zoom out
  manually.
- **Lesson**: when "things look the wrong size," measure the actual rendered geometry
  (node bounding box + viewport transform, e.g. via `getBoundingClientRect` /
  `getComputedStyle` transform) in a real browser before touching CSS/props. Two
  consecutive guesses based on visual impression alone were wrong and had to be reverted;
  the third attempt, which measured pixel dimensions directly, found the real cause on the
  first try.

**Verification**: all of the above exercised in the real headless browser (the
`local-libs`/`LD_LIBRARY_PATH` workaround logged two entries back — re-extract via
`apt-get download` + `dpkg-deb -x` if starting a genuinely new session, scratchpad doesn't
persist), screenshotting and visually inspecting at each iteration rather than trusting
computed zoom numbers alone.

**Repo state:** commit `aee0dd9` "Redesign node card (icon badge + description) and fix
default zoom" — confirmed `origin/main` matches `HEAD` (`aee0dd9490460e8395091eb519f021cbe59002c3`
both), working tree clean. Dev server still running in the background on `localhost:3000`.

**Pending decision, unchanged from the entry above**: the right-click context-menu
additions proposed but not built — per-node Duplicate, a Docs-tab jump shortcut, edge
Reverse direction, and an empty-canvas "Add component here" quick-add menu — are still
awaiting the user's pick before any get built.

---

## 2026-07-13 (further continuation) — Manual validate, collapsible panels, selection-gap fix, expanded context menu, mark-zone feature

Same day, picks up right after the node-card/zoom entry above. Six distinct changes requested
in one message; verified against `git log --oneline -8` (three new commits, not four — see
repo state below) and by reading the actual current file contents, not transcribed from the
request as given.

**1. Validation: live → manual, and "it's not catching wrong stuff" was a false alarm.**
Before touching anything, the live-at-the-time validation was reproduced directly in a real
headless browser with a genuine Client→Database edge — it fired correctly. Conclusion:
`src/validation-engine/rules/index.ts` has exactly **one** rule
(`noDirectClientDatabase`, the INITIAL_THOUGHTS.md example) — anything else the user tried
that went unflagged has no rule written for it. That's content-authoring scope (milestone 6),
not an engine bug, and was said plainly rather than quietly padding rule coverage to make the
symptom go away. Confirmed in `src/app/page.tsx`: validation is now behind an explicit
"Validate" button (top-right of the header) backed by `useState<ValidationViolation[] | null>`
plus a `checkedGraphKey` (a `JSON.stringify` snapshot of `toArchitectureGraph(nodes, edges)`
taken at click-time). `isStale` is a direct comparison of that snapshot against the current
graph — a stale note, not a silent re-run.

**2. QuestionPanel / NodeInspector / Palette are independently collapsible.** Confirmed each
owns its own `useState(false)` `collapsed` and renders a thin strip when true:
`QuestionPanel.tsx` uses `PanelLeftOpen`/`PanelLeftClose`, `NodeInspector.tsx` uses
`PanelRightOpen`/`PanelRightClose`, `Palette.tsx` uses `ChevronUp`/`ChevronDown` (all
lucide-react, all confirmed by grep against the actual files). NodeInspector's Config/Docs tab
state moved out of local state into the store (`inspectorTab`/`setInspectorTab` in
`store.ts`) specifically so the new "View docs" context-menu action (point 4) can jump the
inspector to Docs from outside the component.

**3. Box-select "sticking together" — real bug, two-attempt fix, worth the detail.** Root
cause: xyflow sets the selection rect's `width`/`height` inline to the exact bounding box of
the selected nodes, so a plain `border` there hugs them with zero margin. First fix (`outline`
+ `outline-offset: 10px` in `globals.css` — outline doesn't participate in box layout, so it
can sit outside the tight box) *looked* right in the CSS but didn't render: `getComputedStyle`
still showed `outline-style: none`. Cause: xyflow's own stylesheet has
`.react-flow__nodesselection-rect:focus, :focus-visible { outline: none; }`, and the rect
genuinely is focused once selected (needed for keyboard delete/move) — a same-specificity
class selector loses to that regardless of source order. Fix confirmed in the current
`globals.css` (lines ~104-121): the override is duplicated onto the exact same
`:focus`/`:focus-visible` compound selectors to match specificity, not just the bare classes.
Confirmed via real `getComputedStyle()` reads before and after, not assumed from the CSS
alone.

**4. Context menu expanded from Delete-only to four target types.** Confirmed in
`src/canvas/store.ts`: `duplicateNode` (offset clone), `duplicateNodes` (clones a selection,
remapping ids, keeping only edges where *both* endpoints were in the duplicated set — an edge
to a node outside the selection is correctly dropped rather than invented), `reverseEdge`
(swaps `source`/`target`), `openDocsFor` (sets `selectedNodeId` + `inspectorTab: "docs"` in
one call). `src/canvas/ContextMenu.tsx`'s `ContextMenuTarget` is now a 4-way discriminated
union — `"node"` (Duplicate/View docs/Delete), `"edge"` (Reverse direction/Delete),
`"selection"` (Duplicate N/Delete N), `"pane"` (new — right-click on empty canvas opens an
"Add component" submenu at the click position via `screenToFlowPosition`, replacing the old
suppress-only native-menu-block). Commit message claims all four paths were exercised
end-to-end in a real headless browser before landing; taken as reported, consistent with this
session's established verification pattern in earlier entries.

**5. New "mark zone" feature — visual-only grouping, scope deliberately limited.** Confirmed
in `src/canvas/types.ts`: `ZoneNodeData` (`label`, `width`, `height`, optional
`validationState`), `ZoneNodeType = Node<ZoneNodeData, "zone">`, and
`AnyNodeType = ComponentNodeType | ZoneNodeType`. The store's `nodes` field is `AnyNodeType[]`
throughout; `toArchitectureGraph` (`store.ts`) filters to `n.type === "component"` before
mapping — zones never reach the validation engine, confirmed by reading the function directly.
`NodeInspector.tsx` also narrows on `.type === "component"` before touching
`componentId`/`config`. `src/canvas/ZoneNode.tsx` (new) renders a dashed-border box sized from
`data.width`/`data.height`, using xyflow's `<NodeResizer>` (`onResize` writes back through the
store's new `updateZone`) and a plain `<input className="nodrag">` for the inline-editable
label — `nodrag` confirmed as xyflow's real opt-out class for the node-drag gesture. New zones
get `zIndex: -1` on creation (`addZone` in `store.ts`) so they always render behind component
nodes. `src/canvas/Palette.tsx` has a "+ Add zone" control in its header. **Scope note,
confirmed in both the code comments and commit message**: this is explicitly visual-only —
dragging a zone does not move contained nodes, dropping a node into a zone does not reparent
it. True parent/child grouping (`parentId` + `extent: 'parent'`) was named and deliberately
deferred, not attempted. Flag this if a future ask is "nodes should move with their zone."

**6. `--zone` CSS variable — defensive fallback shipped, root cause NOT resolved, and the
color itself has since drifted from what was reported.** The session's account: the user
added their own `--zone` custom property mid-session and started wiring `ZoneNode.tsx` to it;
when asked to also apply it to the zone's border and dial the intensity in between, sampling
`getComputedStyle` showed `--zone` resolving to an **empty string** in the browser despite
being present and syntactically valid in `globals.css` on disk — suspected stale
Turbopack CSS cache/hot-reload gap, never confirmed, because the user cut the debugging loop
short ("push it" / "enough mate"). Worked around rather than root-caused: confirmed both
`ZoneNode.tsx`'s `borderColor` and the `NodeResizer`'s `lineStyle`/`handleStyle` now use
`var(--zone, #e22f80)` (inline fallback syntax), not a bare `var(--zone)` — so the border
renders a sane color regardless of whether the custom property resolves. **Discrepancy caught
during this verification pass, worth flagging explicitly**: the reported color was magenta
(`#E22F80`), matching the code fallback — but `globals.css` right now actually declares
`--zone: #A5E9DD` (a mint/teal), in both `:root` and `.light` (the `.light` block's copy has
visibly hand-edited indentation, consistent with a manual, out-of-band edit rather than
generated). Whether this is a later change made after the session described here, or a
misremembered color in the handoff, is unknown from the repo alone — the *mechanism*
(fallback-based defensive styling) is confirmed correctly in place; the *specific color value*
currently committed does not match this entry's own narrative and should not be assumed
without re-checking `globals.css` directly. **Standing flag for a future session**: if
`getComputedStyle(document.documentElement).getPropertyValue('--zone')` still comes back empty
in a real browser, that's the genuinely open question (Next.js 16/Turbopack possibly
dropping/delaying custom properties declared outside `@theme`) — worth a clean investigation
(hard refresh, inspect the served CSS bundle, restart dev server) rather than trusting the
fallback as a full fix.

**Repo state:** three commits landed this round (not four — confirmed via
`git log --oneline -8`), `origin/main` matches `HEAD`, working tree clean:
- `7f3ab22` "Manual validate button, collapsible panels, fix selection gap"
- `efe1498` "Add Duplicate, View docs, Reverse direction, and quick-add context menu options"
- `f707e17` "Add mark-zone feature (labeled grouping containers)" — this commit's own message
  already includes the `--zone` fallback description in point 6 above, i.e. the fallback
  pattern was part of the zone feature's initial commit, not a later patch.
Dev server still running in the background on `localhost:3000` throughout.

**Verification method, unchanged from prior entries**: real headless browser via the
`local-libs`/`LD_LIBRARY_PATH` workaround (re-extract via `apt-get download` + `dpkg-deb -x`
if starting fresh, scratchpad doesn't persist) used for points 1, 3, and 4 above per commit
messages and prior investigation; explicitly *not* re-verified end-to-end for point 6 since
the user asked to stop debugging and ship — recorded above as unresolved rather than claimed
as checked.

**Next steps**: Milestone 3 (`/sandbox` route) still not started. True parent/child zone
grouping (point 5) remains deferred, not scheduled. The `--zone` custom-property mystery
(point 6) is the most actionable loose end for a future session.

---

## 2026-07-14 — Milestone 2 follow-up round: validation moved to the header, docs as an overlay modal, local persistence (Dexie), palette rewritten as a searchable sidebar list

Follow-up round driven by explicit feedback after live use of the three-zone layout from
the prior day's entries. Verified against `git status`/`git diff` and the actual current
file contents (working tree, not yet committed — nothing landed this round has a commit
hash). Four distinct changes, plus one milestone-doc edit; all confirmed present and
consistent with the diffs below.

**1. Validation feedback moved out of the left sidebar, onto the Validate button itself.**
`src/app/ValidationIndicator.tsx` (new) replaces the old plain "Validate" button in
`src/app/page.tsx`'s header. Confirmed: the button's border/text color is driven by
`hasViolations`/`isValid` (red/`state-error` vs. green/`state-valid`, neutral otherwise),
goes `border-dashed opacity-70` when `isStale`, and clicking it — when results are
`null` or stale — calls `onValidate` and force-opens (`setOpen(true)`) a dropdown showing
every violation's message *and* explanation unconditionally, never gated behind a second
click. This satisfies CLAUDE.md's "explanations always shown on failure" rule directly in
the component's own doc comment. The dropdown uses `<div className="fixed inset-0 z-20"
onClick={...} />` as its click-outside backdrop — confirmed this is the same convention
already used elsewhere (`ContextMenu.tsx`), not a new pattern invented for this component.
`src/app/QuestionPanel.tsx`'s diff confirms the entire old Validation section (the
`violations`/`isStale` props, the `<ul>` of violation cards) was deleted outright, not
just visually hidden — the component's props changed from
`{ violations, isStale }` to none at all.

**2. Docs moved from a cramped inspector tab to a centered overlay modal.**
`src/canvas/DocsModal.tsx` (new): `max-w-2xl`, `max-h-[80vh]`, closes on Escape
(`keydown` listener), backdrop click, or an explicit X button — confirmed all three paths
in the file. `src/canvas/NodeInspector.tsx`'s diff confirms the old Config/Docs tab
switcher (a two-button row toggling which section rendered) is gone; Config now renders
unconditionally as the sidebar's only persistent body, with a small "View docs" text
button next to the collapse toggle that sets `tab` to `"docs"`, which mounts
`<DocsModal>`. The existing `inspectorTab`/`openDocsFor` store plumbing that
`ContextMenu.tsx`'s right-click "View docs" already used was confirmed **untouched** —
`NodeInspector` still reads the store's tab state the same way, so that entry point kept
working with zero changes to `store.ts` or `ContextMenu.tsx` for this feature.

**3. New local persistence via Dexie (IndexedDB) — pulls forward the core of milestone 8.**
`src/persistence/db.ts` (new): a `ScaleCraftDB extends Dexie` with one `saves` table
(`EntityTable<CanvasSave, "id">`, schema `"id"`), storing `{ id, updatedAt, nodes, edges }`
where `nodes`/`edges` are the **raw canvas-store shape** (`AnyNodeType[]`/
`ArchitectureEdgeType[]`), confirmed deliberately not the domain `ArchitectureGraph` —
the file's own comment states zones aren't part of `ArchitectureGraph` and would be
silently dropped by a restore that went through it. `SANDBOX_SAVE_ID = "sandbox"` is a
single fixed key, no multi-slot UI yet. `src/canvas/store.ts` gained `loadCanvasState`
(diff confirmed, ~9 lines): unlike `loadGraph` (which maps from `ArchitectureGraph`),
it takes the raw shape directly and just resets `selected`/`selectedNodeId`/
`selectedEdgeId`. `src/app/page.tsx`'s mount effect now checks `db.saves.get(SANDBOX_SAVE_ID)`
first and only falls back to the hardcoded `seedGraph` if no save exists (confirmed in the
diff — the old bare `loadGraph(seedGraph)` call is now inside an `else` branch of that
check). Header gained three buttons, all confirmed in the `page.tsx` diff: **Save**
(`db.saves.put`, flips its own label to "Saved" for 1.5s via `setTimeout`), **Export**
(Blob + `URL.createObjectURL` + a synthetic `<a download>` click, filename
`scalecraft-canvas-<timestamp>.json`), **Import** (hidden `<input type="file">` triggered
by a visible button, `JSON.parse`s the file, does a minimal `Array.isArray` shape check
on `nodes`/`edges` before calling `loadCanvasState`, shows an inline error string on
failure rather than throwing). `fake-indexeddb` was added as a devDependency (confirmed
in `package.json` diff, `"^6.2.5"`) and two tests added: `src/canvas/store.test.ts` gained
a `loadCanvasState` describe block (confirmed: builds a zone node + a component node,
asserts both survive with `type` intact, and that `selected`/`selectedNodeId`/
`selectedEdgeId` all reset) and `src/persistence/db.test.ts` (new) does a real
`db.saves.put` → `db.saves.get` round-trip under `fake-indexeddb/auto`.

**4. Palette rewritten: horizontal under-canvas tray → searchable vertical list, relocated
into the left panel.** `src/canvas/Palette.tsx`'s diff confirms: the component's own
`collapsed` state and toggle button are gone (comment explains why — the containing
`QuestionPanel` aside already has one, nothing left in this panel to hide without it), a
`query` state plus a `useMemo` filter over `componentRegistry` by
`label.toLowerCase().includes(q) || summary.toLowerCase().includes(q)`, a search input
with a `Search` icon, and each row now shows `definition.summary` under the label (it
previously showed only the label). `src/app/QuestionPanel.tsx`'s diff confirms it now
renders `<Palette />` full-height in place of its old "No chapter loaded" placeholder
paragraph and the (now-removed, see point 1) Validation section — the component's doc
comment explicitly frames this as intentional: kept as its own named component so
milestone 5's real chapter problem statement has a slot to land in later "without
re-plumbing." `src/app/page.tsx`'s diff confirms the old bottom `<Palette />` mount
(previously stacked under `<Canvas>` in a `flex-col` center column) is gone; the center
column is now just `<Canvas nodeStates={nodeStates} />` alone.

**Milestone doc updated to match**: `.claude/docs/MILESTONES.md` milestone 8 diff
confirmed — a new paragraph states the core "a refresh doesn't lose work" primitive was
pulled forward into this round (naming `src/persistence/db.ts` and the manual Save/
Export/Import specifically), and lists what's still deferred to milestone 8 proper:
autosave-on-every-edit (today's Save is a manual click, not automatic), multi-slot saves
for real chapter attempts (schema allows it later, only one `"sandbox"` slot exists now),
and Home-page wiring. The milestone's "Done when" line was correspondingly reworded from
"a browser refresh doesn't lose work" to "autosave-on-every-edit works offline ... and
Home reflects real state" — reads sensibly against the rest of the milestone, this is a
legitimate re-sequencing note per the doc's own stated convention, not silent drift.

**Verification — independently re-run this pass, not just trusted from the session's own
report:** `npm run typecheck` (clean, no errors), `npm run lint` (clean), `npm test --
--run` (**7 tests passed across 3 files** — matches the claim exactly:
`toArchitectureGraph`/`loadCanvasState` in `store.test.ts`, the new `db.test.ts` round-trip,
plus the pre-existing `no-direct-client-database.test.ts`), and `npm run build` (Next.js
16.2.10 + Turbopack, compiled and generated static pages successfully). Real
headless-browser verification (screenshots/clicks/computed-CSS, the `apt-get download
libnspr4 libnss3 libasound2t64` + `dpkg-deb -x` + `LD_LIBRARY_PATH` workaround logged
several entries back) was claimed for: palette search filtering, the Validate button
going green/red with the dropdown message+explanation visible and the offending nodes
ring-highlighted, right-click "View docs" opening the modal and closing on Escape, and a
Save → reload round-trip including a zone specifically (the flagged risk) surviving via
Export. This could not be independently re-driven in this verification pass (no browser
session was active) — taken as reported, consistent with the pattern in every prior entry
in this file, but flagged as unverified-by-this-pass specifically. Confirmed instead by
static inspection: no `scratch-verify*.mjs` scripts, screenshots, or `local-libs/` dir
show up anywhere in `git status --short` or the repo tree — cleanup claim holds.

**Pre-existing uncommitted drift, NOT part of this round — do not attribute to this
session's feature work:** `git status` also shows `src/app/globals.css` and
`src/canvas/ZoneNode.tsx` as modified. `git diff` on both confirms they are unrelated to
points 1-4 above: `globals.css`'s `--zone` custom property (both `:root` and `.light`)
has changed from the `#A5E9DD` mint/teal recorded in the previous entry's "`--zone`
mystery" writeup to `#FF3483` (a hot pink/magenta), and `ZoneNode.tsx`'s border
`color-mix` opacity moved from `65%` to `75%`. Both read as continued manual tuning of
the same `--zone` value the prior entry flagged as unresolved (empty-string resolution in
the browser, suspected stale Turbopack CSS cache), not a regression introduced now. Left
uncommitted and untouched by this session's work; a future session should not assume this
round's commits (once made) include or explain this color change.

**Separately, a different work thread earlier in this same session (not the feature work
above):** the user installed `graphify` and `impeccable` as global Claude Code skills
into `~/.claude/` (`uv tool install graphifyy` + `graphify install`; `npx impeccable
install` steered to global scope) and ran `/graphify .` against this repo, producing
`graphify-out/` (confirmed present — `GRAPH_REPORT.md`, `cache/`, `cost.json`,
`graph.html`, `graph.json`, `manifest.json`; confirmed **not** gitignored, so it will show
as untracked in `git status` until either committed or added to `.gitignore` — worth a
decision before it's accidentally swept into a future commit). `~/.bashrc` was also
confirmed edited this session (lines ~123-127) to source `nvm` and run `nvm use default`,
fixing the long-standing WSL gotcha (documented in this file's very first entry) where
plain `node`/`npm` resolved to a Windows install via `/mnt/c/` — this should mean future
sessions no longer need the `export PATH=".../nvm/versions/node/v22.22.3/bin:$PATH"`
prefix manually, though this pass still used the explicit prefix out of caution and didn't
re-test a bare shell.

**Repo state:** working tree **not clean** — everything in points 1-4 above plus the
milestone doc edit is still uncommitted (`git diff --stat`: 11 files modified, 259
insertions/143 deletions, plus untracked `src/app/ValidationIndicator.tsx`,
`src/canvas/DocsModal.tsx`, `src/persistence/` (`db.ts` + `db.test.ts`), and
`graphify-out/`). No commit hashes exist for this round yet. `origin/main` still points at
`48ee248` (the previous log entry), which remains the last pushed commit.

**Next steps:** commit this round's changes (currently all uncommitted). Decide on
`graphify-out/`'s fate (gitignore vs. commit vs. delete) before it gets swept into that
commit by accident. Milestone 3 (`/sandbox` route) still not started. The `--zone`
custom-property empty-string mystery remains open and has now drifted further (new color,
still uncommitted) without being root-caused. Milestone 8's remaining scope (autosave,
multi-slot saves, Home-page wiring) is now more precisely defined by this round's
MILESTONES.md edit but not started.

---

## 2026-07-15 — App icons/logo, Milestone 3 (`/sandbox` route), graphify wired into CLAUDE.md + hooks

Three commits landed this round; verified directly against `git log`/`git show --stat` on
each (hashes below are the real ones from `git log`, not reused from any prior report) and
by reading the current file contents, not transcribed from the session's own account.

**1. App icons and header logo.** `ff082de` "Add ScaleCraft logo, favicon, and app icons" —
confirmed a 5-file, binary-only diff (`0 insertions(+), 0 deletions(-)`, as expected for
image assets): `public/ScaleCraft logo.png` (new, 888KB, the full-padding source) and
`public/logo-mark.png` (new, 52KB, the tighter crop) added, plus `src/app/favicon.ico`
(overwritten, 25931→10950 bytes), `src/app/icon.png` and `src/app/apple-icon.png` (new).
Commit message states the crop was needed because the original logo's built-in padding made
it illegible at small sizes — plausible and consistent with the file-size delta, taken as
reported since favicon legibility isn't independently checkable from the repo alone. The
header logo is confirmed wired into the *new* `src/app/sandbox/page.tsx` (see next point),
not the old root page: an `<Image src="/logo-mark.png" ... width={32} height={32}
className="rounded-md" priority />` sits left of the "ScaleCraft" header title (lines
~144-153 of the current file).

**2. Milestone 3 — dedicated `/sandbox` route, confirmed done.** `1c7113a` "Milestone 3:
dedicated /sandbox route" — a 3-file diff (`.claude/docs/MILESTONES.md`, `src/app/page.tsx`,
new `src/app/sandbox/page.tsx`), 224 insertions / 198 deletions, net-additive because the
canvas page itself didn't shrink, it moved. Confirmed by reading both files directly:
`src/app/page.tsx` is now an 8-line server component,
```
import { redirect } from "next/navigation";
export default function RootPage() {
  redirect("/sandbox");
}
```
with a comment explaining `/` forwards to Sandbox rather than duplicating the canvas
experience until milestone 4's real mode-select Home page exists. The full canvas/palette/
inspector/validation/persistence experience that had accumulated at `/` through milestones
1-2 (and the follow-up round logged in the previous entry — `ValidationIndicator`,
`DocsModal`, Dexie persistence, the rewritten `Palette`) now lives at
`src/app/sandbox/page.tsx`, default export renamed `Home` → `SandboxPage`; confirmed no
functional rewrite happened here, this was a pure move (matches the commit message's own
framing: "moved ... essentially unchanged; the milestone was route structure, not new
functionality"). `.claude/docs/MILESTONES.md`'s milestone 3 section (current lines 55-68)
now reads "## 3. Sandbox mode — done" with a **Status: done** paragraph confirming this same
account — components/palette/inspector/validation/persistence moved as-is, `/` redirects as
a placeholder pending milestone 4.

**3. graphify wired into CLAUDE.md and hooks — a portability bug caught before it shipped.**
`834e831` "Wire graphify knowledge graph into CLAUDE.md and PreToolUse hooks" — 2-file diff,
34 insertions only (no deletions), `.claude/settings.json` (new) + `CLAUDE.md`. Confirmed
`CLAUDE.md` gained a `## graphify` section (current lines 73-81) instructing future sessions
to run `graphify query "<question>"` before grepping/reading raw files when
`graphify-out/graph.json` exists, `graphify path`/`graphify explain` for relationships/
concepts, the wiki index for broad navigation if present, `GRAPH_REPORT.md` as a fallback,
and `graphify update .` after code changes. Confirmed `.claude/settings.json` (new, not
previously present in this repo) registers two `PreToolUse` hooks — `Bash` matcher running
`graphify hook-guard search`, `Read|Glob` matcher running `graphify hook-guard read` — both
using a **bare** `graphify` command, not an absolute path. Per the session's own account,
these originally hardcoded `/home/prateesh/.local/bin/graphify` and were caught as a
portability problem (would break on any other machine or PATH layout) and fixed before this
commit landed — the committed file only ever shows the bare form, consistent with that fix
having happened pre-commit rather than needing a follow-up patch. `bash -lc 'which graphify'`
resolves to `/home/prateesh/.local/bin/graphify` in this environment, confirming the bare
command works via PATH here. The claimed `graphify hook install` step (post-commit +
post-checkout hooks in `.git/hooks/`, untracked) is confirmed present on disk:
`.git/hooks/post-commit` and `.git/hooks/post-checkout`, both executable, both dated
Jul 14 23:58 — same evening as this round's commits, and, being under `.git/hooks/`, correctly
absent from `git status`/any commit.

**Verification.** `npm run typecheck`, `npm run lint`, and `npm test -- --run` (10 tests
across 3 files) were reported clean after the route move — not independently re-run in this
verification pass, but plausible given the move was framed as file-relocation-only, not a
rewrite, and the file counts/diff shape in `1c7113a` support that (no new logic files, only
the two `page.tsx` variants + the milestone doc). Real headless-browser verification was
claimed using the same `local-libs`/`LD_LIBRARY_PATH` no-root Playwright workaround
documented several entries back (re-derived fresh this session since scratchpad state
doesn't persist): `GET /` → 307 to `/sandbox`, `/sandbox` → 200, the seeded 4-node graph
rendering correctly with the new header logo, screenshotted. Not re-driven in this
verification pass (no active browser session); taken as reported, consistent with this
file's established pattern of flagging claims as reported-not-reverified when a fresh
browser session isn't spun up during the logging pass itself.

**Repo state:** three commits this round, most recent first:
- `834e831` "Wire graphify knowledge graph into CLAUDE.md and PreToolUse hooks"
- `1c7113a` "Milestone 3: dedicated /sandbox route"
- `ff082de` "Add ScaleCraft logo, favicon, and app icons"

`git status` shows a clean working tree. **Not yet pushed** — `git status` reports
"Your branch is ahead of 'origin/main' by 3 commits"; `origin/main` still points at `b6ee6d0`
(the last entry's logging commit), one behind this round's first new commit.

**graphify hooks are now live for this and all future sessions in this repo** (root/`Bash`/
`Read`/`Glob` tool calls in this environment are gated by `graphify hook-guard`) — worth
flagging since it changes the shape of how a future session (or subagent) should explore this
codebase: query the graph first, read raw files only to modify/debug specific lines already
located.

**Next steps:** push these 3 commits (currently local-only). Milestone 4 (Home / mode-select
page) is next per `MILESTONES.md` sequencing — `/` is only a redirect stub today. The
`--zone` custom-property mystery flagged two entries back remains open and untouched by this
round's work.

---

## 2026-07-15 (continued) — Component registry expanded to 27 components; 5 config/topology-aware validation rules

Same date as the previous entry, commits land minutes after it (`00:39` vs. `23:58` the
prior evening) — same working arc, across midnight. User ask was "lots and lots of
relevant nodes," researched and real, with config that's actually consequential rather
than decorative. Two commits, verified directly against `git show --stat` on both
hashes (not reused from any prior report) and by reading the current file contents.

**1. `370c789` "Expand component registry to the full 27-component catalog."** Confirmed
by counting `label:` occurrences per file: networking 8 (Client, Browser, DNS, CDN,
Reverse Proxy, API Gateway, Firewall, + one more), compute 4, data 5, caching 2,
messaging 4, distributed-systems 4 — sums to 27, matching every component named in
`INITIAL_THOUGHTS.md`'s "Core Components" list, up from the original 4 (Client, Load
Balancer, App Server, SQL Database). `src/content/components/registry.ts` (read
directly) is now an 18-line barrel: imports six new per-category files
(`networking.ts`, `compute.ts`, `data.ts`, `caching.ts`, `messaging.ts`,
`distributed-systems.ts`) and concatenates them into the same `componentRegistry`
array, `getComponent(id)` unchanged — confirmed the public API every other module
imports from didn't move. Spot-checked `networking.ts`: each entry (`client`, `browser`,
`dns`, ...) is a fully-typed `ComponentDefinition<...>` with a real, specific config
shape (e.g. `browser`'s `honorsCacheControl: boolean`, `dns`'s
`recordType: "A" | "CNAME" | "ALIAS"` + `ttlSeconds`) — not placeholder fields, and this
checks out against the commit message's claim that several of these feed the next
commit's rules directly. `src/canvas/icon-map.ts` diff confirms 54 lines added (~23 new
Lucide entries); commit message claims each was checked against the installed
`lucide-react` package before use — plausible given `npm run typecheck`/`build` were
reported clean and an unresolved icon import would fail at compile time either way.
`sql-database`/`nosql-database` gained a real output port (previously `outputs: []`)
specifically to let a "replication" edge be drawn to a Read Replica — this is the
setup the next commit's `orphan-read-replica` rule depends on. `ConfigForm.tsx`'s label
derivation diff (8 lines) confirms a bare capitalize-first-letter was replaced with a
camelCase→spaced-Title-Case regex — plausible bug framing (every pre-existing config
field, `instances`/`algorithm`/`engine`, happens to be one word, so the gap was
invisible until multi-word fields like `ttlSeconds` arrived in this same commit).

**2. `7369432` "Add 5 config- and topology-aware validation rules."** Confirmed via
`git show --stat`: 11 files, 382 insertions, all new — five rule files plus five
matching `.test.ts` files under `src/validation-engine/rules/`, plus a diff to
`rules/index.ts` (+14 lines) registering all five in `ruleRegistry`, which previously
held only the original scaffold's `noDirectClientDatabase`. The five, per the commit
message: `single-instance-load-balancer` (warning, sums App Server `instances` config
across a Load Balancer's backends), `permissive-firewall` (warning, fires purely off
Firewall's `defaultPolicy` config, no topology), `split-brain-risk` (warning, >1 Leader
with no Coordinator), `queue-without-dead-letter-queue` (warning, only when Message
Queue's `deliveryGuarantee` can retry AND no DLQ is connected), `orphan-read-replica`
(error — first rule in the codebase to check `EdgeKind` specifically, requiring a
"replication"-kind edge rather than any edge, from a SQL/NoSQL Database into a Read
Replica; the `lib/graph.ts` `EdgeKind` type has existed since the original scaffold but
this is the first rule to ever read it). Severity split (one error, four warnings)
matches the commit message's own stated rationale: `orphan-read-replica` is
structurally certain to be broken (same class as the pre-existing
`noDirectClientDatabase`), the other four are real anti-pattern risk but not
definitively wrong in every context.

**Test count verified independently, not trusted from the commit message:** re-ran
`npm test -- --run` this pass — **8 test files, 25 tests, all passing**, exactly
matching the prior log entry's baseline (10 tests / 3 files) plus this round's claimed
15 new tests across 5 new files (10+15=25, 3+5=8). `npm run typecheck`/`lint`/`build`
were not independently re-run this pass (no code changes made during logging) but the
clean test run plus a direct read of `registry.ts` and `networking.ts` gives no reason
to doubt the commit messages' typecheck/lint/build claims.

**Real headless-browser verification — claimed, plausible, not re-driven in this
logging pass.** Per the commit's own account: used the same no-root Playwright
workaround logged several entries back (`apt-get download libnspr4 libnss3
libasound2t64` + `dpkg-deb -x` + `LD_LIBRARY_PATH`, re-derived fresh since scratchpad
doesn't persist across sessions) to confirm all 27 palette labels render with distinct,
correct icons (ruling out a silent fallback-icon-repeated-27-times bug), and to
exercise the actual Import → Validate flow end-to-end. Worth flagging the reported
two-attempt detail as a genuine, instructive test-script bug rather than a product bug:
the first import attempt used the flat domain `ArchitectureGraph`/`GraphNode` shape
(`{id, componentId, position, config}`) instead of React Flow's own nested shape the
app's Import feature actually expects (`{id, type: "component", position, data:
{componentId, config}}` for nodes, matching what `ExportMenu.tsx`'s
`handleExportJson` dumps) — produced blank/iconless nodes and zero violations, which is
consistent with `ComponentNode.tsx`'s `getComponent(data.componentId)` returning
`undefined` on the wrong shape and the component returning `null`, not with any rule
logic being broken (the unit tests already covered the correct domain shape and all
passed throughout). Second attempt with the correct shape reportedly produced exactly
the 4 expected violations (single-instance-load-balancer, permissive-firewall,
split-brain-risk, orphan-read-replica) with correct messages in the real Validate
dropdown, plus a Cache node's config form rendering the eviction-policy select and a
TTL number input bounded 1–86400 with the fixed spaced labels ("Eviction Policy", "Ttl
Seconds"). No screenshot or script artifact from this survives in the repo tree to
independently re-check (consistent with this file's established cleanup pattern) —
taken as reported, flagged as such per this log's convention.

**Repo state:** two commits this round, most recent first:
- `7369432` "Add 5 config- and topology-aware validation rules"
- `370c789` "Expand component registry to the full 27-component catalog"

`git status` shows a clean working tree. **Not yet pushed** — confirmed via `git log
origin/main..HEAD`: branch is ahead of `origin/main` by 2 commits (on top of the 3
already-unpushed commits from the previous entry, so `origin/main` is now 5 commits
behind `HEAD`, still sitting at `b6ee6d0`).

**Next steps:** push the now-5 unpushed commits. Milestone 4 (Home / mode-select page)
remains next per `MILESTONES.md` — unaffected by this round's content-only work. The
27-component catalog and its 5 new rules are themselves a big step into milestone 6
(curriculum/chapter content) territory even though no chapter yet references most of
these components by `availableComponentIds` — worth checking `MVP_SCOPE.md`'s two-chapter
requirement against which of the 27 actually get used before assuming this closes that
milestone. The `--zone` custom-property mystery remains open and untouched.
