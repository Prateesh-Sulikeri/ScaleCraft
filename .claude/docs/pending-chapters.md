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
| 1.6 Drawing the First Architecture | Not started (Wave 2, see `pending-content.md`) | - | - |
| 3.4 Load Balancer | Placeholder (`bb-dummy-1`), moved to Wave 2 | - | - |
| RWE T1 Bitly | Placeholder (`rwe-dummy-1`), moved to Wave 2 | - | - |

Everything else in the 79 rows is unauthored (`chapterDefinitionId: null`).

**Wave 1 progress: 4 of 4 authored, all four through an Opus pass, merged into
`develop`/`main` (verified 2026-08-08 via PR #87/#88).** Wave 2 (Part 1)
started 2026-08-08 with 1.1; 1.2 followed the same day, both Sonnet drafts
with no Opus pass yet.

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

4. **CURRICULUM contradicts itself on what the five forces are.** §14's 0.2 row
   and §5.2 say latency / **throughput** / availability / durability / cost.
   §10.1's Interview Loop step 2 says latency / availability / **consistency** /
   durability / cost - throughput dropped, consistency added. 0.2 follows its own
   §14 row (correctly), and QUIZ_FRAMEWORK §5's bank Q1 and Q2 agree with §14, so
   nothing shipped is wrong. But 1.2/1.3 are authored against §10.1's list and
   will teach a different five unless one side is amended.
   **Blocks:** nothing today. Fix before Wave 2 authors 1.3, in a doc-only commit.
   Raised by the Opus pass on 0.2.

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
