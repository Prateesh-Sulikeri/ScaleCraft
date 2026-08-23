# Pending Polish

Consolidated leftovers from `pending*.md` docs that were assessed as >90% complete
and retired. Each section keeps the source doc's own item wording so nothing gets
lost in translation; the source file is deleted once its items land here.

------------------------------------------------------------------------

## From `pending-guided-tour.md` (Guided Tour + Chapter 0.1 "Welcome to ScaleCraft")

Retired 2026-08-10 at ~95% complete - all engineering (Tracks A, the Submit/Validate
split, resilience mechanisms) is merged to `main`. What's left:

**1. Slice 4 - explicitly deferred, not started:**
- `feature/tour-beacon` (anonymous completion-rate counter route) - no branch cut,
  only build if beta evidence demands it.

**2. Content staleness (chapter-author's domain, not engineering's):**
- `content/chapters/index.ts`'s `problemStatement` and
  `specs/bb-0-1-welcome.spec.md` both still describe the old fix-component/fix-edge
  split that no longer exists.

**3. Manual click-through never run - full checklist, unconfirmed:**

*Setup*
- Learning Path -> 0.1 -> Reader -> "Begin exercise" -> tour auto-starts on first visit
- Reload mid-tour -> resumes at the same step, no re-narration from step 1
- Second visit after finishing/skipping -> does not auto-start; replay pill visible in the sidebar footer
- Replay pill restarts cleanly at step 1
- "Start over" (two-step confirm) resets the starter graph, clears Validate/Submit outcomes, restarts at step 1, and does NOT un-pass an already-passed chapter

*Every step, both themes (light/dark)*
- Spotlight lands on the correct element for all 19 steps, no off-screen or clipped popovers
- Step counter, Back, Next, "Skip tour" all present and correct; Esc pauses (not skip) with a resume pill
- Popover repositions correctly if its own content grows (e.g. watchdog row or resolution-failed row appearing)

*The 7 interactive steps (must advance on the real gesture, not just Next)*
- `select-a-node` - clicking a node advances
- `open-picker` - `/` or right-click empty canvas opens the picker and advances
- `picker-tour` - placing AND connecting SQL Database advances (browsing alone should not)
- `validate-click` - clicking Validate advances only after a chance to read the dropdown (no auto-advance eating the read)
- `fix-edge` - fixing the Client -> App Server edge advances, including deleting the edge and drawing a fresh one (not just editing kind in place)
- `revalidate-clean` - re-running Validate clean advances, no auto-advance eating the read
- `submit-click` - Submit advances only once the board actually passes

*Resilience mechanisms (hardest to catch by code review alone)*
- Watchdog: sit idle ~70-75s on an interactive step -> exit row appears with "Skip this step" and "Report a problem"; "Skip this step" advances one step (not the whole tour)
- Report-a-problem link opens a prefilled, reviewable GitHub issue (nothing auto-sent)
- `requires` reconciliation: on `picker-tour` or `fix-edge`, satisfy the step then delete the thing that satisfied it while still on that step -> a truthful reconciling note appears, nothing auto-mutates the graph; redo it -> note clears
- Focus mode: enter focus mode mid-step -> tour pauses (not stuck spotlighting a vanished sidebar); leave focus mode -> resumes silently at the same step
- A deliberate Escape pause is NOT auto-resumed the same way (resume pill instead, unlike the silent focus-mode resume)
- Hotkeys (Ctrl+Z, `/`, Ctrl+D, Shift+L) do nothing on a modal (non-interactive) step; work normally again once that step ends
- Multi-tab: open the same chapter in two tabs, advance/skip in one -> the other tab reflects it (via `storage` event) without a manual refresh
- Hard-gate completion: skip the tour early after satisfying all 5 `hard` steps out of order -> run registers as `completed`, not stuck at `skipped`
- Throwing/broken predicate and unresolvable target (if forceable) both degrade to a manual Next with an honest note, never a silent stall

*Cross-cutting*
- `prefers-reduced-motion` - spotlight/popover jump instead of animating
- Keyboard-only pass through at least the non-interactive steps (Tab/Enter/Esc)
- Everything above still holds after `npm run build` (production build), not just dev

