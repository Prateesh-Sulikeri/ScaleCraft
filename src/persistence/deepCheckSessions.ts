import { db, type DeepCheckSession } from "@/persistence/db";
import type { AiCritique } from "@/ai/schema";
import { deleteDeepCheckSessionSync, hydrateDeepCheckSessions, syncDeepCheckSession } from "@/persistence/cloud-sync";
import { reconcileRows } from "@/persistence/reconcile";

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
  const { merged, toWrite } = reconcileRows(
    local,
    remote as DeepCheckSession[],
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
}

export async function deleteSession(session: DeepCheckSession): Promise<void> {
  if (session.id !== undefined) await db.deepCheckSessions.delete(session.id);
  void deleteDeepCheckSessionSync(session.syncId);
}
