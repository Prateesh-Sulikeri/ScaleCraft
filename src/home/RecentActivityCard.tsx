"use client";

import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { modeColorVar, modeIcon, modeLabel } from "@/lib/modes";
import { formatRelativeTime, type ActivityEntry } from "./home-data";
import { ALL_ACTIVITY_HREF } from "./links";

type RecentActivityCardProps = {
  activity: readonly ActivityEntry[];
  /** Epoch ms, or null pre-mount - rows are only rendered once it is known,
   *  since every row's timestamp is relative to it. */
  now: number | null;
  isSignedIn: boolean;
};

/**
 * What the learner last touched, drawn from state the app already writes -
 * curriculum rows' visit/completion timestamps and the Sandbox save slot (see
 * home-data.ts's buildRecentActivity).
 *
 * Rows are deliberately not links. There is no event log behind them, so a
 * row is a *status* readout rather than a navigable record, and the card
 * keeps exactly one way out ("View all activity") instead of three
 * near-duplicate link targets competing with the mode cards above.
 */
export function RecentActivityCard({ activity, now, isSignedIn }: RecentActivityCardProps) {
  const ready = now != null;

  return (
    <section className="flex flex-col rounded-lg border border-border bg-panel">
      <h2 className="flex items-center gap-2 border-b border-border px-5 py-3 text-sm font-semibold">
        <Clock size={15} className="text-foreground/40" aria-hidden="true" />
        Recent activity
      </h2>

      <div className="flex flex-1 flex-col px-5 py-2">
        {!ready || activity.length === 0 ? (
          <p className="px-1 py-6 text-sm leading-relaxed text-foreground/50">
            {isSignedIn
              ? "Nothing yet. Open a chapter or a board and it shows up here."
              : "Sign in to track chapters you open and boards you edit."}
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border/70">
            {activity.map((entry) => {
              const Icon = modeIcon[entry.mode];
              return (
                <li key={entry.id} className="flex items-center gap-3 py-2.5 text-sm">
                  <span
                    style={{ color: modeColorVar[entry.mode] }}
                    className="flex w-[9.5rem] shrink-0 items-center gap-1.5 text-xs font-medium"
                  >
                    <Icon size={13} strokeWidth={1.75} aria-hidden="true" />
                    <span className="truncate">{modeLabel[entry.mode]}</span>
                  </span>
                  <span className="min-w-0 flex-1 truncate text-foreground/85">{entry.title}</span>
                  <span className="w-[5.5rem] shrink-0 text-right text-xs text-foreground/55">{entry.status}</span>
                  <span className="w-[4.5rem] shrink-0 text-right text-xs text-foreground/40">
                    {formatRelativeTime(entry.at, now)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="mt-auto border-t border-border px-5 py-3">
        <Link
          href={ALL_ACTIVITY_HREF}
          className="group inline-flex items-center gap-1.5 text-xs font-medium text-foreground/60 transition-colors duration-150 ease-out hover:text-foreground"
        >
          View all activity
          <ArrowRight
            size={13}
            aria-hidden="true"
            className="transition-transform duration-150 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
          />
        </Link>
      </div>
    </section>
  );
}
