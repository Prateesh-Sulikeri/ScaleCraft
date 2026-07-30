import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LearningPath } from "./LearningPath";
import { useCurriculumProgressStore } from "@/curriculum/progress-store";
import { db } from "@/persistence/db";

beforeEach(async () => {
  useCurriculumProgressStore.setState({
    hydrated: false,
    hydrating: false,
    validationPassedDefinitionIds: new Set(),
    rowsBySlug: new Map(),
  });
  await db.curriculumProgress.clear();
  await db.chapterProgress.clear();
});

describe("LearningPath", () => {
  it("renders Building Blocks' 7 sections and all 26 chapter rows", () => {
    render(<LearningPath courseId="building-blocks" />);
    expect(screen.getByRole("heading", { level: 1, name: "Building Blocks" })).toBeInTheDocument();

    const sectionToggles = screen.getAllByRole("button", { name: /^unit /i });
    expect(sectionToggles).toHaveLength(7);

    // Every section defaults expanded (D5) — every chapter's status icon is
    // present, one per curriculum entry (26 for BB).
    expect(screen.getAllByRole("img", { name: /completed|in progress|not started/i })).toHaveLength(26);
  });

  it("renders Real World Extraction's 3 sections and all 5 chapter rows", () => {
    render(<LearningPath courseId="real-world-extraction" />);
    expect(screen.getByRole("heading", { level: 1, name: "Real World Extraction" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^tier /i })).toHaveLength(3);
    expect(screen.getAllByRole("img", { name: /completed|in progress|not started/i })).toHaveLength(5);
  });

  it("the authored 1.2 Load Balancing row is a real link to its route; an unauthored row is not", () => {
    render(<LearningPath courseId="building-blocks" />);
    expect(screen.getByRole("link", { name: /load balancing/i })).toHaveAttribute(
      "href",
      "/building-blocks/1-2-load-balancing",
    );
    expect(screen.getAllByText("Not yet authored").length).toBeGreaterThan(0);
  });

  it("includes a working Download Curriculum link", () => {
    render(<LearningPath courseId="building-blocks" />);
    expect(screen.getByRole("link", { name: /download curriculum/i })).toHaveAttribute(
      "href",
      "/docs/The_Crafters_Guide_to_System_Design.pdf",
    );
  });
});
