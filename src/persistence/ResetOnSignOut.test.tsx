import "fake-indexeddb/auto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { useAuth } from "@clerk/nextjs";
import { ResetOnSignOut } from "./ResetOnSignOut";
import { db } from "./db";
import { useCurriculumProgressStore } from "@/curriculum/progress-store";
import { useCustomComponentsStore } from "@/canvas/custom-components-store";

function mockSignedIn(isSignedIn: boolean | undefined) {
  vi.mocked(useAuth).mockReturnValue({ isSignedIn } as ReturnType<typeof useAuth>);
}

afterEach(() => {
  vi.mocked(useAuth).mockReset();
  useCurriculumProgressStore.setState({
    hydrated: false,
    hydrating: false,
    validationPassedDefinitionIds: new Set(),
    rowsBySlug: new Map(),
    examAttemptsByDefinition: new Map(),
  });
  useCustomComponentsStore.setState({ customComponents: [], hydrated: false });
});

describe("ResetOnSignOut", () => {
  it("clears the progress and custom-components stores on a signed-in -> signed-out transition", async () => {
    useCurriculumProgressStore.setState({
      hydrated: true,
      rowsBySlug: new Map([
        ["1-1-framing-the-problem", { slug: "1-1-framing-the-problem", manuallyCompletedAt: Date.now(), lastVisitedAt: null, dirty: false, syncedAt: null }],
      ]),
    });
    useCustomComponentsStore.setState({
      hydrated: true,
      customComponents: [
        { id: "custom-1", category: "compute", label: "A", icon: "server", summary: "", docs: "", hasInput: true, hasOutput: true, fields: [] },
      ],
    });
    await db.curriculumProgress.put({
      slug: "1-1-framing-the-problem",
      manuallyCompletedAt: Date.now(),
      lastVisitedAt: null,
      dirty: false,
      syncedAt: null,
    });

    mockSignedIn(true);
    const { rerender } = render(<ResetOnSignOut />);

    mockSignedIn(false);
    rerender(<ResetOnSignOut />);

    expect(useCurriculumProgressStore.getState().rowsBySlug.has("1-1-framing-the-problem")).toBe(false);
    expect(useCurriculumProgressStore.getState().hydrated).toBe(false);
    expect(useCustomComponentsStore.getState().customComponents).toEqual([]);
    expect(useCustomComponentsStore.getState().hydrated).toBe(false);

    await vi.waitFor(async () => {
      expect(await db.curriculumProgress.get("1-1-framing-the-problem")).toBeUndefined();
    });
  });

  it("does nothing for a visitor who was never signed in this session", () => {
    useCurriculumProgressStore.setState({ hydrated: true });

    mockSignedIn(undefined);
    const { rerender } = render(<ResetOnSignOut />);

    mockSignedIn(false);
    rerender(<ResetOnSignOut />);

    expect(useCurriculumProgressStore.getState().hydrated).toBe(true);
  });
});
