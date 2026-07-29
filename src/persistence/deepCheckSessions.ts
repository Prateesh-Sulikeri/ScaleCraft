import { db, type DeepCheckSession } from "@/persistence/db";
import type { AiCritique } from "@/ai/schema";

/** Newest first — DeepCheckPanel's history view has no pagination, so this
 * is the full list for the given board/chapter. */
export async function listSessions(saveId: string): Promise<DeepCheckSession[]> {
  const sessions = await db.deepCheckSessions.where("saveId").equals(saveId).toArray();
  return sessions.sort((a, b) => b.createdAt - a.createdAt);
}

export async function saveSession(saveId: string, critique: AiCritique): Promise<void> {
  await db.deepCheckSessions.add({ saveId, createdAt: Date.now(), critique });
}

export async function deleteSession(id: number): Promise<void> {
  await db.deepCheckSessions.delete(id);
}
