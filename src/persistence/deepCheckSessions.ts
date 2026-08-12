import { db, type DeepCheckSession } from "@/persistence/db";
import type { AiCritique } from "@/ai/schema";
import { deleteDeepCheckSessionSync, hydrateDeepCheckSessions, syncDeepCheckSession } from "@/persistence/cloud-sync";
import { reconcileRows } from "@/persistence/reconcile";

/** POA Phase 5.1 - Deep Check sessions are append-only and otherwise
 * unbounded; retain only the newest N per saveId. */
const MAX_SESSIONS_PER_SAVE = 5;

/**
 * Newest first — DeepCheckPanel's history view has no pagination, so this is
 * the full list for the given board/chapter. Reconciles against the cloud
 * every call (Phase 3, pending-6.1.0-poa.md), not just when local is empty —
 * sessions are append-only (POA 3.2), so this is a plain union by `syncId`;
 * `dirty` local rows always win over a same-key remote row (reconcile.ts),
 * which can't actually happen here since a session's id/content never
 * changes after creation, but keeps the merge honest either way. `id`
 * (Dexie's local auto-increment key) is device-local, so a row adopted from
 * remote gets a fresh one on `bulkAdd` rather than carrying a foreign one in.
 */
export async function listSessions(saveId: string): Promise<DeepCheckSession[]> {
  const [local, remote] = await Promise.all([
    db.deepCheckSessions.where("saveId").equals(saveId).toArray(),
    hydrateDeepCheckSessions(saveId),
  ]);
  if (!remote.ok) {
    // Abort (Phase 6, pending-6.1.0-poa.md - fixes audit S5): a failed
    // fetch is not "the cloud has no sessions" - fall back to local-only
    // rather than union-ing against a phantom empty remote. Worst case on
    // a persistent failure is under-pruning below (server keeps more than
    // MAX_SESSIONS_PER_SAVE until the next successful call), which is
    // harmless since critiques are regenerable (POA 5.1).
    return local.sort((a, b) => b.createdAt - a.createdAt);
  }
  const { merged, toWrite } = reconcileRows(
    local,
    remote.data as DeepCheckSession[],
    (r) => r.syncId,
  );
  // toWrite is always a brand-new syncId here (append-only, no edit
  // codepath ever makes a same-key remote row outrank an already-synced
  // local one) - bulkAdd, not bulkPut, so Dexie assigns each a fresh local
  // auto-increment `id` rather than risk colliding with an existing row's.
  if (toWrite.length > 0) await db.deepCheckSessions.bulkAdd(toWrite);
  return merged.sort((a, b) => b.createdAt - a.createdAt);
}

export async function saveSession(saveId: string, critique: AiCritique): Promise<void> {
  const session: DeepCheckSession = {
    syncId: crypto.randomUUID(),
    saveId,
    createdAt: Date.now(),
    critique,
    dirty: true,
    syncedAt: null,
  };
  await db.deepCheckSessions.add(session);
  void syncDeepCheckSession(session);
  await pruneSessions(saveId);
}

export async function deleteSession(session: DeepCheckSession): Promise<void> {
  if (session.id !== undefined) await db.deepCheckSessions.delete(session.id);
  // Guards against sending `?id=undefined` for a row that predates syncId
  // (POA Phase 7, fixes audit S7) - would otherwise silently delete nothing
  // server-side.
  if (session.syncId) void deleteDeepCheckSessionSync(session.syncId);
}

/**
 * Retention (POA Phase 5.1) - deletes anything past the newest
 * MAX_SESSIONS_PER_SAVE outright, both locally and server-side, rather than
 * leaving it unsynced: critiques are regenerable, so aggressive pruning has
 * no real cost. Goes through `listSessions` (reconcile against the cloud)
 * rather than just this device's local rows, so a device that has never
 * opened this saveId's history still prunes against the true cross-device
 * count instead of under-counting and leaving the server unbounded.
 */
async function pruneSessions(saveId: string): Promise<void> {
  const sessions = await listSessions(saveId);
  const stale = sessions.slice(MAX_SESSIONS_PER_SAVE);
  await Promise.all(
    stale.map(async (session) => {
      if (session.id !== undefined) await db.deepCheckSessions.delete(session.id);
      if (session.syncId) void deleteDeepCheckSessionSync(session.syncId);
    }),
  );
}
