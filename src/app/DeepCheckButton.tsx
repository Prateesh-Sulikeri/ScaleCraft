"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { Tooltip } from "@/app/Tooltip";
import { useCanvasStore } from "@/canvas/store";
import { getAiSettings, saveAiSettings, DEFAULT_AI_SETTINGS, type AiSettings } from "@/ai/settings";
import { runDeepCheck } from "@/ai/run-deep-check";
import { saveSession } from "@/persistence/deepCheckSessions";
import type { DeepCheckContext } from "@/ai/prompt";
import { DeepCheckPanel, type DeepCheckPanelState, type DeepCheckView } from "./DeepCheckPanel";

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
 * The button is never HTML-`disabled`: per §10.5, with no key configured it
 * stays clickable but opens the panel straight to its settings view instead
 * of running Deep Check — a genuinely inert disabled button would have
 * nowhere for that click to go.
 */
export function DeepCheckButton({ ctx, saveId }: DeepCheckButtonProps) {
  const [settings, setSettings] = useState<AiSettings | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [view, setView] = useState<DeepCheckView>("result");
  const [panelState, setPanelState] = useState<DeepCheckPanelState | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const setSelectedNodeId = useCanvasStore((s) => s.setSelectedNodeId);

  useEffect(() => {
    // Same unmount-guard convention as sandbox/page.tsx's custom-components
    // load and ChapterWorkspace's chapterProgress load — without it, a
    // component that mounts and unmounts quickly (e.g. AppHeader's own
    // focus-mode conditional render) can resolve setSettings after teardown.
    let cancelled = false;
    getAiSettings().then((s) => {
      if (!cancelled) setSettings(s);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const runCheck = (activeSettings: AiSettings) => {
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setView("result");
    setPanelState({ status: "loading" });
    runDeepCheck(ctx, activeSettings, controller.signal)
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
        // own doc comment). "No result forced through" means closing the
        // panel, not surfacing an error for a cancellation the user asked for.
        setPanelState(null);
      });
  };

  const handleDeepCheckClick = () => {
    setPanelOpen(true);
    if (!settings?.enabled) {
      setView("settings");
      return;
    }
    runCheck(settings);
  };

  const handleClosePanel = () => {
    abortControllerRef.current?.abort();
    setPanelOpen(false);
    setPanelState(null);
    setView("result");
  };

  const handleSaveSettings = async (next: AiSettings) => {
    await saveAiSettings(next);
    setSettings(next);
    setView("result");
  };

  const handleRun = () => {
    if (settings?.enabled) runCheck(settings);
  };

  return (
    <>
      <Tooltip label={settings?.enabled ? "Deep Check" : "Configure an AI provider to enable Deep Check"}>
        <button
          onClick={handleDeepCheckClick}
          aria-label="Deep Check"
          className={`flex h-8 w-8 items-center justify-center rounded-md border border-border bg-panel hover:text-foreground ${
            settings?.enabled ? "text-foreground/70" : "text-foreground/30"
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
          settings={settings ?? DEFAULT_AI_SETTINGS}
          onSaveSettings={handleSaveSettings}
          onRun={handleRun}
          saveId={saveId}
          onClose={handleClosePanel}
          onSelectNode={setSelectedNodeId}
        />
      )}
    </>
  );
}
