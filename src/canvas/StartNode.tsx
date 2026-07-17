"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Flag, Lock, Pencil, Unlock } from "lucide-react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useCanvasStore } from "./store";
import { componentDisplayNames } from "./component-display-name";
import { DEFAULT_FLAG_COLOR } from "./annotation-colors";
import { StartTargetPicker } from "./StartTargetPicker";
import type { ComponentNodeType, StartNodeType } from "./types";

/**
 * A Flag — a labeled marker pointing at a component, general-purpose (not
 * only "start reading here": `color` is user-editable per instance via the
 * same Pencil-button + AnnotationEditor pattern Zone/Comment already use, so
 * one flag can mean "known issue," another "verified path," etc). Reuses
 * ComponentNode's own card anatomy (rounded-xl card, tinted icon badge,
 * colored icon-not-badge) so it shares the canvas's established visual
 * grammar — an earlier full rounded-full pill with a thick uniform ring read
 * as a caution-tape capsule, not a diagram marker.
 *
 * `targetId` is picked from StartTargetPicker (a searchable popover, not a
 * native `<select>`) rather than by dragging a handle: a real draggable edge
 * would read as a request-flow connection, and would also only reach
 * components that happen to have a target handle (Client has none — it
 * never receives a request). The arrow itself is a derived, canvas-only
 * visual computed from `targetId` in Canvas.tsx — it never becomes a real
 * edge. The two Handles below are invisible, non-connectable anchors that
 * only exist so xyflow has a point to draw that arrow from/to.
 */
export function StartNode({ id, data, selected }: NodeProps<StartNodeType>) {
  const updateStartMarker = useCanvasStore((s) => s.updateStartMarker);
  const openAnnotationEditor = useCanvasStore((s) => s.openAnnotationEditor);
  const toggleAnnotationLock = useCanvasStore((s) => s.toggleAnnotationLock);
  const nodes = useCanvasStore((s) => s.nodes);
  const componentNodes = useMemo(
    () => nodes.filter((n): n is ComponentNodeType => n.type === "component"),
    [nodes],
  );
  const displayNames = useMemo(() => componentDisplayNames(componentNodes), [componentNodes]);
  const targetLabel = data.targetId ? displayNames.get(data.targetId) : undefined;
  const color = data.color ?? DEFAULT_FLAG_COLOR;
  const locked = data.locked ?? false;

  // The anchor rect is captured from the click event itself (event.currentTarget),
  // not a ref read during render — reading ref.current outside an
  // effect/handler isn't allowed, same convention as ContextMenu.tsx's Flyout.
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  return (
    <div
      style={{
        // Resting border matches every other card (border-border); only
        // shifts to this flag's own color on selection — same restrained
        // "state change, not decoration" posture as the rest of the canvas.
        borderColor: selected ? `color-mix(in srgb, ${color} 65%, transparent)` : undefined,
      }}
      className="relative w-[180px] rounded-xl border border-border bg-panel px-3 py-2.5 shadow-sm transition-colors"
    >
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `color-mix(in srgb, ${color} 20%, transparent)` }}
        >
          <Flag size={16} style={{ color }} />
        </div>
        <input
          value={data.label}
          onChange={(event) => updateStartMarker(id, { label: event.target.value })}
          placeholder="Flag"
          className="nodrag min-w-0 flex-1 bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-foreground/40"
        />
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setAnchorRect(event.currentTarget.getBoundingClientRect());
        }}
        className={`nodrag mt-2 flex w-full items-center justify-between gap-1 rounded-md px-2 py-1 text-left text-xs ${
          targetLabel
            ? "bg-background text-foreground/75 hover:text-foreground"
            : "border border-dashed border-foreground/25 text-foreground/45 hover:text-foreground/70"
        }`}
      >
        <span className="min-w-0 truncate">{targetLabel ?? "Set target…"}</span>
        <ChevronDown size={12} className="shrink-0 opacity-60" />
      </button>

      {locked && (
        // Persistent, not gated on `selected` — a locked flag should read
        // as locked at a glance, matching Zone/Comment. Floats just OUTSIDE
        // the top-left corner (negative offset), not inside it — an inside
        // position previously sat directly on top of label text and covered
        // it (see ZoneNode.tsx's identical fix).
        <div
          className="nodrag pointer-events-none absolute -left-1.5 -top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded border border-border bg-panel text-foreground/50 shadow-sm"
          aria-label="Locked"
        >
          <Lock size={11} />
        </div>
      )}

      {selected && (
        <div className="nodrag absolute -right-1.5 -top-1.5 z-10 flex gap-1">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              toggleAnnotationLock(id);
            }}
            aria-label={locked ? "Unlock flag" : "Lock flag"}
            title={locked ? "Unlock flag" : "Lock flag"}
            className="rounded border border-border bg-panel p-1 text-foreground/60 shadow-sm hover:text-foreground"
          >
            {locked ? <Unlock size={11} /> : <Lock size={11} />}
          </button>
          {/* Reopens the same color popup shown right after placement (see
           * AnnotationEditor.tsx) — same discoverable-edit convention as
           * ZoneNode/CommentNode's Pencil button. */}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              openAnnotationEditor(id, { x: event.clientX, y: event.clientY });
            }}
            aria-label="Edit flag color"
            title="Edit flag color"
            className="rounded border border-border bg-panel p-1 text-foreground/60 shadow-sm hover:text-foreground"
          >
            <Pencil size={11} />
          </button>
        </div>
      )}

      {anchorRect && (
        <StartTargetPicker
          anchorRect={anchorRect}
          componentNodes={componentNodes}
          selectedId={data.targetId ?? null}
          onSelect={(targetId) => updateStartMarker(id, { targetId })}
          onClose={() => setAnchorRect(null)}
        />
      )}

      <Handle
        type="source"
        id="start-source"
        position={Position.Right}
        isConnectable={false}
        style={{ opacity: 0, pointerEvents: "none" }}
      />
    </div>
  );
}
