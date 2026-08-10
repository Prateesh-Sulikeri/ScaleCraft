# Chapter spec - 1.8 Engineering Trade-offs

Authored under CURRICULUM.md §5 (chapter blueprint), §6 (mandatory sections),
§20 (author instructions). Deliverable 1 of the 6 in pending-content.md's
"Per-chapter deliverables". Lives beside the lesson so a reviewer can check the
prose against the intent that produced it.

- Chapter definition: `src/content/chapters/index.ts`
  (`bb-1-8-engineering-trade-offs`)
- Lesson body: `public/content/chapters/bb-1-8-engineering-trade-offs.md`
- Manifest row: `src/curriculum/manifest.ts`, slug
  `1-8-engineering-trade-offs` (`chapterDefinitionId` flipped from `null` to
  the id above)

**Wave.** Continues Wave 2, Part 1, directly after 1.7. Same branch topology
as 1.7: authored on `feature/content-1-7-identifying-bottlenecks` (which
already carries 1.1-1.7 as real prerequisite content), not a fresh branch cut
from the bare release line - consistent with every prior Part 0/1 chapter's
own precedent of stacking on one wave branch.

**Type: Process**, same default as 1.1-1.5 and 1.7 (§14's Part 1 header
names the whole part Process; 1.6 was the lone Building Block exception).
§16's audit places 1.8 explicitly in the no-component list alongside
1.1-1.5, 1.7, and 1.9-1.11 - no new call needed here, unlike 1.6/1.7's own
type-reversion notes.

## 0. No open-decision collision this chapter (unlike 1.7)

