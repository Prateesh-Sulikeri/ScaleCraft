import { beforeAll, describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { ReactFlowProvider } from "@xyflow/react";
import { render } from "@testing-library/react";
import { ReferenceComponentNode } from "./ReferenceComponentNode";
import { stubResizeObserver } from "@/canvas/canvas-test-utils";
import type { ReferenceComponentNodeType } from "./ReferenceComponentNode";

beforeAll(() => {
  stubResizeObserver();
});

function baseProps(componentId = "app-server"): ReferenceComponentNodeType & {
  selected: boolean;
  dragging: boolean;
  zIndex: number;
  selectable: boolean;
  deletable: boolean;
  draggable: boolean;
  isConnectable: boolean;
  positionAbsoluteX: number;
  positionAbsoluteY: number;
} {
  return {
    id: "n1",
    type: "referenceComponent",
    position: { x: 0, y: 0 },
    selected: false,
    dragging: false,
    zIndex: 0,
    selectable: false,
    deletable: false,
    draggable: false,
    isConnectable: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    data: { componentId, config: {} },
  };
}

describe("ReferenceComponentNode", () => {
  it("renders the same card anatomy as the live card - label and category short code", () => {
    render(
      <ReactFlowProvider>
        <ReferenceComponentNode {...baseProps()} />
      </ReactFlowProvider>,
    );
    expect(screen.getByText("Application Server")).toBeInTheDocument();
    expect(screen.getByText("COMP")).toBeInTheDocument();
  });

  it("renders no validation ring - a reference graph is authored to already be correct", () => {
    const { container } = render(
      <ReactFlowProvider>
        <ReferenceComponentNode {...baseProps()} />
      </ReactFlowProvider>,
    );
    expect(screen.queryByLabelText(/Valid|warning|error/i)).not.toBeInTheDocument();
    const card = container.firstChild as HTMLElement;
    expect(card.style.outline).toBe("");
  });

  it("renders every handle as unconnectable", () => {
    const { container } = render(
      <ReactFlowProvider>
        <ReferenceComponentNode {...baseProps()} />
      </ReactFlowProvider>,
    );
    const handles = [...container.querySelectorAll(".react-flow__handle")];
    expect(handles.length).toBeGreaterThan(0);
    for (const handle of handles) {
      expect(handle).not.toHaveClass("connectable");
    }
  });

  it("renders nothing for an unknown componentId", () => {
    const { container } = render(
      <ReactFlowProvider>
        <ReferenceComponentNode {...baseProps("does-not-exist")} />
      </ReactFlowProvider>,
    );
    expect(container.firstChild).toBeNull();
  });
});
