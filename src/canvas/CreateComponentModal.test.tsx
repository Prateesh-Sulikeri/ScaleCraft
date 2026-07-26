import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CreateComponentModal } from "./CreateComponentModal";
import type { CustomComponentRecord } from "@/content/components/custom";

describe("CreateComponentModal", () => {
  it("shows 'New component' heading and empty fields in create mode", () => {
    render(<CreateComponentModal onClose={vi.fn()} onSave={vi.fn()} />);
    expect(screen.getByText("New component")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. Rate Limiter")).toHaveValue("");
    expect(screen.getByText("Create component")).toBeInTheDocument();
  });

  it("shows 'Edit component' heading and prefilled fields in edit mode", () => {
    const record: CustomComponentRecord = {
      id: "custom-1",
      category: "caching",
      label: "Rate Limiter",
      icon: "gauge",
      summary: "Limits requests",
      docs: "Docs body",
      hasInput: true,
      hasOutput: false,
      fields: [{ kind: "number", name: "limit", label: "Limit", default: 10 }],
    };
    render(<CreateComponentModal onClose={vi.fn()} onSave={vi.fn()} initialRecord={record} />);
    expect(screen.getByText("Edit component")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. Rate Limiter")).toHaveValue("Rate Limiter");
    expect(screen.getByText("Save changes")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("fieldName")).toHaveValue("limit");
  });

  it("clicking the close (X) button calls onClose", () => {
    const onClose = vi.fn();
    render(<CreateComponentModal onClose={onClose} onSave={vi.fn()} />);
    fireEvent.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("clicking the backdrop calls onClose", () => {
    const onClose = vi.fn();
    const { container } = render(<CreateComponentModal onClose={onClose} onSave={vi.fn()} />);
    fireEvent.click(container.querySelector(".fixed.inset-0")!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows an error and does not save when Label is left blank", async () => {
    const onSave = vi.fn();
    render(<CreateComponentModal onClose={vi.fn()} onSave={onSave} />);
    fireEvent.click(screen.getByText("Create component"));
    expect(await screen.findByText("Give it a name.")).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("saves a minimal valid component with defaults (networking/server/has both ports)", async () => {
    const onSave = vi.fn();
    render(<CreateComponentModal onClose={vi.fn()} onSave={onSave} />);
    fireEvent.change(screen.getByPlaceholderText("e.g. Rate Limiter"), { target: { value: "My Widget" } });
    fireEvent.click(screen.getByText("Create component"));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    const saved = onSave.mock.calls[0][0] as CustomComponentRecord;
    expect(saved.label).toBe("My Widget");
    expect(saved.category).toBe("networking");
    expect(saved.hasInput).toBe(true);
    expect(saved.hasOutput).toBe(true);
    expect(saved.fields).toEqual([]);
    // Summary/docs fall back to the label when left blank.
    expect(saved.summary).toBe("My Widget");
    expect(saved.docs).toBe("My Widget");
    expect(saved.id).toMatch(/^custom-/);
  });

  it("keeps the original id when saving an edit", async () => {
    const record: CustomComponentRecord = {
      id: "custom-keep-id",
      category: "data",
      label: "Existing",
      icon: "database",
      summary: "s",
      docs: "d",
      hasInput: true,
      hasOutput: true,
      fields: [],
    };
    const onSave = vi.fn();
    render(<CreateComponentModal onClose={vi.fn()} onSave={onSave} initialRecord={record} />);
    fireEvent.click(screen.getByText("Save changes"));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect((onSave.mock.calls[0][0] as CustomComponentRecord).id).toBe("custom-keep-id");
  });

  it("adding a field and leaving its name blank shows a field-specific error and blocks save", async () => {
    const onSave = vi.fn();
    render(<CreateComponentModal onClose={vi.fn()} onSave={onSave} />);
    fireEvent.change(screen.getByPlaceholderText("e.g. Rate Limiter"), { target: { value: "Widget" } });
    fireEvent.click(screen.getByText("Add field"));
    fireEvent.click(screen.getByText("Create component"));
    expect(await screen.findByText("Every config field needs a name.")).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("removing a field via its trash button drops it before submit", async () => {
    const onSave = vi.fn();
    render(<CreateComponentModal onClose={vi.fn()} onSave={onSave} />);
    fireEvent.change(screen.getByPlaceholderText("e.g. Rate Limiter"), { target: { value: "Widget" } });
    fireEvent.click(screen.getByText("Add field"));
    fireEvent.click(screen.getByLabelText("Remove field"));
    fireEvent.click(screen.getByText("Create component"));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect((onSave.mock.calls[0][0] as CustomComponentRecord).fields).toEqual([]);
  });

  it("submits a string-kind field with its default value and trimmed name/label", async () => {
    const onSave = vi.fn();
    render(<CreateComponentModal onClose={vi.fn()} onSave={onSave} />);
    fireEvent.change(screen.getByPlaceholderText("e.g. Rate Limiter"), { target: { value: "Widget" } });
    fireEvent.click(screen.getByText("Add field"));
    fireEvent.change(screen.getByPlaceholderText("fieldName"), { target: { value: "  region  " } });
    fireEvent.change(screen.getByPlaceholderText("Default value"), { target: { value: "us-east-1" } });
    fireEvent.click(screen.getByText("Create component"));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    const saved = onSave.mock.calls[0][0] as CustomComponentRecord;
    expect(saved.fields).toEqual([{ kind: "string", name: "region", label: "region", default: "us-east-1" }]);
  });

  it("submits a boolean-kind field via its Yes/No select and checkbox", async () => {
    const onSave = vi.fn();
    render(<CreateComponentModal onClose={vi.fn()} onSave={onSave} />);
    fireEvent.change(screen.getByPlaceholderText("e.g. Rate Limiter"), { target: { value: "Widget" } });
    fireEvent.click(screen.getByText("Add field"));
    fireEvent.change(screen.getByPlaceholderText("fieldName"), { target: { value: "enabled" } });
    fireEvent.change(screen.getByDisplayValue("Text"), { target: { value: "boolean" } });
    fireEvent.click(screen.getByLabelText("Default on"));
    fireEvent.click(screen.getByText("Create component"));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    const saved = onSave.mock.calls[0][0] as CustomComponentRecord;
    expect(saved.fields).toEqual([{ kind: "boolean", name: "enabled", label: "enabled", default: true }]);
  });

  it("submits an enum-kind field, using the first comma-separated option as the default", async () => {
    const onSave = vi.fn();
    render(<CreateComponentModal onClose={vi.fn()} onSave={onSave} />);
    fireEvent.change(screen.getByPlaceholderText("e.g. Rate Limiter"), { target: { value: "Widget" } });
    fireEvent.click(screen.getByText("Add field"));
    fireEvent.change(screen.getByPlaceholderText("fieldName"), { target: { value: "tier" } });
    fireEvent.change(screen.getByDisplayValue("Text"), { target: { value: "enum" } });
    fireEvent.change(screen.getByPlaceholderText(/Options, comma-separated/), {
      target: { value: "small, medium, large" },
    });
    fireEvent.click(screen.getByText("Create component"));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    const saved = onSave.mock.calls[0][0] as CustomComponentRecord;
    expect(saved.fields).toEqual([
      { kind: "enum", name: "tier", label: "tier", options: ["small", "medium", "large"], default: "small" },
    ]);
  });

  it("blocks save with a field-specific error when an enum field has no options", async () => {
    const onSave = vi.fn();
    render(<CreateComponentModal onClose={vi.fn()} onSave={onSave} />);
    fireEvent.change(screen.getByPlaceholderText("e.g. Rate Limiter"), { target: { value: "Widget" } });
    fireEvent.click(screen.getByText("Add field"));
    fireEvent.change(screen.getByPlaceholderText("fieldName"), { target: { value: "tier" } });
    fireEvent.change(screen.getByDisplayValue("Text"), { target: { value: "enum" } });
    fireEvent.click(screen.getByText("Create component"));

    expect(await screen.findByText('"tier" is a choice field but has no options.')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("selecting an icon from the icon grid updates the selected icon", () => {
    render(<CreateComponentModal onClose={vi.fn()} onSave={vi.fn()} />);
    const lockIconButton = screen.getByLabelText("lock");
    fireEvent.click(lockIconButton);
    expect(lockIconButton.className).toContain("bg-border");
  });
});
