"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { Canvas, type CanvasHandle } from "@/canvas/Canvas";
import { DocsPanel } from "@/canvas/docs-panel/DocsPanel";
import { FocusModeBar } from "@/canvas/docs-panel/FocusModeBar";
import { UndoToast } from "@/app/UndoToast";
import { AppHeader } from "@/app/AppHeader";
import { PageEnter } from "@/app/PageEnter";
import { SidebarShell } from "@/app/SidebarShell";
import { ChapterSidebar } from "./ChapterSidebar";
import { useCanvasShortcuts } from "@/canvas/use-canvas-shortcuts";
import {
  useCanvasStore,
  useCanvasStoreApi,
  CanvasStoreProvider,
  toArchitectureGraph,
  architectureGraphTopologyKey,
} from "@/canvas/store";
import type { AnyNodeType, ArchitectureEdgeType, ValidationState } from "@/canvas/types";
import { getChaptersForMode } from "@/content/chapters";
import type { ChapterDefinition } from "@/content/chapters/types";
import { evaluateChapter, type ChapterOutcome } from "@/validation-engine/chapter-outcome";
import { chapterSaveId, db } from "@/persistence/db";

type ChapterWorkspaceProps = {
  mode: ChapterDefinition["mode"];
};

/**
 * Shared page body for both chapter modes (/building-blocks,
 * /real-world-extraction) — header + SidebarShell/ChapterSidebar + Canvas.
 * Header is now AppHeader (item I.3), shared with Sandbox — Save/Project/
 * Board work here too, scoped to whichever chapter is selected via
 * chapterSaveId (persistence/db.ts). Each chapter gets its own save slot;
 * "no chapter selected" (Chapter List view) disables those three controls
 * rather than acting on an ambiguous target.
 *
 * Wrapped in its own CanvasStoreProvider (see canvas/store.ts) — building-
 * blocks/page.tsx and real-world-extraction/page.tsx each mount a separate
 * `<ChapterWorkspace>`, so each gets its own store instance, independent
 * from Sandbox and from each other. This is what fixes the cross-mode
 * canvas leak (.claude/docs/pending.md I.6): a full mode switch now tears
 * down the previous mode's store instead of leaving its graph behind for
 * the next mode to render.
 */
export function ChapterWorkspace({ mode }: ChapterWorkspaceProps) {
  return (
    <CanvasStoreProvider>
      <ChapterWorkspaceContent mode={mode} />
    </CanvasStoreProvider>
  );
}

