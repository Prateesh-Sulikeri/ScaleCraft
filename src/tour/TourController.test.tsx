import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { CanvasStoreProvider, useCanvasStore, useCanvasStoreApi } from "@/canvas/store";
import { TourController } from "./TourController";
import { parseTourState, tourStateKey } from "./tour-state";

const STATE_KEY = tourStateKey("design-editor");

function storedState() {
  return parseTourState(localStorage.getItem(STATE_KEY));
}

/** Exposes test-only buttons to flip the exact bits of canvas-store state
 * TourController's ctx reads (past/componentPicker/selectedNodeId/nodes/
 * edges), plus controllable `lastValidationErrorCount`/`hasSubmittedPassing`
 * props — same store-harness pattern ChapterWorkspace.test.tsx uses. */
function Harness({
  hasLoadedInitialState = true,
  lastValidationErrorCount = null,
  hasSubmittedPassing = false,
}: {
  hasLoadedInitialState?: boolean;
  lastValidationErrorCount?: number | null;
  hasSubmittedPassing?: boolean;
}) {
  const storeApi = useCanvasStoreApi();
  const availableComponentIds = useCanvasStore((s) => s.availableComponentIds);
  const isComponentPickerOpen = useCanvasStore((s) => s.componentPicker);
  return (
    <>
      <span data-testid="available-ids">{JSON.stringify(availableComponentIds)}</span>
      <span data-testid="picker-open">{String(isComponentPickerOpen)}</span>
      <button
        data-testid="seed-available-ids"
        onClick={() => storeApi.setState({ availableComponentIds: ["client", "app-server", "sql-database", "cache"] })}
      >
        seed available ids
      </button>
      <button data-testid="select-node" onClick={() => storeApi.setState({ selectedNodeId: "n1" })}>
        select node
      </button>
      <button
        data-testid="make-undoable"
        onClick={() => storeApi.setState({ past: [{ nodes: [], edges: [], key: "k", at: Date.now() }] })}
      >
        make undoable
      </button>
      <button data-testid="open-picker" onClick={() => storeApi.setState({ componentPicker: true })}>
        open picker
      </button>
      <button
        data-testid="add-sql-database"
        onClick={() =>
          storeApi.setState((s) => ({
            nodes: [
              ...s.nodes,
              {
                id: "sql-db-added",
                type: "component" as const,
                position: { x: 600, y: 140 },
                data: { componentId: "sql-database", config: {} },
              },
            ],
          }))
        }
      >
        add sql-database
      </button>
      <button
        data-testid="fix-edge-kind"
        onClick={() =>
          storeApi.setState((s) => ({
            edges: [
              ...s.edges,
              {
                id: "bb-0-1-edge-client-app",
                source: "bb-0-1-client",
                target: "bb-0-1-app-server",
                data: { kind: "request-flow" as const },
              },
            ],
          }))
        }
      >
        fix edge kind
      </button>
      <TourController
        tourId="design-editor"
        hasLoadedInitialState={hasLoadedInitialState}
        lastValidationErrorCount={lastValidationErrorCount}
        hasSubmittedPassing={hasSubmittedPassing}
      />
    </>
  );
}

function renderHarness(props: Parameters<typeof Harness>[0] = {}) {
  return render(
    <CanvasStoreProvider>
      <Harness {...props} />
    </CanvasStoreProvider>,
  );
}

