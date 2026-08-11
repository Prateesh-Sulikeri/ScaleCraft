# Chapter spec - 1.10 Communicating & Defending a Design

Authored under CURRICULUM.md §5 (chapter blueprint), §6 (mandatory sections),
§20 (author instructions). Deliverable 1 of the 6 in pending-content.md's
"Per-chapter deliverables". Lives beside the lesson so a reviewer can check
the prose against the intent that produced it.

- Chapter definition: `src/content/chapters/index.ts`
  (`bb-1-10-communicating-and-defending-a-design`)
- Lesson body: `public/content/chapters/bb-1-10-communicating-and-defending-a-design.mdx`
- Manifest row: `src/curriculum/manifest.ts`, slug
  `1-10-communicating-and-defending-a-design` (`chapterDefinitionId` flipped
  from `null` to the id above)

**Wave.** Continues Wave 2, Part 1, directly after 1.9. Authored on its own
branch, `feature/content-1-10-communicating-and-defending-a-design`, cut
from `release/v5.0.0-content-platform` - the branch 1.7-1.9 were authored on
(`feature/content-1-7-identifying-bottlenecks`) no longer exists locally or
on `origin` by this session, and 1.1-1.9's content is already present on the
current release branch, so no separate merge was needed to continue the
sequence.

**Type: Process**, same default as 1.1-1.5 and 1.7-1.9 (§14's Part 1 header
names the whole part Process; 1.6 was the lone Building Block exception).
§16's audit places 1.10 explicitly in the no-component list alongside
1.1-1.5, 1.7-1.9, 1.11 - no new type-reversion call needed.

## 0. No open-decision collision this chapter (same shape as 1.8/1.9)

CURRICULUM §14's 1.10 row promises "staged - given follow-up questions,
choose the strongest response and read why the others are weaker." That is
a single/multi-choice quiz question shape with no simulator or stages-UI
dependency - the same native fit 1.8's trade-off scenarios and 1.9's
deep-dive-target questions had. Realized directly as the whole quiz (all
five questions present a follow-up and ask for the strongest response). No
degradation, no new open-decision entry needed in `pending-chapters.md`.

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Narrate a design top-down, handle follow-ups as invitations rather than accusations, and defend a decision without becoming defensive about it. |
| Type | Process. |
| Difficulty | foundational |
| Estimated time | 20 minutes (Reader + knowledge check, no build), per CURRICULUM §14's own row and `manifest.ts`. |
| Prerequisites | 1.9 Deep Dive Methodology. |
| Unlocks | 1.11 Driving a System Design Interview directly (the optional chapter that runs this and every prior Part 1 step together under a clock); the interview loop's step 8 (0.4), closing Part 1's loop end to end; every later Building Block/RWE chapter's own Interview lens follow-up material, which assumes this two-question test rather than re-teaching it. |
| Building blocks introduced | None. §16's audit places 1.10 in the no-component list (with 1.1-1.5, 1.7-1.9, 1.11) - the three primitives stay homed at 1.6. |
| Stages trained | Part 1's default (§2: stages 1, 4, 5) - no new stage claimed. |
| Interview relevance | High - loop step 8 (§10.1): evolve and defend, the last step. |
| Production relevance | The habit of treating a challenge to a shipped decision as a question to answer with evidence, not a threat to be deflected or a cue to abandon the decision. |

## 2. Learning objectives (§5.2)

Five objectives (§5.2's range is 3-7); all five categories represented,
including a real Practical objective - per 1.1/1.2/1.4/1.5/1.8/1.9's
precedent (Process chapters do not get the Concept-only Practical
carve-out).

1. **Knowledge** - State the two-question test for a follow-up: does it name
   new evidence or only pressure, and if it's evidence, does the current
   design already survive it.
2. **Engineering** - Given a follow-up and an existing design, decide
   whether the design already survives it, needs a narrow evolution of one
   piece, or exposes a real gap nothing taught so far addresses.
3. **Interview** - Narrate a completed design top-down before any follow-up
   lands, then respond to follow-ups live by applying the two-question test,
   defending decisions that still hold and revising the ones that don't,
   inside interview loop step 8 (0.4).
4. **Practical** - Given four candidate responses to a follow-up, choose the
   one that correctly applies the test and reject caving, stonewalling, and
   a full redesign of a design that mostly still holds - the chapter's
   quiz-realized version of CURRICULUM §14's own exercise text (see §0
   above - no degradation needed).
