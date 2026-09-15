import { describe, expect, it } from "vitest";
import { computeReferenceLayout, REF_PITCH_X, REF_PITCH_Y } from "./reference-layout";
import { CARD_WIDTH } from "@/canvas/card-geometry";
import type { ArchitectureGraph } from "@/lib/graph";

// Every node below carries a throwaway `position` - reference-layout.ts never
// reads it, only the id/edge/entryPointIds shape.
const at = (x: number, y: number) => ({ x, y });

/** Column first, then row - the order a reader takes the diagram in. */
const readingOrder = (p: { x: number; y: number }) => p.x * 1000 + p.y;

describe("computeReferenceLayout", () => {
  it("ranks a straight pipeline strictly left to right", () => {
    const graph: ArchitectureGraph = {
      nodes: [
        { id: "client", componentId: "client", position: at(0, 0), config: {} },
        { id: "app", componentId: "app-server", position: at(0, 0), config: {} },
        { id: "db", componentId: "sql-database", position: at(0, 0), config: {} },
      ],
      edges: [
        { id: "e1", source: "client", target: "app", kind: "request-flow" },
        { id: "e2", source: "app", target: "db", kind: "request-flow" },
      ],
      entryPointIds: ["client"],
    };
    const positions = computeReferenceLayout(graph);
    expect(positions.get("client")!.x).toBeLessThan(positions.get("app")!.x);
    expect(positions.get("app")!.x).toBeLessThan(positions.get("db")!.x);
    // A straight chain has no siblings to stack, so every node shares one row.
    expect(positions.get("client")!.y).toBe(positions.get("app")!.y);
    expect(positions.get("app")!.y).toBe(positions.get("db")!.y);
  });

  it("stacks parallel siblings in the same column instead of a new row", () => {
    const graph: ArchitectureGraph = {
      nodes: [
        { id: "client", componentId: "client", position: at(0, 0), config: {} },
        { id: "lb", componentId: "load-balancer", position: at(0, 0), config: {} },
        { id: "app1", componentId: "app-server", position: at(0, 0), config: {} },
        { id: "app2", componentId: "app-server", position: at(0, 0), config: {} },
      ],
      edges: [
        { id: "e1", source: "client", target: "lb", kind: "request-flow" },
        { id: "e2", source: "lb", target: "app1", kind: "request-flow" },
        { id: "e3", source: "lb", target: "app2", kind: "request-flow" },
      ],
      entryPointIds: ["client"],
    };
    const positions = computeReferenceLayout(graph);
    expect(positions.get("app1")!.x).toBe(positions.get("app2")!.x);
    expect(positions.get("app1")!.y).not.toBe(positions.get("app2")!.y);
    expect(positions.get("lb")!.x).toBeLessThan(positions.get("app1")!.x);
  });

  it("ranks a node reachable only via a non-request-flow edge after the neighbor that reaches it", () => {
    // A Replica fed solely by a "replication" edge, per bb-3-12's real shape.
    const graph: ArchitectureGraph = {
      nodes: [
        { id: "client", componentId: "client", position: at(0, 0), config: {} },
        { id: "app", componentId: "app-server", position: at(0, 0), config: {} },
        { id: "db", componentId: "sql-database", position: at(0, 0), config: {} },
        { id: "replica", componentId: "read-replica", position: at(0, 0), config: {} },
      ],
      edges: [
        { id: "e1", source: "client", target: "app", kind: "request-flow" },
        { id: "e2", source: "app", target: "db", kind: "request-flow" },
        { id: "e3", source: "db", target: "replica", kind: "replication" },
        // The read-back path runs against the main flow's rank order - this
        // is the deliberate "back edge" case, not an ordering the algorithm
        // is expected to straighten out.
        { id: "e4", source: "replica", target: "app", kind: "request-flow" },
      ],
      entryPointIds: ["client"],
    };
    const positions = computeReferenceLayout(graph);
    // Later in reading order, which past MAX_FLAT_STAGES means "further down
    // the same column" rather than "further right" - a four-stage chain is no
    // longer flat (it does not fit the sidebar at the zoom floor). What the
    // rank has to guarantee is that the replica never lands *before* the
    // database that feeds it.
    expect(readingOrder(positions.get("replica")!)).toBeGreaterThan(
      readingOrder(positions.get("db")!),
    );
  });

  it("groups a long pipeline into vertical columns that advance left to right", () => {
    // Eight stages - the longest real chapter (bb-3-6 onward). Four per
    // column, so this is two columns of four, and nothing ever steps back to
    // the left the way a wrapped row would.
    const ids = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const graph: ArchitectureGraph = {
      nodes: ids.map((id) => ({ id, componentId: "app-server", position: at(0, 0), config: {} })),
      edges: ids.slice(1).map((id, i) => ({
        id: `e${i}`,
        source: ids[i],
        target: id,
        kind: "request-flow" as const,
      })),
      entryPointIds: ["a"],
    };
    const positions = computeReferenceLayout(graph);
    const xs = ids.map((id) => positions.get(id)!.x);
    const ys = ids.map((id) => positions.get(id)!.y);
    // First four stack down column 0, next four down column 1.
    expect(xs).toEqual([0, 0, 0, 0, REF_PITCH_X, REF_PITCH_X, REF_PITCH_X, REF_PITCH_X]);
    expect(ys.slice(0, 4)).toEqual([0, REF_PITCH_Y, REF_PITCH_Y * 2, REF_PITCH_Y * 3]);
    expect(ys.slice(4)).toEqual([0, REF_PITCH_Y, REF_PITCH_Y * 2, REF_PITCH_Y * 3]);
    // Every step forward is to the right or straight down, never back left.
    for (let i = 1; i < ids.length; i++) expect(xs[i]).toBeGreaterThanOrEqual(xs[i - 1]);
  });

  it("keeps a short chain flat rather than stacking it into a column", () => {
    const ids = ["a", "b", "c"];
    const graph: ArchitectureGraph = {
      nodes: ids.map((id) => ({ id, componentId: "app-server", position: at(0, 0), config: {} })),
      edges: ids.slice(1).map((id, i) => ({
        id: `e${i}`,
        source: ids[i],
        target: id,
        kind: "request-flow" as const,
      })),
      entryPointIds: ["a"],
    };
    const positions = computeReferenceLayout(graph);
    expect(ids.map((id) => positions.get(id)!.x)).toEqual(ids.map((_, i) => i * REF_PITCH_X));
    expect(new Set(ids.map((id) => positions.get(id)!.y)).size).toBe(1);
  });

  it("gives each branch of a fan-out its own row", () => {
    const graph: ArchitectureGraph = {
      nodes: ["lb", "a1", "a2", "a3"].map((id) => ({
        id,
        componentId: id === "lb" ? "load-balancer" : "app-server",
        position: at(0, 0),
        config: {},
      })),
      edges: ["a1", "a2", "a3"].map((id, i) => ({
        id: `e${i}`,
        source: "lb",
        target: id,
        kind: "request-flow" as const,
      })),
      entryPointIds: ["lb"],
    };
    const positions = computeReferenceLayout(graph);
    // The pool stacks in its own column, below where the balancer's own stage
    // ended - one row per branch, in a single vertical run.
    const appYs = ["a1", "a2", "a3"].map((id) => positions.get(id)!.y).sort((a, b) => a - b);
    expect(appYs).toEqual([0, REF_PITCH_Y, REF_PITCH_Y * 2]);
    expect(positions.get("lb")!.x).toBeLessThan(positions.get("a1")!.x);
  });

  // Columns break on accumulated rows, not on a stage count. Counting stages
  // let a column of four stages become six rows tall the moment one of them
  // fanned out, and the sidebar panel cut the last card off at the frame.
  it("never stacks a column taller than the row cap, even when a stage fans out", () => {
    const chain = ["n0", "n1", "n2", "n3", "n4", "n5"];
    const fan = ["f1", "f2", "f3"];
    const graph: ArchitectureGraph = {
      nodes: [...chain, ...fan].map((id) => ({
        id,
        componentId: "app-server",
        position: at(0, 0),
        config: {},
      })),
      edges: [
        ...chain.slice(1).map((id, i) => ({
          id: `c${i}`,
          source: chain[i],
          target: id,
          kind: "request-flow" as const,
        })),
        ...fan.map((id, i) => ({
          id: `f${i}`,
          source: chain[chain.length - 1],
          target: id,
          kind: "request-flow" as const,
        })),
      ],
      entryPointIds: ["n0"],
    };
    const positions = computeReferenceLayout(graph);
    const rowsPerColumn = new Map<number, number>();
    for (const p of positions.values()) {
      rowsPerColumn.set(p.x, (rowsPerColumn.get(p.x) ?? 0) + 1);
    }
    expect(Math.max(...rowsPerColumn.values())).toBeLessThanOrEqual(4);
    // And the fan still lands as one unbroken vertical run.
    const fanYs = fan.map((id) => positions.get(id)!.y).sort((a, b) => a - b);
    expect(new Set(fan.map((id) => positions.get(id)!.x)).size).toBe(1);
    expect(fanYs[2] - fanYs[0]).toBe(REF_PITCH_Y * 2);
  });

  // A flat row of four stages is 720px wide. The Debrief panel is ~293px at
  // the default 320px sidebar, and below REFERENCE_MIN_ZOOM (0.55) the view
  // stops shrinking, so 720 * 0.55 = 396px overflowed the frame and the fit
  // cut the entry card off the left and the last card off the right. Three
  // stages is 520 -> 286px and fits, so four has to stack.
  it("stacks a four-stage chain instead of leaving it flat, so it fits the sidebar", () => {
    const ids = ["a", "b", "c", "d"];
    const graph: ArchitectureGraph = {
      nodes: ids.map((id) => ({ id, componentId: "app-server", position: at(0, 0), config: {} })),
      edges: ids.slice(1).map((id, i) => ({
        id: `e${i}`,
        source: ids[i],
        target: id,
        kind: "request-flow" as const,
      })),
      entryPointIds: ["a"],
    };
    const positions = computeReferenceLayout(graph);
    const widest = Math.max(...ids.map((id) => positions.get(id)!.x)) + CARD_WIDTH;
    expect(widest).toBeLessThanOrEqual(REF_PITCH_X + CARD_WIDTH);
    expect(new Set(ids.map((id) => positions.get(id)!.y)).size).toBeGreaterThan(1);
  });

  // A break that drops the last stage back to row 0 draws the closing edge as
  // a long riser up the right-hand side and puts the end of the pipeline at
  // the top of the diagram. bb-3-2 shipped exactly that: its database sat
  // above everything that feeds it.
  it("starts a lone trailing column level with the stage that feeds it, not back at row 0", () => {
    const ids = ["a", "b", "c", "d", "e"];
    const graph: ArchitectureGraph = {
      nodes: ids.map((id) => ({ id, componentId: "app-server", position: at(0, 0), config: {} })),
      edges: ids.slice(1).map((id, i) => ({
        id: `e${i}`,
        source: ids[i],
        target: id,
        kind: "request-flow" as const,
      })),
      entryPointIds: ["a"],
    };
    const positions = computeReferenceLayout(graph);
    // Four stages fill column 0; the fifth starts column 1 level with the
    // fourth, so the closing edge is a short horizontal.
    expect(positions.get("e")!.x).toBe(REF_PITCH_X);
    expect(positions.get("e")!.y).toBe(positions.get("d")!.y);
  });

  it("is stable and non-throwing on an empty graph", () => {
    expect(computeReferenceLayout({ nodes: [], edges: [], entryPointIds: [] }).size).toBe(0);
  });
});
