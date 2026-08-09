"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useCanvasStore } from "@/canvas/store";
import type { ComponentNodeType } from "@/canvas/types";
import { TourOverlay, type TourInteractionState } from "./TourOverlay";
import { designEditorTour } from "./design-editor-tour";
import { logTourEvent } from "./tour-log";
import { useTourState } from "./tour-state";
import type { TourContext } from "./types";

const TOUR_SCRIPTS = { "design-editor": designEditorTour } as const;
export type TourId = keyof typeof TOUR_SCRIPTS;

// How long "Nice - continuing…" stays on screen after a gesture lands,
// before the tour moves on. Short on purpose: this is acknowledgement, not
// a pause. The old 2s floor existed to stop *pre-satisfied* steps flashing
// past, but it charged that cost to every attentive learner instead — up to
// ~16s of dead waiting across the run. Pre-satisfied steps are now handled
// properly (they show a Next button rather than auto-advancing at all), so
// this only ever applies to a gesture the learner just performed and is
// watching the result of. See .claude/docs/pending.md tour punch list #19.
const ADVANCE_DELAY_MS = 600;

type TourControllerProps = {
  tourId: TourId;
  /** Gates auto-start — mirrors ChapterWorkspace.tsx's own
   * hasLoadedInitialState guard, so the tour never starts spotlighting a
   * canvas whose starter graph/save hasn't actually loaded yet. */
  hasLoadedInitialState: boolean;
  /** Total issue count (errors + missing/disconnected required components)
   * from the open chapter's last Validate click — `null` before the first
   * click. The remediation flow needs the actual count, not just "was
   * clicked at all": "validate-click" advances on any result, while
   * "revalidate-clean" specifically waits for 0. */
  lastValidationErrorCount: number | null;
  /** True once the open chapter has a passing Submit — this session's or a
   * persisted one (chapterProgress). */
  hasSubmittedPassing: boolean;
  /** Discards the learner's saved attempt and puts the canvas back to the
   * chapter's starterGraph (see ChapterWorkspace's handleResetToStarter).
   * Present only for a tour chapter, which is what scopes "Start over" to
   * 0.1 today. Must be synchronous so the restart below sees the reset
   * graph in the same tick. */
  onResetToStarter?: () => void;
  /** Where the idle controls (Replay/Resume + Start over) render. The
   * sidebar hands over a footer slot (ChapterSidebar.tsx) so they sit under
   * the chapter's own panel instead of floating over the canvas corner,
   * where the old fixed pill covered the sidebar's bottom content. `null`
   * when there's no sidebar to portal into — focus mode unmounts it — and
   * the controls fall back to the floating position for that case. */
  idleSlot?: HTMLElement | null;
};

/**
 * Runs a chapter's guided tour: auto-starts it the first time, resumes it
 * where the learner left off after a reload, and otherwise renders a small
 * pill so a learner who paused, skipped, or finished always has a way back
 * in. Mounted directly in ChapterWorkspaceContent, gated on
 * `ChapterDefinition.editorTourId` being set (see content/chapters/types.ts).
 *
 * Run state lives in localStorage (see tour-state.ts) rather than in this
 * component, because the canvas it's narrating persists across reloads too:
 * a tour that restarted at step 1 against an already-edited board was
 * telling a story the board contradicted.
 */
