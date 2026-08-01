import GithubSlugger from "github-slugger";

export type ExtractedHeading = {
  id: string;
  text: string;
  level: number;
};

const HEADING_RE = /^(#{1,6})\s+(.+?)\s*#*$/;
const FENCE_RE = /^(```|~~~)/;

/**
 * Extracts ATX headings (`# ...` through `###### ...`) from raw lesson
 * markdown, skipping anything inside a fenced code block. Uses
 * github-slugger directly — the same engine rehype-slug wraps internally —
 * so an id produced here matches the anchor MarkdownRenderer actually
 * renders for the same heading text, letting TableOfContents scroll-spy
 * against real DOM ids without re-parsing the rendered output.
 */
export function extractHeadings(markdown: string): ExtractedHeading[] {
  const slugger = new GithubSlugger();
  const headings: ExtractedHeading[] = [];
  let inFence = false;

  for (const line of markdown.split("\n")) {
    if (FENCE_RE.test(line.trim())) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = HEADING_RE.exec(line);
    if (!match) continue;

    const text = match[2].trim();
    headings.push({ id: slugger.slug(text), text, level: match[1].length });
  }

  return headings;
}

/**
 * Appends a synthetic "Knowledge check" entry pointing at QuizLauncher's own
 * `id="knowledge-check"` anchor — that heading lives in JSX, not the lesson
 * markdown, so extractHeadings never sees it. Level 2, matching the lesson's
 * other top-level sections; TableOfContents already filters to level >= 2.
 */
export function appendKnowledgeCheckHeading(headings: ExtractedHeading[], hasQuiz: boolean): ExtractedHeading[] {
  if (!hasQuiz) return headings;
  return [...headings, { id: "knowledge-check", text: "Knowledge check", level: 2 }];
}
