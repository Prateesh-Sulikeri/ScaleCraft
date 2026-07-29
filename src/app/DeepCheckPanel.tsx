"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { ChevronLeft, HelpCircle, History, Loader2, Sparkles, Trash2, Users, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import type { DeepCheckResult } from "@/ai/run-deep-check";
import type { AiCritique } from "@/ai/schema";
import type { AiProfile } from "@/ai/profiles";
import { providers } from "@/ai/providers";
import type { DeepCheckSession } from "@/persistence/db";
import { deleteSession, listSessions } from "@/persistence/deepCheckSessions";
import { AiProfilesView } from "./AiProfilesView";
import { Tooltip } from "./Tooltip";

export type DeepCheckPanelState = { status: "loading" } | DeepCheckResult;
export type DeepCheckView = "result" | "profiles" | "history" | "help";

const DEEP_CHECK_GUIDE_URL =
  "https://medium.com/@prateeshcodes/create-your-free-ai-api-key-with-groq-to-use-in-scalecraft-deep-checks-ae626d48b99d?sharedUserId=prateeshcodes";

const MIN_WIDTH = 340;
const MAX_WIDTH = 720;
const DEFAULT_WIDTH = 420;
const WIDTH_STORAGE_KEY = "scalecraft:deep-check-panel-width";

type DeepCheckPanelProps = {
  view: DeepCheckView;
  onViewChange: (view: DeepCheckView) => void;
  /** Null before the first run of this panel session (e.g. opened straight
   * to Profiles because no usable profile was configured yet) — distinct
   * from an in-flight or completed run, which is why this isn't folded into
   * DeepCheckPanelState itself. */
  state: DeepCheckPanelState | null;
  /** The profile Deep Check will run with, if any — drives the active
   * marker in AiProfilesView and whether the empty result state's "Run Deep
   * Check" button is enabled. */
  activeProfileId: string | null;
  canRun: boolean;
  /** Fired by AiProfilesView after any mutation that could change the
   * active profile (switch, create, edit of the active one, delete/undo) —
   * always the freshly re-read profile, see AiProfilesView.tsx. */
  onActiveProfileChange: (profile: AiProfile | null) => void;
  /** Lets the empty result state ("a profile is configured, nothing run
   * yet") and a saved-session list start a real run without the panel
   * needing its own copy of runDeepCheck's orchestration — that stays owned
   * by DeepCheckButton. */
  onRun: () => void;
  /** Scopes session history to the current board/chapter — the same slot
   * key CanvasSave/ChapterProgress already use. Null when there's no
   * well-defined save slot (e.g. the chapter list view), in which case
   * history is unavailable rather than silently global. */
  saveId: string | null;
  onClose: () => void;
  /** Cancel button on the loading state — aborts the in-flight request but
   * leaves the panel open (unlike `onClose`, the X button/backdrop click).
   * A user cancelling a run may just want to switch to Settings/History/
   * Help, or try again with different settings, not lose the panel
   * entirely. */
  onCancelRun: () => void;
  onSelectNode: (nodeId: string) => void;
};

/**
 * Slide-over, not a dropdown — deliberately visually distinct from
 * ValidationIndicator's panel (§4.2's first reversal): prose only, no issue
 * counts, no severity colors anywhere, even in the error state. Sits at
 * z-modal/z-modal-backdrop (above ValidationIndicator's z-dropdown) so the
 * two can never stack ambiguously.
 *
 * Owns four views (`view` is lifted to DeepCheckButton, not local state,
 * because opening straight to "profiles" — no usable profile configured yet
 * — has to be decided at click time, before this component exists): the
 * review result (default), AI Profiles (AiProfilesView.tsx, embedded inline
 * per explicit product direction — no more separate top-bar modal), session
 * History (every successful run autosaves here, scoped to `saveId` — see
 * DeepCheckButton.tsx), and Help (static onboarding content).
 */
