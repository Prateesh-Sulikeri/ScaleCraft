import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BUG_RETENTION_DAYS, bugDeletesAt, bugRetentionCutoff, isBugTerminal } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = new Date("2026-09-01T04:00:00Z");

/**
 * There is no DB harness in this repo (src/db/client.test.ts only checks the
 * lazy constructor), so this file fakes the drizzle builder rather than talking
 * to Postgres. It asserts the two things that are legible through a fake and
 * that would silently corrupt data if wrong - the order the writes happen in,
 * and the values handed to `.set()` - and deliberately does not try to decode
 * opaque WHERE conditions, which a fake cannot check honestly.
 */
type Op = { op: string; arg?: unknown };

function fakeDb(results: unknown[]) {
  const ops: Op[] = [];
  const queue = [...results];

  const node = (): Record<string, unknown> => {
    const self: Record<string, unknown> = {
      // Drizzle builders are thenable, so awaiting mid-chain resolves the query.
      then: (resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) =>
        Promise.resolve(queue.shift() ?? []).then(resolve, reject),
    };
    for (const method of ["from", "where", "limit", "returning", "values"]) {
      self[method] = (arg?: unknown) => {
        ops.push({ op: method, arg });
        return self;
      };
    }
    self.set = (arg?: unknown) => {
      ops.push({ op: "set", arg });
      return self;
    };
    return self;
  };

  const db = {
    select: (arg?: unknown) => (ops.push({ op: "select", arg }), node()),
    update: (arg?: unknown) => (ops.push({ op: "update", arg }), node()),
    delete: (arg?: unknown) => (ops.push({ op: "delete", arg }), node()),
  };

  return { db, ops };
}

async function loadRetention(results: unknown[]) {
  const { db, ops } = fakeDb(results);
  vi.doMock("@/db/client", () => ({ getDb: () => db }));
  const mod = await import("./retention");
  return { ...mod, ops };
}

beforeEach(() => vi.resetModules());
afterEach(() => vi.doUnmock("@/db/client"));

describe("the retention rule itself", () => {
  it("puts resolved and closed on the clock, and nothing else", () => {
    expect(isBugTerminal("resolved")).toBe(true);
    expect(isBugTerminal("closed")).toBe(true);
    expect(isBugTerminal("open")).toBe(false);
    expect(isBugTerminal("in-progress")).toBe(false);
  });

  it("deletes a report 15 days after it closed, and never while it is active", () => {
    const closedAt = new Date("2026-08-24T09:30:00Z");
    expect(bugDeletesAt(closedAt)?.toISOString()).toBe("2026-09-08T09:30:00.000Z");
    expect(bugDeletesAt(null)).toBeNull();
    expect(BUG_RETENTION_DAYS).toBe(15);
  });

  // The date the reporter is promised and the date the purge acts on are two
  // ends of one rule; if they drift, reports vanish early or linger.
  it("keeps the promised date and the purge cutoff consistent", () => {
    const closedAt = new Date("2026-08-17T04:00:00Z");
    const deletesAt = bugDeletesAt(closedAt)!;
    // A report is due exactly when the sweep's cutoff has passed its closedAt.
    expect(closedAt < bugRetentionCutoff(new Date(deletesAt.getTime() + 1))).toBe(true);
    expect(closedAt < bugRetentionCutoff(new Date(deletesAt.getTime() - 1))).toBe(false);
  });
});

describe("deleteClosedReportImages", () => {
  it("deletes the bytes before nulling the ref, and stamps imageDeletedAt", async () => {
    const { deleteClosedReportImages, ops } = await loadRetention([
      [{ id: "bug-1", imageRef: "db:img-1" }],
    ]);

    expect(await deleteClosedReportImages(NOW)).toBe(1);

    // Bytes first, ref second. The reverse order strands the bytes forever with
    // nothing pointing at them; this way a crash between the two leaves a
    // dangling ref the image route 404s and the next sweep tidies.
    const sequence = ops.map((o) => o.op);
    expect(sequence.indexOf("delete")).toBeLessThan(sequence.indexOf("update"));

    expect(ops.find((o) => o.op === "set")?.arg).toEqual({
      imageRef: null,
      imageDeletedAt: NOW,
    });
  });

  it("does nothing when no terminal report has an attachment", async () => {
    const { deleteClosedReportImages, ops } = await loadRetention([[]]);
    expect(await deleteClosedReportImages(NOW)).toBe(0);
    expect(ops.some((o) => o.op === "update")).toBe(false);
  });
});

describe("clock bookkeeping", () => {
  it("stamps closedAt on reports closed outside the app", async () => {
    const { startRetentionClocks, ops } = await loadRetention([[{ id: "a" }, { id: "b" }]]);
    expect(await startRetentionClocks(NOW)).toBe(2);
    expect(ops.find((o) => o.op === "set")?.arg).toEqual({ closedAt: NOW });
  });

  it("takes a reopened report back off the clock", async () => {
    const { clearRetentionClocks, ops } = await loadRetention([[{ id: "a" }]]);
    expect(await clearRetentionClocks()).toBe(1);
    expect(ops.find((o) => o.op === "set")?.arg).toEqual({ closedAt: null });
  });
});

describe("runBugRetentionSweep", () => {
  it("stamps and unstamps clocks and drops images before it purges anything", async () => {
    const { runBugRetentionSweep, ops } = await loadRetention([
      [{ id: "stamped" }], // startRetentionClocks
      [{ id: "reopened" }], // clearRetentionClocks
      [{ id: "bug-1", imageRef: "db:img-1" }], // select for image deletion
      [], // deleteBugImage
      [], // update nulling the ref
      [{ id: "old-1" }, { id: "old-2" }], // purgeExpiredReports
      [{ id: "orphan-1" }], // deleteOrphanBugImages: referenced refs
      [{ id: "orphan-1" }], // deleteOrphanBugImages: the delete
    ]);

    const result = await runBugRetentionSweep(NOW);

    expect(result).toEqual({
      clockStarted: 1,
      clockCleared: 1,
      imagesDeleted: 1,
      reportsPurged: 2,
      orphanImagesDeleted: 1,
    });

    // Ordering is the correctness property of the sweep: stamping after purging
    // means a hand-closed report never expires, and purging before images are
    // dropped strands bytes with no row left to find them from.
    const sets = ops.filter((o) => o.op === "set").map((o) => o.arg);
    expect(sets).toEqual([
      { closedAt: NOW },
      { closedAt: null },
      { imageRef: null, imageDeletedAt: NOW },
    ]);
  });

  it("defaults to the current time so the cron route can call it bare", async () => {
    const { runBugRetentionSweep } = await loadRetention([[], [], [], [], [], [], []]);
    await expect(runBugRetentionSweep()).resolves.toMatchObject({ reportsPurged: 0 });
  });
});

describe("bugDeletesAt boundaries", () => {
  it("is exactly 15 days, not 14 or 16", () => {
    const closedAt = new Date("2026-01-01T00:00:00Z");
    expect(bugDeletesAt(closedAt)!.getTime() - closedAt.getTime()).toBe(15 * DAY_MS);
  });
});
