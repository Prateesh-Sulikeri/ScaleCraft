import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { db } from "./db";
import { useAutosave, AUTOSAVE_DEBOUNCE_MS } from "./use-autosave";
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

// Real timers throughout — fake-indexeddb's own internals rely on real
// scheduling, and mixing it with vi.useFakeTimers() hangs indefinitely
// rather than failing fast. A little wall-clock time per test (the debounce
// window is only 800ms) is the tradeoff for exercising the real Dexie path.
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

beforeEach(async () => {
  await db.saves.clear();
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

    // Still nothing — the second edit pushed the write out again.
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
});
