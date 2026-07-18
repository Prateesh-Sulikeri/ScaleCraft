"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { getSingletonHighlighter, type Highlighter } from "shiki";

const SHIKI_THEMES = ["github-dark", "github-light"] as const;

let highlighterPromise: Promise<Highlighter> | null = null;

/** Module-level cached highlighter — created once, languages loaded on
 * demand per fence — so switching tabs or re-rendering doesn't rebuild
 * Shiki's tokenizer each time. */
function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = getSingletonHighlighter({ themes: [...SHIKI_THEMES], langs: [] });
  }
  return highlighterPromise;
}

/** Fenced code block (```lang), syntax-highlighted via Shiki. Falls back to
 * a plain, still-readable block while highlighting loads or if `lang` isn't
 * a language Shiki recognizes. */
export function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const { resolvedTheme } = useTheme();
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    if (!lang) return;
    let cancelled = false;
    const theme = resolvedTheme === "light" ? "github-light" : "github-dark";
    getHighlighter()
      .then(async (highlighter) => {
        if (!highlighter.getLoadedLanguages().includes(lang)) {
          await highlighter.loadLanguage(lang as Parameters<Highlighter["loadLanguage"]>[0]);
        }
        if (cancelled) return;
        setHtml(highlighter.codeToHtml(code, { lang, theme }));
      })
      .catch(() => {
        if (!cancelled) setHtml(null);
      });
    return () => {
      cancelled = true;
    };
  }, [code, lang, resolvedTheme]);

  if (html) {
    return (
      // Shiki's own tokenizer output on already-sanitized text, not raw/user HTML.
      <div
        className="overflow-x-auto rounded-md text-sm [&>pre]:p-3 [&>pre]:!bg-panel"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <pre className="overflow-x-auto rounded-md border border-border bg-panel p-3 text-sm">
      <code>{code}</code>
    </pre>
  );
}
