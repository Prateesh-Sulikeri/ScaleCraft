# Adding a Chapter Manually

How to author a Building Blocks or Real World Extraction chapter by hand,
touching the files directly, without invoking the `chapter-author` skill's
Sonnet-draft / Opus-audit process.

**Read this only if you're deliberately skipping the skill.** The skill
(`.claude/skills/chapter-author/`) exists because a same-session author
reliably misses a class of bug a cold second reader catches - wrong "Next"
previews, forward-referenced vocabulary, unpaid-off cold opens. Going
manual means you are both passes yourself, so the self-checks in this doc
are not optional extras, they're standing in for the audit pass you're not
running. Good reasons to go manual: a small structural fix to an already-
shipped chapter, wiring work that isn't really content authoring, or you
just want to understand what the skill automates. Prefer `/chapter-author`
for anything that's actually new curriculum prose.

Every binding rule here is inherited from `CLAUDE.md`'s "Curriculum
authoring" section - this doc is a file-level checklist, not a second
copy of the contract. Read `.claude/docs/CURRICULUM.md` (especially §5,
§6, §16, §20) and `.claude/docs/QUIZ_FRAMEWORK.md` before writing a word.

## Before you start

1. Check `.claude/docs/pending-content.md` for which wave the chapter
   belongs to and its deliverable contract, and `.claude/docs/pending-
   chapters.md`'s "Status at a glance" table so you don't duplicate or
   contradict work already done.
2. Check `.claude/docs/pending-chapters.md`'s "Open decisions blocking or
   shaping later chapters" section - don't start a chapter a live blocker
   names.
3. Resolve the chapter's row in `CURRICULUM.md` §14 (Building Blocks) or
   §15 (Real World Extraction) - that row is the brief: Purpose / Type /
   New / Assumes / Prepares for / Interview / Exercise / Est.
4. Read one already-shipped chapter's lesson + spec together as a
   structure/voice precedent (e.g. `bb-1-6-drawing-the-first-
   architecture.mdx` + its spec). Match its register; don't reinvent
   formatting.

## The six deliverables

| # | Deliverable | File |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/<id>.spec.md` |
| 2 | Lesson (MDX) | `public/content/chapters/<id>.mdx` |
| 3 | `ChapterDefinition` | `src/content/chapters/index.ts` |
| 4 | Validation rules | `src/validation-engine/rules/` (only if the exercise needs a new one) |
| 5 | Quiz | The `quiz` array on the `ChapterDefinition` |
| 6 | Playtest pass | Written into the spec |

A scoped edit (e.g. "just fix the quiz on an already-shipped chapter")
only touches its one file, but still needs a full read of the chapter for
context - a quiz revision that contradicts the lesson is a new bug.

## Step by step, in file order

### 1. Manifest row - `src/curriculum/manifest.ts`

Find the chapter's existing `CurriculumChapter` entry (every curriculum
row already exists here, even unauthored ones) and set
`chapterDefinitionId` to the id you're about to create in `index.ts`. Do
not touch `slug`, `number`, or reorder chapters - `slug` is a route
segment and a persistence key (Dexie `CurriculumProgress`), renaming it
after release orphans progress rows and breaks bookmarks. Confirm
`prerequisiteSlugs` still points at the chapter that actually precedes
this one.

### 2. Chapter spec - `src/content/chapters/specs/<id>.spec.md`

Author the spec before the lesson - it's what a reviewer checks the
prose against. Fill in CURRICULUM §5's blueprint fields: metadata table,
learning objectives with category tags (§5.2), a per-beat outline
referencing the lesson's actual section headings, declared omissions
with real written justification (never silent omission), a component-
budget note per §16, a validation-rules note, a quiz note, and the
playtest pass answering §18.2's binding question: which prior chapter
taught each move this exercise requires. Every move needs a named
source, or the chapter has a sequencing bug, not something to paper over.

### 3. Lesson - `public/content/chapters/<id>.mdx`

- File is fetched server-side and compiled via `/api/lessons/[chapterId]`
  (see `getLessonMdxFilename` in `src/content/chapters/lessons.ts`). All
  14 authored chapters are MDX now; there is no reason to author a new
  chapter as legacy `.md`.
- Don't open with a top-level `#` heading - `ChapterReader` already
  renders `ChapterDefinition.title` as the page h1. Start at the intro
  paragraph or a `##` section.
- Follow CURRICULUM §5.3's beat order and §6's mandatory sections for the
  chapter's type. Merging short adjacent sections is allowed; reordering
  is not.
