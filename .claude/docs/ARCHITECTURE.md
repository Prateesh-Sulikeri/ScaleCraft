# Architecture

Status: **decided at the level of shape and data model**; implementation details will
firm up once code exists. See [[TECH_STACK]] for the concrete library choices this
assumes, [[RESEARCH]] for why these patterns were chosen.

## Core data models

These four types are the spine of the whole product. Everything else (canvas UI,
validation UI, simulation UI) is a view over them.

### Component Definition

The concrete form of `INITIAL_THOUGHTS.md`'s "Component Philosophy" — every
architecture component (Client, Load Balancer, SQL Database, ...) is one of these,
not a hardcoded UI element:

```ts
type ComponentDefinition = {
  id: string;                 // "load-balancer"
  category: ComponentCategory; // networking | compute | data | caching | messaging | distributed-systems
  label: string;
  icon: IconRef;
  inputs: PortSpec[];          // what can connect INTO this
  outputs: PortSpec[];         // what this can connect OUT to
  configSchema: ZodSchema;     // per-instance configuration (e.g. LB algorithm, cache TTL)
  defaultConfig: unknown;
  summary: string;             // one short line, shown directly on the canvas node
  docs: string;                // markdown, shown in the contextual docs panel
  relations?: ComponentRelations; // this component's own valid connections — see below
};
```

Registered once in a global component registry. Chapters reference components by id and
opt a subset in — they never redefine a component. This is what makes "the same Cache
component reused in the caching chapter and in the Instagram exercise" actually true
rather than aspirational.

**Every base-pack component should also declare `relations`** — which categories and
`EdgeKind`s are legal for its inputs and outputs (e.g. a Load Balancer only accepts
`request-flow` from `networking`, and only sends `request-flow` to `compute` — never the
reverse). This is a component's own contract, authored once where the component itself is
defined, checked by `validation-engine/rules/component-relations.ts`. It replaced an
earlier design of several separate cross-cutting rules (adjacency, ordering, kind
legality) that each had to *guess* at what a specific component should allow — see
`.claude/docs/validation_agent_design.md` for the full history. A component with no
declared `relations` (every custom, user-authored component, and any base-pack component
someone forgot to contract) falls back to a coarser category-level compatibility table
instead of getting nothing — see `canvas/legal-edge-kinds.ts`.

### Chapter Definition

```ts
type ChapterDefinition = {
  id: string;
  mode: "building-blocks" | "real-world-extraction";  // sandbox has no chapter def
  problemStatement: string;
  learningObjectives: string[];
  availableComponentIds: string[];   // subset of the global registry
  requiredComponentIds: string[];    // must appear for success
  validationRuleIds: string[];       // subset of the global rule registry, see below
  hints: Hint[];                     // never auto-surfaced — see "Hints vs. explanations" below
  readingLinks: { label: string; url: string }[]; // manual citations into the textbook — no content coupling, just links
  starterGraph?: ArchitectureGraph;  // pre-saved JSON, loaded on chapter start
  solutionGraph?: ArchitectureGraph; // reference graph, used for internal QA / optional "reveal" hint
};
```

Note `readingLinks` is deliberately just `{ label, url }` — per the resolved question on
the textbook relationship, ScaleCraft does not consume or version against the textbook's
content. It only ever points at it.

### Architecture Graph

```ts
type ArchitectureGraph = {
  nodes: { id: string; componentId: string; position: XY; config: unknown }[];
  edges: { id: string; source: string; target: string; kind: EdgeKind }[];
};

type EdgeKind = "request-flow" | "control" | "replication" | "async";
```

This is intentionally close to React Flow's native `nodes`/`edges` shape, so
loading/saving is direct — no translation layer between "what's persisted" and "what the
canvas renders."

