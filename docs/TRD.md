# ScaleCraft — Technical Requirements Document

Status: living document, consolidating `.claude/docs/TECH_STACK.md` (stack
decisions) and `.claude/docs/ARCHITECTURE.md` (data models/engines) into one
engineering reference. Those docs remain the decision records.

---

## 1. Topology

**One Next.js (App Router) application, deployed to Vercel. No separate
backend service.** The canvas, validation engine, and MVP-scope simulation run
entirely client-side; the only genuine server-side needs (persistence sync,
auth, the future LLM validation pass) are Next.js Route Handlers calling
managed services. No monorepo/workspace tooling — folder-level module
boundaries inside `src/`.

## 2. Stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router), TypeScript, Turbopack | |
| Canvas | React Flow (`@xyflow/react`) | Custom node types: `component`, `zone`, `comment`, `start` |
| Editor state | Zustand (`src/canvas/store.ts`) | Single store: nodes/edges, selection, undo/redo, panels, custom components |
| Styling | Tailwind CSS v4 + Radix primitives | Design tokens in `src/app/globals.css`; visual system in root `DESIGN.md` |
| Forms | React Hook Form + Zod | Component `configSchema` is Zod; the same schema drives the config form and validation |
| Local persistence | Dexie (IndexedDB) | `src/persistence/db.ts`: `saves` + `customComponents` tables, schema v2 |
| Database (cloud) | Postgres via Neon + Drizzle | Scaffolded (`src/db/`), inert until `DATABASE_URL` exists |
| Auth | Clerk + beta email allowlist | Scaffolded (`src/auth/`), not wired |
| Markdown docs | react-markdown + remark-gfm + rehype-raw → rehype-sanitize, Mermaid | `src/canvas/docs-panel/markdown/` |
| Testing | Vitest (+ fake-indexeddb), Playwright planned | CI: `.github/workflows/test-and-build.yml` |

## 3. Core data models

All in `src/` as plain TypeScript — the spine of the product; everything else
is a view over them.

- **`ComponentDefinition`** (`src/content/components/types.ts`) — id, category
  (networking / compute / data / caching / messaging / distributed-systems),
  label, icon, input/output ports, Zod `configSchema` + `defaultConfig`,
  `summary` (on-canvas caption), `docs` (markdown), optional `relations`
  (declared legal connections, checked by the `component-relations` rule).
  Registered once in a global registry (`registry.ts`, 27 built-ins as
  category files); **user-created custom components** are stored as plain
  `CustomComponentRecord`s and converted to live definitions on demand
  (`custom.ts` → `generate.ts`).
- **`ArchitectureGraph`** (`src/lib/graph.ts`) — the domain graph: nodes
  `{ id, componentId, position, config }`, edges
  `{ id, source, target, kind }`, `entryPointIds`. `EdgeKind` is
  `request-flow | control | replication | async`. Acyclicity is required only
  of `request-flow` edges; the other kinds legitimately form back-edges
  (replication sync, control heartbeats).
- **`ChapterDefinition`** (planned, milestone 6) — mode
  (`building-blocks | real-world-extraction`), problem statement, objectives,
  `availableComponentIds`, `requiredComponentIds`, `validationRuleIds`,
  opt-in `hints`, `readingLinks` (`{label, url}` only — no textbook content
  coupling), optional starter/solution graphs. Chapters configure engines by
  id; engines never import chapter internals.
- **`ValidationRule`** (`src/validation-engine/types.ts`) — pure function
  `match(graph) → MatchResult[]` plus `message()` and `explanation()`
  per match, with `severity: error | warning`.

The canvas store holds React Flow's native node/edge shape (including
canvas-only annotation nodes); `toArchitectureGraph()` is the single pure
translation to the domain shape — zones/comments/flags never reach the
validation engine.

## 4. Validation engine

`src/validation-engine/engine.ts` runs a rule set against a graph and
aggregates `{ ruleId, severity, message, explanation, offendingNodeIds,
offendingEdgeIds }`. The canvas highlights offending nodes rustc-style; the
Validate dropdown lists messages with explanations always visible. Chapter
success = zero error-severity violations + all required components present
and connected. 10 rules registered today; milestone 5 tracks (a) broader
structural coverage and (b) a spiked LLM-assisted holistic critique — which,
if built, **must** run in an authenticated Route Handler with cost caps,
never client-side.

## 5. Persistence model

Local-first, cloud-synced later:

1. **Now:** manual Save to IndexedDB (single `"sandbox"` slot), restore on
   load, JSON export/import, PNG/JPG image export. Custom components persist
   in their own table.
2. **Milestone 9:** autosave-on-every-edit, multi-slot saves (sandbox saves +
   per-chapter attempts), Home-page progress wiring.
3. **Milestone 10:** background sync to Postgres via Route Handlers, keyed by
   user + chapter/save id. Every beta user is authenticated — no anonymous
   mode, so no anon-to-account migration to design.

Import files are untrusted input and must be schema-validated before loading
(currently only shape-checked — see `.claude/docs/pending.md`).

## 6. Non-functional requirements

- **Instant feedback:** validation and simulation run client-side with no
  network round-trip; must stay responsive on graphs of at least low hundreds
  of nodes.
- **Offline-capable:** the core edit loop must work with no server.
- **Accessibility:** keyboard-completable primary workflow, ARIA labels on
  icon-only controls, `prefers-reduced-motion` respected, ≥4.5:1 text
  contrast in both themes (see `DESIGN.md` §6).
- **Theming:** dark default, fully-realized light theme; all colors flow
  through `globals.css` tokens.
- **Security:** no secrets in the client bundle; markdown/Mermaid rendering
  sanitized (user-authored custom-component docs are untrusted); LLM calls
  server-side only; beta allowlist evaluated server-side.
- **Licensing:** React Flow attribution is hidden under the non-commercial
  allowance — must be re-checked before any monetized launch.

## 7. Quality gates

`npm run typecheck`, `npm run lint`, `npm test`, `npm run build` must all
pass on `development` and `main`; CI enforces this on push/PR. Validation
rules — the pedagogical core — require unit tests per rule. Canvas
interaction E2E via Playwright is planned once chapters exist.

## 8. Content authoring

Chapters, component definitions, and validation rules are versioned
TypeScript/JSON in the repo — no database, no CMS. Starter/solution graphs
are JSON fixtures in the same content tree.
