"use client";

import { LATEST_RELEASE } from "./release-info";
import { SeeWhatsNewButton } from "./SeeWhatsNewButton";

/** Isometric projection, 2:1 - one step right is `+w, +h` where `h = w / 2`.
 *  The cage and the blocks inside it share these proportions, which is what
 *  puts them on the same implied grid instead of near each other by accident. */
const CAGE_W = 94;
const CAGE_H = 47;
const CAGE_TOP_Y = 65;
const CAGE_DEPTH = 66;
const BLOCK_W = 22;
const BLOCK_DEPTH = 20;

/** A flat isometric diamond, given the centre of its face. */
function diamond(cx: number, cy: number, w: number, h: number): string {
  return `M${cx} ${cy - h} L${cx + w} ${cy} L${cx} ${cy + h} L${cx - w} ${cy} Z`;
}

/**
 * One wireframe block: three translucent faces plus its own outline, drawn
 * from the centre of its top face so callers place blocks on the cage's grid.
 * Faces differ slightly in opacity left-to-right so the form reads as a solid
 * even though every surface is see-through.
 */
function Block({ cx, cy, w, d }: { cx: number; cy: number; w: number; d: number }) {
  const h = w / 2;
  const top = diamond(cx, cy, w, h);
  const left = `M${cx - w} ${cy} L${cx} ${cy + h} L${cx} ${cy + h + d} L${cx - w} ${cy + d} Z`;
  const right = `M${cx + w} ${cy} L${cx} ${cy + h} L${cx} ${cy + h + d} L${cx + w} ${cy + d} Z`;
  // The block's whole outline, filled with the card's own background before
  // the translucent faces go on top. Without it, blocks that overlap on the
  // isometric grid show each other's edges straight through and the cluster
  // reads as a tangle of lines instead of four solids. Still translucent
  // overall - just opaque enough to occlude what is behind it.
  const silhouette = `M${cx} ${cy - h} L${cx + w} ${cy} L${cx + w} ${cy + d} L${cx} ${cy + h + d} L${cx - w} ${cy + d} L${cx - w} ${cy} Z`;

  return (
    <g>
      <path d={silhouette} fill="var(--panel)" fillOpacity="0.66" />
      <path d={top} fill="currentColor" fillOpacity="0.2" />
      <path d={left} fill="currentColor" fillOpacity="0.1" />
      <path d={right} fill="currentColor" fillOpacity="0.15" />
      <path d={top} fill="none" stroke="currentColor" strokeOpacity="0.75" strokeWidth="1" />
      <path
        d={`M${cx - w} ${cy} L${cx - w} ${cy + d} L${cx} ${cy + h + d} L${cx + w} ${cy + d} L${cx + w} ${cy}`}
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="1"
      />
      {/* The one interior edge an isometric view actually shows. */}
      <path
        d={`M${cx} ${cy + h} L${cx} ${cy + h + d}`}
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.4"
        strokeWidth="1"
      />
    </g>
  );
}

/** Ambient specks at hand-placed positions rather than random ones, so the
 *  composition is identical on every render (and in every screenshot). */
const PARTICLES: readonly { x: number; y: number; r: number; o: number }[] = [
  { x: 24, y: 34, r: 1.4, o: 0.5 },
  { x: 42, y: 18, r: 1, o: 0.3 },
  { x: 210, y: 40, r: 1.4, o: 0.45 },
  { x: 226, y: 74, r: 1, o: 0.28 },
  { x: 16, y: 96, r: 1, o: 0.32 },
  { x: 204, y: 158, r: 1.2, o: 0.35 },
  { x: 34, y: 168, r: 1, o: 0.25 },
  { x: 120, y: 12, r: 1, o: 0.3 },
  { x: 178, y: 20, r: 1.6, o: 0.22 },
  { x: 62, y: 186, r: 1.2, o: 0.2 },
];

/**
 * The announcement card's decorative object: translucent wireframe blocks held
 * inside an isometric bounding cage, over a dashed ground plate, with a few
 * ambient specks and one soft pool of glow behind. Plain inline SVG - no
 * illustration dependency - and every value is `currentColor` at some opacity,
 * so it follows the theme like everything else.
 *
 * `currentColor` is `--hero-accent`, the same blue as every UI element around
 * it - the object is that one hue at several low opacities, not a second
 * colour. A teal version was tried as a deliberately separate decorative
 * object and simply read as the hero not being blue.
 *
 * On hover the whole assembly responds: the cage and glow come up, and the top
 * block lifts off the stack. Hover is a real state change, which is what
 * exempts it from "nothing animates at rest" - the object is completely still
 * until pointed at, and holds still for anyone who prefers reduced motion.
 *
 * Purely decorative, so `aria-hidden` - the card's text carries the message.
 */
