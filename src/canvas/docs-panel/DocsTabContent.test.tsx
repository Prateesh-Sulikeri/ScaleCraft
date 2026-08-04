import { describe, it, expect, vi, afterEach } from "vitest";
import { screen, waitFor, fireEvent, act } from "@testing-library/react";
import { renderWithCanvasStore as render } from "../canvas-test-utils";
import { DocsTabContent } from "./DocsTabContent";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("DocsTabContent", () => {
  it("shows a not-available message for an unknown componentId", () => {
    render(<DocsTabContent componentId="not-a-real-component" />);
    expect(screen.getByText(/documentation is no longer available/i)).toBeInTheDocument();
  });

  it("falls back to the component's inline `docs` string when it has no docsFile", () => {
    render(<DocsTabContent componentId="client" />);
    expect(screen.getByText(/end user's device or application/i)).toBeInTheDocument();
  });

  it("fetches and renders a component's docsFile content", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("# Load balancer doc body"),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<DocsTabContent componentId="load-balancer" />);

    await waitFor(() => expect(screen.getByText("Load balancer doc body")).toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledWith("/content/components/load-balancer.md");
  });

  it("falls back to inline docs when the docsFile fetch 404s", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 404 });
    vi.stubGlobal("fetch", fetchMock);

    render(<DocsTabContent componentId="cache" />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(await screen.findByText(/in-memory store/i)).toBeInTheDocument();
  });

  it("rAF-throttles scroll writes back to the store (a second scroll before the frame fires is a no-op)", async () => {
    const { container, api } = render(<DocsTabContent componentId="client" />);
    act(() => api.getState().openDocTab("client"));
    const pane = container.querySelector("div")!;
    Object.defineProperty(pane, "scrollTop", { value: 120, configurable: true });

    fireEvent.scroll(pane);
    // Fired again immediately, still within the same pending rAF - the
    // in-flight guard (rafRef.current !== null) should make this a no-op
    // rather than scheduling a second frame.
    fireEvent.scroll(pane);

    await waitFor(() =>
      expect(api.getState().docsPanel.tabs.find((t) => t.componentId === "client")?.scrollTop).toBe(120),
    );
  });
});
