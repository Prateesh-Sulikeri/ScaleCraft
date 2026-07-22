"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { BookOpen, Check, MouseRight, Redo2, Save, Undo2, X } from "lucide-react";
import { Canvas, type CanvasHandle } from "@/canvas/Canvas";
import { DocsPanel } from "@/canvas/docs-panel/DocsPanel";
import { FocusModeBar } from "@/canvas/docs-panel/FocusModeBar";
import { Tooltip } from "@/app/Tooltip";
import { UndoToast } from "@/app/UndoToast";
import { ThemeToggle } from "@/app/ThemeToggle";
import { ValidationIndicator } from "@/app/ValidationIndicator";
import { ProjectMenu } from "@/app/ProjectMenu";
import { BoardMenu } from "@/app/BoardMenu";
import { ModeBadge } from "@/app/ModeBadge";
import { PageEnter } from "@/app/PageEnter";
import { ShortcutsButton } from "@/app/ShortcutsButton";
import { useCanvasShortcuts } from "@/canvas/use-canvas-shortcuts";
import { useDismissedFlag } from "@/lib/use-dismissed-flag";
import { useCanvasStore, toArchitectureGraph, architectureGraphTopologyKey } from "@/canvas/store";
import type { ValidationState } from "@/canvas/types";
import type { ArchitectureGraph } from "@/lib/graph";
import { modeColorVar } from "@/lib/modes";
import { runValidation } from "@/validation-engine/engine";
import { ruleRegistry } from "@/validation-engine/rules";
import type { ValidationViolation } from "@/validation-engine/types";
import { db, SANDBOX_SAVE_ID } from "@/persistence/db";

// Seeded once on first load so the canvas isn't empty — not a chapter
// starterGraph (those arrive with the chapter framework, milestone 5), just
// a friendlier first impression than a blank pane.
// Two rows rather than one wide row: at the node width needed to fit a
// title + description (see ComponentNode), four nodes in a single line
// don't fit the center canvas column at a comfortable zoom — this halves
// the horizontal span fitView has to accommodate.
const seedGraph: ArchitectureGraph = {
  nodes: [
    { id: "client-1", componentId: "client", position: { x: 0, y: 0 }, config: {} },
    {
      id: "lb-1",
      componentId: "load-balancer",
      position: { x: 280, y: 0 },
      config: { algorithm: "round-robin" },
    },
    {
      id: "app-1",
      componentId: "app-server",
      position: { x: 0, y: 160 },
      config: { instances: 2 },
    },
    {
      id: "db-1",
      componentId: "sql-database",
      position: { x: 280, y: 160 },
      config: { engine: "postgres" },
    },
  ],
  edges: [
    { id: "e1", source: "client-1", target: "lb-1", kind: "request-flow" },
    { id: "e2", source: "lb-1", target: "app-1", kind: "request-flow" },
    { id: "e3", source: "app-1", target: "db-1", kind: "request-flow" },
  ],
  entryPointIds: [],
};

const mode = "sandbox" as const;

