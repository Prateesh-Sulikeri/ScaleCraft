import ReactMarkdown from "react-markdown";
import { remarkPlugins, rehypePlugins, MARKDOWN_BODY_CLASSNAME } from "./markdown-plugins";
import { markdownComponents } from "./markdown-components";

export { codeText } from "./markdown-plugins";

/** The single Markdown entry point for the docs panel — wires
 * react-markdown with the GFM (tables/checklists/strikethrough/footnotes),
 * raw-HTML (collapsible `<details>`), sanitize, and heading-anchor plugins,
 * plus custom renderers for code/mermaid/callouts/links. */
export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className={MARKDOWN_BODY_CLASSNAME}>
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        remarkRehypeOptions={{ allowDangerousHtml: true }}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
