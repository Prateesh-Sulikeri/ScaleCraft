# UI Overhaul Part 2 — Implementation Specification

**Status:** approved plan, not implemented. **Author:** staff-architect planning pass, 2026-07-22.
**Executor:** Sonnet. This document is written so implementation requires minimal new
architectural decisions — where a choice was open, it has been made and the rationale
recorded. Follow the phases in order; every phase leaves the app working.

**Objective:** make the canvas the primary focus. In Sandbox, the permanent left
Components sidebar is removed and replaced by a centered **Component Picker** opened by
right-click on the canvas or by pressing `/`. In Building Blocks and Real World
Extraction (chapter modes), the left sidebar stays but becomes a two-view **Chapter
Sidebar** (Chapter List ⇄ Question Pane), one shared implementation for both modes.

---

## 1. Current architecture summary (only what this feature touches)

Verified against the working tree on branch `development` (2026-07-22). The progress log
ends 2026-07-15; everything below was re-verified from current files, not old docs.

### Routes / modes
- `/` — Home mode-select canvas (`HomeCanvas.tsx`, `ModeNode.tsx`). Only the Sandbox
  card is a live `<Link>`; Building Blocks and RWE cards are **disabled divs**.
- `/sandbox` — the entire app experience (`src/app/sandbox/page.tsx`, 277 lines).
- **No chapter routes exist.** `src/content/chapters/` holds only `types.ts`
  (`ChapterDefinition`, `Hint`) — milestone 6 (chapter framework) has not started.
  `src/lib/modes.ts` already defines `AppMode`, labels, taglines, and `--mode-*` color
  vars for all three modes; `ModeBadge` renders any mode.

### Left sidebar (what gets replaced/redesigned)
- `src/app/QuestionPanel.tsx` (78 lines) — the left `<aside>`: collapsible
  (width-transition pattern), resizable via `useResizableWidth(320, 220, 480, "right")`,
  Home link, an `intro` text slot, and it mounts `<Palette />`. Its own doc comment
  anticipates chapters landing in the intro slot.
- `src/canvas/Palette.tsx` (477 lines) — searchable, category-grouped tile grid.
  Contains: search input + `grouped` memo (filter by label/summary, group by
  `categoryOrder`), `PaletteItem` (drag source via `PALETTE_DRAG_TYPE` MIME type,
  portaled tooltip), a 4-button toolbar (**Add zone / Add comment / Add Flag / New
  component**), custom-component edit/delete (Pencil/Trash hover buttons +
  `DeleteConfirmPopover` with usage-count guard), and the `CreateComponentModal` mount.
  Merges `componentRegistry` + store `customComponents.map(toComponentDefinition)`.

### Component insertion paths (all end at `store.addNode(definition, position)`)
1. HTML5 drag from palette → `Canvas.tsx` `onDrop` (`PALETTE_DRAG_TYPE` →
   `getComponent(id)` → `screenToFlowPosition` → `addNode`), `Canvas.tsx:494-504`.
2. Pane right-click → `ContextMenu.tsx` pane branch → nested `Flyout` (category →
   component) → `addNode(definition, target.flowPosition)`.
3. Palette tile *click* does nothing (known critique finding).

### Keyboard shortcut infrastructure
- `src/canvas/use-canvas-shortcuts.ts` — one window `keydown` hook mounted by
  `sandbox/page.tsx`: Ctrl/Cmd+S/E/Z/Shift+Z/Y. Exports `isEditableTarget()` (input/
  textarea/select/contentEditable guard) — **reuse this for the `/` trigger**.
- `src/app/ShortcutsButton.tsx` — static `SHORTCUTS` array rendered in a header
  dropdown. Must be updated when shortcuts change.
- `Canvas.tsx` has its own Escape listener gated on `placementMode` (cancel placement).
- Known critique P1: Esc doesn't close ProjectMenu / CreateComponentModal; the legend
  overpromises. There is **no shared escape-to-close hook** today.

### Relevant store patterns (`src/canvas/store.ts`, Zustand)
- UI-overlay state lives in the store as `X | null` + `openX/closeX` actions:
  `configPopover: { nodeId, anchor } | null` (cleared defensively on node deletion,
  clear-board, load), `annotationEditor`, `placementMode`, `highlight`, docs-panel
  state. **The Component Picker should follow this exact pattern.**
