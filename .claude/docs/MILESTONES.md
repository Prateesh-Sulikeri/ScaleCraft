# Milestones to MVP

Status: **working roadmap**, last revised 2026-07-15 to insert a new milestone
(Stronger validation agent) after a live sandbox session surfaced a real gap: a
visibly nonsensical graph (disconnected components, backwards wiring, edges picked
with a kind that happens to dodge every rule's `kind === "request-flow"` check)
reported zero violations. Milestones 5 and up are renumbered accordingly — see git
history on this file if you want the diff. Picking up right after the initial
scaffold (canvas + registry + validation engine wired end-to-end, no interactivity
yet — see [[../PROGRESS_LOG]]). Order matters: each milestone is independently
demoable and unblocks the next. Re-sequence here if reality disagrees with the plan,
don't just drift.

## Why this order

Milestones 1–2 unblock everything downstream (chapters, Real World Extraction, and
Sandbox all need an editable canvas with working panels), so they're first. **Sandbox
(3)** comes before the Home page and the chapter framework because it's nearly free
once 1–2 exist (just the canvas with no wrapper) and gives an early, real, demoable
checkpoint. **Home (4)** comes right after — as soon as there are two real destinations
(Sandbox, and chapters-to-come) a mode-select entry point is worth having, even before
chapters exist: it ships as a skeleton (working Sandbox link, chapter links filled in
as 7/8 land, progress indicators wired for real once persistence (10) lands).
**Stronger validation (5)** sits here, before the chapter framework, because a
chapter's success-criteria detection (milestone 6) is defined as "zero error-severity
violations" — a chapter framework built on top of a validation engine that lets
obviously-broken architectures pass would inherit that same blind spot into every
chapter's pass/fail logic. Fix the engine's coverage before more of the product is
built to depend on it being trustworthy. The **chapter framework (6)** is built
mode-aware from the start — `ChapterDefinition.mode` already covers
`"building-blocks" | "real-world-extraction"` (see [[ARCHITECTURE]]) — so Building
Blocks (7) and Real World Extraction (8) share one implementation instead of needing a
second framework built later. RWE comes *after* the two Building Blocks chapters
specifically to prove the framework on the easier, more constrained case first before
testing it against a fundamentally different validation posture. Auth (9) has an
external dependency (provisioning Clerk + Neon accounts) that can start **any time in
parallel** — it's account setup, not code, and doesn't block 4–8.

## 1. Interactive canvas core

Palette sidebar to drag components from; move/connect/delete nodes and edges; pick an
edge kind (`request-flow` / `control` / `replication` / `async`, see
[[ARCHITECTURE]]) on connect; validation re-runs live on every edit via the existing
engine (`src/validation-engine/engine.ts` — no changes needed there, just wiring).

**Done when:** the Client→LB→App→DB graph currently hardcoded in `src/app/page.tsx` can
instead be built by hand, and `noDirectClientDatabase` fires/clears live as you edit.

## 2. Node inspector panel

Click a node → side panel with two distinct, user-selected sections (tabs or a
toggle, not both forced into view at once):

- **Config** — a form bound to the component's `configSchema` (react-hook-form + zod,
  per [[TECH_STACK]]) and its `defaultConfig`.
- **Docs** — the component's markdown `docs`, opened on demand as a "learn more"
  action. This is read *because the user chose to read it*, same spirit as the
  hints-are-opt-in rule for chapters (see [[ARCHITECTURE]], "Hints vs. explanations") —
  informational content should never be shoved in front of someone who just wants to
  keep building.

**Done when:** every seed component (`src/content/components/registry.ts`) is
configurable, and its docs are reachable but not intrusive.

## 3. Sandbox mode — done

A dedicated `/sandbox` route: full component registry, free editing, live validation,
no constraints — matches `INITIAL_THOUGHTS.md`'s Sandbox description exactly.

