# Chapter spec - 3.11 SQL vs. NoSQL

Authored under CURRICULUM.md §5 (chapter blueprint), §6 (mandatory sections),
§20 (author instructions). Deliverable 1 of the 6 in pending-content.md's
"Per-chapter deliverables". Lives beside the lesson so a reviewer can check the
prose against the intent that produced it.

- Chapter definition: `src/content/chapters/index.ts` (`bb-3-11-sql-vs-nosql`)
- Lesson body: `public/content/chapters/bb-3-11-sql-vs-nosql.mdx`
- Manifest row: `src/curriculum/manifest.ts`, slug `3-11-sql-vs-nosql`
  (`chapterDefinitionId` flipped from `null` to the id above)

**Wave.** Second Group C chapter, authored immediately after 3.10 in this same
working tree. Same out-of-wave-plan note every Wave 3/4 chapter's own spec has
carried forward: the real prerequisite (3.10) is already authored, so no
sequencing rule (§18.2) is violated - only `pending-content.md`'s wave
grouping is out of order relative to actual authoring order.

## 0. Type classification

Unlike 3.10 (Concept, no component), this chapter introduces a registry
component - CURRICULUM §14's own row states "New: `nosql-database`" and §16's
own audit table lists a dedicated row for it ("3.11 | `nosql-database`"), and
3.11 is *not* among §16's "Concept chapters with no component" list
(3.6-3.10, 3.13, ...). Per §4's own table, "Building Block: Introduces 1-3
registry components... Editor exercise: Full: build/completion/fix, the
default." Type: **Building Block**. This has one concrete consequence versus
3.10's own classification: per §6's mandatory-section table, Failure modes and
Scaling considerations are **M** (mandatory) for Building Block, not **o**
(optional) - both appear in this chapter as full sections, not folded/omitted
the way 3.10 and 3.7 justified doing.

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | A decision procedure, not a technology tour: data shape + access pattern + scale -> store choice, per CURRICULUM's own row. |
| Type | Building Block (see §0 above). |
| Difficulty | intermediate - `manifest.ts`'s existing `difficulty: "intermediate"`, matching CURRICULUM §14's Group C heading. |
| Estimated time | 25 minutes (Reader + Editor combined), per CURRICULUM §14's own row and `manifest.ts`'s existing `estimatedMinutes: 25`. |
| Prerequisites | 3.10 Databases - the real curriculum-order prerequisite, already shipped in this same working tree. `manifest.ts`'s `prerequisiteSlugs` already pointed at `3-10-databases` before this chapter was authored - no pulled-forward exception needed. |
| Unlocks | 3.12 Replication (this chapter's own forward tease and the immediate next chapter, per `manifest.ts` row order). |
| Building blocks introduced | `nosql-database` (config field `model`: key-value / document / wide-column / graph). No new edge kind - reuses `request-flow` and `replication`, the same relations `sql-database` already declares. |
| Stages trained | Part 3's default (stages 2-4) plus a real construction stage - Completion-shaped: fix a wrong config value and wire in one edge. |
| Interview relevance | High, per §14's own note - "the single most common interview question." Feeds Interview Loop step 5 (deep dive) and step 7 (trade-offs and alternatives). |
| Production relevance | Any product choosing a datastore under a real, stated access pattern - Discord's message store is the in-lesson example. |

## 2. Learning objectives (§5.2)

Six objectives (§5.2's allowed range is 3-7). All five categories present -
Practical is **not** exempted here the way 3.10's did, because this is a
Building Block chapter with a real Editor exercise, not a no-build Concept
chapter (§0).

1. **Knowledge** - State the decision procedure: does the data need multi-row
   transactions or joins across entities, does its shape vary row to row,
   will writes outgrow one machine - roughly in that order.
2. **Knowledge** - Explain what a NoSQL store trades away (multi-row
   transactions, ad-hoc joins) for what it gains (a schema that varies row to
   row, horizontal write scale built in).
3. **Engineering** - Given a workload's shape, access pattern, and scale,
   decide SQL, NoSQL, or defend "either" - and name the cost of the choice,
   not just the benefit.
4. **Practical** - Add a NoSQL Database configured with the model matching a
   given workload's data shape, connect it to the Application Server, and
   pass Submit.
5. **Interview** - Answer "would you use SQL or NoSQL here?" by naming the
   actual constraint the workload puts on the store, not a memorized rule.
6. **Communication** - Defend a store choice out loud, naming both what it
   buys and what it costs, for a workload where the answer is genuinely
   "either."

Each objective is exercised: 1 by "The three questions that pick a store" +
quiz Q1; 2 by "What NoSQL actually trades away" + quiz Q2; 3 by "Two
philosophies, one decision" + quiz Q3/Q4; 4 by the fix itself; 5 by "In an
interview" + quiz Q5/Q6; 6 by the "either" row of the trade-off table and quiz
Q4's own explanation, which is shown either way per §11.1's design rule.

## 3. Per-beat outline (§5.3, Building Block type per §6)

| Beat | Section in the lesson | Notes |
|---|---|---|
| 1-2 Cold open / why this exists | Untitled opening, 2 paragraphs | Directly continues 3.10's own "Next" ("3.10 assumed the answer was always a relational store. 3.11 SQL vs. NoSQL is where that assumption gets defended - or found wrong for the workload in front of you"). Felt failure: a product catalog fighting its own fixed relational shape every sprint (NULL-heavy columns or constant migrations). |
| 3 Think first | "Think first" callout | Prediction prompt: given the catalog above, reach for a different kind of database, or fix it another way? Never graded. |
| 4-5 Mental model + visual explanation | "The three questions that pick a store" | Anchor sentence (the three-question procedure) stated before the diagram; primary diagram is a Mermaid decision tree, per CURRICULUM §7.1's own inventory row ("Decision tree \| Selection procedures \| 3.11, 3.19, interview lens"). |
| 6 Core mechanics | "What NoSQL actually trades away" | Gives-up/gains table plus one paragraph naming the four `model` values at one distinguishing sentence each (§20.4 idea-cluster budget - no deep dive on any one model). |
| 7 Internal mechanics / 8 Trade-offs | "Two philosophies, one decision" | The chapter's required trade-off exercise (CURRICULUM's own row: "trade-off scenarios ×3 (one SQL, one NoSQL, one 'either'...)") realized as a table plus prose, per §11.1's design rule that a trade-off exercise never has a secretly correct option - same non-Editor realization 3.7's own spec established for its own trade-off beat (see §4 below). |
| 9 Failure modes | "What happens when you guess wrong" | Mandatory for Building Block (§0) - two entries, one per wrong-direction guess (NoSQL for a workload that needed transactions; SQL for a workload with no ceiling in sight). |
| 10 Scaling behavior | "What changes at scale" | Mandatory for Building Block (§0). States the choice is forced by access pattern before size, and marks 3.13 Sharding as an advance-organizer mention (not this chapter's one tease - see §6 below), the same separated-mention pattern 3.7's own spec used for its 3.14 mention. |
| 11 Production examples | "In production" | Discord - unused by any prior chapter (Stripe 3.6, Shopify 3.7, Netflix 3.8, Airbnb 3.9, Stack Overflow 3.10), and on-topic: message volume and a simple channel+time access pattern drove a wide-column NoSQL store. |
| 12 Common mistakes | "Common mistakes" | Four: treating the choice as permanent/whole-system; reaching for NoSQL because "it scales" without checking the access pattern; assuming NoSQL means no consistency guarantees at all; picking a `model` that doesn't match the access pattern. |
| 13 Interview lens | "In an interview" | High relevance, named explicitly as arguably the single most common system-design follow-up. Mandatory §10.3 senior-answer line built only from this chapter's own vocabulary. |
| 14 Connections + Preview of next | "Connections" / "Next" (forward) | Backward: 3.10 (direct continuation, quoted), 1.2 (sql-database's own introduction), 2.3 (Group C's own motivating row) - past §19's >=2. Forward: 3.12 only, as the one marked tease (in "Next"); 3.13 named separately as an explicitly-marked advance-organizer mention in "What changes at scale," not counted as a second tease. |
| 15 Recap + knowledge check | "Recap" | Four retrieval anchors. QuizLauncher renders the knowledge check automatically. |
| 16 Transition brief | "Your turn" | Mandatory (this chapter has a real Editor exercise, unlike 3.10). States the starter graph (3.10's own passing system, unchanged, plus a disconnected, wrong-configured NoSQL Database), the success condition (fix the `model`, wire it in, Validate, Submit), and explicitly forecloses telling the learner which `model` value is correct. |

## 4. Declared omissions and justifications (§6's written-justification rule)

- **The three trade-off scenarios are realized as an in-lesson table plus
  prose, not a distinct Editor "Trade-off scenario" exercise with its own
  presented graphs to pick between.** Same reading §11.1's own taxonomy
  entry got at 3.7 (also listed there: "Where used: 3.7, 3.11, 3.19, 3.22,
  all RWE Phase B") - the mechanism ("2+ presented graphs/configs, pick per
  scenario, read reasoning") is satisfied by the lesson's table plus quiz
  Q3/Q4, which present the SQL/NoSQL/either scenarios and ask the learner to
  judge with full reasoning shown either way. No new Editor-side "present two
  graphs, pick one" affordance exists in the engine, and building one is out
  of this pass's scope per the `chapter-author` skill. Flagged in §12 below
  for a second reader, same as 3.7's own flag.
- **No everyday analogy beyond the diagram itself.** Same minimal-analogy
  choice every prior Group A/B/C chapter made; a second competing metaphor
  would violate §5.3 beat 4's "one model per chapter."
- **No §12 nugget devices.** Open decision 5 remains unresolved; this chapter
  is the ninth to omit and declare rather than make the call unilaterally.
- **Only one production example**, matching every prior chapter's own
  precedent, not §13's allowed 1-3 - Discord's message-store decision is
  complete on its own.
- **The four `model` sub-types are named, not taught in depth** (one
  distinguishing sentence each in "What NoSQL actually trades away"). Deeper
  treatment of any one model is its own chapter's worth of material and would
  blow §20.4's "one new idea-cluster per chapter" budget; matches §20.2's
  "the private textbook handles depths beyond ScaleCraft's scope" - no
  `readingLinks` entry exists yet to link out to (no textbook URL supplied to
  this project, per CLAUDE.md's own note).
- **CAP theorem and isolation-level depth for NoSQL consistency are named,
  not taught** (one sentence: "usually strongly consistent per key, weaker
  guarantees across entities"). Same §20.2 depth-deferral class as 3.10's own
  ACID-depth omission.

## 5. Diagram (§7)

One Mermaid diagram, a decision tree - CURRICULUM §7.1's own inventory names
this exact pairing ("Decision tree | Selection procedures | 3.11, 3.19,
interview lens"), and it is a non-topology diagram (§7.2: "sequence, state,
decision tree, spectrum... use Mermaid"), so no ScaleCraft-graph-JSON
authoring question applies here the way it did for every prior chapter's
topology diagram.

**Primary (beat 5): the three-question decision tree.** Multi-row
transactions/joins -> relational store (both branches); shape varies or
single-key access, then a scale question -> NoSQL store or "either." Captioned
to name what to notice: shape and access pattern get asked before scale, so a
workload that needs cross-row transactions or joins is decided immediately -
scale only breaks the tie for what's left.

**No second diagram.** Unlike 3.10's two diagrams, the trade-off scenarios
(§3's beats 7-8) are better served by the comparison table in "Two
philosophies, one decision" than a second Mermaid diagram - a table has
higher scan value for a three-row comparison (§20.6's own "prefer the format
with the highest scan value" rule) and CURRICULUM's own diagram inventory
names only the decision tree as this chapter's typical diagram, not a second
type.

**No `<Walkthrough>` considered necessary.** The decision tree is a static
selection procedure, not an ordering between requests over time - same
reasoning every prior Group B/C chapter's spec gave for skipping it.

## 6. Component budget (§16) and cross-reference checks

§16's audit row: "3.11 | `nosql-database`." One new component, no new edge
kind - `nosql-database`'s own `relations` (checked directly against
`src/content/components/config/data.ts`) declare the identical shape
`sql-database` already uses (`inputs: allowedCategories: ["compute",
"caching"], allowedKinds: ["request-flow"]`; `outputs: allowedCategories:
["data"], allowedKinds: ["replication"]`), so no engine change was needed to
support this chapter's exercise. `availableComponentIds`/`requiredComponentIds`:
the full chain through 3.10 plus `nosql-database`, all required, consistent
with Part 3's running-example philosophy - the SQL Database stays in the
system (orders/accounts still need it), the NoSQL Database is a second store
for a second shape, not a replacement.

**Open decision 15's Group C row - second of five remaining rows checked,
2026-08-23 - matches.** 2.3's own row for Group C: "Every instance reaches
one database, and it is now the ceiling | 3.10-3.13." 3.10 examined the
ceiling itself; this chapter examines whether a relational store was the
right shape to hit that ceiling with in the first place - a direct
continuation of the same row, not a new pressure. Second of the five
remaining rows resolved; Groups D-G and the rest of Group C (3.12, 3.13)
remain open.

## 7. Validation rules (deliverable 4)

`["no-direct-client-database", "component-relations", "orphan-component",
"missing-input-connection"]` - the standard curated set every full-build
Group B/C chapter has used (matches 3.6's/3.7's own list minus
`request-flow-cycle`, which isn't a plausible mistake in a single-edge
Completion fix with no branching to mis-loop). `missing-input-connection` is
the rule that actually gates this exercise's wiring half (the NoSQL Database
starts with an outgoing-capable but disconnected input); the config-correctness
half (`model` matching the workload) is gated by the blueprint's own `config`
predicate, not a standalone rule - `pattern.ts`'s `ConfigPredicate` mechanism
supports this directly (checked against `src/validation-engine/pattern.ts`),
so no new engineering work was needed.

## 8. Blueprint and starter graph (deliverable 3, part of it)

One blueprint (`bb-3-11-blueprint`), full chain through 3.10 unchanged plus
`app -> nosql` (`request-flow`) with a `config` predicate (`model` `eq`
`"document"`) on the NoSQL Database node. `starterGraph` reuses 3.9's own
node-position layout for the existing chain (matching every prior chapter's
own starter-graph convention) and adds the NoSQL Database node below the SQL
Database, disconnected, with `config: { model: "key-value" }` - a
**deliberate wrong guess**, not the registry's own default (`"document"`).
This is a considered choice: if the starter graph's NoSQL node were left at
its registry default, the config half of the exercise would pass without the
learner ever touching it, and objective 4 (choosing the right model) would go
untested by the build - only by the quiz. Pre-setting it to a plausible-but-wrong
value (`key-value` - a real NoSQL shape, just the wrong one for a
per-category-varying catalog) makes the fix genuine: the learner must
recognize the mismatch, not just draw a wire. Flagged in §12 below for a
second reader to confirm this reads as a fair Completion fix and not a
disguised trick.

## 9. Hints (deliverable 3, part of it)

Three hints (§11.3's orienting-to-directional ramp, never the answer):

1. Validate is naming a component with no incoming connection - a wiring
   problem, separate from whatever the NoSQL Database's own config is set to.
2. Look at what the catalog's own attributes do from one product category to
   the next before trusting the `model` value that's already there - it was
   set to a guess, not an answer.
3. A key-value store answers "give me the value for this exact key," nothing
   else. Ask whether that's actually the catalog's problem, or something a
   different `model` value describes better.

None states the correct `model` value directly - hint 3 narrows by
elimination (rules out key-value) without naming `document`, matching every
prior chapter's own hint discipline (§11.3).

## 10. Quiz (deliverable 5)

Six questions (§3's sanctioned 3-6 range), ramp 1/1/2/2/3/3, matching 3.10's
own ramp exactly.

Q3 adapts QUIZ_FRAMEWORK.md §10's own bank Q3 (tagged "(3.11)": "which
requirement makes a relational store nearly non-negotiable... multi-row
transactions"), reworded with fresh option labels rather than reproduced
verbatim, exercising objective 3/trade-off-scenario 1 (SQL). Q5 adapts bank Q4
(also tagged "(3.11)": "we need NoSQL because we'll be big... ask for the data
shape and access patterns first"), exercising objective 3 and the interview
lens. Q1, Q2, Q4, and Q6 are original: Q1 exercises objective 1 (the
procedure itself), Q2 exercises objective 2 (what NoSQL trades away), Q4
exercises objective 3/6 via the "either" trade-off scenario directly (not
covered by either reserved bank question), Q6 exercises objective 5 and the
mandatory §10.3 interview-lens line.

Bank Q1 and Q2 (tagged "(3.10)") and Q5 (tagged "(3.12)") were deliberately
left untouched - already spent by 3.10, reserved for 3.12 respectively, not
this chapter's to use.

**Position-clustering check.** Correct options sit at b, d, a, c, b, d across
all six questions - all four positions used, "b" and "d" the only repeats,
and no letter repeats in consecutive questions. Checked against 3.10's own
sequence (c, a, d, b, a, c) to avoid opening on the same letter as the
immediately preceding chapter - 3.10 opened "c," this chapter opens "b."

Scope check: every question draws on this chapter's own material plus 3.12
(Q2's option A distractor references replicas by name only, already-taught
territory since 3.12 hasn't been reached) and 3.14 (Q3's option C names
caching as a separate lever, consistent with §20.2's forward-tease rule - both
named, not taught). No question requires anything from 3.12 onward as its own
correct-answer reasoning.

## 11. Playtest pass (deliverable 6, §18.2's binding question)

*"Which prior chapter taught each move this exercise requires?"*

| Move | Taught by |
|---|---|
| Recognize that a fixed relational schema is fighting a workload whose shape genuinely varies | Building directly on 3.10's own ACID/indexing lesson (a database's promises are concrete, not folklore) - this chapter is the first to examine whether the store's *shape*, not just its guarantees, fits the workload. |
| Diagnose a `model` value against a stated access pattern rather than trusting what's already configured | Building on 1.3's own trade-off reflex (cost named, decision defended) and 3.9's own precedent that a config value can be the thing under test, not the topology. |
| Draw a `request-flow` edge from an Application Server to a data-category component | Taught fresh in 1.2, reused identically in 3.7's own reconnect exercise - the same mechanical move, applied to a new component. |
| Reason that adding a second store doesn't require removing the first | Building on 3.7's own "same component, second job" precedent (§19), inverted here into "two stores, two jobs" rather than one component wearing two hats. |
| Apply the "name the cost, not just the benefit" trade-off discipline to a genuine two-sided comparison | Building on 1.3's trade-off form and 3.7's own two-product trade-off scenario, applied here to a third, harder case: one where the honest answer is "either." |

No move is unsourced.

## 12. Items flagged for a second pass

- **The pre-set `key-value` value on the starter graph's NoSQL Database node,
  chosen specifically to be wrong (§8).** A second reader should confirm this
  reads as a fair Completion-style fix - a plausible, real NoSQL shape that
  happens not to fit this workload - rather than an unfair "guess what I was
  thinking" trap. The hints (§9) are aimed specifically at this judgment call.
- **The "Trade-off scenario" exercise-type reading, following 3.7's own
  precedent exactly (§4).** A second reader should confirm this reading of
  §11.1 stays reasonable on a second, independent application, not just a
  repeat of a judgment call nobody has re-checked since 3.7.
- **Building Block type reclassification versus 3.10's Concept
  classification (§0).** A second reader should confirm Failure modes and
  Scaling considerations, now mandatory, are actually full sections here and
  not folded/thinned the way an optional section might be in a Concept
  chapter.
- **Word count.** 1,368 words (`wc -w` on the raw `.mdx`) - close to 3.10's
  own 1,357, despite carrying two additional mandatory sections (Failure
  modes, Scaling) that 3.10 didn't need. Flagged for a second reader to
  confirm nothing feels compressed against §20.6's density rule as a result.
- **No formal density revision pass performed as a distinct drafting
  round** - matching every prior chapter's own precedent of flagging a
  self-assessed density claim for the next reviewer to check rather than
  trust.

**Not done (out of `chapter-author` draft mode's scope):** no Opus audit pass
yet. `tsc`/`lint`/`vitest`/`build` not run - content-only pass.
