import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { Boxes, ChevronRight, Clock, ListChecks, Server } from "lucide-react";
import { DifficultyDots } from "@/learning-path/DifficultyDots";
import { chapterComponents } from "@/learning-path/chapter-components";
import { categoryColorVar } from "@/canvas/category-colors";
import { iconMap } from "@/canvas/icon-map";
import { findSection, getCourse, locateEntry } from "@/curriculum";
import type { ChapterDefinition } from "@/content/chapters/types";
import type { Course, CurriculumChapter } from "@/curriculum/types";

type LessonHeaderProps = {
  course: Course;
  entry: CurriculumChapter;
  chapter: ChapterDefinition;
};

const CHIP = "inline-flex items-center gap-1.5 rounded-md border border-border bg-panel px-2 py-1 text-[13px]";

function MetaItem({ children }: { children: ReactNode }) {
  return <span className="flex items-center gap-1.5">{children}</span>;
}

/** A labelled row of chips. The label column keeps every row's chips on one
 *  left edge. */
function ChipRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-4">
      <span className="w-24 shrink-0 text-[13px] text-foreground/50">{label}</span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

/**
 * The lesson's title block: where it sits in the course, what it costs to
 * read, what it ends with, and what it builds on. Everything a learner wants
 * to know before committing to a chapter, above the first paragraph.
 */
export function LessonHeader({ course, entry, chapter }: LessonHeaderProps) {
  const section = findSection(course.id, entry.slug);
  const components = chapterComponents(course.id, entry.slug);
  const quizCount = chapter.quiz?.length ?? 0;
  const hasExercise = chapter.hasEditorExercise !== false;
  // RWE briefs list Building Blocks checkpoints as prerequisites, so resolve
  // across courses. Unknown slugs drop out, and so does an empty row.
  const prereqs = entry.prerequisiteSlugs.flatMap((slug) => {
    const hit = locateEntry(slug);
    return hit ? [hit] : [];
  });

  return (
    <header className="border-b border-border pb-8">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[13px] text-foreground/55">
        <Link href={`/${course.id}`} className="transition-colors hover:text-foreground">
          {course.title}
        </Link>
        {section && (
          <>
            <ChevronRight size={13} aria-hidden="true" className="text-foreground/35" />
            <span>
              {section.label}: {section.title}
            </span>
          </>
        )}
      </nav>

      <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-2">
        {entry.number && (
          <span className="font-mono text-xl font-medium text-[var(--course-accent)]" aria-hidden="true">
            {entry.number}
          </span>
        )}
        <h1 className="text-balance text-[2rem] font-semibold leading-tight tracking-tight text-foreground sm:text-[2.25rem]">
          {chapter.title}
        </h1>
        {chapter.placeholder && (
          <span className="shrink-0 self-center rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-foreground/70">
            Draft
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-foreground/65">
        <MetaItem>
          <DifficultyDots difficulty={entry.difficulty} />
          <span className="capitalize">{entry.difficulty}</span>
        </MetaItem>
        <MetaItem>
          <Clock size={13} aria-hidden="true" className="text-foreground/45" />~{entry.estimatedMinutes} min
        </MetaItem>
        {quizCount > 0 && (
          <MetaItem>
            <ListChecks size={14} aria-hidden="true" className="text-foreground/45" />
            {quizCount}-question check
          </MetaItem>
        )}
        {hasExercise && (
          <MetaItem>
            <Boxes size={14} aria-hidden="true" className="text-foreground/45" />
            Design exercise
          </MetaItem>
        )}
        {entry.domain && (
          <span className="rounded-md bg-border/50 px-2 py-0.5 text-xs font-medium text-foreground/80">{entry.domain}</span>
        )}
      </div>

      {(components.length > 0 || prereqs.length > 0) && (
        <div className="mt-6 flex flex-col gap-3">
          {components.length > 0 && (
            <ChipRow label="Components">
              {components.map((def) => {
                const Icon = iconMap[def.icon] ?? Server;
                return (
                  <span
                    key={def.id}
                    className={`${CHIP} text-foreground/80`}
                    style={{ "--accent": categoryColorVar[def.category] } as CSSProperties}
                  >
                    <Icon size={13} strokeWidth={1.75} aria-hidden="true" style={{ color: "var(--accent)" }} />
                    {def.label}
                  </span>
                );
              })}
            </ChipRow>
          )}

          {prereqs.length > 0 && (
            <ChipRow label="Prerequisites">
              {prereqs.map(({ courseId, entry: prereq }) => {
                const base = prereq.number ? `${prereq.number} ${prereq.title}` : prereq.title;
                const label = courseId === course.id ? base : `${base} (${getCourse(courseId).title})`;
                // An unauthored slug 404s, so it stays a plain chip.
                return prereq.chapterDefinitionId ? (
                  <Link
                    key={prereq.slug}
                    href={`/${courseId}/${prereq.slug}/lesson`}
                    className={`${CHIP} text-foreground/80 transition-colors hover:border-foreground/35 hover:text-foreground`}
                  >
                    {label}
                  </Link>
                ) : (
                  <span key={prereq.slug} className={`${CHIP} text-foreground/40`}>
                    {label}
                  </span>
                );
              })}
            </ChipRow>
          )}
        </div>
      )}
    </header>
  );
}
