"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Redo2, Undo2 } from "lucide-react";
import { Canvas } from "@/canvas/Canvas";
import { DocsPanel } from "@/canvas/docs-panel/DocsPanel";
import { FocusModeBar } from "@/canvas/docs-panel/FocusModeBar";
import { Tooltip } from "@/app/Tooltip";
import { UndoToast } from "@/app/UndoToast";
import { ThemeToggle } from "@/app/ThemeToggle";
import { ValidationIndicator } from "@/app/ValidationIndicator";
import { ModeBadge } from "@/app/ModeBadge";
import { PageEnter } from "@/app/PageEnter";
import { ShortcutsButton } from "@/app/ShortcutsButton";
import { SidebarShell } from "@/app/SidebarShell";
import { ChapterSidebar } from "./ChapterSidebar";
import { useCanvasShortcuts } from "@/canvas/use-canvas-shortcuts";
import { useCanvasStore, toArchitectureGraph, architectureGraphTopologyKey } from "@/canvas/store";
import type { ValidationState } from "@/canvas/types";
import { getChaptersForMode } from "@/content/chapters";
import type { ChapterDefinition } from "@/content/chapters/types";
import { modeColorVar } from "@/lib/modes";
import { runValidation } from "@/validation-engine/engine";
import { ruleRegistry } from "@/validation-engine/rules";
import type { ValidationViolation } from "@/validation-engine/types";

type ChapterWorkspaceProps = {
  mode: ChapterDefinition["mode"];
};

/**
 * Shared page body for both chapter modes (/building-blocks,
 * /real-world-extraction) — header + SidebarShell/ChapterSidebar + Canvas.
 * Header composition is intentionally copy-pasted from sandbox/page.tsx
 * rather than extracted into a shared component yet (see
 * .claude/docs/UI_OVERHAUL_PART2_SPEC.md §6.2) — chapter-mode Save/
 * persistence semantics will diverge at milestone 9, so abstracting the
 * header now would be premature.
 *
 * Known, deliberate limitation (see the spec's §5 "State synchronization"):
 * the canvas store is a module singleton shared with Sandbox, and this
 * component does not load a chapter's starterGraph on select — selecting a
 * chapter shows whatever's currently on the canvas (empty on a fresh visit,
 * or Sandbox's own graph if that was visited first in the same session).
 * Real per-chapter graph isolation/persistence is milestone 9 scope; this
 * shell only proves the sidebar/routing/component-filter mechanics.
 */
