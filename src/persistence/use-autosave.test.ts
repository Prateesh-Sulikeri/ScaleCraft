import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { db } from "./db";
import { useAutosave, AUTOSAVE_DEBOUNCE_MS, AUTOSAVE_VISIBLE_EVERY } from "./use-autosave";
import type { ComponentNodeType, ArchitectureEdgeType } from "@/canvas/types";

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

// Real timers throughout - fake-indexeddb's own internals rely on real
// scheduling, and mixing it with vi.useFakeTimers() hangs indefinitely
// rather than failing fast. A little wall-clock time per test is the
// tradeoff for exercising the real Dexie path.
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

beforeEach(async () => {
  await db.saves.clear();
});

// Guards every test below that spies on db.saves.put - if an assertion
// throws before a test reaches its own mockRestore(), a leftover
// mockRejectedValueOnce/mockImplementationOnce would otherwise still be
// queued and silently consumed by the NEXT test's first real put() call.
afterEach(() => {
  vi.restoreAllMocks();
});

describe("useAutosave", () => {
  it("does nothing until the debounce window elapses", async () => {
    renderHook(() => useAutosave("save-1", [nodeA], edges));

    await wait(AUTOSAVE_DEBOUNCE_MS - 200);
    expect(await db.saves.get("save-1")).toBeUndefined();
  });

  it("writes nodes/edges to the given save slot once the debounce window elapses", async () => {
    renderHook(() => useAutosave("save-1", [nodeA], edges));

    await wait(AUTOSAVE_DEBOUNCE_MS + 200);
    const saved = await db.saves.get("save-1");
    expect(saved?.nodes).toEqual([nodeA]);
    expect(saved?.edges).toEqual(edges);
  });

  it("resets the debounce timer on every edit instead of writing on each one", async () => {
    const { rerender } = renderHook(({ nodes }) => useAutosave("save-1", nodes, edges), {
      initialProps: { nodes: [nodeA] as ComponentNodeType[] },
    });

    await wait(AUTOSAVE_DEBOUNCE_MS - 200);
    rerender({ nodes: [nodeA, nodeB] });
    await wait(AUTOSAVE_DEBOUNCE_MS - 200);

    // Still nothing - the second edit pushed the write out again.
    expect(await db.saves.get("save-1")).toBeUndefined();

    await wait(400);
    const saved = await db.saves.get("save-1");
    // The final write reflects the latest edit, not the first one.
    expect(saved?.nodes).toEqual([nodeA, nodeB]);
  });

  it("does not write anything when saveId is null", async () => {
    renderHook(() => useAutosave(null, [nodeA], edges));

    await wait(AUTOSAVE_DEBOUNCE_MS + 200);
    expect(await db.saves.toArray()).toEqual([]);
  });

  it("cancels the pending write on unmount", async () => {
    const { unmount } = renderHook(() => useAutosave("save-1", [nodeA], edges));
    unmount();

    await wait(AUTOSAVE_DEBOUNCE_MS + 200);
    expect(await db.saves.get("save-1")).toBeUndefined();
  });

  it("stays 'saved' (quiet) through the whole debounce wait - no per-edit 'saving' flicker", async () => {
    // Nodes/edges hoisted to a stable reference outside the render callback
    // (as the real store selectors give ChapterWorkspace/SandboxPage) - a
    // fresh `[nodeA]` literal every render would look "changed" to the
    // effect's deps and restart the debounce on the status flip alone.
    const stableNodes = [nodeA];
    const { result } = renderHook(() => useAutosave("save-1", stableNodes, edges));

    expect(result.current.status).toBe("saved");
    await wait(AUTOSAVE_DEBOUNCE_MS - 200);
    // Still quiet this whole time - this is the bug being fixed: the old
    // implementation flipped to "saving" the instant an edit landed, well
    // before the debounced write actually started.
    expect(result.current.status).toBe("saved");
  });

  it("flips to 'saving' only once a write is actually in flight, then 'saved-recent', then back to 'saved'", async () => {
    // A held (not-yet-resolved) put lets the test observe "saving" for a
    // controlled window instead of racing the real, near-instant
    // fake-indexeddb write against wall-clock polling.
    let resolvePut!: () => void;
    const heldPut = new Promise<string>((resolve) => (resolvePut = () => resolve("save-1")));
    const putSpy = vi
      .spyOn(db.saves, "put")
      .mockImplementationOnce(() => heldPut as ReturnType<typeof db.saves.put>);

    const { result } = renderHook(() => useAutosave("save-1", [nodeA], edges));
    const savePromise = result.current.saveNow();

    await waitFor(() => expect(result.current.status).toBe("saving"));
    await act(async () => {
      resolvePut();
      await savePromise;
    });
    expect(result.current.status).toBe("saved-recent");
    // SAVED_RECENT_MS (1500ms) exceeds waitFor's default 1000ms timeout.
    await waitFor(() => expect(result.current.status).toBe("saved"), { timeout: 2000 });

    putSpy.mockRestore();
  });

  it("does not write anything when saveId is null, and reports 'saved' rather than a hidden/idle state", () => {
    const { result } = renderHook(() => useAutosave(null, [nodeA], edges));
    expect(result.current.status).toBe("saved");
  });

  it("reports 'error' when a write fails", async () => {
    vi.spyOn(db.saves, "put").mockRejectedValueOnce(new Error("write failed"));
    const { result } = renderHook(() => useAutosave("save-1", [nodeA], edges));

    await result.current.saveNow();
    await waitFor(() => expect(result.current.status).toBe("error"));
  });

  it("saveNow writes immediately, bypassing the debounce, and cancels any pending autosave", async () => {
    const stableNodes = [nodeA];
    const { result } = renderHook(() => useAutosave("save-1", stableNodes, edges));

    await result.current.saveNow();
    const saved = await db.saves.get("save-1");
    expect(saved?.nodes).toEqual([nodeA]);
    await waitFor(() => expect(result.current.status).toBe("saved-recent"));
  });

  it(
    `writes every automatic save but only surfaces status on every ${AUTOSAVE_VISIBLE_EVERY}th one`,
    async () => {
      const { rerender, result } = renderHook(({ nodes }) => useAutosave("save-1", nodes, edges), {
        initialProps: { nodes: [nodeA] as ComponentNodeType[] },
      });

      // Every cycle before the Nth completes a real write, but never disturbs
      // status - it stays at the quiet resting "saved" the whole time.
      for (let cycle = 1; cycle < AUTOSAVE_VISIBLE_EVERY; cycle++) {
        rerender({ nodes: [nodeA] }); // a fresh array reference restarts the debounce
        await wait(AUTOSAVE_DEBOUNCE_MS + 200);
        expect(result.current.status).toBe("saved");
      }
      expect(await db.saves.get("save-1")).toBeDefined();

      // The Nth cycle is the one that's actually shown.
      rerender({ nodes: [nodeA] });
      await waitFor(() => expect(result.current.status).toBe("saved-recent"), {
        timeout: AUTOSAVE_DEBOUNCE_MS + 1000,
      });
    },
    (AUTOSAVE_VISIBLE_EVERY + 1) * (AUTOSAVE_DEBOUNCE_MS + 1000),
  );

  it("always surfaces 'error' on a failed automatic save, even on an otherwise-silent cycle", async () => {
    vi.spyOn(db.saves, "put").mockRejectedValueOnce(new Error("write failed"));
    const { result } = renderHook(() => useAutosave("save-1", [nodeA], edges));

    // The very first autosave cycle would normally be silent (it isn't the
    // AUTOSAVE_VISIBLE_EVERYth one) - a failure must still surface.
    await waitFor(() => expect(result.current.status).toBe("error"), {
      timeout: AUTOSAVE_DEBOUNCE_MS + 1000,
    });
  });

  it("clears a stuck 'error' on the next successful save, even if that save would otherwise be silent", async () => {
    vi.spyOn(db.saves, "put").mockRejectedValueOnce(new Error("write failed"));
    const { rerender, result } = renderHook(({ nodes }) => useAutosave("save-1", nodes, edges), {
      initialProps: { nodes: [nodeA] as ComponentNodeType[] },
    });

    await waitFor(() => expect(result.current.status).toBe("error"), {
      timeout: AUTOSAVE_DEBOUNCE_MS + 1000,
    });

    // This next cycle isn't the Nth one either, but recovering from a real
    // error is never something to hide.
    rerender({ nodes: [nodeA, nodeB] });
    await waitFor(() => expect(result.current.status).toBe("saved-recent"), {
      timeout: AUTOSAVE_DEBOUNCE_MS + 1000,
    });
  });
});
