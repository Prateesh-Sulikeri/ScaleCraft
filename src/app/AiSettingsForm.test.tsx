import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AiSettingsForm } from "./AiSettingsForm";
import { DEFAULT_AI_SETTINGS } from "@/ai/settings";
import type { AiProfileDraft } from "@/ai/profiles";

const DEFAULT_DRAFT: AiProfileDraft = { ...DEFAULT_AI_SETTINGS, name: "" };

const testConnectionMock = vi.fn();
vi.mock("@/ai/run-deep-check", () => ({
  testConnection: (...args: unknown[]) => testConnectionMock(...args),
}));

describe("AiSettingsForm", () => {
  beforeEach(() => {
    testConnectionMock.mockReset();
  });

  it("renders every field prefilled from the current draft, including its name", () => {
    render(
      <AiSettingsForm
        settings={{ ...DEFAULT_DRAFT, name: "Work key", providerId: "xai", model: "grok-4", apiKey: "sk-test" }}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Profile name")).toHaveValue("Work key");
    expect(screen.getByLabelText("Provider")).toHaveValue("xai");
    expect(screen.getByLabelText("Model")).toHaveValue("grok-4");
    expect(screen.getByLabelText("API Key")).toHaveValue("sk-test");
    expect(
      screen.getByText(/stored in this browser's IndexedDB and is never sent to ScaleCraft's servers/),
    ).toBeInTheDocument();
  });

  it("shows the Base URL field only for the openai-compatible provider", () => {
    render(<AiSettingsForm settings={DEFAULT_DRAFT} onSave={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.queryByLabelText("Base URL")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Provider"), { target: { value: "openai-compatible" } });
    expect(screen.getByLabelText("Base URL")).toBeInTheDocument();
  });

  it("calls onSave with the trimmed name and key", async () => {
    const onSave = vi.fn();
    render(<AiSettingsForm settings={DEFAULT_DRAFT} onSave={onSave} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("Profile name"), { target: { value: "  My Profile  " } });
    fireEvent.change(screen.getByLabelText("API Key"), { target: { value: "sk-live-123" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    const saved: AiProfileDraft = onSave.mock.calls[0][0];
    expect(saved.name).toBe("My Profile");
    expect(saved.apiKey).toBe("sk-live-123");
  });

  it("falls back to a default name when left blank", async () => {
    const onSave = vi.fn();
    render(<AiSettingsForm settings={DEFAULT_DRAFT} onSave={onSave} onCancel={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave.mock.calls[0][0].name).toBe("Untitled profile");
  });

  it("calls onCancel when Cancel is clicked", () => {
    const onCancel = vi.fn();
    render(<AiSettingsForm settings={DEFAULT_DRAFT} onSave={vi.fn()} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("shows a success state on Test Connection", async () => {
    testConnectionMock.mockResolvedValue({ status: "ok" });
    render(
      <AiSettingsForm settings={{ ...DEFAULT_DRAFT, apiKey: "sk-test" }} onSave={vi.fn()} onCancel={vi.fn()} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Test Connection" }));

    await waitFor(() => expect(screen.getByText("Connected")).toBeInTheDocument());
    expect(testConnectionMock).toHaveBeenCalledTimes(1);
  });

  it("shows the provider-specific error message on a failed Test Connection", async () => {
    testConnectionMock.mockResolvedValue({ status: "error", kind: "auth", message: "The API key was rejected." });
    render(
      <AiSettingsForm settings={{ ...DEFAULT_DRAFT, apiKey: "sk-bad" }} onSave={vi.fn()} onCancel={vi.fn()} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Test Connection" }));

    await waitFor(() => expect(screen.getByText("The API key was rejected.")).toBeInTheDocument());
  });

  it("switching provider resets the model to the new provider's default when the old model isn't in its suggested list", () => {
    render(<AiSettingsForm settings={DEFAULT_DRAFT} onSave={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByLabelText("Model")).toHaveValue("claude-opus-5");

    fireEvent.change(screen.getByLabelText("Provider"), { target: { value: "google" } });

    expect(screen.getByLabelText("Model")).toHaveValue("gemini-3-pro");
  });

  it("switching to a provider with no suggested models drops straight into the free-text model input", () => {
    render(<AiSettingsForm settings={DEFAULT_DRAFT} onSave={vi.fn()} onCancel={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Provider"), { target: { value: "openai-compatible" } });

    expect(screen.queryByLabelText("Model", { selector: "select" })).not.toBeInTheDocument();
    const modelInput = screen.getByLabelText("Model", { selector: "input" });
    expect(modelInput).toHaveAttribute("placeholder", "Model ID");
  });

  it("picking a different suggested model from the Model dropdown updates the value", async () => {
    const onSave = vi.fn();
    render(<AiSettingsForm settings={DEFAULT_DRAFT} onSave={onSave} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("Model"), { target: { value: "claude-haiku-4-5" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave.mock.calls[0][0].model).toBe("claude-haiku-4-5");
  });

  it("choosing 'Custom…' in the Model dropdown swaps in a free-text field", () => {
    render(<AiSettingsForm settings={DEFAULT_DRAFT} onSave={vi.fn()} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("Model"), { target: { value: "__custom__" } });

    expect(screen.getByLabelText("Custom model")).toBeInTheDocument();
  });

  it("falls back to the provider's default model when the model field is cleared", async () => {
    const onSave = vi.fn();
    render(<AiSettingsForm settings={DEFAULT_DRAFT} onSave={onSave} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("Model"), { target: { value: "__custom__" } });
    fireEvent.change(screen.getByLabelText("Custom model"), { target: { value: "   " } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave.mock.calls[0][0].model).toBe("claude-opus-5");
  });

  it("omits baseUrl from the saved draft for a non-openai-compatible provider", async () => {
    const onSave = vi.fn();
    render(<AiSettingsForm settings={DEFAULT_DRAFT} onSave={onSave} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave.mock.calls[0][0]).not.toHaveProperty("baseUrl");
  });

  it("includes the trimmed baseUrl in the saved draft for the openai-compatible provider", async () => {
    const onSave = vi.fn();
    render(
      <AiSettingsForm
        settings={{ ...DEFAULT_DRAFT, providerId: "openai-compatible" }}
        onSave={onSave}
        onCancel={vi.fn()}
      />,
    );
    fireEvent.change(screen.getByLabelText("Base URL"), { target: { value: "  http://localhost:11434/v1  " } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave.mock.calls[0][0].baseUrl).toBe("http://localhost:11434/v1");
  });
});
