"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { MarkdownRenderer } from "@/canvas/docs-panel/markdown/MarkdownRenderer";
import { ReadOnlyGraphSummary } from "./ReadOnlyGraphSummary";
import type { Blueprint } from "@/content/chapters/types";

type DebriefProps = {
  blueprints: Blueprint[];
  matchedBlueprintId: string | null;
};

/**
 * Only ever mounted once a chapter has passed (see ChapterOutcome.passed in
 * QuestionPane) — and even then, pull-only: a single disclosure that never
 * auto-opens, not even on revisiting an already-completed chapter (§8.4).
 * Shows every declared blueprint, not just the matched one — Real World
 * Extraction's whole point is that a problem can have more than one right
 * answer, and seeing the alternates is part of the payoff for having already
 * earned a pass.
 */
export function Debrief({ blueprints, matchedBlueprintId }: DebriefProps) {
  const [open, setOpen] = useState(false);

  if (blueprints.length === 0) return null;

  return (
    <div className="mt-4 rounded-md border border-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-2.5 py-1.5 text-left text-sm font-medium text-foreground/80 hover:bg-border/40"
      >
        Debrief: other ways to design this
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && (
        <div className="flex flex-col gap-3 border-t border-border p-2.5">
          {blueprints.map((bp) => (
            <BlueprintCard key={bp.id} blueprint={bp} matched={bp.id === matchedBlueprintId} />
          ))}
        </div>
      )}
    </div>
  );
}

function BlueprintCard({ blueprint, matched }: { blueprint: Blueprint; matched: boolean }) {
  return (
    <div className={`rounded-md border p-2.5 ${matched ? "border-state-valid" : "border-border"}`}>
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold">{blueprint.label}</h4>
        {matched && (
          <span className="shrink-0 rounded-full bg-state-valid/15 px-2 py-0.5 text-[10px] font-medium tracking-wide text-state-valid uppercase">
            Your approach
          </span>
        )}
      </div>
      <div className="mt-1.5 text-sm text-foreground/80">
        <MarkdownRenderer content={blueprint.commentary} />
      </div>
      {blueprint.referenceGraph && (
        <div className="mt-2">
          <ReadOnlyGraphSummary graph={blueprint.referenceGraph} />
        </div>
      )}
    </div>
  );
}
