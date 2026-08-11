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
| 0.2 What is System Design? | **Authored (Opus proofread pass done)** | 2026-08-06 | `feature/content-0-1-welcome` (commit `d290339`) |
| 0.3 Interview Design vs. Production Engineering | **Authored + Opus pass (lesson scope)** | 2026-08-06 | `feature/content-0-1-welcome` |
| 0.4 The System Design Lifecycle | **Authored + Opus pass (lesson scope)** | 2026-08-06 | `feature/content-0-1-welcome` |
| 1.1 Understanding the Problem | **Authored (Sonnet draft, no Opus pass yet)** | 2026-08-08 | `feature/content-1-1-understanding-the-problem` |
| 1.2 Functional Requirements | **Authored (Sonnet draft, no Opus pass yet)** | 2026-08-08 | `feature/content-1-1-understanding-the-problem` |
| 1.3 Non-functional Requirements | **Authored + Opus pass (lesson/spec scope)** | 2026-08-09 | `feature/content-1-1-understanding-the-problem` |
| 1.4 Estimating Scale | **Authored (Sonnet draft, no Opus pass yet)** | 2026-08-09 | `feature/content-1-1-understanding-the-problem` |
| 1.5 Numbers Every Engineer Should Know | **Authored (Sonnet draft, no Opus pass yet)** | 2026-08-09 | `feature/content-1-1-understanding-the-problem` |
| 1.6 Drawing the First Architecture | **Authored + Opus pass (full scope)** | 2026-08-09 | `feature/content-1-1-understanding-the-problem` |
| 1.7 Identifying Bottlenecks | **Authored (Sonnet draft, no Opus pass yet)** | 2026-08-10 | `feature/content-1-7-identifying-bottlenecks` |
| 1.8 Engineering Trade-offs | **Authored (Sonnet draft, no Opus pass yet)** | 2026-08-10 | `feature/content-1-7-identifying-bottlenecks` |
| 1.9 Deep Dive Methodology | **Authored (Sonnet draft, no Opus pass yet)** | 2026-08-10 | `feature/content-1-7-identifying-bottlenecks` |
| 3.4 Load Balancer | **Authored (Sonnet draft, no Opus pass yet)** | 2026-08-11 | `feature/lesson-3-4-load-balancer` |
| 1.10 Communicating & Defending a Design | **Authored (Sonnet draft, no Opus pass yet)** | 2026-08-11 | `feature/content-1-10-communicating-and-defending-a-design` |
| 1.11 Driving a System Design Interview | **Authored (manual chapter-author-style pass, no cold audit yet)** | 2026-08-11 | `feature/content-1-10-communicating-and-defending-a-design` |
| RWE T1 Bitly | Placeholder (`rwe-dummy-1`), moved to Wave 2 | - | - |

Everything else in the 79 rows is unauthored (`chapterDefinitionId: null`).

**Wave 1 progress: 4 of 4 authored, all four through an Opus pass, merged into
`develop`/`main` (verified 2026-08-08 via PR #87/#88).** Wave 2 (Part 1)
started 2026-08-08 with 1.1; 1.2 followed the same day; 1.3 followed
2026-08-09; 1.4 followed the same day; 1.5 followed the same day; 1.6
followed the same day, closing Part 1. 1.1 and 1.2 have had their Opus pass
(content/structure/blueprints/component-lists/validations/diagrams scope;
quiz, hints and definition metadata not audited - see their own entries
below); this status line previously said otherwise and was corrected
2026-08-09 to match the detail sections and `index.ts`'s `lessonVersion: 2`.
1.3 has also had its Opus pass (lesson/spec scope). 1.4 and 1.5 are both
Sonnet drafts with no Opus pass yet. 1.6 has had its Opus pass (full
six-area scope) - it needed one more than any chapter so far this wave: it's
the first Building Block chapter (real components, a real starter graph, a
real Fix exercise), unlike every Concept/Process chapter before it, and the
pass found two factual errors in the draft's own account of its validation
rules plus a diagram caption making a false general claim about edge kinds.
1.7 followed on 2026-08-10, on its own branch
(`feature/content-1-7-identifying-bottlenecks`, stacked on top of this same
in-progress work so 1.1-1.6 are present as real prerequisite content - see
its own entry for the branch-topology decision). Sonnet draft, no Opus pass
yet. 1.8 followed the same day on the same branch. Sonnet draft, no Opus
pass yet. 1.9 followed the same day on the same branch. Sonnet draft, no
Opus pass yet.

**3.4 Load Balancer authored 2026-08-11**, pulled forward per
`pending-content.md`'s own Wave 2 definition, on its own branch
(`feature/lesson-3-4-load-balancer`, cut from
`release/v5.0.0-content-platform` rather than the Part 1 branch above - this
is Release 5.0.0-alpha content-platform work needing a real chapter to pilot
against, not a Part 1 continuation). Sonnet draft, no Opus pass yet. Real
prerequisite (3.3) isn't authored - see its own entry for the declared
exception.

**1.10 Communicating & Defending a Design followed 2026-08-11**, continuing
Part 1 directly after 1.9 on its own new branch
(`feature/content-1-10-communicating-and-defending-a-design`, cut from
`release/v5.0.0-content-platform` - the original 1.7-1.9 branch no longer
exists in this session, see its own entry above). Sonnet draft, no Opus pass
yet. Part 1's eight-step interview loop (0.4/§10.1) is now covered end to
end by 1.1-1.11. 1.11 is optional and intentionally gates nothing.

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

## 0.2 What is System Design?

- **Authored 2026-08-06 · not yet committed · branch `feature/content-0-1-welcome`**
  (same stacked branch as 0.1; a separate `feature/content-0-2-*` branch was
  not cut for this one chapter - see the process note below).
- Definition id `bb-0-2-what-is-system-design` · manifest slug
  `0-2-what-is-system-design`
- Type: Concept · foundational · 15 min (Reader + knowledge check, no build -
  see below) · prerequisite: 0.1
- **Lesson length: 808 words** (including Mermaid syntax; up from 696 after
  the user caught the forces going named-but-unexplained - see "User review
  caught two real gaps" below). **Now 1092 after the Opus proofread pass** -
  see that subsection for the breakdown.
- Pipeline green at latest revision: typecheck, lint, 1563 tests, build

**User review caught two real gaps before the Opus pass (2026-08-06).** Both
fixed in this same session, not deferred:

1. **The forces were named, never explained.** The first draft's "The five
   forces" section had a Mermaid diagram labeling each force in ~3 words and
   then moved straight to trade-off examples - beat 6 (core mechanics) was
   effectively skipped. Fixed by adding a 5-row table (force / what it
   measures / what failing looks like) right after the diagram, so each force
   gets a real definition plus a concrete symptom before the lesson uses it in
   an example. Diagram simplified to names-only now that the table carries
   the definitions, avoiding saying each one twice.
2. **`DesignEditorCTA` always showed "Begin exercise" with nothing behind
   it, and worse, the chapter could never be marked complete.** The first
   version of this spec (see git history) flagged this as a rough edge for a
   future pass. On the user asking "why do we even have the button", closer
   inspection found it was not just a UX wart: `deriveStatus`
   (`src/curriculum/progress.ts`) gated `COMPLETED` on a `chapterProgress` row
   that only a Submit press writes, and with `hasEditorExercise` not existing
   yet, 0.2 had no reachable Submit - the chapter could never complete on the
   Learning Path at all. Fixed with a new `ChapterDefinition.hasEditorExercise?:
   boolean` field (default true, every prior chapter unaffected):
   `ChapterReader` suppresses the CTA when it's `false`, and `deriveStatus`
   gates completion on the exam pass alone instead of a validation pass that
   can never be written. See spec §5 for the full before/after. Every future
   Part 0/1 Concept chapter without a build (0.3, 0.4, 1.2, 1.3, 1.5) reuses
   this field.

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-0-2-what-is-system-design.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-0-2-what-is-system-design.md` |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None - no canvas exercise, nothing to validate; justified in spec §7 |
| 5 | Quiz | 5 questions, difficulty ramp 1/1/2/2/3, first chapter to use `matching` kind |
| 6 | Playtest pass | Spec §9 |

**Process note, 2026-08-06 (experiment, user-directed):** authored directly by
Sonnet in this session rather than delegated to a fresh Opus lead-author pass,
as an explicit one-chapter experiment: the user wants to read Sonnet's draft
first, then have an Opus subagent proofread/correct it, then read that too,
before deciding whether this becomes the standing process for 0.3 onward. This
entry, the spec, the lesson, and the registry/quiz code are Sonnet's draft as
of this commit's parent state. **If the Opus pass changes the lesson or the
quiz, update this entry and `lessonVersion` rather than treating the Opus edit
as a silent fixup** - the point of the experiment is a visible before/after.

**Judgment calls made:**

- **No construction-family exercise - justified Concept-chapter exception
  (§11.1).** 0.2 introduces no components (all three primitives stay homed at
  1.6), so there is nothing to build with that wouldn't be a forward
  dependency. `availableComponentIds`/`requiredComponentIds` are both `[]`,
  `blueprints: []`, no `starterGraph`. The chapter's "trade-off pick" exercise
  (CURRICULUM §14's own words) is realized as the quiz's Q3 matching question
  instead - five described systems, each matched to its dominant force.
- **`hasEditorExercise: false` added and wired through** - see "User review
  caught two real gaps" above. Not left as a flagged rough edge: the CTA issue
  turned out to also break completion tracking entirely for this chapter,
  which is a functional bug, not cosmetic friction. **Every other Part 0/1
  chapter without a build (0.3, 0.4, 1.2, 1.3, 1.5) reuses this field** rather
  than needing its own fix.
- **Practical objective category omitted, per §5.2's own explicit carve-out**
  for pure Concept chapters with no construction-family exercise. Four
  objectives instead of five (Knowledge, Engineering, Interview,
  Communication).
- **Backward connections: 1, not §19's ≥2.** Same category of declared
  exception 0.1 recorded (there, zero were possible - 0.2 is chapter 2, so
  exactly one prior chapter, 0.1, exists to reference). Recorded honestly
  rather than padded.
- **Quiz introduces the `matching` kind** (Q2, Q3) - the first chapter to use
  anything other than `single`. Verified against the real scoring path
  (`evaluate.ts`'s `matching` branch, `Matching.tsx`'s dropdown-per-row UI)
  rather than assumed from the schema alone.
- **Quiz-wide positional bias, caught by the user across both authored
  chapters (2026-08-06), fixed in this session:**
  1. **Single-choice correct answers clustered on "b".** 6 of the 7
     single-kind questions across 0.1 and 0.2 had their correct option in
     position b - not by design, an authoring habit neither pass noticed
     until pointed out. Reordered options (content unchanged, only array
     position) to a:2/b:2/c:2/d:1 across the 7. Ids relabeled a-d to match
     new display order, matching the existing convention.
  2. **Both matching questions (Q2, Q3) were a diagonal identity mapping** -
     pair *i*'s correct option was `options[i]` for every *i*, so the
     dropdown position alone answered the question without reading it.
     Reordered each question's `options` array to a full derangement against
     its `pairs` order (`pairs` themselves unchanged).
  3. **Ordering questions have the same latent risk, unauthored so far.**
     Neither chapter uses `kind: "ordering"` yet, so there was nothing to fix
     in content, but `Ordering.tsx`'s initial displayed sequence is exactly
     the authored `options` array order (`ExamQuestionBody.tsx:78`) - an
     author who writes options in already-correct order (natural to do, and
     exactly what QUIZ_FRAMEWORK.md §5's own bank text does for readability)
     would ship a pre-solved exercise.
  4. **Diagram-kind questions (`graph` + `ReadOnlyGraphSummary`) were checked
     against a real-browser claim ("never really worked") and found to
     actually render and work** - navigated `/dev/diagram-question-lab` with
     Playwright, zero console errors, radios interactive, screenshot
     confirms category-color dots + edge-kind glyphs render per fixture.
     Neither chapter authors a diagram question, so this wasn't a content
     bug to fix - noted here because the claim didn't reproduce and is worth
     asking the user what they actually saw, rather than silently treating it
     as resolved.

  **Systemic fix, not just content patches:** added three registry-wide
  invariant tests to `src/content/chapters/quiz-invariants.test.ts` so this
  class of bug fails CI rather than shipping again - a chapter's single-choice
  correct answers can't all share one position (once it has ≥3 such
  questions), a matching question's correct-option sequence can't be an
  index-for-index copy of its options array, and an ordering question's
  authored array can't already equal `correctOrder`. These are mechanical
  shape checks, not content-quality judgments - a human still has to check
  whether the distractors are any good.
- **No new density revision pass performed as a distinct step.** Unlike 0.1
  (a documented 47% cut from a bloated first draft), this draft was written
  once, directly against §20.6's density rule rather than drafted long and
  then trimmed - 696 words for 15 minutes of Reader-only content is
  proportionate to 0.1's 667 words for 10 combined minutes. Flagged here so a
  reviewer checks this claim rather than trusting it, since the same claim
  self-assessed on a first draft is exactly what 0.1's process warns against.

**Opus proofread pass (2026-08-06, uncommitted working tree).** The experiment
above, run. Not a rubber stamp and not a rewrite: Sonnet's structure, section
order, and voice were kept intact, and six framework defects were fixed. Full
before/after reasoning lives in the chapter spec's new §10; the short version:

| # | Defect | Framework rule | Fix |
|---|---|---|---|
| 1 | "Next" previewed 1.3 and never mentioned 0.3, the chapter that actually follows | §6 (Preview of next chapter is mandatory, must create pull) | Rewrote "Next" to preview 0.3's interview-vs-production tension; 1.3 kept as the separate, explicitly-further-out beat-14 tease |
| 2 | Interview lens opened with "Loop step 2, Requirements" | §18.2 rule 1 / §20.5 (no forward dependencies) | The numbered Interview Loop (§10.1) is not introduced until 0.4 and not taught until 1.2-1.3. It also collides with 0.1, which used "the loop" for the Reader-to-Editor loop. Rewritten in this chapter's own vocabulary |
| 3 | No "what a senior answer sounds like" line | §10.3 (binding on every Interview lens) | Added one, built only from vocabulary this chapter teaches |
| 4 | Primary diagram had no caption | §7.2 / §20.3 (every diagram captions what to notice) | Added; 0.1 already complied, 0.2 did not |
| 5 | Cold open (cache vs. read replica) was never paid off | §5.3 beat 1-2 | Resolved in the core-mechanics section as latency-vs-throughput, which is both the answer and a real distinction worth teaching |
| 6 | Two loose trade-off claims | §20.2 (honest simplification), internal consistency | The cache example claimed a cache "cuts cost" while "Ways to misread this" said a cache *costs* - both true, contradictory as written. And the synchronous-replication example named only the latency cost, when unreachable-replica write stalls also spend availability - the same distinction Q5 tests two sections later. Also dropped "consistency-first" from the Stripe example: consistency is undefined here and deferred to 3.22 |

Also added an in-lesson honesty note that five is the working set rather than
an exhaustive list of design concerns, with the matching
`curriculumContext.simplifications` entry (§20.2 requires stated simplifications
to be recorded there, since Deep Check reads them).

- **Lesson length: 1092 words** by `wc -w` (the 808 above is the pre-pass figure
  from Sonnet's entry; measured the same way the delta is roughly +240 words, and
  0.1's 667 words for 10 minutes scales to about 1000 for this chapter's 15, so
  the result is still proportionate). Net additions, not padding: the cold-open
  payoff, the diagram caption, the senior-answer line, the 0.3 preview, and the
  scope-honesty note are all beats §6/§7/§10 require and the draft was missing or
  under-weight on. Each was written to the §20.6 test before it went in.
- **Quiz: one reorder, nothing else.** Q5's correct option moved to `d`. Q1's
  sits at `b` and Q4's at `c`; leaving Q5 at `b` put 2 of this chapter's 3
  single-kind questions on the same letter - which passes the new invariant test
  but reproduces the exact habit the test was added to catch. Both matching
  questions were re-verified by hand as full derangements (Q2 and Q3 both hold;
  no pair's correct option sits at its own index). Distractors, the 1/1/2/2/3
  ramp, and every `explanationMd` were read fresh as if taking the exam and left
  alone. Q1's weakest distractor ("It is mostly about databases") is verbatim
  from QUIZ_FRAMEWORK §5's own bank Q1, so it stays.
- **`lessonVersion` 1 -> 2**, with the revision comment in `index.ts` per 0.1's
  convention.
- **Checked and deliberately left alone:** the Stripe and Netflix examples are
  defensible public decisions rather than implementation tourism (§13), and the
  lens-9 "neither is universal" closer is present; the availability/durability
  distinction is technically sound; `curriculumContext`'s mastered /
  not-yet-introduced lists are accurate (1.3 NFRs, 1.6 components, 3.22
  consistency each verified against §14); spec §4's declared omissions all still
  hold; the `hasEditorExercise` mechanism, `progress.ts`, `ChapterReader.tsx`
  and the manifest wiring were out of scope and untouched.
- **Verdict on the experiment:** the draft was structurally sound and would not
  have embarrassed anyone, but items 1 and 2 are real sequencing bugs of exactly
  the kind §18.2 calls spec bugs, and both would have shipped. Two new
  cross-chapter issues also surfaced only because a second reader came at it
  cold (open decisions 4 and 5 below).

---

## 0.3 Interview Design vs. Production Engineering

- **Authored 2026-08-06 · not yet committed · branch `feature/content-0-1-welcome`**
  (same stacked branch as 0.1/0.2 - no separate `feature/content-0-3-*` branch cut,
  consistent with 0.2's precedent).
- Definition id `bb-0-3-interview-design-vs-production-engineering` · manifest slug
  `0-3-interview-design-vs-production-engineering`
- Type: Concept · foundational · 15 min (Reader + knowledge check, no build) ·
  prerequisite: 0.2
- **Lesson length: 1156 words after the Opus pass** (896 as drafted; 15 min.
  Against 0.2's post-pass 1092 for the same estimate and 0.1's 667 for 10 min -
  see the density note below and the Opus-pass subsection for why it grew)
- Pipeline green at this revision: typecheck, lint, 1566 tests, build

**Wave-order note (2026-08-06, user-directed).** Drafted out of the previously
documented wave order - Wave 1 originally owned 1.6/3.4/RWE Bitly, not Part 0's
remainder. The user redefined Wave 1 as Part 0 only (0.1-0.4) in this same session;
see `pending-content.md`'s wave section and this file's "Wave 1 progress" line above
for the corrected plan. 1.6, 3.4, and RWE Bitly moved to Wave 2.

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-0-3-interview-design-vs-production-engineering.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-0-3-interview-design-vs-production-engineering.md` |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None - no canvas exercise, nothing to validate; justified in spec §7 |
| 5 | Quiz | 5 questions, difficulty ramp 1/1/2/2/3, first chapter to use `multi` kind |
| 6 | Playtest pass | Spec §9 |

**Judgment calls made:**

- **No construction-family exercise - justified Concept-chapter exception (§11.1),
  same as 0.2.** No components introduced (all three primitives stay homed at 1.6).
  `availableComponentIds`/`requiredComponentIds` both `[]`, `blueprints: []`, no
  `starterGraph`. CURRICULUM §14's own row for 0.3 already states "Exercise: none
  (quiz-weighted)" - no divergence to flag here, unlike 0.1's built-vs-spec gap.
- **`hasEditorExercise: false` reused, not re-derived.** 0.2's spec fixed the
  underlying CTA/completion mechanism and explicitly flagged 0.3 as a future reuse
  case. No new engineering work this chapter - just setting the field.
- **Practical objective category omitted**, same explicit §5.2 carve-out 0.2 used.
  Four objectives (Knowledge, Engineering, Interview, Communication).
- **Backward connections: 2, meeting §19's ≥2** (0.1 and 0.2 - unlike 0.1 and 0.2
  themselves, which each had fewer prior chapters available to cite). 0.2's
  "justified complexity" test is used substantively in the lesson body (the "Same
  brief, two registers" section) *and* named explicitly again in "Next" per §19's
  literal "beat 14" placement requirement - a deliberate double-appearance, not
  padding: one use is applying the concept, the other is the explicit cross-reference
  signpost the rule asks for.
- **Chose `multi` over `matching` for quiz kind variety (Q3).** A "classify each
  scenario as interview-register or production-register" question was drafted as
  `matching` first, then rejected: with only two real categories, matching's
  per-row dropdown becomes a disguised binary guess rather than the genuine n-to-n
  mapping 0.2's Q2/Q3 used (five *distinct* forces). `multi`'s "select all that
  apply" format (QUIZ_FRAMEWORK §2) tests the same content without the disguised-coin-flip
  problem. First chapter to use `multi`.
- **Quiz position-clustering checked by eye**, per the standing instruction from
  0.1/0.2's shipped bug. Four single-kind questions (Q1/Q2/Q4/Q5) have correct
  options at c/b/a/d - four distinct positions, not just "not all identical."
- **Cold open deliberately avoids "the interviewer is impressed by boldness."**
  An early draft-in-my-head had the interviewer nod approvingly at the unjustified
  sharded proposal before the reveal - cut before it reached the file, because it
  would have taught the exact naive "interview rewards bold, production rewards
  boring" mental model this chapter argues against. The shipped cold open has the
  interviewer ask "why sixteen, why now" instead, so the failure is legible as
  *unjustified complexity failing in both registers*, not "wrong register."
- **Two production examples instead of one**, unlike 0.2's paired
  Stripe/Netflix contrast (which contrasted two companies on the same axis).
  Stack Overflow (restraint) and Discord (justified complexity) are deliberately
  opposite moves within the *same* register, to head off "production always avoids
  complexity" as a follow-on misreading of "production favors boring" - flagged in
  spec §3 and reinforced in "Ways to misread this."
- **No density revision pass performed as a distinct drafting round** - written
  once against §20.6 directly (896 words), then one targeted trim pass removed a
  three-way restatement of the same idea (diagram caption, a standalone paragraph,
  and the worked-example conclusion were all independently saying "registers differ
  in what's rewarded, not necessarily the architecture" - cut the caption's second
  clause and the standalone paragraph entirely, kept the concrete worked-example
  version as the one place the claim lands). Flagged here per 0.2's own precedent of
  flagging self-assessed density claims for the next reviewer to check rather than
  trusting them.

**Opus proofread pass (2026-08-06, lesson scope).** Run after the user read the
Sonnet draft and reported: *"the language used is either too specific for the point
where this chapter is present or too vague. I want you to audit and balance it out
such that it doesn't lose people trying to read the chapter."* Full itemization in
the chapter spec's §11; summary here.

**Lesson length: 896 -> 1156 words.** Above 0.2's post-pass 1092 for the same
15-minute estimate, and the increase is deliberate: every added word replaces an
assertion with a worked instance (§20.6 explicitly prefers concrete over abstract
even at slightly greater length). Three offsetting density cuts were made in the
same pass so the growth is net of trimming, not on top of it: the diagram caption
no longer restates beat 4's definition, the Discord closer no longer duplicates the
Common-mistakes bullet that generalizes it, and the cold open, "Next" and the
Stack Overflow example were each tightened.

*Too specific for chapter 3 of 44* (§18.2 rule 1 - the argument, not just the
flavor, rested on untaught vocabulary in each case):

- Cold open's "sharded, multi-region database... why sixteen shards" -> "split the
  database across sixteen machines in three regions - minute one, before anyone has
  said how many users there are." Three untaught terms in one sentence, in the one
  sentence the reader must grasp to feel the complexity is unjustified.
- Senior-answer line's "I'd shard only once replication lag or write throughput
  actually forces it" -> replication lag has no home chapter and was carrying the
  exemplar's trigger condition. Line rewritten entirely (see the thesis defect
  below, which was in the same sentence).
- Discord's "moved a core datastore off MongoDB onto Cassandra" -> "replaced the
  database under its message history," with the real pain named instead (messages
  stopped fitting in memory at ~100 million; reads turned slow and unpredictable).
  Two product names spent on a claim that needs neither; §13 calls that tourism.
