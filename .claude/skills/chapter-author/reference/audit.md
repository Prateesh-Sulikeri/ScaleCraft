# Audit mode

You are not the editor here - an Opus subagent is. Your job is to brief it
well, let it work, and then verify what it claims to have done before you
ever repeat it to the user.

**Opus is a content auditor, not an engineer or test writer, and its
checklist is scoped to six things only: content, content-structure,
blueprints, component-lists, submit validations, and diagrams.** It does not
write tests, run `tsc`/`lint`/`vitest`/`build`, or run Playwright, and it
does not audit quiz, hints, or definition metadata (problem statement,
learning objectives, `curriculumContext`) right now - Sonnet's draft pass
owns getting those right unsupervised. Brief the agent with exactly this
scope; don't hand it the old "audit everything" framing.

## 1. Precondition

Confirm a real draft exists for the requested scope (the lesson file, the
`ChapterDefinition`'s quiz array, etc. actually has content, not a
placeholder). If it doesn't, stop and tell the user - there's nothing to
audit yet; point them at `draft` mode instead.

## 2. Resolve what the agent needs to know

Before writing the prompt, work out:

- **`{{CHAPTER_TITLE}}` / `{{CHAPTER_ID}}` / `{{SLUG}}`** - from
  `src/curriculum/manifest.ts` and `src/content/chapters/index.ts`.
- **File paths for the scope, filtered to the six-area checklist.** For
  `lesson`: `public/content/chapters/{{CHAPTER_ID}}.md` only (content +
  diagrams). For `full`: that file, plus `src/content/chapters/specs/
  {{CHAPTER_ID}}.spec.md` (content-structure), plus only the `blueprints`,
  `availableComponentIds`/`requiredComponentIds`, and `validationRuleIds`
  fields of the `ChapterDefinition` in `src/content/chapters/index.ts` -
  **not** its `quiz`, `hints`, `problemStatement`, `learningObjectives`, or
  `curriculumContext` fields, those are out of scope for this pass
  regardless of the requested scope. If the user's scope is `quiz` or
  `hints` specifically, there is nothing in Opus's checklist that applies -
  say so and don't launch the agent (see step 1's precondition in spirit:
  there's no audit to run).
- **One precedent chapter** already shipped (ideally one that's already
  been through its own audit pass) for voice/structure comparison -
  currently `bb-0-1-welcome` and, once it exists, `bb-0-2-what-is-system-design`.
- **`{{BACKGROUND}}`** - a short paragraph on what's already been decided or
  fixed for this draft, pulled from `.claude/docs/pending-chapters.md`'s
  entry for this chapter, so the agent doesn't burn its pass re-discovering
  or re-litigating settled calls. Still tell it to *verify* those calls
  hold, not just take them on faith - "already decided" and "actually
  correct" are different claims.
- **`{{DO_NOT_TOUCH}}`** - anything genuinely out of scope for a content
  pass. This always includes: engineering surfaces (`curriculum/
  progress.ts`, `ChapterReader.tsx`, the validation engine's rule
  implementations, anything under `src/canvas/`, `src/tour/`) unless the
  user explicitly asked for an engineering review too; writing or running
  tests, the CI pipeline, or Playwright, full stop; and - standing
  restriction, not scope-dependent - the `quiz` array, `hints` array, and
  `problemStatement`/`learningObjectives`/`curriculumContext` fields, even
  on a `full` pass. If the agent notices something off in one of those
  while reading for context, tell it to record an open note rather than
  touch it.

## 3. Launch the agent

`subagent_type: "general-purpose"`, `model: "opus"`, `run_in_background:
false` (you need its result before you can verify it - there's no other
work to parallelize against a single chapter audit). Fill this template
completely; do not paraphrase it down, the specificity is what makes the
pass real instead of generic:

