"use client";

import { useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useCanvasStore } from "@/canvas/store";
import type { ComponentNodeType } from "@/canvas/types";
import { MarkdownRenderer } from "@/canvas/docs-panel/markdown/MarkdownRenderer";
import { Debrief } from "./Debrief";
import type { ChapterDefinition, Hint } from "@/content/chapters/types";
import type { ChapterOutcome } from "@/validation-engine/chapter-outcome";

type QuestionPaneProps = {
  chapter: ChapterDefinition;
  onBack: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  /** Mirrors ChapterWorkspace's own last Validate-button result. `null`
   * before the first click; `isStale` means the graph has since changed
   * underneath it. ChapterWorkspace scopes the actual run to the open
   * chapter's own validationRuleIds (evaluateChapter), not the full global
   * registry. */
  chapterOutcome: ChapterOutcome | null;
  isStale: boolean;
};

/**
 * View 2 of ChapterSidebar — problem statement, objectives, a required-
 * components progress line, opt-in hints (never pre-expanded, per
 * CLAUDE.md's "hints vs. explanations" rule), reading links, a pull-only
 * Debrief once passed, and prev/next/back chapter navigation.
 */
export function QuestionPane({ chapter, onBack, onPrev, onNext, chapterOutcome, isStale }: QuestionPaneProps) {
  const nodes = useCanvasStore((s) => s.nodes);
  const [revealedHintIds, setRevealedHintIds] = useState<Set<string>>(new Set());

  const outcome = isStale ? null : chapterOutcome;

  // Before the first Validate click (or once results go stale), fall back to
  // a live presence-only count from the canvas so this line isn't blank —
  // once a fresh ChapterOutcome exists, it upgrades to "present AND
  // connected" (§8.3), matching evaluateChapter's own pass criteria exactly
  // instead of a looser presence-only approximation.
  const presentComponentIds = new Set(
    nodes.filter((n): n is ComponentNodeType => n.type === "component").map((n) => n.data.componentId),
  );
  const requiredTotal = chapter.requiredComponentIds.length;
  const requiredPresentCount = chapter.requiredComponentIds.filter((id) => presentComponentIds.has(id)).length;
  const requiredConnectedCount = outcome
    ? requiredTotal - outcome.missingRequiredComponentIds.length - outcome.disconnectedRequiredComponentIds.length
    : requiredPresentCount;
  const requiredCountLabel = outcome ? "present and connected" : "present";

  const violations = outcome?.violations ?? null;
  const validationSummary =
    violations === null
      ? "Not yet validated"
      : violations.length === 0
        ? "Last validated: passing"
        : `Last validated: ${violations.length} issue${violations.length === 1 ? "" : "s"}`;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-xs text-foreground/60 hover:text-foreground"
        >
          <ArrowLeft size={12} />
          All chapters
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrev}
            disabled={!onPrev}
            aria-label="Previous chapter"
            className="rounded p-1 text-foreground/50 hover:bg-border hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!onNext}
            aria-label="Next chapter"
            className="rounded p-1 text-foreground/50 hover:bg-border hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 p-3">
        <h2 className="text-sm font-semibold">{chapter.title}</h2>
        <div className="mt-2">
          <MarkdownRenderer content={chapter.problemStatement} />
        </div>

        {chapter.learningObjectives.length > 0 && (
          <div className="mt-4">
            <h3 className="text-xs font-semibold tracking-wide text-foreground/60 uppercase">
              Learning objectives
            </h3>
            <ul className="mt-1.5 list-disc pl-5 text-sm text-foreground/80">
              {chapter.learningObjectives.map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
          </div>
        )}

        {requiredTotal > 0 && (
          <p className="mt-4 text-xs text-foreground/60">
            {requiredConnectedCount} / {requiredTotal} required components {requiredCountLabel} ·{" "}
            {validationSummary}
          </p>
        )}

        {/* Plain, not celebratory — this app isn't a game (CLAUDE.md). */}
        {outcome?.passed && <p className="mt-2 text-xs text-state-valid">Chapter complete.</p>}

        {outcome?.passed && (
          <Debrief blueprints={chapter.blueprints} matchedBlueprintId={outcome.matchedBlueprintId} />
        )}

        {chapter.hints.length > 0 && (
          <div className="mt-4">
            <h3 className="text-xs font-semibold tracking-wide text-foreground/60 uppercase">Hints</h3>
            <div className="mt-1.5 flex flex-col gap-1.5">
              {chapter.hints.map((hint) => (
                <HintDisclosure
                  key={hint.id}
                  hint={hint}
                  revealed={revealedHintIds.has(hint.id)}
                  onReveal={() => setRevealedHintIds((prev) => new Set(prev).add(hint.id))}
                />
              ))}
            </div>
          </div>
        )}

        {chapter.readingLinks.length > 0 && (
          <div className="mt-4">
            <h3 className="text-xs font-semibold tracking-wide text-foreground/60 uppercase">Further reading</h3>
            <ul className="mt-1.5 flex flex-col gap-1 text-sm">
              {chapter.readingLinks.map((link) => (
                <li key={link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-edge-request-flow underline underline-offset-2 hover:opacity-80"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function HintDisclosure({ hint, revealed, onReveal }: { hint: Hint; revealed: boolean; onReveal: () => void }) {
  return (
    <div className="rounded-md border border-border">
      {!revealed ? (
        <button
          type="button"
          onClick={onReveal}
          aria-expanded={false}
          className="w-full px-2.5 py-1.5 text-left text-sm text-foreground/70 hover:bg-border/40"
        >
          Show hint
        </button>
      ) : (
        <div aria-expanded={true} className="px-2.5 py-1.5">
          <MarkdownRenderer content={hint.body} />
        </div>
      )}
    </div>
  );
}
