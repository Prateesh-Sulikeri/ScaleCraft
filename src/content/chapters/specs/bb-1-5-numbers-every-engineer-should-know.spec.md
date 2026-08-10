# Chapter spec - 1.5 Numbers Every Engineer Should Know

Authored under CURRICULUM.md §5 (chapter blueprint), §6 (mandatory sections),
§20 (author instructions). Deliverable 1 of the 6 in pending-content.md's
"Per-chapter deliverables". Lives beside the lesson so a reviewer can check the
prose against the intent that produced it.

- Chapter definition: `src/content/chapters/index.ts`
  (`bb-1-5-numbers-every-engineer-should-know`)
- Lesson body: `public/content/chapters/bb-1-5-numbers-every-engineer-should-know.md`
- Manifest row: `src/curriculum/manifest.ts`, slug
  `1-5-numbers-every-engineer-should-know` (`chapterDefinitionId` flipped from
  `null` to the id above)

**Wave.** Fifth chapter of Wave 2 (Part 1, per `pending-content.md`). 1.1-1.4
are authored on this same branch; no wave-gate check needed since this is a
continuation of an in-progress wave, not a new one.

No type contradiction to resolve here - CURRICULUM §14's Part 1 header states
the whole part (1.1-1.11) is Process type with no per-chapter exception named
for 1.5, and §4's chapter-types table names no example that touches 1.5
either way, so there's no conflict like 1.3's to resolve.

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Internalize the latency/throughput landmark numbers and, more importantly, their ratios (RAM vs. SSD vs. disk; a same-datacenter round trip vs. cross-continent) - memorized instead of derived. |
| Type | Process. |
| Difficulty | foundational |
| Estimated time | 20 minutes (Reader + knowledge check; no build), per CURRICULUM §14's own row. |
| Prerequisites | 1.4 Estimating Scale. |
| Unlocks | 1.6's first build directly (client, app server, and database are three machines with real hops between them); every RWE project's estimation and deep-dive steps, which lean on these ratios to justify a cache or a nearby copy without re-deriving the physics each time. |
| Building blocks introduced | None. §16 homes the three primitives at 1.6. |
| Stages trained | Part 1's default (§2): stage 1 continuing (landmark-number vocabulary joins the ~10^5-seconds-a-day shortcut), stage 4 continuing (deciding whether a rung's cost is worth paying for is a trade-off judgment), stage 5 continuing (the ratios feed the whole-system assembly Part 1 builds toward). |
| Interview relevance | High - this is loop step 3 (§10.1), the other half of 1.4's estimation step: numbers worth having memorized rather than derived live. |
| Production relevance | Every capacity or caching decision an engineer makes on the job rests on knowing, without looking it up, which operations are cheap and which are expensive. |

## 2. Learning objectives (§5.2)

Five objectives, all five §5.2 categories represented (Process chapters do
not get the Concept-only Practical carve-out, same as 1.1-1.4).

1. **Knowledge** - State the five-rung latency ladder (RAM, SSD,
   same-datacenter network, disk seek, cross-continent network) in the
   correct relative order without deriving it from scratch.
2. **Engineering** - Decide whether a design's dominant latency cost is a
   compute problem or a data-locality problem, by naming which rung of the
   ladder a given operation sits on.
3. **Interview** - Quantify a cache's or a nearby copy's benefit as a rough
   order-of-magnitude number, using the ladder, instead of a bare "it's
   faster."
4. **Practical** - Given a short list of operations, rank them fastest to
   slowest using the ladder's ratios, and estimate the order-of-magnitude
   latency of a request built from a stated combination of them - the
   chapter's quiz-realized version of CURRICULUM §14's own exercise (see §5
   below).
5. **Communication** - Explain in one sentence why a same-datacenter network
   round trip can beat a local disk seek, naming the physical reason.

Each objective is exercised: 1 by "The ladder" + the think-first prompt +
quiz Q1; 2 by "Each rung, in practice" + "When closing a gap is worth it";
3 by "In an interview" + Q3/Q4; 4 by quiz Q1/Q2 themselves; 5 by the diagram
caption + Q3.

