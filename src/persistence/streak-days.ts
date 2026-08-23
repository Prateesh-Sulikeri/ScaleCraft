/**
 * The day streak's durable storage: the account-wide mirror of db.activeDays.
 *
 * The streak used to be *derived* - computeDayStreak (home-data.ts) reduced
 * curriculumProgress/examAttempts timestamps down to a set of local calendar
 * days. That was wrong in two directions at once, because those timestamps
 * are not a history. `lastVisitedAt` holds one value per chapter and is
 * overwritten on every re-open, so yesterday's evidence disappears the moment
 * you read the same chapter again; and a progress reset wipes the lot.
 *
 * Worse, the only writer here used to be reset itself. So a reset was the one
 * operation in the app that could make the streak jump *up* - it pushed, the
 * server unioned in days from previous resets, and the response revealed days
 * the UI had long since forgotten. Recording days only at the moment you
 * destroy them is exactly backwards.
 *
 * Now every active day is written as it happens (progress-store's
 * recordActiveDay -> db.activeDays -> here), which makes the streak a real
 * counter rather than an inference. Reset preserving the streak stops being a
 * special case and becomes a consequence: today was already banked before the
 * reset ran.
 *
 * Clerk's own activity data cannot serve as this store: `last_active_at` is a
 * single overwritten timestamp and the session list is periodically pruned,
 * so the Backend API exposes no day-series (the dashboard heatmap is computed
 * from data it never hands back).
 *
 * Living in the Clerk user's `publicMetadata` keeps it out of Postgres
 * entirely - no sync/reconcile pass, no last-write-wins - which stays
 * affordable because the client only pushes on a day it has not banked yet:
 * at most one write per device per day, and none at all on a day already
 * confirmed.
 *
 * Days are stored as *local day indices* (localDayIndex, home-data.ts), the
 * same unit the streak functions reduce to. A bare streak *number* would not
 * work: it cannot tell tomorrow's computation whether today was already
 * counted, so the streak would either double-count or stall for a day. The
 * day set unions cleanly and keeps both the current and the longest streak
 * exact.
 */

/** The `publicMetadata` key everything here reads and writes. */
export const STREAK_DAYS_KEY = "streakDays";

/**
 * Bit-packed day set: `base` is the earliest day index, `bits` is a base64
 * bitmap where bit *n* means day `base + n` had activity.
 *
 * Clerk caps metadata at 8KB *total* across public/private/unsafe, and that
 * budget is shared with anything else ever stored there. A plain number[]
 * costs ~6 bytes per day and would exhaust it after roughly 3.7 years of
 * activity — a real ceiling for an app meant to be used for years. Run-length
 * encoding looks tempting but degrades to the same size on the worst-case
 * every-other-day pattern. A bitmap is pattern-independent: 8KB of base64 is
 * ~6KB of bits, or ~130 years, so the limit stops being something anyone has
 * to think about again.
 *
 * This shape is an implementation detail of storage. Callers on both sides
 * hand around plain `number[]` — encode/decode happen only at the metadata
 * boundary, inside the API route.
 */
export type StreakDaysMetadata = { base: number; bits: string };

function toBase64(bytes: Uint8Array): string {
  // Buffer on the server, btoa in the browser. This module is imported by
  // both the route (Node) and the client wrappers below, and only the route
  // ever actually calls the codec — but keeping it isomorphic means a test
  // can exercise it in either environment without a shim.
  if (typeof Buffer !== "undefined") return Buffer.from(bytes).toString("base64");
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(value: string): Uint8Array {
  if (typeof Buffer !== "undefined") return new Uint8Array(Buffer.from(value, "base64"));
  return Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
}

/** Empty input encodes to `null` — an absent key, rather than a row that
 *  says "nothing", so an account that has never reset stores nothing at all. */
export function encodeStreakDays(days: readonly number[]): StreakDaysMetadata | null {
  const unique = [...new Set(days.filter((d) => Number.isInteger(d) && d >= 0))].sort((a, b) => a - b);
  if (unique.length === 0) return null;

  const base = unique[0];
  const span = unique[unique.length - 1] - base + 1;
  const bytes = new Uint8Array(Math.ceil(span / 8));
  for (const day of unique) {
    const offset = day - base;
    bytes[offset >> 3] |= 1 << (offset & 7);
  }
  return { base, bits: toBase64(bytes) };
}

/** Tolerant by design: this reads a value out of Clerk metadata, which is
 *  schemaless and could hold anything an older build (or a hand-edit in the
 *  Clerk dashboard) left behind. Anything unrecognized decodes to no
 *  preserved days rather than throwing — a wrong streak is a cosmetic bug,
 *  but a throw here would take down Home and the Learning Path. */
export function decodeStreakDays(value: unknown): number[] {
  if (value == null || typeof value !== "object") return [];
  const { base, bits } = value as Partial<StreakDaysMetadata>;
  if (typeof base !== "number" || !Number.isInteger(base) || base < 0 || typeof bits !== "string") return [];

  let bytes: Uint8Array;
  try {
    bytes = fromBase64(bits);
  } catch {
    return [];
  }

  const days: number[] = [];
  for (let i = 0; i < bytes.length * 8; i++) {
    if (bytes[i >> 3] & (1 << (i & 7))) days.push(base + i);
  }
  return days;
}

/** Union of two day sets, sorted. Preserved days only ever grow — a day that
 *  had activity is a historical fact, so merging is the only correct
 *  combinator, and it makes every write idempotent (a retried reset costs
 *  nothing, and two devices resetting independently cannot erase each
 *  other's days). */
export function mergeStreakDays(a: readonly number[], b: readonly number[]): number[] {
  return [...new Set([...a, ...b])].sort((x, y) => x - y);
}

/* --- client wrappers ---------------------------------------------------- */

/**
 * `null` means *unknown*, not empty. This used to collapse every failure to
 * `[]`, which reads as "this account has no history" - so one 401 or dropped
 * connection silently rendered a lower streak than the truth, with no way for
 * a caller to tell the difference. The distinction is the whole point: a
 * caller that cannot reach the server must show "not known yet" rather than a
 * confidently wrong number.
 */
export async function fetchStreakDays(): Promise<number[] | null> {
  try {
    const res = await fetch("/api/streak-days");
    if (!res.ok) return null;
    const data = (await res.json()) as { days?: number[] };
    return data.days ?? [];
  } catch {
    return null;
  }
}

/** Returns the server's merged set (which may contain days this device has
 *  never seen, from another device), or null if the push failed. Safe to
 *  retry: the server unions, so a re-sent day is a no-op. */
export async function pushStreakDays(days: readonly number[]): Promise<number[] | null> {
  try {
    const res = await fetch("/api/streak-days", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ days }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { days?: number[] };
    return data.days ?? null;
  } catch {
    return null;
  }
}
