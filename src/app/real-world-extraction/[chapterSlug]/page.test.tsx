import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "./page";

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

vi.mock("@/chapters/ChapterWorkspace", () => ({
  ChapterWorkspace: ({ mode, chapterSlug }: { mode: string; chapterSlug: string }) => (
    <div data-testid="chapter-workspace">
      {mode}:{chapterSlug}
    </div>
  ),
}));

vi.mock("@/curriculum", () => ({
  findEntry: (courseId: string, slug: string) => {
    if (courseId !== "real-world-extraction") return undefined;
    if (slug === "known-slug") return { slug, chapterDefinitionId: "rwe-dummy-1" };
    if (slug === "unauthored-slug") return { slug, chapterDefinitionId: null };
    return undefined;
  },
}));

describe("RealWorldExtraction [chapterSlug] page", () => {
  it("renders ChapterWorkspace for a known, authored slug", async () => {
    const element = await Page({ params: Promise.resolve({ chapterSlug: "known-slug" }) });
    render(element);
    expect(screen.getByTestId("chapter-workspace")).toHaveTextContent("real-world-extraction:known-slug");
  });

  it("calls notFound() for an unknown slug", async () => {
    await expect(Page({ params: Promise.resolve({ chapterSlug: "unknown-slug" }) })).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
  });

  it("calls notFound() for a curriculum entry with no authored chapter yet", async () => {
    await expect(Page({ params: Promise.resolve({ chapterSlug: "unauthored-slug" }) })).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
  });
});
