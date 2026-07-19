"use client";

import { useEffect, useRef, useState } from "react";
import { Handle, NodeResizer, Position, type NodeProps } from "@xyflow/react";
import { Server } from "lucide-react";
import { getComponent } from "@/content/components/registry";
import { useCanvasStore } from "./store";
import { categoryColorVar } from "./category-colors";
import { iconMap } from "./icon-map";
import { HIGHLIGHT_GOLD_RING, SELECTED_GLOW } from "./selection-style";
import type { ComponentNodeType, ValidationState } from "./types";

const MIN_WIDTH = 160;
const MIN_HEIGHT = 65;

const stateRingVar: Record<ValidationState, string> = {
  valid: "var(--state-valid)",
  warning: "var(--state-warning)",
  error: "var(--state-error)",
};

/**
 * The node "anatomy" described in .claude/docs/DESIGN_LANGUAGE.md: icon +
 * label + category color accent + validation state ring (whole-card
 * outline) — the two color channels stay visually distinct. Category color
 * now drives a tinted icon badge rather than a left border stripe.
 *
 * Shows a one-line description under the name — the per-instance
 * `data.description` if the user edited it in NodeConfigPopover, else
 * `definition.summary` (Phase 3 tried a Default/Configured config-state
 * badge here instead; reverted per user feedback in favor of this, back to
 * always-a-description).
 *
 * Resizable like Zone/Comment (store.ts's `resizeNode`, same top/left-handle
 * anchor fix) — width defaults to the original fixed 200px, height stays
 * content-driven (`data.height` is undefined pre-resize) but is floored at
 * MIN_HEIGHT via a real CSS `min-height`, not just NodeResizer's `minHeight`
 * prop (that alone only bounds the *drag*, it doesn't apply on first render —
 * confirmed by raising MIN_HEIGHT and seeing no visual change until this was
 * added).
 */
