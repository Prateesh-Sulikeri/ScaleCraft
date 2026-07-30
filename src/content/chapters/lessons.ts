import { readFileSync } from "node:fs";
import { join } from "node:path";

const LESSONS_DIR = join(process.cwd(), "src/content/chapters/lessons");

/**
 * Reads a chapter's Chapter Reader body straight off disk, keyed by
 * ChapterDefinition.id (not the curriculum slug). fs-based, so this only
 * works in a Server Component or route handler — never import it into a
 * "use client" file. Returns null rather than throwing when a
 * ChapterDefinition has no authored lesson file yet. Lesson files should not
 * open with their own top-level `#` heading - ChapterReader already renders
 * ChapterDefinition.title as the page's h1, so a second one would duplicate
 * it. Start the file at the intro paragraph or a `##` section instead.
 */
export function getLessonMarkdown(chapterId: string): string | null {
  try {
    return readFileSync(join(LESSONS_DIR, `${chapterId}.md`), "utf-8");
  } catch {
    return null;
  }
}
