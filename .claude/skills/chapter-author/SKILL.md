---
name: chapter-author
description: One-shot curriculum authoring for ScaleCraft - authors or revises one deliverable (or all of them) for a Building Blocks or Real World Extraction chapter: lesson, spec, quiz, hints, blueprints, or ChapterDefinition metadata (including the Design Editor's exerciseGoal/successCriteria). Not for engineering/UI work on the app itself - use plain Claude for that.
version: 2.0.0
user-invocable: true
argument-hint: "<chapter-id-or-slug> [--scope full|lesson|spec|quiz|hints|blueprints|definition]"
---

# chapter-author

One-shot authoring pass, model-independent - runs on whatever model this
session is on, no dedicated subagent, no separate second pass. This replaces
the earlier two-pass Sonnet-draft/Opus-audit workflow: that model paid its
way once, on chapter 0.2's first draft, catching a wrong-chapter "Next"
preview and a forward-referenced vocabulary term. Every chapter authored
since has followed the same traps list and precedent-chapter comparison
without needing a second reader to catch category errors, so the self-check
built into this pass now covers what the audit pass used to. If a specific
chapter genuinely needs a second opinion, ask for one explicitly (a fresh
session re-reading the diff cold, or `/code-review`, both work) - it is not
this skill's default flow anymore.

**Read `CLAUDE.md` first, every invocation** - its "Curriculum authoring"
section names the binding docs (`CURRICULUM.md`, `QUIZ_FRAMEWORK.md`,
`pending-content.md`, `pending-chapters.md`) and this skill assumes their
contracts rather than restating them. This skill is a *process* wrapper
around that contract, not a replacement for reading it.

**Scope: content authoring only.** This skill writes curriculum content -
lesson prose, specs, blueprints, component lists, validation-rule
references, diagrams, quiz, hints, `ChapterDefinition` metadata. It does not
write tests, run the CI pipeline (`tsc`/`lint`/`vitest`/`build`), or run
Playwright. That verification happens outside this skill, on the user's own
schedule, not as part of authoring a chapter.

## Parse the invocation

One positional arg, one optional flag:

1. **Target** - a chapter id (`bb-0-2-what-is-system-design`), a curriculum
   slug (`0-2-what-is-system-design`), or a plain number (`0.2`, `3.4`).
   Resolve it against `src/curriculum/manifest.ts` (slug/number) and
   `src/content/chapters/index.ts` (id) before doing anything else - if it
   doesn't resolve, say so rather than guessing which chapter was meant.
2. **`--scope`** (optional, default `full`) - which deliverable(s) this
   invocation touches:
   - `full` - all six deliverables (spec, lesson, ChapterDefinition,
     validation rules, quiz, playtest pass) - a whole new chapter.
   - `lesson` - only `public/content/chapters/<id>.md`.
   - `spec` - only `src/content/chapters/specs/<id>.spec.md`.
   - `quiz` - only the `quiz` array on the `ChapterDefinition` (questions +
     options + pairs/correctOrder together - QUIZ_FRAMEWORK.md treats them
     as one deliverable, don't split them further).
   - `hints` - only the `hints` array.
   - `blueprints` - only the `blueprints` array (and `starterGraph` if the
     blueprint change requires a different starting graph to stay honest -
     see the authoring-invariants test that a starter graph must not already
     pass).
   - `definition` - the remaining `ChapterDefinition` metadata:
     `problemStatement`, `exerciseGoal`, `successCriteria`,
     `learningObjectives`, `curriculumContext`,
     `availableComponentIds`/`requiredComponentIds`, `validationRuleIds`,
     `starterDecorators`. For any chapter with a `starterGraph` and
     `hasEditorExercise !== false`, `exerciseGoal`/`successCriteria` are
     required, not optional - see CURRICULUM.md §11.2's brief-calibration
     rule. `starterDecorators` (zones/comments, CURRICULUM.md §11.6) is
     optional but expected for any chapter with a `starterGraph` - author it
     alongside the brief, not as an afterthought, and use the same
     calibration rule (a zone label or comment can spoil the fix exactly
     like a sentence in `exerciseGoal` can).

   A scoped pass still requires reading the whole chapter for context (a
   quiz revision that contradicts the lesson is a new bug, not a fix) -
   "scope" bounds what gets *edited* and what context-gathering prioritizes,
   never what gets read when something looks off.

## Gather context - scoped, not exhaustive

Read `reference/author.md`, then follow it. Do not full-read
`pending-chapters.md` (5,000+ lines) or all of `CURRICULUM.md` (1,500+
lines, ~20 top-level sections) regardless of `--scope` - extract just the
target chapter's own ledger entry and the CURRICULUM sections this scope
actually needs. `reference/author.md` has the extraction method and the
scope-to-section map. Reading wider than the map when something in the
chapter's own brief points elsewhere is expected; the map is a floor for
routine passes, not a hard ceiling.

## Author

Author the scoped deliverable(s) yourself, self-check against the traps
list and the six-area checklist in `reference/author.md` (content,
content-structure, blueprints, component-lists, submit validations,
diagrams) before calling it done - there is no second reader to catch what
you miss - update the ledger, and **stop**: present the diff to the user and
wait. Do not run `tsc`/`lint`/`vitest`/`build`, and do not run Playwright;
that verification is the user's call.

## Constants

- **Never commit, push, or create a branch.** Leave the working tree with
  real, reviewable, uncommitted changes. The user commits, per `CLAUDE.md`'s
  branching/review policy.
- **Always update `.claude/docs/pending-chapters.md`** as the last step - a
  new chapter gets a full entry (deliverables table, judgment calls); a
  scoped revision to an existing chapter gets a dated addition to that
  chapter's existing entry, not a silent overwrite of prior judgment calls.
  Never batch this for later.
- **Never write tests, run the CI pipeline, or run Playwright.** No
  `npx tsc`, `npm run lint`, `npx vitest`, `npm run build`, or Playwright,
  and no new test files. If a chapter needs a new validation rule,
  reference/describe it; implementing and testing the rule's code is
  engineering work outside this skill.
- **The quiz positional-bias guard is per-chapter, not registry-wide.**
  `quiz-invariants.test.ts` catches a single chapter's single-choice answers
  clustering on one letter, a matching question's diagonal, or a pre-solved
  ordering question - it does *not* catch a pattern that only shows up
  across chapters (e.g. two different chapters both defaulting to "b" for
  their first question). Glance at sibling chapters' answer-letter
  sequences by eye during a `quiz`-scope pass; don't rely on CI alone for
  this one.
- **A scoped pass still respects the full authoring contract.** A `quiz`
  revision that fixes distractors but breaks the chapter's difficulty ramp,
  or a `hints` revision that gives away the answer, is not done just because
  it stayed inside its file boundary.

## How to invoke this in a future session

- `/chapter-author 3.4` - author 3.4 Load Balancer end to end (all six
  deliverables), then stop for review.
- `/chapter-author 1.6 --scope quiz` - 1.6 is already authored and shipped,
  but you want a new/revised quiz for it specifically.
- `/chapter-author bb-0-3-interview-design-vs-production-engineering --scope hints` -
  revise just the hints on an already-drafted 0.3, addressed by chapter id
  instead of number.
- Plain English also works - "author the RWE Bitly blueprints" or "revise
  0.2's quiz" resolve the same way; you don't need the exact command syntax.
