const LESSONS_DIR = "/content/chapters";

/**
 * Builds a chapter's Chapter Reader body URL, keyed by ChapterDefinition.id
 * (not the curriculum slug) - fetched client-side by ChapterReader via
 * useMarkdownFile, the same public/ static-asset pattern
 * ComponentDefinition.docsFile uses. Lesson files should not open with their
 * own top-level `#` heading - ChapterReader already renders
 * ChapterDefinition.title as the page's h1, so a second one would duplicate
 * it. Start the file at the intro paragraph or a `##` section instead.
 */
export function getLessonFileUrl(chapterId: string): string {
  return `${LESSONS_DIR}/${chapterId}.md`;
}
