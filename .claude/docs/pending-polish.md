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
