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

## Design & UX docs (live reference)

- `DESIGN.md` (root) — the active, committed design system: color tokens, typography,
  components, elevation/shadow, and do's/don'ts. This is the source of truth for what
  the UI looks like, not DESIGN_LANGUAGE.md (which is historical). Updated inline as
  design decisions land.
- `.claude/docs/CRITIQUE.md` — latest design critique (Nielsen heuristics, priority
  issues, persona red flags). Read this before making UI changes to understand known
  friction points and recommended fixes.

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

### Design iteration workflow

When working on UI/UX improvements:
1. **Read the current state:** `DESIGN.md` (live design system) + `.claude/docs/CRITIQUE.md` (known issues)
2. **Decide what to fix:** Pick from CRITIQUE.md's priority issues or use `/impeccable` to run a fresh audit
3. **Choose a command:** Map the issue to an impeccable command:
   - User education → `/impeccable onboard` (first-run flows, help panels)
   - Labels/copy → `/impeccable clarify` (UX copy, tooltips)
   - Spacing/layout → `/impeccable layout` (visual hierarchy, rhythm)
   - Colors/contrast → `/impeccable audit` (a11y review) or `/impeccable colorize` (palette work)
   - Animations/motion → `/impeccable animate` (purposeful motion)
   - Polish/refinement → `/impeccable polish` (final pass before shipping)
4. **After changes:** Update `DESIGN.md` inline, commit, and run `/impeccable critique` to verify improvements
5. **Archive findings:** Critique snapshots auto-persist to `.impeccable/critique/` for trend tracking

### Git branching

- `origin` has two long-lived branches: `main` and `development`. `development` is the
  integration branch going forward — new work starts there, not on `main`.
- Every new unit of work (feature/fix/task) gets its own branch, branched from
  `development`.
- Claude pushes that branch to origin but does **not** merge it — merging into
  `development` and eventually `main` is done by the user, manually.
- Claude does not push directly to `main` going forward, and does not open or merge
  PRs, unless explicitly asked.

## Design tools

**impeccable** (`~/.claude/skills/impeccable/`) — use for all UI/UX work:
- Run `/impeccable critique` to score design against Nielsen heuristics and uncover issues
- Run `/impeccable onboard`, `/impeccable clarify`, `/impeccable audit`, `/impeccable polish`, etc. to fix specific issues
- Read `DESIGN.md` and `.claude/docs/CRITIQUE.md` before starting any design work
- After shipping UI changes, re-run `/impeccable critique` to measure improvement

## graphify

This project has a live knowledge graph at `graphify-out/` with 758 nodes, 1214 edges, and 112 communities. Use it as the primary codebase navigation tool — it's AST-based (not AI-inferred), fast, and scoped to relevant context.

**Workflow:**
1. **For architecture/design questions:** Run `graphify query "<question>"` first (e.g., "What are the main UI pages?" or "How does validation flow through the system?"). Returns a scoped subgraph, much smaller than raw grep or GRAPH_REPORT.md.
2. **For relationships:** Run `graphify path "<A>" "<B>"` to trace how two concepts connect (e.g., "Store" → "Canvas" to see how state flows).
3. **For focused concepts:** Run `graphify explain "<concept>"` to understand where a thing is defined and how it's used (e.g., "ValidationRule" or "ComponentNodeType").
4. **After code changes:** Run `graphify update .` to sync the graph (AST-only, no cost). This keeps all queries fresh.

**Avoid:**
- Reading raw GRAPH_REPORT.md unless you need a complete architecture snapshot (2000+ lines).
- Using grep/find for broad exploration — graphify is faster and more contextual.
- Querying without scoping — "tell me about the app" → "tell me about the Canvas store" is better.

**Files to trust:**
- `graphify-out/graph.json` — the query engine (don't read directly; query it)
- `graphify-out/graph.html` — visual explorer (open in browser for interactive browsing)
- `graphify-out/GRAPH_REPORT.md` — fallback for full architecture review only
- `.git/hooks/post-commit` + `post-checkout` — auto-update hooks (installed by `graphify hook install`)
