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
        <div className="absolute right-0 z-30 mt-2 w-80 rounded-md border border-border bg-panel p-3 shadow-lg">
          {violations === null || violations.length === 0 ? (
            <p className="text-sm text-state-valid">No violations.</p>
          ) : (
            <ul className="space-y-3">
              {violations.map((v, i) => (
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
          )}
        </div>
      )}
    </div>
  );
}
