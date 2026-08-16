import { afterEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CloudSyncIndicator } from "./CloudSyncIndicator";
import { useSyncStatusStore } from "@/persistence/sync-status";

afterEach(() => {
  useSyncStatusStore.setState({ pullError: false, dirtyCount: 0, discardedCount: 0 });
});

describe("CloudSyncIndicator", () => {
  it("renders nothing while sync is healthy", () => {
    render(<CloudSyncIndicator />);
    expect(screen.queryByLabelText(/cloud sync|overwritten/i)).not.toBeInTheDocument();
  });

  it("shows the pending indicator when rows are dirty", () => {
    useSyncStatusStore.setState({ dirtyCount: 2 });
    render(<CloudSyncIndicator />);
    expect(screen.getByLabelText("Cloud sync pending")).toBeInTheDocument();
  });

  it("shows the pull-error indicator when a pull failed", () => {
    useSyncStatusStore.setState({ pullError: true });
    render(<CloudSyncIndicator />);
    expect(screen.getByLabelText("Cloud sync check failed")).toBeInTheDocument();
  });

  // Close-out P2.1 - the one signal that previously didn't exist.
  it("shows the discarded-edit indicator when reconciliation dropped a dirty row", () => {
    useSyncStatusStore.setState({ discardedCount: 1 });
    render(<CloudSyncIndicator />);
    expect(screen.getByLabelText("An edit was overwritten by another device")).toBeInTheDocument();
  });

  it("dirty and pull-error both outrank the discarded-edit indicator", () => {
    useSyncStatusStore.setState({ dirtyCount: 1, discardedCount: 1 });
    render(<CloudSyncIndicator />);
    expect(screen.getByLabelText("Cloud sync pending")).toBeInTheDocument();
    expect(screen.queryByLabelText("An edit was overwritten by another device")).not.toBeInTheDocument();
  });
});
