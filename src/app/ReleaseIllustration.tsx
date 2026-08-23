import {
  BlueprintGlow,
  DimensionLine,
  GroundPlane,
  IsoBlock,
  RegistrationMarks,
  diamond,
  isoRise,
} from "@/learning-path/blueprint-geometry";

/**
 * The release dialog's drawing: the release line, as blocks standing on the
 * ground plane.
 *
 * Each shipped release is a block, deeper than the one before it - the product
 * accumulating, which is the only thing a changelog ever says. The current
 * release is the marked block (subdivided, with a footprint diamond under it);
 * past it the blocks go dashed - the releases not written yet.
 *
 * Built on `blueprint-geometry`, the same isometric projection About, the two
 * course illustrations and Home's announcement object use, so this reads as
 * another sheet from the same drawing set. An earlier pass drew this flat: a
 * 2D line of nodes with a "notes sheet" of grey bars beside it. Two things
 * killed it - it was one of only two illustrations in the app off the shared
 * projection, and in light theme the bars read as a loading skeleton.
 *
 * One drawing for every release. An even earlier pass gave each version its
 * own motif, which meant every future release owed a bespoke drawing before
 * it could ship - a cost that grows forever for something read once.
 *
 * Every value is `currentColor` at some opacity so it follows the theme, and
 * `aria-hidden` - the heading beside it carries the meaning.
 */

/* 480x200 is 2.4:1, matching the slot the dialog gives this (a clamp between
 * 260x112 and 430x178), so `meet` fits it edge to edge instead of
 * letterboxing it into the middle of its container. */
const VIEW = { w: 480, h: 200 };

/** The ground plane every block stands on, and the shared block footprint. */
const BASE_Y = 134;
const HW = 25;

/** Shipped releases, oldest first. Evenly spaced: this is a sequence, not a
 *  time axis, and uneven gaps would imply a cadence the dates don't have.
 *  Depth grows by a fixed step - the accumulation, not a measurement. */
const SHIPPED = [
  { cx: 72, depth: 12 },
  { cx: 130, depth: 18 },
  { cx: 188, depth: 24 },
  { cx: 246, depth: 30 },
];

/** The release the dialog is showing. */
const CURRENT = { cx: 304, depth: 40 };

/** Releases still to come - same rhythm and volume, drawn as ghosts. */
const PLANNED = [
  { cx: 362, depth: 40 },
  { cx: 420, depth: 40 },
];

export function ReleaseIllustration({ className = "" }: { className?: string }) {
  const rise = isoRise(HW);

  return (
    <svg
      viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
      aria-hidden="true"
      data-illustration="release-line"
      className={`h-full w-full text-hero-accent ${className}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <BlueprintGlow id="release-line-glow" cx={230} cy={112} rx={215} ry={100} peak={0.13} />

      <GroundPlane id="release-line-ground" cx={240} cy={BASE_Y} rx={228} ry={74} opacity={0.14} />

      {/* Footprint under the current release - the drawing's one point of
          emphasis, and a drafting mark rather than a second colour. */}
      <path
        d={diamond(CURRENT.cx, BASE_Y, HW + 10, rise + 5)}
        fill="currentColor"
        fillOpacity="0.06"
        stroke="currentColor"
        strokeOpacity="0.34"
        strokeWidth="0.9"
        strokeDasharray="3 3"
      />

      {/* Ghosts carry no panel fill, so draw them first and let every solid
          block paint over whatever it overlaps. */}
      {PLANNED.map((b) => (
        <IsoBlock key={`planned-${b.cx}`} cx={b.cx} cy={BASE_Y} hw={HW} depth={b.depth} dim={0.9} ghost />
      ))}

      {SHIPPED.map((b) => (
        <IsoBlock key={`shipped-${b.cx}`} cx={b.cx} cy={BASE_Y} hw={HW} depth={b.depth} dim={0.72} />
      ))}

      <IsoBlock cx={CURRENT.cx} cy={BASE_Y} hw={HW} depth={CURRENT.depth} subdivide />

      {/* Dimension rule under what has shipped so far. No numeral: the slot
          clamps to 260px wide, where this sheet's 7px label would render at
          under 4px. */}
      <DimensionLine
        x1={SHIPPED[0].cx}
        y1={BASE_Y + rise + 22}
        x2={CURRENT.cx}
        y2={BASE_Y + rise + 22}
      />

      <RegistrationMarks w={VIEW.w} h={VIEW.h} opacity={0.2} />
    </svg>
  );
}
