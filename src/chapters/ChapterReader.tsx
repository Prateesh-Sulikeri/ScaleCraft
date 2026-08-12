"use client";

import { useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { PageEnter } from "@/app/PageEnter";
import { ThemeToggle } from "@/app/ThemeToggle";
import { ReaderSidebar } from "./ReaderSidebar";
import { ReadingProgress } from "./ReadingProgress";
import { TableOfContents } from "./TableOfContents";
import { NextChapterLink } from "./NextChapterLink";
import { YourTurnCard } from "./YourTurnCard";
import { DifficultyDots } from "@/learning-path/DifficultyDots";
import { getCourse, findEntry, nextEntry } from "@/curriculum";
import { getChapter, useChapterLesson } from "@/content/content-service";
import type { ChapterDefinition } from "@/content/chapters/types";
import { appendKnowledgeCheckHeading, extractHeadings } from "./extract-headings";
import { splitMarkdownAtNextSection } from "./split-markdown";
import { useChapterLessonMdx } from "./use-chapter-lesson-mdx";

// This is the lesson page's primary content, so both keep SSR (no
// ssr:false) - still a real chunk-splitting win since MarkdownRenderer pulls
// in react-markdown/remark/rehype and MdxContent pulls in @mdx-js/mdx's
// run(), and a chapter only ever needs one or the other.
const MarkdownRenderer = dynamic(() =>
  import("@/canvas/docs-panel/markdown/MarkdownRenderer").then((m) => m.MarkdownRenderer),
);
const MdxContent = dynamic(() => import("@/canvas/docs-panel/markdown/MdxContent").then((m) => m.MdxContent));

type ChapterReaderProps = {
  mode: ChapterDefinition["mode"];
  chapterSlug: string;
};

/**
 * The documentation-style reading page between the Learning Path and the
 * Design Editor canvas — `/<mode>/<chapterSlug>/lesson`. No AppHeader (same
 * posture as the Learning Path itself): a fixed, always-expanded
 * ReaderSidebar on the left (curriculum-only nav — not collapsible or
 * resizable, unlike the Design Editor's SidebarShell), the lesson prose
 * center (its own sticky reading-progress bar pinned to the top), "On this
 * page" TOC on the right. The canvas route (`/<mode>/<chapterSlug>`) and its
 * ChapterWorkspace/QuestionPane are untouched — this page never renders
 * problem statement/objectives/hints, that's still the workspace's job once
 * a learner clicks through.
 */
export function ChapterReader({ mode, chapterSlug }: ChapterReaderProps) {
  const course = getCourse(mode);
  // Guaranteed non-null by the route guard in practice — kept as a real
  // lookup so a stale/bad slug degrades to the defensive null return below.
  const entry = findEntry(mode, chapterSlug);
  const chapter = entry?.chapterDefinitionId ? (getChapter(entry.chapterDefinitionId) ?? null) : null;
  const hasNextEntry = nextEntry(mode, chapterSlug) !== undefined;

  const articleRef = useRef<HTMLDivElement>(null);

  // Falls back to the chapter's problemStatement while the fetch is in
  // flight and if it 404s - same fallback convention as
  // DocsTabContent/useComponentDocs for component docsFile. Exactly one of
  // the two hooks below is active per chapter, gated on lessonFormat - see
  // the MDX migration note on ChapterDefinition.lessonFormat.
  const isMdx = chapter?.lessonFormat === "mdx";
  const lessonMarkdown = useChapterLesson(isMdx ? undefined : chapter?.id);
  const lessonMdx = useChapterLessonMdx(isMdx ? chapter?.id : undefined, chapter?.lessonVersion);
  const markdown = isMdx ? (lessonMdx?.raw ?? chapter?.problemStatement ?? "") : (lessonMarkdown ?? chapter?.problemStatement ?? "");
  const headings = extractHeadings(markdown);
  const { beforeNext, nextSection, hasNextSection: hasNextSectionMd } = splitMarkdownAtNextSection(markdown);
  const hasNextSection = isMdx ? lessonMdx?.nextCompiled != null : hasNextSectionMd;

  if (!chapter || !entry) return null;

  const tocHeadings = appendKnowledgeCheckHeading(headings, !!chapter.quiz?.length);

  return (
    <PageEnter>
      <main className="relative flex min-h-0 flex-1 overflow-hidden">
        <aside className="flex w-60 shrink-0 flex-col overflow-hidden border-r border-border">
          <ReaderSidebar course={course} chapterSlug={chapterSlug} />
        </aside>

        <div ref={articleRef} className="relative min-h-0 flex-1 overflow-y-auto">
          <ReadingProgress targetRef={articleRef} />
          <div className="mx-auto max-w-2xl px-6 py-10">
            <p className="text-xs font-medium tracking-wide text-foreground/50 uppercase">
              {entry.number ? `${entry.number} · ` : ""}
              {course.title}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{chapter.title}</h1>
              {chapter.placeholder && (
                <span className="shrink-0 rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-foreground/70">
                  Draft
                </span>
              )}
            </div>
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-foreground/60">
              <DifficultyDots difficulty={entry.difficulty} />
              {entry.difficulty}
            </p>

            {entry.domain && (
              <div className="mt-3">
                <span className="inline-block rounded-md bg-border/40 px-2 py-1 text-xs font-medium text-foreground/80">
                  {entry.domain}
                </span>
              </div>
            )}

            {entry.prerequisiteSlugs.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-medium tracking-wide text-foreground/50 uppercase">
                  Prerequisites
                </span>
                {entry.prerequisiteSlugs.map((slug) => {
                  const prereq = findEntry(mode, slug);
                  if (!prereq) return null;
                  const label = prereq.number ? `${prereq.number} ${prereq.title}` : prereq.title;
                  return prereq.chapterDefinitionId ? (
                    <Link
                      key={slug}
                      href={`/${mode}/${slug}/lesson`}
                      className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-foreground/70 transition-colors hover:border-foreground/40 hover:text-foreground"
                    >
                      {label}
                    </Link>
                  ) : (
                    <span
                      key={slug}
                      className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-foreground/40"
                    >
                      {label}
                    </span>
                  );
                })}
              </div>
            )}

            <div className="mt-8">
              {isMdx ? (
                lessonMdx && <MdxContent compiledSource={lessonMdx.beforeCompiled} />
              ) : (
                <MarkdownRenderer content={beforeNext} />
              )}
            </div>

            <YourTurnCard chapter={chapter} mode={mode} chapterSlug={chapterSlug} />

            {hasNextSection && (
              <div className="mt-8">
                {isMdx ? (
                  lessonMdx?.nextCompiled && <MdxContent compiledSource={lessonMdx.nextCompiled} />
                ) : (
                  <MarkdownRenderer content={nextSection} />
                )}
              </div>
            )}

            {hasNextEntry && (
              <div className="mt-10 border-t border-border pt-6">
                <NextChapterLink courseId={mode} chapterSlug={chapterSlug} variant="card" />
              </div>
            )}
          </div>
        </div>

        <aside className="hidden w-56 shrink-0 flex-col gap-3 overflow-y-auto border-l border-border px-4 py-10 xl:flex">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold tracking-wide text-foreground/50 uppercase">On this page</p>
            <ThemeToggle />
          </div>
          {/* Keyed on the chapter so scrollspy state (activeId) resets on
              navigation instead of carrying over a stale section from the
              previous chapter - see TableOfContents.tsx's docstring. */}
          <TableOfContents key={chapterSlug} headings={tocHeadings} targetRef={articleRef} />
        </aside>
      </main>
    </PageEnter>
  );
}
