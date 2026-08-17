import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/app/ThemeToggle";
import { AppUserButton } from "@/app/AppUserButton";
import { CourseIllustration } from "./CourseIllustration";
import { CourseStats } from "./CourseStats";
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
};

/** The Learning Path's entire header region: the page's own header strip
 *  (home link, Download Curriculum, theme toggle, account - there is no
 *  AppHeader or SidebarShell here to carry them) plus the elevated course
 *  card below it.
 *
 *  The card is three columns on a wide screen - blueprint illustration,
 *  identity + progress, stat tiles - collapsing to illustration + identity
 *  with the tiles below, then to a single stack. The illustration is the only
 *  thing that drops out entirely (below `sm`), since it is the one piece
 *  carrying no information. */
export function CourseHeader({ course, summary, dayStreak }: CourseHeaderProps) {
  const CourseIcon = modeIcon[course.id];

  return (
    <div className="flex flex-col gap-5 pb-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-md border border-border bg-panel px-3 py-1.5 text-sm font-medium text-foreground/70 transition-colors duration-150 ease-out hover:text-foreground"
        >
          <ArrowLeft size={14} />
          ScaleCraft
        </Link>
        <div className="flex items-center gap-2">
          <DownloadCurriculumButton />
          <ThemeToggle />
          <AppUserButton />
        </div>
      </div>

      <section className="grid items-center gap-6 rounded-xl border border-border bg-panel p-5 sm:grid-cols-[minmax(0,180px)_minmax(0,1fr)] sm:gap-7 lg:p-6 xl:grid-cols-[200px_minmax(0,1fr)_auto] xl:gap-8">
        <div className="hidden h-[150px] sm:block xl:h-[170px]">
          <CourseIllustration courseId={course.id} />
        </div>

        <div className="flex min-w-0 flex-col gap-3.5">
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[var(--course-accent-line)] bg-[var(--course-accent-soft)] text-[var(--course-accent)]"
              aria-hidden="true"
            >
              <CourseIcon size={16} />
            </span>
            <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-foreground">{course.title}</h1>
          </div>

          <p className="max-w-xl text-pretty text-sm leading-relaxed text-foreground/60">{course.subtitle}</p>

          <OverallProgress summary={summary} />
        </div>

        {/* Spans both columns while it sits under the illustration+identity
         * row, and becomes its own third column only once there is room. */}
        <div className="sm:col-span-2 xl:col-span-1">
          <CourseStats summary={summary} dayStreak={dayStreak} />
        </div>
      </section>
    </div>
  );
}
