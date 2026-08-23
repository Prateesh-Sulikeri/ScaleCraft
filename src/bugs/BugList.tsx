"use client";

import { ChevronRight, Plus } from "lucide-react";
import { CategoryChip, PriorityChip, StatusChip, StatusDot, UnreadDot, formatBugDate } from "./BugChips";
import type { BugSummary } from "./types";

/**
 * The reporter's own bugs, newest first. A list of buttons rather than a
 * <table>: every row is a single navigation target, and a table would put
 * five separate cells in the tab order for one destination.
 *
 * Each row carries two dots doing different jobs: the leading StatusDot is
 * the report's own identifier (yellow while active, gray once closed), and a
 * trailing UnreadDot appears only when the status moved since the reporter
 * last opened it. They are on opposite ends deliberately - one describes the
 * report, the other is a call to action.
 */
export function BugList({
  bugs,
  onSelect,
  onReportNew,
}: {
  bugs: readonly BugSummary[];
  onSelect: (id: string) => void;
  onReportNew: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-foreground/60">
          {bugs.length} report{bugs.length === 1 ? "" : "s"}
        </p>
        <button
          type="button"
          onClick={onReportNew}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-panel px-3 py-1.5 text-sm font-medium text-foreground/75 transition-colors duration-150 ease-out hover:border-foreground/25 hover:text-foreground"
        >
          <Plus size={14} aria-hidden="true" />
          Report a bug
        </button>
      </div>

      <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border">
        {bugs.map((bug) => (
          <li key={bug.id}>
            <button
              type="button"
              onClick={() => onSelect(bug.id)}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors duration-150 ease-out hover:bg-foreground/5"
            >
              <StatusDot status={bug.status} />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="truncate text-sm font-medium text-foreground">{bug.title}</span>
                <span className="flex flex-wrap items-center gap-1.5">
                  <CategoryChip category={bug.category} />
                  <PriorityChip priority={bug.priority} />
                  <StatusChip status={bug.status} />
                </span>
              </div>
              {bug.unread && <UnreadDot />}
              <span className="shrink-0 text-xs text-foreground/45">{formatBugDate(bug.createdAt)}</span>
              <ChevronRight size={14} className="shrink-0 text-foreground/30" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
