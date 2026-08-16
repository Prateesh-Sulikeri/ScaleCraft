import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { useAuth } from "@clerk/nextjs";
import { FlushDirtyRows } from "./FlushDirtyRows";
import { flushDirtyRows } from "./flush-dirty";

vi.mock("./flush-dirty", () => ({
  flushDirtyRows: vi.fn().mockResolvedValue(undefined),
}));

describe("FlushDirtyRows", () => {
  afterEach(() => {
    vi.mocked(useAuth).mockReset();
    vi.mocked(flushDirtyRows).mockClear();
  });

  it("flushes on mount when signed in", () => {
    vi.mocked(useAuth).mockReturnValue({ isSignedIn: true } as ReturnType<typeof useAuth>);
    render(<FlushDirtyRows />);
    expect(flushDirtyRows).toHaveBeenCalledOnce();
  });

  // Release 6.1.0-alpha Phase 11 (pending-6.1.0-poa.md) - mounted globally
  // now since most routes are public, so it has to gate itself: a
  // signed-out visitor never has a dirty row to flush and flushing would
  // only 401 against /api/sync/*.
  it("does nothing when signed out", () => {
    vi.mocked(useAuth).mockReturnValue({ isSignedIn: false } as ReturnType<typeof useAuth>);
    render(<FlushDirtyRows />);
    expect(flushDirtyRows).not.toHaveBeenCalled();
  });
});
