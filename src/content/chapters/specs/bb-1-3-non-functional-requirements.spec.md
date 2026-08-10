# Chapter spec - 1.3 Non-functional Requirements

Authored under CURRICULUM.md §5 (chapter blueprint), §6 (mandatory sections),
§20 (author instructions). Deliverable 1 of the 6 in pending-content.md's
"Per-chapter deliverables". Lives beside the lesson so a reviewer can check the
prose against the intent that produced it.

- Chapter definition: `src/content/chapters/index.ts`
  (`bb-1-3-non-functional-requirements`)
- Lesson body: `public/content/chapters/bb-1-3-non-functional-requirements.md`
- Manifest row: `src/curriculum/manifest.ts`, slug
  `1-3-non-functional-requirements`

**Wave.** Third chapter of Wave 2 (Part 1, per `pending-content.md`). 1.1 and
1.2 are authored on this same branch, uncommitted; no wave-gate check needed
since this is a continuation of an in-progress wave, not a new one.

---

## 0. Type contradiction found and resolved (flagged, not silently picked)

CURRICULUM §4's chapter-types table lists 1.3 as a worked *example* of the
**Concept** type ("Concept | ... | 0.2, 1.3, 3.13 | ..."). But §14's own Part 1
section header states unambiguously: "Part 1 - Engineering Design Process
*(Process type, foundational, stages 1+4+5)*" - covering every chapter in the
part, 1.3 included, with no per-chapter override. The two sections disagree.

**Resolved: Process**, for three reasons, and by the same precedent
`pending-chapters.md`'s open decision 4 already set (§14 wins over a
conflicting section when the two disagree - there it was §14 vs. §10.1, here
it's §14 vs. §4):
1. §14 is "the per-chapter briefs... each row is your spec" per
   `pending-content.md`'s own framing - the more specific, load-bearing source,
   and its Part 1 header is unambiguous with no stated exception for 1.3.
2. 1.1 and 1.2 are both already authored as Process, on this same branch.
   Concept would make 1.3 an unexplained one-chapter exception mid-part,
   with no textual signal *why* 1.3 specifically would differ from its
   neighbors.
3. The practical difference is small either way (Concept mandates Production
   examples and carves out the Practical objective; Process leaves both
   optional/included) - authoring as Process, the higher-consistency choice,
   costs nothing a Concept reading would have required anyway (see §4 and §9
   below).

