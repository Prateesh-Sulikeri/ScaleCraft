# Chapter spec - 0.2 What is System Design?

Authored under CURRICULUM.md §5 (chapter blueprint), §6 (mandatory sections),
§20 (author instructions). Deliverable 1 of the 6 in pending-content.md's
"Per-chapter deliverables". Lives beside the lesson so a reviewer can check the
prose against the intent that produced it.

- Chapter definition: `src/content/chapters/index.ts` (`bb-0-2-what-is-system-design`)
- Lesson body: `public/content/chapters/bb-0-2-what-is-system-design.md`
- Manifest row: `src/curriculum/manifest.ts`, slug `0-2-what-is-system-design`

---

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Define system design as reasoning under five forces - latency, throughput, availability, durability, cost - and name them precisely. |
| Type | Concept |
| Difficulty | foundational |
| Estimated time | 15 minutes (Reader + knowledge check; no build - see §4). |
| Prerequisites | 0.1 Welcome to ScaleCraft. |
| Unlocks | 0.3, and by transitivity every later chapter (the forces recur throughout). |
| Building blocks introduced | None. §16 homes the first three components at 1.6. |
| Stages trained | Stage 1 (orientation). |
| Interview relevance | Medium - loop step 2 (Requirements) vocabulary. |
| Production relevance | Every architecture decision in the curriculum traces back to one of these forces being under pressure; the Stripe/Netflix contrast is the chapter's own production example. |

## 2. Learning objectives (§5.2)

Four objectives. Practical is deliberately not represented - §5.2 permits this
explicitly ("except Practical in pure Concept chapters"), and this chapter has
no construction-family exercise (§4 below). The trade-off-pick quiz question
carries the applied-judgment weight Practical would otherwise cover.

1. **Knowledge** - Name the five forces and state what each measures.
2. **Engineering** - Decide whether a proposed change is justified by
   identifying which force, if any, is actually under pressure.
3. **Interview** - Translate an interviewer's stated constraint ("assume heavy
   read traffic") into the force it is actually testing.
4. **Communication** - Explain a trade-off in both directions: what a decision
   buys and what it costs, naming both forces involved.

Each objective is exercised: 1 by the lesson's mental model + quiz Q1/Q2; 2 by
"Ways to misread this" + quiz Q4; 3 by the Interview lens section; 4 by "No
force moves alone" + quiz Q5.

## 3. Per-beat outline (§5.3, Concept type per §6)

| Beat | Section in the lesson | Notes |
|---|---|---|
| 1-2 Cold open / why this exists | Untitled opening, 2 sentences | Two engineers, two different fixes, same slow endpoint - the felt tension is "which fix is right?" with no vocabulary yet to answer it. |
| 3 Think first | "Think first" callout | Prediction prompt: what IS the discipline actually of, not a tool list. |
| 4 Mental model | "The five forces" | One anchor sentence naming all five. |
| 5 Visual explanation | Mermaid diagram, same section | Five forces radiating from "every design decision" - names only; the table immediately after does the defining (§8.1: diagram before the prose explaining it). Carries the §7.2-required one-line caption ("the fan-out is the point"), added in the Opus pass. |
| 6 Core mechanics | "The five forces" (continued) | A 5-row table (force / what it measures / what failing looks like) actually explains each force - the diagram alone named them but did not teach them, caught in review before the Opus pass. Closed with three short paragraphs: forces are behaviors not component names; the cold open's cache-vs-replica argument resolved as latency-vs-throughput (added in the Opus pass, beat 1 previously went unpaid); and an honesty note that five is the working set, not an exhaustive list. |
| 7 Internal mechanics / 8 Trade-offs (merged) | "No force moves alone" | Two concrete two-sided trades (cache latency/cost vs. freshness; cross-region replication durability vs. latency). Merged per §6's short-adjacent-section allowance - both beats are the same idea (forces trade in pairs) at two different grains. |
| 9 Failure modes | omitted | Optional for Concept (§6); no single system is under discussion to fail. |
| 10 Scaling | omitted | Optional for Concept (§6); not applicable without a system. |
| 11 Production examples | "Who picks which force" | Stripe (durability-first) vs. Netflix (latency/availability-first), §13 format, closed with the lens-9 "neither is universal" line. |
| 12 Common mistakes | "Ways to misread this" | Three: checklist thinking, unpressured machinery, availability/durability conflation. |
| 13 Interview lens | "Why this resembles an interview" | Short, matching the chapter's Medium relevance - no padding per §20.6. Ends with §10.3's mandatory "what a senior answer sounds like" line (added in the Opus pass; the draft had none). Uses only this chapter's vocabulary - the numbered Interview Loop (§10.1) is not taught until 0.4/Part 1 and cannot be referenced here. |
| 14 Connections | merged into "Next" | Backward: 0.1 (one reference - see §4). Forward: one marked tease to 1.3, kept short and explicitly "further out". |
| 15 Recap + knowledge check | "Recap" | Three retrieval anchors; QuizLauncher renders the knowledge check automatically. |
| 16 Transition brief | "Your turn" | States plainly there is no build, and reframes the knowledge check itself as the exercise - the chapter's actual deliverable, not a preamble to one. |
| Preview of next | folded into "Next" | Previews **0.3** (interview vs. production registers) with an unresolved pressure, per §6's pull requirement. The draft previewed 1.3 and skipped 0.3 entirely - corrected in the Opus pass; 1.3 stays as the separate beat-14 forward tease. |

