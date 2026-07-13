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
