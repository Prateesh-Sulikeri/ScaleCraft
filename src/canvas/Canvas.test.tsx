import { beforeAll, describe, expect, it, vi } from "vitest";
import { act, fireEvent, screen } from "@testing-library/react";
import { createRef } from "react";
import { Canvas, type CanvasHandle } from "./Canvas";
import { renderWithCanvasStore, stubResizeObserver } from "./canvas-test-utils";
import type { ComponentNodeType, ArchitectureEdgeType, AnyNodeType } from "./types";
import { getComponent } from "@/content/components/registry";

vi.mock("html-to-image", () => ({
  toPng: vi.fn(() => Promise.resolve("data:image/png;base64,mock")),
  toJpeg: vi.fn(() => Promise.resolve("data:image/jpeg;base64,mock")),
}));

beforeAll(() => {
  stubResizeObserver();
  Element.prototype.scrollIntoView = () => {};
});

const clientNode: ComponentNodeType = {
  id: "n1",
  type: "component",
  position: { x: 0, y: 0 },
  data: { componentId: "client", config: {} },
};
const appServerNode: ComponentNodeType = {
  id: "n2",
  type: "component",
  position: { x: 200, y: 0 },
  data: { componentId: "app-server", config: {} },
};

describe("Canvas", () => {
  it("renders without crashing on an empty board", () => {
    const { container } = renderWithCanvasStore(<Canvas />);
    expect(container.querySelector(".react-flow")).toBeInTheDocument();
  });

  it("renders the store's seeded nodes as React Flow nodes", () => {
    const { api } = renderWithCanvasStore(<Canvas />);
    act(() => api.getState().loadCanvasState([clientNode, appServerNode], []));
    expect(screen.getByText("Client")).toBeInTheDocument();
    expect(screen.getByText("Application Server")).toBeInTheDocument();
  });

  it("right-clicking the empty pane opens the component picker", () => {
    const { container, api } = renderWithCanvasStore(<Canvas />);
    const pane = container.querySelector(".react-flow__pane") as HTMLElement;
    expect(api.getState().componentPicker).toBe(false);
    fireEvent.contextMenu(pane);
    expect(api.getState().componentPicker).toBe(true);
  });

  it("clicking the empty pane clears selection and any active highlight", () => {
    // React Flow only treats this as a "click" (rather than the start of a
    // box-selection drag) via its pointerdown/pointerup pair, not a plain
    // synthetic "click" event — Canvas.tsx's own selectionOnDrag={true}
    // routes clicks through that path (see @xyflow/react's Pane component).
    const { container, api } = renderWithCanvasStore(<Canvas />);
    act(() => {
      api.getState().loadCanvasState([clientNode], []);
      api.getState().setSelectedNodeId("n1");
      api.getState().setHighlight({ mode: "connections", id: "n1" });
    });
    const pane = container.querySelector(".react-flow__pane") as HTMLElement;
    fireEvent.pointerDown(pane, { button: 0, isPrimary: true, pointerId: 1 });
    fireEvent.pointerUp(pane, { button: 0, pointerId: 1 });
    expect(api.getState().selectedNodeId).toBeNull();
    expect(api.getState().highlight).toBeNull();
  });

  it("shows the EdgeInspector once an edge is selected", () => {
    const edges: ArchitectureEdgeType[] = [{ id: "e1", source: "n1", target: "n2" }];
    const { api } = renderWithCanvasStore(<Canvas />);
    act(() => {
      api.getState().loadCanvasState([clientNode, appServerNode], edges);
      api.getState().setSelectedEdgeId("e1");
    });
    expect(screen.getByText("Edge kind")).toBeInTheDocument();
  });

  it("shows a placement hint overlay while a zone/comment/start placement mode is armed", () => {
    const { api } = renderWithCanvasStore(<Canvas />);
    act(() => api.getState().setPlacementMode("zone"));
    expect(screen.getByText(/Click and drag to place a zone/)).toBeInTheDocument();

    act(() => api.getState().setPlacementMode("start"));
    expect(screen.getByText(/Click to place a start marker/)).toBeInTheDocument();
  });

  it("Escape cancels an active placement mode", () => {
    const { api } = renderWithCanvasStore(<Canvas />);
    act(() => api.getState().setPlacementMode("comment"));
    expect(api.getState().placementMode).toBe("comment");

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(api.getState().placementMode).toBeNull();
  });

  it("Escape clears an active highlight when nothing else is in progress", () => {
    const { api } = renderWithCanvasStore(<Canvas />);
    act(() => {
      api.getState().loadCanvasState([clientNode], []);
      api.getState().setHighlight({ mode: "connections", id: "n1" });
    });

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(api.getState().highlight).toBeNull();
  });

  it("Escape cancels an armed component placement (from ComponentPicker) instead of touching highlight", () => {
    const { api } = renderWithCanvasStore(<Canvas />);
    const definition = { id: "client" } as unknown as Parameters<
      ReturnType<typeof api.getState>["setPendingComponentPlacement"]
    >[0];
    act(() => api.getState().setPendingComponentPlacement(definition));
    expect(screen.getByText(/Click to place/)).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(api.getState().pendingComponentPlacement).toBeNull();
  });

  it("right-clicking a node opens ContextMenu with node-specific actions", () => {
    const { api } = renderWithCanvasStore(<Canvas />);
    act(() => api.getState().loadCanvasState([clientNode], []));
    fireEvent.contextMenu(screen.getByText("Client"));
    expect(screen.getByText("Duplicate")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("double-clicking a component node opens the config popover", () => {
    const { api } = renderWithCanvasStore(<Canvas />);
    act(() => api.getState().loadCanvasState([clientNode], []));
    fireEvent.doubleClick(screen.getByText("Client"));
    expect(api.getState().configPopover?.nodeId).toBe("n1");
  });

  it("clicking a node selects it (and clears any edge selection)", () => {
    const edges: ArchitectureEdgeType[] = [{ id: "e1", source: "n1", target: "n2" }];
    const { api } = renderWithCanvasStore(<Canvas />);
    act(() => {
      api.getState().loadCanvasState([clientNode, appServerNode], edges);
      api.getState().setSelectedEdgeId("e1");
    });
    fireEvent.click(screen.getByText("Client"));
    expect(api.getState().selectedNodeId).toBe("n1");
    expect(api.getState().selectedEdgeId).toBeNull();
  });

  describe("annotation placement drag gesture", () => {
    it("dragging out a rectangle places a zone sized to the drag, and clears placementMode", () => {
      const { container, api } = renderWithCanvasStore(<Canvas />);
      act(() => api.getState().setPlacementMode("zone"));
      const overlay = container.querySelector(".cursor-crosshair") as HTMLElement;

      fireEvent.mouseDown(overlay, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(window, { clientX: 300, clientY: 250 });
      fireEvent.mouseUp(window, { clientX: 300, clientY: 250 });

      const state = api.getState();
      expect(state.placementMode).toBeNull();
      expect(state.nodes).toHaveLength(1);
      const zone = state.nodes[0];
      expect(zone.type).toBe("zone");
      expect(zone.type === "zone" && zone.data.width).toBe(200); // 300-100
      expect(zone.type === "zone" && zone.data.height).toBe(150); // 250-100
      // Placing opens the AnnotationEditor right where the drag ended.
      expect(state.editingAnnotation?.id).toBe(zone.id);
    });

    it("a near-zero drag (a plain click) falls back to the default zone size, centered on the click", () => {
      const { container, api } = renderWithCanvasStore(<Canvas />);
      act(() => api.getState().setPlacementMode("zone"));
      const overlay = container.querySelector(".cursor-crosshair") as HTMLElement;

      fireEvent.mouseDown(overlay, { clientX: 150, clientY: 150 });
      fireEvent.mouseUp(window, { clientX: 151, clientY: 151 });

      const zone = api.getState().nodes[0];
      expect(zone.type === "zone" && zone.data.width).toBe(320);
      expect(zone.type === "zone" && zone.data.height).toBe(220);
    });

    it("drag-placing a comment uses the comment defaults, not the zone defaults", () => {
      const { container, api } = renderWithCanvasStore(<Canvas />);
      act(() => api.getState().setPlacementMode("comment"));
      const overlay = container.querySelector(".cursor-crosshair") as HTMLElement;

      fireEvent.mouseDown(overlay, { clientX: 0, clientY: 0 });
      fireEvent.mouseUp(window, { clientX: 0, clientY: 0 });

      const comment = api.getState().nodes[0];
      expect(comment.type).toBe("comment");
      expect(comment.type === "comment" && comment.data.width).toBe(176);
      expect(comment.type === "comment" && comment.data.height).toBe(60);
    });

    it("a single click places a start marker immediately (no drag needed) and opens its editor", () => {
      const { container, api } = renderWithCanvasStore(<Canvas />);
      act(() => api.getState().setPlacementMode("start"));
      const overlay = container.querySelector(".cursor-crosshair") as HTMLElement;

      fireEvent.mouseDown(overlay, { clientX: 80, clientY: 80 });

      const state = api.getState();
      expect(state.placementMode).toBeNull();
      expect(state.nodes).toHaveLength(1);
      expect(state.nodes[0].type).toBe("start");
      expect(state.editingAnnotation?.id).toBe(state.nodes[0].id);
    });

    it("Escape mid-drag tears down the in-progress gesture without placing anything", () => {
      const { container, api } = renderWithCanvasStore(<Canvas />);
      act(() => api.getState().setPlacementMode("zone"));
      const overlay = container.querySelector(".cursor-crosshair") as HTMLElement;

      fireEvent.mouseDown(overlay, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(window, { clientX: 300, clientY: 250 });

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      });

      // A further mouseup after Escape shouldn't place anything — the
      // window listeners were torn down by the cleanup Escape triggered.
      fireEvent.mouseUp(window, { clientX: 300, clientY: 250 });

      expect(api.getState().placementMode).toBeNull();
      expect(api.getState().nodes).toHaveLength(0);
    });
  });

  describe("component placement (from ComponentPicker)", () => {
    const clientDef = getComponent("client")!;

    it("clicking the placement overlay adds the pending component at that position and clears placement", () => {
      const { container, api } = renderWithCanvasStore(<Canvas />);
      act(() => api.getState().setPendingComponentPlacement(clientDef));
      const overlay = container.querySelector(".cursor-pointer") as HTMLElement;

      fireEvent.mouseDown(overlay, { clientX: 120, clientY: 60 });

      const state = api.getState();
      expect(state.pendingComponentPlacement).toBeNull();
      expect(state.nodes).toHaveLength(1);
      expect(state.nodes[0].type === "component" && state.nodes[0].data.componentId).toBe("client");
    });

    it("Shift-click keeps the same component armed for placing several in a row", () => {
      const { container, api } = renderWithCanvasStore(<Canvas />);
      act(() => api.getState().setPendingComponentPlacement(clientDef));
      const overlay = container.querySelector(".cursor-pointer") as HTMLElement;

      fireEvent.mouseDown(overlay, { clientX: 10, clientY: 10, shiftKey: true });

      const state = api.getState();
      expect(state.nodes).toHaveLength(1);
      expect(state.pendingComponentPlacement?.id).toBe("client");
    });

    it("shows a ghost preview tile that follows the cursor while a placement is pending", () => {
      const { api } = renderWithCanvasStore(<Canvas />);
      act(() => api.getState().setPendingComponentPlacement(clientDef));
      fireEvent.mouseMove(window, { clientX: 222, clientY: 111 });
      // The ghost is a fixed, cursor-following tile portalled to document.body.
      const ghost = document.body.querySelector(".pointer-events-none.fixed") as HTMLElement;
      expect(ghost).toBeInTheDocument();
    });
  });

  describe("highlighting", () => {
    it("dims every node not part of an active Highlight Connections pass", () => {
      const edges: ArchitectureEdgeType[] = [{ id: "e1", source: "n1", target: "n2" }];
      const third: ComponentNodeType = {
        id: "n3",
        type: "component",
        position: { x: 400, y: 0 },
        data: { componentId: "client", config: {} },
      };
      const { api } = renderWithCanvasStore(<Canvas />);
      act(() => {
        api.getState().loadCanvasState([clientNode, appServerNode, third], edges);
        api.getState().setHighlight({ mode: "connections", id: "n1" });
      });

      // n1 and n2 are connected via e1 (opacity 1); n3 is unconnected, so it
      // dims to 0.3 — two "Client"-labeled cards exist (n1 and n3), so at
      // least one of them must show the dimmed opacity.
      const cards = screen.getAllByText("Client").map((el) => el.closest(".react-flow__node") as HTMLElement);
      const opacities = cards.map((c) => c.style.opacity);
      expect(opacities).toContain("0.3");
      expect(opacities).toContain("1");
    });
  });

  describe("Start marker pointer edge", () => {
    // React Flow only draws an edge path once it has measured both
    // endpoints' handle positions via ResizeObserver — jsdom's lack of real
    // layout (and of DOMMatrixReadOnly, which xyflow's own node-internals
    // update path needs) means no edge, pointer or real, ever gets a
    // rendered `.react-flow__edge` element in this environment regardless of
    // the `edges`/pointerEdges arrays' actual contents. This test is
    // therefore scoped to what's meaningfully verifiable here: the derived
    // pointer-edge memo doesn't throw, and a Start marker's targetId is
    // never promoted into the real domain graph's edges.
    it("computing the derived pointer edge for a start marker with a set target doesn't throw", () => {
      const start: AnyNodeType = {
        id: "s1",
        type: "start",
        position: { x: -50, y: 0 },
        data: { label: "", targetId: "n1" },
      };
      const { api } = renderWithCanvasStore(<Canvas />);
      expect(() => act(() => api.getState().loadCanvasState([clientNode, start], []))).not.toThrow();
      expect(api.getState().edges).toHaveLength(0);
    });
  });

  describe("Escape while the component picker is open", () => {
    it("does not touch placementMode/highlight — the picker handles its own Escape", () => {
      const { api } = renderWithCanvasStore(<Canvas />);
      act(() => {
        api.getState().loadCanvasState([clientNode], []);
        api.getState().setHighlight({ mode: "connections", id: "n1" });
        api.getState().openComponentPicker();
      });

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      });

      // Highlight survives — Canvas's own Escape handler bailed because the
      // picker was open (ComponentPicker.tsx handles closing itself).
      expect(api.getState().highlight).toEqual({ mode: "connections", id: "n1" });
    });
  });

  describe("holding Space to pan over a node", () => {
    it("marks nodes non-draggable while Space is held, and restores on keyup", () => {
      const { api } = renderWithCanvasStore(<Canvas />);
      act(() => api.getState().loadCanvasState([clientNode], []));
      const nodeEl = () => screen.getByText("Client").closest(".react-flow__node") as HTMLElement;

      expect(nodeEl().className).toContain("draggable");
      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
      });
      // xyflow drops the "draggable" class from a node once it's marked
      // non-draggable.
      expect(nodeEl().className).not.toContain("draggable");

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keyup", { code: "Space" }));
      });
      expect(nodeEl().className).toContain("draggable");
    });

    it("ignores a repeated (auto-repeat) Space keydown", () => {
      const { api } = renderWithCanvasStore(<Canvas />);
      act(() => api.getState().loadCanvasState([clientNode], []));
      const nodeEl = () => screen.getByText("Client").closest(".react-flow__node") as HTMLElement;

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space", repeat: true }));
      });
      expect(nodeEl().className).toContain("draggable");
    });

    it("ignores Space while focus is inside an editable field", () => {
      const { api } = renderWithCanvasStore(<Canvas />);
      act(() => api.getState().loadCanvasState([clientNode], []));
      const input = document.createElement("input");
      document.body.appendChild(input);

      const event = new KeyboardEvent("keydown", { code: "Space" });
      Object.defineProperty(event, "target", { value: input });
      act(() => window.dispatchEvent(event));

      expect(screen.getByText("Client").closest(".react-flow__node")!.className).toContain("draggable");
      document.body.removeChild(input);
    });

    it("resets spaceHeld on window blur, in case a keyup is missed", () => {
      const { api } = renderWithCanvasStore(<Canvas />);
      act(() => api.getState().loadCanvasState([clientNode], []));
      const nodeEl = () => screen.getByText("Client").closest(".react-flow__node") as HTMLElement;

      act(() => window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" })));
      expect(nodeEl().className).not.toContain("draggable");

      act(() => window.dispatchEvent(new Event("blur")));
      expect(nodeEl().className).toContain("draggable");
    });
  });

  describe("zoom keyboard shortcuts", () => {
    // xyflow's zoomIn/zoomOut/zoomTo animate via a d3 transition even with a
    // short duration — flushing real timers (not fake ones; jsdom's
    // requestAnimationFrame polyfill runs on the real clock) lets the
    // transition settle before asserting on the rendered transform.
    function getScale(container: HTMLElement): number {
      const viewport = container.querySelector(".react-flow__viewport") as HTMLElement;
      const match = viewport.style.transform.match(/scale\(([^)]+)\)/);
      return match ? parseFloat(match[1]) : 1;
    }

    it("Ctrl+= zooms in, centered on the viewport (not the flow origin)", async () => {
      const { container } = renderWithCanvasStore(<Canvas />);
      const before = getScale(container);

      await act(async () => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "=", ctrlKey: true }));
        await new Promise((r) => setTimeout(r, 250));
      });

      expect(getScale(container)).toBeGreaterThan(before);
    });

    it("Ctrl+- zooms out", async () => {
      const { container } = renderWithCanvasStore(<Canvas />);
      const before = getScale(container);

      await act(async () => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "-", ctrlKey: true }));
        await new Promise((r) => setTimeout(r, 250));
      });

      expect(getScale(container)).toBeLessThan(before);
    });

    it("Ctrl+0 resets zoom to 100%", async () => {
      const { container } = renderWithCanvasStore(<Canvas />);

      await act(async () => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "=", ctrlKey: true }));
        await new Promise((r) => setTimeout(r, 250));
      });
      expect(getScale(container)).not.toBeCloseTo(1);

      await act(async () => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "0", ctrlKey: true }));
        await new Promise((r) => setTimeout(r, 350));
      });
      expect(getScale(container)).toBeCloseTo(1);
    });
  });

  describe("nodeStates prop (validation results merged at render time)", () => {
    it("annotates a component node's validationState/highlighted from nodeStates without touching the store", () => {
      const { api } = renderWithCanvasStore(<Canvas nodeStates={{ n1: "error" }} />);
      act(() => api.getState().loadCanvasState([clientNode], []));

      const card = screen.getByText("Client").closest(".react-flow__node > div") as HTMLElement;
      expect(card.style.outline).toContain("var(--state-error)");
      // Purely derived for rendering — never written back into the store's
      // own node data.
      expect((api.getState().nodes[0].data as { validationState?: string }).validationState).toBeUndefined();
    });

    it("still annotates zone/comment/start nodes (highlighted only, no validationState) when nodeStates is present", () => {
      const zone: AnyNodeType = {
        id: "z1",
        type: "zone",
        position: { x: 0, y: 0 },
        data: { label: "Backend", width: 320, height: 220 },
      };
      const { api } = renderWithCanvasStore(<Canvas nodeStates={{}} />);
      act(() => {
        api.getState().loadCanvasState([zone], []);
        api.getState().setSelectedNodeId("z1");
      });
      expect(screen.getByDisplayValue("Backend")).toBeInTheDocument();
    });

    it("calls onCanvasPaneClick alongside Canvas's own pane-click handling", () => {
      const onCanvasPaneClick = vi.fn();
      const { container, api } = renderWithCanvasStore(
        <Canvas nodeStates={{}} onCanvasPaneClick={onCanvasPaneClick} />,
      );
      act(() => api.getState().loadCanvasState([clientNode], []));
      const pane = container.querySelector(".react-flow__pane") as HTMLElement;
      fireEvent.pointerDown(pane, { button: 0, isPrimary: true, pointerId: 1 });
      fireEvent.pointerUp(pane, { button: 0, pointerId: 1 });
      expect(onCanvasPaneClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("right-clicking a different node while one is already highlighted", () => {
    it("clears the previous highlight before opening the new node's context menu", () => {
      const { api } = renderWithCanvasStore(<Canvas />);
      act(() => {
        api.getState().loadCanvasState([clientNode, appServerNode], []);
        api.getState().setHighlight({ mode: "connections", id: "n1" });
      });

      fireEvent.contextMenu(screen.getByText("Application Server"));
      expect(api.getState().highlight).toBeNull();
    });

    it("keeps the highlight when right-clicking the same node it belongs to", () => {
      const { api } = renderWithCanvasStore(<Canvas />);
      act(() => {
        api.getState().loadCanvasState([clientNode], []);
        api.getState().setHighlight({ mode: "connections", id: "n1" });
      });

      fireEvent.contextMenu(screen.getByText("Client"));
      expect(api.getState().highlight).toEqual({ mode: "connections", id: "n1" });
    });
  });

  describe("Center View (context menu action reaching into Canvas)", () => {
    it("clicking 'Center View' from the node context menu doesn't throw and closes the menu", () => {
      const { api } = renderWithCanvasStore(<Canvas />);
      act(() => api.getState().loadCanvasState([clientNode], []));
      fireEvent.contextMenu(screen.getByText("Client"));
      expect(screen.getByText("Center View")).toBeInTheDocument();
      fireEvent.click(screen.getByText("Center View"));
      // Menu closes after the action.
      expect(screen.queryByText("Center View")).not.toBeInTheDocument();
    });
  });

  describe("exportImage (imperative handle)", () => {
    it("captures the viewport and triggers a PNG download without throwing", async () => {
      const ref = createRef<CanvasHandle>();
      renderWithCanvasStore(<Canvas ref={ref} />);

      const clickSpy = vi.fn();
      const realCreateElement = document.createElement.bind(document);
      const createElementSpy = vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
        const el = realCreateElement(tag);
        if (tag === "a") el.click = clickSpy;
        return el;
      });

      await act(async () => {
        await ref.current!.exportImage({ format: "png" });
      });

      expect(clickSpy).toHaveBeenCalledTimes(1);
      createElementSpy.mockRestore();
    });

    it("is a no-op if the viewport element isn't mounted", async () => {
      const ref = createRef<CanvasHandle>();
      const { container } = renderWithCanvasStore(<Canvas ref={ref} />);
      const viewport = container.querySelector(".react-flow__viewport");
      viewport?.remove();

      await expect(
        act(async () => {
          await ref.current!.exportImage({ format: "jpg" });
        }),
      ).resolves.not.toThrow();
    });
  });
});
