import { db, type DeepCheckSession } from "@/persistence/db";
import type { AiCritique } from "@/ai/schema";
import { deleteDeepCheckSessionSync, hydrateDeepCheckSessions, syncDeepCheckSession } from "@/persistence/cloud-sync";

/**
 * Newest first — DeepCheckPanel's history view has no pagination, so this is
 * the full list for the given board/chapter. Hydrate-on-empty (decision 3):
 * a fresh device/browser has no local history for this saveId, so pull it
 * from the cloud once and adopt it into Dexie before returning.
 */
export async function listSessions(saveId: string): Promise<DeepCheckSession[]> {
  let sessions = await db.deepCheckSessions.where("saveId").equals(saveId).toArray();
  if (sessions.length === 0) {
    const remote = await hydrateDeepCheckSessions(saveId);
    if (remote.length > 0) {
      await db.deepCheckSessions.bulkAdd(remote);
      sessions = await db.deepCheckSessions.where("saveId").equals(saveId).toArray();
    }
  }
  return sessions.sort((a, b) => b.createdAt - a.createdAt);
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
