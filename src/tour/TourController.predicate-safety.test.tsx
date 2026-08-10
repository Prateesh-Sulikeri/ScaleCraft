import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { CanvasStoreProvider } from "@/canvas/store";
import { TourController } from "./TourController";
import { dumpTourLog, clearTourLog } from "./tour-log";

/**
 * A throwing waitFor predicate must never soft-lock a step for every future
 * user (the regression case: fix-edge's hardcoded starter-graph edge id, see
 * pending-guided-tour.md's resilience addendum — a fresh edge drawn instead
 * of an in-place fix makes that predicate unsatisfiable forever). Isolated in
 * its own file with a mocked, synthetic script so this doesn't have to
 * fabricate a real throw inside `designEditorTour`'s actual steps and doesn't
 * disturb TourController.test.tsx's assumptions about the real script's
 * step count/copy.
 *
 * Declared via vi.hoisted, not a top-level const — vi.mock factories are
 * hoisted above imports, so a plain module-scope reference here would hit
 * the temporal dead zone.
 */
const { THROWING_STEPS } = vi.hoisted(() => ({
  THROWING_STEPS: [
    {
      id: "throws",
      target: null,
      title: "A step whose predicate throws",
      body: "Body copy.",
      waitFor: () => {
        throw new Error("boom");
      },
    },
    {
      id: "next",
      target: null,
      title: "The following step",
      body: "Body copy.",
    },
  ],
}));

vi.mock("./design-editor-tour", () => ({ designEditorTour: THROWING_STEPS }));

function renderController() {
  return render(
    <CanvasStoreProvider>
      <TourController
        tourId="design-editor"
        hasLoadedInitialState
        lastValidationErrorCount={null}
        hasSubmittedPassing={false}
      />
    </CanvasStoreProvider>,
  );
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  clearTourLog();
});

describe("TourController — safe predicate evaluation", () => {
  it("treats a throwing waitFor as manually advanceable instead of soft-locking the step", () => {
    renderController();

    expect(screen.getByText("A step whose predicate throws")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
    expect(screen.queryByText(/try it to continue/i)).not.toBeInTheDocument();
  });

  it("logs exactly one predicate-threw event for the step, not once per render", () => {
    renderController();

    const entries = dumpTourLog().filter((e) => e.type === "predicate-threw");
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ tourId: "design-editor", stepId: "throws", message: "boom" });
  });
});
