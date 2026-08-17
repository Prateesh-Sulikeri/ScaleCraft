"use client";

import Link from "next/link";
import { modeColorVar, modeIcon, modeLabel } from "@/lib/modes";
import { formatRelativeTime, type ActivityEntry } from "./home-data";

type ActivityRowProps = {
  entry: ActivityEntry;
  /** Epoch ms. Callers only render rows once the clock is known, since every
   *  row's timestamp is relative to it. */
  now: number;
  /** Adds an absolute date column. On the card the relative time is enough;
   *  in the All activity dialog, where rows go back weeks, it is not. */
  showDate?: boolean;
};

/**
 * One activity row, shared by RecentActivityCard (its three-row preview) and
 * AllActivityModal (the full list) so the two can never drift apart in
 * columns, alignment, or link behavior.
 *
 * A chapter row links back to its lesson - the same target the hero CTA
 * resumes to. The Sandbox row does not: it is a save slot rather than a
 * chapter, and there is no lesson to return to.
 *
 * The four columns are identical linked or not - only the wrapper differs - so
 * both kinds stay on the same grid. The link's -mx-2/px-2 cancel out, which is
 * what lets its hover tint bleed past the text without moving any of it.
 */
export function ActivityRow({ entry, now, showDate = false }: ActivityRowProps) {
  const Icon = modeIcon[entry.mode];

  const columns = (
    <>
      <span
        style={{ color: modeColorVar[entry.mode] }}
        className="flex w-[9.5rem] shrink-0 items-center gap-1.5 text-xs font-medium"
      >
        <Icon size={13} strokeWidth={1.75} aria-hidden="true" />
        <span className="truncate">{modeLabel[entry.mode]}</span>
      </span>
      <span className="min-w-0 flex-1 truncate text-foreground/85 transition-colors duration-150 ease-out group-hover:text-foreground">
        {entry.title}
      </span>
      <span className="w-[5.5rem] shrink-0 text-right text-xs text-foreground/55">{entry.status}</span>
      {showDate && (
        <span className="w-[5rem] shrink-0 text-right text-xs tabular-nums text-foreground/40">
          {formatAbsoluteDate(entry.at)}
        </span>
      )}
      <span className="w-[4.5rem] shrink-0 text-right text-xs text-foreground/40">
        {formatRelativeTime(entry.at, now)}
      </span>
    </>
  );

  return (
    <li>
      {entry.href ? (
        <Link
          href={entry.href}
          className="group -mx-2 flex items-center gap-3 rounded-md px-2 py-2.5 text-sm transition-colors duration-150 ease-out hover:bg-foreground/5"
        >
          {columns}
        </Link>
      ) : (
        <div className="flex items-center gap-3 py-2.5 text-sm">{columns}</div>
      )}
    </li>
  );
}

/** "12 Aug" / "12 Aug 2025" - the year only once it is not the current one,
 *  which is the common case and would otherwise be noise on every row. */
function formatAbsoluteDate(at: number): string {
  const date = new Date(at);
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}
