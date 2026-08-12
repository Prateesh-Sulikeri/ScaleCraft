import type { AnyNodeType, ArchitectureEdgeType } from "@/canvas/types";
import {
  db,
  type ChapterProgress,
  type CurriculumProgress,
  type CustomComponentRow,
  type DeepCheckSession,
  type ExamAttempt,
  type SyncMeta,
} from "@/persistence/db";
import type { CustomComponentRecord } from "@/content/components/custom";

/** Raw canvas nodes/edges — the shape `saves` syncs (Phase 3.4,
 * pending-6.1.0-poa.md), not the lossy domain ArchitectureGraph. */
type CanvasState = { nodes: AnyNodeType[]; edges: ArchitectureEdgeType[] };

/**
 * Client-side wrappers for /api/sync/* (see pending-cloud-sync.md decision
 * 2). Every call is fire-and-forget and silently swallows failure - a
 * signed-out session (this app is gated end to end, so that's only a
 * mid-session expiry, not the normal path), a network error, and a server
 * error are all the same case: "not yet synced," retried on the next write
 * or next load. No offline queue/retry infra by design - single-user app.
 * The whole app already runs behind auth.protect(), so no client-side
 * signed-in check is needed here - the browser's Clerk session cookie rides
 * along with same-origin fetch automatically.
 *
 * Every `syncX` function also owns the SyncMeta writeback (release 6.1.0
 * Phase 1, pending-6.1.0-poa.md 1.1): every POST route returns `{ updatedAt }`
 * (the server's clock, never the client's - see ARCHITECTURE.md's "Sync
 * ordering" note), and on success that becomes the row's `syncedAt` with
 * `dirty` cleared. A non-2xx or network failure resolves `postSync` to
 * `null`, so a failed push leaves `dirty: true` for the next write or the
 * Phase 1.3 flush pass to retry - it must never look like a successful sync.
 */