function GeometricObject() {
  const cageBottomY = CAGE_TOP_Y + CAGE_DEPTH;

  return (
    <svg
      viewBox="0 0 240 200"
      aria-hidden="true"
      className="h-full w-full text-hero-accent"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Restrained glow: a soft pool behind the cluster, not a bloom on it. */}
        <radialGradient id="hero-illustration-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.14" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse
        cx="120"
        cy="104"
        rx="104"
        ry="72"
        fill="url(#hero-illustration-glow)"
        className="opacity-70 transition-opacity duration-500 ease-out group-hover:opacity-100 motion-reduce:transition-none"
      />

      {/* Bounding cage - the technical volume the blocks are measured inside.
       * Its back vertical edge is dimmer than the three the viewer can see, so
       * the box reads as enclosing rather than flat. Grouped so hover raises
       * the whole frame's presence in one step instead of per-edge. */}
      <g className="opacity-75 transition-opacity duration-300 ease-out group-hover:opacity-100 motion-reduce:transition-none">
        <path d={diamond(120, CAGE_TOP_Y, CAGE_W, CAGE_H)} fill="currentColor" fillOpacity="0.04" />
        <path
          d={diamond(120, CAGE_TOP_Y, CAGE_W, CAGE_H)}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.3"
          strokeWidth="1"
        />
        <path
          d={`M${120 - CAGE_W} ${CAGE_TOP_Y} L${120 - CAGE_W} ${cageBottomY} M${120 + CAGE_W} ${CAGE_TOP_Y} L${120 + CAGE_W} ${cageBottomY} M120 ${CAGE_TOP_Y + CAGE_H} L120 ${cageBottomY + CAGE_H}`}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.28"
          strokeWidth="1"
        />
        <path
          d={`M120 ${CAGE_TOP_Y - CAGE_H} L120 ${cageBottomY - CAGE_H}`}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.12"
          strokeWidth="1"
        />
        <path
          d={`M${120 - CAGE_W} ${cageBottomY} L120 ${cageBottomY + CAGE_H} L${120 + CAGE_W} ${cageBottomY}`}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.3"
          strokeWidth="1"
        />

      </g>

      {/* Ground plate, dashed - echoes both the canvas plane the rest of the
       * app works on and the dimension-line motif on the mode cards. */}
      <path
        d={diamond(120, cageBottomY + 5, CAGE_W - 10, CAGE_H - 5)}
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.24"
        strokeWidth="1"
        strokeDasharray="4 5"
      />

      {/* A four-block stack, all of it touching - the top block used to float
       * clear of the cluster with a dashed connector across the gap, which just
       * read as a cube hovering for no reason. The two back blocks are a full
       * step apart, the front one sits at their midpoint one step forward, and
       * the fourth rests on that cell exactly one block-height up
       * (cy - BLOCK_DEPTH), so the stack lands on the isometric grid rather
       * than merely near it. Painted back-to-front, so occlusion is correct. */}
      <Block cx={100} cy={100} w={BLOCK_W} d={BLOCK_DEPTH} />
      <Block cx={144} cy={100} w={BLOCK_W} d={BLOCK_DEPTH} />
      <Block cx={122} cy={111} w={BLOCK_W} d={BLOCK_DEPTH} />

      {/* The one piece that moves. Lifting the top block off the stack on
       * hover is the assembling-a-system gesture the whole product is about,
       * and it is the reason the stack is drawn touching at rest. */}
      <g className="transition-transform duration-300 ease-out [transform:translateY(0)] group-hover:[transform:translateY(-7px)] motion-reduce:transition-none motion-reduce:group-hover:[transform:translateY(0)]">
        <Block cx={122} cy={90 - BLOCK_DEPTH} w={BLOCK_W} d={BLOCK_DEPTH} />
      </g>

      <g className="opacity-80 transition-opacity duration-500 ease-out group-hover:opacity-100 motion-reduce:transition-none">
        {PARTICLES.map((p) => (
          <circle key={`${p.x}-${p.y}`} cx={p.x} cy={p.y} r={p.r} fill="currentColor" fillOpacity={p.o} />
        ))}
      </g>
    </svg>
  );
}

/**
 * The alpha status card in Home's hero. Version and date come from the real
 * changelog (content/release-notes.ts) rather than a hardcoded string, so it
 * cannot drift out of date behind a release.
 *
 * One hue, several intensities: the version chip, the card border, the action's
 * NEW marker, and the illustration all read `--hero-accent`.
 *
 * The card is the hover `group` - the illustration inside responds to a pointer
 * anywhere on the card, not just on the drawing, since the drawing is
 * `pointer-events-none` scenery behind the copy.
 */
export function AlphaAnnouncement({ now }: { now: number | null }) {
  return (
    <aside className="group relative flex min-h-[190px] overflow-hidden rounded-lg border border-[color:color-mix(in_srgb,var(--hero-accent)_22%,var(--border))] bg-panel p-5 transition-colors duration-300 ease-out hover:border-[color:color-mix(in_srgb,var(--hero-accent)_45%,var(--border))] motion-reduce:transition-none">
      <div className="relative z-10 flex max-w-[19rem] flex-col items-start gap-3">
        <span className="rounded-full border border-[color:color-mix(in_srgb,var(--hero-accent)_45%,transparent)] px-2 py-0.5 font-mono text-[11px] text-hero-accent">
          v{LATEST_RELEASE.version}
        </span>
        <h2 className="text-lg font-semibold tracking-tight">Alpha is live</h2>
        <p className="text-sm leading-relaxed text-foreground/65">
          Thanks for being here early. Your feedback shapes what ScaleCraft becomes.
        </p>
        <div className="pt-1">
          <SeeWhatsNewButton now={now} />
        </div>
      </div>

      {/* Sits behind the text and clips out entirely on narrow cards rather
       * than squeezing the copy into two-word lines. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 bottom-0 top-0 hidden w-[48%] items-center opacity-80 sm:flex"
      >
        <GeometricObject />
      </div>
    </aside>
  );
}