export default function SandboxPage() {
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const loadGraph = useCanvasStore((s) => s.loadGraph);
  const loadCanvasState = useCanvasStore((s) => s.loadCanvasState);
  const loadCustomComponents = useCanvasStore((s) => s.loadCustomComponents);
  const undo = useCanvasStore((s) => s.undo);
  const redo = useCanvasStore((s) => s.redo);
  const canUndo = useCanvasStore((s) => s.past.length > 0);
  const canRedo = useCanvasStore((s) => s.future.length > 0);
  const docsPanelOpen = useCanvasStore((s) => !s.docsPanel.minimized || s.docsPanel.focusMode);
  const toggleDocsPanel = useCanvasStore((s) => s.toggleDocsPanel);
  const focusMode = useCanvasStore((s) => s.docsPanel.focusMode);

  // On mount, prefer restoring a prior Save (see src/persistence/db.ts) over
  // the seed demo graph — this is what makes a refresh not lose work.
  useEffect(() => {
    if (useCanvasStore.getState().nodes.length > 0) return;
    db.saves.get(SANDBOX_SAVE_ID).then((save) => {
      if (useCanvasStore.getState().nodes.length > 0) return;
      if (save) {
        loadCanvasState(save.nodes, save.edges);
      } else {
        loadGraph(seedGraph);
      }
    });
    // Runs once on mount; loadGraph/loadCanvasState are stable store actions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Custom components (see CreateComponentModal.tsx) are separate from the
  // canvas save above — they're registry entries, not canvas state, so this
  // loads regardless of whether a save exists.
  useEffect(() => {
    db.customComponents.toArray().then(loadCustomComponents);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Icon-only header button (see Tooltip below) — the text label "Saved"
  // that used to carry this feedback is gone, so a brief icon swap
  // (Save -> Check, same 1.5s window as before) is what now communicates
  // "it worked" without needing to hover the tooltip to see it.
  const [justSaved, setJustSaved] = useState(false);
  const canvasRef = useRef<CanvasHandle>(null);

  // The palette sidebar was the only always-visible insertion affordance;
  // removing it (see .claude/docs/UI_OVERHAUL_PART2_SPEC.md) means a
  // first-time user has no obvious next step without this. Gating on an
  // empty canvas alone isn't enough — the seed demo graph means most users
  // never actually see an empty board, so this shows regardless of node
  // count until dismissed once (localStorage, not session state — a user
  // who's already learned the gesture shouldn't see it again next visit).
  const [hintDismissed, dismissHint] = useDismissedFlag("sc-insert-hint-dismissed");
  const showInsertHint = !hintDismissed;

  const handleSave = async () => {
    const { nodes, edges } = useCanvasStore.getState();
    await db.saves.put({ id: SANDBOX_SAVE_ID, updatedAt: Date.now(), nodes, edges });
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1500);
  };

  useCanvasShortcuts(handleSave);

  // Validation is explicit, not live — per direction, an automatic
  // per-edit re-check felt noisy. `checkedGraphKey` is a snapshot of the
  // graph at the moment "Validate" was last clicked; comparing it to the
  // current graph is how we know results are stale without re-running
  // anything automatically.
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
      // A passing run needs a lasting signal on the canvas itself, not just
      // a dropdown line that closes on the next click — otherwise failure
      // gets a persistent visual result and success doesn't.
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
            {/* One split button, not two separate ones — bg-panel on the
             * shared container is what makes this actually match Save/Export/
             * Board (the prior merged version omitted it and rendered
             * transparent against the header, which read as "doesn't match"). */}
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
            <Tooltip label="Save (Ctrl+S)">
              <button
                onClick={handleSave}
                aria-label="Save"
                className={`flex h-8 w-8 items-center justify-center rounded-md border bg-panel hover:text-foreground ${
                  justSaved ? "border-state-valid text-state-valid" : "border-border text-foreground/70"
                }`}
              >
                {justSaved ? <Check size={16} /> : <Save size={16} />}
              </button>
            </Tooltip>
            <ProjectMenu canvasRef={canvasRef} />
            <BoardMenu />
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
          <div className="relative flex flex-1 flex-col">
            {showInsertHint && (
              <div className="absolute left-1/2 top-4 z-[var(--z-dropdown)] flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-panel px-3 py-1.5 text-xs text-foreground/80 shadow-lg">
                <MouseRight size={14} className="shrink-0 text-foreground/70" />
                <span>Right-click the canvas or press / to add a component</span>
                <button
                  type="button"
                  onClick={dismissHint}
                  aria-label="Dismiss hint"
                  className="text-foreground/50 hover:text-foreground"
                >
                  <X size={12} />
                </button>
              </div>
            )}
            <Canvas
              ref={canvasRef}
              nodeStates={nodeStates}
              // Clicking blank canvas dismisses the last Validate run
              // (the green/red ring on every node, and the header
              // button's own color) — without this, a passing run had
              // no way back to neutral short of editing the graph.
              onCanvasPaneClick={() => {
                setViolations(null);
                setCheckedGraphKey(null);
              }}
            />
          </div>
        )}

        {docsPanelOpen && <DocsPanel />}
      </main>

      <UndoToast />
    </PageEnter>
  );
}
