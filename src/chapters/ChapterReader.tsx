"use client";

import { useRef } from "react";
import { PageEnter } from "@/app/PageEnter";
import { ThemeToggle } from "@/app/ThemeToggle";
import { ReaderSidebar } from "./ReaderSidebar";
import { ReadingProgress } from "./ReadingProgress";
import { TableOfContents } from "./TableOfContents";
import { DesignEditorCTA } from "./DesignEditorCTA";
import { QuizSection } from "./quiz/QuizSection";
import { MarkdownRenderer } from "@/canvas/docs-panel/markdown/MarkdownRenderer";
import { DifficultyDots } from "@/learning-path/DifficultyDots";
import { getCourse, findEntry } from "@/curriculum";
import { chapterRegistry } from "@/content/chapters";
import type { ChapterDefinition } from "@/content/chapters/types";
import { appendKnowledgeCheckHeading, type ExtractedHeading } from "./extract-headings";

type ChapterReaderProps = {
  mode: ChapterDefinition["mode"];
  chapterSlug: string;
  markdown: string;
  headings: ExtractedHeading[];
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
export function ChapterReader({ mode, chapterSlug, markdown, headings }: ChapterReaderProps) {
  const course = getCourse(mode);
  // Guaranteed non-null by the route guard in practice — kept as a real
  // lookup so a stale/bad slug degrades to the defensive null return below.
  const entry = findEntry(mode, chapterSlug);
  const chapter = entry?.chapterDefinitionId
    ? (chapterRegistry.find((c) => c.id === entry.chapterDefinitionId) ?? null)
    : null;

  const articleRef = useRef<HTMLDivElement>(null);

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

            <div className="mt-8">
              <MarkdownRenderer content={markdown} />
            </div>

            <QuizSection chapter={chapter} />

            <DesignEditorCTA mode={mode} chapterSlug={chapterSlug} />
          </div>
        </div>

        <aside className="hidden w-56 shrink-0 flex-col gap-3 overflow-y-auto border-l border-border px-4 py-10 xl:flex">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold tracking-wide text-foreground/50 uppercase">On this page</p>
            <ThemeToggle />
          </div>
          <TableOfContents headings={tocHeadings} targetRef={articleRef} />
        </aside>
      </main>
    </PageEnter>
  );
}
