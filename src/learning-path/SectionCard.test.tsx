import "fake-indexeddb/auto";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SectionCard } from "./SectionCard";
import { useCurriculumProgressStore } from "@/curriculum/progress-store";
import { db } from "@/persistence/db";
import type { CourseId, CurriculumSection } from "@/curriculum/types";
import type { ProgressInputs } from "@/curriculum/progress";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/building-blocks",
}));

const section: CurriculumSection = {
  id: "bb-unit-1",
  label: "Unit 1",
  title: "Scaling Compute",
  summary: "Test summary for scaling compute.",
  chapters: [
    {
      slug: "1-1-vertical-vs-horizontal-scaling",
      number: "1.1",
      title: "Vertical vs. Horizontal Scaling",
      kind: "chapter",
      chapterDefinitionId: null,
      estimatedMinutes: 20,
      difficulty: "foundational",
      prerequisiteSlugs: [],
      domain: null,
    },
    {
      slug: "1-2-load-balancing",
      number: "1.2",
      title: "Load Balancing",
      kind: "chapter",
      chapterDefinitionId: "bb-dummy-1",
      estimatedMinutes: 35,
      difficulty: "foundational",
      prerequisiteSlugs: ["1-1-vertical-vs-horizontal-scaling"],
      domain: null,
    },
  ],
};

function inputs(overrides: Partial<ProgressInputs> = {}): ProgressInputs {
  return {
    validationPassedDefinitionIds: new Set(),
    rowsBySlug: new Map(),
    examAttemptsByDefinition: new Map(),
    ...overrides,
  };
}

beforeEach(async () => {
  useCurriculumProgressStore.setState({
    hydrated: false,
    hydrating: false,
    validationPassedDefinitionIds: new Set(),
    rowsBySlug: new Map(),
    examAttemptsByDefinition: new Map(),
  });
  await db.curriculumProgress.clear();
});

/** SectionCard is controlled (expanded state lives in LearningPath) - this
 *  wrapper owns that state locally so tests can exercise it the same way a
 *  real parent would. */
function ControlledSectionCard({
  section: sectionProp,
  courseId,
  inputs: inputsProp,
  defaultExpanded = true,
  upNextSlug = null,
}: {
  section: CurriculumSection;
  courseId: CourseId;
  inputs: ProgressInputs;
  defaultExpanded?: boolean;
  upNextSlug?: string | null;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  return (
    <SectionCard
      section={sectionProp}
      courseId={courseId}
      inputs={inputsProp}
      expanded={expanded}
      onToggleExpanded={() => setExpanded((e) => !e)}
      visibleChapters={sectionProp.chapters}
      upNextSlug={upNextSlug}
    />
  );
}

describe("SectionCard", () => {
  it("defaults to expanded, showing the full title/summary and every chapter row", () => {
    render(<ControlledSectionCard section={section} courseId="building-blocks" inputs={inputs()} />);
    expect(screen.getByRole("button", { name: /unit 1/i })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Scaling Compute")).toBeInTheDocument();
    expect(screen.getByText("Test summary for scaling compute.")).toBeInTheDocument();
    expect(screen.getByText("Vertical vs. Horizontal Scaling")).toBeInTheDocument();
    expect(screen.getByText("Load Balancing")).toBeInTheDocument();
  });

  it("collapses on click, hiding the summary and chapter rows but keeping the header's label, title and count", () => {
    render(<ControlledSectionCard section={section} courseId="building-blocks" inputs={inputs()} />);
    fireEvent.click(screen.getByRole("button", { name: /unit 1/i }));

    expect(screen.getByRole("button", { name: /unit 1/i })).toHaveAttribute("aria-expanded", "false");
    // The title moved into the header row in v7.0 - a collapsed section has to
    // say what it is, or the collapsed list is a column of bare part numbers.
    expect(screen.getByText("Scaling Compute")).toBeInTheDocument();
    expect(screen.getByText("0 / 2")).toBeInTheDocument();
    expect(screen.queryByText("Test summary for scaling compute.")).not.toBeInTheDocument();
    expect(screen.queryByText("Load Balancing")).not.toBeInTheDocument();
  });

  it("marks the up-next chapter's row, and only that row", () => {
    const { container } = render(
      <ControlledSectionCard
        section={section}
        courseId="building-blocks"
        inputs={inputs()}
        upNextSlug="1-2-load-balancing"
      />,
    );
    const marked = container.querySelectorAll('[data-up-next="true"]');
    expect(marked).toHaveLength(1);
    expect(marked[0]).toHaveTextContent("Load Balancing");
  });

  it("shows the section's own progress count, derived from its chapters", () => {
    const validationPassedDefinitionIds = new Set(["bb-dummy-1"]);
    render(
      <ControlledSectionCard
        section={section}
        courseId="building-blocks"
        inputs={inputs({ validationPassedDefinitionIds })}
      />,
    );
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
  });
});
