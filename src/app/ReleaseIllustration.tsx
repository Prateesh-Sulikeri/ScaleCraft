/**
 * The release dialog's drawing: the release line, with the one you are
 * reading pulled out into its notes.
 *
 * Shipped releases are nodes on a solid line; the current one is the marked
 * node, with a leader running up to a sheet of four rules standing in for its
 * notes. Past the current node the line goes dashed and its nodes go empty -
 * the releases not written yet.
 *
 * Deliberately the app's own vocabulary (nodes on a line, drafting leaders,
 * a flanking-tick dimension rule) rather than a metaphor borrowed from
 * outside it. A summit-and-route version was built first and dropped: it was
 * a stock illustration that said nothing a changelog needs said. This one
 * diagrams what the dialog actually is.
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

/** The release line, and the node on it that the dialog is showing. */
const LINE_Y = 130;
const CURRENT_X = 272;

/** Shipped releases, oldest first. Evenly spaced: this is a sequence, not a
 *  time axis, and uneven gaps would imply a cadence the dates don't have. */
const SHIPPED_X = [48, 92, 136, 180, 224];

/** Releases still to come - same rhythm, drawn empty. */
const PLANNED_X = [320, 368];

/** The notes sheet: four rules of unequal measure, the first weighted like a
 *  heading. Not lorem text and not a bar chart - just the shape a short
 *  written entry makes. */
const SHEET = { x: 214, y: 30, w: 118, h: 58 };
const RULES: { w: number; strong?: boolean }[] = [
  { w: 94, strong: true },
  { w: 64 },
  { w: 100 },
  { w: 52 },
];

export function ReleaseIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
      aria-hidden="true"
      data-illustration="release-line"
      className={`h-full w-full text-hero-accent ${className}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* A pattern rather than the ~500 <circle> elements this density
            would otherwise cost. */}
        <pattern id="release-grid-dots" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.9" fill="currentColor" fillOpacity="0.11" />
        </pattern>
      </defs>

      <rect x="0" y="0" width={VIEW.w} height={VIEW.h} fill="url(#release-grid-dots)" />

      {/* The release line: solid through what has shipped, dashed past it. */}
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        <path d={`M24 ${LINE_Y} L${CURRENT_X} ${LINE_Y}`} strokeWidth="1.3" strokeOpacity="0.4" />
        <path
          d={`M${CURRENT_X} ${LINE_Y} L440 ${LINE_Y}`}
          strokeWidth="1.3"
          strokeOpacity="0.2"
          strokeDasharray="5 5"
        />
      </g>

      {/* Tick under each node, the way a rule is graduated. */}
      <g stroke="currentColor" strokeWidth="1" strokeOpacity="0.22" fill="none">
        {[...SHIPPED_X, CURRENT_X, ...PLANNED_X].map((x) => (
          <path key={`tick-${x}`} d={`M${x} ${LINE_Y + 7} L${x} ${LINE_Y + 13}`} />
        ))}
      </g>

      {/* Shipped nodes. Panel-filled so the line stops at each one instead of
          running through it. */}
      <g stroke="currentColor" strokeWidth="1.15" strokeOpacity="0.5">
        {SHIPPED_X.map((x) => (
          <rect key={`shipped-${x}`} x={x - 5} y={LINE_Y - 5} width="10" height="10" rx="2" fill="var(--panel)" />
        ))}
      </g>

      {/* Planned nodes: the same node, not yet filled in. */}
      <g stroke="currentColor" strokeWidth="1" strokeOpacity="0.26" strokeDasharray="3 3" fill="none">
        {PLANNED_X.map((x) => (
          <rect key={`planned-${x}`} x={x - 5} y={LINE_Y - 5} width="10" height="10" rx="2" />
        ))}
      </g>

      {/* The current release: the node itself, plus a registration square
          around it - the drawing's one point of emphasis. */}
      <g fill="none" stroke="currentColor">
        <rect
          x={CURRENT_X - 14}
          y={LINE_Y - 14}
          width="28"
          height="28"
          rx="4"
          strokeWidth="0.9"
          strokeOpacity="0.26"
        />
        <rect
          x={CURRENT_X - 8}
          y={LINE_Y - 8}
          width="16"
          height="16"
          rx="3"
          strokeWidth="1.5"
          strokeOpacity="0.9"
          fill="currentColor"
          fillOpacity="0.16"
        />
      </g>

      {/* Leader from the marked node up to its notes. */}
      <path
        d={`M${CURRENT_X} ${LINE_Y - 16} L${CURRENT_X} ${SHEET.y + SHEET.h}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.3"
        strokeDasharray="4 4"
      />

      {/* The notes themselves. Two corner brackets rather than a bordered,
          filled rectangle: a full rounded card with grey bars in it read as a
          loading skeleton, which is the one thing this must not look like. */}
      <g>
        <g fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3">
          {/* Opening bracket top-left, and a baseline the leader lands on -
              the way a callout note is drawn against a drawing. */}
          <path d={`M${SHEET.x} ${SHEET.y + 13} L${SHEET.x} ${SHEET.y} L${SHEET.x + 13} ${SHEET.y}`} />
          <path
            d={`M${SHEET.x} ${SHEET.y + SHEET.h} L${SHEET.x + SHEET.w} ${SHEET.y + SHEET.h} L${SHEET.x + SHEET.w} ${SHEET.y + SHEET.h - 13}`}
          />
        </g>
        {RULES.map((rule, i) => (
          <rect
            key={`rule-${i}`}
            x={SHEET.x + 11}
            y={SHEET.y + 12 + i * 12}
            width={rule.w}
            height="4"
            rx="2"
            fill="currentColor"
            fillOpacity={rule.strong ? 0.45 : 0.18}
          />
        ))}
      </g>

      {/* Flanking-tick dimension rule under what has shipped so far - the same
          drafting mark AboutIllustration.tsx uses. */}
      <g stroke="currentColor" strokeWidth="0.9" strokeOpacity="0.28" fill="none">
        <path d={`M${SHIPPED_X[0]} 158 L${CURRENT_X} 158`} />
        <path d={`M${SHIPPED_X[0]} 154 L${SHIPPED_X[0]} 162`} />
        <path d={`M${CURRENT_X} 154 L${CURRENT_X} 162`} />
      </g>

      {/* Registration marks - the drawing is a sheet, and a sheet has
          corners. */}
      <g stroke="currentColor" strokeWidth="1" strokeOpacity="0.2" fill="none">
        <path d="M14 26 L14 14 L26 14" />
        <path d="M466 26 L466 14 L454 14" />
        <path d="M14 174 L14 186 L26 186" />
        <path d="M466 174 L466 186 L454 186" />
      </g>
    </svg>
  );
}
