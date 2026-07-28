import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AiSettingsModal } from "./AiSettingsModal";
import { DEFAULT_AI_SETTINGS } from "@/ai/settings";

const testConnectionMock = vi.fn();
vi.mock("@/ai/run-deep-check", () => ({
  testConnection: (...args: unknown[]) => testConnectionMock(...args),
}));

describe("AiSettingsModal", () => {
  beforeEach(() => {
    testConnectionMock.mockReset();
  });

  it("renders every field prefilled from the current settings, and the required storage disclosure", () => {
    render(
      <AiSettingsModal
        settings={{ ...DEFAULT_AI_SETTINGS, providerId: "xai", model: "grok-4", apiKey: "sk-test" }}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("AI Settings")).toBeInTheDocument();
    expect(screen.getByLabelText("Provider")).toHaveValue("xai");
    expect(screen.getByLabelText("Model")).toHaveValue("grok-4");
    expect(screen.getByLabelText("API Key")).toHaveValue("sk-test");
    expect(
      screen.getByText(/stored in this browser's IndexedDB and is never sent to ScaleCraft's servers/),
    ).toBeInTheDocument();
  });

  it("shows the Base URL field only for the openai-compatible provider", () => {
    render(<AiSettingsModal settings={DEFAULT_AI_SETTINGS} onSave={vi.fn()} onClose={vi.fn()} />);
    expect(screen.queryByLabelText("Base URL")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Provider"), { target: { value: "openai-compatible" } });
    expect(screen.getByLabelText("Base URL")).toBeInTheDocument();
  });

  it("calls onSave with enabled:true once a non-empty key is entered", async () => {
    const onSave = vi.fn();
    render(<AiSettingsModal settings={DEFAULT_AI_SETTINGS} onSave={onSave} onClose={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("API Key"), { target: { value: "sk-live-123" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    const saved = onSave.mock.calls[0][0];
    expect(saved.enabled).toBe(true);
    expect(saved.apiKey).toBe("sk-live-123");
  });

  it("calls onSave with enabled:false when the key is left empty", async () => {
    const onSave = vi.fn();
    render(<AiSettingsModal settings={DEFAULT_AI_SETTINGS} onSave={onSave} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave.mock.calls[0][0].enabled).toBe(false);
  });

  it("calls onClose when Cancel or the close button is clicked", () => {
    const onClose = vi.fn();
    render(<AiSettingsModal settings={DEFAULT_AI_SETTINGS} onSave={vi.fn()} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows a success state on Test Connection", async () => {
    testConnectionMock.mockResolvedValue({ status: "ok" });
    render(
      <AiSettingsModal
        settings={{ ...DEFAULT_AI_SETTINGS, apiKey: "sk-test" }}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Test Connection" }));

    await waitFor(() => expect(screen.getByText("Connected")).toBeInTheDocument());
    expect(testConnectionMock).toHaveBeenCalledTimes(1);
  });

  it("shows the provider-specific error message on a failed Test Connection", async () => {
    testConnectionMock.mockResolvedValue({ status: "error", kind: "auth", message: "The API key was rejected." });
    render(
      <AiSettingsModal
        settings={{ ...DEFAULT_AI_SETTINGS, apiKey: "sk-bad" }}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Test Connection" }));

    await waitFor(() => expect(screen.getByText("The API key was rejected.")).toBeInTheDocument());
  });
});
