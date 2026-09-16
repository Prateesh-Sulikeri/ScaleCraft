"use client";

import { BaseEdge, getBezierPath, Position, type EdgeProps } from "@xyflow/react";
import { memo } from "react";
import type { ArchitectureEdgeType } from "./types";

/**
 * The canvas's one edge renderer: xyflow's own bezier, plus the ability to
 * bow the middle of the curve sideways.
 *
 * Bowing exists because a stock bezier cannot dodge anything. Its control
 * points are pushed straight out along each handle's own normal, so when two
 * cards are aligned - a primary and its replica two rows apart, with a third
 * database between - the curve is a straight line through whatever stands in
 * the way. The previous fix moved the *ports* instead (both ends onto the
 * cards' right side, an instruction smoothstep understands); on a bezier that
 * collapses to a straight line ruled along the blocker's border, and reads as
 * an edge wired output-to-output. See canvas/edge-routing.ts.
 *
 * So the detour lives in the path and the ports keep meaning direction.
 */

const NORMALS: Record<Position, { x: number; y: number }> = {
  [Position.Left]: { x: -1, y: 0 },
  [Position.Right]: { x: 1, y: 0 },
  [Position.Top]: { x: 0, y: -1 },
  [Position.Bottom]: { x: 0, y: 1 },
};

/** How far the curve runs straight out of a port before it starts turning,
 * as a fraction of the run, clamped. Matches the feel of xyflow's own
 * curvature without inheriting its zero-when-aligned behaviour. */
const STUB_RATIO = 0.25;
const STUB_MIN = 24;
const STUB_MAX = 110;

/**
 * A cubic whose own midpoint sits exactly `bow` off the straight run.
 *
 * The 4/3 is what makes that true rather than approximately true. A cubic's
 * midpoint is `(P0 + 3·C1 + 3·C2 + P3) / 8`, so offsetting both controls by
 * `b` moves the midpoint by `0.75·b`. Scaling by 4/3 cancels it, which is
 * what lets edge-routing.ts state a bow as plain clearance in px ("stay 32px
 * clear of that card") instead of a magic number tuned by eye.
 */
export function bowedEdgePath({
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  bow,
}: {
  sourceX: number;
  sourceY: number;
  sourcePosition: Position;
  targetX: number;
  targetY: number;
  targetPosition: Position;
  bow: { x: number; y: number };
}): string {
  const ns = NORMALS[sourcePosition];
  const nt = NORMALS[targetPosition];
  const span = Math.hypot(targetX - sourceX, targetY - sourceY);
  const stub = Math.min(STUB_MAX, Math.max(STUB_MIN, span * STUB_RATIO));
  const k = 4 / 3;
  const c1x = sourceX + ns.x * stub + bow.x * k;
  const c1y = sourceY + ns.y * stub + bow.y * k;
  const c2x = targetX + nt.x * stub + bow.x * k;
  const c2y = targetY + nt.y * stub + bow.y * k;
  return `M${sourceX},${sourceY} C${c1x},${c1y} ${c2x},${c2y} ${targetX},${targetY}`;
}

function ArchitectureEdgeImpl({
  id,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  data,
  style,
  markerEnd,
  interactionWidth,
}: EdgeProps<ArchitectureEdgeType>) {
  const bow = data?.bow;
  const path = bow
    ? bowedEdgePath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, bow })
    : getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition })[0];

  return (
    <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} interactionWidth={interactionWidth} />
  );
}

export const ArchitectureEdge = memo(ArchitectureEdgeImpl);
