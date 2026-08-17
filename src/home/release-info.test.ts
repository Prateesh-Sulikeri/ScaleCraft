import { describe, it, expect } from "vitest";
import { releaseNotes } from "@/content/release-notes";
import { isRecentRelease, LATEST_RELEASE, RELEASE_NEW_FOR_DAYS } from "./release-info";

const DAY = 86_400_000;

describe("LATEST_RELEASE", () => {
  it("is the head of the changelog", () => {
    expect(LATEST_RELEASE).toBe(releaseNotes[0]);
  });
});

describe("isRecentRelease", () => {
  const released = "2026-08-17";
  const releasedAt = Date.parse(`${released}T00:00:00Z`);

  it("is new on release day", () => {
    expect(isRecentRelease(released, releasedAt)).toBe(true);
  });

  it("stays new to the edge of the window", () => {
    expect(isRecentRelease(released, releasedAt + RELEASE_NEW_FOR_DAYS * DAY)).toBe(true);
  });

  it("stops being new past the window", () => {
    expect(isRecentRelease(released, releasedAt + (RELEASE_NEW_FOR_DAYS + 1) * DAY)).toBe(false);
  });

  it("is not new before it ships, so a clock skew cannot mark it early", () => {
    expect(isRecentRelease(released, releasedAt - DAY)).toBe(false);
  });

  it("treats an unparseable date as not new rather than throwing", () => {
    expect(isRecentRelease("not-a-date", releasedAt)).toBe(false);
  });
});
