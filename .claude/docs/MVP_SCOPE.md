# MVP Scope

Status: **decided**, 2026-07-13. Target: closed beta with a small set of invited users
(per the resolved access-model question — see conversation history), built solo at a
daily/semi-focused pace.

## Why two Building Blocks chapters plus one Real World Extraction chapter

`INITIAL_THOUGHTS.md`'s core design principle is component reuse *across* chapters, not
polish on a single chapter. A single fully-realized chapter would prove the canvas works
but wouldn't prove the thing that actually differentiates ScaleCraft — that the same
Component Definitions, the same validation engine, and the same content model hold up
across more than one problem. Two Building Blocks chapters is the minimum that tests
reuse *within* one mode.

Real World Extraction is a materially different validation posture — "multiple valid
solutions, less restrictive validation" instead of one expected pattern — and that risk
is real enough to want proven before calling the MVP done, not deferred and hoped for.
`ChapterDefinition.mode` already models both (`"building-blocks" | "real-world-extraction"`,
see [[ARCHITECTURE]]), so this isn't a second framework to build — it's a test of
whether the one framework actually generalizes. One RWE chapter, the smallest
plausible case (a bit.ly-style URL shortener), is enough to prove or disprove that
without taking on a whole library of Real World Extraction problems up front — see
[[MILESTONES]] for where this sits in the build sequence.

## MVP v1 (closed beta)

1. **Auth**: Clerk, closed-beta allowlist (admin adds specific invited emails; no public
   signup yet).
2. **Canvas**: place, connect, move, delete, configure components (React Flow); category-
   colored palette sidebar (see [[DESIGN_LANGUAGE]]).
3. **Home / mode-select page**: the entry point after sign-in — links into Building
   Blocks chapters, the Real World Extraction chapter, and Sandbox, with a per-chapter
   progress indicator (not started / in progress / complete) once persistence exists.
4. **Two Building Blocks chapters**, fully wired end-to-end — problem statement,
   constrained component palette, live validation, hints, success criteria. (Candidates
   straight from `INITIAL_THOUGHTS.md`'s own example: a networking/load-balancing
   chapter and the caching chapter it explicitly sketches.)
5. **One Real World Extraction chapter**: a bit.ly-style URL shortener — larger
   component palette, success criteria based on avoiding anti-patterns rather than one
   prescribed shape, reading links out to relevant textbook sections.
6. **Validation engine**, live: inline canvas highlighting of offending nodes/edges +
   a feedback panel with short message + expandable long-form reasoning (see
   [[ARCHITECTURE]]).
7. **Component docs panel**: markdown documentation per component, presented as a
   distinct, user-selected section of the node inspector panel (a "Docs" tab/toggle
   next to "Config") — read on demand, not forced into view.
8. **Sandbox mode**: full (MVP-scope) component library, no constraints, save/load.
9. **Persistence**: local-first autosave (IndexedDB) + cloud sync to Postgres per
   authenticated user (see [[ARCHITECTURE]]) — this is what makes the Home page's
   progress indicators real rather than static.
10. **Pre-saved design loading**: chapter starter graphs, at least one internal reference
    solution per chapter (used for our own QA of the validation rules, not necessarily
    exposed to users as a "reveal answer" button in v1).
11. **Lightweight simulation**: on-demand animated token tracing a request path through
    the graph — qualitative only, no performance metrics (see [[ARCHITECTURE]]).

## Explicitly out of scope for v1

| Deferred to | What | Why |
|---|---|---|
| v1.1 | Additional Real World Extraction problems (Instagram, Netflix, Bit.ly's own advanced-tier features, WhatsApp, ...) | One RWE chapter (bit.ly) ships in v1 specifically to prove the framework generalizes to "multiple valid solutions" validation; expanding the *library* of problems is fast-follow content work, not a core-loop risk. |
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

An invited beta user can: sign in and land on a Home page that lets them choose between
Building Blocks, Real World Extraction, and Sandbox, with real progress indicators for
each. They can attempt both Building Blocks chapters and the bit.ly Real World
Extraction chapter and, on any failed attempt, get a clear explanation of *why* it
failed — not a bare pass/fail, but also not forced guidance toward the fix. Hints exist
per chapter but are only ever shown if the user deliberately asks for one (see the
hints/explanations distinction in [[ARCHITECTURE]]). The user can open component docs
on demand as they work, drop into Sandbox and freely build with the same components,
and have their work — including chapter progress — persist across a browser refresh
and a different device.
