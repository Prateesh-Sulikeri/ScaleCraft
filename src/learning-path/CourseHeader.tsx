import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/app/ThemeToggle";
import { DownloadCurriculumButton } from "./DownloadCurriculumButton";
import { OverallProgress } from "./OverallProgress";
import type { Course } from "@/curriculum/types";
import type { CourseSummary } from "@/curriculum/progress";

type CourseHeaderProps = {
  course: Course;
  summary: CourseSummary;
};

/** The Learning Path's entire header region: the page's own header strip
 *  (home link, Download Curriculum, theme toggle — there is no AppHeader or
 *  SidebarShell here to carry them) plus the title/subtitle/progress block
 *  below it. */
export function CourseHeader({ course, summary }: CourseHeaderProps) {
  return (
    <div className="flex flex-col gap-6 pb-6">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-md border border-border bg-panel px-3 py-1.5 text-sm font-medium text-foreground/70 hover:text-foreground"
        >
          <ArrowLeft size={14} />
          ScaleCraft
        </Link>
        <div className="flex items-center gap-2">
          <DownloadCurriculumButton />
          <ThemeToggle />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-[28px] font-semibold text-foreground">{course.title}</h1>
        <p className="text-base text-foreground/60">{course.subtitle}</p>
      </div>

      <OverallProgress summary={summary} courseId={course.id} />
    </div>
  );
}
