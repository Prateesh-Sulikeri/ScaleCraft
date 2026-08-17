"use client";

import { useEffect, useMemo } from "react";
import { CenteredModal } from "@/app/CenteredModal";
import { ActivityModeDonut } from "./ActivityModeDonut";
import { ActivityRow } from "./ActivityRow";
import { modeSplit, type ActivityEntry } from "./home-data";

type AllActivityModalProps = {
  activity: readonly ActivityEntry[];
  /** Epoch ms, or null pre-mount. The dialog only opens from a click, so in
   *  practice this is always set - the null branch is a type-level floor. */
  now: number | null;
  onClose: () => void;
};

/**
 * The full activity history, opened from RecentActivityCard's "View all
 * activity". It used to be a link to the Building Blocks Learning Path, which
 * answered a different question (per-chapter status for one course) than the
 * one the label asks.
 *
 * A dialog rather than an /activity route because there is no server-side
 * activity resource to route to: the list is derived client-side from
 * current-state timestamps the app already writes (see home-data.ts's
 * buildRecentActivity). A route would render the same derivation behind a URL
 * that could not be linked to usefully.
 *
 * Same caveat as the card, and the reason the summary is a split rather than a
 * timeline: these are the *latest touch* of each thing, not an event log. Two
 * visits to one chapter leave one row.
 */
export function AllActivityModal({ activity, now, onClose }: AllActivityModalProps) {
  const slices = useMemo(() => modeSplit(activity), [activity]);

  // CenteredModal has no Escape handling of its own (ShortcutsModal gets it
  // from the global canvas shortcut hook, which Home does not mount).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const empty = now == null || activity.length === 0;

  return (
    <CenteredModal
      title="All activity"
      titleAdornment={
        <span className="shrink-0 rounded-full border border-border px-1.5 py-0.5 text-[11px] font-medium text-foreground/60">
          {activity.length} tracked
        </span>
      }
      onClose={onClose}
      size="full"
    >
      {empty ? (
        <p className="px-1 py-6 text-sm leading-relaxed text-foreground/50">
          Nothing tracked yet. Open a chapter or a board and it shows up here.
        </p>
      ) : (
        <div className="flex h-full min-h-0 gap-8">
          <aside className="flex w-56 shrink-0 flex-col gap-4 border-r border-border pr-8">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground/45">Split by mode</h3>
            <ActivityModeDonut slices={slices} total={activity.length} />
            <p className="mt-auto text-[11px] leading-relaxed text-foreground/40">
              Counts items you have touched, not time spent. Each chapter and the Sandbox board appear once, at
              their latest touch.
            </p>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-foreground/45">
              Everything, newest first
            </h3>
            <ul className="flex min-h-0 flex-1 flex-col divide-y divide-border/70 overflow-y-auto pr-1">
              {activity.map((entry) => (
                <ActivityRow key={entry.id} entry={entry} now={now} showDate />
              ))}
            </ul>
          </div>
        </div>
      )}
    </CenteredModal>
  );
}