5. **Communication** - When a follow-up reveals a genuine gap the taught
   palette can't yet fix, name the gap honestly instead of inventing an
   untaught mechanism or denying it exists.

Each objective is exercised: 1 by "Reading a follow-up" + quiz Q1; 2 by quiz
Q2/Q4/Q5; 3 by "Narrate first, defend second" + "Defending without being
defensive"; 4 by the whole quiz; 5 by quiz Q4.

## 3. Per-beat outline (§5.3, Process type per §6)

| Beat | Section in the lesson | Notes |
|---|---|---|
| 1-2 Cold open / why this exists | Untitled opening, 2 short paragraphs | Directly continues 1.9's own "Next" section, which named this exact question in advance ("now the follow-ups start, and the same 'name it, commit, defend without defensiveness' habit gets tested live"). A candidate reacts to a follow-up as a verdict, erases a mostly-correct design, and loses the interviewer's trust rebuilding from scratch. |
| 3 Think first | "Think first" callout | Names what to check first when writes grow 10x, before the lesson reveals the two-question test. Never graded. |
| 4-5 Mental model + visual explanation | "Reading a follow-up" | One-sentence anchor (a follow-up gets a test, not a reaction) + primary diagram (Mermaid decision tree: new evidence vs. only pressure, then does the design already survive it). Diagram introduced here, captioned immediately after, unpacked into the applied table right after that. |
| 6 Core mechanics | "Narrate first, defend second" | Two parts: narrating the whole design top-down once before follow-ups start (reusing 1.6's build order and 1.7-1.9's reasoning), then a three-row table applying the two-question test to three follow-up shapes (scale change, direct challenge, a real unaddressed gap). |
| 7 Internal mechanics | "Defending without being defensive" | The second half of the chapter's purpose: 1.8's trade-off reflex extended one clause ("...and Z hasn't changed, so X still holds"), with the honest opposite move (revise, name what changed) stated explicitly. |
| 8 Trade-offs | "Redesign live, or name it and move on?" | Genuinely two-sided (§11.1): redesigning live proves the fix in detail but spends scarce time; naming it conceptually proves the same judgment faster at the cost of the detail. No default answer stated - depends on time remaining and how central the gap is. |
| 9-10 Failure modes + Scaling | Omitted, justified below | No system exists in this chapter to fail or scale - same reasoning 1.7-1.9 used for their own no-build chapters. |
| 11 Production examples | "In production" | Dropbox's 2016 public defense of moving off Amazon S3 - a documented case of running the same test (real evidence vs. pressure) and defending the resulting trade-off with numbers rather than caving or refusing to explain. |
| 12 Common mistakes | "Common mistakes" | Four: treating every follow-up as an accusation (§10.2's framework-level named mistake, first time actually taught to the learner - see the false-attribution check in §9 below); caving immediately; refusing to budge (the opposite failure); redesigning everything (the cold open's failure, restated). |
| 13 Interview lens | "In an interview" | High relevance, loop step 8 (0.4), the last step. Mandatory §10.3 senior-answer line built from this chapter's own vocabulary (check the write path against a follow-up, name what closes the gap, or say headroom already exists). |
| 14 Connections + Preview of next | "Next" | Backward (>=2, §19): 1.7 (ceiling method), 1.8 (trade-off reflex, extended), 1.9 (state-the-plan/resurface discipline, directly continued) - three named, placed last in the file per every prior chapter's own convention (0.2-1.9 all place this section after "Your turn," not before "Recap"). Forward: mandatory immediate-next preview to 1.11 (Part 1's loop now complete). One further-out tease to 2.3 (§19's "at most one") - the write-path gap and scale-driven evolution named here get their full story there. |
| 15 Recap + knowledge check | "Recap" | Four retrieval anchors. QuizLauncher renders the knowledge check automatically. |
| 16 Transition brief | "Your turn" | No CTA into the Editor (`hasEditorExercise: false`) - states the palette is unchanged from 1.6 and names the quiz's follow-up-response exercise, matching 1.1-1.9's precedent for how a no-build chapter's "Your turn" reads. |

## 4. Declared omissions and justifications (§6's written-justification rule)

- **No everyday analogy in the mental-model beat** - same choice
  0.3/0.4/1.1-1.9 made. The two-question test plus the decision-tree diagram
  are already concrete; a forced metaphor (a lawyer defending a client, a
  doctor re-checking a diagnosis) would add a translation step the diagram
  doesn't need.
- **Failure modes and Scaling omitted**, same reasoning 1.7-1.9 used for
  their own no-build chapters (optional for Process per §6): no system
  exists in this chapter to fail or scale. 1.10's subject is a
  judgment/communication skill applied to systems whose actual
  failure/scaling behavior already belongs to 1.6/1.7.
- **Decision tree diagram, not a topology diagram** - consistent with
  `pending-chapters.md`'s open decision #3 (1.6's Mermaid-as-topology
  exception is narrow, not a standing license) and with 1.1/1.8/1.9's own
  precedent of using a decision-tree Mermaid diagram for a non-topology
  concept. No new §7.2 exception needed; `Decision tree` is explicitly in
  §7.1's inventory for "Selection procedures."
