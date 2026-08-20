import { BlueprintGlow, diamond, isoRise } from "@/learning-path/blueprint-geometry";

/**
 * The About dialog's blueprint drawing: one large system primitive on a
 * gridded ground plate, with the infrastructure it stands for arranged around
 * it - a data store, a service unit, two satellite blocks - and drafting
 * marks (dimension lines, leaders, registration ticks) tying them together.
 *
 * Built on `blueprint-geometry`'s shared 2:1 isometric projection, the same
 * one the Learning Path illustrations and Home's announcement object use, so
 * this reads as another sheet from the same drawing set rather than a new
 * visual system. Deliberately its own composition, not a reuse of Home's cube
 * artwork.
 *
 * Plain inline SVG, every value `currentColor` at some opacity so it follows
 * the theme, and `aria-hidden` - the headline beside it carries the meaning.
 */

/** Ground plate: a diamond of grid lines in the two isometric axes. Drawn from
 *  the plate's own corners so lines always terminate exactly on its edges. */
function GridPlate({ cx, cy, hw, divisions = 8 }: { cx: number; cy: number; hw: number; divisions?: number }) {
  const hh = isoRise(hw);
  const steps = Array.from({ length: divisions - 1 }, (_, i) => (i + 1) / divisions);

  return (
    <g fill="none" stroke="currentColor" strokeWidth="1">
      <path d={diamond(cx, cy, hw, hh)} fill="currentColor" fillOpacity="0.04" strokeOpacity="0.28" />
      <g strokeOpacity="0.13">
        {steps.map((s) => (
          <path key={`u-${s}`} d={`M${cx - hw + s * hw} ${cy + s * hh} L${cx + s * hw} ${cy - hh + s * hh}`} />
        ))}
        {steps.map((s) => (
          <path key={`v-${s}`} d={`M${cx - hw + s * hw} ${cy - s * hh} L${cx + s * hw} ${cy + hh - s * hh}`} />
        ))}
      </g>
    </g>
  );
}

type Block = { cx: number; cy: number; hw: number; depth: number };

/** A wireframe block. `cy` is the centre of its *bottom* face, so a block sits
 *  on the plate by sharing that point with it. */
function Block({ cx, cy, hw, depth, dim = 1, subdivide = false }: Block & { dim?: number; subdivide?: boolean }) {
  const h = isoRise(hw);
  const topY = cy - depth;
  const top = diamond(cx, topY, hw, h);
  const left = `M${cx - hw} ${topY} L${cx} ${topY + h} L${cx} ${cy + h} L${cx - hw} ${cy} Z`;
  const right = `M${cx + hw} ${topY} L${cx} ${topY + h} L${cx} ${cy + h} L${cx + hw} ${cy} Z`;
  const cuts = [0.33, 0.66];

  return (
    <g>
      {/* Own silhouette in the panel colour first, so blocks occlude each
          other instead of showing their far edges through. */}
      <path d={`${top} ${left} ${right}`} fill="var(--panel)" />
      <path d={top} fill="currentColor" fillOpacity={0.15 * dim} />
      <path d={left} fill="currentColor" fillOpacity={0.05 * dim} />
      <path d={right} fill="currentColor" fillOpacity={0.09 * dim} />

      {subdivide && (
        <g fill="none" stroke="currentColor" strokeWidth="0.75" strokeOpacity={0.14 * dim}>
          {cuts.map((t) => (
            <path key={`top-u-${t}`} d={`M${cx - hw + t * hw} ${topY + t * h} L${cx + t * hw} ${topY - h + t * h}`} />
          ))}
          {cuts.map((t) => (
            <path key={`top-v-${t}`} d={`M${cx - hw + t * hw} ${topY - t * h} L${cx + t * hw} ${topY + h - t * h}`} />
          ))}
          {cuts.map((t) => (
            <path key={`face-${t}`} d={`M${cx - hw + t * hw} ${topY + t * h} L${cx - hw + t * hw} ${cy + t * h}`} />
          ))}
          {cuts.map((t) => (
            <path key={`face-r-${t}`} d={`M${cx + hw - t * hw} ${topY + t * h} L${cx + hw - t * hw} ${cy + t * h}`} />
          ))}
        </g>
      )}

      {/* Hidden back edges, dashed - a construction drawing shows the volume
          it cannot see. */}
      <g fill="none" stroke="currentColor" strokeWidth="0.9" strokeOpacity={0.2 * dim} strokeDasharray="3 4">
        <path d={`M${cx} ${topY - h} L${cx} ${cy - h}`} />
        <path d={`M${cx - hw} ${cy} L${cx} ${cy - h} L${cx + hw} ${cy}`} />
      </g>

      <g fill="none" stroke="currentColor" strokeWidth="1.15">
        <path d={top} strokeOpacity={0.8 * dim} />
        <path d={`M${cx - hw} ${topY} L${cx - hw} ${cy} L${cx} ${cy + h} L${cx + hw} ${cy} L${cx + hw} ${topY}`} strokeOpacity={0.55 * dim} />
        <path d={`M${cx} ${topY + h} L${cx} ${cy + h}`} strokeOpacity={0.4 * dim} />
      </g>
    </g>
  );
}

