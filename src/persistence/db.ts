import Dexie, { type EntityTable } from "dexie";
import type { AnyNodeType, ArchitectureEdgeType } from "@/canvas/types";

/**
 * Local-first persistence — see .claude/docs/ARCHITECTURE.md "Persistence"
 * and milestone 8 in MILESTONES.md. This pulls forward just the "a refresh
 * doesn't lose work" core: a manual Save writes here, and the app restores
 * from it on load. Full autosave-on-every-edit and cloud sync (milestone 9)
 * remain deferred.
 *
 * Stores the raw canvas state (nodes/edges as the canvas store holds them),
 * not the domain ArchitectureGraph — zones aren't part of ArchitectureGraph
 * (see canvas/types.ts) and would be silently dropped by a restore that
 * went through it.
 */
export type CanvasSave = {
  id: string;
  updatedAt: number;
  nodes: AnyNodeType[];
  edges: ArchitectureEdgeType[];
};

/** Fixed key for now — no multi-slot UI yet, this just avoids a schema
 * migration once "sandbox saves and chapter attempts" (plural, per
 * MILESTONES.md milestone 8) actually need one. */
export const SANDBOX_SAVE_ID = "sandbox";

class ScaleCraftDB extends Dexie {
  saves!: EntityTable<CanvasSave, "id">;

  constructor() {
    super("scalecraft");
    this.version(1).stores({
      saves: "id",
    });
  }
}

export const db = new ScaleCraftDB();
