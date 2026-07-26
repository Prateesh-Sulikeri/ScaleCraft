import "fake-indexeddb/auto";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { CanvasStoreProvider, useCanvasStoreApi } from "@/canvas/store";
import { db } from "@/persistence/db";
import { BoardMenu } from "./BoardMenu";
import type { ComponentNodeType } from "@/canvas/types";

function Harness({ saveId, onReady }: { saveId: string | null; onReady: (api: ReturnType<typeof useCanvasStoreApi>) => void }) {
  const api = useCanvasStoreApi();
  useEffect(() => {
    onReady(api);
  }, [api, onReady]);
  return <BoardMenu saveId={saveId} />;
}

function renderBoardMenu(saveId: string | null) {
  let api!: ReturnType<typeof useCanvasStoreApi>;
  render(
    <CanvasStoreProvider>
      <Harness saveId={saveId} onReady={(a) => (api = a)} />
    </CanvasStoreProvider>,
  );
  return api;
}

const aNode: ComponentNodeType = {
  id: "n1",
  type: "component",
  position: { x: 0, y: 0 },
  data: { componentId: "client", config: {} },
};

describe("BoardMenu", () => {
  afterEach(async () => {
    await db.saves.clear();
  });

  it("disables the trigger when there's no saveId (e.g. chapter list view)", () => {
    renderBoardMenu(null);
    expect(screen.getByRole("button", { name: "Board" })).toBeDisabled();
  });

  it("enables the trigger and opens the dropdown when there is a saveId", () => {
    renderBoardMenu("sandbox");
    const button = screen.getByRole("button", { name: "Board" });
    expect(button).toBeEnabled();

    fireEvent.click(button);
    expect(screen.getByText("Clear board")).toBeInTheDocument();
    expect(screen.getByText("Restore last save")).toBeInTheDocument();
  });

  it("disables Clear board when the canvas is empty", () => {
    renderBoardMenu("sandbox");
    fireEvent.click(screen.getByRole("button", { name: "Board" }));
    expect(screen.getByText("Clear board").closest("button")).toBeDisabled();
  });

  it("enables and clears the board via Clear board when it has content", () => {
    const api = renderBoardMenu("sandbox");
    api.setState({ nodes: [aNode] });

    fireEvent.click(screen.getByRole("button", { name: "Board" }));
    const clearButton = screen.getByText("Clear board").closest("button")!;
    expect(clearButton).toBeEnabled();

    fireEvent.click(clearButton);
    expect(api.getState().nodes).toHaveLength(0);
    // The dropdown closes after a successful action.
    expect(screen.queryByText("Clear board")).not.toBeInTheDocument();
  });

  it("shows 'No saved version yet' and disables restore when there's no save for this slot", async () => {
    renderBoardMenu("sandbox-empty-slot");
    fireEvent.click(screen.getByRole("button", { name: "Board" }));

    await waitFor(() => expect(screen.getByText("No saved version yet.")).toBeInTheDocument());
    expect(screen.getByText("Restore last save").closest("button")).toBeDisabled();
  });

  it("restores nodes/edges from the save slot when Restore last save is used", async () => {
    await db.saves.put({ id: "sandbox-restore", updatedAt: Date.now(), nodes: [aNode], edges: [] });
    const api = renderBoardMenu("sandbox-restore");

    fireEvent.click(screen.getByRole("button", { name: "Board" }));
    await waitFor(() => expect(screen.getByText("Restore last save").closest("button")).toBeEnabled());

    fireEvent.click(screen.getByText("Restore last save"));

    await waitFor(() => expect(api.getState().nodes).toHaveLength(1));
    expect(api.getState().nodes[0].id).toBe("n1");
  });
});
