# Chapter spec - 3.10 Databases

Authored under CURRICULUM.md §5 (chapter blueprint), §6 (mandatory sections),
§20 (author instructions). Deliverable 1 of the 6 in pending-content.md's
"Per-chapter deliverables". Lives beside the lesson so a reviewer can check the
prose against the intent that produced it.

- Chapter definition: `src/content/chapters/index.ts` (`bb-3-10-databases`)
- Lesson body: `public/content/chapters/bb-3-10-databases.mdx`
- Manifest row: `src/curriculum/manifest.ts`, slug `3-10-databases`
  (`chapterDefinitionId` flipped from `null` to the id above)

**Wave.** First Group C chapter, authored immediately after Group B completed
(3.6-3.9) in this same working tree. `pending-content.md`'s wave plan groups
Group C with Group B in a later wave; the real prerequisite (3.9) is already
authored, so no sequencing rule (§18.2) is violated - only the wave-grouping
plan is out of order relative to actual authoring order, the same standing
note every Wave 3/4 chapter's own spec has carried forward.

## 0. Type classification and the missing "config" exercise

CURRICULUM §14's own row for 3.10 does not state an explicit `Type:` field the
way 3.6-3.9's rows do (compare 3.9's "Type: Concept with config exercise" to
3.10's row, which jumps straight from "New: none" to "Interview:"). §16's own
audit (line 1136) resolves the ambiguity: 3.10 is listed among "Concept
chapters with no component (... 3.6-3.10 ...)" - so this chapter is Concept
type, matching every other chapter in Group B. Flagged as a small CURRICULUM
inconsistency (§14's row omitting an explicit Type label that a sibling
group's every other row states) - same class as decisions 1, 4, 6, 7 and 16
(CURRICULUM rows contradicting each other or omitting what a sibling row
states), not blocking, worth a future doc-only fix.

**The harder finding:** §14's own row text says "Exercise: config (indexes;
observe simulated query cost) + quiz-weighted." Checked directly against
`src/content/components/config/data.ts`: `sql-database`'s only field is
`engine` (enum, postgres/mysql) - there is no `indexes` field, and no
component or validation rule anywhere in the registry inspects query cost or
simulates one (grepped `src/validation-engine/rules/` for
`index`/`queryCost`/`query-cost`/`full-scan` - no matches). §11.1's own
"Config" exercise-type table (`Where used: 3.4, 3.13, 3.14, 3.17, 3.24`) does
not list 3.10 either, so this isn't even a contradiction the row is alone in -
§11.1 and §14 already disagree with each other on whether 3.10 has a Config
exercise at all.

