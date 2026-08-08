---
name: chapter-author
description: Two-pass curriculum authoring for ScaleCraft - Sonnet drafts (or revises one deliverable of) a chapter, then a dedicated Opus agent proofreads and corrects it before the user reviews and commits. Use for authoring or revising a Building Blocks or Real World Extraction chapter's lesson, spec, quiz, hints, blueprints, or ChapterDefinition metadata. Not for engineering/UI work on the app itself - use plain Claude for that.
version: 1.0.0
user-invocable: true
argument-hint: "draft|audit <chapter-id-or-slug> [--scope full|lesson|spec|quiz|hints|blueprints|definition]"
---

# chapter-author

Codifies a workflow validated on chapter 0.2 (2026-08-06): Sonnet drafted the
whole chapter, the user caught two real gaps by reading it, then a dedicated
Opus agent did a genuine second-opinion proofread and found three more real
defects Sonnet's own re-reads had missed - most notably a "Next" section that
previewed the wrong following chapter, and an Interview-lens paragraph that
depended on curriculum vocabulary (§10.1's numbered Interview Loop) the
learner has not been taught yet. Both are exactly the class of bug a
same-session author cannot see and a cold second reader can. That is the
reason for the two-pass structure - it is not a formality and the audit pass
should not be run as one.

**Read `CLAUDE.md` first, every invocation** - its "Curriculum authoring"
section names the binding docs (`CURRICULUM.md`, `QUIZ_FRAMEWORK.md`,
`pending-content.md`, `pending-chapters.md`) and this skill assumes their
contracts rather than restating them. This skill is a *process* wrapper
around that contract, not a replacement for reading it.

## Parse the invocation

Two positional args, one optional flag:

1. **Mode** - `draft` or `audit`. If the user's request doesn't say which
   (e.g. they just named a chapter), ask - don't guess. A request that
   sounds like "write 0.3" is `draft`; "review/proofread/audit/have Opus
   check 0.3" is `audit`.
2. **Target** - a chapter id (`bb-0-2-what-is-system-design`), a curriculum
   slug (`0-2-what-is-system-design`), or a plain number (`0.2`, `3.4`).
   Resolve it against `src/curriculum/manifest.ts` (slug/number) and
   `src/content/chapters/index.ts` (id) before doing anything else - if it
   doesn't resolve, say so rather than guessing which chapter was meant.
3. **`--scope`** (optional, default `full`) - which deliverable(s) this
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
     `problemStatement`, `learningObjectives`, `curriculumContext`,
     `availableComponentIds`/`requiredComponentIds`, `validationRuleIds`.

   A scoped `draft` or `audit` still requires reading the whole chapter for
   context (a quiz revision that contradicts the lesson is a new bug, not a
   fix) - "scope" bounds what gets *edited* and what the report focuses on,
   never what gets *read*.

## Mode: `draft`

Read `reference/draft.md`, then follow it. Short version: gather context
(the chapter's brief in `CURRICULUM.md`, the framework sections for its
type, `QUIZ_FRAMEWORK.md` if scope touches the quiz, `pending-chapters.md`
for what's already decided/blocked, a already-shipped chapter as a style/
structure precedent), author the scoped deliverable(s) yourself as Sonnet,
run the pipeline, update the ledger, and **stop** - present the diff to the
user and wait. Do not chain into `audit` automatically, even for a `full`
draft. The user reads the Sonnet draft first, on its own, every time - that
sequencing is what makes the second pass a genuine second opinion instead of
a rubber stamp of your own work five minutes later.

## Mode: `audit`

Read `reference/audit.md`, then follow it. Short version: confirm a draft
actually exists for the requested scope (refuse to "audit" nothing), spawn
a `model: opus` Agent with the prompt template in that file filled in for
the resolved chapter and scope, run it in the foreground (you need its
result before you can verify it), and then **independently verify its
self-report** before relaying anything to the user - re-run the pipeline
yourself, spot-check at least two of its specific claims against the actual
diff, and confirm the ledger entry it wrote is accurate. An agent's report
of what it did is a claim, not a fact, until you've checked it against the
working tree yourself (this is the same discipline the top-level system
prompt asks of every subagent report - it doesn't relax for this skill).

## Constants across both modes

- **Never commit, push, or create a branch.** Both passes leave the working
  tree with real, reviewable, uncommitted changes. The user commits, per
  `CLAUDE.md`'s branching/review policy.
- **Always update `.claude/docs/pending-chapters.md`** as the last step - a
  `draft` gets a new or extended ledger entry (deliverables table, judgment
  calls); an `audit` appends an "Opus proofread pass" subsection to the
  existing entry (what was checked, what changed and why, what was checked
  and deliberately left alone). Never batch this for later.
- **Always finish with a green local pipeline** -
  `npx tsc --noEmit -p .`, `npm run lint`, `npx vitest run`, `npm run build`.
  Fix anything broken before declaring the pass done, in either mode.
- **The quiz positional-bias guard is per-chapter, not registry-wide.**
  `quiz-invariants.test.ts` catches a single chapter's single-choice answers
  clustering on one letter, a matching question's diagonal, or a pre-solved
  ordering question - it does *not* catch a pattern that only shows up
  across chapters (e.g. two different chapters both defaulting to "b" for
  their first question). Glance at sibling chapters' answer-letter
  sequences by eye during a `quiz`-scope pass; don't rely on CI alone for
  this one.
- **A scoped pass still respects the full authoring contract.** A `quiz`
  audit that fixes distractors but breaks the chapter's difficulty ramp, or
  a `hints` draft that gives away the answer, is not done just because it
  stayed inside its file boundary.

## How to invoke this in a future session

- `/chapter-author draft 3.4` - author 3.4 Load Balancer end to end (all six
  deliverables), as Sonnet, then stop for review.
- `/chapter-author audit 3.4` - once you've read Sonnet's 3.4 draft, run the
  Opus proofread/correct pass on the whole chapter.
- `/chapter-author draft 1.6 --scope quiz` - 1.6 is already authored and
  shipped, but you want a new/revised quiz for it specifically.
- `/chapter-author audit bb-0-3-interview-design-vs-production-engineering --scope hints` -
  audit just the hints on an already-drafted 0.3, addressed by chapter id
  instead of number.
- Plain English also works - "have Sonnet draft the RWE Bitly blueprints"
  or "get Opus to audit 0.2's quiz again" resolve to the same two branches
  above; you don't need the exact command syntax.
