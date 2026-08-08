"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Sparkles } from "lucide-react";
import { Tooltip } from "@/app/Tooltip";
import { useCanvasStore } from "@/canvas/store";
import { getActiveProfile, isProfileUsable, type AiProfile } from "@/ai/profiles";
import { getEngine } from "@/engines";
import { saveSession } from "@/persistence/deepCheckSessions";
import type { DeepCheckContext } from "@/ai/prompt";
import type { DeepCheckPanelState, DeepCheckView } from "./DeepCheckPanel";

// Opens on demand from the header button (default closed) - keeps its AI
// provider/settings/history weight out of every canvas route's initial
// bundle until a user actually clicks Deep Check.
const DeepCheckPanel = dynamic(() => import("./DeepCheckPanel").then((m) => m.DeepCheckPanel), {
  ssr: false,
});

type DeepCheckButtonProps = {
  ctx: DeepCheckContext;
  /** Scopes autosaved review sessions to the current board/chapter (see
   * DeepCheckPanel.tsx's History view and persistence/deepCheckSessions.ts)
   * — same slot key AppHeader already threads to Save/ProjectMenu/BoardMenu.
   * Null when there's no well-defined save slot yet, in which case a
   * successful run simply isn't autosaved. */
  saveId: string | null;
};

/**
 * Self-contained header control (button + slide-over panel — the panel now
 * also owns Settings and History internally, see DeepCheckPanel.tsx), same
 * shape as ValidationIndicator — everything it owns is local UI/network
 * state; only `ctx`/`saveId` (what varies per page) come from outside.
 *
 * AI Settings used to be a second, always-visible gear button next to this
 * one, opening a floating modal (AiSettingsModal). Per explicit product
 * direction it now lives entirely inside the Deep Check panel instead, so
 * there is exactly one entry point into Deep Check from the header.
 *
 * The button is never HTML-`disabled`: per §10.5, with no usable profile
 * configured it stays clickable but just opens the panel — a genuinely
 * inert disabled button would have nowhere for that click to go.
 *
 * Opening the panel never runs Deep Check on its own, even with a usable
 * profile already active: a paid-API mistake from an accidental click is
 * exactly what the explicit "Run Deep Check" button in the empty result
 * state (DeepCheckPanel.tsx) exists to prevent.
 */
export function DeepCheckButton({ ctx, saveId }: DeepCheckButtonProps) {
  const [activeProfile, setActiveProfile] = useState<AiProfile | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [view, setView] = useState<DeepCheckView>("result");
  const [panelState, setPanelState] = useState<DeepCheckPanelState | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const setSelectedNodeId = useCanvasStore((s) => s.setSelectedNodeId);

  useEffect(() => {
    // Same unmount-guard convention as sandbox/page.tsx's custom-components
    // load and ChapterWorkspace's chapterProgress load — without it, a
    // component that mounts and unmounts quickly (e.g. AppHeader's own
    // focus-mode conditional render) can resolve setActiveProfile after
    // teardown.
    let cancelled = false;
    getActiveProfile().then((p) => {
      if (!cancelled) setActiveProfile(p);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const runCheck = (profile: AiProfile) => {
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setView("result");
    setPanelState({ status: "loading" });
    getEngine("deep-check")
      .then((engine) => engine.run(ctx, profile, controller.signal))
      .then((result) => {
        setPanelState(result);
        // Autosave — see the "sessions" ask this was built for (2026-07-29
        // follow-up). Fire-and-forget: a write failure here shouldn't block
        // or blank out a result the user is already looking at.
        if (result.status === "ok" && saveId) {
          void saveSession(saveId, result.critique);
        }
      })
      .catch(() => {
        // runDeepCheck's contract: every non-abort failure resolves to a
        // tagged { status: "error" } result, never a rejection — so a
        // rejection here is always the abort path (see run-deep-check.ts's
        // own doc comment). "No result forced through" means falling back to
        // the empty result state, not surfacing an error for a cancellation
        // the user asked for.
        setPanelState(null);
      });
  };

  const handleDeepCheckClick = () => {
    setPanelOpen(true);
  };

  const handleClosePanel = () => {
    abortControllerRef.current?.abort();
    setPanelOpen(false);
    setPanelState(null);
    setView("result");
  };

  /** Loading state's own Cancel button — aborts the request but, unlike
   * handleClosePanel, leaves the panel open. Cancelling a run isn't the
   * same as wanting the whole panel gone: the user may just want to check
   * Settings, History, or Help, or retry with a different profile. */
  const handleCancelRun = () => {
    abortControllerRef.current?.abort();
    setPanelState(null);
  };

  const handleRun = () => {
    if (isProfileUsable(activeProfile)) runCheck(activeProfile!);
  };

  const canRun = isProfileUsable(activeProfile);

  return (
    <>
      <Tooltip label={canRun ? "Deep Check" : "Configure an AI provider to enable Deep Check"}>
        <button
          onClick={handleDeepCheckClick}
          aria-label="Deep Check"
          data-tour="deep-check"
          className={`flex h-8 w-8 items-center justify-center rounded-md border border-border bg-panel hover:text-foreground ${
            canRun ? "text-foreground/70" : "text-foreground/30"
          }`}
        >
          <Sparkles size={16} />
        </button>
      </Tooltip>

      {panelOpen && (
        <DeepCheckPanel
          view={view}
          onViewChange={setView}
          state={panelState}
          activeProfileId={activeProfile?.id ?? null}
          canRun={canRun}
          onActiveProfileChange={setActiveProfile}
          onRun={handleRun}
          saveId={saveId}
          onClose={handleClosePanel}
          onCancelRun={handleCancelRun}
          onSelectNode={setSelectedNodeId}
        />
      )}
    </>
  );
}
