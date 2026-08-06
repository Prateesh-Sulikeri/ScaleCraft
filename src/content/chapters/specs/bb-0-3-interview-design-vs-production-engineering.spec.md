# Chapter spec - 0.3 Interview Design vs. Production Engineering

Authored under CURRICULUM.md §5 (chapter blueprint), §6 (mandatory sections),
§20 (author instructions). Deliverable 1 of the 6 in pending-content.md's
"Per-chapter deliverables". Lives beside the lesson so a reviewer can check the
prose against the intent that produced it.

- Chapter definition: `src/content/chapters/index.ts`
  (`bb-0-3-interview-design-vs-production-engineering`)
- Lesson body: `public/content/chapters/bb-0-3-interview-design-vs-production-engineering.md`
- Manifest row: `src/curriculum/manifest.ts`, slug
  `0-3-interview-design-vs-production-engineering`

---

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Distinguish the interview register from the production register (§1.5) so every later Interview lens / Production note lands in the right box. |
| Type | Concept |
| Difficulty | foundational |
| Estimated time | 15 minutes (Reader + knowledge check; no build - see §4). |
| Prerequisites | 0.2 What is System Design? |
| Unlocks | 0.4, and by name every later chapter's Interview lens section; explicitly prepares for 1.11 per CURRICULUM §14's own row. |
| Building blocks introduced | None. §16 homes the first three components at 1.6. |
| Stages trained | Stage 1 (orientation). |
| Interview relevance | High - meta: this chapter IS the register the rest of the curriculum's Interview lenses run in. |
| Production relevance | Every "boring choice" vs. "clever choice" decision an engineer makes traces back to which register they're actually being judged in. |

## 2. Learning objectives (§5.2)

Four objectives. Practical omitted, same justified Concept-chapter carve-out
0.2 used (§5.2: "except Practical in pure Concept chapters") - no
construction-family exercise exists to test it against (§4 below).

1. **Knowledge** - State what each register rewards and over what time
   horizon.
2. **Engineering** - Decide whether a proposed design's complexity is
   justified by a real force under pressure, in either register.
3. **Interview** - Recognize an interviewer's request to switch registers
   mid-conversation, and answer in the new register on request.
4. **Communication** - Defend a decision by naming which register you're
   answering in and why the choice would or wouldn't change in the other one.

Each objective is exercised: 1 by "Two registers, one question" + quiz
Q1/Q2; 2 by "Same brief, two registers" + "Ways to misread this" + quiz
Q3/Q4; 3 by the Interview lens section; 4 by the senior-answer example and
quiz Q5.

## 3. Per-beat outline (§5.3, Concept type per §6)

