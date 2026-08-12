import { describe, expect, it } from "vitest";
import { mdxComponents } from "@/canvas/docs-panel/markdown/mdx-components";
import { renderMdx } from "./mdx-test-utils";

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

  // The exact integration point MdxContent.tsx exercises in the browser -
  // `<Walkthrough>` only resolves if compile() leaves the JSX tag reference
  // intact AND the caller passes mdxComponents into run()'s components prop
  // (MdxContent.tsx merges it with markdownComponents; this test passes it
  // alone, which is enough to prove resolution works).
  it("resolves a custom <Walkthrough> tag via mdxComponents", async () => {
    const source = `<Walkthrough
  viewBoxWidth={600}
  viewBoxHeight={250}
  nodes={[
    { id: "client", kind: "component", componentId: "client", position: { x: 80, y: 125 } },
    { id: "lb", kind: "component", componentId: "load-balancer", position: { x: 400, y: 125 } },
  ]}
  edges={[{ id: "e1", source: "client", target: "lb", kind: "request-flow" }]}
  steps={[{ caption: "The client sends a request.", highlightNodeIds: ["client"], highlightEdgeIds: [] }]}
/>
`;
    const html = await renderMdx(source, mdxComponents);
    expect(html).toContain("Client");
    expect(html).toContain("Load Balancer");
    expect(html).toContain("1 / 1");
    expect(html).toContain("The client sends a request.");
  });

  // Unlike Walkthrough (always a standalone block element), <Ref> is meant to
  // sit mid-sentence - proves the tag resolves without splitting the
  // surrounding prose into two paragraphs.
  it("resolves a custom <Ref> tag inline, mid-paragraph, via mdxComponents", async () => {
    const source = `The simplest routing rule is <Ref id="round-robin">round-robin</Ref>, which rotates evenly.\n`;
    const html = await renderMdx(source, mdxComponents);
    expect(html.match(/<p>/g)?.length).toBe(1);
    expect(html).toContain("round-robin");
    expect(html).toContain("<button");
  });

  it("falls back to plain text for a <Ref> with an unregistered id", async () => {
    const source = `See <Ref id="not-a-real-term">this concept</Ref> for details.\n`;
    const html = await renderMdx(source, mdxComponents);
    expect(html).toContain("this concept");
    expect(html).not.toContain("<button");
  });
});
