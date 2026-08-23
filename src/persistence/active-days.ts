/**
 * The day streak's local half: db.activeDays, and the one function that
 * reconciles it against the Clerk-backed mirror in streak-days.ts.
 *
 * Two stores rather than one because they fail differently. The local table
 * is always writable, even offline, so a day is banked the instant it
 * happens and can never be lost to a dropped request. Clerk metadata is the
 * account-wide record that outlives this browser's storage, so it is what a
 * second device (or the same one after a sign-out) inherits history from.
 * Reconciling is a union in both directions - a day that had activity is a
 * historical fact, so nothing here ever deletes.
 *
 * Deliberately takes and returns bare day indices. Turning "now" into a local
 * day index is home-data.ts's localDayIndex, and keeping that dependency out
 * of the persistence layer means this module is pure storage plumbing.
 */

import { db } from "./db";
import { mergeStreakDays, pushStreakDays } from "./streak-days";

export type ActiveDaysState = {
  /** Every day this device knows about, local and remote unioned, sorted. */
  days: number[];
  /**
   * Whether `days` reflects the account's full record or only whatever this
   * browser happens to hold. False means the server was unreachable and a
   * fresh browser could be showing a streak lower than the truth - the
   * distinction the UI needs to render "not known yet" instead of a
   * confidently wrong number.
   */
  loaded: boolean;
  /**
   * How many banked days the Clerk mirror has still not acknowledged. Zero
   * means the account-wide record is complete and this browser could be wiped
   * without losing a day.
   *
   * Deliberately separate from `loaded`, which answers a different question.
   * `loaded` is about whether the *number on screen* can be trusted; this is
   * about whether the *server* holds everything. A successful read paired
   * with a failed write satisfies the first and fails the second, and
   * resetCourse cares only about the second.
   */
  pending: number;
};

/**
 * Bank a day locally. Returns true only when it was not already recorded,
 * which is what keeps this cheap enough to call from every activity mutator:
 * the second call on a given day does one indexed lookup and stops.
 *
 * Written with `syncedAt: null` (owed a push) rather than pushed inline, so
 * an offline day is still a recorded day. reconcileActiveDays flushes it on
 * the next hydrate, refocus, or `online` event.
 */
export async function recordActiveDay(day: number): Promise<boolean> {
  if (await db.activeDays.get(day)) return false;
  await db.activeDays.put({ day, syncedAt: null });
  return true;
}

/** Serializes reconcile passes. Hydrate, refocus and a just-recorded day can
 *  all fire at once; without this they would race to push overlapping sets and
 *  spend Clerk writes proving the same thing several times.
 *
 *  A queue rather than a shared in-flight promise: callers have different
 *  questions. Handing resetCourse the result of a pass that started before it
 *  banked its backfill would let it read `pending: 0` about days it had not
 *  offered yet, and delete progress on the strength of it. Each caller gets
 *  its own pass, just never a concurrent one.
 *
 *  A rejected pass is swallowed here so it cannot poison the queue; the
 *  caller still sees its own rejection through `next`. */
let queue: Promise<unknown> = Promise.resolve();

/**
 * Merge the server's set into the local table, push anything the server has
 * not confirmed, and return what the streak should be computed from.
 *
 * `remote` is the result of a fetchStreakDays() the caller already made
 * (hydrate fetches it alongside the sync tables), or `null` to skip the read
 * and only flush - `null` means "unknown", never "empty".
 */
export function reconcileActiveDays(remote: number[] | null): Promise<ActiveDaysState> {
  const next = queue.then(
    () => run(remote),
    () => run(remote),
  );
  queue = next.catch(() => {});
  return next;
}

async function run(remote: number[] | null): Promise<ActiveDaysState> {
  const rows = await db.activeDays.toArray();
  const remoteDays = remote ?? [];
  const remoteSet = new Set(remoteDays);

  // Anything the server already holds is confirmed, whether this browser had
  // it or not. Writing those rows down is what lets a browser that cleared
  // storage on sign-out inherit the account's history on the way back in.
  const confirmedAt = Date.now();
  const byDay = new Map(rows.map((r) => [r.day, r]));
  const toConfirm = remoteDays
    .filter((day) => byDay.get(day)?.syncedAt == null)
    .map((day) => ({ day, syncedAt: confirmedAt }));
  if (toConfirm.length > 0) await db.activeDays.bulkPut(toConfirm);

  const merged = mergeStreakDays(
    rows.map((r) => r.day),
    remoteDays,
  );

  // Only days the server has not acknowledged are worth a request. On a day
  // already confirmed this is empty and the whole pass costs one read.
  const pending = rows.filter((r) => r.syncedAt == null && !remoteSet.has(r.day));
  if (pending.length === 0) return { days: merged, loaded: remote !== null, pending: 0 };

  // Push the whole merged set, not just the pending days: the server unions
  // either way, and sending everything makes a single request converge both
  // directions even when this device missed a day another one recorded.
  const saved = await pushStreakDays(merged);
  if (saved === null) {
    // Still pending, still recorded locally, retried on the next pass. The
    // streak stays correct on this device in the meantime.
    return { days: merged, loaded: remote !== null, pending: pending.length };
  }

  const savedAt = Date.now();
  await db.activeDays.bulkPut(saved.map((day) => ({ day, syncedAt: savedAt })));
  // A successful push proves the server was reachable and returns its
  // authoritative set, so this is a load even when the caller passed null.
  return { days: mergeStreakDays(merged, saved), loaded: true, pending: 0 };
}
