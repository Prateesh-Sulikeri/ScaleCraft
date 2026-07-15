"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ColorPicker } from "./ColorPicker";
import { DEFAULT_ZONE_COLOR, DEFAULT_COMMENT_COLOR } from "./annotation-colors";
import { useCanvasStore } from "./store";

const POPUP_WIDTH = 224;
// Rough upper bound (color row + label field + Done button at this padding)
// — only used to keep the popup from opening off the bottom of the screen,
// not for exact layout.
const POPUP_EST_HEIGHT = 260;

/**
 * A small floating editor for a single Zone or Comment's color + label/text,
 * opened right where the node was just placed (see Canvas.tsx's
 * placement-drop handling) rather than requiring a new user to notice the
 * tiny Pencil button that also reopens this — see openAnnotationEditor in
 * store.ts. Reads `editingAnnotation` directly from the store instead of
 * taking props, so it can be mounted once, unconditionally, in Canvas.tsx.
 */
export function AnnotationEditor() {
  const editingAnnotation = useCanvasStore((s) => s.editingAnnotation);
  const closeAnnotationEditor = useCanvasStore((s) => s.closeAnnotationEditor);
  const nodes = useCanvasStore((s) => s.nodes);
  const updateZone = useCanvasStore((s) => s.updateZone);
  const updateComment = useCanvasStore((s) => s.updateComment);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!editingAnnotation) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeAnnotationEditor();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editingAnnotation, closeAnnotationEditor]);

  useEffect(() => {
    if (!editingAnnotation) return;
    inputRef.current?.focus();
    textareaRef.current?.focus();
  }, [editingAnnotation]);

  if (!editingAnnotation) return null;
  const node = nodes.find((n) => n.id === editingAnnotation.id);
  if (!node) return null;

  // Branched per literal node type (not a generic accessor) — narrowing a
  // discriminated union only works one member at a time, same reasoning as
  // the nodeStates merge in Canvas.tsx.
  let color: string;
  let isZone: boolean;
  let labelValue: string;
  let onLabelChange: (value: string) => void;
  let onColorChange: (value: string) => void;

  if (node.type === "zone") {
    color = node.data.color ?? DEFAULT_ZONE_COLOR;
    isZone = true;
    labelValue = node.data.label;
    onLabelChange = (value) => updateZone(node.id, { label: value });
    onColorChange = (value) => updateZone(node.id, { color: value });
  } else if (node.type === "comment") {
    color = node.data.color ?? DEFAULT_COMMENT_COLOR;
    isZone = false;
    labelValue = node.data.text;
    onLabelChange = (value) => updateComment(node.id, { text: value });
    onColorChange = (value) => updateComment(node.id, { color: value });
  } else {
    return null;
  }

  const left = Math.min(Math.max(editingAnnotation.anchor.x, 8), window.innerWidth - POPUP_WIDTH - 8);
  const top = Math.min(editingAnnotation.anchor.y, window.innerHeight - POPUP_EST_HEIGHT - 8);

  return createPortal(
    <>
      {/* Full-screen catcher to close on the next click anywhere else —
       * same convention as ContextMenu.tsx. */}
      <div className="fixed inset-0 z-40" onClick={closeAnnotationEditor} />
      <div
        className="fixed z-50 rounded-lg border border-border bg-panel p-3 shadow-lg"
        style={{ left, top, width: POPUP_WIDTH }}
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-[11px] font-semibold uppercase tracking-wide text-foreground/60">
          {isZone ? "Zone label" : "Comment"}
        </p>
        {isZone ? (
          <input
            ref={inputRef}
            value={labelValue}
            onChange={(event) => onLabelChange(event.target.value)}
            placeholder="Zone label"
            className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-sm outline-none focus:border-foreground/40"
          />
        ) : (
          <textarea
            ref={textareaRef}
            value={labelValue}
            onChange={(event) => onLabelChange(event.target.value)}
            placeholder="Comment…"
            rows={3}
            className="mt-1 w-full resize-none rounded border border-border bg-background px-2 py-1 text-sm outline-none focus:border-foreground/40"
          />
        )}

        <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-foreground/60">Color</p>
        <div className="mt-1.5">
          <ColorPicker value={color} onChange={onColorChange} />
        </div>

        <button
          type="button"
          onClick={closeAnnotationEditor}
          className="mt-3 w-full rounded-md border border-border bg-panel py-1 text-xs font-medium hover:bg-border"
        >
          Done
        </button>
      </div>
    </>,
    document.body,
  );
}