**4. Two earlier-flagged "needs a real-browser re-check" items, likely subsumed by #3 above but never explicitly closed in the doc:**
- Tour not rendering below ~1024px wide: needs a browser re-check at 900x700 and 768x1024.
- z-index layering fixes: not assertable in jsdom, needs a browser re-check.

------------------------------------------------------------------------

## From `pending-6.1.0-poa.md` + `pending-cloud-sync.md` + `pending-persistence-audit.md` (Release 6.1.0 Neon cloud sync)

Retired 2026-08-23. All three deleted together: the sync code
(`reconcile.ts`, `sync-status.ts`, `ResetOnSignOut.tsx`, the eleven Part 1 slug
redirects in `next.config.ts`) is confirmed present on `main` and `develop`, so
the build log, its audit companion and the close-out list have all been overtaken
by merged code. The audit's S1-S11 findings were either fixed or converted into
the "Explicitly NOT in 6.1.0" tradeoffs recorded in `ARCHITECTURE.md`.

Two items were never ticked and outlive the docs:

- **The zones cross-device e2e case was written but never run.** The test exists
  in `e2e/multi-device-sync.spec.ts` ("a zone and a Start marker placed on one
  device arrive intact on the other"). It was authored in a sandbox with no
  outbound network, so global setup could not reach Clerk. Run
  `npx playwright test e2e/multi-device-sync.spec.ts -g "zone and a Start marker"`
  from a networked machine. This is the one unproven claim in release 6 - Phase 3.4
  replaced the `graph` column with raw `canvasState` and TRUNCATEd `saved_graphs`
  *specifically* because the old round trip could silently delete a learner's zones.
- **The four Part 1 chapters authored in Phase 10 still have no Opus proofread
  pass recorded** in `pending-chapters.md`. Content-authoring work for the
  `chapter-author` skill, deliberately deferred by the engineering branch.

------------------------------------------------------------------------

## From `pending-diagram-pipeline.md` (Release 5.1.0 diagram authoring pipeline)

Retired 2026-08-23. Phases 0-4 are merged (`src/chapters/walkthrough/layout.ts`,
`normalize.ts`, and `src/content/chapters/walkthrough-invariants.test.ts` are all
on `main`). The `walkthrough-diagram` skill is now the live entry point for
authoring a diagram; this doc's Phase 5 and open questions are all that survive it.

**Phase 5 - deferred, do NOT build without the trigger:**
- **P5.1 Topology presets** (named expansions like `preset: "client-lb-n-servers"`):
  only if, after ~10 real diagrams, node/edge declarations are still the dominant
  authoring cost. Auto-layout plus `focus` may make this unnecessary indirection.
  Decide from evidence.
- **P5.2 Canvas-to-walkthrough export**: only if a Tier 4 RWE diagram (WhatsApp,
  Uber; 12-14 nodes) produces a layered layout that manual `column`/`position`
  overrides cannot rescue. The canvas already emits positions via
  `toArchitectureGraph`, so the export is mechanical if ever needed.

**Open questions carried from scoping:**

| # | Question | Trigger |
|---|---|---|
| 1 | Do RWE debrief reference solutions get walkthroughs, or is `ReadOnlyGraphSummary` enough? Swings scope by ~60 diagrams. Content call, user decides. | Before first RWE project is authored |
| 2 | Does layered LR survive a 12-14 node flagship? | First Tier 4 diagram (feeds P5.2) |
| 3 | Do `custom`-kind nodes join auto-layout or stay hand-placed? Current spec: they join (neighbor-column rule); revisit on first real use. | First `custom` diagram |
| 4 | Side-by-side topology comparison for RWE Phase B, or do `algorithms` variants cover it? | First Phase B debrief |

**One decision worth not losing:** walkthrough definitions stay **inline in MDX**,
next to the prose. Typed TS modules referenced by id were rejected (breaks prose
co-location; the invariants harness covers the real failure modes). This is the one
decision worth revisiting if the harness proves too loose - and it gets more
expensive to reverse as diagrams accumulate.
