const LESSONS_DIR = "/content/chapters";

/**
 * Builds a chapter's Chapter Reader body URL, keyed by ChapterDefinition.id
 * (not the curriculum slug) - fetched client-side by ChapterReader via
 * useMarkdownFile, the same public/ static-asset pattern
 * ComponentDefinition.docsFile uses. Lesson files should not open with their
 * own top-level `#` heading - ChapterReader already renders
 * ChapterDefinition.title as the page's h1, so a second one would duplicate
 * it. Start the file at the intro paragraph or a `##` section instead.
 *
 * `ChapterDefinition.lessonFormat: "mdx"` chapters don't use this - they're
 * compiled server-side by the `/api/lessons/[chapterId]` route instead, see
 * `getLessonMdxFilename`.
 */
export function getLessonFileUrl(chapterId: string): string {
  return `${LESSONS_DIR}/${chapterId}.md`;
}

/** Filename (not a URL - read via `fs` server-side, not fetched) for an
 * MDX-format chapter lesson, same `public/content/chapters/` directory and
 * `<chapterId>` key as the legacy `.md` convention above. */
export function getLessonMdxFilename(chapterId: string): string {
  return `${chapterId}.mdx`;
}
