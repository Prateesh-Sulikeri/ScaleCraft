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
 * The feedback dialog's drawing: what is built, and the next thing waiting to
 * be placed.
 *
 * A cluster of solid blocks on the left is what exists today. On the right a
 * ghost block hangs above its own dashed footprint, not set down yet, with one
 * leader running to it from the cluster. That is the dialog's own claim drawn
 * rather than restated - what you say here decides what gets built next.
 *
 * Built on `blueprint-geometry`, the same isometric projection About, the two
 * course illustrations and Home's announcement object use, so this reads as
 * another sheet from the same drawing set. It replaces a flat drawing of a
 * note and a paper plane: a stock support graphic, the only solid mass in an
 * otherwise linework app, and in light theme its rules read as a loading
 * skeleton.
 *
 * Every value is `currentColor` at some opacity so it follows the theme, and
 * `aria-hidden` - the headline beside it carries the meaning.
 */

/* 480x200 is 2.4:1, matching the slot the dialog gives this, so `meet` fits it
 * edge to edge instead of letterboxing it. */
const VIEW = { w: 480, h: 200 };

/** The ground plane. */
const BASE_Y = 138;

/** What is built. Listed back to front (increasing `cy`) - a solid block
 *  paints its own silhouette, so draw order is what makes them occlude. */
const BUILT = [
  { cx: 210, cy: 128, hw: 24, depth: 19, dim: 0.72 },
  { cx: 150, cy: 146, hw: 32, depth: 32, dim: 1 },
  { cx: 238, cy: 158, hw: 21, depth: 15, dim: 0.85 },
];

/** The next block: hovering, so it reads as not placed rather than merely
 *  unfinished. `HOVER` is how far above its footprint it sits. */
const NEXT = { cx: 360, hw: 30, depth: 28 };
const HOVER = 32;

export function FeedbackIllustration({ className = "" }: { className?: string }) {
  const nextBaseY = BASE_Y - HOVER;
  const nextRise = isoRise(NEXT.hw);

  return (
    <svg
      viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
      aria-hidden="true"
      data-illustration="feedback-next-block"
      className={`h-full w-full text-hero-accent ${className}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <BlueprintGlow id="feedback-next-glow" cx={250} cy={116} rx={215} ry={100} peak={0.13} />

      <GroundPlane id="feedback-next-ground" cx={240} cy={BASE_Y} rx={228} ry={74} opacity={0.14} />

      {/* Where the next block lands, and the drop from the block down to it. */}
      <path
        d={diamond(NEXT.cx, BASE_Y, NEXT.hw + 8, isoRise(NEXT.hw + 8))}
        fill="currentColor"
        fillOpacity="0.06"
        stroke="currentColor"
        strokeOpacity="0.34"
        strokeWidth="0.9"
        strokeDasharray="3 3"
      />
      <path
        d={`M${NEXT.cx} ${nextBaseY + nextRise} L${NEXT.cx} ${BASE_Y}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeOpacity="0.3"
        strokeDasharray="3 3"
      />

      {BUILT.map((b) => (
        <IsoBlock key={`built-${b.cx}`} cx={b.cx} cy={b.cy} hw={b.hw} depth={b.depth} dim={b.dim} />
      ))}

      <IsoBlock cx={NEXT.cx} cy={nextBaseY} hw={NEXT.hw} depth={NEXT.depth} dim={1.25} ghost />

      {/* The leader from what is built to what is next - drawn as a drafting
          leader rather than a wire or an arrow, which would make it a flow. */}
      <path
        d={`M152 97 C 214 56, 284 56, ${NEXT.cx - NEXT.hw + 4} ${nextBaseY - NEXT.depth + 6}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeOpacity="0.32"
        strokeDasharray="5 5"
        strokeLinecap="round"
      />

      {/* No numeral on the rule - at this dialog's smallest slot a 7px label
          renders at under 4px. */}
      <DimensionLine
        x1={118}
        y1={BASE_Y + 42}
        x2={NEXT.cx + NEXT.hw}
        y2={BASE_Y + 42}
      />

      <RegistrationMarks w={VIEW.w} h={VIEW.h} opacity={0.2} />
    </svg>
  );
}
