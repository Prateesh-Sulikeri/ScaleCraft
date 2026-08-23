# Chapter spec - 3.12 Replication

Authored under CURRICULUM.md §5 (chapter blueprint), §6 (mandatory sections),
§20 (author instructions). Deliverable 1 of the 6 in pending-content.md's
"Per-chapter deliverables". Lives beside the lesson so a reviewer can check the
prose against the intent that produced it.

- Chapter definition: `src/content/chapters/index.ts` (`bb-3-12-replication`)
- Lesson body: `public/content/chapters/bb-3-12-replication.mdx`
- Manifest row: `src/curriculum/manifest.ts`, slug `3-12-replication`
  (`chapterDefinitionId` flipped from `null` to the id above)

**Wave.** Third Group C chapter, authored immediately after 3.11 in this same
working tree. Same out-of-wave-plan note every Wave 3/4 chapter's own spec has
carried forward: the real prerequisite (3.11) is already authored, so no
sequencing rule (§18.2) is violated - only `pending-content.md`'s wave
grouping is out of order relative to actual authoring order.

## 0. Type classification

Building Block, per §4/§16 - CURRICULUM's own row states "New: `read-replica`;
edge kind `replication`" and §16's own audit table lists "3.12 | `read-replica`
+ edge `replication`". Same consequence 3.11's own spec named: Failure modes
and Scaling considerations are **M** (mandatory), not **o** - both appear as
full sections here.

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Copies for reads and for safety; primary/replica roles; replication lag and read-your-writes as the first consistency encounter, per CURRICULUM's own row. |
| Type | Building Block (see §0 above). |
| Difficulty | intermediate - matches `manifest.ts`'s existing `difficulty: "intermediate"` and CURRICULUM §14's Group C heading. |
| Estimated time | 30 minutes (Reader + Editor combined), per CURRICULUM §14's own row and `manifest.ts`'s existing `estimatedMinutes: 30`. |
| Prerequisites | 3.11 SQL vs. NoSQL - the real curriculum-order prerequisite, already shipped in this same working tree. `manifest.ts`'s `prerequisiteSlugs` already pointed at `3-11-sql-vs-nosql` before this chapter was authored - no pulled-forward exception needed. |
| Unlocks | 3.13 Sharding (this chapter's own forward tease and the immediate next chapter, per `manifest.ts` row order). |
| Building blocks introduced | `read-replica` (config field `replicationLagBudgetMs`) + edge kind `replication`. |
| Stages trained | Part 3's default (stages 2-4) plus a real construction stage - a combined Fix/Build: correct one illegal edge, then wire the two correct ones. |
| Interview relevance | High, per §14's own note - steps 5 (deep dive) and 6 (bottlenecks and failure). |
| Production relevance | Any product whose read volume has outgrown one machine - GitHub's MySQL read-replica split is the in-lesson example. |

## 2. Learning objectives (§5.2)

Six objectives (§5.2's allowed range is 3-7). All five categories present,
matching 3.11's own Building Block reasoning (Practical is not exempted here).

1. **Knowledge** - Explain what a Read Replica is and the one-way replication
   stream that keeps it current.
2. **Knowledge** - Explain replication lag and why it's the mechanism behind
   read-your-writes, the first consistency guarantee this curriculum makes
   non-free.
3. **Engineering** - Choose synchronous or asynchronous replication for a
   given workload and name the real cost of each.
4. **Practical** - Wire a Read Replica to receive a replication feed from a
   database and serve reads back to the Application Server, correcting an
   illegal write-shaped edge, and pass Submit.
5. **Interview** - Answer "what happens when a user reloads right after
   writing?" by naming replication lag and the fix.
6. **Communication** - Defend why replicas fix a read bottleneck but not a
   write one, naming the next lever instead of just adding more copies.

Each objective is exercised: 1 by "One primary, any number of copies" + quiz
Q1/Q2; 2 by "The gap between write and copy" + quiz Q4 (diagram); 3 by "Sync
or async" + quiz Q5; 4 by the fix/build itself; 5 by "In an interview" + quiz
Q4/Q6; 6 by "What changes at scale" + quiz Q6.

## 3. Per-beat outline (§5.3, Building Block type per §6)

| Beat | Section in the lesson | Notes |
|---|---|---|
| 1-2 Cold open / why this exists | Untitled opening, 2 paragraphs | Directly continues 3.11's own "Next" ("3.11 asked which store to reach for. 3.12 Replication is where copies of that store enter the picture - for reads, and for the first guarantee that isn't there for free: read-your-writes"). Felt failure: a user updates their profile, reloads, sees the old name - doubles as the scenario paid off later by the sequence diagram and quiz Q4. |
| 3 Think first | "Think first" callout | Prediction prompt: what could go wrong adding a database copy that adding an app-server copy (3.8) never had to worry about? Never graded. |
| 4-5 Mental model + visual explanation | "One primary, any number of copies" | Anchor sentence stated before the diagram; primary diagram is a ScaleCraft-style topology rendered as Mermaid (see §5 below on why Mermaid, not canvas JSON, despite §7.2's stated preference), captioned close to §7.2's own worked example for this exact pairing. |
| 6-7 Core mechanics / deeper dive | "The gap between write and copy" | Replication lag defined, paid off against the cold open's own scenario; supporting Mermaid sequence diagram shows the write-ack-then-stale-read timeline directly. |
| 8 Trade-offs | "Sync or async - the trade you're actually making" | Table plus prose - sync's no-lost-writes vs. async's fast-writes-with-a-loss-window, both costs named (§11.1's design rule). |
| 9 Failure modes | "What breaks" | Mandatory for Building Block (§0). Three entries: lag spikes under write bursts, writing directly to a Replica, a Replica going down mid-read. |
| 10 Scaling behavior | "What changes at scale" | Mandatory for Building Block (§0). Read scale-out ~linear (backward ref to 3.8); write scale-out doesn't move - names 3.13 as the next lever (advance-organizer mention, not this chapter's one tease - see §6 below); chained/multi-region replication named, not modeled. |
| 11 Production examples | "In production" | GitHub - unused by any prior chapter (Stripe 3.6, Shopify 3.7, Netflix 3.8, Airbnb 3.9, Stack Overflow 3.10, Discord 3.11), and on-topic: read volume dwarfing write volume drove a read-replica split. |
| 12 Common mistakes | "Common mistakes" | Four: expecting read-your-writes for free; writing to a Replica; treating "eventually consistent" as "no guarantee"; adding replicas to fix slow writes. |
| 13 Interview lens | "In an interview" | High relevance, steps 5/6 named explicitly. Mandatory §10.3 senior-answer line built only from this chapter's own vocabulary, and explicitly answers the cold open's own scenario. |
| 14 Connections + Preview of next | "Connections" / "Next" (forward) | Backward: 3.10 (ACID guarantees, deepened - two copies can now legitimately disagree), 3.8 (the same offload move, applied to a data-tier component with a new rule), 3.11 (works identically for either store family) - past §19's >=2. Forward: 3.13 only, as the one marked tease (in "Next"); 3.14, 3.22, 3.26 named separately as explicitly-marked, further-out mentions elsewhere in the lesson body, not counted as a second tease (same reading 3.11's own spec used for its 3.13 mention). |
| 15 Recap + knowledge check | "Recap" | Four retrieval anchors. QuizLauncher renders the knowledge check automatically. |
| 16 Transition brief | "Your turn" | Mandatory (real Editor exercise). States the starter graph (3.11's own passing system, unchanged, plus a Read Replica with one illegal edge already drawn), the success condition (remove the wrong edge, wire the two correct ones, Validate, Submit), and names what the wrong edge represents without naming the fix. |

## 4. Declared omissions and justifications (§6's written-justification rule)

- **The "trace / predict-then-check" beat CURRICULUM's own row promises
  ("Exercise: build ... + fix ... + trace") is realized as quiz Q4 (a
  `diagram`-kind predict-then-check question), not a real interactive
  simulator trace.** This is the established, three-times-confirmed
  degradation path from `pending-chapters.md`'s open decision 7
  (`pending-content.md`'s own named path: "simulator-dependent beats become
  quiz questions") - the same reading 1.7's and 3.4's own specs already
  applied, now a fourth confirmed instance. No new problem raised; applying
  a settled call, not making a new one.
- **No everyday analogy beyond the diagrams themselves**, matching every
  prior Group A/B/C chapter's own minimal-analogy choice (§5.3 beat 4's "one
  model per chapter").
- **No §12 nugget devices.** Open decision 5 remains unresolved; this is the
  tenth chapter to omit and declare rather than make the call unilaterally.
- **Only one production example** (GitHub), matching every prior chapter's
  own precedent, not §13's allowed 1-3 - the read/write volume split is
  complete on its own.
- **Failover (what happens if the primary itself dies) is named, not
  taught** - one line in `curriculumContext.notYetIntroducedConcepts`, not a
  lesson section. That's 3.26's own subject (leader/follower roles
  formalized); this chapter teaches replication as mechanism, not
  coordination, per CURRICULUM's own row: "3.12 taught replication as
  mechanism (copies exist); [3.26] teaches it as coordination (who may
  accept writes) - different questions, deliberately separated."
- **CAP theorem / quorums are named, not taught** - one clause tying
  replication lag to the same tension 3.22 formalizes later. Matches every
  prior chapter's §20.2 depth-deferral pattern.

## 5. Diagram (§7)

Two Mermaid diagrams - a departure from §7.2's stated preference for
canvas-rendered ScaleCraft graph JSON on topology diagrams, same reasoning
already applied and declared by 3.4's own spec and every chapter since: no
MDX-embeddable component exists today for rendering an `ArchitectureGraph` as
a static diagram inside lesson prose (`ReadOnlyGraphSummary` is used for the
Debrief and starter-graph views, not the Reader body; canvas-JSON diagrams
in this curriculum currently only render as the starter graph itself or as
quiz `diagram`-kind questions). Checked directly, not assumed.

**Primary (beat 5): replication topology.** CURRICULUM §7.1's own inventory
names this exact pairing ("Replication topology | Copies + sync direction |
3.12, 3.26"). Mermaid flowchart: Application Server -> primary SQL Database
(writes and some reads); primary -> Replica (replication); Replica ->
Application Server (reads). Captioned near-verbatim to §7.2's own worked
example for this exact chapter ("note: the replica edge points FROM primary
TO replica - writes never flow the other way").

**Supporting (beats 6-7): replication lag sequence.** A Mermaid
`sequenceDiagram` showing the cold open's own scenario played out in order -
write, acknowledgment, replication in flight, a read landing on the Replica
before it catches up, stale data returned. Directly pays off the cold open's
tension (§5.3 beat 1's binding requirement) and sets up quiz Q4.

**No `<Walkthrough>` authored.** The lag sequence is genuinely time-ordered
and would be a defensible `<Walkthrough>` candidate per §7.2's own rule
("if the same nodes/edges benefit from stepping through... author it as a
`<Walkthrough>`") - flagged in §12 below for a second reader, since this is a
judgment call this pass made in favor of staying inside `chapter-author`'s
own scope (content authoring only; the `walkthrough-diagram` skill is a
separate pass, not invoked here) rather than an unconsidered omission.

## 6. Component budget (§16) and cross-reference checks

§16's audit row: "3.12 | `read-replica` + edge `replication`." Checked
directly against `src/content/components/config/data.ts` and
`src/validation-engine/rules/orphan-read-replica.ts`: **both already exist,
fully wired, with no engine gap** - `read-replica`'s `relations` (inputs:
category `data` + kind `replication` only; outputs: category `compute` + kind
`request-flow` only) and the `orphan-read-replica` rule were already built in
a prior engineering pass, evidently in anticipation of this chapter. This is
the second Group C chapter in a row (after 3.11) to need nothing new from the
engine - no open decision raised.

**One real finding: `compute.ts`'s own inline comment confirms the intended
read-path edge direction is Replica -> Application Server, not the reverse.**
`src/content/components/config/compute.ts`'s `app-server` entry comments: "a
Read Replica's own 'Read query' output targets compute" - i.e. reads flow OUT
of the Replica INTO the Application Server, the opposite of how a client
queries the primary. This chapter's own diagrams, blueprint, and starter
graph all use that direction. **QUIZ_FRAMEWORK.md §10's own bank Q5 diagram
JSON does not** - its `e3` is authored `app-server -> read-replica`
(`kind: "request-flow"`), which would fail `component-relations` today (the
Replica's own `inputs` contract only accepts category `data` + kind
`replication`). This diagram is rendered read-only in the quiz UI and was
never run through validation, so it doesn't break anything at runtime - but
it teaches the wrong direction. Quiz Q4 below adapts the bank's scenario with
the corrected direction (`replica -> app`) rather than reproducing the bank
JSON verbatim. **Flagged as a new open decision** (see the ledger's open
decisions list) - QUIZ_FRAMEWORK.md §10 Q5's own graph JSON should be
corrected to match the shipped registry contract.

**Open decision 15's Group C row - third of five remaining rows checked,
2026-08-23 - matches.** 2.3's own row for Group C: "Every instance reaches
one database, and it is now the ceiling | 3.10-3.13." This chapter is the
first to actually relieve that ceiling (for reads) rather than just examine
or reshape it - 3.10 examined it, 3.11 asked whether the store's shape fit
it, this chapter is the first concrete mechanism that moves it. Third of the
five remaining rows resolved; Groups D-G and the last of Group C (3.13)
remain open.

## 7. Validation rules (deliverable 4)

`["no-direct-client-database", "component-relations", "orphan-component",
"missing-input-connection", "orphan-read-replica"]` - 3.11's own curated set
plus `orphan-read-replica`, this chapter's own namesake rule per CURRICULUM's
explicit note ("the orphan-read-replica rule is the teaching instrument").
`orphan-read-replica` catches the missing replication source directly;
`component-relations` catches the starter graph's own illegal edge (an
app-server-to-replica `request-flow` edge fails the Replica's own declared
`inputs` contract) independently - the same starter fault trips both rules
at once, by design (see §8 below).

## 8. Blueprint and starter graph (deliverable 3, part of it)

One blueprint (`bb-3-12-blueprint`), full chain through 3.11 unchanged plus
`db -> replica` (`replication`) and `replica -> app` (`request-flow`).
`starterGraph` reuses 3.11's own node-position layout for the existing chain
and adds a Read Replica node to the right of the primary, with **one edge
already drawn**: `app -> replica` (`kind: "request-flow"`) - the same move
that correctly wires every other data component in this system (`app ->
db`, `app -> nosql`), pointed at a component whose input port is contractually
different. This single edge is deliberately overdetermined: it fails
`component-relations` (illegal input kind/category on the Replica) and, since
it isn't a `replication`-kind edge from a database, leaves the Replica
`orphan-read-replica`-orphaned at the same time. One fault, two rules, no
padding - the same efficiency 3.9's own spec established reusing `dns`'s
`ttlSeconds` field. The learner must remove that edge and add the two correct
ones (a `replication` edge in, a `request-flow` edge out) to pass. Flagged in
§12 below for a second reader to confirm this reads as fair, not as an
unmarked trap - the "Your turn" section names what the wrong edge represents
(the same move that worked elsewhere) without naming the fix.

## 9. Hints (deliverable 3, part of it)

Three hints (§11.3's orienting-to-directional ramp, never the answer):

1. Validate names two separate problems on the Replica - what already
   connects to it, and what's missing. Orienting only.
2. Points at the specific wrong edge and asks the learner to check its kind
   against what the Replica's input actually accepts - directional, doesn't
   name the fix.
3. Names both correct edges' *purpose* (a real source, a real destination)
   and that there are two, not one - most directional, still doesn't state
   `replication`/`request-flow` explicitly as the answer key.

Matches 3.11's own hint discipline (§11.3) - hint 3 narrows without handing
over the literal graph shape.

## 10. Quiz (deliverable 5)

Six questions (§3's sanctioned 3-6 range), ramp 1/1/2/2/3/3, matching 3.10's
and 3.11's own ramp exactly.

Q3 adapts QUIZ_FRAMEWORK.md §10's own bank Q6 (tagged "(3.12)": writing to a
replica), reworded with fresh option labels. Q4 adapts bank Q5 (also tagged
"(3.12)": the replication-lag diagram question) - **with the graph JSON's
`e3` edge corrected to `replica -> app` instead of the bank's own
`app -> replica`**, per §6's doc-drift finding above; the prompt and answer
reasoning otherwise follow the bank's own scenario closely, since it's
exactly the cold open's own scenario. Q5 adapts bank Q7 (tagged "(3.12)":
sync vs. async), reworded. Q1, Q2, and Q6 are original: Q1 exercises
objective 1 (why a replica exists at all), Q2 exercises objective 1/4 (the
orphan condition itself, in prose rather than diagram form), Q6 exercises
objective 6 via an interview-framed scenario, and deliberately reuses
`replicationLagBudgetMs` by name in a wrong-answer distractor (same
component-field-reuse pattern 3.9's own quiz used for `dns`'s `ttlSeconds`).

Bank Q1-Q4 (tagged "(3.10)"/"(3.11)") were already spent by their own
chapters; Q8-Q11 (tagged "(3.13)") were left untouched, reserved for that
chapter.

**Position-clustering check.** Correct options sit at a, c, d, b, c, a across
all six questions - all four positions used, "a" and "c" the only repeats,
and no letter repeats in consecutive questions. Checked against 3.11's own
sequence (b, d, a, c, b, d) to avoid opening on the same letter as the
immediately preceding chapter - 3.11 opened "b," this chapter opens "a."

Scope check: every question draws on this chapter's own material plus named,
not-yet-taught forward references (3.13 in Q1's option C, 3.14 in Q1's option
D and Q2's option B, 3.26 in Q2's option D, 3.22 in Q5's own explanation) -
all consistent with §20.2's forward-tease rule (named, not taught). No
question requires anything from 3.13 onward as its own correct-answer
reasoning.

## 11. Playtest pass (deliverable 6, §18.2's binding question)

*"Which prior chapter taught each move this exercise requires?"*

| Move | Taught by |
|---|---|
| Recognize that an edge which correctly wires every other data component (`app -> db`, `app -> nosql`) can still be illegal on a different component | Building on 3.9's own precedent that a component's own declared contract, not a learner's pattern-matched habit, decides legality - reinforced by every `component-relations` message the learner has already read since 3.1. |
| Diagnose that a component has no incoming connection of the *right kind*, not just no connection at all | Building on 3.11's own Completion-fix precedent (`missing-input-connection`), extended here to a kind-specific check the learner hasn't hit before this exact chapter - which is why `orphan-read-replica` exists as a separate, named rule rather than folding into the generic one. |
| Draw a `replication`-kind edge, a kind never used before this chapter | Taught fresh in this chapter's own "One primary, any number of copies" section and diagram - no prior chapter could have taught it, since 3.12 is `replication`'s own home chapter per §16. |
| Draw a `request-flow` edge from a data-category component back toward compute (Replica -> Application Server), reversing the direction every prior data edge has run | Taught fresh in this chapter's own primary diagram and caption, which states the direction explicitly before the exercise begins. |
| Reason that adding a Replica doesn't touch the existing SQL/NoSQL chain | Building on 3.11's own "two stores, two jobs" precedent (§19), applied a third time to a third kind of addition. |

No move is unsourced.

## 12. Items flagged for a second pass

- **The starter graph's single overdetermined wrong edge (§8)** - a second
  reader should confirm this reads as a fair Fix/Build hybrid (the same
  wiring move that worked everywhere else, now wrong) rather than an unfair
  "guess what I was thinking" trap, the same class of judgment 3.11's own
  `key-value` starter value was flagged for.
- **No `<Walkthrough>` authored for the replication-lag sequence, despite it
  being a defensible candidate per §7.2's own rule (§5).** A second reader
  should confirm staying with a static Mermaid sequence diagram was the
  right call for this pass, or flag it for a dedicated `walkthrough-diagram`
  pass later.
- **The QUIZ_FRAMEWORK.md §10 Q5 doc-drift finding (§6, §10)** - a second
  reader should confirm the corrected edge direction used in this chapter's
  own Q4 is actually right (checked directly against `compute.ts`'s and
  `data.ts`'s own relations in this pass, not assumed), and that
  QUIZ_FRAMEWORK.md's own bank entry gets corrected in a follow-up doc edit.
- **Word count.** 1,375 words (`wc -w` on the raw `.mdx`) for a 30-minute
  estimate - close to 3.11's own 1,368 for a 25-minute chapter, despite two
  diagrams and a trade-off table this chapter carries that 3.11 didn't need
  in the same shape. Flagged for a second reader to confirm nothing feels
  compressed against §20.6's density rule as a result, the same flag 3.11's
  own spec raised for itself.
- **No formal density revision pass performed as a distinct drafting
  round** - matching every prior chapter's own precedent of flagging a
  self-assessed density claim for the next reviewer to check rather than
  trust.

**Not done (out of `chapter-author` draft mode's scope):** no Opus audit pass
yet. `tsc`/`lint`/`vitest`/`build` not run - content-only pass.