## 3. Per-beat outline (§5.3, Process type per §6)

| Beat | Section in the lesson | Notes |
|---|---|---|
| 1-2 Cold open / why this exists | Untitled opening, 9 sentences | Continues 1.4's frame: 1.4 taught a shortcut for deriving a number on the spot; this chapter is about numbers not worth deriving at all. An interviewer asks how much latency a proposed cache buys; the candidate can't say whether it's 2x or 200x faster, and the hesitation itself costs credibility. Second paragraph states why this exists: the ratios aren't intuitive and engineers guess them backwards in a specific, nameable direction. |
| 3 Think first | "Think first" callout | Prediction prompt: which is faster, a local disk seek or a same-datacenter network round trip? Deliberately the chapter's central surprise, asked before any answer appears. |
| 4-5 Mental model + visual explanation | "The ladder" | Two-sentence anchor that defines the ladder and the word "rung" at first use (fastest at the top, each step down costing roughly 10-100x the rung above, one pair out of the expected order) + a top-down Mermaid ladder diagram, five rungs in descending speed with ratio-labelled edges. New diagram shape per the standing note in `pending-chapters.md` (1.2's Opus pass): 1.1 is a yes/no tree, 1.2 a three-question router, 1.3 a one-hop fan-out, 1.4 a branching conversion chain with two forks of different length; this one is a single linear top-down chain with no branching and no arithmetic operators on its edges, only ratio factors. Caption states the chapter's one surprise directly: the same-datacenter hop sits above (faster than) the disk seek. |
| 6 Core mechanics | "Each rung, in practice" | A table pairing each rung with a concrete worked example (a cache hit, an uncached database row, a call to a nearby service, a traditional spinning-disk database, a cross-region call) - deliberately different content from the diagram (which carries the shape and the ratio jump), per the standing note 1.3's Opus pass left about not stating the same mapping twice (see §4 below). |
| 7 Internal mechanics | Two paragraphs following the table | One level down: RAM is electrical, an SSD's flash cells cost more to read than a memory circuit but have no moving parts, a same-datacenter hop pays queuing/OS overhead on top of a short wire, a disk seek moves a physical arm (the mechanical delay that makes it lose to the network hop above it), and a cross-continent hop is bounded by real distance no code shortens. |
| 8 Trade-offs | "When closing a gap is worth it" | Names the trade-off directly: a cache (0.2) buys back the RAM-vs-SSD/disk gap at the cost of staleness; a nearby copy buys back the cross-continent gap at the cost of keeping copies in sync. Folds in a brief §9 lens-7 nod (these ratios are constant; what scales is how often you pay them, tying back to 1.4's peak-QPS number) without a dedicated Scaling section - see §4 below. |
| 9 Failure modes | omitted | Optional for Process (§6). See §4 below. |
| 10 Scaling | omitted as a dedicated section | Optional for Process (§6); folded one sentence into beat 8 instead, same pattern 1.4 used. See §4 below. |
| 11 Production examples | "In production" | Meta (among other large-scale services) putting an ordinary-memory cache layer between the app tier and the database specifically because a network hop to that layer beats the database's own disk seek - the chapter's opening fact, at production scale, paired with the honest cost (keeping the cache correct is a real mechanism, not free). |
| 12 Common mistakes | "Common mistakes" | Four: reciting a raw figure without its ratio, assuming network always loses to local disk, re-measuring before checking whether the ladder's rough answer is even near a threshold, and treating one hop's cost as the whole cost of a multi-hop request. |
| 13 Interview lens | "In an interview" | High relevance. Names this as loop step 3's other half (1.4 derives, this chapter memorizes); the mandatory §10.3 senior-answer line quantifies roughly, names a trade-off, and asks a natural follow-up (write pattern), built only from this chapter's own vocabulary. |
| 14 Connections | merged into "Next" | Backward: 1.4 (the shortcut-vs-memorize framing, the whole chapter's organizing idea), 0.2 (the cache force these ratios explain physically, used substantively in beat 8 *and* named again in "Next"), 1.3 (latency budgets these ratios have to fit inside, named in "Next"). Three named connections, comfortably clears §19's >=2. |
| 15 Recap + knowledge check | "Recap" | Four retrieval anchors; QuizLauncher renders the knowledge check automatically. |
| 16 Transition brief | "Your turn" | States plainly there is no canvas build (components arrive at 1.6), names the quiz's ranking + estimate questions as the actual exercise, and states what's withheld: neither the ranking nor the bucket answer is given away in advance. |
| Preview of next | folded into "Next" | Previews **1.6** (first build: client, app server, and database are three machines with real hops between them). No further-out tease - 1.1, 0.4, and 1.4 have all already teased 1.6, and per §19's "at most one" a fourth would be mechanical. |

## 4. Declared omissions and justifications (§6's written-justification rule)

- **Failure modes - omitted**, permitted for Process chapters by §6 ("o").
  Same reasoning 1.1-1.4 used: there is no system yet to fail, only a
  physical-latency fact being taught.
- **Scaling behavior - no dedicated section, but not silently dropped.**
  Folded into "When closing a gap is worth it" as one sentence: the
  ratios are physical constants that don't shift with traffic, but the
  number of times they're paid does, and that number is exactly 1.4's own
  peak-QPS estimate. A dedicated section would have mostly restated that one
  connection at greater length. Optional for Process per §6, so this is a
  density choice, matching 1.4's own precedent for the same fold.
- **No everyday analogy in the mental-model beat.** Considered (reaching
  into a pocket vs. walking to a warehouse) and cut: the ladder diagram's own
  ascending order, plus its one surprising swap, is already the clearest
  available frame, and a physical-distance analogy would have needed its own
  caveat about the swap (a "closer" warehouse-adjacent step beating a
  "farther" hallway one) that cost more words than it earned. Same judgment
  call 0.3/0.4/1.1-1.4 made, for the same reason.

## 5. The exercise: not a degradation, like 1.3

CURRICULUM §14's own 1.5 row: "Exercise: ranking + estimation drills." Unlike
1.1/1.2/1.4's rows, this one is never described as "staged" - the same
distinction 1.3's spec drew for its own matching exercise. Realized directly
as quiz Q1 (`ordering`: rank five operations fastest to slowest) and Q2
(`estimate`: the order-of-magnitude latency of a two-operation request) - no
stages-UI gap to flag, the exercise as specified is achievable as authored.

No `availableComponentIds`/`requiredComponentIds` beyond `[]`, no
`starterGraph`, `blueprints: []` - same as every Part 1 chapter so far, for
the same reason (§16 homes the three primitives at 1.6).

## 6. `hasEditorExercise: false` - reused, not re-derived

Same mechanism 0.2's spec fixed and 1.1-1.4 already reused. No new
engineering work. Completion is the exam pass alone.

## 7. Component budget (§16)

None introduced. `availableComponentIds: []` - no exceptions to declare.

## 8. Validation rules (deliverable 4)

None authored, none needed. `validationRuleIds: []` - there is no graph to
validate.

## 9. Quiz (deliverable 5)

Five questions, ids permanent, ramp 1/1/2/2/3 (matching 0.2-1.4's
convention). Q1-Q2 realize CURRICULUM §14's own exercise directly (§5
above), modeled on QUIZ_FRAMEWORK §6's Q5 (SSD vs. RAM ratio) and Q6
(cross-continent vs. same-datacenter round trip) without reusing their
wording - those two bank questions are the framework's own pre-existing
canonical content for this chapter, and this chapter's lesson body teaches
ratios consistent with them (10-100x and 150-300x respectively) rather than
inventing a conflicting figure.

**Q1 · ordering · 1.** Rank RAM reference, SSD read, same-datacenter network
round trip, disk seek, and cross-continent network round trip fastest to
slowest. The one non-obvious placement (disk seek behind the
same-datacenter hop, not ahead of it) is the chapter's central point,
directly tested here. Options array authored as a full derangement against
`correctOrder` (`Ordering.tsx` shows the authored order with no shuffle).

**Q2 · estimate · 1.** A request making one RAM lookup and one
same-datacenter network round trip - order of magnitude for the total.
Correct answer (~1 ms) is dominated by the network hop; the RAM lookup is
negligible by comparison. Four buckets spaced by orders of magnitude, each
wrong option's explanation naming what it would imply (skipping the network
hop, or accounting for several hops instead of one).

**Q3 · single · 2** (correct at `c`). An engineer assumes local disk always
beats the network and skips a nearby cache. Distractors: the naive claim
taken at face value, a compute-focused non-answer (faster CPU), and a
payload-focused non-answer (compression) - neither touches the seek/round-
trip comparison actually at issue.

**Q4 · single · 2** (correct at `a`). Modeled on QUIZ_FRAMEWORK §6's own Q6:
which change addresses a cross-continent call's ~150 ms. Distractors: more
compute, more compression, and a retry - none reduce a physical-distance
floor, only the correct answer (move the data or the server closer) does.

**Q5 · single · 3** (correct at `d`). Synthesis question tying this
chapter's landmark ratios back to 1.4's own precision-theater rule
explicitly, reinforcing that both chapters teach the same judgment (order of
magnitude first, precision only where it earns its keep) applied to two
different kinds of numbers.

**Position-clustering check** (the bug 0.1/0.2 shipped once). Three
single-kind questions (Q3, Q4, Q5); correct options sit at c, a, d - three
distinct positions, checked by eye.

Scope check: every question draws on this chapter's own material plus 0.2
(the cache force) and 1.4 (the precision-theater rule), both already taught.
No question requires anything from 1.6 onward.

## 10. Playtest pass (deliverable 6, §18.2's binding question)

*"Which prior chapter taught each move this exercise requires?"*

| Move | Taught by |
|---|---|
| Recognize that a cache buys back a latency gap at the cost of staleness | Directly taught in 0.2 (the cache force); this chapter supplies the physical ratio that makes the trade concrete |
| Recognize a non-functional latency budget as the thing these ratios have to fit inside | Directly taught in 1.3; referenced in "Your turn" and "Next" without re-teaching it |
| Recognize the difference between a number worth deriving and a number worth memorizing, and the "precision earns its keep" rule | Directly taught in 1.4 (the ~10^5-seconds shortcut and its own precision rule); this chapter applies the identical rule to a different kind of number (quiz Q5 tests this explicitly) |
| Rank five operations by latency using a ladder | New in this chapter - the ladder itself is the material being taught, not assumed |
| Answer an `ordering`-kind quiz question | Already used in 0.4 (`bb-0-4-the-system-design-lifecycle-q3`); same interaction pattern, no new UI to learn |
| Answer an `estimate`-kind quiz question | Already used in 1.4 (Q1/Q2); same interaction pattern (visually identical to `single`), no new UI to learn |

No move is unsourced.

## 11. Comparison to CURRICULUM §14's own row

1.5's row: "Purpose: internalize the latency/throughput/storage landmark
numbers and, more importantly, their *ratios* (RAM vs. disk vs. network; a
datacenter round trip vs. cross-continent). Interview: High: step 3.
Exercise: ranking + estimation drills. Est: 20." The shipped chapter matches
this row's purpose, interview relevance, and est directly. Unlike §14's row,
the shipped chapter narrows "throughput/storage" out of its own landmark
numbers - 1.4 already owns the QPS/storage/bandwidth material, and a
landmark-number chapter re-deriving throughput or storage figures would
restate 1.4 rather than add to it. The row's own phrase ("more importantly,
their ratios") supports this: the ratios, not a fresh set of throughput
figures, are the chapter's actual content. Flagged in §12 below for a
second reader to confirm this narrowing reads as a defensible interpretation
of the row rather than a silent scope cut.

## 12. Items flagged for a second pass

Raised by the Sonnet draft for a second reader (Opus audit is out of scope
for quiz/hints/definition metadata per the skill's standing restriction, so
these are flagged for whoever reads this next, not necessarily an Opus
pass):

- **§14's "throughput/storage landmark numbers" narrowed to latency-only
  ratios (§11 above).** A second reader should confirm this narrowing is
  right rather than a scope gap - 1.4 already teaches throughput and storage
  order-of-magnitude estimation, and this chapter's own explicit "more
  importantly, their ratios" clause points at RAM/disk/network specifically.
- **Diagram-shape novelty (§3, beats 4-5).** The single ascending ladder
  chain is asserted here to be genuinely new content, not a relabeled
  retread of 1.1's tree, 1.2's router, 1.3's fan-out, or 1.4's branching
  conversion chain - a second reader should confirm this holds, per the
  standing note 1.2's Opus pass left in `pending-chapters.md`.
- **Diagram/table content split (§3, beat 6).** The diagram carries the
  ladder's shape and ratio jumps; the table carries concrete worked examples
  per rung. A second reader should confirm these genuinely don't restate the
  same mapping twice, per the standing note 1.3's Opus pass left about this
  exact collision.
- **Folded scaling beat (§4).** The lens-7 sentence inside "When the ratio
  is worth paying for" is a density choice, not a hidden omission - a second
  reader should confirm one sentence is enough, same as 1.4's own fold.
- **Word count.** 1,185 words for a 20-minute estimate, above 1.1's 1,063
  and 1.3's 1,043 for the same estimate, and closer to 1.4's 1,106 for 25
  minutes. The extra length is a second visual element (a diagram *and* a
  worked-example table, where 1.1-1.4 each carried only one), not
  restatement - a second reader should confirm this reads as proportionate
  rather than as an unflagged density lapse, per 0.2-1.4's own precedent of
  flagging a self-assessed density claim rather than trusting it.
- **QUIZ_FRAMEWORK §6 Q5's own stated ratio ("SSD ~10-100x slower [sequential
  1MB]") vs. the lesson's RAM-to-SSD figure.** The lesson states RAM-to-SSD
  as "10-100x" without specifying random vs. sequential access, deliberately
  matching Q5's own already-shipped ratio rather than a different, more
  commonly cited figure (a random 4K SSD read is closer to ~1,000x a RAM
  reference in some published latency tables). This chapter treats
  QUIZ_FRAMEWORK's existing, shipped ratio as authoritative rather than
  introducing a conflicting one - flagged for a second reader to confirm
  this deference is the right call rather than a chapter quietly inheriting
  an imprecise bank figure.

