import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BugList } from "./BugList";
import type { BugSummary } from "./types";

const bug = (over: Partial<BugSummary> = {}): BugSummary => ({
  id: "bug-1",
  category: "ui",
  title: "Sidebar overlaps the diagram",
  priority: "medium",
  status: "open",
  createdAt: Date.parse("2026-08-01T10:00:00Z"),
  unread: false,
  ...over,
});

/** The identifier dot carries no text by design, so the assertions go through
 *  the class that paints it - the requirement here is literally the color. */
function dotClasses(row: HTMLElement): string {
  return row.querySelector("span.rounded-full")?.className ?? "";
}

describe("BugList", () => {
  it("marks every report still in flight with the same yellow identifier, whatever its exact status", () => {
    render(
      <BugList
        bugs={[
          bug({ id: "a", title: "Still open", status: "open" }),
          bug({ id: "b", title: "Being worked on", status: "in-progress" }),
          bug({ id: "c", title: "Now resolved", status: "resolved" }),
        ]}
        onSelect={vi.fn()}
        onReportNew={vi.fn()}
      />,
    );

    for (const title of ["Still open", "Being worked on", "Now resolved"]) {
      expect(dotClasses(screen.getByRole("button", { name: new RegExp(title) }))).toContain("bg-state-warning");
    }
  });

  it("grays the identifier once a report is closed", () => {
    render(<BugList bugs={[bug({ status: "closed" })]} onSelect={vi.fn()} onReportNew={vi.fn()} />);

    const classes = dotClasses(screen.getByRole("button", { name: /Sidebar overlaps/ }));
    expect(classes).toContain("bg-foreground/25");
    expect(classes).not.toContain("bg-state-warning");
  });

  it("flags only the rows whose status moved since the reporter last looked", () => {
    render(
      <BugList
        bugs={[bug({ id: "a", title: "Moved", unread: true }), bug({ id: "b", title: "Unchanged" })]}
        onSelect={vi.fn()}
        onReportNew={vi.fn()}
      />,
    );

    // One marker, and it is on the row that changed.
    const markers = screen.getAllByText("Updated since you last opened it");
    expect(markers).toHaveLength(1);
    expect(screen.getByRole("button", { name: /Moved/ })).toContainElement(markers[0]);
  });
});
