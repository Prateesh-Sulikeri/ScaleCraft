"use client";

import { useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useCanvasStore } from "@/canvas/store";
import type { ComponentNodeType } from "@/canvas/types";
import { MarkdownRenderer } from "@/canvas/docs-panel/markdown/MarkdownRenderer";
import type { ChapterDefinition, Hint } from "@/content/chapters/types";
import type { ValidationViolation } from "@/validation-engine/types";

type QuestionPaneProps = {
  chapter: ChapterDefinition;
  onBack: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  /** Mirrors ChapterWorkspace's own Validate-button state (same shape as
   * sandbox/page.tsx) so this progress line reflects the last run without
   * re-running anything itself. ChapterWorkspace now scopes the actual run
   * to the open chapter's own validationRuleIds (NEXT_STEPS.md Step 3, done
   * — see runValidation call site), not the full global registry. */
  violations: ValidationViolation[] | null;
  isStale: boolean;
};

/**
 * View 2 of ChapterSidebar — problem statement, objectives, a required-
 * components progress line, opt-in hints (never pre-expanded, per
 * CLAUDE.md's "hints vs. explanations" rule), reading links, and
 * prev/next/back chapter navigation.
 */
export function QuestionPane({ chapter, onBack, onPrev, onNext, violations, isStale }: QuestionPaneProps) {
  const nodes = useCanvasStore((s) => s.nodes);
  const [revealedHintIds, setRevealedHintIds] = useState<Set<string>>(new Set());

  const presentComponentIds = new Set(
    nodes.filter((n): n is ComponentNodeType => n.type === "component").map((n) => n.data.componentId),
  );
  const requiredPresentCount = chapter.requiredComponentIds.filter((id) => presentComponentIds.has(id)).length;

  const validationSummary =
    violations === null || isStale
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

        {chapter.requiredComponentIds.length > 0 && (
          <p className="mt-4 text-xs text-foreground/60">
            {requiredPresentCount} / {chapter.requiredComponentIds.length} required components present ·{" "}
            {validationSummary}
          </p>
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
