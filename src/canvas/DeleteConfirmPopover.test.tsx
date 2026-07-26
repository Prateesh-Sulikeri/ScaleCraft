import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { DeleteConfirmPopover } from "./DeleteConfirmPopover";
import type { CustomComponentRecord } from "@/content/components/custom";

const record: CustomComponentRecord = {
  id: "custom-1",
  category: "networking",
  label: "Rate Limiter",
  icon: "gauge",
  summary: "Limits request rate",
  docs: "docs",
  hasInput: true,
  hasOutput: true,
  fields: [],
};

describe("DeleteConfirmPopover", () => {
  it("shows a blocked message (no Delete button) when the component is in use", () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    render(
      <DeleteConfirmPopover
        target={{ record, x: 10, y: 10 }}
        usageCount={2}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    );
    expect(screen.getByText(/used by 2 nodes/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^delete$/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("uses singular 'node' when usageCount is exactly 1", () => {
    render(
      <DeleteConfirmPopover target={{ record, x: 0, y: 0 }} usageCount={1} onCancel={vi.fn()} onConfirm={vi.fn()} />,
    );
    expect(screen.getByText(/used by 1 node\b/i)).toBeInTheDocument();
  });

  it("shows a confirm/cancel dialog when usageCount is 0", () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    render(
      <DeleteConfirmPopover target={{ record, x: 0, y: 0 }} usageCount={0} onCancel={onCancel} onConfirm={onConfirm} />,
    );
    expect(
      screen.getByText((_, el) => el?.tagName === "P" && /Delete.*Rate Limiter.*undone/.test(el.textContent ?? "")),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("clicking the full-screen backdrop cancels", () => {
    const onCancel = vi.fn();
    const { container } = render(
      <DeleteConfirmPopover target={{ record, x: 0, y: 0 }} usageCount={0} onCancel={onCancel} onConfirm={vi.fn()} />,
    );
    const backdrop = container.querySelector(".fixed.inset-0") as HTMLElement;
    fireEvent.click(backdrop);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