**On "Directed Acyclic" (`INITIAL_THOUGHTS.md`'s stated graph property):** real
architectures have legitimate back-edges — replica-to-leader sync, cache invalidation
callbacks, heartbeats. Modeling the *entire* graph as strictly acyclic would make those
unrepresentable. Resolution: the acyclicity constraint applies only to `request-flow`
edges (the primary synchronous client-facing path); `control`/`replication`/`async`
edges are exempt and rendered/validated differently (e.g. dashed, not part of the
"trace a request" simulation path). Flagged in [[OPEN_QUESTIONS]] as "propose, verify
against real chapters" — this is a clean model on paper but needs to survive contact
with the first two actual chapters before being considered settled.

### Validation Rule

```ts
type ValidationRule = {
  id: string;
  severity: "error" | "warning";
  match: (graph: ArchitectureGraph) => MatchResult[];  // structural pattern match, returns offending nodes/edges (possibly empty)
  message: (match: MatchResult) => string;             // short, e.g. "Database exposed directly to Client"
  explanation: (match: MatchResult) => string;         // long, the "why" — this is the pedagogical payload
};
```

## Validation engine

A single engine, not per-rule logic scattered through the UI:

1. Given the current graph and the active chapter's `validationRuleIds`, run every
   applicable rule's `match()` against the graph.
2. Aggregate results into `{ ruleId, severity, message, explanation, offendingNodeIds,
   offendingEdgeIds }[]`.
3. The canvas highlights offending nodes/edges directly (rustc-style: point at the
   specific span, don't just say "something's wrong somewhere"); a feedback panel lists
   messages with expandable long-form explanations.
4. Chapter "success criteria" = zero `error`-severity violations + all
   `requiredComponentIds` present and connected.

Rules are pure functions over a graph — no hidden state, no DOM access — which is what
makes them straightforward to unit test (see [[TECH_STACK]] testing section) and safe to
run on every graph edit without debouncing concerns beyond normal React re-render
hygiene.

### Hints vs. explanations — not the same thing

Two distinct layers of feedback, deliberately kept separate:

- **Explanation** (`ValidationRule.explanation`) — the *why* behind a failure. Always
  shown, unconditionally, whenever a rule matches. This is not hand-holding, it's the
  product's core pedagogical value ("the database should not be directly exposed to
  clients because..."). Withholding this would make ScaleCraft no better than a bare
  pass/fail checker.
- **Hint** (`ChapterDefinition.hints`) — guidance toward *how to fix it* or *what to try
  next*. Never auto-surfaced, never triggered by a failed validation attempt on its own.
  Only appears if the user takes a deliberate action to reveal it (e.g. a "Show a hint"
  affordance the user has to click). A user who never asks for a hint should be able to
  fail, read every explanation, and reason their own way to a solution — that path must
  remain fully supported and not degraded to nudge people toward hints.

Concretely: a failed validation always populates the feedback panel with rule messages
and explanations. It never auto-opens the hints panel, never highlights "try adding a
Cache here," and never escalates hint visibility based on attempt count. Hints are pulled
by the user, not pushed by the system.

## Simulation engine (MVP scope)

MVP simulation is **qualitative/visual, not quantitative**. On demand (a "simulate
request" action, not continuous background execution):

1. Walk `request-flow` edges from a chosen entry node (typically Client).
2. Animate a token along each edge in sequence (React Flow's SVG motion-path pattern).
3. At each node, apply a simple per-component-type behavior stub (e.g. Cache: coin-flip
   hit/miss based on configured hit-rate; Load Balancer: pick a downstream target by
   configured algorithm) and branch the animation accordingly.

This deliberately stops short of SysSimulator-style discrete-event performance modeling
(latency percentiles, throughput, capacity limits) — that's a separate, much larger
effort, explicitly deferred; see [[OPEN_QUESTIONS]] and [[MVP_SCOPE]].

## Persistence

Local-first, cloud-synced:

- Every graph edit autosaves to IndexedDB immediately (Dexie.js) — instant, offline-safe,
  no server dependency for the core editing loop.
- On an authenticated session (accounts are required from day one for the closed beta —
  see [[MVP_SCOPE]]), the same graph background-syncs to Postgres via a Route Handler,
  keyed by user + chapter (or by sandbox-save id). This is what gives cross-device
  continuity and lets us track chapter progress.
- Because every MVP user is authenticated (no anonymous/guest mode to reconcile later),
  there's no anon-to-account migration path to design — one less moving part.

## Project structure (single Next.js app, no workspace packages yet)

Folder-level module boundaries, not package boundaries — see [[TECH_STACK]] for why a
full monorepo is deferred:

```
src/
  app/                     # Next.js App Router routes + Route Handlers (--src-dir convention)
  lib/
    graph.ts                # ArchitectureGraph, GraphNode/GraphEdge, EdgeKind — the shared cross-cutting type
  canvas/                  # React Flow wrapper, custom node/edge components
  validation-engine/        # rule types, engine, rule registry (rules/ subfolder)
  simulation-engine/        # request-flow tracing, token animation (qualitative MVP scope)
  content/
    components/             # ComponentDefinition registry
    chapters/                # ChapterDefinition registry + starter/solution JSON fixtures
  db/                       # Drizzle schema + lazy client (throws only if called without DATABASE_URL)
  auth/                     # Clerk integration plan, beta-allowlist logic (not yet wired into layout — needs Clerk keys)
```

(Scaffolded 2026-07-13 — matches this exactly. `graph.ts` lives in `lib/` rather than
under any single subsystem since canvas, validation-engine, simulation-engine, and
content/chapters all depend on it equally.)

The intent is that `validation-engine` and `simulation-engine` never import from
`content/chapters` — chapters configure them via ids and rule sets, they don't reach
into chapter internals. That's the enforcement mechanism for "reusable components, not
per-problem logic," which `INITIAL_THOUGHTS.md` names as the core design principle.