## 13. Opus proofread pass (2026-08-09)

Scope: lesson body, content-structure, blueprints, component lists,
validation rules, diagrams. Quiz, hints and definition metadata
(`problemStatement`/`learningObjectives`/`curriculumContext`) were out of
scope and untouched. `lessonVersion` bumped 1 -> 2. Pass requested off
specific user feedback: the chapter reads well overall, but "rung" is never
defined, and several sentences take more than one read.

**Changed:**

1. **"rung" was never defined, and the ladder had no fixed orientation.**
   The word first appeared in a section heading ("What's actually at each
   rung") with no gloss anywhere. Worse, "above" meant two opposite things:
   the caption's "the same-datacenter network hop sits above (faster than)
   the disk seek" (above = faster) versus the trade-off section's "Every
   rung above RAM exists because..." (above = slower, since RAM is the
   fastest). The ladder now has one stated orientation and the term is
   defined at first use, per §20.1:
   *before* "Every step away from the CPU costs roughly one to two more
   orders of magnitude of time - and one of those steps is out of order,
   which is the fact worth memorizing hardest."
   *after* "Line the five operations up as a ladder, fastest at the top:
   each rung is one kind of operation, and each step down costs roughly 10
   to 100 times the rung above it. Memorize it, because one pair of rungs
   sits in the opposite order to the one most engineers expect."
   Every later use of "rung"/"above" was reworded to match that one
   orientation, and the trade-off section's opener ("Every rung above RAM
   exists because something has to be true for the design to earn it" - the
   vaguest sentence in the chapter as well as the wrong direction) became
   "You can always climb back up a rung, and it always costs something."
