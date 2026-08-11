import { describe, expect, it } from "vitest";
import { normalizeWalkthrough, CAPTION_MAX_CHARS } from "./normalize";
import type { WalkthroughEdge, WalkthroughNode, WalkthroughProps } from "./types";

const CLIENT: WalkthroughNode = { id: "client", kind: "component", componentId: "client" };
const LB: WalkthroughNode = { id: "lb", kind: "component", componentId: "load-balancer" };
const E1: WalkthroughEdge = { id: "e1", source: "client", target: "lb", kind: "request-flow" };

function baseProps(overrides: Partial<WalkthroughProps> = {}): WalkthroughProps {
  return {
    nodes: [CLIENT, LB],
    edges: [E1],
    steps: [
      { caption: "Step one.", highlightNodeIds: ["client"], highlightEdgeIds: [] },
      { caption: "Step two.", highlightNodeIds: ["lb"], highlightEdgeIds: ["e1"] },
    ],
    ...overrides,
  };
}

describe("normalizeWalkthrough", () => {
  it("clean input yields zero issues and fully expanded steps", () => {
    const { resolved, issues } = normalizeWalkthrough(baseProps());
    expect(issues).toEqual([]);
    expect(resolved.steps).toHaveLength(2);
    expect(resolved.nodes.find((n) => n.id === "client")!.position).toBeDefined();
  });

  it("flags unknown-component", () => {
    const { issues } = normalizeWalkthrough(
      baseProps({ nodes: [{ id: "client", kind: "component", componentId: "not-a-real-component" }, LB] }),
    );
    expect(issues.some((i) => i.code === "unknown-component" && i.message.includes("not-a-real-component"))).toBe(true);
  });

  it("flags duplicate-node-id", () => {
    const { issues } = normalizeWalkthrough(baseProps({ nodes: [CLIENT, CLIENT] }));
    expect(issues.some((i) => i.code === "duplicate-node-id" && i.message.includes("client"))).toBe(true);
  });

  it("flags duplicate-edge-id", () => {
    const { issues } = normalizeWalkthrough(baseProps({ edges: [E1, E1] }));
    expect(issues.some((i) => i.code === "duplicate-edge-id" && i.message.includes("e1"))).toBe(true);
  });

  it("flags edge-endpoint-missing", () => {
    const { issues } = normalizeWalkthrough(
      baseProps({ edges: [{ id: "e1", source: "client", target: "ghost", kind: "request-flow" }] }),
    );
    expect(issues.some((i) => i.code === "edge-endpoint-missing" && i.message.includes("ghost"))).toBe(true);
  });

  it("flags highlight-node-missing", () => {
    const { issues } = normalizeWalkthrough(
      baseProps({ steps: [
        { caption: "One.", highlightNodeIds: ["ghost"], highlightEdgeIds: [] },
        { caption: "Two.", highlightNodeIds: [], highlightEdgeIds: [] },
      ] }),
    );
    expect(issues.some((i) => i.code === "highlight-node-missing" && i.message.includes("ghost"))).toBe(true);
  });

  it("flags highlight-edge-missing", () => {
    const { issues } = normalizeWalkthrough(
      baseProps({ steps: [
        { caption: "One.", highlightNodeIds: [], highlightEdgeIds: ["ghost-edge"] },
        { caption: "Two.", highlightNodeIds: [], highlightEdgeIds: [] },
      ] }),
    );
    expect(issues.some((i) => i.code === "highlight-edge-missing" && i.message.includes("ghost-edge"))).toBe(true);
  });

  it("flags focus-edge-missing", () => {
    const { issues } = normalizeWalkthrough(
      baseProps({ steps: [
        { caption: "One.", focus: "ghost-edge" },
        { caption: "Two.", highlightNodeIds: [], highlightEdgeIds: [] },
      ] }),
    );
    expect(issues.some((i) => i.code === "focus-edge-missing" && i.message.includes("ghost-edge"))).toBe(true);
  });

  it("flags variant-unknown-algorithm", () => {
    const { issues } = normalizeWalkthrough(
      baseProps({
        algorithms: [{ id: "round-robin", label: "Round Robin" }],
        steps: [
          {
            caption: "One.",
            highlightNodeIds: [],
            highlightEdgeIds: [],
            variants: { "least-connections": { caption: "Variant.", highlightNodeIds: [], highlightEdgeIds: [] } },
          },
          { caption: "Two.", highlightNodeIds: [], highlightEdgeIds: [] },
        ],
      }),
    );
    expect(issues.some((i) => i.code === "variant-unknown-algorithm" && i.message.includes("least-connections"))).toBe(true);
  });

  it("flags node-overlap", () => {
    const { issues } = normalizeWalkthrough(
      baseProps({
        nodes: [
          { ...CLIENT, position: { x: 100, y: 100 } },
          { ...LB, position: { x: 100, y: 100 } },
        ],
      }),
    );
    expect(issues.some((i) => i.code === "node-overlap")).toBe(true);
  });

  it("flags node-outside-viewbox", () => {
    const { issues } = normalizeWalkthrough(
      baseProps({
        nodes: [{ ...CLIENT, position: { x: -500, y: -500 } }, LB],
        viewBoxWidth: 600,
        viewBoxHeight: 250,
      }),
    );
    expect(issues.some((i) => i.code === "node-outside-viewbox" && i.message.includes("client"))).toBe(true);
  });

  it("flags caption-too-long", () => {
    const { issues } = normalizeWalkthrough(
      baseProps({ steps: [
        { caption: "x".repeat(CAPTION_MAX_CHARS + 1), highlightNodeIds: [], highlightEdgeIds: [] },
        { caption: "Two.", highlightNodeIds: [], highlightEdgeIds: [] },
      ] }),
    );
    expect(issues.some((i) => i.code === "caption-too-long")).toBe(true);
  });

  it("flags too-few-steps", () => {
    const { issues } = normalizeWalkthrough(baseProps({ steps: [{ caption: "Only one.", highlightNodeIds: [], highlightEdgeIds: [] }] }));
    expect(issues.some((i) => i.code === "too-few-steps")).toBe(true);
  });

  it("flags cycle", () => {
    const { issues } = normalizeWalkthrough(
      baseProps({
        edges: [
          { id: "e1", source: "client", target: "lb", kind: "request-flow" },
          { id: "e2", source: "lb", target: "client", kind: "request-flow" },
        ],
      }),
    );
    expect(issues.some((i) => i.code === "cycle")).toBe(true);
  });

  describe("focus expansion", () => {
    it("a single focus id expands to its edge plus both endpoints", () => {
      const { resolved } = normalizeWalkthrough(baseProps({ steps: [
        { caption: "One.", focus: "e1" },
        { caption: "Two.", highlightNodeIds: [], highlightEdgeIds: [] },
      ] }));
      expect(resolved.steps[0].highlightEdgeIds).toEqual(["e1"]);
      expect(new Set(resolved.steps[0].highlightNodeIds)).toEqual(new Set(["client", "lb"]));
    });

    it("an array of focus ids unions with explicit highlight arrays", () => {
      const extraEdge: WalkthroughEdge = { id: "e2", source: "lb", target: "client", kind: "control" };
      const { resolved } = normalizeWalkthrough(
        baseProps({
          edges: [E1, extraEdge],
          steps: [
            { caption: "One.", focus: ["e1", "e2"], highlightNodeIds: ["client"], highlightEdgeIds: [] },
            { caption: "Two.", highlightNodeIds: [], highlightEdgeIds: [] },
          ],
        }),
      );
      expect(new Set(resolved.steps[0].highlightEdgeIds)).toEqual(new Set(["e1", "e2"]));
      expect(new Set(resolved.steps[0].highlightNodeIds)).toEqual(new Set(["client", "lb"]));
    });

    it("variant focus expands independently of the base step", () => {
      const { resolved } = normalizeWalkthrough(
        baseProps({
          algorithms: [{ id: "round-robin", label: "Round Robin" }],
          steps: [
            {
              caption: "Base.",
              highlightNodeIds: [],
              highlightEdgeIds: [],
              variants: { "round-robin": { caption: "Variant.", focus: "e1" } },
            },
            { caption: "Two.", highlightNodeIds: [], highlightEdgeIds: [] },
          ],
        }),
      );
      expect(resolved.steps[0].highlightEdgeIds).toEqual([]);
      expect(resolved.steps[0].variants!["round-robin"].highlightEdgeIds).toEqual(["e1"]);
    });
  });

  describe("never throws", () => {
    it("empty nodes and steps", () => {
      expect(() => normalizeWalkthrough({ nodes: [], edges: [], steps: [] })).not.toThrow();
    });

    it("a self-loop edge", () => {
      expect(() =>
        normalizeWalkthrough(baseProps({ edges: [{ id: "e1", source: "client", target: "client", kind: "request-flow" }] })),
      ).not.toThrow();
    });

    it("garbage highlight ids everywhere", () => {
      expect(() =>
        normalizeWalkthrough(
          baseProps({
            steps: [
              { caption: "One.", highlightNodeIds: ["a", "b", "c"], highlightEdgeIds: ["x", "y"], focus: ["z"] },
              { caption: "Two.", highlightNodeIds: [], highlightEdgeIds: [] },
            ],
          }),
        ),
      ).not.toThrow();
    });
  });
});
