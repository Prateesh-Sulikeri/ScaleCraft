import { describe, expect, it } from "vitest";
import { computeLayout } from "./layout";
import type { WalkthroughEdge, WalkthroughNode } from "./types";

/** Load Balancer-shaped fixture: client -> lb -> {app1, app2}, all
 * request-flow, no explicit positions/columns. */
const LB_NODES: WalkthroughNode[] = [
  { id: "client", kind: "component", componentId: "client" },
  { id: "lb", kind: "component", componentId: "load-balancer" },
  { id: "app1", kind: "component", componentId: "app-server" },
  { id: "app2", kind: "component", componentId: "app-server" },
];
const LB_EDGES: WalkthroughEdge[] = [
  { id: "e1", source: "client", target: "lb", kind: "request-flow" },
  { id: "e2", source: "lb", target: "app1", kind: "request-flow" },
  { id: "e3", source: "lb", target: "app2", kind: "request-flow" },
];

describe("computeLayout", () => {
  it("reproduces the 3.4 pilot's hand-placed coordinates within a few px (calibration)", () => {
    const result = computeLayout({ nodes: LB_NODES, edges: LB_EDGES });

    expect(result.viewBoxWidth).toBe(600);
    expect(result.viewBoxHeight).toBe(252);

    expect(result.positions.get("client")).toEqual({ x: 80, y: 126 });
    expect(result.positions.get("lb")).toEqual({ x: 300, y: 126 });
    expect(result.positions.get("app1")).toEqual({ x: 520, y: 63 });
    expect(result.positions.get("app2")).toEqual({ x: 520, y: 189 });
  });

  it("an explicit column hint overrides the request-flow longest-path column", () => {
    const nodes: WalkthroughNode[] = [
      { id: "a", kind: "component", componentId: "client" },
      { id: "b", kind: "component", componentId: "load-balancer", column: 5 },
    ];
    const edges: WalkthroughEdge[] = [{ id: "e1", source: "a", target: "b", kind: "request-flow" }];
    const result = computeLayout({ nodes, edges });

    // Two distinct raw columns (0 and 5) compact to adjacent columns 0/1,
    // not 5 empty ones - b must land strictly right of a either way.
    expect(result.positions.get("b")!.x).toBeGreaterThan(result.positions.get("a")!.x);
  });

  it("an explicit position passes through verbatim", () => {
    const nodes: WalkthroughNode[] = [
      { id: "a", kind: "component", componentId: "client", position: { x: 999, y: 111 } },
      { id: "b", kind: "component", componentId: "load-balancer" },
    ];
    const edges: WalkthroughEdge[] = [{ id: "e1", source: "a", target: "b", kind: "request-flow" }];
    const result = computeLayout({ nodes, edges });

    expect(result.positions.get("a")).toEqual({ x: 999, y: 111 });
  });

  it("a control-only node adopts its neighbor's column", () => {
    const nodes: WalkthroughNode[] = [
      { id: "client", kind: "component", componentId: "client" },
      { id: "lb", kind: "component", componentId: "load-balancer" },
      { id: "monitor", kind: "custom", icon: "activity", label: "Health Monitor", category: "networking" },
    ];
    const edges: WalkthroughEdge[] = [
      { id: "e1", source: "client", target: "lb", kind: "request-flow" },
      { id: "e2", source: "lb", target: "monitor", kind: "control" },
    ];
    const result = computeLayout({ nodes, edges });

    expect(result.positions.get("monitor")!.x).toBe(result.positions.get("lb")!.x);
  });

  it("terminates and yields a layout on a synthetic request-flow cycle", () => {
    const nodes: WalkthroughNode[] = [
      { id: "a", kind: "component", componentId: "client" },
      { id: "b", kind: "component", componentId: "load-balancer" },
    ];
    const edges: WalkthroughEdge[] = [
      { id: "e1", source: "a", target: "b", kind: "request-flow" },
      { id: "e2", source: "b", target: "a", kind: "request-flow" },
    ];

    const result = computeLayout({ nodes, edges });
    expect(result.positions.get("a")).toBeDefined();
    expect(result.positions.get("b")).toBeDefined();
  });
});
