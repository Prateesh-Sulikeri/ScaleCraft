"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { ThemeToggle } from "@/app/ThemeToggle";
import { MarkdownRenderer } from "@/canvas/docs-panel/markdown/MarkdownRenderer";
import type { ChapterDefinition } from "@/content/chapters/types";
import type { ExamAttempt } from "@/persistence/db";
import type { QuizAnswer } from "../quiz/evaluate";
import { QuizDifficultyDots } from "../quiz/QuizDifficultyDots";
import { buildAttempt } from "./exam-attempt";
import { requestFullscreenBestEffort, exitFullscreenIfActive } from "./exam-fullscreen";
import { ExamQuestionBody } from "./ExamQuestionBody";
import { ExamQuestionNav } from "./ExamQuestionNav";
import { ExamConfirmSubmitDialog } from "./ExamConfirmSubmitDialog";

type ExamShellProps = {
  chapter: ChapterDefinition;
  attemptNumber: number;
  onSubmitted: (attempt: ExamAttempt) => void;
  onExit: () => void;
};

/**
 * The full-screen exam-taking surface — portaled to document.body (same
 * pattern as ComponentPicker's dialog) so it sits above the entire Reader,
 * not just its own slot. Owns the lifted `answersByQuestionId` +
 * `currentIndex` state that fixes the one real behavioral bug this pivot
 * exists to fix: the old per-question QuizQuestionCard's local state reset
 * on unmount, so navigating away and back lost an answer. Real fullscreen
 * (best-effort) plus this fixed-inset-0 layout together are the "proctored"
 * presentation — not anti-cheat (see exam-fullscreen.ts).
 */
export function ExamShell({ chapter, attemptNumber, onSubmitted, onExit }: ExamShellProps) {
  const quiz = useMemo(() => chapter.quiz ?? [], [chapter.quiz]);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersByQuestionId, setAnswersByQuestionId] = useState<Record<string, QuizAnswer>>({});
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  useEffect(() => {
    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    const el = containerRef.current;
    if (el) {
      void requestFullscreenBestEffort(el);
      el.focus();
    }
    return () => {
      if (el) exitFullscreenIfActive(el);
      lastFocusedRef.current?.focus?.();
    };
  }, []);

  const currentQuestion = quiz[currentIndex];

  const answeredIndices = useMemo(
    () => new Set(quiz.reduce<number[]>((acc, q, i) => (q.id in answersByQuestionId ? [...acc, i] : acc), [])),
    [quiz, answersByQuestionId],
  );
  const unansweredCount = quiz.length - answeredIndices.size;

  function goBack() {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }
  function goNext() {
    setCurrentIndex((i) => Math.min(quiz.length - 1, i + 1));
  }
  function handleExit() {
    if (containerRef.current) exitFullscreenIfActive(containerRef.current);
    onExit();
  }
  function submitNow() {
    const attempt = buildAttempt(chapter, answersByQuestionId, attemptNumber);
    if (containerRef.current) exitFullscreenIfActive(containerRef.current);
    onSubmitted(attempt);
  }
  function handleSubmitClick() {
    if (unansweredCount > 0) {
      setShowConfirmSubmit(true);
    } else {
      submitNow();
    }
  }

  // Window-level, not a dialog-scoped onKeyDown — same rationale as
  // ComponentPicker.tsx: a click on a non-focusable element inside the
  // dialog can move document.activeElement to <body>, an ancestor rather
  // than a descendant, which would silently stop a dialog-scoped listener.
  // Arrow-key nav is skipped when the event target is itself a form control
  // (Matching's <select>) so it doesn't hijack that control's own native
  // key handling.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        handleExit();
        return;
      }
      if (event.target instanceof HTMLSelectElement || event.target instanceof HTMLInputElement) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goBack();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz.length]);

  if (!currentQuestion) return null;

  return createPortal(
    <div
      ref={containerRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={`${chapter.title} exam`}
      className="fixed inset-0 z-[var(--z-modal)] flex flex-col bg-background outline-none"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-3">
        <p className="text-sm font-medium text-foreground">{chapter.title} — exam</p>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            onClick={handleExit}
            aria-label="Exit exam"
            className="rounded-md p-1.5 text-foreground/60 hover:bg-border/40 hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 text-base text-foreground/90">
              <MarkdownRenderer content={currentQuestion.prompt} />
            </div>
            <div className="mt-1 shrink-0">
              <QuizDifficultyDots difficulty={currentQuestion.difficulty} />
            </div>
          </div>

          <div className="mt-4">
            <ExamQuestionBody
              key={currentQuestion.id}
              question={currentQuestion}
              value={answersByQuestionId[currentQuestion.id]}
              onChange={(answer) =>
                setAnswersByQuestionId((prev) => ({ ...prev, [currentQuestion.id]: answer }))
              }
              disabled={false}
              revealed={false}
            />
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-center gap-3 border-t border-border px-6 py-4">
        <ExamQuestionNav
          total={quiz.length}
          currentIndex={currentIndex}
          answeredIndices={answeredIndices}
          onJump={setCurrentIndex}
          onBack={goBack}
          onNext={goNext}
        />
        <button
          type="button"
          onClick={handleSubmitClick}
          className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-border/40"
        >
          Submit exam
        </button>
      </div>

      {showConfirmSubmit && (
        <ExamConfirmSubmitDialog
          unansweredCount={unansweredCount}
          onCancel={() => setShowConfirmSubmit(false)}
          onConfirm={submitNow}
        />
      )}
    </div>,
    document.body,
  );
}
