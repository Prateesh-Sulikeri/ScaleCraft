# UI Overhaul — Pending Phases (2–5)

Tracks what's left of `.claude/docs/ScaleCraft_UI_Overhaul_Specification.md` after
Phase 1. Executing **one phase at a time**, branch `ui-overhaul`, stopping for review
between phases (per-user direction). Read this file before resuming — it's written so a
cold session can pick any phase back up without re-deriving the plan.

## Status

- **Phase 1 — Documentation Panel: DONE.** Docked, tabbed panel with minimize/restore,
  Focus Notes Mode, and a full rich-Markdown pipeline (headings/tables/code/mermaid/
  callouts/footnotes/collapsible sections) live in `src/canvas/docs-panel/`. Docs can
  come from the inline `ComponentDefinition.docs` string or an optional `docsFile` (a
  `public/docs/*.md` path, fetched client-side — see `DocsTabContent.tsx`). Toolbar
  Documentation toggle button and "Open Documentation" context-menu item both wired up.
  A shared `Tooltip` component (`src/app/Tooltip.tsx`, matches `Palette.tsx`'s existing
  tooltip visual language) replaced native `title` attributes in this subsystem.
- **Phase 2 — Inspector Redesign: DONE.** Permanent `NodeInspector.tsx` sidebar deleted;
  replaced with `NodeConfigPopover.tsx`, a Radix Popover anchored to the node's own
  live DOM rect (queried via React Flow's own `.react-flow__node[data-id]` convention,
  not the click point) — opens beside the node with `side="right"`, Radix's
  `avoidCollisions` flips/shifts it to stay on-screen near viewport edges. Live-update
  (judgment call #4 decided as option (a): no Save/Cancel buffering, `ConfigForm`
  unchanged). Two trigger points wired: double-click on a component node
  (`Canvas.tsx`), and a new "Configure" item in `ContextMenu.tsx`. Store gained a
  `configPopover: { nodeId, anchor } | null` slice mirroring `editingAnnotation`
  exactly, including cleanup on delete/undo/redo. Along the way, also fixed a
  pre-existing bug: `ContextMenu.tsx`'s outer panel had no viewport clamping (unlike
  `Flyout`/`AnnotationEditor`) and could render partly off-screen when right-clicking a
  node near the edge — now measures its actual rendered size in a `useLayoutEffect` and
  clamps via direct DOM style mutation (not React state, to satisfy the
  no-setState-in-effect lint rule) before paint.
