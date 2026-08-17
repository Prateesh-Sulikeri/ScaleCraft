"use client";

import { modeColorVar, modeIcon, modeLabel } from "@/lib/modes";
import type { ModeSplitSlice } from "./home-data";

type ActivityModeDonutProps = {
  slices: readonly ModeSplitSlice[];
  /** Total tracked items - shown in the hole, so the ring's percentages are
   *  always read against the number they divide. */
  total: number;
};

const SIZE = 168;
const STROKE = 24;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
/** Panel-colored break between arcs, in px of arc length. Not decoration:
 *  Sandbox cyan and Building Blocks teal sit ~6 ΔE apart in light mode, so
 *  touching arcs would read as one. The gap plus the labelled legend below
 *  (icon + name + count) carries identity; color alone never does. */
const GAP = 3;

/**
 * Which modes the learner's tracked activity divides across, as a donut.
 *
 * Deliberately a *count* of items touched per mode, not time or effort - see
 * home-data.ts's modeSplit for why that is the only honest reading of the
 * data. Hand-drawn SVG rather than a charting dependency: three arcs and a
 * legend do not justify a bundle.
 */
export function ActivityModeDonut({ slices, total }: ActivityModeDonutProps) {
  const drawn = slices.filter((slice) => slice.count > 0);

  return (
    <div className="flex flex-col items-center gap-5">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={donutLabel(slices, total)}>
        {/* Track, so an empty or single-mode ring still reads as a whole. */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--border)"
          strokeWidth={STROKE}
          opacity={0.5}
        />
        {/* -90deg puts the first slice at 12 o'clock rather than 3. */}
        <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
          {drawn.map((slice, i) => {
            const before = drawn.slice(0, i).reduce((sum, s) => sum + s.count, 0);
            const arc = (slice.count / total) * CIRCUMFERENCE;
            return (
              <circle
                key={slice.mode}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={modeColorVar[slice.mode]}
                strokeWidth={STROKE}
                strokeDasharray={`${Math.max(0, arc - GAP)} ${CIRCUMFERENCE}`}
                strokeDashoffset={-(before / total) * CIRCUMFERENCE}
              >
                <title>{`${modeLabel[slice.mode]}: ${slice.count} of ${total}`}</title>
              </circle>
            );
          })}
        </g>
        <text
          x={SIZE / 2}
          y={SIZE / 2 - 4}
          textAnchor="middle"
          className="fill-foreground text-2xl font-semibold"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {total}
        </text>
        <text x={SIZE / 2} y={SIZE / 2 + 16} textAnchor="middle" className="fill-foreground/50 text-[11px]">
          {total === 1 ? "item" : "items"}
        </text>
      </svg>

      {/* The legend is the identity carrier, not the ring - every mode is
          listed whether or not it has a slice, so a 0 reads as "nothing here
          yet" rather than as a missing row. */}
      <ul className="flex w-full flex-col gap-2">
        {slices.map((slice) => {
          const Icon = modeIcon[slice.mode];
          return (
            <li key={slice.mode} className="flex items-center gap-2 text-xs">
              <Icon
                size={13}
                strokeWidth={1.75}
                aria-hidden="true"
                className="shrink-0"
                style={{ color: modeColorVar[slice.mode], opacity: slice.count === 0 ? 0.4 : 1 }}
              />
              <span className={`min-w-0 flex-1 truncate ${slice.count === 0 ? "text-foreground/40" : "text-foreground/80"}`}>
                {modeLabel[slice.mode]}
              </span>
              <span className="shrink-0 tabular-nums text-foreground/55">{slice.count}</span>
              <span className="w-9 shrink-0 text-right tabular-nums text-foreground/40">{slice.percent}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function donutLabel(slices: readonly ModeSplitSlice[], total: number): string {
  if (total === 0) return "No tracked activity yet";
  const parts = slices.map((s) => `${modeLabel[s.mode]} ${s.count} (${s.percent}%)`);
  return `Activity by mode, ${total} items total: ${parts.join(", ")}`;
}