```
You are doing an editorial audit pass for ScaleCraft (an interactive
system-design learning app). Read `/home/prateesh/projects/ScaleCraft/CLAUDE.md`
first for repo conventions - note its graphify hook is mandatory before
reading source files, and note the "no em dash, use '-'" content rule.

**You are a content auditor, not an engineer or test writer.** Do not write
tests, do not run `tsc`/`lint`/`vitest`/`build`, and do not run Playwright -
none of that is in scope for this pass, on this chapter or any other file.
Your checklist is six things only: content, content-structure, blueprints,
component-lists, submit validations, and diagrams. The quiz, hints, and the
`problemStatement`/`learningObjectives`/`curriculumContext` fields are
explicitly **not** yours to audit right now, even if you notice something -
leave them alone and note it instead of fixing it.

## Background

{{BACKGROUND}}

The user wants a genuine second-opinion editorial pass on {{CHAPTER_TITLE}}
({{SCOPE}} scope), done by you (Opus) after a Sonnet draft. **This is a real
test of your judgment, not a formality** - find something real if something
real is there; don't manufacture busywork edits to look productive, and
don't rubber-stamp a draft that has actual problems just because it already
passed CI.

## What to review

{{FILE_LIST}}

For voice/structure precedent (already-shipped, already-reviewed):
{{PRECEDENT_FILES}}

The framework you're grading against: `.claude/docs/CURRICULUM.md` (read in
full at least §5, §6, §9, §13, §16, §18.2, §19, §20 - especially §20.6, the
binding density rule) and `.claude/docs/QUIZ_FRAMEWORK.md` §1-4 if this pass
touches the quiz. Release/ledger context:
`.claude/docs/pending-content.md` and `.claude/docs/pending-chapters.md`
(this chapter's own ledger entry has the full history - read it before
forming opinions so you don't re-flag what's already resolved).

## What to actually check

Use judgment within the six areas below, this is not a checklist to
rubber-stamp - but it is also not an invitation to expand scope. Stay off
the quiz, hints, and definition metadata even if something there catches
your eye; note it, don't fix it.

1. **Content** - the lesson prose itself: accuracy of any factual/
   production claims, density (§20.6 - both directions, cut what doesn't
   earn its place AND flag what's now under-explained), voice (§20.1, no em
   dash), whether every "Next"/preview correctly names the chapter that
   actually comes next per `src/curriculum/manifest.ts`, whether any
   vocabulary used has actually been taught by this point in the sequence
   (§18.2 rule 1).
2. **Content-structure** - structural completeness against §5.3's beat
   order and §6's mandatory-section table for the chapter's type; any
   declared omission has real written justification, not silent absence.
3. **Blueprints** - at least one honest `require` pattern; multiple only
   when there's genuinely more than one right answer; `commentary` stays
   debrief-only; the blueprint isn't already satisfied by `starterGraph`
   (would hand the exercise over solved).
4. **Component-lists** - `availableComponentIds`/`requiredComponentIds`
   against §16's component budget: nothing appears before its home chapter
   without a declared, narrow, spec-recorded exception.
5. **Submit validations** - `validationRuleIds` actually gate what the
   exercise claims to test, and reference real rules in
   `src/validation-engine/rules/index.ts` (read-only check - implementing
   or fixing a rule's code is out of scope, flag it as a note instead).
6. **Diagrams** - every diagram has a one-line caption naming what to
   notice (§7.2, §20.3), and the diagram itself is accurate to the prose
   around it.

## If you find real issues

Fix them directly - edit the files, within the six-area checklist only.
Keep the draft's overall structure and voice unless there's a real defect;
this is a proofread/correct pass, not a rewrite. If you touch the lesson
body, bump `lessonVersion` in the `ChapterDefinition` (see its current
value) with a short revision comment, matching the existing convention in
the file.

**Do not touch:** {{DO_NOT_TOUCH}} - and, as a standing rule regardless of
what `{{DO_NOT_TOUCH}}` says: the quiz array, the hints array, and
`problemStatement`/`learningObjectives`/`curriculumContext`.

## Before you finish

1. Update `.claude/docs/pending-chapters.md`'s entry for this chapter with
   an "Opus proofread pass" subsection: what you checked, what you changed
   and why (or confirmed and left alone, and why), any new judgment calls
   or open decisions worth flagging for later chapters.
2. **Do not run `tsc`/`lint`/`vitest`/`build`, and do not run Playwright.**
   This is a content-only pass - no pipeline verification is expected of
   you.
3. **Do not commit, do not push, do not create a branch.** Leave everything
   as uncommitted working-tree changes - the user reviews before anything
   is committed.

## Report back

Be concrete and complete - the user will read this directly, so don't
over-compress. Structure it as: (1) what you changed, with a short
before/after for each material edit and the reasoning; (2) what you
specifically checked and deliberately left alone, and why; (3) any open
notes on quiz/hints/definition metadata you noticed but didn't touch
(out of scope for this pass); (4) your honest one-paragraph verdict on
whether this was ready to ship as drafted, or genuinely needed this pass.
```

## 4. Verify independently before relaying anything

The agent's report is a claim, not a fact. Before you summarize it to the
user:

- `git status --short` and `git diff --stat` - does the set of touched
  files match what the agent said it touched, and nothing outside
  `{{DO_NOT_TOUCH}}` (including the standing quiz/hints/definition
  exclusion)? No pipeline run to verify here - neither pass runs one, by
  design.
- Spot-check at least two of its specific factual claims against the actual
  diff (e.g. if it says "Q5's options reordered so the correct answer is
  at d", read the file and confirm). Pick the claims that would be most
  embarrassing if wrong, not the easiest ones to check.
- Confirm `.claude/docs/pending-chapters.md` was actually updated, and that
  what it says matches the diff.
- Confirm nothing was committed, pushed, or branched
  (`git log --oneline -3`, `git branch --show-current`).

If verification turns up a discrepancy - a claimed fix that isn't in the
diff, a file it touched outside the six-area scope or the standing quiz/
hints/definition exclusion - tell the user that plainly rather than
smoothing it over. That
discrepancy is exactly the kind of thing this two-pass model exists to
surface.

## 5. Report to the user

Relay the agent's structured findings (changed / checked-and-left-alone /
open notes / verdict), but as *your* verified summary, not a raw paste -
note explicitly that you independently confirmed the diff yourself rather
than only reporting what the agent claimed.
