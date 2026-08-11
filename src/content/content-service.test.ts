import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import {
  getChapter,
  getComponent,
  search,
  useChapterLesson,
  useComponentDocs,
} from "./content-service";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("getChapter", () => {
  it("finds a known chapter by id", () => {
    expect(getChapter("bb-3-4-load-balancer")?.mode).toBe("building-blocks");
  });

  it("returns undefined for an unknown id", () => {
    expect(getChapter("not-a-real-chapter")).toBeUndefined();
  });
});

describe("getComponent", () => {
  it("finds a known built-in component by id", () => {
    expect(getComponent("load-balancer")?.category).toBe("networking");
  });

  it("returns undefined for an unknown id", () => {
    expect(getComponent("not-a-real-component")).toBeUndefined();
  });
});

describe("useChapterLesson", () => {
  it("returns null for an undefined chapterId without fetching", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useChapterLesson(undefined));

    expect(result.current).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns null for an unknown chapterId without fetching", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useChapterLesson("not-a-real-chapter"));

    expect(result.current).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fetches a known chapter's lesson file", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("Lesson body"),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useChapterLesson("bb-3-4-load-balancer"));

    await waitFor(() => expect(result.current).toBe("Lesson body"));
    expect(fetchMock).toHaveBeenCalledWith("/content/chapters/bb-3-4-load-balancer.md");
  });
});

describe("useComponentDocs", () => {
  it("returns null for a component with no docsFile", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useComponentDocs("not-a-real-component"));

    expect(result.current).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fetches a known component's docsFile", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("Docs body"),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useComponentDocs("cron-job"));

    await waitFor(() => expect(result.current).toBe("Docs body"));
    expect(fetchMock).toHaveBeenCalledWith("/content/components/cron-job.md");
  });
});

describe("search", () => {
  it("returns an empty array for a blank query", () => {
    expect(search("   ")).toEqual([]);
  });

  it("matches components by label, case-insensitively", () => {
    const results = search("load balancer");
    expect(results).toContainEqual({ type: "component", id: "load-balancer", label: "Load Balancer" });
  });

  it("matches chapters by title", () => {
    const results = search("placeholder project");
    expect(results.some((r) => r.type === "chapter" && r.id === "rwe-dummy-1")).toBe(true);
  });

  it("returns no results for a query that matches nothing", () => {
    expect(search("xyzzy-not-a-real-term")).toEqual([]);
  });
});
