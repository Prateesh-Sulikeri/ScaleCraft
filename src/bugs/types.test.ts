import { describe, it, expect } from "vitest";
import {
  asCategory,
  asPriority,
  asStatus,
  BUG_CATEGORIES,
  BUG_PRIORITIES,
  createBugSchema,
  DESCRIPTION_MAX,
  MAX_IMAGE_BYTES,
  TITLE_MAX,
} from "./types";

const valid = {
  category: "ui" as const,
  title: "Diagram renders behind the sidebar",
  description: "Opened chapter 3.4, the walkthrough diagram sits under the left rail.",
  priority: "medium" as const,
};

describe("createBugSchema", () => {
  it("accepts a minimal report with no image", () => {
    expect(createBugSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a blank title or description, including whitespace-only", () => {
    expect(createBugSchema.safeParse({ ...valid, title: "   " }).success).toBe(false);
    expect(createBugSchema.safeParse({ ...valid, description: "\n  " }).success).toBe(false);
  });

  it("trims before storing, so a padded title is not persisted padded", () => {
    const parsed = createBugSchema.parse({ ...valid, title: "  spacing bug  " });
    expect(parsed.title).toBe("spacing bug");
  });

  it("rejects a category or priority outside the known set", () => {
    expect(createBugSchema.safeParse({ ...valid, category: "urgent-everything" }).success).toBe(false);
    expect(createBugSchema.safeParse({ ...valid, priority: "critical" }).success).toBe(false);
  });

  it("has no status field - a reporter cannot declare their own bug resolved", () => {
    const parsed = createBugSchema.parse({ ...valid, status: "resolved" });
    expect(parsed).not.toHaveProperty("status");
  });

  it("ignores a userId in the body - ownership comes from the session only", () => {
    const parsed = createBugSchema.parse({ ...valid, userId: "user_someone_else" });
    expect(parsed).not.toHaveProperty("userId");
  });

  it("caps title and description length", () => {
    expect(createBugSchema.safeParse({ ...valid, title: "x".repeat(TITLE_MAX + 1) }).success).toBe(false);
    expect(
      createBugSchema.safeParse({ ...valid, description: "x".repeat(DESCRIPTION_MAX + 1) }).success,
    ).toBe(false);
  });

  it("accepts an image only when it declares an image mime type", () => {
    const image = { mimeType: "image/png", dataBase64: "aGk=" };
    expect(createBugSchema.safeParse({ ...valid, image }).success).toBe(true);
    expect(
      createBugSchema.safeParse({ ...valid, image: { ...image, mimeType: "application/pdf" } }).success,
    ).toBe(false);
  });

  it("rejects a base64 payload past the 2 MB budget before it is ever decoded", () => {
    const oversized = "A".repeat(Math.ceil((MAX_IMAGE_BYTES * 4) / 3) + 2048);
    expect(
      createBugSchema.safeParse({ ...valid, image: { mimeType: "image/png", dataBase64: oversized } }).success,
    ).toBe(false);
  });
});

describe("column narrowing", () => {
  it("round-trips every known value", () => {
    for (const value of BUG_CATEGORIES) expect(asCategory(value)).toBe(value);
    for (const value of BUG_PRIORITIES) expect(asPriority(value)).toBe(value);
  });

  it("falls back rather than throwing on a value this build does not know", () => {
    // A row written by a later build must still render, not crash the list.
    expect(asCategory("telemetry")).toBe("other");
    expect(asPriority("blocker")).toBe("medium");
    expect(asStatus("wontfix")).toBe("open");
  });
});