**Not hacked around.** Per the `chapter-author` skill's own scope, adding a
new field to `sql-database`'s registry entry is engineering work outside a
content-authoring pass, and `engine` (postgres vs. mysql) has no honest
relationship to indexing - repurposing it the way 3.9 repurposed DNS's
`ttlSeconds` would misteach the concept, not just illustrate it, because there
is no legitimate cost-of-indexing meaning either enum value could carry. This
chapter is authored with **no Editor exercise at all**
(`hasEditorExercise: false`), matching §16's own Concept classification and
§11.1's design rule that construction-family exercises are only required
"except justified Concept chapters." The justification here is stronger than
usual: not just "no new component," but "the specific exercise CURRICULUM's
own row names isn't buildable in the engine that exists today." CURRICULUM's
own "+ quiz-weighted" phrase in the same row is read as license for this -
the chapter leans on the quiz instead, including a diagram-kind
predict-then-check (quiz Q4) that realizes "observe simulated query cost"
without a simulator, the same no-simulator workaround 3.9's own Q4 already
established for its own missing capability. Recorded as a new open decision
below, same discipline as decision 8 (`control`-kind edges) and decision 14
(no failure state in `<Walkthrough>`) - an engine gap found by content
authoring, not a chapter-local shortcut.

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | What a database actually guarantees (ACID at concept level, indexes, why disks shape everything) - the component every later Group C/D chapter exists to protect. |
| Type | Concept, per §16's own audit row (see §0 above - CURRICULUM's own §14 row omits an explicit label). |
| Difficulty | intermediate - first Group C chapter, `manifest.ts`'s existing `difficulty: "intermediate"` matches CURRICULUM §14's Group C heading. |
| Estimated time | 25 minutes (Reader + quiz combined, no Editor time since there's no exercise), per CURRICULUM §14's own row and `manifest.ts`'s existing `estimatedMinutes: 25`. |
| Prerequisites | 3.9 Service Discovery - the real curriculum-order prerequisite, already shipped in this same working tree. `manifest.ts`'s `prerequisiteSlugs` already pointed at `3-9-service-discovery` before this chapter was authored - no pulled-forward exception needed. |
| Unlocks | 3.11 SQL vs. NoSQL (this chapter's own forward tease and the immediate next chapter, per `manifest.ts` row order). |
| Building blocks introduced | None. Matches §16's own note that 3.6-3.10 are intentional no-component Concept chapters, and CURRICULUM's own row for 3.10 ("New: none (deepens `sql-database`)"). |
| Stages trained | Part 3's default (stages 2-4), realized here as reasoning/diagnosis rather than construction (no Editor exercise - see §0). |
| Interview relevance | High, per §14's own note - "step 5 staple" (the deep-dive step of the Interview Loop, §10.1). |
| Production relevance | Any product with a relational store under real load - indexing discipline and knowing when NOT to reach for sharding or a new store, per the Stack Overflow example. |

## 2. Learning objectives (§5.2)

Five objectives (§5.2's allowed range is 3-7). Practical is omitted per §5.2's
own carve-out for pure Concept chapters ("Every category below must be
represented at least once per chapter *except* Practical in pure Concept
chapters") - matching 2.3's precedent, the closest prior example of a
justified no-Practical chapter.

1. **Knowledge** - State what each of the four ACID guarantees actually
   promises, and why naively duplicating a database breaks all four at once.
2. **Knowledge** - Explain why an index turns a table scan into a lookup, and
   what it costs on every write.
3. **Engineering** - Diagnose whether a slow query is failing because of
   table size (an uncached scan) before reaching for a replica, a cache, or a
   bigger machine.
4. **Interview** - Answer "how would you make this query fast at scale?"
   naming indexing as the first, cheapest lever, before any infrastructure
   change.
5. **Communication** - Justify a query's cost out loud by pointing at its
   access pattern (scan vs. lookup), not the table's row count alone.

Each objective is exercised: 1 by "What a database actually promises" + quiz
Q2; 2 by "Why an index turns a scan into a lookup" + quiz Q1; 3 by "What it
costs to get this wrong" + quiz Q3/Q4; 4 by "In an interview" + quiz Q6; 5 by
quiz Q5 (the indexing-cost judgment call) and the interview-lens senior-answer
line.

## 3. Per-beat outline (§5.3, Concept type per §6)

| Beat | Section in the lesson | Notes |
|---|---|---|
| 1-2 Cold open / why this exists | Untitled opening, 2 paragraphs | Directly continues 3.9's own "Next" ("Every service you've built so far ends at the same place: one SQL Database, taken for granted since 1.2... 3.10 Databases is where that assumption finally gets examined"). Felt failure: every prior chapter let you duplicate the app tier for free; the database never got that treatment, and this chapter is where the reason gets examined. Resolves 2.3's own Group C row ("Every instance reaches one database, and it is now the ceiling") and its own follow-up sentence ("the moves available there... spend correctness rather than money"). |
| 3 Think first | "Think first" callout | Prediction prompt: why doesn't the app tier's free-duplication trick work on the database too. Never graded. |
| 4-5 Mental model + visual explanation | "The one box that doesn't get to just duplicate itself" | Anchor stated before the diagram; primary diagram is a Mermaid flowchart (three app-server nodes converging on one sql-database node) - unlike 3.9's illustrative-only diagram, this one IS this chapter's real, unchanged topology, so it doubles as a topology diagram, captioned per §7.2. |
| 6 Core mechanics | "What a database actually promises" | ACID table, concept level only (one sentence per guarantee, no isolation-level taxonomy - §20.2 depth calibration), plus the naive-duplication-breaks-all-four argument that motivates why 3.11-3.13 exist. |
| 7 Internal mechanics | "Why an index turns a scan into a lookup" | Secondary Mermaid diagram (scan vs. index, internal query-engine mechanics - not a topology, same narrow Mermaid exception 1.2/2.3/3.9 already established) plus prose stating the write-side cost directly. |
| 8 Trade-offs | Folded into "Why an index turns a scan into a lookup" | Same merge-adjacent-short-sections justification 3.9's own spec used - the read benefit and the write cost are one unit, not two sections restating each other, which §20.6 forbids. |
| 9 Failure modes | "What it costs to get this wrong" | Two: a scan invisible at 10k rows and catastrophic at 100M (bank Q2's own scenario, realized here in prose); a write "acknowledged" before it's actually durable. |
| 10 Scaling (o) | "What changes at scale" | Resolves 2.3's own Group C/D roadmap sentence directly - copies for reads (3.12), a different storage shape (3.11), splitting the data (3.13), a faster layer in front (3.14) - named, not taught. |
| 11 Production examples | "In production" | Stack Overflow - unused by any prior chapter (Stripe 3.6, Shopify 3.7, Netflix 3.8, Airbnb 3.9), and on-topic: a small number of powerful, heavily indexed SQL Server machines carrying real load well past the point most teams reach for sharding. |
| 12 Common mistakes | "Common mistakes" | Four: treating an index as free; not checking for a scan before reaching for infrastructure; trading durability for speed without deciding to; reaching for sharding/a new store before indexing and vertical headroom are exhausted. |
| 13 Interview lens | "In an interview" | High relevance, named explicitly as the step 5 deep-dive staple. Mandatory §10.3 senior-answer line built only from this chapter's own vocabulary. |
| 14 Connections + Preview of next | "Connections" / "Next" (forward) | Backward: 1.2 (sql-database introduced), 3.7 (used as a session store, promised a faster layer in 3.14 - advance organizer called back), 3.9 (direct bridge quote) - past §19's >=2. Forward: 3.11 only, as the one marked tease (in "Next"). |
| 15 Recap + knowledge check | "Recap" | Four retrieval anchors. QuizLauncher renders the knowledge check automatically. |
| 16 Transition brief | "Your turn" | No Editor CTA (§5.3 beat 16's own carve-out: "mandatory in every chapter type that has an Editor exercise" - this one doesn't). States plainly, in the same register 2.3 used ("No build: the knowledge check is the sequence and the judgment"), that this chapter deepens an existing component rather than adding a new one, and states what the knowledge check actually measures. |

## 4. Declared omissions and justifications (§6's written-justification rule)

- **No Editor exercise at all** (`hasEditorExercise: false`). Full reasoning
  in §0 above - CURRICULUM's own row names a Config exercise
  ("indexes; observe simulated query cost") that the engine cannot support
  today (no `indexes` field on `sql-database`, no query-cost simulation
  anywhere), and §11.1's own "Where used" list for Config exercises doesn't
  include 3.10 either. Justified per §11.1's own Concept-chapter carve-out,
  with a stronger-than-usual reason recorded as a new open decision (§6
  below).
- **No separate Trade-offs section.** Same optional-adjacent merge 3.9's own
  spec used - the index's read benefit and write cost are stated together in
  "Why an index turns a scan into a lookup," not restated in a second section.
- **No everyday analogy beyond the diagrams themselves.** Same minimal-analogy
  choice every prior Group A/B chapter made; a second competing metaphor
  would violate §5.3 beat 4's "one model per chapter."
- **No §12 nugget devices.** Open decision 5 remains unresolved and, per its
  own note, individual chapters should stop declaring this one by one - this
  chapter doesn't add another per-chapter ordinal to the count.
- **Only one production example**, matching every prior chapter's own
  precedent, not §13's allowed 1-3 - the Stack Overflow story is complete on
  its own.
- **Isolation levels and concurrency-control mechanics are named but not
  taught** (only the one-sentence ACID definition of Isolation). Per §20.2's
  "the private textbook handles depths beyond ScaleCraft's scope" - this is
  exactly that class of depth, and no `readingLinks` entry exists yet to link
  out to (no textbook URL has been supplied to this project; see
  CLAUDE.md's own note that ScaleCraft never hardcodes textbook URLs without
  one).

## 5. Diagrams (§7)

Two Mermaid diagrams, both narrow exceptions to §7.2's "canvas is the
preferred renderer" rule for the same reason every prior chapter's diagrams
were Mermaid: the Reader cannot render `ArchitectureGraph` JSON topology
diagrams inline in lesson prose today (checked directly - `bb-3-4` through
`bb-3-9`'s own lesson files are 100% Mermaid, zero embedded graph JSON;
`<Walkthrough>` is the only mechanism that renders real graph JSON in a
lesson, and was not appropriate here per the note below).

1. **Primary (beat 5): "the one box that doesn't get to just duplicate
   itself."** Three app-server nodes converging on one sql-database node,
   through a load balancer. Unlike 3.9's registry diagram (explicitly
   illustrative, not this system's real topology), this one IS the real,
   unchanged topology through 3.9 - it just isolates the fan-in shape rather
   than the full eight-node chain, the same way 3.9's own primary diagram
   isolated a shape rather than reproducing the whole system. Captioned per
   §7.2 to name what to notice (the one node every copy still depends on).
2. **Secondary (beat 7): scan vs. index.** Internal query-engine mechanics,
   not a topology - same class of exception 1.2/2.3/3.9 already used for
   diagrams below the component level. Captioned with bank Q1's own framing
   ("turns a scan into a lookup... extra work updating the index on every
   write") so the diagram and the reserved bank question teach the identical
   sentence.

**No `<Walkthrough>` considered necessary or appropriate.** Both diagrams show
a static shape (a convergence pattern; a scan-vs-lookup contrast), not an
ordering between requests over time - the same reasoning 3.9's own spec gave
for skipping it, and the predict-then-check beat this chapter needs is
realized as quiz Q4 (diagram kind) instead, per §10 below.

## 6. Component budget (§16) and cross-reference checks

§16's audit row for 3.10 is absent (same note as 3.6-3.9: "3.6-3.10... are
intentional"). No new component, no new edge kind.
`availableComponentIds`/`requiredComponentIds`: the full chain through 3.9 -
`browser`, `dns`, `firewall`, `reverse-proxy`, `api-gateway`, `load-balancer`,
`app-server`, `sql-database` - all required, unchanged from 3.9's own set,
consistent with Part 3's running-example philosophy even with no Editor
exercise to place them in (the diagrams and `CurriculumContext.masteredConcepts`
still reference the full chain).

**Open decision 15's Group C row - first chapter checked, 2026-08-23.** 2.3's
own row for Group C: "Every instance reaches one database, and it is now the
ceiling | 3.10-3.13." This chapter's cold open and primary diagram state
exactly that constraint (every app-server copy still converges on the one
database that can't be duplicated the same way), and the "What changes at
scale" section quotes 2.3's own follow-up sentence's roadmap almost verbatim
("copies for reads (3.12)... splitting the data (3.13)... a faster layer in
front (3.14)"). First of the five remaining group-table rows checked; Groups
D-G remain open as their own first chapters are authored. See the update to
decision 15 below.

**New open decision raised - no `indexes` config field or query-cost
simulation exists in the engine, so 3.10's own CURRICULUM row's literal
Config exercise isn't buildable as specified.** Distinct in kind from
decision 8 (a real edge kind exists in the type system but no component
accepts one on canvas) and decision 14 (a real capability - failure states -
is simply missing from `<Walkthrough>`): here, CURRICULUM's own §14 row
names a specific exercise mechanism (an `indexes` config value, a
query-cost simulation) that has no corresponding schema anywhere in the
component registry or validation engine at all, not even a partial one to
extend. See the new numbered entry in the "Open decisions" section below.

## 7. Validation rules (deliverable 4)

None - no Editor exercise exists for this chapter (§0), so no rule can fire on
anything. `validationRuleIds: []`, matching 2.3's own precedent for a
Concept chapter with no build.

## 8. Blueprint and starter graph (deliverable 3, part of it)

None - `blueprints: []`, no `starterGraph` key, matching 2.3's own precedent
exactly. `hasEditorExercise: false` suppresses the exercise row in
`YourTurnCard` and lets `curriculum/progress.ts`'s `deriveStatus` gate
completion on the quiz alone, per that field's own doc comment in
`src/content/chapters/types.ts`.

## 9. Hints (deliverable 3, part of it)

Three general reasoning hints (not Editor hints, since there's no exercise to
hint at) - same repurposing 2.3's own four hints already established for a
no-build Concept chapter, aimed here at the chapter's two hardest quiz moves
(the write-cost trade-off, difficulty 3; the naive-duplication-breaks-ACID
argument, difficulty 1 but conceptually the chapter's real thesis) rather than
a directional ramp toward a Submit fix:

1. A slow query's first diagnosis question is whether it's scanning or using
   an index - table size explains the change, not a code change.
2. An index trades write cost for read speed - a claim that indexing is free
   should be checked against what it costs on the way in.
3. Naive duplication and ACID: ask what happens the instant two independent
   copies both accept a write, and whether there's still a way to say which
   one is "the" answer.

None states a quiz answer directly, matching every prior chapter's own hint
discipline (§11.3) even though these aren't gating a Submit exercise.

## 10. Quiz (deliverable 5)

Six questions (§3's sanctioned 3-6 range, not the condensed-chapter
exception), ramp 1/1/2/2/3/3 - one question heavier than every sibling
chapter's default 5, read as license from CURRICULUM's own "quiz-weighted"
phrase in this chapter's row (§0) rather than an arbitrary choice.

Q1 adapts QUIZ_FRAMEWORK.md §10's own bank Q1 (tagged "(3.10)" - reserved for
this exact chapter: "an index makes reads faster by... maintaining a sorted
structure that turns scans into lookups"), reworded with fresh option labels
rather than reproduced verbatim, exercising objective 2. Q2 is original,
exercising objective 1 via a durability scenario - no bank question isolates
a single ACID guarantee this directly. Q3 adapts bank Q2 (also tagged
"(3.10)": "fast at 10k rows and unusable at 100M... check whether it's
scanning"), exercising objective 3. Q4 (`diagram` kind) is original,
realizing CURRICULUM's row's "observe simulated query cost" element as a
predict-then-check question, the same no-simulator workaround 3.9's own Q4
established (no simulator UI exists - `pending-content.md`'s own named
degradation path). Q5 is original, exercising objective 5 via the
index-everything common mistake. Q6 is original, exercising objective 4 and
the mandatory §10.3 interview-lens line.

Bank Q3 and Q4 (tagged "(3.11)": relational-store non-negotiable requirements,
the NoSQL "we'll be big" response) and bank Q5 (tagged "(3.12)": replication
lag) were deliberately left untouched - reserved for 3.11 and 3.12
respectively, not this chapter's to spend.

**Position-clustering check.** Correct options sit at c, a, d, b, a, c across
all six questions - all four positions used, "a" and "c" the only repeats,
and no letter repeats in consecutive questions. Checked against 3.9's own
sequence (a, c, d, b, a) to avoid opening on the same letter as the
immediately preceding chapter - 3.9 opened "a," this chapter opens "c."

Scope check: every question draws on this chapter's own material plus 3.13
(Q5's "reaching for sharding before cheaper levers" reasoning, Q6's option C -
both named, not taught, consistent with §20.2's forward-tease rule) and 3.14
(Q6's option A, "a replica always fixes read latency" - named as a later
lever, not taught). No question requires anything from 3.11 onward as its
own correct-answer reasoning.

## 11. Playtest pass (deliverable 6, §18.2's binding question)

*"Which prior chapter taught each move this exercise requires?"* - reframed
for a no-build chapter as: which prior chapter taught each move the QUIZ
requires.

| Move | Taught by |
|---|---|
| Read a query's cost off its access pattern (scan vs. lookup) rather than the code | Taught fresh in this chapter's own "Why an index turns a scan into a lookup" section - no prior chapter covered database internals. |
| Recognize that a database can't be duplicated the way a stateless app-server tier can | Building directly on 3.6's own statelessness argument and 3.8's own free-duplication mechanic, inverted here for the first time. |
| Reason from a stated scenario (5M to 50M rows) to a cost conclusion without a simulator | Building on 1.1's own back-of-envelope habit and 3.9's own precedent of realizing an unbuildable capability as a diagram-kind quiz question instead. |
| Recall ACID at the concept level (four guarantees, one sentence each) | Taught fresh here - `sql-database` has existed since 1.2 but its guarantees were never named until now. |
| Apply the "cheapest fix first" reflex (index before replica, replica before shard, shard only once cheaper levers are exhausted) | Building on 1.3's own trade-off reflex (cost named, decision defended) and 2.3's own ordering logic for architectural moves, aimed here at data-tier levers specifically. |

No move is unsourced.

## 12. Items flagged for a second pass

- **No Editor exercise at all, where every prior Building Blocks chapter
  since 3.1 has had one (§0).** A second reader should confirm this
  judgment call - that the engine genuinely has no way to realize
  CURRICULUM's own "config (indexes...)" exercise, and that `hasEditorExercise:
  false` combined with a six-question, quiz-weighted assessment is a
  legitimate resolution rather than a shortcut around missing engineering
  work. Cross-check against the new open decision recorded below.
- **CURRICULUM §14's own row for 3.10 omits an explicit `Type:` label,
  resolved here via §16's own audit instead (§0).** A second reader should
  confirm this reading is correct and, ideally, that a future doc-only
  CURRICULUM edit adds the missing label rather than leaving it implicit.
- **The primary diagram doubles as both the mental-model anchor and a real
  topology diagram, unlike 3.9's explicitly illustrative-only choice (§5).**
  A second reader should confirm isolating the fan-in shape (3 app-servers ->
  1 database) rather than the full 8-node chain reads as this system's real
  topology and not as a new, smaller starter graph the learner might expect
  to build.
- **Word count.** 1,357 words (`wc -w` on the raw `.mdx`) for a 25-minute
  chapter with no build - higher than every sibling Group A/B chapter's own
  1,200-1,300 word range, judged as the honest cost of carrying six full
  beats of new content (ACID, indexing, two failure modes, a scaling
  roadmap, one production example, four mistakes) with no Editor-exercise
  prose to substitute for any of it. Flagged for a second reader to confirm
  nothing feels padded against §20.6's density rule.
- **No formal density revision pass performed as a distinct drafting
  round** - matching every prior chapter's own precedent of flagging a
  self-assessed density claim for the next reviewer to check rather than
  trust.

**Not done (out of `chapter-author` draft mode's scope):** no Opus audit pass
yet. `tsc`/`lint`/`vitest`/`build` not run - content-only pass.
