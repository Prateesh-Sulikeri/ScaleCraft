# Chapter spec - 3.14 Caching

Authored under CURRICULUM.md §5 (chapter blueprint), §6 (mandatory sections),
§20 (author instructions). Deliverable 1 of the 6 in pending-content.md's
"Per-chapter deliverables". Lives beside the lesson so a reviewer can check the
prose against the intent that produced it.

- Chapter definition: `src/content/chapters/index.ts` (`bb-3-14-caching`)
- Lesson body: `public/content/chapters/bb-3-14-caching.mdx`
- Manifest row: `src/curriculum/manifest.ts`, slug `3-14-caching`
  (`chapterDefinitionId` flipped from `null` to the id above)

**Wave.** First Group D chapter, authored immediately after Group C completed
in this same working tree. Same out-of-wave-plan note every Wave 3/4 chapter's
own spec has carried forward: the real prerequisite (3.13) is already authored,
so no sequencing rule (§18.2) is violated - only `pending-content.md`'s wave
grouping (Group D is Wave 5) is out of order relative to actual authoring
order.

## 0. Type classification

Building Block, per §4/§16 - CURRICULUM §14's own row states "**New: `cache`,
`distributed-cache`**" and §16's audit table lists "3.14 | `cache`,
`distributed-cache`". Consequence, same as 3.11/3.12: Failure modes and Scaling
considerations are **M** (mandatory), not **o** - both appear as full sections.

