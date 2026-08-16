import { afterEach, describe, expect, it } from "vitest";
import { useSyncStatusStore } from "./sync-status";

afterEach(() => {
  useSyncStatusStore.setState({ pullError: false, dirtyCount: 0, discardedCount: 0 });
});

describe("sync status store", () => {
  // Close-out P2.1 - discardedCount is cumulative for the page's lifetime,
  // unlike dirtyCount (which is recomputed fresh) - a discard is a one-time
  // past event, so later reconciliation passes must not erase an earlier one.
  it("recordDiscarded accumulates across calls rather than replacing", () => {
    useSyncStatusStore.getState().recordDiscarded(2);
    useSyncStatusStore.getState().recordDiscarded(1);
    expect(useSyncStatusStore.getState().discardedCount).toBe(3);
  });

  it("recordDiscarded(0) is a no-op", () => {
    useSyncStatusStore.getState().recordDiscarded(0);
    expect(useSyncStatusStore.getState().discardedCount).toBe(0);
  });
});
