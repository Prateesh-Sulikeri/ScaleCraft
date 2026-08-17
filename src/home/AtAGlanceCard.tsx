"use client";

import { BarChart3, BookCheck, CalendarRange, Flag, Flame, type LucideIcon } from "lucide-react";
import { Tooltip } from "@/app/Tooltip";
import type { HomeStats } from "./home-data";

type Metric = {
  label: string;
  Icon: LucideIcon;
  /** Already formatted - "12", "3", "0h", or the em-dash stand-in below. */
  value: string;
  /** Secondary line under the value, e.g. "of 40". Omitted where a total
   *  would be meaningless (a streak has no denominator). */
  detail?: string;
  /** Explains a value the numbers cannot - why a metric shows no data, or
   *  what an approximation is based on. */
  note?: string;
};

function MetricTile({ metric }: { metric: Metric }) {
  const { label, Icon, value, detail, note } = metric;

  const tile = (
    <div className="flex flex-col items-center gap-1.5 rounded-md border border-border bg-background px-3 py-3 text-center">
      <Icon size={15} className="text-foreground/35" aria-hidden="true" />
      <span className="text-[22px] font-semibold leading-none tracking-tight tabular-nums">{value}</span>
      <span className="text-[11px] leading-tight text-foreground/55">{label}</span>
      {detail && <span className="font-mono text-[10px] text-foreground/35">{detail}</span>}
    </div>
  );

  return note ? <Tooltip label={note}>{tile}</Tooltip> : tile;
}

/**
 * A deliberately lightweight overview - four numbers, no charts. The detailed
 * Stats experience is planned to live inside Clerk's UserProfile as a custom
 * ScaleCraft page, so this stays a glance, not a dashboard.
 *
 * All four read real persisted state; none is a placeholder, and none needed a
 * new table to exist. The two streak figures are approximations of what the
 * available data can support and say so in a tooltip, rather than presenting a
 * confident-looking number it cannot back up. There is deliberately no "time
 * spent": measuring that honestly needs an active-tab heartbeat writing to a
 * per-day counter, and neither a placeholder dash nor the manifest's
 * per-chapter estimate dressed up as a measurement was worth the slot.
 */
export function AtAGlanceCard({ stats }: { stats: HomeStats }) {
  const metrics: Metric[] = [
    {
      label: "Chapters completed",
      Icon: BookCheck,
      value: String(stats.chaptersCompleted),
      detail: `of ${stats.chaptersTotal}`,
    },
    {
      label: "Checkpoints completed",
      Icon: Flag,
      value: String(stats.checkpointsCompleted),
      detail: `of ${stats.checkpointsTotal}`,
    },
    {
      label: "Day streak",
      Icon: Flame,
      value: String(stats.dayStreak),
      detail: stats.dayStreak === 1 ? "day" : "days",
      note: "Counted from the days your progress was last recorded, so it can read low.",
    },
    {
      label: "Longest streak",
      Icon: CalendarRange,
      value: String(stats.longestStreak),
      detail: stats.longestStreak === 1 ? "day" : "days",
      note: "The best run on record. Only your latest visit per chapter is stored, so re-reading an old chapter can move this.",
    },
  ];

  return (
    <section className="flex flex-col rounded-lg border border-border bg-panel">
      <h2 className="flex items-center gap-2 border-b border-border px-5 py-3 text-sm font-semibold">
        <BarChart3 size={15} className="text-foreground/40" aria-hidden="true" />
        At a glance
      </h2>

      <div className="grid flex-1 grid-cols-2 gap-3 px-5 py-3.5 lg:grid-cols-4">
        {metrics.map((metric) => (
          <MetricTile key={metric.label} metric={metric} />
        ))}
      </div>

      <p className="mt-auto border-t border-border px-5 py-3 text-xs text-success">
        Keep going. <span className="text-foreground/70">Consistency builds mastery.</span>
      </p>
    </section>
  );
}
