import type { ArchitectureGraph } from "@/lib/graph";
import type { ChapterProgress, CurriculumProgress, DeepCheckSession, ExamAttempt } from "@/persistence/db";
import type { CustomComponentRecord } from "@/content/components/custom";

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
 */

async function postSync(path: string, body: unknown): Promise<void> {
  try {
    await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  } catch {
    // silent - see module doc comment
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

export function syncSave(scopeId: string, graph: ArchitectureGraph): Promise<void> {
  return postSync("/api/sync/saves", { scopeId, graph });
}

export function hydrateSave(scopeId: string): Promise<{ graph: ArchitectureGraph; updatedAt: number } | null> {
  return getSync<{ save: { graph: ArchitectureGraph; updatedAt: number } | null }>(
    `/api/sync/saves?scopeId=${encodeURIComponent(scopeId)}`,
  ).then((res) => res?.save ?? null);
}

// --- customComponents ---

export function syncCustomComponent(record: CustomComponentRecord): Promise<void> {
  return postSync("/api/sync/custom-components", record);
}

export function deleteCustomComponentSync(id: string): Promise<void> {
  return deleteSync(`/api/sync/custom-components?id=${encodeURIComponent(id)}`);
}

export function hydrateCustomComponents(): Promise<CustomComponentRecord[]> {
  return getSync<{ components: CustomComponentRecord[] }>("/api/sync/custom-components").then(
    (res) => res?.components ?? [],
  );
}

// --- chapterProgress ---

export function syncChapterProgress(row: ChapterProgress): Promise<void> {
  return postSync("/api/sync/chapter-progress", row);
}

export function deleteChapterProgressSync(chapterId: string): Promise<void> {
  return deleteSync(`/api/sync/chapter-progress?chapterId=${encodeURIComponent(chapterId)}`);
}

export function hydrateChapterProgress(chapterId: string): Promise<ChapterProgress | null> {
  return getSync<{ progress: ChapterProgress | null }>(
    `/api/sync/chapter-progress?chapterId=${encodeURIComponent(chapterId)}`,
  ).then((res) => res?.progress ?? null);
}

export function hydrateAllChapterProgress(): Promise<ChapterProgress[]> {
  return getSync<{ progress: ChapterProgress[] }>("/api/sync/chapter-progress").then((res) => res?.progress ?? []);
}

// --- curriculumProgress ---

export function syncCurriculumProgress(row: CurriculumProgress): Promise<void> {
  return postSync("/api/sync/curriculum-progress", row);
}

export function hydrateAllCurriculumProgress(): Promise<CurriculumProgress[]> {
  return getSync<{ progress: CurriculumProgress[] }>("/api/sync/curriculum-progress").then(
    (res) => res?.progress ?? [],
  );
}

// --- examAttempts ---

export function syncExamAttempt(attempt: ExamAttempt): Promise<void> {
  return postSync("/api/sync/exam-attempts", attempt);
}

export function deleteExamAttemptsSync(chapterDefinitionId: string): Promise<void> {
  return deleteSync(`/api/sync/exam-attempts?chapterDefinitionId=${encodeURIComponent(chapterDefinitionId)}`);
}

export function hydrateAllExamAttempts(): Promise<ExamAttempt[]> {
  return getSync<{ attempts: ExamAttempt[] }>("/api/sync/exam-attempts").then((res) => res?.attempts ?? []);
}

// --- deepCheckSessions ---

/** `session` must already carry its stable `syncId` (see db.ts's
 * DeepCheckSession comment) - Dexie's local auto-increment `id` never leaves
 * the device. */
export function syncDeepCheckSession(session: DeepCheckSession): Promise<void> {
  if (!session.syncId) return Promise.resolve();
  return postSync("/api/sync/deep-check-sessions", {
    id: session.syncId,
    saveId: session.saveId,
    createdAt: session.createdAt,
    critique: session.critique,
  });
}

export function deleteDeepCheckSessionSync(syncId: string): Promise<void> {
  return deleteSync(`/api/sync/deep-check-sessions?id=${encodeURIComponent(syncId)}`);
}

export function hydrateDeepCheckSessions(
  saveId: string,
): Promise<Array<{ syncId: string; saveId: string; createdAt: number; critique: DeepCheckSession["critique"] }>> {
  return getSync<{
    sessions: Array<{ id: string; saveId: string; createdAt: number; critique: DeepCheckSession["critique"] }>;
  }>(`/api/sync/deep-check-sessions?saveId=${encodeURIComponent(saveId)}`).then(
    (res) => res?.sessions.map((s) => ({ ...s, syncId: s.id })) ?? [],
  );
}