export function DeepCheckPanel({
  view,
  onViewChange,
  state,
  activeProfileId,
  canRun,
  onActiveProfileChange,
  onRun,
  saveId,
  onClose,
  onCancelRun,
  onSelectNode,
}: DeepCheckPanelProps) {
  // Lazy initializer, not an effect + setState — this component only ever
  // mounts client-side (rendered on click, see DeepCheckButton.tsx), so
  // reading localStorage during the initial render is safe and avoids the
  // extra cascading render an effect-based read would cause.
  const [width, setWidth] = useState(() => {
    const stored = Number(localStorage.getItem(WIDTH_STORAGE_KEY));
    return Number.isFinite(stored) && stored >= MIN_WIDTH && stored <= MAX_WIDTH ? stored : DEFAULT_WIDTH;
  });
  const resizingRef = useRef(false);

  const handleResizeStart = (e: ReactPointerEvent<HTMLDivElement>) => {
    resizingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleResizeMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!resizingRef.current) return;
    // The panel is pinned to the right edge, so its width is the distance
    // from the pointer to the viewport's right edge, not the pointer's raw x.
    const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, window.innerWidth - e.clientX));
    setWidth(next);
  };

  const handleResizeEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!resizingRef.current) return;
    resizingRef.current = false;
    localStorage.setItem(WIDTH_STORAGE_KEY, String(width));
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <>
      <div className="fixed inset-0 z-[var(--z-modal-backdrop)] bg-black/40" onClick={onClose} />
      <div
        style={{ width }}
        className="fixed right-0 top-0 z-[var(--z-modal)] flex h-full max-w-full flex-col border-l border-border bg-panel shadow-xl"
      >
        <div
          onPointerDown={handleResizeStart}
          onPointerMove={handleResizeMove}
          onPointerUp={handleResizeEnd}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize Deep Check panel"
          className="absolute left-0 top-0 z-10 h-full w-1.5 -translate-x-1/2 touch-none cursor-ew-resize"
        />

        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            {view !== "result" && (
              <button
                onClick={() => onViewChange("result")}
                aria-label="Back to review"
                className="text-foreground/50 hover:text-foreground"
              >
                <ChevronLeft size={16} />
              </button>
            )}
            <Sparkles size={15} className="shrink-0 text-foreground/60" aria-hidden="true" />
            <h2 className="text-sm font-semibold">
              {view === "profiles"
                ? "AI Profiles"
                : view === "history"
                  ? "Deep Check History"
                  : view === "help"
                    ? "Deep Check Help"
                    : "Deep Check"}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            {view === "result" && (
              <>
                <Tooltip label="Help">
                  <button
                    onClick={() => onViewChange("help")}
                    aria-label="Help"
                    className="flex h-7 w-7 items-center justify-center rounded text-foreground/50 hover:text-foreground"
                  >
                    <HelpCircle size={15} />
                  </button>
                </Tooltip>
                <Tooltip label="Deep Check History">
                  <button
                    onClick={() => onViewChange("history")}
                    aria-label="History"
                    className="flex h-7 w-7 items-center justify-center rounded text-foreground/50 hover:text-foreground"
                  >
                    <History size={15} />
                  </button>
                </Tooltip>
                <Tooltip label="AI Profiles">
                  <button
                    onClick={() => onViewChange("profiles")}
                    aria-label="AI Profiles"
                    className="flex h-7 w-7 items-center justify-center rounded text-foreground/50 hover:text-foreground"
                  >
                    <Users size={15} />
                  </button>
                </Tooltip>
              </>
            )}
            <Tooltip label="Close">
              <button
                onClick={onClose}
                aria-label="Close"
                className="flex h-7 w-7 items-center justify-center rounded text-foreground/50 hover:text-foreground"
              >
                <X size={16} />
              </button>
            </Tooltip>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {view === "profiles" && (
            <AiProfilesView activeProfileId={activeProfileId} onActiveProfileChange={onActiveProfileChange} />
          )}
          {view === "history" && <HistoryView saveId={saveId} onSelectNode={onSelectNode} />}
          {view === "help" && <HelpView />}
          {view === "result" && (
            <>
              {state === null && <EmptyResultState canRun={canRun} onRun={onRun} />}
              {state?.status === "loading" && <LoadingState onCancel={onCancelRun} />}
              {state?.status === "error" && <ErrorState message={state.message} />}
              {state?.status === "ok" && <CritiqueView critique={state.critique} onSelectNode={onSelectNode} />}
            </>
          )}
        </div>
      </div>
    </>
  );
}

/** Static onboarding content — what Deep Check does, why it needs your own
 * key, and which providers are supported. The provider list is rendered
 * from the real `providers` registry rather than hand-typed, so it can
 * never drift out of sync with what Settings actually offers. */
