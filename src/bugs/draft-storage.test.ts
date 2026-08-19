import { describe, it, expect, beforeEach } from "vitest";
import { clearBugDraft, isDraftEmpty, loadBugDraft, saveBugDraft } from "./draft-storage";

const draft = {
  category: "quiz" as const,
  title: "Exam score is wrong",
  description: "Scored 9/10, shown as 8/10.",
  priority: "high" as const,
};

beforeEach(() => {
  localStorage.clear();
});

describe("bug draft storage", () => {
  it("round-trips a half-written report", () => {
    saveBugDraft(draft);
    expect(loadBugDraft()).toEqual(draft);
  });

  it("treats a report with no text as nothing to restore, whatever the selects say", () => {
    // Category and priority always hold a value, so they cannot be what makes
    // a draft worth keeping - otherwise every opened-and-closed form leaves
    // one behind.
    saveBugDraft({ category: "quiz", title: "  ", description: "", priority: "high" });
    expect(loadBugDraft()).toBeNull();
    expect(isDraftEmpty({ ...draft, title: "", description: "" })).toBe(true);
  });

  it("clears on request", () => {
    saveBugDraft(draft);
    clearBugDraft();
    expect(loadBugDraft()).toBeNull();
  });

  it("falls back to the default select values rather than restoring an unselectable one", () => {
    // A draft written by a build whose category list has since changed must
    // not put a value in the <select> that has no <option>.
    localStorage.setItem(
      "sc-bug-draft",
      JSON.stringify({ category: "telepathy", title: "T", description: "D", priority: "urgent" }),
    );

    expect(loadBugDraft()).toEqual({ category: "ui", title: "T", description: "D", priority: "medium" });
  });

  it("survives a corrupted entry instead of throwing into the form", () => {
    localStorage.setItem("sc-bug-draft", "{not json");
    expect(loadBugDraft()).toBeNull();
  });
});
