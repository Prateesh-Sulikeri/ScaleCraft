"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Redo2, Save, Undo2, Upload } from "lucide-react";
import { Canvas, type CanvasHandle } from "@/canvas/Canvas";
import { NodeInspector } from "@/canvas/NodeInspector";
import { DocsWindows } from "@/canvas/DocsWindows";
import { UndoToast } from "@/app/UndoToast";
import { ThemeToggle } from "@/app/ThemeToggle";
import { ValidationIndicator } from "@/app/ValidationIndicator";
import { ExportMenu } from "@/app/ExportMenu";
import { BoardMenu } from "@/app/BoardMenu";
import { QuestionPanel } from "@/app/QuestionPanel";
import { ModeBadge } from "@/app/ModeBadge";
import { PageEnter } from "@/app/PageEnter";
import { ShortcutsButton } from "@/app/ShortcutsButton";
import { useCanvasShortcuts } from "@/canvas/use-canvas-shortcuts";
import { useCanvasStore, toArchitectureGraph } from "@/canvas/store";
import type { AnyNodeType, ArchitectureEdgeType, ValidationState } from "@/canvas/types";
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

  const [saveLabel, setSaveLabel] = useState<"Save" | "Saved">("Save");
  const [importError, setImportError] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<CanvasHandle>(null);

  const handleSave = async () => {
    const { nodes, edges } = useCanvasStore.getState();
    await db.saves.put({ id: SANDBOX_SAVE_ID, updatedAt: Date.now(), nodes, edges });
    setSaveLabel("Saved");
    setTimeout(() => setSaveLabel("Save"), 1500);
  };

  useCanvasShortcuts(handleSave);

  const handleImportFile = async (file: File) => {
    setImportError(null);
    try {
      const parsed = JSON.parse(await file.text());
      if (!Array.isArray(parsed?.nodes) || !Array.isArray(parsed?.edges)) {
        throw new Error("File is missing nodes/edges arrays.");
      }
      loadCanvasState(parsed.nodes as AnyNodeType[], parsed.edges as ArchitectureEdgeType[]);
    } catch {
      setImportError("Couldn't import that file — not a valid ScaleCraft canvas export.");
    }
  };

  // Validation is explicit, not live — per direction, an automatic
  // per-edit re-check felt noisy. `checkedGraphKey` is a snapshot of the
  // graph at the moment "Validate" was last clicked; comparing it to the
  // current graph is how we know results are stale without re-running
  // anything automatically.
  const [violations, setViolations] = useState<ValidationViolation[] | null>(null);
  const [checkedGraphKey, setCheckedGraphKey] = useState<string | null>(null);

  const currentGraphKey = JSON.stringify(toArchitectureGraph(nodes, edges));
  const isStale = violations !== null && checkedGraphKey !== currentGraphKey;

  const handleValidate = () => {
    const graph = toArchitectureGraph(nodes, edges);
    setViolations(runValidation(graph, ruleRegistry));
    setCheckedGraphKey(JSON.stringify(graph));
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
          <div className="flex items-center overflow-hidden rounded-md border border-border bg-panel">
            <button
              onClick={undo}
              disabled={!canUndo}
              aria-label="Undo"
              title="Undo (Ctrl+Z)"
              className="flex items-center px-2.5 py-1.5 hover:bg-border disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <Undo2 size={14} />
            </button>
            <div className="h-4 w-px bg-border" />
            <button
              onClick={redo}
              disabled={!canRedo}
              aria-label="Redo"
              title="Redo (Ctrl+Shift+Z)"
              className="flex items-center px-2.5 py-1.5 hover:bg-border disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <Redo2 size={14} />
            </button>
          </div>
          <div className="flex flex-col items-end">
            <button
              onClick={handleSave}
              title="Save (Ctrl+S)"
              className="flex items-center gap-1.5 rounded-md border border-border bg-panel px-3 py-1.5 text-sm font-medium hover:bg-border"
            >
              <Save size={14} />
              {saveLabel}
            </button>
          </div>
          <ExportMenu canvasRef={canvasRef} />
          <BoardMenu />
          <div className="flex flex-col items-end">
            <button
              onClick={() => importInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-md border border-border bg-panel px-3 py-1.5 text-sm font-medium hover:bg-border"
            >
              <Upload size={14} />
              Import
            </button>
            {importError && <p className="mt-1 max-w-[220px] text-xs text-state-error">{importError}</p>}
          </div>
          <input
            ref={importInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImportFile(file);
              e.target.value = "";
            }}
          />
          <ValidationIndicator violations={violations} isStale={isStale} onValidate={handleValidate} />
          <ShortcutsButton />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex min-h-0 flex-1 overflow-hidden">
        <QuestionPanel intro="Drag components from the palette, connect them, then click Validate." />

        <div className="flex flex-1 flex-col">
          <Canvas ref={canvasRef} nodeStates={nodeStates} />
        </div>

        <NodeInspector />
      </main>

      <DocsWindows />
      <UndoToast />
    </PageEnter>
  );
}