/** Data store - the one orthographic form in the drawing, because a stack of
 *  isometric slabs does not read as "database" the way a cylinder does. */
function StoreUnit({ cx, cy, rx = 26, height = 40 }: { cx: number; cy: number; rx?: number; height?: number }) {
  const ry = rx * 0.4;
  return (
    <g>
      <path
        d={`M${cx - rx} ${cy} L${cx - rx} ${cy + height} A${rx} ${ry} 0 0 0 ${cx + rx} ${cy + height} L${cx + rx} ${cy} Z`}
        fill="var(--panel)"
      />
      <path
        d={`M${cx - rx} ${cy} L${cx - rx} ${cy + height} A${rx} ${ry} 0 0 0 ${cx + rx} ${cy + height} L${cx + rx} ${cy} Z`}
        fill="currentColor"
        fillOpacity="0.08"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="1.15"
      />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="currentColor" fillOpacity="0.14" stroke="currentColor" strokeOpacity="0.8" strokeWidth="1.15" />
      <g fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="0.9">
        <path d={`M${cx - rx} ${cy + height * 0.42} A${rx} ${ry} 0 0 0 ${cx + rx} ${cy + height * 0.42}`} />
      </g>
    </g>
  );
}

/** Service unit - a low isometric chassis with four status lamps on its face,
 *  the drawing's stand-in for a running server. */
function ServiceUnit({ cx, cy, hw = 40 }: { cx: number; cy: number; hw?: number }) {
  const h = isoRise(hw);
  const depth = 16;
  const topY = cy - depth;
  const lamps = [0.24, 0.42, 0.6, 0.78];

  return (
    <g>
      <Block cx={cx} cy={cy} hw={hw} depth={depth} dim={0.9} />
      <g fill="currentColor" fillOpacity="0.55">
        {lamps.map((t) => (
          <circle key={t} cx={cx - hw + t * hw} cy={topY + t * h + depth * 0.55} r="2" />
        ))}
      </g>
    </g>
  );
}

/** A flanking-tick dimension line between two points, with an optional tiny
 *  numeral - the drafting motif, not a real measurement. */
function DimensionLine({
  x1,
  y1,
  x2,
  y2,
  label,
  labelDx = 0,
  labelDy = -4,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label?: string;
  labelDx?: number;
  labelDy?: number;
}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  // Tick marks run perpendicular to the line.
  const nx = (-dy / len) * 4;
  const ny = (dx / len) * 4;

  return (
    <g stroke="currentColor" strokeWidth="0.9" fill="none" strokeOpacity="0.32">
      <path d={`M${x1} ${y1} L${x2} ${y2}`} />
      <path d={`M${x1 - nx} ${y1 - ny} L${x1 + nx} ${y1 + ny}`} />
      <path d={`M${x2 - nx} ${y2 - ny} L${x2 + nx} ${y2 + ny}`} />
      {label && (
        <text
          x={(x1 + x2) / 2 + labelDx}
          y={(y1 + y2) / 2 + labelDy}
          textAnchor="middle"
          stroke="none"
          fill="currentColor"
          fillOpacity="0.4"
          fontSize="7"
          fontFamily="var(--font-jetbrains-mono, monospace)"
          letterSpacing="0.05em"
        >
          {label}
        </text>
      )}
    </g>
  );
}

const PLATE = { cx: 300, cy: 208, hw: 150 };
const MAIN = { cx: 300, cy: 208, hw: 60, depth: 68 };

