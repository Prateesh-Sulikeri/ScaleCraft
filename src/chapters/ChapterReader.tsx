"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@clerk/nextjs";
import { ListTree, Menu } from "lucide-react";
import { PageEnter } from "@/app/PageEnter";
import { MobileDrawer } from "@/app/MobileDrawer";
import { HomeHeader } from "@/home/HomeHeader";
import { courseAccentStyle } from "@/learning-path/accent";
import { LESSON_BODY_CLASSNAME } from "@/canvas/docs-panel/markdown/markdown-plugins";
import { ReaderSidebar } from "./ReaderSidebar";
import { ReadingProgress } from "./ReadingProgress";
import { TableOfContents } from "./TableOfContents";
import { ChapterPager } from "./ChapterPager";
import { LessonHeader } from "./LessonHeader";
import { YourTurnCard } from "./YourTurnCard";
import { getCourse, findEntry } from "@/curriculum";
import { getChapter, useChapterLesson } from "@/content/content-service";
import type { ChapterDefinition } from "@/content/chapters/types";
import { appendKnowledgeCheckHeading, extractHeadings } from "./extract-headings";
import { splitMarkdownAtNextSection } from "./split-markdown";
import { useChapterLessonMdx } from "./use-chapter-lesson-mdx";
import { useCurriculumProgressStore } from "@/curriculum/progress-store";

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
 * Design Editor canvas - `/<mode>/<chapterSlug>/lesson`. HomeHeader on top
 * (shared with Home and the Learning Path, so the account controls sit in one
 * place), then three columns: ReaderSidebar (curriculum), the article
 * (LessonHeader, the lesson body, YourTurnCard, ChapterPager), and the
 * "On this page" TOC. Problem statement, objectives and hints stay in the
 * Design Editor's QuestionPane.
 *
 * Below `lg` the sidebar becomes a MobileDrawer; below `xl` the TOC does too.
 * A slim bar under the header opens whichever rail is hidden.
 */
export function ChapterReader({ mode, chapterSlug }: ChapterReaderProps) {
  const course = getCourse(mode);
  // Guaranteed non-null by the route guard in practice — kept as a real
  // lookup so a stale/bad slug degrades to the defensive null return below.
  const entry = findEntry(mode, chapterSlug);
  const chapter = entry?.chapterDefinitionId ? (getChapter(entry.chapterDefinitionId) ?? null) : null;

  const articleRef = useRef<HTMLDivElement>(null);
  const [navOpen, setNavOpen] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);

  const { isSignedIn } = useAuth();
  const markVisited = useCurriculumProgressStore((s) => s.markVisited);

  // Opening the lesson is what starts a chapter, so IN_PROGRESS is written
  // here - not only in ChapterWorkspace. Before this, the status came solely
  // from the Design Editor mount, which the Learning Path never links to
  // directly (ChapterRow -> /lesson), so reading a chapter left it
  // NOT_STARTED, and the six hasEditorExercise: false chapters could never
  // reach IN_PROGRESS at all. Signed-out gate matches ReaderSidebar: no
  // anonymous local writes on a public route. The workspace keeps its own
  // markVisited - idempotent, just a later timestamp.
  useEffect(() => {
    if (!isSignedIn || entry == null) return;
    void markVisited(chapterSlug);
  }, [isSignedIn, entry, chapterSlug, markVisited]);

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
      <main style={courseAccentStyle(mode)} className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <HomeHeader container="w-full px-4 md:px-6" />

        {/* Below xl one of the two rails is gone, so this bar opens it as a
         * drawer. The account controls already live in HomeHeader. */}
        <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-1.5 xl:hidden">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            aria-label="Chapter navigation"
            aria-haspopup="dialog"
            className="flex h-8 w-8 items-center justify-center rounded-md text-foreground/70 hover:bg-border/40 hover:text-foreground lg:hidden"
          >
            <Menu size={16} />
          </button>
          <p className="min-w-0 truncate text-[13px] text-foreground/60">
            {entry.number && <span className="font-mono text-[var(--course-accent)]">{entry.number} </span>}
            {chapter.title}
          </p>
          {tocHeadings.length > 0 && (
            <button
              type="button"
              onClick={() => setTocOpen(true)}
              aria-label="On this page"
              aria-haspopup="dialog"
              className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-foreground/70 hover:bg-border/40 hover:text-foreground"
            >
              <ListTree size={16} />
            </button>
          )}
        </div>

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <aside className="hidden w-64 shrink-0 flex-col overflow-hidden border-r border-border lg:flex">
            <ReaderSidebar course={course} chapterSlug={chapterSlug} />
          </aside>

          {navOpen && (
            <MobileDrawer onClose={() => setNavOpen(false)} title="Chapter navigation">
              <ReaderSidebar course={course} chapterSlug={chapterSlug} />
            </MobileDrawer>
          )}

          <div ref={articleRef} className="relative min-h-0 flex-1 overflow-y-auto">
            <ReadingProgress targetRef={articleRef} />
            {/* 44rem minus the gutter keeps a 17px line near 75ch; the 2K step is a
                deliberate wider call (DESIGN.md, Measure). */}
            <article className="mx-auto max-w-[44rem] px-6 pb-20 pt-10 min-[1800px]:max-w-5xl">
              <LessonHeader course={course} entry={entry} chapter={chapter} />

              <div className="mt-10">
                {isMdx ? (
                  lessonMdx && <MdxContent compiledSource={lessonMdx.beforeCompiled} className={LESSON_BODY_CLASSNAME} />
                ) : (
                  <MarkdownRenderer content={beforeNext} className={LESSON_BODY_CLASSNAME} />
                )}
              </div>

              <YourTurnCard chapter={chapter} mode={mode} chapterSlug={chapterSlug} />

              {hasNextSection && (
                <div className="mt-12">
                  {isMdx ? (
                    lessonMdx?.nextCompiled && (
                      <MdxContent compiledSource={lessonMdx.nextCompiled} className={LESSON_BODY_CLASSNAME} />
                    )
                  ) : (
                    <MarkdownRenderer content={nextSection} className={LESSON_BODY_CLASSNAME} />
                  )}
                </div>
              )}

              <ChapterPager courseId={mode} chapterSlug={chapterSlug} />
            </article>
          </div>

          <aside className="hidden w-60 shrink-0 flex-col gap-3 overflow-y-auto border-l border-border px-5 py-10 xl:flex">
            <p className="text-[13px] font-semibold text-foreground">On this page</p>
            {/* Keyed on the chapter so scrollspy state (activeId) resets on
                navigation instead of carrying over a stale section from the
                previous chapter - see TableOfContents.tsx's docstring. */}
            <TableOfContents key={chapterSlug} headings={tocHeadings} targetRef={articleRef} />
          </aside>

          {tocOpen && (
            <MobileDrawer onClose={() => setTocOpen(false)} title="On this page" side="right">
              <div className="flex flex-col gap-3 px-5 py-10">
                <p className="text-[13px] font-semibold text-foreground">On this page</p>
                <TableOfContents
                  key={chapterSlug}
                  headings={tocHeadings}
                  targetRef={articleRef}
                  onNavigate={() => setTocOpen(false)}
                />
              </div>
            </MobileDrawer>
          )}
        </div>
      </main>
    </PageEnter>
  );
}
