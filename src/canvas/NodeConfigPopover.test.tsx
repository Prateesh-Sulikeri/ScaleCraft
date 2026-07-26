import { beforeAll, describe, expect, it } from "vitest";
import { act, fireEvent, screen } from "@testing-library/react";
import { NodeConfigPopover } from "./NodeConfigPopover";
import { renderWithCanvasStore, stubResizeObserver } from "./canvas-test-utils";
import type { ComponentNodeType } from "./types";

beforeAll(() => {
  stubResizeObserver();
});

const clientNode: ComponentNodeType = {
  id: "n1",
  type: "component",
  position: { x: 0, y: 0 },
  data: { componentId: "client", config: {} },
};

describe("NodeConfigPopover", () => {
  it("renders nothing when configPopover is null", () => {
    const { container } = renderWithCanvasStore(<NodeConfigPopover />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when the target node isn't a component (e.g. a zone)", () => {
    const { api, container } = renderWithCanvasStore(<NodeConfigPopover />);
    act(() => {
      api.getState().loadCanvasState(
        [{ id: "z1", type: "zone", position: { x: 0, y: 0 }, data: { label: "", width: 320, height: 220 } }],
        [],
      );
      api.getState().openConfigPopover("z1", { x: 0, y: 0 });
    });
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the component's label, instance name, and description fields, seeded from current data", () => {
    const { api } = renderWithCanvasStore(<NodeConfigPopover />);
    act(() => {
      api.getState().loadCanvasState([{ ...clientNode, data: { ...clientNode.data, name: "browser-tab" } }], []);
      api.getState().openConfigPopover("n1", { x: 10, y: 10 });
    });

    expect(screen.getByText("Client")).toBeInTheDocument();
    expect(screen.getByDisplayValue("browser-tab")).toBeInTheDocument();
  });

  it("seeds the description field from the definition's summary when data.description is unset", () => {
    const { api } = renderWithCanvasStore(<NodeConfigPopover />);
    act(() => {
      api.getState().loadCanvasState([clientNode], []);
      api.getState().openConfigPopover("n1", { x: 10, y: 10 });
    });
    expect(screen.getByDisplayValue("Issues requests into the system")).toBeInTheDocument();
  });

  it("editing the instance name field calls updateNodeName", () => {
    const { api } = renderWithCanvasStore(<NodeConfigPopover />);
    act(() => {
      api.getState().loadCanvasState([clientNode], []);
      api.getState().openConfigPopover("n1", { x: 10, y: 10 });
    });
    fireEvent.change(screen.getByPlaceholderText("e.g. client-1"), { target: { value: "browser-1" } });
    const node = api.getState().nodes.find((n) => n.id === "n1");
    expect(node?.type === "component" && node.data.name).toBe("browser-1");
  });

  it("editing the description field calls updateNodeDescription", () => {
    const { api } = renderWithCanvasStore(<NodeConfigPopover />);
    act(() => {
      api.getState().loadCanvasState([clientNode], []);
      api.getState().openConfigPopover("n1", { x: 10, y: 10 });
    });
    const textarea = screen.getByDisplayValue("Issues requests into the system");
    fireEvent.change(textarea, { target: { value: "Mobile client only" } });
    const node = api.getState().nodes.find((n) => n.id === "n1");
    expect(node?.type === "component" && node.data.description).toBe("Mobile client only");
  });

  it("clicking the Docs button opens the doc tab for this component", () => {
    const { api } = renderWithCanvasStore(<NodeConfigPopover />);
    act(() => {
      api.getState().loadCanvasState([clientNode], []);
      api.getState().openConfigPopover("n1", { x: 10, y: 10 });
    });
    fireEvent.click(screen.getByText("Docs"));
    expect(api.getState().docsPanel.tabs.map((t) => t.componentId)).toContain("client");
  });

  it("renders the ConfigForm body for the component's config schema (app-server: Instances field)", () => {
    const appServerNode: ComponentNodeType = {
      id: "n2",
      type: "component",
      position: { x: 0, y: 0 },
      data: { componentId: "app-server", config: { instances: 2 } },
    };
    const { api } = renderWithCanvasStore(<NodeConfigPopover />);
    act(() => {
      api.getState().loadCanvasState([appServerNode], []);
      api.getState().openConfigPopover("n2", { x: 10, y: 10 });
    });
    expect(screen.getByText("Instances")).toBeInTheDocument();
    expect(screen.getByRole("spinbutton")).toHaveValue(2);
  });
});
