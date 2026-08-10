# Chapter spec - 1.9 Deep Dive Methodology

Authored under CURRICULUM.md §5 (chapter blueprint), §6 (mandatory sections),
§20 (author instructions). Deliverable 1 of the 6 in pending-content.md's
"Per-chapter deliverables". Lives beside the lesson so a reviewer can check the
prose against the intent that produced it.

- Chapter definition: `src/content/chapters/index.ts`
  (`bb-1-9-deep-dive-methodology`)
- Lesson body: `public/content/chapters/bb-1-9-deep-dive-methodology.md`
- Manifest row: `src/curriculum/manifest.ts`, slug
  `1-9-deep-dive-methodology` (`chapterDefinitionId` flipped from `null` to
  the id above)

**Wave.** Continues Wave 2, Part 1, directly after 1.8. Same branch topology
as 1.7/1.8: authored on `feature/content-1-7-identifying-bottlenecks` (which
already carries 1.1-1.8 as real prerequisite content), not a fresh branch cut
from the bare release line.

**Type: Process**, same default as 1.1-1.5 and 1.7-1.8 (§14's Part 1 header
names the whole part Process; 1.6 was the lone Building Block exception).
§16's audit places 1.9 explicitly in the no-component list alongside
1.1-1.5, 1.7-1.8, 1.10-1.11 - no new type-reversion call needed.

## 0. No open-decision collision this chapter (same shape as 1.8, unlike 1.7)

CURRICULUM §14's 1.9 row promises "given a design + requirements, pick the
right deep-dive target from four; explanation per option." That is a
single-choice quiz question shape with no simulator or stages-UI dependency
- the same native fit 1.8's trade-off scenarios had. Realized directly as
quiz Q2 and Q4 (§10 below), each presenting one design + one stated
requirement and four candidate targets. No degradation, no new open-decision
entry needed in `pending-chapters.md`.

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Choose WHAT to deep-dive (the subsystem the requirements actually stress) and how to go one level down without losing the room. |
| Type | Process. |
| Difficulty | foundational |
| Estimated time | 20 minutes (Reader + knowledge check, no build), per CURRICULUM §14's own row and `manifest.ts`. |
| Prerequisites | 1.8 Engineering Trade-offs. |
| Unlocks | 1.10 Communicating & Defending a Design directly (the resurface habit this chapter teaches is what gets tested live when follow-ups start); every later Building Block/RWE chapter's own deep-dive sections, which assume this method rather than re-teaching it; the interview loop's step 5 (0.4). |
| Building blocks introduced | None. §16's audit places 1.9 in the no-component list (with 1.1-1.5, 1.7-1.8, 1.10-1.11) - the three primitives stay homed at 1.6. |
| Stages trained | Part 1's default (§2: stages 1, 4, 5) - no new stage claimed. |
| Interview relevance | High - loop step 5 (§10.1): the deep dive. |
| Production relevance | The habit of spending limited engineering-review time where the evidence says the pressure is, not where it's comfortable or impressive to talk. |

## 2. Learning objectives (§5.2)

