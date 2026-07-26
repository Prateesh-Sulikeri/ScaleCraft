import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, screen } from "@testing-library/react";
import { ContextMenu } from "./ContextMenu";
import { renderWithCanvasStore } from "./canvas-test-utils";
import type { ComponentNodeType, ArchitectureEdgeType, AnyNodeType } from "./types";

const clientNode: ComponentNodeType = {
  id: "n1",
  type: "component",
  position: { x: 0, y: 0 },
  data: { componentId: "client", config: {} },
};

describe("ContextMenu", () => {
  it("renders nothing when target is null", () => {
    const { container } = renderWithCanvasStore(<ContextMenu target={null} onClose={vi.fn()} centerOnNode={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing for a start-pointer edge target (visual indicator only, not interactive)", () => {
    const { container } = renderWithCanvasStore(
      <ContextMenu
        target={{ type: "edge", id: "start-pointer:s1", x: 0, y: 0 }}
        onClose={vi.fn()}
        centerOnNode={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows Duplicate/Center/Configure/Highlight Connections/Open Documentation/Delete for a plain component node", () => {
    const { api } = renderWithCanvasStore(
      <ContextMenu target={{ type: "node", id: "n1", x: 10, y: 10 }} onClose={vi.fn()} centerOnNode={vi.fn()} />,
    );
    act(() => api.getState().loadCanvasState([clientNode], []));

    for (const label of ["Duplicate", "Center View", "Configure", "Highlight Connections", "Open Documentation", "Delete"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    // Zone-only items should not appear for a component node.
    expect(screen.queryByText("Lock")).not.toBeInTheDocument();
    expect(screen.queryByText("Highlight Zone")).not.toBeInTheDocument();
  });

  it("shows Lock (not Unlock) and Highlight Zone for an unlocked zone node, no Configure/Highlight Connections", () => {
    const zone: AnyNodeType = {
      id: "z1",
      type: "zone",
      position: { x: 0, y: 0 },
      data: { label: "", width: 320, height: 220 },
    };
    const { api } = renderWithCanvasStore(
      <ContextMenu target={{ type: "node", id: "z1", x: 10, y: 10 }} onClose={vi.fn()} centerOnNode={vi.fn()} />,
    );
    act(() => api.getState().loadCanvasState([zone], []));

    expect(screen.getByText("Lock")).toBeInTheDocument();
    expect(screen.getByText("Highlight Zone")).toBeInTheDocument();
    expect(screen.queryByText("Configure")).not.toBeInTheDocument();
    expect(screen.queryByText("Highlight Connections")).not.toBeInTheDocument();
  });

  it("shows Unlock for a locked zone, and no Highlight Zone item for a locked comment", () => {
    const comment: AnyNodeType = {
      id: "c1",
      type: "comment",
      position: { x: 0, y: 0 },
      data: { text: "", width: 176, height: 60, locked: true },
    };
    const { api } = renderWithCanvasStore(
      <ContextMenu target={{ type: "node", id: "c1", x: 10, y: 10 }} onClose={vi.fn()} centerOnNode={vi.fn()} />,
    );
    act(() => api.getState().loadCanvasState([comment], []));

    expect(screen.getByText("Unlock")).toBeInTheDocument();
    // Highlight Zone is zone-only (spatial containment needs an area).
    expect(screen.queryByText("Highlight Zone")).not.toBeInTheDocument();
  });

  it("clicking Delete calls deleteNode and closes the menu", () => {
    const onClose = vi.fn();
    const { api } = renderWithCanvasStore(
      <ContextMenu target={{ type: "node", id: "n1", x: 10, y: 10 }} onClose={onClose} centerOnNode={vi.fn()} />,
    );
    act(() => api.getState().loadCanvasState([clientNode], []));

    fireEvent.click(screen.getByText("Delete"));
    expect(api.getState().nodes).toHaveLength(0);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("clicking Duplicate calls duplicateNode", () => {
    const { api } = renderWithCanvasStore(
      <ContextMenu target={{ type: "node", id: "n1", x: 10, y: 10 }} onClose={vi.fn()} centerOnNode={vi.fn()} />,
    );
    act(() => api.getState().loadCanvasState([clientNode], []));

    fireEvent.click(screen.getByText("Duplicate"));
    expect(api.getState().nodes).toHaveLength(2);
  });

  it("clicking Center View calls the centerOnNode prop with the target's id", () => {
    const centerOnNode = vi.fn();
    const { api } = renderWithCanvasStore(
      <ContextMenu target={{ type: "node", id: "n1", x: 10, y: 10 }} onClose={vi.fn()} centerOnNode={centerOnNode} />,
    );
    act(() => api.getState().loadCanvasState([clientNode], []));

    fireEvent.click(screen.getByText("Center View"));
    expect(centerOnNode).toHaveBeenCalledWith("n1");
  });

  it("clicking Highlight Connections calls setHighlight with mode connections", () => {
    const { api } = renderWithCanvasStore(
      <ContextMenu target={{ type: "node", id: "n1", x: 10, y: 10 }} onClose={vi.fn()} centerOnNode={vi.fn()} />,
    );
    act(() => api.getState().loadCanvasState([clientNode], []));

    fireEvent.click(screen.getByText("Highlight Connections"));
    expect(api.getState().highlight).toEqual({ mode: "connections", id: "n1" });
  });

  it("clicking Open Documentation opens the docs tab for the node's componentId", () => {
    const { api } = renderWithCanvasStore(
      <ContextMenu target={{ type: "node", id: "n1", x: 10, y: 10 }} onClose={vi.fn()} centerOnNode={vi.fn()} />,
    );
    act(() => api.getState().loadCanvasState([clientNode], []));

    fireEvent.click(screen.getByText("Open Documentation"));
    expect(api.getState().docsPanel.tabs.map((t) => t.componentId)).toContain("client");
  });

  it("shows Reverse direction and Delete for a real edge, and reverses source/target on click", () => {
    const edges: ArchitectureEdgeType[] = [{ id: "e1", source: "a", target: "b" }];
    const { api } = renderWithCanvasStore(
      <ContextMenu target={{ type: "edge", id: "e1", x: 10, y: 10 }} onClose={vi.fn()} centerOnNode={vi.fn()} />,
    );
    act(() => api.getState().loadCanvasState([], edges));

    fireEvent.click(screen.getByText("Reverse direction"));
    const edge = api.getState().edges.find((e) => e.id === "e1");
    expect(edge?.source).toBe("b");
    expect(edge?.target).toBe("a");
  });

  it("clicking Delete on an edge calls deleteEdge", () => {
    const edges: ArchitectureEdgeType[] = [{ id: "e1", source: "a", target: "b" }];
    const { api } = renderWithCanvasStore(
      <ContextMenu target={{ type: "edge", id: "e1", x: 10, y: 10 }} onClose={vi.fn()} centerOnNode={vi.fn()} />,
    );
    act(() => api.getState().loadCanvasState([], edges));

    fireEvent.click(screen.getByText("Delete"));
    expect(api.getState().edges).toHaveLength(0);
  });

  it("shows a count-labeled Duplicate/Delete for a multi-node selection target", () => {
    const { api } = renderWithCanvasStore(
      <ContextMenu target={{ type: "selection", ids: ["n1", "n2"], x: 10, y: 10 }} onClose={vi.fn()} centerOnNode={vi.fn()} />,
    );
    act(() =>
      api.getState().loadCanvasState(
        [clientNode, { ...clientNode, id: "n2" }],
        [],
      ),
    );

    expect(screen.getByText("Duplicate 2 components")).toBeInTheDocument();
    expect(screen.getByText("Delete 2 components")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Delete 2 components"));
    expect(api.getState().nodes).toHaveLength(0);
  });

  it("prevents the default context menu on the backdrop", () => {
    const { container, api } = renderWithCanvasStore(
      <ContextMenu target={{ type: "node", id: "n1", x: 10, y: 10 }} onClose={vi.fn()} centerOnNode={vi.fn()} />,
    );
    act(() => api.getState().loadCanvasState([clientNode], []));
    const backdrop = container.querySelector(".fixed.inset-0") as HTMLElement;
    const event = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
    const preventSpy = vi.spyOn(event, "preventDefault");
    backdrop.dispatchEvent(event);
    expect(preventSpy).toHaveBeenCalled();
  });

  it("clicking Lock on an unlocked zone toggles it locked via the store", () => {
    const zone: AnyNodeType = {
      id: "z1",
      type: "zone",
      position: { x: 0, y: 0 },
      data: { label: "", width: 320, height: 220 },
    };
    const { api } = renderWithCanvasStore(
      <ContextMenu target={{ type: "node", id: "z1", x: 10, y: 10 }} onClose={vi.fn()} centerOnNode={vi.fn()} />,
    );
    act(() => api.getState().loadCanvasState([zone], []));

    fireEvent.click(screen.getByText("Lock"));
    const node = api.getState().nodes.find((n) => n.id === "z1");
    expect(node?.type === "zone" && node.data.locked).toBe(true);
  });

  it("clicking Highlight Zone on a zone sets highlight with mode zone", () => {
    const zone: AnyNodeType = {
      id: "z1",
      type: "zone",
      position: { x: 0, y: 0 },
      data: { label: "", width: 320, height: 220 },
    };
    const { api } = renderWithCanvasStore(
      <ContextMenu target={{ type: "node", id: "z1", x: 10, y: 10 }} onClose={vi.fn()} centerOnNode={vi.fn()} />,
    );
    act(() => api.getState().loadCanvasState([zone], []));

    fireEvent.click(screen.getByText("Highlight Zone"));
    expect(api.getState().highlight).toEqual({ mode: "zone", id: "z1" });
  });

  it("clicking 'Duplicate N components' on a multi-selection calls duplicateNodes", () => {
    const { api } = renderWithCanvasStore(
      <ContextMenu target={{ type: "selection", ids: ["n1", "n2"], x: 10, y: 10 }} onClose={vi.fn()} centerOnNode={vi.fn()} />,
    );
    act(() => api.getState().loadCanvasState([clientNode, { ...clientNode, id: "n2" }], []));

    fireEvent.click(screen.getByText("Duplicate 2 components"));
    expect(api.getState().nodes).toHaveLength(4);
  });

  it("clicking the full-screen backdrop calls onClose", () => {
    const onClose = vi.fn();
    const { api, container } = renderWithCanvasStore(
      <ContextMenu target={{ type: "node", id: "n1", x: 10, y: 10 }} onClose={onClose} centerOnNode={vi.fn()} />,
    );
    act(() => api.getState().loadCanvasState([clientNode], []));

    const backdrop = container.querySelector(".fixed.inset-0") as HTMLElement;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
