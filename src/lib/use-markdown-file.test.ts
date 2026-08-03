import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useMarkdownFile } from "./use-markdown-file";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("useMarkdownFile", () => {
  it("returns null for an undefined path without fetching", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useMarkdownFile(undefined));

    expect(result.current).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fetches and returns a file's content", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("# Body"),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useMarkdownFile("/content/chapters/unique-a.md"));

    await waitFor(() => expect(result.current).toBe("# Body"));
    expect(fetchMock).toHaveBeenCalledWith("/content/chapters/unique-a.md");
  });

  it("returns null on a 404", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 404 });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useMarkdownFile("/content/chapters/unique-b.md"));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(result.current).toBeNull();
  });

  it("skips the network on a second call for the same path", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("cached content"),
    });
    vi.stubGlobal("fetch", fetchMock);

    const first = renderHook(() => useMarkdownFile("/content/chapters/unique-c.md"));
    await waitFor(() => expect(first.result.current).toBe("cached content"));

    const second = renderHook(() => useMarkdownFile("/content/chapters/unique-c.md"));
    expect(second.result.current).toBe("cached content");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
