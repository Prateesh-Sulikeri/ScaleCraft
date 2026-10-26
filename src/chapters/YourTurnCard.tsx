"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@clerk/nextjs";
import { Boxes, ListChecks, Tablet, type LucideIcon } from "lucide-react";
import { HeldTransitionLink } from "@/app/HeldTransitionLink";
import { useCurriculumProgressStore } from "@/curriculum/progress-store";
import { useRequireAuthAction } from "@/auth/useRequireAuthAction";
import { useIsLargeScreen } from "@/lib/use-large-screen";
import { bestExamScore, examLocked, examPassed, EXAM_PASS_THRESHOLD } from "@/curriculum/progress";
import type { ChapterDefinition } from "@/content/chapters/types";
import type { SubmittedExamAttempt } from "@/persistence/db";

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

function TaskIcon({ Icon }: { Icon: LucideIcon }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--course-accent-line)] bg-[var(--course-accent-soft)] text-[var(--course-accent)]"
    >
      <Icon size={17} strokeWidth={1.75} />
    </span>
  );
}

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
  const examBestByDefinition = useCurriculumProgressStore((s) => s.examBestByDefinition);
  const recordExamAttempt = useCurriculumProgressStore((s) => s.recordExamAttempt);
  const validationPassedDefinitionIds = useCurriculumProgressStore((s) => s.validationPassedDefinitionIds);
  const { requireAuth, dialog } = useRequireAuthAction();
  const { isSignedIn } = useAuth();
  // Same check as ScreenSizeGate: on a phone, say why instead of linking
  // straight into the block screen.
  const canOpenEditor = useIsLargeScreen();

  const [view, setView] = useState<null | "exam" | "results">(null);
  const [viewedAttempt, setViewedAttempt] = useState<SubmittedExamAttempt | null>(null);

  const rweGated = chapter.mode === "real-world-extraction" && !validationPassedDefinitionIds.has(chapter.id);
  const hasQuiz = !!chapter.quiz && chapter.quiz.length > 0 && !rweGated;
  const hasExercise = chapter.hasEditorExercise !== false;

  if (!hasQuiz && !hasExercise) return null;

  // One stored row per chapter, holding the best attempt and how many have
  // been taken - a beaten attempt is replaced, not kept (db.ts's ExamAttempt).
  const bestAttempt = examBestByDefinition.get(chapter.id);
  const best = bestExamScore(bestAttempt);
  const passed = examPassed(bestAttempt);
  const locked = examLocked(bestAttempt);
  const attemptCount = bestAttempt?.totalAttempts ?? 0;
  const exerciseDone = validationPassedDefinitionIds.has(chapter.id);

  const quizButtonClass = passed ? DONE_BUTTON : attemptCount > 0 ? FAILED_BUTTON : NEUTRAL_BUTTON;
  const exerciseButtonClass = exerciseDone ? DONE_BUTTON : NEUTRAL_BUTTON;

  async function handleSubmitted(attempt: SubmittedExamAttempt) {
    await recordExamAttempt(attempt);
    // Shows the attempt just submitted, not the stored best - a learner who
    // scored worse than last time still needs to see what they scored now.
    setViewedAttempt(attempt);
    setView("results");
  }

  function handleViewResult() {
    setViewedAttempt(bestAttempt ?? null);
    setView("results");
  }

  return (
    <div className="mt-10">
      <div data-testid="your-turn" className="rounded-xl border border-[var(--course-accent-line)] bg-[color:color-mix(in_srgb,var(--course-accent)_4%,var(--panel))]">
        {hasQuiz && (
          <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 gap-3.5">
              <TaskIcon Icon={ListChecks} />
              <div>
                <div className="flex items-center gap-2">
                  <h2 id="knowledge-check" className="scroll-mt-8 text-[15px] font-semibold text-foreground">
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

                <p className="mt-0.5 text-[13px] text-foreground/60">
                  {chapter.quiz!.length} question{chapter.quiz!.length === 1 ? "" : "s"} · {EXAM_PASS_THRESHOLD}% to pass
                </p>

                {attemptCount > 0 && (
                  <p className="mt-0.5 text-[13px] text-foreground/60">
                    {passed ? `Passed · ${best}%` : `Attempt ${attemptCount} · Best score ${best}%`}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => requireAuth(locked ? handleViewResult : () => setView("exam"))}
              className={`shrink-0 self-start rounded-md border px-4 py-2 sm:self-auto text-sm font-medium transition-colors ${quizButtonClass}`}
            >
              {locked ? "View your result" : attemptCount > 0 ? "Retake the quiz" : "Take the quiz"}
            </button>
          </div>
        )}

        {hasQuiz && hasExercise && <div role="separator" className="border-t border-[var(--course-accent-line)]" />}

        {hasExercise && (
          <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 gap-3.5">
              <TaskIcon Icon={Boxes} />
              <div>
                <h2 className="text-[15px] font-semibold text-foreground">Design exercise</h2>
                <p className="mt-0.5 max-w-[42ch] text-[13px] text-foreground/60">
                  Build it on the canvas and get validated against this chapter&apos;s target design.
                </p>
              </div>
            </div>
            {!canOpenEditor ? (
              <p className="inline-flex shrink-0 items-center gap-2 self-start text-[13px] text-foreground/60 sm:self-auto">
                <Tablet size={15} aria-hidden="true" />
                Open on a tablet or computer to build it
              </p>
            ) : isSignedIn ? (
              <HeldTransitionLink
                href={`/${mode}/${chapterSlug}`}
                label="Opening the Design Editor…"
                className={`inline-flex shrink-0 self-start items-center sm:self-auto justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${exerciseButtonClass}`}
              >
                Begin exercise <span aria-hidden="true">&#8594;</span>
              </HeldTransitionLink>
            ) : (
              <button
                type="button"
                onClick={() => requireAuth(() => {})}
                className={`inline-flex shrink-0 self-start items-center sm:self-auto justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${exerciseButtonClass}`}
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
