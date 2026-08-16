import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { useAuth } from "@clerk/nextjs";
import { RefreshFromCloud } from "./RefreshFromCloud";

vi.mock("@/curriculum/progress-store", () => ({
  useCurriculumProgressStore: { getState: vi.fn() },
}));
vi.mock("@/canvas/custom-components-store", () => ({
  useCustomComponentsStore: { getState: vi.fn() },
}));

describe("RefreshFromCloud", () => {
  afterEach(() => {
    vi.mocked(useAuth).mockReset();
  });

  // The mount/listener wiring itself is exercised indirectly by the
  // multi-device e2e suite; this covers the one thing worth a unit test -
  // release 6.1.0-alpha Phase 11 (pending-6.1.0-poa.md) added the
  // signed-out short-circuit, since this component is mounted globally now
  // (most routes are public) and used to assume a gated layout had already
  // ruled out that case.
  it("registers no pull listeners when signed out", () => {
    vi.mocked(useAuth).mockReturnValue({ isSignedIn: false } as ReturnType<typeof useAuth>);
    const addSpy = vi.spyOn(window, "addEventListener");
    const docAddSpy = vi.spyOn(document, "addEventListener");

    render(<RefreshFromCloud />);

    expect(addSpy).not.toHaveBeenCalledWith("focus", expect.anything());
    expect(addSpy).not.toHaveBeenCalledWith("online", expect.anything());
    expect(docAddSpy).not.toHaveBeenCalledWith("visibilitychange", expect.anything());

    addSpy.mockRestore();
    docAddSpy.mockRestore();
  });

  it("registers pull listeners when signed in", () => {
    vi.mocked(useAuth).mockReturnValue({ isSignedIn: true } as ReturnType<typeof useAuth>);
    const addSpy = vi.spyOn(window, "addEventListener");
    const docAddSpy = vi.spyOn(document, "addEventListener");

    render(<RefreshFromCloud />);

    expect(addSpy).toHaveBeenCalledWith("focus", expect.anything());
    expect(addSpy).toHaveBeenCalledWith("online", expect.anything());
    expect(docAddSpy).toHaveBeenCalledWith("visibilitychange", expect.anything());

    addSpy.mockRestore();
    docAddSpy.mockRestore();
  });
});
