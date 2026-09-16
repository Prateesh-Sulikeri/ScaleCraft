"use client";

import { memo, type CSSProperties } from "react";
import { Handle, NodeResizer, Position, type NodeProps } from "@xyflow/react";
import { getComponent } from "@/content/components/registry";
import { useCanvasStore } from "./store";
import { categoryColorVar } from "./category-colors";
import { isConfigured } from "./config-state";
import {
  CARD_HEIGHT,
  CARD_MIN_HEIGHT,
  CARD_MIN_WIDTH,
  CARD_WIDTH,
} from "./card-geometry";
import { HIGHLIGHT_GOLD_RING, SELECTED_GLOW } from "./selection-style";
import { stateRingVar } from "./validation-visuals";
import { PORT_IDS } from "./edge-routing";
import { ComponentCardVisual } from "./ComponentCardVisual";
import type { ComponentNodeType } from "./types";

/** The four ports, in DOM order. Shared with the read-only reference card
 * (chapters/ReferenceComponentNode.tsx) via PORT_IDS. */
const SIDES = [
  { id: PORT_IDS.left, position: Position.Left },
  { id: PORT_IDS.top, position: Position.Top },
  { id: PORT_IDS.right, position: Position.Right },
  { id: PORT_IDS.bottom, position: Position.Bottom },
] as const;

/**
 * The canvas component card.
 *
 * Anatomy, top to bottom (DESIGN.md "Node Card"):
 *   meta   - category short code (left) + configured dot / state glyph (right)
 *   icon   - the recognition channel: a category-tinted plate, centred
 *   label  - the component's type name, up to two lines
 *   name   - the user's instance name, when set
 *
 * The icon is the focal point, not a corner ornament. At 120x96 there is no
 * room for a card that reads left-to-right like a row in a table, and at
 * canvas zoom the glyph is what a learner actually recognises - the label is
 * confirmation. Everything else is deliberately small, quiet metadata.
 *
 * Vertical slack collects *around the icon* (it owns the flex-1), not below
 * the text. Whitespace framing a focal element reads as composition;
 * whitespace under a label reads as a card that failed to fill itself.
 *
 * Two color channels, kept visually separate: category identity lives on the
 * icon plate and the short code, validation state owns the whole-card
 * outline plus its glyph. Nothing reads category and state off one element.
 *
 * There is deliberately no description line (D3) and no divider rule. The
 * description moved to the inspector, which is what buys the card its
 * footprint - and with it went the ResizeObserver line-clamp machinery that
 * used to measure how many lines of summary would fit a resized card.
 */
function ComponentNodeInner({ id, data, selected }: NodeProps<ComponentNodeType>) {
  const resizeNode = useCanvasStore((s) => s.resizeNode);
  // Only used to hide the resizer while a highlight pass is active (see
  // below) - the gold ring itself comes from data.highlighted, already
  // computed once in Canvas.tsx from this same store field.
  const highlightActive = useCanvasStore((s) => s.highlight !== null);
  const definition = getComponent(data.componentId);

  if (!definition) return null;

  const categoryColor = categoryColorVar[definition.category];
  const ringColor = data.validationState ? stateRingVar[data.validationState] : "var(--border)";
  const configured = isConfigured(data.config, definition.defaultConfig);
  const instanceName = data.name?.trim();
  const canReceive = definition.inputs.length > 0;
  const canSend = definition.outputs.length > 0;

  return (
    <div
      // No `overflow-hidden`: the four handles sit centred on the card's
      // edges (translate -50%), so clipping the box clips half of every
      // port - the opposite of the bigger hit targets this pass is for.
      // The only child that needs clipping (the label) clamps itself.
      className="flex flex-col rounded-lg border border-border bg-panel p-1.5 shadow-sm transition-[outline-color,box-shadow] duration-150 ease-out"
      style={
        {
          // Height is a real default now, not `undefined`-so-auto. The
          // authored layout standard assumes every unresized card is exactly
          // CARD_HEIGHT tall: a content-driven height would let a two-line
          // label push one card taller than its neighbours and quietly eat
          // into the vertical gap the invariant gate checks.
          width: data.width ?? CARD_WIDTH,
          height: data.height ?? CARD_HEIGHT,
          minHeight: CARD_MIN_HEIGHT,
          // Read by globals.css to stretch each port's hit area along the
          // side it sits on. A handle is xyflow's own element, so it cannot
          // measure the card it belongs to - the card has to tell it.
          "--sc-card-w": `${data.width ?? CARD_WIDTH}px`,
          "--sc-card-h": `${data.height ?? CARD_HEIGHT}px`,
          outline: `2px solid ${ringColor}`,
          outlineOffset: "1px",
          // Gold takes priority over the plain selection glow - a node can be
          // both `selected` and part of the highlighted path at once, and the
          // highlight is the more specific, more temporary state of the two.
          boxShadow: data.highlighted ? HIGHLIGHT_GOLD_RING : selected ? SELECTED_GLOW : undefined,
          "--accent": categoryColor,
        } as CSSProperties
      }
    >
      <NodeResizer
        // Hidden for the whole duration of a Highlight Connections pass,
        // even on an already-selected node - the resize handles otherwise
        // sit on top of the highlighted path and clutter exactly the view
        // this feature is meant to declutter.
        isVisible={selected && !highlightActive}
        minWidth={CARD_MIN_WIDTH}
        minHeight={CARD_MIN_HEIGHT}
        onResize={(_, params) => resizeNode(id, params.x, params.y, params.width, params.height)}
        // Corners resize, edges connect. The side controls sit exactly where
        // the connect band now runs (globals.css), so leaving them live would
        // mean a selected card could not be wired from three of its four
        // sides - and leaving them *visible* but beaten to the pointer would
        // advertise a drag that no longer happens. The four corner handles
        // still give full width and height control, and selection is already
        // stated twice over by the card's own outline and glow.
        lineStyle={{ borderColor: "transparent", pointerEvents: "none" }}
        handleStyle={{ backgroundColor: categoryColor, width: 8, height: 8, borderRadius: 2 }}
      />

      {/* One port per side, every one a `source` handle, every one always
       * rendered. Under loose connectionMode a source handle serves as either
       * end of an edge, so this is what lets an edge leave *any* side - see
       * canvas/edge-routing.ts for why single-purpose sides could not draw an
       * upward edge, and why a side-conditional handle silently dropped one.
       *
       * Direction is enforced by connection-rules.ts, not by which dot
       * exists: `isConnectable` keeps a component that can neither send nor
       * receive out of the drag entirely, and isValidConnection refuses the
       * rest with visible red feedback rather than a dead drop.
       *
       * Their look, hit area and reveal-on-hover live in globals.css under
       * `.react-flow__handle` - a handle is a plain div, so styling it here
       * would mean four copies of the same inline style object. */}
      {SIDES.map(({ id, position }) => (
        <Handle
          key={id}
          type="source"
          id={id}
          position={position}
          isConnectable={canSend || canReceive}
        />
      ))}

      <ComponentCardVisual
        definition={definition}
        configured={configured}
        instanceName={instanceName}
        validationState={data.validationState}
      />
    </div>
  );
}

export const ComponentNode = memo(ComponentNodeInner);
