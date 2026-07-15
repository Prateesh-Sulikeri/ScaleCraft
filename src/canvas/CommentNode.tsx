"use client";

import { Pencil } from "lucide-react";
import { NodeResizer, type NodeProps } from "@xyflow/react";
import { useCanvasStore } from "./store";
import { DEFAULT_COMMENT_COLOR } from "./annotation-colors";
import type { CommentNodeType } from "./types";

/**
 * A free-floating annotation note — meta-commentary about the diagram
 * itself (e.g. "source: hellointerview.com, go check them out"), not part
 * of the architecture. Resizable like ZoneNode (needs room for body text),
 * but deliberately does NOT reuse Zone's animated dashed border: a comment
 * isn't "part of the live system" the way a zone grouping or a request-flow
 * edge is (see DESIGN_LANGUAGE.md's "every animation must mean something"),
 * so it gets a plain static border instead. Color is user-customizable (see
 * AnnotationEditor.tsx, opened via the Pencil button below) rather than a
 * fixed accent, same as ZoneNode — defaults to DEFAULT_COMMENT_COLOR (a
 * generic blue, deliberately not the app's `--category-networking` token,
 * so it doesn't imply "this is a Networking component" the way reusing that
 * channel's color would).
 */
export function CommentNode({ id, data, selected }: NodeProps<CommentNodeType>) {
  const updateComment = useCanvasStore((s) => s.updateComment);
  const openAnnotationEditor = useCanvasStore((s) => s.openAnnotationEditor);
  const color = data.color ?? DEFAULT_COMMENT_COLOR;

  return (
    <div
      style={{
        width: data.width,
        height: data.height,
        borderColor: `color-mix(in srgb, ${color} 50%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${color} 5%, transparent)`,
      }}
      className="relative flex flex-col rounded-lg border p-2 shadow-sm"
    >
      <NodeResizer
        isVisible={selected}
        minWidth={160}
        minHeight={100}
        onResize={(_, params) => updateComment(id, { width: params.width, height: params.height })}
        lineStyle={{ borderColor: color }}
        handleStyle={{ backgroundColor: color, width: 8, height: 8, borderRadius: 2 }}
      />
      {selected && (
        // Reopens the same color+text popup shown right after placement
        // (see AnnotationEditor.tsx) — one discoverable way to change a
        // comment's color, not a second, separate inline control.
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            openAnnotationEditor(id, { x: event.clientX, y: event.clientY });
          }}
          aria-label="Edit comment"
          className="nodrag absolute -right-1.5 -top-1.5 z-10 rounded border border-border bg-panel p-1 text-foreground/60 shadow-sm hover:text-foreground"
        >
          <Pencil size={11} />
        </button>
      )}
      <textarea
        value={data.text}
        onChange={(event) => updateComment(id, { text: event.target.value })}
        placeholder="Comment…"
        // "nodrag" opts this out of xyflow's node-drag gesture (same
        // convention as ZoneNode's label input) so clicking in to type
        // doesn't drag the whole note instead of placing a text cursor.
        className="nodrag min-h-0 flex-1 resize-none bg-transparent text-xs leading-snug text-foreground/80 outline-none placeholder:text-foreground/40"
      />
    </div>
  );
}