2. **Heading renamed.** "What's actually at each rung" -> "Each rung, in
   practice". The user flagged this heading specifically; "what's actually
   at" was vague independent of the word "rung".
3. **The diagram is now top-down, not left-to-right.** A ladder whose prose
   says "fastest at the top" cannot render as `flowchart LR`. Flipped to
   `flowchart TD`, which also makes the metaphor literal. Still a single
   linear chain with no branching and no arithmetic operators, so §12's
   diagram-novelty claim is unaffected.
4. **The ratio chain did not compose.** This is 1.4's own standing note
   (check every edge label against the arithmetic the prose performs) hitting
   again. RAM ~100 ns, then "10-100x" to SSD, then "~10x" to a 0.5-1 ms
   same-datacenter round trip gives at most 100 us, not 0.5-1 ms - off by
   5-10x. Separately, the SSD node read "~10s of microseconds", which is
   200-900x a 100 ns reference, contradicting the same diagram's own
   "10-100x" edge one node earlier (and parses for a beat as "ten seconds").
   Resolved without disturbing §12's deliberate deference to QUIZ_FRAMEWORK
   §6 Q5: the 10-100x RAM->SSD ratio is kept exactly as shipped, the SSD node
   becomes "~10 microseconds" (100x of 100 ns, the top of that stated band,
   and a defensible modern NVMe random-read landmark), and the SSD ->
   same-datacenter edge becomes "~50x" (10 us x 50 = 500 us). The chain now
   composes end to end: 100 ns -> 10 us -> 0.5-1 ms -> 10 ms -> 150 ms, with
   every edge label true of the two nodes it joins. Table row 3 updated to
   match ("~10x an SSD read" -> "~50x an SSD read"). No quiz question asserts
   the SSD -> datacenter ratio, so nothing in the quiz conflicts.
