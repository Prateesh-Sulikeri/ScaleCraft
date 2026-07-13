"use client";

import { useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { ValidationViolation } from "@/validation-engine/types";

type QuestionPanelProps = {
  violations: ValidationViolation[] | null;
  /** True when the graph has changed since these results were computed —
   * validation is manual now (a "Validate" click, not live), see page.tsx. */
  isStale: boolean;
};

/**
 * The left panel. Once the chapter framework lands (milestone 5, see
 * .claude/docs/MILESTONES.md) this is where a chapter's problem statement
 * and learning objectives render — "the question." Until then (Sandbox has
 * no question) it just holds validation feedback, which conceptually
 * belongs here too: it's the answer to "how am I doing against the
 * question," not a property of any one selected node the way Config/Docs
 * are (see NodeInspector, the right panel).
 */
export function QuestionPanel({ violations, isStale }: QuestionPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <div className="flex w-10 shrink-0 flex-col items-center border-r border-border py-3">
        <button
          onClick={() => setCollapsed(false)}
          aria-label="Expand question panel"
          className="text-foreground/60 hover:text-foreground"
        >
          <PanelLeftOpen size={16} />
        </button>
      </div>
    );
  }

  return (
    <aside className="flex w-80 shrink-0 flex-col overflow-y-auto border-r border-border p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/60">Question</h2>
        <button
          onClick={() => setCollapsed(true)}
          aria-label="Collapse question panel"
          className="text-foreground/40 hover:text-foreground"
        >
          <PanelLeftClose size={14} />
        </button>
      </div>
      <p className="mt-2 text-sm text-foreground/60">
        No chapter loaded — this is Sandbox. Chapter problem statements will appear here once the
        chapter framework ships.
      </p>

      <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-foreground/60">
        Validation
      </h2>
      {violations === null ? (
        <p className="mt-2 text-sm text-foreground/60">Click Validate to check your architecture.</p>
      ) : (
        <>
          {isStale && (
            <p className="mt-2 text-sm text-foreground/50">
              The graph has changed since this check — click Validate to recheck.
            </p>
          )}
          {violations.length === 0 ? (
            <p className="mt-2 text-sm text-state-valid">No violations.</p>
          ) : (
            <ul className="mt-2 space-y-4">
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
        </>
      )}
    </aside>
  );
}
