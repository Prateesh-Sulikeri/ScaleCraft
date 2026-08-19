import {
  BUG_CATEGORY_LABELS,
  BUG_PRIORITY_LABELS,
  BUG_STATUS_LABELS,
  type BugCategory,
  type BugPriority,
  isBugActive,
  type BugStatus,
} from "./types";

/**
 * The small labelled chips the list and details view share. Priority is the
 * only one that carries color, and it is DESIGN.md's state channel used for
 * exactly what that channel is for - severity - not decoration. Status and
 * category stay neutral: they are identity, and coloring three things at once
 * would leave the row with no visual hierarchy at all.
 */

const CHIP = "inline-flex shrink-0 items-center rounded-sm border px-1.5 py-px text-[11px] font-medium";

const PRIORITY_TONE: Record<BugPriority, string> = {
  low: "border-border text-foreground/55",
  medium: "border-state-warning/40 bg-state-warning/5 text-state-warning",
  high: "border-state-error/40 bg-state-error/5 text-state-error",
};

export function PriorityChip({ priority }: { priority: BugPriority }) {
  return (
    <span className={`${CHIP} ${PRIORITY_TONE[priority]}`}>{BUG_PRIORITY_LABELS[priority]}</span>
  );
}

const STATUS_TONE: Record<BugStatus, string> = {
  open: "border-border bg-foreground/5 text-foreground/70",
  "in-progress": "border-border bg-foreground/5 text-foreground/70",
  // Resolved is the one status worth a color: it is the answer to the
  // question the reporter opened the modal to ask.
  resolved: "border-state-valid/40 bg-state-valid/5 text-state-valid",
  closed: "border-border text-foreground/45",
};

export function StatusChip({ status }: { status: BugStatus }) {
  return <span className={`${CHIP} ${STATUS_TONE[status]}`}>{BUG_STATUS_LABELS[status]}</span>;
}

/**
 * The row's identifier: yellow while a report is still moving, gray once it is
 * closed. Two colors, not four - the status chip already spells out which of
 * the four states it is in, and the dot answers the coarser question the eye
 * asks when scanning the list ("is anything still open?").
 *
 * Yellow rather than green-for-active because it is the in-flight color in
 * DESIGN.md's state channel: an open report is outstanding work, and green
 * would read as "done" on the exact reports that are not.
 */
export function StatusDot({ status }: { status: BugStatus }) {
  const active = isBugActive(status);
  return (
    <span
      aria-hidden="true"
      className={`h-2 w-2 shrink-0 rounded-full ${active ? "bg-state-warning" : "bg-foreground/25"}`}
    />
  );
}

/** The unread marker: this report's status moved since the reporter last
 *  opened it. Same red as the button's badge, so the count on the button and
 *  the rows that make it up are visibly the same thing. */
export function UnreadDot({ className = "" }: { className?: string }) {
  return (
    <span className={`flex shrink-0 items-center ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-state-error" aria-hidden="true" />
      <span className="sr-only">Updated since you last opened it</span>
    </span>
  );
}

export function CategoryChip({ category }: { category: BugCategory }) {
  return (
    <span className={`${CHIP} border-border text-foreground/60`}>{BUG_CATEGORY_LABELS[category]}</span>
  );
}

/** "12 Aug" / "12 Aug 2025" - year only when it is not the current one, the
 *  same rule (and reason) as home/ActivityRow.tsx's row dates. */
export function formatBugDate(at: number): string {
  const date = new Date(at);
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

/** The details view shows a time too - "when exactly" matters when correlating
 *  a report against a deploy, and the list has already covered "roughly when". */
export function formatBugDateTime(at: number): string {
  const date = new Date(at);
  return `${date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}, ${date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
}