`pending-chapters.md`'s open decision #7 (the §14 promise of a simulator
trace at 1.6/1.7) does not recur here. §14's 1.8 row promises "trade-off
scenarios x3" - a `Trade-off scenario` exercise per §11.1's own taxonomy,
already natively expressible as `single`/`multi` quiz questions (a learner
reads a scenario, picks the correctly-reasoned option, reads why the others
are wrong). Unlike 1.7's "predict-then-check ... then simulate" row, nothing
here depends on a simulator or stages UI that doesn't exist yet. Realized
directly as quiz Q2/Q4/Q5 (§10 below) - no degradation, no new open note.

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Make trade-off statements ("we chose X, accepting Y, because Z") a reflex: given a design decision, name what it actually spends across five cost dimensions, not just the benefit it buys. |
| Type | Process. |
| Difficulty | foundational |
| Estimated time | 20 minutes (Reader + knowledge check, no build), per CURRICULUM §14's own row and `manifest.ts`. |
| Prerequisites | 1.7 Identifying Bottlenecks. |
| Unlocks | 1.9 Deep Dive Methodology directly (the sentence "we chose X, accepting Y, because Z" is the vocabulary 1.9's own trade-off-flavored deep-dive choices assume); every later Building Block/RWE chapter's Trade-offs sections, which all assume this reflex rather than re-teaching it; the interview loop's step 7 (0.4). |
| Building blocks introduced | None. §16's audit places 1.8 in the no-component list (with 1.1-1.5, 1.7, 1.9-1.11) - the three primitives stay homed at 1.6. |
| Stages trained | Part 1's default (§2: stages 1, 4, 5) - no new stage claimed. |
| Interview relevance | High - loop step 7 (§10.1): trade-offs and alternatives. |
| Production relevance | The question that follows almost every proposed fix in a design review: what does this actually cost, stated specifically enough that someone could disagree with it. |

## 2. Learning objectives (§5.2)

Five objectives (§5.2's range is 3-7); all five categories represented,
**including a real Practical objective** - per 1.1/1.2/1.4/1.5's own
precedent (Process chapters do not get the Concept-only Practical carve-out).
Flagging this explicitly because 1.7's own spec claimed "all five categories
represented" while its actual five objectives (Knowledge, Engineering x2,
Interview, Communication) omit Practical entirely - a real gap in 1.7 worth a
second reader's attention (out of scope to fix here; noted so it isn't
mistaken for this chapter's own precedent).

1. **Knowledge** - State the reflex format "we chose X, accepting Y, because
   Z" and name the five dimensions a design decision can spend: latency,
   consistency, complexity, money, operability.
2. **Engineering** - Given a design decision, walk the five dimensions and
   name which ones it actually spends, not just the benefit it buys.
3. **Interview** - Answer "what did that cost you?" for a proposed fix in
   one sentence, naming the specific dimension spent, inside the interview's
   trade-offs step (0.4 step 7).
4. **Practical** - Given three trade-off scenarios, choose the statement
   that names both what's bought and what's spent, and reject options
   claiming a cost-free choice or naming the wrong dimension - the
   chapter's quiz-realized version of CURRICULUM §14's own "trade-off
   scenarios x3" exercise (see §0 above - no degradation needed).
5. **Communication** - State a decision already made in this chapter out
   loud in the "we chose X, accepting Y, because Z" format, naming a real
   cost on both sides.

Each objective is exercised: 1 by "The reflex" + "The five things a decision
can spend" + quiz Q1; 2 by "Finding what you spent" + quiz Q3; 3 by "In an
interview"; 4 by quiz Q2/Q4/Q5; 5 by "Bigger machine or more of them."

## 3. Per-beat outline (§5.3, Process type per §6)

| Beat | Section in the lesson | Notes |
|---|---|---|
| 1-2 Cold open / why this exists | Untitled opening, 2 short paragraphs | Directly continues 1.7's own "Next" section, which named this exact gap in advance ("knowing what breaks first only tells you what's wrong... naming the cost of that decision out loud is next"). A candidate correctly diagnoses 1.7's bottleneck, proposes 1.7's own fix, and stalls when asked what it costs. |
| 3 Think first | "Think first" callout | Names one cost of "add more app-server instances" before the lesson reveals the full list. Never graded. |
| 4-5 Mental model + visual explanation | "The reflex" | One-sentence anchor (the X/Y/Z template) + primary diagram (Mermaid decision tree: the app-server bottleneck branching into "add instances" vs. "bigger machine", each leaf captioned Buys/Spends). Diagram introduced here, unpacked in full at beat 8. |
| 6 Core mechanics | "The five things a decision can spend" | The five-dimension table (latency, consistency, complexity, money, operability), same format 0.2's five-force table used (dimension / what it measures / what paying it looks like). |
| 7 Internal mechanics | "Finding what you spent" | Applies the five-dimension checklist to the cold open's specific decision (add instances), showing which dimensions are actually spent (money, complexity, operability) and which aren't (latency, consistency) - completes the trade-off statement the cold open left unfinished. |
| 8 Trade-offs | "Bigger machine or more of them" | The diagram's second branch unpacked in full: vertical (bigger machine) vs. horizontal (more instances), genuinely two-sided, no default answer stated - per §11.1's rule against a secretly-correct trade-off option. |
| 9-10 Failure modes + Scaling | Omitted, justified below | No system exists in this chapter to fail or scale - the chapter teaches a communication/reasoning skill applied to decisions whose actual failure/scaling behavior belongs to 1.6/1.7. |
| 11 Production examples | "In production" | Uber's driver-location staleness (a documented, deliberate consistency-for-responsiveness trade-off). Fresh company this wave (not yet used: 1.2 Basecamp, 1.3 Amazon S3, 1.5 Meta, 1.6 Instagram, 1.7 Twitter). |
| 12 Common mistakes | "Common mistakes" | Four: naming the fix not the cost; vague cost language; assuming the cheaper-sounding option is free; picking a winner instead of stating the trade. |
| 13 Interview lens | "In an interview" | High relevance, loop step 7 (0.4). Mandatory §10.3 senior-answer line built from this chapter's and 1.7's own vocabulary (ceiling, instances, operational surface). |
| 14 Connections + Preview of next | "Next" | Backward (>=2, §19): 1.7 (the diagnosed bottleneck and its own fix, reused as this chapter's worked decision), 1.6 (`instances` field), 0.2 (cost as one of five forces, refined here into five sharper dimensions). Forward: mandatory immediate-next preview to 1.9. One further-out tease to 3.22 (§19's "at most one"), directly supported by 3.22 being "the curriculum's consistency home" per CURRICULUM's own text - see §5 below for why this tease matters more than a routine cross-reference. |
| 15 Recap + knowledge check | "Recap" | Four retrieval anchors. QuizLauncher renders the knowledge check automatically. |
| 16 Transition brief | "Your turn" | No CTA into the Editor (`hasEditorExercise: false`) - states the palette is unchanged from 1.6 and names what the knowledge check actually asks, matching 1.1-1.7's precedent for how a no-build chapter's "Your turn" reads. |

## 4. Declared omissions and justifications (§6's written-justification rule)

- **No everyday analogy in the mental-model beat** - same choice
  0.3/0.4/1.1-1.7 made. The X/Y/Z template plus the decision-tree diagram are
  already concrete; a forced metaphor (a shopping receipt, a ledger) would
  add a translation step the diagram doesn't need.
- **Failure modes and Scaling omitted**, same reasoning 1.1-1.5 used for
  their own no-build chapters (optional for Process per §6): no system
  exists in this chapter to fail or scale. Unlike 1.7 (which merged these
  into one section rather than omitting), 1.8's subject is a reasoning
  reflex applied to decisions whose actual failure/scaling behavior already
  belongs to 1.6/1.7 - re-covering it here would restate, not add.
- **Decision tree diagram, not a topology diagram** - consistent with
  `pending-chapters.md`'s open decision #3 (1.6's Mermaid-as-topology
  exception is narrow, not a standing license) and with 1.1's own precedent
  of using a decision-tree Mermaid diagram for a non-topology concept. No
  new §7.2 exception needed; `Decision tree` is explicitly in §7.1's
  inventory for "Selection procedures."

