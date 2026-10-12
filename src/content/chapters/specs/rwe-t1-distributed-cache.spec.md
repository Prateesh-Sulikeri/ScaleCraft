# Chapter spec - RWE Tier 1: Distributed Cache (Design One)

Authored under CURRICULUM.md §5, §6, §15 and §20, and QUIZ_FRAMEWORK.md §16.
Deliverable 1 of the 6 in pending-content.md's "Per-chapter deliverables".

- Chapter definition: `src/content/chapters/index.ts` (`rwe-t1-distributed-cache`)
- Lesson body: `public/content/chapters/rwe-t1-distributed-cache.mdx`
- Manifest row: slug `rwe-t1-distributed-cache` (`chapterDefinitionId` flipped from `null`)

**Wave.** `pending-content.md`'s Wave 5 (RWE Tier 1 remainder). Precedent: RWE
Tier 1 Bitly's spec §0 and §2 (no `curriculumContext`, inert `validationRuleIds`,
one exercise, no gap zone) apply unchanged.

## 0. Type classification

**RWE Project** (§4). All ten §6-mandatory RWE sections present; all four optional
ones used (Think first, Mental model as the paragraph under "The numbers", Core
mechanics as "Consistent hashing" and "Eviction is a bet", Preview of next).

**New concepts: 2**, exactly §15.2's row: consistent hashing (concept); eviction
policies as design choices.

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Design the inside of a caching tier: how keys are placed, what a lost machine costs the origin, and what to evict - and defend spending memory or a burst. |
| Type | RWE Project |
| Difficulty | intermediate (manifest) |
| Estimated time | 70 minutes (manifest). Lesson ~1,900 words of prose plus one walkthrough. |
| Prerequisites | Checkpoint D. |
| Unlocks | Nothing; Tier 1 peers are unordered. |
| Building blocks introduced | None (§16). |
| Reinforces | 3.14 internals (the Distributed Cache "partitioned and replicated" sentence, opened up), 3.13 partitioning and hot partition, 3.9 discovery (membership). Exactly §15.2's row, all inside the prerequisite chain. |
| Stages trained | §2 stages 5 and 6. |
| Interview relevance | High - "design a distributed cache" (build Memcached/Redis). Feeds steps 2 (API), 3 (working set vs memory, read rate vs origin), 5 (key placement), 6 (a node dies). |
| Production relevance | The cold open is the most common caching incident there is: the cache became load-bearing, and one reboot proved it. |
| Interview-canon note | "Inside the box": a component the candidate has drawn as one card many times, now designed from the inside. |

## 2. Learning objectives (§5.2)

1. **Knowledge** - Choose an eviction policy for a stated access pattern, naming
   the read pattern that defeats it.
2. **Engineering** - Explain why hash mod N moves most keys when N changes and a
   ring moves about 1/N, including what virtual nodes add.
3. **Interview** - Answer "a cache node dies, what happens?" by computing what
   reaches the database.
4. **Practical** - Build a tier that holds the working set and keeps the database
   under its ceiling when one machine is lost, and pass Submit.
5. **Communication** - Defend partitioning alone or with replicas by naming what
   each spends.

Exercised: 1 by Q3 and the eviction table; 2 by the walkthrough, Q1 and Q2; 3 by
the brief's arithmetic, Q4 and the interview answer; 4 by the build; 5 by both
blueprints' commentary and Q4.

## 3. Per-beat outline

| Beat | Lesson section | Notes |
|---|---|---|
| 1-2 Cold open | Untitled | The reboot, in two short paragraphs, then the handoff from 3.14's own sentence. |
| 3 Think first | `[!NOTE]` | "Is the answer a quarter?" - paid off by the walkthrough's modulo variant. |
| 4 Mental model | "The numbers" | One subtraction judges every design. |
| 5 Visual | `<Walkthrough>` "Which keys move when a machine dies" | §4 below. |
| 6-7 Mechanics | "Consistent hashing", "Eviction is a bet on the access pattern" | New concepts 1 and 2. Virtual nodes and membership agreement are the one level down. Engineering nugget. |
| 8 Trade-offs | "Trade-offs" | Partition-only vs replicated leads, because it is the exercise's open decision; the arithmetic paragraph under it derives the count of four. |
| 9-12 | What breaks, What changes at scale, In production, Common mistakes | Production: Facebook's memcache gutter pool; Redis Cluster's async replication. |
| 13 Interview | "In an interview" | Senior answer from this lesson's vocabulary. |
| 14 Connections | "Connections" | 3.14, 3.13, 3.9 backward; one marked forward tease to 3.22. |
| 15-16 | Recap, Your turn | |
| Preview | "Next" | The other two Tier 1 peers. |

## 4. Diagram (§7)

One `<Walkthrough>`, two algorithms (`modulo`, `ring`) over one six-node topology:
an App Server, four `cache` nodes, the database. Machine C's failure is drawn with
`faultNodeIds`; under `modulo` the three surviving miss edges go red together, under
`ring` only D's path is highlighted. A failure diagram shows the failure (§7.2). The
"Note:" caption carries the second half of the argument - scaling up under mod N
costs the same as a failure.