## 4. Declared omissions and justifications (§6's written-justification rule)

- **No construction-family exercise (build/completion/fix).** §11.1: "every
  chapter has ≥1 construction-family exercise... except justified Concept
  chapters." 0.2 introduces no components (§16 homes the first three at 1.6),
  so there is nothing on the palette to build with that wouldn't be a forward
  dependency. The chapter's exercise type is "Trade-off scenario" per §11.1's
  taxonomy, realized as the quiz's matching question (Q3) rather than a
  Design-Editor construction task - CURRICULUM's own 0.2 brief describes the
  exercise as "trade-off pick (two described systems, which force dominates
  each)", which names a judgment task, not a build.
  `availableComponentIds`/`requiredComponentIds` are both `[]`, no
  `starterGraph`, `blueprints: []`.
- **Failure modes and scaling behavior - omitted**, which §6 permits outright
  for Concept chapters. Neither applies without a concrete system to fail or
  scale; the Stripe/Netflix contrast in Production examples is the closest
  analog and is not a substitute.
- **Backward connections (§19 wants ≥2) - only one possible.** 0.2 is chapter
  2 of 44; only 0.1 precedes it. Same category of exception 0.1's spec
  recorded (there, zero were possible); the one reference that exists (the
  Reader-to-Editor loop, in "Next") is present. Recorded rather than padded
  to look like two.

## 5. `hasEditorExercise: false` - the CTA/completion fix this chapter needed

First draft of this spec flagged rather than fixed a real gap: with an empty
palette and no blueprints, `DesignEditorCTA` still showed "Begin exercise"
into a canvas with nothing to place, and worse, `deriveStatus`
(`src/curriculum/progress.ts`) gated `COMPLETED` on a `chapterProgress` row
that only Submit writes - with no reachable Submit, the chapter could never
be marked complete on the Learning Path. That is a real regression, not
cosmetic, so it is fixed rather than deferred (2026-08-06, same session, user
caught it before the Opus pass):

- `ChapterDefinition.hasEditorExercise?: boolean` (default true, so every
  chapter authored before this field existed is unaffected).
- `ChapterReader.tsx` renders `DesignEditorCTA` only when
  `hasEditorExercise !== false`.
- `deriveStatus` treats `hasEditorExercise: false` as satisfying the
  editor-pass gate unconditionally, so completion for this chapter is the exam
  pass alone (`quiz` exists here, so `COMPLETED` requires `examPassed`). A
  chapter with neither an editor exercise nor a quiz would have no automatic
  completion signal - not this chapter's case, but handled rather than left to
  crash or silently auto-complete.

0.2 sets `hasEditorExercise: false`. Every future Part 0/1 Concept chapter
without a build (0.3, 0.4, 1.2, 1.3, 1.5 per §14) reuses the same field -
fixed once here rather than per-chapter.

## 6. Component budget (§16)

None introduced. `availableComponentIds: []`, matching §16's rule that no
component appears in a palette before its home chapter - 0.2 has no
exceptions to declare, unlike 0.1.

## 7. Validation rules (deliverable 4)

None authored, none needed. `validationRuleIds: []` - there is no graph to
validate.

## 8. Quiz (deliverable 5)

