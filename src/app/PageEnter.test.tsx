import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageEnter } from "./PageEnter";

// PageEnter is a thin structural wrapper (a div with a fixed animation
// class) around whatever's passed in — nothing conditional to branch on, so
// this is a smoke test: it renders its children, unmodified, inside the
// expected wrapper.
describe("PageEnter", () => {
  it("renders its children", () => {
    render(
      <PageEnter>
        <p>page content</p>
      </PageEnter>,
    );
    expect(screen.getByText("page content")).toBeInTheDocument();
  });

  it("wraps children in a flex column container with the page-enter animation class", () => {
    const { container } = render(
      <PageEnter>
        <span>x</span>
      </PageEnter>,
    );
    const wrapper = container.firstElementChild;
    expect(wrapper).toHaveClass("flex", "flex-1", "flex-col");
  });
});
