import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { HeldTransitionLink } from "@/app/HeldTransitionLink";
import { nextEntry, previousEntry } from "@/curriculum";
import type { CourseId, CurriculumChapter } from "@/curriculum/types";

const CARD = "group flex min-w-0 flex-1 flex-col gap-1 rounded-lg border px-5 py-4 transition-colors duration-150 ease-out";

function label(entry: CurriculumChapter) {
  return entry.number ? `${entry.number} ${entry.title}` : entry.title;
}

/**
 * The lesson footer: previous and next chapter in curriculum order. Next
 * keeps NextChapterLink's rules - a held transition into an authored lesson,
 * a dashed "Coming soon" card for an unauthored one. Previous only renders
 * when it is authored, since going back to a 404 helps nobody.
 */
export function ChapterPager({ courseId, chapterSlug }: { courseId: CourseId; chapterSlug: string }) {
  const before = previousEntry(courseId, chapterSlug);
  const prev = before?.chapterDefinitionId != null ? before : undefined;
  const next = nextEntry(courseId, chapterSlug);
  if (!prev && !next) return null;

  return (
    <nav aria-label="Previous and next chapter" className="mt-14 flex flex-col gap-3 border-t border-border pt-8 sm:flex-row">
      {prev ? (
        <Link
          href={`/${courseId}/${prev.slug}/lesson`}
          aria-label={`Previous: ${label(prev)}`}
          className={`${CARD} border-border hover:border-foreground/30 hover:bg-border/30`}
        >
          <span className="flex items-center gap-1.5 text-[13px] text-foreground/55">
            <ArrowLeft
              size={13}
              aria-hidden="true"
              className="transition-transform duration-150 ease-out group-hover:-translate-x-0.5 motion-reduce:transition-none"
            />
            Previous
          </span>
          <span className="truncate text-[15px] font-semibold text-foreground">{label(prev)}</span>
        </Link>
      ) : (
        <span className="hidden flex-1 sm:block" />
      )}

      {next &&
        (next.chapterDefinitionId ? (
          <HeldTransitionLink
            href={`/${courseId}/${next.slug}/lesson`}
            label="Loading the next chapter…"
            aria-label={`Next chapter: ${label(next)}`}
            className={`${CARD} items-end border-[var(--course-accent-line)] bg-[var(--course-accent-wash)] text-right hover:border-[var(--course-accent)]`}
          >
            <span className="flex items-center gap-1.5 text-[13px] text-[var(--course-accent)]">
              Next chapter
              <ArrowRight
                size={13}
                aria-hidden="true"
                className="transition-transform duration-150 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none"
              />
            </span>
            <span className="max-w-full truncate text-[15px] font-semibold text-foreground">{label(next)}</span>
          </HeldTransitionLink>
        ) : (
          <div className={`${CARD} cursor-not-allowed items-end border-dashed border-border/70 text-right`}>
            <span className="text-[13px] text-foreground/40">Next chapter · Coming soon</span>
            <span className="max-w-full truncate text-[15px] font-semibold text-foreground/45">{label(next)}</span>
          </div>
        ))}
    </nav>
  );
}