export function ComponentNode({ id, data, selected }: NodeProps<ComponentNodeType>) {
  const resizeNode = useCanvasStore((s) => s.resizeNode);
  // Only used to hide the resizer while a highlight pass is active (see
  // below) — the gold ring itself comes from data.highlighted, already
  // computed once in Canvas.tsx from this same store field.
  const highlightActive = useCanvasStore((s) => s.highlight !== null);
  const definition = getComponent(data.componentId);

  // Pre-resize (data.height undefined), the card auto-sizes to content and
  // the description stays a single truncated line — the original compact
  // default. Only once the user drags the resize handle does data.height
  // become a real, externally-fixed number; from that point the description
  // should use whatever space is actually left, cropping only if the text
  // doesn't fit. A fixed line-clamp-N can't do that (N lines may be too many
  // for a short resize or too few for a tall one), so once resized the
  // description div becomes a flex-1 child of a now-fixed-height card, and a
  // ResizeObserver measures its *actual* rendered height (a real number,
  // fixed by the flex layout, not by the clamp itself) to compute exactly
  // how many lines fit. Doing this in the auto-height default case instead
  // would be circular — the clamp would determine the div's own height,
  // which the observer would then read back as its input.
  const isManuallyResized = typeof data.height === "number";
  const descriptionRef = useRef<HTMLDivElement>(null);
  const [descriptionMaxLines, setDescriptionMaxLines] = useState(1);

  useEffect(() => {
    if (!isManuallyResized) return;
    const el = descriptionRef.current;
    if (!el) return;
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 15;
    const observer = new ResizeObserver(([entry]) => {
      // No Math.max(1, ...) floor here: an aggressively shrunk node can
      // leave less than one line's worth of room (the header — icon/title/
      // instance name — eats most of a near-minimum-height card). Forcing
      // at least 1 line in that case rendered a sliver of text clipped
      // mid-glyph with no ellipsis, which is worse than showing nothing.
      // 0 is a valid, deliberate result: hide the description entirely.
      const lines = Math.floor(entry.contentRect.height / lineHeight);
      setDescriptionMaxLines(lines);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [isManuallyResized]);

  if (!definition) return null;

  const Icon = iconMap[definition.icon] ?? Server;
  const categoryColor = categoryColorVar[definition.category];
  const ringColor = data.validationState ? stateRingVar[data.validationState] : "var(--border)";

  return (
    <div
      className="flex flex-col overflow-hidden rounded-xl border border-border bg-panel px-3 py-2.5 shadow-sm transition-[outline-color,box-shadow] duration-150 ease-out"
      style={{
        width: data.width ?? 200,
        height: data.height,
        minHeight: MIN_HEIGHT,
        outline: `2px solid ${ringColor}`,
        outlineOffset: "1px",
        // Gold takes priority over the plain selection glow — a node can be
        // both `selected` and part of the highlighted path at once, and the
        // highlight is the more specific, more temporary state of the two.
        boxShadow: data.highlighted ? HIGHLIGHT_GOLD_RING : selected ? SELECTED_GLOW : undefined,
      }}
    >
      <NodeResizer
        // Hidden for the whole duration of a Highlight Connections pass,
        // even on an already-selected node — the resize handles otherwise
        // sit on top of the highlighted path and clutter exactly the view
        // this feature is meant to declutter.
        isVisible={selected && !highlightActive}
        minWidth={MIN_WIDTH}
        minHeight={MIN_HEIGHT}
        onResize={(_, params) => resizeNode(id, params.x, params.y, params.width, params.height)}
        lineStyle={{ borderColor: categoryColor }}
        handleStyle={{ backgroundColor: categoryColor, width: 8, height: 8, borderRadius: 2 }}
      />
      {definition.inputs.length > 0 && <Handle type="target" position={Position.Left} />}
      {/* Unconditional, invisible — a Start marker's pointer arrow (see
       * StartNode.tsx/Canvas.tsx) needs a target anchor on every component,
       * including ones with no real inputs (e.g. Client), so it can't reuse
       * the conditional target handle above. */}
      <Handle
        type="target"
        id="start-target"
        position={Position.Top}
        isConnectable={false}
        style={{ opacity: 0, pointerEvents: "none" }}
      />
      <div className="flex min-h-0 flex-1 gap-2.5">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center self-start rounded-lg"
          style={{ backgroundColor: `color-mix(in srgb, ${categoryColor} 20%, transparent)` }}
        >
          <Icon size={16} style={{ color: categoryColor }} />
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col pt-0.5">
          <div className="shrink-0 text-sm font-semibold leading-tight text-foreground">
            {definition.label}
          </div>
          {data.name?.trim() && (
            // The user's own instance label ("server-1-ind") — monospace to
            // read as an identifier, distinct from the label above it (same
            // code-shaped-text convention as DESIGN_LANGUAGE.md's
            // config-value typography). Shown alongside the label now, not
            // instead of it.
            <div className="mt-0.5 shrink-0 truncate font-mono text-[11px] leading-snug text-foreground/70">
              {data.name}
            </div>
          )}
          {isManuallyResized ? (
            // Outer wrapper's height comes only from the flex-1 distribution
            // of the now-fixed card height — never from its own content — so
            // its `overflow-hidden` is a hard, unconditional clip boundary.
            // The inner div is the one that actually applies
            // `-webkit-line-clamp`, which sets ITS OWN preferred height from
            // `descriptionMaxLines`; if that guess is ever stale by a frame
            // (e.g. mid-drag, before the ResizeObserver below catches up),
            // the inner div may ask for more height than is available, but
            // the outer wrapper physically cannot show more than it was
            // given. Without this split, the clamped text's self-imposed
            // height could disagree with the flex-allocated space and spill
            // past the card's rounded border — the exact glitch seen when
            // `-webkit-line-clamp` lived directly on the flex-1 element.
            <div ref={descriptionRef} className="mt-1 min-h-0 flex-1 overflow-hidden">
              {descriptionMaxLines > 0 && (
                <div
                  className="break-words text-[11px] leading-snug text-foreground/50"
                  style={{
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: descriptionMaxLines,
                    overflow: "hidden",
                  }}
                >
                  {data.description ?? definition.summary}
                </div>
              )}
            </div>
          ) : (
            <div className="mt-1 truncate text-[11px] leading-snug text-foreground/50">
              {data.description ?? definition.summary}
            </div>
          )}
        </div>
      </div>
      {definition.outputs.length > 0 && <Handle type="source" position={Position.Right} />}
    </div>
  );
}