export function ChapterWorkspace({ mode }: ChapterWorkspaceProps) {
  const chapters = useMemo(() => getChaptersForMode(mode), [mode]);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const selectedChapter = chapters.find((c) => c.id === selectedChapterId) ?? null;

  const setAvailableComponentIds = useCanvasStore((s) => s.setAvailableComponentIds);

  // The picker's chapter filter follows whichever chapter is open (or none,
  // in the Chapter List view); cleared on unmount so navigating away — back
  // to Sandbox or to the other chapter mode — never leaves Sandbox with a
  // stale filtered registry (the spec's flagged "most likely cross-mode
  // bug").
  useEffect(() => {
    setAvailableComponentIds(selectedChapter?.availableComponentIds ?? null);
    return () => setAvailableComponentIds(null);
  }, [selectedChapter, setAvailableComponentIds]);

  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const undo = useCanvasStore((s) => s.undo);
  const redo = useCanvasStore((s) => s.redo);
  const canUndo = useCanvasStore((s) => s.past.length > 0);
  const canRedo = useCanvasStore((s) => s.future.length > 0);
  const docsPanelOpen = useCanvasStore((s) => !s.docsPanel.minimized || s.docsPanel.focusMode);
  const toggleDocsPanel = useCanvasStore((s) => s.toggleDocsPanel);
  const focusMode = useCanvasStore((s) => s.docsPanel.focusMode);

  // No chapter persistence yet (milestone 9) — Ctrl+S is a no-op rather
  // than silently writing to the Sandbox save slot.
  useCanvasShortcuts(() => {});

  const [violations, setViolations] = useState<ValidationViolation[] | null>(null);
  const [checkedGraphKey, setCheckedGraphKey] = useState<string | null>(null);

  const currentGraphKey = useMemo(
    () => architectureGraphTopologyKey(toArchitectureGraph(nodes, edges)),
    [nodes, edges],
  );
  const isStale = violations !== null && checkedGraphKey !== currentGraphKey;

  const handleValidate = () => {
    const graph = toArchitectureGraph(nodes, edges);
    setViolations(runValidation(graph, ruleRegistry));
    setCheckedGraphKey(architectureGraphTopologyKey(graph));
  };

  const nodeStates: Record<string, ValidationState> = {};
  if (violations && !isStale) {
    if (violations.length === 0) {
      for (const n of nodes) {
        if (n.type === "component") nodeStates[n.id] = "valid";
      }
    } else {
      for (const v of violations) {
        for (const id of v.offendingNodeIds) {
          nodeStates[id] = v.severity === "error" ? "error" : "warning";
        }
      }
    }
  }

  return (
    <PageEnter>
      {focusMode ? (
        <FocusModeBar />
      ) : (
        <header
          style={{ borderBottomColor: modeColorVar[mode] }}
          className="flex items-center justify-between border-b-2 px-6 py-3"
        >
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="flex items-center gap-2.5 opacity-100 transition-opacity hover:opacity-70"
            >
              <div
                aria-hidden="true"
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: "var(--foreground)",
                  WebkitMaskImage: "url(/logo-mask.png)",
                  maskImage: "url(/logo-mask.png)",
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                }}
              />
              <h1 className="text-base font-semibold">ScaleCraft</h1>
            </Link>
            <ModeBadge mode={mode} />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 items-center overflow-hidden rounded-md border border-border bg-panel">
              <Tooltip label="Undo (Ctrl+Z)">
                <button
                  onClick={undo}
                  disabled={!canUndo}
                  aria-label="Undo"
                  className="flex h-full items-center px-2.5 hover:bg-border disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <Undo2 size={14} />
                </button>
              </Tooltip>
              <div className="h-4 w-px bg-border" />
              <Tooltip label="Redo (Ctrl+Shift+Z)">
                <button
                  onClick={redo}
                  disabled={!canRedo}
                  aria-label="Redo"
                  className="flex h-full items-center px-2.5 hover:bg-border disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <Redo2 size={14} />
                </button>
              </Tooltip>
            </div>
            <ValidationIndicator violations={violations} isStale={isStale} onValidate={handleValidate} />
            <Tooltip label="Documentation">
              <button
                onClick={toggleDocsPanel}
                aria-label={docsPanelOpen ? "Hide documentation panel" : "Show documentation panel"}
                aria-pressed={docsPanelOpen}
                className={`flex h-8 w-8 items-center justify-center rounded-md border border-border hover:text-foreground ${
                  docsPanelOpen ? "bg-border text-foreground" : "bg-panel text-foreground/70"
                }`}
              >
                <BookOpen size={16} />
              </button>
            </Tooltip>
            <ShortcutsButton />
            <ThemeToggle />
          </div>
        </header>
      )}

      <main className="flex min-h-0 flex-1 overflow-hidden">
        {!focusMode && (
          <>
            <SidebarShell>
              <ChapterSidebar
                chapters={chapters}
                selectedChapterId={selectedChapterId}
                onSelect={setSelectedChapterId}
                onBack={() => setSelectedChapterId(null)}
                violations={violations}
                isStale={isStale}
              />
            </SidebarShell>
            <div className="relative flex flex-1 flex-col">
              <Canvas nodeStates={nodeStates} />
            </div>
          </>
        )}

        {docsPanelOpen && <DocsPanel />}
      </main>

      <UndoToast />
    </PageEnter>
  );
}
