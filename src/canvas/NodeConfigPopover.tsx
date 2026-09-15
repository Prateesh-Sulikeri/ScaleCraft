"use client";

import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight, FileText, Server } from "lucide-react";
import { useCanvasStore } from "./store";
import { getComponent } from "@/content/components/registry";
import { ConfigForm } from "./ConfigForm";
import { Popover, PopoverAnchor, PopoverArrow, PopoverContent } from "@/components/ui/popover";
import { categoryColorVar, categoryShortCode } from "./category-colors";
import { iconMap } from "./icon-map";
import { componentDisplayNames } from "./component-display-name";
import { stateGlyph, stateLabel, stateRingVar } from "./validation-visuals";
import type { ValidationState } from "./types";
import type { ValidationViolation } from "@/engines";

const POPOVER_WIDTH = 340;

type NodeConfigPopoverProps = {
  /** Keyed by node id, same derivation as Canvas.tsx's own `nodeStates` prop
   * (a fresh Validate run's result, merged in at render only) - the store
   * never carries validation results (see ComponentNodeData.validationState's
   * own doc comment), so this has to arrive as a prop rather than being
   * read off the store's copy of the node. */
  nodeStates?: Record<string, ValidationState>;
  /** The full result of the last Validate run, so this panel can filter to
   * just the violations naming this node - the "always show the explanation
   * on failure" rule (CLAUDE.md) shouldn't stop at the global dropdown once
   * there's a per-node surface that already knows which node it is. */
  violations?: ValidationViolation[] | null;
};

/**
 * Replaces NodeInspector's permanent sidebar (see .claude/docs/pending.md
 * Phase 2) — same instance-name + ConfigForm body, now anchored beside
 * whichever node triggered it (double-click or the context menu's
 * "Configure" item) instead of permanently docked. Driven by store.ts's
 * configPopover, mirroring AnnotationEditor's editingAnnotation pattern.
 *
 * Redesigned in Step 3 of the Design Editor revamp (D5/D14 -
 * .claude/docs/pending-design-editor-revamp.md) to carry everything the
 * 120x96 card gave up when its description line was cut: an identity header
 * in the same bordered-icon-tile language as the card and Home's ModeCard,
 * the description itself, the node's live connection list, and its
 * validation state - not just the bare ConfigForm body this used to be.
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
export function NodeConfigPopover({ nodeStates, violations }: NodeConfigPopoverProps) {
  const configPopover = useCanvasStore((s) => s.configPopover);
  const closeConfigPopover = useCanvasStore((s) => s.closeConfigPopover);
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
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

  // Every edge touching this node, resolved to the other endpoint's
  // human-readable name via the same helper the Start marker's target
  // picker uses — reusing it rather than re-deriving "label + instance
  // name" here is what keeps the two surfaces from ever disagreeing on a
  // node's display name.
  const connections = useMemo(() => {
    if (!component) return [];
    const names = componentDisplayNames(nodes);
    return edges
      .filter((e) => e.source === component.id || e.target === component.id)
      .map((e) => {
        const incoming = e.target === component.id;
        const otherId = incoming ? e.source : e.target;
        return {
          edgeId: e.id,
          incoming,
          otherLabel: names.get(otherId) ?? otherId,
          kind: e.data?.kind ?? "request-flow",
        };
      });
  }, [component, nodes, edges]);

  const nodeIssues = useMemo(
    () => (component ? (violations ?? []).filter((v) => v.offendingNodeIds.includes(component.id)) : []),
    [component, violations],
  );
  const validationState = component ? nodeStates?.[component.id] : undefined;

  useEffect(() => {
    if (configPopoverNodeId) nameInputRef.current?.focus();
  }, [configPopoverNodeId]);

  if (!configPopover || !component || !definition) return null;

  const Icon = iconMap[definition.icon] ?? Server;
  const categoryColor = categoryColorVar[definition.category];
  const StateIcon = validationState ? stateGlyph[validationState] : null;

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

        {/* Identity header — same bordered-wireframe-tile + uppercase
         * short-code language as the card (ComponentNode.tsx) and Home's
         * ModeCard, so the panel that now carries everything the card gave
         * up still reads as the same component you clicked on. */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[color:color-mix(in_srgb,var(--accent)_35%,transparent)] bg-[color:color-mix(in_srgb,var(--accent)_12%,transparent)]"
              style={{ "--accent": categoryColor } as CSSProperties}
              aria-hidden="true"
            >
              <Icon size={22} strokeWidth={1.5} style={{ color: categoryColor }} />
            </div>
            <div>
              <span className="block rounded-sm border border-[color:color-mix(in_srgb,var(--accent)_45%,transparent)] px-1 py-px font-mono text-[10px] font-semibold uppercase leading-none tracking-wide text-foreground/70 w-fit"
                style={{ "--accent": categoryColor } as CSSProperties}
              >
                {categoryShortCode[definition.category]}
              </span>
              <h2 className="mt-1 text-sm font-semibold text-foreground">{definition.label}</h2>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <button
              onClick={() => openDocTab(definition.id)}
              className="flex items-center gap-1 text-xs text-foreground/60 hover:text-foreground"
            >
              <FileText size={12} />
              Docs
            </button>
            {validationState && StateIcon && (
              <span
                className="flex items-center gap-1 text-[11px] font-medium"
                style={{ color: stateRingVar[validationState] }}
              >
                <StateIcon size={12} strokeWidth={2} />
                {stateLabel[validationState]}
              </span>
            )}
          </div>
        </div>

        {/* Validation explanations for this node, surfaced right under the
         * header rather than only in the global Validate dropdown — the
         * "an explanation is always shown on failure" rule (CLAUDE.md)
         * shouldn't require leaving the node you're already looking at. */}
        {nodeIssues.length > 0 && (
          <div className="mt-3 flex flex-col gap-2 rounded-md border border-border bg-background/60 p-2">
            {nodeIssues.map((v, i) => (
              <div key={i}>
                <p
                  className="text-xs font-medium"
                  style={{ color: v.severity === "error" ? "var(--state-error)" : "var(--state-warning)" }}
                >
                  {v.message}
                </p>
                <p className="mt-0.5 text-xs text-foreground/70">{v.explanation}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 border-t border-border pt-3">
          <label className="block">
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
        </div>

        {connections.length > 0 && (
          <div className="mt-3 border-t border-border pt-3">
            <span className="text-xs font-medium text-foreground/70">
              Connections ({connections.length})
            </span>
            <ul className="mt-1.5 flex flex-col gap-1">
              {connections.map((c) => (
                <li key={c.edgeId} className="flex items-center gap-1.5 text-xs text-foreground/80">
                  {c.incoming ? (
                    <ArrowLeft size={11} className="shrink-0 text-foreground/40" aria-label="Incoming" />
                  ) : (
                    <ArrowRight size={11} className="shrink-0 text-foreground/40" aria-label="Outgoing" />
                  )}
                  <span className="truncate">{c.otherLabel}</span>
                  <span className="shrink-0 font-mono text-[10px] text-foreground/40">{c.kind}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-3 max-h-[60vh] overflow-y-auto border-t border-border pt-3">
          <span className="text-xs font-medium text-foreground/70">Configuration</span>
          <div className="mt-2">
            <ConfigForm
              key={component.id}
              definition={definition}
              value={component.data.config}
              onChange={(config) => updateNodeConfig(component.id, config)}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
