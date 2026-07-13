# MVP Scope

Status: **decided**, 2026-07-13. Target: closed beta with a small set of invited users
(per the resolved access-model question — see conversation history), built solo at a
daily/semi-focused pace.

## Why two chapters, not one

`INITIAL_THOUGHTS.md`'s core design principle is component reuse *across* chapters, not
polish on a single chapter. A single fully-realized chapter would prove the canvas works
but wouldn't prove the thing that actually differentiates ScaleCraft — that the same
Component Definitions, the same validation engine, and the same content model hold up
across more than one problem. Two chapters is the minimum that tests reuse.

## MVP v1 (closed beta)

1. **Auth**: Clerk, closed-beta allowlist (admin adds specific invited emails; no public
   signup yet).
2. **Canvas**: place, connect, move, delete, configure components (React Flow); category-
   colored palette sidebar (see [[DESIGN_LANGUAGE]]).
3. **Two Building Blocks chapters**, fully wired end-to-end — problem statement,
   constrained component palette, live validation, hints, success criteria. (Candidates
   straight from `INITIAL_THOUGHTS.md`'s own example: a networking/load-balancing
   chapter and the caching chapter it explicitly sketches.)
4. **Validation engine**, live: inline canvas highlighting of offending nodes/edges +
   a feedback panel with short message + expandable long-form reasoning (see
   [[ARCHITECTURE]]).
5. **Component docs panel**: markdown documentation per component, opened contextually.
6. **Sandbox mode**: full (MVP-scope) component library, no constraints, save/load.
7. **Persistence**: local-first autosave (IndexedDB) + cloud sync to Postgres per
   authenticated user (see [[ARCHITECTURE]]).
8. **Pre-saved design loading**: chapter starter graphs, at least one internal reference
   solution per chapter (used for our own QA of the validation rules, not necessarily
   exposed to users as a "reveal answer" button in v1).
9. **Lightweight simulation**: on-demand animated token tracing a request path through
   the graph — qualitative only, no performance metrics (see [[ARCHITECTURE]]).

## Explicitly out of scope for v1

| Deferred to | What | Why |
|---|---|---|
| v1.1 | Real World Extraction mode (URL Shortener, Instagram, Netflix, ...) | Prove the two-chapter content model first; this mode's "multiple valid solutions, less restrictive validation" is a materially different validation posture worth building once, deliberately, not organically. |
| v1.2+ | Quantitative simulation (latency percentiles, throughput, capacity/failure modeling) | Multi-week R&D effort on its own (see [[RESEARCH]] on SysSimulator's WASM discrete-event engine) — separate spike, not MVP-blocking. |
| Post-beta | Public open registration, billing/paywall | Explicitly sequenced: closed beta validates the core loop first. |
| Later | Mobile/touch-optimized canvas | Desktop-first; the interaction model (drag, connect, configure) is complex enough to get right on one input model before adapting to touch. |
| Later | Community-shared design gallery | Needs moderation/UGC thinking not worth doing before there's a community. |

## Explicitly rejected — not on any roadmap

**Real-time multiplayer / collaborative editing.** Not deferred, not "v2" — rejected
outright. Post-beta, ScaleCraft is a single-player, self-serve product: any individual
logs in and works through it alone, closer to a self-paced course than a shared
workspace. Don't design persistence, the graph model, or the editor state around
eventual multiplayer support — that would be paying a tax for a feature that isn't
coming. If this ever changes it needs a deliberate new decision, not a "we already
half-built toward it."

## Definition of done for v1

An invited beta user can: sign in, attempt both Building Blocks chapters and, on any
failed attempt, get a clear explanation of *why* it failed — not a bare pass/fail, but
also not forced guidance toward the fix. Hints exist per chapter but are only ever shown
if the user deliberately asks for one (see the hints/explanations distinction in
[[ARCHITECTURE]]). The user can read component docs along the way, drop into Sandbox and
freely build with the same components, and have their work persist across a browser
refresh and a different device.
