import "fake-indexeddb/auto";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CanvasStoreProvider } from "@/canvas/store";
import { DeepCheckButton } from "./DeepCheckButton";
import { DEFAULT_AI_SETTINGS } from "@/ai/settings";
import type { AiProfile } from "@/ai/profiles";
import type { DeepCheckContext } from "@/ai/prompt";

const getActiveProfileMock = vi.fn();
const listProfilesMock = vi.fn();
const createProfileMock = vi.fn();
vi.mock("@/ai/profiles", async () => {
  const actual = await vi.importActual<typeof import("@/ai/profiles")>("@/ai/profiles");
  return {
    ...actual,
    getActiveProfile: (...args: unknown[]) => getActiveProfileMock(...args),
    listProfiles: (...args: unknown[]) => listProfilesMock(...args),
    createProfile: (...args: unknown[]) => createProfileMock(...args),
    updateProfile: vi.fn(),
    deleteProfile: vi.fn(),
    setActiveProfileId: vi.fn(),
  };
});

const runDeepCheckMock = vi.fn();
const testConnectionMock = vi.fn();
vi.mock("@/ai/run-deep-check", () => ({
  runDeepCheck: (...args: unknown[]) => runDeepCheckMock(...args),
  testConnection: (...args: unknown[]) => testConnectionMock(...args),
}));

const saveSessionMock = vi.fn();
vi.mock("@/persistence/deepCheckSessions", () => ({
  saveSession: (...args: unknown[]) => saveSessionMock(...args),
  listSessions: vi.fn().mockResolvedValue([]),
  deleteSession: vi.fn(),
}));

function makeProfile(overrides: Partial<AiProfile> = {}): AiProfile {
  return { id: "p1", name: "Work key", ...DEFAULT_AI_SETTINGS, apiKey: "sk-test", createdAt: 1, updatedAt: 1, ...overrides };
}

const ctx: DeepCheckContext = {
  graph: {
    nodes: [{ id: "n1", componentId: "load-balancer", position: { x: 0, y: 0 }, config: {} }],
    edges: [],
    entryPointIds: [],
  },
  components: [],
  violations: [],
  passed: false,
};

function renderButton(saveId: string | null = "sandbox") {
  render(
    <CanvasStoreProvider>
      <DeepCheckButton ctx={ctx} saveId={saveId} />
    </CanvasStoreProvider>,
  );
}

