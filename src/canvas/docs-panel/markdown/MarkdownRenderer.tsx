import { isValidElement, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import { remarkCallouts } from "./remark-callouts";
import { Callout } from "./Callout";
import { CodeBlock } from "./CodeBlock";
import { MermaidBlock } from "./MermaidBlock";

// Extends hast-util-sanitize's GitHub-derived default schema (already
// allow-lists details/summary/img/code[className]) with the one attribute
// remarkCallouts adds — content here is first-party-authored (see
// ComponentDefinition.docs), so this is defense-in-depth rather than a hard
// requirement, and future-proofs custom-component-authored docs text.
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    blockquote: [...(defaultSchema.attributes?.blockquote ?? []), "data-callout"],
  },
};

function codeText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(codeText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return codeText(node.props.children);
  return "";
}

const components: Components = {
  // Inline code (no surrounding `pre`) — fenced blocks are intercepted by
  // the `pre` override below instead, so this only ever fires for `` `x` ``.
  code({ className, children }) {
    return (
      <code className={`rounded bg-border/60 px-1 py-0.5 font-mono text-[0.85em] ${className ?? ""}`}>
        {children}
      </code>
    );
  },
  // Unwraps react-markdown's default `pre > code` for fenced blocks so
  // CodeBlock/MermaidBlock can render their own tree instead of nesting
  // inside a second <pre> (see CodeBlock.tsx's module comment).
  pre({ children }) {
    const codeEl = Array.isArray(children) ? children[0] : children;
    if (!isValidElement<{ className?: string; children?: ReactNode }>(codeEl)) {
      return <pre>{children}</pre>;
    }
    const match = /language-(\w+)/.exec(codeEl.props.className ?? "");
    const lang = match?.[1];
    const code = codeText(codeEl.props.children).replace(/\n$/, "");
    if (lang === "mermaid") return <MermaidBlock code={code} />;
    return <CodeBlock code={code} lang={lang} />;
  },
  blockquote({ children, ...props }) {
    const dataCallout = (props as { "data-callout"?: string })["data-callout"];
    return <Callout data-callout={dataCallout}>{children}</Callout>;
  },
  a({ href, children, ...props }) {
    const external = typeof href === "string" && /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        {...props}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        className="text-edge-request-flow underline underline-offset-2 hover:opacity-80"
      >
        {children}
      </a>
    );
  },
};

// Tailwind's preflight reset neutralizes heading font-size/weight and
// strips list-style/table borders — everything below re-adds real
// typographic styling for the elements that don't already get a custom
// `components` override above (code/pre/blockquote/a do; headings,
// paragraphs, lists, tables, and <hr> don't), using this app's own tokens
// rather than pulling in @tailwindcss/typography's separate opinionated
// defaults. Child-selector arbitrary variants, same technique already used
// elsewhere in this subsystem (CodeBlock's `[&>pre]:...`, MermaidBlock's
// `[&_svg]:...`).
const MARKDOWN_BODY_CLASSNAME = [
  "max-w-none text-base leading-7 text-foreground/85",
  "[&_h1]:mb-3 [&_h1]:mt-6 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-foreground [&_h1:first-child]:mt-0",
  "[&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h2:first-child]:mt-0",
  "[&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground",
  "[&_h4]:mb-1 [&_h4]:mt-4 [&_h4]:text-base [&_h4]:font-semibold [&_h4]:text-foreground",
  "[&_p]:mb-3",
  "[&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1",
  // GFM task list items (`- [ ]`) already have a checkbox — drop the bullet
  // so they don't get both.
  "[&_.contains-task-list]:list-none [&_.contains-task-list]:pl-0 [&_input[type=checkbox]]:mr-2",
  "[&_hr]:my-6 [&_hr]:border-border",
  "[&_table]:mb-4 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm",
  "[&_th]:border-b-2 [&_th]:border-border [&_th]:px-2 [&_th]:py-1.5 [&_th]:text-left [&_th]:font-semibold",
  "[&_td]:border-b [&_td]:border-border [&_td]:px-2 [&_td]:py-1.5",
  "[&_img]:mb-3 [&_img]:rounded-md",
  "[&_details]:mb-3 [&_details]:rounded-md [&_details]:border [&_details]:border-border [&_details]:p-3",
  "[&_summary]:cursor-pointer [&_summary]:font-medium",
].join(" ");

/** The single Markdown entry point for the docs panel — wires
 * react-markdown with the GFM (tables/checklists/strikethrough/footnotes),
 * raw-HTML (collapsible `<details>`), sanitize, and heading-anchor plugins,
 * plus custom renderers for code/mermaid/callouts/links. */
export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className={MARKDOWN_BODY_CLASSNAME}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkCallouts]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema], rehypeSlug]}
        remarkRehypeOptions={{ allowDangerousHtml: true }}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
