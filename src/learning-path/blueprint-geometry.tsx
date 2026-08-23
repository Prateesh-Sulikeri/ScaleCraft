/**
 * The drawing primitives both course illustrations are built from.
 *
 * One isometric projection, 2:1 - a step along either ground axis is `+x,
 * +x/2`. Sharing it is what puts the cube and the system topology on the same
 * implied drawing rather than merely in the same style. Same projection Home's
 * announcement object uses (src/home/AlphaAnnouncement.tsx).
 */

/** Half-height of an isometric tile, given its half-width. */
export function isoRise(halfWidth: number): number {
  return halfWidth / 2;
}

/** A flat isometric diamond, given the centre of its face. */
export function diamond(cx: number, cy: number, w: number, h: number): string {
  return `M${cx} ${cy - h} L${cx + w} ${cy} L${cx} ${cy + h} L${cx - w} ${cy} Z`;
}

/** Screen position of a point on the ground plane, in grid steps from centre.
 *  `u` runs down-right, `v` runs down-left, so `(1, 1)` is straight down. */
export function isoPoint(
  cx: number,
  cy: number,
  u: number,
  v: number,
  step: number,
): { x: number; y: number } {
  return { x: cx + (u - v) * step, y: cy + (u + v) * isoRise(step) };
}

type GroundGridProps = {
  cx: number;
  cy: number;
  /** Distance between adjacent grid lines along one axis. */
  step?: number;
  /** How many lines per axis - odd, so one runs through the centre. */
  count?: number;
  /** How far each line runs, in steps. */
  span?: number;
  opacity?: number;
};

/**
 * The technical plane everything else stands on: two sets of parallel lines in
 * the isometric axes. Generated from `count`/`span` rather than hand-listed,
 * but with no randomness anywhere - the composition is identical on every
 * render, and in every screenshot.
 */
export function GroundGrid({ cx, cy, step = 26, count = 5, span = 3, opacity = 0.16 }: GroundGridProps) {
  const half = (count - 1) / 2;
  const offsets = Array.from({ length: count }, (_, i) => i - half);
  const rise = isoRise(step);

  return (
    <g stroke="currentColor" strokeWidth="1" fill="none" opacity={opacity}>
      {offsets.map((offset) => (
        <path
          key={`down-right-${offset}`}
          d={`M${cx + offset * step - span * step} ${cy + offset * rise + span * rise} L${cx + offset * step + span * step} ${cy + offset * rise - span * rise}`}
        />
      ))}
      {offsets.map((offset) => (
        <path
          key={`down-left-${offset}`}
          d={`M${cx + offset * step - span * step} ${cy - offset * rise - span * rise} L${cx + offset * step + span * step} ${cy - offset * rise + span * rise}`}
        />
      ))}
    </g>
  );
}

/**
 * A ground plane sized to a wide sheet: the isometric grid, faded out at its
 * edges by a radial mask so it never runs into the registration marks.
 *
 * `GroundGrid` alone draws full-length lines whose lozenge always overshoots a
 * 2.4:1 box; the mask is what turns it into a contained plate. `id` must be
 * unique per document - each illustration passes its own.
 */
export function GroundPlane({
  id,
  cx,
  cy,
  rx,
  ry,
  step = 29,
  count = 9,
  span = 8,
  opacity = 0.15,
}: {
  id: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  step?: number;
  count?: number;
  span?: number;
  opacity?: number;
}) {
  return (
    <>
      <defs>
        <radialGradient id={`${id}-fade`} cx="50%" cy="50%" r="50%">
          <stop offset="45%" stopColor="#fff" stopOpacity="1" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id={id}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${id}-fade)`} />
        </mask>
      </defs>
      <g mask={`url(#${id})`}>
        <GroundGrid cx={cx} cy={cy} step={step} count={count} span={span} opacity={opacity} />
      </g>
    </>
  );
}

/**
 * A wireframe block. `cy` is the centre of its *bottom* face, so a block sits
 * on a plate by sharing that point with it.
 *
 * `ghost` draws it as dashed edges only - the same volume, not built yet.
 * Solid blocks paint their own silhouette in `--panel` first, so they occlude
 * whatever is behind them; draw back-to-front (increasing `cy`).
 */
export function IsoBlock({
  cx,
  cy,
  hw,
  depth,
  dim = 1,
  subdivide = false,
  ghost = false,
}: {
  cx: number;
  cy: number;
  hw: number;
  depth: number;
  dim?: number;
  subdivide?: boolean;
  ghost?: boolean;
}) {
  const h = isoRise(hw);
  const topY = cy - depth;
  const top = diamond(cx, topY, hw, h);
  const left = `M${cx - hw} ${topY} L${cx} ${topY + h} L${cx} ${cy + h} L${cx - hw} ${cy} Z`;
  const right = `M${cx + hw} ${topY} L${cx} ${topY + h} L${cx} ${cy + h} L${cx + hw} ${cy} Z`;
  const silhouette = `M${cx - hw} ${topY} L${cx} ${topY + h} L${cx} ${cy + h} L${cx + hw} ${cy} L${cx + hw} ${topY}`;
  const cuts = [0.33, 0.66];

  if (ghost) {
    return (
      <g fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity={0.34 * dim} strokeDasharray="3 4">
        <path d={top} />
        <path d={silhouette} />
        <path d={`M${cx} ${topY + h} L${cx} ${cy + h}`} />
      </g>
    );
  }

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
        <path d={silhouette} strokeOpacity={0.55 * dim} />
        <path d={`M${cx} ${topY + h} L${cx} ${cy + h}`} strokeOpacity={0.4 * dim} />
      </g>
    </g>
  );
}

/** A flanking-tick dimension line between two points, with an optional tiny
 *  numeral - the drafting motif, not a real measurement. */
export function DimensionLine({
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

/** The four corner ticks that make a drawing read as a sheet. */
export function RegistrationMarks({
  w,
  h,
  inset = 14,
  arm = 12,
  opacity = 0.22,
}: {
  w: number;
  h: number;
  inset?: number;
  arm?: number;
  opacity?: number;
}) {
  return (
    <g stroke="currentColor" strokeWidth="1" strokeOpacity={opacity} fill="none">
      <path d={`M${inset} ${inset + arm} L${inset} ${inset} L${inset + arm} ${inset}`} />
      <path d={`M${w - inset} ${inset + arm} L${w - inset} ${inset} L${w - inset - arm} ${inset}`} />
      <path d={`M${inset} ${h - inset - arm} L${inset} ${h - inset} L${inset + arm} ${h - inset}`} />
      <path d={`M${w - inset} ${h - inset - arm} L${w - inset} ${h - inset} L${w - inset - arm} ${h - inset}`} />
    </g>
  );
}

/** The one soft pool of light behind an illustration. `id` must be unique per
 *  document - each illustration passes its own. */
export function BlueprintGlow({
  id,
  cx,
  cy,
  rx,
  ry,
  peak = 0.16,
}: {
  id: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  peak?: number;
}) {
  return (
    <>
      <defs>
        <radialGradient id={id} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity={peak} />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${id})`} />
    </>
  );
}
