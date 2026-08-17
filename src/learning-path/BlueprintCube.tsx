import { BlueprintGlow, GroundGrid, diamond, isoRise } from "./blueprint-geometry";

const CX = 120;
const TOP_Y = 74;
/** Half-width of the cube's top face; `H` is its matching isometric rise. */
const W = 50;
const H = isoRise(W);
const DEPTH = 50;

const BOTTOM_Y = TOP_Y + DEPTH;

/**
 * "Building Blocks" as one system primitive: a single wireframe cube on a
 * technical ground grid, with construction ticks and two dimension lines.
 *
 * Deliberately one block, not a stack or a cluster - Home's announcement card
 * already owns the assembled-cluster motif, and this page's subject is the unit
 * itself. Its Real World Extraction counterpart (BlueprintGlobe) is where such
 * a unit gets taken from: a panel lifted off a wireframe globe.
 *
 * Plain inline SVG, every value `currentColor` at some opacity, so it follows
 * both the theme and the course accent. Purely decorative, so `aria-hidden` -
 * the header's title and progress carry the meaning.
 */
export function BlueprintCube({ className = "" }: { className?: string }) {
  const topFace = diamond(CX, TOP_Y, W, H);
  const leftFace = `M${CX - W} ${TOP_Y} L${CX} ${TOP_Y + H} L${CX} ${BOTTOM_Y + H} L${CX - W} ${BOTTOM_Y} Z`;
  const rightFace = `M${CX + W} ${TOP_Y} L${CX} ${TOP_Y + H} L${CX} ${BOTTOM_Y + H} L${CX + W} ${BOTTOM_Y} Z`;

  return (
    <svg
      viewBox="0 0 240 190"
      aria-hidden="true"
      data-illustration="cube"
      className={`h-full w-full text-[var(--course-accent)] ${className}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Restrained: a soft pool behind the block, not a bloom on it. */}
      <BlueprintGlow id="blueprint-cube-glow" cx={CX} cy={TOP_Y + 34} rx={106} ry={66} />

      <GroundGrid cx={CX} cy={BOTTOM_Y + 22} />

      {/* The block's footprint, dashed - where it lands on the plane. */}
      <path
        d={diamond(CX, BOTTOM_Y - 2, W, H - 2)}
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="1"
        strokeDasharray="4 5"
      />

      {/* Faces differ slightly in opacity left-to-right so the form reads as a
       * solid even though every surface is see-through. */}
      <path d={topFace} fill="currentColor" fillOpacity="0.14" />
      <path d={leftFace} fill="currentColor" fillOpacity="0.06" />
      <path d={rightFace} fill="currentColor" fillOpacity="0.1" />

      {/* Hidden back edges, dashed and dim - a construction drawing shows the
       * volume it cannot see. */}
      <g stroke="currentColor" strokeWidth="1" fill="none" strokeOpacity="0.22" strokeDasharray="3 4">
        <path d={`M${CX} ${TOP_Y - H} L${CX} ${TOP_Y - H + DEPTH}`} />
        <path d={`M${CX - W} ${TOP_Y + DEPTH} L${CX} ${TOP_Y - H + DEPTH} L${CX + W} ${TOP_Y + DEPTH}`} />
      </g>

      {/* Visible edges. */}
      <g stroke="currentColor" strokeWidth="1.25" fill="none">
        <path d={topFace} strokeOpacity="0.85" />
        <path
          d={`M${CX - W} ${TOP_Y} L${CX - W} ${BOTTOM_Y} L${CX} ${BOTTOM_Y + H} L${CX + W} ${BOTTOM_Y} L${CX + W} ${TOP_Y}`}
          strokeOpacity="0.6"
        />
        <path d={`M${CX} ${TOP_Y + H} L${CX} ${BOTTOM_Y + H}`} strokeOpacity="0.45" />
      </g>

      {/* Vertex ticks - the small construction marks that make it read as a
       * drawing rather than a rendering. */}
      <g fill="currentColor" fillOpacity="0.6">
        {[
          [CX, TOP_Y - H],
          [CX - W, TOP_Y],
          [CX + W, TOP_Y],
          [CX, BOTTOM_Y + H],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" />
        ))}
      </g>

      {/* Dimension lines: height on the right, width along the bottom. Flanking
       * ticks, no numerals - the motif, not a fake measurement. */}
      <g stroke="currentColor" strokeWidth="1" fill="none" strokeOpacity="0.35">
        <path d={`M${CX + W + 14} ${TOP_Y + 4} L${CX + W + 14} ${BOTTOM_Y + 4}`} />
        <path d={`M${CX + W + 10} ${TOP_Y + 4} L${CX + W + 18} ${TOP_Y + 4}`} />
        <path d={`M${CX + W + 10} ${BOTTOM_Y + 4} L${CX + W + 18} ${BOTTOM_Y + 4}`} />

        <path d={`M${CX - W - 6} ${BOTTOM_Y + H + 14} L${CX - 6} ${BOTTOM_Y + H + 14 + H - 2}`} />
        <path d={`M${CX - W - 10} ${BOTTOM_Y + H + 10} L${CX - W - 2} ${BOTTOM_Y + H + 18}`} />
        <path d={`M${CX - 10} ${BOTTOM_Y + H + 10 + H - 2} L${CX - 2} ${BOTTOM_Y + H + 18 + H - 2}`} />
      </g>
    </svg>
  );
}
