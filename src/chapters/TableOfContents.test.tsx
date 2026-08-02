import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import type { ExtractedHeading } from "./extract-headings";

class MockIntersectionObserver {
  callback: IntersectionObserverCallback;
  options: IntersectionObserverInit;

  constructor(callback: IntersectionObserverCallback, options: IntersectionObserverInit) {
    this.callback = callback;
    this.options = options;
  }

  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

const { TableOfContents } = await import("./TableOfContents");

describe("TableOfContents", () => {
  const testHeadings: ExtractedHeading[] = [
    { id: "overview", text: "Overview", level: 2 },
    { id: "details", text: "Details", level: 3 },
    { id: "conclusion", text: "Conclusion", level: 2 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders navigation with h2+ headings", () => {
    render(<TableOfContents headings={testHeadings} targetRef={createRef<HTMLElement>()} />);
    expect(screen.getByLabelText("On this page")).toBeInTheDocument();
  });

  it("includes h1 headings from lesson body content", () => {
    const headings = [
      { id: "h1", text: "Title", level: 1 },
      { id: "overview", text: "Overview", level: 2 },
    ];
    render(<TableOfContents headings={headings} targetRef={createRef<HTMLElement>()} />);
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Overview")).toBeInTheDocument();
  });

  it("does not give h1 negative indentation", () => {
    const headings = [{ id: "h1", text: "Title", level: 1 }];
    const { container } = render(
      <TableOfContents headings={headings} targetRef={createRef<HTMLElement>()} />,
    );
    const li = container.querySelector("li");
    expect(li?.getAttribute("style")).toContain("0px");
  });

  it("renders all h2+ headings as links", () => {
    render(<TableOfContents headings={testHeadings} targetRef={createRef<HTMLElement>()} />);
    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute("href", "#overview");
    expect(screen.getByRole("link", { name: "Details" })).toHaveAttribute("href", "#details");
    expect(screen.getByRole("link", { name: "Conclusion" })).toHaveAttribute("href", "#conclusion");
  });

  it("indents subheadings based on level", () => {
    const { container } = render(
      <TableOfContents headings={testHeadings} targetRef={createRef<HTMLElement>()} />,
    );
    const lis = container.querySelectorAll("li");
    const overviewLi = lis[0];
    const detailsLi = lis[1];

    const overviewStyle = overviewLi.getAttribute("style");
    const detailsStyle = detailsLi.getAttribute("style");

    expect(overviewStyle).toContain("0px");
    expect(detailsStyle).toContain("12px");
  });

  it("does not set up observer when targetRef is null", () => {
    const nullRef = createRef<HTMLElement>();
    render(<TableOfContents headings={testHeadings} targetRef={nullRef} />);
    expect(screen.getByLabelText("On this page")).toBeInTheDocument();
  });

  it("does not set up observer when no headings", () => {
    render(<TableOfContents headings={[]} targetRef={createRef<HTMLElement>()} />);
    const nav = screen.queryByLabelText("On this page");
    expect(nav).not.toBeInTheDocument();
  });

  it("renders as unordered list", () => {
    render(<TableOfContents headings={testHeadings} targetRef={createRef<HTMLElement>()} />);
    const list = screen.getByRole("navigation").querySelector("ul");
    expect(list).toBeInTheDocument();
  });

  it("truncates long heading text", () => {
    const longHeadings = [
      {
        id: "long",
        text: "This is a very long heading that should be truncated",
        level: 2,
      },
    ];
    const { container } = render(
      <TableOfContents headings={longHeadings} targetRef={createRef<HTMLElement>()} />,
    );
    const link = container.querySelector("a");
    expect(link).toHaveClass("truncate");
  });

  it("applies hover styling to inactive links", () => {
    render(<TableOfContents headings={testHeadings} targetRef={createRef<HTMLElement>()} />);
    const link = screen.getByRole("link", { name: "Overview" });
    expect(link).toHaveClass("text-foreground/60", "hover:text-foreground");
  });

  it("renders navigation list items correctly", () => {
    const { container } = render(
      <TableOfContents headings={testHeadings} targetRef={createRef<HTMLElement>()} />,
    );
    const listItems = container.querySelectorAll("li");
    expect(listItems.length).toBe(testHeadings.length);
  });

  it("handles empty headings array gracefully", () => {
    const { container } = render(
      <TableOfContents headings={[]} targetRef={createRef<HTMLElement>()} />,
    );
    expect(container.firstChild).toBeNull();
  });
});
