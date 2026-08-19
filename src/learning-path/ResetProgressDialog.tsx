"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { CenteredModal } from "@/app/CenteredModal";
import { useCurriculumProgressStore } from "@/curriculum/progress-store";
import { allEntries, getCourse } from "@/curriculum";
import type { CourseId } from "@/curriculum/types";

/** What the learner has to type to arm the reset. Compared after trimming
 *  and lowercasing - the point is deliberate intent, not transcription
 *  accuracy, and failing someone over a stray capital is friction with no
 *  safety value. */
const CONFIRM_PHRASE = "reset progress";

type Stage = "warning" | "confirm" | "resetting" | { failed: string };

/**
 * Two-stage reset, modelled on GitHub's repository-deletion flow: a plain
 * warning first, then a type-the-phrase gate. The second stage is not
 * decoration - a single "are you sure?" is dismissed reflexively, and this
 * action has no undo, since the deleted rows are gone from both Dexie and
 * Postgres.
 *
 * Scoped to one course - it is opened from that course's own Learning Path
 * (ResetProgressCard). Resetting Building Blocks leaves Real World
 * Extraction untouched, which is why every string here names the course
 * rather than saying "all your progress".
 *
 * The day streak deliberately survives (see db.ts's StreakDays). That is
 * stated up front rather than buried: someone weighing a reset against a
 * long run needs to know the run is safe *before* they decide, not after.
 */
export function ResetProgressDialog({ courseId, onClose }: { courseId: CourseId; onClose: () => void }) {
  const course = getCourse(courseId);
  const resetCourse = useCurriculumProgressStore((s) => s.resetCourse);
  const inputs = useCurriculumProgressStore((s) => s.inputs);

  const [stage, setStage] = useState<Stage>("warning");
  const [typed, setTyped] = useState("");

  // Counted from live state so the warning quantifies what is actually at
  // stake rather than gesturing at "your progress" - "12 chapters" reads very
  // differently from "1", and the learner deserves the real number.
  const touched = allEntries(course).filter((entry) => {
    const row = inputs().rowsBySlug.get(entry.slug);
    return row?.lastVisitedAt != null || row?.manuallyCompletedAt != null;
  }).length;

  const armed = typed.trim().toLowerCase() === CONFIRM_PHRASE;

  const runReset = async () => {
    setStage("resetting");
    try {
      await resetCourse(courseId);
    } catch (err) {
      // resetCourse aborts before deleting anything if it cannot preserve the
      // streak first, so this path means progress is still fully intact - say
      // so, rather than leaving the learner unsure what landed.
      setStage({ failed: err instanceof Error ? err.message : "Something went wrong. Nothing was reset." });
      return;
    }
    // No navigation: this dialog is opened from the course's own Learning
    // Path, and resetCourse has already updated the progress store, so
    // closing drops the learner straight onto the wiped curriculum with
    // every row re-derived to Not started.
    onClose();
  };

  return (
    <CenteredModal title="Reset progress" onClose={stage === "resetting" ? () => {} : onClose}>
      {stage === "resetting" ? (
        <div className="flex items-center gap-2 py-6 text-sm text-foreground/70">
          <Loader2 size={15} className="animate-spin" aria-hidden="true" />
          Resetting {course.title}…
        </div>
      ) : typeof stage === "object" ? (
        <div className="flex flex-col gap-4">
          <div className="flex gap-3 rounded-md border border-state-error/40 bg-state-error/5 p-3">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-state-error" aria-hidden="true" />
            <div className="text-sm text-foreground/80">
              <p className="font-medium text-foreground">Nothing was reset</p>
              <p className="mt-1">{stage.failed}</p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground/80 transition-colors hover:border-foreground/40 hover:text-foreground"
            >
              Close
            </button>
            <button
              onClick={() => void runReset()}
              className="rounded-md bg-state-error px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Try again
            </button>
          </div>
        </div>
      ) : stage === "warning" ? (
        <div className="flex flex-col gap-4">
          <div className="flex gap-3 rounded-md border border-state-error/40 bg-state-error/5 p-3">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-state-error" aria-hidden="true" />
            <div className="text-sm text-foreground/80">
              <p className="font-medium text-foreground">
                This erases your {course.title} progress. It cannot be undone.
              </p>
              <p className="mt-1">
                {touched > 0
                  ? `${touched} chapter${touched === 1 ? "" : "s"} you have started or completed will go back to Not started.`
                  : "You have not started any chapters in this course yet."}
              </p>
            </div>
          </div>

          <div className="text-sm text-foreground/70">
            <p className="font-medium text-foreground">What gets erased</p>
            <ul className="mt-1.5 list-disc space-y-0.5 pl-5">
              <li>Chapter completions and Design Editor validation passes</li>
              <li>Every exam attempt and score</li>
              <li>The canvas you saved for each chapter, and its Deep Check history</li>
              <li>Which chapters you have opened</li>
            </ul>
          </div>

          <div className="text-sm text-foreground/70">
            <p className="font-medium text-foreground">What is kept</p>
            <ul className="mt-1.5 list-disc space-y-0.5 pl-5">
              <li>Your day streak and longest streak</li>
              <li>
                Your {getCourse(courseId === "building-blocks" ? "real-world-extraction" : "building-blocks").title}{" "}
                progress
              </li>
              <li>Your Sandbox canvas and your custom components</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={onClose}
              className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground/80 transition-colors hover:border-foreground/40 hover:text-foreground"
            >
              Not now
            </button>
            <button
              onClick={() => setStage("confirm")}
              className="rounded-md bg-state-error px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Reset anyway
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="text-sm text-foreground/80">
            <p>
              To confirm, type <span className="font-mono font-semibold text-foreground">{CONFIRM_PHRASE}</span> below.
            </p>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="sr-only">Type {CONFIRM_PHRASE} to confirm</span>
            <input
              autoFocus
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && armed) void runReset();
              }}
              placeholder={CONFIRM_PHRASE}
              aria-label={`Type ${CONFIRM_PHRASE} to confirm`}
              className="rounded-md border border-border bg-background px-3 py-1.5 font-mono text-sm text-foreground outline-none focus:border-foreground/40"
            />
          </label>

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground/80 transition-colors hover:border-foreground/40 hover:text-foreground"
            >
              Not now
            </button>
            {/* Disabled until the phrase matches - that gate *is* the
                confirmation, so there is nothing to submit before it. */}
            <button
              onClick={() => void runReset()}
              disabled={!armed}
              className="rounded-md bg-state-error px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Reset {course.title}
            </button>
          </div>
        </div>
      )}
    </CenteredModal>
  );
}