This is also the first Group D chapter, so it inherits the check open decision
15 asks for (see §6 below).

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | The highest-leverage scaling tool: cache-aside, the staleness contract a TTL writes down, and the multi-instance wrinkle that makes a cache a tier rather than memory inside each server. Per CURRICULUM §14's own row. |
| Type | Building Block (see §0). |
| Difficulty | intermediate - matches `manifest.ts`'s existing `difficulty: "intermediate"` and §14's Group D heading. |
| Estimated time | 35 minutes (Reader + Editor combined), per §14's own row and `manifest.ts`'s existing `estimatedMinutes: 35`. |
| Prerequisites | 3.13 Sharding. `manifest.ts`'s `prerequisiteSlugs` already pointed at `3-13-sharding` before this chapter was authored - no pulled-forward exception needed. |
| Unlocks | 3.15 CDN (this chapter's one forward tease and the immediate next chapter, per `manifest.ts` row order). |
| Building blocks introduced | `cache` (fields `evictionPolicy`, `ttlSeconds`) and `distributed-cache` (fields `replicationFactor`, `consistency`). No new edge kind. |
| Stages trained | Part 3's default (stages 2-4) plus a construction stage - a single-edge Fix that is the whole cache-aside read path. |
| Interview relevance | High, per §14's own note - steps 4 (high-level design), 5 (deep dive) and 7 (trade-offs). |
| Production relevance | Any read-heavy product whose reads repeat. Reddit's memcached-backed listing and comment-tree reads are the in-lesson example. |

## 2. Learning objectives (§5.2)

Six objectives (§5.2's range is 3-7). All five categories present; Practical is
not exempted, since this is a Building Block chapter with a real build.

1. **Knowledge** - Describe the three steps of cache-aside in order, and name
   where the logic lives (the application, never the cache).
2. **Engineering** - Compute the origin load left after a cache at a stated hit
   ratio, and explain why hit ratio, not cache latency, is what turns a cache
   into headroom.
3. **Knowledge** - Distinguish what `evictionPolicy` decides (what gets dropped
   under memory pressure) from what `ttlSeconds` decides (how long a value may
   be wrong), and state a staleness bound as a number.
4. **Practical** - Wire a Cache into the read path of a running system so
   repeat reads stop reaching the primary, and pass Submit.
5. **Interview** - Predict the inconsistent-read failure that per-instance
   caches produce behind a load balancer, and name the shared cache tier as the
   fix.
6. **Communication** - Defend caching over another read replica for a
   repeat-read workload, naming the staleness it buys the reduction with.

Each objective is exercised: 1 by "Cache-aside" + quiz Q1/Q2; 2 by the hit-ratio
paragraph + quiz Q6; 3 by "Two knobs, two different questions" + quiz Q3; 4 by
the build itself; 5 by "The wrinkle that makes it a tier" + quiz Q4; 6 by
"Connections" and "In an interview" + quiz Q3.

## 3. Per-beat outline (§5.3, Building Block type per §6)

| Beat | Section in the lesson | Notes |
|---|---|---|
| 1-2 Cold open / why this exists | Untitled opening, 2 paragraphs | Directly pays off 3.13's own "Next" ("3.13 was the last lever for a write-bound database... 3.14 Caching is the highest-leverage tool in this curriculum for the opposite problem"). Felt pressure: one 40 ms aggregate query, identical for every visitor, at 5,000 views/s. Explicitly rules out the already-taught levers (the query is correct, the index is right, 3.12's replica is absorbing its share) so the chapter's own idea is the only one left. |
| 3 Think first | "Think first" callout | Prediction prompt: 85% CPU, 95% of reads unchanged since last asked - what does another replica buy you here? Never graded. Paid off in "Connections" (a replica does the work again; a cache doesn't do it). |
| 4-5 Mental model + visual explanation | "A cache is a bet" | One-sentence anchor stated before the diagram. Primary diagram is the caching-layer topology (§7.1's own row: "Caching layers \| Hit/miss branching \| 3.14, 3.15"), authored as Mermaid - see §5 below on why Mermaid rather than canvas JSON. Captioned on the thing learners get wrong: the Cache sits beside the database, not in front of the app tier, and writes never travel through it. |
| 6-7 Core mechanics / deeper dive | "Cache-aside", "Two knobs, two different questions", "The wrinkle that makes it a tier" | Three sections rather than one: the pattern (table + sequence diagram + hit-ratio arithmetic), the two config fields and why they answer different questions, then the multi-instance wrinkle that motivates `distributed-cache`. The canvas-vs-cache-aside simplification is disclosed in prose here, not only in `simplifications` (open decision 10's standing ask). |
| 8 Trade-offs | "Trade-offs" | Four-row table, costs named both ways: TTL length in both directions, and cache-aside vs. write-through. Closing line names why cache-aside is the usual default (its failure mode is latency, not a longer write path). |
| 9 Failure modes | "What breaks" | Mandatory for Building Block (§0). Three: cache stampede (with three named fixes), the write nobody invalidated, and the cache silently becoming load-bearing. |
| 10 Scaling behavior | "What changes at scale" | Mandatory for Building Block (§0). 10x hit ratio not size; 100x working set outgrows one machine and that machine is an SPOF (motivates partition+replicate); 1000x hot keys concentrate - 3.13's hot-partition problem in a second store - and the remaining win is a closer cache, not a bigger one (sets up 3.15). |
| 11 Production examples | "In production" | Reddit - unused by any prior chapter (AWS 3.1, Netflix 3.2/3.8, Google 3.3, Cloudflare 3.4, Uber 3.5, Stripe 3.6, Shopify 3.7, Airbnb 3.9, Stack Overflow 3.10, Discord 3.11, GitHub 3.12, Instagram 3.13), and on-topic per §13's decision-not-company rule: the same listing requested thousands of times between the votes that change it, with the accepted cost named. |
| 12 Common mistakes | "Common mistakes" | Four: caching before checking that reads repeat; calling per-instance memory a cache tier; treating the cache as a source of truth; never stating the staleness bound. |
| 13 Interview lens | "In an interview" | High relevance, steps 4/5/7 named explicitly. Mandatory §10.3 senior-answer line, built only from this chapter's own vocabulary (hit ratio, shared tier, TTL as staleness, stampede). |
| 14 Connections + Preview of next | "Connections" / "Next" (forward) | Backward: 3.7 (the promised faster session store, paid off), 3.12 (replica does the work again vs. cache doesn't do it), 3.4 + 3.6 (why per-instance caching is predictably broken) - past §19's >=2. Forward: 3.15 only, as the one marked tease, stated twice (end of "Connections", then "Next"). 3.13's hot-partition callback is a backward reference, not a second tease. |
| 15 Recap + knowledge check | "Recap" | Five retrieval anchors (§5.3 allows 3-5). QuizLauncher renders the knowledge check automatically. |
| 16 Transition brief | "Your turn" | Mandatory (real Editor exercise). States the starter graph (3.13's system plus a Cache with its miss path already drawn), the symptom (read load unmoved), and the shape of the fault (a wire, not a config field) without naming the edge. Same "it's a wire, not a config field" steer 3.7's own brief used. |

## 4. Declared omissions and justifications (§6's written-justification rule)

- **CURRICULUM §14's 3.14 row promises "build (cache-aside; simulator's
  hit/miss branching) + fix (per-instance caches) + config (TTL)". Only the
  build/fix half is graded; the other two are realized in the lesson and
  quiz.** Three separate reasons, all checked directly rather than assumed:
  - *The simulator's hit/miss branching does not exist.* Same wall as open
    decision 7, now its sixth instance, resolved by `pending-content.md`'s own
    named degradation path (simulator-dependent beats become quiz questions):
    the branching is the lesson's own sequence diagram plus quiz Q1 and Q6.
  - *"Fix (per-instance caches)" is not drawable on this canvas.* A cache
    living inside an app server's own memory has no expression here - a
    `cache` node is always a separate box, and `app-server`'s `instances`
    field multiplies the server, not anything attached to it. Realized as
    quiz Q4 instead, which is the bank's own reserved diagram question for
    exactly this failure, and as the lesson's own "The wrinkle that makes it
    a tier" section. **Not raised as a new open decision** - unlike decisions
    17 and 19 this is not a missing schema, it is a modelling boundary the
    canvas draws deliberately (a component is a box; per-process memory
    isn't).
  - *The TTL config beat is deliberately not gated by the blueprint.* It
    could be (`{ field: "ttlSeconds", op: "lte", value: 60 }` is expressible),
    and was drafted that way before being pulled. Reason: a failed config
    predicate makes the pattern node bind to nothing, so `blueprint-drift.ts`
    reports it as `missingComponents: ["Cache"]` - "Missing: Cache" while a
    Cache is plainly on the canvas. That is the misleading-drift gap open
    decision 11 already records (3.4's and 3.6's own instances of it), and
    making it this chapter's *primary graded feedback* would be knowingly
    shipping a confusing message on the chapter's own namesake beat. TTL is
    taught in "Two knobs, two different questions" and tested by quiz Q3
    instead. **This is a new argument for decision 11 and is recorded in the
    ledger under it, not as a new decision.**
- **`distributed-cache` is introduced in the palette and taught in the lesson,
  but is not required by the blueprint.** §16 homes both components here, so
  both are in `availableComponentIds`; only `cache` is in
  `requiredComponentIds`. Forcing a Distributed Cache onto a system this size
  would teach exactly the cargo-culting §9 lens 9 exists to inoculate against,
  and §11.1's own rule ("trade-off exercises never have a secretly correct
  option") cuts against gating on a choice the chapter itself says depends on
  scale. The lesson names the two conditions that make the swap right
  (working set past one machine's memory; losing the box takes the database
  with it), and neither holds for this system.
- **No `<Walkthrough>`** - see §5.
- **No §12 nugget devices.** Open decision 5 remains unresolved; this is the
  twelfth chapter to omit and declare rather than make the call unilaterally.
- **No mini challenge (§12, optional device).** No prior chapter has authored
  one, and the only honest variant here (swap the Cache for a Distributed
  Cache) contradicts the previous bullet.
- **Only one production example** (Reddit), matching every prior chapter's
  precedent rather than §13's allowed 1-3.
- **Cache invalidation on write is named, not taught.** Write-through appears
  in the trade-off table and explicit invalidation is named in the same row,
  but the machinery that does it in real systems is 3.17-3.18's. Recorded in
  `simplifications` and `notYetIntroducedConcepts`.
- **No everyday analogy beyond "a cache is a bet"**, which is the §12 memory
  anchor and is carried through the recap. One model per chapter (§5.3 beat 4).

## 5. Diagrams (§7)

Two Mermaid diagrams, one primary and one supporting - the same departure from
§7.2's stated canvas-JSON preference that 3.4's spec first declared and every
chapter since has carried: no MDX-embeddable renderer exists for an
`ArchitectureGraph` inside lesson prose. Checked directly again this pass, not
assumed.

**Primary (beat 5): the caching-layer topology.** §7.1's inventory names this
exact pairing ("Caching layers | Hit/miss branching | 3.14, 3.15"). Mermaid
flowchart: Application Server -> Cache (reads); Cache -> primary (miss: origin);
Application Server -> primary (writes). Captioned on the two things learners
place wrong - the cache sits beside the database rather than in front of the app
tier, and writes never pass through it. This is the same topology the exercise
builds, drawn once (§7.2's "a chapter draws a given topology exactly once").

**Supporting (beats 6-7): the cache-aside sequence.** §7.1 routes this
explicitly ("Sequence diagram | Ordering between parties matters | Auth flows,
**cache-aside**, 2-step writes"), so Mermaid `sequenceDiagram` is CURRICULUM's
own named form for it, not a static-by-habit default. Shows a miss (lookup +
40 ms query + populate) followed by a hit (~1 ms) for the same key. Its caption
carries the point the prose would otherwise have to argue: the miss path costs
*more* than no cache at all, so caching only pays because hits outnumber misses.

**No `<Walkthrough>` authored.** The `walkthrough-diagram` skill is a separate
pass with its own invariants suite, and §7.1 already routes cache-aside to a
sequence diagram by name - so this is a routed choice rather than an
unconsidered omission. Flagged in §12 for a second reader, same as 3.12's spec
flagged its own replication-lag sequence.

**A third diagram exists as quiz Q4** (the per-instance-cache split, rendered
read-only from graph JSON). Deliberately in the quiz rather than the lesson: it
is a *predict the failure* artifact, which is what a `diagram`-kind question is
for, and putting the same split in both places would duplicate a topology.

## 6. Component budget (§16) and cross-reference checks

§16's audit row: "3.14 | `cache`, `distributed-cache`." Checked directly against
`src/content/components/config/caching.ts`: **both already exist, fully wired,
with no engine gap.** `cache` declares `evictionPolicy` (lru/lfu/ttl) and
`ttlSeconds` (1-86400, default 300); `distributed-cache` declares
`replicationFactor` (1-10) and `consistency` (eventual/strong). Both declare
`relations.inputs` as category `compute` + kind `request-flow` and
`relations.outputs` as category `data` + kind `request-flow`, which is exactly
the shape this chapter's build needs (`app -> cache -> primary`). Third
consecutive chapter needing nothing new from the engine - no open decision
raised on components.

`caching.ts`'s own inline comment on `cache.relations.outputs` records why the
miss edge points at `data` and not back at `compute`: "there's no realistic
pattern where a cache calls back to the app server on a miss." That is the
registry taking a position on the read-through vs. cache-aside distinction, and
it is why this chapter discloses the modelling gap in prose (§4, and the
lesson's own "On canvas, a Cache's outgoing edge points at its origin"
paragraph) rather than quietly drawing cache-aside as if the canvas expressed
it.

**Palette split.** `availableComponentIds` is 3.12's ten plus `cache` and
`distributed-cache` (twelve). `requiredComponentIds` is those minus
`distributed-cache` (eleven) - the first chapter where the two lists
deliberately differ, for the reason in §4. Note the consequence for
`authoring-invariants.test.ts`'s brief-spoiler gate: because
`distributed-cache` is available-but-absent-from-the-starter, the brief may not
contain the string "Distributed Cache". It doesn't; `exerciseGoal` and
`successCriteria` are phrased entirely around the symptom.

**Open decision 15's Group D row - first of Group D's three chapters checked,
2026-08-26 - matches.** 2.3's own row for Group D: "reads the database should
not be answering | 3.14-3.16." This chapter's cold open is that sentence in
concrete form (an aggregate query the primary recomputes 4,999 times out of
5,000), and its whole thesis is removing exactly those reads rather than
redistributing them. First of the five remaining rows resolved; Groups E-G and
the rest of Group D (3.15, 3.16) remain open.

**3.7's forward promise checked and paid off.** 3.7's lesson says twice that
"3.14 introduces a store built for this specific job" and that "3.14 gives
externalizing a faster, purpose-built store." §14's row calls this "the promised
payoff." Paid off in prose (the "wrinkle" section names a session lookup on
every authenticated request as the purest repeat read there is) and again in
"Connections", **not** in the graded build - the exercise's starter graph has no
session store to move, since 3.7's own exercise externalized sessions onto the
SQL Database that is still on this canvas. Flagged in §12: a reviewer should
confirm a prose payoff is enough for a promise §14 calls "the promised payoff."

**No forward-vocabulary violations.** Every ScaleCraft-taught term used
(replica, replication lag, shard, hot partition, load balancer, stateless
instances, session store) has a home chapter at or before 3.13. Terms with a
later home (CDN, edge, quorum, consistency spectrum) appear only as marked
teases or as a named-not-derived config field.

## 7. Validation rules (deliverable 4)

`["no-direct-client-database", "component-relations", "orphan-component",
"missing-input-connection", "orphan-read-replica"]` - 3.12's curated set,
unchanged. No new rule authored: this chapter's fault is already exactly
`missing-input-connection`'s documented case, and its explanation text
("it looks wired into the diagram, but no request can ever actually reach it")
reads as if written for a dangling cache.

**Note against open decision 11.** That decision asks whether a chapter's
namesake fault should ever be warning-severity, since `runChapterValidation`
computes `passed` from `errorCount` alone - 3.4, 3.6 and 3.7 all built exercises
on warning-severity faults, so their starter graphs *passed* Validate while
listing an issue. This chapter's fault is `missing-input-connection`, which is
**error**-severity, so Validate genuinely fails on the starter graph. That is a
deliberate choice in this chapter's favour, not luck, and it is worth recording
as evidence for whichever way decision 11 eventually goes.

## 8. Blueprint and starter graph (deliverable 3, part of it)

One blueprint (`bb-3-14-blueprint`) - this chapter has one right answer, so one
pattern (§11.1's "multiple only when the chapter honestly has more than one").
It requires 3.12's full chain unchanged plus `app -> cache` and `cache -> db`,
both `request-flow`.

`starterGraph` reuses 3.12's node-position layout exactly, adds `instances: 3`
on the app server as 3.12 already had it, and adds a Cache in its own row below
the data tier (x 380, y 640) with `evictionPolicy: "lru"`, `ttlSeconds: 60` -
sane values, deliberately *not* a config fault (§4). **One edge is already
drawn: `cache -> db`.** The Cache therefore has an outgoing edge and no
incoming one, which is precisely `missing-input-connection`'s case and not
`orphan-component`'s (that rule explicitly excludes the has-an-outgoing-edge
case). The learner adds one edge, `app -> cache`, and that single edge is the
entire cache-aside read path.

Why a single missing edge rather than a bigger build: the edge *is* the lesson.
A cache with a correct miss path and nobody reading from it is the exact failure
the chapter's thesis predicts, and the drift report for a wrong guess is legible
("Application Server -> Cache (request-flow)"). Two plausible wrong wirings
exist and both fail informatively - `cache -> read-replica` and
`cache -> nosql-database` are legal by `relations` (both targets are category
`data`) but produce a named mismatched connection rather than a bare rejection.

**Starter-graph geometry**, against §11.5: nodes span x 60-700 and y 0-640, so
the bounding box is 840x705 (aspect 1.19, well under the 2.5:1 ceiling). The
Cache at (380, 640) sits 160px below the NoSQL Database at (380, 480) - a 95px
vertical gap against the 65px card, exactly the authored minimum.

**Decorators** (§11.6): four tier zones carried from 3.12 unchanged, plus an
emerald "Cache tier" zone at (352, 592) for the new row, and one slate comment
giving the ~1 ms vs ~40 ms latency contrast. **No magenta gap zone** - the fix
is a wire between two nodes both already on the canvas, not a missing node in
empty space, and §11.6 says a gap zone there would misleadingly imply something
is missing.

## 9. Hints (deliverable 3, part of it)

Three hints (§11.3's orienting-to-directional ramp, never the answer):

1. Validate names one problem and names the component it is about; read what it
   says about *direction*, and note that it is not saying anything is missing
   from the canvas. Orienting - re-points at the explanation the learner already
   has.
2. Trace one read from the load balancer to whatever produces the answer and
   list the nodes it passes; compare that list to the canvas. Directional -
   makes the absence visible without naming it.
3. The Cache knows where to go on a miss; what it has never had is anyone asking
   it a question, and only one tier here issues reads. Most directional, and
   still stops short of "draw an edge from the Application Server to the Cache."

## 10. Quiz (deliverable 5)

Six questions (§3's sanctioned 3-6 range), ramp 1/1/2/2/3/3, matching
3.10-3.13's ramp exactly.

QUIZ_FRAMEWORK.md §11's bank reserves five questions for this chapter (Q1, Q2,
Q3, Q4, Q10 - all tagged "(3.14)"); all five are spent here, adapted with fresh
option labels and full per-option explanations rather than reproduced verbatim.
Q5/Q6 (tagged 3.15) and Q7/Q8/Q9 (tagged 3.16) were left untouched, reserved
for their own chapters.

| This chapter | Source | Notes |
|---|---|---|
| Q1 (single, 1) | bank Q1 | Cache-aside in order. |
| Q2 (single, 1) | original | "Where does the logic live" - the bank's own Q1 note flags this as a separate quiz favourite, so it is authored as its own question rather than folded into Q1's explanation. |
| Q3 (single, 2) | bank Q2 | The staleness contract, stated as a number. |
| Q4 (diagram, 2) | bank Q3 | Per-instance caches behind an LB. **Graph JSON adapted:** the bank's own version leaves both cache nodes with no outgoing edge; `k1 -> d1` and `k2 -> d1` miss edges were added so the diagram matches the pattern this chapter teaches and the registry's own `cache.relations.outputs` contract. Not a doc-drift bug like 3.12's finding (the bank's edges are all legal), just an incomplete drawing - noted here rather than raised as an open decision. |
| Q5 (single, 3) | bank Q4 | Cache stampede, with the three named fixes in the correct option. Distractors are the two neighbouring chapters' failures (3.12 lag, 3.13 hot partition), which is the discrimination the question is actually testing. |
| Q6 (single, 3) | bank Q10 | Hit-ratio arithmetic (100 x 5% = 5). |

**Position-clustering check.** Correct options sit at c, a, d, b, a, d across
the six questions - all four positions used, no letter repeating in consecutive
questions. Checked by eye against both immediate neighbours (the CI test is
per-chapter, not registry-wide): 3.13 runs b, c, a, d, b, c and 3.12 runs
a, c, d, b, c, a, so this chapter deliberately opens on "c", which neither of
them does.

**Scope check.** Every question draws only on this chapter's material and its
prerequisite chain. Q5's distractors name 3.12 and 3.13 by their own taught
vocabulary (replication lag, hot partition), which is backward reference, not
forward. No question requires anything from 3.15 onward.

## 11. Playtest pass (deliverable 6, §18.2's binding question)

*"Which prior chapter taught each move this exercise requires?"*

| Move | Taught by |
|---|---|
| Read a `missing-input-connection` violation and act on it | 3.11's own Completion-fix exercise is the learner's first encounter with this exact rule; the explanation text is unchanged since. |
| Recognize that a component with an outgoing edge can still be unreachable | Taught fresh in this chapter's own "Your turn" framing and, before that, by the rule's own explanation, which the learner reads on Validate. The distinction from a fully-disconnected node was established by 3.7's orphan exercise, which is its complement. |
| Draw a `request-flow` edge from the app tier to a data-adjacent component | Established from 1.2 onward and reinforced every chapter since (`app -> db`, `app -> nosql`). This edge is the same shape, at a component introduced in this chapter's own lesson and diagram. |
| Know that the Cache belongs on the read path and not the write path | Taught fresh in this chapter's primary diagram and its caption, both of which precede the exercise. |
| Leave the replica's read path and the write path alone while adding a third path | Building on 3.12's own "two paths for two jobs" result, applied a second time - the exercise's `successCriteria` state it as an observable outcome rather than an instruction. |
| Choose the primary as the cache's origin rather than the replica or the NoSQL store | Building on 3.12 (the replica is a copy fed *from* the primary) and 3.11 (two stores, two jobs). Both wrong choices are legal on canvas and produce a named blueprint mismatch, not a silent failure. |

No move is unsourced.

## 12. Items flagged for a second pass

- **The TTL config beat is ungated, on purpose (§4).** A second reader should
  confirm the reasoning holds - that "Missing: Cache" as the feedback for a
  too-long TTL is worse than teaching TTL in prose and quiz - or overrule it if
  decision 11's drift-message gap gets fixed first.
- **3.7's "promised payoff" is paid off in prose, not in the build (§6).**
  §14 uses the phrase "the promised payoff" about the session store moving to
  its proper home. Nothing on this canvas represents a session, so the payoff
  is argued rather than performed. A reviewer should confirm that is enough, or
  scope a starter-graph change that makes it concrete.
- **One added edge is a small build for a 35-minute Building Block chapter.**
  Defended in §8 (the edge is the pattern), but a second reader should confirm
  it doesn't read as thin next to 3.12's remove-one-add-two.
- **No `<Walkthrough>` for the cache-aside sequence (§5)**, despite it being a
  defensible candidate under §7.2's stepping rule. Routed to a Mermaid sequence
  diagram by §7.1's own naming of cache-aside; flag for a dedicated
  `walkthrough-diagram` pass if a reviewer disagrees.
- **Word count.** 1,964 words (`wc -w` on the raw `.mdx`) for a 35-minute
  estimate, against 3.12's 1,375 for 30 minutes and 3.13's 1,267 for 30. Higher
  per minute than either. The chapter carries two new components, two config
  fields with distinct jobs, a pattern, a failure taxonomy and the
  multi-instance argument, so length following content (§20.6) is the claim -
  but it is a self-assessment and should be checked.
- **A density revision pass was performed as a distinct round** (2,021 words to
  1,909 before the §4 disclosure paragraph was added back), unlike every prior
  chapter, which flagged the claim instead. It should still be checked rather
  than trusted.

**Not done (out of `chapter-author`'s scope):** `tsc`/`lint`/`vitest`/`build`
not run, no Playwright - content-only pass.
