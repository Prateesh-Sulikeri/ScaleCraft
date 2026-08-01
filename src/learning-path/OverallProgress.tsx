import { ProgressBar } from "./ProgressBar";
import { modeColorVar } from "@/lib/modes";
import type { CourseSummary } from "@/curriculum/progress";
import type { CourseId } from "@/curriculum/types";

type OverallProgressProps = {
  summary: CourseSummary;
  courseId: CourseId;
};

/** The course-level bar uses the mode-identity color (legitimate per
 *  DESIGN.md — that's a separate channel from validation state), while
 *  every SectionCard's own bar stays neutral — the two never mix within one
 *  bar, only across the course/section distinction. */
export function OverallProgress({ summary, courseId }: OverallProgressProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <ProgressBar
          percent={summary.percent}
          size="md"
          label={`Overall progress: ${summary.percent}%`}
          accentColor={modeColorVar[courseId]}
        />
        <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">{summary.percent}%</span>
      </div>
      <p className="text-[13px] text-foreground/60">
        {summary.completed} / {summary.total} chapters · {summary.sectionsCompleted} / {summary.sectionsTotal}{" "}
        sections
      </p>
    </div>
  );
}