export function AboutIllustration({ className = "" }: { className?: string }) {
  const mainTopY = MAIN.cy - MAIN.depth;
  const mainApexY = mainTopY - isoRise(MAIN.hw);
  const mainBaseY = MAIN.cy + isoRise(MAIN.hw);

  return (
    <svg
      viewBox="0 0 560 300"
      aria-hidden="true"
      data-illustration="about-blueprint"
      className={`h-full w-full text-hero-accent ${className}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <BlueprintGlow id="about-blueprint-glow" cx={300} cy={160} rx={240} ry={140} peak={0.13} />

      {/* Faint drafting grid behind everything, clipped to the drawing area. */}
      <g stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.07">
        {Array.from({ length: 15 }, (_, i) => (
          <path key={`h-${i}`} d={`M20 ${20 + i * 20} L540 ${20 + i * 20}`} />
        ))}
        {Array.from({ length: 27 }, (_, i) => (
          <path key={`v-${i}`} d={`M${20 + i * 20} 20 L${20 + i * 20} 300`} />
        ))}
      </g>

      <GridPlate cx={PLATE.cx} cy={PLATE.cy} hw={PLATE.hw} />

      {/* Leaders from the outlying units in to the plate - dotted, so each unit
          reads as placed on the same drawing rather than floating near it. */}
      <g stroke="currentColor" strokeWidth="0.9" strokeOpacity="0.22" strokeDasharray="2 4" fill="none">
        <path d={`M118 208 L${PLATE.cx - PLATE.hw + 20} ${PLATE.cy - 8}`} />
        <path d={`M186 262 L${PLATE.cx - 60} ${PLATE.cy + 34}`} />
        <path d={`M452 150 L${PLATE.cx + PLATE.hw - 30} ${PLATE.cy - 22}`} />
        <path d={`M470 232 L${PLATE.cx + PLATE.hw - 44} ${PLATE.cy + 18}`} />
      </g>

      <StoreUnit cx={92} cy={168} />
      <ServiceUnit cx={188} cy={268} />

      <Block {...MAIN} subdivide />

      <Block cx={462} cy={150} hw={26} depth={28} dim={0.85} />
      <Block cx={478} cy={238} hw={22} depth={24} dim={0.7} />

      {/* Vertex ticks on the main block. */}
      <g fill="currentColor" fillOpacity="0.6">
        {[
          [MAIN.cx, mainApexY],
          [MAIN.cx - MAIN.hw, mainTopY],
          [MAIN.cx + MAIN.hw, mainTopY],
          [MAIN.cx, mainBaseY],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="1.7" />
        ))}
      </g>

      {/* Dimension lines: the block's height on the right, its footprint along
          the bottom, and the plate's span up top. */}
      <DimensionLine x1={MAIN.cx + MAIN.hw + 22} y1={mainTopY + 6} x2={MAIN.cx + MAIN.hw + 22} y2={MAIN.cy + 6} label="68" labelDx={11} labelDy={3} />
      <DimensionLine x1={MAIN.cx - MAIN.hw - 6} y1={mainBaseY + 16} x2={MAIN.cx - 6} y2={mainBaseY + 16 + isoRise(MAIN.hw)} label="60" labelDx={-10} labelDy={8} />
      <DimensionLine x1={PLATE.cx - PLATE.hw + 8} y1={68} x2={PLATE.cx + PLATE.hw - 8} y2={68} label="1 : 1" labelDy={-5} />

      {/* Extension lines tying the top dimension down to what it measures. */}
      <g stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.18" strokeDasharray="3 4" fill="none">
        <path d={`M${PLATE.cx - PLATE.hw + 8} 74 L${PLATE.cx - PLATE.hw + 8} ${PLATE.cy - 6}`} />
        <path d={`M${PLATE.cx + PLATE.hw - 8} 74 L${PLATE.cx + PLATE.hw - 8} ${PLATE.cy - 6}`} />
      </g>

      {/* Registration marks - the drawing is a sheet, and a sheet has corners. */}
      <g stroke="currentColor" strokeWidth="1" strokeOpacity="0.25" fill="none">
        <path d="M24 40 L24 26 L38 26" />
        <path d="M536 40 L536 26 L522 26" />
        <path d="M24 262 L24 276 L38 276" />
        <path d="M536 262 L536 276 L522 276" />
      </g>
    </svg>
  );
}
