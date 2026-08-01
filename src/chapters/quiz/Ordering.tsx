import { ChevronUp, ChevronDown } from "lucide-react";
import { MarkdownRenderer } from "@/canvas/docs-panel/markdown/MarkdownRenderer";
import type { QuizQuestion } from "@/content/chapters/types";

type OrderingProps = {
  question: QuizQuestion;
  /** Current sequence of option ids — starts as the authored option order. */
  order: string[];
  onReorder: (next: string[]) => void;
  disabled: boolean;
  revealed: boolean;
};

/** Up/down controls rather than drag — plain buttons are keyboard-reachable
 * and dependency-free (.claude/docs/pending-quiz-ui.md Phase 3 open
 * question 2). */
export function Ordering({ question, order, onReorder, disabled, revealed }: OrderingProps) {
  const correctOrder = question.correctOrder ?? [];
  const optionById = new Map(question.options.map((o) => [o.id, o]));

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    onReorder(next);
  }

  return (
    <ol className="flex flex-col gap-2">
      {order.map((optionId, index) => {
        const option = optionById.get(optionId);
        if (!option) return null;
        const inPlace = revealed && correctOrder[index] === optionId;

        return (
          <li
            key={optionId}
            className={`rounded-md border p-2 ${
              !revealed ? "border-border" : inPlace ? "border-state-valid" : "border-state-error"
            }`}
          >
            <div className="flex items-center gap-2 text-sm">
              <span className="w-4 shrink-0 text-foreground/50">{index + 1}.</span>
              <span className="flex-1">{option.label}</span>
              <div className="flex shrink-0 flex-col">
                <button
                  type="button"
                  aria-label={`Move "${option.label}" up`}
                  disabled={disabled || index === 0}
                  onClick={() => move(index, -1)}
                  className="rounded-sm p-0.5 text-foreground/60 hover:enabled:bg-border/40 disabled:opacity-30"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  aria-label={`Move "${option.label}" down`}
                  disabled={disabled || index === order.length - 1}
                  onClick={() => move(index, 1)}
                  className="rounded-sm p-0.5 text-foreground/60 hover:enabled:bg-border/40 disabled:opacity-30"
                >
                  <ChevronDown size={14} />
                </button>
              </div>
            </div>
            {revealed && (
              <div className="mt-1.5 pl-6 text-xs text-foreground/70">
                <MarkdownRenderer content={option.explanationMd} />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
