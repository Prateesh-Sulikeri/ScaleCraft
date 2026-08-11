import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useChapterLessonMdx } from "./use-chapter-lesson-mdx";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("useChapterLessonMdx", () => {
  it("returns null for an undefined chapterId without fetching", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useChapterLessonMdx(undefined));

    expect(result.current).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fetches and returns the compiled lesson", async () => {
    const data = { raw: "body", beforeCompiled: "compiled-a", nextCompiled: null };
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(data) });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useChapterLessonMdx("unique-mdx-a"));

    await waitFor(() => expect(result.current).toEqual(data));
    expect(fetchMock).toHaveBeenCalledWith("/api/lessons/unique-mdx-a");
  });

  it("returns null on a 404", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 404 });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useChapterLessonMdx("unique-mdx-b"));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(result.current).toBeNull();
  });

  it("skips the network on a second call at the same version", async () => {
    const data = { raw: "body", beforeCompiled: "compiled-c", nextCompiled: null };
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(data) });
    vi.stubGlobal("fetch", fetchMock);

    const first = renderHook(() => useChapterLessonMdx("unique-mdx-c", 1));
    await waitFor(() => expect(first.result.current).toEqual(data));

    const second = renderHook(() => useChapterLessonMdx("unique-mdx-c", 1));
    expect(second.result.current).toEqual(data);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("refetches when the version changes", async () => {
    const dataV1 = { raw: "v1", beforeCompiled: "compiled-v1", nextCompiled: null };
    const dataV2 = { raw: "v2", beforeCompiled: "compiled-v2", nextCompiled: null };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(dataV1) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(dataV2) });
    vi.stubGlobal("fetch", fetchMock);

    const first = renderHook(() => useChapterLessonMdx("unique-mdx-d", 1));
    await waitFor(() => expect(first.result.current).toEqual(dataV1));

    const second = renderHook(() => useChapterLessonMdx("unique-mdx-d", 2));
    await waitFor(() => expect(second.result.current).toEqual(dataV2));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
