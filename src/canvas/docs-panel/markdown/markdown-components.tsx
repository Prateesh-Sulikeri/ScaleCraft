import { isValidElement, type ReactNode } from "react";
import type { Components } from "react-markdown";
import { codeText } from "./markdown-plugins";
import { Callout } from "./Callout";
import { CodeBlock } from "./CodeBlock";
import { MermaidBlock } from "./MermaidBlock";

/**
 * Shared per-element renderer overrides for both Markdown pipelines -
 * react-markdown's `components` prop and MDX's `useMDXComponents` both key
 * on the same HTML tag names, so one map serves both.
 */
export const markdownComponents: Components = {
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
