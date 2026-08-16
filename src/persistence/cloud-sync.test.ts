import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "./db";
import { hydrateSave, syncSave } from "./cloud-sync";
import { useSyncStatusStore } from "./sync-status";

beforeEach(async () => {
  await db.saves.clear();
  useSyncStatusStore.setState({ pullError: false, dirtyCount: 0 });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// Release 6.1.0-alpha Phase 6 (pending-6.1.0-poa.md) - fixes audit S5.
// Before this, a failed fetch and a genuinely empty remote both collapsed
// to the same `null`/`[]`, so a network error during reconciliation looked
// exactly like "the server has nothing." These prove the distinction
// actually round-trips through a real hydrate*/sync* wrapper, not just
// getSync in isolation.
describe("cloud-sync failure reporting", () => {
  it("hydrateSave returns ok:false and marks pullError when the fetch itself fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    const result = await hydrateSave("scope-1");

    expect(result).toEqual({ ok: false });
    expect(useSyncStatusStore.getState().pullError).toBe(true);
  });

  it("hydrateSave returns ok:true with null data for a genuinely empty save - distinct from a failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ save: null }), { status: 200 })));

    const result = await hydrateSave("scope-1");

    expect(result).toEqual({ ok: true, data: null });
    expect(useSyncStatusStore.getState().pullError).toBe(false);
  });

  it("a failed push keeps the local row dirty and reflects it in dirtyCount", async () => {
    await db.saves.put({ id: "scope-1", updatedAt: 1, nodes: [], edges: [], dirty: true, syncedAt: null });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 500 })));

    await syncSave("scope-1", { nodes: [], edges: [] });

    const row = await db.saves.get("scope-1");
    expect(row?.dirty).toBe(true);
    expect(useSyncStatusStore.getState().dirtyCount).toBeGreaterThan(0);
  });

  it("a subsequent successful sync clears the dirty flag; dirtyCount reflects it once the writeback lands", async () => {
    await db.saves.put({ id: "scope-1", updatedAt: 1, nodes: [], edges: [], dirty: true, syncedAt: null });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ updatedAt: 42 }), { status: 200 })));

    await syncSave("scope-1", { nodes: [], edges: [] });

    expect((await db.saves.get("scope-1"))?.dirty).toBe(false);
  });

  it("a successful pull clears pullError but never touches dirtyCount - they're independent claims", async () => {
    useSyncStatusStore.setState({ pullError: true, dirtyCount: 3 });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ save: null }), { status: 200 })));

    await hydrateSave("scope-1");

    expect(useSyncStatusStore.getState().pullError).toBe(false);
    expect(useSyncStatusStore.getState().dirtyCount).toBe(3);
  });
});