- **"Connections + Preview of next" placed at the end of the file, after
  "Your turn," not before "Recap."** This looks like it reorders §5.3's beat
  14 ahead of beats 15-16, but it is the standing convention every prior
  chapter (0.2 onward) has actually shipped under: the "Next" section
  carries both beat 14's backward/forward connections and the
  §6-mandatory-but-separate "Preview of next chapter" row, and every shipped
  chapter places that combined section last, functioning as the hand-off
  after the transition brief rather than before the recap. Followed here for
  consistency rather than treated as a fresh choice.

## 5. Simplifications (transcribed to `curriculumContext.simplifications`)

- **The write-survives-a-restart gap** (used in the lesson's "Reading a
  follow-up" table and quiz Q4) is a real, deliberately unsolved limitation
  at this stage - durability machinery is 3.20/3.26's territory. Naming it
  honestly is the chapter's point, not a placeholder implying an unstated
  fix exists.
- **The "one real gap, limited time" scenario** (quiz Q5) is a designed
  teaching device for the redesign-live-or-name-it judgment call, not a
  claim that real interviews always present exactly one narrow gap with a
  clean time boundary - same status as 1.9's own "two requirements under
  pressure at once" device.

## 6. Component budget (§16)

No components introduced. `availableComponentIds`/`requiredComponentIds`:
both `[]`, matching 1.1-1.5/1.7-1.9's precedent exactly. `blueprints: []`, no
`starterGraph`, `hasEditorExercise: false` - the same no-build mechanism 0.2
built and 1.1-1.9 reused.

## 7. Validation rules (deliverable 4)

None - no canvas exercise, nothing to validate. `validationRuleIds: []`, same
justification 1.1-1.9 and 0.2-0.4 recorded.

## 8. Blueprint and starter graph (deliverable 3, part of it)

None. `blueprints: []`, no `starterGraph` - consistent with
`hasEditorExercise: false` above.

## 9. Hints (deliverable 3, part of it)

None authored. Every prior no-build chapter (0.2-0.4, 1.1-1.9) shipped
without hints for the same reason: no picker gesture or Fix exercise for a
hint to orient toward, and the quiz's own per-option `explanationMd` already
carries the directional content a hint would otherwise duplicate. `hints:
[]`.

**False-attribution check, done during drafting (same discipline 1.9's own
spec flagged).** "Treating every follow-up as an accusation" in Common
mistakes is stated on its own merit, unattributed - grepped every shipped
lesson for related phrasing ("adversary," "defensive," "caving," "self-
correct") before finalizing and found none of it taught yet. §10.2 is
framework text describing the recurring candidate-mistakes callout box in
the abstract; this chapter is the first to actually teach this specific
mistake to the learner.

## 10. Quiz (deliverable 5)

Five questions, ids permanent, ramp 1/1/2/2/3 (matching 0.2-1.9's
convention). The whole quiz directly realizes CURRICULUM §14's "staged -
given follow-up questions, choose the strongest response and read why the
others are weaker" exercise text (§0 above: no degradation needed, `single`/
`multi` already cover this shape natively, the same fit 1.8's and 1.9's own
exercises had). Modeled on QUIZ_FRAMEWORK.md §6's own Q10/Q11 (follow-ups as
invitations; self-correction as senior signal) for register, not copied -
all five prompts, scenarios, and options are original to this chapter.

**Q1 · single · 1.** Which reading of "what if writes grow 10x?" is
correct. Correct: run it through the test (new evidence vs. pressure; does
the design already survive it). Distractors: a verdict the design is wrong
(the cold open's failure); a trick to deflect (treating the interviewer as
an adversary); a cue to start over (redesigning everything).

