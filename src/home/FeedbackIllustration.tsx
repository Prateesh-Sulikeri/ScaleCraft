/**
 * The feedback dialog's drawing: what you write leaving the app and arriving
 * with the person who builds it.
 *
 * A marked node (the app you are in) on the left, the written note as a
 * bracketed speech bubble in the middle, and a paper plane on the right, tied
 * together by one dashed leader that runs the whole way across. Same flat
 * drafting vocabulary as ReleaseIllustration.tsx - nodes, leaders, dimension
 * ticks, registration corners - so it reads as another sheet from the same
 * set rather than a stock support graphic.
 *
 * Every value is `currentColor` at some opacity so it follows the theme, and
 * `aria-hidden` - the headline beside it carries the meaning.
 */

/* 480x200 is 2.4:1, matching the slot the dialog gives this, so `meet` fits it
 * edge to edge instead of letterboxing it. */
const VIEW = { w: 480, h: 200 };

/** The note itself: a sheet of rules of unequal measure, the first weighted
 *  like a subject line. Not lorem text - just the shape short written feedback
 *  makes. */
const SHEET = { x: 158, y: 34, w: 152, h: 74 };
const RULES: { w: number; strong?: boolean }[] = [
  { w: 112, strong: true },
  { w: 78 },
  { w: 124 },
  { w: 64 },
];

/** Source node - the app the feedback is written from. */
const SOURCE = { x: 62, y: 96 };

export function FeedbackIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
      aria-hidden="true"
      data-illustration="feedback-path"
      className={`h-full w-full text-hero-accent ${className}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* A pattern rather than the ~500 <circle> elements this density would
            otherwise cost. */}
        <pattern id="feedback-grid-dots" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.9" fill="currentColor" fillOpacity="0.11" />
        </pattern>
      </defs>

      <rect x="0" y="0" width={VIEW.w} height={VIEW.h} fill="url(#feedback-grid-dots)" />

      {/* The route the note travels: source node, down under the sheet, out to
          the plane. Dashed throughout - it is a leader, not a wire. */}
      <path
        d={`M${SOURCE.x} ${SOURCE.y + 20} C ${SOURCE.x + 20} ${SOURCE.y + 62}, 150 168, 232 158 C 310 149, 346 140, 372 124`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeOpacity="0.32"
        strokeDasharray="5 5"
        strokeLinecap="round"
      />

      {/* Source node, inside a registration square - the same marked-node motif
          the release drawing uses for the version you are reading. */}
      <g fill="none" stroke="currentColor">
        <rect
          x={SOURCE.x - 15}
          y={SOURCE.y - 15}
          width="30"
          height="30"
          rx="4"
          strokeWidth="0.9"
          strokeOpacity="0.26"
        />
        <rect
          x={SOURCE.x - 8}
          y={SOURCE.y - 8}
          width="16"
          height="16"
          rx="3"
          strokeWidth="1.5"
          strokeOpacity="0.9"
          fill="currentColor"
          fillOpacity="0.16"
        />
      </g>

      {/* Leader from the node up to the sheet it produced. */}
      <path
        d={`M${SOURCE.x} ${SOURCE.y - 17} L${SOURCE.x} ${SHEET.y + 26} L${SHEET.x - 6} ${SHEET.y + 26}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.28"
        strokeDasharray="4 4"
      />

      {/* The note. Two corner brackets and a tail rather than a filled rounded
          card - a bordered box of grey bars reads as a loading skeleton, which
          is the one thing this must not look like. */}
      <g>
        <g fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.32">
          <path d={`M${SHEET.x} ${SHEET.y + 16} L${SHEET.x} ${SHEET.y} L${SHEET.x + 16} ${SHEET.y}`} />
          <path
            d={`M${SHEET.x + SHEET.w - 16} ${SHEET.y + SHEET.h} L${SHEET.x + SHEET.w} ${SHEET.y + SHEET.h} L${SHEET.x + SHEET.w} ${SHEET.y + SHEET.h - 16}`}
          />
          {/* The tail, which is what makes the sheet a spoken remark rather
              than a document. */}
          <path d={`M${SHEET.x + 22} ${SHEET.y + SHEET.h} L${SHEET.x + 22} ${SHEET.y + SHEET.h + 16} L${SHEET.x + 42} ${SHEET.y + SHEET.h}`} />
          <path d={`M${SHEET.x} ${SHEET.y + SHEET.h} L${SHEET.x + 22} ${SHEET.y + SHEET.h}`} strokeOpacity="0.2" />
        </g>
        {RULES.map((rule, i) => (
          <rect
            key={`rule-${i}`}
            x={SHEET.x + 14}
            y={SHEET.y + 14 + i * 14}
            width={rule.w}
            height="4.5"
            rx="2.25"
            fill="currentColor"
            fillOpacity={rule.strong ? 0.45 : 0.18}
          />
        ))}
      </g>

      {/* The plane: two folds, the upper wing lighter than the fin under it,
          so the fold reads without a single filled silhouette. */}
      <g stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round">
        <path d="M452 74 L374 116 L410 126 Z" fill="currentColor" fillOpacity="0.1" strokeOpacity="0.55" />
        <path d="M452 74 L410 126 L424 154 Z" fill="currentColor" fillOpacity="0.22" strokeOpacity="0.8" />
        <path d="M452 74 L410 126" fill="none" strokeOpacity="0.35" strokeWidth="0.9" />
      </g>

      {/* Flanking-tick dimension rule under the run from app to author - the
          same drafting mark the About and Release sheets carry. */}
      <g stroke="currentColor" strokeWidth="0.9" strokeOpacity="0.26" fill="none">
        <path d={`M${SOURCE.x} 178 L424 178`} />
        <path d={`M${SOURCE.x} 174 L${SOURCE.x} 182`} />
        <path d="M424 174 L424 182" />
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
