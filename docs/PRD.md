# ScaleCraft — Product Requirements Document

Status: living document, derived from `INITIAL_THOUGHTS.md` (vision),
`.claude/docs/MVP_SCOPE.md` (scope decisions), and `.claude/docs/MILESTONES.md`
(sequencing). Those remain the decision records; this is the consolidated,
readable statement of *what the product is and must do*.

---

## 1. Product vision

ScaleCraft is an **interactive system-design learning lab** — not a game, not a
diagramming tool. Users learn to build and reason about real-world distributed
systems by assembling architectures from reusable components (load balancers,
databases, caches, queues, …) on a canvas, and receiving validation feedback
that **explains architectural reasoning** rather than just marking answers
wrong.

It complements a separate, private system-design textbook by the same author:
the textbook explains concepts and trade-offs; ScaleCraft is where they are
applied. The two share vocabulary and mental model but are **not content-coupled**
— ScaleCraft only ever links out via manual citation URLs.

## 2. Target user

A self-directed learner (student, junior-to-mid engineer, interview candidate)
working through system design **alone, at their own pace** — closer to a
self-paced course than a shared workspace. Desktop-first; the drag/connect/
configure interaction model is explicitly not being adapted for touch in v1.

## 3. Learning modes

### 3.1 Building Blocks (guided)
- Each chapter presents a problem statement and learning objectives.
- The palette is **constrained to the chapter's components** — restriction
  comes from the chapter, not the mode.
- Predefined connection rules; contextual per-component documentation.
- Hints exist but are strictly opt-in (see §5).

### 3.2 Real World Extraction (applied)
- Complete production-shaped problems: URL shortener (v1), later Instagram,
  Netflix, WhatsApp, distributed log collector, …
- Larger palette, **multiple valid solutions**, less restrictive validation
  aimed at catching anti-patterns rather than enforcing one prescribed shape.
- Richer trade-off discussion; reading links out to the textbook.

### 3.3 Sandbox (free)
- No objectives, no scoring, no constraints beyond component rules.
- Full registry plus user-created custom components; save/load; annotation
  tools (zones, comments, flags).

## 4. Core design principle: component reuse

The platform is built around **reusable architectural components, not
per-problem logic**. The same Cache introduced in the caching chapter is the
Cache used in the Instagram exercise. Chapters opt components in by id; they
never fork or redefine a component. If a chapter needs different behavior,
that is a config option or a chapter-scoped validation rule — never a new
component. Learning complexity comes from composition, not new mechanics.

## 5. Product principles (non-negotiable)

1. **Validation explains why.** A bare "invalid" is a bug. Every failed rule
   surfaces a short message *and* a long-form architectural explanation,
   always shown, unconditionally.
2. **Hints are opt-in, always.** Hints (how to fix) are a separate layer from
   explanations (why it failed). They are never auto-surfaced, never escalated
   by attempt count. A user who never asks for a hint must be able to fail,
   read explanations, and reason their own way to a fix.
3. **Single-player, permanently.** Multiplayer/collaborative editing is
   rejected outright — not deferred. Persistence and graph state must never
   pay a design tax for collaboration that isn't coming.
4. **Not a game.** No scoring theatrics, no decorative animation, no confetti.
   Motion communicates state only.

## 6. MVP v1 requirements (closed beta)

| # | Requirement | Status (2026-07-21) |
|---|---|---|
| 1 | Clerk auth with closed-beta email allowlist | Stubbed, not wired |
| 2 | Canvas: place, connect, move, delete, configure components | **Done** |
| 3 | Home / mode-select page with per-chapter progress | Skeleton done; progress static |
| 4 | Two Building Blocks chapters, end-to-end | Not started |
| 5 | One Real World Extraction chapter (bit.ly URL shortener) | Not started |
| 6 | Validation engine with inline highlighting + explanations | Done (10 rules; coverage expanding per milestone 5) |
| 7 | Per-component markdown docs, on demand | **Done** (docked docs panel, tabs) |
| 8 | Sandbox mode with full registry, save/load | **Done** |
| 9 | Persistence: local-first autosave + cloud sync per user | Manual save + import/export done; autosave and cloud sync pending |
| 10 | Chapter starter graphs + internal reference solutions | Not started |
| 11 | Qualitative simulation (animated request token) | Tracer stubbed; no UI |

**Definition of done for v1:** an invited beta user signs in, lands on Home
with real progress indicators, can attempt both Building Blocks chapters and
the bit.ly RWE chapter, always sees *why* an attempt failed, can pull hints
only deliberately, can read component docs on demand, can build freely in
Sandbox with the same components, and keeps their work across refreshes and
devices.

## 7. Explicitly out of scope

- **v1.1:** additional RWE problems (content work, not core-loop risk).
- **v1.2+:** quantitative simulation (latency/throughput modeling) — separate
  multi-week R&D effort.
- **Post-beta:** public registration, billing.
- **Later:** mobile/touch canvas; community design gallery (needs UGC/
  moderation thinking).
- **Never:** real-time multiplayer (see §5.3).

## 8. Success criteria for the beta

- Invited users complete both Building Blocks chapters without external help
  beyond in-app explanations (hints optional).
- The same component registry, validation engine, and chapter shell serve
  Building Blocks and RWE without forking — the reuse bet proven.
- Users report that failed validations taught them something ("I understand
  why now"), not just blocked them.
