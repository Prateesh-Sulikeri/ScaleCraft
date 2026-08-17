"use client";

import type { ChapterStatus } from "@/curriculum/types";

/** "ALL" is not a status, it is the absence of the filter - keeping it in the
 *  same union means the control has one value rather than a status plus a
 *  boolean that can disagree with it. */
export type StatusFilterValue = ChapterStatus | "ALL";

/** Order matches the progression a chapter moves through, so the control
 *  reads left to right the way the work does. Labels are the same three the
 *  status icons announce (ChapterStatusIcon's chapterStatusLabel), so the
 *  filter and the rows use one vocabulary. */
const OPTIONS: readonly { value: StatusFilterValue; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "NOT_STARTED", label: "Not started" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "COMPLETED", label: "Completed" },
];

type StatusFilterProps = {
  value: StatusFilterValue;
  onChange: (value: StatusFilterValue) => void;
};

/**
 * Filters the curriculum by completion status. Additive to the search box,
 * which already matches status *text* - the two compose (search "load" with
 * "Not started" selected), and both read the same `deriveStatus` the rows do.
 * The active chip is the page's accent, which is what "active state" is
 * reserved for here.
 */
export function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <div role="group" aria-label="Filter by status" className="flex flex-wrap items-center gap-1.5">
      {OPTIONS.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`rounded-md border px-2.5 py-1.5 text-[13px] font-medium transition-colors duration-150 ease-out ${
              active
                ? "border-[var(--course-accent-line)] bg-[var(--course-accent-soft)] text-[var(--course-accent)]"
                : "border-border bg-panel text-foreground/60 hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