- `Canvas` wraps `FlowCanvas` in `ReactFlowProvider`; overlays needing
  `screenToFlowPosition`/`fitView` mount inside it (`EdgeInspector`, `ContextMenu`,
  `NodeConfigPopover`, `AnnotationEditor` all mount at the bottom of `FlowCanvas`).

### Design-system constraints (DESIGN.md is the source of truth)
- Floating menus: raised-panel bg, hairline border, 6px radius, `floating-menu` shadow,
  full-viewport transparent click-catcher backdrop — never escape-only dismissal.
- Search input spec exists (§ Search Input). Palette Tile spec exists.
- Accessibility section is explicit: keyboard completability of the primary workflow,
  aria-labels on icon buttons, `aria-live` for dynamic results, focus indicators,
  reduced-motion variants. The picker is the chance to fix the critique's "no keyboard
  path to add components" (Alex persona) — treat those as requirements, not extras.
- Z-index tokens: use `--z-modal-backdrop` / `--z-modal` (defined in `globals.css`);
  do not add raw `z-50` (pending.md flags the incomplete token migration — don't make
  it worse).

### Product principles that bind this feature
- Hints are **opt-in only, never auto-surfaced** — the Question Pane's hints section
  must be collapsed/hidden behind a deliberate user action, with no attempt-count
  nudging.
- Components are never forked per chapter — chapter modes *filter* the registry via
  `ChapterDefinition.availableComponentIds`; the picker must accept a filter, not a
  different component list implementation.
- Single-player, not a game; motion communicates state only.

---

## 2. Proposed architecture

### 2.1 New UI flow

**Sandbox:** no left sidebar at all — the canvas spans the full width under the header.
Component insertion:
- **Right-click on empty canvas** → Component Picker opens **centered on screen**;
  the click's flow position is remembered as the insertion point.
- **`/` anywhere** (outside text fields) → same picker, centered; insertion point is
  the center of the current viewport.
- Picker: search bar (auto-focused) → components grouped by category → click or
  ArrowUp/Down + Enter inserts → picker closes. Esc or backdrop click closes without
  inserting.
- The picker also contains a final **"Tools" group**: Add zone, Add comment, Add flag,
  New component… — these replace the palette toolbar so no existing capability is lost,
  and (for the first time) become keyboard-reachable.
- Node / edge / selection right-click menus are **unchanged**. Only the pane
  context-menu branch is replaced by the picker.

**Building Blocks (`/building-blocks`) and RWE (`/real-world-extraction`):** the left
sidebar remains, redesigned as one shared `ChapterSidebar` with two views:
- **View 1 — Chapter List:** expandable/collapsible sections (data model supports one
  nesting level via an optional `group` field on the chapter list entry; render flat if
  no groups exist). Selecting a chapter transitions to View 2.
- **View 2 — Question Pane:** problem statement (Markdown), learning objectives,
  progress (required components present / last validation status), **opt-in** hints,
  prev/next chapter navigation, and a "← All chapters" back control returning to View 1.
- Chapter modes get **no palette either** — the same Component Picker serves insertion,
  filtered to the chapter's `availableComponentIds`. This is the reuse story: one
  picker, one sidebar shell, three modes.

Since the chapter framework (milestone 6) hasn't started, the chapter routes ship as a
minimal shell running against **one throwaway dummy `ChapterDefinition` per mode** —
exactly milestone 6's own "done when" criterion. Real content is milestone 7/8 scope.

### 2.2 Component hierarchy

```
sandbox/page.tsx
└─ Canvas (ReactFlowProvider)
   └─ FlowCanvas
      ├─ ContextMenu (pane branch simplified)
      ├─ ComponentPicker   ← NEW, mounted here (needs screenToFlowPosition sibling access via store)
      └─ …existing overlays

building-blocks/page.tsx ─┐
real-world-extraction/page.tsx ─┴─ ChapterWorkspace (mode prop)   ← NEW shared client component
                                   ├─ header (reuses ModeBadge, ValidationIndicator, etc.)
                                   ├─ SidebarShell  ← extracted from QuestionPanel (collapse+resize chrome)
                                   │  └─ ChapterSidebar
                                   │     ├─ ChapterList   (view 1)
                                   │     └─ QuestionPane  (view 2)
                                   │        └─ HintsSection (opt-in reveal)
                                   └─ Canvas (same as sandbox)
```

