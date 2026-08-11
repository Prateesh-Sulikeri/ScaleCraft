import { describe, expect, it } from "vitest";
import { run } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { compileLessonMdx } from "./compile-lesson-mdx";

async function renderMdx(source: string): Promise<string> {
  const compiled = await compileLessonMdx(source);
  const mod = await run(compiled, runtime as Parameters<typeof run>[1]);
  return renderToStaticMarkup(createElement(mod.default));
}

describe("compileLessonMdx", () => {
  it("compiles GFM tables", async () => {
    const html = await renderMdx("| A | B |\n| --- | --- |\n| 1 | 2 |\n");
    expect(html).toContain("<table>");
    expect(html).toContain("<td>1</td>");
  });

  it("compiles a GitHub-style callout via remarkCallouts", async () => {
    const html = await renderMdx("> [!NOTE]\n> Heads up.\n");
    expect(html).toContain('data-callout="NOTE"');
    expect(html).not.toContain("[!NOTE]");
  });

  it("adds heading anchor ids via rehypeSlug", async () => {
    const html = await renderMdx("## Some Heading\n");
    expect(html).toContain('id="some-heading"');
  });

  it("allows raw HTML via rehypeRaw", async () => {
    const html = await renderMdx("<details><summary>More</summary>hidden</details>\n");
    expect(html).toContain("<details>");
    expect(html).toContain("<summary>More</summary>");
  });
});