function ChapterWorkspaceContent({ mode }: ChapterWorkspaceProps) {
  const storeApi = useCanvasStoreApi();
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
  const loadGraph = useCanvasStore((s) => s.loadGraph);
  const loadCanvasState = useCanvasStore((s) => s.loadCanvasState);

  const canvasRef = useRef<CanvasHandle>(null);

  // Icon-only header button (see AppHeader) — same 1.5s Save -> Check icon
  // swap as Sandbox.
  const [justSaved, setJustSaved] = useState(false);

  // The graph exactly as it was loaded (saved attempt / starterGraph /
  // empty) for whichever chapter is currently selected — compared against
  // the live canvas to tell a genuine edit apart from just having switched
  // chapters. Deliberately a full nodes+edges snapshot (position included),
  // not architectureGraphTopologyKey below (that one intentionally drops
  // position for validation-staleness purposes; an unsaved drag is still an
  // edit worth warning about here).
  const [loadedSnapshotKey, setLoadedSnapshotKey] = useState<string | null>(null);

  useEffect(() => {
    // Backing out to the Chapter List must actively clear the canvas, not
    // just skip loading — otherwise whatever the last-selected chapter left
    // in the store keeps rendering underneath the list view (the in-mode
    // sibling of the cross-mode leak this store split fixed, see
    // .claude/docs/pending.md I.6). loadCanvasState([], []) is a no-op on an
    // already-empty canvas (pushHistory skips history entries when both are
    // already empty, see store.ts), so this is harmless on first mount too.
    // loadedSnapshotKey is deliberately left untouched — isDirty below
    // already gates on selectedChapter being non-null, so its stale value
    // stays inert without needing a reset here.
    if (!selectedChapter) {
      loadCanvasState([], []);
      return;
    }
    let cancelled = false;
    db.saves.get(chapterSaveId(selectedChapter.id)).then((save) => {
      if (cancelled) return;
      if (save) {
        loadCanvasState(save.nodes, save.edges);
      } else if (selectedChapter.starterGraph) {
        loadGraph(selectedChapter.starterGraph);
      } else {
        loadCanvasState([], []);
      }
      const { nodes: loadedNodes, edges: loadedEdges } = storeApi.getState();
      setLoadedSnapshotKey(canvasStateKey(loadedNodes, loadedEdges));
    });
    return () => {
      cancelled = true;
    };
    // Re-run only when the selected chapter's identity changes — loadGraph/
    // loadCanvasState are stable store actions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChapter?.id]);

  // Each mode's canvas store instance is created fresh on mount (see
  // CanvasStoreProvider) and torn down on unmount — without this, leaving
  // Building Blocks/Real World Extraction mid-edit without an explicit Save
  // would silently lose progress instead of just fixing the cross-mode leak
  // this store split was for. A ref (not selectedChapter itself) is what
  // this reads, since the cleanup below only ever runs once, on full
  // unmount, and needs whichever chapter was selected *at that moment* —
  // not whatever it was when the effect first ran. Synced via its own
  // effect (not written during render) per this project's react-hooks/refs
  // lint rule (React Compiler).
  const selectedChapterRef = useRef(selectedChapter);
  useEffect(() => {
    selectedChapterRef.current = selectedChapter;
  });
  useEffect(() => {
    return () => {
      const chapter = selectedChapterRef.current;
      if (!chapter) return;
      const { nodes, edges } = storeApi.getState();
      void db.saves.put({ id: chapterSaveId(chapter.id), updatedAt: Date.now(), nodes, edges });
    };
  }, [storeApi]);

  const isDirty =
    selectedChapter !== null &&
    loadedSnapshotKey !== null &&
    canvasStateKey(nodes, edges) !== loadedSnapshotKey;

  // Switching chapters (or backing out to the Chapter List) while there are
  // unsaved edits needs an explicit choice, not a silent discard — see
  // SwitchChapterConfirmPopover below. `undefined` means no confirm is
  // pending; `null` is itself a valid target (back to the Chapter List).
  const [pendingChapterChange, setPendingChapterChange] = useState<string | null | undefined>(undefined);

  const requestChapterChange = (newId: string | null) => {
    if (newId === selectedChapterId) return;
    if (isDirty) {
      setPendingChapterChange(newId);
    } else {
      setSelectedChapterId(newId);
    }
  };

  const [saveNoticeAt, setSaveNoticeAt] = useState<number | null>(null);

  const handleSave = async () => {
    if (!selectedChapter) {
      // Nothing to save against yet — same honest-feedback pattern as
      // before I.3, just narrowed to the one case that's still true.
      setSaveNoticeAt(Date.now());
      return;
    }
    const { nodes: liveNodes, edges: liveEdges } = storeApi.getState();
    await db.saves.put({
      id: chapterSaveId(selectedChapter.id),
      updatedAt: Date.now(),
      nodes: liveNodes,
      edges: liveEdges,
    });
    setLoadedSnapshotKey(canvasStateKey(liveNodes, liveEdges));
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1500);
  };

  useCanvasShortcuts(handleSave);

  const [chapterOutcome, setChapterOutcome] = useState<ChapterOutcome | null>(null);
  const [checkedGraphKey, setCheckedGraphKey] = useState<string | null>(null);
  const violations = chapterOutcome?.violations ?? null;

  const currentGraphKey = useMemo(
    () => architectureGraphTopologyKey(toArchitectureGraph(nodes, edges)),
    [nodes, edges],
  );
  const isStale = violations !== null && checkedGraphKey !== currentGraphKey;

  // Scoped to the open chapter's own validationRuleIds, not the full global
  // registry — a chapter should only ever fail on what it's actually
  // teaching (CLAUDE.md: "that's a config option or a validation rule
  // scoped to that chapter"). evaluateChapter (Phase 4) layers the required-
  // component connectivity check and blueprint matching on top of the rule
  // run — a like-for-like swap at this call site, not a parallel code path.
  // No chapter open (Chapter List view) means nothing to validate against.
  const handleValidate = () => {
    if (!selectedChapter) return;
    const graph = toArchitectureGraph(nodes, edges);
    const outcome = evaluateChapter(graph, selectedChapter);
    setChapterOutcome(outcome);
    setCheckedGraphKey(architectureGraphTopologyKey(graph));
    if (outcome.passed) {
      void db.chapterProgress.put({
        chapterId: selectedChapter.id,
        completedAt: Date.now(),
        matchedBlueprintId: outcome.matchedBlueprintId,
      });
    }
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
        <AppHeader
          mode={mode}
          canvasRef={canvasRef}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
          violations={violations}
          isStale={isStale}
          onValidate={handleValidate}
          saveId={selectedChapter ? chapterSaveId(selectedChapter.id) : null}
          onSave={handleSave}
          justSaved={justSaved}
          docsPanelOpen={docsPanelOpen}
          toggleDocsPanel={toggleDocsPanel}
        />
      )}

      <main className="relative flex min-h-0 flex-1 overflow-hidden">
        {!focusMode && (
          <SidebarShell>
            <ChapterSidebar
              chapters={chapters}
              selectedChapterId={selectedChapterId}
              onSelect={requestChapterChange}
              onBack={() => requestChapterChange(null)}
              chapterOutcome={chapterOutcome}
              isStale={isStale}
            />
          </SidebarShell>
        )}
        {/* Stays mounted across focus-mode toggles — see DocsPanel.tsx. */}
        <div className="relative flex flex-1 flex-col">
          <Canvas ref={canvasRef} nodeStates={nodeStates} />
        </div>

        {docsPanelOpen && <DocsPanel />}
      </main>

      {pendingChapterChange !== undefined && (
        <SwitchChapterConfirmPopover
          onCancel={() => setPendingChapterChange(undefined)}
          onConfirm={() => {
            setSelectedChapterId(pendingChapterChange);
            setPendingChapterChange(undefined);
          }}
        />
      )}
      {saveNoticeAt && <SaveNotice key={saveNoticeAt} onDismiss={() => setSaveNoticeAt(null)} />}
      <UndoToast />
    </PageEnter>
  );
}