**Flagged for a doc fix**: §4's Concept-type example list should drop "1.3" -
it contradicts §14's own Part 1 header. Doc-only, non-blocking, same severity
class as the already-resolved five-forces contradiction.

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Attach numbers-shaped promises to 0.2's five forces (availability nines, latency budgets, throughput targets, durability tolerances, cost ceilings); recognize that NFRs, not features, drive architecture. |
| Type | Process (see §0 above). |
| Difficulty | foundational |
| Estimated time | 20 minutes (Reader + knowledge check; no build - see §5), per CURRICULUM §14's own row. |
| Prerequisites | 1.2 Functional Requirements. |
| Unlocks | 1.4 Estimating Scale directly (the numbers this chapter produces are what estimation has to satisfy or derive); every later Part 1 chapter and every RWE project brief indirectly (every brief needs NFRs stated before a design is defensible). |
| Building blocks introduced | None. §16 homes the three primitives at 1.6. |
| Stages trained | Part 1's default (§2): stage 1 continuing (naming the five forces' measurable shapes is vocabulary), stage 4 continuing (choosing which force dominates a product, and what an extra nine costs, is a trade-off judgment), stage 5 continuing (a design's numeric promises are part of assembling a whole system from an ambiguous brief). |
| Interview relevance | High - this is loop step 2 (§10.1), the second half of "requirements" (the first half, functional, is 1.2). |
| Production relevance | SLAs and SLOs are exactly this: a promise stated as a number, measured, and reported against - not a feeling anyone could claim. |

## 2. Learning objectives (§5.2)

Five objectives, all five §5.2 categories represented (Process chapters do
not get the Concept-only Practical carve-out, same as 1.1/1.2 - and moot
either way, since §0 resolved this chapter as Process).

1. **Knowledge** - State what makes a promise a non-functional requirement: a
   number about how well the system performs, not what it does, tied to one
   of 0.2's five forces.
2. **Engineering** - Translate a described product's dominant pressure into
   the NFR-shaped number that actually constrains its design (a latency
   budget, an availability target, a durability tolerance) instead of a
   vague adjective.
3. **Interview** - State a non-functional requirement as a number with a
   stated reason, instead of an adjective like "fast" or "reliable", inside
   the interview's requirements step.
4. **Practical** - Given three described products, match each to the number
   that actually dominates its design - the chapter's quiz-realized version
   of CURRICULUM §14's own exercise (see §5 below).
5. **Communication** - Justify why one force is prioritized over another for
   a given product, naming the cost of buying the extra nine or the tighter
   budget.

Each objective is exercised: 1 by "From adjective to number" + quiz Q2; 2 by
"Turning a force into a number" + Q1 (matching); 3 by "In an interview" + Q4;
4 by quiz Q1 itself; 5 by "One more nine, one more cost" + Q3/Q5.

## 3. Per-beat outline (§5.3, Process type per §6)

| Beat | Section in the lesson | Notes |
|---|---|---|
| 1-2 Cold open / why this exists | Untitled opening, 6 sentences | Continues 1.2's URL shortener one step later: the Must-have list (create, redirect, expiry) is on the board; the interviewer asks "how fast" and "how available," the candidate answers "fast" and "very available," and is told to give numbers and defend them. Ends on the felt cost: any architecture already drawn can honestly claim to be fast and available when neither word was specific. |
| 3 Think first | "Think first" callout | Prediction prompt: turn one of "fast"/"available" into a number you'd defend if asked "why not slower / why not less?" |
| 4-5 Mental model + visual explanation | "From adjective to number" | One-sentence anchor (an NFR is 1.2's *how well* partner, a number not an adjective) + a Mermaid flowchart mapping each of 0.2's five forces to the *shape* of number it becomes (ms-at-a-percentile, requests/sec, a percentage, a loss tolerance, a ceiling). Deliberately a fan-out mapping, not a yes/no decision tree - see §13's standing note that a repeated 1.1/1.2 diagram shape with only the labels changed is a retread, not reinforcement. |
| 6 Core mechanics | "Turning a force into a number" | Five-row table (force -> worked example), a short paragraph on why latency is measured at a percentile plus the definition of p99 at first use, and a downtime-per-year table for the availability nines (99% / 99.9% / 99.99% / 99.999%). The table deliberately does *not* restate the number *shapes* - the beat-5 diagram directly above already carries them (see §13's Opus pass). |
| 7 Internal mechanics | "Why the number, not the feeling" | The one level down: an adjective is untestable, a number is checkable against a dashboard before and after ship. Worked claim: a 200 ms p99 budget disqualifies a design with three sequential cross-region calls in the hot path before anyone has to argue about it. |
| 8 Trade-offs | "One more nine, one more cost" | 99.9% -> 99.99% costs failover machinery and on-call burden for ~8 hours/year of downtime bought back; a todo app doesn't need it, a payments API might regardless of the bill. Names 0.2's cost force explicitly. |
| 9 Failure modes | omitted | Optional for Process (§6). See §4 below. |
| 10 Scaling | omitted | Optional for Process (§6). See §4 below. |
| 11 Production examples | "In production" | Amazon S3's own two published numbers (99.999999999% durability, 99.9% availability) for the same product - a real, public, load-bearing pair that reinforces 0.2's "ways to misread this" durability/availability distinction with actual figures instead of restating it in the abstract. |
| 12 Common mistakes | "Common mistakes" | Four: stating a feeling instead of a number, picking a nines target because it sounds serious rather than because a force is genuinely under pressure (0.2's cost force, ignored), quoting a durability number when asked for availability or the reverse, giving every force a maximum number instead of naming the one that dominates. |
| 13 Interview lens | "In an interview" | High relevance. A bare adjective in the requirements step is a missed step, not a finished one; the mandatory §10.3 senior-answer line names a number and the reason, built only from this chapter's own vocabulary. |
| 14 Connections | merged into "Next" | Backward: 0.2 (five forces become these numbers, used substantively in beats 4-5 *and* named again in "Next") and 1.2 (the same Must-have list gets these promises attached, named in "Next"). Meets §19's >=2. |
| 15 Recap + knowledge check | "Recap" | Four retrieval anchors; QuizLauncher renders the knowledge check automatically. |
| 16 Transition brief | "Your turn" | States plainly there is no canvas build (components arrive at 1.6), names the quiz's matching question as the actual exercise, and states what's withheld: which number dominates each of the three products isn't given away in advance. |
| Preview of next | folded into "Next" | Previews **1.4** (the numbers from this chapter become the input to estimation - QPS, storage, bandwidth). No further-out tease - 1.1 and 0.4 already tease 1.6, and per §19's "at most one" a third would be mechanical (same judgment call 1.2 made). This is also the first Part 1 chapter to tease something *other* than 1.6, since 1.4 is a fresh, not-yet-used tease target. |

## 4. Declared omissions and justifications (§6's written-justification rule)

- **Failure modes and scaling behavior - omitted**, permitted for Process
  chapters by §6 (both "o"). Same reasoning 1.1/1.2 used: there is no system
  yet to fail or scale, only a step in a design conversation.
- **No everyday analogy in the mental-model beat**, same choice
  0.3/0.4/1.1/1.2 made for the same reason: "a number you'd defend, not an
  adjective you'd say" is already the clearest available frame; a forced
  comparison (a recipe's cook time, a warranty's fine print) would be
  decorative.
- **Production examples - included, not omitted**, consistent with 1.2's
  own resolution of the "Part 1 may ship with no production register" risk
  1.1 flagged. The S3 example is not a repeat of that resolution - it is a
  distinct, public, numeric example doing double duty: it satisfies §13 *and*
  reinforces 0.2's durability/availability distinction with real figures,
  which prose alone (0.2's own "Ways to misread this" bullet) could only
  assert.

## 5. The exercise: not a degradation, unlike 1.1/1.2

CURRICULUM §14's own 1.3 row: "Exercise: match NFRs to three described
products; explanation per match." Unlike 1.1's and 1.2's rows, this one was
never described as "staged" - it reads as a matching exercise from the start,
and QUIZ_FRAMEWORK §2's own format table names exactly this use case
("`matching` | Duties-to-components, NFRs-to-products | 3-5 pairs max").
Realized directly as quiz Q1 (`matching`, 3 pairs, per-option `explanationMd`)
with no stages-UI gap to flag - the first Part 1 chapter whose §14-specified
exercise is achievable as authored, not a documented substitute for missing
UI.

No `availableComponentIds`/`requiredComponentIds` beyond `[]`, no
`starterGraph`, `blueprints: []` - same as 0.2/0.3/0.4/1.1/1.2, for the same
reason (§16 homes the three primitives at 1.6).

## 6. `hasEditorExercise: false` - reused, not re-derived

Same mechanism 0.2's spec fixed and 1.1/1.2 already reused. No new
engineering work. Completion is the exam pass alone.

## 7. Component budget (§16)

None introduced. `availableComponentIds: []` - no exceptions to declare.

## 8. Validation rules (deliverable 4)

None authored, none needed. `validationRuleIds: []` - there is no graph to
validate.

## 9. Quiz (deliverable 5)

Five questions, ids permanent, ramp 1/1/2/2/3 (matching 0.2/0.3/0.4/1.1/1.2's
convention). Q1 stands in directly for CURRICULUM §14's own exercise (§5
above, no degradation flag needed). Q2-Q5 are original.

**Q1 · matching · 1.** Three fresh products (a ride-hailing driver-match
request, a hospital's legally-retained MRI archive, a conference Q&A app's
up-vote spike), each matched to the numeric NFR statement that dominates its
design (latency, durability, throughput respectively). Deliberately different
domains from 0.2's own Q3 matching question (bank ledger / hospital alert /
checkout flash sale / autocomplete / weekly report) to avoid a content
retread while reusing the *shape* 0.2 already validated - and unlike 0.2's
Q3, the options here are numeric NFR statements ("p99 under 150 ms"), not
bare force names, since this chapter's whole point is the number.

**Q2 · single · 1** (correct at `b`). Tests recognizing a properly-stated NFR
(a percentile latency budget) against three failure modes in the same
question: an adjective, a functional requirement in disguise, and a second
adjective - without borrowing 1.2's or 0.2's own worked examples verbatim.

**Q3 · single · 2** (correct at `c`). The nines-cost trade-off applied to a
fresh scenario (a 12-person internal reporting tool) rather than the
lesson's own abstract framing. Distractors cover three real-sounding wrong
reasons (technical impossibility, a blanket internal/external rule, "no real
difference") so the correct answer has to name the actual mechanism (cost
without a force under pressure to justify it), not just reject the others by
elimination.

**Q4 · single · 2** (correct at `a`). Interview-lens application: given a
candidate's bare-adjective answer, what's the interviewer's strongest
follow-up. Correct option is the cold open's own line, reused deliberately -
this is the one move the whole chapter teaches, so the quiz checks it's
recognized as the answer, not just read once.

**Q5 · single · 3** (correct at `d`). Synthesis question bridging back to
0.2: a teammate claims S3's two published numbers (from "In production")
are "basically the same guarantee, restated twice." Tests the
durability/availability distinction directly, with three plausible-sounding
wrong resolutions (interchangeable, one is a stricter form of the other,
scoped to storage-vs-compute) before the correct one (different failures,
different engineering answers). Placed last (difficulty 3) since it requires
both 0.2's and this chapter's material at once, the same placement logic
1.1/1.2's own Q5s used.

**Position-clustering check** (the bug 0.1/0.2 shipped once). Four
single-kind questions (Q2, Q3, Q4, Q5); correct options sit at b, c, a, d -
four distinct positions, checked by eye.

Scope check: every question draws on this chapter's own material plus 0.2
(five forces, the durability/availability distinction) and 1.2 (the
Must-have list this chapter attaches numbers to, named not re-taught). No
question requires anything from 1.4 onward.

## 10. Playtest pass (deliverable 6, §18.2's binding question)

*"Which prior chapter taught each move this exercise requires?"*

| Move | Taught by |
|---|---|
| Read a Mermaid flowchart diagram | 1.1/1.2 already used Mermaid decision trees for a related but distinct shape (yes/no branching); this chapter's fan-out mapping is new but the skill of reading a labeled flowchart is not |
| Recognize a force from 0.2 (latency, throughput, availability, durability, cost) by name | Directly taught in 0.2, reused here without re-teaching |
| Distinguish a functional requirement from a non-functional one | Directly taught in 1.2's "Common mistakes" bullet ("confusing how well with what") - this chapter builds on that distinction rather than introducing it |
| Answer a `matching` quiz question | Already familiar - 0.2 introduced `matching` for its own Q2/Q3 |
| Recognize the availability/durability distinction specifically | Directly taught in 0.2's "Ways to misread this" section; this chapter's S3 example and quiz Q5 apply it, not introduce it |

No move is unsourced.

## 11. Comparison to CURRICULUM §14's own row

1.3's row: "Purpose: attach numbers-shaped promises to 0.2's five forces
(availability nines, latency budgets, throughput targets); recognize that
NFRs, not features, drive architecture. Interview: High: step 2. Exercise:
match NFRs to three described products; explanation per match. Est: 20." The
shipped chapter matches this row's purpose, interview relevance, and exercise
mechanic directly - no divergence to flag, the first Part 1 chapter where
that's true (1.1 and 1.2 both diverged on the exercise mechanic due to the
missing stages UI). The one open item is §0 above (the Concept/Process type
contradiction between §4 and §14), not this row itself.

## 12. Items flagged for a second pass

Raised by the Sonnet draft for a second reader (Opus audit is out of scope
for quiz/hints/definition metadata per the skill's standing restriction, so
these are flagged for whoever reads this next, not necessarily an Opus pass):

- **§0's type contradiction (§4 vs. §14).** Authored as Process with reasons
  given; a second reader should confirm this reads as the right call, not
  just a convenient one.
- **A defect found and fixed in 1.2's already-drafted "Next" section, not
  1.3's own content.** 1.2's lesson said 1.3 would cover "how fast, how
  available, how consistent" - written 2026-08-08, before
  `pending-chapters.md`'s five-forces contradiction (open decision 4) was
  resolved 2026-08-09 in favor of §14's throughput-inclusive, consistency-
  excluded list. Since 1.2 is still uncommitted, the stale word was corrected
  to "how durable" in the same session as this chapter's draft, rather than
  left to contradict what 1.3 actually teaches. Flagged here since it's an
  edit to a sibling chapter's file made in service of this one's accuracy,
  not a silent fix.
- **Diagram-shape novelty (§3, beats 4-5).** The fan-out mapping diagram is
  asserted here to be genuinely new content, not a relabeled retread of
  1.1/1.2's yes/no decision trees (the exact defect the Opus pass caught and
  fixed in 1.2) - a second reader should confirm this holds.
- **Word count.** 1043 words for a 20-minute estimate, against 1.1's
  pre-pass 1063 for the same estimate. No distinct density-revision pass was
  run as a separate step; the draft was written once against §20.6 directly,
  the same claim 0.2 flagged once for a reviewer to check rather than trust.
  (Resolved by the Opus pass - see §13.)

## 13. Opus proofread pass (2026-08-09)

Scope: lesson body, content-structure, blueprints, component lists,
validation rules, diagrams. Quiz, hints and definition metadata
(`problemStatement`/`learningObjectives`/`curriculumContext`) were out of
scope and untouched. `lessonVersion` bumped 1 -> 2.

**Confirmed, left alone:**

- **§0's Process resolution holds in the shipped text.** Five objectives
  with the Practical category present (Process gets no Concept carve-out),
  failure modes and scaling omitted as Process-optional with §4's written
  justification, production examples present though optional for Process.
  Nothing in the chapter reads as a Concept chapter wearing a Process label.
- **Diagram novelty claim (§12) verified, not assumed.** 1.1's diagram is a
  single yes/no branch (`flowchart TD`), 1.2's a three-question router to
  four outcomes (`flowchart TD`); 1.3's is five parallel one-hop mappings
  (`flowchart LR`) with no decision node anywhere. Distinct from 0.2's own
  fan-out too: 0.2 fans one root out to five forces, 1.3 pairs each force
  with the shape of number it becomes. Genuinely new, not relabeled.
- **`blueprints: []`, `availableComponentIds: []`, `requiredComponentIds:
  []`, `validationRuleIds: []` all correct.** No `starterGraph` and no
  components means a blueprint would have nothing to describe; §16 homes the
  three primitives at 1.6 with no exception needed here (unlike 0.1's
  scenery carve-out, which existed only because 0.1 had a canvas); no graph
  exists to validate.
- **Numbers check out.** Nines-to-downtime figures are correct on a
  365.25-day year (3.6525 d / 8.766 h / 52.6 min / 5.26 min); 99.9% ->
  99.99% does buy back ~7.9 h/year, and "about 8 hours" is fair; S3's
  11-nines durability is its published designed-for figure.
- **"Next" names 1.4**, which `manifest.ts` confirms is the actual next
  chapter, with no further-out tease (1.1 and 0.4 already spend Part 1's
  1.6 teases). Backward connections: 0.2 and 1.2, meeting §19's >=2.
- **"QPS" needs no gloss** - 0.4's loop table already defines it ("users to
  QPS (queries per second)"), so §18.2 rule 1 is satisfied.

**Changed:**

1. **Density: the primary diagram and the core-mechanics table said the same
   thing twice.** The table's middle column ("The number it becomes") was a
   near-verbatim restatement of the diagram's right-hand nodes six lines
   above it - exactly §20.6's "state it once, at full strength." Column cut;
   the diagram now carries the shapes and the table carries the worked
   examples. The two nuances the column held that the diagram lacked
   ("usually near-zero" for durability, "not an average" for latency) were
   preserved: the first folded into the diagram node, the second is already
   the subject of the paragraph immediately after the table. Same collision
   0.2 resolved in the opposite direction (there the table kept the
   definitions and the diagram went names-only); here the diagram is the
   mandatory beat-5 visual and had to keep carrying content.
2. **"p99" was used before it was defined.** First appearance is the table's
   latency example; the following paragraph asked "how bad is the worst 1%?"
   without ever stating that p99 is the 99th percentile. Nothing earlier in
   the chain (0.1-1.2) uses "p99" or "percentile", so §20.1's define-at-
   first-use rule applies. Added one clause: "p99 is the 99th percentile: 99
   of every 100 requests come back faster."
3. **"Availability compounds the same way, just yearly instead of
   per-request" asserted a mechanism that doesn't exist.** Percentiles do
   not compound, and neither does an availability percentage; the real
   shared property is that both numbers stay abstract until converted into
   something felt. Rewritten to say that instead.
4. **"buys back roughly 10x less downtime" (body + recap).** "Buying back
   less" reads as a worse deal on a careful pass, which inverts the point.
   Now "cuts downtime tenfold" in both places.
5. **The senior-level line said "I wouldn't pay for a fifth nine" while
   sitting at 99.9%.** Three nines' next purchase is the fourth, and the
   trade-offs section immediately above prices exactly that step (99.9% ->
   99.99%). Changed to "the fourth nine" so the interview line lands on the
   mechanism the chapter just taught.
6. **S3's availability figure now names its source.** AWS publishes both a
   designed-for-99.99% availability figure and a 99.9% service-agreement
   commitment for S3 Standard; the draft's bare "99.9% availability" is the
   latter and reads as wrong to anyone who knows the former. Now "in its
   service agreement, 99.9% availability" - accurate, and it reinforces the
   chapter's own point that an NFR is a number somebody commits to.
7. **"Your turn" was missing the withheld-information line** that §3's own
   beat-16 row claims it has (and that 1.1/1.2 both carry). Added: "Which
   number dominates which product isn't given away in advance."
8. **Cold-open stage direction cut** ("The interviewer stops writing and
   looks up"), per §20.6's "atmosphere in the cold open beyond what is
   needed to make the problem felt". Attribution kept on the demand line so
   the speaker stays unambiguous.
9. **"make an NFR provable instead of guessed" -> "defensible instead of
   guessed".** Estimation grounds a number, it doesn't prove it - and
   "defend" is this chapter's own load-bearing verb.

**Not fixed, flagged instead** (out of this pass's scope): nothing in the
quiz, hints, or definition metadata was found to need a change, but they
were not audited, so their absence from this list is not a clearance.
