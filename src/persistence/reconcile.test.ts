import { describe, expect, it } from "vitest";
import { reconcileRow, reconcileRows } from "./reconcile";
import type { SyncMeta } from "./db";

type Row = SyncMeta & { id: string; value: string };

function row(overrides: Partial<Row> = {}): Row {
  return { id: "a", value: "v", dirty: false, syncedAt: null, ...overrides };
}

describe("reconcileRows", () => {
  it("adopts a remote-only row (first time on this device)", () => {
    const remote = row({ id: "a", value: "remote", syncedAt: 100 });
    const { merged, toWrite } = reconcileRows([], [remote], (r) => r.id);
    expect(merged).toEqual([remote]);
    expect(toWrite).toEqual([remote]);
  });

  it("keeps a local-only row (never pushed yet) untouched", () => {
    const local = row({ id: "a", value: "local", dirty: true });
    const { merged, toWrite } = reconcileRows([local], [], (r) => r.id);
    expect(merged).toEqual([local]);
    expect(toWrite).toEqual([]);
  });

  it("dirty local always wins over remote, regardless of remote's updatedAt", () => {
    const local = row({ id: "a", value: "local-pending", dirty: true, syncedAt: 100 });
    const remote = row({ id: "a", value: "remote-newer", syncedAt: 999 });
    const { merged, toWrite } = reconcileRows([local], [remote], (r) => r.id);
    expect(merged).toEqual([local]);
    expect(toWrite).toEqual([]);
  });

  it("remote wins when it is strictly newer than local's last known sync", () => {
    const local = row({ id: "a", value: "stale", dirty: false, syncedAt: 100 });
    const remote = row({ id: "a", value: "fresher", syncedAt: 200 });
    const { merged, toWrite } = reconcileRows([local], [remote], (r) => r.id);
    expect(merged).toEqual([remote]);
    expect(toWrite).toEqual([remote]);
  });

  it("no-ops when local and remote are already in sync", () => {
    const local = row({ id: "a", value: "same", dirty: false, syncedAt: 100 });
    const remote = row({ id: "a", value: "same", syncedAt: 100 });
    const { merged, toWrite } = reconcileRows([local], [remote], (r) => r.id);
    expect(merged).toEqual([local]);
    expect(toWrite).toEqual([]);
  });

  it("merges independently per key across a mixed batch", () => {
    const local = [row({ id: "a", value: "local-a", dirty: true }), row({ id: "b", value: "local-b", syncedAt: 5 })];
    const remote = [row({ id: "b", value: "remote-b", syncedAt: 10 }), row({ id: "c", value: "remote-c", syncedAt: 1 })];
    const { merged, toWrite } = reconcileRows(local, remote, (r) => r.id);
    expect(merged.map((r) => [r.id, r.value]).sort()).toEqual([
      ["a", "local-a"],
      ["b", "remote-b"],
      ["c", "remote-c"],
    ]);
    expect(toWrite.map((r) => r.id).sort()).toEqual(["b", "c"]);
  });
});

describe("reconcileRow", () => {
  it("returns null when neither side has a row", () => {
    expect(reconcileRow<Row>(null, null)).toBeNull();
  });

  it("adopts remote when local is absent", () => {
    const remote = row({ syncedAt: 1 });
    expect(reconcileRow(null, remote)).toEqual(remote);
  });

  it("keeps local when remote is absent", () => {
    const local = row();
    expect(reconcileRow(local, null)).toEqual(local);
  });

  it("keeps dirty local over a newer remote", () => {
    const local = row({ value: "pending", dirty: true, syncedAt: 1 });
    const remote = row({ value: "newer", syncedAt: 999 });
    expect(reconcileRow(local, remote)).toEqual(local);
  });
});
