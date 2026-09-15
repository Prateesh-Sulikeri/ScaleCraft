import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { chapterRegistry } from "./index";
import { getComponent } from "@/content/components/registry";
import { evaluateChapter } from "@/validation-engine/chapter-outcome";
import { ANNOTATION_COLOR_PRESETS } from "@/canvas/annotation-colors";
import type { ArchitectureGraph } from "@/lib/graph";
import type { ChapterDefinition } from "./types";
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  MIN_HORIZONTAL_GAP,
  MIN_VERTICAL_GAP,
  PITCH_X,
  PITCH_Y,
  ZONE_PAD_BOTTOM,
  ZONE_PAD_SIDE,
  ZONE_PAD_TOP,
} from "@/canvas/card-geometry";

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

  // .claude/docs/pending-design-editor-exercise.md §1.3: every Part 3 starter
  // graph was authored at a 200px x-pitch against a 200px-wide card, so the
  // gap between adjacent cards was 0px and edges rendered as invisible dots.
  //
  // Card geometry is imported, never re-declared. It used to be two hand-copied
  // literals here with a comment asking whoever resized the card to remember to
  // update them; when the card became 140x100 those literals silently went on
  // asserting a 200x65 card, so the gate passed while measuring a card that no
  // longer existed. See src/canvas/card-geometry.ts.
  const PROXIMITY_THRESHOLD = 40;

  // Re-enabled in Step 4 of .claude/docs/pending-design-editor-revamp.md: all
  // 14 starter graphs are now authored at the 260x195 pitch against the
  // 120x96 card, which clears both minimums with room to spare (140/99 real
  // gap against a 120/95 floor).
  it("no starter graph packs two nodes closer than the minimum gap", () => {
    for (const chapter of authored) {
      const nodes = chapter.starterGraph?.nodes;
      if (!nodes || nodes.length < 2) continue;
      for (let a = 0; a < nodes.length; a++) {
        for (let b = a + 1; b < nodes.length; b++) {
          const dx = Math.abs(nodes[a].position.x - nodes[b].position.x);
          const dy = Math.abs(nodes[a].position.y - nodes[b].position.y);
          if (dy < PROXIMITY_THRESHOLD) {
            expect(
              dx - CARD_WIDTH,
              `${chapter.id}: ${nodes[a].id} and ${nodes[b].id} sit ${dx - CARD_WIDTH}px apart horizontally, below the ${MIN_HORIZONTAL_GAP}px minimum`,
            ).toBeGreaterThanOrEqual(MIN_HORIZONTAL_GAP);
          }
          if (dx < PROXIMITY_THRESHOLD) {
            expect(
              dy - CARD_HEIGHT,
              `${chapter.id}: ${nodes[a].id} and ${nodes[b].id} sit ${dy - CARD_HEIGHT}px apart vertically, below the ${MIN_VERTICAL_GAP}px minimum`,
            ).toBeGreaterThanOrEqual(MIN_VERTICAL_GAP);
          }
        }
      }
    }
  });

  // Replaces an earlier 2.5:1 bounding-box aspect ceiling. That ceiling
  // existed to stop fitView zooming a long chain down to an unreadable size,
  // and it worked by forcing a pipeline to tier into stacked rows. CURRICULUM
  // .md §11.5 now requires the opposite: a starter graph is one continuous
  // left-to-right pipeline, wide by construction, with the canvas opening at
  // a readable floor zoom and panning rather than fitting the whole width
  // (see Canvas.tsx's fitViewOptions). So the ceiling is gone and this gate
  // holds the property that actually matters instead: **the flow advances
  // left-to-right.** Every request-flow edge must move its target to the
  // right of its source, or sit in the same column (a fan-out branch).
  // Nothing steps backwards.
  it("every starter graph's request flow advances left to right", () => {
    for (const chapter of authored) {
      const graph = chapter.starterGraph;
      if (!graph || graph.nodes.length < 2) continue;
      const xById = new Map(graph.nodes.map((n) => [n.id, n.position.x]));
      for (const edge of graph.edges) {
        if (edge.kind !== "request-flow") continue;
        const from = xById.get(edge.source);
        const to = xById.get(edge.target);
        if (from === undefined || to === undefined) continue;
        expect(
          to >= from,
          `${chapter.id}: edge ${edge.id} runs right-to-left (${edge.source} at x=${from} -> ${edge.target} at x=${to})`,
        ).toBe(true);
      }
    }
  });

  // The same pipeline rule, stated as a shape: a starter graph occupies one
  // row per parallel branch, never a row per tier. More rows than the widest
  // fan-out means a pipeline was tiered into stacked bands again.
  it("no starter graph uses more rows than its widest fan-out needs", () => {
    for (const chapter of authored) {
      const graph = chapter.starterGraph;
      if (!graph || graph.nodes.length < 4) continue;
      const rows = new Set(graph.nodes.map((n) => n.position.y)).size;
      const perColumn = new Map<number, number>();
      for (const n of graph.nodes) perColumn.set(n.position.x, (perColumn.get(n.position.x) ?? 0) + 1);
      const widestFanOut = Math.max(...perColumn.values());
      expect(
        rows,
        `${chapter.id}'s starter graph spans ${rows} rows but its widest column holds only ${widestFanOut} node(s) - a pipeline tiered into bands instead of one left-to-right row`,
      ).toBeLessThanOrEqual(widestFanOut);
    }
  });

  // CURRICULUM.md §11.6: `PITCH_Y - CARD_HEIGHT` is 64px and two stacked
  // zones split it three ways, so the pads decide whether the gap between
  // their borders is readable. At 44/16 it was 4px and bb-3-4's Application
  // and Build here boxes read as one merged container.
  it("no two starter-decorator zones stacked in one column sit closer than the readable gap", () => {
    const MIN_ZONE_GAP = 12;
    for (const chapter of authored) {
      const zones = (chapter.starterDecorators ?? []).filter((d) => d.kind === "zone");
      for (let a = 0; a < zones.length; a++) {
        for (let b = a + 1; b < zones.length; b++) {
          const [top, bottom] =
            zones[a].position.y <= zones[b].position.y ? [zones[a], zones[b]] : [zones[b], zones[a]];
          // Only zones sharing a column stack; side-by-side tiers never do.
          if (top.position.x + top.width <= bottom.position.x) continue;
          if (bottom.position.x + bottom.width <= top.position.x) continue;
          const gap = bottom.position.y - (top.position.y + top.height);
          expect(
            gap,
            `${chapter.id}: zones ${top.id} and ${bottom.id} stack ${gap}px apart, below the ${MIN_ZONE_GAP}px minimum - they read as one box`,
          ).toBeGreaterThanOrEqual(MIN_ZONE_GAP);
        }
      }
    }
  });

  // bb-3-2 asks for two components (browser and dns) and marked a one-card
  // slot to put them in. Counts distinct missing componentIds, so it cannot
  // see an exercise whose answer is a *second* instance of something already
  // on the canvas (bb-3-4's app-server pool) - that case needs a human.
  it("every Build here zone has room for the components the learner still has to add", () => {
    for (const chapter of authored) {
      const graph = chapter.starterGraph;
      const gapZones = (chapter.starterDecorators ?? [])
        .filter((d) => d.kind === "zone")
        .filter((z) => z.label.toLowerCase() === "build here");
      if (!graph || gapZones.length === 0) continue;
      const present = new Set(graph.nodes.map((n) => n.componentId));
      const missing = (chapter.requiredComponentIds ?? []).filter((id) => !present.has(id)).length;
      const slots = gapZones.reduce((total, z) => {
        const cols = Math.round((z.width - CARD_WIDTH - 2 * ZONE_PAD_SIDE) / PITCH_X) + 1;
        const rows =
          Math.round((z.height - CARD_HEIGHT - ZONE_PAD_TOP - ZONE_PAD_BOTTOM) / PITCH_Y) + 1;
        return total + cols * rows;
      }, 0);
      expect(
        slots,
        `${chapter.id}: the Build here zone holds ${slots} card slot(s) but the exercise adds ${missing} component(s)`,
      ).toBeGreaterThanOrEqual(missing);
    }
  });

  // CURRICULUM.md §11.6: two bands wanting the same name are one tier. This
  // caught seven chapters shipping an "Application" zone holding only the
  // reverse proxy, directly above a second "Application" zone holding the
  // rest of the tier - a whole wasted band and two boxes a learner had no way
  // to tell apart.
  it("no chapter gives two starter-decorator zones the same label", () => {
    for (const chapter of authored) {
      const labels = (chapter.starterDecorators ?? [])
        .filter((d) => d.kind === "zone")
        .map((d) => d.label);
      const duplicates = labels.filter((l, i) => labels.indexOf(l) !== i);
      expect(
        [...new Set(duplicates)],
        `${chapter.id} has more than one zone labelled ${[...new Set(duplicates)].join(", ")}`,
      ).toEqual([]);
    }
  });

  // CURRICULUM.md §11.2 (D1b): a chapter with a real canvas exercise declares
  // its goal and success criteria as data, not just prose buried in
  // problemStatement - see QuestionPane's Goal / You're done when sections.
  it("every editor-exercise chapter declares a goal and at least two success criteria", () => {
    for (const chapter of authored) {
      if (!chapter.starterGraph || chapter.hasEditorExercise === false) continue;
      expect(chapter.exerciseGoal?.trim().length ?? 0, `${chapter.id} has no exerciseGoal`).toBeGreaterThan(0);
      expect(
        chapter.successCriteria?.length ?? 0,
        `${chapter.id} has fewer than 2 successCriteria`,
      ).toBeGreaterThanOrEqual(2);
    }
  });

  // CURRICULUM.md §11.2's brief-calibration rule, best-effort: a component
  // the learner still has to ADD (in availableComponentIds but absent from
  // the starter graph) should not be named by its display label in the goal
  // or success criteria - that's the fix, not the symptom. Heuristic, not
  // proof: it catches the 3.4/3.12-class leak this doc's Finding B flagged,
  // not paraphrased spoilers.
  it("the brief never names a component the learner still has to add", () => {
    for (const chapter of authored) {
      if (!chapter.starterGraph || (!chapter.exerciseGoal && !chapter.successCriteria)) continue;
      const briefText = [chapter.exerciseGoal ?? "", ...(chapter.successCriteria ?? [])].join(" ").toLowerCase();
      const presentIds = new Set(chapter.starterGraph.nodes.map((n) => n.componentId));
      const toAdd = chapter.availableComponentIds.filter((id) => !presentIds.has(id));
      for (const id of toAdd) {
        const label = getComponent(id)?.label;
        if (!label) continue;
        expect(
          briefText.includes(label.toLowerCase()),
          `${chapter.id}'s brief names "${label}", a component the learner still has to add`,
        ).toBe(false);
      }
    }
  });

  // .claude/docs/pending-starter-decorators.md: starterDecorators is a
  // separate, hand-authored field (never generated), so an id typo or a
  // copy-pasted id from another chapter is a real risk - it would silently
  // collide with a real component node's id once toDecoratorNodes merges
  // both arrays into one canvas node list.
  it("every starter decorator has an id unique within its chapter, distinct from every starter-graph node id", () => {
    for (const chapter of authored) {
      if (!chapter.starterDecorators || chapter.starterDecorators.length === 0) continue;
      const nodeIds = new Set((chapter.starterGraph?.nodes ?? []).map((n) => n.id));
      const seen = new Set<string>();
      for (const d of chapter.starterDecorators) {
        expect(nodeIds.has(d.id), `${chapter.id}: decorator id "${d.id}" collides with a starter-graph node id`).toBe(false);
        expect(seen.has(d.id), `${chapter.id}: decorator id "${d.id}" is duplicated`).toBe(false);
        seen.add(d.id);
      }
    }
  });

  // A zone is a labeled boundary - two overlapping zones read as a
  // rendering bug (which one is the client tier?), not as intentional
  // nesting (v1 zones don't reparent/nest, see ZoneNodeData's doc comment).
  it("no two starter-decorator zones overlap", () => {
    for (const chapter of authored) {
      const zones = (chapter.starterDecorators ?? []).filter((d) => d.kind === "zone");
      for (let a = 0; a < zones.length; a++) {
        for (let b = a + 1; b < zones.length; b++) {
          const za = zones[a];
          const zb = zones[b];
          const overlaps =
            za.position.x < zb.position.x + zb.width &&
            za.position.x + za.width > zb.position.x &&
            za.position.y < zb.position.y + zb.height &&
            za.position.y + za.height > zb.position.y;
          expect(overlaps, `${chapter.id}: zones "${za.id}" and "${zb.id}" overlap`).toBe(false);
        }
      }
    }
  });

  // pending-starter-decorators.md's palette convention: zones stay on
  // ANNOTATION_COLOR_PRESETS (the same picker a learner's own zones use),
  // not an arbitrary hex an author typed by hand.
  it("every starter-decorator zone has a non-empty label and a palette color", () => {
    const presetValues = new Set(ANNOTATION_COLOR_PRESETS.map((p) => p.value));
    for (const chapter of authored) {
      for (const d of chapter.starterDecorators ?? []) {
        if (d.kind !== "zone") continue;
        expect(d.label.trim().length, `${chapter.id}: zone "${d.id}" has an empty label`).toBeGreaterThan(0);
        expect(presetValues.has(d.color), `${chapter.id}: zone "${d.id}"'s color ${d.color} isn't an annotation preset`).toBe(true);
      }
    }
  });

  // Same brief-calibration rule as the exerciseGoal/successCriteria gate
  // above, extended to on-canvas decorators - a zone label or comment is
  // just as capable of spoiling the fix as a sentence in the sidebar.
  it("no starter-decorator zone label or comment names a component the learner still has to add", () => {
    for (const chapter of authored) {
      if (!chapter.starterGraph || !chapter.starterDecorators?.length) continue;
      const presentIds = new Set(chapter.starterGraph.nodes.map((n) => n.componentId));
      const toAdd = chapter.availableComponentIds.filter((id) => !presentIds.has(id));
      const decoratorText = chapter.starterDecorators
        .map((d) => (d.kind === "comment" ? d.text : d.kind === "zone" ? d.label : ""))
        .join(" ")
        .toLowerCase();
      for (const id of toAdd) {
        const label = getComponent(id)?.label;
        if (!label) continue;
        expect(
          decoratorText.includes(label.toLowerCase()),
          `${chapter.id}'s decorators name "${label}", a component the learner still has to add`,
        ).toBe(false);
      }
    }
  });
});