- "An unjustified sharded design" in Common mistakes -> "a design built for a
  hundred times the traffic that exists," which is what the bullet is about.
  Unglossed on-call idiom went too: "paged at 3am"/"owning the pager" -> "woken at
  3am"/"being the person who has to keep it alive".
- Left as flavor on purpose: "regions"/"machines" (self-describing), "cache" (0.2
  grounded it), latency/throughput (0.2 taught them).

*Too vague / under-earning:*

- **"Register" was never defined** - the chapter's own central term, in the title,
  every section heading, the diagram and the quiz, and the draft never said what one
  is. Beat 4 now defines it before asserting the split. Biggest single fix.
- **The senior-answer line contradicted the chapter's thesis.** The draft's exemplar
  opened *"For the interview, I'd propose the sharded design to show I understand the
  scaling path"* - i.e. it modelled proposing unjustified complexity in the interview
  register, the exact failure the cold open punishes and the exact naive framing this
  ledger records the cold open as having been written to avoid. Rewritten so the
  senior move is naming the register you're in, with the design unchanged across the
  switch and only instrumentation added.
- **The "it depends" fix was missing.** Spec §9's playtest table claimed the lens
  taught it; it didn't, and Q5 tests it. Two sentences added (name the variable,
  commit on both sides, with a worked branch).
- **The diagram was abstract scaffolding** - "Same design decision" -> "Interview
  register"/"Production register" restated the table's first two rows in boxes. Root
  is now the cold open's actual decision and each leaf states what that register
  rewards for it, so the picture carries a worked instance.
- **"Boring, reversible, well-understood choices"** was a terse cell carrying the
  whole production register, never unpacked. One paragraph now defines both words
  operationally (failures already documented; wrong costs an afternoon, not a
  migration).
- **"At this scale nothing forces more"** referred to a scale the brief never stated.
  The worked brief now carries a number (a link shortener, 500 new links a day), and
  that number anchors the senior-answer line three sections later.

**Checked and left alone:** the two-register thesis, the cold open's framing, and
the Stack Overflow / Discord pairing (all three are the recorded judgment calls
above and all three survive scrutiny); §6's Concept section inventory complete and
in §5.3 order; §19's two backward connections intact; "Next" correctly previews 0.4
(verified against `manifest.ts`) with 1.11 as the one marked further-out tease;
§4's declared omissions still hold; both production examples' public numbers are
accurate and load-bearing to the decision.

**Open note for a later quiz-scope pass (not edited - lesson scope):** Q1's stem and
correct option use "breadth-first," which comes from CURRICULUM §1.5's phrasing and
appears nowhere in the lesson. The question is answerable without the term, so it
was left as-is, but it is the one remaining lesson/quiz vocabulary seam in this
chapter.

---

## 0.4 The System Design Lifecycle

- **Authored 2026-08-06 · not yet committed · branch `feature/content-0-1-welcome`**
  (same stacked branch as 0.1/0.2/0.3 - no separate `feature/content-0-4-*` branch
  cut, consistent with precedent).
- Definition id `bb-0-4-the-system-design-lifecycle` · manifest slug
  `0-4-the-system-design-lifecycle`
- Type: Concept · foundational · 15 min (Reader + knowledge check, no build) ·
  prerequisite: 0.3
- **Lesson length: 1102 words after the Opus pass** (1085 as drafted). Against
  0.2's post-pass 1092 and 0.3's 1156 for the same 15-minute estimate; unlike
  those two, this chapter needed no length change - see the Opus-pass subsection.
- Pipeline green at this revision: typecheck, lint, tests, build. (The Sonnet
  drafting pass deliberately skipped it per user direction; the Opus pass ran it.)

**Wave-completion note (2026-08-06).** Closes Wave 1 / Part 0 (0.1-0.4) as
redefined earlier in this same session. Sonnet draft plus a lesson-scope Opus
proofread pass, the same shape 0.3 got (0.2 got a full-scope pass).

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-0-4-the-system-design-lifecycle.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-0-4-the-system-design-lifecycle.md` |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None - no canvas exercise, nothing to validate; justified in spec §7 |
| 5 | Quiz | 5 questions, difficulty ramp 1/1/2/2/3, first chapter to use `ordering` kind |
| 6 | Playtest pass | Spec §9 |

**Judgment calls made:**

- **No construction-family exercise - justified Concept-chapter exception (§11.1),
  same as 0.2/0.3.** No components introduced (all three primitives stay homed at
  1.6). `availableComponentIds`/`requiredComponentIds` both `[]`, `blueprints: []`,
  no `starterGraph`. CURRICULUM §14's own 0.4 row gives the exercise as "ordering
  exercise (arrange the eight steps; explanation per placement)" - realized as the
  quiz's `ordering` question (Q3), the same pattern 0.2 used for its matching
  question and 0.3 flagged as reusable.
- **`hasEditorExercise: false` reused, not re-derived.** Same mechanism 0.2's spec
  fixed and 0.3 already reused; no new engineering work.
- **Practical objective category omitted**, same explicit §5.2 carve-out 0.2/0.3
  used. Four objectives (Knowledge, Engineering, Interview, Communication).
- **First chapter to use `ordering` as a quiz kind.** Options authored as a full
  derangement against `correctOrder` (no option sits at its own correct index) -
  `Ordering.tsx` shows the authored `options` array with no shuffle
  (`src/chapters/quiz/Ordering.tsx`), so anything less than a real scramble risks
  shipping pre-solved. Same discipline 0.2 applied to its `matching` questions'
  `pairs` vs. `options` ordering.
- **Backward connections: 2, meeting §19's ≥2** (0.2 and 0.3). 0.2's five forces
  are named (not re-listed individually) in the step-2 table row *and* again in
  "Next," a deliberate double-appearance mirroring 0.3's own precedent for this
  pattern. 0.3's two-registers frame is reused as the organizing idea of "Same
  loop, on paper" and named again in "Next."
- **Production examples chosen to extend 0.3's frame rather than introduce a new
  one.** Google's design-doc convention and Amazon's "6-pager" are both public,
  documented practices (§13) that run the same eight-step loop, formalized and
  slowed down instead of narrated live - the direct production-side payoff of
  0.3's interview/production distinction, rather than an unrelated pair of
  examples.
- **`pending-chapters.md` open decision 4 (the §14/§10.1 five-forces
  contradiction) sidestepped, not resolved.** The step-2 table row says
  "0.2's five forces" without re-listing the five names, so this chapter takes
  no position on which list (§14's or §10.1's) is canonical. Flagged in spec §11
  for a second reader to confirm this reads as deliberate.
- **Diagram is Mermaid, not ScaleCraft graph JSON** - a process-flow sequence
  (eight steps plus one dotted return edge), consistent with open decision 3
  below ("Part 0 is unaffected - process flows are Mermaid by spec anyway").
- **No everyday analogy in the mental-model beat**, same choice 0.3 made and for
  the same reason: the loop's own numbered, causally-dependent structure is
  already the clearest available frame for itself; a forced external metaphor
  (checklists, pre-flight routines) would have been decorative.
- **One density-revision cut made during drafting, not left to a later pass.**
  An early draft carried a standalone "Why the order isn't optional" section
  (~40 words) that was judged redundant with "Common mistakes"' first bullet and
  folded into the paragraph following the core-mechanics table instead. The
  post-table paragraph and the "In an interview" opening were each tightened
  once more after that. No further density pass was run distinctly from
  drafting - flagged in spec §11 for a reviewer to check, per 0.2/0.3's own
  precedent of flagging a self-assessed density claim rather than trusting it.

**Opus proofread pass (2026-08-06, lesson scope).** Run after the user read the
Sonnet draft and reported: *"I like this chapter layout, go ahead and check the
grammer and ambiguiety of sentence."* Explicitly a line-level copy-edit, not a
revision: the user approved the structure and section order as drafted, so no
section was added, cut, reordered, or reframed. Lesson length effectively
unchanged (1085 -> 1102 words); every edit trades the same number of words for
a sentence that can only be read one way.

*Grammar / ambiguity fixes (the pass's actual subject):*

- **Cold open, unresolvable "one answer / the other."** "Half the diagram
  assumed one answer, the other half assumed the other" - the interviewer had
  just asked two questions (how many users; read-heavy or write-heavy), and only
  the second has two answers, so the sentence has no recoverable referent. Now
  "Half the diagram assumes read-heavy, the other half assumes write-heavy."
- **Cold open, tense shift inside one sentence.** "...assumed... and the next ten
  minutes go to redrawing it" mixed past and present in a single clause chain.
  Now present throughout, matching the paragraph's narration.
- **Cold open, unquoted direct question.** "The interviewer stops them: how many
  users, and is this read-heavy or write-heavy?" now carries quotation marks,
  matching 0.3's own precedent for interviewer speech.
- **Think-first callout, stacked imperatives.** "Think first: before reading on,
  guess - what's the very first thing..." piled three commands before the
  question. Now the question first, "Commit to an answer before reading on"
  after - 0.2's precedent exactly.
- **"The fixed sequence that stops this."** "This" pointed at a whole scene with
  three plausible referents. Now "what prevents that failure."
- **Comma splice after the mechanics table.** "the diagram was fine, the ground
  under it was guessed" -> semicolon.
- **"How far back to go," appositive pile-up.** "might only touch step 4, a new
  entry point, or it might reopen step 2, a new requirement that forces the deep
  dive too" reads momentarily as a three-item list. Appositives moved into
  parentheses; "the deep dive" (a definite article with no antecedent) -> "a
  fresh deep dive."
- **Pronoun number on "requirements."** "that's usually what actually moved. If
  it didn't" -> "they're usually what actually moved. If they didn't."
- **Dangling "narrated aloud."** "compresses all eight steps into one sitting,
  narrated aloud" attached the participle to "one sitting." Now "compresses all
  eight steps into one sitting and narrates them aloud," parallel with
  production's "stretches them... and writes them down."
- **"Does the same job as a narrative memo."** Reads as a comparison (the memo
  is a separate thing doing the same job) when the intent is a form. Now "does
  the same job in the form of a narrative memo."
- **"Silence... usually means keep going."** Bare imperative after "means"; now
  quoted, matching §10.2's own phrasing.
- **""10x the writes" is steps 3 and 5 again."** Singular verb against a plural
  complement. Now "reopens steps 3 and 5."
- **Recap bullet 2.** "Skipping a step doesn't save time - it becomes rework" -
  "it" resolves to the skipping, which is not what becomes rework. Now "the step
  comes back as rework later."
- **"Next," two loose demonstratives and one misattribution.** "the two registers
  those forces get judged in" - 0.3 defines a register as what a *decision* is
  judged in, not a force; now "the two registers a design decision gets judged
  in." "the order everything else gets gathered in" -> "the order the work
  happens in." "where this stops being a conversation" -> "where the loop stops
  being a conversation."
- **Table row 2 parse.** "Functional (what it does) + non-functional (how well)
  promises" delayed its head noun past two parentheticals and used "+" where
  rows 1 and 3 use "Noun: expansion." Now "Promises: functional (what it does)
  and non-functional (how well)."

*Safety-net fixes (outside the grammar remit, flagged as such):*

- **§18.2 rule 1 - QPS was unglossed.** "users to QPS to storage to bandwidth"
  in the estimate row. QPS appears nowhere in 0.1, 0.2 or 0.3 (grepped), and
  0.2 teaches the concept as "throughput," never the abbreviation. Glossed
  inline at first use per §20.1: "users to QPS (queries per second) to storage
  to bandwidth."
- **§20.1 banned word.** "It sounds like the easy step - just ask questions -"
  -> "ask a few questions and move on." The other three "just"s in the file are
  the "not just X" sense, which the rule doesn't reach.
- **"Instance" was untaught vocabulary.** ""what if this instance dies?"" ->
  "server," which the cold open already puts on the board.
- **Mild gamified framing.** "1.1 puts you on the loop's first square" -> "1.1
  drops you into step 1." Board-game idiom against the not-a-game principle,
  and "step" is the chapter's own noun anyway.

**Checked and deliberately left alone:**

- **Structure, section order, and all section headings** - the user approved the
  layout explicitly; nothing was added, cut, moved, or retitled.
- **Word count (1085 -> 1102), spec §11's first flagged item.** Re-derived rather
  than trusted: the table is eight discrete facts x three columns and *is* the
  chapter's stated purpose (a map of Part 1), and the two production examples are
  one sentence each. Nothing is padded; no cut was made purely to hit a number,
  per §20.6's "length follows content" clause. The self-assessed density claim in
  spec §11 holds.
- **Open decision 4 (five-forces contradiction), spec §11's second flagged item.**
  The step-2 row names "0.2's five forces" without re-listing them. Confirmed as
  deliberate and correct, not evasive: 0.2 is the only chapter that has taught a
  list, the row points at it by chapter number, and re-listing would force this
  chapter to pick a side in a contradiction that is still open. Leave as is when
  the decision is finally resolved - this row needs no edit either way.
- **Google design doc and Amazon 6-pager claims.** Both accurate as stated:
  goals/non-goals, the design, and alternatives-considered are the publicly
  documented Google structure; the 6-pager is a narrative memo read silently at
  the start of the meeting. Only the sentence's grammar was touched, not the
  claim.
- **Em dashes: zero.** Grepped the file for "—" directly, not eyeballed.
- **"Next" targets verified against `manifest.ts`.** 1.1 (`1-1-understanding-the-problem`)
  has `prerequisiteSlugs: ["0-4-the-system-design-lifecycle"]`, so it is genuinely
  the immediate next chapter; 1.6 is the single marked further-out tease, the same
  one-tease pattern 0.2 (1.3) and 0.3 (1.11) used.
- **Table's "You'll live it in" column checked row by row against `manifest.ts`.**
  All eight map correctly, including the two non-sequential ones (deep dive ->
  1.9, bottlenecks -> 1.7, which are out of numeric order in the table because
  the loop's order and Part 1's chapter order genuinely differ there).
- **Lesson vs. quiz eight-step consistency.** The table's order matches the
  ChapterDefinition's `correctOrder` exactly (clarify, requirements, estimate,
  high-level-design, deep-dive, bottlenecks, trade-offs, evolve-defend). No
  mismatch to flag.
- **Diagram, mermaid source untouched.** Only the caption was reworded
  ("the loop's namesake" -> "why it's a loop," plainer per §20.1).
- **§6 Concept section inventory** complete and in §5.3 order; §19's two backward
  connections (0.2, 0.3) intact; §4's declared omissions still hold.

**Open note for a later quiz-scope pass (not edited - lesson scope):** Q2's
options and explanations use "QPS" three times. The lesson now glosses it at
first use, so a reader who read the chapter is fine, but the quiz-side
vocabulary seam is worth the same look 0.3's "breadth-first" note got.

**`lessonVersion` bumped 1 -> 2** in `src/content/chapters/index.ts` with a
revision comment, per the 0.2/0.3 convention.

---

## 1.1 Understanding the Problem

- **Authored 2026-08-08 · not yet committed · branch
  `feature/content-1-1-understanding-the-problem`** (cut from
  `release/v4.1.0-part-1-curriculum`, itself cut from `develop`).
- Definition id `bb-1-1-understanding-the-problem` · manifest slug
  `1-1-understanding-the-problem`
- Type: Process · foundational · 20 min (Reader + knowledge check, no build -
  see below) · prerequisite: 0.4
- **Lesson length: 1063 words**, against 0.4's 1085-word pre-pass draft for a
  15-minute estimate - proportionately fuller for the 5 extra minutes, not
  padded (§20.6's own test; no Opus pass has run yet to confirm this
  independently).
- Pipeline green at this revision: typecheck, lint, 1570 tests, build (one
  pre-existing test, `src/content/chapters/index.test.ts`'s hardcoded chapter-
  id list, updated to include the new id - not a new test, a registry-wiring
  fixture every new chapter has to touch).

**Wave-gate check before drafting (2026-08-08).** `pending-content.md`'s wave
rule ("do not start a wave until the previous wave's chapters are merged")
was checked and found satisfied only after a `git fetch`: local branches were
stale and made it look unmet, but `origin/develop` and `origin/main` both
already contain Wave 1 (`e3a4074`) via PR #87/#88. Confirmed with the user
before proceeding. See the "Wave 1 progress" line above.

**Branch cleanup, same session (user-directed).** All branches other than
`main`/`develop` (`feature/content-0-1-welcome`, `feature/guided-tour-track-a`,
`fix/tour-highlight-clipping`, `release/v4.0.0-guided-tour-and-curriculum`)
were confirmed fully merged into `develop` and deleted, locally and on
`origin`. `release/v4.1.0-part-1-curriculum` was then cut from `develop` for
this wave, version bumped to `4.1.0-alpha` (`VERSION`, `package.json`) plus a
new `.claude/docs/ScaleCraft_Future_Roadmap.md` on a separate
`chore/version-4.1.0-and-roadmap` branch (also cut from the release branch,
uncommitted to `feature/content-1-1-understanding-the-problem` - the two
branches are independent, per repo convention, and both still need pushing
and review).

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-1-1-understanding-the-problem.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-1-1-understanding-the-problem.md` |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None - no canvas exercise, nothing to validate; justified in spec §8 |
| 5 | Quiz | 5 questions, difficulty ramp 1/1/2/2/3, first chapter to use `multi` as its primary/exercise-standing-in question |
| 6 | Playtest pass | Spec §10 |

