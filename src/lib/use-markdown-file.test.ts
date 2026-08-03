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

  it("skips the network on a second call at the same version", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("v1 content"),
    });
    vi.stubGlobal("fetch", fetchMock);

    const first = renderHook(() => useMarkdownFile("/content/chapters/unique-d.md", 1));
    await waitFor(() => expect(first.result.current).toBe("v1 content"));

    const second = renderHook(() => useMarkdownFile("/content/chapters/unique-d.md", 1));
    expect(second.result.current).toBe("v1 content");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("refetches when the version bumps, replacing the stale cached copy", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, text: () => Promise.resolve("v1 content") })
      .mockResolvedValueOnce({ ok: true, text: () => Promise.resolve("v2 content") })
      .mockResolvedValueOnce({ ok: true, text: () => Promise.resolve("v1 content") });
    vi.stubGlobal("fetch", fetchMock);

    const v1 = renderHook(() => useMarkdownFile("/content/chapters/unique-e.md", 1));
    await waitFor(() => expect(v1.result.current).toBe("v1 content"));

    const v2 = renderHook(() => useMarkdownFile("/content/chapters/unique-e.md", 2));
    await waitFor(() => expect(v2.result.current).toBe("v2 content"));
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // A third render back at the original path+version now refetches too -
    // the cache entry was overwritten by the v2 fetch above, not merged.
    const backToV1 = renderHook(() => useMarkdownFile("/content/chapters/unique-e.md", 1));
    await waitFor(() => expect(backToV1.result.current).toBe("v1 content"));
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