Five objectives (§5.2's range is 3-7); all five categories represented,
including a real Practical objective - per 1.1/1.2/1.4/1.5/1.8's precedent
(Process chapters do not get the Concept-only Practical carve-out).

1. **Knowledge** - State the two-question method for picking a deep-dive
   target: which requirement is closest to its limit right now, and which
   component on the path (1.7's ceiling method) is where that pressure
   actually lands.
2. **Engineering** - Given a design and its requirements, name the correct
   deep-dive target and reject one chosen for familiarity, novelty, or
   "cover everything a little."
3. **Interview** - Narrate a deep dive that states the target and reason
   before diving, goes one level down, and explicitly resurfaces to the
   whole design, inside interview loop step 5 (0.4).
4. **Practical** - Given four candidate deep-dive targets for a shown design
   and its requirements, choose the one the evidence supports and reject
   options optimizing for familiarity, appearing impressive, or shallow
   coverage of everything - the chapter's quiz-realized version of
   CURRICULUM §14's own exercise text (see §0 above - no degradation
   needed).
5. **Communication** - When two requirements are both under real pressure,
   name both out loud and commit to which one gets the deep dive now,
   rather than splitting attention shallowly across both.

Each objective is exercised: 1 by "Where the requirements point" + "Matching
requirement to target" + quiz Q1; 2 by quiz Q2/Q4; 3 by "In an interview"; 4
by quiz Q2/Q4; 5 by "One dive or two" + quiz Q5.

## 3. Per-beat outline (§5.3, Process type per §6)

| Beat | Section in the lesson | Notes |
|---|---|---|
| 1-2 Cold open / why this exists | Untitled opening, 2 short paragraphs | Directly continues 1.8's own "Next" section, which named this exact question in advance ("once you know what broke and what fixing it costs, which piece of a ten-component design is worth looking at closely?"). A candidate deep-dives the component they know best instead of the one the requirements stress, and runs out of time before reaching it. |
| 3 Think first | "Think first" callout | Names which part of the cold-open design should have been picked, before the lesson reveals the method. Never graded. |
| 4-5 Mental model + visual explanation | "Where the requirements point" | One-sentence anchor ("the requirements already say where the pressure is") + primary diagram (Mermaid decision tree: which requirement is closest to breaking branches into three deep-dive targets). Diagram introduced here, unpacked into the two-question method immediately after. |
| 6 Core mechanics | "Matching requirement to target" | Three-row table (requirement under pressure / where it lands / deep-dive target) applying the method to throughput, durability, and cross-continent latency examples, all within the taught 1.6 palette. |
| 7 Internal mechanics | "One level down, without losing the room" | The second half of the chapter's purpose: state the plan before diving, then the internals at the depth 1.6-1.8 already established, then a deliberate resurface. Names "losing the room" as the specific failure this technique prevents. |
| 8 Trade-offs | "One dive or two" | Genuinely two-sided (§11.1): split time across two stressed requirements only when both are genuinely close to breaking; otherwise splitting costs believable depth on either. No default answer stated. |
| 9-10 Failure modes + Scaling | Omitted, justified below | No system exists in this chapter to fail or scale - the chapter teaches a judgment/communication skill applied to systems whose actual failure/scaling behavior belongs to 1.6/1.7. |
| 11 Production examples | "In production" | Amazon's published 100ms-latency-to-1%-sales figure - a data-driven, publicly documented case of "evidence names where engineering time goes," not implementation tourism. Fresh company this wave in this specific role (1.2 Basecamp, 1.3 Amazon S3, 1.5 Meta, 1.6 Instagram, 1.7 Twitter, 1.8 Uber - Amazon appears in 0.4 for an unrelated decision, the design-doc convention, so this is a different decision about a different company role, not a repeat). |
| 12 Common mistakes | "Common mistakes" | Four: deep-diving everything (§10.2's framework-level named mistake - not yet taught to the learner by any shipped chapter, so stated here without attribution rather than falsely cited); deep-diving the familiar one (the cold open's failure); never resurfacing; choosing the flashiest-sounding piece. |
| 13 Interview lens | "In an interview" | High relevance, loop step 5 (0.4). Mandatory §10.3 senior-answer line built from this chapter's and 1.8's own vocabulary (read:write ratio, durability), naming the deferred target explicitly rather than dropping it. |
| 14 Connections + Preview of next | "Next" | Backward (>=2, §19): 1.3 (requirements), 1.7 (ceiling method), 1.8 (trade-off reflex, reused for the one-dive-or-two decision) - three named. Forward: mandatory immediate-next preview to 1.10. One further-out tease to 3.12 (§19's "at most one") - the read path's actual relief (a second copy of the data), directly motivated by this chapter's own read-path example. |
| 15 Recap + knowledge check | "Recap" | Four retrieval anchors. QuizLauncher renders the knowledge check automatically. |
| 16 Transition brief | "Your turn" | No CTA into the Editor (`hasEditorExercise: false`) - states the palette is unchanged from 1.6 and names the quiz's deep-dive-target exercise, matching 1.1-1.8's precedent for how a no-build chapter's "Your turn" reads. |

## 4. Declared omissions and justifications (§6's written-justification rule)

- **No everyday analogy in the mental-model beat** - same choice
  0.3/0.4/1.1-1.8 made. The two-question method plus the decision-tree
  diagram are already concrete; a forced metaphor (a doctor triaging
  symptoms, a mechanic diagnosing a car) would add a translation step the
  diagram doesn't need.
- **Failure modes and Scaling omitted**, same reasoning 1.8 used for its own
  no-build chapter (optional for Process per §6): no system exists in this
  chapter to fail or scale. 1.9's subject is a judgment/communication skill
  applied to systems whose actual failure/scaling behavior already belongs
  to 1.6/1.7 - re-covering it here would restate, not add.
- **Decision tree diagram, not a topology diagram** - consistent with
  `pending-chapters.md`'s open decision #3 (1.6's Mermaid-as-topology
  exception is narrow, not a standing license) and with 1.1's and 1.8's own
  precedent of using a decision-tree Mermaid diagram for a non-topology
  concept. No new §7.2 exception needed; `Decision tree` is explicitly in
  §7.1's inventory for "Selection procedures."

## 5. Simplifications (transcribed to `curriculumContext.simplifications`)

- **"One level down" stays at the depth 1.6-1.8 already established.** The
  lesson's internal-mechanics beat and the senior-answer line describe what
  happens conceptually when a read or write is handled, without introducing
  real replication, durability, or storage mechanisms - all later material
  (3.12, 3.14, 3.20, 3.26). Recorded so Deep Check doesn't expect
  mechanism-level depth this chapter never claims.
- **The "two requirements under pressure at once" scenario (quiz Q5) is a
  designed teaching device**, not a claim that real designs typically
  present exactly two competing pressures at once. Flagged the same way 0.2
  flagged its own five-forces working set: honest about being illustrative,
  not exhaustive.

## 6. Component budget (§16)

No components introduced. `availableComponentIds`/`requiredComponentIds`:
both `[]`, matching 1.1-1.5/1.7-1.8's precedent exactly. `blueprints: []`, no
`starterGraph`, `hasEditorExercise: false` - the same no-build mechanism 0.2
built and 1.1-1.8 reused.

## 7. Validation rules (deliverable 4)

None - no canvas exercise, nothing to validate. `validationRuleIds: []`, same
justification 1.1-1.8 and 0.2-0.4 recorded.

## 8. Blueprint and starter graph (deliverable 3, part of it)

None. `blueprints: []`, no `starterGraph` - consistent with
`hasEditorExercise: false` above.

## 9. Hints (deliverable 3, part of it)

None authored. Every prior no-build chapter (0.2-0.4, 1.1-1.5, 1.7-1.8)
shipped without hints for the same reason: no picker gesture or Fix exercise
for a hint to orient toward, and the quiz's own per-option `explanationMd`
already carries the directional content a hint would otherwise duplicate.
`hints: []`.

## 10. Quiz (deliverable 5)

Five questions, ids permanent, ramp 1/1/2/2/3 (matching 0.2-1.8's
convention). Q2 and Q4 directly realize CURRICULUM §14's "given a design +
requirements, pick the right deep-dive target from four; explanation per
option" exercise text (§0 above: no degradation needed, `single` already
covers this shape natively - the same fit 1.8's trade-off scenarios had).
Q1 tests method-recognition; Q3 tests the "one level down without losing the
room" technique via `multi`; Q5 is the hardest, testing the one-dive-or-two
judgment call.

**Q1 · single · 1.** Which of four candidate descriptions is the correct
method for picking a deep-dive target. Correct: the requirement closest to
breaking, confirmed against the component where it lands via the ceiling
method. Distractors: pick the most-familiar component (the cold open's
failure); pick the most-interesting-sounding one; give every component
equal time (deep-diving everything).

**Q2 · single · 1.** Design-plus-requirement scenario 1 (1.6's shape, a
1,000:1 read:write ratio with a latency requirement on reads): pick the
strongest deep-dive target from four. Correct: the read path. Distractors:
the write path (nothing in the stated requirement touches writes); the
client's rendering code (outside the system's throughput/latency ceiling);
"a little of everything" (the deep-diving-everything mistake, reapplied to
this scenario).

