import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { CanvasStoreProvider, useCanvasStore, useCanvasStoreApi } from "@/canvas/store";
import { TourController } from "./TourController";
import { dumpTourLog, clearTourLog } from "./tour-log";
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
  onResetToStarter,
  resetsStore = false,
  focusMode = false,
}: {
  hasLoadedInitialState?: boolean;
  lastValidationErrorCount?: number | null;
  hasSubmittedPassing?: boolean;
  onResetToStarter?: () => void;
  /** Stands in for ChapterWorkspace's real handleResetToStarter — wipes the
   *  bits of store state the tour's gesture predicates read. */
  resetsStore?: boolean;
  focusMode?: boolean;
}) {
  const storeApi = useCanvasStoreApi();
  const availableComponentIds = useCanvasStore((s) => s.availableComponentIds);
  const isComponentPickerOpen = useCanvasStore((s) => s.componentPicker);
  const highlightedComponentId = useCanvasStore((s) => s.highlightedComponentId);
  return (
    <>
      {/* Stands in for ChapterWorkspace's real `data-tour="canvas"` div — the
       * airbag's resolution-failure fallback (TourOverlay.tsx) fires after
       * ~2.5s when a step's target genuinely never resolves, and without
       * this the harness itself looks like exactly that failure mode to any
       * test that advances timers past that window. jsdom has no layout
       * engine, so getBoundingClientRect is zeroed out (and thus "invisible"
       * to TourOverlay's visibleRect) unless stubbed to a real size. */}
      <div
        data-tour="canvas"
        ref={(el) => {
          if (!el) return;
          el.getBoundingClientRect = () =>
            ({ top: 0, left: 0, width: 800, height: 600, right: 800, bottom: 600, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect;
        }}
      />
      <span data-testid="available-ids">{JSON.stringify(availableComponentIds)}</span>
      <span data-testid="picker-open">{String(isComponentPickerOpen)}</span>
      <span data-testid="highlighted-id">{String(highlightedComponentId)}</span>
      <button
        data-testid="seed-available-ids"
        onClick={() => storeApi.setState({ availableComponentIds: ["client", "app-server", "sql-database", "cache"] })}
      >
        seed available ids
      </button>
      <button data-testid="select-node" onClick={() => storeApi.setState({ selectedNodeId: "n1" })}>
        select node
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
        data-testid="connect-sql-database"
        onClick={() =>
          storeApi.setState((s) => ({
            edges: [
              ...s.edges,
              {
                id: "sql-db-added-edge",
                source: "sql-db-added",
                target: "bb-0-1-app-server",
                data: { kind: "request-flow" as const },
              },
            ],
          }))
        }
      >
        connect sql-database
      </button>
      <button
        data-testid="remove-sql-database"
        onClick={() =>
          storeApi.setState((s) => ({
            nodes: s.nodes.filter((n) => n.id !== "sql-db-added"),
            edges: s.edges.filter((e) => e.source !== "sql-db-added" && e.target !== "sql-db-added"),
          }))
        }
      >
        remove sql-database
      </button>
      <button
        data-testid="fix-edge-kind"
        onClick={() =>
          storeApi.setState((s) => ({
            // The role-based waitFor (design-editor-tour.ts's
            // hasClientAppRequestFlowEdge) resolves an edge's endpoints via
            // their componentId, not the edge's own id — these two nodes
            // have to actually exist for that lookup to succeed, unlike the
            // old edgeKindById approach which only ever looked at the edge.
            nodes: [
              ...s.nodes,
              { id: "bb-0-1-client", type: "component" as const, position: { x: 0, y: 0 }, data: { componentId: "client", config: {} } },
              {
                id: "bb-0-1-app-server",
                type: "component" as const,
                position: { x: 200, y: 0 },
                data: { componentId: "app-server", config: {} },
              },
            ],
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
        onResetToStarter={
          resetsStore
            ? () => storeApi.setState({ selectedNodeId: null, nodes: [], edges: [], past: [], future: [] })
            : onResetToStarter
        }
        focusMode={focusMode}
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
  clearTourLog();
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
    // autosave) but the tour restarted at 1 / 19, so the two told different
    // stories about where the learner was.
    localStorage.setItem(STATE_KEY, JSON.stringify({ status: "running", stepIndex: 3 }));
    renderHarness({ hasLoadedInitialState: true });

    expect(screen.getByText("Save, docs, and shortcuts")).toBeInTheDocument();
    expect(screen.getByText("4 / 19")).toBeInTheDocument();
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

    expect(storedState()).toEqual({ status: "paused", stepIndex: 2, pauseReason: "user" });
    const pill = screen.getByRole("button", { name: "Resume guided tour at step 3 of 19" });
    expect(pill).toHaveTextContent("Resume tour (3/19)");

    fireEvent.click(pill);
    expect(screen.getByText("Try it: select a component")).toBeInTheDocument();
  });

  it("a paused run survives a reload and still resumes where it was", () => {
    // Punch list #13: a replay left the dismiss flag set, so a reload
    // mid-replay silently killed it with no state explaining why.
    localStorage.setItem(STATE_KEY, JSON.stringify({ status: "paused", stepIndex: 5 }));
    const { unmount } = renderHarness({ hasLoadedInitialState: true });

    fireEvent.click(screen.getByRole("button", { name: /Resume guided tour/ }));
    expect(screen.getByText("6 / 19")).toBeInTheDocument();
    unmount();

    renderHarness({ hasLoadedInitialState: true });
    expect(screen.getByText("6 / 19")).toBeInTheDocument();
  });

  it("focus mode auto-pauses an active run and auto-resumes it when focus mode ends, with no pill", () => {
    // Focus mode unmounts the header/sidebar - every data-tour anchor but
    // the canvas - so an active step would otherwise be left spotlighting
    // anchors that no longer exist. Distinct from an Escape pause: the round
    // trip back to the same step is silent (no explicit resume click).
    const { rerender } = renderHarness({ hasLoadedInitialState: true });
    next();
    next();
    expect(screen.getByText("Try it: select a component")).toBeInTheDocument();

    rerender(
      <CanvasStoreProvider>
        <Harness hasLoadedInitialState focusMode />
      </CanvasStoreProvider>,
    );

    expect(storedState()).toEqual({ status: "paused", stepIndex: 2, pauseReason: "surface-loss" });
    expect(screen.queryByText("Try it: select a component")).not.toBeInTheDocument();

    rerender(
      <CanvasStoreProvider>
        <Harness hasLoadedInitialState focusMode={false} />
      </CanvasStoreProvider>,
    );

    expect(screen.getByText("Try it: select a component")).toBeInTheDocument();
    expect(storedState()).toEqual({ status: "running", stepIndex: 2 });
  });

  it("a surface-loss pause whose surface is already back by the next mount resumes active with no pill", () => {
    // Covers a reload that happens to land after focus mode has already
    // ended again - this should behave like a `running` state, not strand
    // the learner on a pill for a pause they never asked for.
    localStorage.setItem(
      STATE_KEY,
      JSON.stringify({ status: "paused", stepIndex: 4, pauseReason: "surface-loss" }),
    );
    renderHarness({ hasLoadedInitialState: true, focusMode: false });

    expect(screen.getByText("5 / 19")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Resume guided tour/ })).not.toBeInTheDocument();
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
    expect(screen.getByText("1 / 19")).toBeInTheDocument();
  });

  describe("Start over (only offered when the parent supplies a reset)", () => {
    it("offers no Start over button when no reset is supplied", () => {
      localStorage.setItem(STATE_KEY, JSON.stringify({ status: "completed" }));
      renderHarness({ hasLoadedInitialState: true });
      expect(screen.queryByRole("button", { name: /^Start over/ })).not.toBeInTheDocument();
    });

    it("arms on the first click and only discards the attempt on the second", () => {
      const onResetToStarter = vi.fn();
      localStorage.setItem(STATE_KEY, JSON.stringify({ status: "completed" }));
      renderHarness({ hasLoadedInitialState: true, onResetToStarter });

      fireEvent.click(screen.getByRole("button", { name: /^Start over/ }));
      expect(onResetToStarter).not.toHaveBeenCalled();

      const confirm = screen.getByRole("button", { name: /^Confirm: discard/ });
      expect(confirm).toHaveTextContent("Discard my work?");

      fireEvent.click(confirm);
      expect(onResetToStarter).toHaveBeenCalledTimes(1);
      expect(screen.getByText("Welcome to the Design Editor")).toBeInTheDocument();
      expect(screen.getByText("1 / 19")).toBeInTheDocument();
      expect(storedState()).toEqual({ status: "running", stepIndex: 0 });
    });

    it("disarms when the button loses focus, so a stray click can't be completed later", () => {
      const onResetToStarter = vi.fn();
      localStorage.setItem(STATE_KEY, JSON.stringify({ status: "completed" }));
      renderHarness({ hasLoadedInitialState: true, onResetToStarter });

      const button = screen.getByRole("button", { name: /^Start over/ });
      fireEvent.click(button);
      fireEvent.blur(button);

      expect(screen.getByRole("button", { name: /^Start over/ })).toBeInTheDocument();
      expect(onResetToStarter).not.toHaveBeenCalled();
    });

    it("re-runs the gesture steps against the reset canvas instead of treating them as already done", () => {
      // The whole point: a returning learner's board is fixed and autosaved,
      // so without the reset every "try it" step opens pre-satisfied with a
      // Next button and the replay teaches nothing.
      vi.useFakeTimers();
      localStorage.setItem(STATE_KEY, JSON.stringify({ status: "completed" }));
      renderHarness({ hasLoadedInitialState: true, resetsStore: true });

      act(() => fireEvent.click(screen.getByTestId("select-node")));
      act(() => fireEvent.click(screen.getByRole("button", { name: /^Start over/ })));
      act(() => fireEvent.click(screen.getByRole("button", { name: /^Confirm: discard/ })));

      next(); // welcome -> canvas-intro
      next(); // -> select-a-node
      act(() => void vi.advanceTimersByTime(10000));
      expect(screen.getByText("Try it: select a component")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Next" })).not.toBeInTheDocument();
    });
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

  it("the watchdog offers a quiet way out after ~70s stuck on a gesture step, and logs it once", () => {
    vi.useFakeTimers();
    renderHarness({ hasLoadedInitialState: true });

    next();
    next();
    expect(screen.getByText("Try it: select a component")).toBeInTheDocument();
    expect(screen.queryByText(/still here/i)).not.toBeInTheDocument();

    act(() => void vi.advanceTimersByTime(70_000));
    expect(screen.getByText(/still here/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Skip this step" })).toBeInTheDocument();
    expect(dumpTourLog().filter((e) => e.type === "watchdog-fired")).toHaveLength(1);

    // Continues to advance the timer without logging a second time.
    act(() => void vi.advanceTimersByTime(5000));
    expect(dumpTourLog().filter((e) => e.type === "watchdog-fired")).toHaveLength(1);
  });

  it("Skip this step (from the watchdog row) advances past a gesture that never happened", () => {
    vi.useFakeTimers();
    renderHarness({ hasLoadedInitialState: true });

    next();
    next();
    act(() => void vi.advanceTimersByTime(70_000));

    fireEvent.click(screen.getByRole("button", { name: "Skip this step" }));
    expect(screen.getByText("Save, docs, and shortcuts")).toBeInTheDocument();
  });

  it("the watchdog row disappears once the gesture actually lands", () => {
    vi.useFakeTimers();
    renderHarness({ hasLoadedInitialState: true });

    next();
    next();
    act(() => void vi.advanceTimersByTime(70_000));
    expect(screen.getByText(/still here/i)).toBeInTheDocument();

    act(() => fireEvent.click(screen.getByTestId("select-node")));
    settle();
    expect(screen.queryByText(/still here/i)).not.toBeInTheDocument();
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

  it("does not auto-advance validate-click even once its predicate is satisfied — the dropdown it reveals is the point", () => {
    // The step's real payload is the violations dropdown its gesture opens
    // (spotlightAlso, in design-editor-tour.ts), which can run to several
    // cards — the fixed ~600ms acknowledgement delay other gesture steps use
    // would whisk it away regardless of how much there is to read, which
    // reads as the step being skipped the instant Validate is clicked.
    vi.useFakeTimers();
    const { rerender } = renderHarness({ hasLoadedInitialState: true, lastValidationErrorCount: null });

    next(); // welcome -> canvas-intro
    next(); // -> select-a-node
    act(() => fireEvent.click(screen.getByTestId("select-node")));
    settle(); // -> header-tools
    next(); // header-tools -> open-picker
    act(() => fireEvent.click(screen.getByTestId("open-picker")));
    settle(); // -> picker-tour
    act(() => fireEvent.click(screen.getByTestId("add-sql-database")));
    act(() => fireEvent.click(screen.getByTestId("connect-sql-database")));
    settle(); // -> question-pane
    next(); // -> hints
    next(); // -> validate-intro
    next(); // -> validate-click

    rerender(
      <CanvasStoreProvider>
        <Harness hasLoadedInitialState lastValidationErrorCount={2} />
      </CanvasStoreProvider>,
    );

    act(() => void vi.advanceTimersByTime(10000));
    expect(screen.getByText("Try it: run Validate")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();

    next();
    expect(screen.getByText("Fix it: correct the connection")).toBeInTheDocument();
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

  it("lets the picker stay open on picker-tour, the step that tells the learner to use it", () => {
    // Punch list #1, the blocker: the force-close used to be keyed on a
    // hardcoded set of step ids that didn't include the step telling the
    // learner to use the picker, so it was slammed shut in the same tick it
    // opened, the step's predicate could never be satisfied, it had no Next
    // button, and every step after it was unreachable in a real session.
    vi.useFakeTimers();
    renderHarness({ hasLoadedInitialState: true });

    next(); // welcome -> canvas-intro
    next(); // -> select-a-node
    act(() => fireEvent.click(screen.getByTestId("select-node")));
    settle(); // -> header-tools
    next(); // header-tools -> open-picker
    act(() => fireEvent.click(screen.getByTestId("open-picker")));
    settle(); // -> picker-tour
    expect(screen.getByText("Try it: add the SQL Database")).toBeInTheDocument();
    expect(screen.getByTestId("picker-open")).toHaveTextContent("true");

    // And the step it gates is then genuinely completable — placement alone
    // isn't enough, the predicate also requires the connection.
    act(() => fireEvent.click(screen.getByTestId("add-sql-database")));
    settle();
    expect(screen.getByText("Try it: add the SQL Database")).toBeInTheDocument();
    act(() => fireEvent.click(screen.getByTestId("connect-sql-database")));
    settle();
    expect(screen.getByText("The lesson sidebar")).toBeInTheDocument();
  });

  it("requires catches drift on an already-satisfied step and clears once it's fixed again", () => {
    // picker-tour's requires is the same role-based check as its waitFor
    // (design-editor-tour.ts's hasSqlDatabase) - once satisfied, deleting
    // the very thing that satisfied it, before the auto-advance timer
    // fires, must show a truthful note and cancel the pending advance
    // rather than silently moving on regardless.
    vi.useFakeTimers();
    renderHarness({ hasLoadedInitialState: true });

    next(); // welcome -> canvas-intro
    next(); // -> select-a-node
    act(() => fireEvent.click(screen.getByTestId("select-node")));
    settle(); // -> header-tools
    next(); // header-tools -> open-picker
    act(() => fireEvent.click(screen.getByTestId("open-picker")));
    settle(); // -> picker-tour

    act(() => fireEvent.click(screen.getByTestId("add-sql-database")));
    act(() => fireEvent.click(screen.getByTestId("connect-sql-database")));
    // Satisfied - the 600ms auto-advance is now scheduled but hasn't fired.
    expect(screen.getByText("Try it: add the SQL Database")).toBeInTheDocument();

    act(() => fireEvent.click(screen.getByTestId("remove-sql-database")));
    expect(screen.getByText(/something this step needs has changed/i)).toBeInTheDocument();
    expect(
      dumpTourLog().some((e) => e.type === "requires-broke" && e.stepId === "picker-tour"),
    ).toBe(true);

    // The scheduled auto-advance was cancelled, not merely delayed.
    act(() => void vi.advanceTimersByTime(10000));
    expect(screen.getByText("Try it: add the SQL Database")).toBeInTheDocument();

    act(() => fireEvent.click(screen.getByTestId("add-sql-database")));
    act(() => fireEvent.click(screen.getByTestId("connect-sql-database")));
    expect(screen.queryByText(/something this step needs has changed/i)).not.toBeInTheDocument();
    expect(
      dumpTourLog().some((e) => e.type === "reconciled-via" && e.stepId === "picker-tour"),
    ).toBe(true);

    settle(); // now genuinely advances
    expect(screen.getByText("The lesson sidebar")).toBeInTheDocument();
  });

  it("highlights sql-database in the picker while picker-tour is active, and clears it once past that step", () => {
    vi.useFakeTimers();
    renderHarness({ hasLoadedInitialState: true });

    expect(screen.getByTestId("highlighted-id")).toHaveTextContent("null");

    next(); // welcome -> canvas-intro
    next(); // -> select-a-node
    act(() => fireEvent.click(screen.getByTestId("select-node")));
    settle(); // -> header-tools
    next(); // header-tools -> open-picker
    expect(screen.getByTestId("highlighted-id")).toHaveTextContent("null");

    act(() => fireEvent.click(screen.getByTestId("open-picker")));
    settle(); // -> picker-tour
    expect(screen.getByTestId("highlighted-id")).toHaveTextContent("sql-database");

    act(() => fireEvent.click(screen.getByTestId("add-sql-database")));
    act(() => fireEvent.click(screen.getByTestId("connect-sql-database")));
    settle(); // -> question-pane
    expect(screen.getByTestId("highlighted-id")).toHaveTextContent("null");
  });

  it("walks through the full remediation flow end to end and completes on the final step", () => {
    vi.useFakeTimers();
    const { rerender } = renderHarness({ hasLoadedInitialState: true, lastValidationErrorCount: null });

    next(); // welcome -> canvas-intro
    next(); // canvas-intro -> select-a-node
    act(() => fireEvent.click(screen.getByTestId("select-node")));
    settle(); // -> header-tools
    next(); // header-tools -> open-picker
    act(() => fireEvent.click(screen.getByTestId("open-picker")));
    settle(); // -> picker-tour
    act(() => fireEvent.click(screen.getByTestId("add-sql-database")));
    act(() => fireEvent.click(screen.getByTestId("connect-sql-database")));
    settle(); // picker-tour -> question-pane
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
    next(); // validate-click has noAutoAdvance -> fix-edge
    expect(screen.getByText("Fix it: correct the connection")).toBeInTheDocument();

    act(() => fireEvent.click(screen.getByTestId("fix-edge-kind")));
    settle(); // -> revalidate-clean
    expect(screen.getByText("Try it: confirm the fix")).toBeInTheDocument();

    rerender(
      <CanvasStoreProvider>
        <Harness hasLoadedInitialState lastValidationErrorCount={0} />
      </CanvasStoreProvider>,
    );
    next(); // revalidate-clean has noAutoAdvance -> deep-check-overview
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

  describe("multi-tab adoption", () => {
    it("adopts a write made in another tab via the native storage event", () => {
      renderHarness({ hasLoadedInitialState: true });
      expect(screen.getByText("Welcome to the Design Editor")).toBeInTheDocument();

      // A real cross-tab write never fires a storage event in the tab that
      // made it - simulated as the localStorage mutation another tab already
      // made, then the native event this tab's own listener reacts to.
      act(() => {
        localStorage.setItem(STATE_KEY, JSON.stringify({ status: "completed" }));
        window.dispatchEvent(new StorageEvent("storage", { key: STATE_KEY }));
      });

      expect(screen.queryByText("Welcome to the Design Editor")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Replay guided tour" })).toBeInTheDocument();
    });

    it("ignores an unrelated key changing in the same storage event", () => {
      renderHarness({ hasLoadedInitialState: true });
      next();
      expect(screen.getByText("Your canvas")).toBeInTheDocument();

      act(() => {
        localStorage.setItem("sc-tour-some-other-tour", JSON.stringify({ status: "completed" }));
        window.dispatchEvent(new StorageEvent("storage", { key: "sc-tour-some-other-tour" }));
      });

      expect(screen.getByText("Your canvas")).toBeInTheDocument();
    });
  });

  describe("hard-gate-derived, order-free completion", () => {
    it("self-completes an inactive (skipped) run once every hard step's condition is met, even out of script order", () => {
      renderHarness({ hasLoadedInitialState: true, lastValidationErrorCount: 0, hasSubmittedPassing: true });

      // Structurally satisfies every hard step's own waitFor while still
      // sitting on "welcome" (step 0) - genuinely out of script order.
      act(() => fireEvent.click(screen.getByTestId("add-sql-database")));
      act(() => fireEvent.click(screen.getByTestId("connect-sql-database")));
      act(() => fireEvent.click(screen.getByTestId("fix-edge-kind")));

      // Still active on "welcome" - a background check must never yank an
      // in-progress step away from the learner.
      expect(screen.getByText("Welcome to the Design Editor")).toBeInTheDocument();
      expect(storedState()).toEqual({ status: "running", stepIndex: 0 });

      // Skip would normally leave "skipped" (see the plain "Skip tour ends
      // the run" test above) - every hard condition already being true
      // upgrades it to "completed" instead, in the same beat.
      fireEvent.click(screen.getByRole("button", { name: "Skip tour" }));
      expect(storedState()).toEqual({ status: "completed" });
    });

    it("also upgrades a paused run once every hard condition is met", () => {
      renderHarness({ hasLoadedInitialState: true, lastValidationErrorCount: 0, hasSubmittedPassing: true });
      act(() => fireEvent.click(screen.getByTestId("add-sql-database")));
      act(() => fireEvent.click(screen.getByTestId("connect-sql-database")));
      act(() => fireEvent.click(screen.getByTestId("fix-edge-kind")));

      fireEvent.keyDown(window, { key: "Escape" });
      expect(storedState()).toEqual({ status: "completed" });
    });

    it("does not self-complete while a hard step's condition still isn't met", () => {
      renderHarness({ hasLoadedInitialState: true });
      fireEvent.click(screen.getByRole("button", { name: "Skip tour" }));
      expect(storedState()).toEqual({ status: "skipped" });
    });
  });
});
