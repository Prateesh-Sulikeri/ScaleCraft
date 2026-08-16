import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { chapterRegistry } from "./index";
import { getComponent } from "@/content/components/registry";
import { evaluateChapter } from "@/validation-engine/chapter-outcome";
import type { ArchitectureGraph } from "@/lib/graph";
import type { ChapterDefinition } from "./types";

/**
 * Guards the authoring contract in .claude/docs/CURRICULUM.md and
 * QUIZ_FRAMEWORK.md for chapters that claim to be real content (everything
 * without `placeholder: true`). The dummy fixtures are deliberately exempt -
 * they are shell-exercising scaffolding, not curriculum, and holding them to
 * the authoring bar would just mean editing throwaway content.
 *
 * These assert the rules that are mechanically checkable. The rules that are
 * not (does the prose teach, is the trade-off honest, does every mandatory
 * §6 section carry its weight) live in each chapter's sibling spec under
 * `specs/` and are a human review job.
 */

const REPO_ROOT = join(__dirname, "..", "..", "..");
const SPECS_DIR = join(__dirname, "specs");
const LESSONS_DIR = join(REPO_ROOT, "public", "content", "chapters");

const authored = chapterRegistry.filter((c) => !c.placeholder);

/** Every author-written string on a chapter, flattened for text-level rules. */
function contentStrings(chapter: ChapterDefinition): string[] {
  return [
    chapter.title,
    chapter.problemStatement,
    ...chapter.learningObjectives,
    ...chapter.hints.map((h) => h.body),
    ...chapter.blueprints.flatMap((b) => [b.label, b.commentary]),
    ...(chapter.quiz ?? []).flatMap((q) => [
      q.prompt,
      ...q.options.flatMap((o) => [o.label, o.explanationMd]),
    ]),
    ...(chapter.curriculumContext
      ? [
          chapter.curriculumContext.position,
          ...chapter.curriculumContext.masteredConcepts,
          ...chapter.curriculumContext.notYetIntroducedConcepts,
          ...chapter.curriculumContext.simplifications,
        ]
      : []),
  ];
}

describe("authored chapter invariants", () => {
  it("there is at least one authored chapter (guards against a vacuous suite)", () => {
    expect(authored.length).toBeGreaterThan(0);
  });

  it("every authored chapter has a sibling spec file", () => {
    for (const chapter of authored) {
      const specPath = join(SPECS_DIR, `${chapter.id}.spec.md`);
      expect(existsSync(specPath), `${chapter.id} has no specs/${chapter.id}.spec.md`).toBe(true);
    }
  });

  it("every authored chapter has a lesson body", () => {
    for (const chapter of authored) {
      const extension = chapter.lessonFormat === "mdx" ? "mdx" : "md";
      const lessonPath = join(LESSONS_DIR, `${chapter.id}.${extension}`);
      expect(existsSync(lessonPath), `${chapter.id} has no lesson ${extension}`).toBe(true);
    }
  });

  // CURRICULUM.md §20.1 and the repo-wide content convention: "-", never the
  // em dash. Covers the lesson body too, which is where it would most easily
  // slip in.
  it("no authored content uses an em dash", () => {
    for (const chapter of authored) {
      for (const text of contentStrings(chapter)) {
        expect(text, `em dash in ${chapter.id}: ${text.slice(0, 60)}`).not.toContain("—");
      }
      const lessonPath = join(LESSONS_DIR, `${chapter.id}.md`);
      if (existsSync(lessonPath)) {
        expect(readFileSync(lessonPath, "utf8"), `em dash in ${chapter.id}'s lesson body`).not.toContain("—");
      }
    }
  });

  it("component ids resolve, and required is a subset of available", () => {
    for (const chapter of authored) {
      for (const id of [...chapter.availableComponentIds, ...chapter.requiredComponentIds]) {
        expect(getComponent(id), `${chapter.id} references unknown component ${id}`).toBeDefined();
      }
      for (const id of chapter.requiredComponentIds) {
        expect(
          chapter.availableComponentIds,
          `${chapter.id} requires ${id} but does not offer it in the palette`,
        ).toContain(id);
      }
    }
  });

  // CURRICULUM.md §11.2 / the starter-graph convention: a starter graph that
  // already passes hands the learner a solved exercise.
  it("no authored chapter's starter graph already completes the chapter", () => {
    for (const chapter of authored) {
      if (!chapter.starterGraph) continue;
      const outcome = evaluateChapter(chapter.starterGraph, chapter);
      expect(
        outcome.passed && outcome.matchedBlueprintId !== null,
        `${chapter.id}'s starter graph already passes - the exercise is handed over solved`,
      ).toBe(false);
    }
  });
});