describe("DeepCheckButton", () => {
  beforeEach(() => {
    getActiveProfileMock.mockReset();
    listProfilesMock.mockReset().mockResolvedValue([]);
    createProfileMock.mockReset();
    runDeepCheckMock.mockReset();
    testConnectionMock.mockReset();
    saveSessionMock.mockReset().mockResolvedValue(undefined);
  });

  it("opens the panel straight to AI Profiles instead of running Deep Check when no usable profile exists", async () => {
    getActiveProfileMock.mockResolvedValue(null);
    renderButton();
    await waitFor(() => expect(getActiveProfileMock).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: "Deep Check" }));

    expect(await screen.findByText("AI Profiles")).toBeInTheDocument();
    expect(runDeepCheckMock).not.toHaveBeenCalled();
  });

  it("runs Deep Check and renders the ok result once a usable active profile exists", async () => {
    const profile = makeProfile();
    getActiveProfileMock.mockResolvedValue(profile);
    let resolveRun: ((value: unknown) => void) | undefined;
    runDeepCheckMock.mockReturnValue(
      new Promise((resolve) => {
        resolveRun = resolve;
      }),
    );
    renderButton();
    await waitFor(() => expect(getActiveProfileMock).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: "Deep Check" }));
    expect(screen.getByText("Reviewing your design…")).toBeInTheDocument();

    resolveRun!({ status: "ok", critique: { summary: "All good", sections: [], tradeoffs: [] } });
    await waitFor(() => expect(screen.getByText("All good")).toBeInTheDocument());

    expect(runDeepCheckMock).toHaveBeenCalledWith(ctx, profile, expect.anything());
  });

  it("autosaves a successful run to the current saveId's session history", async () => {
    const profile = makeProfile();
    getActiveProfileMock.mockResolvedValue(profile);
    const critique = { summary: "All good", sections: [], tradeoffs: [] };
    runDeepCheckMock.mockResolvedValue({ status: "ok", critique });
    renderButton("sandbox");
    await waitFor(() => expect(getActiveProfileMock).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: "Deep Check" }));

    await waitFor(() => expect(saveSessionMock).toHaveBeenCalledWith("sandbox", critique));
  });

  it("does not attempt to autosave when there is no saveId", async () => {
    const profile = makeProfile();
    getActiveProfileMock.mockResolvedValue(profile);
    runDeepCheckMock.mockResolvedValue({
      status: "ok",
      critique: { summary: "All good", sections: [], tradeoffs: [] },
    });
    renderButton(null);
    await waitFor(() => expect(getActiveProfileMock).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: "Deep Check" }));

    await waitFor(() => expect(screen.getByText("All good")).toBeInTheDocument());
    expect(saveSessionMock).not.toHaveBeenCalled();
  });

  it("does not autosave an error result", async () => {
    const profile = makeProfile();
    getActiveProfileMock.mockResolvedValue(profile);
    runDeepCheckMock.mockResolvedValue({ status: "error", kind: "unknown", message: "nope" });
    renderButton("sandbox");
    await waitFor(() => expect(getActiveProfileMock).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: "Deep Check" }));

    await waitFor(() => expect(screen.getByText("nope")).toBeInTheDocument());
    expect(saveSessionMock).not.toHaveBeenCalled();
  });

  it("opens the panel's inline AI Profiles view via its header icon even when a profile is already active", async () => {
    getActiveProfileMock.mockResolvedValue(makeProfile());
    listProfilesMock.mockResolvedValue([makeProfile()]);
    runDeepCheckMock.mockReturnValue(new Promise(() => {})); // never resolves — panel stays open on the loading state underneath
    renderButton();
    await waitFor(() => expect(getActiveProfileMock).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: "Deep Check" }));
    fireEvent.click(screen.getByRole("button", { name: "AI Profiles" }));

    expect(await screen.findByText("Work key")).toBeInTheDocument();
  });

  it("Cancel aborts the in-flight request without forcing a result, and leaves the panel open", async () => {
    const profile = makeProfile();
    getActiveProfileMock.mockResolvedValue(profile);
    let capturedSignal: AbortSignal | undefined;
    runDeepCheckMock.mockImplementation((_ctx: unknown, _profile: unknown, signal: AbortSignal) => {
      capturedSignal = signal;
      return new Promise(() => {}); // never resolves — Cancel must not wait on it
    });
    listProfilesMock.mockResolvedValue([profile]);
    renderButton();
    await waitFor(() => expect(getActiveProfileMock).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: "Deep Check" }));
    expect(screen.getByText("Reviewing your design…")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(capturedSignal?.aborted).toBe(true);
    expect(screen.queryByText("Reviewing your design…")).not.toBeInTheDocument();
    // The panel itself must stay open — cancelling a run isn't the same as
    // dismissing the whole panel (the user may want Settings/History/Help,
    // or to just retry).
    expect(screen.getByRole("button", { name: "Run Deep Check" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("enables Deep Check after creating a profile from within the panel's inline profiles view", async () => {
    getActiveProfileMock.mockResolvedValueOnce(null); // nothing configured yet, at mount
    listProfilesMock.mockResolvedValue([]);
    const created = makeProfile({ id: "new-1", name: "First profile", apiKey: "sk-new" });
    createProfileMock.mockResolvedValue(created);
    getActiveProfileMock.mockResolvedValueOnce(created); // re-read after creation auto-activates it
    renderButton();
    await waitFor(() => expect(getActiveProfileMock).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: "Deep Check" }));
    expect(await screen.findByText("AI Profiles")).toBeInTheDocument();

    fireEvent.click(await screen.findByRole("button", { name: /New Profile/ }));
    fireEvent.change(await screen.findByLabelText("Profile name"), { target: { value: "First profile" } });
    fireEvent.change(screen.getByLabelText("API Key"), { target: { value: "sk-new" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(createProfileMock).toHaveBeenCalled());

    runDeepCheckMock.mockResolvedValue({
      status: "ok",
      critique: { summary: "ok now", sections: [], tradeoffs: [] },
    });
    fireEvent.click(screen.getByRole("button", { name: "Deep Check" }));

    await waitFor(() => expect(runDeepCheckMock).toHaveBeenCalledTimes(1));
    expect(runDeepCheckMock).toHaveBeenCalledWith(ctx, created, expect.anything());
  });
});
