"use client";

import { BookCheck, Flame, Layers, TrendingUp, type LucideIcon } from "lucide-react";
import { Tooltip } from "@/app/Tooltip";
import type { CourseSummary } from "@/curriculum/progress";

type Tile = {
  label: string;
  Icon: LucideIcon;
  /** Already formatted - "3", "27%". */
  value: string;
  /** Secondary line under the value, e.g. "of 40". Omitted where a total
   *  would be meaningless (a streak has no denominator). */
  detail?: string;
  /** Explains a value the number cannot - what an approximation is based on. */
  note?: string;
  /** The one accented value on the card. Progress is the page's accent
   *  channel; the other three tiles stay neutral so it keeps its weight. */
  accent?: boolean;
};

function StatTile({ tile }: { tile: Tile }) {
  const { label, Icon, value, detail, note, accent } = tile;

  const body = (
    // Fixed label height rather than natural flow: "Chapters completed" wraps
    // to two lines and "Day streak" does not, and without it the four values
    // sit at four different heights across one row.
    <div className="flex h-full min-h-[104px] flex-col items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2 py-3 text-center">
      <span
        className={`text-[24px] font-semibold leading-none tracking-tight tabular-nums ${
          accent ? "text-[var(--course-accent)]" : "text-foreground"
        }`}
      >
        {value}
      </span>
      <span className="flex min-h-[2.1em] items-center text-[11px] leading-tight text-balance text-foreground/55">
        {label}
      </span>
      <span className="flex items-center gap-1 whitespace-nowrap text-[10px] text-foreground/35">
        <Icon size={11} aria-hidden="true" />
        {detail}
      </span>
    </div>
  );

  return note ? <Tooltip label={note}>{body}</Tooltip> : body;
}

/**
 * The four numbers in the course header, all derived from state the app
 * already persists - the course summary it is handed, plus the day streak
 * from the same timestamps Home's At a glance reads (see
 * home-data.ts's activityTimestamps). Nothing here is a placeholder and
 * nothing needed a new table.
 *
 * The streak spans every recorded activity, not just this course - there is
 * one set of timestamps, and slicing it per course would report two different
 * streaks for the same day's work. The tooltip says so.
 */
export function CourseStats({ summary, dayStreak }: { summary: CourseSummary; dayStreak: number }) {
  const tiles: Tile[] = [
    {
      label: "Chapters completed",
      Icon: BookCheck,
      value: String(summary.completed),
      detail: `of ${summary.total}`,
    },
    {
      label: "Sections completed",
      Icon: Layers,
      value: String(summary.sectionsCompleted),
      detail: `of ${summary.sectionsTotal}`,
    },
    {
      label: "Overall progress",
      Icon: TrendingUp,
      value: `${summary.percent}%`,
      detail: "complete",
      accent: true,
    },
    {
      label: "Day streak",
      Icon: Flame,
      value: String(dayStreak),
      detail: dayStreak === 1 ? "day" : "days",
      note: "Counted across everything you've worked on, from the days your progress was last recorded - so it can read low.",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 xl:w-[460px]">
      {tiles.map((tile) => (
        <StatTile key={tile.label} tile={tile} />
      ))}
    </div>
  );
}
