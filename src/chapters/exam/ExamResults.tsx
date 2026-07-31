import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { MarkdownRenderer } from "@/canvas/docs-panel/markdown/MarkdownRenderer";
import { EXAM_PASS_THRESHOLD } from "@/curriculum/progress";
import type { ChapterDefinition } from "@/content/chapters/types";
import type { ExamAttempt } from "@/persistence/db";
import { QuizDifficultyDots } from "../quiz/QuizDifficultyDots";
import { ExamQuestionBody } from "./ExamQuestionBody";

type ExamResultsProps = {
  chapter: ChapterDefinition;
  attempt: ExamAttempt;
  onReturn: () => void;
};

/**
 * Score banner + full per-question review — "every option always explains"
 * (.claude/docs/QUIZ_FRAMEWORK.md §1) survives the pivot, just deferred to
 * this end screen instead of shown per-question immediately (see
 * .claude/docs/pending-quiz-ui.md addendum). Reuses the same six kind-body
 * components as the live exam, `disabled revealed` instead of
 * `!disabled !revealed`. Same full-screen portaled chrome as ExamShell —
 * the exam ends here, not back on the lesson page, so the transition from
 * "Submit" to seeing the score stays in place. No fullscreen-API request of
 * its own though: results are review, not a proctored surface.
 */
export function ExamResults({ chapter, attempt, onReturn }: ExamResultsProps) {
  const passed = attempt.score >= EXAM_PASS_THRESHOLD;
  const questionById = new Map((chapter.quiz ?? []).map((q) => [q.id, q]));

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${chapter.title} exam results`}
      className="fixed inset-0 z-[var(--z-modal)] flex flex-col bg-background"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-3">
        <p className="text-sm font-medium text-foreground">{chapter.title} — results</p>
        <button
          type="button"
          onClick={onReturn}
          aria-label="Return to lesson"
          className="rounded-md p-1.5 text-foreground/60 hover:bg-border/40 hover:text-foreground"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          <div className={`rounded-md border p-4 ${passed ? "border-state-valid" : "border-border"}`}>
            <p className="text-2xl font-semibold text-foreground">{attempt.score}%</p>
            {/* Plain, not celebratory — this app isn't a game (CLAUDE.md). */}
            <p className={`text-sm ${passed ? "text-state-valid" : "text-foreground/70"}`}>
              {passed
                ? `Passed — ${EXAM_PASS_THRESHOLD}% required`
                : `Not yet passing — ${EXAM_PASS_THRESHOLD}% required`}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {attempt.answers.map((qa) => {
              const question = questionById.get(qa.questionId);
              if (!question) return null;
              const statusLabel = qa.answer === null ? "Not answered" : qa.correct ? "Correct" : "Incorrect";
              const statusColor =
                qa.answer === null ? "text-foreground/50" : qa.correct ? "text-state-valid" : "text-state-error";

              return (
                <div key={qa.questionId} className="rounded-md border border-border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 text-sm text-foreground/90">
                      <MarkdownRenderer content={question.prompt} />
                    </div>
                    <div className="mt-1 flex shrink-0 items-center gap-2">
                      <QuizDifficultyDots difficulty={question.difficulty} />
                      <span className={`text-xs font-medium ${statusColor}`}>{statusLabel}</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <ExamQuestionBody
                      question={question}
                      value={qa.answer ?? undefined}
                      onChange={() => {}}
                      disabled={true}
                      revealed={true}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onReturn}
            className="self-start rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-border/40"
          >
            Back to lesson
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
