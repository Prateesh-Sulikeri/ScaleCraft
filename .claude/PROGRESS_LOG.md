# Progress Log

Append-only, most recent entry at the bottom. This is the transferable session record —
read this first when picking the project back up in a new session, before re-deriving
context from git log or the planning docs. Each entry is written by a dedicated
logging subagent after a work session, not by whichever agent did the work, so it stays
an honest external summary rather than self-graded notes.

---

## 2026-07-13 — Planning docs + Next.js scaffold (first commit)

**Environment gotcha — read this first:** On this WSL box, plain `node`/`npm` on PATH
resolve to a *Windows* Node install via `/mnt/c/`, which breaks on WSL paths ("UNC
paths are not supported"). The working native Linux Node is via nvm at
`~/.nvm/versions/node/v22.22.3/bin`. Prefix commands with
`export PATH="$HOME/.nvm/versions/node/v22.22.3/bin:$PATH"`, or fix `.bashrc` to source
nvm properly, before running any node/npm command.

**What was built:** Six planning docs landed in `.claude/docs/` (RESEARCH,
ARCHITECTURE, TECH_STACK, DESIGN_LANGUAGE, MVP_SCOPE, OPEN_QUESTIONS) plus root
`CLAUDE.md` indexing them — these define the product and every architecture/stack/design
decision made so far; original vision is in `INITIAL_THOUGHTS.md`. A Next.js 16
(App Router, TS, Tailwind v4) scaffold followed: React Flow canvas (`src/canvas/`), a
seed `ComponentDefinition` registry with client/load-balancer/app-server/sql-database
(`src/content/components/registry.ts`), and a validation engine
(`src/validation-engine/`) with one real rule, `noDirectClientDatabase`, matching the
exact example from INITIAL_THOUGHTS.md's "Validation Philosophy" section (has a test:
`no-direct-client-database.test.ts`). `src/app/page.tsx` is a live smoke test toggling
between a valid and an invalid example graph so validation visibly reacts.

**Live and runnable now:** `npm run dev` (Next.js 16.2.10 + Turbopack) serves
http://localhost:3000, confirmed HTTP 200 with "ScaleCraft" rendering. Canvas +
registry + validation engine are wired end-to-end. `npm test` (vitest) covers the one
validation rule.

**Scaffolded but inert (needs external setup, not more coding):**
- `src/db/schema.ts` (Drizzle) + `src/db/client.ts` (lazy Neon client) — no
  `DATABASE_URL` yet, needs a Neon project provisioned.
- `src/auth/README.md` + `src/auth/beta-allowlist.ts` — Clerk plan only, NOT wired
  into `src/app/layout.tsx` (would crash without keys). Needs a Clerk project + keys,
  and the closed-beta allowlist mechanics spike flagged in OPEN_QUESTIONS.md.
- `src/simulation-engine/trace.ts` — bare request-flow tracer only; no animation UI,
  no per-component behavior stubs (cache hit/miss, etc.) yet.

**Repo state:** git-initialized, first commit `bfa7e43` ("Scaffold Next.js app: canvas,
component registry, validation engine"), pushed to
`git@github.com:Prateesh-Sulikeri/ScaleCraft.git` on `main` — confirmed
`origin/main` matches `HEAD`. 41 files, ~12.4k lines (bulk is `package-lock.json`).

**Product decisions to not accidentally violate:** Multiplayer/real-time collaboration
is REJECTED outright — never build it, never shape persistence around it. Validation
"explanations" (why it failed) must ALWAYS show on failure; "hints" (how to fix) must
NEVER auto-surface, only on deliberate user request. See "Hints vs. explanations" in
`.claude/docs/ARCHITECTURE.md`.

**Next steps (candidates, not ordered):**
- Build out the first real Building Blocks chapter content per MVP_SCOPE.md's
  "two chapters" requirement.
- Flesh out canvas UI: drag-from-palette, config panels, docs panel.
- Wire simulation engine to an animation UI; add per-component behavior stubs.
- Provision Neon + Clerk accounts to unblock persistence/auth (external, needs the
  user).