### 2.3 State flow

- **Picker state → canvas store** (matches `configPopover` precedent):
  ```ts
  componentPicker: { flowPosition: XY } | null;
  openComponentPicker: (flowPosition: XY) => void;
  closeComponentPicker: () => void;
  ```
  Opened from `FlowCanvas` (`onPaneContextMenu`) and from the `/` key handler in
  `use-canvas-shortcuts.ts` — the store gives both access without prop drilling.
  Because the `/` handler lives outside `ReactFlowProvider`, it cannot compute a flow
  position; instead `openComponentPickerAtViewportCenter` is a small helper inside
  `FlowCanvas` — simplest resolution: the shortcut sets `componentPicker: { flowPosition: null }`
  and `FlowCanvas`'s picker mount resolves `null` → `screenToFlowPosition(center of its
  own container rect)` at insert time. Type it as `{ flowPosition: XY | null }`.
  Clear it in the same defensive spots `configPopover` is cleared (clear board, load).
- **Search/filter/group logic → extracted pure helper** `src/canvas/component-search.ts`:
  `filterAndGroupComponents(all: ComponentDefinition[], query: string)` — lifted
  verbatim from Palette's `grouped` memo so the picker and any future consumer share it.
- **Available-component filtering:** picker reads an optional
  `availableComponentIds: string[] | null` from the store (new field, default `null` =
  all). Chapter pages set it on chapter select; sandbox never sets it. This keeps the
  picker chapter-agnostic and honors the no-forking principle.
- **Chapter state (page-level, not the canvas store):** `ChapterWorkspace` holds
  `selectedChapterId: string | null` in React state (list view when `null`). No
  persistence, no routing per chapter yet — that's milestone 6/9 scope. The canvas
  store stays chapter-ignorant except for `availableComponentIds`.

### 2.4 Interaction model (picker)

- `role="dialog"` + `aria-modal="true"`; inner list `role="listbox"` with
  `aria-activedescendant`; search input `role="combobox"` semantics.
- Open: focus goes to search input. Close: focus returns to the canvas wrapper.
- ArrowDown/ArrowUp move a flat active index across the grouped results (groups are
  visual only); Home/End jump; Enter inserts the active item; Esc closes; typing
  filters live. Mouse hover moves the active index (no dual-highlight state).
- Backdrop is the standard full-viewport click-catcher at `z-[var(--z-modal-backdrop)]`;
  panel at `z-[var(--z-modal)]`, centered via `fixed inset-0 grid place-items-center`
  on a wrapper, width ~560px, `max-h-[70vh]` with the list scrolling internally.
- Visuals: reuse the Palette Tile look for row icons (category-color border/tint at
  smaller scale) but rows are **full-width list rows** (icon + label + summary), not a
  tile grid — keyboard listboxes want rows. Follows DESIGN.md "Dropdown / Context
  Menus" surface language.
- Custom components appear via the same merged list; rows for custom components show
  Pencil/Trash on hover **and focus**, reusing `CreateComponentModal` and
  `DeleteConfirmPopover` (both move/import cleanly).
- Empty state: reuse Palette's "No components match "query"." line.
- Reduced motion: no entrance animation beyond a 150ms opacity fade,
  `motion-reduce:transition-none`.

### 2.5 Reuse strategy (explicit)

| Existing asset | Reused how |
|---|---|
| `store.addNode(definition, position)` | Unchanged — picker's only insertion API |
| `componentRegistry` + `customComponents` merge | Same merge expression, moved into picker (and `component-search.ts` consumer) |
| Palette `grouped` memo | Extracted to `component-search.ts`, used by picker |
| `categoryOrder/categoryLabel/categoryColorVar`, `iconMap` | Unchanged, imported by picker |
| `isEditableTarget` (`use-canvas-shortcuts.ts`) | Guards the `/` trigger |
| `use-canvas-shortcuts.ts` keydown hook | Gains the `/` case |
| `configPopover` store pattern | Template for `componentPicker` slice |
| Click-catcher backdrop convention | Picker dismissal |
| `QuestionPanel` collapse/resize chrome | Extracted to `SidebarShell`, shared by chapter sidebar |
| `useResizableWidth` | Unchanged, used by `SidebarShell` |
| `sandbox/page.tsx` header composition | Copied into `ChapterWorkspace` (see Recommendations for why not extracted yet) |
| `ModeBadge`, `modes.ts` | Unchanged, chapter pages pass their mode |
| `MarkdownRenderer` (docs panel) | Renders problem statements and hint bodies |
| `CreateComponentModal`, `DeleteConfirmPopover` | Re-homed to picker's Tools group / custom rows |
| `ChapterDefinition` type | Unchanged; dummy content conforms to it |

---

## 3. File-level implementation plan

### New files

| File | Purpose | Complexity |
|---|---|---|
| `src/canvas/component-search.ts` | Pure `filterAndGroupComponents(all, query)` helper extracted from Palette | Low |
| `src/canvas/ComponentPicker.tsx` | The centered picker: search, grouped listbox, keyboard nav, Tools group, custom edit/delete | **High** (the core of this feature) |
| `src/canvas/component-search.test.ts` | Unit tests for filter/group (query hit on label/summary, empty result, category ordering, allowlist filter) | Low |
| `src/app/SidebarShell.tsx` | Collapse+resize+Home-link `<aside>` chrome extracted from `QuestionPanel` | Medium |
| `src/chapters/ChapterSidebar.tsx` | View switcher (list ⇄ question) | Low |
| `src/chapters/ChapterList.tsx` | Expandable/collapsible chapter list (optional `group` sections) | Medium |
| `src/chapters/QuestionPane.tsx` | Problem statement, objectives, progress, opt-in hints, prev/next, back | Medium |
| `src/chapters/ChapterWorkspace.tsx` | Shared page body for both chapter modes (header + SidebarShell + Canvas), holds `selectedChapterId`, sets/clears `availableComponentIds` | Medium |
| `src/app/building-blocks/page.tsx` | Thin route: `<ChapterWorkspace mode="building-blocks" />` | Low |
| `src/app/real-world-extraction/page.tsx` | Thin route: `<ChapterWorkspace mode="real-world-extraction" />` | Low |
| `src/content/chapters/index.ts` | `chapterRegistry: ChapterDefinition[]` + one dummy chapter per mode (throwaway, per milestone 6) | Low |

### Modified files

| File | Why / what changes | Deps | Complexity |
|---|---|---|---|
| `src/canvas/store.ts` | Add `componentPicker` slice (+ `availableComponentIds: string[] | null` + setter). Clear picker in `clearBoard`/`loadGraph`/`loadCanvasState` alongside `configPopover`. | none | Low |
| `src/canvas/Canvas.tsx` | `onPaneContextMenu` → `openComponentPicker(flowPosition)` instead of `setMenu({type:"pane"…})`; mount `<ComponentPicker />` beside the other overlays; resolve `flowPosition: null` → viewport center. Keep `onDrop`/`onDragOver` (harmless, zero-cost). | store slice | Medium |
| `src/canvas/use-canvas-shortcuts.ts` | Add `/` case: `if (!mod && key === "/" && !isEditableTarget(e.target)) { preventDefault(); openComponentPicker(null-position); }`. Note the hook currently early-returns when `!mod` — restructure that guard. | store slice | Low |
| `src/canvas/ContextMenu.tsx` | Delete the `pane` branch + both `Flyout` levels for Add-component (Flyout itself can be deleted if nothing else uses it — verify), and the `"pane"` member of `ContextMenuTarget`. Comment/flag quick-adds move into the picker's Tools group. | ComponentPicker exists first | Medium |
| `src/canvas/Palette.tsx` | Shrinks drastically: `PaletteItem` grid, search, toolbar all superseded by the picker. Either delete outright (preferred — see Removals) or reduce to re-exports during transition. `PALETTE_DRAG_TYPE` and `DeleteConfirmPopover` must survive — move `PALETTE_DRAG_TYPE` to `component-search.ts` or `Canvas.tsx`; move `DeleteConfirmPopover` into `ComponentPicker.tsx` (its only remaining consumer). | picker done | Medium |
| `src/app/QuestionPanel.tsx` | Superseded: sandbox no longer renders it; chapter modes use `SidebarShell` + `ChapterSidebar`. Delete after extraction. | SidebarShell | Low |
| `src/app/sandbox/page.tsx` | Remove `<QuestionPanel …>` mount; canvas column becomes full width. Add a dismissible empty-canvas hint (small pill, same style as `PLACEMENT_HINT`) teaching "Right-click or press / to add components" — without this, insertion becomes undiscoverable (critique heuristic 6 is already at 2/5). | picker done | Low |
| `src/app/ShortcutsButton.tsx` | Add `{ keys: "/", label: "Add component" }` (and "Right-click canvas — Add component" if desired). | — | Low |
| `src/app/HomeCanvas.tsx` / `ModeNode.tsx` | Enable the Building Blocks and RWE cards as real `<Link>`s to the new routes (currently disabled divs). | routes exist | Low |
| `DESIGN.md` | Document the picker (new "Command Picker" component section) and the chapter sidebar per the design-iteration workflow. | end | Low |

### Removals (after their replacements land)

- `src/canvas/Palette.tsx` (contents absorbed: search→picker, toolbar→picker Tools,
  custom edit/delete→picker rows, `DeleteConfirmPopover`→picker file).
- `src/app/QuestionPanel.tsx` (chrome→`SidebarShell`, intro slot→`QuestionPane`).
- `ContextMenu.tsx` pane branch + `Flyout` (if unreferenced after removal).
- HTML5 drag-from-palette path: `onDrop`/`onDragOver`/`PALETTE_DRAG_TYPE` become dead
  once Palette is gone. **Decision: delete them in the same phase as Palette** — dead
  insertion paths are exactly the churn this project avoids. (If the user later wants
  drag-out-of-picker, that's a new feature, not this one.)

---

## 4. Execution phases (each independently shippable)

**Phase 1 — Extract shared search logic.**
Create `component-search.ts` + tests; refactor `Palette.tsx` to consume it. Zero
behavior change. Gate: `npm run typecheck && npm test -- --run && npm run build`.

**Phase 2 — Component Picker, additive.**
Store slice + `ComponentPicker.tsx` + mount in `FlowCanvas` + `/` shortcut +
ShortcutsButton entry. Pane right-click **still opens the old context menu**; picker is
reachable via `/` only. Sidebar untouched. Gate: `/` opens centered picker, search +
arrows + Enter insert at viewport center, Esc/backdrop close, focus returns to canvas;
existing tests green.

**Phase 3 — Make the picker primary in Sandbox.**
`onPaneContextMenu` → picker (with click-point insertion); add Tools group (zone/
comment/flag/new-component) and custom-component edit/delete rows to the picker; strip
the pane branch from `ContextMenu.tsx`; remove `QuestionPanel` from `sandbox/page.tsx`;
add the empty-canvas discoverability hint; delete `Palette.tsx` + drag path, re-homing
`DeleteConfirmPopover`/`CreateComponentModal` mounts. Gate: full sandbox regression
(insert via right-click and `/`, annotations still placeable, custom component
create/edit/delete round-trip, save/reload).

**Phase 4 — SidebarShell extraction.**
Extract collapse/resize chrome from `QuestionPanel` into `SidebarShell`. (If Phase 3
already deleted QuestionPanel, extraction happens from git history / the same commit —
sequence Phases 3 and 4 however produces less churn, but keep the commits separate.)

**Phase 5 — Chapter shell.**
`src/content/chapters/index.ts` (one dummy chapter per mode), `ChapterSidebar` +
`ChapterList` + `QuestionPane` + `ChapterWorkspace`, the two thin routes, store's
`availableComponentIds` wired into the picker filter. Hints strictly opt-in (collapsed
"Show hint" per hint, no auto-expand). Gate: `/building-blocks` renders list → select
→ question pane → back; picker in chapter mode shows only `availableComponentIds`;
sandbox unaffected.

**Phase 6 — Home wiring + polish.**
Enable the two mode cards on Home; DESIGN.md updates; run `/impeccable critique` per
the design-iteration workflow.

---

## 5. Risks & edge cases

**UI regressions**
- Palette removal deletes the *only always-visible* insertion affordance. Mitigation is
  mandatory, not optional: the empty-canvas hint pill (Phase 3) + updated header
  ShortcutsButton entry + the intro copy that used to live in QuestionPanel.
- Zone/comment/flag placement buttons currently live in the palette toolbar — verify
  the picker Tools group covers all four, and that `placementMode` (drag-to-draw)
  still works when initiated from the picker (picker must close *before* placement
  mode's overlay activates).
- `ContextMenu` pane-branch removal: the "Add comment here"/"Add flag here" items had
  position-specific insertion (`target.flowPosition`). Picker Tools should do the same
  (use the stored `flowPosition`), or those actions regress to center-placement.

**Keyboard & focus**
- `/` in Firefox triggers Quick Find — `preventDefault()` required, and only when
  `!isEditableTarget`.
- The `use-canvas-shortcuts` hook currently returns early unless Ctrl/Cmd is held;
  the `/` case must be added *before* that guard.
- Escape stacking: `Canvas.tsx`'s Escape listener (placement cancel) and the picker's
  Escape must not both fire. Picker's handler should run first and stop propagation
  (or check `componentPicker !== null` in the canvas listener, mirroring the existing
  `placementMode` gate).
- Focus restore on close: return focus to the React Flow pane wrapper so Delete/
  arrow-key node operations resume without a click.
- This is the app's first true keyboard-navigable listbox — get
  `aria-activedescendant` + scroll-into-view right (`scrollIntoView({ block:
  "nearest" })` on active-index change).

**Accessibility**
- Picker announces result count on filter (`aria-live="polite"` counter, per DESIGN.md
  ARIA rules).
- Chapter list expand/collapse: real `<button aria-expanded>` sections.
- Hints reveal: `aria-expanded` toggle; never rendered pre-expanded (product principle,
  not just a11y).

**State synchronization**
- `componentPicker` must be cleared wherever `configPopover` is defensively cleared
  (clear board, loads) — copy the existing pattern.
- `availableComponentIds` must reset to `null` when leaving a chapter page
  (`useEffect` cleanup in `ChapterWorkspace`) or Sandbox inherits a filtered picker —
  this is the single most likely cross-mode bug.
- The canvas store is a module singleton shared across routes; navigating
  Sandbox → Building Blocks keeps the sandbox graph mounted. For the dummy-chapter
  shell this is acceptable (flag to user), but do not persist chapter canvases into
  `SANDBOX_SAVE_ID` — chapter modes should skip the sandbox autol-load/save wiring
  (Phase 5 keeps Save disabled or in-memory only; real chapter persistence is
  milestone 9).

**Performance**
- 27 + custom components: filtering is trivial; no virtualization needed. Do not add
  one.
- Known pre-existing issue (pending.md): `sandbox/page.tsx` stringifies the graph every
  render. Not in scope — but don't copy that pattern into `ChapterWorkspace`; memoize
  the graph key there from the start.

**Licensing/product**
- None new. Picker is keyboard-first, which *improves* the critique's Alex/Sam persona
  scores.

---

## 6. Recommendations (natural fits, no gratuitous refactors)

1. **Introduce one `useEscapeToClose(onClose)` hook** in `src/lib/` and use it for the
   picker; migrating the other popovers to it fixes the critique's P1 "the legend lies
   about Esc" almost for free. Migration of existing menus can be its own small
   follow-up commit inside Phase 3.
2. **Do not extract the sandbox header into a shared component yet.** `ChapterWorkspace`
   copying ~60 lines of header JSX is cheaper than prematurely abstracting a header
   whose chapter-mode contents (validation semantics, save behavior) will diverge at
   milestone 6 proper. Revisit when chapter validation lands.
3. While deleting the ContextMenu pane branch, fix nothing else there — the conditional
   -hooks history in that file (see pending.md P0 note) says keep diffs surgical.
4. Log a `PROGRESS_LOG.md` entry via the logging subagent after Phases 3 and 5 (the
   convention has lapsed since 2026-07-15 — pending.md flags this; this work should not
   widen the gap).
5. After each phase: `graphify update .` (hooks are installed; keeps queries fresh).

---

## 7. Acceptance criteria

**Sandbox**
- [ ] No left sidebar; canvas fills the width between header and edges.
- [ ] Right-click on empty canvas opens the picker centered on screen; chosen
      component is inserted at the right-clicked canvas position.
- [ ] `/` opens the identical picker; insertion lands at the current viewport center.
- [ ] `/` does nothing while typing in any input/textarea/select/contentEditable.
- [ ] Picker: search filters across built-in + custom components; results grouped by
      category in `categoryOrder`; empty-state message on no match.
- [ ] Full keyboard path: `/` → type → arrows → Enter → node appears → Esc-free close;
      Esc and backdrop click both dismiss with no insertion.
- [ ] Tools group covers Add zone / Add comment / Add flag / New component, each
      behaving as the old palette toolbar did (placement modes still cancel on Esc).
- [ ] Custom components: create, edit, delete (with in-use guard popover) all reachable
      from the picker.
- [ ] Node/edge/selection right-click menus unchanged; node double-click config
      popover unchanged; save/export/undo/redo/validate unchanged.
- [ ] Shortcuts legend lists `/`; Esc claim in the legend is true for the picker.
- [ ] Save → reload round trip unaffected.

**Chapter modes**
- [ ] `/building-blocks` and `/real-world-extraction` render the shared sidebar:
      chapter list (expandable sections) → question pane on select → back control
      returns to the list.
- [ ] Question pane shows problem statement (Markdown), objectives, progress line,
      prev/next; hints render **only** after a deliberate per-hint reveal click.
- [ ] Picker in a chapter shows only that chapter's `availableComponentIds`;
      returning to Sandbox shows the full registry again.
- [ ] Sidebar collapse + resize behave exactly as the old QuestionPanel (40px strip,
      220–480px drag range, width transition, reduced-motion respected).
- [ ] Home page cards for both chapter modes are live links.
- [ ] One shared sidebar implementation — zero duplicated sidebar code between the two
      modes (single `ChapterWorkspace`/`ChapterSidebar`).

**Quality gates (every phase)**
- [ ] `npm run typecheck`, `npm run lint`, `npm test -- --run`, `npm run build` all
      clean (lint: the one pre-existing `react-hooks/incompatible-library` warning in
      `CreateComponentModal.tsx` is accepted).

## 8. Testing checklist

Unit (vitest):
- [ ] `component-search.test.ts`: label match, summary match, case-insensitivity,
      category ordering, empty result, `availableComponentIds` filtering.
- [ ] Store: `openComponentPicker`/`close`, cleared by `clearBoard`/`loadCanvasState`;
      `availableComponentIds` set/reset.
- [ ] Existing suites stay green (30 tests / 8 files baseline, minus any Palette-
      specific tests that get retargeted at the picker).

Browser (headless Chromium — no-root workaround documented in PROGRESS_LOG 2026-07-13:
`apt-get download libnspr4 libnss3 libasound2t64` + `dpkg-deb -x` + `LD_LIBRARY_PATH`;
Playwright cannot simulate HTML5 DnD, irrelevant once drag is removed):
- [ ] Right-click → picker → click item → node at click position.
- [ ] `/` → type "cache" → ArrowDown → Enter → cache node at viewport center.
- [ ] Esc closes picker; Esc with picker closed still cancels placement mode.
- [ ] Firefox-style `/` interception at least manually noted (Chromium can't cover it).
- [ ] Tools → Add zone → drag-draw still works; Esc cancels.
- [ ] Custom component create → appears in picker → edit → delete-guard when placed.
- [ ] Chapter route: list → select → question pane → hint hidden until clicked →
      back → other chapter; picker filtered; navigate to `/sandbox`, picker unfiltered.
- [ ] Both themes; reduced-motion pass; 200% zoom sanity check on the picker.
- [ ] `aria-activedescendant` moves with arrow keys (assert via DOM attribute).
