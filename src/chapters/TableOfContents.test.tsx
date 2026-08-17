import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { createRef, useRef } from "react";
import type { ExtractedHeading } from "./extract-headings";

let lastObserverInstance: MockIntersectionObserver | null = null;

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

function createMockObserver(
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit,
): MockIntersectionObserver {
  lastObserverInstance = new MockIntersectionObserver(callback, options);
  return lastObserverInstance;
}

vi.stubGlobal("IntersectionObserver", createMockObserver);

let lastResizeObserverInstance: MockResizeObserver | null = null;

// Standing in for the real one so the "headings not painted yet" re-scan
// (TableOfContents.tsx's ResizeObserver) can be driven manually below,
// instead of jsdom throwing on `new ResizeObserver(...)` (unimplemented).
class MockResizeObserver {
  callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

function createMockResizeObserver(callback: ResizeObserverCallback): MockResizeObserver {
  lastResizeObserverInstance = new MockResizeObserver(callback);
  return lastResizeObserverInstance;
}

vi.stubGlobal("ResizeObserver", createMockResizeObserver);

const { TableOfContents } = await import("./TableOfContents");

/** Attaches targetRef to a real, mounted DOM node containing an element for
 * each heading id - the shape TableOfContents actually needs to instantiate
 * an IntersectionObserver at all (a `createRef` never attached anywhere, as
 * the rest of this file's tests use, leaves `targetRef.current` permanently
 * null). */
function Harness({
  headings,
  domHeadingIds,
}: {
  headings: ExtractedHeading[];
  /** Which heading ids get a real DOM element - defaults to all of them.
   *  Passing a subset simulates a heading whose slug doesn't resolve to any
   *  rendered anchor. */
  domHeadingIds?: string[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const idsWithElements = domHeadingIds ?? headings.map((h) => h.id);
  return (
    <div ref={ref}>
      {headings
        .filter((h) => idsWithElements.includes(h.id))
        .map((h) => (
          <div key={h.id} id={h.id} />
        ))}
      <TableOfContents headings={headings} targetRef={ref} />
    </div>
  );
}

function entry(id: string, isIntersecting: boolean, top: number): IntersectionObserverEntry {
  return {
    isIntersecting,
    target: { id } as Element,
    boundingClientRect: { top } as DOMRectReadOnly,
  } as IntersectionObserverEntry;
}

describe("TableOfContents", () => {
  const testHeadings: ExtractedHeading[] = [
    { id: "overview", text: "Overview", level: 2 },
    { id: "details", text: "Details", level: 3 },
    { id: "conclusion", text: "Conclusion", level: 2 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    lastObserverInstance = null;
    lastResizeObserverInstance = null;
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
    expect(lastObserverInstance).toBeNull();
  });

  it("does not set up observer when no headings", () => {
    render(<TableOfContents headings={[]} targetRef={createRef<HTMLElement>()} />);
    const nav = screen.queryByLabelText("On this page");
    expect(nav).not.toBeInTheDocument();
    expect(lastObserverInstance).toBeNull();
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

  it("observes every heading element once the target container is real and headings exist in the DOM", () => {
    render(<Harness headings={testHeadings} />);

    expect(lastObserverInstance).not.toBeNull();
    expect(lastObserverInstance!.observe).toHaveBeenCalledTimes(testHeadings.length);
  });

  it("marks the topmost visible heading as active on an intersection change", () => {
    render(<Harness headings={testHeadings} />);

    act(() => {
      lastObserverInstance!.callback(
        [entry("details", true, 200), entry("conclusion", true, 50)],
        lastObserverInstance as unknown as IntersectionObserver,
      );
    });

    expect(screen.getByRole("link", { name: "Conclusion" })).toHaveClass("font-medium", "text-foreground");
    expect(screen.getByRole("link", { name: "Details" })).not.toHaveClass("font-medium");
  });

  it("keeps a heading active once it scrolls out the top of the band", () => {
    render(<Harness headings={testHeadings} />);

    act(() => {
      lastObserverInstance!.callback([entry("overview", true, 10)], lastObserverInstance as unknown as IntersectionObserver);
    });
    expect(screen.getByRole("link", { name: "Overview" })).toHaveClass("font-medium");

    act(() => {
      // Negative top - scrolled above the container's top edge, so it's still
      // the section being read even though nothing is in the band.
      lastObserverInstance!.callback([entry("overview", false, -40)], lastObserverInstance as unknown as IntersectionObserver);
    });
    expect(screen.getByRole("link", { name: "Overview" })).toHaveClass("font-medium");
  });

  it("clears the highlight when no heading has been scrolled past yet", () => {
    render(<Harness headings={testHeadings} />);

    act(() => {
      lastObserverInstance!.callback([entry("overview", true, 10)], lastObserverInstance as unknown as IntersectionObserver);
    });
    expect(screen.getByRole("link", { name: "Overview" })).toHaveClass("font-medium");

    act(() => {
      // Left the band downward (positive top) - not reached yet, so nothing
      // above it is being read either.
      lastObserverInstance!.callback([entry("overview", false, 900)], lastObserverInstance as unknown as IntersectionObserver);
    });
    expect(screen.getByRole("link", { name: "Overview" })).not.toHaveClass("font-medium");
  });

  it("drops the pre-paint 'knowledge-check' highlight once the lesson body pushes it below the fold", () => {
    // The reported bug: YourTurnCard's static h2 is the only heading in the
    // DOM until the lesson chunk paints, so it intersects an otherwise empty
    // article and latches on at scrollTop 0.
    const headings: ExtractedHeading[] = [...testHeadings, { id: "knowledge-check", text: "Knowledge check", level: 2 }];
    render(<Harness headings={headings} />);

    act(() => {
      lastObserverInstance!.callback([entry("knowledge-check", true, 20)], lastObserverInstance as unknown as IntersectionObserver);
    });
    expect(screen.getByRole("link", { name: "Knowledge check" })).toHaveClass("font-medium");

    act(() => {
      // Body paints: knowledge-check is shoved far down, the real headings
      // report in below the band. Nothing is intersecting at scrollTop 0.
      lastObserverInstance!.callback(
        [
          entry("knowledge-check", false, 4000),
          entry("overview", false, 600),
          entry("details", false, 1200),
          entry("conclusion", false, 2400),
        ],
        lastObserverInstance as unknown as IntersectionObserver,
      );
    });

    expect(screen.getByRole("link", { name: "Knowledge check" })).not.toHaveClass("font-medium");
    expect(screen.getByRole("link", { name: "Overview" })).not.toHaveClass("font-medium");
  });

  it("skips heading ids that have no matching DOM element", () => {
    const headingsWithGhost: ExtractedHeading[] = [...testHeadings, { id: "ghost", text: "Ghost", level: 2 }];
    render(
      <Harness
        headings={headingsWithGhost}
        domHeadingIds={testHeadings.map((h) => h.id)}
      />,
    );

    // Only the 3 headings with a real DOM element get observed - "ghost" is filtered out.
    expect(lastObserverInstance!.observe).toHaveBeenCalledTimes(testHeadings.length);
  });

  it("still creates the observer (with no elements to watch yet) when none of the headings resolve to a DOM element at mount", () => {
    // Regression coverage for the "always highlights Knowledge check" bug:
    // the observer must exist and be ready to pick up headings that paint
    // later (lesson body is a dynamically-imported chunk rendering markdown
    // fetched client-side), not bail out permanently on an empty first pass.
    render(<Harness headings={testHeadings} domHeadingIds={[]} />);
    expect(lastObserverInstance).not.toBeNull();
    expect(lastObserverInstance!.observe).not.toHaveBeenCalled();
  });

  it("picks up headings that paint into the DOM after mount, without the headings prop changing", () => {
    const { container } = render(<Harness headings={testHeadings} domHeadingIds={[]} />);
    expect(lastObserverInstance!.observe).not.toHaveBeenCalled();

    // Simulate the lesson body's dynamically-imported content finishing its
    // async load and painting real heading elements into the article - the
    // same DOM change a growing MarkdownRenderer/MdxContent subtree causes.
    act(() => {
      for (const h of testHeadings) {
        const el = document.createElement("div");
        el.id = h.id;
        container.appendChild(el);
      }
      lastResizeObserverInstance!.callback([], lastResizeObserverInstance as unknown as ResizeObserver);
    });

    expect(lastObserverInstance!.observe).toHaveBeenCalledTimes(testHeadings.length);
  });
});
