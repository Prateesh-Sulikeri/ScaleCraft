/** Every `data-tour` anchor a step can target — see AppHeader.tsx,
 * ChapterSidebar.tsx, ChapterWorkspace.tsx, ComponentPicker.tsx,
 * QuestionPane.tsx, ValidationIndicator.tsx, and DeepCheckButton.tsx for
 * where each is attached. */
export type TourStepTarget =
  | "canvas"
  | "undo-redo"
  | "validate"
  /** The open violations dropdown itself — only in the DOM while it's
   * showing, so a step spotlighting it must tolerate a missing target. */
  | "validation-details"
  | "submit"
  | "deep-check"
  | "header-tools"
  | "question-pane"
  /** The floating edge-kind panel, present only while an edge is selected. */
  | "edge-inspector"
  | "hint-toggle"
  | "chapter-complete"
  | "debrief"
  | "component-picker";

/** Live app state a step's `waitFor` predicate can read — assembled by
 * TourController from the canvas store plus ChapterWorkspace's own
 * Validate/Submit-click tracking. */
export type TourContext = {
  canUndo: boolean;
  isComponentPickerOpen: boolean;
  selectedNodeId: string | null;
  /** componentIds currently present on the canvas — lets a step wait for a
   * specific component to have been added, without needing a bespoke
   * boolean threaded in for every possible fix. */
  presentComponentIds: string[];
  /** componentIds with at least one edge touching them, either endpoint —
   * lets a step wait for "this component is actually wired in," not just
   * placed on the canvas. A component can be present without being
   * connected (dropped, not yet joined to anything). */
  connectedComponentIds: string[];
  /** Kind of a specific starter-graph edge, keyed by its authored id (see
   * content/chapters/index.ts's bb-0-1-welcome starterGraph) — `undefined`
   * if that edge no longer exists (deleted rather than fixed in place). */
  edgeKindById: Record<string, string | undefined>;
  /** Set once Validate has been clicked at least once; the count is the
   * total issue count from that run (errors + missing/disconnected
   * required components) — 0 once a fix actually lands, not merely "was
   * clicked" (which `hasValidated` conflated before the remediation flow
   * needed to distinguish "clicked, still broken" from "clicked, now
   * clean"). */
  lastValidationErrorCount: number | null;
  /** True once Submit has produced a real pass — the completion gate,
   * independent of Validate. Includes a pass persisted by an earlier
   * session (chapterProgress), so a reload mid-tour doesn't ask for a
   * Submit the sidebar already considers done. */
  hasSubmittedPassing: boolean;
};

export type TourStep = {
  id: string;
  /** `null` renders a centered card with no spotlight — used for the
   * welcome/wrap-up/feature-highlight steps, which don't need a click-
   * through hole. */
  target: TourStepTarget | null;
  /** Extra anchors folded into the same spotlight as `target`. The backdrop
   * frames the union of every resolved rect, so a control and the surface it
   * opens (Validate and its violations dropdown) stay lit and clickable
   * together rather than the second one being dimmed and covered. Targets
   * that aren't in the DOM right now are simply skipped. */
  spotlightAlso?: TourStepTarget[];
  /** When present, the popover is positioned against THIS target's rect
   * instead of `target`'s — for a step whose real gesture happens on one
   * surface (e.g. dragging on the canvas) but whose explanation should
   * visually point at a different, non-interactive control (e.g. the
   * undo/redo buttons) that the user isn't meant to click this step.
   * `target` still owns the interactive hole/backdrop cutout; this only
   * affects where the card and its secondary highlight ring are drawn. */
  popoverAnchor?: TourStepTarget;
  title: string;
  /** Plain text, not markdown — this is UI chrome, not lesson content. */
  body: string;
  /** Popover position relative to the spotlighted target. Ignored when
   * `target` is null. Defaults to "bottom". */
  placement?: "top" | "bottom" | "left" | "right";
  /** When present, this step has no Next button *until its gesture happens*
   * — it advances on a real user action against the live TourContext rather
   * than a click on the popover. A predicate that's already true when the
   * step is entered (a resumed run, a step reached out of order, a Back
   * navigation) shows a normal Next button instead: the moment it exists to
   * teach has already passed, and silently auto-advancing past it is what
   * made those steps vanish without explanation. */
  waitFor?: (ctx: TourContext) => boolean;
  /** While this step is active, the component picker shows only these
   * componentIds instead of the chapter's full availableComponentIds —
   * focuses a remediation step on exactly what's missing. Restored to the
   * chapter's own list the moment a step without this field becomes
   * active. */
  narrowAvailableComponentIds?: string[];
  /** Whether the component picker may stay open during this step. The tour
   * force-closes it everywhere else, because the picker's modal backdrop
   * sits below the tour overlay but above everything else, so leaving it
   * open silently blocks later steps' real gestures. Steps that ask the
   * learner to *use* the picker must opt in, or the tour slams shut the
   * very thing it just told them to open. */
  allowsComponentPicker?: boolean;
  /** Suppresses the ~600ms auto-advance that normally follows a satisfied
   * `waitFor`. That delay is tuned for a step whose only content was the
   * gesture itself (drag to make Undo available, say) — it reads as a brief
   * acknowledgement, not a pause. A step whose real payload is something the
   * gesture *reveals* (the violations dropdown, spotlighted via
   * `spotlightAlso`) is different: the explanation can run to several cards,
   * and whisking it away on a fixed timer regardless of how much there is to
   * read is indistinguishable from skipping it. Set this true and the step
   * behaves like an already-satisfied one once its predicate passes — a
   * normal Next button, on the learner's own pace, no timer. */
  noAutoAdvance?: boolean;
};
