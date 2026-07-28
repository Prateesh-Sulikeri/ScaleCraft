"use client";

import { Loader2, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import type { DeepCheckResult } from "@/ai/run-deep-check";
import type { AiCritique } from "@/ai/schema";

export type DeepCheckPanelState = { status: "loading" } | DeepCheckResult;

type DeepCheckPanelProps = {
  state: DeepCheckPanelState;
  onClose: () => void;
  onSelectNode: (nodeId: string) => void;
};

/**
 * Slide-over, not a dropdown — deliberately visually distinct from
 * ValidationIndicator's panel (§4.2's first reversal): prose only, no issue
 * counts, no severity colors anywhere, even in the error state. Sits at
 * z-modal/z-modal-backdrop (above ValidationIndicator's z-dropdown) so the
 * two can never stack ambiguously.
 *
 * Renders AI output through react-markdown + rehype-sanitize only (no
 * rehype-raw) — unlike MarkdownRenderer.tsx's docs-panel usage, this content
 * is model output, not first-party-authored, so raw HTML passthrough is
 * deliberately not enabled here.
 */
export function DeepCheckPanel({ state, onClose, onSelectNode }: DeepCheckPanelProps) {
  return (
    <>
      <div className="fixed inset-0 z-[var(--z-modal-backdrop)] bg-black/40" onClick={onClose} />
      <div className="fixed right-0 top-0 z-[var(--z-modal)] flex h-full w-[420px] max-w-full flex-col border-l border-border bg-panel shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Deep Check</h2>
          <button onClick={onClose} aria-label="Close" className="text-foreground/50 hover:text-foreground">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {state.status === "loading" && <LoadingState onCancel={onClose} />}
          {state.status === "error" && <ErrorState message={state.message} />}
          {state.status === "ok" && <CritiqueView critique={state.critique} onSelectNode={onSelectNode} />}
        </div>
      </div>
    </>
  );
}

function LoadingState({ onCancel }: { onCancel: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <Loader2 size={20} className="animate-spin text-foreground/50" />
      <p className="text-sm text-foreground/70">Reviewing your design…</p>
      <button
        onClick={onCancel}
        className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-border"
      >
        Cancel
      </button>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  // Deliberately plain — no error-red styling, same "no severity colors"
  // rule that applies to the ok state (§10.5).
  return <p className="text-sm text-foreground/70">{message}</p>;
}

function CritiqueView({
  critique,
  onSelectNode,
}: {
  critique: AiCritique;
  onSelectNode: (nodeId: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5 text-sm">
      <p className="text-foreground">{critique.summary}</p>

      {critique.sections.map((section, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          {section.relatedNodeIds.length > 0 ? (
            <button
              onClick={() => onSelectNode(section.relatedNodeIds[0])}
              className="text-left text-sm font-semibold text-foreground underline decoration-foreground/30 underline-offset-2 hover:decoration-foreground"
            >
              {section.title}
            </button>
          ) : (
            <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
          )}
          <div className="prose-sm text-foreground/80">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
              {section.body}
            </ReactMarkdown>
          </div>
        </div>
      ))}

      {critique.tradeoffs.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-border pt-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground/60">Trade-offs</h3>
          <ul className="flex flex-col gap-3">
            {critique.tradeoffs.map((t, i) => (
              <li key={i} className="rounded-md border border-border p-2.5">
                <p className="text-sm font-medium text-foreground">{t.decision}</p>
                <p className="mt-1 text-xs text-foreground/70">
                  <span className="text-foreground/50">Cost:</span> {t.cost}
                </p>
                <p className="text-xs text-foreground/70">
                  <span className="text-foreground/50">Benefit:</span> {t.benefit}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
