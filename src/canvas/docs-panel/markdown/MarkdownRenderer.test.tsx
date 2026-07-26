import { describe, it, expect, beforeAll } from "vitest";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { render, screen } from "@testing-library/react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { stubResizeObserver } from "../../canvas-test-utils";

beforeAll(() => {
  stubResizeObserver();
  window.matchMedia =
    window.matchMedia ||
    ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
});

function renderMarkdown(content: string) {
  return render(
    <NextThemesProvider attribute="data-theme" enableSystem={false} defaultTheme="dark">
      <MarkdownRenderer content={content} />
    </NextThemesProvider>,
  );
}

describe("MarkdownRenderer", () => {
  it("renders basic headings, paragraphs, and GFM tables", () => {
    renderMarkdown("# Title\n\nSome body text.\n\n| A | B |\n| - | - |\n| 1 | 2 |");
    expect(screen.getByRole("heading", { level: 1, name: "Title" })).toBeInTheDocument();
    expect(screen.getByText("Some body text.")).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("renders a GFM task list with checkboxes", () => {
    renderMarkdown("- [ ] todo item\n- [x] done item");
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(2);
    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[1]).toBeChecked();
  });

  // KNOWN BUG (found while writing this test, reported separately — not fixed
  // here per this repo's rule against unrelated fixes without approval):
  // remarkCallouts tags the blockquote with hProperties `{"data-callout": kind}`,
  // but rehypeRaw (always in this pipeline, via `allowDangerousHtml`) normalizes
  // that hast property key to `dataCallout` *before* rehypeSanitize runs.
  // MarkdownRenderer's `sanitizeSchema.attributes.blockquote` only allow-lists
  // the literal string "data-callout", which no longer matches, so
  // rehype-sanitize strips the property — the `blockquote` component override
  // never sees it, and every GitHub-style callout (`> [!WARNING] ...`) silently
  // renders as a plain italic blockquote instead of a styled Callout. Verified
  // via a standalone repro of this exact plugin pipeline outside the test
  // (rehypeRaw output showed `{"dataCallout":"WARNING"}`; post-sanitize `{}`
  // with the current schema, `{"dataCallout":"WARNING"}` if the schema key is
  // changed to "dataCallout"). Fixing it also needs `blockquote()`'s
  // destructure to read `props.dataCallout` instead of `props["data-callout"]`,
  // so it's a real (if small) source change, not something to slip in here.
  it("currently falls back to a plain blockquote for a GitHub-style callout marker (tracks the bug above)", () => {
    const { container } = renderMarkdown("> [!WARNING]\n> Watch out.");
    expect(screen.getByText("Watch out.")).toBeInTheDocument();
    expect(container.querySelector("blockquote")).toHaveClass("italic");
    expect(screen.queryByText("Warning")).not.toBeInTheDocument();
  });

  it("renders a plain blockquote when there's no callout marker", () => {
    const { container } = renderMarkdown("> just quoting someone");
    expect(container.querySelector("blockquote")).toHaveClass("italic");
  });

  it("renders inline code with the inline styling class", () => {
    const { container } = renderMarkdown("Use the `cn()` helper.");
    const code = container.querySelector("code");
    expect(code).toBeInTheDocument();
    expect(code).toHaveClass("bg-border/60");
    expect(code?.textContent).toBe("cn()");
  });

  it("routes a fenced code block through CodeBlock, not react-markdown's default pre>code", () => {
    const { container } = renderMarkdown("```ts\nconst x = 1;\n```");
    // CodeBlock's loading fallback is its own <pre><code> with no inline-code class.
    const code = container.querySelector("pre code");
    expect(code).toBeInTheDocument();
    expect(code).not.toHaveClass("bg-border/60");
    expect(code?.textContent).toBe("const x = 1;");
  });

  it("routes a ```mermaid fence to MermaidBlock's loading state instead of a code block", () => {
    renderMarkdown("```mermaid\ngraph TD;\nA-->B;\n```");
    expect(screen.getByText(/rendering diagram/i)).toBeInTheDocument();
  });

  it("opens external https links in a new tab, but not relative/internal links", () => {
    renderMarkdown("[external](https://example.com/x) and [internal](/docs/foo)");
    const external = screen.getByRole("link", { name: "external" });
    expect(external).toHaveAttribute("target", "_blank");
    expect(external).toHaveAttribute("rel", "noreferrer");

    const internal = screen.getByRole("link", { name: "internal" });
    expect(internal).not.toHaveAttribute("target");
  });

  it("renders raw HTML (e.g. a collapsible <details>) via rehype-raw", () => {
    renderMarkdown("<details><summary>More</summary>\n\nhidden body\n\n</details>");
    expect(screen.getByText("More")).toBeInTheDocument();
    expect(screen.getByText("hidden body")).toBeInTheDocument();
  });

  it("slugs headings so in-page anchors resolve", () => {
    renderMarkdown("## My Heading");
    expect(screen.getByRole("heading", { level: 2 }).id).toBe("my-heading");
  });
});
