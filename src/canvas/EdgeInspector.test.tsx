import { describe, expect, it } from "vitest";
import { act, fireEvent, screen } from "@testing-library/react";
import { EdgeInspector } from "./EdgeInspector";
import { renderWithCanvasStore } from "./canvas-test-utils";
import type { ArchitectureEdgeType, ComponentNodeType } from "./types";

const nodes: ComponentNodeType[] = [
  { id: "n1", type: "component", position: { x: 0, y: 0 }, data: { componentId: "client", config: {} } },
  { id: "n2", type: "component", position: { x: 200, y: 0 }, data: { componentId: "app-server", config: {} } },
];

describe("EdgeInspector", () => {
  it("renders nothing when there's no selected edge", () => {
    const { container } = renderWithCanvasStore(<EdgeInspector />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when the selected edge id doesn't match any real edge", () => {
    const { container, api } = renderWithCanvasStore(<EdgeInspector />);
    act(() => {
      api.getState().loadCanvasState(nodes, []);
      api.getState().setSelectedEdgeId("does-not-exist");
    });
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the selected edge's kind (defaulting to request-flow) and its caption", () => {
    const edges: ArchitectureEdgeType[] = [{ id: "e1", source: "n1", target: "n2" }];
    const { api } = renderWithCanvasStore(<EdgeInspector />);
    act(() => {
      api.getState().loadCanvasState(nodes, edges);
      api.getState().setSelectedEdgeId("e1");
    });

    expect(screen.getByRole("combobox")).toHaveValue("request-flow");
    expect(screen.getByText(/only kind checked for cycles/i)).toBeInTheDocument();
  });

  it("reflects a non-default edge kind and its own caption", () => {
    const edges: ArchitectureEdgeType[] = [{ id: "e1", source: "n1", target: "n2", data: { kind: "async" } }];
    const { api } = renderWithCanvasStore(<EdgeInspector />);
    act(() => {
      api.getState().loadCanvasState(nodes, edges);
      api.getState().setSelectedEdgeId("e1");
    });

    expect(screen.getByRole("combobox")).toHaveValue("async");
    expect(screen.getByText(/queues, events, fire-and-forget/i)).toBeInTheDocument();
  });

  it("changing the select calls setEdgeKind with the new kind", () => {
    const edges: ArchitectureEdgeType[] = [{ id: "e1", source: "n1", target: "n2" }];
    const { api } = renderWithCanvasStore(<EdgeInspector />);
    act(() => {
      api.getState().loadCanvasState(nodes, edges);
      api.getState().setSelectedEdgeId("e1");
    });

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "control" } });
    const edge = api.getState().edges.find((e) => e.id === "e1");
    expect(edge?.data?.kind).toBe("control");
    expect(screen.getByText(/health check or heartbeat/i)).toBeInTheDocument();
  });

  it("lists every documented edge kind as an option", () => {
    const edges: ArchitectureEdgeType[] = [{ id: "e1", source: "n1", target: "n2" }];
    const { api } = renderWithCanvasStore(<EdgeInspector />);
    act(() => {
      api.getState().loadCanvasState(nodes, edges);
      api.getState().setSelectedEdgeId("e1");
    });

    for (const kind of ["request-flow", "control", "replication", "async"]) {
      expect(screen.getByRole("option", { name: kind })).toBeInTheDocument();
    }
  });
});
