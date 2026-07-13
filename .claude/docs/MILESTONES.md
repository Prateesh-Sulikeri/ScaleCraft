# Milestones to MVP

Status: **working roadmap**, decided 2026-07-13, picking up right after the initial
scaffold (canvas + registry + validation engine wired end-to-end, no interactivity yet
— see [[../PROGRESS_LOG]]). Order matters: each milestone is independently demoable and
unblocks the next. Re-sequence here if reality disagrees with the plan, don't just drift.

## Why this order

Milestones 1–2 unblock everything downstream (chapters and sandbox both need an
editable canvas with working panels), so they're first. **Sandbox (3)** comes before
the chapter framework (4) even though [[MVP_SCOPE]] lists chapters first — it's nearly
free once 1–2 exist (just the canvas with no wrapper) and gives an early, real,
demoable checkpoint instead of a long stretch before anything feels finished. Chapters
(4–5) are the hard curriculum work and come after. Persistence (6) and simulation (8)
are additive and don't block each other. Auth (7) has an external dependency
(provisioning Clerk + Neon accounts) that can start **any time in parallel** — it's
account setup, not code, and doesn't block engineering on 4–6.

## 1. Interactive canvas core

Palette sidebar to drag components from; move/connect/delete nodes and edges; pick an
edge kind (`request-flow` / `control` / `replication` / `async`, see
[[ARCHITECTURE]]) on connect; validation re-runs live on every edit via the existing
engine (`src/validation-engine/engine.ts` — no changes needed there, just wiring).

**Done when:** the Client→LB→App→DB graph currently hardcoded in `src/app/page.tsx` can
instead be built by hand, and `noDirectClientDatabase` fires/clears live as you edit.

## 2. Node inspector panel

Click a node → side panel with (a) a config form bound to its `configSchema`
(react-hook-form + zod, per [[TECH_STACK]]) and its `defaultConfig`, (b) its markdown
`docs` rendered.

**Done when:** every seed component (`src/content/components/registry.ts`) is
configurable and its docs are readable from the canvas.

## 3. Sandbox mode

A dedicated `/sandbox` route: full component registry, free editing, live validation,
no constraints — matches `INITIAL_THOUGHTS.md`'s Sandbox description exactly.

**Done when:** this is a genuinely shippable, standalone "play with it" experience —
treat this as the first real MVP-shaped checkpoint, worth demoing on its own.

## 4. Chapter framework (shell)

Generic chapter runtime, content-agnostic: problem statement + learning objectives
display, palette filtered to `availableComponentIds`, required-component tracking,
success-criteria detection (zero `error`-severity violations + all
`requiredComponentIds` present and connected), hints panel that is **opt-in only** —
never auto-shown on failure, only on deliberate user action (see "Hints vs.
explanations" in [[ARCHITECTURE]]).

**Done when:** the shell runs correctly against one throwaway dummy `ChapterDefinition`
— prove the mechanism before investing in real content.

## 5. First two real Building Blocks chapters

Author actual content: problem statements, starter graphs, chapter-scoped validation
rules, hints, reading links, for two chapters (Networking/Load-Balancing and Caching are
the candidates `INITIAL_THOUGHTS.md` itself sketches). Will likely need 1–2 more
components added to the registry (Cache, at minimum).

**Done when:** [[MVP_SCOPE]]'s "why two chapters, not one" reuse bet is actually proven
— the same components, engine, and shell serve both chapters without forking anything.

## 6. Local-first persistence

Dexie/IndexedDB autosave + restore for sandbox saves and chapter attempts, per
[[ARCHITECTURE]]'s "Persistence" section. No auth required for this layer — it works
standalone.

**Done when:** a browser refresh doesn't lose work, offline.

## 7. Auth + cloud sync — *external dependency, can start anytime*

Blocked on provisioning a Clerk project and a Neon project — account setup only you can
do, not something to code around. Once keys exist: wire `ClerkProvider` + the
beta-allowlist stub (`src/auth/beta-allowlist.ts`) + Route Handlers syncing IndexedDB
state to Postgres (`src/db/schema.ts` / `src/db/client.ts`) per authenticated user. See
the Clerk allowlist-mechanics spike flagged in [[OPEN_QUESTIONS]] — do that check before
wiring, not after.

**Done when:** an invited user gets cross-device continuity.

## 8. Qualitative simulation

Wire the existing request-flow tracer (`src/simulation-engine/trace.ts`) to an
on-demand animated token on the canvas via a "Simulate request" action. Qualitative
only — no latency/throughput modeling, see [[OPEN_QUESTIONS]].

**Done when:** a user can watch a request visually traverse their graph.

## 9. Beta polish pass

Full click-through of both chapters + sandbox on a fresh account, theme/accessibility
check (dark/light, per [[DESIGN_LANGUAGE]]), then send the first closed-beta invites.

**Done when:** this matches [[MVP_SCOPE]]'s "Definition of done for v1," verified
end-to-end, not assumed.
