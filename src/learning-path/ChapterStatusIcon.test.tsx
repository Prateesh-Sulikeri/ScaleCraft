import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChapterStatusIcon } from "./ChapterStatusIcon";

describe("ChapterStatusIcon", () => {
  it("labels COMPLETED", () => {
    render(<ChapterStatusIcon status="COMPLETED" />);
    expect(screen.getByRole("img", { name: "Completed" })).toBeInTheDocument();
  });

  it("labels IN_PROGRESS", () => {
    render(<ChapterStatusIcon status="IN_PROGRESS" />);
    expect(screen.getByRole("img", { name: "In progress" })).toBeInTheDocument();
  });

  it("labels NOT_STARTED", () => {
    render(<ChapterStatusIcon status="NOT_STARTED" />);
    expect(screen.getByRole("img", { name: "Not started" })).toBeInTheDocument();
  });
});
