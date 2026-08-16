"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@clerk/nextjs";
import { HeldTransitionLink } from "@/app/HeldTransitionLink";
import { useCurriculumProgressStore } from "@/curriculum/progress-store";
import { useRequireAuthAction } from "@/auth/useRequireAuthAction";
import { bestExamScore, examLocked, examPassed, EXAM_PASS_THRESHOLD } from "@/curriculum/progress";
import type { ChapterDefinition } from "@/content/chapters/types";
import type { ExamAttempt } from "@/persistence/db";

// Most lesson-page visits never take the exam - keep both out of the
// route's initial bundle until "Take the quiz" / "View your result" is
// actually clicked.
const ExamShell = dynamic(() => import("./exam/ExamShell").then((m) => m.ExamShell), { ssr: false });
const ExamResults = dynamic(() => import("./exam/ExamResults").then((m) => m.ExamResults), { ssr: false });

type YourTurnCardProps = {
  chapter: ChapterDefinition;
  mode: ChapterDefinition["mode"];
  chapterSlug: string;
};

const NEUTRAL_BUTTON =
  "border-border bg-background text-foreground hover:bg-border/40";
// Second deliberate exception to "the Validate button is the system's only
// semantic-colored button" (DESIGN.md) - same border+text treatment (no
// fill, per the Two-Channel Rule), confirmed with the user: the reader
// needs an at-a-glance "already done" / "failed, try again" signal on
// exactly these two task buttons, nowhere else.
const DONE_BUTTON = "border-state-valid bg-background text-state-valid hover:bg-state-valid/10";
const FAILED_BUTTON = "border-state-error bg-background text-state-error hover:bg-state-error/10";

/**
 * "Your turn" task card - the Reader's last content section before the Next
 * section (.claude/docs/CURRICULUM.md §5.3 beat 15/16), combining what used
 * to be two separately-bordered cards (QuizLauncher's "Knowledge check" row
 * and DesignEditorCTA's "Design exercise" row) into one, divider between the
 * rows when both are present. Renders nothing for chapters with neither a
 * quiz nor an editor exercise, and (Real World Extraction only) until the
 * project's own Phase B validation pass - a retrospective on a design the
 * learner hasn't built yet has nothing to retrospect on.
 *
 * Owns the exam lifecycle end to end: launches the full-screen ExamShell,
 * is the only caller of recordExamAttempt on submit, and shows ExamResults
 * either right after submitting or via "Retake the quiz" (attempted, not yet
 * passed) / "View your result" (passed, locked) once attempts exist. Passing
 * is the only thing that locks the exam - unlimited attempts otherwise.
 *
 * The lesson reader hosting this card is public (Phase 11,
 * pending-6.1.0-poa.md), but the quiz and the exercise both write progress,
 * so both are gated at the click via useRequireAuthAction rather than the
 * route - a signed-out visitor sees AuthPromptDialog before being sent to
 * sign in. The exercise row swaps HeldTransitionLink for a plain button when
 * signed out (same visual treatment) so the click never reaches the Design
 * Editor's own route guard - that guard still exists as a backstop, but the
 * dialog is what a signed-out learner actually sees.
 *
 * Each row's button is neutral until there's something to report: green
 * once that row's task is done (quiz passed / exercise validated), red on
 * an attempted-but-not-passed quiz - never on the exercise row, which has
 * no "failed" state, only not-yet-done.
 */
export function YourTurnCard({ chapter, mode, chapterSlug }: YourTurnCardProps) {
  const examAttemptsByDefinition = useCurriculumProgressStore((s) => s.examAttemptsByDefinition);
  const recordExamAttempt = useCurriculumProgressStore((s) => s.recordExamAttempt);
  const validationPassedDefinitionIds = useCurriculumProgressStore((s) => s.validationPassedDefinitionIds);
  const { requireAuth, dialog } = useRequireAuthAction();
  const { isSignedIn } = useAuth();

  const [view, setView] = useState<null | "exam" | "results">(null);
  const [viewedAttempt, setViewedAttempt] = useState<ExamAttempt | null>(null);

  const rweGated = chapter.mode === "real-world-extraction" && !validationPassedDefinitionIds.has(chapter.id);
  const hasQuiz = !!chapter.quiz && chapter.quiz.length > 0 && !rweGated;
  const hasExercise = chapter.hasEditorExercise !== false;

  if (!hasQuiz && !hasExercise) return null;

  const attempts = examAttemptsByDefinition.get(chapter.id) ?? [];
  const best = bestExamScore(attempts);
  const passed = examPassed(attempts);
  const locked = examLocked(attempts);
  const bestAttempt = attempts.reduce<ExamAttempt | null>((acc, a) => (!acc || a.score > acc.score ? a : acc), null);
  const nextAttemptNumber = attempts.length + 1;
  const exerciseDone = validationPassedDefinitionIds.has(chapter.id);

  const quizButtonClass = passed ? DONE_BUTTON : attempts.length > 0 ? FAILED_BUTTON : NEUTRAL_BUTTON;
  const exerciseButtonClass = exerciseDone ? DONE_BUTTON : NEUTRAL_BUTTON;

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
      <div className="rounded-lg border border-border bg-panel">
        {hasQuiz && (
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 id="knowledge-check" className="text-sm font-semibold text-foreground">
                  Knowledge check
                </h2>
                {/* Same Draft treatment as the chapter title/QuestionPane —
                 * dummy quiz content on a placeholder chapter must never read
                 * as finished curriculum. */}
                {chapter.placeholder && (
                  <span className="shrink-0 rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-foreground/70">
                    Draft
                  </span>
                )}
              </div>

              <p className="mt-0.5 text-xs text-foreground/60">
                {chapter.quiz!.length} question{chapter.quiz!.length === 1 ? "" : "s"} · {EXAM_PASS_THRESHOLD}% to pass
              </p>

              {attempts.length > 0 && (
                <p className="mt-0.5 text-xs text-foreground/60">
                  {passed ? `Passed · ${best}%` : `Attempt ${attempts.length} · Best score ${best}%`}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => requireAuth(locked ? handleViewResult : () => setView("exam"))}
              className={`shrink-0 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${quizButtonClass}`}
            >
              {locked ? "View your result" : attempts.length > 0 ? "Retake the quiz" : "Take the quiz"}
            </button>
          </div>
        )}

        {hasQuiz && hasExercise && <div className="border-t border-border" />}

        {hasExercise && (
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Design exercise</h2>
              <p className="mt-0.5 text-xs text-foreground/60">
                Build it on the canvas and get validated against this chapter&apos;s target design.
              </p>
            </div>
            {isSignedIn ? (
              <HeldTransitionLink
                href={`/${mode}/${chapterSlug}`}
                label="Opening the Design Editor…"
                className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${exerciseButtonClass}`}
              >
                Begin exercise <span aria-hidden="true">&#8594;</span>
              </HeldTransitionLink>
            ) : (
              <button
                type="button"
                onClick={() => requireAuth(() => {})}
                className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${exerciseButtonClass}`}
              >
                Begin exercise <span aria-hidden="true">&#8594;</span>
              </button>
            )}
          </div>
        )}
      </div>

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

      {dialog}
    </div>
  );
}
