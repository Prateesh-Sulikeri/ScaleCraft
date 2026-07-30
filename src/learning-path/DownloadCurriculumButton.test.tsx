import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DownloadCurriculumButton } from "./DownloadCurriculumButton";

describe("DownloadCurriculumButton", () => {
  it("links to the curriculum PDF with a download attribute", () => {
    render(<DownloadCurriculumButton />);
    const link = screen.getByRole("link", { name: /download curriculum/i });
    expect(link).toHaveAttribute("href", "/docs/The_Crafters_Guide_to_System_Design.pdf");
    expect(link).toHaveAttribute("download");
  });
});