describe("authored quiz invariants", () => {
  const quizzed = authored.filter((c) => c.quiz && c.quiz.length > 0);

  // QUIZ_FRAMEWORK.md §2's condensed-chapter exception (added Release
  // 6.1.0-alpha Phase 10): a chapter that deliberately condenses several
  // prior source chapters into one carries 10-15 questions instead of the
  // ordinary 3-6, so compression doesn't also compress assessment coverage.
  // Explicit allow-list, not a heuristic, so a chapter can't silently drift
  // outside 3-6 without a deliberate addition here.
  const CONDENSED_CHAPTER_IDS = new Set([
    "bb-1-1-framing-the-problem",
    "bb-1-2-designing-the-system",
    "bb-1-3-defending-the-design",
  ]);

  it("chapter quizzes hold 3-6 questions, or 10-15 for a declared condensed chapter", () => {
    for (const chapter of quizzed) {
      const count = chapter.quiz?.length ?? 0;
      if (CONDENSED_CHAPTER_IDS.has(chapter.id)) {
        expect(count, `${chapter.id} has ${count} questions, outside the condensed-chapter 10-15`).toBeGreaterThanOrEqual(10);
        expect(count, `${chapter.id} has ${count} questions, outside the condensed-chapter 10-15`).toBeLessThanOrEqual(15);
      } else {
        expect(count, `${chapter.id} has ${count} questions, outside QUIZ_FRAMEWORK §2's 3-6`).toBeGreaterThanOrEqual(3);
        expect(count, `${chapter.id} has ${count} questions, outside QUIZ_FRAMEWORK §2's 3-6`).toBeLessThanOrEqual(6);
      }
    }
  });

  // QUIZ_FRAMEWORK §1 point 2, the assessment counterpart of the product's
  // "a bare invalid is a bug" rule: every option explains itself, chosen or
  // not, right or wrong.
  it("every option carries a real explanation", () => {
    for (const chapter of quizzed) {
      for (const question of chapter.quiz ?? []) {
        for (const option of question.options) {
          expect(
            option.explanationMd.trim().length,
            `${chapter.id}/${question.id}/${option.id} has no explanation`,
          ).toBeGreaterThan(0);
        }
      }
    }
  });

  // §1 point 3: distractors are positions a reasonable engineer might hold,
  // so a single-answer question needs real alternatives to choose between.
  it("single-answer questions have exactly one correct option and at least two distractors", () => {
    for (const chapter of quizzed) {
      for (const question of chapter.quiz ?? []) {
        if (question.kind !== "single") continue;
        const correct = question.options.filter((o) => o.correct);
        expect(correct.length, `${chapter.id}/${question.id} is single with ${correct.length} correct options`).toBe(1);
        expect(
          question.options.length - correct.length,
          `${chapter.id}/${question.id} has too few distractors`,
        ).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("questions ramp in difficulty rather than sitting at one level", () => {
    for (const chapter of quizzed) {
      const levels = new Set((chapter.quiz ?? []).map((q) => q.difficulty));
      expect(levels.size, `${chapter.id}'s quiz is all one difficulty`).toBeGreaterThan(1);
    }
  });
});

describe("0.1 Welcome to ScaleCraft", () => {
  const chapter = chapterRegistry.find((c) => c.id === "bb-0-1-welcome");

  /** The two authored faults fixed: the database added, the edge kind corrected. */
  const fixedGraph: ArchitectureGraph = {
    nodes: [
      { id: "client", componentId: "client", position: { x: 80, y: 140 }, config: {} },
      { id: "app", componentId: "app-server", position: { x: 340, y: 140 }, config: {} },
      { id: "db", componentId: "sql-database", position: { x: 600, y: 140 }, config: {} },
    ],
    edges: [
      { id: "e1", source: "client", target: "app", kind: "request-flow" },
      { id: "e2", source: "app", target: "db", kind: "request-flow" },
    ],
    entryPointIds: ["client"],
  };

  it("is authored content, not a placeholder", () => {
    expect(chapter?.placeholder).toBeFalsy();
  });

  it("the starter graph carries both authored faults", () => {
    const outcome = evaluateChapter(chapter!.starterGraph!, chapter!);
    // Fault 1: the required database is absent.
    expect(outcome.missingRequiredComponentIds).toContain("sql-database");
    // Fault 2: the one edge present is of a kind Client may not emit.
    expect(outcome.violations.some((v) => v.ruleId === "component-relations")).toBe(true);
  });

  it("every violation on the starter graph explains itself", () => {
    const outcome = evaluateChapter(chapter!.starterGraph!, chapter!);
    for (const violation of outcome.violations) {
      expect(violation.explanation.trim().length, `${violation.ruleId} has a bare violation`).toBeGreaterThan(0);
    }
  });

  it("fixing both faults completes the chapter", () => {
    const outcome = evaluateChapter(fixedGraph, chapter!);
    expect(outcome.violations.filter((v) => v.severity === "error")).toEqual([]);
    expect(outcome.missingRequiredComponentIds).toEqual([]);
    expect(outcome.passed).toBe(true);
    expect(outcome.matchedBlueprintId).toBe("bb-0-1-welcome-blueprint");
  });

  // §16: the palette is a declared, minimal exception (see the spec's §6).
  // This locks it down so the "give the picker more to browse" drift cannot
  // silently come back.
  it("offers only the three primitives", () => {
    expect(chapter?.availableComponentIds).toEqual(["client", "app-server", "sql-database"]);
  });
});
