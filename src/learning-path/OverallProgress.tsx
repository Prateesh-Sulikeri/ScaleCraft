import { ProgressBar } from "./ProgressBar";
import type { CourseSummary } from "@/curriculum/progress";

/**
 * The course-level bar reads `--course-accent` (learning-path/accent.ts) - the
 * hero blue on Building Blocks, this mode's own indigo on Real World
 * Extraction. One hue per page either way: it used to be possible for the bar
 * and the rest of the header to disagree, which read as two unrelated colors in
 * one card. Every SectionCard below stays neutral, so the accent still marks
 * exactly one thing here: overall progress.
 */
export function OverallProgress({ summary }: { summary: CourseSummary }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-3">
        <ProgressBar
          percent={summary.percent}
          size="md"
          label={`Overall progress: ${summary.percent}%`}
          accentColor="var(--course-accent)"
        />
        <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">{summary.percent}%</span>
      </div>
      {/* Chapters and sections are different granularities of the same
       *  status, not one sentence - split so each is independently
       *  scannable, with the count carrying more weight than its label. */}
      <div className="flex items-center gap-3 text-[13px] text-foreground/60">
        <p>
          <span className="font-medium tabular-nums text-foreground/80">
            {summary.completed} / {summary.total}
          </span>{" "}
          chapters
        </p>
        <span className="h-3 w-px shrink-0 bg-border" aria-hidden="true" />
        <p>
          <span className="font-medium tabular-nums text-foreground/80">
            {summary.sectionsCompleted} / {summary.sectionsTotal}
          </span>{" "}
          sections
        </p>
      </div>
    </div>
  );
}