## 5. Simplifications (transcribed to `curriculumContext.simplifications`)

- The five cost dimensions (latency, consistency, complexity, money,
  operability) are a practical working set for stating trade-offs at this
  stage, not an exhaustive or formally-defined taxonomy - same status 0.2
  gave its own five forces, and the same honesty pattern (declared, not
  silently presented as complete).
- **"Consistency" is used here as plain language, not 3.22's formal model.**
  This is the first chapter to use the word "consistency" as named
  vocabulary (0.2/1.1 used "replication lag" and "read replica" informally
  in service of other points, but never named "consistency" as a concept in
  its own right). CURRICULUM §14's own 1.8 row lists "consistency" as one of
  the cost dimensions to introduce, and 3.12's row separately claims
  "replication lag and read-your-writes as the first consistency encounter"
  - a claim about mechanism-level consistency (a specific component lagging)
  that this chapter does not touch. 1.8's usage stays deliberately
  mechanism-free ("does everyone asking right now get the same answer") so
  it does not preempt 3.12's claim to being the first *encounter with the
  mechanism* - this chapter is the first encounter with the *word* only, the
  same shallow-then-deepen pattern 0.2 used for latency/throughput/etc.
  before their own later deep dives. Flagged for a second reader to confirm
  this reads as a clean layering rather than a collision with 3.12's own
  claim.
- The quiz's synchronous/asynchronous write-path example (Q3) is a generic
  illustration, not tied to any specific mechanism this curriculum has
  introduced yet (replication is 3.12's; queues are 3.17's) - deliberately
  mechanism-agnostic for the same reason as the point above.

## 6. Component budget (§16)

No components introduced. `availableComponentIds`/`requiredComponentIds`:
both `[]`, matching 1.1-1.5/1.7's precedent exactly. `blueprints: []`, no
`starterGraph`, `hasEditorExercise: false` - the same no-build mechanism
0.2 built and 1.1-1.7 reused.

## 7. Validation rules (deliverable 4)

None - no canvas exercise, nothing to validate. `validationRuleIds: []`, same
justification 1.1-1.7 and 0.2-0.4 recorded.

## 8. Blueprint and starter graph (deliverable 3, part of it)

None. `blueprints: []`, no `starterGraph` - consistent with
`hasEditorExercise: false` above.

## 9. Hints (deliverable 3, part of it)

None authored. Every prior no-build chapter (0.2-0.4, 1.1-1.5, 1.7) shipped
without hints for the same reason: no picker gesture or Fix exercise for a
hint to orient toward, and the quiz's own per-option `explanationMd` already
carries the directional content a hint would otherwise duplicate. `hints: []`.

## 10. Quiz (deliverable 5)

Five questions, ids permanent, ramp 1/1/2/2/3 (matching 0.2-1.7's
convention). Q2, Q4, Q5 directly realize CURRICULUM §14's "trade-off
scenarios x3" exercise text - each presents a decision and asks the learner
to pick the statement that correctly states the trade (§0 above: no
degradation needed, `single`/`multi` already cover this exercise shape
natively). Q1 tests reflex-recognition (spotting a complete trade-off
statement); Q3 tests applying the five-dimension checklist to a fresh,
mechanism-agnostic scenario via `multi`.

**Q1 · single · 1.** Which of four candidate statements is a COMPLETE
trade-off statement rather than a bare benefit claim. Correct: the one
naming X (more instances), Y (bigger bill, more moving parts), and Z (the
lower ceiling, from 1.7). Distractors: a benefit-only claim (the cold open's
own failure mode); a "simpler is always better" unexamined rule; a bare "it
depends" non-answer (deliberately echoes Foundations bank Q10's own teaching
that unresolved "it depends" is the problem, not the fix).

