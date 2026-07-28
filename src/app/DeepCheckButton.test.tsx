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

function renderButton() {
  render(
    <CanvasStoreProvider>
      <DeepCheckButton ctx={ctx} />
    </CanvasStoreProvider>,
  );
}

describe("DeepCheckButton", () => {
  beforeEach(() => {
    getAiSettingsMock.mockReset();
    saveAiSettingsMock.mockReset();
    runDeepCheckMock.mockReset();
    testConnectionMock.mockReset();
  });

  it("opens Settings instead of running Deep Check when no key is configured", async () => {
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

  it("opens Settings via the gear icon even when a key is already configured", async () => {
    getAiSettingsMock.mockResolvedValue({ ...DEFAULT_AI_SETTINGS, enabled: true, apiKey: "sk-test" });
    renderButton();
    await waitFor(() => expect(getAiSettingsMock).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: "AI Settings" }));

    expect(screen.getByText("AI Settings")).toBeInTheDocument();
    expect(runDeepCheckMock).not.toHaveBeenCalled();
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

  it("enables the Deep Check button after saving settings with a key from the modal", async () => {
    getAiSettingsMock.mockResolvedValue({ ...DEFAULT_AI_SETTINGS });
    saveAiSettingsMock.mockResolvedValue(undefined);
    renderButton();
    await waitFor(() => expect(getAiSettingsMock).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: "AI Settings" }));
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
