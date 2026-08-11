import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { chapterRegistry } from "@/content/chapters";
import { getLessonMdxFilename } from "@/content/chapters/lessons";
import { splitMarkdownAtNextSection } from "@/chapters/split-markdown";
import { compileLessonMdx } from "@/lib/mdx/compile-lesson-mdx";

/**
 * Serves a `lessonFormat: "mdx"` chapter's compiled lesson body -
 * `useChapterLessonMdx` fetches this instead of the legacy `.md` static
 * asset. Splits at "## Next" (same convention as the legacy path) *before*
 * compiling so YourTurnCard placement and TOC extraction keep working
 * against raw text, then compiles each half server-side - the client only
 * ever runs already-compiled JS, never parses Markdown itself.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ chapterId: string }> }) {
  const { chapterId } = await params;
  const chapter = chapterRegistry.find((c) => c.id === chapterId);
  if (!chapter || chapter.lessonFormat !== "mdx") {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  let raw: string;
  try {
    const filePath = join(process.cwd(), "public", "content", "chapters", getLessonMdxFilename(chapterId));
    raw = await readFile(filePath, "utf-8");
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const { beforeNext, nextSection, hasNextSection } = splitMarkdownAtNextSection(raw);
  const [beforeCompiled, nextCompiled] = await Promise.all([
    compileLessonMdx(beforeNext),
    hasNextSection ? compileLessonMdx(nextSection) : Promise.resolve(null),
  ]);

  return NextResponse.json({ raw, beforeCompiled, nextCompiled });
}
