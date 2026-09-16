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
 *
 * **Orthogonal renderers only.** Same-side pairs are an instruction to
 * smoothstep, not a shape: they only bow outward because the step path is
 * built from the handle normals. Feed the same pair to a bezier and the two
 * control offsets collapse to zero (xyflow's `calculateControlOffset` is
 * driven by the gap *along* the handle's own axis, which is 0 when the two
 * cards are aligned), leaving a straight line ruled along the blocker's
 * border - and an edge that appears to leave one card's output side and
 * arrive at another's. The curved canvas uses `routeCurvedEdge` instead.
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
 * How far the cards blocking a run stick out either side of it, measured from
 * the run's own centre line. `plus` is right (vertical run) or down
 * (horizontal run); `minus` is the other way.
 *
 * A bare "blocked: true" was enough when routing around meant picking a
 * different port, but a curved detour has to know *how far* to bow to clear
 * what's in the way - a learner can resize a card, so the blocker is not
 * always one CARD_WIDTH wide.
 */
export type Overhang = { plus: number; minus: number };

/**
 * Whether a straight vertical run between two column-aligned cards would pass
 * through a third.
 *
 * Only asked about column-aligned pairs, so it checks the one corridor that
 * matters rather than being a general obstacle test: the band between the two
 * cards, as wide as the wider of them.
 */
export function verticalRunOverhang(
  source: Box,
  target: Box,
  others: Iterable<Box>,
): Overhang | null {
  const [upper, lower] = source.y <= target.y ? [source, target] : [target, source];
  const runTop = upper.y + upper.height;
  const runBottom = lower.y;
  if (runBottom <= runTop) return null; // overlapping or adjacent, no corridor
  const left = Math.min(source.x, target.x);
  const right = Math.max(source.x + source.width, target.x + target.width);
  const centerX = (source.x + source.width / 2 + (target.x + target.width / 2)) / 2;
  let hit = false;
  let plus = 0;
  let minus = 0;
  for (const o of others) {
    if (o === source || o === target) continue;
    if (o.x < right && o.x + o.width > left && o.y + o.height > runTop && o.y < runBottom) {
      hit = true;
      plus = Math.max(plus, o.x + o.width - centerX);
      minus = Math.max(minus, centerX - o.x);
    }
  }
  return hit ? { plus, minus } : null;
}

export function verticalRunBlocked(source: Box, target: Box, others: Iterable<Box>): boolean {
  return verticalRunOverhang(source, target, others) !== null;
}

/**
 * Whether a straight horizontal run between two row-aligned cards would pass
 * through a third. The mirror of `verticalRunBlocked`, and the reason it
 * exists: without it an edge skipping a tier - an app server reaching past the
 * cache to the database it sits in line with - is drawn straight through the
 * card it skipped, which reads as an edge joining cards it has nothing to do
 * with.
 */
export function horizontalRunOverhang(
  source: Box,
  target: Box,
  others: Iterable<Box>,
): Overhang | null {
  const [leftBox, rightBox] = source.x <= target.x ? [source, target] : [target, source];
  const runLeft = leftBox.x + leftBox.width;
  const runRight = rightBox.x;
  if (runRight <= runLeft) return null; // overlapping or adjacent, no corridor
  const top = Math.min(source.y, target.y);
  const bottom = Math.max(source.y + source.height, target.y + target.height);
  const centerY = (source.y + source.height / 2 + (target.y + target.height / 2)) / 2;
  let hit = false;
  let plus = 0;
  let minus = 0;
  for (const o of others) {
    if (o === source || o === target) continue;
    if (o.y < bottom && o.y + o.height > top && o.x + o.width > runLeft && o.x < runRight) {
      hit = true;
      plus = Math.max(plus, o.y + o.height - centerY);
      minus = Math.max(minus, centerY - o.y);
    }
  }
  return hit ? { plus, minus } : null;
}

export function horizontalRunBlocked(source: Box, target: Box, others: Iterable<Box>): boolean {
  return horizontalRunOverhang(source, target, others) !== null;
}

