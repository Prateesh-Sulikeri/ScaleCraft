import type { ArchitectureGraph, XY } from "@/lib/graph";

/**
 * Reference diagrams get their own pitch, not card-geometry.ts's authored
 * PITCH_X/PITCH_Y (260 x 195). That pitch is sized for the *editable* canvas -
 * enough run to grab an edge, drop a mid-edge label and click a target. None
 * of that applies to a render nobody can touch, and the reference canvas lives
 * in the chapter sidebar, where every spare pixel costs zoom. 80px of
 * horizontal gap and 54px of vertical is plenty for a readable arrow.
 */
export const REF_PITCH_X = 200;
export const REF_PITCH_Y = 150;

/**
 * A chain this short or shorter stays one flat left-to-right row.
 *
 * Three, not four, and the number is measured rather than chosen. A flat row
 * of N stages is `(N - 1) * REF_PITCH_X + CARD_WIDTH` wide; the sidebar is
 * 320px by default (`SidebarShell`, drag-resizable 220-480), leaving the
 * diagram pane about 293px. Once the drawing needs less than
 * REFERENCE_MIN_ZOOM the view stops shrinking, so what has to fit is
 * `width * 0.55`: three stages is 520 -> 286px and fits, four is 720 -> 396px
 * and does not. At four, bb-3-1 and bb-3-4 rendered with the Client card (the
 * entry point, START badge and all) cut off the left edge and the final
 * database cut off the right.
 */
const MAX_FLAT_STAGES = 3;
/**
 * How tall a column may get before the next stage starts a new one.
 *
 * Counted in *rows*, not stages. Counting stages is the obvious version and
 * it silently overflows: a column of four stages is four rows only while
 * every stage holds one node, and one stage that fans out to three makes the
 * same column six rows tall. In a sidebar panel that is the difference
 * between a diagram that fits and one whose last card is cut off by the
 * frame.
 */
const MAX_ROWS_PER_COLUMN = 4;

/**
 * Turns an authored `referenceGraph` into an AWS-diagram-style left-to-right
 * layout, ignoring the graph's own hand-placed `position` fields entirely.
 * Those fields exist only because `GraphNode.position` is required by the
 * shared `ArchitectureGraph` type (also used for starterGraph, which *is*
 * hand-authored per D9) - for a referenceGraph they're vestigial once this
 * runs.
 *
 * Column = pipeline stage, computed as longest-path rank from the graph's
 * entryPointIds. Only "request-flow" edges are guaranteed acyclic (see
 * lib/graph.ts's EdgeKind comment), so ranking walks request-flow edges
 * first; a node only reachable through another edge kind (e.g. a Replica fed
 * solely by a "replication" edge) is ranked one column after the neighbor
 * that reaches it. A "request-flow" edge that runs the other way (e.g. a
 * Replica serving reads back to an App Server) ends up drawn right-to-left -
 * a real feedback path, not a layout bug, matching how a hand-drawn AWS
 * diagram curves a replication/read-back arrow against the main flow rather
 * than force the whole diagram to bend around it.
 *
 * Row = position within a column, siblings ordered by the average row of
 * their already-placed predecessors (a small barycenter pass - graphs here
 * top out around 10 nodes, so no need for a fuller crossing-minimization
 * algorithm), then centered so columns of different heights share one
 * vertical middle instead of all hanging from row 0.
 *
 * **Flow advances left to right; stages group top-down inside a column.**
 * Up to MAX_FLAT_STAGES the chain is one flat row. Past that, consecutive
 * stages stack into a vertical column until it reaches MAX_ROWS_PER_COLUMN,
 * and the next stage starts a column to its right - the shape of a published
 * cloud architecture diagram, and the same shape the authored starter graphs
 * use for their tier bands (CURRICULUM.md §11.5). It is what keeps a ten-node
 * design legible in a sidebar panel without the chain ever doubling back on
 * itself.
 *
 * An earlier version wrapped rows instead, which put a right-to-left jump in
 * the middle of a diagram whose entire job is to say "this, then this". A
 * column break has no such cost: the eye returns to the top of the next
 * column the way it does between columns of text.
 */
