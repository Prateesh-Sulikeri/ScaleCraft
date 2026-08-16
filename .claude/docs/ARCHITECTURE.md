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
  title: string;                     // short display name (workspace Question Pane heading)
  placeholder?: boolean;             // true = throwaway/dummy content, Draft-badged in the Question Pane
  problemStatement: string;
  learningObjectives: string[];
  availableComponentIds: string[];   // subset of the global registry
  requiredComponentIds: string[];    // must appear for success
  // Subset of the global rule registry — building-blocks only. Ignored for
  // mode: "real-world-extraction", which always runs the full registry
  // regardless of this field (see validation_agent_design.md §9.5 and
  // validation-engine/chapter-outcome.ts) — RWE's anti-pattern posture
  // applies every taught concept uniformly, there's nothing left to scope.
  validationRuleIds: string[];
  blueprints: Blueprint[];           // known-good graph patterns; see validation_agent_design.md §8
  hints: Hint[];                     // never auto-surfaced — see "Hints vs. explanations" below
  readingLinks: { label: string; url: string }[]; // manual citations into the textbook — no content coupling, just links
  starterGraph?: ArchitectureGraph;  // pre-saved JSON, loaded on chapter start
};
```

Note `readingLinks` is deliberately just `{ label, url }` — per the resolved question on
the textbook relationship, ScaleCraft does not consume or version against the textbook's
content. It only ever points at it.

### Curriculum manifest vs. ChapterDefinition

Two distinct types, easy to conflate, that a future agent will most likely get wrong —
written down here specifically to prevent that:

- **`CurriculumChapter`** (`src/curriculum/types.ts`) is the curriculum *map*: one row
  per lesson named in `.claude/docs/CURRICULUM.md` §13, whether or not it's been
  authored yet. It's what `src/curriculum/manifest.ts` transcribes wholesale — every
  Building Blocks unit and Real World Extraction project, 31 entries total, most with
  `chapterDefinitionId: null`. It's a stable, content-free identity: slug (the route
  segment and the persistence key), number, title, difficulty, estimated minutes,
  prerequisites. It never contains a problem statement, hints, or a starter graph.
- **`ChapterDefinition`** (`src/content/chapters/types.ts`, above) is the authored
  *lesson* itself — the content a `CurriculumChapter` points at once it exists. Only
  entries with a non-null `chapterDefinitionId` have one.

The relationship is a foreign key, not inheritance: a `CurriculumChapter`'s
`chapterDefinitionId` names the `ChapterDefinition.id` it's backed by (or `null` — see
`src/curriculum/manifest.ts`'s doc comment for the two that resolve today).
`src/curriculum/index.ts`'s `slugForChapterDefinitionId` is the reverse lookup, used
where something is keyed by definition id (a validation pass) but needs attributing to
a curriculum slug (progress tracking, navigation).

**What reads which:** the Learning Path (`src/learning-path/`) and the in-workspace
`ChapterNavigator` (`src/chapters/ChapterNavigator.tsx`) read the curriculum manifest —
they render every entry, authored or not, and gate interactivity on
`chapterDefinitionId !== null`. `ChapterWorkspace` reads a `ChapterDefinition` (resolved
from the route's `chapterSlug` via `findEntry` + a `chapterRegistry` lookup) — it never
reads the manifest for its own content, only to resolve which definition to load and to
compute curriculum-order prev/next (`adjacentAuthoredEntries`, which skips unauthored
entries by design). Authoring milestone 7's real chapters is therefore two independent
steps that must both happen, not one: write the `ChapterDefinition`, then flip that
entry's `chapterDefinitionId` in the manifest from `null` to the new id. Neither one
alone is enough — a `ChapterDefinition` with no manifest entry pointing at it is
unreachable from any route; a manifest entry with a bad or missing id 404s
(`[chapterSlug]/page.tsx`'s route guard).

Progress itself is tracked per curriculum slug (`src/persistence/db.ts`'s
`CurriculumProgress` table, keyed by `CurriculumChapter.slug`), separate from
`chapterProgress` (keyed by `ChapterDefinition.id`, written when `evaluateChapter`
reports a pass) — see `src/curriculum/progress.ts`'s `deriveStatus`, which merges both
into one `ChapterStatus`. Two tables, two distinct facts (what the learner did vs. what
validation proved), one derivation — never read as duplicated state.

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

### Sync ordering (release 6.1.0-alpha)

Every synced Dexie row carries `SyncMeta` (`src/persistence/db.ts`): `syncedAt`, the
server's own `updatedAt` from the last successful push or pull, and `dirty`, set
whenever a local write hasn't been acknowledged by the server yet. Reconciliation
(`.claude/docs/pending-6.1.0-poa.md` Phase 3) reads these with one rule:

```
if (local.dirty)                            -> push local, adopt returned updatedAt
else if (remote.updatedAt > local.syncedAt) -> adopt remote
else                                        -> no-op
```

**Client clocks are never compared to each other.** Devices have unreliable clocks, and
comparing one device's `Date.now()` to another's would let a skewed clock win every
conflict forever. The only ordering authority is the server's `updatedAt`, stamped by
the Route Handler on every `POST /api/sync/*` write and returned as `{ updatedAt }` —
never a client-supplied timestamp. Domain timestamps a row also carries
(`completedAt`, `submittedAt`, `createdAt`, `manuallyCompletedAt`, ...) are display data
only; they are never read by the merge predicate above.

`dirty` doubles as the offline story (Phase 1.3): a flush pass on load and on
regaining connectivity re-pushes every dirty row. No queue, no retry scheduler —
single-player means a flush is always safe.

### Account isolation (release 6.1.0-alpha Phase 2)

The Dexie database (`"scalecraft"`) and its `sc-`/`scalecraft:` localStorage keys
are browser-wide, not account-scoped. **Decision: wipe local state on account
change rather than keep a per-account cache** — once local is a disposable cache
(see the sync-ordering rule above), a second cache buys nothing but complexity,
and the per-account alternative would have required threading an async db
accessor through every call site.

`src/persistence/LocalStateGate.tsx` registers the signed-in Clerk `userId` with
`src/persistence/db.ts` synchronously during render (not a `useEffect` — render
order guarantees this runs before any descendant component can query Dexie,
stronger than mount-effect ordering). `db.ts` compares it against the last
`userId` stored in localStorage inside a `db.on("ready", ...)` handler, which
blocks every caller's query until the comparison (and wipe, if the account
changed) completes. A mismatch clears every Dexie table (`db.tables`, not a
hardcoded list) and the `sc-`/`scalecraft:` localStorage keys; the cloud refills
both on the next reconcile.

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
