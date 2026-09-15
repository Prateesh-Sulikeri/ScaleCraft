/**
 * Which sides of two cards an edge attaches to, given where they sit.
 *
 * Shared by the live canvas (Canvas.tsx) and the read-only reference diagram
 * (chapters/ReferenceGraphCanvas.tsx) so both draw the same architecture out of
 * the same graph.
 *
 * ## Why every port is a `source` handle
 *
 * A card used to carry four single-purpose handles - Left/Top receive,
 * Right/Bottom send - and that shape could not express half the edges a
 * learner can draw:
 *
 *   - An edge running *up* the canvas had nowhere to go. The only outgoing
 *     sides were Right and Bottom, so an edge to a card sitting above its
 *     source left the bottom, doubled straight back over itself and arrived at
 *     a top handle above where it started. On screen that is one line laid on
 *     top of another, which is why a dragged card could make an edge look like
 *     it joined two cards it had nothing to do with.
 *   - Dragging *from* a target handle silently reversed the edge: xyflow reads
 *     the grabbed handle's type to decide which end is the source, so pulling a
 *     wire out of a card's left side created an edge pointing *into* it.
 *   - A handle only rendered when the component declared inputs/outputs, so an
 *     authored edge into an input-less component resolved to no handle at all
 *     and xyflow dropped the edge without drawing anything.
 *
 * Under `connectionMode="loose"` (which the canvas already runs for the
 * forgiving-drop behaviour in card-geometry.ts) handle *type* no longer gates
 * connection - xyflow looks an edge's target up in `target.concat(source)`, and
 * scans both lists when hit-testing a drop. A `source` handle therefore works
 * as either end. An edge's *source*, though, is only ever looked up in
 * `handleBounds.source`, so a side with no source handle can never be left.
 *
 * So: one `source` handle per side, always rendered, explicitly id'd. Every
 * side can be entered and left, drag direction is always "from the card I
 * grabbed to the card I dropped on", and direction is enforced semantically by
 * connection-rules.ts rather than geometrically by which dot happened to exist.
 *
 * Explicit ids matter for a second reason: xyflow resolves a *null* handle id
 * to `handleBounds[0]`, which follows DOM order. Naming every port removes a
 * whole class of "why is this edge on the wrong side" bugs that only appear
 * once someone reorders the JSX.
 *
 * ## Attachment side is presentation, not data
 *
 * An edge means "A connects to B". Nothing in the domain graph or the
 * validation engine reads which side it touched, so this is recomputed from
 * live positions every render rather than persisted - edges re-route as a
 * learner drags a card around, and a stale handle id in an old save is simply
 * overwritten.
 */

export type SideHandleIds = {
  left: string;
  top: string;
  right: string;
  bottom: string;
};

/** One port per side. Both canvases render these same four ids. */
export const PORT_IDS: SideHandleIds = {
  left: "port-left",
  top: "port-top",
  right: "port-right",
  bottom: "port-bottom",
};

export type HandlePair = { sourceHandle: string; targetHandle: string };

export type RouteOptions = {
  /** A third card stands in the straight corridor between these two. */
  blocked?: boolean;
  /** The opposite edge (target -> source) also exists. Without this the two
   * halves of a two-way pair pick the same two ports in reverse order, which
   * is the *same line*: one is drawn exactly on top of the other, so the graph
   * shows one wire where the learner made two, and only the top one can be
   * clicked, inspected or deleted. */
  reciprocal?: boolean;
};

/**
 * Cards whose centres are within this many pixels horizontally count as
 * column-aligned, and connect vertically.
 *
 * Not `|dx| >= |dy|`, which is the obvious test and the wrong one: a fan-out
 * (one app server feeding a column of three databases in the next tier) has a
 * *vertical* offset larger than its horizontal one on the outer branches, so
 * the obvious test sent exactly those out of the card's bottom while the inner
 * branches left its right. Three edges, two different sides, no longer reading
 * as one fan. Any real horizontal offset wins instead.
 */
