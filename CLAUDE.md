# ScaleCraft

Interactive system-design learning lab — not a game. Users assemble real-world
architectures from reusable components (load balancers, databases, caches, queues, ...)
on a canvas, get validated with *explanatory* feedback ("why," not just "invalid"), and
progress from constrained guided chapters to open-ended sandbox. Complements (but does
not depend on) a separate, private system-design textbook the same author is writing —
ScaleCraft only ever links out to it via manual citation URLs, no content coupling.

Full vision: `INITIAL_THOUGHTS.md`. Architecture/planning docs: `.claude/docs/`.

**Status as of 2026-07-13: scaffolded, pre-interactivity.** Next.js app is running
(canvas, component registry, validation engine wired end-to-end), but the canvas is
still a static demo graph — no drag-and-drop, no chapters, no persistence, no auth yet.
See `.claude/docs/MILESTONES.md` for the sequenced plan to MVP and
`.claude/PROGRESS_LOG.md` for exactly what's built vs. stubbed right now.

## Progress log (read this first, every session)

`.claude/PROGRESS_LOG.md` is the transferable record between sessions — what's been
built, what's live vs. scaffolded-but-inert, environment gotchas, and next steps. Read
it before doing anything else. After a significant work session, spawn a subagent to
append a new entry (don't self-report — a dedicated logging agent that independently
verifies repo state via git/file inspection stays honest in a way self-written notes
don't).

## Planning docs (read before making architectural decisions)

- `.claude/docs/RESEARCH.md` — competitive landscape, library comparisons, prior-art
  patterns that informed everything below. Read this first for *why*.
- `.claude/docs/ARCHITECTURE.md` — data models (Component/Chapter/Graph/ValidationRule),
  validation engine design, simulation engine design, persistence model, project
  structure.
- `.claude/docs/TECH_STACK.md` — concrete technology choices and rationale: Next.js
  monolith on Vercel, React Flow, Neon/Drizzle, Clerk.
- `.claude/docs/DESIGN_LANGUAGE.md` — visual identity: category color system, validation
  state colors, typography, motion principles.
- `.claude/docs/MVP_SCOPE.md` — what ships in the closed beta, what's explicitly
  deferred and to which phase.
- `.claude/docs/OPEN_QUESTIONS.md` — unresolved items, each with an owner and a trigger
  for when it actually needs resolving. Check this before assuming a design is final.
- `.claude/docs/MILESTONES.md` — the sequenced, currently-active roadmap from the
  scaffold to MVP. Check this before picking what to work on next.

## Non-negotiable product principles (from `INITIAL_THOUGHTS.md` and explicit product calls, do not relitigate casually)

- Components are reused across every chapter and mode — never fork a component's
  definition for a specific chapter. If a chapter needs different behavior, that's a
  config option or a validation rule scoped to that chapter, not a new component.
- Validation explains architectural reasoning. A bare "invalid" is a bug, not a
  shortcut. That explanation is **always shown** on failure, unconditionally.
- Hints are a separate, optional layer from explanations — **never auto-surfaced**.
  A user who never asks for a hint must still be able to fail, read the explanation,
  and reason their own way to a fix. No forced hand-holding, no nudging toward hints
  based on attempt count. See "Hints vs. explanations" in `.claude/docs/ARCHITECTURE.md`.
- Single-player only, permanently — not "no multiplayer yet," but no multiplayer, full
  stop. Post-beta, ScaleCraft is one person logging in and working through it alone,
  closer to a self-paced course than a shared workspace. Never let persistence or graph
  state design pay a tax for eventual collaborative editing — it isn't coming.
- Not a game: no scoring theatrics, no decorative animation. Motion communicates state
  only.

## Working conventions for this repo

- This project is solo, semi-focused, daily-time-investment pace — favor moderate
  structure (typed schemas, clean folder boundaries) over heavy process (no monorepo
  tooling yet, see [[TECH_STACK]]). Don't over-build for a team that doesn't exist yet.
- Curriculum content (chapters, components, validation rules, starter/solution graphs)
  lives as versioned TypeScript/JSON in the repo, not a database or CMS.
- Before writing code against an open question in `OPEN_QUESTIONS.md`, check its
  "trigger" — most are deliberately deferred and shouldn't block MVP work.
- Before non-trivial decisions, consult the relevant skill instead of exploring from
  scratch — `graphify` for codebase/architecture questions, `impeccable` for
  frontend/UI design decisions. A scoped skill query is cheaper (in tokens and time)
  than ad hoc grepping or unguided design reasoning.

### Git branching

- `origin` has two long-lived branches: `main` and `development`. `development` is the
  integration branch going forward — new work starts there, not on `main`.
- Every new unit of work (feature/fix/task) gets its own branch, branched from
  `development`.
- Claude pushes that branch to origin but does **not** merge it — merging into
  `development` and eventually `main` is done by the user, manually.
- Claude does not push directly to `main` going forward, and does not open or merge
  PRs, unless explicitly asked.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
