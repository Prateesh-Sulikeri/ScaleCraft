# NEXT STEPS — everything pending, in execution order

Compiled 2026-07-22 from every doc that tracks open work: `.claude/docs/MILESTONES.md`,
`.claude/docs/pending.md` (code review 2026-07-21), `.claude/docs/user_exp.md` +
`.claude/docs/CRITIQUE.md` (UX walkthrough 2026-07-22),
`.claude/docs/UI_OVERHAUL_PART2_SPEC.md` (approved, not implemented),
`.claude/docs/OPEN_QUESTIONS.md`, `.claude/docs/CURRICULUM.md`, and
`.claude/PROGRESS_LOG.md` loose ends. Work top to bottom; items inside a step are also
ordered. Check items off / delete them here as they land.

**Why this order:** small correctness fixes first (cheap, and everything after builds on
them) → the approved UI overhaul next (it *deletes* the Palette and QuestionPanel, so
polishing those first would be wasted work, and its Phase 5 ships milestone 6's chapter
shell) → stronger validation (milestone 5 must be trustworthy before chapter pass/fail
depends on it) → UX fixes applied to the *new* layout → then the content milestones
(7 → 8) per the curriculum, then persistence → auth → simulation → beta. This resolves
pending.md's "product-thesis drift" warning: after steps 1–2, all remaining work is on
the differentiating product (chapters), not more sandbox polish.

---

## Step 0 — Repo & process housekeeping (do first, < 1 hour)

1. Resolve the uncommitted working-tree churn on `development`: the deletions of
   `.claude/docs/ScaleCraft_UI_Overhaul_Specification.md` and root `AGENTS.md`, and the
   untracked `.claude/docs/AGENTS.md`, `.claude/docs/UI_OVERHAUL_PART2_SPEC.md`,
   `.claude/docs/user_exp.md`, `.impeccable/critique/2026-07-22T…walkthrough.md` —
   commit the doc moves/additions on a branch so the approved spec is actually in git
   history before anyone implements from it.
2. User merges the pushed, unmerged branches when satisfied:
   `fix/flows-workflow-tests` (P0 CI fix — merge first),
   `docs/curriculum-design` (CURRICULUM.md + this file).
3. Revive the `PROGRESS_LOG.md` convention (pending.md flags it lapsed since
   2026-07-15 while ~10 significant commits landed): spawn the logging subagent to
   append a catch-up entry, and log after every step below.
4. Run `graphify update .` after each step lands (hooks exist, but verify freshness).

## Step 1 — Correctness & security quick fixes (pending.md P1/P2, ~1 day)

Order of attack per pending.md §"Suggested order":

1. **Import validation** — Zod schema for the save-file shape in
   `ProjectMenu.tsx:44` `handleImportFile` (~30 lines; doubles as the security fix for
   shared export files).
2. **Mermaid `securityLevel: "strict"`** pinned in `MermaidBlock.tsx` (one line).
3. **Undo double-restore** — clear `pendingUndo` on `undo()`/`redo()` and/or make
   merge-mode restore skip existing IDs (`src/canvas/store.ts`).
4. **`reverseEdge` handle swap** — also swap `sourceHandle`/`targetHandle`
   (`store.ts:967`).
5. **Validation staleness key** — stop `JSON.stringify(toArchitectureGraph(...))` on
   every render in `sandbox/page.tsx:130`; strip positions from the key and memoize
   (also fixes "moving a node marks results stale with zero topology change").
6. **Allowlist case normalization** in `src/auth/beta-allowlist.ts` (tiny; must exist
   before Step 8 wires Clerk).

## Step 2 — UI Overhaul Part 2 (approved spec, phases in its own order)

Implement `.claude/docs/UI_OVERHAUL_PART2_SPEC.md` exactly, Phases 1–6, each
independently shippable with its quality gates:

1. Phase 1 — extract `component-search.ts` + tests (zero behavior change).
2. Phase 2 — Component Picker, additive (`/` shortcut only; old menus untouched).
3. Phase 3 — picker becomes primary in Sandbox: pane right-click → picker, Tools
   group, delete `Palette.tsx` + drag path + `QuestionPanel` mount, empty-canvas
   discoverability hint. Includes the spec's recommended **`useEscapeToClose` hook**
   and migrating existing popovers to it — this closes the critique P1 "the shortcuts
   legend lies about Esc" almost for free.