**Judgment calls made:**

- **The staged exercise CURRICULUM §14 specifies for 1.1 does not exist as
  built UI and was degraded to a quiz question, per `pending-content.md`'s
  own documented plan for Part 1 ("stages UI does not exist... a small non-
  staged exercise where honest"), not an improvisation.** The row's exact
  wording: "given a vague brief, pick the 4 highest-value clarifying
  questions from 10; feedback explains what each answer would change."
  Realized as quiz Q1: `multi` kind, 8 candidate questions (not 10) about a
  URL shortener, 4 correct, every option carrying its own `explanationMd`.
  Flagged in spec §5 and §12 as the first candidate to receive its originally
  -specified staged exercise once the stages UI lands (which is itself one of
  Wave 2's stated triggers in `pending-content.md`).
- **Practical objective included, not carved out.** §5.2's Practical
  exception is explicitly scoped to "pure Concept chapters" - 1.1 is Process
  type, so the carve-out 0.2/0.3/0.4 used doesn't literally apply here. Wrote
  a Practical objective honestly tied to the quiz-realized exercise above
  (spec §2) instead of silently reusing the Concept-chapter exception on a
  chapter it wasn't written for.
- **Production examples (optional for Process, unlike Concept where it's
  mandatory) omitted with written justification**, not silently dropped: the
  natural production-register example for "state scope and goals before
  designing" is 0.4's own Google-design-doc / Amazon-6-pager section,
  already shipped. A second telling of the same point would be restatement,
  which §20.6 cuts on sight; no distinct, load-bearing public example of
  *clarifying questions specifically* was found that wouldn't just repeat
  0.4's point in different clothes. Spec §4 flags this for a second reader
  rather than asserting it's settled.
- **Failure modes and scaling - omitted**, both optional for Process (§6),
  same reasoning 0.4 used for Concept: no system exists yet to fail or scale,
  only a step in a design conversation.
- **No everyday analogy in the mental-model beat** - same choice 0.3 and 0.4
  made, for the same reason: the test itself ("would a different answer
  change the design") is already the clearest available frame; a forced
  comparison would be decorative.
- **New Mermaid diagram shape: a two-branch decision tree**, not a process-
  flow sequence like 0.4's loop diagram. First use of the "Decision tree"
  entry from CURRICULUM §7.1's diagram inventory (previously unused across
  0.1-0.4). Still Mermaid, not ScaleCraft graph JSON - open decision 3 below
  is unaffected (no topology exists yet to render as a graph).
- **Backward connections: 2 named explicitly (0.2, 0.4), meeting §19's >=2**,
  plus 0.2's cache/read-replica material reused substantively in "What a good
  question actually does" (the deliberate double-appearance pattern 0.3/0.4
  established: use it in the body, name the chapter again in "Next").
- **Quiz Q1 reuses QUIZ_FRAMEWORK.md §6's own Q1 scenario (URL shortener,
  multi-select clarifying questions) rather than inventing a fresh product**,
  both for continuity with the bank and because it's also standing in for the
  staged exercise (above) - expanded from the bank's 4 options to 8 so the
  "pick from many candidates" shape survives the degradation. Not a verbatim
  copy: all 8 options, explanations, and 4 correct answers are original to
  this chapter.
- **Position-clustering checked by eye**, per the standing instruction from
  0.1/0.2's shipped bug. Four single-kind questions (Q2/Q3/Q4/Q5) have
  correct options at c/a/d/b - four distinct positions.
- **No density revision pass performed as a distinct drafting round** -
  written once against §20.6 directly, then two small cuts made during self-
  review (a closing meta-sentence in "What a good question actually does",
  two non-"not just X" uses of "just" reworded per §20.1). Flagged here per
  0.2/0.3/0.4's own precedent of flagging a self-assessed density claim for
  the next reviewer to check rather than trusting it.

**Opus proofread pass (2026-08-08, uncommitted).** Scope: content,
content-structure, blueprints, component lists, submit validations, diagrams.
Quiz, hints, and `problemStatement`/`learningObjectives`/`curriculumContext`
were explicitly out of scope and untouched. `lessonVersion` 1 -> 2. Lesson
1063 -> 1153 words. Full detail in spec §13.

*Four accuracy fixes, all in prerequisite-chapter material:*

- **The cache/read-replica claim was wrong, as the user suspected.** Draft:
  "a 1000:1 read:write ratio makes 0.2's cache and read replica close to
  mandatory." 0.2 teaches those two as *competing* diagnoses on different
  axes - "a cache helps when the same rows are read over and over: it buys
  latency, and cost. A read replica helps when the database is simply out of
  read capacity: it buys throughput" - not a pair that both get more
  mandatory as read skew rises. A bare ratio proves neither repeated-row
  reuse nor absolute read volume (1000:1 at ten requests a day needs
  neither), so it cannot make either mandatory. Rewritten: the ratio decides
  which *path* the design work goes into, and a new second paragraph states
  what it explicitly does not settle. The correction improves the beat rather
  than patching it - beat 7's "one level down" is now the real locality-vs-
  volume distinction, and it earns the word *part* in "collapses part of the
  design space". A milder form of the same conflation in the cold open
  ("almost all reads wants caching and read replicas up front") was fixed the
  same way.
- **"0.4's ~5-10 minutes of 45" was invented.** 0.4 never states a clarify
  budget; ~45 minutes is 0.3's figure. Re-derived from taught material (0.3's
  ~45 minutes over 0.4's eight steps) and the "couple of minutes" figure is
  now owned by this chapter instead of misattributed. Side effect: 0.3 is now
  a third named backward connection.
- **"0.4's dotted arrow starts right here" was wrong.** 0.4's diagram is
  `H -.-> B` - step 8 to step 2, so it neither starts nor ends at clarify.
  Reworded to 0.4's actual "How far back to go" teaching.
- **"What database should I use? - nothing about the design changes"** is
  false in the curriculum's own terms; 3.11 is SQL vs. NoSQL. Reframed to the
  reason that actually holds and survives 3.11: it isn't a fact about the
  problem, it's a decision that's yours to make. The matching "Common
  mistakes" bullet was aligned.

*Diagram.* Two Mermaid node labels used `\n` for line breaks. Mermaid
documents `<br/>`, not `\n`, and this renderer runs `securityLevel: "strict"`;
no other chapter uses either form. Labels shortened so no break is needed -
removes the risk without betting on unverified renderer behavior. Caption and
branch accuracy were already fine.

*Voice/density (the user's other flag).* Five over-built sentences shortened
or split (cold-open payoff, "Where to look" opener, the category caveat, the
"In an interview" opening move, the senior-answer tag line). One §20.6
restatement cut: beat 7's closing "One answer, and an entire branch of the
design either becomes central or drops out" repeated its own topic sentence.

*Confirmed, not changed.* `blueprints`, `availableComponentIds`,
`requiredComponentIds`, `validationRuleIds` all correctly `[]` per §16 (three
primitives home at 1.6, no graph to validate). §5.3/§6 structure complete for
Process type with no reordering. Manifest order verified: 1.2 is next, 1.6 is
the first build - both references correct. **Production examples omission
confirmed**, and not by deferring to the draft's own argument: §13 requires
*who / why / when it applies / what trade-off*, and no public example of
clarifying-questions-specifically clears that bar without collapsing back into
"state goals before designing", which 0.4 already shipped (Google design docs,
Amazon 6-pager).

*New open notes (not acted on):*

- **Part 1 may end up with no production register at all.** 1.1's Production-
  examples omission is individually correct, but if 1.2-1.5 each reach the
  same conclusion for the same reason, Part 1 ships without the production
  half of §1.5's two registers. Decide this deliberately at 1.3 or 1.4, not
  by four independent omissions.
- **Quiz Q5 and `hints[1]` carry the same overclaims the lesson just lost**
  (out of scope for this pass, flagged for the quiz/hints owner). Q5's correct
  option b says the ratio "decides whether caching and a read replica are
  worth the added complexity" and its explanation calls a heavy read skew
  "exactly the signal 0.2 used for when a cache pays for itself" - 0.2's
  signal was repeated reads of the same rows, not skew. `hints[1]` says
  database choice "doesn't change the shape of the architecture", defensible
  at Part 1's three-primitive palette but contradicted by 3.11.

---

## 1.2 Functional Requirements

- **Authored 2026-08-08 · not yet committed · branch
  `feature/content-1-1-understanding-the-problem`** (same in-progress Wave 2
  branch as 1.1 - no wave-gate re-check needed, this is a continuation of an
  already-started wave, not a new one).
- Definition id `bb-1-2-functional-requirements` · manifest slug
  `1-2-functional-requirements`
- Type: Process · foundational · 15 min (Reader + knowledge check, no build -
  see below) · prerequisite: 1.1
- **Lesson length: 992 words**, against 0.4's comparable pre-pass 1085 for the
  same 15-minute estimate and 1.1's 1063 for a 20-minute estimate -
  proportionate by the same ratio test 1.1's own entry used (no Opus pass has
  run yet to confirm this independently).
- Pipeline not run this pass (content-authoring only, per the skill's scope -
  `src/content/chapters/index.test.ts`'s hardcoded chapter-id list was updated
  to include the new id, same registry-wiring touch 1.1 needed, but `tsc`/
  `lint`/`vitest`/`build` were not run).

