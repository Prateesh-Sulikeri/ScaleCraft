# Chapter spec - 3.16 Search Systems

Authored under CURRICULUM.md §5 (chapter blueprint), §6 (mandatory sections),
§20 (author instructions). Deliverable 1 of the 6 in pending-content.md's
"Per-chapter deliverables". Lives beside the lesson so a reviewer can check the
prose against the intent that produced it.

- Chapter definition: `src/content/chapters/index.ts` (`bb-3-16-search-systems`)
- Lesson body: `public/content/chapters/bb-3-16-search-systems.mdx`
- Manifest row: `src/curriculum/manifest.ts`, slug `3-16-search-systems`
  (`chapterDefinitionId` flipped from `null` to the id above)

**Wave.** Third and final Group D chapter, authored immediately after 3.15 in
this same working tree. Same out-of-wave-plan note every Wave 3/4 chapter's spec
has carried: the real prerequisite (3.15) is already authored, so no sequencing
rule (§18.2) is violated - only `pending-content.md`'s wave grouping (Group D is
Wave 5) is out of order relative to actual authoring order. This chapter closes
Group D and puts Checkpoint R1 next.

## 0. Type classification

Building Block, per §4/§16 - CURRICULUM §14's own row states "**New:
`search-engine`**" and §16's audit table lists "3.16 | `search-engine`".
Consequence, same as 3.11/3.12/3.14/3.15: Failure modes and Scaling
considerations are **M** (mandatory), not **o** - both appear as full sections.

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Why `LIKE '%term%'` doesn't scale, what an inverted index reverses, and search as the learner's first piece of derived data - a second store that must be kept in sync with a source of truth. Per CURRICULUM §14's own row. |
| Type | Building Block (see §0). |
| Difficulty | intermediate - matches `manifest.ts`'s existing `difficulty: "intermediate"` and §14's Group D heading. |
| Estimated time | 30 minutes (Reader + Editor combined), per §14's own row and `manifest.ts`'s existing `estimatedMinutes: 30`. |
| Prerequisites | 3.15 CDN. `manifest.ts`'s `prerequisiteSlugs` already pointed at `3-15-cdn` before this chapter was authored. |
| Unlocks | Checkpoint R1 (`manifest.ts` row order), which gates Groups E, F and G plus RWE Tier 1. |
| Building blocks introduced | `search-engine` (field `shards`). No new edge kind - and the missing edge kind is this chapter's own closing argument (§4). |
| Stages trained | Part 3's default (stages 2-4) plus a construction stage - a Build: one node placed, one edge drawn. |
| Interview relevance | Medium-High, per §14's own note - steps 4 (high-level design: any product with a search box has a second store in its first architecture) and 5 (the deep dive is the sync path and the freshness target, never the index itself). |
| Production relevance | Any product with a search box over more than a few tens of thousands of records. Slack's separately-indexed message search is the in-lesson example. |

## 2. Learning objectives (§5.2)