async function postSync<T>(path: string, body: unknown): Promise<T | null> {
  try {
    const res = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function deleteSync(path: string): Promise<void> {
  try {
    await fetch(path, { method: "DELETE" });
  } catch {
    // silent - see module doc comment
  }
}

async function getSync<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(path);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// --- saves ---

export async function syncSave(scopeId: string, canvasState: CanvasState): Promise<void> {
  const result = await postSync<{ updatedAt: number }>("/api/sync/saves", { scopeId, canvasState });
  if (result) await db.saves.update(scopeId, { syncedAt: result.updatedAt, dirty: false });
}

export function hydrateSave(scopeId: string): Promise<(CanvasState & { updatedAt: number }) | null> {
  return getSync<{ save: { canvasState: CanvasState; updatedAt: number } | null }>(
    `/api/sync/saves?scopeId=${encodeURIComponent(scopeId)}`,
  ).then((res) => (res?.save ? { ...res.save.canvasState, updatedAt: res.save.updatedAt } : null));
}

// --- customComponents ---

export async function syncCustomComponent(record: CustomComponentRecord): Promise<void> {
  const result = await postSync<{ updatedAt: number }>("/api/sync/custom-components", record);
  if (result) await db.customComponents.update(record.id, { syncedAt: result.updatedAt, dirty: false });
}

export function deleteCustomComponentSync(id: string): Promise<void> {
  return deleteSync(`/api/sync/custom-components?id=${encodeURIComponent(id)}`);
}

export function hydrateCustomComponents(): Promise<CustomComponentRow[]> {
  return getSync<{ components: Array<CustomComponentRecord & { updatedAt: number }> }>(
    "/api/sync/custom-components",
  ).then(
    (res) =>
      res?.components.map(({ updatedAt, ...record }) => ({ ...record, syncedAt: updatedAt, dirty: false })) ?? [],
  );
}

// --- chapterProgress ---

export async function syncChapterProgress(row: ChapterProgress): Promise<void> {
  const result = await postSync<{ updatedAt: number }>("/api/sync/chapter-progress", row);
  if (result) await db.chapterProgress.update(row.chapterId, { syncedAt: result.updatedAt, dirty: false });
}

export function deleteChapterProgressSync(chapterId: string): Promise<void> {
  return deleteSync(`/api/sync/chapter-progress?chapterId=${encodeURIComponent(chapterId)}`);
}

export function hydrateChapterProgress(chapterId: string): Promise<ChapterProgress | null> {
  return getSync<{ progress: (Omit<ChapterProgress, keyof SyncMeta> & { updatedAt: number }) | null }>(
    `/api/sync/chapter-progress?chapterId=${encodeURIComponent(chapterId)}`,
  ).then((res) => {
    if (!res?.progress) return null;
    const { updatedAt, ...row } = res.progress;
    return { ...row, syncedAt: updatedAt, dirty: false };
  });
}

export function hydrateAllChapterProgress(): Promise<ChapterProgress[]> {
  return getSync<{ progress: Array<Omit<ChapterProgress, keyof SyncMeta> & { updatedAt: number }> }>(
    "/api/sync/chapter-progress",
  ).then((res) => res?.progress.map(({ updatedAt, ...row }) => ({ ...row, syncedAt: updatedAt, dirty: false })) ?? []);
}

// --- curriculumProgress ---

export async function syncCurriculumProgress(row: CurriculumProgress): Promise<void> {
  const result = await postSync<{ updatedAt: number }>("/api/sync/curriculum-progress", row);
  if (result) await db.curriculumProgress.update(row.slug, { syncedAt: result.updatedAt, dirty: false });
}

export function hydrateAllCurriculumProgress(): Promise<CurriculumProgress[]> {
  return getSync<{ progress: Array<Omit<CurriculumProgress, keyof SyncMeta> & { updatedAt: number }> }>(
    "/api/sync/curriculum-progress",
  ).then((res) => res?.progress.map(({ updatedAt, ...row }) => ({ ...row, syncedAt: updatedAt, dirty: false })) ?? []);
}

// --- examAttempts ---

export async function syncExamAttempt(attempt: ExamAttempt): Promise<void> {
  const result = await postSync<{ updatedAt: number }>("/api/sync/exam-attempts", attempt);
  if (result) {
    await db.examAttempts.update([attempt.chapterDefinitionId, attempt.attemptNumber], {
      syncedAt: result.updatedAt,
      dirty: false,
    });
  }
}

export function deleteExamAttemptsSync(chapterDefinitionId: string): Promise<void> {
  return deleteSync(`/api/sync/exam-attempts?chapterDefinitionId=${encodeURIComponent(chapterDefinitionId)}`);
}

export function hydrateAllExamAttempts(): Promise<ExamAttempt[]> {
  return getSync<{ attempts: Array<Omit<ExamAttempt, keyof SyncMeta> & { updatedAt: number }> }>(
    "/api/sync/exam-attempts",
  ).then((res) => res?.attempts.map(({ updatedAt, ...row }) => ({ ...row, syncedAt: updatedAt, dirty: false })) ?? []);
}

// --- deepCheckSessions ---

/** `session` must already carry its stable `syncId` (see db.ts's
 * DeepCheckSession comment) - Dexie's local auto-increment `id` never leaves
 * the device. Writeback keys on `syncId` too, for the same reason - `id` is
 * device-local and may not be the one the caller has in hand. */
export async function syncDeepCheckSession(session: DeepCheckSession): Promise<void> {
  if (!session.syncId) return;
  const result = await postSync<{ updatedAt: number }>("/api/sync/deep-check-sessions", {
    id: session.syncId,
    saveId: session.saveId,
    createdAt: session.createdAt,
    critique: session.critique,
  });
  if (result) {
    await db.deepCheckSessions
      .where("syncId")
      .equals(session.syncId)
      .modify({ syncedAt: result.updatedAt, dirty: false });
  }
}

export function deleteDeepCheckSessionSync(syncId: string): Promise<void> {
  return deleteSync(`/api/sync/deep-check-sessions?id=${encodeURIComponent(syncId)}`);
}

export function hydrateDeepCheckSessions(saveId: string): Promise<Array<Omit<DeepCheckSession, "id">>> {
  return getSync<{
    sessions: Array<{ id: string; saveId: string; createdAt: number; critique: DeepCheckSession["critique"]; updatedAt: number }>;
  }>(`/api/sync/deep-check-sessions?saveId=${encodeURIComponent(saveId)}`).then(
    (res) =>
      res?.sessions.map((s) => ({
        syncId: s.id,
        saveId: s.saveId,
        createdAt: s.createdAt,
        critique: s.critique,
        syncedAt: s.updatedAt,
        dirty: false,
      })) ?? [],
  );
}