- Diagrams: Mermaid fences (` ```mermaid `) for process flows and
  decision trees; a `<Walkthrough>` component for a step-by-step
  interactive topology walk (see the `walkthrough-diagram` skill - it's a
  separate authoring pipeline with its own validation harness, not
  something to hand-write). Every diagram needs a one-line caption naming
  what to notice (§7.2, §20.3). ScaleCraft topology diagrams as real
  graph JSON in the lesson body aren't supported yet - see
  `pending-chapters.md`'s open decision #3 before assuming a shape here.
- Callouts use the `> [!NOTE]` GFM-admonition syntax (see any shipped
  chapter's "Think first" prompts).
- The glossary `<Ref id="...">term</Ref>` inline-popover tag is available
  (`src/chapters/glossary/`) but is a pilot on one chapter so far - only
  reach for it if the term is already registered there, don't wire a new
  glossary entry as a side quest to authoring a chapter.
- **Writing register**: assume engineering literacy, not prerequisite
  knowledge. Write like a senior engineer explaining to another engineer,
  not a textbook. General engineering terms with no ScaleCraft home
  chapter get a brief in-clause gloss, not a definition paragraph.
  ScaleCraft-taught vocabulary with a later home chapter (a named loop, a
  numbered law) never appears inline - it needs a marked forward tease.
  Check every proper-noun/numbered-thing you use against
  `curriculumContext.masteredConcepts` for chapters already assumed, not
  your own knowledge of the whole curriculum. Full guidance and worked
  examples: `.claude/skills/chapter-author/reference/draft.md`'s "Writing
  register" section - read it even when not running the skill, it's the
  most detailed version of this rule.
- Density (§20.6, the highest-priority style rule): every sentence
  introduces, clarifies, or reinforces a concept, or it gets cut. Run
  this as a distinct revision pass against your own draft, not folded
  into first-draft writing.
- No em dash anywhere - use `-`. `authoring-invariants.test.ts` checks
  this mechanically for any chapter without `placeholder: true`.

### 4. `ChapterDefinition` - `src/content/chapters/index.ts`

Add an entry to the `chapterRegistry` array. Full field reference is
`src/content/chapters/types.ts`'s `ChapterDefinition` type (read its doc
comments - they're the authoritative source, not this list):

- `id` - matches the manifest's `chapterDefinitionId` and the lesson
  filename's basename.
- `mode` - `"building-blocks"` or `"real-world-extraction"`.
- `title` - short display name, distinct from `problemStatement`.
- `problemStatement` - long-form prose shown in the Question Pane.
- `learningObjectives` - testable statements, not "understand X"; one
  category per objective per §5.2 (Knowledge, Engineering, Practical,
  Interview, Communication - Practical may be omitted only for a
  justified no-build Concept chapter).
- `availableComponentIds` / `requiredComponentIds` - check against §16's
  component budget. Nothing appears in a palette before its home chapter
  without a declared, narrow, spec-recorded exception.
- `validationRuleIds` - real rule ids from `src/validation-engine/rules/
  index.ts`'s `ruleRegistry` (e.g. `single-instance-load-balancer`,
  `orphan-component`). Ignored entirely for `real-world-extraction` mode
  - RWE always runs the full registry regardless of what's listed here.
- `blueprints` - at least one honest `require` pattern (a `GraphPattern`,
  not a concrete graph - matching is containment, extra components are
  fine). Multiple only when the chapter genuinely has more than one
  right answer. `commentary` is debrief-only, never shown before a pass.
- `starterGraph` - if you add or change a blueprint, re-check this isn't
  already satisfying it (hands the exercise over solved -
  `authoring-invariants.test.ts` catches this, but design it right
  rather than relying on the test to bounce you).
- `hints` - 2-4, orienting before directional, never the answer itself.
- `readingLinks` - manual citation URLs into the private textbook only,
  no content coupling.
- `lessonVersion` - bump whenever the lesson body changes after first
  authoring, with a short revision comment inline, so `useMarkdownFile`'s
  cache knows a fetched copy is stale.
- `lessonFormat: "mdx"` - required for any new chapter; the unset/`"md"`
  default is legacy-only.
- `curriculumContext` - Building Blocks only. Transcribe from
  CURRICULUM.md's own Assumes/New/Prepares-for fields honestly - Deep
  Check depends on its accuracy, not on it sounding complete.
- `quiz` - see the dedicated quiz section below.
- `hasEditorExercise` - set `false` for a Concept chapter with no
  construction-family exercise (no components to build with). Needed
  because `deriveStatus` (`src/curriculum/progress.ts`) otherwise gates
  `COMPLETED` on a `chapterProgress` row that a Submit press writes -
  with no reachable Submit, the chapter can never complete. Every Part
  0/1 no-build chapter already sets this; reuse the pattern rather than
  re-deriving it.
- `editorTourId` - only set for a chapter that mounts a guided tour
  (currently just `"design-editor"` on 0.1). Leave unset otherwise.

**Quiz** (QUIZ_FRAMEWORK.md §1-4): reasoning over recall, every option
(chosen or not) carries a real `explanationMd`, distractors are positions
a reasonable engineer might actually hold, difficulty ramp roughly
30/45/25 across 1/2/3. Before finishing, check the three shapes that have
shipped as real bugs:

1. Single-choice correct answers aren't clustered on one letter across
   the chapter's own single-kind questions (a CI invariant test catches
   this per-chapter with 3+ such questions, but it's not registry-wide -
   glance at sibling chapters' answer-letter sequences by eye too).
2. A matching question's `pairs[i]`'s correct option is not `options[i]`
   for every `i` - a full derangement is the safe target.
3. An `ordering` question's authored `options` array is not already the
   correct sequence - `Ordering.tsx` displays it with no shuffle, so a
   naturally-ordered draft ships pre-solved.

### 5. Validation rules - only if the exercise needs one that doesn't exist

Check `src/validation-engine/rules/index.ts`'s `ruleRegistry` first. Each
rule is a small module under `src/validation-engine/rules/` implementing
`ValidationRule` (`src/validation-engine/types.ts`) and gets added to the
registry array. Writing and testing a new rule is engineering work with
its own test file, not a content-authoring afterthought - budget it as a
separate step, and remember a bare "invalid" is a bug: every failure must
explain itself unconditionally.

### 6. Registry-wiring test fixture - `src/content/chapters/index.test.ts`

This file hardcodes the full ordered list of chapter ids
(`chapters.map((c) => c.id)`) as a fixture. Add your new id in the
correct position or this test fails - it's not a content check, just
registry wiring every new chapter has to touch.

## Mechanical checks CI will enforce (know these before you write, not after)

- `authoring-invariants.test.ts` - every authored chapter has a sibling
  spec and a lesson body; no em dash anywhere in non-placeholder content;
  `requiredComponentIds` is a subset of `availableComponentIds` and both
  resolve to real registry ids; a starter graph never already completes
  the chapter; quizzes hold 3-6 questions; every option has a real
  explanation; single-answer questions have exactly one correct option
  and at least two distractors; questions ramp in difficulty.
- `quiz-invariants.test.ts` - question/option ids unique within scope;
  every question has 2+ options; `graph`/`correctOrder`/`pairs` present
  if and only if the question `kind` needs them, and reference real
  option ids; the three positional-bias shapes above.
- `walkthrough-invariants.test.ts` - only relevant if the lesson embeds a
  `<Walkthrough>` diagram; validates via the release 5.1.0-alpha
  normalize/layout pipeline (`src/chapters/walkthrough/`). Use the
  `walkthrough-diagram` skill to author one rather than hand-writing the
  props.

None of these substitute for a human reading the chapter - they catch
shape bugs, not whether the content is any good.

## Update the ledger

`.claude/docs/pending-chapters.md` is the completion record - update it
as the last step before treating the chapter as done, same as the skill
would:

- Add or extend the "Status at a glance" table row.
- Add a dated detail section: deliverables table, judgment calls made,
  any declared omissions or exceptions, word count.
- If you touched an existing chapter's entry, append rather than
  silently overwrite prior judgment calls.

## Verify before calling it done

Because there's no Sonnet-draft/Opus-audit split backing a manual
chapter, the full CI pipeline is not optional the way `CLAUDE.md`'s
general "run it on demand" guidance allows for other work - it's the
only mechanical check this path gets:

```
npm run typecheck && npm run lint && npm test && npm run build
```

Then read the whole chapter fresh, as if you were the second reviewer -
check the "Next" preview against `manifest.ts`, check every proper noun
against `curriculumContext.masteredConcepts`, check the cold open's
tension actually gets paid off somewhere later in the chapter.

## Branching

Same convention as everything else in this repo (`CLAUDE.md`'s "Git
branching" section): a `type/*` branch cut from the active `release/*`
branch, e.g. `content/1-10-caching-strategies`. Push it and stop - don't
merge, don't push to `develop` or `main`, don't open a PR unless asked.
