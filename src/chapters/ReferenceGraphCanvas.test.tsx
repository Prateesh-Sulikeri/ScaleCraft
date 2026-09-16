import { beforeAll, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReferenceGraphCanvas, buildNodesAndEdges } from "./ReferenceGraphCanvas";
import { stubResizeObserver } from "@/canvas/canvas-test-utils";
import type { ArchitectureGraph } from "@/lib/graph";

beforeAll(() => {
  stubResizeObserver();
});

describe("ReferenceGraphCanvas", () => {
  it("renders each node's real card - label, category short code, and icon", () => {
    const graph: ArchitectureGraph = {
      nodes: [
        { id: "n1", componentId: "app-server", position: { x: 0, y: 0 }, config: {} },
        { id: "n2", componentId: "cache", position: { x: 260, y: 0 }, config: {} },
      ],
      edges: [{ id: "e1", source: "n1", target: "n2", kind: "request-flow" }],
      entryPointIds: [],
    };
    render(<ReferenceGraphCanvas graph={graph} />);
    expect(screen.getByText("Application Server")).toBeInTheDocument();
    expect(screen.getByText("Cache")).toBeInTheDocument();
    expect(screen.getByText("COMP")).toBeInTheDocument();
    expect(screen.getByText("CACHE")).toBeInTheDocument();
  });

  it("falls back to nothing rendered for a node whose component isn't in the registry (deleted custom component)", () => {
    const graph: ArchitectureGraph = {
      nodes: [{ id: "n1", componentId: "not-a-real-component", position: { x: 0, y: 0 }, config: {} }],
      edges: [],
      entryPointIds: [],
    };
    const { container } = render(<ReferenceGraphCanvas graph={graph} />);
    expect(container.querySelector(".react-flow__node")?.textContent).toBe("");
  });

  it("renders nodes as non-interactive - no drag, connect, or selection handles fire", () => {
    const graph: ArchitectureGraph = {
      nodes: [{ id: "n1", componentId: "client", position: { x: 0, y: 0 }, config: {} }],
      edges: [],
      entryPointIds: [],
    };
    const { container } = render(<ReferenceGraphCanvas graph={graph} />);
    const node = container.querySelector(".react-flow__node");
    expect(node).not.toHaveClass("selectable");
    expect(node).not.toHaveClass("draggable");
  });

  // jsdom never runs xyflow's ResizeObserver-driven node measurement, so an
  // unmeasured node never renders an actual <path> in a test environment -
  // the edge-building logic is asserted directly instead (see
  // buildNodesAndEdges's own doc comment).
  it("colors and dashes an edge by its kind, using the same tokens as the live canvas", () => {
    const graph: ArchitectureGraph = {
      nodes: [
        { id: "n1", componentId: "app-server", position: { x: 0, y: 0 }, config: {} },
        { id: "n2", componentId: "message-queue", position: { x: 260, y: 0 }, config: {} },
      ],
      edges: [{ id: "e1", source: "n1", target: "n2", kind: "async" }],
      entryPointIds: [],
    };
    const { edges } = buildNodesAndEdges(graph);
    expect(edges[0].style).toMatchObject({ stroke: "var(--edge-async)", strokeDasharray: "3 6" });
  });

  it("picks a horizontal handle pair for a left-to-right edge and a vertical pair for a top-to-bottom one", () => {
    // Positions are computed by reference-layout.ts, not read from the
    // authored `position` fields below (kept only because the type requires
    // them) - n1 is the sole entry point, n2/n3 both rank one column after
    // it (siblings, stacked vertically), so n1->n2 is the horizontal case
    // and n2->n3 (same column, different rows) is the vertical one.
    const graph: ArchitectureGraph = {
      nodes: [
        { id: "n1", componentId: "app-server", position: { x: 0, y: 0 }, config: {} },
        { id: "n2", componentId: "cache", position: { x: 0, y: 0 }, config: {} },
        { id: "n3", componentId: "sql-database", position: { x: 0, y: 0 }, config: {} },
      ],
      edges: [
        { id: "e-horizontal", source: "n1", target: "n2", kind: "request-flow" },
        { id: "e-branch", source: "n1", target: "n3", kind: "request-flow" },
        { id: "e-vertical", source: "n2", target: "n3", kind: "control" },
      ],
      entryPointIds: ["n1"],
    };
    const { edges } = buildNodesAndEdges(graph);
    const horizontal = edges.find((e) => e.id === "e-horizontal");
    const vertical = edges.find((e) => e.id === "e-vertical");
    expect(horizontal).toMatchObject({ sourceHandle: "port-right", targetHandle: "port-left" });
    expect(vertical).toMatchObject({ sourceHandle: "port-bottom", targetHandle: "port-top" });
  });

  it("routes a backward edge under the cards it passes, never through them", () => {
    // A replica serving reads back to an app server that sits to its left.
    // Handing that the horizontal *forward* pair made it exit the replica's
    // right side, cross the full width of the diagram and re-enter the app
    // server from the far left - a long diagonal.
    //
    // Sending it out of the bottom instead, which was the first fix, is just
    // as wrong whenever the target sits *above* the source: the path leaves
    // downward, doubles straight back over itself and arrives at a top handle
    // higher than where it started, so on screen one line lies on top of
    // another.
    //
    // A backward edge takes the horizontal pair (left out, right in) - but
    // only when the corridor between the two cards is empty. Here it is not:
    // this is a three-stage pipeline laid out in one row, so the database
    // stands squarely between the replica and the app server, and the clean
    // gutter run this test used to assert went straight through it. The edge
    // leaves and re-enters the *same* side instead, which is how smoothstep
    // is told to route around. The unobstructed case is pinned directly in
    // canvas/edge-routing.test.ts.
    const graph: ArchitectureGraph = {
      nodes: [
        { id: "app", componentId: "app-server", position: { x: 0, y: 0 }, config: {} },
        { id: "db", componentId: "sql-database", position: { x: 0, y: 0 }, config: {} },
        { id: "replica", componentId: "read-replica", position: { x: 0, y: 0 }, config: {} },
      ],
      edges: [
        { id: "e-app-db", source: "app", target: "db", kind: "request-flow" },
        { id: "e-db-replica", source: "db", target: "replica", kind: "replication" },
        { id: "e-replica-app", source: "replica", target: "app", kind: "request-flow" },
      ],
      entryPointIds: ["app"],
    };
    const { edges } = buildNodesAndEdges(graph);
    const readBack = edges.find((e) => e.id === "e-replica-app");
    expect(readBack).toMatchObject({ sourceHandle: "port-bottom", targetHandle: "port-bottom" });
    // The specific failure this guards: a straight left-to-right run that
    // crosses the database card sitting between the two endpoints.
    expect(readBack).not.toMatchObject({ sourceHandle: "port-left", targetHandle: "port-right" });
  });

  it("draws every edge orthogonally with a direction arrowhead in its own kind's color", () => {
    const graph: ArchitectureGraph = {
      nodes: [
        { id: "n1", componentId: "sql-database", position: { x: 0, y: 0 }, config: {} },
        { id: "n2", componentId: "read-replica", position: { x: 0, y: 0 }, config: {} },
      ],
      edges: [{ id: "e1", source: "n1", target: "n2", kind: "replication" }],
      entryPointIds: ["n1"],
    };
    const { edges } = buildNodesAndEdges(graph);
    expect(edges[0].type).toBe("smoothstep");
    expect(edges[0].markerEnd).toMatchObject({ color: "var(--edge-replication)" });
  });

  it("renders a Start badge for every entry point", () => {
    const graph: ArchitectureGraph = {
      nodes: [
        { id: "n1", componentId: "client", position: { x: 0, y: 0 }, config: {} },
        { id: "n2", componentId: "app-server", position: { x: 0, y: 0 }, config: {} },
      ],
      edges: [{ id: "e1", source: "n1", target: "n2", kind: "request-flow" }],
      entryPointIds: ["n1"],
    };
    const { nodes } = buildNodesAndEdges(graph);
    const badges = nodes.filter((n) => n.type === "referenceStart");
    expect(badges).toHaveLength(1);
    expect(badges[0].id).toBe("n1-start-badge");
  });
});