**Done when:** this is a genuinely shippable, standalone "play with it" experience —
treat this as the first real MVP-shaped checkpoint, worth demoing on its own.

**Status:** done. What had accumulated at `/` through milestones 1–2 (canvas, palette,
node inspector, validation, persistence — already exactly the "no objectives, no
constraints" experience `INITIAL_THOUGHTS.md` describes) moved to `src/app/sandbox/`
essentially unchanged; the milestone was route structure, not new functionality. `/`
now `redirect()`s to `/sandbox` as a placeholder until milestone 4 gives it a real
mode-select page.

## 4. Home / mode-select page

The landing page after sign-in (`/`): entry points into Building Blocks, Real World
Extraction, and Sandbox, plus a per-chapter progress indicator (not started / in
progress / complete).

Built incrementally, not as one big-bang page: ships as a skeleton once Sandbox (3)
exists (its link is real, chapter links are placeholders), gets populated as chapters
land (7, 8), and its progress indicators go from static to real once persistence (10)
is wired. Answering "when does the home page get built" — here, early, deliberately
unfinished at first rather than left for the end.

**Done when (final state, after 10):** progress indicators reflect real saved state,
not placeholders.

## 5. Stronger validation agent

The rule-based engine (`src/validation-engine/`) currently has 6 hand-picked
structural/config rules — nowhere near the space of nonsensical architectures a user
can actually build. Reported live: a graph with disconnected components (a Cron Job
and a CDN wired to nothing), backwards/nonsensical data flow (a Browser connected
straight into a distributed-systems Leader node, a Serverless Function feeding into a
Load Balancer instead of the other way around), and edges drawn with a `kind` that
happens to dodge every existing rule's `kind === "request-flow"` filter — all reported
**zero violations**. Two compounding problems: hand-authored rules are inherently a
long tail (a rule per anti-pattern doesn't scale to "architecture makes sense" in
general), and any rule keyed to a specific `EdgeKind` is trivially sidestepped by
picking a different kind for the same connection.

Two tracks, not necessarily either/or:

- **Broaden structural rule coverage.** An orphan/disconnected-component check (a node
  with no edges at all is almost always a mistake). Category-adjacency sanity (nothing
  client-facing should wire straight into a Distributed Systems primitive like Leader/
  Follower/Lock Service without an intervening Compute component). Edge-kind-agnostic
  versions of existing topology checks — verify the *connection* exists regardless of
  which `EdgeKind` was picked, and only fall back to kind-specific logic where the kind
  is genuinely load-bearing (e.g. `orphan-read-replica`'s real requirement for a
  `replication`-kind edge specifically).
- **Investigate an LLM-assisted validation pass.** `ValidationRule` is already just a
  pure function over the graph (`src/validation-engine/types.ts`) that returns the same
  message+explanation shape every rule uses — worth spiking whether a holistic "does
  this architecture make sense" critique (an LLM given the graph plus each component's
  `docs`) catches the combinatorial cases hand-written rules structurally can't, surfaced
  through that exact same `ValidationViolation` shape so it's indistinguishable from a
  rule-based violation to the rest of the app. Needs a design decision on where that
  call actually happens (a Route Handler, not client-side, to avoid shipping an API key
  to the browser) and probably belongs behind milestone 9's auth work rather than
  shipping an unauthenticated, uncapped LLM call — cost-control needs to exist before
  this ships, not after.

**Done when:** the reported failure mode — a visibly nonsensical graph reporting zero
violations — no longer reproduces, and `INITIAL_THOUGHTS.md`'s "Validation Philosophy"
("teach architectural thinking," not just catch a fixed list of textbook anti-patterns)
is actually true of what ships, not just true of the handful of rules that happen to be
hand-written today.

## 6. Chapter framework (shell)

