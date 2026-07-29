import "fake-indexeddb/auto";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CanvasStoreProvider } from "@/canvas/store";
import { DeepCheckButton } from "./DeepCheckButton";
import { DEFAULT_AI_SETTINGS } from "@/ai/settings";
import type { DeepCheckContext } from "@/ai/prompt";

const getAiSettingsMock = vi.fn();
const saveAiSettingsMock = vi.fn();
vi.mock("@/ai/settings", async () => {
  const actual = await vi.importActual<typeof import("@/ai/settings")>("@/ai/settings");
  return {
    ...actual,
    getAiSettings: (...args: unknown[]) => getAiSettingsMock(...args),
    saveAiSettings: (...args: unknown[]) => saveAiSettingsMock(...args),
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
    getAiSettingsMock.mockReset();
    saveAiSettingsMock.mockReset();
    runDeepCheckMock.mockReset();
    testConnectionMock.mockReset();
    saveSessionMock.mockReset().mockResolvedValue(undefined);
  });

  it("opens the panel straight to Settings instead of running Deep Check when no key is configured", async () => {
    getAiSettingsMock.mockResolvedValue({ ...DEFAULT_AI_SETTINGS });
    renderButton();
    await waitFor(() => expect(getAiSettingsMock).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: "Deep Check" }));

    expect(await screen.findByText("AI Settings")).toBeInTheDocument();
    expect(runDeepCheckMock).not.toHaveBeenCalled();
  });

  it("runs Deep Check and renders the ok result once a key is configured", async () => {
    const settings = { ...DEFAULT_AI_SETTINGS, enabled: true, apiKey: "sk-test" };
    getAiSettingsMock.mockResolvedValue(settings);
    let resolveRun: ((value: unknown) => void) | undefined;
    runDeepCheckMock.mockReturnValue(
      new Promise((resolve) => {
        resolveRun = resolve;
      }),
    );
    renderButton();
    await waitFor(() => expect(getAiSettingsMock).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: "Deep Check" }));
    expect(screen.getByText("Reviewing your design…")).toBeInTheDocument();

    resolveRun!({ status: "ok", critique: { summary: "All good", sections: [], tradeoffs: [] } });
    await waitFor(() => expect(screen.getByText("All good")).toBeInTheDocument());

    expect(runDeepCheckMock).toHaveBeenCalledWith(ctx, settings, expect.anything());
  });

  it("autosaves a successful run to the current saveId's session history", async () => {
    const settings = { ...DEFAULT_AI_SETTINGS, enabled: true, apiKey: "sk-test" };
    getAiSettingsMock.mockResolvedValue(settings);
    const critique = { summary: "All good", sections: [], tradeoffs: [] };
    runDeepCheckMock.mockResolvedValue({ status: "ok", critique });
    renderButton("sandbox");
    await waitFor(() => expect(getAiSettingsMock).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: "Deep Check" }));

    await waitFor(() => expect(saveSessionMock).toHaveBeenCalledWith("sandbox", critique));
  });

  it("does not attempt to autosave when there is no saveId", async () => {
    const settings = { ...DEFAULT_AI_SETTINGS, enabled: true, apiKey: "sk-test" };
    getAiSettingsMock.mockResolvedValue(settings);
    runDeepCheckMock.mockResolvedValue({
      status: "ok",
      critique: { summary: "All good", sections: [], tradeoffs: [] },
    });
    renderButton(null);
    await waitFor(() => expect(getAiSettingsMock).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: "Deep Check" }));

    await waitFor(() => expect(screen.getByText("All good")).toBeInTheDocument());
    expect(saveSessionMock).not.toHaveBeenCalled();
  });

  it("does not autosave an error result", async () => {
    const settings = { ...DEFAULT_AI_SETTINGS, enabled: true, apiKey: "sk-test" };
    getAiSettingsMock.mockResolvedValue(settings);
    runDeepCheckMock.mockResolvedValue({ status: "error", kind: "unknown", message: "nope" });
    renderButton("sandbox");
    await waitFor(() => expect(getAiSettingsMock).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: "Deep Check" }));

    await waitFor(() => expect(screen.getByText("nope")).toBeInTheDocument());
    expect(saveSessionMock).not.toHaveBeenCalled();
  });

  it("opens the panel's inline AI Settings view via its gear icon even when a key is already configured", async () => {
    getAiSettingsMock.mockResolvedValue({ ...DEFAULT_AI_SETTINGS, enabled: true, apiKey: "sk-test" });
    runDeepCheckMock.mockReturnValue(new Promise(() => {})); // never resolves — panel stays open on the loading state underneath
    renderButton();
    await waitFor(() => expect(getAiSettingsMock).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: "Deep Check" }));
    fireEvent.click(screen.getByRole("button", { name: "AI Settings" }));

    expect(screen.getByLabelText("Provider")).toBeInTheDocument();
  });

  it("Cancel aborts the in-flight request and closes the panel without forcing a result", async () => {
    const settings = { ...DEFAULT_AI_SETTINGS, enabled: true, apiKey: "sk-test" };
    getAiSettingsMock.mockResolvedValue(settings);
    let capturedSignal: AbortSignal | undefined;
    runDeepCheckMock.mockImplementation((_ctx: unknown, _settings: unknown, signal: AbortSignal) => {
      capturedSignal = signal;
      return new Promise(() => {}); // never resolves — Cancel must not wait on it
    });
    renderButton();
    await waitFor(() => expect(getAiSettingsMock).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: "Deep Check" }));
    expect(screen.getByText("Reviewing your design…")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(capturedSignal?.aborted).toBe(true);
    expect(screen.queryByText("Reviewing your design…")).not.toBeInTheDocument();
  });

  it("enables Deep Check after saving settings from within the panel's inline settings view", async () => {
    getAiSettingsMock.mockResolvedValue({ ...DEFAULT_AI_SETTINGS });
    saveAiSettingsMock.mockResolvedValue(undefined);
    renderButton();
    await waitFor(() => expect(getAiSettingsMock).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: "Deep Check" }));
    fireEvent.change(await screen.findByLabelText("API Key"), { target: { value: "sk-new" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(saveAiSettingsMock).toHaveBeenCalled());
    expect(screen.queryByText("AI Settings")).not.toBeInTheDocument();

    runDeepCheckMock.mockResolvedValue({
      status: "ok",
      critique: { summary: "ok now", sections: [], tradeoffs: [] },
    });
    fireEvent.click(screen.getByRole("button", { name: "Deep Check" }));

    await waitFor(() => expect(runDeepCheckMock).toHaveBeenCalledTimes(1));
  });
});
