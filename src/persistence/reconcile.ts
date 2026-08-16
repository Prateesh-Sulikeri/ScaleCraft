import type { SyncMeta } from "@/persistence/db";

/**
 * The one merge rule from ARCHITECTURE.md's "Sync ordering" note (release
 * 6.1.0-alpha Phase 3, pending-6.1.0-poa.md), shared by every reconciling
 * table. `examAttempts`/`deepCheckSessions` are append-only by construction
 * (POA 3.2), so this same per-key rule degrades to a plain union for them —
 * there's no separate union-only code path to maintain.
 *
 * A dirty local row normally wins outright — it's an edit about to push,
 * handled by flush-dirty separately. But "dirty" alone can't distinguish
 * that from a row that's been stuck failing to push for a while: both look
 * identical (`dirty: true`) with no clientEditedAt to tell them apart
 * (Phase 1.2 deliberately excludes client clocks from ordering). The
 * distinguishing signal is `syncedAt`, not time: right after an edit,
 * `local.syncedAt` still equals whatever `remote.syncedAt` is, because
 * nothing has changed server-side since this device last synced. It only
 * diverges — `remote.syncedAt > local.syncedAt` — once some other write
 * (another device, same account; single-player rules out anything else)
 * has landed on the server *after* what this device last confirmed. At that
 * point local's dirty edit isn't "about to push," it's already stale
 * relative to a confirmed newer write, so remote wins instead of silently
 * clobbering it forever (Phase 9.1, audit follow-up on S1/S6). Retrying the
 * push is unaffected — flush-dirty still tries again next cycle, and if it
 * ever succeeds, that becomes the new latest write and wins on its own
 * merits like any other push.
 */
function pickWinner<T extends SyncMeta>(local: T | undefined, remote: T | undefined): T | undefined {
  if (!local) return remote;
  if (!remote) return local;
  if (local.dirty) {
    const staleDirty = local.syncedAt !== null && remote.syncedAt !== null && remote.syncedAt > local.syncedAt;
    if (!staleDirty) return local;
    return remote;
  }
  if (remote.syncedAt !== null && (local.syncedAt === null || remote.syncedAt > local.syncedAt)) return remote;
  return local;
}

/**
 * Bulk per-key reconciliation for tables hydrated as a list (chapterProgress,
 * curriculumProgress, examAttempts, customComponents, deepCheckSessions).
 * `toWrite` is the subset of `merged` that differs from what's already in
 * Dexie (a fresh remote row winning) — the only rows the caller needs to
 * persist back locally.
 */
export function reconcileRows<T extends SyncMeta>(
  local: T[],
  remote: T[],
  keyOf: (row: T) => string,
): { merged: T[]; toWrite: T[] } {
  const localByKey = new Map(local.map((r) => [keyOf(r), r]));
  const remoteByKey = new Map(remote.map((r) => [keyOf(r), r]));
  const keys = new Set([...localByKey.keys(), ...remoteByKey.keys()]);

  const merged: T[] = [];
  const toWrite: T[] = [];
  for (const key of keys) {
    const winner = pickWinner(localByKey.get(key), remoteByKey.get(key));
    if (!winner) continue;
    merged.push(winner);
    if (winner !== localByKey.get(key)) toWrite.push(winner);
  }
  return { merged, toWrite };
}

/** Single-row variant for per-scope tables with exactly one local row and one
 * remote fetch (`saves`), rather than a bulk list. */
export function reconcileRow<T extends SyncMeta>(local: T | null, remote: T | null): T | null {
  return pickWinner(local ?? undefined, remote ?? undefined) ?? null;
}