**Scope-target detour before drafting (2026-08-08, resolved before any file
was touched).** The user's invocation included "should be < 5 min reads" as a
parenthetical. Asked to clarify scope; the user's first answer was "all of
Part 1 (1.1-1.11) should be <5 min" as a standing policy - which would have
meant revising already-authored 1.1 (20 min/1153 words) and the manifest's
`estimatedMinutes` across eleven chapters. Before any file was touched, the
user reversed this ("I take back that 5 min rule... do as you would
normally"). This chapter was drafted against CURRICULUM §14's actual 1.2 row
(15 min) instead, matching 0.2-0.4/1.1's established density pattern. Recorded
so a future session doesn't need to re-litigate whether Part 1 has a <5-minute
target - it does not.

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-1-2-functional-requirements.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-1-2-functional-requirements.md` |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None - no canvas exercise, nothing to validate; justified in spec §8 |
| 5 | Quiz | 5 questions, difficulty ramp 1/1/2/2/3, continues 1.1's URL shortener brief for Q1 |
| 6 | Playtest pass | Spec §10 |

**Judgment calls made:**

- **The staged checklist exercise CURRICULUM §14 specifies for 1.2 does not
  exist as built UI and was degraded to a quiz question**, the same
  documented pattern 1.1 used (`pending-content.md`'s Part 1 plan). Realized
  as quiz Q1: `multi` kind, 8 candidate features about the same URL shortener
  brief 1.1 used (now with two facts confirmed rather than left hypothetical),
  3 correct. Flagged in spec §5 and §12 as a candidate for its originally
  specified staged exercise once the stages UI lands.
- **Production examples included, reversing 1.1's omission.** 1.1's own
  ledger entry flagged a risk: if every Part 1 chapter independently omits
  production examples for defensible individual reasons, Part 1 ends up with
  no production register at all, contradicting CURRICULUM §1.5's two-registers
  framing. Basecamp's Shape Up "no-gos" practice is genuinely distinct from
  0.4's design-doc examples (cutting functional scope under a deadline, not
  stating goals broadly), clears §13's who/why/when/trade-off format in two
  sentences, and resolves the flagged risk at the first chapter where a
  non-repetitive example was available - one chapter earlier than 1.1's own
  "decide this at 1.3 or 1.4" suggestion.
- **Deliberate structural echo of 1.1's diagram.** Both chapters use a
  two-branch Mermaid decision tree testing "does a different answer/this
  feature change something load-bearing" - the same test shape, applied to
  clarifying questions in 1.1 and to feature scope here. A considered choice
  (Part 1's first two chapters share a test-shaped mental model on purpose),
  not an oversight, but flagged in spec §12 for a second reader to confirm it
  reads as reinforcement rather than repetition.
- **No further-out forward tease to 1.6.** 1.1 and 0.4 already tease 1.6 as
  the first build; §19 requires "at most one" tease per chapter, not exactly
  one, so this chapter's "Next" only previews the immediate next chapter
  (1.3). Flagged as a judgment call, not a silent omission.
- **No construction-family exercise - justified Process-chapter carry-over
  from 1.1's own precedent**, not a fresh Concept-only exception (§11.1's
  carve-out is explicitly for Concept chapters; 1.1 already established that
  Process chapters without a build state their `hasEditorExercise: false`
  reuse plainly instead of invoking §11.1). No components introduced (§16
  homes the three primitives at 1.6). `availableComponentIds`/
  `requiredComponentIds` both `[]`, `blueprints: []`, no `starterGraph`.
- **`hasEditorExercise: false` reused, not re-derived** - same mechanism 0.2's
  spec fixed and 1.1 already reused.
- **Quiz position-clustering checked by eye and corrected during drafting**
  (not just checked after the fact). The first pass of Q2-Q5 landed 3 of 4
  correct answers at position `b` - the exact clustering bug 0.1/0.2 shipped
  once and the standing instruction exists to catch. Reordered options
  (content unchanged) to `b, a, c, d` before finalizing, rather than writing
  the questions once and checking after.
- **One density cut made during drafting, not deferred to a later pass**: a
  closing sentence in "Why the write-down matters" restated the paragraph's
  own point ("The category decides what to build; only the write-down keeps a
  Could from silently becoming a Must again") - cut per the exact pattern the
  Opus pass caught once already in 1.1's beat 7 closing sentence. Flagged in
  spec §12, per 0.2/0.3/0.4/1.1's own precedent, for a reviewer to check the
  self-assessed density claim rather than trust it.

**Opus proofread pass (2026-08-08, uncommitted).** Scope: content,
content-structure, blueprints, component lists, submit validations, diagrams.
Quiz, hints, and `problemStatement`/`learningObjectives`/`curriculumContext`
were explicitly out of scope and untouched. `lessonVersion` 1 -> 2. Lesson
992 -> 1129 words. Full detail in spec §13.

Triggered by direct user feedback on the draft: *"the chapter feels dragged
out, the In production section is just un-understandable. a more jarring
chapter for some reason I didn't really get a clear picture out of this
chapter."* All three reproduced on a fresh read; all three had real causes.
This was not a rubber-stamp pass - the draft had a structural defect, not a
line-edit one.

*Complaint 1, "dragged out" - the cause was restatement, not length.* The
chapter's one idea appeared six times before doing any new work: the cold
open's closing sentence, the think-first prompt, "The test"'s opening line,
the diagram, the diagram caption, and the MoSCoW table's first row. §20.6's
first cut-on-sight item names exactly this. The load-bearing fix: the cold
open ended on "Not everything that occurs to you is a requirement - only what
the system cannot ship without", which is the chapter thesis stated one line
before a think-first prompt that asks the reader to derive it - a §5.3 beat-3
violation (the prediction prompt must precede any revealed answer). Cold open
now ends on the felt cost instead. Two related bugs in the same beat: it said
"Five features in" over a list of seven, and "the interview's design time is
already gone" was an overclaim (listing seven features costs under a minute).
The think-first prompt was also unanswerable as written - it asked which *one*
feature to keep, when the chapter's own answer is two (create and redirect).
Word count went *up* ~140, which is the honest outcome: the drag was
redundancy, and cutting it freed room for the diagram and the production
example to carry real content.

*Complaint 2, "In production is un-understandable" - rewritten, not cut.* Read
cold by someone who has never heard of Shape Up, the draft assumed the entire
frame: *Shape Up*, *six-week*, *pitch* and *mid-cycle* all used without
introduction, and a trade-off sentence that was a comparative between two
abstractions ("naming them protects the deadline more than including them
would help the release"). §13's *when it applies to you* leg was missing
outright. **The Basecamp claim itself was verified as accurate**, not accepted
from the draft - fixed six-week cycles, work shaped into a written pitch
before it is bet on, "no-gos" a named ingredient of that pitch for
functionality deliberately excluded to fit the fixed appetite. So the example
was sound and only its telling was broken; it was kept and rewritten to
introduce the cycle and the pitch before using them, state the mechanism
plainly, carry the when-it-applies leg, and end on the cost. **1.1's flagged
"Part 1 may ship with no production register" risk therefore stays resolved.**

*Complaint 3, "jarring / no clear picture" - two structural causes, both
fixed.* (a) The chapter taught **two** mental models and left the reader to
stitch them: "The test" gave a binary Must/not-Must decision tree, then
"Sorting the list" introduced a four-bucket scheme the diagram never mentioned.
The primary diagram is now a three-question router with four leaves, so the
test *is* the sort and the MoSCoW table names outcomes already seen. That also
adds an idea the draft lacked - Could versus Won't is a call about this pass's
capacity, not a property of the feature - which makes the write-down section
follow rather than arrive. (b) **"In production" was out of §5.3's beat
order**, sitting between beat 7 and beat 8; §5.3/§20.3 permit merging adjacent
sections but not reordering. Moved after "Must, or just useful?", restoring
7 -> 8 -> 11 -> 12 -> 13.

*On the draft's flagged diagram echo of 1.1: it was contributing to the
retread feeling, and it is gone.* Two consecutive chapters opening with a
section titled "The test", the same URL-shortener interview cast, and a
two-node yes/no tree with the branches relabelled reads as a re-run of 1.1.
The reinforcement argument would have held if the second diagram carried new
information; it did not - it restated the sentence directly above it. The
four-outcome router stays inside §7.1's "Decision tree" family while doing
work 1.1's diagram did not. **Standing note for 1.3-1.5: shared structure
across Part 1 is only reinforcement when the repeated element carries new
content. A repeated diagram shape whose only change is the labels is a
retread, and the reader feels it before they can name it.**

*Smaller content fixes.* The expiry justification now closes the loop with the
test (the confirmed answer changed what the job *is*) instead of reading as an
exception to it; a garden-path sentence in "Must, or just useful?" was split;
"In an interview" moved to second person and shortened; the weakest "Common
mistakes" bullet ("building Could-have before Must-have is solid" - no
explanation, no new information) was replaced with sorting by product category
instead of by the brief, which is what quiz Q3/Q4 actually test.

*Confirmed, not changed.* `blueprints`, `availableComponentIds`,
`requiredComponentIds`, `validationRuleIds` all correctly `[]` - §16 homes the
three primitives at 1.6, this chapter introduces none, there is no
`starterGraph` and no graph to validate, so there is nothing for a blueprint
or a rule to gate. §5.3/§6 coverage complete for Process type after the
reorder; failure modes and scaling stay omitted with their written §4
justification. Manifest checked: `1-3-non-functional-requirements` really is
next, so "Next" names the right chapter. No untaught vocabulary (§18.2 rule 1)
- "non-functional" never appears, MoSCoW is defined at first use, no component
names. Backward connections still >= 2. No further-out forward tease - the
draft's judgment call stands (§19 says "at most one"; 1.1 and 0.4 both already
tease 1.6).

*New open notes (not acted on):*

- **`hints[2]` duplicates the lesson's beat-7 sentence almost verbatim**
  ("Should, Could, and Won't aren't 'no' - they're 'not this pass'"). Fine for
  a hint, flagged for the hints owner rather than changed (out of scope).
- **Quiz Q1 option f** ("Should, not Must" for malformed-URL rejection) now
  lines up exactly with the diagram's second branch - noted so a quiz owner
  knows the alignment is deliberate, not coincidence.
- **Pipeline not run this pass** (content-only scope). The chapter still needs
  `typecheck`/`lint`/`vitest`/`build` before commit, same as 1.1.

---

## 1.3 Non-functional Requirements

- **Authored 2026-08-09 · not yet committed · branch
  `feature/content-1-1-understanding-the-problem`** (same in-progress Wave 2
  branch as 1.1/1.2 - no wave-gate re-check needed, this is a continuation of
  an already-started wave, not a new one).
- Definition id `bb-1-3-non-functional-requirements` · manifest slug
  `1-3-non-functional-requirements`
- Type: Process (a real §4-vs-§14 contradiction was found and resolved in
  favor of §14 - see the chapter spec's §0 and the open decision below) ·
  foundational · 20 minutes (Reader + knowledge check; no build) ·
  prerequisite: 1.2
- **Lesson length: 1043 words**, against 1.1's comparable pre-pass 1063 for
  the same 20-minute estimate (no Opus pass has run yet to confirm this
  independently).
- Pipeline not run this pass (content-authoring only, per the skill's scope -
  `src/content/chapters/index.test.ts`'s hardcoded chapter-id list was
  updated to include the new id, same registry-wiring touch 1.1/1.2 needed,
  but `tsc`/`lint`/`vitest`/`build` were not run).

**Type contradiction found and resolved (2026-08-09, doc-only, see spec §0).**
CURRICULUM §4's chapter-types table lists 1.3 as a worked example of the
**Concept** type, but §14's Part 1 section header states unambiguously that
the whole part (1.1-1.11) is Process type, with no per-chapter exception
named. Resolved as **Process**, by the same precedent open decision 4 below
already set (§14 wins when it conflicts with another section) and for
consistency with 1.1/1.2, both already authored as Process on this branch.
Flagged as a new item under "Open decisions" below - §4's example list should
drop "1.3."

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-1-3-non-functional-requirements.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-1-3-non-functional-requirements.md` |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None - no canvas exercise, nothing to validate; justified in spec §8 |
| 5 | Quiz | 5 questions, difficulty ramp 1/1/2/2/3, first chapter whose §14-specified exercise (a matching question) needed no stages-UI degradation |
| 6 | Playtest pass | Spec §10 |

**Judgment calls made:**

- **The exercise is not a degradation, unlike 1.1/1.2.** CURRICULUM §14's own
  1.3 row - "match NFRs to three described products; explanation per match" -
  was never described as "staged," and QUIZ_FRAMEWORK §2's format table names
  exactly this use case for `matching`. Realized directly as quiz Q1 (3
  pairs, no stages-UI gap to flag). The first Part 1 chapter where the
  §14-specified exercise is achievable as authored rather than a documented
  substitute for missing UI.
- **Production examples included** (Amazon S3's own published
  99.999999999%-durability / 99.9%-availability numbers), continuing 1.2's
  resolution of 1.1's flagged "Part 1 may ship with no production register"
  risk. Chosen specifically because it reinforces 0.2's durability/
  availability distinction with real public figures rather than restating it
  in the abstract - a distinct contribution, not a repeat of 1.2's Basecamp
  example.
- **New diagram shape, not a retread.** The primary diagram is a fan-out
  mapping (each of 0.2's five forces to the shape of number it becomes), not
  a yes/no decision tree - deliberately different from 1.1's and 1.2's
  diagrams, per the standing note 1.2's Opus pass left in this ledger:
  "shared structure across Part 1 is only reinforcement when the repeated
  element carries new content." Flagged in spec §12 for a second reader to
  confirm it reads as genuinely new rather than merely differently labeled.
- **Quiz Q1 (matching) deliberately avoids 0.2's own Q3 domains** (a bank
  ledger, a hospital alert, a checkout flash sale, autocomplete, a weekly
  report) - three fresh products (ride-hailing driver-match, a hospital MRI
  archive, a conference Q&A app's up-vote spike) reuse the matching *shape*
  0.2 already validated while using numeric NFR statements as the options
  instead of bare force names, since this chapter's whole point is the
  number, not the force name alone.
- **Forward tease to 1.4, not 1.6.** 1.1 and 0.4 already tease 1.6 as the
  first build; per §19's "at most one," 1.3 previews 1.4 instead (numbers
  feed estimation) - the first Part 1 chapter to tease something other than
  1.6, consistent with 1.2's own judgment call not to repeat a third
  mechanical 1.6 tease.
- **Discovered-and-fixed cross-chapter defect in 1.2, not 1.3's own content.**
  1.2's "Next" section (drafted 2026-08-08) said 1.3 would cover "how fast,
  how available, how consistent." Open decision 4 below was resolved
  2026-08-09 - after 1.2 was drafted - in favor of §14's throughput-inclusive,
  consistency-excluded five forces. Since 1.2 is still uncommitted, the
  stale word was corrected to "how durable" in this same session, so 1.2's
  own forward tease doesn't contradict what 1.3 actually teaches. See spec
  §12.
- **No density revision pass performed as a distinct drafting round** -
  written once against §20.6 directly. Flagged here per 0.2/0.3/0.4/1.1/1.2's
  own precedent of flagging a self-assessed density claim for the next
  reviewer to check rather than trust.

**Position-clustering checked by eye**, per the standing instruction from
0.1/0.2's shipped bug. Four single-kind questions (Q2/Q3/Q4/Q5) have correct
options at b/c/a/d - four distinct positions.

**Opus proofread pass (2026-08-09).** Scope: lesson body, content-structure,
blueprints, component lists, validation rules, diagrams. Quiz, hints and
definition metadata were out of scope and untouched. `lessonVersion` 1 -> 2.
Full breakdown in the spec's new §13; summary:

- **Confirmed and left alone:** the Process resolution actually holds in the
  shipped text (Practical objective present, failure-modes/scaling omitted
  with written justification, production examples present); the diagram-
  novelty claim is true on inspection (1.1 = one yes/no branch, 1.2 = a
  three-question router, 1.3 = five parallel one-hop mappings with no
  decision node, and distinct from 0.2's one-root fan-out too); all four
  in-scope definition fields are correctly empty (no `starterGraph` and no
  components means nothing for a blueprint to describe, §16 needs no
  exception without a canvas, no graph exists to validate); the
  nines-to-downtime figures are arithmetically right on a 365.25-day year;
  "Next" names 1.4, which the manifest confirms, with no further-out tease;
  "QPS" needs no gloss because 0.4 already defined it.
- **Nine changes, all content-side.** The material one: **the primary
  diagram and the core-mechanics table stated the same force-to-number-shape
  mapping twice**, six lines apart - a §20.6 violation the draft's
  self-flagged "no distinct density pass was run" had let through. The
  table's middle column was cut (diagram keeps the shapes, table keeps the
  worked examples); the two nuances only the column carried were preserved.
  Same collision 0.2 hit and resolved in the opposite direction, because
  there the diagram was expendable and here it is the mandatory beat-5
  visual.
- The other eight: p99 used before being defined (nothing in 0.1-1.2
  introduces it, so §20.1's define-at-first-use applies); a bridge sentence
  claiming availability "compounds the same way" as latency percentiles,
  which is not a real mechanism; "buys back roughly 10x less downtime"
  (body + recap), which reads as a worse deal on a careful pass; the senior
  interview line saying "a fifth nine" while standing at 99.9%, where the
  next purchase is the fourth and is exactly what the trade-offs section
  just priced; S3's bare "99.9% availability", now labelled as its
  service-agreement figure since AWS also publishes a designed-for-99.99%
  number; a missing withheld-information line in "Your turn" that spec §3
  claimed was there and 1.1/1.2 both carry; a cold-open stage direction;
  and "provable" -> "defensible" in the 1.4 tease.
- **Lesson length after the pass: 1036 words** (1048 before, by the same
  `wc -w`; the entry above's 1043 was counted differently). Roughly flat -
  the pass traded duplicated table text for a p99 definition and a withheld-
  information line, which is the intended shape of a density pass, not a
  word-count cut.
- **New standing note for later chapters:** when a chapter's mandatory
  beat-5 visual and its beat-6 table both want to carry the same mapping,
  the visual keeps it and the table moves to worked examples. 0.2 solved
  this the other way (diagram went names-only) because its diagram was not
  load-bearing; state which side is carrying content in the spec so the
  next reader doesn't have to re-derive it.

---

## 1.4 Estimating Scale

- **Authored 2026-08-09 · not yet committed · branch
  `feature/content-1-1-understanding-the-problem`** (same in-progress Wave 2
  branch as 1.1/1.2/1.3 - no wave-gate re-check needed, this is a
  continuation of an already-started wave, not a new one).
- Definition id `bb-1-4-estimating-scale` · manifest slug
  `1-4-estimating-scale`
- Type: Process (CURRICULUM §4's own worked example for this type is "1.4
  Estimating Scale" itself - no contradiction to resolve here, unlike 1.3) ·
  foundational · 25 minutes (Reader + knowledge check; no build) ·
  prerequisite: 1.3
- **Lesson length: 1,106 words**, against 1.1's 1,063 and 1.3's 1,043 for
  20-minute estimates - proportionately fuller for the extra 5 minutes and
  this chapter's heavier worked-number content (no Opus pass has run yet to
  confirm this independently).
- Pipeline not run this pass (content-authoring only, per the skill's scope
  - `src/content/chapters/index.test.ts`'s hardcoded chapter-id list was
  updated to include the new id, same registry-wiring touch 1.1/1.2/1.3
  needed, but `tsc`/`lint`/`vitest`/`build` were not run).

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-1-4-estimating-scale.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-1-4-estimating-scale.md` |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None - no canvas exercise, nothing to validate; justified in spec §8 |
| 5 | Quiz | 5 questions, difficulty ramp 1/1/2/2/3, first chapter to use the `estimate` quiz kind |
| 6 | Playtest pass | Spec §10 |

**Judgment calls made:**

- **The staged estimation exercise CURRICULUM §14 specifies for 1.4 does not
  exist as built UI and was degraded to a quiz question**, the same
  documented pattern 1.1/1.2 used (`pending-content.md`'s Part 1 plan).
  Realized as quiz Q1-Q2: two `estimate`-kind questions (QUIZ_FRAMEWORK §2's
  own bucket-choice format) on a fresh product - a photo-sharing app, not
  the lesson's own URL-shortener numbers - so the check tests transfer
  rather than recall. Flagged in spec §5 and §12 as a candidate for its
  originally specified multi-step staged version once the stages UI lands.
- **First chapter to use the `estimate` quiz kind.** Verified against the
  real rendering path before relying on it: `EstimateChoice.tsx` is
  `SingleChoice` with monospaced labels, and `evaluate.ts` scores it
  identically to `single`/`diagram` (one selected option id) - no new
  interaction pattern for the learner, only bucket-style content.
- **1.1's 1000:1 read:write ratio treated as the URL shortener brief's
  confirmed real number, not just its illustrative example.** 1.1 used
  1000:1 only to demonstrate its clarifying-question test in the abstract;
  this chapter reuses that exact figure as the actual scale for the running
  case study (10 million redirects/day, 10,000 creates/day). A deliberate
  continuity choice for a unified running example across 1.1-1.4, not an
  invented fact contradicting 1.1 - flagged in spec §12 for a second reader
  to confirm it reads as intentional.
- **Diagram-shape novelty check**, per the standing note 1.2's Opus pass
  left in this ledger ("shared structure across Part 1 is only
  reinforcement when the repeated element carries new content"). 1.4's
  diagram is a branching conversion chain (requests/day -> average QPS ->
  peak QPS, and separately -> storage / bandwidth) - distinct in kind from
  1.1's yes/no tree, 1.2's three-question router, and 1.3's one-hop
  fan-out. Flagged in spec §12 for a second reader to confirm.
- **Scaling behavior (§9 lens 7) folded into "When precision earns its
  keep" as one sentence rather than given its own section.** Optional for
  Process chapters (§6), and a dedicated section would have mostly repeated
  the worked example at two more multipliers - a density choice, not a
  hidden omission. Justified in spec §4.
- **Production example: WhatsApp's per-connection capacity measurement**,
  chosen because it's directly about estimation informing an infrastructure
  decision (not a generic "this company is big" example) and pairs with the
  URL shortener's own modest numbers per §9 lens 9, rather than reading as
  "so you should do this too."
- **Backward connections: 3 named (0.4, 1.1, 1.3), exceeding §19's >=2** -
  0.4's loop step 3 is the chapter's whole organizing frame, 1.1's ratio is
  used substantively in the core-mechanics worked example and named again
  in "Next," and 1.3's NFRs open the cold open and are named again in "Your
  turn."
- **Forward tease: 1.5 only**, the immediate next chapter. No further-out
  tease to 1.6 - already teased twice (1.1, 0.4), and per §19's "at most
  one" a third would be mechanical, the same judgment call 1.2/1.3 made.
- **One density cut made during drafting, not deferred to a later pass**: a
  paragraph in "When precision earns its keep" restated the prior section's
  specific numbers ("peak QPS here, since a few hundred and a couple
  thousand aren't the same build...") before generalizing - cut down to the
  general principle plus the new 10x/1000x content once noticed, per the
  exact pattern the Opus pass caught in 1.3's diagram/table collision.
  Flagged in spec §12, per standing precedent, for a reviewer to check the
  self-assessed density claim rather than trust it.

**Position-clustering checked by eye**, per the standing instruction from
0.1/0.2's shipped bug. Three single-kind questions (Q3/Q4/Q5) have correct
options at c/a/d - three distinct positions.

**Opus proofread pass (2026-08-09).** Scope: lesson body, content-structure,
blueprints, component lists, validation rules, diagrams. Quiz, hints and
definition metadata were out of scope and untouched. `lessonVersion` 1 -> 2.
Full breakdown in the spec's new §13; summary:

- **Confirmed and left alone:** every number in the lesson is
  arithmetically right (115.74 from 86,400; ~100 QPS from 10^5; 10,000
  creates/day at 1,000x rarer, 0.1 QPS; 500-1,000 peak; 3.65M records x
  500 B = 1.83 GB, "under 2 GB"; ~200 KB/s bandwidth at peak). The 1000:1
  continuity call holds - 1.1 already applies the ratio to this brief ("At
  1000:1, the read path is where the design work goes") and 1.2's cold open
  confirms "heavy read skew," so promoting it reads as a callback, not an
  invented fact; the explicit "confirmed here as the real number" clause was
  kept because it makes the promotion visible. The diagram-novelty claim is
  true on inspection (1.1 one yes/no branch, 1.2 a three-question router,
  1.3 five parallel one-hop mappings; 1.4 is the first with
  operator-labelled edges and the first to fork one source into two branches
  of different lengths). All four in-scope definition fields are correctly
  empty. Structure is complete against §5.3/§6 for Process, matching 1.3's
  shipped heading sequence exactly. Vocabulary is sourced: QPS from 0.4, p99
  from 1.3, expiry from 1.2. "Next" names 1.5, which the manifest confirms.
  No em dash anywhere (grepped, not eyeballed).
- **Nine changes, all content-side. The material one: the primary diagram
  contradicted the prose on two of its four edges.** It derived storage as
  `Requests/day x bytes per record`, but the lesson computes storage from
  *creates* (10,000/day) times a year's retention, not from the 10M
  redirects; and it derived bandwidth from average QPS while the prose
  computes it at peak. Redrawn as two branches - `Requests/day -> Average
  QPS -> Peak QPS -> Peak bandwidth` and `Requests/day -> Writes/day ->
  Storage` - with the retention window on the edge label where the prose
  applies it. §7.2's "diagram accurate to the prose" rule; the shape stayed,
  so the novelty claim above is unaffected.
- Second material one: **the caption asserted something false** - "bandwidth
  flows from the steady average, and neither one spikes the way a request
  rate does." Bandwidth is QPS x bytes per response, so it spikes exactly
  the way the request rate does, and the lesson's own next section computes
  it at peak. Replaced with what actually deserves noticing: storage is the
  only number that accumulates.
- The other seven: the §9 lens-7 sentence was hand-wavy and wrong about what
  changes at 1000x (the shortcut keeps working; the answers stop being
  trivial), now carrying real figures - ~20 GB at 10x, a couple of terabytes
  and near a million peak QPS at 1000x; **"Your turn" promised buckets for
  "QPS, storage, and bandwidth" when the quiz asks only two** (Q1 QPS, Q2
  storage - the lesson was the wrong side, and the quiz was left untouched);
  a contentless transitional sentence in the trade-offs section cut per
  §20.6; WhatsApp's "millions of connections" made concrete as "past two
  million," the published figure; "still a couple of gigabytes" -> "still
  gigabytes, not terabytes" (halving 500 B gives ~0.9 GB); 10,000 creates/day
  now stated explicitly so the 3.65M-record step is traceable; and the
  mental-model sentence realigned with the corrected diagram.
- **Lesson length after the pass: 1,136 words** (1,106 before, same `wc -w`).
  Up slightly - a diagram node, an explicit creates/day figure and three real
  numbers in the scaling sentence, against one cut sentence. §12's density
  claim holds; nothing found was padding.
- **New standing note for later chapters:** when a beat-5 diagram encodes a
  formula, check every edge label against the arithmetic the prose actually
  performs, not against the concept the diagram illustrates. Both defects
  here were plausible-looking simplifications ("storage comes from traffic",
  "bandwidth comes from the average rate") that the chapter's own worked
  numbers contradicted six lines later. 1.5 and 1.7 onward are formula-heavy
  and will hit the same trap.
- **Noted, not touched (out of scope):** `learningObjectives` #4 still reads
  "QPS, storage, and bandwidth" and `problemStatement` says "each output in
  turn," both written against the three-bucket exercise the quiz doesn't
  contain. Harmless as objective statements, but if the quiz ever gains a
  bandwidth question, or if a later pass tightens the objective, these two
  fields and "Your turn" should be reconciled together.

---

## 1.5 Numbers Every Engineer Should Know

- **Authored 2026-08-09 · not yet committed · branch
  `feature/content-1-1-understanding-the-problem`** (same in-progress Wave 2
  branch as 1.1-1.4 - no wave-gate re-check needed, this is a continuation of
  an already-started wave, not a new one).
- Definition id `bb-1-5-numbers-every-engineer-should-know` · manifest slug
  `1-5-numbers-every-engineer-should-know` (`chapterDefinitionId` flipped
  from `null` to this id in the same pass)
- Type: Process (§14's Part 1 header names no per-chapter exception for 1.5;
  no §4/§14 contradiction to resolve here, unlike 1.3) · foundational · 20
  minutes (Reader + knowledge check; no build) · prerequisite: 1.4
- **Lesson length: 1,185 words at draft, 1,226 after the Opus pass**, above
  1.1's comparable 1,063 and 1.3's 1,043 for the same 20-minute estimate,
  closer to 1.4's 1,106 for 25 minutes (the Opus pass confirmed the length is
  the second visual element, not restatement - see its subsection below).
- Pipeline not run this pass (content-authoring only, per the skill's scope
  - `src/content/chapters/index.test.ts`'s hardcoded chapter-id list was
  updated to include the new id, same registry-wiring touch 1.1-1.4 needed,
  but `tsc`/`lint`/`vitest`/`build` were not run).

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-1-5-numbers-every-engineer-should-know.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-1-5-numbers-every-engineer-should-know.md` |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None - no canvas exercise, nothing to validate; justified in spec §8 |
| 5 | Quiz | 5 questions, difficulty ramp 1/1/2/2/3, first chapter to combine `ordering` and `estimate` kinds in the same quiz |
| 6 | Playtest pass | Spec §10 |

**Judgment calls made:**

- **§14's "throughput/storage landmark numbers" narrowed to latency-only
  ratios.** 1.5's own §14 row asks for latency/throughput/storage landmark
  numbers, "more importantly, their ratios (RAM vs. disk vs. network; a
  datacenter round trip vs. cross-continent)." 1.4 already owns
  throughput/storage order-of-magnitude estimation; re-deriving fresh
  throughput or storage figures here would restate 1.4 rather than add to
  it, and the row's own "more importantly, their ratios" clause points
  specifically at the RAM/disk/network comparison. Narrowed the chapter to
  that latency ladder alone. Flagged in spec §11-12 for a second reader to
  confirm this reads as a defensible interpretation rather than a silent
  scope cut.
- **The exercise is not a degradation, unlike 1.1/1.2/1.4.** CURRICULUM
  §14's own 1.5 row - "Exercise: ranking + estimation drills" - is never
  described as "staged," the same distinction 1.3's spec drew for its own
  matching exercise. Realized directly as quiz Q1 (`ordering`: rank five
  operations fastest to slowest) and Q2 (`estimate`: order-of-magnitude
  latency of a two-operation request) - no stages-UI gap to flag.
- **The chapter's central teaching point is the one place the ladder is
  counter-intuitive**: a same-datacenter network round trip (~0.5-1 ms) is
  typically faster than a local disk seek (~10 ms) - engineers who assume
  "local always beats network" have it backwards. This is a real,
  well-established fact (it's the reason large-scale services put a memory
  cache between the app tier and the disk-backed database at all), not an
  invented twist for pedagogical drama. Built the whole lesson around it:
  the think-first prompt asks it directly, the diagram's caption states it,
  quiz Q1's ordering and Q3's scenario both test it.
- **Quiz ratios deliberately matched to QUIZ_FRAMEWORK §6's own already-
  shipped Q5/Q6 rather than a more commonly cited alternative figure.** Q5
  states SSD is "on the order of 10-100x slower" than RAM; some published
  latency tables put a random SSD read closer to ~1,000x a RAM reference.
  Since the framework's Q5/Q6 are pre-existing content this pass doesn't
  own, and chapter quizzes are meant to draw from or model on the section
  banks, the lesson teaches the bank's own ratio rather than introducing a
  conflicting one. Flagged in spec §12 for a second reader to confirm this
  deference is the right call.
- **New diagram shape: a single ascending ladder chain**, not branching and
  with no arithmetic operators on its edges (only ratio factors) - per the
  standing note 1.2's Opus pass left in this ledger ("shared structure
  across Part 1 is only reinforcement when the repeated element carries new
  content"). Distinct from 1.1's yes/no tree, 1.2's three-question router,
  1.3's one-hop fan-out, and 1.4's branching conversion chain. Flagged in
  spec §12 for a second reader to confirm.
- **Diagram and table deliberately carry different content**, per the
  standing note 1.3's Opus pass left about a beat-5 diagram and beat-6 table
  restating the same mapping twice. The diagram carries the ladder's shape
  and ratio jumps; the table carries a concrete worked example per rung (a
  cache hit, an uncached database row, a nearby service call, a
  spinning-disk database, a cross-region call). Flagged in spec §12 for a
  second reader to confirm these don't collide.
- **Scaling folded into "When the ratio is worth paying for" as one
  sentence**, same pattern 1.4 used for the same §9 lens-7 content:
  the ratios are physical constants that don't shift with traffic, but how
  often they're paid does, tying back to 1.4's own peak-QPS estimate.
  Optional for Process per §6, a density choice rather than a hidden
  omission.
- **No everyday analogy in the mental-model beat**, same choice
  0.3/0.4/1.1-1.4 made. A physical-distance analogy (pocket vs. warehouse)
  was drafted and cut - it would have needed its own caveat about the
  ladder's one swap, costing more words than it earned. The diagram's own
  ascending order plus its caption already carries the point.
- **Backward connections: 3 named (1.4, 0.2, 1.3), exceeding §19's >=2** -
  1.4's shortcut-vs-memorize framing organizes the whole chapter, 0.2's
  cache force is used substantively in "When the ratio is worth paying for"
  *and* named again in "Next," and 1.3's latency budgets are named in
  "Next."
- **Forward tease: 1.6 only**, the immediate next chapter. No further-out
  tease - 1.1, 0.4, and 1.4 have all already teased 1.6, and per §19's "at
  most one" a fourth would be mechanical, the same judgment call 1.2/1.3/1.4
  made for their own third-plus tease.
- **One density pass performed during drafting, not deferred**: tightened a
  vague "SSDs... built to hold far more" physics sentence into a concrete
  reason (flash cells cost more to read than a memory circuit, which is
  where the 10-100x gap comes from) once noticed, and cut a filler "just" in
  the landmark table. Flagged here per 0.2-1.4's own precedent of flagging a
  self-assessed density claim for the next reviewer to check rather than
  trust - word count (1,185 for a 20-minute estimate) is above 1.1/1.3's
  ~1,050 for the same estimate, justified in spec §12 as proportionate to
  carrying two visual elements (a diagram and a worked-example table) where
  1.1-1.4 each carried one, but flagged for a second reader to confirm
  rather than trusted.

**Position-clustering checked by eye**, per the standing instruction from
0.1/0.2's shipped bug. Three single-kind questions (Q3/Q4/Q5) have correct
options at c/a/d - three distinct positions.

**Opus proofread pass (2026-08-09).** Scope: content, content-structure,
blueprints, component lists, submit validations, diagrams. Quiz, hints, and
definition metadata (`problemStatement`/`learningObjectives`/
`curriculumContext`) stayed out of scope and were not touched. `lessonVersion`
bumped 1 -> 2. Full detail in spec §13; the material points:

- **Requested off specific user feedback**, not a routine sweep: the chapter
  reads as the best-written Part 1 chapter so far, but "rung" is never
  defined and several sentences take more than one read. Both complaints were
  real.
- **"rung" was undefined and the ladder had no fixed orientation.** The word
  debuted in a section heading with no gloss anywhere, and "above" meant two
  opposite things in the same lesson: the caption's "the same-datacenter
  network hop sits above (faster than) the disk seek" (above = faster) versus
  the trade-off section's "Every rung above RAM exists because..." (above =
  slower, since RAM is the fastest rung). Fixed by defining both at first
  use - "Line the five operations up as a ladder, fastest at the top: each
  rung is one kind of operation, and each step down costs roughly 10 to 100
  times the rung above it" - and rewording every later use to that one
  orientation. Heading "What's actually at each rung" -> "Each rung, in
  practice".
- **The diagram was `flowchart LR`** while the prose called it a ladder with
  a top. Flipped to `TD`. Still a single unbranched chain with ratio-only
  edge labels, so the diagram-novelty claim is unaffected.
- **The ratio chain did not compose** - 1.4's own standing note hitting a
  second time. RAM ~100 ns, then "10-100x" to SSD, then "~10x" to a 0.5-1 ms
  datacenter round trip gives at most 100 us, not 0.5-1 ms; and the SSD node
  read "~10s of microseconds", which is 200-900x a 100 ns reference and
  contradicts the "10-100x" edge one node earlier (it also parses for a beat
  as "ten seconds"). Resolved **without** disturbing the deliberate deference
  to QUIZ_FRAMEWORK §6 Q5: the 10-100x RAM->SSD ratio is untouched, SSD
  becomes "~10 microseconds" (100x of 100 ns, top of that band, and a
  defensible modern NVMe landmark), and the SSD -> datacenter edge becomes
  "~50x". The chain now composes: 100 ns -> 10 us -> 0.5-1 ms -> 10 ms ->
  150 ms. No quiz question asserts the SSD -> datacenter ratio, so nothing
  conflicts.
- **"RAM is electrical - a few nanoseconds" contradicted the table's ~100 ns**
  two lines above it. Fixed as part of splitting the five-sentence physics
  paragraph (§20.1 caps at four) into two, organized by the actual physics -
  electrical rungs, then physical ones - so the disk-loses-to-network fact
  falls out of the structure instead of being asserted.
- **Roughly ten multi-clause sentences split or rewritten**, each one a
  place the pass genuinely re-read on a cold pass: the cold open's compound
  "2x faster or 200x faster changes whether..." (singular verb, unmarked
  shift into the candidate's head), "These ratios" with no antecedent, "it
  skips a layer" with no referent, "In production"'s 45-word who/why/callback
  sentence, "costs the same trust as guessing wrong", "Your turn"'s stranded
  "to estimate the rough total latency of", "cash out against the ladder
  above", and Recap bullet 1's "except one pair that swaps".
- **Common mistakes bullet 1 contradicted itself** ("the rung before it" in
  bold, "the next rung" in the explanation). Now one direction.
- **Confirmed and left alone:** `blueprints: []`,
  `availableComponentIds: []`, `requiredComponentIds: []`,
  `validationRuleIds: []` are all correct with no undeclared exception (no
  `starterGraph`, `hasEditorExercise: false`, the lesson names no component
  and §16 homes the three primitives at 1.6); §5.3/§6 structure complete for
  Process with both renamed headings still in beat order; the diagram/table
  content split does not collide (the examples column has no counterpart in
  the diagram); the §14 throughput/storage narrowing is defensible; "Next"
  names 1.6, confirmed against `manifest.ts`; no em dash; vocabulary all
  sourced except "app tier", replaced with "their application servers".
- **Length 1,185 -> 1,226 (+41)**, the same direction and size as 1.4's own
  Opus pass (1,106 -> 1,136). The growth is the "rung" definition, the
  caption's orientation gloss and the paragraph splits; six sentences were
  cut or compressed to pay for part of it.
- **Out of scope, noted not fixed:** quiz Q1's RAM explanation still says "a
  few nanoseconds" (the same contradiction fixed in the lesson body), and
  Q1's explanations now depend on the lesson's "rung"/"ladder" vocabulary -
  safe today because the lesson defines it, but a real dependency.

**New standing note for later chapters.** A metaphor word that becomes a
chapter's organizing vocabulary ("rung", and any future "tier", "layer",
"hop", "budget") needs two things at first use, not one: a gloss saying what
it means, and a fixed orientation if the metaphor has a direction. 1.5 had
neither, and the missing orientation is what let "above" mean faster in one
section and slower in another without anyone catching it at draft time. The
gloss is already a §20.1 requirement; the orientation check is the new part.

---

## 1.6 Drawing the First Architecture

- **Authored 2026-08-09 · not yet committed · branch
  `feature/content-1-1-understanding-the-problem`** (same in-progress Wave 2
  branch as 1.1-1.5 - no wave-gate re-check needed, this closes the wave
  rather than starting one).
- Definition id `bb-1-6-drawing-the-first-architecture` · manifest slug
  `1-6-drawing-the-first-architecture` (`chapterDefinitionId` flipped from
  `null` to this id in the same pass)
- Type: **Building Block** - the first chapter in this wave that isn't
  Concept or Process. Foundational · 30 minutes (Reader + real Editor build,
  the first Part 1 estimate that isn't Reader-only) · prerequisite: 1.5.
- **Lesson length: 1,209 words**, leaner per estimated minute than 1.5's
  1,226 for 20 minutes even though 1.6's own estimate is 30 - proportionate
  once read correctly: most of the extra 10 minutes is real Editor build
  time, not Reader time, so the Reader portion did not need to scale
  linearly with the estimate (no Opus pass has run yet to confirm this
  independently).
- Pipeline not run this pass (content-authoring only, per the skill's scope
  - `src/content/chapters/index.test.ts`'s hardcoded chapter-id list was
  updated to include the new id, same registry-wiring touch 1.1-1.5 needed,
  but `tsc`/`lint`/`vitest`/`build` were not run).

**Blocking decision resolved before drafting (user-directed, 2026-08-09).**
Open decision #3 below names 1.6 specifically as blocked: CURRICULUM §7.2
requires topology diagrams to render as ScaleCraft graph JSON, but
`MarkdownRenderer.tsx` was checked directly and has no block type for
`ArchitectureGraph` JSON - only `MermaidBlock` exists. 1.6 is the first
Building Block chapter, and its primary diagram (beat 5, mandatory) is
exactly a topology. Asked the user directly rather than working around it
silently, per this ledger's own standing policy for open decisions. **Chosen:
Mermaid exception for 1.6's lesson-body diagram only**, justified because the
*real* interactive topology already exists and is what the learner actually
builds - the chapter's `starterGraph` and `blueprints[0]` are genuine
`ArchitectureGraph`/`GraphPattern` values that render, simulate, and validate
for real in the Editor. The lesson diagram is a static preview shown before
the prose that explains it, not the chapter's only encounter with the shape.
**This resolves the blocker for 1.6 only, not §7.2 in general** - 3.4 (Load
Balancer, later this wave) will need its own version of this same call when
it's authored; see open decision #3's update below.

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-1-6-drawing-the-first-architecture.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-1-6-drawing-the-first-architecture.md` |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None new - 5 existing rules curated; justified in spec §7 |
| 5 | Quiz | 5 questions, difficulty ramp 1/1/2/2/3, first chapter to author a `diagram`-kind question (modeled on QUIZ_FRAMEWORK §6's own published Q7 for this exact chapter/rule) |
| 6 | Playtest pass | Spec §11 |

**Judgment calls made:**

- **First real construction-family exercise in this wave.** 1.1-1.5 all
  declared `hasEditorExercise: false` with empty `availableComponentIds`/
  `blueprints`/`validationRuleIds`, reusing 0.2's mechanism. 1.6 needs none
  of that - it has a real Fix exercise, so `hasEditorExercise` is left
  absent (defaults to `true`, matching every chapter authored before that
  field existed).
- **§16's formal introduction, not another borrowed exception.** 0.1 used
  `client`/`app-server`/`sql-database` as narrow, undeclared-choice scenery
  (open decision #2 below), explicitly deferring the real introduction to
  1.6. This chapter is that introduction: `availableComponentIds` equals
  `requiredComponentIds` equals all three, no exception to declare. Open
  decision #2 is resolved by this chapter existing, not left open.
- **Starter graph reuses 0.1's "two real, distinct issues" pattern, not "find
  the bug" blind (§11.1).** Missing `app-server` (a required component with
  nothing satisfying it) plus a `client -> sql-database` edge kept at kind
  `request-flow` deliberately, not an illegal kind - the more instructive
  fault, since it shows the rule fires on *what* an edge connects, not on
  its label. This also means the edge trips **two** rules at once
  (`no-direct-client-database` and `component-relations`, the latter via
  `sql-database`'s own already-documented category restriction) - not a new
  coincidence, `content/components/config/data.ts`'s own comment already
  calls this overlap deliberate belt-and-suspenders. Flagged in spec §12 for
  a second reader to confirm two stacked messages on one edge reads as
  reinforcing rather than confusing on a first real, unguided Fix exercise.
- **No guided tour, unlike 0.1.** 0.1's Fix exercise is walked by
  `design-editor-tour.ts`; 1.6's is not (`editorTourId` left absent). This is
  the deliberate difficulty step from a tour-guided first fix to a real,
  unguided one - the hint stack and the validation explanations are the only
  support, which is what a Building Block chapter's higher stage-2
  (construction) demand actually looks like in practice.
- **Failure modes and Scaling are mandatory content for the first time in
  this wave.** §6 makes both "M" for Building Block, "o" for Concept/Process
  - 1.1-1.5 all justified omitting or folding them; 1.6 can't and doesn't.
  Merged into one section ("What breaks first") since app-server-crash vs.
  database-crash and the 10x/100x story are one continuous idea here, which
  §6 permits for adjacent short sections.
- **§9 lenses 1, 5, 7 made explicit, per the binding rule for every Building
  Block chapter** ("at least lenses 1, 5, and 7 appear explicitly"). Lens 1
  (why this exists) is beat 2's own framing; lens 5 (what breaks first) names
  the app server explicitly as the first failure; lens 7 (10x/100x) states
  both multipliers with qualitative, specific outcomes rather than hand-wavy
  ones, per 1.4/1.5's own standing note about checking scale-ladder claims
  against real arithmetic (there is no arithmetic to check here - both claims
  are qualitative by design, not computed figures that could drift).
- **One further-out forward tease, to 3.4** (§19's "at most one"), spent in
  the Scaling half of "What breaks first": splitting traffic across more
  than one app-server instance needs a load balancer, which 3.4 introduces.
  Checked against every prior Part 1 entry in this ledger - none has already
  teased 3.4, so this is the first spend of that particular tease, not a
  repeat. The mandatory immediate-next preview (1.7) is separate and sits in
  "Next".
- **Production example: Instagram's early monolith** (one app tier, one
  primary Postgres database, millions of users), chosen to be distinct from
  every other Part 1 production example so far (1.2 Basecamp, 1.3 S3, 1.5
  Meta) and to land §9 lens 9 (how would a two-person startup solve this)
  without needing exotic infrastructure - the point is that the minimal
  shape is a genuine production answer at real scale, not a toy.
- **Quiz Q2 is a `diagram`-kind question**, the first one actually authored
  in the registry (0.2's ledger confirmed the UI itself renders and works via
  a direct Playwright check, but no chapter had used it yet). Modeled on
  QUIZ_FRAMEWORK §6's own Q7, which is explicitly written as "the first
  validation rule the learner ever meets (1.6, `no-direct-client-database`)"
  - reworded and re-laid-out, not copied verbatim, matching every other
  chapter's practice of modeling on bank content rather than reproducing it.
- **Quiz position-clustering checked by eye**, per the standing instruction
  from 0.1/0.2's shipped bug. Four single-kind questions (Q1/Q3/Q4/Q5) have
  correct options at b/a/c/d - four distinct positions.
- **No density revision pass performed as a distinct drafting round** -
  written once against §20.6 directly. Flagged here per 0.2-1.5's own
  precedent of flagging a self-assessed density claim for the next reviewer
  to check rather than trust, though the word-count comparison above (1,209
  words, leaner per minute than 1.5) is at least a rough check against
  padding.

**Opus proofread pass (2026-08-09).** Content-only, no pipeline run. Scope was
the six audit areas (content, content-structure, blueprints, component lists,
submit validations, diagrams); quiz, hints and
`problemStatement`/`learningObjectives`/`curriculumContext` were left
untouched. `lessonVersion` 1 -> 2. Full detail in spec §13.

- **Checked by tracing source, not by trusting the draft's narrative.** Read
  all five rule implementations, `chapter-outcome.ts`, and the three
  components' `relations`, then ran the starter graph through them by hand.
- **Two factual errors found in the draft's account of its own validation.**
  (a) `component-relations` was attributed solely to `sql-database`'s input
  contract. In fact *both* endpoint contracts reject the edge, and because
  `component-relations.ts` tests `!outputCategoryOk` first, the message the
  learner reads names the **Client's output rules**
  (`outputs.allowedCategories: ["networking","compute"]`, no `data`) - not the
  database's. (b) The draft claimed `missing-input-connection` reports the
  absent `app-server`. It cannot: the rule iterates `graph.nodes` and
  `app-server` isn't in the starter graph, so it returns zero findings there.
  The absent component is reported by `runChapterValidation`'s
  `missingRequiredComponentIds` check, independent of any rule. **The curation
  itself was right both times** - the exercise is correctly gated, and all
  three structural rules earn their place as guards on the intermediate states
  the fix passes through. Only the spec's and the code comment's explanations
  were wrong; both corrected.
- **Four lesson edits.** (1) The diagram caption claimed `request-flow` "only
  ever" runs client -> app -> db, which is false as a general claim about the
  edge kind and is contradicted by 3.4's own topology - a real risk under
  §7.2's "learners absorb edge semantics from every diagram" warning; it also
  claimed the exercise checks "one rule" (five are curated, two fire on the
  one bad edge), which the learner disproves on their first Validate and which
  contradicted the chapter's own deliberate withholding of that count.
  (2) The Instagram example overclaimed - "a single primary Postgres database,
  serving millions of users" and "the trade-off they accepted ... a single
  point of failure" are not defensible, since by that scale Instagram ran many
  app servers behind a load balancer with Postgres split across machines.
  Rewritten to the launched-on-this-shape-and-grew-on-it framing, which is
  both accurate and a stronger version of the chapter's actual point.
  (3) "Next" carried **no** backward references; §19 requires >=2 in beat 14,
  and 1.4/1.5 both put them there. Added 0.4/1.4/1.5, matching their shape.
  Note the draft spec claimed §19 was cleared by references in beats 8 and 13,
  which is not what §19 says - worth watching for in later chapters.
  (4) "the first thing to saturate" -> "run out of headroom", so the
  senior-answer line uses only this chapter's own vocabulary as §10.3 and the
  spec's own beat-13 note require ("saturate" is 1.7's word and appears
  nowhere else in Part 1).
- **Confirmed and left alone:** blueprint is honest and not pre-satisfied by
  the starter graph; component lists match §16's 1.6 row exactly; all five
  rule ids resolve; Failure modes and Scaling are genuinely present, not
  gestured at; §9 lenses 1/5/7 explicit; "Next" names 1.7 per the manifest;
  no em dash; one diagram only, with nothing claiming a graph-JSON diagram
  exists. The two-stacked-messages concern flagged in spec §12 was reviewed
  and deliberately not changed - two findings on one edge is correct product
  behavior, the two explanations say different things, and the lesson's
  choice not to preview the count is declared, not accidental.
- **New drift found: §14's 1.6 row says "Exercise: build + fix + simulator
  trace"; the chapter ships build + fix only.** Not resolved (adding a trace
  is exercise/engineering work, not content) and now declared in spec §4. This
  is the same class of doc-vs-shipped mismatch as open decision #1's 0.1 row -
  see the new open decision #7 below.
- **Note for the quiz pass (out of this pass's scope, not acted on):** Q3's
  stem asks why `no-direct-client-database` fires "regardless of what kind the
  edge is given". That is accurate to the rule, but the starter graph's edge
  is `request-flow` and the learner never sees the rule fire on any other
  kind, so the question tests a claim the chapter asserts rather than one the
  exercise demonstrates. Worth a look by whoever owns the quiz.

**Open note for a later pass (not resolved here):** the Mermaid-exception
decision (above) was scoped narrowly to 1.6 on purpose. When 3.4 is authored
later this wave, it hits the identical §7.2 gap and needs its own explicit
call - don't assume 1.6's precedent silently extends to it without asking
again, since 3.4's diagram needs (multiple instances, health-check `control`
edges) are more complex than 1.6's straight-line shape and the trade-off
might land differently.

---

## 1.7 Identifying Bottlenecks

- **Authored 2026-08-10 · not yet committed · branch
  `feature/content-1-7-identifying-bottlenecks`** (cut from `feature/content-
  1-1-understanding-the-problem` at the point it had 1.1-1.6, rather than
  from the bare release branch - see "Branch topology" below).
- Definition id `bb-1-7-identifying-bottlenecks` · manifest slug
  `1-7-identifying-bottlenecks` (`chapterDefinitionId` flipped from `null` to
  this id in the same pass)
- Type: **Process** (reverts from 1.6's Building Block exception - no
  components introduced, back to Part 1's default per open decision #6's
  precedent). Foundational · 25 minutes (Reader + knowledge check, no build)
  · prerequisite: 1.6.
- **Lesson length: 1,352 words** at draft, after one density pass already
  folded in (see "Judgment calls" below). Above 1.4's 1,106 for the same
  25-minute estimate; flagged for a second reader rather than trusted - see
  spec §12.
- Pipeline not run this pass (content-authoring only, per the chapter-author
  skill's standing scope - `src/content/chapters/index.test.ts`'s hardcoded
  chapter-id list was updated to include the new id, same registry-wiring
  touch every prior chapter needed, but `tsc`/`lint`/`vitest`/`build` were
  not run).

**Branch topology, decided with the user before drafting (2026-08-10).** The
checked-out branch at the start of this session was
`feature/content-1-1-understanding-the-problem` (containing 1.1-1.6, itself
cut from `release/v4.1.0-part-1-curriculum` at commit `0f8f96a`, not yet
merged there). The user asked for a new branch "off the release branch" for
this chapter; asked to confirm which base was intended given the release
branch itself doesn't yet contain 1.1-1.6, and the user chose stacking on the
current checkout (matching every prior Part 0/1 chapter's own precedent of
stacking on one wave branch rather than cutting per-chapter branches off the
literal release line). `feature/content-1-7-identifying-bottlenecks` is the
result - 1.6 is present as real prerequisite content, not just a CURRICULUM
row, and the "already-shipped chapter as structure precedent" step of the
draft workflow used 1.5 and 1.6 for real.

**Open decision #7 confirmed, not just predicted.** That decision (raised by
1.6's Opus pass) named 1.7 in advance: "§14's 1.7 row ... makes the same
[simulator-trace] promise, so 1.7's author hits this before the decision can
keep being deferred." Confirmed here. `pending-content.md`'s own dependency
note already covers this exact case (simulator-dependent beats degrade to a
quiz question, with the intended upgrade noted) - applied directly rather
than treated as a new problem. See spec §0 for the full reasoning. Still not
resolved: whether to amend CURRICULUM §14's 1.6/1.7 rows or build the
simulator work - this chapter is the second data point for that eventual
single decision, not a resolution of it.

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-1-7-identifying-bottlenecks.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-1-7-identifying-bottlenecks.md` |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None - no canvas exercise, nothing to validate; justified in spec §7 |
| 5 | Quiz | 5 questions, difficulty ramp 1/1/2/2/3; **three** `diagram`-kind questions (Q1/Q3/Q5) sharing one topology with varying `instances` config and ceilings, the first chapter to author more than one diagram question |
| 6 | Playtest pass | Spec §11 |

**Judgment calls made:**

- **Predict-then-check realized as three diagram questions, not one.**
  CURRICULUM §14's row is specific: "predict-then-check on three presented
  graphs." Rather than the usual one diagram question per chapter (1.6's
  precedent), authored three, all reusing 1.6's exact three-component
  topology with only the `instances` config and stated ceilings changed
  between them - Q1 and Q3 give opposite correct answers on identical
  topology, which is the chapter's own point (the bottleneck is a
  comparison between today's numbers, not a fixed property of a component)
  made structurally, not just asserted in prose. Flagged in spec §12 as a
  new shape for a second reader to confirm rather than assume is fine by
  precedent.
- **No topology-styled primary diagram in the lesson body**, unlike 1.6.
  Open decision #3 records that 1.6's Mermaid-as-topology exception was
  scoped narrowly and shouldn't be assumed to extend silently. Rather than
  re-raise that call for this chapter, the primary diagram uses generic
  "Stage 1/2/3" labels with ceiling numbers - a capacity concept diagram,
  not an architecture-graph rendering - and the next section maps it onto
  the real component names in prose. The quiz's own diagram questions do
  carry real component graphs (client/app-server/sql-database), which is a
  different rendering path (`QuizQuestion.graph` via the quiz UI, already
  verified functional, already used by 1.6's Q2) and needed no exception.
  Flagged in spec §4/§12 for a second reader to confirm this reads as a
  clean sidestep rather than avoiding the question 1.6 answered directly.
- **No construction-family exercise - justified Process/no-component
  chapter, same pattern 1.1-1.5 used.** §16 places 1.7 in the no-component
  list. `availableComponentIds`/`requiredComponentIds` both `[]`,
  `blueprints: []`, no `starterGraph`, `hasEditorExercise: false`, no hints
  (nothing for a hint to orient toward with no build) - all matching
  1.1-1.5's precedent exactly, not 1.6's.
- **1.6's shape and its own specific answer reused as Q1**, deliberately: the
  chapter's whole argument is that "the app server runs out of headroom
  first" was a fact about 1.6's numbers, not a rule, and testing that by
  reproducing 1.6's exact shape and asking the same question through the new
  method is a stronger demonstration than a fresh, unconnected example would
  have been.
- **The slow-vs-unscalable distinction and the moving-bottleneck mechanism
  merged into one internal-mechanics beat** (§6's adjacent-short-sections
  allowance) - they are one continuous idea here (different capacities
  producing different current answers to the same question), not two
  separate topics competing for space.
- **Trade-off section (preempt vs. wait) kept genuinely two-sided**, per
  §11.1's rule against secretly-correct trade-off content - no default
  answer is stated; the chapter states the two costs and stops.
- **One further-out forward tease, to 2.2** (§19's "at most one"), directly
  textually supported by CURRICULUM §14's own 2.2 row ("Prepares for: 1.7's
  skill applied spatially") rather than invented. Checked against every
  entry through 1.6: none has already spent a tease on 2.2.
- **Production example: Twitter's early database bottleneck**, chosen as a
  fresh company (not yet used this wave: 1.2 Basecamp, 1.3 S3, 1.5 Meta, 1.6
  Instagram) and because it's a genuine diagnosis-before-fix story at the
  right depth - the specific fix they built afterward is 3.x material and
  deliberately left out, per §13's rule against implementation tourism.
  Flagged in spec §12 for a second reader to confirm the boundary held.
- **One density pass performed during drafting, not deferred**: tightened
  the 10x/100x section (which had restated the moving-bottleneck mechanism
  from the section immediately above it almost verbatim), the trade-off
  section, and one sentence in "Tracing it on a real path" - cut roughly 30
  words. Word count (1,352) is still above 1.4's comparable-estimate figure;
  flagged in spec §12 rather than treated as settled, per every prior
  chapter's own precedent for a self-assessed density claim.
- **Quiz position-clustering checked by eye**, per the standing instruction
  from 0.1/0.2's shipped bug. Only two single-kind questions this chapter
  (Q2, Q4) - correct options at `b` and `a`, distinct positions. The three
  diagram questions are outside the invariant test's scope (it applies to
  single-kind questions) but checked by eye anyway; no shared-position
  pattern found across them.

**Open note for a later pass (not resolved here):** the generic
non-topology primary diagram (§4 of the spec) is a judgment call to sidestep
open decision #3 rather than answer it. If a future chapter needs an actual
topology diagram in the lesson body again (3.4 already will), that's still
open decision #3's job to resolve properly, not something this chapter's
sidestep quietly settles.

---

## 1.8 Engineering Trade-offs

- **Authored 2026-08-10 · not yet committed · branch
  `feature/content-1-7-identifying-bottlenecks`** (continues directly after
  1.7 on the same branch - no new branch cut, same topology decision 1.7
  already recorded).
- Definition id `bb-1-8-engineering-trade-offs` · manifest slug
  `1-8-engineering-trade-offs` (`chapterDefinitionId` flipped from `null` to
  this id in the same pass)
- Type: Process (§16's no-component list, alongside 1.1-1.5, 1.7, 1.9-1.11 -
  no type-reversion call needed, unlike 1.6/1.7). Foundational · 20 minutes
  (Reader + knowledge check, no build) · prerequisite: 1.7.
- **Lesson length: 1,234 words** (by `wc -w`, including table/Mermaid syntax
  overhead) after one density pass folded into drafting. Within range of
  1.1's 1,153 (post-Opus-pass) and 1.5's 1,185-1,226, both the same
  20-minute estimate; flagged for a second reader rather than trusted - see
  spec §12.
- Pipeline not run this pass (content-authoring only, per the chapter-author
  skill's standing scope - `src/content/chapters/index.test.ts`'s hardcoded
  chapter-id list was updated to include the new id, same registry-wiring
  touch every prior chapter needed, but `tsc`/`lint`/`vitest`/`build` were
  not run).

**No open-decision collision this chapter, unlike 1.7.** §14's 1.8 row
promises "trade-off scenarios x3" - a `Trade-off scenario` exercise per
§11.1's own taxonomy, already natively expressible as `single`/`multi` quiz
questions with no simulator or stages-UI dependency. Realized directly, no
degradation needed and no new entry required in the "Open decisions" list
below. See spec §0.

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-1-8-engineering-trade-offs.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-1-8-engineering-trade-offs.md` |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None - no canvas exercise, nothing to validate; justified in spec §7 |
| 5 | Quiz | 5 questions, difficulty ramp 1/1/2/2/3; Q2/Q4/Q5 directly realize CURRICULUM §14's "trade-off scenarios x3" exercise text |
| 6 | Playtest pass | Spec §11 |

**Judgment calls made:**

- **A real Practical objective included, correcting an apparent gap in
  1.7's own spec.** 1.7's spec text claimed "all five categories
  represented" but its actual five objectives (Knowledge, Engineering x2,
  Interview, Communication) omit Practical entirely - contradicting
  1.1/1.2/1.4/1.5's own precedent of a real, quiz-tied Practical objective
  for Process chapters (they don't get the Concept-only carve-out). 1.8
  follows 1.1/1.2/1.4/1.5's actual pattern, not 1.7's apparent slip; flagged
  in spec §2 and §12 so this isn't mistaken for a shared convention, and so
  1.7's gap doesn't go unnoticed by a future reader auditing that chapter's
  definition metadata (which is outside Opus's audit scope per the
  chapter-author skill, so nothing else will catch it).
- **"Consistency" introduced as vocabulary for the first time, deliberately
  kept mechanism-free.** CURRICULUM §14's own 1.8 row lists "consistency" as
  one of the cost dimensions to introduce, but 3.12's row separately claims
  "replication lag and read-your-writes as the first consistency encounter."
  Resolved by layering, not by picking one: 1.8 introduces the *word*
  ("does everyone asking right now get the same answer") with no mechanism
  attached (no replica, no cache, no specific technique named), so 3.12
  remains honestly the first encounter with the *mechanism*. Recorded as a
  simplification in `curriculumContext.simplifications` and flagged in spec
  §5/§12 for a second reader to confirm the boundary holds rather than
  reading as a collision with 3.12's own claim.
- **Primary diagram reuses 1.1's decision-tree Mermaid shape**, not a
  topology diagram - consistent with `pending-chapters.md`'s open decision
  #3 (1.6's Mermaid-as-topology exception is narrow, not a standing
  license). The diagram (bottleneck decision branching into "add instances"
  vs. "bigger machine," each leaf naming Buys/Spends) is introduced early
  (beat 5) and unpacked in full prose at beat 8 ("Bigger machine or more of
  them"), the same shown-before-explained pattern 1.6/1.7 used for their own
  primary diagrams.
- **Worked trade-off (vertical vs. horizontal scaling) is a new decision,
  not a repeat of 1.7's "preempt vs. wait."** 1.7 already owns the
  preempt-vs-wait trade-off; reusing it here would restate rather than
  extend. The vertical/horizontal choice is genuinely two-sided (money,
  complexity, operability all cut differently across the two branches) and
  builds directly on 1.6's `instances` field and 1.7's "ceiling" vocabulary
  without needing anything from 1.9 onward.
- **Cold open is a direct continuation of 1.7's own "Next" section**, which
  named this exact gap in advance ("knowing what breaks first only tells
  you what's wrong... naming the cost of that decision out loud is next").
  Not an invented connection - 1.7's own text predicted it.
- **No topology-styled component diagram, no canvas exercise - justified
  Process/no-component chapter**, same pattern 1.1-1.5/1.7 used. §16 places
  1.8 in the no-component list. `availableComponentIds`/`requiredComponentIds`
  both `[]`, `blueprints: []`, no `starterGraph`, `hasEditorExercise: false`,
  no hints.
- **Failure modes and Scaling omitted, not merged** (unlike 1.7, which
  merged them). Optional for Process per §6; no system exists in this
  chapter to fail or scale - the chapter teaches a reasoning reflex applied
  to decisions whose actual failure/scaling behavior belongs to 1.6/1.7, so
  re-covering it here would restate rather than add. Justified in spec §4.
- **Production example: Uber's driver-location staleness**, chosen as a
  fresh company this wave (not yet used: 1.2 Basecamp, 1.3 Amazon S3, 1.5
  Meta, 1.6 Instagram, 1.7 Twitter) and because it's a genuine, publicly
  documented consistency-for-responsiveness trade-off at the right depth -
  no specific mechanism named, per §13's rule against implementation
  tourism.
- **One further-out forward tease, to 3.22** (§19's "at most one"), directly
  supported by CURRICULUM's own description of 3.22 as "the curriculum's
  consistency home." Checked against every entry through 1.7: none has
  already spent a tease there.
- **One density pass performed during drafting, not deferred**: tightened
  "Finding what you spent," "Bigger machine or more of them," "In
  production," and "Next" - cut roughly 60 words. Word count (1,234) is
  proportionate to 1.1/1.5's own figures for the same estimate; flagged in
  spec §12 rather than treated as settled, per every prior chapter's own
  precedent for a self-assessed density claim.
- **Quiz position-clustering checked by eye**, per the standing instruction
  from 0.1/0.2's shipped bug. Four single-kind questions (Q1, Q2, Q4, Q5) -
  correct options at `c`, `a`, `d`, `b`, four distinct positions, matching
  1.1's own precedent. Q3 (`multi`) is outside the invariant test's scope by
  definition.

**Open note for a later pass (not resolved here):** the "consistency"
layering judgment call above (word introduced here, mechanism still owned by
3.12) is a new pattern - not yet tested by a second chapter the way open
decision #7 was confirmed by 1.7. If a future chapter's own vocabulary
introduction runs into the same word-vs-mechanism question, treat this
chapter's approach as a precedent to confirm, not an automatically-settled
rule.

---

## 1.9 Deep Dive Methodology

- **Authored 2026-08-10 · not yet committed · branch
  `feature/content-1-7-identifying-bottlenecks`** (continues directly after
  1.8 on the same branch - no new branch cut, same topology decision 1.7
  already recorded).
- Definition id `bb-1-9-deep-dive-methodology` · manifest slug
  `1-9-deep-dive-methodology` (`chapterDefinitionId` flipped from `null` to
  this id in the same pass)
- Type: Process (§16's no-component list, alongside 1.1-1.5, 1.7-1.8,
  1.10-1.11 - no type-reversion call needed). Foundational · 20 minutes
  (Reader + knowledge check, no build) · prerequisite: 1.8.
- **Lesson length: 1,191 words** (by `wc -w`), written once against §20.6
  directly. Within range of 1.1's 1,153 (post-Opus-pass) and 1.8's 1,234,
  both the same 20-minute estimate; flagged for a second reader rather than
  trusted, per every prior chapter's own precedent.
- Pipeline not run this pass (content-authoring only, per the chapter-author
  skill's standing scope - `src/content/chapters/index.test.ts`'s hardcoded
  chapter-id list was updated to include the new id, same registry-wiring
  touch every prior chapter needed, but `tsc`/`lint`/`vitest`/`build` were
  not run).

**No open-decision collision this chapter, same shape as 1.8, unlike 1.7.**
§14's 1.9 row promises "given a design + requirements, pick the right
deep-dive target from four; explanation per option" - a single-choice quiz
question shape with no simulator/stages-UI dependency, the same native fit
1.8's trade-off scenarios had. Realized directly as quiz Q2 and Q4, no
degradation, no new entry required in the "Open decisions" list below. See
spec §0.

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-1-9-deep-dive-methodology.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-1-9-deep-dive-methodology.md` |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None - no canvas exercise, nothing to validate; justified in spec §7 |
| 5 | Quiz | 5 questions, difficulty ramp 1/1/2/2/3; Q2/Q4 directly realize CURRICULUM §14's "pick the right deep-dive target from four" exercise text |
| 6 | Playtest pass | Spec §11 |

**Judgment calls made:**

- **A false attribution caught and removed during drafting, not left for
  audit.** An early draft of "Common mistakes" cited "deep-diving
  everything" as "(0.4's own named candidate mistake)." Grepped every
  shipped lesson (`public/content/chapters/*.md`) for the phrase before
  finalizing and found no chapter has actually taught it yet - CURRICULUM
  §10.2 is framework text describing the recurring candidate-mistakes
  callout box in the abstract, not a claim that 0.4's own shipped lesson
  uses this language. Fixed by stating the mistake on its own merit,
  unattributed, matching this chapter's other three mistakes and avoiding
  exactly the untaught-vocabulary/false-citation trap the chapter-author
  skill's draft reference calls out by name. See spec §12 for the full
  note.
- **A real Practical objective included**, per 1.1/1.2/1.4/1.5/1.8's actual
  precedent (Process chapters do not get the Concept-only Practical
  carve-out) - not 1.7's apparent slip, which 1.8's own ledger entry already
  flagged as worth a second reader's attention rather than a shared
  convention.
- **Primary diagram is a decision tree (Mermaid), not a topology diagram**,
  consistent with open decision #3 (1.6's Mermaid-as-topology exception is
  narrow) and with 1.1's and 1.8's own precedent of using this shape for a
  selection procedure. `Decision tree` is explicitly in §7.1's diagram
  inventory for exactly this use.
- **Cold open is a direct continuation of 1.8's own "Next" section**, which
  named this exact question in advance ("once you know what broke and what
  fixing it costs, which piece of a ten-component design is worth looking
  at closely?"). Not an invented connection - 1.8's own text predicted it,
  the same pattern 1.7's "Next" set up for 1.8 and 1.8's "Next" set up for
  this chapter.
- **Failure modes and Scaling omitted, not merged** (same choice 1.8 made,
  unlike 1.7's merge). Optional for Process per §6; no system exists in this
  chapter to fail or scale - the chapter teaches a judgment/communication
  skill applied to systems whose actual failure/scaling behavior belongs to
  1.6/1.7.
- **Three requirement-to-target examples (throughput, durability,
  cross-continent latency) all stay within the taught 1.6 palette and
  taught vocabulary** - no mechanism (cache, read replica, CDN) is named as
  a fix; `curriculumContext.notYetIntroducedConcepts` records all three as
  deliberately absent. The chapter finds the target, it does not solve it.
- **One further-out forward tease, to 3.12** (§19's "at most one"). Checked
  against every prior ledger entry: 3.4 (1.6), 2.2 (1.7), and 3.22 (1.8) are
  already spent; 3.12 (read replica) is unused. Chosen over 3.14 (cache)
  because this chapter's read-path example is framed as a throughput/volume
  problem, which 1.1's own Opus-pass correction assigned to read replicas,
  not caches (repeated-read latency). Flagged in spec §12 for a second
  reader to confirm the target, same caution 1.1's own correction was
  written to prevent recurring.
- **Amazon used as the production example**, in a role distinct from its
  0.4 appearance (the design-doc/6-pager convention, a different decision
  entirely) - the 100ms-latency-to-1%-sales figure is specifically about
  where engineering review time goes, which is this chapter's subject.
  Fresh company-in-this-role for the wave (1.2 Basecamp, 1.3 Amazon S3, 1.5
  Meta, 1.6 Instagram, 1.7 Twitter, 1.8 Uber). Flagged in spec §12 for a
  second reader to confirm this doesn't read as tourism given Amazon's
  other Part-0 appearance.
- **No density revision pass performed as a distinct drafting round** -
  written once against §20.6 directly at 1,191 words, proportionate to
  1.1's and 1.8's own figures for the same 20-minute estimate. Flagged in
  spec §12 rather than treated as settled, per every prior chapter's own
  precedent for a self-assessed density claim.
- **Quiz position-clustering checked by eye**, per the standing instruction
  from 0.1/0.2's shipped bug. Four single-kind questions (Q1, Q2, Q4, Q5) -
  correct options at `c`, `a`, `b`, `d`, four distinct positions. Q3
  (`multi`) is outside the invariant test's scope by definition.

**Open note for a later pass (not resolved here):** the 3.12-vs-3.14
forward-tease call above rests on 1.1's own prior correction distinguishing
throughput (read replicas) from repeated-read latency (caches). If a future
chapter's own read-path example blends both pressures again, the same
distinction needs to be applied by eye each time - it is a recurring
judgment call, not a rule any test enforces.

---

## 1.10 Communicating & Defending a Design

- **Authored 2026-08-11 · not yet committed · branch
  `feature/content-1-10-communicating-and-defending-a-design`** (cut from
  `release/v5.0.0-content-platform` - the branch 1.7-1.9 were authored on,
  `feature/content-1-7-identifying-bottlenecks`, no longer exists locally or
  on `origin` in this session; 1.1-1.9's content is already present on the
  current release branch, so continuing the sequence needed no merge, just a
  fresh branch for this one chapter).
- Definition id `bb-1-10-communicating-and-defending-a-design` · manifest
  slug `1-10-communicating-and-defending-a-design` (`chapterDefinitionId`
  flipped from `null` to this id in the same pass)
- Type: Process (§16's no-component list, alongside 1.1-1.5, 1.7-1.9, 1.11 -
  no type-reversion call needed). Foundational · 20 minutes (Reader +
  knowledge check, no build) · prerequisite: 1.9.
- **Lesson length: 1,227 words** (by `wc -w`), written once against §20.6
  directly. Within range of 1.8's 1,234 and 1.9's 1,191, both the same
  20-minute estimate; flagged for a second reader rather than trusted, per
  every prior chapter's own precedent.
- Pipeline not run this pass (content-authoring only, per the chapter-author
  skill's standing scope - `src/content/chapters/index.test.ts`'s hardcoded
  chapter-id list was updated to include the new id, same registry-wiring
  touch every prior chapter needed, but `tsc`/`lint`/`vitest`/`build` were
  not run).

**No open-decision collision this chapter, same shape as 1.8/1.9.** §14's
1.10 row promises "staged - given follow-up questions, choose the strongest
response and read why the others are weaker" - a single/multi-choice quiz
shape with no simulator/stages-UI dependency, the same native fit 1.8's and
1.9's own exercises had. Realized directly as the whole quiz (all five
questions present a follow-up and ask for the strongest response), no
degradation, no new entry required in the "Open decisions" list below. See
spec §0.

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-1-10-communicating-and-defending-a-design.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-1-10-communicating-and-defending-a-design.mdx` |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None - no canvas exercise, nothing to validate; justified in spec §7 |
| 5 | Quiz | 5 questions, difficulty ramp 1/1/2/2/3; the full set directly realizes CURRICULUM §14's "staged - given follow-up questions, choose the strongest response and read why the others are weaker" exercise text |
| 6 | Playtest pass | Spec §11 |

**Judgment calls made:**

- **A real quiz position-clustering bug caught and fixed during drafting,
  not left for a second reader.** The first-drafted option order put both
  Q1's and Q2's correct answer at position `a` - exactly the class of bug
  0.1/0.2 shipped once and the standing per-chapter eyeball check exists to
  catch, even though a sample of two matching letters wouldn't fail the
  registry-wide invariant test by itself. Caught by checking the shipped
  `index.ts` array directly rather than trusting the draft, fixed by
  reordering Q2's four options (content unchanged, only array position) so
  its correct answer moved to `b`. Final positions across the four
  single-kind questions (Q1, Q2, Q4, Q5): `a`, `b`, `c`, `d` - four distinct
  letters, re-verified after the fix. Full note in spec §10.
- **A real Practical objective included**, per 1.1/1.2/1.4/1.5/1.8/1.9's
  actual precedent (Process chapters do not get the Concept-only Practical
  carve-out).
- **Primary diagram is a decision tree (Mermaid), not a topology diagram**,
  consistent with open decision #3 (1.6's Mermaid-as-topology exception is
  narrow) and with 1.1/1.8/1.9's own precedent of using this shape for a
  selection procedure.
- **Cold open is a direct continuation of 1.9's own "Next" section**, which
  named this exact moment in advance ("now the follow-ups start, and the
  same 'name it, commit, defend without defensiveness' habit gets tested
  live"). Not an invented connection - 1.9's own text predicted it, the same
  pattern every chapter in this run of the ledger has used for its cold
  open.
- **Failure modes and Scaling omitted, not merged** (same choice 1.7-1.9
  made). Optional for Process per §6; no system exists in this chapter to
  fail or scale - the chapter teaches a judgment/communication skill applied
  to systems whose actual failure/scaling behavior belongs to 1.6/1.7.
- **The write-survives-a-restart gap (quiz Q4, and the lesson's applied
  table) is deliberately left unsolved**, not glossed over or quietly
  patched with an untaught mechanism - durability machinery is 3.20/3.26's
  territory. `curriculumContext.notYetIntroducedConcepts` and
  `simplifications` both record it, per §20.2's honesty requirement and
  `pending-chapters.md`'s own open decision #10 (a simplification must be
  stated in the prose, not just recorded in the list - this chapter does
  both).
- **One further-out forward tease, to 2.3 (§19's "at most one").** Checked
  against every prior ledger entry: 3.4 (1.6), 2.2 (1.7), 3.22 (1.8), and
  3.12 (1.9) are already spent; 2.3 (Evolution of Modern Architectures) is
  unused. Chosen because 2.3's own purpose - the one-server-to-services
  scaling story - is the direct continuation of this chapter's "evolve only
  the piece that breaks" idea, applied repeatedly over time. Flagged in spec
  §12 for a second reader to confirm the target.
- **Dropbox (2016 move off Amazon S3) used as the production example** -
  chosen specifically for a publicly defended trade-off under outside
  skepticism, not for its storage architecture, which this curriculum never
  explains. First appearance of Dropbox in this curriculum. Flagged in spec
  §12 for a second reader to confirm this reads as the defense, not
  implementation tourism.
- **"Treating every follow-up as an accusation" stated on its own merit,
  unattributed** - grepped every shipped lesson for related phrasing
  ("adversary," "defensive," "caving," "self-correct") before finalizing and
  found none of it taught yet, the same false-attribution check 1.9's own
  entry performed for "deep-diving everything." See spec §9.
- **"Connections + Preview of next" placed last in the file, after "Your
  turn," not before "Recap."** Matches the standing convention every
  chapter since 0.2 has actually shipped under (the combined section
  carries both beat 14's connections and the separate mandatory "Preview of
  next chapter" row) rather than treated as a fresh per-chapter choice.
  Named explicitly in spec §4 so a second reader doesn't mistake it for a
  beat-order violation.
- **No density revision pass performed as a distinct drafting round** -
  written once against §20.6 directly at 1,227 words, proportionate to
  1.8's and 1.9's own figures for the same 20-minute estimate. Flagged in
  spec §12 rather than treated as settled, per every prior chapter's own
  precedent for a self-assessed density claim.

**Open note for a later pass (not resolved here):** the 2.3 forward-tease
call above is the first time this curriculum has teased a Part 2 chapter
from Part 1. Every prior further-out tease pointed into Part 3 (3.4, 3.12,
3.22) or stayed within-part (2.2 from 1.7). If a future chapter's own
forward tease also reaches across a Part boundary, this is worth confirming
as an established pattern rather than assumed fine by default.

---

## 1.11 Driving a System Design Interview

- **Authored 2026-08-11 · not yet committed · branch
  `feature/content-1-10-communicating-and-defending-a-design`**. This is the
  current branch, which already contains the immediate prerequisite 1.10.
- Definition id `bb-1-11-driving-a-system-design-interview` · manifest slug
  `1-11-driving-a-system-design-interview` (`chapterDefinitionId` changed from
  `null` in the same pass).
- Type: Process. Foundational · 30 minutes (Reader + knowledge check, no
  build) · prerequisite: 1.10. Optional by curriculum design and gates no
  later chapter.
- **Lesson length: 1,208 words** (by `wc -w`). A density pass removed a
  second restatement of the time budget and left the table as the single
  source of the minute-by-minute structure.
- `typecheck`, `lint`, the chapter-specific invariant/wiring suites (28 tests),
  and `build` pass. The repository-wide `npm test` was attempted twice but
  exceeded this environment's 60-second command cap while emitting existing
  React `act(...)` warnings; it was terminated by the runner before a final
  suite result. It needs a normal local/CI run for the ledger's full-pipeline
  standard.

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-1-11-driving-a-system-design-interview.spec.md` |
| 2 | Lesson MDX | `public/content/chapters/bb-1-11-driving-a-system-design-interview.mdx` |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None - no canvas exercise, justified in spec §5 |
| 5 | Quiz | Five sequenced questions, difficulty ramp 1/1/2/2/3 |
| 6 | Playtest pass | Spec §7 |

**Judgment calls made:**

- **The full staged walkthrough is quiz-realized, not silently omitted.** The
  stages UI required by Part 1 remains absent. `pending-content.md` explicitly
  allows this degradation: scenarios become quiz questions while the UI is
  missing. The lesson's "Your turn" says so, the spec records the limitation,
  and the quiz forms one miniature interview instead of five disconnected
  recall checks.
- **No component, canvas, validation rule, blueprint, or hint.** §16 places
  1.11 in the no-component list. `hasEditorExercise: false` prevents progress
  from requiring an unreachable Submit action, matching 1.1-1.5 and 1.7-1.10.
- **Time allocation is an adaptable budget, not a script.** The 45-minute
  table protects the order of evidence: scope, requirements, estimate,
  architecture, pressure, then follow-ups and close. The lesson states that a
  dangerous requirement can earn more deep-dive time.
- **The decision-tree Mermaid is an interviewer-intent diagram, not a
  topology.** It is within the ordinary process-flow diagram allowance and is
  captioned with what to notice.
- **Immediate-next preview is 2.1, verified against `manifest.ts`.** No
  further-out tease is spent: the optional chapter closes Part 1 cleanly and
  needs no additional forward promise.
- **Quiz positional checks completed.** The four single-choice correct
  positions are `b`, `a`, `d`, `c`; the ordering question is a full
  derangement from its `correctOrder`. Every option has its own explanation.

**Second-reader checks:** read the time budget as a flexible reasoning budget
rather than memorized interview choreography; confirm the scenarios work as a
single walkthrough; and re-check the 2.1 preview if manifest order changes.

---

## 3.4 Load Balancer

- **Authored 2026-08-11 · not yet committed · branch
  `feature/lesson-3-4-load-balancer`** (cut from
  `release/v5.0.0-content-platform`, not from Wave 2's Part 1 branch - this
  chapter is Release 5.0.0-alpha content-platform work, see
  `.claude/docs/pending.md`, which needed a real chapter to pilot the MDX
  migration and walkthrough diagram renderer against). Pulled forward per
  `pending-content.md`'s own Wave 2 definition, replacing the `bb-dummy-1`
  placeholder.
- Definition id `bb-3-4-load-balancer` · manifest slug `3-4-load-balancer`
  (`chapterDefinitionId` flipped from `bb-dummy-1` to this id in the same
  pass).
- Type: **Building Block**. Foundational · 35 minutes · prerequisite:
  **1.9 (declared exception, see below - curriculum-order prerequisite is
  3.3, not yet authored)**.
- **Lesson length: 1,242 words** for a 35-minute estimate (1.6 was 1,209 for
  30 minutes) - proportionate; this chapter covers two algorithms plus a
  failure-mode shift 1.6 didn't need to.
- Pipeline not run this pass (content-authoring only, per the skill's
  scope).

**Blocking decisions resolved before drafting (2026-08-11):**

1. **Pulled forward with no real prerequisite.** Group A (3.1-3.3) is
   entirely unauthored, and 3.3 - CURRICULUM §14's stated "Assumes" for
   3.4 - doesn't exist as content. Left as `manifest.ts` originally had it
   (`prerequisiteSlugs: ["3-3-reverse-proxy"]`), this chapter would be
   permanently unreachable in the app. **Resolved:** author the lesson
   assuming only what's actually shipped (Part 0, Part 1 through 1.9, and
   1.6's three components) - the motivation is built entirely from 1.6's
   own planted seed, never from reverse-proxy vocabulary. `manifest.ts`'s
   `prerequisiteSlugs` repointed to `1-9-deep-dive-methodology`, commented
   inline as a declared, temporary exception to revert once Group A lands
   in Wave 3. Full reasoning in spec §0.1.
2. **Topology diagram renderer, 3.4's own call (not an assumed extension of
   1.6's).** Open decision #3 below named this explicitly: 3.4's diagram
   (multiple instances, health-check `control` edges) is more complex than
   1.6's straight line. Resolved the same way, for the same reason -
   Mermaid, styled as the target topology, captioned narrowly for this
   diagram only. See spec §0.2.
3. **New finding, not anticipated by any prior doc: `control` edges aren't
   buildable yet.** CURRICULUM §16 assigns 3.4 as introducing edge kind
   `control`. Checked directly against the registry
   (`content/components/config/networking.ts` and `compute.ts`): neither
   `load-balancer.relations.outputs.allowedKinds` nor
   `app-server.relations.inputs.allowedKinds` includes `"control"` - both
   declare `["request-flow"]` only for this direction. A load-balancer
   health-check edge to a backend fails `component-relations` on both
   ends, today, for every chapter, not just this one. **Not hacked
   around** - per this skill's own instruction to flag rather than patch
   engine gaps during a content pass. `control` edges are taught and shown
   in the lesson diagram (Mermaid, not engine-validated) but are absent
   from the graded `starterGraph`/`blueprint`, which use `request-flow`
   only. Recorded honestly in `curriculumContext.simplifications`, not
   silently omitted. **Needs an engineering follow-up**, separate from this
   ledger: add `"control"` to `load-balancer.relations.outputs.allowedKinds`
   and to `app-server.relations.inputs.allowedKinds` (or a narrower,
   load-balancer-specific contract). See open decisions below.

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-3-4-load-balancer.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-3-4-load-balancer.md` |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None new - 6 existing rules curated (`single-instance-load-balancer` is the namesake); justified in spec §7 |
| 5 | Quiz | 5 questions, difficulty ramp 1/1/2/2/3; Q2 and Q4 modeled on QUIZ_FRAMEWORK §8's own published Q5 and Q7 for this exact chapter |
| 6 | Playtest pass | Spec §11 |

**Judgment calls made:**

- **Required blueprint includes `sql-database`, not just the LB layer.**
  `availableComponentIds` equals `requiredComponentIds` equals `client`,
  `load-balancer`, `app-server`, `sql-database` - the full realistic stack
  (two app-server instances sharing one database) rather than scoping the
  exercise to just client/LB/app-server. Reinforces 1.6's mediation lesson
  (the database is still only reachable through an app server) while
  teaching the new distribution layer on top, not padding.
- **Starter graph is under-provisioned, not mis-wired** - same "fix ships
  symptoms" precedent as 1.6/0.1, but the fault this time is pure capacity
  (`single-instance-load-balancer`), not an illegal edge. Everything in the
  starter graph is legally connected; the learner adds a second instance
  and wires it identically.
- **One forward tease, to 3.8** (Horizontal Scaling) - checked against this
  ledger; not already spent by an earlier chapter this wave besides 1.6's
  own tease to 3.4 itself.
- **Production example: Cloudflare**, chosen specifically to avoid the
  Instagram-overclaim class of bug 1.6's Opus pass caught - a
  decision-not-company claim ("load balancing is Cloudflare's literal core
  product, at global scale") that doesn't require asserting anything about
  a specific company's internal architecture.
- **Quiz Q2 and Q4 modeled on QUIZ_FRAMEWORK §8's own Q5 and Q7** - the
  bank's already-published examples for this exact chapter and rule -
  reworded with a fresh graph/workload pairing, not copied verbatim.
- **Quiz position-clustering checked by eye**: four single-kind questions
  (Q1/Q3/Q4/Q5), correct options at b/a/c/d - four distinct positions.
- **No density revision pass performed as a distinct drafting round** -
  written once against §20.6 directly, same as 1.6. Flagged for the next
  reviewer to check against padding, though the word-count comparison above
  is at least a rough sanity check.

**Opus proofread pass (2026-08-11) - run, six changes, uncommitted.**

Scope: content, content-structure, blueprints, component lists, submit
validations, diagrams. Quiz, hints and the `problemStatement` /
`learningObjectives` / `curriculumContext` fields were out of scope and are
untouched. No CI/typecheck/lint/test/build run (content-only pass). Full
detail in the chapter spec's new §13.

*Changed* (`lessonVersion` 1 -> 2, spec §13 lists all six):

1. **The `control`-edge gap was disclosed to the AI but not to the learner.**
   `curriculumContext.simplifications` is consumed only by `src/ai/prompt.ts`
   (the Deep Check prompt) - it is never rendered in the Reader. So the draft
   taught `control` edges, drew them dashed in the diagram, said "the load
   balancer pings each instance over a `control` edge", and gave the learner
   nothing about their being unbuildable. A learner who tried to draw one
   would have hit a `component-relations` error with no explanation. §20.2
   requires the honest statement in the prose *and* the `simplifications`
   entry, not either/or. Two sentences added under the diagram caption. This
   was the pass's strongest finding, and it generalises: **any future
   chapter recording a limitation only in `simplifications` has disclosed it
   to nobody who can read.**
2. Diagram caption taught the picture as the mechanism ("losing a `control`
   edge takes it out of rotation"). A failed health check does that; the edge
   does not vanish. Corrected.
3. Cloudflare example rewritten to §13's who / why / when / trade-off format.
   "Cloudflare's core product is this exact pattern" is an overclaim (its
   core is a global edge network; load balancing is a product it sells), and
   "route each request to a healthy *nearby* server" smuggled in geographic
   steering, which this chapter never teaches. **The ledger's own guard held
   only halfway:** picking Cloudflare did avoid an internal-architecture
   claim, but the sentence still overclaimed and skipped three quarters of
   §13's format. Replacement is a public-product decision claim, ties
   least-outstanding-requests back to least-connections, and names the
   trade-off (a third party in front of every request).
4. "Add a second app-server instance" was ambiguous against the product:
   `app-server` has a literal `instances` config field, and
   `single-instance-load-balancer` sums it - so bumping it to 2 clears the
   warning, yields a clean Validate, then fails Submit with "Missing:
   Application Server" while an Application Server is visibly on canvas.
   Hint 2 disambiguated, but hints are never auto-surfaced. Brief now says
   "a second box, not a higher Instances count".
5. Cold-open restatement cut (§20.6) - paragraph 1's "something still has to
   decide which instance gets each request" was restated whole by paragraph
   2. Kept the stronger one.
6. "the same cargo-cult shape the lesson just named" pointed at nothing -
   "cargo cult" is §14's phrase, not the lesson's. Repointed at the "Common
   mistakes" bullet that does name it.

*Verified against the two documented judgment calls:*

- **Vocabulary boundary (call 1) holds.** No reverse-proxy / DNS / firewall /
  API-gateway vocabulary anywhere, including in teases. "instance", "single
  point of failure" and "hop" all appear in 1.6's body first; "loop step 4
  (0.4)" matches both 1.6's identical attribution and §14's "steps 4, 6";
  `round-robin` / `least-connections` are the `load-balancer` config field's
  literal option strings. `manifest.ts` read but not edited.
- **`control` gap (call 2) is real and correctly diagnosed.** Re-checked the
  registry directly: `load-balancer.relations.outputs.allowedKinds` and
  `app-server.relations.inputs.allowedKinds` are both `["request-flow"]`.
  The diagram-only treatment is a legitimate disclosed limitation - it just
  was not actually disclosed anywhere the learner could see it, until now.

*Verified and left alone:* blueprint is a single honest `require` (one right
shape; a second would be invented variety), `commentary` is debrief-only, and
the starter graph provably cannot satisfy it - `pattern.ts` binds aliases
injectively, so one `app-server` node can never fill both `app1` and `app2`.
The ledger's "under-provisioned, not mis-wired" claim holds: every starter
edge passes `component-relations`. Component lists match §16. All six
`validationRuleIds` resolve in `src/validation-engine/rules/index.ts`.

*Three structural omissions were undeclared and are now declared in spec §4
(§6 requires written justification, and silence is the thing §6 forbids):*
the "Preview of next chapter" section previews 3.8 rather than the manifest's
actual next chapter 3.5 (justified - §0.1 forbids the vocabulary, §19 allows
one tease, §14's own 3.4 row names 3.8); §12's nugget devices are absent
again; and §14's 3.4 row promises "build + config + trace" against a
build/fix-only chapter.

*Spec fact corrected:* the word-count comparison was wrong in both places -
this ledger said 1.6 was 1,209 words and the spec said 950; `wc -w` gives
**1,279**. The draft was therefore never long relative to 1.6, it was
slightly thinner per minute. Post-pass body is 1,333 words for 35 minutes vs.
1.6's 1,279 for 30 - proportionate. **Do not carry the 950/1,209 figures
forward into another chapter's density comparison.**

**New open notes raised by this pass** (numbered items below where they need
a decision; recorded here where they are just observations):

- **`single-instance-load-balancer` is severity `warning`, and
  `runChapterValidation` derives `passed` from `errorCount` alone.** The
  starter graph passes Validate structurally while listing one issue. The
  exercise still works (`QuestionPane` counts every violation above `note`,
  so the learner reads "Last validated: 1 issue" and the header pane carries
  the full explanation, and Submit holds the line via the blueprint), but it
  works differently from 1.6, whose fault was error-severity and failed
  Validate outright. Not changed - severity is engine work with
  cross-chapter reach. Worth a deliberate call: should a chapter's *namesake
  fault* ever be warning-severity?
- **Blueprint-drift copy is confusing for a duplicate-node blueprint.**
  Failing Submit with one `app-server` present reports "Missing:
  Application Server" while an Application Server is on the canvas. Correct
  in engine terms (the second alias is unbound), misleading in learner
  terms. Engineering note, first surfaced by this chapter because it is the
  first blueprint requiring two nodes of one component.
- **Resolved 2026-08-11 (post-audit, user-directed):** `problemStatement`
  re-synced with the "Your turn" brief - now reads "Add a second App Server
  to the canvas - a second box, not a higher Instances count on the one
  already there," matching change 4 above instead of the stale "add a second
  app-server instance" wording.

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
   **Resolved 2026-08-09.** 1.6 authored the formal introduction (see its own
   ledger entry above): `availableComponentIds` equals `requiredComponentIds`
   equals all three, no exception needed there. 0.1's own scenery exception
   still stands as documented and doesn't need retroactive changes - it was
   always framed as narrow-and-temporary, and 1.6 existing is exactly what
   makes it fully justified now rather than a promise. §16 itself still has no
   explicit "scenery" carve-out written into CURRICULUM.md; that doc edit
   remains optional, cosmetic, not blocking anything.

3. **The Reader cannot render topology diagrams.** CURRICULUM §7.2 says any
   diagram expressible as an architecture graph is authored as ScaleCraft graph
   JSON so it renders in the product's own visual language. `MarkdownRenderer`
   supports Mermaid (`MermaidBlock`), GFM, callouts and code blocks - and no
   graph-JSON block. There is no way to put a ScaleCraft topology diagram in a
   lesson body today.
   **Blocks: 3.4** still, whose primary diagram is a topology. Part 0 is
   unaffected (process flows are Mermaid by spec anyway). **Partially resolved
   for 1.6 only, 2026-08-09 (user-directed):** 1.6's own ledger entry above
   records the decision - author 1.6's lesson-body diagram as Mermaid, styled
   as the target topology, as a narrow declared exception, justified because
   the real interactive topology already exists via the chapter's
   `starterGraph`/`blueprints[0]` and is what the learner actually builds; the
   lesson diagram is only the static preview. **This is a per-chapter
   precedent, not a resolution of §7.2 itself** - 3.4 needs its own explicit
   call when authored, not an assumed extension of 1.6's, since 3.4's diagram
   (multiple instances, health-check `control` edges) is more complex than
   1.6's straight-line shape. Still needs an eventual decision either way:
   build a markdown graph-JSON block, or amend §7.2 to sanction a Mermaid
   exception for topology in the Reader more generally.
   **Opus pass confirmed the narrow application held for 1.6 (2026-08-09):**
   exactly one diagram in the chapter, nothing in the lesson claiming a
   graph-JSON diagram exists, and the "static preview of something the learner
   actually builds" framing is real rather than a rationalization - the same
   topology is reachable as a genuine `ArchitectureGraph` in the Editor. One
   concrete lesson for 3.4's author: 1.6's caption originally over-generalized
   from the Mermaid picture ("`request-flow` only ever runs client to app
   server to database"), which 3.4's own topology would have contradicted. A
   Mermaid topology is easier to overstate than a graph-JSON one, because it
   isn't constrained by the registry - caption it for *this* diagram only.
   **3.4 authored 2026-08-11, same resolution, made explicitly rather than
   assumed:** Mermaid, styled as the topology (client -> LB -> two app-server
   instances -> database), captioned narrowly for this diagram only (see its
   own spec §0.2). Still not a resolution of §7.2 itself - now two chapters'
   worth of the same narrow exception, growing evidence this should become
   either a sanctioned Mermaid-topology carve-out or real engineering work for
   a graph-JSON markdown block.

4. **CURRICULUM contradicts itself on what the five forces are.** §14's 0.2 row
   and §5.2 say latency / **throughput** / availability / durability / cost.
   §10.1's Interview Loop step 2 says latency / availability / **consistency** /
   durability / cost - throughput dropped, consistency added. 0.2 follows its own
   §14 row (correctly), and QUIZ_FRAMEWORK §5's bank Q1 and Q2 agree with §14, so
   nothing shipped is wrong. But 1.2/1.3 are authored against §10.1's list and
   will teach a different five unless one side is amended.
   **Blocks:** nothing today. Fix before Wave 2 authors 1.3, in a doc-only commit.
   Raised by the Opus pass on 0.2.
   **Resolved 2026-08-09, doc-only.** §14's throughput list is canonical: 0.2's
   shipped lesson and quiz bank commit to it in prose, and 1.2 never re-lists the
   five, so no shipped content moves. §10.1 step 2 and §14's 1.3 row amended to
   match; consistency stays a deferred concept (3.22), not one of the five.

5. **§12's nugget devices are absent from both authored chapters, undeclared.**
   §12 specifies Interview nuggets (1-2/chapter, Acts 2-3), Production nuggets
   (1-2/chapter, Act 3) and an Engineering nugget (1/chapter minimum, applying a
   §9 lens), each with a fixed placement "so learners build rhythm". Neither 0.1
   nor 0.2 has any, and neither spec declares the omission. Both chapters carry
   the equivalent content inline instead, which is arguably better for §20.6
   density - boxed one-liners next to a 700-word chapter are mostly chrome. Not
   fixed unilaterally in the Opus pass, because changing 0.2 alone would make it
   diverge from the already-reviewed 0.1 for no reader benefit.
   **Blocks:** nothing. Needs a call before Part 3, where chapters are long
   enough that the nuggets would actually earn their placement: either author
   them from 3.4 on, or amend §12 to make them optional for short Part 0/1
   chapters. Raised by the Opus pass on 0.2.
   **The trigger fired, 2026-08-11.** 3.4 is the first Part 3 chapter
   authored and it has no nuggets either. The Opus pass declared the omission
   in 3.4's spec §4 rather than authoring three boxed one-liners into one
   chapter and leaving every neighbour without them - a device with a "fixed
   placement so learners build rhythm" cannot start mid-curriculum in a
   single chapter. Still needs the call this decision has always asked for,
   now overdue rather than upcoming.

6. **§4's chapter-types table lists 1.3 as a Concept-type example, contradicting
   §14's own Part 1 header ("Process type" for the whole part, 1.1-1.11, no
   per-chapter exception named).** Raised authoring 1.3 (2026-08-09). Resolved
   as Process for that chapter (see its ledger entry above and spec §0) by the
   same precedent decision 4 set - §14 wins when it conflicts with another
   section - and for consistency with 1.1/1.2, both already Process on this
   branch. **Blocks:** nothing today; the practical difference (Production
   examples mandatory-vs-optional, Practical objective carve-out) didn't change
   what 1.3 needed either way. Fix in a doc-only commit: drop "1.3" from §4's
   Concept examples list.

7. **§14's 1.6 row promises a simulator trace the chapter doesn't have.** The
   row reads "Exercise: build + fix + simulator trace"; 1.6 as authored ships
   build + fix only. Raised by the Opus pass on 1.6 (2026-08-09) and declared
   in that chapter's spec §4. The built behavior was kept - the Fix exercise
   already exercises every learning objective, and wiring a simulator step
   into the chapter flow is engineering work, not content authoring. Same
   class as decision #1 (§14's 0.1 row contradicting the shipped chapter).
   **Blocks:** nothing. Decide once, for both rows: either amend §14 to match
   what's shipped, or schedule the simulator-trace work. Note that §14's 1.7
   row ("predict-then-check ... then simulate") makes the same promise, so
   1.7's author hits this before the decision can keep being deferred.
   **Confirmed 2026-08-10.** 1.7 hit exactly this wall, as predicted. Applied
   `pending-content.md`'s own named degradation path (simulator-dependent
   beats become quiz questions) rather than treating it as a new problem -
   see 1.7's own ledger entry and spec §0. Still not resolved: this is now
   two chapters' worth of evidence for the same "decide once" call.
   **Third instance, 2026-08-11.** §14's 3.4 row promises "build + config +
   trace"; 3.4 ships build/fix only. The config beat degraded to lesson +
   quiz deliberately (both algorithms are defensible, so there is no correct
   config value to gate on - that one is a genuine content call, not a
   missing simulator); the trace beat hit the same wall as 1.6 and 1.7.
   Declared in 3.4's spec §4 by the Opus pass. Three chapters, one decision,
   still deferred.

8. **`control`-kind edges aren't buildable on canvas - a real engine gap,
   found authoring 3.4 (2026-08-11).** CURRICULUM §16 assigns 3.4 as
   introducing edge kind `control` (health checks). Checked directly against
   `content/components/config/networking.ts` and `compute.ts`: neither
   `load-balancer.relations.outputs.allowedKinds` nor
   `app-server.relations.inputs.allowedKinds` includes `"control"` - both
   declare `["request-flow"]` only for this direction, so a load-balancer
   health-check edge to a backend fails `component-relations` on both ends.
   This isn't specific to 3.4's content; no registry component today accepts
   an incoming `control` edge from a load balancer at all.
   **Not hacked around** - 3.4's spec (§0.3) keeps `control` edges
   illustrative only (Mermaid diagram, prose), absent from the graded
   `starterGraph`/`blueprint`, and records the gap honestly in
   `curriculumContext.simplifications` rather than silently omitting it.
   **Blocks:** nothing today (3.4 shipped around it), but any later chapter
   wanting a learner-buildable health-check/liveness edge (e.g. a future
   revisit of 3.4, or 3.9 Service Discovery) hits the same wall. Needs an
   engineering fix, not a content one: add `"control"` to
   `load-balancer.relations.outputs.allowedKinds` and to
   `app-server.relations.inputs.allowedKinds` (or a narrower,
   load-balancer-specific contract) in `src/content/components/config/`.

9. **3.4 Load Balancer authored standalone, ahead of its real prerequisite
   (2026-08-11).** CURRICULUM §14's 3.4 row reads "Assumes: 3.3", but Group A
   (3.1-3.3) is entirely unauthored (`chapterDefinitionId: null`), and 3.3's
   own prerequisite chain traces back through unauthored Part 2 as well. Left
   as `manifest.ts` originally had it, 3.4's `prerequisiteSlugs:
   ["3-3-reverse-proxy"]` would make the chapter permanently unreachable in
   the app (its prerequisite can never be "completed"). This is the same
   "pulled forward" situation `pending-content.md` already named for 3.4
   (Wave 2, ahead of Wave 3's Group A), just more literal than 1.6's version
   of the same pattern.
   **Resolved for 3.4:** authored assuming only Part 0, Part 1 (through 1.9),
   and 1.6's three components - no reverse-proxy/DNS/firewall vocabulary
   anywhere, motivation built entirely from 1.6's own planted seed instead.
   `manifest.ts`'s `prerequisiteSlugs` repointed to `1-9-deep-dive-methodology`,
   commented inline as a declared, temporary exception. Full reasoning in
   3.4's spec §0.1.
   **Blocks:** nothing today. **Needs a decision before Wave 3 authors
   3.1-3.3:** revert 3.4's `prerequisiteSlugs` back to `["3-3-reverse-proxy"]`
   once Group A is real, and confirm 3.4's lesson doesn't need a retroactive
   edit once the learner *can* arrive at 3.4 having actually taken 3.3 (it
   shouldn't - 3.4 never assumes 3.3's content, it just doesn't currently
   require it either - but worth a second look when Group A lands rather than
   assumed fine).

10. **`curriculumContext.simplifications` is not a disclosure surface -
    raised by the Opus pass on 3.4 (2026-08-11).** It is read by exactly one
    consumer, `src/ai/prompt.ts`, which folds it into the Deep Check prompt.
    Nothing renders it in the Reader. Every chapter authored so far has
    treated "recorded in `simplifications`" as discharging §20.2's honesty
    requirement; §20.2 actually asks for the simplification to be stated in
    the prose *and* recorded in the list. 3.4 was the first chapter where
    that mattered concretely (it taught an edge kind the canvas rejects), so
    it got a two-sentence in-lesson disclosure. **Blocks:** nothing, but
    every existing chapter's `simplifications` list is worth re-reading with
    "would a learner ever notice this, and if so, does the lesson say it?"
    in mind. Either that becomes an authoring-checklist line, or the Reader
    grows a real surface for it.

11. **Should a chapter's namesake fault ever be warning-severity? Raised by
    the Opus pass on 3.4 (2026-08-11).** `single-instance-load-balancer` is
    `severity: "warning"`, and `runChapterValidation` computes `passed` from
    `errorCount` alone - so 3.4's starter graph *passes* Validate while
    listing one issue, where 1.6's error-severity fault failed Validate
    outright. The chapter still works (the issue and its full explanation
    both render, and Submit gates on the blueprint), but two chapters now
    teach "run Validate, fix what it says" with structurally different
    feedback. **Blocks:** nothing. Needs a call before more Part 3 chapters
    build exercises on warning-severity rules: either accept the two shapes
    and word transition briefs accordingly, or let a chapter promote its own
    namesake rule's severity. Engine change, not content - deliberately not
    touched during a content pass.
    Related engine note from the same pass: blueprint drift reports "Missing:
    Application Server" when a blueprint needs two nodes of one component and
    the learner has one, which reads as false to the learner. First surfaced
    here because 3.4 is the first blueprint requiring a duplicate node.

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
