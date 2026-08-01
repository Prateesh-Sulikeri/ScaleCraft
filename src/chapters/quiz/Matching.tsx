import { Check, X } from "lucide-react";
import { MarkdownRenderer } from "@/canvas/docs-panel/markdown/MarkdownRenderer";
import type { QuizQuestion } from "@/content/chapters/types";

type MatchingProps = {
  question: QuizQuestion;
  /** LeftLabel -> chosen option id. */
  selections: Record<string, string>;
  onSelect: (leftLabel: string, optionId: string) => void;
  disabled: boolean;
  revealed: boolean;
};

/** Left column of prompts, each with a select of right-side options — 3-5
 * pairs per .claude/docs/QUIZ_FRAMEWORK.md §2. */
export function Matching({ question, selections, onSelect, disabled, revealed }: MatchingProps) {
  const pairs = question.pairs ?? [];
  const optionById = new Map(question.options.map((o) => [o.id, o]));

  return (
    <div className="flex flex-col gap-2">
      {pairs.map(([leftLabel, correctOptionId]) => {
        const chosenId = selections[leftLabel];
        const correctOption = optionById.get(correctOptionId);
        const isCorrect = revealed && chosenId === correctOptionId;
        const isIncorrect = revealed && chosenId !== undefined && chosenId !== correctOptionId;

        return (
          <div
            key={leftLabel}
            className={`rounded-md border p-2 ${
              !revealed ? "border-border" : isCorrect ? "border-state-valid" : "border-state-error"
            }`}
          >
            <div className="flex items-center gap-2 text-sm">
              <span className="flex-1">{leftLabel}</span>
              <select
                value={chosenId ?? ""}
                disabled={disabled}
                onChange={(e) => onSelect(leftLabel, e.target.value)}
                className="rounded-md border border-border bg-background px-2 py-1 text-sm"
                aria-label={`Match for "${leftLabel}"`}
              >
                <option value="" disabled>
                  Choose...
                </option>
                {question.options.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
              {isCorrect && <Check size={14} className="shrink-0 text-state-valid" />}
              {isIncorrect && <X size={14} className="shrink-0 text-state-error" />}
            </div>
            {revealed && correctOption && (
              <div className="mt-1.5 text-xs text-foreground/70">
                <MarkdownRenderer content={correctOption.explanationMd} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