5. **"RAM is electrical - a few nanoseconds" contradicted the table's
   ~100 ns** two lines above it. Rewritten as part of the physics rework
   below.
6. **The physics paragraph was five sentences (§20.1 caps at four) and
   buried the swap's cause.** Split into two paragraphs organized by the
   actual physics - the electrical rungs, then the physical ones - so the
   disk-seek-loses-to-the-network fact falls out of the structure instead of
   being asserted:
   *after* "RAM and SSD are both electrical, with no moving parts; RAM wins
   because... / The bottom two rungs are physical. A disk seek moves an arm
   across a spinning platter, and that mechanical delay is why a hop to the
   machine next door usually beats reading your own disk."
7. **Multi-clause sentences split.** The ones that genuinely cost a re-read
   on a cold read:
   - Cold open: "The candidate hesitates - faster, sure, but 2x faster or
     200x faster changes whether the cache is worth building at all"
     (compound subject with a singular verb, and an unmarked shift into the
     candidate's head) -> "The candidate hesitates. Faster, certainly - but
     2x faster and 200x faster are different answers, and only one of them
     justifies building the cache."
   - Cold open: "it skips a layer that would have actually been faster"
     (which layer?) -> "it means skipping a cache layer that would have been
     faster than the disk you kept reading from."
   - Cold open: "These ratios are not intuitive" had no antecedent - no
     ratios had been named yet. Now "The gaps between one operation and the
     next".
   - "In production": one 45-word sentence carrying who, why, and the
     callback at once, split into three shorter ones across two paragraphs
     (§13's who / why / trade-off format).
   - Trade-offs: the ratios-don't-shift sentence split off into its own
     paragraph, so the "what grows is how often you pay them" -> peak-QPS
     hand-off is one idea per sentence.
   - "In an interview": "deriving them live costs the same trust as guessing
     wrong" -> "working them out live reads to an interviewer much the same
     as not knowing them."
   - "Your turn": "then a request built from a stated combination of them to
     estimate the rough total latency of" (stranded preposition, 20-word
     object) -> "then describes a request built from two of them and asks for
     its rough total latency." Also "the bucket answer" -> "the latency
     estimate": "bucket" is 1.4's vocabulary for its own estimate options and
     arrives cold here.
   - "Next": "ratios worth skipping that step for entirely" and "cash out
     against the ladder above" both rewritten in plain terms.
   - Recap bullet 1's "except one pair that swaps" (swaps with what?)
     replaced by the ladder's own ratio statement; the swap already has its
     own recap bullet directly below it.
8. **Common mistakes bullet 1 contradicted itself** - bold text said "the
   rung before it", the explanation said "the next rung". Now one direction
   ("the rung next to it" / "the gap between rungs"). Bullet 3's
   "Re-measuring" -> "Measuring" (nothing has been measured yet).

**Confirmed, left alone:**

- **`blueprints: []`, `availableComponentIds: []`, `requiredComponentIds:
  []`, `validationRuleIds: []` all correct.** `hasEditorExercise: false`, no
  `starterGraph`, and the lesson names no component and implies no
  construction-family exercise, so a blueprint would have nothing to
  pattern-match and no graph exists to validate. §16 homes
  `client`/`app-server`/`sql-database` at 1.6; "Your turn" says so out loud.
  No undeclared exception anywhere.
- **Structure complete against §5.3/§6 for Process.** All mandatory beats
  present in §5.3 order after the edits (the two renamed headings did not
  move). Failure modes and Scaling are Process-optional with §4's written
  justification, and the scaling fold is real, not silent.
- **§12's diagram/table-collision flag holds.** The diagram carries the
  shape and the ratio jumps; the table carries one concrete example per rung
  plus the ratio to the rung above. They overlap on the ratios only, which
  is the point of the table's middle column - the examples column has no
  counterpart in the diagram. No 1.3-style restatement.
- **§12's §14-narrowing flag (throughput/storage dropped) reads as
  defensible**, not a scope cut: 1.4 already owns throughput and storage
  estimation, and re-deriving either here would restate it. Left as
  narrowed.
- **§12's word-count flag.** 1,185 -> 1,226 words (+41), the same direction
  and roughly the same size as 1.4's own Opus pass (1,106 -> 1,136). The
  growth is the "rung" definition, the caption's orientation gloss, and the
  paragraph splits; six sentences were cut or compressed to pay for part of
  it. Still above 1.1/1.3's ~1,050 for the same 20-minute estimate, and still
  attributable to the second visual element rather than restatement.
- **"Next" names 1.6**, which `manifest.ts` confirms is the actual next
  chapter (`1-6-drawing-the-first-architecture`), with one forward tease and
  three backward connections (1.4, 0.2, 1.3), clearing §19's >=2.
- **Vocabulary is sourced (§18.2 rule 1).** "cache" and "staleness" come
  from 0.2 (staleness is also re-glossed inline here), "peak QPS" from 1.4,
  "loop step 3" from 0.4, "latency budget" from 1.3. "app tier" was the one
  unsourced term and was replaced with "their application servers", which is
  plain English rather than a component introduction ahead of 1.6.
- **No em dash anywhere** in the lesson or this spec (checked by grep).
- **The senior-answer line in "In an interview"** was left verbatim: it
  quantifies, names a trade-off, and asks a real follow-up, all in this
  chapter's own vocabulary. It was the clearest paragraph in the draft.

**Out of scope, noted not fixed** (quiz / hints / definition metadata):

- Quiz Q1's RAM explanation says a RAM reference is "electrical, a few
  nanoseconds" - the same ~100 ns contradiction fixed in the lesson body
  (change 5 above). Worth a one-word fix by whoever owns the quiz.
- Q1's option explanations use "rung" and "the ladder" as given vocabulary.
  That is now safe because the lesson defines both, but the dependency is
  real and would break if the metaphor were ever dropped.
- Q1's cross-continent explanation carries "the cables a signal has to
  cross" and "no code shortens that floor", phrasing the lesson body kept
  only the second half of. Not a defect, just no longer a verbatim echo.

**New standing note for later chapters:** a metaphor word that becomes the
chapter's organizing vocabulary ("rung", and any future "tier", "layer",
"hop", "budget") needs two things at first use, not one - a gloss saying what
it means, and a fixed orientation if the metaphor has a direction. This
chapter had neither, and the missing orientation let "above" mean faster in
one section and slower in another without anyone noticing at draft time. The
gloss is a §20.1 requirement already; the orientation check is the new part.
