"use client";

import { useEffect, useRef, useState } from "react";
import { Settings, Sparkles } from "lucide-react";
import { Tooltip } from "@/app/Tooltip";
import { useCanvasStore } from "@/canvas/store";
import { getAiSettings, saveAiSettings, DEFAULT_AI_SETTINGS, type AiSettings } from "@/ai/settings";
import { runDeepCheck } from "@/ai/run-deep-check";
import type { DeepCheckContext } from "@/ai/prompt";
import { AiSettingsModal } from "./AiSettingsModal";
import { DeepCheckPanel, type DeepCheckPanelState } from "./DeepCheckPanel";

type DeepCheckButtonProps = {
  ctx: DeepCheckContext;
};

/**
 * Self-contained header control (button + gear icon + settings modal +
 * result panel), same shape as ValidationIndicator — everything it owns is
 * local UI/network state; only `ctx` (what varies per page — Sandbox vs. a
 * chapter) comes from outside. See AppHeader.tsx for why this falls out to
 * "available in all three modes" for free.
 *
 * The button is never HTML-`disabled`: per §10.5, with no key configured it
 * stays clickable but opens Settings instead of running Deep Check — a
 * genuinely inert disabled button would have nowhere for that click to go.
 * The small gear icon is an addition beyond the spec's literal text: it's
 * the only way to *reopen* Settings once a key is already configured, since
 * the "disabled" affordance only fires when there's nothing configured yet.
 */
export function DeepCheckButton({ ctx }: DeepCheckButtonProps) {
  const [settings, setSettings] = useState<AiSettings | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
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

  const handleDeepCheckClick = () => {
    if (!settings?.enabled) {
      setSettingsOpen(true);
      return;
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setPanelState({ status: "loading" });
    runDeepCheck(ctx, settings, controller.signal)
      .then(setPanelState)
      .catch(() => {
        // runDeepCheck's contract: every non-abort failure resolves to a
        // tagged { status: "error" } result, never a rejection — so a
        // rejection here is always the abort path (see run-deep-check.ts's
        // own doc comment). "No result forced through" means closing the
        // panel, not surfacing an error for a cancellation the user asked for.
        setPanelState(null);
      });
  };

  const handleClosePanel = () => {
    abortControllerRef.current?.abort();
    setPanelState(null);
  };

  const handleSettingsSave = async (next: AiSettings) => {
    await saveAiSettings(next);
    setSettings(next);
    setSettingsOpen(false);
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
      <Tooltip label="AI Settings">
        <button
          onClick={() => setSettingsOpen(true)}
          aria-label="AI Settings"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-panel text-foreground/50 hover:text-foreground"
        >
          <Settings size={14} />
        </button>
      </Tooltip>

      {settingsOpen && (
        <AiSettingsModal
          settings={settings ?? DEFAULT_AI_SETTINGS}
          onSave={handleSettingsSave}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {panelState && (
        <DeepCheckPanel state={panelState} onClose={handleClosePanel} onSelectNode={setSelectedNodeId} />
      )}
    </>
  );
}
