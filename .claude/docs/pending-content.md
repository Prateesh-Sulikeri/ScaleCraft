# Curriculum Content - Plan of Action (for Opus)

You are acting as the **Lead Lesson Author** for ScaleCraft. Your job is to write
the actual curriculum content: lesson prose, diagrams, chapter definitions, and
quizzes. The framework you write inside is already fixed - you follow it, you do
not redesign it.

This plan covers the FULL curriculum (44 Building Blocks chapters, 3 checkpoints,
32 Real World Extraction projects) organized into waves. Release 3 ships only
Wave 1 (a few chapters); later waves are planned here so nothing is rework.
Author wave by wave, chapter by chapter, in order.

## The contract you write under

1. `.claude/docs/CURRICULUM.md` is the master specification. Before writing
   anything, read it end to end. The binding parts for you:
   - §5 chapter blueprint (metadata, objectives, lesson flow beats)
   - §6 mandatory sections per chapter type
   - §7-8 diagram and visual standards
   - §9-10 engineering + interview thinking frameworks (weave into every chapter)
   - §14/§15 your chapter-by-chapter briefs (Purpose / New / Assumes / Prepares
     for / Interview / Exercise / Est - each row is your spec)
   - §16 component budget (introduce exactly what your chapter's row says)
   - §18.2 sequencing rules (violating one is a spec bug, stop and flag it)
   - §20 AI author instructions - this is your system prompt. Reread it before
     every chapter. Highlights: senior-engineer voice, no hype, "-" never the em
     dash, manufacture the problem before naming the solution, one idea-cluster
     per chapter, never-do list.
2. `.claude/docs/QUIZ_FRAMEWORK.md` governs every quiz question you write (§1-4
   authoring rules; §5-16 are your question banks - chapter quizzes of 3-6
   questions are drawn from or modeled on the owning bank).
3. Product principles in `CLAUDE.md` / `.claude/docs/ARCHITECTURE.md`: components
   never forked per chapter, explanations always shown, hints never pushed, not
   a game, single-player.
4. Orient in code with graphify before reading source files (mandatory repo
   hook). You mostly need: `src/content/chapters/types.ts` (ChapterDefinition),
   `src/content/chapters/lessons/` (where lesson markdown lives),
   `src/validation-engine/` (rules and patterns), `src/content/components/`
   (the 27 component ids and their configs).

## Per-chapter deliverables (the authoring pipeline, CURRICULUM §21.2)

Every chapter you author produces ALL of the following, in one branch:

1. **Chapter spec** - the §5 blueprint filled in (metadata, categorized
   objectives, per-beat outline, declared omissions and simplifications).
   Commit it as a short spec header comment or sibling notes file with the
   lesson so reviewers can check prose against intent.
2. **Lesson markdown** - the Reader prose, following §5.3's beats in order, all
   §6-mandatory sections for the chapter's type, diagrams per §7 (topology
   diagrams as ScaleCraft graph JSON with correct edge kinds; sequence/state/
   decision diagrams as Mermaid), reinforcement devices at their §12 placements,
   ending in the transition brief into the Design Editor.
3. **ChapterDefinition** - `problemStatement`, `learningObjectives`,
   `availableComponentIds` (the cumulative palette: everything introduced up to
   and including this chapter - check §16), `requiredComponentIds`,
   `validationRuleIds` (BB curates a subset; RWE ignores the field),
   `blueprints` (≥1 graph pattern; multiple when the chapter honestly has
   multiple right answers), `hints` (2-4, orienting -> directional, never the
   answer), `starterGraph` for completion/fix exercises, `readingLinks`
   (manual textbook citations only - never content coupling), and
   `curriculumContext` (BB only: position, masteredConcepts,
   notYetIntroducedConcepts, simplifications - transcribed from your spec's
   Assumes/New/omissions lists; Deep Check depends on its honesty).