const COLUMN_EPSILON = 40;

/**
 * Which two ports an edge attaches to.
 *
 * Three shapes per axis, in priority order:
 *
 *  - **Detour** (`reciprocal`, and this is the half travelling backwards).
 *    Leaves and re-enters the side *opposite* the one a blocked run uses, so
 *    the two can never coincide either. A response path arcing back over the
 *    top of its request is the conventional way to draw a two-way pair.
 *  - **Around** (`blocked`). Leaves and re-enters the same side, which is how
 *    smoothstep is told to route around rather than straight through - a
 *    replication feed to a replica two rows down otherwise runs clean through
 *    whatever card sits between them, and a tier-skipping edge runs clean
 *    through the tier it skipped.
 *  - **Straight.** The shortest clean pair for the direction of travel.
 */
export function pickEdgeHandles(
  dx: number,
  dy: number,
  ids: SideHandleIds,
  { blocked = false, reciprocal = false }: RouteOptions = {},
): HandlePair {
  if (Math.abs(dx) > COLUMN_EPSILON) {
    if (reciprocal && dx < 0) return { sourceHandle: ids.top, targetHandle: ids.top };
    if (blocked) return { sourceHandle: ids.bottom, targetHandle: ids.bottom };
    return dx > 0
      ? { sourceHandle: ids.right, targetHandle: ids.left }
      : { sourceHandle: ids.left, targetHandle: ids.right };
  }
  if (reciprocal && dy < 0) return { sourceHandle: ids.left, targetHandle: ids.left };
  if (blocked) return { sourceHandle: ids.right, targetHandle: ids.right };
  return dy >= 0
    ? { sourceHandle: ids.bottom, targetHandle: ids.top }
    : { sourceHandle: ids.top, targetHandle: ids.bottom };
}

export type Box = { x: number; y: number; width: number; height: number };

/**
 * Whether a straight vertical run between two column-aligned cards would pass
 * through a third.
 *
 * Only asked about column-aligned pairs, so it checks the one corridor that
 * matters rather than being a general obstacle test: the band between the two
 * cards, as wide as the wider of them.
 */
export function verticalRunBlocked(source: Box, target: Box, others: Iterable<Box>): boolean {
  const [upper, lower] = source.y <= target.y ? [source, target] : [target, source];
  const runTop = upper.y + upper.height;
  const runBottom = lower.y;
  if (runBottom <= runTop) return false; // overlapping or adjacent, no corridor
  const left = Math.min(source.x, target.x);
  const right = Math.max(source.x + source.width, target.x + target.width);
  for (const o of others) {
    if (o === source || o === target) continue;
    if (o.x < right && o.x + o.width > left && o.y + o.height > runTop && o.y < runBottom) {
      return true;
    }
  }
  return false;
}

/**
 * Whether a straight horizontal run between two row-aligned cards would pass
 * through a third. The mirror of `verticalRunBlocked`, and the reason it
 * exists: without it an edge skipping a tier - an app server reaching past the
 * cache to the database it sits in line with - is drawn straight through the
 * card it skipped, which reads as an edge joining cards it has nothing to do
 * with.
 */
export function horizontalRunBlocked(source: Box, target: Box, others: Iterable<Box>): boolean {
  const [leftBox, rightBox] = source.x <= target.x ? [source, target] : [target, source];
  const runLeft = leftBox.x + leftBox.width;
  const runRight = rightBox.x;
  if (runRight <= runLeft) return false; // overlapping or adjacent, no corridor
  const top = Math.min(source.y, target.y);
  const bottom = Math.max(source.y + source.height, target.y + target.height);
  for (const o of others) {
    if (o === source || o === target) continue;
    if (o.y < bottom && o.y + o.height > top && o.x + o.width > runLeft && o.x < runRight) {
      return true;
    }
  }
  return false;
}