/** Full nodes+edges identity for dirty-checking a chapter attempt against
 * whatever was last loaded/saved — `selected` stripped since a selection
 * change alone isn't an edit worth warning about (same normalization
 * loadCanvasState itself applies when loading). */
function canvasStateKey(nodes: AnyNodeType[], edges: ArchitectureEdgeType[]): string {
  // JSON.stringify omits undefined-valued keys entirely, so this has the
  // same effect as stripping `selected` — just without a destructure that
  // trips no-unused-vars on the discarded key.
  return JSON.stringify({
    nodes: nodes.map((n) => ({ ...n, selected: undefined })),
    edges: edges.map((e) => ({ ...e, selected: undefined })),
  });
}

/**
 * Reuses the app's one documented floating-menu visual language (see
 * DeleteConfirmPopover.tsx: bg-panel/border-border/rounded-md/shadow-lg,
 * backdrop click = Cancel) rather than introducing a new one — centered
 * instead of anchored to a click position since there's no natural anchor
 * point for a sidebar chapter switch. This is a genuine confirm dialog
 * (the app otherwise prefers toasts/undo, see UndoToast.tsx), justified the
 * same way DeleteConfirmPopover is: discarding an unsaved chapter attempt
 * isn't undoable after the fact.
 */
function SwitchChapterConfirmPopover({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[var(--z-modal-backdrop)] flex items-center justify-center"
      onClick={onCancel}
    >
      <div
        className="z-[var(--z-modal)] w-72 rounded-md border border-border bg-panel p-3 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm text-foreground">This chapter has unsaved changes.</p>
        <p className="mt-1 text-xs text-foreground/60">
          Switch anyway and discard them, or stay and save first?
        </p>
        <div className="mt-3 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-sm font-medium hover:bg-border"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-sm font-medium text-state-error hover:bg-border"
          >
            Discard &amp; Switch
          </button>
        </div>
      </div>
    </div>
  );
}

/** Tells the user Ctrl+S did nothing on purpose, not silently — narrowed by
 * I.3 to the one case still true: no chapter selected, so there's nothing
 * to save against yet. Same fixed-bottom-center chrome as UndoToast, no
 * undo action (there's nothing to undo). Fades/slides in the same way
 * UndoToast does, but — unlike UndoToast — with an explicit `motion-reduce`
 * opt-out to an instant appearance rather than inheriting that gap into a
 * second toast. */
function SaveNotice({ onDismiss }: { onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    const timeout = setTimeout(onDismiss, 3000);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`fixed bottom-4 left-1/2 z-[var(--z-toast)] flex items-center gap-3 rounded-md border border-border bg-panel px-4 py-2.5 text-sm shadow-lg transition-[transform,opacity] duration-150 ease-out motion-reduce:transition-none ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{ transform: `translateX(-50%) translateY(${visible ? "0" : "0.5rem"})` }}
    >
      <span>Select a chapter to save its progress.</span>
      <button onClick={onDismiss} aria-label="Dismiss" className="text-foreground/40 hover:text-foreground">
        <X size={14} />
      </button>
    </div>
  );
}
