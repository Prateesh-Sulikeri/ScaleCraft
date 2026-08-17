"use client";

import { useState } from "react";
import { ArrowRight, Clock } from "lucide-react";
import { ActivityRow } from "./ActivityRow";
import { AllActivityModal } from "./AllActivityModal";
import type { ActivityEntry } from "./home-data";

type RecentActivityCardProps = {
  activity: readonly ActivityEntry[];
  /** Everything tracked, for the "View all activity" dialog - `activity` is
   *  its first few rows. */
  allActivity: readonly ActivityEntry[];
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
 * Rows read as a status list, not an event log - the timestamps are the latest
 * touch of each thing, so a row is a current-state readout that happens to be
 * navigable. Row markup lives in ActivityRow.tsx, shared with the dialog.
 */
export function RecentActivityCard({ activity, allActivity, now, isSignedIn }: RecentActivityCardProps) {
  const [showAll, setShowAll] = useState(false);
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
            {activity.map((entry) => (
              <ActivityRow key={entry.id} entry={entry} now={now} />
            ))}
          </ul>
        )}
      </div>

      <div className="mt-auto border-t border-border px-5 py-3">
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="group inline-flex items-center gap-1.5 text-xs font-medium text-foreground/60 transition-colors duration-150 ease-out hover:text-foreground"
        >
          View all activity
          <ArrowRight
            size={13}
            aria-hidden="true"
            className="transition-transform duration-150 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
          />
        </button>
      </div>

      {showAll && <AllActivityModal activity={allActivity} now={now} onClose={() => setShowAll(false)} />}
    </section>
  );
}