- **shadcn was NOT installed via the CLI, despite the spec mandating shadcn for Phase
  2 — read this before assuming `components.json` exists for Phase 4/5.** The current
  `npx shadcn@latest init` (v4.13.1, "Nova" preset system) is destructive by default:
  verified in a scratch copy that it rewrites `globals.css` wholesale (OKLCH color
  tokens replacing this repo's hand-tuned `--background`/`--foreground`/category
  colors), adds a Geist font, and rewrites `layout.tsx`. That's incompatible with this
  repo's existing dark-mode-first design system (`.claude/docs/DESIGN_LANGUAGE.md`).
  Used the fallback pending.md's own Phase 2 plan already anticipated instead:
  hand-rolled `@radix-ui/react-popover` + a hand-written `cn()` helper
  (`src/lib/utils.ts`), with `src/components/ui/popover.tsx` styled to match this
  repo's existing `bg-panel`/`border-border` conventions instead of shadcn's default
  `bg-popover` tokens (which don't exist here). **Any later phase that wants another
  shadcn component (Phase 5's `dropdown-menu`) needs the same hand-roll treatment** —
  there's no `components.json`, and running `init` for real would still be destructive
  unless shadcn ships a less invasive preset by then. Worth re-checking the CLI's
  behavior before assuming this is permanent.
- **Phase 3 — Node Redesign: DONE, but not as originally planned.** The spec's
  Default/Configured config-state badge was tried, iterated on twice for being "too
  visually loud" (amber → muted parallelogram → smaller/no-caps parallelogram), and
  then dropped entirely per explicit user feedback ("I don't like the badges").
  `src/canvas/config-state.ts` (the `getNodeConfigState` shape/shallow-diff
  detector that drove it) is **deleted** — nothing else used it. **Current state**:
  `ComponentNode.tsx` shows label + instance name (both together, not either/or, per
  the original plan) + a one-line description (`data.description ?? definition.summary`
  — always shown, every component, not just no-config ones). No config-state
  indicator of any kind on the card. If a future badge attempt is ever revisited,
  don't reuse `--state-warning`/full-saturation category color or all-caps — all
  called out as "screaming" in review.
- **Components are now resizable**, same mechanism as Zone/Comment — a user ask that
  landed alongside Phase 3 review, not in the original spec. `store.ts`'s old
  `resizeAnnotation` action (position + width/height together in one update, the
  top/left-handle anchor fix) is renamed `resizeNode` and gained a `"component"`
  branch — "annotation" was never accurate for what's really just "apply a
  NodeResizer result," and covering a third node type made the misnomer worth fixing.
  `ComponentNodeData` gained optional `width`/`height` (undefined until the user
  actually drags a handle; width then defaults to the original fixed 200, height
  stays auto/content-driven — an un-resized card is pixel-identical to before this
  landed). `ComponentNode.tsx` renders a `NodeResizer` gated on `selected`,
  `minWidth={160}`/`minHeight={60}`, styled with the node's own category color (same
  `lineStyle`/`handleStyle` convention Zone/Comment use). Also added: a per-instance
  `description` field (`ComponentNodeData.description`, `updateNodeDescription` in
  store.ts) editable in `NodeConfigPopover.tsx`, seeded from `definition.summary` as
  its default text — a second user ask from the same review round, not spec-driven
  either.
- **Phases 4–5: not started.** Detailed below, in spec order (also the recommended
  execution order — see "Sequencing" at the end).
- The spec's example category-color table (Infrastructure→Blue, Networking→Green,
  Database→Purple, Messaging→Orange) does **not** match this repo's real category
  system. Always use the existing `categoryColorVar`/`categoryLabel`/`categoryOrder`
  in `src/canvas/category-colors.ts` (`networking | compute | data | caching |
  messaging | distributed-systems`), never invent new categories.
- No Playwright/browser-driving by Claude — user verifies manually via `npm run dev`.
  Run `npm run typecheck && npm run lint && npm run test` after each phase.

---

## Phase 2 — Inspector Redesign (permanent sidebar → contextual popover)

### Current state (verify against the file before editing — may drift)

- `src/canvas/NodeInspector.tsx` (~113 lines): a permanently docked `<aside>`, always
  present in `src/app/sandbox/page.tsx`'s `<main>` flex row (between `Canvas` and
  `DocsPanel`). Resizable via `useResizableWidth(384, 280, 560, "left")`
  (`src/lib/use-resizable-width.ts`), collapsible to 40px via local `collapsed` state —
  but never fully removed from the layout. Reads `selectedNodeId`/`nodes` from the
  store; body is an instance-name text input + `<ConfigForm definition value onChange>`
  (`ConfigForm.tsx` — reuse as-is, no changes needed there).
- Selection today: single-click sets `selectedNodeId` (`Canvas.tsx`'s
  `onNodeClick`, ~line 402) — the Inspector just reacts to that. **No
  `onNodeDoubleClick` handler exists anywhere yet.**
- `ContextMenu.tsx` already has Duplicate / Open Documentation / Delete for a node
  target — no "Configure" item yet.
- A directly analogous anchored-popover pattern already exists in the store for
  annotations: `editingAnnotation: { id: string; anchor: { x: number; y: number } } |
  null` + `openAnnotationEditor`/`closeAnnotationEditor` (`store.ts`, drives the
  Zone/Comment inline editor popup). **Mirror this exactly** for node config — don't
  invent a new pattern.
- `ComponentDefinition` has `configSchema` (a live `ZodType`) + `defaultConfig`, no
  explicit "this component has no real config" flag. Since `buildConfigSchema` always
  produces a `z.object(shape)` (`generate.ts`), detect "no configurable fields" via
  `Object.keys(configSchema.shape).length === 0` rather than adding new authored data.

### Plan

