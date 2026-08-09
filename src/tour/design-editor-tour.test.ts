import { describe, it, expect } from "vitest";
import { designEditorTour } from "./design-editor-tour";
import type { TourContext, TourStepTarget } from "./types";

const emptyCtx: TourContext = {
  canUndo: false,
  isComponentPickerOpen: false,
  selectedNodeId: null,
  presentComponentIds: [],
  edgeKindById: {},
  lastValidationErrorCount: null,
  hasSubmittedPassing: false,
};

const INTERACTIVE_STEP_IDS = ["select-a-node", "undo-redo", "open-picker", "validate-click", "fix-component", "fix-edge", "revalidate-clean", "submit-click"];

describe("designEditorTour", () => {
  it("has exactly twenty-one steps", () => {
    // Was 23 before the three "one more thing" tail steps were merged into
    // one (.claude/docs/pending.md tour punch list #24).
    expect(designEditorTour).toHaveLength(21);
  });

  it("has unique, non-empty step ids", () => {
    const ids = designEditorTour.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id.length).toBeGreaterThan(0);
  });

  it("has exactly eight interactive (waitFor) steps, matching the remediation-flow redesign", () => {
    const interactive = designEditorTour.filter((s) => s.waitFor);
    expect(interactive.map((s) => s.id)).toEqual(INTERACTIVE_STEP_IDS);
  });

  it("every step has non-empty title and body copy", () => {
    for (const step of designEditorTour) {
      expect(step.title.length).toBeGreaterThan(0);
      expect(step.body.length).toBeGreaterThan(0);
    }
  });

  it("the first and last steps are centered (no target) — welcome and wrap-up", () => {
    expect(designEditorTour[0].target).toBeNull();
    expect(designEditorTour[designEditorTour.length - 1].target).toBeNull();
  });

  it("sets an up-front expectation of length on the welcome step", () => {
    // A 21-step blocking overlay with no stated length is a commitment the
    // learner can't evaluate before it starts (punch list #24).
    expect(designEditorTour[0].body).toMatch(/21 steps/);
    expect(designEditorTour[0].body).toMatch(/Esc/);
  });

  it("every targeted step names a real TourStepTarget", () => {
    const validTargets = new Set<TourStepTarget>([
      "canvas",
      "undo-redo",
      "validate",
      "validation-details",
      "submit",
      "deep-check",
      "header-tools",
      "question-pane",
      "edge-inspector",
      "hint-toggle",
      "chapter-complete",
      "debrief",
      "component-picker",
    ]);
    for (const step of designEditorTour) {
      if (step.target !== null) expect(validTargets.has(step.target)).toBe(true);
      if (step.popoverAnchor) expect(validTargets.has(step.popoverAnchor)).toBe(true);
      for (const extra of step.spotlightAlso ?? []) expect(validTargets.has(extra)).toBe(true);
    }
  });

  it("uses every anchor with a real gesture requirement as its own step's target", () => {
    // undo-redo has a data-tour anchor (AppHeader.tsx) but no step targets it
    // directly — its interactive step deliberately spotlights "canvas"
    // instead, since the real gesture it asks for (dragging a component)
    // happens there. It's still referenced as a popoverAnchor, so its anchor
    // isn't dead code.
    const targets = new Set(designEditorTour.map((s) => s.target).filter((t): t is TourStepTarget => t !== null));
    expect(targets).toEqual(
      new Set([
        "canvas",
        "validate",
        "submit",
        "deep-check",
        "header-tools",
        "question-pane",
        "hint-toggle",
        "chapter-complete",
        "debrief",
        "component-picker",
      ]),
    );
    const anchors = new Set(designEditorTour.map((s) => s.popoverAnchor).filter((t): t is TourStepTarget => t !== undefined));
    expect(anchors).toEqual(new Set(["undo-redo", "edge-inspector"]));
  });

  it("anchors the edge-fixing step to the Edge Inspector it tells the learner to use", () => {
    // The inspector renders at the canvas's bottom-right (EdgeInspector.tsx),
    // which is exactly where an unanchored card docks — reported live as the
    // card covering the edge-kind select and making the fix impossible.
    const step = designEditorTour.find((s) => s.id === "fix-edge")!;
    expect(step.popoverAnchor).toBe("edge-inspector");
    expect(step.placement).toBe("top");
  });

  it("describes component placement as the two-stage gesture it actually is", () => {
    // ComponentPicker.tsx's `insert` arms click-to-place and closes the
    // picker rather than dropping the component — copy that says "click a
    // component to place it on the canvas" leaves the learner waiting for
    // something that never happens.
    for (const id of ["picker-tour", "fix-component"]) {
      const step = designEditorTour.find((s) => s.id === id)!;
      expect(step.body).toMatch(/click the canvas|click on the canvas|next click on the canvas/i);
    }
  });

  it("every step that talks about the component picker lets it stay open", () => {
    // The regression guard for punch list #1: "fix-component" told the
    // learner to open the picker while the controller force-closed it in the
    // same tick, which dead-ended the tour and made the 9 steps after it
    // unreachable in a real session. Keyed off the copy itself so a newly
    // authored picker step can't quietly reintroduce it.
    for (const step of designEditorTour) {
      const talksAboutPicker = /picker/i.test(`${step.title} ${step.body}`);
      if (talksAboutPicker || step.narrowAvailableComponentIds) {
        expect(step.allowsComponentPicker, `step "${step.id}" must allow the component picker`).toBe(true);
      }
    }
  });

  it("no step spotlights the sidebar or canvas when it's really about one control inside it", () => {
    // Punch list #20/#21: four steps used to ring the entire sidebar, and the
    // hints step pointed at prose ("further down this panel") rather than at
    // the Show hint button.
    const bySidebarControl = ["hints", "progress-complete", "debrief"];
    for (const id of bySidebarControl) {
      const step = designEditorTour.find((s) => s.id === id)!;
      expect(step.target).not.toBe("question-pane");
    }
    expect(designEditorTour.find((s) => s.id === "hints")!.target).toBe("hint-toggle");
  });

  it("the steps that send a learner to read a validation result spotlight the result surface too", () => {
    // Punch list #2: the violations dropdown was dimmed by the tour backdrop
    // and truncated by the tour's own card, on the exact step telling the
    // learner to go read it — a direct violation of CLAUDE.md's "the
    // explanation is always shown on failure, unconditionally".
    for (const id of ["validate-click", "revalidate-clean"]) {
      const step = designEditorTour.find((s) => s.id === id)!;
      expect(step.spotlightAlso).toContain("validation-details");
    }
  });

  it("every waitFor step's target is a surface the user can actually interact with to satisfy it", () => {
    const targetsAskingForRealGestures = new Set(["canvas", "validate", "submit"]);
    for (const step of designEditorTour) {
      if (step.waitFor) expect(targetsAskingForRealGestures.has(step.target ?? "")).toBe(true);
    }
  });

  it("every waitFor predicate is unsatisfied against a fresh, empty context", () => {
    // Guards against an accidentally-inverted predicate that would auto-skip
    // its own step the instant the tour starts.
    for (const step of designEditorTour) {
      if (step.waitFor) expect(step.waitFor(emptyCtx)).toBe(false);
    }
  });

  it("select-a-node's predicate is satisfied once a node is selected", () => {
    const step = designEditorTour.find((s) => s.id === "select-a-node")!;
    expect(step.waitFor!({ ...emptyCtx, selectedNodeId: "n1" })).toBe(true);
  });

  it("undo-redo's predicate is satisfied once canUndo is true", () => {
    const step = designEditorTour.find((s) => s.id === "undo-redo")!;
    expect(step.waitFor!({ ...emptyCtx, canUndo: true })).toBe(true);
    expect(step.popoverAnchor).toBe("undo-redo");
  });

  it("open-picker's predicate is satisfied once the component picker is open", () => {
    const step = designEditorTour.find((s) => s.id === "open-picker")!;
    expect(step.waitFor!({ ...emptyCtx, isComponentPickerOpen: true })).toBe(true);
  });

  it("validate-click's predicate is satisfied on any validate result, pass or fail", () => {
    const step = designEditorTour.find((s) => s.id === "validate-click")!;
    expect(step.waitFor!({ ...emptyCtx, lastValidationErrorCount: 2 })).toBe(true);
    expect(step.waitFor!({ ...emptyCtx, lastValidationErrorCount: 0 })).toBe(true);
  });

  it("fix-component's predicate is satisfied once sql-database is present, and narrows the picker to just that", () => {
    const step = designEditorTour.find((s) => s.id === "fix-component")!;
    expect(step.waitFor!({ ...emptyCtx, presentComponentIds: ["client", "app-server"] })).toBe(false);
    expect(step.waitFor!({ ...emptyCtx, presentComponentIds: ["client", "app-server", "sql-database"] })).toBe(true);
    expect(step.narrowAvailableComponentIds).toEqual(["sql-database"]);
  });

  it("fix-edge's predicate is satisfied once the specific starter-graph edge's kind is request-flow", () => {
    const step = designEditorTour.find((s) => s.id === "fix-edge")!;
    expect(step.waitFor!({ ...emptyCtx, edgeKindById: { "bb-0-1-edge-client-app": "async" } })).toBe(false);
    expect(step.waitFor!({ ...emptyCtx, edgeKindById: { "bb-0-1-edge-client-app": "request-flow" } })).toBe(true);
  });

  it("revalidate-clean's predicate requires a zero error count specifically, not just any prior validate", () => {
    const step = designEditorTour.find((s) => s.id === "revalidate-clean")!;
    expect(step.waitFor!({ ...emptyCtx, lastValidationErrorCount: 1 })).toBe(false);
    expect(step.waitFor!({ ...emptyCtx, lastValidationErrorCount: 0 })).toBe(true);
  });

  it("submit-click's predicate is satisfied once Submit has actually passed", () => {
    const step = designEditorTour.find((s) => s.id === "submit-click")!;
    expect(step.waitFor!({ ...emptyCtx, hasSubmittedPassing: true })).toBe(true);
  });

  it("fix-component/fix-edge steps target canvas so the real gesture (open picker, click the edge) stays clickable", () => {
    expect(designEditorTour.find((s) => s.id === "fix-component")!.target).toBe("canvas");
    expect(designEditorTour.find((s) => s.id === "fix-edge")!.target).toBe("canvas");
  });

  it("only the two steps that reveal the violations dropdown suppress auto-advance", () => {
    // Every other waitFor step's whole content IS the gesture, so the
    // ~600ms acknowledgement delay is appropriate there — only a step whose
    // real payload is something the gesture reveals (spotlightAlso'd
    // content that can run to several cards) needs the learner's own pace.
    const noAutoAdvanceIds = designEditorTour.filter((s) => s.noAutoAdvance).map((s) => s.id);
    expect(noAutoAdvanceIds).toEqual(["validate-click", "revalidate-clean"]);
    for (const id of noAutoAdvanceIds) {
      expect(designEditorTour.find((s) => s.id === id)!.spotlightAlso).toContain("validation-details");
    }
  });
});
