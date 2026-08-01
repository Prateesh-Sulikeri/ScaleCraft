import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReadOnlyGraphSummary } from "./ReadOnlyGraphSummary";
import type { ArchitectureGraph } from "@/lib/graph";

describe("ReadOnlyGraphSummary", () => {
  it("lists node labels when the graph has no edges", () => {
    const graph: ArchitectureGraph = {
      nodes: [
        { id: "n1", componentId: "client", position: { x: 0, y: 0 }, config: {} },
        { id: "n2", componentId: "cache", position: { x: 0, y: 0 }, config: {} },
      ],
      edges: [],
      entryPointIds: ["n1"],
    };
    render(<ReadOnlyGraphSummary graph={graph} />);
    expect(screen.getByText("Client")).toBeInTheDocument();
    expect(screen.getByText("Cache")).toBeInTheDocument();
  });

  it("renders source and target labels per edge, with a sr-only edge-kind description", () => {
    const graph: ArchitectureGraph = {
      nodes: [
        { id: "n1", componentId: "app-server", position: { x: 0, y: 0 }, config: {} },
        { id: "n2", componentId: "message-queue", position: { x: 100, y: 0 }, config: {} },
      ],
      edges: [{ id: "e1", source: "n1", target: "n2", kind: "async" }],
      entryPointIds: ["n1"],
    };
    render(<ReadOnlyGraphSummary graph={graph} />);

    expect(screen.getByText("Application Server")).toBeInTheDocument();
    expect(screen.getByText("Message Queue")).toBeInTheDocument();
    expect(screen.getByText(/asynchronous messaging/i)).toBeInTheDocument();
  });

  it("falls back to the raw componentId when a node's component isn't in the registry", () => {
    const graph: ArchitectureGraph = {
      nodes: [{ id: "n1", componentId: "not-a-real-component", position: { x: 0, y: 0 }, config: {} }],
      edges: [],
      entryPointIds: ["n1"],
    };
    render(<ReadOnlyGraphSummary graph={graph} />);
    expect(screen.getByText("not-a-real-component")).toBeInTheDocument();
  });
});
