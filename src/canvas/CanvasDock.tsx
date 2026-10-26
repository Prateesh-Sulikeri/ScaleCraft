"use client";

import { Flag, Hand, MessageSquare, MousePointer2, Plus, SquareDashedBottom } from "lucide-react";
import { useCanvasStore, type PlacementMode } from "./store";

export type DragMode = "pan" | "select";

type CanvasDockProps = {
  dragMode: DragMode;
  onDragModeChange: (mode: DragMode) => void;
};

const TOOLS: { mode: Exclude<PlacementMode, null>; label: string; icon: typeof Flag }[] = [
  { mode: "zone", label: "Zone", icon: SquareDashedBottom },
  { mode: "comment", label: "Note", icon: MessageSquare },
  { mode: "start", label: "Flag", icon: Flag },
];

const BUTTON =
  "flex h-9 touch:h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 touch:px-3 text-sm transition-colors duration-150 motion-reduce:transition-none";
const IDLE = "border-transparent text-foreground/70 hover:bg-border hover:text-foreground";
const ACTIVE = "border-border bg-border text-foreground";

/**
 * The canvas's visible entry point for everything that used to be
 * right-click or keyboard only: add a component, place an annotation, and
 * choose what a drag on empty canvas does. Same for every input, so a touch
 * user and a mouse user see one editor.
 */
export function CanvasDock({ dragMode, onDragModeChange }: CanvasDockProps) {
  const openComponentPicker = useCanvasStore((s) => s.openComponentPicker);
  const placementMode = useCanvasStore((s) => s.placementMode);
  const setPlacementMode = useCanvasStore((s) => s.setPlacementMode);
  const pendingComponentPlacement = useCanvasStore((s) => s.pendingComponentPlacement);
  const setPendingComponentPlacement = useCanvasStore((s) => s.setPendingComponentPlacement);

  // Pressing the armed tool again disarms it: the only cancel a keyboard-
  // less user has besides the hint pill's own Cancel.
  const toggleTool = (mode: Exclude<PlacementMode, null>) => {
    setPendingComponentPlacement(null);
    setPlacementMode(placementMode === mode ? null : mode);
  };

  return (
    <div
      data-tour="canvas-dock"
      role="toolbar"
      aria-label="Canvas tools"
      className="pointer-events-auto absolute bottom-4 left-1/2 z-[var(--z-dropdown)] flex -translate-x-1/2 items-center gap-1 rounded-md border border-border bg-panel p-1 shadow-lg"
    >
      <button
        type="button"
        onClick={() => {
          setPlacementMode(null);
          openComponentPicker();
        }}
        aria-pressed={pendingComponentPlacement !== null}
        className={`${BUTTON} ${pendingComponentPlacement ? ACTIVE : "border-border text-foreground hover:bg-border"}`}
      >
        <Plus size={16} aria-hidden="true" />
        <span>Add component</span>
      </button>

      <div aria-hidden="true" className="mx-0.5 h-5 w-px bg-border" />

      {TOOLS.map(({ mode, label, icon: Icon }) => (
        <button
          key={mode}
          type="button"
          onClick={() => toggleTool(mode)}
          aria-pressed={placementMode === mode}
          aria-label={`Add ${label.toLowerCase()}`}
          className={`${BUTTON} ${placementMode === mode ? ACTIVE : IDLE}`}
        >
          <Icon size={16} aria-hidden="true" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}

      <div aria-hidden="true" className="mx-0.5 h-5 w-px bg-border" />

      <div role="radiogroup" aria-label="Dragging empty canvas" className="flex items-center gap-0.5">
        <button
          type="button"
          role="radio"
          aria-checked={dragMode === "pan"}
          aria-label="Drag to pan"
          title="Drag to pan"
          onClick={() => onDragModeChange("pan")}
          className={`${BUTTON} ${dragMode === "pan" ? ACTIVE : IDLE}`}
        >
          <Hand size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={dragMode === "select"}
          aria-label="Drag to select"
          title="Drag to select"
          onClick={() => onDragModeChange("select")}
          className={`${BUTTON} ${dragMode === "select" ? ACTIVE : IDLE}`}
        >
          <MousePointer2 size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
