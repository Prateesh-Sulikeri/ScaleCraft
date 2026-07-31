"use client";

import { useEffect, useRef, useState } from "react";
import { MarkdownRenderer } from "@/canvas/docs-panel/markdown/MarkdownRenderer";
import type { QuizQuestion } from "@/content/chapters/types";
import { evaluateAnswer, type QuizAnswer } from "./evaluate";
import { SingleChoice } from "./SingleChoice";
import { EstimateChoice } from "./EstimateChoice";
import { MultiChoice } from "./MultiChoice";
import { Ordering } from "./Ordering";
import { Matching } from "./Matching";
import { DiagramQuestion } from "./DiagramQuestion";

const DIFFICULTY_COLOR: Record<1 | 2 | 3, string> = {
  1: "bg-state-valid",
  2: "bg-state-warning",
  3: "bg-state-error",
};

/** Same 3-dot meter convention as learning-path/DifficultyDots, but that
 * component is typed against the curriculum's Difficulty enum
 * ("foundational"/"intermediate"/"advanced") — quiz questions rank 1|2|3
 * instead, so this mirrors the visual pattern rather than the component
 * itself. Ramp position, not a score. */
function QuizDifficultyDots({ difficulty }: { difficulty: 1 | 2 | 3 }) {
  return (
    <span className="flex shrink-0 items-center gap-0.5" aria-hidden="true">
      {([1, 2, 3] as const).map((tier) => (
        <span
          key={tier}
          className={`h-1.5 w-1.5 rounded-full ${tier <= difficulty ? DIFFICULTY_COLOR[difficulty] : "bg-border"}`}
        />
      ))}
    </span>
  );
}

type QuizQuestionCardProps = {
  question: QuizQuestion;
  /** Already mastered (answered correctly at least once, ever) — re-attempting
   * never un-masters it, so onCorrect is skipped once true. */
  mastered: boolean;
  onCorrect: () => void;
};

export function QuizQuestionCard({ question, mastered, onCorrect }: QuizQuestionCardProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [order, setOrder] = useState<string[]>(() => question.options.map((o) => o.id));
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [reviewed, setReviewed] = useState(false);
  const [result, setResult] = useState<{ correct: boolean } | null>(null);
  const resultRegionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reviewed) resultRegionRef.current?.focus();
  }, [reviewed]);

  const pairs = question.pairs ?? [];

  const currentAnswer: QuizAnswer | null =
    question.kind === "single" || question.kind === "estimate" || question.kind === "diagram"
      ? selectedId
        ? { kind: question.kind, optionId: selectedId }
        : null
      : question.kind === "multi"
        ? selectedIds.length > 0
          ? { kind: "multi", optionIds: selectedIds }
          : null
        : question.kind === "ordering"
          ? { kind: "ordering", order }
          : pairs.length > 0 && pairs.every(([left]) => selections[left])
            ? { kind: "matching", selections }
            : null;

  const canSubmit = currentAnswer !== null && !reviewed;

  function handleSubmit() {
    if (!currentAnswer) return;
    const evaluation = evaluateAnswer(question, currentAnswer);
    setResult(evaluation);
    setReviewed(true);
    if (evaluation.correct && !mastered) onCorrect();
  }

  function handleTryAgain() {
    setReviewed(false);
    setResult(null);
    setSelectedId(null);
    setSelectedIds([]);
    setOrder(question.options.map((o) => o.id));
    setSelections({});
  }

  return (
    <div className="rounded-md border border-border p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 text-sm text-foreground/90">
          <MarkdownRenderer content={question.prompt} />
        </div>
        <div className="mt-1 shrink-0">
          <QuizDifficultyDots difficulty={question.difficulty} />
        </div>
      </div>

      <div className="mt-3">
        {question.kind === "single" && (
          <SingleChoice
            question={question}
            selectedId={selectedId}
            onSelect={setSelectedId}
            disabled={reviewed}
            revealed={reviewed}
          />
        )}
        {question.kind === "estimate" && (
          <EstimateChoice
            question={question}
            selectedId={selectedId}
            onSelect={setSelectedId}
            disabled={reviewed}
            revealed={reviewed}
          />
        )}
        {question.kind === "multi" && (
          <MultiChoice
            question={question}
            selectedIds={selectedIds}
            onToggle={(id) =>
              setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
            }
            disabled={reviewed}
            revealed={reviewed}
          />
        )}
        {question.kind === "ordering" && (
          <Ordering question={question} order={order} onReorder={setOrder} disabled={reviewed} revealed={reviewed} />
        )}
        {question.kind === "matching" && (
          <Matching
            question={question}
            selections={selections}
            onSelect={(left, id) => setSelections((prev) => ({ ...prev, [left]: id }))}
            disabled={reviewed}
            revealed={reviewed}
          />
        )}
        {question.kind === "diagram" && (
          <DiagramQuestion
            question={question}
            selectedId={selectedId}
            onSelect={setSelectedId}
            disabled={reviewed}
            revealed={reviewed}
          />
        )}
      </div>

      <div
        ref={resultRegionRef}
        tabIndex={-1}
        role="region"
        aria-label="Result"
        aria-live="polite"
        className="mt-3 outline-none"
      >
        {!reviewed ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:enabled:bg-border/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Submit
          </button>
        ) : (
          <div className="flex items-center gap-3">
            {/* Plain, not celebratory — this app isn't a game (CLAUDE.md). */}
            <p className={`text-sm ${result?.correct ? "text-state-valid" : "text-foreground/70"}`}>
              {result?.correct ? "Correct." : "Not quite — see the explanations above."}
            </p>
            <button
              type="button"
              onClick={handleTryAgain}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-border/40"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
