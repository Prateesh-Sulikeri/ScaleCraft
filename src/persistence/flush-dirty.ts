import { db } from "@/persistence/db";
import {
  syncChapterProgress,
  syncCurriculumProgress,
  syncCustomComponent,
  syncDeepCheckSession,
  syncExamAttempt,
  syncSave,
} from "@/persistence/cloud-sync";

/**
 * Phase 1.3 of the 6.1.0 POA (pending-6.1.0-poa.md) - the useful 90% of an
 * offline queue at no extra cost. Every dirty row already knows how to push
 * itself (see cloud-sync.ts's syncX functions, which write back
 * syncedAt/dirty:false on success) - this just finds every dirty row across
 * the six synced tables and calls that. No queue table, no retry scheduler,
 * no ordering guarantees between tables or rows - single-player means a
 * flush is always safe to just re-run, so failures are left dirty for the
 * next call rather than retried here.
 */
export async function flushDirtyRows(): Promise<void> {
  const [saves, chapterProgress, curriculumProgress, examAttempts, deepCheckSessions, customComponents] =
    await Promise.all([
      db.saves.filter((row) => row.dirty).toArray(),
      db.chapterProgress.filter((row) => row.dirty).toArray(),
      db.curriculumProgress.filter((row) => row.dirty).toArray(),
      db.examAttempts.filter((row) => row.dirty).toArray(),
      db.deepCheckSessions.filter((row) => row.dirty).toArray(),
      db.customComponents.filter((row) => row.dirty).toArray(),
    ]);

  await Promise.all([
    ...saves.map((row) => syncSave(row.id, { nodes: row.nodes, edges: row.edges })),
    ...chapterProgress.map((row) => syncChapterProgress(row)),
    ...curriculumProgress.map((row) => syncCurriculumProgress(row)),
    ...examAttempts.map((row) => syncExamAttempt(row)),
    ...deepCheckSessions.map((row) => syncDeepCheckSession(row)),
    ...customComponents.map((row) => syncCustomComponent(row)),
  ]);
}
