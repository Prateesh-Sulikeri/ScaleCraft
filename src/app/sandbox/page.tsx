"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MouseRight, X } from "lucide-react";
import { Canvas, type CanvasHandle } from "@/canvas/Canvas";
import { DocsPanel } from "@/canvas/docs-panel/DocsPanel";
import { FocusModeBar } from "@/canvas/docs-panel/FocusModeBar";
import { UndoToast } from "@/app/UndoToast";
import { AppHeader } from "@/app/AppHeader";
import { PageEnter } from "@/app/PageEnter";
import { useCanvasShortcuts } from "@/canvas/use-canvas-shortcuts";
import { useDismissedFlag } from "@/lib/use-dismissed-flag";
import {
  useCanvasStore,
  useCanvasStoreApi,
  CanvasStoreProvider,
  toArchitectureGraph,
  architectureGraphTopologyKey,
} from "@/canvas/store";
import { useCustomComponentsStore } from "@/canvas/custom-components-store";
import type { ValidationState } from "@/canvas/types";
import type { ArchitectureGraph } from "@/lib/graph";
import { runValidation } from "@/validation-engine/engine";
import { ruleRegistry } from "@/validation-engine/rules";
import type { ValidationViolation } from "@/validation-engine/types";
import { getComponent } from "@/content/components/registry";
import type { DeepCheckContext } from "@/ai/prompt";
import { db, SANDBOX_SAVE_ID } from "@/persistence/db";
import { useAutosave } from "@/persistence/use-autosave";

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
  return (
    <CanvasStoreProvider>
      <SandboxPageContent />
    </CanvasStoreProvider>
  );
}

function SandboxPageContent() {
  const storeApi = useCanvasStoreApi();
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const loadGraph = useCanvasStore((s) => s.loadGraph);
  const loadCanvasState = useCanvasStore((s) => s.loadCanvasState);
  const loadCustomComponents = useCustomComponentsStore((s) => s.loadCustomComponents);
  const undo = useCanvasStore((s) => s.undo);
  const redo = useCanvasStore((s) => s.redo);
  const canUndo = useCanvasStore((s) => s.past.length > 0);
  const canRedo = useCanvasStore((s) => s.future.length > 0);
  const docsPanelOpen = useCanvasStore((s) => !s.docsPanel.minimized || s.docsPanel.focusMode);
  const toggleDocsPanel = useCanvasStore((s) => s.toggleDocsPanel);
  const focusMode = useCanvasStore((s) => s.docsPanel.focusMode);

  // Gates every write to the sandbox save slot (autosave AND the
  // unmount-save further down) until this restore read has actually
  // resolved — see the identical, more-detailed comment in
  // ChapterWorkspace.tsx. In short: under React StrictMode (Next's dev-mode
  // default), the unmount-save effect's cleanup fires once synchronously as
  // part of the phantom mount/cleanup cycle, before this read has any
  // chance to resolve — without this guard it unconditionally overwrote a
  // real save with {nodes: [], edges: []} on every dev-mode Sandbox visit.
  // Tracked twice: `hasLoadedInitialState` (state) drives useAutosave's
  // `saveId` argument below (a normal render-time value); `...Ref` (ref) is
  // what the unmount-save cleanup reads, since a cleanup needs the current
  // value at teardown time and reading a ref during render isn't allowed
  // (react-hooks/refs).
  const [hasLoadedInitialState, setHasLoadedInitialState] = useState(false);
  const hasLoadedInitialStateRef = useRef(false);

  // On mount, prefer restoring a prior Save (see src/persistence/db.ts) over
  // the seed demo graph — this is what makes a refresh not lose work.
  useEffect(() => {
    if (storeApi.getState().nodes.length > 0) return;
    db.saves.get(SANDBOX_SAVE_ID).then((save) => {
      if (storeApi.getState().nodes.length > 0) return;
      if (save) {
        loadCanvasState(save.nodes, save.edges);
      } else {
        loadGraph(seedGraph);
      }
      hasLoadedInitialStateRef.current = true;
      setHasLoadedInitialState(true);
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

  // Autosave-on-edit (MILESTONES.md #9) — fires once the graph stops
  // changing for AUTOSAVE_DEBOUNCE_MS, independent of the unmount cleanup
  // below. null until the restore above has actually completed (see
  // hasLoadedInitialState). `saveNow` also backs the explicit Save button/
  // Ctrl+S so both paths drive the one shared status shown in AppHeader.
  const { status: saveStatus, saveNow } = useAutosave(
    hasLoadedInitialState ? SANDBOX_SAVE_ID : null,
    nodes,
    edges,
  );

  // Each mode's canvas store instance is created fresh on mount (see
  // CanvasStoreProvider) and torn down on unmount — without this, navigating
  // away without an explicit Save would silently lose in-progress edits
  // instead of just fixing the cross-mode leak this store split was for.
  // Mirrors the Save button's own db.saves.put shape exactly.
  useEffect(() => {
    return () => {
      if (!hasLoadedInitialStateRef.current) return;
      const { nodes, edges } = storeApi.getState();
      void db.saves.put({ id: SANDBOX_SAVE_ID, updatedAt: Date.now(), nodes, edges });
    };
  }, [storeApi]);

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

  useCanvasShortcuts(() => void saveNow());

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

  // Sandbox always builds the pre-pass shape — no chapter, no blueprints,
  // per prompt.ts's own "Absent for Sandbox" doc comment (§10.6's last
  // line). Recomputed on nodes/edges/violations, not currentGraphKey — this
  // doesn't need to track staleness the way Validate's own result does.
  const deepCheckCtx: DeepCheckContext = useMemo(() => {
    const graph = toArchitectureGraph(nodes, edges);
    const presentComponentIds = new Set(graph.nodes.map((n) => n.componentId));
    const components = [...presentComponentIds]
      .map((id) => getComponent(id))
      .filter((c) => c !== undefined);
    return { graph, components, violations: violations ?? [], passed: false };
  }, [nodes, edges, violations]);

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
          saveId={SANDBOX_SAVE_ID}
          onSave={() => void saveNow()}
          saveStatus={saveStatus}
          docsPanelOpen={docsPanelOpen}
          toggleDocsPanel={toggleDocsPanel}
          deepCheckCtx={deepCheckCtx}
        />
      )}

      <main className="relative flex min-h-0 flex-1 overflow-hidden">
        <div className="relative flex flex-1 flex-col">
          {!focusMode && showInsertHint && (
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
          {/* Stays mounted across focus-mode toggles — see DocsPanel.tsx. */}
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

        {docsPanelOpen && <DocsPanel />}
      </main>

      <UndoToast />
    </PageEnter>
  );
}
