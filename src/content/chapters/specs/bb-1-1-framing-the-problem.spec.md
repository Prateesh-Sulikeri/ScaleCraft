# Chapter spec - 1.1 Framing the Problem

Authored under CURRICULUM.md §5 (chapter blueprint), §6 (mandatory sections),
§20 (author instructions), as part of Phase 10's Part 1 condense
(`.claude/docs/pending-6.1.0-poa.md`, Phase 10). This chapter replaces old
1.1-1.5 (Understanding the Problem, Functional Requirements, Non-functional
Requirements, Estimating Scale, Numbers Every Engineer Should Know) with one
condensed chapter. Source material read in full before drafting: all five
old lessons, their specs, and their quizzes (see
`.claude/docs/pending-chapters.md`'s entries for each).

- Chapter definition: `src/content/chapters/index.ts`
  (`bb-1-1-framing-the-problem`)
- Lesson body: `public/content/chapters/bb-1-1-framing-the-problem.mdx`
- Manifest row: not yet wired - `src/curriculum/manifest.ts` still points at
  the old eleven chapters. Wiring happens in the Phase 10 engineering pass
  (POA §10.5), once new 1.1-1.4 are all authored.

---

## 0. Why one chapter instead of five

Phase 10's decision (POA §10.6, resolved 2026-08-16): condense Part 1 from
11 chapters to 4 (3 mandatory + 1 optional), grouped along the Interview
Loop's own steps. This chapter absorbs loop steps 1-3 (clarify,
requirements, estimate) - old 1.1 through 1.5. Read as source material, not
sections to staple: the five old lessons shared a running URL-shortener
example and, more importantly, shared *the same underlying test* under five
different names (1.1's clarifying-question test, 1.2's Must-have test, 1.3's
number-not-adjective distinction, 1.4's order-of-magnitude discipline). That
shared shape is this chapter's organizing idea and its main density win over
stapling the five together: "The test, applied three times" is new
synthesis the five separate chapters couldn't state, not restatement of any
one of them.

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Turn an ambiguous brief into a scoped, measured, order-of-magnitude-estimated problem statement, by teaching the one test (would a different answer change what you build) that governs clarifying, requirements, and estimation alike. |
| Type | Process |
| Difficulty | foundational |
| Estimated time | ~15 minutes (Reader + knowledge check; no build). |
| Prerequisites | 0.4 The System Design Lifecycle (same as old 1.1). |
| Unlocks | New 1.2 Designing the System directly; every later Part 1 chapter and every RWE project brief indirectly. |
| Building blocks introduced | None. §16 homes the three primitives at new 1.2 (old 1.6's introduction moves there). |
| Stages trained | Part 1's default (§2): stage 1 (naming what a clarifying question / requirement / estimate is for), stage 4 (choosing which are worth the interview's limited time), stage 5 (shaping scope and measurement from an ambiguous brief). |
| Interview relevance | High - loop steps 1-3 (§10.1), the first thing a candidate does in every design interview. |
| Production relevance | The same filter (would a different answer change the design) is what a real requirements-gathering conversation, an SLO negotiation, or a capacity-planning estimate is doing, just spoken or written instead of quizzed. |

## 2. Learning objectives (§5.2)

Five objectives, all five §5.2 categories represented (Process chapters
don't get the Concept-only Practical carve-out, same precedent old 1.1's
spec established):

1. **Knowledge** - State the shared test: would a different answer change
   what you build.
2. **Engineering** - Apply the test to sort a feature list into
   Must/Should/Could/Won't and to pick worthwhile clarifying questions.
3. **Interview** - Turn a vague requirement into a defensible number and an
   order-of-magnitude estimate inside the interview's small budget.
4. **Practical** - Given a brief and candidate questions/features, identify
   exactly the ones that pass the test - the quiz-realized version of
   CURRICULUM §14's three separate staged exercises for old 1.1/1.2/1.4 (§5
   below).
5. **Communication** - Name, out loud, which specific design decision an
   answer, a cut, or a chosen number would flip.

Each objective is exercised: 1 by "The test, applied three times" + quiz
Q1/Q11; 2 by Q1, Q3, Q10; 3 by Q5-Q9; 4 by the quiz as a whole (no build); 5
by "In an interview" + Q12.

## 3. Per-beat outline (§5.3, Process type per §6)