4. **Validation rules** - where your exercise needs a rule that doesn't exist
   (~5-10 per BB chapter, 15-25 per RWE project), author it: id, pattern spec,
   severity, and the explanation text (the explanation is curriculum content -
   write it to teaching quality, it is often the learner's primary text).
   If a rule needs engine capabilities that don't exist, write the rule as a
   spec and flag it - do not hack the engine.
5. **Quiz** - 3-6 questions per the framework; ids are permanent persistence
   keys; scope-honest (nothing later than the prerequisite chain).
6. **Playtest pass** - answer §18.2's question in writing: "which prior chapter
   taught each move this exercise requires?" If any move has no answer, fix the
   chapter or flag the sequencing.

7. **Ledger entry** - append the chapter to `.claude/docs/pending-chapters.md`
   as the last step before committing: date, branch, commit, where each
   deliverable landed, the judgment calls you made, and anything you flagged
   rather than resolved. That file is the answer to "is this chapter actually
   done?" for every future session, so it is written at completion time, never
   batched at the end of a wave.

**Definition of done per chapter:** all six deliverables plus the ledger entry;
every §6-mandatory section present (or a written justification); component
budget respected; no em dashes; `placeholder` flag absent; pipeline green; the
chapter reads as one continuous experience from cold open to Design Editor.

## Dependencies you must respect (do not author around them silently)

- **Manifest migration precedes Wave 1.** The shipped manifest transcribes the
  v1 curriculum; slugs are persistence keys (CURRICULUM §21.4). Flipping the
  manifest to v2 structure is an engineering task - coordinate so your chapter
  slugs exist before your content lands. Never repoint an old slug at different
  content.
- **Quiz UI** (see `pending-quiz-ui.md`) must exist before quizzed chapters
  ship - Phases 1-4 of that plan gate Wave 1.
- **Stages UI does not exist.** Part 1's staged Process chapters (1.1-1.11)
  need the `stages` mechanism. Until it lands, Part 1 chapters can be authored
  (prose + quiz + a small non-staged exercise where honest) but their staged
  exercises stay in the spec, flagged. Wave 2 triggers that UI work.
- **Simulator-dependent beats** (trace/predict exercises) degrade gracefully:
  where the simulator prompt UI is missing, author the prediction as a quiz
  question instead and note the intended upgrade.

## Authoring waves

Order within a wave = curriculum order. Do not start a wave until the previous
wave's chapters are merged (the user merges; you never do).

- **Wave 1 (release 3.x - the first real content).** Goal: one coherent
  vertical slice proving the whole pipeline.
  - 0.1 Welcome to ScaleCraft, 0.2 What is System Design? (small, no canvas,
    fast wins that exercise Reader + quiz)
  - 1.6 Drawing the First Architecture (first build + first fix; introduces
    the 3 primitive components; replaces the spirit of old 0.1)
  - 3.4 Load Balancer (replaces dummy `bb-dummy-1` content; the flagship
    Building Block chapter)
  - RWE Tier 1: Bitly (replaces dummy `rwe-dummy-1`; Phase A + Phase B +
    debrief + retrospective quiz - the full RWE template proven once)
- **Wave 2.** Part 0 remainder (0.3, 0.4) + Part 1 complete (1.1-1.11).
  Triggers: stages UI. This wave defines the interview-first identity; budget
  the most revision time here.
- **Wave 3.** Part 2 (2.1-2.3) + Group A Core Infrastructure (3.1-3.3, 3.5;
  3.4 exists from Wave 1).
- **Wave 4.** Group B Compute (3.6-3.9) + Group C Data (3.10-3.13).
- **Wave 5.** Group D Performance (3.14-3.16) + Checkpoint R1 + RWE Tier 1
  remainder (Rate Limiter, Distributed Cache, Metrics Monitoring).
- **Wave 6.** Group E Async (3.17-3.19) + Group F Storage (3.20-3.22).
- **Wave 7.** Group G Reliability (3.23-3.26) + Checkpoints R2, R3 + RWE
  Tier 2 (all 5).
- **Wave 8.** RWE Tier 3 (all 9).
- **Wave 9.** RWE Tier 4 (all 9).
- **Wave 10.** RWE Tier 5 (all 5) + full-curriculum consistency pass
  (cross-references resolve, forward teases point at real chapters, §16 audit
  still true, banks vs. chapter quizzes still aligned).

## Working process

- **Read `.claude/docs/pending-chapters.md` before starting any chapter.** It
  records what is already authored, which gates were checked and found stale
  (do not re-verify those), and the open decisions that block specific
  chapters. Append to it when a chapter is done - that is deliverable 7.
- One branch per chapter (`feature/content-<slug>`), or per small cluster for
  Part 0-sized chapters. Full local pipeline green before any push; ask before
  pushing; never merge.
- Author lesson markdown in `src/content/chapters/lessons/` following the
  existing file conventions (check how the two dummy lessons are wired via
  `lessons.ts` and `index.ts` first).
- When your content needs something the framework forbids or lacks: do not
  improvise. Propose the change as an edit to CURRICULUM.md / QUIZ_FRAMEWORK.md
  in its own commit and get it reviewed. The docs stay the single source of
  truth.
- After each wave: run the progress-log subagent per CLAUDE.md, and update
  CURRICULUM.md's status header if reality diverged from plan.

## Quality bar (how your work will be judged)

Read three sources before writing your first chapter, for register only (never
copy content): Hello Interview's teaching structure, ByteByteGo's diagram
discipline, Alex Xu's pacing. Your chapter should feel like it was written by a
staff engineer who is also a gifted teacher: concrete, honest about trade-offs,
zero filler, every section earning its place. The test for every paragraph:
does it change what the learner can DO in the Design Editor or say in an
interview? If not, cut it.