**Q3 · multi · 2.** Select all statements that correctly describe going one
level down without losing the room. Correct: state the target and reason
before the detail; resurface with a one-sentence reconnection afterward.
Distractors: keep going until stopped (this is losing the room, not
avoiding it); skip mentioning the rest of the design again (assumes the
interviewer is still tracking it unaided).

**Q4 · single · 2.** Design-plus-requirement scenario 2 (same shape, a
durability requirement on writes surviving a crash): pick the strongest
deep-dive target from four. Correct: the write path, specifically how a
write is confirmed. Distractors: the read path (wrong dimension); "add a
cache" (wrong dimension - cache addresses latency/reads, not durability, and
isn't on the taught palette); the client (not under any stated pressure).

**Q5 · single · 3.** Hardest: two requirements under real pressure at once
(a coming 10x read spike and a no-lost-writes promise), time for one real
dive today. Correct: name both out loud, pick the one closer to breaking for
the real dive, state the other is next if time allows. Distractors: split
evenly and go shallow on both; pick whichever is more impressive to discuss;
refuse to choose and mention both without depth on either (0.3's own "it
depends" non-answer, reapplied).

**Position-clustering check** (the bug 0.1/0.2 shipped once, standing
instruction). Four single-kind questions (Q1, Q2, Q4, Q5); correct options
sit at `c`, `a`, `b`, `d` - four distinct positions. Q3 (`multi`) is outside
the single-choice invariant test's scope by definition.

Scope check: every question draws on this chapter's own material plus 1.3
(requirements), 1.6 (the three-component shape), 1.7 (the ceiling method),
and 0.3 (the "it depends, name the variable, commit" pattern reused in Q5).
No question requires anything from 1.10 onward or from 3.x.

## 11. Playtest pass (deliverable 6, §18.2's binding question)

*"Which prior chapter taught each move this exercise requires?"*

| Move | Taught by |
|---|---|
| Read a stated non-functional requirement and identify what it stresses | 1.3, directly |
| Confirm which component on a path is where pressure lands | 1.7's ceiling method, reused unchanged |
| Recognize the client/app-server/database shape | 1.6 |
| State a trade-off with both sides named and commit to one | 1.8's own reflex, plus 0.3's "it depends, name the variable, commit" precedent |
| Read a decision-tree diagram | 1.1 and 1.8, both prior uses of this Mermaid shape |
| Distinguish a stated requirement from an unstated preference | 1.2/1.3's requirements-gathering material |

No move is unsourced.

## 12. Items flagged for a second pass

- **Word count (1,196 by `wc -w`).** Written once against §20.6 directly, no
  distinct trim pass required - within range of 1.1's 1,153 (post-Opus-pass)
  and 1.8's 1,234, both the same 20-minute estimate. Flagged for a second
  reader per every prior chapter's own precedent of flagging a self-assessed
  density claim rather than trusting it.
- **Amazon production example (§3, beat 11).** Deliberately about a
  measurement-driven prioritization decision (where engineering time goes),
  not an architecture or implementation detail - checked against §13's
  decision-not-company rule. A second reader should confirm this doesn't
  read as tourism given Amazon already appears in 0.4 for an unrelated
  decision (the 6-pager convention).
- **3.12 forward tease (§3, beat 14).** Checked against every ledger entry
  through 1.8: 3.4 (teased by 1.6), 2.2 (teased by 1.7), and 3.22 (teased by
  1.8) are all already spent; 3.12 has not been used as a further-out tease
  by any prior chapter. A second reader should confirm 3.12 (read replica)
  is the correct target rather than 3.14 (cache) - the read-path example in
  this chapter is framed as a throughput problem (a coming volume spike),
  which is 3.12's territory per 1.1's own opus-pass correction distinguishing
  read replicas (throughput) from caches (repeated-read latency).
- **"Deep-diving everything" caught and fixed during drafting, not left for
  audit.** An early draft of "Common mistakes" cited this as "(0.4's own
  named candidate mistake)." Grepped every shipped lesson
  (`public/content/chapters/*.md`) for the phrase and found no chapter has
  actually taught it yet - §10.2 is framework text describing the recurring
  candidate-mistakes callout box in the abstract, not a claim that 0.4's own
  lesson uses this exact language. The false attribution was removed before
  this draft was presented; the mistake itself is stated on its own merit,
  unattributed, same as this chapter's other three mistakes.
