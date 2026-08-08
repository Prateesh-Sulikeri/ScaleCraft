# Audit mode

You are not the editor here - an Opus subagent is. Your job is to brief it
well, let it work, and then verify what it claims to have done before you
ever repeat it to the user.

## 1. Precondition

Confirm a real draft exists for the requested scope (the lesson file, the
`ChapterDefinition`'s quiz array, etc. actually has content, not a
placeholder). If it doesn't, stop and tell the user - there's nothing to
audit yet; point them at `draft` mode instead.

## 2. Resolve what the agent needs to know

Before writing the prompt, work out:

- **`{{CHAPTER_TITLE}}` / `{{CHAPTER_ID}}` / `{{SLUG}}`** - from
  `src/curriculum/manifest.ts` and `src/content/chapters/index.ts`.
- **File paths for the scope**, e.g. for `lesson`:
  `public/content/chapters/{{CHAPTER_ID}}.md` only; for `full`: that file
  plus `src/content/chapters/specs/{{CHAPTER_ID}}.spec.md` plus the
  `ChapterDefinition` object in `src/content/chapters/index.ts`.
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
  pass: for any content scope, this always includes engineering surfaces
  (`curriculum/progress.ts`, `ChapterReader.tsx`, the validation engine,
  anything under `src/canvas/`, `src/tour/`) unless the user explicitly
  asked for an engineering review too. For a scope narrower than `full`,
  it also includes the chapter's *other* deliverables - a `quiz`-scope
  audit edits the quiz, not the lesson prose, even if it notices something
  it would phrase differently there (record that as an open note instead).

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

Use judgment, this is not a checklist to rubber-stamp. At minimum: accuracy
of any factual/production claims; density (§20.6 - both directions, cut
what doesn't earn its place AND flag what's now under-explained); voice
(§20.1, no em dash including inside the quiz); structural completeness
against §5.3/§6 for the chapter's type; for a quiz scope, read every
question fresh as if sitting the exam, and independently re-verify by eye
(not by trusting CI) that single-choice answers aren't clustered on one
letter, matching questions aren't diagonal, and ordering questions aren't
pre-solved; `curriculumContext` honesty against what the chapter actually
assumes and teaches; whether every "Next"/preview correctly names the
chapter that actually comes next per `src/curriculum/manifest.ts`; whether
any vocabulary used has actually been taught by this point in the sequence
(§18.2 rule 1).

## If you find real issues

Fix them directly - edit the files. Keep the draft's overall structure and
voice unless there's a real defect; this is a proofread/correct pass, not a
rewrite. If you touch the lesson body, bump `lessonVersion` in the
`ChapterDefinition` (see its current value) with a short revision comment,
matching the existing convention in the file. If you touch the quiz,
re-verify against `quiz-invariants.test.ts`'s three positional-bias guards
yourself before finishing, don't just rely on CI to catch a regression.

**Do not touch:** {{DO_NOT_TOUCH}}

## Before you finish

1. Update `.claude/docs/pending-chapters.md`'s entry for this chapter with
   an "Opus proofread pass" subsection: what you checked, what you changed
   and why (or confirmed and left alone, and why), any new judgment calls
   or open decisions worth flagging for later chapters.
2. Run the full local pipeline and confirm it's green:
   `npx tsc --noEmit -p .`, `npm run lint`, `npx vitest run`, `npm run build`.
   Fix anything you broke.
3. **Do not commit, do not push, do not create a branch.** Leave everything
   as uncommitted working-tree changes - the user reviews before anything
   is committed.

## Report back

Be concrete and complete - the user will read this directly, so don't
over-compress. Structure it as: (1) what you changed, with a short
before/after for each material edit and the reasoning; (2) what you
specifically checked and deliberately left alone, and why; (3) pipeline
status; (4) your honest one-paragraph verdict on whether this was ready to
ship as drafted, or genuinely needed this pass.
```

## 4. Verify independently before relaying anything

The agent's report is a claim, not a fact. Before you summarize it to the
user:

- `git status --short` and `git diff --stat` - does the set of touched
  files match what the agent said it touched, and nothing outside
  `{{DO_NOT_TOUCH}}`?
- Re-run the pipeline yourself (`npx tsc --noEmit -p .`, `npm run lint`,
  targeted `npx vitest run` on the touched areas at minimum, ideally the
  full suite and build) - don't take "all green" on the agent's word.
- Spot-check at least two of its specific factual claims against the actual
  diff (e.g. if it says "Q5's options reordered so the correct answer is
  at d", read the file and confirm). Pick the claims that would be most
  embarrassing if wrong, not the easiest ones to check.
- Confirm `.claude/docs/pending-chapters.md` was actually updated, and that
  what it says matches the diff.
- Confirm nothing was committed, pushed, or branched
  (`git log --oneline -3`, `git branch --show-current`).

If verification turns up a discrepancy - a claimed fix that isn't in the
diff, a pipeline command it didn't actually run, a file it touched outside
scope - tell the user that plainly rather than smoothing it over. That
discrepancy is exactly the kind of thing this two-pass model exists to
surface.

## 5. Report to the user

Relay the agent's structured findings (changed / checked-and-left-alone /
pipeline / verdict), but as *your* verified summary, not a raw paste - note
explicitly that you independently confirmed the diff and pipeline rather
than only reporting what the agent claimed.