const next = () => fireEvent.click(screen.getByRole("button", { name: "Next" }));
/** The post-gesture acknowledgement beat (ADVANCE_DELAY_MS), plus slack. */
const settle = () => act(() => void vi.advanceTimersByTime(700));

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("TourController", () => {
  it("auto-starts once hasLoadedInitialState is true and the tour has never been seen", () => {
    renderHarness({ hasLoadedInitialState: true });
    expect(screen.getByText("Welcome to the Design Editor")).toBeInTheDocument();
  });

  it("does not auto-start before hasLoadedInitialState is true — shows the replay pill instead", () => {
    renderHarness({ hasLoadedInitialState: false });
    expect(screen.queryByText("Welcome to the Design Editor")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Replay guided tour" })).toBeInTheDocument();
  });

  it("does not auto-start once completed or skipped", () => {
    localStorage.setItem(STATE_KEY, JSON.stringify({ status: "completed" }));
    renderHarness({ hasLoadedInitialState: true });
    expect(screen.queryByText("Welcome to the Design Editor")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Replay guided tour" })).toBeInTheDocument();
  });

  it("resumes a run in progress at the step it left off on, rather than restarting it", () => {
    // Punch list #9: the canvas persists its edits across a reload (Dexie
    // autosave) but the tour restarted at 1 / 21, so the two told different
    // stories about where the learner was.
    localStorage.setItem(STATE_KEY, JSON.stringify({ status: "running", stepIndex: 3 }));
    renderHarness({ hasLoadedInitialState: true });

    expect(screen.getByText("Save, docs, and shortcuts")).toBeInTheDocument();
    expect(screen.getByText("4 / 21")).toBeInTheDocument();
  });

  it("clamps a persisted step index that no longer exists", () => {
    localStorage.setItem(STATE_KEY, JSON.stringify({ status: "running", stepIndex: 999 }));
    renderHarness({ hasLoadedInitialState: true });
    expect(screen.getByText("You're ready")).toBeInTheDocument();
  });

  it("checkpoints the live step index as the run progresses", () => {
    renderHarness({ hasLoadedInitialState: true });
    expect(storedState()).toEqual({ status: "running", stepIndex: 0 });

    next();
    expect(storedState()).toEqual({ status: "running", stepIndex: 1 });
  });

  it("Escape pauses the run and the pill offers to resume it at that step", () => {
    // Punch list #11/#12: Escape wrote the permanent dismiss flag, and there
    // was no temporary exit of any kind.
    renderHarness({ hasLoadedInitialState: true });
    next();
    next();
    expect(screen.getByText("Try it: select a component")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });

    expect(storedState()).toEqual({ status: "paused", stepIndex: 2 });
    const pill = screen.getByRole("button", { name: "Resume guided tour at step 3 of 21" });
    expect(pill).toHaveTextContent("Resume tour (3/21)");

    fireEvent.click(pill);
    expect(screen.getByText("Try it: select a component")).toBeInTheDocument();
  });

  it("a paused run survives a reload and still resumes where it was", () => {
    // Punch list #13: a replay left the dismiss flag set, so a reload
    // mid-replay silently killed it with no state explaining why.
    localStorage.setItem(STATE_KEY, JSON.stringify({ status: "paused", stepIndex: 5 }));
    const { unmount } = renderHarness({ hasLoadedInitialState: true });

    fireEvent.click(screen.getByRole("button", { name: /Resume guided tour/ }));
    expect(screen.getByText("6 / 21")).toBeInTheDocument();
    unmount();

    renderHarness({ hasLoadedInitialState: true });
    expect(screen.getByText("6 / 21")).toBeInTheDocument();
  });

  it("Skip tour ends the run and swaps the overlay for a replay pill", () => {
    renderHarness({ hasLoadedInitialState: true });

    fireEvent.click(screen.getByRole("button", { name: "Skip tour" }));

    expect(storedState()).toEqual({ status: "skipped" });
    expect(screen.queryByText("Welcome to the Design Editor")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Replay guided tour" })).toBeInTheDocument();
  });

  it("starts from step one when the replay pill is clicked", () => {
    localStorage.setItem(STATE_KEY, JSON.stringify({ status: "completed" }));
    renderHarness({ hasLoadedInitialState: true });

    fireEvent.click(screen.getByRole("button", { name: "Replay guided tour" }));
    expect(screen.getByText("Welcome to the Design Editor")).toBeInTheDocument();
    expect(screen.getByText("1 / 21")).toBeInTheDocument();
  });

  it("flags the tour as active on <body> while it runs, and clears it on pause", () => {
    // Punch list #7/#8: menus opened through a spotlight hole paint beneath
    // the tour's backdrop at their normal z-index; globals.css lifts them
    // off this attribute.
    renderHarness({ hasLoadedInitialState: true });
    expect(document.body.dataset.tourActive).toBe("true");

    fireEvent.keyDown(window, { key: "Escape" });
    expect(document.body.dataset.tourActive).toBeUndefined();
  });

  it("advances a gesture step shortly after its gesture actually happens", () => {
    vi.useFakeTimers();
    renderHarness({ hasLoadedInitialState: true });

    next();
    next();
    expect(screen.getByText("Try it: select a component")).toBeInTheDocument();

    act(() => fireEvent.click(screen.getByTestId("select-node")));
    settle();
    expect(screen.getByText("Save, docs, and shortcuts")).toBeInTheDocument();
  });

  it("never advances a gesture step before its gesture happens", () => {
    vi.useFakeTimers();
    renderHarness({ hasLoadedInitialState: true });

    next();
    next();
    act(() => void vi.advanceTimersByTime(10000));
    expect(screen.getByText("Try it: select a component")).toBeInTheDocument();
  });

  it("shows a Next button — and never auto-advances — for a gesture step already satisfied on arrival", () => {
    // Punch list #10/#19: on a resumed run against an already-fixed graph the
    // teaching steps self-skipped after a dwell with no user action at all,
    // and the dwell floor charged every attentive learner up to ~16s of dead
    // waiting across the run.
    vi.useFakeTimers();
    renderHarness({ hasLoadedInitialState: true });

    act(() => fireEvent.click(screen.getByTestId("select-node")));
    next();
    next();
    expect(screen.getByText("Try it: select a component")).toBeInTheDocument();

    act(() => void vi.advanceTimersByTime(10000));
    expect(screen.getByText("Try it: select a component")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();

    next();
    expect(screen.getByText("Save, docs, and shortcuts")).toBeInTheDocument();
  });

  it("Back returns to the previous step, and a satisfied gesture step doesn't immediately bounce forward again", () => {
    // Punch list #18: without this, Back onto a completed gesture step would
    // auto-advance straight back where it came from.
    vi.useFakeTimers();
    renderHarness({ hasLoadedInitialState: true });

    next();
    next();
    act(() => fireEvent.click(screen.getByTestId("select-node")));
    settle();
    expect(screen.getByText("Save, docs, and shortcuts")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByText("Try it: select a component")).toBeInTheDocument();

    act(() => void vi.advanceTimersByTime(10000));
    expect(screen.getByText("Try it: select a component")).toBeInTheDocument();
  });

  it("closes the component picker on steps that don't ask for it", () => {
    vi.useFakeTimers();
    renderHarness({ hasLoadedInitialState: true });

    act(() => fireEvent.click(screen.getByTestId("open-picker")));
    expect(screen.getByTestId("picker-open")).toHaveTextContent("false");
  });

  it("lets the picker stay open on fix-component, the step that tells the learner to use it", () => {
    // Punch list #1, the blocker: the force-close was keyed on a hardcoded
    // set of two step ids that didn't include fix-component, so the picker
    // was slammed shut in the same tick it opened, the step's predicate could
    // never be satisfied, it had no Next button, and the nine steps after it
    // were unreachable in a real session.
    vi.useFakeTimers();
    const { rerender } = renderHarness({ hasLoadedInitialState: true, lastValidationErrorCount: null });

    next(); // welcome -> canvas-intro
    next(); // -> select-a-node
    act(() => fireEvent.click(screen.getByTestId("select-node")));
    settle(); // -> header-tools
    next(); // -> undo-redo
    act(() => fireEvent.click(screen.getByTestId("make-undoable")));
    settle(); // -> open-picker
    act(() => fireEvent.click(screen.getByTestId("open-picker")));
    settle(); // -> picker-tour
    next(); // -> question-pane
    next(); // -> hints
    next(); // -> validate-intro
    next(); // -> validate-click

    rerender(
      <CanvasStoreProvider>
        <Harness hasLoadedInitialState lastValidationErrorCount={2} />
      </CanvasStoreProvider>,
    );
    settle(); // -> fix-component
    expect(screen.getByText("Fix it: add the missing component")).toBeInTheDocument();

    act(() => fireEvent.click(screen.getByTestId("open-picker")));
    expect(screen.getByTestId("picker-open")).toHaveTextContent("true");

    // And the step it gates is then genuinely completable.
    act(() => fireEvent.click(screen.getByTestId("add-sql-database")));
    settle();
    expect(screen.getByText("Fix it: correct the connection")).toBeInTheDocument();
  });

  it("narrows the component picker while fix-component is active, and restores the original list once past it", () => {
    vi.useFakeTimers();
    const { rerender } = renderHarness({ hasLoadedInitialState: true, lastValidationErrorCount: null });
    act(() => fireEvent.click(screen.getByTestId("seed-available-ids")));
    const originalIds = ["client", "app-server", "sql-database", "cache"];

    next();
    next();
    act(() => fireEvent.click(screen.getByTestId("select-node")));
    settle();
    next();
    act(() => fireEvent.click(screen.getByTestId("make-undoable")));
    settle();
    act(() => fireEvent.click(screen.getByTestId("open-picker")));
    settle();
    next();
    next();
    next();
    next(); // now on validate-click

    rerender(
      <CanvasStoreProvider>
        <Harness hasLoadedInitialState lastValidationErrorCount={2} />
      </CanvasStoreProvider>,
    );
    settle(); // -> fix-component
    expect(screen.getByTestId("available-ids")).toHaveTextContent(JSON.stringify(["sql-database"]));

    act(() => fireEvent.click(screen.getByTestId("add-sql-database")));
    settle(); // -> fix-edge
    expect(screen.getByText("Fix it: correct the connection")).toBeInTheDocument();
    expect(screen.getByTestId("available-ids")).toHaveTextContent(JSON.stringify(originalIds));
  });

  it("walks through the full remediation flow end to end and completes on the final step", () => {
    vi.useFakeTimers();
    const { rerender } = renderHarness({ hasLoadedInitialState: true, lastValidationErrorCount: null });

    next(); // welcome -> canvas-intro
    next(); // canvas-intro -> select-a-node
    act(() => fireEvent.click(screen.getByTestId("select-node")));
    settle(); // -> header-tools
    next(); // header-tools -> undo-redo
    act(() => fireEvent.click(screen.getByTestId("make-undoable")));
    settle(); // -> open-picker
    act(() => fireEvent.click(screen.getByTestId("open-picker")));
    settle(); // -> picker-tour
    next(); // picker-tour -> question-pane
    next(); // question-pane -> hints
    next(); // hints -> validate-intro
    next(); // validate-intro -> validate-click
    expect(screen.getByText("Try it: run Validate")).toBeInTheDocument();

    // The real gesture here is ChapterWorkspace's handleValidate, surfaced
    // as a prop rather than store state — simulate the parent re-rendering
    // with a fresh (failing) result, same as a real Validate click.
    rerender(
      <CanvasStoreProvider>
        <Harness hasLoadedInitialState lastValidationErrorCount={2} />
      </CanvasStoreProvider>,
    );
    settle(); // -> fix-component
    expect(screen.getByText("Fix it: add the missing component")).toBeInTheDocument();

    act(() => fireEvent.click(screen.getByTestId("add-sql-database")));
    settle(); // -> fix-edge
    act(() => fireEvent.click(screen.getByTestId("fix-edge-kind")));
    settle(); // -> revalidate-clean
    expect(screen.getByText("Try it: confirm the fix")).toBeInTheDocument();

    rerender(
      <CanvasStoreProvider>
        <Harness hasLoadedInitialState lastValidationErrorCount={0} />
      </CanvasStoreProvider>,
    );
    settle(); // -> deep-check-overview
    expect(screen.getByText("Deep Check")).toBeInTheDocument();
    next(); // -> submit-intro
    next(); // -> submit-click
    expect(screen.getByText("Try it: run Submit")).toBeInTheDocument();

    rerender(
      <CanvasStoreProvider>
        <Harness hasLoadedInitialState lastValidationErrorCount={0} hasSubmittedPassing />
      </CanvasStoreProvider>,
    );
    settle(); // -> progress-complete
    next(); // -> debrief
    next(); // -> more-to-explore
    next(); // -> wrap-up
    expect(screen.getByText("You're ready")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Done" }));

    expect(storedState()).toEqual({ status: "completed" });
    expect(screen.getByRole("button", { name: "Replay guided tour" })).toBeInTheDocument();
  });
});
