import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "./db";
import {
  adoptRemoteSave,
  checkpointSave,
  needsCloudPush,
  putSaveLocal,
  remoteSaveRow,
  saveAndSyncNow,
} from "./save-revisions";
import type { ArchitectureEdgeType, ComponentNodeType } from "@/canvas/types";

const nodeA: ComponentNodeType = {
  id: "a",
  type: "component",
  position: { x: 0, y: 0 },
  data: { componentId: "client", config: {} },
};
const nodeB: ComponentNodeType = {
  id: "b",
  type: "component",
  position: { x: 0, y: 0 },
  data: { componentId: "load-balancer", config: {} },
};
const edges: ArchitectureEdgeType[] = [];

function stubFetch() {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ updatedAt: 42 }), { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(async () => {
  await db.saves.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("putSaveLocal", () => {
  it("writes the row and starts it ahead of the cloud", async () => {
    const { row, changed } = await putSaveLocal("save-1", [nodeA], edges);

    expect(changed).toBe(true);
    expect(row.localRevision).toBe(1);
    expect(row.cloudRevision).toBe(0);
    expect(row.dirty).toBe(true);
    expect((await db.saves.get("save-1"))?.nodes).toEqual([nodeA]);
  });

  it("bumps the revision on every real change", async () => {
    await putSaveLocal("save-1", [nodeA], edges);
    const { row } = await putSaveLocal("save-1", [nodeA, nodeB], edges);

    expect(row.localRevision).toBe(2);
  });

  it("is a no-op when the graph is unchanged, so an idle board never becomes a cloud write", async () => {
    const first = await putSaveLocal("save-1", [nodeA], edges);
    const second = await putSaveLocal("save-1", [nodeA], edges);

    expect(second.changed).toBe(false);
    expect(second.row.localRevision).toBe(first.row.localRevision);
    expect(second.row.updatedAt).toBe(first.row.updatedAt);
  });

  it("keeps syncedAt across a local edit - reconcile needs it to spot a stale row", async () => {
    await putSaveLocal("save-1", [nodeA], edges);
    await db.saves.update("save-1", { syncedAt: 500, cloudRevision: 1, dirty: false });

    const { row } = await putSaveLocal("save-1", [nodeA, nodeB], edges);
    expect(row.syncedAt).toBe(500);
    expect(row.dirty).toBe(true);
  });
});

describe("checkpointSave", () => {
  it("pushes when the local row is ahead, and records the revision it pushed", async () => {
    const fetchMock = stubFetch();
    await putSaveLocal("save-1", [nodeA], edges);

    expect(await checkpointSave("save-1")).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith("/api/sync/saves", expect.objectContaining({ method: "POST" }));

    const row = await db.saves.get("save-1");
    expect(row?.cloudRevision).toBe(row?.localRevision);
    expect(row?.dirty).toBe(false);
    expect(row?.syncedAt).toBe(42);
  });

  it("does nothing when the cloud already has this revision", async () => {
    const fetchMock = stubFetch();
    await putSaveLocal("save-1", [nodeA], edges);
    await checkpointSave("save-1");
    fetchMock.mockClear();

    expect(await checkpointSave("save-1")).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does nothing for a slot that has never been saved", async () => {
    const fetchMock = stubFetch();
    expect(await checkpointSave("never-saved")).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("leaves the row ahead when the push fails, so the next checkpoint retries", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("nope", { status: 500 })));
    await putSaveLocal("save-1", [nodeA], edges);

    await checkpointSave("save-1");

    const row = await db.saves.get("save-1");
    expect(needsCloudPush(row)).toBe(true);
    expect(row?.dirty).toBe(true);
  });

  it("stays ahead when an edit lands while the push is in flight", async () => {
    let release!: () => void;
    const held = new Promise<void>((resolve) => (release = resolve));
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(async () => {
        await held;
        return new Response(JSON.stringify({ updatedAt: 42 }), { status: 200 });
      }),
    );

    await putSaveLocal("save-1", [nodeA], edges);
    const pushing = checkpointSave("save-1");
    await putSaveLocal("save-1", [nodeA, nodeB], edges);
    release();
    await pushing;

    // The push confirmed revision 1; revision 2 has not been sent.
    const row = await db.saves.get("save-1");
    expect(row?.cloudRevision).toBe(1);
    expect(row?.localRevision).toBe(2);
    expect(row?.dirty).toBe(true);
  });
});

describe("saveAndSyncNow", () => {
  it("writes and pushes in one go, for Submit and explicit sync", async () => {
    const fetchMock = stubFetch();

    await saveAndSyncNow("save-1", [nodeA], edges);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const row = await db.saves.get("save-1");
    expect(row?.dirty).toBe(false);
    expect(row?.cloudRevision).toBe(row?.localRevision);
  });

  it("still pushes when the graph has not changed - an explicit sync is not conditional", async () => {
    const fetchMock = stubFetch();
    await putSaveLocal("save-1", [nodeA], edges);

    await saveAndSyncNow("save-1", [nodeA], edges);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("adoptRemoteSave", () => {
  it("lands level with the cloud and never rewinds the revision counter", async () => {
    await putSaveLocal("save-1", [nodeA], edges);
    const local = await db.saves.get("save-1");

    const remote = remoteSaveRow("save-1", { nodes: [nodeB], edges, updatedAt: 900 });
    await adoptRemoteSave(remote, local ?? null);

    const row = await db.saves.get("save-1");
    expect(row?.nodes).toEqual([nodeB]);
    expect(row?.dirty).toBe(false);
    expect(row?.localRevision).toBe(row?.cloudRevision);
    expect(row?.localRevision).toBeGreaterThan(local!.localRevision);
    expect(needsCloudPush(row)).toBe(false);
  });

  it("adopts into an empty slot", async () => {
    const remote = remoteSaveRow("save-1", { nodes: [nodeA], edges, updatedAt: 900 });
    await adoptRemoteSave(remote, null);

    const row = await db.saves.get("save-1");
    expect(row?.syncedAt).toBe(900);
    expect(needsCloudPush(row)).toBe(false);
  });

  it("makes the very next unchanged save a no-op rather than a fresh push", async () => {
    const fetchMock = stubFetch();
    await adoptRemoteSave(remoteSaveRow("save-1", { nodes: [nodeA], edges, updatedAt: 900 }), null);

    const { changed } = await putSaveLocal("save-1", [nodeA], edges);
    await checkpointSave("save-1");

    expect(changed).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
