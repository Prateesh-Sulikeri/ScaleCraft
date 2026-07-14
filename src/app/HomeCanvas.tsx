"use client";

import { ReactFlow, ReactFlowProvider, Background, type Node } from "@xyflow/react";
import { useTheme } from "next-themes";
import { useHasMounted } from "@/lib/use-has-mounted";
import { ModeNode } from "@/app/ModeNode";
import { HomeTitleNode, HOME_TITLE_NODE_WIDTH } from "@/app/HomeTitleNode";
import type { AppMode } from "@/lib/modes";

export type ModeNodeData = {
  mode: AppMode;
  /** Present only for modes with a real route today (just Sandbox) — its
   * absence is what makes a node render disabled instead of navigating
   * somewhere that 404s. */
  href?: string;
  /** Static placeholder; milestone 9 (persistence) is what makes this
   * reflect a user's real per-chapter state. Omitted for Sandbox — it's
   * freeform with no chapter to complete, so the vocabulary doesn't apply. */
  status?: "not started" | "in progress" | "complete";
};
export type ModeNodeType = Node<ModeNodeData, "mode">;
export type TitleNodeType = Node<Record<string, never>, "title">;

const nodeTypes = { mode: ModeNode, title: HomeTitleNode };

const MODE_NODE_WIDTH = 260;
const MODE_ROW = [
  { id: "sandbox" as const, x: 0 },
  { id: "building-blocks" as const, x: 320 },
  { id: "real-world-extraction" as const, x: 640 },
];
const MODE_ROW_CENTER_X = (MODE_ROW[MODE_ROW.length - 1].x + MODE_NODE_WIDTH) / 2;

// Static layout — three fixed slots, one per AppMode (src/lib/modes.ts), all
// on one baseline. fitView below handles responsive placement, so the exact
// spacing here only needs to keep the three from overlapping.
// `focusable: false` on every node: keyboard navigation goes through
// ModeNode's own inner <Link>/div instead of xyflow's own node-level
// tabIndex/role, so Tab reaches real, semantic elements (a real link for
// Sandbox; nothing at all for the two disabled nodes) rather than a
// generic, non-actionable "group" stop.
//
// The title node is part of THIS SAME array specifically so fitView's
// bounding box includes it — it and the mode row are one composition, not a
// separately-positioned HTML heading floating above whatever the canvas
// happens to fit. Centered on the mode row's own center (not the viewport's)
// so it stays visually paired with the row even as fitView's zoom/offset
// changes with viewport size.
const nodes: (ModeNodeType | TitleNodeType)[] = [
  {
    id: "title",
    type: "title",
    position: { x: MODE_ROW_CENTER_X - HOME_TITLE_NODE_WIDTH / 2, y: -200 },
    draggable: false,
    focusable: false,
    selectable: false,
    data: {},
  },
  ...MODE_ROW.map(
    ({ id, x }): ModeNodeType => ({
      id,
      type: "mode",
      position: { x, y: 0 },
      data:
        id === "sandbox"
          ? { mode: "sandbox", href: "/sandbox" }
          : { mode: id, status: "not started" },
      draggable: false,
      focusable: false,
    }),
  ),
];

/**
 * Home is the canvas, not a separate marketing layout — three mode "nodes"
 * on the same xyflow surface Sandbox itself uses (see src/canvas/Canvas.tsx),
 * so the very first screen already looks like the tool a user is about to
 * use, not a landing page bolted in front of it. Navigation is handled by a
 * real <Link> inside ModeNode itself (not an xyflow onNodeClick handler) —
 * that's what gives the Sandbox card native keyboard/focus semantics for
 * free instead of reimplementing them on top of a generic node click.
 *
 * The outer `h-full w-full` wrapper matters: xyflow needs a definite-size
 * ancestor to measure against (see src/canvas/Canvas.tsx's identical
 * wrapper) — without it `.react-flow`'s computed height collapses to 0 and
 * nothing renders, even though the node data itself is correct. That wrapper
 * deliberately does NOT also carry `flex-1` itself (confirmed live: it must
 * not) — combining an explicit `height: 100%` with `flex-grow` on the same
 * box breaks percentage-height resolution for `.react-flow`'s descendants
 * even though the box's own measured height still comes out correct. Same
 * two-level split as Canvas.tsx: the `flex-1` sizing lives one level up, on
 * page.tsx's wrapper around `<HomeCanvas />`, not here.
 */
export function HomeCanvas() {
  const { resolvedTheme } = useTheme();
  const mounted = useHasMounted();
  const colorMode = mounted && resolvedTheme === "light" ? "light" : "dark";

  return (
    <div className="relative h-full w-full">
      <ReactFlowProvider>
        <ReactFlow
          colorMode={colorMode}
          nodes={nodes}
          edges={[]}
          nodeTypes={nodeTypes}
          nodesConnectable={false}
          nodesDraggable={false}
          panOnScroll
          proOptions={{ hideAttribution: true }}
          fitView
          fitViewOptions={{ padding: 0.25, maxZoom: 1 }}
        >
          <Background />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}
