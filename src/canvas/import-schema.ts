import { z } from "zod";

/**
 * Validates the shape of an imported canvas JSON file before it's spread into
 * the store (see ProjectMenu.tsx's handleImportFile). A hand-edited or
 * corrupted export can otherwise put malformed data straight into React Flow
 * state — e.g. a node missing `position` crashes the renderer instead of
 * failing with the "not a valid export" message. Only the fields every
 * consumer (ComponentNode, EdgeInspector, toArchitectureGraph) actually reads
 * are checked; everything else passes through so real exports (which carry
 * extra React Flow bookkeeping like `selected`/`zIndex`/`measured`) aren't
 * rejected for shape we don't care about.
 */

const positionSchema = z.object({ x: z.number(), y: z.number() });

const nodeSchema = z
  .object({
    id: z.string(),
    type: z.enum(["component", "zone", "comment", "start"]),
    position: positionSchema,
    data: z.record(z.string(), z.unknown()),
  })
  .loose();

const edgeSchema = z
  .object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    data: z.object({ kind: z.enum(["request-flow", "control", "replication", "async"]) }),
  })
  .loose();

export const canvasImportSchema = z.object({
  nodes: z.array(nodeSchema),
  edges: z.array(edgeSchema),
});
