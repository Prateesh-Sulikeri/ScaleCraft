import { compile } from "@mdx-js/mdx";
import { remarkPlugins, mdxRehypePlugins } from "@/canvas/docs-panel/markdown/markdown-plugins";

/**
 * Server-only: compiles a chapter lesson's raw MDX source into a
 * self-contained JS function body (outputFormat "function-body") that the
 * client can cheaply `run()` without re-parsing Markdown or re-walking the
 * remark/rehype pipeline - see the "server-compile, preserve current logic"
 * decision in .claude/docs/pending.md. Same remark plugins as the legacy
 * react-markdown path (markdown-plugins.ts), but the MDX-only rehype variant
 * (no rehypeRaw/allowDangerousHtml - see mdxRehypePlugins's own comment for
 * why that combination breaks on MDX's native JSX nodes).
 */
export async function compileLessonMdx(source: string): Promise<string> {
  const compiled = await compile(source, {
    outputFormat: "function-body",
    remarkPlugins,
    rehypePlugins: mdxRehypePlugins,
  });
  return String(compiled);
}