export function TourController({
  tourId,
  hasLoadedInitialState,
  lastValidationErrorCount,
  hasSubmittedPassing,
  onResetToStarter,
  idleSlot,
}: TourControllerProps) {
  const steps = TOUR_SCRIPTS[tourId];
  const { state: runState, hydrated, setState: setRunState } = useTourState(tourId);

  // One piece of state, not two, and derived during render rather than in an
  // effect — auto-start/resume is a pure function of the persisted state the
  // first time it's actually readable, and setting it from an effect trips
  // react-hooks/set-state-in-effect (it's a cascading render, not a
  // synchronisation with an external system). `null` means "haven't decided
  // yet": localStorage isn't readable, or the canvas hasn't loaded.
  const [session, setSession] = useState<{ active: boolean; stepIndex: number } | null>(null);

  const canUndo = useCanvasStore((s) => s.past.length > 0);
  const isComponentPickerOpen = useCanvasStore((s) => s.componentPicker);
  const selectedNodeId = useCanvasStore((s) => s.selectedNodeId);
  const closeComponentPicker = useCanvasStore((s) => s.closeComponentPicker);
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const availableComponentIds = useCanvasStore((s) => s.availableComponentIds);
  const setAvailableComponentIds = useCanvasStore((s) => s.setAvailableComponentIds);

  const clampIndex = (i: number) => Math.min(Math.max(i, 0), steps.length - 1);

  // Auto-start (never seen) or resume (reloaded mid-run). `paused`,
  // `skipped` and `completed` all deliberately stay out of the way until the
  // learner reaches for the pill.
  if (session === null && hydrated && hasLoadedInitialState) {
    setSession(
      runState.status === "unseen"
        ? { active: true, stepIndex: 0 }
        : runState.status === "running"
          ? { active: true, stepIndex: clampIndex(runState.stepIndex) }
          : { active: false, stepIndex: 0 },
    );
  }

  const active = session?.active ?? false;
  const stepIndex = session?.stepIndex ?? 0;

  // Checkpoints the live position, so a reload picks the run back up here
  // instead of restarting it (punch list #9/#13).
  useEffect(() => {
    if (!active) return;
    setRunState({ status: "running", stepIndex });
  }, [active, stepIndex, setRunState]);

  const presentComponentIds = useMemo(
    () => nodes.filter((n): n is ComponentNodeType => n.type === "component").map((n) => n.data.componentId),
    [nodes],
  );
  const edgeKindById = useMemo(() => {
    const map: Record<string, string | undefined> = {};
    for (const e of edges) map[e.id] = e.data?.kind;
    return map;
  }, [edges]);

  const ctx: TourContext = useMemo(
    () => ({
      canUndo,
      isComponentPickerOpen,
      selectedNodeId,
      presentComponentIds,
      edgeKindById,
      lastValidationErrorCount,
      hasSubmittedPassing,
    }),
    [canUndo, isComponentPickerOpen, selectedNodeId, presentComponentIds, edgeKindById, lastValidationErrorCount, hasSubmittedPassing],
  );

  const step = steps[stepIndex];

  // A predicate keyed to something that can vanish (fix-edge's hardcoded
  // starter-graph edge id, pre-airbag) must never soft-lock the step for
  // every future user. A throw is treated as manually advanceable — same
  // render path as a step with no waitFor at all.
  let stepSatisfied: boolean;
  let predicateThrewMessage: string | null = null;
  if (!step.waitFor) {
    stepSatisfied = true;
  } else {
    try {
      stepSatisfied = step.waitFor(ctx);
    } catch (err) {
      stepSatisfied = true;
      predicateThrewMessage = err instanceof Error ? err.message : String(err);
    }
  }

  // Logging (not the satisfied/throw computation above) is pushed into an
  // effect and deduped per step id via a ref — react-hooks/refs disallows
  // reading or writing a ref during render, so the dedupe check itself has
  // to live here rather than inline above.
  const loggedThrowRef = useRef<string | null>(null);
  useEffect(() => {
    if (predicateThrewMessage === null) return;
    if (loggedThrowRef.current === step.id) return;
    loggedThrowRef.current = step.id;
    logTourEvent(tourId, { type: "predicate-threw", stepId: step.id, message: predicateThrewMessage });
  }, [tourId, step.id, predicateThrewMessage]);

  // Whether this step's gesture was ALREADY done the moment the step became
  // active — a resumed run, a Back navigation, or a learner who happened to
  // do it early. Such a step shows a normal Next button instead of
  // auto-advancing: the teaching moment has already passed, and silently
  // skipping it is exactly how "fix the graph" vanished without explanation
  // on a reload (punch list #10/#18). Tracked with the documented
  // adjust-state-during-render pattern, so the value is correct on the very
  // first render of each step rather than one render late.
  const [entry, setEntry] = useState<{ index: number; preSatisfied: boolean }>({ index: -1, preSatisfied: false });
  if (entry.index !== stepIndex) {
    setEntry({ index: stepIndex, preSatisfied: stepSatisfied });
  }
  const preSatisfied = entry.index === stepIndex ? entry.preSatisfied : stepSatisfied;

  // A satisfied noAutoAdvance step (validate-click, revalidate-clean — see
  // types.ts) renders exactly like a pre-satisfied one: a normal Next
  // button, not the auto-advancing "satisfied" state. Reusing that branch
  // rather than adding a third interactionState value also means the
  // auto-advance effect below needs no separate opt-out — it only fires on
  // "satisfied", which this step now never reaches.
  const skipsAutoAdvance = stepSatisfied && step.noAutoAdvance === true;

  // "Start over" discards the learner's saved work, so it's two-step: the
  // first click arms it, the second one commits. Deliberately not a
  // window.confirm - nothing else in the app blocks the tab like that.
  const [resetArmed, setResetArmed] = useState(false);

  const interactionState: TourInteractionState =
    !step.waitFor || preSatisfied || skipsAutoAdvance ? "none" : stepSatisfied ? "satisfied" : "waiting";

  function advance() {
    if (stepIndex >= steps.length - 1) {
      setRunState({ status: "completed" });
      setSession({ active: false, stepIndex: 0 });
      return;
    }
    setSession({ active: true, stepIndex: stepIndex + 1 });
  }

  function back() {
    setSession({ active: true, stepIndex: Math.max(0, stepIndex - 1) });
  }

  function skip() {
    setRunState({ status: "skipped" });
    setSession({ active: false, stepIndex: 0 });
  }

  /** Escape / "pause" — the run stays exactly where it is and the pill
   * offers to resume it. Distinct from Skip, which ends the run. */
  function pause() {
    setRunState({ status: "paused", stepIndex });
    setSession({ active: false, stepIndex });
  }

  function startFresh() {
    setSession({ active: true, stepIndex: 0 });
  }

  function resume() {
    setSession({
      active: true,
      stepIndex: runState.status === "paused" ? clampIndex(runState.stepIndex) : 0,
    });
  }

  /** Replay is not enough on its own: the tour narrates a deliberately
   * broken starter graph, and by the time a learner wants to see it again
   * their canvas is fixed and autosaved, so every "fix it" step opens
   * pre-satisfied. This throws the attempt away first, then starts the run
   * at step 1 against the board the script was written for. */
  function restartFromScratch() {
    onResetToStarter?.();
    setResetArmed(false);
    // Forces the pre-satisfied check to re-run against the reset graph
    // rather than reusing what step 0 was measured as last time.
    setEntry({ index: -1, preSatisfied: false });
    setRunState({ status: "running", stepIndex: 0 });
    setSession({ active: true, stepIndex: 0 });
  }

  // Auto-advances only a gesture the learner just performed while watching
  // this step — never one that was already true when the step opened (see
  // `preSatisfied`).
  useEffect(() => {
    if (!active || interactionState !== "satisfied") return;
    const timeout = setTimeout(advance, ADVANCE_DELAY_MS);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, interactionState, stepIndex]);

  // Flags the tour as running for globals.css, which lifts dropdown-class
  // surfaces above the overlay for the duration. A spotlight hole keeps the
  // real control clickable, so a learner can open a context menu or a header
  // menu mid-tour — and at their normal z-index those paint *underneath* the
  // tour's backdrop, which is what broke the right-click-configure step
  // (punch list #7/#8). Cleared on unmount as well as on pause/skip/finish.
  useEffect(() => {
    if (!active) return;
    document.body.dataset.tourActive = "true";
    return () => {
      delete document.body.dataset.tourActive;
    };
  }, [active]);

  // The component picker is a modal whose backdrop sits below the tour
  // overlay but above everything else, so leaving it open past the steps
  // that want it would silently block every later step's real gesture (a
  // click on Validate, say). Steps that ask the learner to *use* the picker
  // opt in via `allowsComponentPicker`; everywhere else it's closed.
  //
  // This used to be a hardcoded set of two step ids, which is what
  // dead-ended the whole tour: "fix-component" tells the learner to open the
  // picker and place the missing component, but wasn't in that set, so the
  // picker was slammed shut in the same tick it opened, its predicate could
  // never be satisfied, and the 12 steps after it were unreachable in a real
  // session (punch list #1).
  useEffect(() => {
    if (active && !step.allowsComponentPicker && isComponentPickerOpen) closeComponentPicker();
  }, [active, step, isComponentPickerOpen, closeComponentPicker]);

  // A step can declare `narrowAvailableComponentIds` to focus a remediation
  // moment on exactly the one component that's missing, rather than the
  // chapter's full palette. `undefined` means "not currently narrowed" —
  // captures the chapter's real list the moment narrowing starts, and
  // restores it the moment a step without that field becomes active
  // (including via Skip/pause/finish, which leave the tour inactive — this
  // check isn't gated on `active` for that reason).
  const originalAvailableIdsRef = useRef<string[] | null | undefined>(undefined);
  useEffect(() => {
    if (active && step.narrowAvailableComponentIds) {
      if (originalAvailableIdsRef.current === undefined) {
        originalAvailableIdsRef.current = availableComponentIds;
      }
      setAvailableComponentIds(step.narrowAvailableComponentIds);
    } else if (originalAvailableIdsRef.current !== undefined) {
      setAvailableComponentIds(originalAvailableIdsRef.current);
      originalAvailableIdsRef.current = undefined;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, step]);

  // Nothing paints until localStorage has actually been read — otherwise a
  // learner who finished the tour gets a flash of the pill (or worse, the
  // overlay) on every load.
  if (!hydrated) return null;

  if (!active) {
    const isPaused = runState.status === "paused";
    const resumeStep = isPaused ? clampIndex(runState.stepIndex) + 1 : 1;
    const pillClass =
      "rounded-full border border-border bg-panel px-2.5 py-1 text-xs font-medium transition-colors";
    const controls = (
      <>
        <button
          onClick={isPaused ? resume : startFresh}
          aria-label={isPaused ? `Resume guided tour at step ${resumeStep} of ${steps.length}` : "Replay guided tour"}
          className={`${pillClass} text-foreground/70 hover:text-foreground`}
        >
          {isPaused ? `Resume tour (${resumeStep}/${steps.length})` : "Replay tour"}
        </button>
        {onResetToStarter && (
          <button
            onClick={resetArmed ? restartFromScratch : () => setResetArmed(true)}
            onBlur={() => setResetArmed(false)}
            aria-label={
              resetArmed
                ? "Confirm: discard your work and restart the guided tour from the starting design"
                : "Start over: discard your work and restart the guided tour"
            }
            title="Puts the canvas back to this chapter's starting design and replays the tour from step 1"
            className={`${pillClass} ${
              resetArmed ? "border-state-error text-state-error" : "text-foreground/70 hover:text-foreground"
            }`}
          >
            {resetArmed ? "Discard my work?" : "Start over"}
          </button>
        )}
      </>
    );

    return idleSlot ? (
      createPortal(<div className="flex flex-wrap items-center gap-2">{controls}</div>, idleSlot)
    ) : (
      // Focus mode only — no sidebar to sit in, and the canvas is otherwise
      // empty chrome there.
      <div className="fixed bottom-4 left-4 z-[var(--z-tooltip)] flex items-center gap-2 [&>button]:shadow-lg">
        {controls}
      </div>
    );
  }

  return (
    <TourOverlay
      tourId={tourId}
      step={step}
      stepIndex={stepIndex}
      stepCount={steps.length}
      onNext={advance}
      onBack={back}
      onSkip={skip}
      onPause={pause}
      interactionState={interactionState}
    />
  );
}
