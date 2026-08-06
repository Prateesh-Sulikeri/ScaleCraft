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
| 0.2 What is System Design? | **Authored (Opus proofread pass done, uncommitted)** | 2026-08-06 | `feature/content-0-1-welcome` |
| 1.6 Drawing the First Architecture | Not started (blocked, see below) | - | - |
| 3.4 Load Balancer | Placeholder (`bb-dummy-1`), blocked | - | - |
| RWE T1 Bitly | Placeholder (`rwe-dummy-1`) | - | - |

Everything else in the 79 rows is unauthored (`chapterDefinitionId: null`).

**Wave 1 progress: 2 of 5.** Wave definitions live in `pending-content.md`.

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