function HelpView() {
  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex flex-col gap-1.5">
        <h3 className="text-sm font-semibold text-foreground">What is Deep Check?</h3>
        <p className="text-foreground/70">
          Deep Check sends your current design to an AI model for a system-design critique —
          trade-offs, failure modes, and things worth reconsidering. It never decides whether a
          chapter passes; that&apos;s always the deterministic validation engine.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <h3 className="text-sm font-semibold text-foreground">Why bring your own API key?</h3>
        <p className="text-foreground/70">
          ScaleCraft doesn&apos;t run or pay for AI calls on your behalf. Your key is stored only in
          this browser&apos;s IndexedDB and sent directly to your chosen provider — never through
          ScaleCraft&apos;s servers.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <h3 className="text-sm font-semibold text-foreground">Supported providers</h3>
        <ul className="list-inside list-disc text-foreground/70">
          {Object.values(providers).map((provider) => (
            <li key={provider.id}>{provider.label}</li>
          ))}
        </ul>
      </div>

      <a
        href={DEEP_CHECK_GUIDE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium text-foreground underline decoration-foreground/30 underline-offset-2 hover:decoration-foreground"
      >
        Read the setup guide →
      </a>
    </div>
  );
}

function EmptyResultState({ canRun, onRun }: { canRun: boolean; onRun: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <p className="text-sm text-foreground/60">Settings saved. Run Deep Check to review your design.</p>
      <button
        onClick={onRun}
        disabled={!canRun}
        className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-border disabled:cursor-not-allowed disabled:opacity-50"
      >
        Run Deep Check
      </button>
    </div>
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

/** Scoped to `saveId` (see DeepCheckPanel's own doc comment) — lists every
 * autosaved run for the current board/chapter, newest first, with a
 * list→detail drill-in reusing CritiqueView so a past session renders
 * identically to a live result. */
function HistoryView({
  saveId,
  onSelectNode,
}: {
  saveId: string | null;
  onSelectNode: (nodeId: string) => void;
}) {
  const [sessions, setSessions] = useState<DeepCheckSession[] | null>(null);
  const [selected, setSelected] = useState<DeepCheckSession | null>(null);
  // Armed by one click on the trash icon, only actually deletes on a second,
  // explicit click — see this component's own note on why not a native
  // confirm() (this app avoids modal dialogs, see BoardMenu.tsx) and why not
  // the canvas's undo-toast either (that's wired to the canvas store
  // specifically; a saved review is a much lower-stakes delete than a whole
  // board, so a plain confirm step is proportionate here).
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  useEffect(() => {
    if (!saveId) return;
    let cancelled = false;
    listSessions(saveId).then((loaded) => {
      if (!cancelled) setSessions(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [saveId]);

  // Don't leave an armed confirmation stuck open indefinitely if the user
  // moves on without deciding either way.
  useEffect(() => {
    if (confirmingId === null) return;
    const timeout = setTimeout(() => setConfirmingId(null), 4000);
    return () => clearTimeout(timeout);
  }, [confirmingId]);

  const handleDelete = async (id: number) => {
    await deleteSession(id);
    setSessions((prev) => prev?.filter((s) => s.id !== id) ?? prev);
    setSelected((prev) => (prev?.id === id ? null : prev));
    setConfirmingId(null);
  };

  if (!saveId) {
    return <p className="text-sm text-foreground/60">Save your board to start keeping Deep Check history.</p>;
  }

  if (sessions === null) {
    return <Loader2 size={16} className="animate-spin text-foreground/50" />;
  }

  if (selected) {
    return (
      <div className="flex flex-col gap-3">
        <button
          onClick={() => setSelected(null)}
          className="self-start text-xs text-foreground/60 underline decoration-foreground/30 underline-offset-2 hover:decoration-foreground"
        >
          ← Back to history
        </button>
        <p className="text-xs text-foreground/50">{new Date(selected.createdAt).toLocaleString()}</p>
        <CritiqueView critique={selected.critique} onSelectNode={onSelectNode} />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <p className="text-sm text-foreground/60">
        No saved reviews yet — every completed Deep Check is saved here automatically.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {sessions.map((session) => (
        <li key={session.id} className="flex items-start gap-2 rounded-md border border-border p-2.5">
          <button onClick={() => setSelected(session)} className="min-w-0 flex-1 text-left">
            <p className="text-xs text-foreground/50">{new Date(session.createdAt).toLocaleString()}</p>
            <p className="mt-0.5 line-clamp-2 text-sm text-foreground/80">{session.critique.summary}</p>
          </button>
          {confirmingId === session.id ? (
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                onClick={() => handleDelete(session.id!)}
                className="text-xs font-medium text-state-error hover:underline"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmingId(null)}
                aria-label="Cancel delete"
                className="text-foreground/40 hover:text-foreground"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmingId(session.id!)}
              aria-label="Delete session"
              className="shrink-0 text-foreground/40 hover:text-foreground"
            >
              <Trash2 size={14} />
            </button>
          )}
        </li>
      ))}
    </ul>
  );
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
