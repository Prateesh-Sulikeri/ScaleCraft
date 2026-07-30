"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { MarkdownRenderer } from "@/canvas/docs-panel/markdown/MarkdownRenderer";
import { getComponent } from "@/content/components/registry";
import type { ArchitectureGraph } from "@/lib/graph";
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
      {blueprint.referenceGraph && <ReferenceGraphSummary graph={blueprint.referenceGraph} />}
    </div>
  );
}

/** A lightweight textual shape summary, not a full canvas render — reusing
 * React Flow here would drag in a heavy dependency tree for a read-only
 * debrief aside. Component labels for each edge, since raw componentIds
 * aren't the vocabulary a learner reads elsewhere in the app. */
function ReferenceGraphSummary({ graph }: { graph: ArchitectureGraph }) {
  const labelFor = (nodeId: string) => {
    const node = graph.nodes.find((n) => n.id === nodeId);
    if (!node) return nodeId;
    return getComponent(node.componentId)?.label ?? node.componentId;
  };

  return (
    <div className="mt-2 rounded-md bg-background/60 p-2 text-xs text-foreground/70">
      {graph.edges.length > 0 ? (
        <ul className="flex flex-col gap-0.5">
          {graph.edges.map((e) => (
            <li key={e.id}>
              {labelFor(e.source)} → {labelFor(e.target)}
            </li>
          ))}
        </ul>
      ) : (
        <p>{graph.nodes.map((n) => labelFor(n.id)).join(", ")}</p>
      )}
    </div>
  );
}
