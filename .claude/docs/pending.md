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
- **Phases 2–5: not started.** Detailed below, in spec order (also the recommended
  execution order — see "Sequencing" at the end).

## Decisions already made that apply across all remaining phases

- **shadcn/ui was deliberately deferred out of Phase 1**, specifically so Phase 2 (which
  the spec explicitly mandates shadcn for) sets up `components.json` against a real
  need instead of a tab strip. **Phase 2 is where shadcn gets installed.** If Phase 4 or
  5 is tackled before Phase 2 for some reason, pull the shadcn bootstrap forward.
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

1. If Phase 2 already ran, shadcn is installed — add `npx shadcn@latest add
   dropdown-menu` and use it here instead of hand-rolling a third dropdown pattern
   (optional cleanup, not spec-required, but a natural point to stop duplicating this
   logic a third time). If Phase 2 hasn't run yet, hand-roll consistent with
   `ExportMenu.tsx`'s existing pattern — don't block Phase 5 on shadcn.
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

---

## Phase 6 - Highlighting of selected nodes 

### Current state

  - currently there is not way to distinguish between selected artifacts like components, zones, 
    comments or flags from the ones that are not selected creating a confusion 
  - In complex diagrams the input and output edges of a selected component are not very clear

### Plan
  - Upon selection of any artifact (Component, Edge, Zone, Comments or Flags) it should glow Golden 
    (Golden such that it is visible in both dark and ligth themes)
  - When a component is selected, highlight only its directly connected incoming and outgoing edges. 
    Do not highlight any other components or indirectly connected edges.

## Sequencing

Recommended order matches the spec's own numbering and its real dependency graph:
**Phase 2 → Phase 3 → Phase 4 → Phase 5.** Phase 2 is the one prerequisite that
matters (shadcn install; Phase 4's Configure item needs its store action). Phases 3
and 5 have no hard dependency on each other or on 2/4 beyond the shadcn-install
sequencing note above — either could jump the queue if there's a reason to.
