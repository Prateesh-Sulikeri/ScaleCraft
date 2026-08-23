import { describe, it, expect } from "vitest";
import { releaseNotes, type ReleaseIconName } from "./release-notes";

/**
 * The mechanical half of `.claude/docs/RELEASE_NOTES.md`, enforced. A release
 * entry that ignores the authoring contract fails here rather than shipping
 * off-pattern and quietly becoming the next author's precedent.
 *
 * Only checkable rules live here - lengths, counts, casing, ordering, house
 * style. Whether a change *deserves* a highlight is judgement, and stays in
 * the doc.
 */

const LIMITS = {
  title: 60,
  highlightTitle: 42,
  highlightBody: 180,
  qualityOfLife: 70,
  maxHighlights: 4,
  maxQualityOfLife: 4,
};

const ICON_NAMES: ReleaseIconName[] = [
  "ai",
  "auth",
  "canvas",
  "component",
  "content",
  "docs",
  "fix",
  "hint",
  "navigation",
  "performance",
  "polish",
  "progress",
  "quiz",
  "sync",
  "validation",
];

/** Every string a reader ever sees for one release. */
function copyOf(note: (typeof releaseNotes)[number]): string[] {
  return [
    note.title,
    ...note.highlights.flatMap((h) => [h.title, h.body]),
    ...(note.qualityOfLife ?? []),
  ];
}

describe("release notes authoring contract", () => {
  it("has at least one release", () => {
    expect(releaseNotes.length).toBeGreaterThan(0);
  });

  it("lists releases newest first, with no duplicate versions", () => {
    const versions = releaseNotes.map((note) => note.version);
    expect(new Set(versions).size).toBe(versions.length);

    const dates = releaseNotes.map((note) => Date.parse(`${note.date}T00:00:00Z`));
    for (let i = 1; i < dates.length; i += 1) {
      expect(dates[i - 1], `${releaseNotes[i - 1].version} is older than ${releaseNotes[i].version}`).toBeGreaterThanOrEqual(dates[i]);
    }
  });

  describe.each(releaseNotes)("$version", (note) => {
    it("uses the alpha version and ISO date format", () => {
      expect(note.version).toMatch(/^\d+\.\d+\.\d+-alpha$/);
      expect(note.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(`${note.date}T00:00:00Z`))).toBe(false);
    });

    it("has a sentence-case title that ends in a period", () => {
      expect(note.title.length).toBeGreaterThan(0);
      expect(note.title.length).toBeLessThanOrEqual(LIMITS.title);
      expect(note.title.endsWith(".")).toBe(true);
      expect(note.title.trim()).toBe(note.title);
    });

    it("carries one to four highlights", () => {
      expect(note.highlights.length).toBeGreaterThanOrEqual(1);
      expect(note.highlights.length).toBeLessThanOrEqual(LIMITS.maxHighlights);
    });

    it.each(note.highlights)("highlight $title is within its limits", (highlight) => {
      expect(highlight.title.length).toBeLessThanOrEqual(LIMITS.highlightTitle);
      expect(highlight.title.endsWith(".")).toBe(false);
      expect(highlight.title.trim()).toBe(highlight.title);

      expect(highlight.body.length).toBeGreaterThan(0);
      expect(highlight.body.length).toBeLessThanOrEqual(LIMITS.highlightBody);
      expect(highlight.body.endsWith(".")).toBe(true);
      expect(highlight.body.trim()).toBe(highlight.body);

      expect(ICON_NAMES).toContain(highlight.icon);
    });

    it("keeps quality-of-life lines short, and omits the field when empty", () => {
      if (note.qualityOfLife === undefined) return;
      expect(note.qualityOfLife.length).toBeGreaterThanOrEqual(1);
      expect(note.qualityOfLife.length).toBeLessThanOrEqual(LIMITS.maxQualityOfLife);
      for (const item of note.qualityOfLife) {
        expect(item.length).toBeLessThanOrEqual(LIMITS.qualityOfLife);
        expect(item.endsWith("."), `"${item}" should not end in a period`).toBe(false);
        expect(item.trim()).toBe(item);
      }
    });

    it("says each change once", () => {
      const titles = note.highlights.map((h) => h.title.toLowerCase());
      expect(new Set(titles).size).toBe(titles.length);

      const qol = (note.qualityOfLife ?? []).map((item) => item.toLowerCase());
      expect(new Set(qol).size).toBe(qol.length);
      for (const item of qol) {
        expect(titles, `"${item}" repeats a highlight`).not.toContain(item);
      }
    });

    /* House style, per CLAUDE.md: hyphens, never em dashes. Also catches the
       en dash, which reads as an em dash at these sizes. */
    it("uses hyphens, not dashes", () => {
      for (const line of copyOf(note)) {
        expect(line, `"${line}" contains a dash character`).not.toMatch(/[–—]/);
      }
    });

    it("keeps the announcement register out of the copy", () => {
      for (const line of copyOf(note)) {
        expect(line, `"${line}" uses an exclamation mark`).not.toContain("!");
      }
    });
  });
});
