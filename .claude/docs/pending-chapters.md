# Authored Chapters - Completion Ledger

The running record of which curriculum chapters are actually authored, by whom,
on which branch, and what was left open. Started 2026-08-05.

This exists because "is 3.4 done?" is otherwise only answerable by reading git
log and grepping `placeholder: true`. The manifest tells you a chapter row
exists; `chapterRegistry` tells you a definition exists; neither tells you the
content met the authoring bar or what got flagged along the way.

> **Instruction for future sessions.** Append an entry here the moment a chapter
> is complete, as the last step before committing it. "Complete" means all six
> deliverables in `pending-content.md` are in, the pipeline is green, and the
> chapter is committed. Do not batch entries at the end of a wave - the details
> worth recording (divergences, judgment calls, what was checked and found
> stale) are exactly what gets forgotten. If a chapter is started and abandoned,
> record that too, with the reason.

**Scope of the curriculum:** 47 Building Blocks entries (44 chapters + 3
checkpoints) + 32 Real World Extraction projects = 79 manifest rows.

> **Information density is the standing bar for every chapter.** CURRICULUM.md
> §20.6 is binding and outranks every other style rule: optimize for knowledge
> per minute, cut any sentence that does not introduce, clarify, or reinforce,
> prefer tables and bullets where they scan better, and let length follow
> content rather than the time estimate. Every entry below records its lesson
> word count so drift is visible. Do a density revision pass before calling a
> chapter done - a complete first draft is not a finished one.

---

## Status at a glance

| Chapter | Status | Date | Branch |
|---|---|---|---|
| 0.1 Welcome to ScaleCraft | **Authored** | 2026-08-05 | `feature/content-0-1-welcome` |
| 0.2 What is System Design? | Not started | - | - |
| 1.6 Drawing the First Architecture | Not started (blocked, see below) | - | - |
| 3.4 Load Balancer | Placeholder (`bb-dummy-1`), blocked | - | - |
| RWE T1 Bitly | Placeholder (`rwe-dummy-1`) | - | - |

Everything else in the 79 rows is unauthored (`chapterDefinitionId: null`).

**Wave 1 progress: 1 of 5.** Wave definitions live in `pending-content.md`.

---

## 0.1 Welcome to ScaleCraft

- **Authored** 2026-08-05 · commit `250b5eb` · branch `feature/content-0-1-welcome`
  (stacked on `feature/guided-tour-track-a`, because 0.1's content builds on
  Track A's chapter definition and lesson file)
- Definition id `bb-0-1-welcome` · manifest slug `0-1-welcome-to-scalecraft`
- Type: Concept · foundational · 10 min · no prerequisites
- **Lesson length: 667 words** (down from 1262 in the first draft)
- Pipeline green at commit: typecheck, lint, 1552 tests, build

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-0-1-welcome.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-0-1-welcome.md` |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None new. Four existing structural rules curated; justified in spec §7 |
| 5 | Quiz | 4 questions, difficulty ramp 1/2/2/3 |
| 6 | Playtest pass | Spec §9 |

**Judgment calls made:**

- **Cut 47% for density (2026-08-05, user direction).** The first draft stretched
  single ideas across multiple paragraphs, restated points in fresher words, and
  used prose where a table scanned better. The Validate/Submit contrast became a
  4-row comparison table, the recap became 3 retrieval anchors instead of a
  restatement, and the near-empty Connections section merged into "Next" (§6
  permits merging short adjacent sections). Every mandatory beat survived. This
  produced CURRICULUM.md §20.6, now the highest-priority style rule.
- Palette narrowed from 5 components to the 3 primitives. `load-balancer` and
  `cache` existed only to give the guided tour's picker step more to browse,
  which did not justify putting Group A/D components in front of a learner in
  their first session. Nothing depended on the palette size.
- Production examples (mandatory for Concept per §6) omitted with written
  justification: the chapter's subject is the product's own teaching loop, and
  §13 requires real companies chosen for a decision they made. Any example
  would have been a strained CI analogy, which §20.1's zero-filler rule
  forbids.
- Backward connections (§19 wants >=2) not possible - 0.1 is chapter 1 of 44.
  Recorded rather than faked.

**Carried forward:** see "Open decisions" below - items 1 and 2 originate here.

---

## Open decisions blocking or shaping later chapters

Raised during authoring, deliberately not resolved unilaterally. Each needs a
doc edit or a build decision.

1. **CURRICULUM §14's 0.1 row contradicts the shipped chapter.** §14 reads
   "Exercise: none (the tour is the chapter)" and "New: none (tour of the seed
   graph, read-only)". The chapter as built has a real fix exercise on a
   deliberately broken graph, gated by Submit. The built behavior was kept (it
   is shipped, tested, and stronger pedagogically); §14's row needs updating in
   its own commit. Detail in the chapter spec's §10.
   **Blocks:** nothing. Cosmetic doc drift, but it misleads the next author.

2. **§16 component budget exception at 0.1.** §16 homes `client`,
   `app-server` and `sql-database` at 1.6 and forbids a component appearing in
   any palette before its home chapter. 0.1 needs them on the canvas to have
   something to fix, so they appear as scenery: named, never taught, never a
   choice the learner makes. Handled as a declared exception in the spec's §6.
   Either §16 gains an explicit "scenery" carve-out or the exception stands as
   documented.
   **Blocks:** nothing today. Revisit when authoring 1.6, which does the formal
   introduction.

3. **The Reader cannot render topology diagrams.** CURRICULUM §7.2 says any
   diagram expressible as an architecture graph is authored as ScaleCraft graph
   JSON so it renders in the product's own visual language. `MarkdownRenderer`
   supports Mermaid (`MermaidBlock`), GFM, callouts and code blocks - and no
   graph-JSON block. There is no way to put a ScaleCraft topology diagram in a
   lesson body today.
   **Blocks: 1.6 and 3.4**, whose primary diagram is a topology. Part 0 is
   unaffected (process flows are Mermaid by spec anyway). Needs a decision
   before Wave 1 chapter 3: build a markdown graph block, or amend §7.2 to
   allow Mermaid for topology in the Reader.

---

## Gates verified (so later sessions do not re-check them)

- **Manifest migration - resolved 2026-08-05, no work needed.**
  `pending-content.md`'s "manifest migration to v2 structure precedes Wave 1"
  is stale. `src/curriculum/manifest.ts` is already the v3 map (79 entries,
  migrated per §21.4). Every Wave 1 slug exists. Authoring 3.4 and Bitly means
  repointing those rows off the dummy definitions, which §21.4 explicitly
  permits (dummies "carry no migration weight").
- **Quiz UI - real, verified 2026-08-05.** `ChapterReader.tsx` renders
  `QuizLauncher` straight off `chapter.quiz`, and `appendKnowledgeCheckHeading`
  adds the TOC entry. Authoring the array is sufficient; no engineering work.
  Not yet exercised by a human click-through now that 0.1 has a live quiz.
- **Content invariants are enforced in CI** by
  `src/content/chapters/authoring-invariants.test.ts`: every authored chapter
  has a spec and a lesson body, no em dashes anywhere in authored content,
  component ids resolve and required is a subset of available, no starter graph
  already completes its chapter, quizzes are 3-6 questions with a real
  difficulty ramp, and every quiz option carries a non-empty explanation. A
  chapter that violates these fails the suite rather than shipping.
