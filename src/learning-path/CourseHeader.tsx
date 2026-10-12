import Link from "next/link";
import { Flame, LogIn } from "lucide-react";
import { Tooltip } from "@/app/Tooltip";
import { CourseIllustration } from "./CourseIllustration";
import { DownloadCurriculumButton } from "./DownloadCurriculumButton";
import { OverallProgress } from "./OverallProgress";
import { modeIcon } from "@/lib/modes";
import type { Course } from "@/curriculum/types";
import type { CourseSummary } from "@/curriculum/progress";

type CourseHeaderProps = {
  course: Course;
  summary: CourseSummary;
  /** Consecutive active days, from the same timestamps Home reads. Passed in
   *  rather than derived here so the page has one clock. */
  dayStreak: number;
  /** False until the account's day log has been read - an unknown streak
   *  renders as a dash, never a confident number (see AtAGlanceCard). */
  streakKnown: boolean;
  /** Signed out there is nothing to show, so the progress block becomes a
   *  sign-in prompt instead of a 0% bar. */
  isSignedIn: boolean;
};

/** Signed-out stand-in for the progress block: the bar's shape, no data. */
function SignedOutProgress({ courseId }: { courseId: string }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div aria-hidden="true" className="h-2 w-full rounded-full bg-border/70" />
      <Link
        href={`/sign-in?redirect_url=${encodeURIComponent(`/${courseId}`)}`}
        className="inline-flex items-center gap-1.5 self-start text-[13px] font-medium text-[var(--course-accent)] hover:underline"
      >
        <LogIn size={13} aria-hidden="true" />
        Sign in to track your progress
      </Link>
    </div>
  );
}

/**
 * The course card at the top of the Learning Path. The page's top bar is
 * HomeHeader, shared with Home; Download Curriculum moved into this card.
 *
 * It used to carry four stat tiles (chapters, sections, overall %, streak),
 * three of which repeated the progress line beside them. The streak, the
 * one number not stated elsewhere, now rides on that line.
 */
export function CourseHeader({ course, summary, dayStreak, streakKnown, isSignedIn }: CourseHeaderProps) {
  const CourseIcon = modeIcon[course.id];

  return (
    <section className="mb-6 grid grid-cols-1 items-center gap-6 rounded-xl border border-[var(--course-accent-line)] bg-[color:color-mix(in_srgb,var(--course-accent)_4%,var(--panel))] p-5 sm:grid-cols-[minmax(0,200px)_minmax(0,1fr)] sm:gap-8 lg:p-7 xl:grid-cols-[240px_minmax(0,1fr)]">
      <div className="hidden h-[170px] sm:block xl:h-[200px]">
        <CourseIllustration courseId={course.id} />
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[var(--course-accent-line)] bg-[var(--course-accent-soft)] text-[var(--course-accent)]"
              aria-hidden="true"
            >
              <CourseIcon size={20} strokeWidth={1.5} />
            </span>
            <h1 className="text-[30px] font-semibold leading-tight tracking-tight text-foreground">{course.title}</h1>
          </div>
          <DownloadCurriculumButton />
        </div>

        <p className="max-w-xl text-pretty text-[15px] leading-relaxed text-foreground/65">{course.subtitle}</p>

        <div className="max-w-2xl">
          {isSignedIn ? (
            <OverallProgress
              summary={summary}
              extra={
                <Tooltip
                  label={
                    streakKnown
                      ? "Consecutive days you've worked on something, counted across every course."
                      : "Your activity history hasn't loaded yet. Check your connection."
                  }
                >
                  <p className="flex items-center gap-1">
                    <Flame size={13} className="text-foreground/45" aria-hidden="true" />
                    <span className="font-medium tabular-nums text-foreground/80">
                      {streakKnown ? dayStreak : "-"}
                    </span>{" "}
                    day streak
                  </p>
                </Tooltip>
              }
            />
          ) : (
            <SignedOutProgress courseId={course.id} />
          )}
        </div>
      </div>
    </section>
  );
}