Five questions, ids permanent. Ramp 1/1/2/2/3 against §3's rough 30/45/25
target. Q1 models QUIZ_FRAMEWORK §5's Q1; Q2's pairs are that bank's Q2,
verbatim (the five forces' own canonical definitions, already exactly matched
to the lesson's diagram); Q3 is this chapter's own trade-off-pick exercise
(CURRICULUM §14), not modeled on any existing bank question; Q4 models the
bank's Q7; Q5 is original.

Scope check: every question draws only on 0.2's own material plus 0.1's
Validate/Submit distinction (not tested here) - no question requires anything
from Part 1, which has not been taught yet.

## 9. Playtest pass (deliverable 6, §18.2's binding question)

*"Which prior chapter taught each move this exercise requires?"*

The "exercise" is the knowledge check, so the moves are read-and-reason
moves, not canvas gestures:

| Move | Taught by |
|---|---|
| Read a Mermaid diagram in the lesson body | 0.1's "The loop" section already used one - not a new skill |
| Answer a matching-kind quiz question | New format this chapter (0.1 was all `single`) - the prompt itself states the mechanic ("match each... to..."), and QuizLauncher's UI (`Matching.tsx`) provides a labeled dropdown per row, self-explanatory without prior exposure |
| Apply "which force is under pressure" to a novel scenario (Q3, Q4) | Directly taught in "No force moves alone" and "Ways to misread this" - both a worked trade-off and the mistake pattern are shown in-lesson before being asked for |
| Distinguish availability from durability under a partition (Q5) | Directly taught: "Ways to misread this" states the distinction with a concrete example (disk failing mid-write vs. a cut network) that Q5 is a structural variant of |

No move is unsourced.

**Sequencing risk noted:** Q5 is the one question that asks the learner to
apply the availability/durability distinction to a scenario shaped
differently from the lesson's own example (a timeout during a partition,
rather than a disk failure or a cut network). This is intentional - QUIZ
FRAMEWORK §1 point 1 bans questions answerable by string-matching the lesson.
Checked that the underlying reasoning (which force governs "was the request
answered" vs. "did committed data survive") transfers without needing new
vocabulary.

## 10. Opus proofread pass (2026-08-06)

A second-opinion editorial pass over Sonnet's draft, run as the experiment
recorded in `pending-chapters.md`. Structure and voice were kept; six things
were changed, all defects against the framework rather than preference:

1. **"Next" previewed the wrong chapter.** §6 makes "Preview of next chapter"
   mandatory and requires it to create pull. The draft previewed 1.3 and never
   mentioned 0.3, the chapter that actually follows. Rewritten to preview 0.3
   (interview vs. production registers, framed as an unresolved tension), with
   1.3 kept as the separate, explicitly-further-out beat-14 tease.
2. **Undefined forward reference in the Interview lens.** The draft opened with
   "Loop step 2, Requirements" - the ScaleCraft Interview Loop (§10.1) is not
   introduced until 0.4 and not taught until 1.2-1.3, so this is a §18.2 rule-1
   dependency on untaught material. It also collides with 0.1, which used "the
   loop" for the Reader-to-Editor loop. Rewritten in the chapter's own
   vocabulary.
3. **§10.3's senior-answer example was missing.** "Every Interview lens section
   ends with one 'what a senior answer sounds like' example." Added one line,
   built only from vocabulary this chapter teaches (buying read latency with
   freshness), not from 3.22's consistency language.
4. **The primary diagram had no caption.** §7.2 and §20.3 both require a
   one-line "what to notice" caption on every diagram; 0.1 has one, the draft
   did not. Added, and written to carry the non-independence claim rather than
   restate the diagram.
5. **The cold open was never paid off, and two trade-off claims were loose.**
   Beat 1 posed cache-vs-replica and the lesson never returned to it - now
   resolved in the core-mechanics section as latency-vs-throughput, which is
   both the answer and a real distinction worth teaching. Separately: the cache
   example claimed a cache "cuts cost" while "Ways to misread this" said a cache
   *costs* - both true, contradictory as written, now stated precisely (cache
   capacity is cheaper than the database capacity avoided, and you run one more
   system). The synchronous-replication example named only the latency cost;
   unreachable-replica write stalls mean it also spends availability, which is
   the same distinction Q5 tests two sections later.
6. **"durability- and consistency-first"** (Stripe) used "consistency" as an
   undefined sixth force, and `notYetIntroducedConcepts` defers consistency
   models to 3.22. Reworded to durability-first with "safe to retry" in place of
   the unglossed "idempotent".

Also added: an in-lesson honesty note that five is the working set rather than
an exhaustive list, with the matching entry in `curriculumContext.simplifications`
(§20.2 requires stated simplifications to be recorded there for Deep Check).

**Quiz.** Q5's options were reordered so its correct answer sits at `d`. Q1's is
at `b` and Q4's at `c`; leaving Q5 at `b` gave 2 of this chapter's 3 single-kind
questions the same letter, which passes `quiz-invariants.test.ts` but reproduces
the exact habit that test was added to catch. Both matching questions were
re-verified by hand as full derangements (no pair's correct option sits at its
own index in the `options` array) - Q2 and Q3 both hold. Distractors, ramp
(1/1/2/2/3), and every `explanationMd` were read fresh and left alone; Q1's
weakest distractor ("It is mostly about databases") is carried verbatim from
QUIZ_FRAMEWORK §5's own bank Q1, so it stays.

**Checked and deliberately not changed:** the Stripe and Netflix examples are
defensible public decisions rather than implementation tourism (§13), and the
lens-9 "neither is universal" closer is present; the availability/durability
distinction is technically sound; `curriculumContext`'s mastered /
not-yet-introduced lists are accurate (1.3 NFRs, 1.6 components, 3.22
consistency all verified against §14); §4's declared omissions all still hold.

## 11. A note on §16 and CURRICULUM §14 comparison

Unlike 0.1, this chapter's built form does not diverge from §14's own row -
"Exercise: trade-off pick (two described systems, which force dominates
each)" is realized close to literally, just as a matching question with five
systems rather than two (QUIZ_FRAMEWORK §2 caps matching at 3-5 pairs; five
was used to cover all five forces cleanly rather than an arbitrary two). No
doc update needed here.
