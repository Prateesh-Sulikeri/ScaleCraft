import type { AnyNodeType, ArchitectureEdgeType } from "@/canvas/types";

/** Fields React Flow or the renderer owns, not the design. Hashing them
 * would make selecting a node look like an edit. */
const DERIVED_DATA_KEYS = ["validationState", "highlighted"] as const;

function stripDerived(data: unknown): unknown {
  if (!data || typeof data !== "object") return data;
  const copy: Record<string, unknown> = { ...(data as Record<string, unknown>) };
  for (const key of DERIVED_DATA_KEYS) delete copy[key];
  return copy;
}

/** Sub-pixel drift from a drag is not a change worth persisting or pushing. */
function round(n: number): number {
  return Math.round(n);
}

/**
 * Canonical string for a canvas state: only the fields that are actually the
 * user's design. Array order is preserved (it is stable in React Flow, and
 * it carries z-order), so this is a serialization, not a set hash.
 */
function canonicalize(nodes: AnyNodeType[], edges: ArchitectureEdgeType[]): string {
  return JSON.stringify({
    nodes: nodes.map((n) => ({
      id: n.id,
      type: n.type,
      x: round(n.position?.x ?? 0),
      y: round(n.position?.y ?? 0),
      parentId: n.parentId ?? null,
      data: stripDerived(n.data),
    })),
    edges: edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle ?? null,
      targetHandle: e.targetHandle ?? null,
      type: e.type,
      data: stripDerived(e.data),
    })),
  });
}

/**
 * Content hash of a canvas state. Two independent 32-bit hashes plus the
 * serialized length: a collision would silently skip a cloud push, so the
 * extra few bytes are worth more than the cycles they cost.
 */
export function hashCanvasState(nodes: AnyNodeType[], edges: ArchitectureEdgeType[]): string {
  const json = canonicalize(nodes, edges);

  let fnv = 0x811c9dc5;
  let djb = 5381;
  for (let i = 0; i < json.length; i++) {
    const c = json.charCodeAt(i);
    fnv = Math.imul(fnv ^ c, 0x01000193);
    djb = (Math.imul(djb, 33) + c) | 0;
  }

  const hex = (n: number) => (n >>> 0).toString(16).padStart(8, "0");
  return `${hex(fnv)}${hex(djb)}.${json.length.toString(16)}`;
}
