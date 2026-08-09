# Chapter spec - 1.2 Functional Requirements

Authored under CURRICULUM.md §5 (chapter blueprint), §6 (mandatory sections),
§20 (author instructions). Deliverable 1 of the 6 in pending-content.md's
"Per-chapter deliverables". Lives beside the lesson so a reviewer can check the
prose against the intent that produced it.

- Chapter definition: `src/content/chapters/index.ts`
  (`bb-1-2-functional-requirements`)
- Lesson body: `public/content/chapters/bb-1-2-functional-requirements.md`
- Manifest row: `src/curriculum/manifest.ts`, slug
  `1-2-functional-requirements`

**Wave.** Second chapter of Wave 2 (Part 1, per `pending-content.md`). 1.1 is
authored on this same branch, uncommitted; no wave-gate check needed since this
is a continuation of an in-progress wave, not a new one.

---

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Extract what the system must do from 1.1's clarified scope, and scope it ruthlessly - Must-have vs. everything that can wait. |
| Type | Process |
| Difficulty | foundational |
| Estimated time | 15 minutes (Reader + knowledge check; no build - see §4), per CURRICULUM §14's own row. |
| Prerequisites | 1.1 Understanding the Problem. |
| Unlocks | 1.3 Non-functional Requirements directly; every later Part 1 chapter and every RWE project brief indirectly (every brief needs a Must-have list before anything else). |
| Building blocks introduced | None. §16 homes the three primitives at 1.6. |
| Stages trained | Part 1's default (§2): stage 4 continuing (choosing Must vs. Should/Could/Won't is a trade-off judgment), stage 5 continuing (turning a clarified scope into a concrete feature list is design work). |
| Interview relevance | High - this is loop step 2 (§10.1), the first half of "requirements" (the second half, non-functional, is 1.3). |
| Production relevance | The same discipline - naming what's explicitly out of scope, not just what's in - is what a PRD's "non-goals" section or a project pitch's "no-gos" does in writing. |

## 2. Learning objectives (§5.2)

Five objectives, all five §5.2 categories represented (Process chapters do not
get the Concept-only Practical carve-out, same as 1.1).

1. **Knowledge** - State the test that decides whether a feature belongs on
   the Must-have list: the system fails its core job without it.
2. **Engineering** - Sort a list of candidate features for a brief into Must,
   Should, Could, and Won't using that test.
3. **Interview** - Name the Must-have list crisply and state why one or two
   features are deliberately deferred, inside the interview's requirements
   step.
4. **Practical** - Given a brief and a list of candidate features, select
   exactly the ones that belong on the Must-have list - the chapter's
   quiz-realized version of CURRICULUM §14's staged exercise (see §5 below).
5. **Communication** - State out loud why a specific feature was cut, not
   just that it was cut.

Each objective is exercised: 1 by "The test" + quiz Q2; 2 by "Sorting the
list" + Q1 (multi-select); 3 by "In an interview" + Q4; 4 by quiz Q1 itself;
5 by the senior-answer line + quiz Q3/Q5.

## 3. Per-beat outline (§5.3, Process type per §6)

