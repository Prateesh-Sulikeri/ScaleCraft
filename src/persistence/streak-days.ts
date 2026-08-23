/**
 * The day streak's reset-proof storage.
 *
 * The streak is derived, not stored: computeDayStreak (home-data.ts) reduces
 * curriculumProgress/examAttempts timestamps down to a set of local calendar
 * days. That makes a progress reset mathematically fatal to it — wipe the
 * timestamps and the streak is zero, with nothing left to rebuild it from.
 * Clerk's own activity data cannot fill the gap either: `last_active_at` is a
 * single overwritten timestamp and the session list is periodically pruned,
 * so the Backend API exposes no day-series (the dashboard heatmap is computed
 * from data it never hands back).
 *
 * So reset snapshots the day set into the Clerk user's `publicMetadata`
 * first. That keeps it out of Postgres entirely — no table, no migration, no
 * sync/reconcile pass — which is affordable precisely because the write
 * frequency is near-zero: this is only ever written when someone resets.
 *
 * Days are stored as *local day indices* (localDayIndex, home-data.ts), the
 * same unit the streak functions already reduce to. A bare streak *number*
 * would not work: it cannot tell tomorrow's computation whether today was
 * already counted, so the streak would either double-count or stall for a
 * day. The day set unions cleanly against live timestamps and keeps both the
 * current and the longest streak exact.
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

/** Same fire-and-forget posture as cloud-sync.ts: a failure here is "not yet
 *  saved", never an exception the caller has to handle. Returns [] on
 *  failure, which is indistinguishable from "never reset" — correct, since
 *  both mean there is nothing to add to the live timestamps. */
export async function fetchPreservedStreakDays(): Promise<number[]> {
  try {
    const res = await fetch("/api/streak-days");
    if (!res.ok) return [];
    const data = (await res.json()) as { days?: number[] };
    return data.days ?? [];
  } catch {
    return [];
  }
}

/** Returns the server's merged set (which may contain days this device has
 *  never seen, from a reset on another device), or null if the push failed. */
export async function pushPreservedStreakDays(days: readonly number[]): Promise<number[] | null> {
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
