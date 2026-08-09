# Chapter spec - 1.4 Estimating Scale

Authored under CURRICULUM.md §5 (chapter blueprint), §6 (mandatory sections),
§20 (author instructions). Deliverable 1 of the 6 in pending-content.md's
"Per-chapter deliverables". Lives beside the lesson so a reviewer can check the
prose against the intent that produced it.

- Chapter definition: `src/content/chapters/index.ts`
  (`bb-1-4-estimating-scale`)
- Lesson body: `public/content/chapters/bb-1-4-estimating-scale.md`
- Manifest row: `src/curriculum/manifest.ts`, slug `1-4-estimating-scale`

**Wave.** Fourth chapter of Wave 2 (Part 1, per `pending-content.md`). 1.1,
1.2 and 1.3 are authored on this same branch; no wave-gate check needed since
this is a continuation of an in-progress wave, not a new one.

No type contradiction to resolve here, unlike 1.3 - CURRICULUM §4's own
chapter-types table lists "1.4 Estimating Scale" as its worked example of
**Process**, and §14's Part 1 header agrees. Unambiguous.

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Convert a daily volume into QPS, storage, and bandwidth in powers of ten; recognize when the estimate actually changes a design decision and when further precision is theater. |
| Type | Process. |
| Difficulty | foundational |
| Estimated time | 25 minutes (Reader + knowledge check; no build), per CURRICULUM §14's own row. |
| Prerequisites | 1.3 Non-functional Requirements. |
| Unlocks | 1.5 Numbers Every Engineer Should Know directly (memorizes the landmark ratios this chapter derives from scratch); 1.6's first build indirectly (a design's shape has to hold up under the numbers this chapter produces); every RWE project brief, which all open with an estimation step. |
| Building blocks introduced | None. §16 homes the three primitives at 1.6. |
| Stages trained | Part 1's default (§2): stage 1 continuing (the 10^5-seconds-a-day benchmark and QPS/storage/bandwidth vocabulary), stage 4 continuing (deciding which estimated number is worth defending and which isn't is a trade-off judgment), stage 5 continuing (the numbers feed the whole-system assembly Part 1 builds toward). |
| Interview relevance | High - this is loop step 3 (§10.1), the back-of-the-envelope step between requirements and the first architecture. |
| Production relevance | Capacity planning is exactly this skill applied continuously: the same order-of-magnitude discipline that decides whether a design needs to change also decides whether an on-call page needs to happen. |

## 2. Learning objectives (§5.2)

Five objectives, all five §5.2 categories represented (Process chapters do
not get the Concept-only Practical carve-out, same as 1.1/1.2/1.3).

1. **Knowledge** - State the ~10^5-seconds-a-day shortcut and explain why an
   order-of-magnitude answer, not a precise one, is estimation's actual
   deliverable.
2. **Engineering** - Convert a product's daily volume into average QPS, peak
   QPS, storage, and bandwidth, and identify which of those numbers actually
   changes a design decision.
3. **Interview** - State an estimate as a round number with the benchmark
   named, in a couple of minutes, instead of computing a precise figure.
4. **Practical** - Given a product's daily volume, choose the correct
   order-of-magnitude bucket for QPS, storage, and bandwidth, with a stated
   reason - the chapter's quiz-realized version of CURRICULUM §14's own
   exercise (see §5 below).
5. **Communication** - Justify why a peak-load estimate deserves more
   scrutiny than a storage estimate for a specific product, naming the
   threshold each one is or isn't near.

Each objective is exercised: 1 by "The shortcut" + the think-first prompt; 2
by "From requests to QPS" + "Where the precision doesn't matter" + quiz
Q1/Q2; 3 by "In an interview" + Q3; 4 by quiz Q1/Q2 themselves; 5 by "When
precision earns its keep" + Q4/Q5.

## 3. Per-beat outline (§5.3, Process type per §6)

