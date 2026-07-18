"use client";

import { useEffect, useMemo, useRef } from "react";
import { FileText } from "lucide-react";
import { useCanvasStore } from "./store";
import { getComponent } from "@/content/components/registry";
import { ConfigForm } from "./ConfigForm";
import { Popover, PopoverAnchor, PopoverArrow, PopoverContent } from "@/components/ui/popover";

const POPOVER_WIDTH = 288;

/**
 * Replaces NodeInspector's permanent sidebar (see .claude/docs/pending.md
 * Phase 2) — same instance-name + ConfigForm body, now anchored beside
 * whichever node triggered it (double-click or the context menu's
 * "Configure" item) instead of permanently docked. Driven by store.ts's
 * configPopover, mirroring AnnotationEditor's editingAnnotation pattern.
 *
 * Anchored to the *node's own rendered rect*, not the trigger click point —
 * `configPopover.anchor` is only a fallback for the one frame before the
 * node's element can be queried. React Flow gives every node a
 * `.react-flow__node[data-id]` wrapper (its own internal update path
 * queries the same selector — see @xyflow/react's NodeChanges handling),
 * so this is a stable, already-relied-on-by-the-library hook, not a fragile
 * guess at their DOM structure. The measurable re-queries live on every
 * call (not a cached rect) so floating-ui's position updates keep tracking
 * the node if it's dragged while the popover is open, and `side="right"`
 * with Radix's default `avoidCollisions` is what makes it consistently
 * open beside the node while still flipping to the left (or shifting
 * vertically) instead of running off-screen near a viewport edge — real
 * collision math from the library, not hand-rolled edge-flip like
 * ContextMenu.tsx's Flyout.
 *
 * Live-update: every field commits immediately via updateNodeConfig/
 * updateNodeName (ConfigForm's existing behavior, unchanged) — closing the
 * popover isn't a "cancel," it's just hiding a form whose edits are already
 * saved. Radix's Popover handles outside-click/Escape dismissal itself, so
 * there's no hand-rolled full-screen catcher here (unlike ContextMenu.tsx/
 * AnnotationEditor.tsx, which predate this primitive).
 */
export function NodeConfigPopover() {
  const configPopover = useCanvasStore((s) => s.configPopover);
  const closeConfigPopover = useCanvasStore((s) => s.closeConfigPopover);
  const nodes = useCanvasStore((s) => s.nodes);
  const updateNodeConfig = useCanvasStore((s) => s.updateNodeConfig);
  const updateNodeName = useCanvasStore((s) => s.updateNodeName);
  const updateNodeDescription = useCanvasStore((s) => s.updateNodeDescription);
  const openDocTab = useCanvasStore((s) => s.openDocTab);

  const nameInputRef = useRef<HTMLInputElement>(null);

  const node = configPopover ? nodes.find((n) => n.id === configPopover.nodeId) : undefined;
  const component = node?.type === "component" ? node : undefined;
  const definition = component ? getComponent(component.data.componentId) : undefined;

  // A plain value rebuilt each render (not a mutated ref) — react-popper's
  // Anchor re-reads virtualRef.current on every commit, so a fresh object
  // here (rather than mutating a persisted ref during render, which React
  // Compiler flags) is what makes the very first commit after opening
  // already measure correctly instead of needing a delayed ref-effect to
  // catch up. The rect itself is computed fresh on every call (not cached),
  // so it stays accurate if the node moves while the popover is open.
  const configPopoverNodeId = configPopover?.nodeId;
  const { x: anchorX = 0, y: anchorY = 0 } = configPopover?.anchor ?? {};
  const measurable = useMemo(
    () => ({
      getBoundingClientRect: () => {
        const el = configPopoverNodeId
          ? document.querySelector<HTMLElement>(`.react-flow__node[data-id="${configPopoverNodeId}"]`)
          : null;
        return el?.getBoundingClientRect() ?? new DOMRect(anchorX, anchorY, 0, 0);
      },
    }),
    [configPopoverNodeId, anchorX, anchorY],
  );
  const virtualAnchor = useMemo(() => ({ current: measurable }), [measurable]);

  useEffect(() => {
    if (configPopoverNodeId) nameInputRef.current?.focus();
  }, [configPopoverNodeId]);

  if (!configPopover || !component || !definition) return null;

  return (
    <Popover
      open
      onOpenChange={(open) => {
        if (!open) closeConfigPopover();
      }}
    >
      <PopoverAnchor virtualRef={virtualAnchor} />
      <PopoverContent
        side="right"
        align="start"
        style={{ width: POPOVER_WIDTH }}
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <PopoverArrow />
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/60">
            {definition.label}
          </h2>
          <button
            onClick={() => openDocTab(definition.id)}
            className="flex shrink-0 items-center gap-1 text-xs text-foreground/60 hover:text-foreground"
          >
            <FileText size={12} />
            Docs
          </button>
        </div>

        <label className="mt-3 block">
          <span className="text-xs font-medium text-foreground/70">Instance name</span>
          <input
            ref={nameInputRef}
            key={component.id}
            defaultValue={component.data.name ?? ""}
            onChange={(event) => updateNodeName(component.id, event.target.value)}
            placeholder={`e.g. ${definition.id}-1`}
            className="mt-1 w-full rounded border border-border bg-background px-2 py-1 font-mono text-sm outline-none placeholder:text-foreground/30 focus:border-foreground/40"
          />
        </label>

        <label className="mt-3 block">
          <span className="text-xs font-medium text-foreground/70">Description</span>
          <textarea
            key={component.id}
            defaultValue={component.data.description ?? definition.summary}
            onChange={(event) => updateNodeDescription(component.id, event.target.value)}
            rows={2}
            className="mt-1 w-full resize-none rounded border border-border bg-background px-2 py-1 text-sm leading-snug outline-none focus:border-foreground/40"
          />
        </label>

        <div className="mt-3 max-h-[60vh] overflow-y-auto">
          <ConfigForm
            key={component.id}
            definition={definition}
            value={component.data.config}
            onChange={(config) => updateNodeConfig(component.id, config)}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