| Beat | Section in the lesson | Notes |
|---|---|---|
| 1-2 Cold open / why this exists | Untitled opening, 6 sentences | Continues 1.1's URL shortener directly: the interviewer confirms the two facts 1.1 left hypothetical (heavy read skew, confirmed expiry), then asks "what does this thing actually do" - a candidate lists seven features with nothing drawn. This chapter's own worked resolution of 1.1's open hypothetical, not a claim that 1.1's lesson text stated these facts (it deliberately didn't - see 1.1 spec §3, beat 1-2). Ends on the felt cost (a design owed for all seven, no signal about which one matters) and **does not** state the chapter's answer - that would kill beat 3. |
| 3 Think first | "Think first" callout | Prediction prompt: which of the seven survive if you keep only what the system cannot work without, and what test decides. |
| 4-5 Mental model + visual explanation | "The test" | One-sentence anchor (system fails its core job without it) + Mermaid decision tree, same section, matching 1.1's own pairing of beats 4-5. The tree routes to **all four** outcomes (three questions, four leaves), so the mental model and the MoSCoW vocabulary are one object rather than two. Deliberately *not* the two-branch shape 1.1 used - see §13. |
| 6 Core mechanics | "Sorting the list" | Must/Should/Could/Won't (MoSCoW) table with one URL-shortener example per bucket, continuing the same confirmed brief from the cold open. Names the buckets the diagram already routed to; it is not a second model. |
| 7 Internal mechanics | "Why the write-down matters" | The one level down: Should/Could/Won't means "not this pass," and only staying written keeps a deferred feature from silently re-entering scope mid-build. |
| 8 Trade-offs | "Must, or just useful?" | Custom aliases as the worked ambiguous case - Must for one target audience, Could for another, same feature. |
| 9 Failure modes | omitted | Optional for Process (§6). See §4 below. |
| 10 Scaling | omitted | Optional for Process (§6). See §4 below. |
| 11 Production examples | "In production" | Basecamp's Shape Up "no-gos" - included, unlike 1.1's omission (see §4 below and the open note this resolves from 1.1's ledger). Sits **after** beat 8, per §5.3's order. |
| 12 Common mistakes | "Common mistakes" | Four: treating every idea as a requirement (cold-open callback), dropping a feature silently instead of naming the cut, confusing FR with NFR (forward-names 1.3 by number only, no content borrowed), sorting by product category instead of by this brief. |
| 13 Interview lens | "In an interview" | High relevance. What naming deferred features unprompted signals, then the mandatory §10.3 senior-answer line, built only from this chapter's own vocabulary. |
| 14 Connections | merged into "Next" | Backward: 1.1 (the clarifying-question test feeds today's sort; the confirmed expiry non-negotiable is used substantively in "Sorting the list" *and* named again in "Next") and 0.4 (loop step 2, requirements, named in "Next"). Meets §19's >=2. |
| 15 Recap + knowledge check | "Recap" | Four retrieval anchors; QuizLauncher renders the knowledge check automatically. |
| 16 Transition brief | "Your turn" | States plainly there is no canvas build (components arrive at 1.6), names the quiz's multi-select question as the actual exercise, and states what's withheld: which candidate features are Must isn't told in advance. |
| Preview of next | folded into "Next" | Previews **1.3** (the same Must-have list gets performance/availability/consistency promises attached). No further-out tease this chapter - see §4's judgment call on this. |

## 4. Declared omissions and justifications (§6's written-justification rule)

- **Failure modes and scaling behavior - omitted**, permitted for Process
  chapters by §6 (both "o"). Same reasoning 1.1 used: there is no system yet
  to fail or scale, only a step in a design conversation.
- **No everyday analogy in the mental-model beat**, same choice 0.3/0.4/1.1
  made for the same reason: the test itself (does the system fail its core
  job without this) is already the clearest available frame.
- **Production examples - included, not omitted.** 1.1's ledger flagged an
  open risk: if 1.2-1.5 each independently omit production examples for the
  same reasoning 1.1 used, Part 1 ships with no production register at all,
  contradicting §1.5's two-registers framing. Basecamp's Shape Up "no-gos"
  practice is a distinct, public, load-bearing example specifically about
  cutting functional scope under a deadline (not a repeat of 0.4's
  design-doc examples, which were about stating goals broadly) - it clears
  §13's who/why/when/what-trade-off bar in two sentences. This is a
  deliberate resolution of the open risk at the first opportunity, per 1.1's
  own recommendation to decide it "at 1.3 or 1.4" rather than let it happen
  by default - resolved one chapter earlier once a genuinely distinct
  example was available.
- **No further-out forward tease** (1.1 and 0.4 both already tease 1.6 as
  the first build; a third consecutive tease to the same chapter risked
  feeling mechanical rather than motivating). §19 requires "at most one"
  tease, not "exactly one" - flagged here as a judgment call for a second
  reader rather than a silent omission.

## 5. The staged exercise, degraded per `pending-content.md`

CURRICULUM §14's own 1.2 row: "Exercise: staged checklist with feedback."
Same blocker 1.1 recorded: the `stages` mechanism this implies does not exist
yet. Realized here as quiz Q1 (`multi`, 8 candidate features, 3 correct),
continuing 1.1's own URL shortener brief now with two facts confirmed (heavy
read skew, links expire) rather than left hypothetical - the same skill
(apply the test, sort into buckets), a smaller candidate pool than a full
staged checklist would use. Per-option `explanationMd` gives the same
per-choice feedback the staged version promises. Flagged for the same future
revisit 1.1's spec already flagged once the stages UI lands.

No `availableComponentIds`/`requiredComponentIds` beyond `[]`, no
`starterGraph`, `blueprints: []` - same as 0.2/0.3/0.4/1.1, for the same
reason (§16 homes the three primitives at 1.6).

## 6. `hasEditorExercise: false` - reused, not re-derived

Same mechanism 0.2's spec fixed and 1.1 already reused. No new engineering
work. Completion is the exam pass alone.

## 7. Component budget (§16)

None introduced. `availableComponentIds: []` - no exceptions to declare.

## 8. Validation rules (deliverable 4)

None authored, none needed. `validationRuleIds: []` - there is no graph to
validate.

## 9. Quiz (deliverable 5)

Five questions, ids permanent, ramp 1/1/2/2/3 (matching 0.2/0.3/0.4/1.1's
convention). Q1 stands in for the staged exercise (§5 above), continuing
1.1's brief for continuity across the loop's first two steps. Q2-Q5 are
original.

**Q1 · multi · 1.** Same URL shortener brief as 1.1, now confirmed (heavy
read skew, links expire after a year). 8 candidate features, 3 correct:
create link, redirect link, auto-expire (the confirmed non-negotiable). 5
distractors spanning Should (malformed-URL validation), Could (custom
aliases, QR codes), and Won't (click dashboard, user accounts) - every
option's `explanationMd` states which bucket it belongs in and why, per
QUIZ_FRAMEWORK §1 point 2.

**Q2 · single · 1** (correct at `b`). Tests distinguishing a functional
requirement ("users can filter by date") from a non-functional one ("returns
results in under 300 ms") in a fresh scenario (ticket-booking search),
without borrowing 1.1's or 0.4's material.

**Q3 · single · 2** (correct at `a`). The write-down-matters mechanic as a
mid-build scenario: a teammate assumes a feature was in scope because it was
never explicitly cut. Distractor `b` is the "always Must" blanket-rule trap
the trade-offs section argues against directly.

**Q4 · single · 2** (correct at `c`). The Must-or-Could ambiguity from
"Must, or just useful?" applied to a fresh pair of teams (not verbatim the
lesson's own example, same reasoning). Tests that the category is
audience-dependent, not fixed per feature.

**Q5 · single · 3** (correct at `d`). Synthesis question bridging back to
1.1: a confirmed "yes" to a 1.1-style clarifying question (click analytics)
moves a feature from Could/Won't into Must, mirroring the expiry example
already worked in the lesson. Placed last (difficulty 3) since it requires
both chapters' material at once, the same placement logic 1.1's own Q5 used.

**Position-clustering check** (the bug 0.1/0.2 shipped once). Four
single-kind questions (Q2, Q3, Q4, Q5); correct options sit at b, a, c, d -
four distinct positions, checked by eye.

Scope check: every question draws on this chapter's own material plus 1.1
(the clarifying-question test, the URL shortener brief) and 0.4 (loop step
2, requirements - named, not re-taught). No question requires anything from
1.3 onward.

## 10. Playtest pass (deliverable 6, §18.2's binding question)

*"Which prior chapter taught each move this exercise requires?"*

| Move | Taught by |
|---|---|
| Read a Mermaid decision-tree diagram | 1.1 already introduced this diagram shape for an analogous yes/no test - familiar, not new |
| Recognize a "confirmed non-negotiable" and apply it to a design decision | Directly taught in 1.1's own material (the four categories, including non-negotiables) and its worked URL shortener brief, continued here |
| Distinguish a feature ("what") from a performance promise ("how well") without yet having 1.3's vocabulary | The distinction itself (not the NFR term) is new to this chapter and taught directly in "Common mistakes"; the quiz never requires naming an NFR category, only recognizing that a latency number isn't a feature |
| Answer a `multi` "select all that apply" quiz question | Already familiar - 0.3 introduced `multi`, 1.1 already used it as an exercise stand-in |
| Judge an audience-dependent trade-off (Must for one team, Could for another) | Directly taught in this chapter's own "Must, or just useful?" section |

No move is unsourced.

## 11. Comparison to CURRICULUM §14's own row

1.2's row: "Purpose: extract what the system must do; scope ruthlessly (MVP
vs. later). Interview: High: step 2. Exercise: staged checklist with
feedback. Est: 15." The shipped chapter matches this row's purpose and
interview relevance directly. The one divergence is the exercise mechanic
(quiz multi-select standing in for a staged UI that doesn't exist yet),
recorded in §5 above as a flagged degradation, not a silent one - identical
in kind to 1.1's own divergence.

## 12. Items flagged for a second pass

Raised by the Sonnet draft for a second reader. All four were taken up by the
Opus pass; see §13 for what each resolved to.

- **The Q1-as-staged-exercise substitution (§5).** Same standing flag 1.1
  carried forward. *Still open* - quiz is out of scope for the Opus pass.
- **The deliberate diagram-shape echo of 1.1 (§3, beats 4-5).** *Resolved:
  echo removed* (§13).
- **Production examples now included where 1.1 omitted them (§4).** *Resolved:
  example kept, rewritten* (§13).
- **Word count.** Draft was 992 words for a 15-minute estimate, against 0.4's
  comparable pre-pass 1085 for the same estimate and 1.1's 1063 for 20
  minutes. *Resolved differently than expected* - the drag the user reported
  was not length (§13).

## 13. Opus proofread pass (2026-08-08)

Scope: content, content-structure, blueprints, component lists, submit
validations, diagrams. Quiz, hints, `problemStatement`, `learningObjectives`
and `curriculumContext` were explicitly out of scope and untouched.
`lessonVersion` 1 -> 2. Lesson 992 -> 1129 words (`wc -w`, mermaid block
included in both; the block itself grew from 25 to 62 tokens).

The pass was driven by direct user feedback on the draft: *"the chapter feels
dragged out, the In production section is just un-understandable. a more
jarring chapter for some reason I didn't really get a clear picture out of
this chapter."* All three complaints were reproduced on a fresh read and all
three had concrete causes.

### "Dragged out" - the cause was restatement, not length

The chapter's one idea was stated six times before it did any new work: the
cold open's closing sentence, the think-first prompt, "The test"'s opening
sentence, the diagram, the diagram caption, and the first row of the MoSCoW
table. §20.6's first cut-on-sight item ("one idea stretched across multiple
paragraphs; state it once, at full strength") is exactly this. Fixes:

- **The cold open no longer states the answer.** The draft ended on "Not
  everything that occurs to you is a requirement - only what the system cannot
  ship without," which is the chapter's thesis, delivered one line before a
  think-first prompt that asks the reader to derive it. §5.3 beat 3 requires
  the prediction prompt to come *before* any answer is revealed; the draft
  violated it. Replaced with the felt cost (a design owed for all seven
  features, no signal about which one matters).
- **The think-first prompt was unanswerable as written.** It asked which
  *one* feature to keep; the chapter's own answer is two (create and
  redirect). Reworded to ask which of the seven survive the test.
- **Cold open said "Five features in" over a list of seven.** Straight factual
  error inside the chapter's own scene. Fixed.
- **Weakest "Common mistakes" bullet replaced.** "Building Could-have features
  before the Must-have list is solid" carried no explanation and no new
  information. Replaced with sorting by product category instead of by the
  brief in front of you - the mistake the trade-offs section and quiz Q3/Q4
  actually test.

Net word count went *up* slightly, which is the honest outcome: the drag was
redundancy, and removing it freed room for the diagram and the production
example to carry real content. Density per §20.6 is measured in ideas per
minute, not words.

### "In production is un-understandable" - rewritten, not cut

Read cold by a learner who has never heard of Shape Up, the draft's two
sentences assume the whole frame. "Basecamp's Shape Up process makes this
explicit: every six-week project pitch names its 'no-gos'" uses *Shape Up*,
*six-week*, *pitch* and *mid-cycle* without introducing any of them, and the
trade-off sentence is a comparative between two abstractions ("naming them
protects the deadline more than including them would help the release") that
does not parse on one read. §13's four legs were also incomplete: *when it
applies to you* was missing entirely.

**The Basecamp claim itself is accurate** and was verified against Shape Up's
own public description rather than accepted from the draft: Basecamp works in
fixed six-week cycles, work is shaped into a written pitch before it is bet
on, and "no-gos" is one of the pitch's named ingredients - functionality
deliberately excluded to fit the fixed appetite. So the example is sound; only
its telling was broken. Kept and rewritten to introduce the cycle and the
pitch before using them, state the mechanism plainly (when the deadline can't
move, scope is the only thing that can), carry *when it applies to you* ("any
dated release, not just a six-week cycle"), and end on the cost. This also
keeps 1.1's ledger risk resolved - Part 1 now has a production register.

### "Jarring / no clear picture" - two structural causes

1. **The chapter taught two mental models and asked the reader to stitch
   them.** "The test" gave a binary Must/not-Must decision tree; "Sorting the
   list" then introduced a four-bucket scheme the diagram never mentioned. The
   primary diagram is now a three-question router with four leaves, so the
   test *is* the sort, and the MoSCoW table names outcomes the reader has
   already seen. This also adds a genuinely new idea the draft lacked: Could
   versus Won't is a call about this pass's capacity, not a property of the
   feature - which is what makes "write it down" (beat 7) follow rather than
   arrive.
2. **"In production" was out of §5.3 order**, sitting between beat 7 (the
   write-down) and beat 8 (the trade-off). §5.3/§20.3 allow merging adjacent
   sections but not reordering, and the misplacement is felt: the reader is
   pulled to Basecamp mid-argument and then back to custom aliases. Moved
   after "Must, or just useful?", which restores 7 -> 8 -> 11 -> 12 -> 13.

**On the flagged 1.1 diagram echo (§12): it was contributing, and it is
gone.** Two consecutive chapters opening with a section literally titled "The
test", the same URL-shortener interview cast, and a two-node yes/no decision
tree with the branches relabelled reads as a re-run of 1.1, not as new ground.
The reinforcement argument would hold if the second diagram carried new
information; it did not - it restated the sentence immediately above it. The
four-outcome router keeps the decision-tree *family* (still §7.1's "Decision
tree" entry, still Mermaid) while doing work 1.1's diagram did not.

### Smaller content fixes

- **"the interview's design time is already gone"** (cold open) was an
  overclaim - listing seven features costs under a minute. Replaced with the
  cost that actually follows: a design owed for all seven.
- **The expiry justification now closes the loop with the test** instead of
  reading as an exception to it. Draft: "a fact about this brief moved it
  there." Now: the confirmed answer changed what the job *is*, so the same
  test produces Must without special pleading.
- **A garden-path sentence** in "Must, or just useful?" ("because the audience
  1.1's clarifying questions surface changes what 'the system's one job' even
  means") split into two clear sentences.
- **"In an interview" moved to second person** and shortened; the senior-answer
  line (§10.3) is unchanged.

### Confirmed, not changed

- `blueprints`, `availableComponentIds`, `requiredComponentIds` and
  `validationRuleIds` are all correctly `[]`. §16 homes `client`,
  `app-server` and `sql-database` at 1.6, this chapter introduces none, there
  is no `starterGraph` and no graph to validate, so there is nothing for a
  blueprint or a rule to gate. No exception to declare.
- §5.3 beat coverage and §6's Process-type inventory are complete after the
  reorder. Failure modes and scaling remain omitted with the written
  justification in §4 (both "o" for Process).
- **"Next" names the correct chapter.** `src/curriculum/manifest.ts` has
  `1-3-non-functional-requirements` immediately after this slug, with
  `1-2-functional-requirements` as its prerequisite.
- **No untaught vocabulary** (§18.2 rule 1). "Non-functional" never appears;
  the FR/NFR distinction is taught by example and the term is deferred to 1.3
  by number only. MoSCoW is defined at first use. No component names appear.
- **No further-out forward tease** - the draft's judgment call stands. §19
  says "at most one", 1.1 and 0.4 both already tease 1.6, and a third would be
  mechanical.
- **Backward connections still >= 2** (§19): 1.1 used substantively in three
  places, 0.4 named in "Next".
- No em dash anywhere in the lesson (repo content rule, also enforced by
  `authoring-invariants.test.ts`).

### Out of scope, noticed, not touched

- **Quiz Q1 option f** explains malformed-URL rejection as "Should, not Must",
  which now matches the diagram's second branch exactly - no change needed,
  noted so a quiz owner knows the alignment is deliberate.
- **`hints[2]`** says "Should, Could, and Won't aren't 'no' - they're 'not
  this pass'", which duplicates the lesson's beat-7 sentence almost verbatim.
  Defensible for a hint, flagged for the hints owner rather than changed.
- **No pipeline run.** Content-only pass, per the skill's scope.