1. **shadcn bootstrap.** `npx shadcn@latest init`, then `npx shadcn@latest add
   popover`. If the CLI can't reach `ui.shadcn.com`'s component registry in this
   environment (npm registry access alone isn't sufficient — verify separately),
   fallback: hand-copy the Popover primitive (Radix-based, MIT, small) into
   `src/components/ui/popover.tsx`, add `@radix-ui/react-popover`,
   `class-variance-authority`, `clsx`, `tailwind-merge` to `package.json` directly, and
   hand-write `src/lib/utils.ts`'s `cn()` helper (`clsx` + `tailwind-merge`).
2. **Store**: add a `configPopover` slice mirroring `editingAnnotation`:
   ```ts
   configPopover: { nodeId: string; anchor: { x: number; y: number } } | null;
   openConfigPopover: (nodeId: string, anchor: { x: number; y: number }) => void;
   closeConfigPopover: () => void;
   ```
   Do **not** touch `selectedNodeId` — it's still used for single-click
   selection/highlight-ring and possibly keyboard delete; only the *permanent panel*
   tied to it goes away. Check `use-canvas-shortcuts.ts` for other `selectedNodeId`
   consumers before assuming it's Inspector-only.
3. **New component** `src/canvas/NodeConfigPopover.tsx` (shadcn `Popover`, anchored via
   the same fixed-position + full-screen click-catcher convention `ContextMenu.tsx`
   already uses, positioned "beside the node" — reuse the edge-flip logic already
   established in `Palette.tsx`'s `PaletteItem` tooltip / `ContextMenu.tsx`'s `Flyout`
   rather than inventing new positioning math). Body: instance-name input +
   `ConfigForm` — essentially `NodeInspector`'s current body, moved here. Render it
   from `Canvas.tsx` (co-located with `<ContextMenu>`, which already lives there) since
   both are node-anchored, screen-coordinate-driven overlays.
4. **Open judgment call — live-update vs. explicit Save/Cancel.** Today `ConfigForm`
   commits every field change immediately via `updateNodeConfig` (no buffering). The
   spec says the popover "automatically closes after save or cancel," which reads as
   more form-like than today's live-update. Two options, not yet decided:
   - (a) **Keep live-update.** Popover closes on outside-click/Escape/selecting
     another node; there's no real "cancel" since edits already committed as typed.
     Simpler, no `ConfigForm` changes. **Recommended** unless the live-update UX
     itself turns out to feel wrong in practice.
   - (b) **Buffer edits locally**, add explicit Save/Cancel buttons, commit to the
     store only on Save. Bigger change (befriends `ConfigForm`'s current shape less).
   Decide this explicitly when starting the phase — don't silently pick one.
5. **Trigger points**:
   - `Canvas.tsx`: add `onNodeDoubleClick={(event, node) => node.type === "component"
     && openConfigPopover(node.id, { x: event.clientX, y: event.clientY })}` on
     `<ReactFlow>`, mirroring the existing `onNodeContextMenu` handler right next to it.
   - `ContextMenu.tsx`: add a "Configure" `MenuItem` (e.g. `Settings`/
     `SlidersHorizontal` from `lucide-react`) for `target.type === "node"` component
     nodes only (not zone/comment/start — mirror the existing Lock/Unlock-vs-Docs
     branch already in that file), calling `openConfigPopover(target.id, { x: target.x,
     y: target.y })`.
6. **Delete `NodeInspector.tsx`** entirely; remove `<NodeInspector />` from
   `page.tsx`'s `<main>` — Canvas regains that width, `DocsPanel` becomes the sole
   right-side panel.

### Verification

Double-click a component node → popover opens beside it with name + config form;
right-click → Configure does the same; edits apply (mode depends on decision #4);
clicking away/Escape closes it; canvas no longer has a permanent right sidebar.

---

## Phase 3 — Node Redesign (compact metadata + config badges)

### Current state

`src/canvas/ComponentNode.tsx` (74 lines): fixed 200px card. Shows icon (tinted badge,
category color) + `definition.label` (bold) + **either** the custom instance name
(`data.name`, monospace) **or** `definition.summary` (muted one-liner) — never both,
and no config-state indicator at all today.

### Plan

1. **New file** `src/canvas/config-state.ts`:
   ```ts
   export type NodeConfigState = "no-config" | "default" | "configured";
   export function getNodeConfigState(definition: ComponentDefinition, config: unknown): NodeConfigState
   ```
   - `"no-config"`: `Object.keys(definition.configSchema.shape).length === 0` (same
     detection as Phase 2's popover-skip case — components like Client/CDN that have
     no real editable fields).
   - `"default"` vs `"configured"`: shallow key-by-key compare of `config` against
     `definition.defaultConfig` (every field kind — string/number/boolean/enum — is a
     flat primitive per `buildConfigSchema`, so no deep-equality library needed).
2. **`ComponentNode.tsx` changes**:
   - Remove the `definition.summary` line entirely (spec: "Remove long descriptions
     beneath nodes").
   - Show label **and** custom name together (both, not either/or) when `data.name` is
     set.
   - Add a badge row below the name(s):
     - `"default"` → yellow background, text "Default".
     - `"configured"` → background inherits the node's own category color
       (`categoryColorVar[definition.category]`, already imported in this file).
     - `"no-config"` → **no** Default/Configured badge at all — spec: "Display a
       concise descriptive label instead." **Open judgment call**: reuse a truncated
       `definition.summary` here (the one place summary still shows, only for
       no-config components), or add a new opt-in `ComponentConfigSpec` field (e.g.
       `fixedConfigLabel?: string`) authored per no-config component. Decide at
       implementation time; leaning toward reusing `summary` to avoid a new
       content-authoring field for a small subset of components.
3. Double-check `data-flag`/zone/comment/start nodes aren't affected — this is
   `ComponentNode.tsx` only, annotations render via their own components
   (`ZoneNode.tsx`/`CommentNode.tsx`/`StartNode.tsx`).

### Verification

Place a fresh node → yellow "Default" badge. Edit its config (via Phase 2's popover) →
badge switches to a pill in the node's own category color, labeled with the category
(or however the "Configured" state is worded — spec doesn't pin exact text, just the
color rule). A no-config component (e.g. Client) shows no badge, just its concise label.

---

## Phase 4 — Context Menu Additions (Configure / Center View / Highlight Connections)

Depends on Phase 2 for "Configure" (same `openConfigPopover` action) — if Phase 4 is
picked up before Phase 2, either do Phase 2's store/trigger-point work first or skip
the Configure item until Phase 2 lands.

### Current state

`ContextMenu.tsx` (289 lines): `MenuItem`/`Flyout` helpers, `ContextMenuTarget` union
(`node | edge | selection | pane`). Node case currently: Duplicate, Lock/Unlock
(annotations) or Open Documentation (components), Delete. Rendered from `Canvas.tsx`
(`menu` local state, `onNodeContextMenu`/`onEdgeContextMenu`/`onSelectionContextMenu`/
`onPaneContextMenu` on `<ReactFlow>`).

`Canvas.tsx` already calls `const { screenToFlowPosition, getNodes } = useReactFlow()`
(~line 80) inside the same component that renders `<ContextMenu>` — so a "Center
View" callback can be a plain prop passed straight into `<ContextMenu>`, no need to
thread anything through `CanvasHandle`/`page.tsx`. `CanvasHandle` (~line 65) currently
only exposes `exportImage` — leave it alone, this doesn't need to go through the ref.

No `centerOnNode`/`highlightConnections` concept exists anywhere yet — both are new.

### Plan

1. **Configure**: add a `MenuItem` for `target.type === "node"` (component nodes
   only) calling `openConfigPopover` (Phase 2's action) — same anchor `{x, y}` the
   menu itself already has.
2. **Center View**: in `Canvas.tsx`, add a `centerOnNode = (nodeId: string) =>
   fitView({ nodes: [{ id: nodeId }], duration: 300, maxZoom: 1.2 })` using the
   already-destructured `fitView` from `useReactFlow()` (note: the declarative
   `fitView` prop on `<ReactFlow>` at ~line 443 is unrelated/no conflict — this is the
   hook's separate imperative function). Pass `centerOnNode` down as a prop to
   `<ContextMenu>`; add a `MenuItem` calling it for the node case.
3. **Highlight Connections** — the most design-heavy item left in the whole overhaul,
   budget real exploration time:
   - Store: `highlightedNodeId: string | null` + `setHighlightedNodeId`/
     `clearHighlight`.
   - `Canvas.tsx` (or a small selector) computes the connected node-id/edge-id sets
     from `highlightedNodeId` + `edges` each render, and needs to feed a "dimmed"
     signal into `ComponentNode.tsx` and edge styling (`edgeStyle()` in `store.ts`) —
     likely via each node/edge's own `style`/`className`, computed where the
     `nodes`/`edges` arrays are already assembled for `<ReactFlow>`, not by having
     `ComponentNode.tsx` read the store directly (avoids every node subscribing to a
     highlight state that only matters for a few of them at a time).
   - Clear the highlight on: pane click (already has a handler), Escape, or
     right-clicking a different node. Add a `MenuItem` "Highlight Connections" for
     the node case that calls `setHighlightedNodeId(target.id)`.
   - Only meaningful for component nodes with actual edges — consider a no-op or
     disabled state for an orphan node, though the spec doesn't require this explicitly.
  - currently there is not way to distinguish between selected artifacts like components, zones, 
    comments or flags from the ones that are not selected creating a confusion, on normal left click 
    on a node highlight it a bit (we already have Highlight Connnections, this will just illuminate 
    the current node making it clear that it was selected or clicked on)

### Verification

Right-click a connected node → Configure/Center View/Highlight Connections all
present; Center View pans/zooms to frame it; Highlight Connections dims everything
except that node and its direct neighbors/edges; clicking empty canvas clears the
highlight.

---

## Phase 5 — Toolbar Consolidation (Import/Export → one Project dropdown)

### Current state

- `src/app/ExportMenu.tsx` (150 lines): hand-rolled dropdown, "Export as JSON"
  (`exportCanvasAsJson()` from `src/canvas/export-json.ts`) + "Export as image"
  (PNG/JPG via `canvasRef.current.exportImage()`, background-color picker).
- Import is **not** a menu — it's a plain button + hidden `<input type="file">` inlined
  directly in `src/app/sandbox/page.tsx` (`handleImportFile`, `importInputRef`,
  `importError` state).
- `src/app/BoardMenu.tsx` (Clear board / Restore last save) is a **separate,
  unrelated** dropdown — the spec's "Project" dropdown only asks to merge
  Import/Export, not Board. Leave `BoardMenu.tsx` alone unless later told otherwise.
- No shared `DropdownMenu` primitive exists — `ExportMenu`/`BoardMenu`/`ContextMenu`'s
  `Flyout` each hand-roll their own backdrop-click-to-close pattern independently.

### Plan

1. Phase 2 ran but did **not** install shadcn via the CLI (see "Decisions already made"
   above — the current CLI's default preset rewrites `globals.css` destructively).
   There's no `components.json`. Either hand-roll a dropdown consistent with
   `ExportMenu.tsx`'s existing pattern (simplest, matches what Phase 2 did for
   Popover), or re-check whether shadcn's CLI has a non-destructive path by the time
   this phase is picked up and hand-copy just the `dropdown-menu` primitive
   (`@radix-ui/react-dropdown-menu` + the same `cn()` helper) the way Phase 2 did for
   Popover if so. Don't block Phase 5 on shadcn either way.
2. **New component** `src/app/ProjectMenu.tsx` replacing `ExportMenu.tsx`, folding in
   the import handler currently inlined in `page.tsx`:
   - Import Project (moves `handleImportFile`/`importInputRef`/hidden `<input>`/
     `importError` display here from `page.tsx`, same logic unchanged)
   - Export Project (JSON) — same `exportCanvasAsJson()` call
   - Export Image — keep PNG/JPG + background picker, likely as a nested flyout given
     it already has its own sub-options (mirror `ContextMenu.tsx`'s `Flyout` submenu
     pattern for this rather than a new mechanism)
   - **Do not** add Export PDF / Export Markdown items — spec marks both "(future)";
     per this repo's "no half-finished implementations" convention, omit them
     entirely rather than adding disabled placeholders.
3. `page.tsx`: replace `<ExportMenu canvasRef={canvasRef} />` + the inline Import
   button/hidden input with `<ProjectMenu canvasRef={canvasRef} />`; delete
   `ExportMenu.tsx`.

### Verification

Single "Project" dropdown button in the toolbar; Import/Export JSON/Export image all
still work exactly as before, just consolidated; no separate Import button remains.

## Sequencing

Recommended order matches the spec's own numbering and its real dependency graph:
**Phase 2 → Phase 3 → Phase 4 → Phase 5.** Phases 2 and 3 are both done — Phase 4's
Configure item needs `openConfigPopover` (from Phase 2), which now exists. Phase 5 has
no hard dependency on 2/3/4 — could jump the queue if there's a reason to.
