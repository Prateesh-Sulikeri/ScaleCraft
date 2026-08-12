import type { SyncMeta } from "@/persistence/db";

/**
 * The one merge rule from ARCHITECTURE.md's "Sync ordering" note (release
 * 6.1.0-alpha Phase 3, pending-6.1.0-poa.md), shared by every reconciling
 * table. `examAttempts`/`deepCheckSessions` are append-only by construction
 * (POA 3.2), so this same per-key rule degrades to a plain union for them —
 * there's no separate union-only code path to maintain.
 */
function pickWinner<T extends SyncMeta>(local: T | undefined, remote: T | undefined): T | undefined {
  if (!local) return remote;
  if (!remote) return local;
  if (local.dirty) return local; // push local, handled by flush-dirty separately
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
