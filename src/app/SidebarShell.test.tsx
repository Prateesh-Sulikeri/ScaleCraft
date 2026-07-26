import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SidebarShell } from "./SidebarShell";

describe("SidebarShell", () => {
  it("renders children and a Home link by default, expanded", () => {
    render(
      <SidebarShell>
        <p>sidebar content</p>
      </SidebarShell>,
    );
    expect(screen.getByText("sidebar content")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("button", { name: "Collapse sidebar" })).toBeInTheDocument();
  });

  it("collapses on click, hiding content and flipping the toggle label", () => {
    render(
      <SidebarShell>
        <p>sidebar content</p>
      </SidebarShell>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));

    expect(screen.getByRole("button", { name: "Expand sidebar" })).toBeInTheDocument();
    // Content is still in the DOM (opacity-0/pointer-events-none), not
    // unmounted, but its container is visually collapsed.
    expect(screen.getByText("sidebar content").closest("div")).toHaveClass("opacity-0");
  });

  it("expands again on a second click, restoring visible content", () => {
    render(
      <SidebarShell>
        <p>sidebar content</p>
      </SidebarShell>,
    );
    const toggle = () => screen.getByRole("button", { name: /sidebar/i });
    fireEvent.click(toggle());
    fireEvent.click(toggle());

    expect(screen.getByRole("button", { name: "Collapse sidebar" })).toBeInTheDocument();
    expect(screen.getByText("sidebar content").closest("div")).toHaveClass("opacity-100");
  });

  it("hides the drag-resize handle while collapsed", () => {
    const { container } = render(
      <SidebarShell>
        <p>sidebar content</p>
      </SidebarShell>,
    );
    expect(container.querySelector(".cursor-col-resize")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(container.querySelector(".cursor-col-resize")).toBeNull();
  });
});