Six objectives (§5.2's range is 3-7). All five categories present; Practical is
not exempted, since this is a Building Block chapter with a real build.

1. **Knowledge** - Explain why a leading-wildcard match reads every row, and why
   a replica, a cache and a CDN each fail to reduce that cost for a different
   reason.
2. **Knowledge** - Describe an inverted index as a map from term to the
   documents containing it, and name what that reversal changes about the cost
   of a query.
3. **Engineering** - Decide which of three sync paths fits a given freshness
   requirement, naming what each one costs.
4. **Practical** - Add a second store that answers text queries, wired so the
   primary stays the only source of truth, and pass Submit.
5. **Interview** - Answer "is a ten-second search lag acceptable?" by stating a
   freshness target and naming the one flow that breaks under it.
6. **Communication** - Defend a database's own full-text search over a separate
   search cluster at small corpus size, naming the specific ceiling that changes
   the answer.

Each objective is exercised: 1 by the cold open + quiz Q1/Q2; 2 by "What an
inverted index actually is" + the walkthrough; 3 by the sync-path table + quiz
Q4; 4 by the build itself; 5 by "In an interview" + quiz Q5; 6 by "Trade-offs"'
closing paragraph + quiz Q6.

## 3. Per-beat outline (§5.3, Building Block type per §6)

| Beat | Section in the lesson | Notes |
|---|---|---|
| 1-2 Cold open / why this exists | Untitled opening, 2 paragraphs | Pays off 3.15's own "Next" in its own terms ("the read with no copy to keep"). Felt pressure: 12 ms on 5,000 rows, 6 seconds on 4.2 million, with an index already on the column. The mechanism is named immediately (a leading `%` leaves no prefix to seek to) so the chapter is never about a mystery. |
| 3 Think first | "Think first" callout | Prediction prompt naming all three levers already taught (replica copies the store, cache and CDN copy the answer) and why each is defeated. Never graded. Paid off in "A second store, shaped by the question" and again in "Connections". |
| 4-5 Mental model + visual explanation | "A second store, shaped by the question" | One-sentence anchor before the diagram: the primary finds a product from an id, search needs the inverse. Primary diagram is the `<Walkthrough>` - see §5 below. |
| 6-7 Core mechanics / deeper dive | "What an inverted index actually is", "The obligation you just took on" | The index as a three-row term-to-postings table with the cost argument stated as a number, then analysis and ranking in one paragraph each. Then the chapter's real content: derived data, the rebuildability rule, and a three-row sync-path table. Closes on the edge that does not exist yet, which is §14's own requirement made structural rather than rhetorical. |
| 8 Trade-offs | "Trade-offs" | Four-row table, costs named both ways: sync vs. async indexing, and whole documents vs. ids-plus-hydration. Followed by the trade-off under all four (a separate engine at all, vs. the database's own full-text support), which is §9 lens 3 and lens 9 in the same paragraph. |
| 9 Failure modes | "What breaks" | Mandatory for Building Block (§0). Four: silent divergence from a half-failed dual write, read-your-writes on search (3.12's problem in a store that lags for a different reason), deleted-but-still-indexed, and the reindex that reproduces the load the index existed to prevent. |
| 10 Scaling behavior | "What changes at scale" | Mandatory for Building Block (§0). 10x memory (posting lists want to be resident, so latency degrades with corpus rather than traffic); 100x shard the index and fan out, making tail latency the slowest shard's, then replicate each shard - the two axes named separately; 1000x indexing and serving as separate fleets, and freshness promoted from side effect to published number. |
| 11 Production examples | "In production" | Slack - unused by any prior chapter (AWS 3.1, Netflix 3.2/3.8, Google 3.3, Cloudflare 3.4, Uber 3.5, Stripe 3.6, Shopify 3.7, Airbnb 3.9, Stack Overflow 3.10, Discord 3.11, GitHub 3.12, Instagram 3.13, Reddit 3.14, Wikipedia 3.15), and on-topic per §13's decision-not-company rule: the decision is a separate index, the accepted trade-off is the sync table's second row, and the paragraph closes with §9 lens 9 (the same trade is wrong at 200,000 documents). |
| 12 Common mistakes | "Common mistakes" | Four: treating the index as a store; indexing synchronously to avoid lag; reaching for a cluster before the database's own full-text index; expecting search to enumerate (exact counts and deep pagination). |
| 13 Interview lens | "In an interview" | Medium-High, steps 4 and 5 named, with the point that naming the component is the easy half. Mandatory §10.3 senior-answer line, built only from this chapter's own vocabulary (inverted index, change stream, dual write, freshness target, read-your-writes, pure projection). |
| 14 Connections + Preview of next | "Connections" / "Next" | Backward: 3.11 (a store's shape decides which questions are cheap), 3.12 (a copy that lags, but the same shape answering the same query), 3.14 and 3.15 (both kept the answer; this query has no answer to keep) - past §19's >=2. Forward: 3.17 only, marked, at the end of "Connections". "Next" names R1, which is what actually follows in `manifest.ts` - see §4. |
| 15 Recap + knowledge check | "Recap" | Five retrieval anchors (§5.3 allows 3-5). QuizLauncher renders the knowledge check automatically. |
| 16 Transition brief | "Your turn" | Mandatory (real Editor exercise). States the starter graph (3.15's system, complete and correct), repeats that Validate will report nothing, and names the symptom (a query no component here is organized around) plus the goal (somewhere to land whose cost is the match, not the catalog) without naming the component, the field, or the edge. |

## 4. Declared omissions and justifications (§6's written-justification rule)

- **CURRICULUM §14's 3.16 row promises "build (search fed from the primary DB;
  the awkward sync edge is the lesson)". The build ships; "fed from the primary
  DB" is not drawable, and that is the lesson rather than a workaround.**
  Checked directly against `src/content/components/config/data.ts`:
  `search-engine.relations.inputs` allows category `compute` + kind
  `request-flow` only, and `sql-database.relations.outputs` allows category
  `data` + kind `replication` only. A `sql-database -> search-engine` edge is
  therefore rejected from both ends by `component-relations`, in either kind.
  The single legal edge is `app-server -> search-engine`, request-flow. §14's
  own parenthetical anticipates exactly this ("the sync arrow can't be
  request-flow, and doing it synchronously is wrong; the chapter lets the
  learner feel that before Group E names the machinery"), so the registry and
  the curriculum agree: the arrow the indexing path wants does not exist yet.
  The lesson says this outright in its own prose and again in the blueprint's
  debrief `commentary`, rather than letting the drawn edge imply that indexing
  is a synchronous request. **Deliberately not raised as an open decision** -
  nothing is missing that should be here at 3.16. The `async` edge kind exists
  in `EdgeKind` and arrives, on schedule, in 3.17.
- **`search-engine` has no output port**, so results returning to the app tier
  are implied rather than drawn. This is the same convention every read path in
  every prior chapter uses (3.14's `app -> cache`, 3.12's `replica -> app` being
  the exception that proves it), so it is recorded in `simplifications` and not
  treated as a gap.
- **The `shards` config field is taught in the scaling section and not gated.**
  It is the one field on the component, and it defaults to 1, which is correct
  for a system this size. Gating it would be the config-predicate drift trap
  open decision 11 already records three times (a failed predicate reports as
  `missingComponents: ["Search Engine"]`), and it would also teach a learner to
  shard an index at 4.2 million documents, which §9 lens 9 exists to inoculate
  against. Recorded as a further instance under decision 11, not a new decision.
- **"Next" names Checkpoint R1, and the single §19 forward tease is 3.17.**
  These are different targets, which no prior chapter has had to reconcile
  because no prior chapter has been the last one before a checkpoint. §6 requires
  "Preview of next chapter" to name what actually comes next, which
  `manifest.ts` says is R1; §14's own row requires this chapter to be "the
  conceptual bridge into Group E", which means the tease must be 3.17. Resolved
  by putting the marked tease at the end of "Connections" (§19's placement, beat
  14) and giving "Next" to R1 alone. R1 is a checkpoint over already-taught
  material, so it is a preview, not a forward reference to untaught content -
  §19's one-tease rule is not spent on it.
- **No §12 nugget devices.** Open decision 5 remains unresolved; this is the
  fourteenth chapter to omit and declare rather than make the call
  unilaterally. As 3.15's spec noted, individual chapters should stop declaring
  this one by one.
- **No mini challenge (§12, optional device).** No prior chapter has authored
  one.
- **No RWE cross-reference in the Interview lens.** §19 asks Interview lens
  sections to name which RWE projects exercise the chapter's material, and §15's
  own tables list six that lean on 3.16 (Metrics Monitoring, Price Tracking,
  News Aggregator, Facebook Post Search, Yelp, InShorts, Strava). Checked by
  grep: **no authored lesson names an RWE project**, so adding it here alone
  would make this chapter diverge from fifteen neighbours for no reader benefit -
  the same reasoning §12's nuggets have been omitted under. Worth a single
  retrofit pass across every authored chapter rather than starting mid-Group-D.
- **Only one production example** (Slack), matching every prior chapter's
  precedent rather than §13's allowed 1-3.
- **Change-data-capture is named as a sync path, not taught.** "Follow the
  primary's change stream" is one row of a three-row table; what reads the
  stream, how it is made durable, and what happens when it falls behind are
  Group E and F material. Recorded in `simplifications` and
  `notYetIntroducedConcepts`.
- **Scoring functions, synonyms, typo tolerance and faceting are named, not
  developed.** They appear in the trade-off paragraph and in quiz Q6's scenario
  because they are what a product manager actually asks for, but §20.2's depth
  calibration puts BM25 and edit-distance matching past "one interview follow-up
  past the surface".

## 5. Diagrams (§7)

**One diagram, and it is a `<Walkthrough>`** (`src/chapters/walkthrough/`) -
the second consecutive chapter to make that choice, under §7.2's own routing
rule ("if the same nodes/edges benefit from stepping through... author it as a
`<Walkthrough>`"). This topology has a sequence in it that no static picture
carries: the same three-node shape is a write in steps 1-2, a read in steps 3-5,
and a divergence in step 6, and the whole point of the chapter is that those are
different journeys over identical arrows.

- **Nodes:** Browser, App Server, SQL Database, Search Engine - four
  `kind: "component"` nodes against real registry ids, auto-laid-out (no
  hand-placed positions, per the diagram pipeline's own rule).
- **Edges:** three, all `request-flow`, all legal against the registry's
  `relations`: `browser -> app`, `app -> db`, `app -> search`. No `control`,
  `replication` or `async` edge appears, so none of open decision 8's
  `control`-edge gap applies. **The `app -> search` edge is deliberately drawn
  once and used by three different steps** (the indexing write, the query, and
  the failure) rather than duplicated per job - two edges between the same pair
  would overlap visually and would imply the canvas can distinguish jobs it
  cannot.
- **No algorithm variants.** The obvious candidate was the sync path (dual write
  vs. change stream), and it was rejected: a variant can change captions and
  highlights but not edge kinds or endpoints, so both variants would be the same
  request-flow arrow described two ways - the exact misreading this chapter
  exists to prevent. `walkthrough-invariants.test.ts` requires >=2 entries if
  `algorithms` is present at all, and one honest variant is not two.
- **Step 6 is a failure step, and open decision 14 still bites.** §7.2 requires
  failure diagrams to show the failure rather than caption it, and
  `WalkthroughStep` still has no faulted node/edge state. Handled the way 2.2
  handled it: the caption carries the failure explicitly and the highlight set
  is the two things that disagree (`app`, `search`, and the edge between them),
  with the SQL Database left dark because it is the one that is right. Recorded
  as a workaround for a missing capability, not a satisfied rule.
- **Caption:** the "Note:" line beneath names what to notice - the App Server
  writes to both stores and reads from both, and only one of the two can be
  rebuilt from the other.
- **One non-topology table stands in for a second diagram.** The inverted index
  is a data structure, not a topology, and a three-row term-to-postings table
  reads faster than any picture of the same thing would (§20.6's scan-value
  rule). §7.2's one-topology rule is not engaged - it is not a topology.
- **No graph-JSON topology diagram**, for the reason every chapter since 3.4 has
  recorded (open decision 3): there is no MDX-embeddable renderer for an
  `ArchitectureGraph` in lesson prose.

## 6. Component budget (§16) and cross-reference checks

§16's audit row: "3.16 | `search-engine`." Checked directly against
`src/content/components/config/data.ts`: **`search-engine` already exists, with
no engine gap for what this chapter builds.** Category `data`, one input port
("Query/Index"), **no output port**, one field `shards` (1-100, default 1,
integer), and `relations.inputs` restricted to category `compute` + kind
`request-flow`. That makes `app-server -> search-engine` legal and everything
else illegal, including the `sql-database -> search-engine` edge §14's row
describes in prose - see §4, where that constraint is the chapter's own thesis
rather than a blocker. Fifth consecutive chapter needing nothing new from the
engine.

**Palette split.** `availableComponentIds` is 3.15's thirteen plus
`search-engine` (fourteen). `requiredComponentIds` is those minus
`distributed-cache` (thirteen) - `distributed-cache` stays
available-but-not-required for the reason 3.14's own spec recorded. Consequence
for `authoring-invariants.test.ts`'s brief-spoiler gate: both "Search Engine"
and "Distributed Cache" are components absent from the starter graph, so neither
string may appear in `exerciseGoal`, `successCriteria`, or (per §11.6's own
extension of the rule) any `starterDecorators` label or comment. Neither does;
the brief is phrased entirely around the query's cost and where products live,
and the gap zone is labeled "Build here".

**Open decision 15's Group D row - third of three checked, 2026-08-27 - matches,
and closes the row.** 2.3's row for Group D: "reads the database should not be
answering | 3.14-3.16." 3.14 removed the repeat read from the database; 3.15
removed the request from the network before it could become a read; this chapter
removes the read the database was never able to answer well in the first place -
the same row's strongest case, since here the database is not merely a
suboptimal place to send the read but the wrong shape for it entirely. Group D
is the third of the seven groups (after A and B, with C) to fully resolve its own
row. Groups E-G remain open.

**3.15's forward promise checked and paid off.** 3.15's "Connections" ends
"Coming in 3.16: a read that no amount of copying helps, because your database
cannot answer it well at any distance," and its "Next" spells out the terms:
"'every product whose description mentions waterproof' is a question your
database answers by reading every row, and a cache in front of it helps nothing
when every search is a different question." This chapter's first two paragraphs
pay off both halves in those exact terms (the row-scan and the long tail), the
Think-first callout makes the ruling-out explicit for all three prior levers, and
quiz Q2 grades it.

**No forward-vocabulary violations.** Every ScaleCraft-taught term used (index,
replica, replication lag, read-your-writes, cache, hit ratio, TTL, CDN, edge,
source of truth, request-flow, load balancer, stateless tier) has a home chapter
at or before 3.15. General engineering vocabulary introduced just-in-time in a
clause, per the writing register: leading wildcard, stemming, stop words,
posting list, tokenizing, change stream, hydration, fan-out, corpus. Terms with a
later home (queues, workers, the `async` edge kind, event streams, background
jobs, object storage) appear only as marked teases or in
`notYetIntroducedConcepts`. "Derived data" is introduced here, and this is its
home chapter - §14's own row names it.

## 7. Validation rules (deliverable 4)

`["no-direct-client-database", "component-relations", "orphan-component",
"missing-input-connection", "orphan-read-replica"]` - 3.14's curated set,
unchanged for a third chapter. No new rule authored.

**Second consecutive starter graph that validates clean on purpose.** 3.15's own
spec §7 recorded the first, and the reasoning is unchanged here: the system is
genuinely correct, and the problem is the shape of a query, which no validation
rule measures. Both the transition brief and hint 1 say so before the learner
opens the Editor - hint 1 with different wording than 3.15's, since the argument
is now "look at what each component is organized around" rather than "distance
isn't a wiring fault". Consequences:

- **Submit's blueprint drift is the graded feedback surface.** A learner who
  submits unchanged gets `missingComponents: ["Search Engine"]`, which is
  accurate (the component really is absent) rather than the misleading form open
  decision 11 tracks.
- **The rule set earns its place during the build, not at the start.** A Search
  Engine dropped on the canvas and left unwired has no outgoing edge either
  (no output port), so it fires `orphan-component` rather than
  `missing-input-connection`. A learner who tries the intuitive
  `sql-database -> search-engine` edge - the one §14's own row describes in
  prose - is stopped by `component-relations`, which names the component's own
  declared input contract in its explanation. That second case is the chapter's
  own thesis delivered by the validation engine, which is exactly what §11.1's
  productive-failure framing wants. **Flagged for a playtest read (§12):** the
  explanation is generic ("Search Engine's own declared input rules don't allow
  a connection from a SQL Database"), and whether a learner reads it as "wire it
  from the app tier instead" or as "the tool is wrong" is a real question.

## 8. Blueprint and starter graph (deliverable 3, part of it)

One blueprint (`bb-3-16-blueprint`) - one right answer, one pattern (§11.1's
"multiple only when the chapter honestly has more than one"; here the registry
allows exactly one legal edge into the new component, so there is no second
shape to honour). It requires 3.15's full solved chain plus a `search-engine`
node with `app -> search`, request-flow.

`starterGraph` is 3.15's starter with 3.15's own answer applied - the CDN placed
at (380, 160), `dns -> cdn -> firewall` drawn, and the now-redundant direct
`dns -> firewall` edge removed. Twelve nodes, thirteen edges, node ids
re-prefixed `bb-3-16-`. **3.15 deliberately allowed both the delete-it and
keep-it builds** (its blueprint required neither `dns -> fw` nor its absence);
this chapter has to pick one concrete graph to hand forward and picks the
cleaner one, which is also the one 3.15's own debrief commentary describes.

**No `forbid` pattern**, same as 3.15 and every prior chapter, and for the reason
3.15's spec recorded: `blueprint-drift.ts` computes its whole report from
`require` alone, so a learner who trips a `forbid` fails Submit and reads a drift
report naming nothing missing and nothing mismatched. Nothing here needs a
deletion, so nothing is lost by avoiding it.

**The `nosql` node keeps 3.15's `model: "document"` config predicate.** Carried
forward for consistency rather than re-litigated. It can only fail for a learner
who deliberately changes a dropdown the exercise never mentions, and it would
then report "Missing: NoSQL Database" - open decision 11's known drift shape,
inherited rather than newly introduced.

**Starter-graph geometry**, against §11.5: unchanged from 3.15 - nodes span
x 60-700 and y 0-640, bounding box 840x705 (aspect 1.19, under the 2.5:1
ceiling), five rows of at most three columns at the 320x160 pitch. The Search
Engine's intended slot is (700, 640), the unused right-hand column of the bottom
row: 320px from the cache horizontally (120px gap against the 200px card, exactly
the authored minimum) and 160px below the read replica (95px gap against the 65px
card, also the minimum).

**Decorators** (§11.6): 3.15's zones carried forward with one change and one
addition. 3.15's magenta gap zone at (352, 112) is now occupied by the CDN, so it
is relabeled to the blue **Edge** tier it belongs to, matching §11.6's palette
row for edge components. A new magenta **"Build here"** gap zone sits at
(672, 592), covering the empty bottom-row slot - warranted under §11.6 because
the fix is a genuinely missing node in identifiable empty space, not a rewire.
Two slate comments (§11.6 allows at most 2), both restating lesson-public facts
and neither naming a component or a fix: the 4.2 million-row scan, and the
long-tail query distribution that makes copying an answer useless. Zone/zone
overlap checked by hand: the bottom row's two zones occupy x 352-608 and
x 672-928 respectively (disjoint), the second row's occupy x 32-288 and
x 352-608 (disjoint), and every other zone sits in its own y band.

## 9. Hints (deliverable 3, part of it)

Three hints (§11.3's orienting-to-directional ramp, never the answer):

1. Validate is quiet again, and the reason is structural: look at what each
   existing component is organized around - a request path, a copy of an answer,
   or products keyed by id - and notice the query is none of those. Orienting,
   and it re-defuses the "is the button broken?" reading a second clean starter
   risks, with a different argument than 3.15's.
2. The data does not need to move; it needs to exist a second time, arranged so
   a word leads to products rather than an id leading to a product. Directional -
   restates the chapter's mental model as a property of the thing to add, and
   rules out "change a setting on something already here".
3. Only one tier is allowed to talk to whatever you add - the same one that
   already talks to the database and the cache - and drawing the edge from
   anywhere else will make the component say why it refused. Most directional,
   and still stops short of "add a Search Engine and draw App Server to it". It
   also pre-empts the `sql-database -> search-engine` attempt §7 flags, without
   spoiling that the attempt is available.

## 10. Quiz (deliverable 5)

Six questions (§3's sanctioned 3-6 range), ramp 1/1/2/2/3/3, matching
3.10-3.15's ramp exactly. All six are `single` - no `multi`, `matching`,
`ordering` or `diagram` question, because every decision this chapter tests has
one defensible answer and a set of real wrong positions, which is `single`'s
shape.

QUIZ_FRAMEWORK.md §11's bank reserves three questions for this chapter (Q7, Q8
and Q9, all tagged "(3.16)"); **all three are spent here.** The other three are
original. Group D's bank is now fully consumed: 3.14 took Q1-Q4 and Q10, 3.15
took Q5 and Q6, and this chapter takes Q7-Q9.

| This chapter | Source | Notes |
|---|---|---|
| Q1 (single, 1) | bank Q7 | Why `LIKE '%term%'` dies in production, with the bank's own answer expanded to name the growth rate rather than just the scan. Distractors rewritten as three real diagnoses (under-provisioned hardware, a missing `LIMIT`, out-of-line text storage), each wrong for an articulable reason - the bank's own "LIKE is deprecated" and "databases block `%`" options are joke options under §1 point 3 and were not carried over. |
| Q2 (single, 1) | original | Whether a cache fixes it, with the numbers stated (90,000 distinct strings a day, top 200 = 8%). Exists because 3.14 and 3.15 spent two chapters teaching the reflex this chapter has to break, and the correct option concedes that head-caching is real before saying why it is not a fix. |
| Q3 (single, 2) | bank Q8 | The derived-data obligation. Distractor D ("search becomes the read path, the primary serves writes only") is new and is the misconception with the worst consequences - it is the one that turns a projection into data you can lose. |
| Q4 (single, 2) | original | The dual-write objection. Distractor A (it is slower) is true and is explained as true-but-weaker rather than wrong, per §1 point 3; distractor C (use a distributed transaction) correctly diagnoses the atomicity problem and proposes the worse cure, which is the most senior-sounding wrong answer available here. |
| Q5 (single, 3) | bank Q9 | The freshness SLO. The bank's own "yes, and lag can be unbounded" option is kept in substance (option C) because an unbounded lag really is what people mean when they wave the question away, and its explanation names why: there is no alert you can write for it. |
| Q6 (single, 3) | original | Three engineers, 200,000 documents, and a feature list. §9 lens 9 as a graded question. The dedicated-cluster distractor is written as a genuine position with a real argument (retrofitting later means a migration) rather than a straw man, because it is the answer most candidates give. |

**Position-clustering check.** Correct options sit at a, c, b, d, a, c - all four
positions used, no letter repeating in consecutive questions. Checked by eye
against neighbours (the CI test is per-chapter, not registry-wide): 3.13 opens
on "b", 3.14 on "c", 3.15 on "d", so this chapter opens on "a", the position none
of the last three used first.

**Scope check.** Every question draws only on this chapter's material and its
prerequisite chain. Q2 leans on 3.14's hit-ratio arithmetic and Q5's distractor D
on 3.12's consistency vocabulary, both backward references. No question requires
anything from 3.17 onward - notably Q4's correct answer describes the dual-write
failure without naming a queue, and Q5's names a change-stream lag without naming
the machinery that produces it.

## 11. Playtest pass (deliverable 6, §18.2's binding question)

*"Which prior chapter taught each move this exercise requires?"*

| Move | Taught by |
|---|---|
| Add a component from the palette to the canvas | 1.2 onward, and every Completion/Build chapter since. 3.15 is the immediate precedent, and used the same magenta gap-zone affordance. |
| Draw a `request-flow` edge from the application tier to a data-tier component | 3.10 (`app -> sql-database`), 3.11 (`app -> nosql-database`) and 3.14 (`app -> cache`) all did exactly this. The new component is a different box on the same established edge. |
| Recognize that a second store can hold the same data in a different shape | 3.11's whole argument (a store's shape decides which questions are cheap) plus 3.12's replica, which established that the same data legitimately exists in more than one place. This chapter's lesson supplies the step neither of those took - that the second copy can be a different *shape*. |
| Leave the primary as the only source of truth while adding a store beside it | 3.12 taught the primary/replica asymmetry (only the primary accepts writes); this is that asymmetry generalized, and it is stated in `successCriteria` as an observable outcome rather than an instruction. |
| Act on an exercise where Validate reports nothing | 3.15, one chapter earlier, and named again here in both the transition brief and hint 1 rather than assumed to have stuck. |
| Leave the edge tier, cache, replica and write paths untouched while adding a store | 3.14 and 3.15 both ended this way, and 3.15's own `successCriteria` used the same "everything behind it is untouched" phrasing. |

No move is unsourced.

## 12. Items flagged for a second pass

- **The second consecutive clean-validating starter graph.** 3.15's spec flagged
  the first as a deliberate novelty a reviewer should confirm reads as a lesson
  rather than a broken button. Two in a row is a pattern rather than a novelty,
  and the question for a playtest is now sharper: does a learner who has seen
  Validate stay quiet twice start ignoring the button? The counter-argument is
  that both chapters say so in the brief and in hint 1, and that Group D is
  simply where the problems stopped being wiring faults - but it should be
  checked, and a third clean starter in a row would need a real justification.
- **`component-relations`' explanation on the `sql-database -> search-engine`
  attempt (§7).** That attempt is the intuitive one and the one §14's own row
  describes, so a meaningful number of learners will make it. The explanation
  they get is generic. A reviewer should decide whether that is enough or
  whether this chapter warrants a scoped rule with teaching-quality text - which
  would be new validation-rule work, not a content change.
- **The missing `async` edge as a pedagogical device (§4).** The lesson argues
  that the edge the indexing path wants does not exist yet, and treats that
  absence as the bridge into Group E. This is the strongest reading of §14's own
  parenthetical, but it does mean the chapter's headline insight is delivered by
  something the learner cannot do rather than something they can. A reviewer
  should confirm that lands as intended rather than as a limitation of the tool.
- **`WalkthroughAlgorithmSelect`'s hardcoded aria-label**, flagged in 3.15's
  spec §5, is not reached by this chapter (no `algorithms` prop, so no selector
  renders). Noted so the flag is not assumed resolved.
- **Word count.** 2,159 words including table cells, roughly 1,875 excluding
  them, for a 30-minute estimate - against 3.15's 1,721 for 25 and 3.14's 1,964
  for 35. That is 62 prose words per minute, between 3.14's 56 and 3.15's 69,
  and it is a self-assessment that should be checked rather than trusted. The
  argument for it: three tables account for about 285 of those words and read at
  a glance, and a six-step walkthrough consumes reader time at no word cost.
- **A density revision pass was performed as a distinct drafting round** (2,275
  words down to 2,159), the third chapter to do so rather than flag the claim.
  Eleven passages were rewritten; the largest cuts were the scaling section, the
  production paragraph, the recap, and the analysis/ranking paragraph. No beat
  or mandatory section was dropped in the process.

**Verification.** No new tests written and no Playwright. The repo CI pipeline
was run after authoring, per CLAUDE.md's personal-preference note.
`walkthrough-invariants.test.ts` is what gates this chapter's `<Walkthrough>`.
One existing fixture needed the same mechanical update every registered chapter
needs: `src/content/chapters/index.test.ts` asserts the exact list of registered
building-blocks chapter ids, and `bb-3-16-search-systems` was appended to it.
