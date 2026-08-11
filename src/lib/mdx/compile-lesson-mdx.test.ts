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
});
