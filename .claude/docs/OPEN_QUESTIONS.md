# Open Questions & Technological Blockers

Things that are deliberately *not* fully resolved yet. Each has an owner (who needs to
resolve it) and a trigger (when it actually needs resolving — most of these should not
block starting to build).

## Needs verification against real content (architect's call, pending contact with reality)

**Request-flow-only acyclicity.** [[ARCHITECTURE]] proposes the DAG constraint applies
only to `request-flow` edges, with `control`/`replication`/`async` edges exempt, to
allow legitimate back-edges (replica sync, cache invalidation, heartbeats) without
breaking `INITIAL_THOUGHTS.md`'s "Directed Acyclic" property. This is a clean model on
paper. **Trigger**: revisit once the two MVP chapters are drafted — if either chapter
needs a back-edge pattern this model doesn't cleanly cover, the edge-kind taxonomy needs
to grow before it hardens into the persisted data format.

## Needs a short spike before/while building (owner: you)

**Clerk's closed-beta allowlist mechanics.** Assumed Clerk's invite/waitlist feature
cleanly supports "admin adds a specific list of emails, everyone else is blocked." Worth
a 30-minute check against Clerk's current docs before wiring auth — if it's awkward for
a single-digit/low-double-digit beta, a hand-rolled allowlist table + magic link may be
less friction than fighting a feature not built for this exact shape.

**Icon asset set.** [[DESIGN_LANGUAGE]] recommends starting from Lucide and composing
custom icons only where needed, rather than commissioning a bespoke set up front.
**Trigger**: once the MVP component list (from the two chapters) is finalized, do a
quick pass checking which components Lucide covers well vs. need custom composition —
should be resolvable in an afternoon, not a blocker to starting the canvas build.

## Deliberately deferred, not blocking (owner: future you, once MVP ships)

**Quantitative simulation depth.** Whether ScaleCraft ever builds SysSimulator-style
discrete-event performance modeling (latency percentiles, throughput, capacity/failure
scenarios) is unresolved on purpose — it's a multi-week-plus investment that shouldn't
be decided under MVP time pressure. Revisit after v1 ships and there's real usage signal
on whether qualitative simulation is actually the limiting factor for learning outcomes.

**Rule-authoring ergonomics at scale.** Validation rules are hand-written TypeScript
objects for MVP — fine at two-chapter scale. **Trigger**: if the chapter count grows
large enough that rule-writing becomes repetitive/error-prone, revisit whether a
lighter DSL or authoring helper is worth building. Not a concern yet.

## Explicitly rejected (not open questions — settled, don't revisit casually)

**Real-time multiplayer / collaborative editing.** Rejected outright, not deferred —
see [[MVP_SCOPE]]. ScaleCraft post-beta is single-player: an individual logs in and
works through it alone, closer to a self-paced course than a shared workspace. Don't
let persistence or graph-state design pay any tax for eventual multiplayer support.

## Business/sequencing (owner: you, no technical dependency)

**Vercel plan timing.** Hobby (free) tier's ToS covers non-commercial/personal use,
which the closed beta fits. **Trigger**: upgrade to Pro (~$20/mo) before public launch
or any monetization, not before — no architecture change required either way.

**Public launch access model.** Closed beta is invite-only by design; the transition to
open registration (and whether/when a paid tier appears) is intentionally not decided
yet — [[MVP_SCOPE]] sequences it as "post-beta" without a firmer commitment. Revisit once
the closed beta has enough signal to make that call with real data instead of a guess.

**React Flow attribution watermark.** Hidden via `proOptions={{ hideAttribution: true }}`
in `src/canvas/Canvas.tsx` as of milestone 1. xyflow's terms permit this without a Pro
subscription for non-commercial projects — true of the closed beta right now. **Trigger:**
re-check xyflow's current terms before any monetized/public launch; either the terms
still cover it, a Pro subscription needs purchasing, or the attribution needs restoring.

**Custom component contract authoring as a paid tier.** Custom, user-authored components
(`src/content/components/custom.ts`) deliberately have no UI for declaring their own
relational contract (see `ComponentRelations` in `content/components/types.ts`) — they
fall back to the coarse category-level checks in `canvas/legal-edge-kinds.ts` instead.
Floated as a possible future paid feature rather than something to build now: there's no
monetization model, billing infra, or pricing decision anywhere in this project yet (see
"Vercel plan timing" and "Public launch access model" above), and building the authoring
UI ahead of that would be scope creep beyond what a learner customizing a component
actually needs today. **Trigger:** if/when a monetization model exists at all, or if
users start visibly running into the coarse-fallback ceiling often enough that it's a
real, requested gap rather than a hypothetical one.
