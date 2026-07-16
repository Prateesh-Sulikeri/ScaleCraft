"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, ChevronDown, XCircle } from "lucide-react";
import type { ValidationViolation } from "@/validation-engine/types";

type ValidationIndicatorProps = {
  violations: ValidationViolation[] | null;
  isStale: boolean;
  onValidate: () => void;
};

/**
 * Replaces the old plain "Validate" button. The button itself carries the
 * pass/fail state (color), and clicking it always surfaces the explanation
 * for any violations right there — never behind an extra click, per the
 * "explanations are always shown on failure" rule in CLAUDE.md. Validation
 * results used to live in a QuestionPanel section; per direction, that
 * panel has no upside for holding them, so this is the only place they
 * appear now.
 */
export function ValidationIndicator({ violations, isStale, onValidate }: ValidationIndicatorProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // Never show the dropdown once results are stale — the graph changed
  // underneath it, so it'd be describing a state that no longer exists.
  const showDropdown = open && !isStale;

  // A document-level listener rather than a full-viewport backdrop div —
  // the old backdrop sat at z-20 above the whole canvas, so clicking a
  // node while this dropdown was open didn't even select the node, it
  // just closed the dropdown. This still closes on a genuine outside
  // click, but explicitly lets a click on a react-flow node through
  // (both to actually select it, and to keep the explanation open while
  // you act on it — the exact moment the app previously undermined itself).
  useEffect(() => {
    if (!showDropdown) return;
    const onDocMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (containerRef.current?.contains(target)) return;
      if (target.closest(".react-flow__node")) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [showDropdown]);

  const handleClick = () => {
    if (violations === null || isStale) {
      onValidate();
      setOpen(true);
    } else {
      setOpen((o) => !o);
    }
  };

  const hasViolations = violations !== null && !isStale && violations.length > 0;
  const isValid = violations !== null && !isStale && violations.length === 0;

  const colorClass = hasViolations
    ? "border-state-error text-state-error"
    : isValid
      ? "border-state-valid text-state-valid"
      : "border-border text-foreground";

  // Errors first, so the more urgent problems are the first thing hit
  // while scrolling a long list, not buried after a run of warnings.
  const sortedViolations = violations
    ? [...violations].sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "error" ? -1 : 1))
    : [];
  const errorCount = sortedViolations.filter((v) => v.severity === "error").length;
  const warningCount = sortedViolations.length - errorCount;

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={handleClick}
        className={`flex items-center gap-1.5 rounded-md border bg-panel px-3 py-1.5 text-sm font-medium hover:bg-border ${colorClass} ${
          isStale ? "border-dashed opacity-70" : ""
        }`}
      >
        {hasViolations ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
        Validate
        {violations !== null && <ChevronDown size={12} />}
      </button>

      {showDropdown && (
        <div className="absolute right-0 z-30 mt-2 flex max-h-[70vh] w-96 flex-col rounded-md border border-border bg-panel shadow-lg">
          {violations === null || violations.length === 0 ? (
            <p className="p-3 text-sm text-state-valid">No violations.</p>
          ) : (
            <>
              {/* Count summary — always visible above the scroll region, so
               * scale ("how many, how bad") is legible before scrolling
               * through potentially dozens of cards. Sits outside the
               * scrollable area on purpose, same reasoning as a table's
               * fixed header row. */}
              <div className="shrink-0 border-b border-border px-3 py-2 text-xs font-semibold tracking-wide text-foreground/60 uppercase">
                {violations.length} {violations.length === 1 ? "issue" : "issues"}
                {errorCount > 0 && warningCount > 0 && (
                  <span className="normal-case">
                    {" "}
                    · <span style={{ color: "var(--state-error)" }}>{errorCount} error{errorCount === 1 ? "" : "s"}</span>{" "}
                    · <span style={{ color: "var(--state-warning)" }}>{warningCount} warning{warningCount === 1 ? "" : "s"}</span>
                  </span>
                )}
              </div>

              {/* This is the one region that scrolls — capped by the
               * container's own max-h-[70vh] rather than relying on
               * ancestor bounds, since body/main are both overflow-hidden
               * (see layout.tsx/sandbox/page.tsx) and would otherwise just
               * clip an unbounded list instead of scrolling it. Every
               * card's full message + explanation always renders in full —
               * only scroll position changes, nothing is ever collapsed or
               * truncated, per the "explanation always shown" rule. */}
              <ul className="space-y-3 overflow-y-auto p-3">
                {sortedViolations.map((v, i) => (
                  <li key={i} className="rounded-md border border-border p-3">
                    <p
                      className="text-sm font-medium"
                      style={{
                        color: v.severity === "error" ? "var(--state-error)" : "var(--state-warning)",
                      }}
                    >
                      {v.message}
                    </p>
                    <p className="mt-1 text-sm text-foreground/70">{v.explanation}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