**Q2 · single · 1.** Trade-off scenario 1: which statement correctly names
the cost of the "more instances" fix for 1.7's bottleneck. Correct: money +
operational surface. Distractors: the free-lunch claim (no downside);
latency misattributed (nothing in the taught material shows added-instance
routing overhead - that mechanism isn't taught until 3.4); a deferred-cost
claim that ignores costs already being paid.

**Q3 · multi · 2.** A write path moves from synchronous to asynchronous
confirmation. Select all dimensions this plausibly spends. Correct:
consistency (a reader may see stale state briefly) and complexity (new
background-failure handling). Distractors: latency (backwards - this change
buys latency, doesn't spend it) and money (no evidence of spend in the
scenario as stated).

**Q4 · single · 2.** Trade-off scenario 2: what the bigger-machine option
spends. Correct: money at a worse rate, plus a ceiling of its own (1.7's
whole point, reapplied to a single large machine). Distractors: the
free-lunch claim again; a nonsensical self-consistency claim (one instance
has nothing to drift from); a backwards operability claim (one thing to
watch is less surface than several, not more).

**Q5 · single · 3.** Trade-off scenario 3, hardest: pairing two teams
(steady-growth vs. uncertain-growth) to the choice each should defensibly
lean toward. Correct: predictable growth favors the bigger machine's
simplicity now; uncertain growth favors instances (fails smaller, more
often, instead of hitting one hard wall). Distractors: "always instances" and
"always bigger machine" (both deny this is a genuine two-sided trade-off);
an inverted pairing (the plausible-but-backwards distractor this question
exists to catch).

**Position-clustering check** (the bug 0.1/0.2 shipped once, standing
instruction). Four single-kind questions (Q1, Q2, Q4, Q5); correct options
sit at `c`, `a`, `d`, `b` - four distinct positions, matching 1.1's own
precedent exactly. Q3 (`multi`) is outside the single-choice invariant test's
scope by definition.

Scope check: every question draws on this chapter's own material plus 1.7
(the bottleneck, the ceiling vocabulary, the specific "add instances" fix
being completed here) and 1.6 (`instances`, the three-component shape). No
question requires anything from 1.9 onward or from 3.x.

## 11. Playtest pass (deliverable 6, §18.2's binding question)

*"Which prior chapter taught each move this exercise requires?"*

| Move | Taught by |
|---|---|
| Recall "add more app-server instances" as 1.7's own fix for its bottleneck | 1.7 itself, directly, reused as this chapter's worked cold-open decision |
| Recognize the client/app-server/database shape and the `instances` config field | 1.6 (both introduced there) |
| State a trade-off with both costs named, not just one | Every chapter since 0.2 has done this at least once; 1.7's "Preempt it or wait for it" is the most recent, same-shape precedent this chapter extends into a named, repeatable format |
| Read a decision-tree diagram | 1.1, the first chapter to use this Mermaid shape (client-vs-server clarifying-question tree) |
| Distinguish a stated cost from a stated benefit | 0.2's five forces (cost was already one of them) and 1.7's own trade-off section, both reused and sharpened here |
| Recognize "consistency" as a plain-language idea (without the formal model) | Nothing prior formally taught this word, which is why §5's simplification note exists - this chapter is the first to name it, deliberately shallow |

No move is unsourced; the one genuinely new vocabulary item ("consistency"
as a named dimension) is flagged rather than silently assumed, per §5 above.

## 12. Items flagged for a second pass

- **Word count (1,234 by `wc -w`, including table/Mermaid syntax overhead).**
  One density pass already run during drafting (tightened "Finding what you
  spent," "Bigger machine or more of them," "In production," and "Next").
  Above 1.1's 1,153 (post-Opus-pass) and within range of 1.5's 1,185-1,226,
  both the same 20-minute estimate. Flagged for a second reader per every
  prior chapter's own precedent of flagging a self-assessed density claim
  rather than trusting it.
- **"Consistency" introduced ahead of 3.12's "first encounter" claim (§5).**
  A deliberate word-vs-mechanism layering, not a contradiction, but new
  enough (first chapter to use the term at all) that a second reader should
  confirm the boundary holds rather than assume the declared simplification
  settles it.
- **1.7's own missing Practical objective (§2).** Not this chapter's bug,
  but noted here so it isn't mistaken for a shared convention - 1.8's
  Practical objective is real and quiz-exercised (Q2/Q4/Q5), following
  1.1/1.2/1.4/1.5's actual precedent rather than 1.7's apparent slip.
- **Uber production example (§3, beat 11).** Deliberately high-level and
  widely documented (driver-location staleness as a UX/consistency trade-off
  choice), not implementation detail. A second reader should confirm this
  doesn't drift into naming a specific technology or mechanism Uber uses
  (out of scope, and not needed for the point being made).
- **3.22 forward tease (§3, beat 14).** Directly supported by CURRICULUM's
  own description of 3.22 as "the curriculum's consistency home" - checked
  against every ledger entry through 1.7: none has already spent a
  further-out tease on 3.22.
