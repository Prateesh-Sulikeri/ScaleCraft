import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { useEffect } from "react";
import { CanvasStoreProvider, useCanvasStoreApi } from "@/canvas/store";
import { UndoToast } from "./UndoToast";

// UndoToast renders purely off the canvas store's `pendingUndo` — there's no
// prop surface of its own. This harness reaches into the store (the same
// store instance UndoToast itself reads, via the shared Provider) so tests
// can drive pendingUndo the way a real delete action would.
function Harness({ onReady }: { onReady: (api: ReturnType<typeof useCanvasStoreApi>) => void }) {
  const api = useCanvasStoreApi();
  useEffect(() => {
    onReady(api);
  }, [api, onReady]);
  return <UndoToast />;
}

function renderUndoToast() {
  let api!: ReturnType<typeof useCanvasStoreApi>;
  render(
    <CanvasStoreProvider>
      <Harness onReady={(a) => (api = a)} />
    </CanvasStoreProvider>,
  );
  return api;
}

/** Sets pendingUndo directly rather than going through a real delete/
 * snapshotForUndo call — snapshotForUndo is a deliberate no-op on an empty
 * board (see store.ts), so driving it through that path would require
 * populating a whole node/edge first just to exercise UndoToast's own
 * rendering, which is what these tests actually care about. */
function setPendingUndo(api: ReturnType<typeof useCanvasStoreApi>, label: string) {
  act(() => {
    api.setState({ pendingUndo: { nodes: [], edges: [], label, mode: "replace", at: Date.now() } });
  });
}

describe("UndoToast", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders nothing when there's no pending undo", () => {
    renderUndoToast();
    expect(screen.queryByText("Undo")).not.toBeInTheDocument();
  });

  it("shows the toast with its label and an Undo control once a delete is pending", () => {
    const api = renderUndoToast();
    setPendingUndo(api, "Deleted node");

    expect(screen.getByText("Deleted node")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /undo/i })).toBeInTheDocument();
  });

  it("clears pendingUndo (and the toast) when Undo is clicked", () => {
    const api = renderUndoToast();
    setPendingUndo(api, "Deleted node");
    fireEvent.click(screen.getByRole("button", { name: /undo/i }));

    expect(api.getState().pendingUndo).toBeNull();
    expect(screen.queryByText("Deleted node")).not.toBeInTheDocument();
  });

  it("dismisses the toast without undoing when the close (X) control is clicked", () => {
    const api = renderUndoToast();
    setPendingUndo(api, "Deleted node");
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));

    expect(api.getState().pendingUndo).toBeNull();
    expect(screen.queryByText("Deleted node")).not.toBeInTheDocument();
  });

  it("auto-dismisses after the timeout elapses", () => {
    vi.useFakeTimers();
    const api = renderUndoToast();
    setPendingUndo(api, "Deleted node");
    expect(screen.getByText("Deleted node")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(6000);
    });

    expect(api.getState().pendingUndo).toBeNull();
  });
});