describe("authored reference-graph invariants", () => {
  // Every blueprint reference graph Debrief can actually render. A chapter
  // with no editor exercise never mounts Debrief (see D16 in
  // pending-design-editor-revamp.md), so it is excluded rather than failed.
  const referenceGraphs = authored
    .filter((c) => c.hasEditorExercise !== false)
    .flatMap((c) => (c.blueprints ?? []).map((b) => ({ chapter: c, blueprint: b })))
    .filter((x) => x.blueprint.referenceGraph);

  it("every chapter that can show a Debrief has a reference graph to show", () => {
    for (const chapter of authored) {
      if (chapter.hasEditorExercise === false || !chapter.blueprints?.length) continue;
      for (const blueprint of chapter.blueprints) {
        expect(
          blueprint.referenceGraph,
          `${chapter.id}'s blueprint "${blueprint.id}" has no referenceGraph, so its Debrief renders commentary with no diagram`,
        ).toBeDefined();
      }
    }
  });

  // The Start badge (ReferenceStartBadge.tsx) is drawn from entryPointIds and
  // from nothing else, so an empty or stale list silently produces a diagram
  // with no stated entry point - a flow diagram that never says where the
  // flow begins. ReferenceGraphCanvas also ranks columns from these ids, so a
  // bad list costs the left-to-right ordering too, not just the badge.
  it("every reference graph names at least one entry point", () => {
    for (const { chapter, blueprint } of referenceGraphs) {
      expect(
        blueprint.referenceGraph!.entryPointIds.length,
        `${chapter.id}'s blueprint "${blueprint.id}" has no entryPointIds - no Start badge would render`,
      ).toBeGreaterThan(0);
    }
  });

  it("every reference graph's entry points are real nodes in that same graph", () => {
    for (const { chapter, blueprint } of referenceGraphs) {
      const graph = blueprint.referenceGraph!;
      const nodeIds = new Set(graph.nodes.map((n) => n.id));
      for (const id of graph.entryPointIds) {
        expect(
          nodeIds.has(id),
          `${chapter.id}'s blueprint "${blueprint.id}" lists entry point "${id}", which is not one of its nodes`,
        ).toBe(true);
      }
    }
  });

  it("every reference-graph edge connects two nodes in that same graph", () => {
    for (const { chapter, blueprint } of referenceGraphs) {
      const graph = blueprint.referenceGraph!;
      const nodeIds = new Set(graph.nodes.map((n) => n.id));
      for (const edge of graph.edges) {
        expect(
          nodeIds.has(edge.source) && nodeIds.has(edge.target),
          `${chapter.id}'s blueprint "${blueprint.id}" has a dangling edge "${edge.id}"`,
        ).toBe(true);
      }
    }
  });

  // A node no edge reaches from an entry point is ranked into column 0 by
  // reference-layout.ts's fallback, where it reads as a second, unexplained
  // starting point of the diagram.
  it("every reference-graph node is reachable from an entry point", () => {
    for (const { chapter, blueprint } of referenceGraphs) {
      const graph = blueprint.referenceGraph!;
      const out = new Map<string, string[]>(graph.nodes.map((n) => [n.id, []]));
      for (const e of graph.edges) out.get(e.source)?.push(e.target);
      const seen = new Set(graph.entryPointIds);
      const queue = [...graph.entryPointIds];
      while (queue.length > 0) {
        for (const next of out.get(queue.pop()!) ?? []) {
          if (!seen.has(next)) {
            seen.add(next);
            queue.push(next);
          }
        }
      }
      for (const node of graph.nodes) {
        expect(
          seen.has(node.id),
          `${chapter.id}'s blueprint "${blueprint.id}" has "${node.id}" unreachable from any entry point`,
        ).toBe(true);
      }
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
