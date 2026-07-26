import { beforeAll, describe, expect, it } from "vitest";
import { act, fireEvent, screen } from "@testing-library/react";
import { ReactFlowProvider } from "@xyflow/react";
import { StartNode } from "./StartNode";
import { renderWithCanvasStore, stubResizeObserver } from "./canvas-test-utils";
import { DEFAULT_FLAG_COLOR } from "./annotation-colors";
import type { ComponentNodeType, StartNodeType } from "./types";

beforeAll(() => {
  stubResizeObserver();
});

function baseProps(overrides: Partial<StartNodeType["data"]> = {}, selected = false) {
  return {
    id: "s1",
    type: "start" as const,
    selected,
    dragging: false,
    zIndex: -1,
    selectable: true,
    deletable: true,
    draggable: true,
    isConnectable: true,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    data: { label: "", targetId: null, ...overrides },
  };
}

function renderStart(props: ReturnType<typeof baseProps>, componentNodes: ComponentNodeType[] = []) {
  const utils = renderWithCanvasStore(
    <ReactFlowProvider>
      <StartNode {...props} />
    </ReactFlowProvider>,
  );
  // Wrapped in act() so useCanvasStore's subscription re-renders StartNode
  // synchronously before the caller makes any assertion — without it, a
  // display-name lookup that depends on this seeded data (rather than props
  // alone) can be queried before the store's notification has flushed.
  act(() => {
    utils.api
      .getState()
      .loadCanvasState(
        [...componentNodes, { id: props.id, type: "start", position: { x: 0, y: 0 }, data: props.data }],
        [],
      );
  });
  return utils;
}

const clientNode: ComponentNodeType = {
  id: "n1",
  type: "component",
  position: { x: 0, y: 0 },
  data: { componentId: "client", config: {} },
};

describe("StartNode", () => {
  it("renders the label input and a 'Set target…' placeholder when no target is chosen", () => {
    renderStart(baseProps());
    expect(screen.getByPlaceholderText("Flag")).toHaveValue("");
    expect(screen.getByText("Set target…")).toBeInTheDocument();
  });

  it("shows the target component's display name once targetId is set", () => {
    renderStart(baseProps({ targetId: "n1" }), [clientNode]);
    expect(screen.getByText("Client")).toBeInTheDocument();
    expect(screen.queryByText("Set target…")).not.toBeInTheDocument();
  });

  it("typing in the label input updates the flag's label via the store", () => {
    const { api } = renderStart(baseProps());
    fireEvent.change(screen.getByPlaceholderText("Flag"), { target: { value: "Known issue" } });
    const node = api.getState().nodes.find((n) => n.id === "s1");
    expect(node?.type === "start" && node.data.label).toBe("Known issue");
  });

  it("hides lock/edit controls when not selected, shows them when selected", () => {
    renderStart(baseProps({}, false));
    expect(screen.queryByLabelText("Lock flag")).not.toBeInTheDocument();

    renderStart(baseProps({}, true));
    expect(screen.getByLabelText("Lock flag")).toBeInTheDocument();
    expect(screen.getByLabelText("Edit flag color")).toBeInTheDocument();
  });

  it("clicking the lock button toggles locked via the store", () => {
    const { api } = renderStart(baseProps({}, true));
    fireEvent.click(screen.getByLabelText("Lock flag"));
    const node = api.getState().nodes.find((n) => n.id === "s1");
    expect(node?.type === "start" && node.data.locked).toBe(true);
  });

  it("shows the Locked badge when data.locked is true", () => {
    renderStart(baseProps({ locked: true }));
    expect(screen.getByLabelText("Locked")).toBeInTheDocument();
  });

  it("clicking the edit (pencil) button opens the annotation editor", () => {
    const { api } = renderStart(baseProps({}, true));
    fireEvent.click(screen.getByLabelText("Edit flag color"), { clientX: 5, clientY: 6 });
    expect(api.getState().editingAnnotation).toEqual({ id: "s1", anchor: { x: 5, y: 6 } });
  });

  it("clicking the target chip opens StartTargetPicker with the available components", () => {
    renderStart(baseProps(), [clientNode]);
    expect(screen.queryByPlaceholderText("Find a component…")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Set target…"));
    expect(screen.getByPlaceholderText("Find a component…")).toBeInTheDocument();
    expect(screen.getByText("Client")).toBeInTheDocument();
  });

  it("picking a target from StartTargetPicker sets targetId via the store and closes the picker", () => {
    const { api } = renderStart(baseProps(), [clientNode]);
    fireEvent.click(screen.getByText("Set target…"));
    fireEvent.click(screen.getByText("Client"));

    const node = api.getState().nodes.find((n) => n.id === "s1");
    expect(node?.type === "start" && node.data.targetId).toBe("n1");
    expect(screen.queryByPlaceholderText("Find a component…")).not.toBeInTheDocument();
  });

  it("falls back to DEFAULT_FLAG_COLOR for the selected-state border color when no color is set", () => {
    // jsdom normalizes a parsed hex color to rgb(...) on read — see the
    // identical note in CommentNode.test.tsx.
    const n = parseInt(DEFAULT_FLAG_COLOR.slice(1), 16);
    const expectedRgb = `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
    const { container } = renderStart(baseProps({}, true));
    const el = container.querySelector(".relative.w-\\[180px\\]") as HTMLElement;
    expect(el.style.borderColor).toContain(expectedRgb);
  });
});