/**
 * The orthogonal router - `ReferenceGraphCanvas` (smoothstep) and nothing
 * else. Picks the axis, asks the right blocking question for it, and returns
 * the handle pair.
 *
 * The live canvas draws curves and calls `routeCurvedEdge` below. That is not
 * the drift this module was written to prevent - the two canvases still share
 * one answer to "what is in the way and how far out does it stick"
 * (`verticalRunOverhang`/`horizontalRunOverhang`) and one set of port ids.
 * They differ only where the renderers genuinely differ: a step path detours
 * by leaving from a different side, a curve detours by bending.
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
 * Whether an edge was attached by hand rather than left to the router.
 *
 * A learner's drag records the two ports it ran between and keeps them: any
 * port may join any port so long as the connection is legal, and which sides
 * those are is their call. Authored starter edges carry no handles at all, so
 * this is also, exactly, "should `routeCurvedEdge` have an opinion about this
 * edge" - see Canvas.tsx, and `autoRouteEdge` in store.tsx for the way back.
 *
 * Both ends or neither: a half-attached edge has no meaning and is safer
 * routed than left with one port guessed.
 */
export function isHandPlaced(edge: {
  sourceHandle?: string | null;
  targetHandle?: string | null;
}): boolean {
  return edge.sourceHandle != null && edge.targetHandle != null;
}

/**
 * The curved canvas's router: a directional handle pair plus, when the run
 * needs to dodge something, a sideways bow for the path to follow.
 *
 * `routeEdge` above expresses "go around" by putting *both* ends on the same
 * side of their cards. That is an orthogonal-renderer idiom and it does not
 * survive the translation to a bezier (see `pickEdgeHandles`): it degenerates
 * into a straight line grazing the card it was meant to avoid, and, because
 * both ends sit on the same side, it reads as an edge joining one card's
 * output to another's output. Which is not a thing.
 *
 * So the two concerns are separated here. The **handles** only ever say which
 * way the edge travels - right -> left, left -> right, bottom -> top,
 * top -> bottom, no exceptions - so an edge always leaves a trailing side and
 * arrives at a leading one whatever else is going on. The **bow** carries the
 * detour, as an offset vector the renderer applies to the middle of the path.
 * Nothing about the shape depends on a handle pair meaning something other
 * than direction.
 */
export type CurvedRoute = HandlePair & {
  /** Where the middle of the path sits relative to the straight run between
   * the two ports, in flow px. `null` for the overwhelming majority of edges,
   * which want the plain curve. */
  bow: { x: number; y: number } | null;
};

/** Clearance between a bow's apex and the card it is going around. Small
 * enough to read as one detour rather than a loop, big enough that the arc is
 * unambiguously outside the card at the two points it passes its corners. */
export const BOW_CLEARANCE = 32;

/** Apex offset for the backward half of a two-way pair with nothing actually
 * in the way - it is not avoiding a card, only its own twin, so it needs to
 * clear one stroke rather than one card. */
export const BOW_SEPARATION = 52;

/** A bow past this stops reading as a detour and starts reading as a second,
 * unrelated wire looping across the board. */
export const MAX_BOW = 220;

export function routeCurvedEdge(
  source: Box,
  target: Box,
  others: Iterable<Box>,
  ids: SideHandleIds = PORT_IDS,
  reciprocal = false,
): CurvedRoute {
  const { dx, dy } = centerDelta(source, target);
  const boxes = [...others];
  const rowRun = Math.abs(dx) > COLUMN_EPSILON;

  const handles: HandlePair = rowRun
    ? dx > 0
      ? { sourceHandle: ids.right, targetHandle: ids.left }
      : { sourceHandle: ids.left, targetHandle: ids.right }
    : dy >= 0
      ? { sourceHandle: ids.bottom, targetHandle: ids.top }
      : { sourceHandle: ids.top, targetHandle: ids.bottom };

  // Exactly one half of a two-way pair moves, same as routeEdge - the one
  // travelling backwards. Moving both would separate them just as well but
  // leaves no edge on the direct line, so a plain request/response pair would
  // read as two detours rather than a path and its answer.
  const backward = reciprocal && (rowRun ? dx < 0 : dy < 0);
  const overhang = rowRun
    ? horizontalRunOverhang(source, target, boxes)
    : verticalRunOverhang(source, target, boxes);

  const clearance = overhang
    ? Math.max(0, backward ? overhang.minus : overhang.plus) + BOW_CLEARANCE
    : backward
      ? BOW_SEPARATION
      : 0;
  if (clearance <= 0) return { ...handles, bow: null };

  const magnitude = Math.min(clearance, MAX_BOW);
  // Bows are absolute, not relative to the direction of travel: a vertical run
  // detours right, a horizontal one detours below, and the backward half of a
  // pair goes the other way. Deriving the side from the source -> target
  // vector instead would flip it whenever the edge points up or left, so two
  // edges dodging the same card would dodge it on opposite sides.
  const signed = backward ? -magnitude : magnitude;
  return { ...handles, bow: rowRun ? { x: 0, y: signed } : { x: signed, y: 0 } };
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
