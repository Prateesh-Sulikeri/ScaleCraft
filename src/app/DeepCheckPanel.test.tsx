import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DeepCheckPanel } from "./DeepCheckPanel";

describe("DeepCheckPanel", () => {
  it("renders a loading state with a cancel affordance wired to onClose", () => {
    const onClose = vi.fn();
    render(<DeepCheckPanel state={{ status: "loading" }} onClose={onClose} onSelectNode={vi.fn()} />);

    expect(screen.getByText("Reviewing your design…")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders the plain failure message on an error result, with no severity styling", () => {
    render(
      <DeepCheckPanel
        state={{ status: "error", kind: "unknown", message: "The model returned something unusable." }}
        onClose={vi.fn()}
        onSelectNode={vi.fn()}
      />,
    );

    const message = screen.getByText("The model returned something unusable.");
    expect(message).toBeInTheDocument();
    expect(message.className).not.toMatch(/state-error/);
  });

  it("renders the critique summary, markdown section bodies, and tradeoffs", () => {
    render(
      <DeepCheckPanel
        state={{
          status: "ok",
          critique: {
            summary: "Overall solid.",
            sections: [
              {
                title: "Single point of failure",
                body: "The **load balancer** has no redundancy.",
                relatedNodeIds: ["n1"],
              },
            ],
            tradeoffs: [{ decision: "Cache-aside", cost: "Stale reads", benefit: "Lower DB load" }],
          },
        }}
        onClose={vi.fn()}
        onSelectNode={vi.fn()}
      />,
    );

    expect(screen.getByText("Overall solid.")).toBeInTheDocument();
    expect(screen.getByText("load balancer").tagName).toBe("STRONG");
    expect(screen.getByText("Cache-aside")).toBeInTheDocument();
    expect(screen.getByText("Stale reads")).toBeInTheDocument();
    expect(screen.getByText("Lower DB load")).toBeInTheDocument();
  });

  it("clicking a section with relatedNodeIds selects the first one via onSelectNode", () => {
    const onSelectNode = vi.fn();
    render(
      <DeepCheckPanel
        state={{
          status: "ok",
          critique: {
            summary: "s",
            sections: [{ title: "Single point of failure", body: "b", relatedNodeIds: ["n1", "n2"] }],
            tradeoffs: [],
          },
        }}
        onClose={vi.fn()}
        onSelectNode={onSelectNode}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Single point of failure" }));
    expect(onSelectNode).toHaveBeenCalledWith("n1");
  });

  it("renders a section with no relatedNodeIds as plain text, not a clickable button", () => {
    render(
      <DeepCheckPanel
        state={{
          status: "ok",
          critique: {
            summary: "s",
            sections: [{ title: "General observation", body: "b", relatedNodeIds: [] }],
            tradeoffs: [],
          },
        }}
        onClose={vi.fn()}
        onSelectNode={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button", { name: "General observation" })).not.toBeInTheDocument();
    expect(screen.getByText("General observation")).toBeInTheDocument();
  });

  it("calls onClose when the panel's own close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <DeepCheckPanel
        state={{ status: "ok", critique: { summary: "s", sections: [], tradeoffs: [] } }}
        onClose={onClose}
        onSelectNode={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
