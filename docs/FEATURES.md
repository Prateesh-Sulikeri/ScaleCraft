# ScaleCraft — Feature Inventory

Status: living checklist of what exists today vs. what's planned, at feature
granularity. Roadmap sequencing lives in `.claude/docs/MILESTONES.md`; product
requirements in [PRD.md](./PRD.md). Last audited 2026-07-26 against `main`.

## Shipped (live in the app today)

### Canvas & editing
- Insert components via the Component Picker (`/` or right-click canvas) —
  searchable, category-grouped, keyboard-navigable (27 built-in components
  across 6 categories, see "Component insertion & chapter shell" below).
- Move, connect, box-select, multi-select, delete (keyboard + right-click).
- Four edge kinds (request-flow / control / replication / async) with
  distinct color + dash pattern, changeable via edge inspector; reverse
  direction; category-aware default kind on connect.
- Resizable component nodes with responsive descriptions.
- Undo/redo (Ctrl+Z / Ctrl+Shift+Z) with gesture coalescing, plus a
  delete-specific Undo toast safety net; Clear board (undoable).
- Right-click context menus: node (configure / duplicate / docs / delete),
  edge (reverse / delete), selection (duplicate N / delete N), pane
  (quick-add component / add annotation).
- Keyboard shortcuts with a discoverable legend (Shift+?).

### Annotations
- **Zones** — labeled, colored, resizable grouping rectangles (visual-only),
  drawn by drag; always rendered behind components.
- **Comments** — resizable sticky notes.
- **Flags (start markers)** — entry-point markers that can point at a
  component (feeds validation's `entryPointIds`).
- Lock/unlock, inline label editing, per-annotation color picker.

### Custom components
- Create/edit/delete your own components (label, icon, category, summary,
  markdown docs, typed config fields: string/number/boolean/enum).
- Rendered and configured identically to built-ins; persist locally.

### Validation
- Explicit Validate action; 11 rules (structural + config-aware, including
  per-component `relations` contracts), each with a short message and an
  always-shown architectural explanation.
- Offending nodes ring-highlighted (error red / warning amber); passing runs
  ring everything green; results marked stale after edits, dismissed by
  clicking blank canvas.

### Docs
- Docked, resizable, minimizable documentation panel with up to 8 tabs,
  markdown rendering (GFM, callouts, code blocks, Mermaid diagrams), focus
  mode, per-tab scroll memory.

### Configuration
- Contextual per-node config popover (schema-driven form from each
  component's Zod schema), instance naming, per-instance description.

### Persistence & sharing
- Manual Save to IndexedDB (Ctrl+S), auto-restore on load.
- Export/import project JSON; export canvas as PNG/JPG with background
  options.

### Component insertion & chapter shell
- **Component Picker** (`/` or right-click canvas) — centered, keyboard-first
  search/browse/insert, category rail with collapse/expand, replaces the old
  always-visible Palette sidebar entirely in Sandbox.
- **Chapter framework shell** (milestone 6, done) — `ChapterWorkspace` +
  `ChapterSidebar` (list ⇄ question pane), `/building-blocks` and
  `/real-world-extraction` routes live, component picker filtered to a
  chapter's `availableComponentIds`. Runs against one throwaway placeholder
  `ChapterDefinition` per mode (`src/content/chapters/index.ts`) — the shell
  is proven, real curriculum content is not authored yet (see Planned below).

### App shell
- Home mode-select page (Sandbox, Building Blocks, and Real World Extraction
  cards all live links); About panel; loading transition.
- Dark/light themes, fully tokenized; reduced-motion support.

### Test coverage & CI
- 129 tests (Vitest) across validation rules, store operations, persistence,
  and major user-flow suites — all passing. CI (`test-and-build.yml`) and
  Vercel's build command both gate on typecheck + lint + tests + build.

## In progress / partially shipped
- **Validation coverage (milestone 5, Track 1 done)** — orphan, cycle,
  missing-input, and per-component `relations` contracts landed (11 rules
  registered); LLM-assisted holistic critique (Track 2) still blocked on
  Gemini API access, not built.
- **Persistence (milestone 9)** — manual save shipped; autosave-on-every-edit
  and multi-slot saves pending.

## Planned (not started)
- **Two Building Blocks chapters** (7): real content (problem statements,
  starter graphs, chapter-scoped validation rules) for networking/
  load-balancing and caching — the shell exists (see above), content doesn't.
- **One Real World Extraction chapter** (8): bit.ly URL shortener, same
  shell-exists/content-doesn't status.
- **Auth + cloud sync** (10): Clerk closed-beta allowlist, Postgres sync,
  cross-device continuity, real Home progress indicators.
- **Qualitative simulation** (11): animated request token tracing the graph.
- **Beta polish pass** (12): full click-through, a11y audit, first invites.

## Explicitly rejected (never planned)
- Real-time multiplayer / collaborative editing.
- Scoring, gamification, decorative animation.
- Quantitative performance simulation in v1 (deferred to v1.2+, separate R&D).