The ring itself is not drawn: it is a hash space, not a topology, and a
consistent-hashing ring sketch adds nothing the prose and the walkthrough's two
variants do not.

## 5. Component budget (§16)

- **Palette: Bitly's 14** (Groups A-D).
- **`requiredComponentIds`: the starter's own five** (`browser`, `dns`,
  `load-balancer`, `app-server`, `sql-database`). Neither `cache` nor
  `distributed-cache` is required, because the two passing tiers are built from
  different ones.
- **Four `cache` nodes in blueprint 2 come from the brief's arithmetic, not from
  taste.** 180 GB over 64 GB machines needs three; one lost machine of N sends
  120,000/N extra reads to a database with 34,000 of headroom, which needs four.
  The lesson's trade-off section shows the sum.

## 6. Validation rules

None new; full registry. The ones that can fire: `component-relations` (a cache
miss edge pointed at the app tier; a cache fed from the load balancer),
`missing-input-connection` (a cache wired to the database but not from the app
tier - the most likely slip when adding three), `orphan-component`,
`request-flow-cycle`. Validate is silent on the starter by design (§7).

## 7. Blueprints, starter graph, decorators

**Starter: six nodes in tier columns** - browser, DNS, load balancer over six
app servers, one cache, the database. Validates clean: nothing is miswired, the
fault is capacity and a single point of failure, which no rule detects. That makes
it the fourth clean starter in a row in this area (3.15, 3.16, Bitly, this);
acceptable for RWE, where Submit's drift is the feedback surface and the brief says
what is wrong in numbers.

**Two blueprints:**

1. `rwe-t1-distcache-blueprint-replicated` - one `distributed-cache` with
   `replicationFactor >= 2` between the app tier and the database.
2. `rwe-t1-distcache-blueprint-sharded` - four `cache` nodes, each fed by the app
   tier and falling through to the database.

Both require `instances >= 2` (already 6 in the starter, so it only bites if
lowered).

**Not graded, by necessity:** key placement (mod N vs ring) and eviction policy.
The canvas has no field for placement. `cache` has `evictionPolicy` but
`distributed-cache` does not, so grading it would apply to one blueprint only. Both
are assessed by the quiz (Q1-Q3), the same split Bitly's spec §11 recorded.

**Known drift shape, verified.** A learner with one to three caches is matched to
blueprint 2 and gets a drift report that lists nothing - no missing component, no
mismatched edge - because drift does not count duplicates of a component already
present. Worse than the "Missing: Cache" open decision 11 originally described.
Hint 4 names the shape ("does not match but lists nothing missing"). Engine fix:
report a short count as its own category.

**Decorators**: five tier zones (Client, Edge, Application, Cache tier, Data), one
comment carrying today's figures. No gap zone.

## 8. Hints

1. Orienting: the one subtraction.
2. Structural: two ways to make a loss cheap; both pass.
3. Directional: settings and counts.
4. Directional: the empty drift report when a count is short (§7).

## 9. Quiz

| # | Kind | Difficulty | Under test |
|---|---|---|---|
| 1 | single | 1 | Mod N remaps ~3/4 of keys on one failure |
| 2 | single | 2 | Virtual nodes |
| 3 | single | 2 | Scan pollution of LRU |
| 4 | matching | 3 | Four choices, four costs |
| 5 | single | 3 | The hot key in a partitioned cache |

Correct positions across the singles: 3, 1, 2, 0 (Bitly 1, 2, 0, 3; Rate Limiter
2, 0, 3, 1). Q4 is a full derangement.

## 10. Playtest pass (§18.2)

| Move | Taught in |
|---|---|
| Read the starter's request path | 3.2, 3.4, 3.8 |
| Cache-aside: app reads the cache, miss falls through to the origin | 3.14 |
| Replace one cache with a partitioned, replicated tier | 3.14 (names it and its two fields) |
| Partition data across machines by a hash of the key | 3.13 |
| Recognize one hot key as unpartitionable | 3.13 |
| Keep every caller's member list in agreement | 3.9 |
| Size against an origin's ceiling from a hit ratio | 3.14 (its 95% arithmetic) |
| Assemble from a brief | Checkpoint D |

Consistent hashing and eviction-as-design are the declared new concepts, taught in
the lesson.

## 11. Simplifications

- `distributed-cache` is one card for a whole cluster; its machine count is not
  on the canvas. The lesson and commentary give the count (six machines at RF 2).
- The four `cache` nodes are placed by the application servers' client library;
  the canvas draws four edges, not the ring.

## 12. Flagged for a second pass

- Fourth consecutive clean starter (§7). Fine for an open brief; worth a playtest
  look at whether learners read Validate's silence as "done".
- The two new concepts are, again, quiz-assessed only. Consistent hashing cannot be
  drawn; eviction could be graded on blueprint 2 alone, which would make the two
  blueprints unequal.
