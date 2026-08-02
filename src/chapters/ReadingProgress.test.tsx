import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import { render, act } from "@testing-library/react";
import { createRef } from "react";

const { ReadingProgress } = await import("./ReadingProgress");

/** jsdom has no ResizeObserver — this stub tracks every observed element so
 *  a test can fire a resize callback manually to simulate async content
 *  (Mermaid, images) growing after the last scroll event. */
let observedElements: Element[] = [];
let resizeCallbacks: ResizeObserverCallback[] = [];
function triggerResize() {
  for (const cb of resizeCallbacks) {
    act(() => cb([] as ResizeObserverEntry[], {} as ResizeObserver));
  }
}

beforeAll(() => {
  class ResizeObserverStub {
    constructor(callback: ResizeObserverCallback) {
      resizeCallbacks.push(callback);
    }
    observe(el: Element) {
      observedElements.push(el);
    }
    unobserve() {}
    disconnect() {}
  }
  global.ResizeObserver = ResizeObserverStub;
});

describe("ReadingProgress", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    observedElements = [];
    resizeCallbacks = [];
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

  it("recomputes progress when the content resizes without a new scroll event (Mermaid/images loading async)", () => {
    const content = document.createElement("div");
    const mockDiv = document.createElement("div");
    let scrollHeight = 1000;
    let scrollTop = 0;
    const listeners: { [key: string]: EventListener } = {};

    Object.defineProperty(mockDiv, "scrollHeight", { get: () => scrollHeight });
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
    mockDiv.removeEventListener = vi.fn();
    // ReadingProgress's own bar renders as the first child in real usage
    // (ChapterReader.tsx); this content node is the sibling it should
    // actually observe.
    mockDiv.appendChild(document.createElement("div"));
    mockDiv.appendChild(content);

    const ref = createRef<HTMLElement>();
    Object.defineProperty(ref, "current", { value: mockDiv, writable: true });

    const { container } = render(<ReadingProgress targetRef={ref} />);
    const progressBar = container.querySelector('[role="progressbar"]');

    scrollTop = 900;
    act(() => listeners.scroll(new Event("scroll")));
    expect(progressBar).toHaveAttribute("aria-valuenow", "100");

    // Content grows 500px with no new scroll event - the bug this test
    // guards against is the bar staying stuck at the old (now wrong) 100%.
    scrollHeight = 1500;
    triggerResize();

    expect(progressBar).toHaveAttribute("aria-valuenow", String(Math.round((900 / 1400) * 100)));
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
