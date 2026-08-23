import { db, type CanvasSave } from "./db";
import { hashCanvasState } from "./graph-hash";
import { syncSave } from "./cloud-sync";
import type { AnyNodeType, ArchitectureEdgeType } from "@/canvas/types";

/**
 * Revision bookkeeping for the one save row per slot. Dexie is the immediate
 * local write; Postgres is a checkpoint of the latest state, never a history.
 *
 * `localRevision` counts real local changes, `cloudRevision` is the revision
 * the server has acknowledged. `localRevision > cloudRevision` is the single
 * "needs a push" test, and `dirty` is kept equal to it so the existing flush
 * and indicator machinery keeps working unchanged.
 */

/** Writes the canvas state locally, bumping the revision only when the graph
 * actually changed. An unchanged graph is not a new revision, so it never
 * becomes a cloud write. */
export async function putSaveLocal(
  id: string,
  nodes: AnyNodeType[],
  edges: ArchitectureEdgeType[],
): Promise<{ row: CanvasSave; changed: boolean }> {
  const graphHash = hashCanvasState(nodes, edges);
  return db.transaction("rw", db.saves, async () => {
    const prev = await db.saves.get(id);
    if (prev && prev.graphHash === graphHash) return { row: prev, changed: false };

    const localRevision = (prev?.localRevision ?? 0) + 1;
    const cloudRevision = prev?.cloudRevision ?? 0;
    const row: CanvasSave = {
      id,
      updatedAt: Date.now(),
      nodes,
      edges,
      graphHash,
      localRevision,
      cloudRevision,
      dirty: localRevision > cloudRevision,
      // Deliberately carried over, not nulled: `syncedAt` is the server's
      // clock from the last confirmed sync, and reconcile.ts needs it to tell
      // "about to push" apart from "stale, already beaten by another device."
      syncedAt: prev?.syncedAt ?? null,
    };
    await db.saves.put(row);
    return { row, changed: true };
  });
}

/** True when the local row is ahead of the cloud copy. */
export function needsCloudPush(row: CanvasSave | undefined): boolean {
  return !!row && row.localRevision > row.cloudRevision;
}

/**
 * Pushes the slot to Postgres only if it is ahead. Returns whether a push was
 * attempted, so callers can tell "nothing to do" from "tried."
 */
export async function checkpointSave(id: string): Promise<boolean> {
  const row = await db.saves.get(id);
  if (!needsCloudPush(row) || !row) return false;
  await syncSave(id, { nodes: row.nodes, edges: row.edges }, row.localRevision);
  return true;
}

/** Local write followed by an immediate push, for the events that must not
 * wait for the next checkpoint: chapter Submit and explicit sync. */
export async function saveAndSyncNow(
  id: string,
  nodes: AnyNodeType[],
  edges: ArchitectureEdgeType[],
): Promise<void> {
  const { row } = await putSaveLocal(id, nodes, edges);
  await syncSave(id, { nodes: row.nodes, edges: row.edges }, row.localRevision);
}

/** The shape a pulled cloud row takes for reconciliation. Revisions are local
 * bookkeeping, so a remote row carries none until it is adopted below. */
export function remoteSaveRow(
  id: string,
  remote: { nodes: AnyNodeType[]; edges: ArchitectureEdgeType[]; updatedAt: number },
): CanvasSave {
  return {
    id,
    updatedAt: remote.updatedAt,
    nodes: remote.nodes,
    edges: remote.edges,
    graphHash: hashCanvasState(remote.nodes, remote.edges),
    localRevision: 0,
    cloudRevision: 0,
    syncedAt: remote.updatedAt,
    dirty: false,
  };
}

/** Persists a cloud row that won reconciliation. Revisions restart above
 * whatever the replaced local row had, so the counter never goes backwards,
 * and land equal: this state is exactly what the cloud already holds. */
export async function adoptRemoteSave(row: CanvasSave, prev: CanvasSave | null): Promise<void> {
  const revision = Math.max(prev?.localRevision ?? 0, prev?.cloudRevision ?? 0) + 1;
  await db.saves.put({
    ...row,
    graphHash: hashCanvasState(row.nodes, row.edges),
    localRevision: revision,
    cloudRevision: revision,
    dirty: false,
  });
}
