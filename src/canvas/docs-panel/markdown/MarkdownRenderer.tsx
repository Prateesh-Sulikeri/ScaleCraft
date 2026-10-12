import ReactMarkdown from "react-markdown";
import { remarkPlugins, rehypePlugins, MARKDOWN_BODY_CLASSNAME } from "./markdown-plugins";
import { markdownComponents } from "./markdown-components";

export { codeText } from "./markdown-plugins";

/** The single Markdown entry point for the docs panel — wires
 * react-markdown with the GFM (tables/checklists/strikethrough/footnotes),
 * raw-HTML (collapsible `<details>`), sanitize, and heading-anchor plugins,
 * plus custom renderers for code/mermaid/callouts/links. */
/** `className` swaps the body scale (the Reader passes LESSON_BODY_CLASSNAME). */
export function MarkdownRenderer({ content, className = MARKDOWN_BODY_CLASSNAME }: { content: string; className?: string }) {
  return (
    <div className={className}>
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
