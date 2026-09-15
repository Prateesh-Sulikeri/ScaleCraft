import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/** Same fake-builder approach as retention.test.ts - see its header for why
 *  these tests check call shape rather than SQL. */
function fakeDb(results: unknown[]) {
  const ops: { op: string; arg?: unknown }[] = [];
  const queue = [...results];

  const node = (): Record<string, unknown> => {
    const self: Record<string, unknown> = {
      then: (resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) =>
        Promise.resolve(queue.shift() ?? []).then(resolve, reject),
    };
    for (const method of ["from", "where", "limit", "returning", "values", "set"]) {
      self[method] = (arg?: unknown) => {
        ops.push({ op: method, arg });
        return self;
      };
    }
    return self;
  };

  return {
    ops,
    db: {
      select: (arg?: unknown) => (ops.push({ op: "select", arg }), node()),
      insert: (arg?: unknown) => (ops.push({ op: "insert", arg }), node()),
      delete: (arg?: unknown) => (ops.push({ op: "delete", arg }), node()),
    },
  };
}

async function load(results: unknown[]) {
  const { db, ops } = fakeDb(results);
  vi.doMock("@/db/client", () => ({ getDb: () => db }));
  return { ...(await import("./image-storage")), ops };
}

beforeEach(() => vi.resetModules());
afterEach(() => vi.doUnmock("@/db/client"));

describe("deleteBugImage", () => {
  it("deletes the row behind a db: ref", async () => {
    const { deleteBugImage, ops } = await load([[]]);
    await deleteBugImage("db:img-1");
    expect(ops.map((o) => o.op)).toEqual(["delete", "where"]);
  });

  // The sweep calls this for every terminal report. A ref minted by a future
  // storage backend is that backend's to clean up, and must not abort the sweep.
  it("no-ops on a ref this build does not recognise", async () => {
    const { deleteBugImage, ops } = await load([[]]);
    await expect(deleteBugImage("blob:https://example.com/x.png")).resolves.toBeUndefined();
    expect(ops).toEqual([]);
  });
});

describe("deleteOrphanBugImages", () => {
  const cutoff = new Date("2026-08-31T04:00:00Z");

  it("spares images a report still points at", async () => {
    const { deleteOrphanBugImages, ops } = await load([
      [{ imageRef: "db:live-1" }, { imageRef: "db:live-2" }],
      [{ id: "orphan-1" }],
    ]);
    expect(await deleteOrphanBugImages(cutoff)).toBe(1);
    // Two queries: read the live refs, then delete everything else that is old.
    expect(ops.filter((o) => o.op === "delete")).toHaveLength(1);
  });

  // notInArray() with an empty list is invalid SQL, and "nothing is referenced"
  // is a normal state once every report has been closed - so this branch drops
  // the condition instead of passing an empty one.
  it("still runs when no report references any image", async () => {
    const { deleteOrphanBugImages } = await load([[], [{ id: "orphan-1" }, { id: "orphan-2" }]]);
    await expect(deleteOrphanBugImages(cutoff)).resolves.toBe(2);
  });

  it("ignores refs belonging to another storage backend when building the live set", async () => {
    const { deleteOrphanBugImages } = await load([
      [{ imageRef: "blob:https://example.com/x.png" }, { imageRef: null }],
      [],
    ]);
    await expect(deleteOrphanBugImages(cutoff)).resolves.toBe(0);
  });
});