Generic chapter runtime, mode-aware from the start (`"building-blocks"` and
`"real-world-extraction"` share this one implementation, not two): problem statement +
learning objectives display, palette filtered to `availableComponentIds`,
required-component tracking, success-criteria detection (zero `error`-severity
violations + all `requiredComponentIds` present and connected), hints panel that is
**opt-in only** — never auto-shown on failure, only on deliberate user action (see
"Hints vs. explanations" in [[ARCHITECTURE]]).

**Done when:** the shell runs correctly against one throwaway dummy `ChapterDefinition`
— prove the mechanism before investing in real content.

## 7. First two Building Blocks chapters

Author actual content: problem statements, starter graphs, chapter-scoped validation
rules, hints, reading links, for two chapters (Networking/Load-Balancing and Caching are
the candidates `INITIAL_THOUGHTS.md` itself sketches). Will likely need 1–2 more
components added to the registry (Cache, at minimum — though see milestone 5's note,
`cache` already exists in the registry now, so this may already be satisfied by the
time this milestone starts).

**Done when:** [[MVP_SCOPE]]'s reuse bet is proven within Building Blocks — the same
components, engine, and shell serve both chapters without forking anything.

## 8. Real World Extraction: bit.ly

One chapter, the smallest plausible Real World Extraction case: a URL shortener.
Larger component palette than Building Blocks; validation rules aimed at catching
anti-patterns rather than enforcing one prescribed shape (there should be more than one
architecture that passes); reading links out to relevant textbook sections.

**Done when:** [[MVP_SCOPE]]'s harder bet is proven — that `ChapterDefinition`'s
`mode` field and the shell from milestone 6 actually support "multiple valid
solutions, less restrictive validation" without needing a second framework. If it
turns out they don't, that's the moment to revisit the data model, not after building
more RWE content on a shaky foundation.

## 9. Local-first persistence

Dexie/IndexedDB autosave + restore for sandbox saves and chapter attempts (both
Building Blocks and RWE), per [[ARCHITECTURE]]'s "Persistence" section. No auth
required for this layer — it works standalone. This is what upgrades the Home page's
progress indicators (4) from placeholders to real state.

**Partially pulled forward into milestone 2's follow-up round:** the core "a refresh
doesn't lose work" primitive already exists — `src/persistence/db.ts` (Dexie, table
`saves`) plus a manual Save/Export/Import in the header, restoring on load if a save
is present. What's still deferred to this milestone proper: autosave-on-every-edit
(today's is a manual button, not automatic), multi-slot saves for actual chapter
attempts (the Dexie schema is keyed to allow this later, but there's only one fixed
`"sandbox"` slot today), and the Home page wiring in (4).

**Done when:** autosave-on-every-edit works offline for both sandbox and chapter
attempts, and Home reflects real state.

## 10. Auth + cloud sync — *external dependency, can start anytime*

Blocked on provisioning a Clerk project and a Neon project — account setup only you can
do, not something to code around. Once keys exist: wire `ClerkProvider` + the
beta-allowlist stub (`src/auth/beta-allowlist.ts`) + Route Handlers syncing IndexedDB
state to Postgres (`src/db/schema.ts` / `src/db/client.ts`) per authenticated user. See
the Clerk allowlist-mechanics spike flagged in [[OPEN_QUESTIONS]] — do that check before
wiring, not after.

**Done when:** an invited user gets cross-device continuity.

## 11. Qualitative simulation

Wire the existing request-flow tracer (`src/simulation-engine/trace.ts`) to an
on-demand animated token on the canvas via a "Simulate request" action. Qualitative
only — no latency/throughput modeling, see [[OPEN_QUESTIONS]].

**Done when:** a user can watch a request visually traverse their graph.

## 12. Beta polish pass

Full click-through of both Building Blocks chapters, the RWE chapter, and Sandbox on a
fresh account, theme/accessibility check (dark/light, per [[DESIGN_LANGUAGE]]), then
send the first closed-beta invites.

**Done when:** this matches [[MVP_SCOPE]]'s "Definition of done for v1," verified
end-to-end, not assumed.