4. Phase 4 — `SidebarShell` extraction (collapse/resize chrome).
5. Phase 5 — chapter shell: `ChapterWorkspace`, `ChapterSidebar`, `ChapterList`,
   `QuestionPane` (hints strictly opt-in), dummy `ChapterDefinition` per mode,
   `availableComponentIds` filter wired into the picker. **This satisfies milestone
   6's "done when" (shell runs against a throwaway chapter).** Don't persist chapter
   canvases into the sandbox save slot; reset `availableComponentIds` on route leave
   (the spec's flagged most-likely cross-mode bug).
6. Phase 6 — enable the Building Blocks / RWE cards on Home; update `DESIGN.md`;
   log progress entries after Phases 3 and 5 per the spec.

## Step 3 — Milestone 5: stronger validation agent

Must land before real chapter content (milestone ordering rationale: chapter pass/fail
= "zero error violations", so the engine's blind spots become every chapter's blind
spots).

1. Broaden structural rule coverage: orphan/disconnected-component check,
   category-adjacency sanity, edge-kind-agnostic versions of existing topology checks
   (only `orphan-read-replica` keeps a kind-specific requirement).
2. Verify the reported failure mode no longer reproduces: a visibly nonsensical graph
   (disconnected Cron/CDN, Browser→Leader, kind-dodging edges) must report violations.
3. **Defer** the LLM-assisted validation pass until after auth (Step 8) — cost caps
   before shipping, per MILESTONES.md; keep it on the backlog (Step 10).
4. Re-check the chapter-mode validation posture flagged in pending.md: validation is
   manual-button-only today; decide whether chapter mode needs proactive re-validation
   so "explanations always shown on failure" actually bites.

## Step 4 — UX fixes on the new layout (critique P1s/P2s not covered by Step 2)

Apply the 2026-07-22 walkthrough's recommended sequence, minus what Steps 1–2 already
fixed (Esc, insertion discoverability):

1. `/impeccable onboard` — node-click leads nowhere: double-click → Configure (or
   visible ⚙/📖 affordances on selection); first-run color-legend card; helper text
   that mentions right-click.
2. `/impeccable harden` — loss guardrails: "Board cleared — Undo" toast, dirty-dot on
   Save, navigation/beforeunload guard for unsaved work; Clear-board confirm.
3. `/impeccable polish` — stale validation results stay visible but dimmed with an
   explicit "Re-validate" pill (don't delete the evidence); edge `markerEnd`
   arrowheads on all kinds; re-lay the seed graph (no wraparound edge); Highlight
   Connections gets a non-semantic hue + clear affordance (amber currently means
   three things).
4. `/impeccable clarify` — merge/rename the arbitrary Project/Board menus by function;
   text labels on Save/Validate; About dialog copy broken up; edge-inspector jargon.
5. A11y minors from the walkthrough: warning-vs-error rings differ by hue only (add
   glyph/pattern); `aria-live` "Saved" announcement; "Add Flag" aria-label casing.
6. Z-index/tooltip sweep from pending.md §UI review (done here, after the big UI
   churn, to avoid conflicts): migrate all raw `z-50`/`z-20`/`z-30`/`z-40` to the
   `--z-*` tokens; fix the `--z-toast` comment; pin comments/flags behind component
   nodes like zones (`zIndex: -1`) or document why not; consolidate the three tooltip
   implementations into one (with real width-aware edge clamping); horizontal
   edge-flip on the root ContextMenu; pick one dropdown-dismissal pattern (the
   capture-phase listener, per pending.md's own recommendation); reclassify
   `EdgeInspector`'s z tier; `ZoneNode.tsx:109` 10px text onto the type ramp.
7. Re-run `/impeccable critique` and archive the score (baseline: 29/40).

## Step 5 — Milestone 7: first two Building Blocks chapters (real content)

Author per `.claude/docs/CURRICULUM.md` so MVP content is a subset of the final
curriculum (its §11 rec. 1):

1. Chapter 1 = curriculum **BB 1.2 Load Balancing** (with 0.1-style intro folded into
   its problem statement for now); Chapter 2 = **BB 2.1 Cache-Aside**. Problem
   statements, learning objectives, starter graphs, chapter-scoped validation rules,
   opt-in hints, reading links to the textbook.
2. Add the curriculum's minimal content-model extensions as needed: `quiz` field on
   `ChapterDefinition` + renderer (unlimited retries, explanation on every option, no
   scores) — see CURRICULUM.md §12.
3. **OPEN_QUESTIONS trigger fires here:** verify request-flow-only acyclicity against
   both drafted chapters before the edge-kind taxonomy hardens into persisted data.
4. **OPEN_QUESTIONS trigger fires here:** icon-coverage pass (Lucide vs. custom) once
   the chapters fix the actual MVP component set.
5. Internal reference solution per chapter for QA of the validation rules.
6. Done when the reuse bet is proven: same components, engine, and shell serve both
   chapters without forking anything.

## Step 6 — Milestone 8: Real World Extraction — bit.ly

Author per CURRICULUM.md **RWE-1** (its §11 rec. 3 merges "URL Shortener" and "Bit.ly"
into this one project):

1. Phase A guided redirect path, Phase B open shorten path (anti-pattern validation,
   warning-severity trade-off notes), debrief with reference solutions.
2. Done when `ChapterDefinition.mode` + the Step 2 shell genuinely support "multiple
   valid solutions, less restrictive validation" — if not, revisit the data model
   *now*, before more RWE content.

## Step 7 — Milestone 9: local-first persistence, completed

1. Autosave-on-every-edit (today's Save is a manual button).
2. Multi-slot saves for chapter attempts (Dexie schema already allows it; only the
   fixed `"sandbox"` slot exists).
3. Wire Home's per-chapter progress indicators (not started / in progress / complete)
   to real saved state.

## Step 8 — Milestone 10: auth + cloud sync

**External dependency — provisioning can start any time in parallel with Steps 1–7:**
create the Clerk project and Neon project (account setup only the user can do).

1. **OPEN_QUESTIONS spike first:** 30-minute check that Clerk's invite/waitlist
   mechanics actually fit "admin adds specific emails"; hand-rolled allowlist + magic
   link if not.
2. Wire `ClerkProvider` + beta allowlist (case-normalized per Step 1.6; never ship
   allowlist emails in the client bundle — pending.md P2).
3. Route Handlers syncing IndexedDB state to Postgres per authenticated user;
   cross-device continuity verified.

## Step 9 — Milestone 11: qualitative simulation

1. Wire `src/simulation-engine/trace.ts` to an on-demand animated token ("Simulate
   request"), per-component behavior stubs (cache hit/miss coin-flip, LB target pick).
   Qualitative only — no latency/throughput numbers.
2. This unblocks the curriculum's Trace/Predict-then-check exercises (its smallest new
   UI ask: a one-question prompt before "Simulate").

## Step 10 — Milestone 12: beta polish pass → invites

1. Full click-through of both BB chapters, bit.ly, and Sandbox on a fresh account;
   dark/light + accessibility check; verify MVP_SCOPE's "Definition of done for v1"
   end-to-end.
2. **Pre-launch license/ToS re-checks (standing items):** React Flow
   `hideAttribution` terms; Vercel Hobby→Pro upgrade timing (both in OPEN_QUESTIONS —
   required before any monetized/public launch, fine until then).
3. Send the first closed-beta invites.

---

## Backlog — after MVP, not blocking anything above

- **Curriculum build-out** per CURRICULUM.md: Units 0–6 (remaining 20 chapters),
  checkpoints R1–R3, chapter unlock graph, staged-chapter support for BB 6.1, RWE-2–5
  (Instagram, Log Collector, WhatsApp, Netflix), opt-in Review affordance on Home.
- **LLM-assisted validation pass** (milestone 5 track 2): Route Handler behind auth
  with cost caps, surfaced through the existing `ValidationViolation` shape.
- **Rule-authoring ergonomics** (OPEN_QUESTIONS trigger: when rule-writing gets
  repetitive — the curriculum's ~15–25 rules per RWE project will likely trip this).
- **Quantitative simulation** depth decision (OPEN_QUESTIONS: revisit after v1 usage
  signal).
- **`--zone` custom-property mystery** (PROGRESS_LOG 2026-07-13/14): resolves to an
  empty string in-browser despite valid CSS; fallback shipped, never root-caused.
  Clean investigation: hard refresh, inspect served CSS bundle, restart dev server.
- **Zone parent/child grouping** (nodes move with their zone) — deliberately deferred
  when zones shipped visual-only; do only if users ask.
- **Custom-component relations-contract authoring UI** — explicitly gated on a
  monetization decision existing at all (OPEN_QUESTIONS).
- **Public launch access model / billing** — post-beta decision with real data.
- History note, no action: commit `16dbcb9` sits directly on `main` in violation of
  the branching convention; convention followed since, history not rewritten.

## Permanently rejected — never on this list

Real-time multiplayer / collaborative editing (MVP_SCOPE / OPEN_QUESTIONS: rejected
outright; don't let any persistence or graph-state work above pay a tax for it).