| Beat | Section in the lesson | Notes |
|---|---|---|
| 1-2 Cold open / why this exists | Untitled opening | One continuous URL-shortener scene threading clarify -> requirements -> estimate, replacing five separate cold opens with one that mirrors the loop's own progression. |
| 3 Think first | "Think first" callout | Names all three gaps (features, speed, traffic) and asks for the one test that answers them, unrevealed. |
| 4 Mental model | "The test, applied three times" | The unifying frame: a decision earns its time only if a different answer would change what's built. Replaces old 1.1/1.2/1.3/1.4's four separate single-purpose tests with one general one - this chapter's central density move. |
| 5 Visual explanation | Mermaid decision tree, same section | Generic branch (would a different answer change what you build?) captioned to apply across questions/features/numbers. Decision-tree family per §7.1, Mermaid per the standing per-chapter exception (old 1.1's spec, open decision 3). |
| 6 Core mechanics | "Step 1: Clarify" / "Step 2: Requirements" / "Step 3: Estimate" | Three subsections, each condensing one or two old chapters. Step 1 condenses old 1.1's four-category table and read:write example. Step 2 condenses old 1.2's MoSCoW table and old 1.3's five-forces-to-numbers table plus the nines-to-downtime table. Step 3 condenses old 1.4's estimation chain diagram and old 1.5's landmark ratio table (§10.3's must-survive requirement, kept as a reference table per the resolved decision, not a standing page). |
| 7 Internal mechanics | "What ties the three steps together" | New content, not present in any of the five old chapters individually: the loop's steps feed each other (the ratio becomes the real traffic split; expiry becomes the retention window). Exercised by quiz Q11. |
| 8 Trade-offs | "The cost of asking, building, and computing" | Merges old 1.1's/1.4's "too few/too many questions" and "wasted precision" trade-offs into one paragraph, plus the ~5-10 / ~5 minute interview budget from QUIZ_FRAMEWORK §6 Q12's own ordering. |
| 9 Failure modes | omitted | Optional for Process (§6), same as all five old chapters. No system exists yet to fail. |
| 10 Scaling | omitted | Optional for Process (§6). |
| 11 Production examples | "In production" | One example (Amazon S3's two numbers, reused from old 1.3) instead of old 1.2's Basecamp + old 1.3's S3 + old 1.4's WhatsApp. Kept the one that ties requirements' latency/availability/durability distinction together most directly; the other two are cut, not restated, per §20.6 - a condensed chapter doesn't owe three production examples for material it's covering in a third the space. |
| 12 Common mistakes | "Common mistakes" | Five, one drawn from each old chapter's own list, condensed to a single line each. |
| 13 Interview lens | "In an interview" | One flowing senior-answer example threading all three steps in sequence, replacing three separate senior lines with one that demonstrates the steps connecting (per beat 7). |
| 14 Connections | folded into "Next" | Backward: 0.2 (five forces, named twice - beat 6 and "Next") and 0.4 (the loop, named twice). Meets §19's >=2. |
| 15 Recap + knowledge check | "Recap" | Five retrieval anchors, one per major idea (shared test, MoSCoW, NFR numbers, estimation, landmark ladder). |
| 16 Transition brief | "Your turn" | States no canvas build (components arrive next chapter, not named as "1.6" since that numbering no longer exists post-condense), names the quiz as the exercise covering all three steps. |
| Preview of next | folded into "Next" | Previews new 1.2 "Designing the System" (first canvas build, first validation rule) - matches old 1.5's own tease target, just renumbered. |

## 4. Declared omissions and justifications (§6's written-justification rule)

- **Failure modes and scaling - omitted**, permitted for Process ("o").
  Same reasoning as all five source chapters: no system exists yet to fail
  or scale.
- **Two of three production examples cut, not carried forward.** Old
  1.2/1.3/1.4 each had one (Basecamp, Amazon S3, WhatsApp). Production
  examples are optional for Process chapters ("o"), and three examples for
  material now covered in ~15 minutes instead of ~60 would be
  disproportionate; kept Amazon S3's two-number example because it directly
  reinforces the latency/availability/durability distinction Step 2 teaches,
  which is the beat this chapter's Step 2 leans on hardest.
- **No everyday analogy in the mental-model beat** - same choice all five
  source chapters made: the test itself is already the clearest available
  frame.

## 5. The three staged exercises, degraded (unchanged from source chapters)

CURRICULUM §14's original rows for old 1.1 (staged pick-4-of-10), old 1.2
(staged checklist), and old 1.4 (staged estimation buckets) all specify a
`stages` mechanism that still does not exist as built UI
(`pending-content.md`'s documented degradation path for Part 1). Realized
here as ordinary quiz questions (Q1 for clarify, Q3/Q10 for functional
requirements, Q5/Q6 for estimation) - same skill, no custom UI needed. Old
1.3's matching exercise and old 1.5's ranking/estimation exercise were never
staged to begin with (their own specs note this); their material is folded
into Q2/Q4/Q7 (NFR) and Q8/Q9 (landmark ratios) without a degradation flag.

No `availableComponentIds`/`requiredComponentIds` beyond `[]`, no
`starterGraph`, `blueprints: []` - §16 homes the three primitives at the next
chapter.

## 6. `hasEditorExercise: false` - reused, not re-derived

Same mechanism all eleven old Part 1 chapters used (fixed at old 0.2).
Completion is the exam pass alone.

## 7. Component budget (§16)

None introduced. `availableComponentIds: []` - no exceptions to declare.

## 8. Validation rules

None authored, none needed. `validationRuleIds: []` - no graph to validate.

## 9. Quiz (Process-chapter exception, QUIZ_FRAMEWORK.md §2)

12 questions (within the new 10-15 range), ramp 4/6/2 across difficulty
1/2/3 (33/50/17 - close to the 30/45/25 target, and defensible given a
condensed chapter's wider topic spread makes an exact ramp less meaningful
than topic coverage). At least one question per absorbed topic:

| Topic (old chapter) | Questions |
|---|---|
| Clarify (old 1.1) | Q1 |
| Functional requirements / MoSCoW (old 1.2) | Q3, Q10 |
| Non-functional requirements (old 1.3) | Q2, Q4, Q7 |
| Estimation (old 1.4) | Q5, Q6 |
| Landmark numbers (old 1.5) | Q8, Q9 |
| Synthesis across steps (new to this chapter) | Q11, Q12 |

Q1 models QUIZ_FRAMEWORK.md §6's own Q1 (same URL-shortener multi-select
mechanic, expanded to 8 candidates since it also stands in for old 1.1's
staged exercise, same convention old 1.1's own Q1 used). Q2, Q5, Q6, Q8 model
§6's Q2/Q3/Q4/Q5 respectively. Q3, Q4, Q7, Q9, Q10, Q11, Q12 are original to
this chapter, the last two written specifically to exercise beat 7's
synthesis point (§3 above), which none of the five source chapters' quizzes
individually tested.

**Position-clustering check** (the bug 0.1/0.2 shipped once). 11
single/estimate-kind questions (Q2 through Q12); correct options assigned in
a c/a/d/b repeating rotation, landing at a×3, b×2, c×3, d×3 - checked by eye,
no letter clusters.

Scope check: every question draws on this chapter's own material plus 0.2
(five forces) and 0.4 (the loop). No question requires anything from new 1.2
onward.

## 10. Playtest pass (§18.2's binding question)

*"Which prior chapter taught each move this exercise requires?"*

| Move | Taught by |
|---|---|
| Read a Mermaid decision-tree diagram | New shape for this chapter, but the same self-explanatory two-branch structure old 1.1/1.2 already used - no prior exposure needed beyond general diagram literacy from 0.1-0.4. |
| Recognize the five forces and reason about latency/throughput/availability/durability/cost | Directly taught in 0.2, reused here by name. |
| Reason about a fixed, small time budget for one step of a larger process | Directly taught in 0.4's loop-timing framing. |
| Answer a `multi` "select all" and an `estimate` bucket-choice question | Both formats already exist in the registry (0.3 introduced `multi`; the `estimate` kind is `SingleChoice` under the hood per old 1.4's spec §5) - familiar mechanics, new content. |
| Apply "would a different answer change the design" across three different kinds of decision (question, feature, number) | Directly taught in this chapter's own "The test, applied three times" and exercised progressively through Q1 -> Q3/Q10 -> Q5-Q9 before the synthesis questions ask for it explicitly (Q11/Q12). |

No move is unsourced.

## 11. Comparison to CURRICULUM §14's own rows

§14 still describes old 1.1-1.5 as five separate rows. This chapter
condenses their combined purpose, assumes/prepares-for chain, and interview
relevance (all High, all loop steps 1-3) into one. CURRICULUM.md's own §5,
§10.1, §14, §11.1, §19, and §21 need updating to reflect the new
1.1-1.4 structure (POA §10.5) - not yet done, tracked as engineering-pass
work, not a content-authoring gap.

## 12. Items flagged for a second reader

- **Word count is proportionately higher than a typical 15-minute chapter**
  (old 1.1/1.3 ran ~1,050-1,150 words for 20-minute estimates), justified by
  a 5-chapters-into-1 compression ratio and two mandatory-content
  requirements (the landmark table must survive per POA §10.3, and the
  functional+non-functional requirements material genuinely needs two
  tables). Flagged for a second reader to confirm this reads as
  proportionate rather than padded, per every prior Part 1 chapter's own
  precedent of flagging a self-assessed density claim.
- **The single production example (S3 only) cutting Basecamp and WhatsApp.**
  Individually justified in §4, but worth a second look in case either cut
  example was doing load-bearing work this pass didn't notice.
- **Q11/Q12 (synthesis across steps) are new question types** with no direct
  precedent in any of the five source chapters' quizzes - flagged for a
  second reader to confirm they test real understanding rather than reading
  as trivia about this chapter's own narrative choices.
- **No Opus audit pass has run yet.** Per the `chapter-author` skill, quiz,
  hints, and definition metadata are Sonnet-only regardless; the lesson body,
  structure, blueprints (none here), and diagrams are in Opus's scope
  whenever that pass runs.
