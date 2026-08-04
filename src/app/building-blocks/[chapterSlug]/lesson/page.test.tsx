import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "./page";

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

vi.mock("@/chapters/ChapterReader", () => ({
  ChapterReader: ({ mode, chapterSlug }: { mode: string; chapterSlug: string }) => (
    <div data-testid="chapter-reader">
      {mode}:{chapterSlug}
    </div>
  ),
}));

vi.mock("@/curriculum", () => ({
  findEntry: (courseId: string, slug: string) => {
    if (courseId !== "building-blocks") return undefined;
    if (slug === "known-slug") return { slug, chapterDefinitionId: "bb-dummy-1" };
    if (slug === "unauthored-slug") return { slug, chapterDefinitionId: null };
    if (slug === "orphaned-definition-slug") return { slug, chapterDefinitionId: "no-such-definition" };
    return undefined;
  },
}));

vi.mock("@/content/chapters", () => ({
  chapterRegistry: [{ id: "bb-dummy-1" }],
}));

describe("BuildingBlocks [chapterSlug]/lesson page", () => {
  it("renders ChapterReader for a known, authored slug", async () => {
    const element = await Page({ params: Promise.resolve({ chapterSlug: "known-slug" }) });
    render(element);
    expect(screen.getByTestId("chapter-reader")).toHaveTextContent("building-blocks:known-slug");
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

  it("calls notFound() when the curriculum entry's chapterDefinitionId has no registry match", async () => {
    await expect(
      Page({ params: Promise.resolve({ chapterSlug: "orphaned-definition-slug" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