/**
 * The one entry point both canvases use: picks the axis, asks the right
 * blocking question for it, and returns the handle pair.
 *
 * Exists because the live canvas and the read-only reference diagram had
 * already drifted apart once, each answering "which side does this edge leave
 * from" differently. Routing lives here, in full, so there is nothing left to
 * drift.
 */
export function routeEdge(
  source: Box,
  target: Box,
  others: Iterable<Box>,
  ids: SideHandleIds = PORT_IDS,
  reciprocal = false,
): HandlePair {
  const { dx, dy } = centerDelta(source, target);
  const boxes = [...others];
  const blocked =
    Math.abs(dx) > COLUMN_EPSILON
      ? horizontalRunBlocked(source, target, boxes)
      : verticalRunBlocked(source, target, boxes);
  return pickEdgeHandles(dx, dy, ids, { blocked, reciprocal });
}

/**
 * The ids of every edge whose opposite number (target -> source) is also on
 * the board. Both halves are returned: `pickEdgeHandles` then detours whichever
 * of the two travels backwards, so exactly one of each pair moves.
 */
export function reciprocalEdgeIds<T extends { id: string; source: string; target: string }>(
  edges: readonly T[],
): Set<string> {
  const seen = new Set(edges.map((e) => `${e.source} ${e.target}`));
  const ids = new Set<string>();
  for (const e of edges) {
    if (seen.has(`${e.target} ${e.source}`)) ids.add(e.id);
  }
  return ids;
}

/** Centre-to-centre offset, so a card a learner resized doesn't skew the
 * choice the way comparing top-left corners would. */
export function centerDelta(
  source: { x: number; y: number; width: number; height: number },
  target: { x: number; y: number; width: number; height: number },
) {
  return {
    dx: target.x + target.width / 2 - (source.x + source.width / 2),
    dy: target.y + target.height / 2 - (source.y + source.height / 2),
  };
}

/** Corner radius on the orthogonal (`smoothstep`) path. Matches the card's
 * own `rounded-lg`, so a connector turns the same way a card's corner does. */
export const EDGE_CORNER_RADIUS = 10;

/** How far an edge runs straight out of its port before it may turn. */
export const EDGE_STUB = 18;

/**
 * Where, as a fraction of the gap between two cards, each edge makes its
 * turn - so a fan-out reads as separate branches.
 *
 * One app server feeding three databases stacked in the next tier sends three
 * edges out of the same port. A smoothstep edge turns at the midpoint of the
 * gap by default, so all three run down the *same* vertical line and the fan
 * looks like one thick stroke that mysteriously sprouts arrowheads.
 *
 * `pathOptions.offset` does not fix this - it only lengthens the straight stub
 * before the turn, and the turn still happens at the midpoint. `stepPosition`
 * moves the turn itself, which is the thing that needs to differ.
 *
 * Ordered by vertical distance, nearest first: the branch travelling furthest
 * turns last and so runs outermost, which keeps the channels nested instead of
 * crossing. A lone edge keeps the plain midpoint.
 */
const STEP_MIN = 0.32;
const STEP_MAX = 0.68;

export function fanOutStepPositions<T extends { id: string; source: string; sourceHandle?: string | null }>(
  edges: T[],
  deltaOf: (edge: T) => { dy: number } | null,
): Map<string, number> {
  const groups = new Map<string, T[]>();
  for (const edge of edges) {
    const key = `${edge.source}:${edge.sourceHandle ?? ""}`;
    const bucket = groups.get(key);
    if (bucket) bucket.push(edge);
    else groups.set(key, [edge]);
  }

  const steps = new Map<string, number>();
  for (const siblings of groups.values()) {
    if (siblings.length === 1) continue; // midpoint is right for a lone edge
    const span = (STEP_MAX - STEP_MIN) / (siblings.length - 1);
    [...siblings]
      .sort((a, b) => Math.abs(deltaOf(a)?.dy ?? 0) - Math.abs(deltaOf(b)?.dy ?? 0))
      .forEach((edge, i) => steps.set(edge.id, STEP_MIN + i * span));
  }
  return steps;
}
