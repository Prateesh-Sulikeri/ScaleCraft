"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useCurriculumProgressStore } from "@/curriculum/progress-store";
import { bestExamScore, examLocked, examPassed, EXAM_PASS_THRESHOLD } from "@/curriculum/progress";
import type { ChapterDefinition } from "@/content/chapters/types";
import type { ExamAttempt } from "@/persistence/db";

// Most lesson-page visits never take the exam - keep both out of the
// route's initial bundle until "Take the quiz" / "View your result" is
// actually clicked.
const ExamShell = dynamic(() => import("../exam/ExamShell").then((m) => m.ExamShell), { ssr: false });
const ExamResults = dynamic(() => import("../exam/ExamResults").then((m) => m.ExamResults), { ssr: false });

type QuizLauncherProps = {
  chapter: ChapterDefinition;
};

/**
 * "Knowledge check" launcher — the Reader's last content section before
 * DesignEditorCTA (.claude/docs/CURRICULUM.md §5.3 beat 15), same slot as
 * the old inline QuizSection it replaces. Renders nothing for chapters with
 * no quiz, and (Real World Extraction only) until the project's own Phase B
 * validation pass — a retrospective on a design the learner hasn't built
 * yet has nothing to retrospect on; Building Blocks carries no such gate.
 *
 * Owns the exam lifecycle end to end: launches the full-screen ExamShell,
 * is the only caller of recordExamAttempt on submit, and shows ExamResults
 * either right after submitting or via "Retake the quiz" (attempted, not yet
 * passed) / "View your result" (passed, locked) once attempts exist. Passing
 * is the only thing that locks the exam - unlimited attempts otherwise. See
 * .claude/docs/pending-quiz-ui.md addendum for the state design.
 */
export function QuizLauncher({ chapter }: QuizLauncherProps) {
  const examAttemptsByDefinition = useCurriculumProgressStore((s) => s.examAttemptsByDefinition);
  const recordExamAttempt = useCurriculumProgressStore((s) => s.recordExamAttempt);
  const validationPassedDefinitionIds = useCurriculumProgressStore((s) => s.validationPassedDefinitionIds);

  const [view, setView] = useState<null | "exam" | "results">(null);
  const [viewedAttempt, setViewedAttempt] = useState<ExamAttempt | null>(null);

  if (!chapter.quiz || chapter.quiz.length === 0) return null;
  if (chapter.mode === "real-world-extraction" && !validationPassedDefinitionIds.has(chapter.id)) return null;

  const attempts = examAttemptsByDefinition.get(chapter.id) ?? [];
  const best = bestExamScore(attempts);
  const passed = examPassed(attempts);
  const locked = examLocked(attempts);
  const bestAttempt = attempts.reduce<ExamAttempt | null>((acc, a) => (!acc || a.score > acc.score ? a : acc), null);
  const nextAttemptNumber = attempts.length + 1;

  async function handleSubmitted(attempt: ExamAttempt) {
    await recordExamAttempt(attempt);
    setViewedAttempt(attempt);
    setView("results");
  }

  function handleViewResult() {
    setViewedAttempt(bestAttempt);
    setView("results");
  }

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2">
        <h2 id="knowledge-check" className="text-lg font-semibold text-foreground">
          Knowledge check
        </h2>
        {/* Same Draft treatment as the chapter title/QuestionPane — dummy
         * quiz content on a placeholder chapter must never read as finished
         * curriculum. */}
        {chapter.placeholder && (
          <span className="shrink-0 rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-foreground/70">
            Draft
          </span>
        )}
      </div>

      <p className="mt-1.5 text-sm text-foreground/70">
        {chapter.quiz.length} question{chapter.quiz.length === 1 ? "" : "s"} · {EXAM_PASS_THRESHOLD}% to pass
      </p>

      {attempts.length > 0 && (
        <p className="mt-1 text-xs text-foreground/60">
          {passed ? `Passed · ${best}%` : `Attempt ${attempts.length} · Best score ${best}%`}
        </p>
      )}

      <button
        type="button"
        onClick={locked ? handleViewResult : () => setView("exam")}
        className="mt-3 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-border/40"
      >
        {locked ? "View your result" : attempts.length > 0 ? "Retake the quiz" : "Take the quiz"}
      </button>

      {view === "exam" && (
        <ExamShell
          chapter={chapter}
          attemptNumber={nextAttemptNumber}
          onSubmitted={(attempt) => void handleSubmitted(attempt)}
          onExit={() => setView(null)}
        />
      )}

      {view === "results" && viewedAttempt && (
        <ExamResults chapter={chapter} attempt={viewedAttempt} onReturn={() => setView(null)} />
      )}
    </div>
  );
}