| Beat | Section in the lesson | Notes |
|---|---|---|
| 1-2 Cold open / why this exists | Untitled opening, 4 sentences | A candidate proposes splitting a database across sixteen machines with no user count on the table, the interviewer asks why, silence - the same silence later wakes them at 3am. Deliberately avoids the naive "interviewer is impressed by boldness" framing, which would contradict the chapter's own thesis. The complexity is described in plain machine-count terms rather than named as "sharding"/"multi-region" (§18.2 rule 1: neither term has a home chapter yet, and the point does not need them). |
| 3 Think first | "Think first" callout | Prediction prompt: do interview-right and production-right answers ever diverge, ever match? |
| 4 Mental model | "Two registers, one question" | Defines *register* at first use (§20.1: every term of art defined once) - who judges, over what span, what they count as a good answer - then the anchor: both registers ask "is this justified," under different pressure. |
| 5 Visual explanation | Mermaid diagram, same section | Same-decision-splits-into-two-registers flowchart. Root node is the cold open's concrete decision ("split the database across 16 machines?") and each leaf states what that register rewards *for that decision*, so the diagram carries a worked instance rather than two abstract labels. Captioned per §7.2/§20.3, and the caption is written not to restate beat 4's definition. |
| 6 Core mechanics | Comparison table + unpack paragraph, same section | Four-dimension table (time horizon / what's rewarded / cost of being wrong / default posture) does the scan-value teaching. "Boring, reversible, well-understood" is the terse cell the whole production register rests on, so one short paragraph after the table defines both words operationally (failures already documented; wrong costs an afternoon, not a migration) - added in the Opus pass, previously left as an assertion. |
| 7 Internal mechanics / 8 Trade-offs (merged) | "Same brief, two registers" | One worked example (a link shortener at 500 new links/day) run through both registers - shows the architecture converging while the register changes what's narrated vs. instrumented. The brief carries a real number so "at this scale nothing forces more" is checkable rather than asserted. Explicitly reuses 0.2's "no force under pressure, no justified complexity" test, applied to a decision instead of a system - the chapter's one intentional backward callback embedded in body text, not just in "Next". |
| 9 Failure modes | omitted | Optional for Concept (§6); no single system under discussion to fail - the "wrong register" failure mode is covered by beat 12 instead. |
| 10 Scaling | omitted | Optional for Concept (§6); not applicable without a system. |
| 11 Production examples | "Production examples" | Stack Overflow (restraint, justified by real traffic numbers) and Discord (complexity, justified by real message-volume pain) - §13 format, deliberately paired so "production favors boring" doesn't read as "production always avoids complexity." Both carry a public number (nine web servers; ~100 million messages) and state the accepted trade-off. Product names on either side of Discord's migration are omitted: they are implementation detail per §13, and neither has a home chapter. |
| 12 Common mistakes | "Ways to misread this" | Three: scale theater in interviews, over-generalizing "boring" into a rule, bringing interview energy into production. |
| 13 Interview lens | "Why this resembles an interview" | High relevance, so this section carries real weight: an interviewer's mid-conversation register switch is an invitation, not a trap; then the "it depends" fix (name the variable, commit on both sides) which Q5 tests. Ends with §10.3's mandatory "what a senior answer sounds like" line, built only from this chapter's own vocabulary and from the same worked brief used in beat 7. |
| 14 Connections | merged into "Next" | Backward: 0.2 (the forces/justified-complexity test, named explicitly again here per §19's "beat 14" placement even though it's also used substantively in body text) and 0.1 (the validation-failure-as-follow-up framing, 0.1's own stated objective #4). Two explicit backward connections, satisfying §19's ≥2. |
| 15 Recap + knowledge check | "Recap" | Three retrieval anchors; QuizLauncher renders the knowledge check automatically. |
| 16 Transition brief | "Your turn" | States plainly there is no build, reframes the knowledge check as the chapter's actual exercise - same pattern 0.2 established. |
| Preview of next | folded into "Next" | Previews **0.4** (the Interview Loop as a map of Part 1) with an unresolved pull ("so what's the actual step-by-step process a strong candidate runs?"). Further-out marked tease to **1.11**, matching CURRICULUM §14's own "Prepares for: 1.11" line for this chapter. |

## 4. Declared omissions and justifications (§6's written-justification rule)

- **No construction-family exercise (build/completion/fix).** Same exception
  0.2 recorded (§11.1): no components are introduced (§16 homes the first
  three at 1.6), so there is nothing to build with that wouldn't be a forward
  dependency. CURRICULUM §14's own 0.3 row states "Exercise: none
  (quiz-weighted)" directly - no divergence to reconcile here, unlike 0.1.
  `availableComponentIds`/`requiredComponentIds` are both `[]`, no
  `starterGraph`, `blueprints: []`.
- **Failure modes and scaling behavior - omitted**, permitted outright for
  Concept chapters by §6. Neither applies without a concrete system to fail
  or scale; the "wrong register" failure mode is real but belongs to Common
  mistakes (a reasoning error, not a system failure), not a fabricated
  fit into this slot.

## 5. `hasEditorExercise: false` - reused, not re-derived

0.2's spec §5 fixed the underlying mechanism (`ChapterDefinition
.hasEditorExercise`, `ChapterReader.tsx`'s CTA suppression,
`deriveStatus`'s completion gating) and explicitly flagged that "every
future Part 0/1 Concept chapter without a build (0.3, 0.4, 1.2, 1.3, 1.5)
reuses this field." 0.3 does exactly that - no new engineering work, just
setting the field. Completion for this chapter is the exam pass alone.

## 6. Component budget (§16)

None introduced. `availableComponentIds: []` - no exceptions to declare.

## 7. Validation rules (deliverable 4)

None authored, none needed. `validationRuleIds: []` - there is no graph to
validate.

## 8. Quiz (deliverable 5)

Five questions, ids permanent. Ramp 1/1/2/2/3, matching 0.2's convention
against QUIZ_FRAMEWORK §3's rough 30/45/25 target (2 level-1, 2 level-2, 1
level-3 of 5 questions rounds to that ramp). Q1 models QUIZ_FRAMEWORK §5's
Q3, Q2 models that bank's Q4, Q5 models that bank's Q10 - all three are
explicitly tagged "(0.3)" in the bank, i.e. written for this chapter. Q3
(multi, "select all that describe the production register") and Q4 (single,
the unprompted-sharding scenario) are original, not modeled on any bank
question.

Scope check: every question draws on 0.3's own material plus 0.2's
"justified complexity" test (already taught, fair game) - no question
requires the Interview Loop (0.4) or anything from Part 1, none of which has
been taught yet.

**Kind variety.** Unlike 0.2 (which used `matching` for its non-`single`
variety), this chapter uses `multi` for Q3. A `matching` question was
considered for "classify each scenario as interview or production register"
but rejected: with only two real categories, a matching dropdown becomes a
disguised binary choice per row rather than a genuine n-to-n mapping (compare
0.2's Q2/Q3, which mapped five *distinct* forces) - `multi`'s "select all
that apply" format tests the same content honestly instead.

**Position-clustering check (the bug 0.1/0.2 shipped once, see
pending-chapters.md).** Four single-kind questions (Q1, Q2, Q4, Q5); correct
options sit at c, b, a, d respectively - four distinct positions, checked by
eye, not just against `quiz-invariants.test.ts`'s "not all the same
position" floor.

## 9. Playtest pass (deliverable 6, §18.2's binding question)

*"Which prior chapter taught each move this exercise requires?"*

| Move | Taught by |
|---|---|
| Read a Mermaid diagram in the lesson body | 0.1 and 0.2 both already used one - not a new skill |
| Answer a `multi` ("select all") quiz question | New format this chapter (0.1 was all `single`, 0.2 introduced `matching`) - the prompt states the mechanic explicitly ("select all that apply"), and the UI renders standard checkboxes, self-explanatory without prior exposure |
| Apply "is this complexity justified by a real force" to a novel scenario (Q3, Q4) | Directly taught: 0.2 taught the force-under-pressure test; this chapter's "Same brief, two registers" and "Ways to misread this" both apply it to a decision rather than a system before the quiz asks for it |
| Recognize the "it depends" fix (Q5) | Directly taught in "Why this resembles an interview," which states the fix (name the variable, commit on both sides) before the quiz asks for it in a fresh wrapper. **This row was false when first written** - the draft lens never mentioned "it depends" at all; the Opus pass added the two sentences that make it true (§11 item 5) |

No move is unsourced.

## 10. Comparison to CURRICULUM §14's own row

0.3's row: "Purpose: distinguish the two registers (§1.5) so every later
Interview lens / Production note lands in the right box. Assumes: 0.2.
Prepares for: 1.11, every Interview lens. Interview: High: meta. Exercise:
none (quiz-weighted). Est: 15." The shipped chapter matches this row
directly - no divergence to reconcile or flag, unlike 0.1's built-vs-spec gap.

## 11. Opus proofread pass (2026-08-06)

Second-opinion editorial pass over Sonnet's draft, run against the user's own
finding: *"the language used is either too specific for the point where this
chapter is present or too vague."* Structure, the two-register thesis, the cold
open's framing, and the Stack Overflow / Discord pairing were all kept - all
three are recorded judgment calls in `pending-chapters.md`. Lesson went from
**896 to 1156 words** (0.2's post-pass comparison point for the same 15-minute
estimate is 1092). `lessonVersion` 1 -> 2.

**Too specific for chapter 3 of 44** (§18.2 rule 1 - none of this vocabulary has
a home chapter before 1.6, and in each case the argument, not just the flavor,
rested on it):

1. **Cold open.** "A sharded, multi-region database... why sixteen shards"
   stacked three untaught terms in one sentence, and the reader has to grasp the
   proposal to feel that it is unjustified. Replaced with a plain description of
   the same thing: "split the database across sixteen machines in three regions
   - minute one, before anyone has said how many users there are." Same beat,
   no vocabulary tax, and it makes the missing justification the visible part.
2. **Senior-answer line.** "I'd shard only once replication lag or write
   throughput actually forces it" made replication lag the trigger condition of
   the chapter's one §10.3 exemplar - a term with no home chapter at all yet.
   Rewritten (see item 6, which also fixes a worse problem in the same line).
3. **Discord example.** "Moved a core datastore off MongoDB onto Cassandra"
   spent two product names and "datastore" on a claim that needs none of them.
   Now "replaced the database under its message history," with the actual pain
   named instead (messages stopped fitting in memory at ~100 million; reads
   turned slow and unpredictable). §13 calls product internals tourism anyway.
4. **"Sharded design" in Common mistakes** became "a design built for a hundred
   times the traffic that exists," which is the property the bullet is actually
   about. Same for on-call idiom: "paged at 3am" / "owning the pager" (never
   glossed) became "woken at 3am" and "being the person who has to keep it
   alive"; the table's "A page at 3am" became "A 3am outage."

Deliberately left in as flavor rather than load-bearing: "regions" and
"machines" in the cold open (self-describing), "cache" (0.2 already grounded
it), "throughput"/"latency" (0.2 taught them as two of the five forces).

**Too vague / under-earning** (§20.6 in the under-explained direction):

5. **"Register" was never defined.** The chapter's central term appears in the
   title, the section headings, the diagram and the quiz, and the draft never
   said what one is - the reader had to infer it from the contrast. Beat 4 now
   opens by defining it (who judges, over what span, what they count as a good
   answer) before asserting the two-register split. This is the single biggest
   comprehension fix in the pass.
6. **The senior-answer line contradicted the chapter.** The draft's exemplar
   was *"For the interview, I'd propose the sharded design to show I understand
   the scaling path. But if you're asking what I'd actually deploy Monday..."* -
   i.e. it modelled proposing unjustified complexity in the interview register,
   which is exactly the failure the cold open punishes and exactly the naive
   "interview = bold, production = boring" model the ledger records as
   deliberately avoided. Rewritten so the senior move is naming which register
   you're answering in, with the *design unchanged* across the switch and only
   the instrumentation added. Also added the "it depends" fix (name the
   variable, commit on both sides), which the §9 playtest table claimed the
   lens taught and it did not - Q5 tests exactly that.
7. **The diagram was abstract scaffolding.** Root node "Same design decision"
   with leaves "Interview register" / "Production register" and one attribute
   each restated the table's first two rows in boxes. Root is now the cold
   open's actual decision and each leaf states what that register rewards *for
   that decision* ("wins by naming when 16 is right, and why not yet" vs. "wins
   by shipping one, measuring, splitting when numbers say so"), so the diagram
   carries a worked instance. Caption rewritten too: the old one ("same input,
   two different reward functions") was ML jargon and a restatement; the new one
   points at what the picture shows that the prose doesn't.
8. **"Boring, reversible, well-understood choices"** was a terse table cell
   carrying the entire production register and was never unpacked. One paragraph
   now defines both words operationally.
9. **"At this scale nothing forces more"** in the worked example referred to a
   scale the brief never stated. The brief now carries a number (a link
   shortener, 500 new links a day), so the judgment is checkable, and the same
   number anchors the senior-answer line three sections later. Also dropped
   "Postgres instance" / "mapping table" for "one database, one table mapping
   short code to long URL."

**Checked and deliberately not changed:** the cold open's "interviewer asks why"
framing (a recorded judgment call, and it is the right one); the Stack
Overflow / Discord pairing as opposite moves in the same register (the anti-
misreading it was chosen for is real, and "Ways to misread this" bullet 2 leans
on it); the three-bullet Common mistakes; the Think-first prompt; "Your turn"
(matches 0.2's no-build pattern verbatim in shape); "Next" correctly previews
0.4 (confirmed against `src/curriculum/manifest.ts` - 0.4's `prerequisiteSlugs`
is 0.3) with 1.11 as the single marked further-out tease; §19's two backward
connections (0.1 and 0.2) intact; §6's section inventory for Concept complete
and in §5.3 order, with §4's omissions (failure modes, scaling, no build) still
holding. Stack Overflow's nine-web-server figure and Discord's ~100-million-
message figure are both public and load-bearing to the decision (§13), not
tourism. No em dash anywhere in lesson or spec.

**Quiz: not touched** (lesson-scope pass). One note for the record rather than
an edit: Q1's stem, "In a system design interview, which is most valued?", and
its correct option ("structured breadth-first reasoning, clear communication,
and named trade-offs") use "breadth-first," which the lesson does not use - it
comes from §1.5's own phrasing. It is answerable without the term, so it was
left alone, but it is the one remaining lesson/quiz vocabulary seam.