| Beat | Section in the lesson | Notes |
|---|---|---|
| 1-2 Cold open / why this exists | Untitled opening, 7 sentences | Continues 1.1-1.3's URL shortener: 1.3's NFRs are on the board, the interviewer asks for rough traffic, the candidate computes a precise 115.74 QPS by hand, and is asked whether that's a different design than "a hundred." It isn't - the felt cost is time spent on precision that bought nothing. |
| 3 Think first | "Think first" callout | Prediction prompt: round 86,400 to the nearest power of ten without a calculator - the shortcut the rest of the chapter turns into a habit. |
| 4-5 Mental model + visual explanation | "The shortcut" | One-sentence anchor (estimation's job is an order of magnitude, not a decimal) + a Mermaid data-flow diagram (a branching pipeline: requests/day -> average QPS -> peak QPS, and requests/day / average QPS -> storage / bandwidth). Deliberately a new diagram shape - see §12's standing note that a repeated diagram shape with only labels changed is a retread, not reinforcement; 1.1 is a yes/no tree, 1.2 a three-question router, 1.3 a one-hop fan-out, this one a two-branch conversion chain. |
| 6 Core mechanics | "From requests to QPS" | The worked numbers: 10 million redirects/day (creates 1,000x rarer, confirmed as the real number for 1.1's illustrative ratio), divided by ~10^5 s/day to ~100 QPS average; pays off the cold open (115.74 and "call it a hundred" point at the same design); the 2-10x peak multiplier applied to get 500-1,000 peak QPS, the number that would actually change what gets built. |
| 7 Internal mechanics | "Where the precision doesn't matter" | One level down: storage (a year's live records at 1.2's expiry, ~2 GB) and bandwidth (well under a megabyte a second) both come out too small to matter regardless of how sloppy the byte-count guess is - the concrete demonstration of "theater." |
| 8 Trade-offs | "When precision earns its keep" | Names the general rule the worked example just showed: spend real time near a threshold, round and move on when nowhere close. Folds in a brief §9 lens-7 nod (10x/1000x) without a dedicated Scaling section - see §4 below. |
| 9 Failure modes | omitted | Optional for Process (§6). See §4 below. |
| 10 Scaling | omitted as a dedicated section | Optional for Process (§6); its content is folded one sentence into beat 8 instead. See §4 below. |
| 11 Production examples | "In production" | WhatsApp's per-connection capacity measurement, driving a single server to millions of connections before adding more - a public, load-bearing example of the same "measure precisely only where it's worth it" trade-off this chapter teaches, at a scale that pairs with (not repeats) the URL shortener's own modest numbers per §9 lens 9. |
| 12 Common mistakes | "Common mistakes" | Four: over-precision after the order of magnitude already answered the question, skipping the peak multiplier, silently picking a benchmark instead of stating it, and treating "I don't know" as a reason not to estimate. |
| 13 Interview lens | "In an interview" | High relevance. Names the couple-of-minutes budget (extending 1.1's own budgeting line); the mandatory §10.3 senior-answer line quantifies roughly and names which number is worth defending, built only from this chapter's own vocabulary. |
| 14 Connections | merged into "Next" | Backward: 0.4 (loop step 3, named and the whole chapter's organizing frame), 1.1 (the 1000:1 ratio, used substantively in beat 6 *and* named again in "Next"), 1.3 (the NFRs this chapter's numbers have to hold up under, named in the cold open *and* in "Next"). Three named connections, comfortably clears §19's >=2. |
| 15 Recap + knowledge check | "Recap" | Four retrieval anchors; QuizLauncher renders the knowledge check automatically. |
| 16 Transition brief | "Your turn" | States plainly there is no canvas build (components arrive at 1.6), names the quiz's bucket-choice questions as the actual exercise, and states what's withheld: which bucket is correct for each output isn't given away in advance. |
| Preview of next | folded into "Next" | Previews **1.5** (landmark ratios memorized instead of derived). No further-out tease - 1.1 and 0.4 already tease 1.6, and per §19's "at most one" a third would be mechanical, the same judgment call 1.2/1.3 made. |

## 4. Declared omissions and justifications (§6's written-justification rule)

- **Failure modes - omitted**, permitted for Process chapters by §6 ("o").
  Same reasoning 1.1/1.2/1.3 used: there is no system yet to fail, only a
  step in a design conversation.
- **Scaling behavior - no dedicated section, but not silently dropped.**
  §9 lens 7 (what changes at 10x/100x/1000x) is genuinely relevant here -
  arguably more than any prior Part 1 chapter, since this chapter's whole
  subject is scale - but a full section restating the worked example at
  three more multipliers would mostly repeat "When precision earns its
  keep." Folded into that section as one sentence (storage stays trivial at
  10x, both storage and peak QPS cross into new territory at 1000x) instead
  of a separate beat. Optional for Process per §6, so this is a density
  choice, not an omission needing the same justification weight as failure
  modes.
- **No everyday analogy in the mental-model beat**, same choice
  0.3/0.4/1.1/1.2/1.3 made for the same reason: "an order of magnitude, not
  a decimal" is already the clearest available frame; a forced comparison
  would be decorative.

## 5. The exercise: a documented degradation, like 1.1/1.2

CURRICULUM §14's own 1.4 row: "Exercise: staged estimation with
order-of-magnitude buckets (no precision theater; bucket-choice with
explanations)." Explicitly "staged," and the stages UI still doesn't exist
(`pending-content.md`'s standing Part 1 note) - same documented degradation
1.1 and 1.2 used, unlike 1.3's exercise which didn't need one. Realized as
quiz Q1-Q2: two `estimate`-kind (QUIZ_FRAMEWORK §2's own bucket-choice
format) questions on a fresh product (a photo-sharing app), not the lesson's
own URL-shortener numbers, so the check tests transfer rather than recall.
Flagged for a candidate to receive its originally specified staged,
multi-step version once the stages UI lands.

No `availableComponentIds`/`requiredComponentIds` beyond `[]`, no
`starterGraph`, `blueprints: []` - same as every Part 1 chapter so far, for
the same reason (§16 homes the three primitives at 1.6).

## 6. `hasEditorExercise: false` - reused, not re-derived

Same mechanism 0.2's spec fixed and 1.1/1.2/1.3 already reused. No new
engineering work. Completion is the exam pass alone.

## 7. Component budget (§16)

None introduced. `availableComponentIds: []` - no exceptions to declare.

## 8. Validation rules (deliverable 4)

None authored, none needed. `validationRuleIds: []` - there is no graph to
validate.

## 9. Quiz (deliverable 5)

Five questions, ids permanent, ramp 1/1/2/2/3 (matching
0.2/0.3/0.4/1.1/1.2/1.3's convention). Q1-Q2 stand in directly for
CURRICULUM §14's own exercise (§5 above). Q3-Q5 are original.

**Q1 · estimate · 1.** A photo-sharing app, 50M DAU x 4 opens/day = 200M
opens/day; divided by ~10^5 s/day lands at ~2,000 QPS. Four bucket options
spaced two orders of magnitude apart (~20 / ~2,000 / ~200,000 /
~20,000,000), each wrong option's explanation naming a specific
miscalculation (missing the day-to-seconds division, or confusing the daily
total with a per-second rate) rather than a bare "incorrect."

**Q2 · estimate · 1.** Same app, analytics logging: 200M rows/day x 200
bytes x 90 days retention ~= 3.6 TB. Deliberately the chapter's one case
where the order-of-magnitude answer reveals a number that *does* need real
infrastructure, not the lesson's own "theater" conclusion - so the quiz
doesn't over-teach "everything is always trivial." Bucket options span
megabytes to petabytes.

**Q3 · single · 2** (correct at `c`). Applies the peak-multiplier concept to
the same photo app rather than the lesson's own redirect numbers.
Distractors: assuming peak equals average (confuses an average with a
burst), a fixed 100x constant (ignores the product's own usage pattern), and
skipping peak because "only creates spike" (wrong on its face - reads spike
too).

**Q4 · single · 2** (correct at `a`). A teammate over-precises a number that
already crossed its relevant threshold ("a few terabytes"). Tests the
theater concept directly: correctly identifying that *further* precision
past the decision-relevant threshold is the waste, not precision itself.

**Q5 · single · 3** (correct at `d`). Synthesis question: a teammate
over-generalizes from the lesson's own URL-shortener numbers ("estimation
barely mattered since storage/bandwidth were tiny"). Correct answer
distinguishes "mattered for one number" from "didn't matter at all" and
names the general principle (a number's usefulness for estimation tracks
its proximity to a real threshold, not the system's overall size).

**Position-clustering check** (the bug 0.1/0.2 shipped once). Three
single-kind questions (Q3, Q4, Q5); correct options sit at c, a, d - three
distinct positions, checked by eye.

Scope check: every question draws on this chapter's own material plus 0.4
(loop step 3), 1.1 (the 1000:1 ratio), 1.2 (expiry), and 1.3 (NFRs), all
already taught. No question requires anything from 1.5 onward.

## 10. Playtest pass (deliverable 6, §18.2's binding question)

*"Which prior chapter taught each move this exercise requires?"*

| Move | Taught by |
|---|---|
| Divide a daily volume by seconds-in-a-day to get a rate | New in this chapter - the shortcut itself is the material being taught, not assumed |
| Recognize a non-functional requirement as the thing this scale estimate has to satisfy | Directly taught in 1.3; this chapter references it (the cold open, "Your turn") without re-teaching it |
| Recognize the URL shortener's confirmed 1000:1 read:write ratio | Directly taught in 1.1 as an illustrative example; this chapter confirms it as the real number for the running brief, a judgment call flagged in §12 |
| Recognize that creates expire after a year | Directly taught in 1.2's Must-have list; used here to bound the live-record count for the storage estimate |
| Answer an `estimate`-kind quiz question | New kind for this chapter; visually identical to `single` (monospaced labels) per `EstimateChoice.tsx`, so no new interaction pattern to learn, only the bucket-style content |

No move is unsourced.

## 11. Comparison to CURRICULUM §14's own row

1.4's row: "Purpose: users -> QPS -> storage -> bandwidth in powers of ten;
when estimation changes a design decision and when it's theater. Interview:
High: step 3. Exercise: staged estimation with order-of-magnitude buckets
(no precision theater; bucket-choice with explanations). Est: 25." The
shipped chapter matches this row's purpose, interview relevance, and est
directly. The exercise mechanic diverges the same documented way 1.1/1.2's
did (staged UI missing, degraded to quiz bucket-choice) - not a new
divergence to flag, the third time this exact substitution has been made.

## 12. Items flagged for a second pass

Raised by the Sonnet draft for a second reader (Opus audit is out of scope
for quiz/hints/definition metadata per the skill's standing restriction, so
these are flagged for whoever reads this next, not necessarily an Opus
pass):

- **1.1's 1000:1 ratio "confirmed as the real number."** 1.1 used 1000:1
  purely as an illustration of its clarifying-question test, not as a
  stated fact about the running URL-shortener brief. This chapter treats it
  as the brief's actual confirmed ratio - a deliberate continuity choice,
  not an error, but a second reader should confirm this reads as an
  intentional callback rather than an invented fact contradicting 1.1.
- **Diagram-shape novelty (§3, beats 4-5).** The branching conversion-chain
  diagram is asserted here to be genuinely new content, not a relabeled
  retread of 1.1's tree, 1.2's router, or 1.3's fan-out - a second reader
  should confirm this holds, per the standing note 1.2's Opus pass left in
  `pending-chapters.md`.
- **Folded scaling beat (§4).** The 10x/1000x lens-7 sentence inside "When
  precision earns its keep" is a density choice, not a hidden omission - a
  second reader should confirm one sentence is enough rather than this
  needing its own section.
- **Word count.** 1,106 words for a 25-minute estimate, against 1.1's
  1,063 for 20 minutes and 1.3's 1,043 for 20 minutes - proportionately
  fuller for the extra 5 minutes and the chapter's heavier worked-number
  content, not padded (§20.6's own test). No distinct density-revision pass
  was run as a separate step beyond one targeted trim during drafting (a
  restated paragraph in "When precision earns its keep" was cut once
  noticed); flagged here per 0.2/0.3/0.4/1.1/1.2/1.3's own precedent of
  flagging a self-assessed density claim for the next reviewer to check
  rather than trust.

## 13. Opus proofread pass (2026-08-09)

Scope: lesson body, content-structure, blueprints, component lists,
validation rules, diagrams. Quiz, hints and definition metadata
(`problemStatement`/`learningObjectives`/`curriculumContext`) were out of
scope and untouched. `lessonVersion` bumped 1 -> 2.

**Confirmed, left alone:**

- **Every number in the lesson checks out.** 10,000,000 / 86,400 = 115.74;
  10^5 s/day gives ~100 QPS; creates at 1,000x rarer are 10,000/day and
  0.1 QPS (one per ten seconds); 5-10x peak is 500-1,000 QPS; 10,000/day x
  365 = 3.65M records x 500 B = 1.83 GB ("under 2 GB"); 1,000 QPS x ~200 B
  = ~200 KB/s ("well under a megabyte a second").
- **§12's 1000:1 continuity call holds in the shipped text.** 1.1 does more
  than illustrate with it - "At 1000:1, the read path is where the design
  work goes" already applies it to this brief, and 1.2's cold open has the
  interviewer confirming "heavy read skew." Reading it here as the brief's
  real number is a callback, not an invented fact. Kept, including the
  explicit "confirmed here as the real number" clause, which makes the
  promotion visible rather than silent.
- **§12's diagram-novelty claim verified, not assumed.** 1.1 is one yes/no
  branch (`TD`), 1.2 a three-question router to four outcomes (`TD`), 1.3
  five parallel one-hop mappings (`LR`) with no decision node. 1.4 is the
  first with operator-labelled edges (a conversion chain, not a
  classification), and the first that forks one source into two branches of
  different lengths. Genuinely new.
- **`blueprints: []`, `availableComponentIds: []`, `requiredComponentIds:
  []`, `validationRuleIds: []` all correct.** No `starterGraph`, no
  construction-family exercise implied anywhere in lesson or spec, so a
  blueprint would have nothing to pattern-match; §16 homes `client`/
  `app-server`/`sql-database` at 1.6 and the lesson names no component at
  all; no graph exists to validate.
- **Structure complete against §5.3/§6 for Process.** All mandatory beats
  present in order, matching 1.3's shipped heading sequence exactly.
  Failure modes and scaling are Process-optional with §4's written
  justification (the scaling fold is real, not silent - see the change
  below).
- **Vocabulary is sourced (§18.2 rule 1).** "QPS" is defined in 0.4's loop
  table ("users to QPS (queries per second)"); "p99" is defined in 1.3;
  expiry-after-a-year comes from 1.2's cold open. Nothing in this chapter
  leans on untaught vocabulary.
- **"Next" names 1.5**, which `manifest.ts` confirms is the actual next
  chapter, with one forward tease and three backward connections (0.4, 1.3,
  1.1), clearing §19's >=2.
- **No em dash anywhere** in the lesson or this spec (checked by grep, not
  by eye).

**Changed:**

1. **The primary diagram contradicted the prose on two of its four edges.**
   It derived storage as `Requests/day x bytes per record` - but the lesson
   computes storage from *creates* (10,000/day, the write side), multiplied
   by a year's retention, not from the 10M redirects; and it derived
   bandwidth from average QPS while the prose computes it at peak. Redrawn
   as `Requests/day -> Average QPS -> Peak QPS -> Peak bandwidth` plus
   `Requests/day -> Writes/day -> Storage`, with the retention window on
   the edge label where the prose actually applies it. This is the §7.2
   "diagram accurate to the prose around it" rule, and it was the pass's
   material finding.
2. **The caption asserted something false.** "bandwidth flows from the
   steady average, and neither one spikes the way a request rate does" -
   bandwidth is QPS x bytes per response, so it spikes *exactly* the way
   the request rate does, and the lesson's own next section computes
   bandwidth at peak. Replaced with the correct thing to notice: storage is
   the only number that accumulates (it multiplies by a retention window
   instead of dividing into a rate), and a spike lifts bandwidth as surely
   as it lifts QPS.
3. **The §9 lens-7 sentence was hand-wavy and wrong about what changes.**
   "at 1000x, it and peak QPS both cross into territory this chapter's
   shortcuts stop covering" - the shortcut does not stop working at 1000x;
   the *answers* stop being trivial. Lens 7 explicitly requires specific,
   never hand-wavy. Now: ~20 GB at 10x, a couple of terabytes and near a
   million peak QPS at 1000x, and the peak (not the storage) is the one
   that stops fitting on a single machine. Confirms §4's fold: one sentence
   is enough here now that it carries real numbers.
4. **"Your turn" promised a knowledge check the quiz doesn't contain.** It
   said the check asks for buckets for "QPS, storage, and bandwidth in
   turn"; Q1 is QPS and Q2 is storage, and there is no bandwidth question.
   Rewritten to promise exactly two. The quiz itself was out of scope and
   untouched - the lesson was the side that was wrong.
5. **"Two defensible instincts, and the numbers above show when each
   applies."** cut - a transitional sentence carrying no information, one
   of §20.6's cut-on-sight cases. The trade-off section now opens on the
   rule itself.
6. **WhatsApp's figure made concrete.** "millions of concurrent
   connections" -> "past two million", the actual published number, which
   also fits §20.1's concrete-before-abstract rule better than a vague
   plural.
7. **"the answer is still 'a couple of gigabytes'"** -> "still gigabytes,
   not terabytes". Halving 500 B gives ~0.9 GB, which is not "a couple";
   the threshold framing is both true and more on-message for this chapter.
8. **10,000 creates/day now stated explicitly** in core mechanics. The
   storage estimate's 3.65M records silently assumed the reader had done
   10M / 1,000 themselves - a gap in a chapter whose whole subject is
   showing the arithmetic, and now also the diagram's `Writes/day` node.
9. **Mental-model sentence realigned** with the corrected diagram: "that
   rate becomes the storage and bandwidth numbers" was wrong once storage
   comes from daily volume rather than from the rate. Now "volume and rate
   together become...". Plus "the cold open opened with" -> "started with".

**Lesson length after the pass: 1,136 words** (1,106 before, same `wc -w`).
Up slightly: the pass added a diagram node, an explicit creates/day figure,
and three real numbers to the scaling sentence, against one cut transitional
sentence. §12's density claim holds - nothing found was padding.

**New standing note for later chapters:** when a chapter's beat-5 diagram
encodes a formula, check every edge label against the arithmetic the prose
actually performs, not against the concept the diagram is illustrating. Both
diagram defects here were plausible-looking simplifications ("storage comes
from traffic", "bandwidth comes from the average rate") that the lesson's own
worked numbers contradicted six lines later. Chapters 1.5 and 1.7 onward are
formula-heavy and will hit the same trap.
