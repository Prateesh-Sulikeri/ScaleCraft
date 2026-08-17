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
