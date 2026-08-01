import { describe, it, expect, beforeEach, vi } from "vitest";
import { render } from "@testing-library/react";
import { createRef } from "react";

const { ReadingProgress } = await import("./ReadingProgress");

describe("ReadingProgress", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders progress bar element", () => {
    const ref = createRef<HTMLElement>();
    const { container } = render(<ReadingProgress targetRef={ref} />);
    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).toBeInTheDocument();
  });

  it("has correct aria attributes", () => {
    const ref = createRef<HTMLElement>();
    const { container } = render(<ReadingProgress targetRef={ref} />);
    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).toHaveAttribute("aria-label", "Reading progress");
    expect(progressBar).toHaveAttribute("aria-valuemin", "0");
    expect(progressBar).toHaveAttribute("aria-valuemax", "100");
  });

  it("starts at 0% progress", () => {
    const ref = createRef<HTMLElement>();
    const { container } = render(<ReadingProgress targetRef={ref} />);
    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).toHaveAttribute("aria-valuenow", "0");
  });

  it("sets initial progress based on scroll position", () => {
    const mockDiv = document.createElement("div");
    Object.defineProperty(mockDiv, "scrollHeight", { value: 1000 });
    Object.defineProperty(mockDiv, "clientHeight", { value: 100 });
    Object.defineProperty(mockDiv, "scrollTop", { value: 500 });

    const ref = createRef<HTMLElement>();
    Object.defineProperty(ref, "current", { value: mockDiv, writable: true });

    const { container } = render(<ReadingProgress targetRef={ref} />);
    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).toHaveAttribute("aria-valuenow");
  });

  it("updates progress on scroll event", () => {
    const mockDiv = document.createElement("div");
    let scrollTop = 0;
    const listeners: { [key: string]: EventListener } = {};

    Object.defineProperty(mockDiv, "scrollHeight", { value: 1000 });
    Object.defineProperty(mockDiv, "clientHeight", { value: 100 });
    Object.defineProperty(mockDiv, "scrollTop", {
      get: () => scrollTop,
      set: (v: number) => {
        scrollTop = v;
      },
    });

    mockDiv.addEventListener = vi.fn((event: string, listener: EventListener) => {
      listeners[event] = listener;
    });
    mockDiv.removeEventListener = vi.fn((event: string) => {
      delete listeners[event];
    });

    const ref = createRef<HTMLElement>();
    Object.defineProperty(ref, "current", { value: mockDiv, writable: true });

    const { rerender, container } = render(<ReadingProgress targetRef={ref} />);

    scrollTop = 500;
    listeners.scroll?.(new Event("scroll"));
    rerender(<ReadingProgress targetRef={ref} />);

    const progressBar = container.querySelector('[role="progressbar"]');
    const progress = progressBar?.getAttribute("aria-valuenow");
    expect(progress).not.toBe("0");
  });

  it("handles element with no scroll (scrollable = 0)", () => {
    const mockDiv = document.createElement("div");
    Object.defineProperty(mockDiv, "scrollHeight", { value: 100 });
    Object.defineProperty(mockDiv, "clientHeight", { value: 100 });
    Object.defineProperty(mockDiv, "scrollTop", { value: 0 });

    const ref = createRef<HTMLElement>();
    Object.defineProperty(ref, "current", { value: mockDiv, writable: true });

    const { container } = render(<ReadingProgress targetRef={ref} />);
    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).toHaveAttribute("aria-valuenow", "100");
  });

  it("caps progress at 100%", () => {
    const mockDiv = document.createElement("div");
    Object.defineProperty(mockDiv, "scrollHeight", { value: 1000 });
    Object.defineProperty(mockDiv, "clientHeight", { value: 100 });
    Object.defineProperty(mockDiv, "scrollTop", { value: 950 });

    const ref = createRef<HTMLElement>();
    Object.defineProperty(ref, "current", { value: mockDiv, writable: true });

    const { container } = render(<ReadingProgress targetRef={ref} />);
    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).toHaveAttribute("aria-valuenow", "100");
  });

  it("cleans up scroll listener on unmount", () => {
    const mockDiv = document.createElement("div");
    const listeners: { [key: string]: EventListener } = {};

    mockDiv.addEventListener = vi.fn((event: string, listener: EventListener) => {
      listeners[event] = listener;
    });
    mockDiv.removeEventListener = vi.fn((event: string) => {
      delete listeners[event];
    });

    Object.defineProperty(mockDiv, "scrollHeight", { value: 1000 });
    Object.defineProperty(mockDiv, "clientHeight", { value: 100 });
    Object.defineProperty(mockDiv, "scrollTop", { value: 0 });

    const ref = createRef<HTMLElement>();
    Object.defineProperty(ref, "current", { value: mockDiv, writable: true });

    const { unmount } = render(<ReadingProgress targetRef={ref} />);

    expect(mockDiv.addEventListener).toHaveBeenCalledWith("scroll", expect.any(Function));

    unmount();

    expect(mockDiv.removeEventListener).toHaveBeenCalledWith("scroll", expect.any(Function));
  });

  it("handles null targetRef gracefully", () => {
    const ref = createRef<HTMLElement>();
    const { container } = render(<ReadingProgress targetRef={ref} />);
    expect(container.querySelector('[role="progressbar"]')).toBeInTheDocument();
  });

  it("has correct sticky positioning", () => {
    const ref = createRef<HTMLElement>();
    const { container } = render(<ReadingProgress targetRef={ref} />);
    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).toHaveClass("sticky", "top-0", "z-10");
  });
});
