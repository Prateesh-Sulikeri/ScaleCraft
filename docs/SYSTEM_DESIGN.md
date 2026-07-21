# ScaleCraft — System Design Document

Status: living engineering design doc. Describes how the system is actually
built and why — the runtime shape of the code in `src/`. For *what* the
product must do see [PRD.md](./PRD.md); for stack/requirements see
[TRD.md](./TRD.md); for the visual design system see the root
[`DESIGN.md`](../DESIGN.md).

---

## 1. High-level shape

```
┌────────────────────────────────────────────────────────────────┐
│ Next.js app (client-heavy)                                     │
│                                                                │
│  app/            routes: / (Home) → /sandbox (canvas app)      │
│    │                                                           │
│  canvas/         React Flow wrapper + node types + panels      │
│    │  Zustand store (nodes, edges, selection, undo, panels)    │
│    │        │                                                  │
│    │  toArchitectureGraph()  ← single domain translation       │
│    │        ▼                                                  │
│  validation-engine/   pure rules over ArchitectureGraph        │
│  simulation-engine/   request-flow tracer (stub)               │
│  content/components/  registry: 27 built-ins + custom records  │
│  persistence/         Dexie/IndexedDB (saves, customComponents)│
│  db/, auth/           Neon/Drizzle + Clerk (scaffolded, inert) │
└────────────────────────────────────────────────────────────────┘
```

Dependency rule: `validation-engine` and `simulation-engine` never import
from chapters/UI — chapters configure them via ids. `lib/graph.ts` is the
shared cross-cutting type all subsystems depend on equally.

## 2. Canvas subsystem (`src/canvas/`)

- **Store (`store.ts`)** — one Zustand store holding React Flow's native
  node/edge shape (deliberately *not* the domain shape, to avoid fighting
  RF's controlled-component model). Four node types:
  - `component` — a placed `ComponentDefinition` instance
    (`data: { componentId, config, name?, description?, width?, height? }`).
  - `zone` — visual-only grouping rectangle, pinned `zIndex: -1`, resizable,
    lockable. Not parent/child grouping: dragging a zone does not move
    contained nodes (deliberate deferral).
  - `comment` — resizable sticky note.
  - `start` — flag marker whose `targetId` points at a component (canvas-only
    pointer, not a real edge; surfaced to the domain graph as
    `entryPointIds`, and pruned when its target is deleted).
- **Edges** carry `data.kind` (`request-flow | control | replication |
  async`); color + dash pattern are two redundant channels per kind. Default
  kind on connect is category-aware (`legal-edge-kinds.ts` `pickDefaultKind`).
- **Undo model, two deliberate layers:**
  1. `past`/`future` history stacks (Ctrl+Z/Ctrl+Shift+Z) — full snapshots,
     gesture-coalesced via a merge key + 500 ms window, capped at 50.
  2. `pendingUndo` — a delete-specific safety net driving the UndoToast, with
     merge/replace modes so "delete a connected node" and "clear board" are
     each one restorable step. (Known interaction bug between the two layers
     — see `.claude/docs/pending.md`.)
- **Popovers/editors** (config popover, annotation editor, docs tabs,
  highlight state) live in the store, not component state, so deeply nested
  node chrome can trigger them.
- **Custom components** — `CreateComponentModal` builds a
  `CustomComponentRecord` (plain data, IndexedDB-safe); `registry.ts` derives
  a live `ComponentDefinition` (with a runtime-assembled Zod schema) on
  demand, so custom components render through the stock `ComponentNode` and
  are indistinguishable downstream.

## 3. Validation flow

```
store.nodes/edges ──toArchitectureGraph()──► ArchitectureGraph
                                                  │
   Validate click ──► runValidation(graph, ruleRegistry)
                                                  │
             ValidationViolation[] ──► ValidationIndicator dropdown
                                   └─► nodeId→state map ──► node rings
```

Validation is **explicit** (a Validate button), not live — a deliberate UX
call. Results carry a staleness marker: the graph is snapshotted at click
time and compared against the current graph, so edits after a run show
"stale" rather than silently re-running. Explanations render unconditionally
in the dropdown on failure (product principle #1). The `component-relations`
rule checks each component's declared `relations` contract, falling back to a
coarse category×kind compatibility matrix for components without one (all
custom components, by design).

## 4. Docs subsystem (`src/canvas/docs-panel/`)

A docked, resizable, minimizable panel (not a modal) with up to 8 tabs keyed
by componentId — two instances of the same component share one tab; scroll
position survives minimize/restore. Markdown pipeline: react-markdown +
remark-gfm + callouts → rehype-raw → **rehype-sanitize** → rehype-slug, with
custom renderers for code (Shiki-style block), Mermaid (dynamically
imported), callouts, and external links. Custom-component docs flow through
the same sanitized pipeline.

## 5. Persistence design

Raw canvas state (`AnyNodeType[]`/`ArchitectureEdgeType[]`) is what persists
— *not* the domain graph, because annotations aren't part of it and would be
silently dropped. Dexie schema v2: `saves` (single `"sandbox"` slot today;
keyed to allow per-chapter slots later without migration) and
`customComponents`. Restore-on-load prefers a save over the seed demo graph.
JSON export/import round-trips the same raw shape. Cloud sync (milestone 10)
will mirror this per authenticated user via Route Handlers — same shape, no
translation layer.

## 6. Home & routing

`/` is the mode-select Home (React Flow-rendered mode cards; only Sandbox is
live), `/sandbox` is the canvas app; chapter routes arrive with milestone 6.
Theming via `next-themes` (`class` attribute, dark default, no OS link), with
xyflow's separate `colorMode` chrome theming wired to the same source.

## 7. Design decisions worth remembering (and their why)

- **RF-shape store + one pure translation function** — avoids a second
  source of truth and render feedback loops (validation results are merged
  into node data at render time, never written back into the store).
- **Zod schema as the single config contract** — the same schema drives the
  config form UI (schema-driven field rendering), value validation, and
  (future) chapter authoring.
- **Records-not-definitions for custom components** — a live Zod schema
  can't be un-rendered back into editable field specs or structured-cloned
  into IndexedDB; the plain record is the source of truth.
- **Annotations are presentation, not domain** — zones/comments/flags never
  reach validation or (future) chapter success criteria.
- **Explicit validate over live validate** — noise reduction; staleness is
  surfaced honestly instead of auto-rerunning.
- **No collaboration tax** — persistence is a single-user snapshot store; no
  CRDTs, no op logs, ever (product principle #3).

## 8. Known gaps / open items

Tracked in `.claude/docs/pending.md` (bugs, hardening) and
`.claude/docs/OPEN_QUESTIONS.md` (deliberate deferrals with triggers). The
biggest structural gap vs. the PRD: the chapter framework (milestone 6) and
chapter content (7–8) don't exist yet — everything above currently serves
Sandbox only.