export function computeReferenceLayout(graph: ArchitectureGraph): Map<string, XY> {
  const nodeIds = graph.nodes.map((n) => n.id);
  if (nodeIds.length === 0) return new Map();

  const requestFlowOut = new Map<string, string[]>();
  const anyOut = new Map<string, string[]>();
  for (const id of nodeIds) {
    requestFlowOut.set(id, []);
    anyOut.set(id, []);
  }
  for (const e of graph.edges) {
    if (!anyOut.has(e.source) || !anyOut.has(e.target)) continue; // dangling edge, ignore
    anyOut.get(e.source)!.push(e.target);
    if (e.kind === "request-flow") requestFlowOut.get(e.source)!.push(e.target);
  }

  const rank = new Map<string, number>();
  const roots = graph.entryPointIds.filter((id) => anyOut.has(id));
  const queue = roots.length > 0 ? roots : [nodeIds[0]];
  for (const id of queue) rank.set(id, 0);

  // Longest-path rank over request-flow edges only, via repeated relaxation
  // (BFS-order is enough here: acyclic by construction, small node counts).
  let changed = true;
  while (changed) {
    changed = false;
    for (const [source, targets] of requestFlowOut) {
      const sourceRank = rank.get(source);
      if (sourceRank === undefined) continue;
      for (const target of targets) {
        const candidate = sourceRank + 1;
        if ((rank.get(target) ?? -1) < candidate) {
          rank.set(target, candidate);
          changed = true;
        }
      }
    }
  }

  // Anything not reached via request-flow (e.g. a Replica fed only by a
  // "replication" edge) gets ranked one column after whichever already-ranked
  // neighbor reaches it via any edge kind, repeated until stable.
  changed = true;
  while (rank.size < nodeIds.length && changed) {
    changed = false;
    for (const [source, targets] of anyOut) {
      const sourceRank = rank.get(source);
      if (sourceRank === undefined) continue;
      for (const target of targets) {
        if (!rank.has(target)) {
          rank.set(target, sourceRank + 1);
          changed = true;
        }
      }
    }
  }
  // Anything still unranked (disconnected from every entry point) falls back
  // to column 0 rather than being dropped.
  for (const id of nodeIds) if (!rank.has(id)) rank.set(id, 0);

  const byRank = new Map<number, string[]>();
  for (const id of nodeIds) {
    const r = rank.get(id)!;
    const bucket = byRank.get(r);
    if (bucket) bucket.push(id);
    else byRank.set(r, [id]);
  }

  const row = new Map<string, number>();
  const sortedRanks = [...byRank.keys()].sort((a, b) => a - b);
  for (const r of sortedRanks) {
    const ids = byRank.get(r)!;
    const withKey = ids.map((id, originalIndex) => {
      const preds = graph.edges
        .filter((e) => e.target === id && row.has(e.source))
        .map((e) => row.get(e.source)!);
      const key = preds.length > 0 ? preds.reduce((a, b) => a + b, 0) / preds.length : originalIndex;
      return { id, key };
    });
    withKey.sort((a, b) => a.key - b.key);
    withKey.forEach((entry, i) => row.set(entry.id, i));
  }

  const rowCountByRank = new Map<number, number>();
  for (const r of sortedRanks) rowCountByRank.set(r, byRank.get(r)!.length);

  // Consecutive stages group into one vertical column, and columns advance
  // left to right - the same shape the authored starter graphs use for their
  // tier bands (CURRICULUM.md §11.5). A reference graph carries no tier
  // labels to group by, so proximity in the pipeline stands in for them: a
  // run of RANKS_PER_COLUMN consecutive stages shares a column, reading top
  // down, and the next run starts a new column to its right.
  //
  // Short chains stay flat. Stacking a three-stage chain vertically would
  // turn the clearest possible diagram into a column for no reason.
  // Rows accumulate down a column: each stage starts below the last, and a
  // stage that fans out claims as many rows as it has branches. The column
  // breaks when the next stage would not fit, so a fan-out pushes itself into
  // a fresh column rather than running off the bottom of the panel.
  const flat = sortedRanks.length <= MAX_FLAT_STAGES;
  const columnByRank = new Map<number, number>();
  const rowOffsetByRank = new Map<number, number>();
  let column = 0;
  let cursor = 0;
  for (const r of sortedRanks) {
    const needed = rowCountByRank.get(r)!;
    if (cursor > 0 && (flat || cursor + needed > MAX_ROWS_PER_COLUMN)) {
      column += 1;
      cursor = 0;
    }
    columnByRank.set(r, column);
    rowOffsetByRank.set(r, cursor);
    cursor += needed;
  }

  // A break that drops the final stage back to row 0 draws the closing edge as
  // a long riser up the right-hand side and leaves the last thing in the
  // pipeline sitting at the top of the diagram - bb-3-2 ended with its database
  // above everything that feeds it. When the break leaves that stage alone in
  // the last column there is nothing below it to displace, so start it level
  // with the stage that feeds it and the closing edge becomes a short
  // horizontal. Clamped so an aligned stage still cannot push a column past
  // the row cap. In flat mode every stage already sits at row 0, so this is a
  // no-op there.
  const lastRank = sortedRanks[sortedRanks.length - 1];
  const feedingRank = sortedRanks[sortedRanks.length - 2];
  if (feedingRank !== undefined && columnByRank.get(lastRank)! > columnByRank.get(feedingRank)!) {
    const needed = rowCountByRank.get(lastRank)!;
    const aligned = Math.min(rowOffsetByRank.get(feedingRank)!, MAX_ROWS_PER_COLUMN - needed);
    if (aligned > 0) rowOffsetByRank.set(lastRank, aligned);
  }

  const positions = new Map<string, XY>();
  for (const id of nodeIds) {
    const r = rank.get(id)!;
    positions.set(id, {
      x: columnByRank.get(r)! * REF_PITCH_X,
      y: (rowOffsetByRank.get(r)! + row.get(id)!) * REF_PITCH_Y,
    });
  }
  return positions;
}
