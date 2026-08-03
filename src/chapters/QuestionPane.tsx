"use client";

import { useState } from "react";
import { useCanvasStore } from "@/canvas/store";
import type { ComponentNodeType } from "@/canvas/types";
import { MarkdownRenderer } from "@/canvas/docs-panel/markdown/MarkdownRenderer";
import { useCurriculumProgressStore } from "@/curriculum/progress-store";
import { examPassed } from "@/curriculum/progress";
import { Debrief } from "./Debrief";
import { DifficultyDots } from "@/learning-path/DifficultyDots";
import { ChapterStatusIcon, chapterStatusLabel } from "@/learning-path/ChapterStatusIcon";
import type { ChapterDefinition, Hint } from "@/content/chapters/types";
import type { ChapterOutcome } from "@/engines";
import type { ChapterStatus, CurriculumChapter } from "@/curriculum/types";

type QuestionPaneProps = {
  chapter: ChapterDefinition;
  /** The Learning Path row backing this chapter — its difficulty renders
   *  next to the title (item 5). Curriculum navigation itself lives only in
   *  ChapterSidebar's "Back to lesson" link above this component, not here. */
  entry: CurriculumChapter;
  status: ChapterStatus;
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
 * CLAUDE.md's "hints vs. explanations" rule), reading links, and a
 * pull-only Debrief once passed.
 */
export function QuestionPane({ chapter, entry, status, chapterOutcome, isStale }: QuestionPaneProps) {
  const nodes = useCanvasStore((s) => s.nodes);
  const examAttemptsByDefinition = useCurriculumProgressStore((s) => s.examAttemptsByDefinition);
  const [revealedHintIds, setRevealedHintIds] = useState<Set<string>>(new Set());

  const outcome = isStale ? null : chapterOutcome;

  // Build passed but the chapter's exam (Reader-only, see QuizLauncher) isn't
  // passed yet — copy only, no badge, no nagging. Mirrors deriveStatus's own
  // COMPLETED-requires-exam-pass rule so this note and the status chip above
  // never disagree.
  const attempts = examAttemptsByDefinition.get(chapter.id) ?? [];
  const quizRemaining = !!outcome?.passed && !!chapter.quiz?.length && !examPassed(attempts);

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

  // A graph can have zero rule violations and still not be *correct* for
  // this chapter — a required component might be missing/disconnected, or
  // present-and-connected but not matching any declared blueprint. Either
  // way that's "allowed" (nothing caught as an anti-pattern), not "passing",
  // and conflating the two is exactly the beginner confusion this line
  // exists to avoid: a clean-looking canvas that never actually completes
  // the chapter. The specific reason now renders in the header's Validation
  // pane too (see chapter-outcome-violations.ts) — that's the one place to
  // look for "why"; this line just needs to never say "passing" when it
  // isn't, so it points there instead of duplicating the wording.
  const allowedButNotCorrect = outcome !== null && !outcome.passed && outcome.violations.length === 0;

  const validationSummary =
    outcome === null
      ? "Not yet validated"
      : outcome.passed
        ? "Last validated: passing"
        : violations && violations.length > 0
          ? `Last validated: ${violations.length} issue${violations.length === 1 ? "" : "s"}`
          : "Last validated: not yet passing - see Validate for details";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="flex-1 p-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">{chapter.title}</h2>
          {/* Marks throwaway/dummy *content* — distinct from "unauthored"
           * (the Learning Path's chapterDefinitionId: null), which never
           * reaches this component at all — see the doc comment on
           * ChapterDefinition.placeholder. */}
          {chapter.placeholder && (
            <span className="shrink-0 rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-foreground/70">
              Draft
            </span>
          )}
        </div>
        <div className="mt-1 flex items-center gap-3 text-[11px] text-foreground/60">
          <span className="flex items-center gap-1.5">
            <DifficultyDots difficulty={entry.difficulty} />
            {entry.difficulty}
          </span>
          <span className="flex items-center gap-1">
            <ChapterStatusIcon status={status} />
            {chapterStatusLabel(status)}
          </span>
        </div>
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
            {requiredConnectedCount} / {requiredTotal} required components {requiredCountLabel}
          </p>
        )}

        {/* Independent of the required-components line above — a blueprint
         * mismatch can happen even when a chapter declares no required
         * components at all, so this must not be nested inside that gate. */}
        <p className={`mt-1 text-xs ${allowedButNotCorrect ? "text-state-warning" : "text-foreground/60"}`}>
          {validationSummary}
        </p>

        {/* Plain, not celebratory — this app isn't a game (CLAUDE.md). */}
        {outcome?.passed && <p className="mt-2 text-xs text-state-valid">Chapter complete.</p>}

        {/* Copy only — no badge, no nagging. Points at the Reader's own
         * Knowledge check section rather than duplicating it here. */}
        {quizRemaining && <p className="mt-1 text-xs text-foreground/60">Knowledge check remaining.</p>}

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