**Q2 · single · 1.** Numeric scenario (1.7's ceiling shape): app-server
ceiling 5,000 QPS, current traffic 1,000 QPS, follow-up asks about a
doubling. Correct: say so and show the math - 2,000 is still under 5,000, no
redesign needed. Distractors: add instances preemptively (unmotivated fix);
add a cache (wrong dimension, unmotivated); demand an exact multiplier
(1.4's precision-theater trap).

**Q3 · multi · 2.** Select all statements that correctly describe defending
without being defensive. Correct: restate the trade-off and confirm the
reason still holds; if the follow-up reveals something missed, say what
changed and why. Distractors: repeat the same answer louder (defensiveness,
not defense); change the decision immediately just to seem agreeable
(caving).

**Q4 · single · 2.** Follow-up names a real gap (write survival on
mid-restart) nothing in the design handles. Correct: name the gap honestly
and say what class of change would close it. Distractors: claim the design
already handles it (false); redesign everything live (over-reaction);
invent an untaught mechanism (a bluff that can't survive a follow-up).

**Q5 · single · 3.** Hardest: a real, narrow write-path gap surfaces with
very little interview time left. Correct: name the fix conceptually - what
changes, roughly what it costs - and move on, the faster proof of the same
judgment. Distractors: redesign live in full detail (spends time the rest of
the loop needs); skip the question (evasive); dismiss it as not mattering
without checking (an unchecked guess, same failure as denying a real gap).

**Position-clustering check** (the bug 0.1/0.2 shipped once, standing
instruction). Four single-kind questions (Q1, Q2, Q4, Q5). The first-drafted
order put both Q1 and Q2's correct answer at `a` - caught during this same
authoring pass, before the draft was presented, by checking letters directly
against the shipped `index.ts` array rather than trusting the draft's own
account. Fixed by reordering Q2's four options (content unchanged, only
array position) so its correct answer moved to `b`. Final positions: `a`
(Q1), `b` (Q2), `c` (Q4), `d` (Q5) - four distinct letters, re-verified
against `index.ts` after the fix.

**Scope check.** Every question draws on this chapter's own material plus
1.3 (requirements), 1.4 (precision-theater trap), 1.6 (the three-component
shape), 1.7 (the ceiling method), and 1.8 (the trade-off reflex). No question
requires anything from 1.11 onward or from 3.x.

## 11. Playtest pass (deliverable 6, §18.2's binding question)

*"Which prior chapter taught each move this exercise requires?"*

| Move | Taught by |
|---|---|
| Read a stated non-functional requirement as a follow-up's evidence | 1.3, directly |
| Confirm whether a component's ceiling already has headroom | 1.7's ceiling method, reused unchanged |
| Recognize the client/app-server/database shape | 1.6 |
| State a trade-off with both sides named ("we chose X, accepting Y, because Z") | 1.8's own reflex |
| State the plan before diving and resurface after | 1.9's own technique, extended to narrating the whole design before follow-ups start |
| Distinguish a real requirement from an unmotivated guess | 1.1/1.2/1.3's requirements-gathering material |
| Reject precision theater | 1.4 |

No move is unsourced.

## 12. Items flagged for a second pass

- **Word count (1,227 by `wc -w`).** Written once against §20.6 directly, no
  distinct trim pass required - within range of 1.8's 1,234 and 1.9's 1,191,
  both the same 20-minute estimate. Flagged for a second reader per every
  prior chapter's own precedent of flagging a self-assessed density claim
  rather than trusting it.
- **Dropbox production example (§3, beat 11).** Deliberately about a
  publicly defended trade-off decision (cost/control vs. more infrastructure
  to run), checked against §13's decision-not-company rule. A second reader
  should confirm this doesn't read as implementation tourism - the point is
  the public defense under skepticism, not Dropbox's storage architecture
  itself, which this curriculum never explains.
- **2.3 forward tease (§3, beat 14).** Checked against every ledger entry
  through 1.9: 3.4 (teased by 1.6), 2.2 (teased by 1.7), 3.22 (teased by
  1.8), and 3.12 (teased by 1.9) are all already spent; 2.3 has not been
  used as a further-out tease by any prior chapter. A second reader should
  confirm 2.3 (Evolution of Modern Architectures) is the right target - it's
  chosen because 2.3's own purpose (the one-server-to-services scaling story)
  is the direct continuation of this chapter's "evolve only the piece that
  breaks" idea applied repeatedly over time.
- **Quiz position-clustering (§10 above).** Caught and fixed during this
  drafting pass (Q1/Q2 both initially landed on `a`), not left for a second
  reader - but still worth a second, independent check against `index.ts`
  rather than trusting this spec's own account of the fix.
