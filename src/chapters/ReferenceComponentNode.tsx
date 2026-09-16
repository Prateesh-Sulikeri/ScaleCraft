"use client";

import { memo, type CSSProperties } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { getComponent } from "@/content/components/registry";
import { categoryColorVar } from "@/canvas/category-colors";
import { isConfigured } from "@/canvas/config-state";
import { CARD_HEIGHT, CARD_WIDTH } from "@/canvas/card-geometry";
import { PORT_IDS } from "@/canvas/edge-routing";
import { ComponentCardVisual } from "@/canvas/ComponentCardVisual";
import type { Node, NodeTypes } from "@xyflow/react";

const SIDES = [
  { id: PORT_IDS.left, position: Position.Left },
  { id: PORT_IDS.top, position: Position.Top },
  { id: PORT_IDS.right, position: Position.Right },
  { id: PORT_IDS.bottom, position: Position.Bottom },
] as const;

export type ReferenceComponentNodeData = { componentId: string; config: unknown };
export type ReferenceComponentNodeType = Node<ReferenceComponentNodeData, "referenceComponent">;

/**
 * The read-only counterpart to canvas/ComponentNode.tsx, for Debrief's
 * reference graphs (ReferenceGraphCanvas.tsx) - same visual anatomy via
 * ComponentCardVisual, but with none of the live card's store dependency,
 * resize handles, or validation ring. A `referenceGraph` is authored to
 * already be correct, so there is no validation state to ring it with, and
 * no store (resizeNode/highlight) to read from - this renders from a plain
 * ArchitectureGraph, nothing else.
 *
 * Handles are the same four always-rendered ports the live card uses
 * (canvas/edge-routing.ts's PORT_IDS), inert here - ReferenceGraphCanvas
 * assigns a concrete pair per edge from the computed layout, and there is no
 * drag gesture to leave one unresolved. Sharing the ids is what keeps the two
 * canvases drawing the same architecture the same way.
 */
function ReferenceComponentNodeInner({ data }: NodeProps<ReferenceComponentNodeType>) {
  const definition = getComponent(data.componentId);
  if (!definition) return null;

  const categoryColor = categoryColorVar[definition.category];
  const configured = isConfigured(data.config, definition.defaultConfig);

  return (
    <div
      className="flex flex-col rounded-lg border border-border bg-panel p-1.5 shadow-sm"
      style={
        {
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          "--accent": categoryColor,
        } as CSSProperties
      }
    >
      {SIDES.map(({ id, position }) => (
        <Handle key={id} type="source" id={id} position={position} isConnectable={false} />
      ))}

      <ComponentCardVisual definition={definition} configured={configured} />
    </div>
  );
}

export const ReferenceComponentNode = memo(ReferenceComponentNodeInner);

export const referenceNodeTypes: NodeTypes = { referenceComponent: ReferenceComponentNode };
