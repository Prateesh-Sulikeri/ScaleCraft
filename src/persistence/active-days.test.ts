import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it, vi } from "vitest";

// The Clerk-backed mirror is the only network in this module. Swappable so
// each case can pick a posture: reachable, unreachable, or holding days this
// browser has never seen.
let pushImpl: (days: readonly number[]) => Promise<number[] | null> = async (days) => [...days];
let pushCalls: number[][] = [];
vi.mock("./streak-days", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./streak-days")>();
  return {
    ...actual,
    pushStreakDays: (days: readonly number[]) => {
      pushCalls.push([...days]);
      return pushImpl(days);
    },
  };
});

const { db } = await import("./db");
const { recordActiveDay, reconcileActiveDays } = await import("./active-days");

beforeEach(async () => {
  await db.activeDays.clear();
  pushCalls = [];
  pushImpl = async (days) => [...days];
});

describe("recordActiveDay", () => {
  it("banks a day and reports it as new", async () => {
    expect(await recordActiveDay(20_500)).toBe(true);
    expect(await db.activeDays.get(20_500)).toEqual({ day: 20_500, syncedAt: null });
  });

  it("is idempotent - the second call on a day is a no-op", async () => {
    await recordActiveDay(20_500);
    expect(await recordActiveDay(20_500)).toBe(false);
    expect(await db.activeDays.count()).toBe(1);
  });

  it("does not un-sync a day the server already confirmed", async () => {
    await db.activeDays.put({ day: 20_500, syncedAt: 111 });
    await recordActiveDay(20_500);
    expect((await db.activeDays.get(20_500))?.syncedAt).toBe(111);
  });
});

describe("reconcileActiveDays", () => {
  it("pushes a pending day and marks it synced", async () => {
    await recordActiveDay(20_500);

    const result = await reconcileActiveDays([]);

    expect(pushCalls).toEqual([[20_500]]);
    expect(result).toEqual({ days: [20_500], loaded: true, pending: 0 });
    expect((await db.activeDays.get(20_500))?.syncedAt).not.toBeNull();
  });

  it("spends no request on a day the server already holds", async () => {
    await db.activeDays.put({ day: 20_500, syncedAt: 111 });

    const result = await reconcileActiveDays([20_500]);

    // The steady state: one read, no write. This is what keeps a per-day
    // counter affordable in Clerk metadata.
    expect(pushCalls).toEqual([]);
    expect(result.days).toEqual([20_500]);
  });

  it("inherits days only the server knows, so a wiped browser recovers its history", async () => {
    const result = await reconcileActiveDays([20_498, 20_499, 20_500]);

    expect(result.days).toEqual([20_498, 20_499, 20_500]);
    // Written down as *synced* - they came from the server, so nothing is owed.
    expect(await db.activeDays.get(20_499)).toEqual({
      day: 20_499,
      syncedAt: expect.any(Number),
    });
    expect(pushCalls).toEqual([]);
  });

  it("unions both directions in one request when each side has days the other lacks", async () => {
    await recordActiveDay(20_500);
    pushImpl = async (days) => [...days, 20_400];

    const result = await reconcileActiveDays([20_499]);

    expect(pushCalls).toEqual([[20_499, 20_500]]);
    expect(result.days).toEqual([20_400, 20_499, 20_500]);
  });
});

describe("reconcileActiveDays when the network is down", () => {
  it("keeps an unpushable day, reports it pending, and still counts it locally", async () => {
    await recordActiveDay(20_500);
    pushImpl = async () => null;

    const result = await reconcileActiveDays([]);

    // The day is not lost - that is the whole reason it is written locally
    // first - but the caller is told the server does not have it.
    expect(result.days).toEqual([20_500]);
    expect(result.pending).toBe(1);
    expect((await db.activeDays.get(20_500))?.syncedAt).toBeNull();
  });

  it("flushes the backlog on the next pass once the network returns", async () => {
    await recordActiveDay(20_500);
    pushImpl = async () => null;
    await reconcileActiveDays([]);

    pushImpl = async (days) => [...days];
    const result = await reconcileActiveDays([]);

    expect(result.pending).toBe(0);
    expect((await db.activeDays.get(20_500))?.syncedAt).not.toBeNull();
  });

  it("reports a failed read as unknown, never as an empty history", async () => {
    // The bug this distinction exists to prevent: `null` collapsing to `[]`
    // rendered a confidently wrong streak on any dropped request.
    const result = await reconcileActiveDays(null);

    expect(result.loaded).toBe(false);
    expect(result.days).toEqual([]);
  });

  it("counts a successful push as a load even when the read was skipped", async () => {
    await recordActiveDay(20_500);
    pushImpl = async (days) => [...days, 20_499];

    const result = await reconcileActiveDays(null);

    // The server answered with its authoritative set, so the number on screen
    // can be trusted even though the caller passed no read.
    expect(result.loaded).toBe(true);
    expect(result.days).toEqual([20_499, 20_500]);
  });
});

describe("reconcileActiveDays concurrency", () => {
  it("serializes overlapping passes instead of racing them", async () => {
    await recordActiveDay(20_500);
    let inFlight = 0;
    let maxConcurrent = 0;
    pushImpl = async (days) => {
      inFlight += 1;
      maxConcurrent = Math.max(maxConcurrent, inFlight);
      await Promise.resolve();
      inFlight -= 1;
      return [...days];
    };

    await Promise.all([reconcileActiveDays([]), reconcileActiveDays([]), reconcileActiveDays([])]);

    expect(maxConcurrent).toBe(1);
    // Only the first pass had anything to push; the rest found it confirmed.
    expect(pushCalls).toEqual([[20_500]]);
  });

  it("gives a later caller its own pass, not a stale one", async () => {
    // resetCourse depends on this: piggybacking on a pass that started before
    // it banked its backfill would let it read `pending: 0` about days it had
    // never offered, and delete progress on the strength of it.
    const first = reconcileActiveDays([]);
    await recordActiveDay(20_500);
    const second = await reconcileActiveDays([]);

    await first;
    expect(second.days).toEqual([20_500]);
    expect(second.pending).toBe(0);
  });

  it("does not let a thrown pass poison the queue", async () => {
    await recordActiveDay(20_500);
    pushImpl = async () => {
      throw new Error("boom");
    };
    await expect(reconcileActiveDays([])).rejects.toThrow("boom");

    pushImpl = async (days) => [...days];
    await expect(reconcileActiveDays([])).resolves.toMatchObject({ pending: 0 });
  });
});
