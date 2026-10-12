# Chapter spec - RWE Tier 1: Metrics Monitoring

Authored under CURRICULUM.md §5, §6, §15 and §20, and QUIZ_FRAMEWORK.md §16.
Deliverable 1 of the 6 in pending-content.md's "Per-chapter deliverables".

- Chapter definition: `src/content/chapters/index.ts` (`rwe-t1-metrics-monitoring`)
- Lesson body: `public/content/chapters/rwe-t1-metrics-monitoring.mdx`
- Manifest row: slug `rwe-t1-metrics-monitoring` (`chapterDefinitionId` flipped from `null`)

**Wave.** Wave 5 (RWE Tier 1 remainder); closes Tier 1. Bitly's RWE precedents
apply unchanged.

## 0. Type classification

**RWE Project** (§4). All ten §6-mandatory RWE sections present, plus Think first,
Mental model (the paragraph under "The numbers"), Core mechanics (three sections,
one per new concept) and Preview of next.

**New concepts: 3**, §15.2's row, at §15.1's ceiling: time-series write patterns;
downsampling and retention; pull-vs-push collection. Each gets its own section
rather than being folded together, because each is graded or quizzed separately.

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Design a write-heavy time-series system: store layout and partition key for the writes, downsampling for the reads, and a defended direction of collection. |
| Type | RWE Project |
| Difficulty | intermediate (manifest) |
| Estimated time | 65 minutes (manifest). |
| Prerequisites | Checkpoint D. |
| Unlocks | Nothing; Tier 1 peers are unordered. |
| Building blocks introduced | None (§16). |
| Reinforces | 3.16 derived data (rollups), 3.10 index write cost (the cold open), 3.11 wide-column, 3.13 hash vs range and scatter-gather, 3.9 target discovery. §15.2's row also cites 3.19 - see §12. |
| Stages trained | §2 stages 5 and 6. |
| Interview relevance | High - "design a metrics/monitoring system". Feeds step 3 (write rate and series count first), 5 (storage layout and retention), 7 (pull vs push). |
| Production relevance | Every company runs one, and cardinality explosions and shared-fate outages are its two most common failures. |
| Interview-canon note | "Inverted ratio": the read-heavy instincts from Bitly-shaped problems are wrong here, and the interviewer is watching whether the candidate notices before drawing. |

## 2. Learning objectives (§5.2)

1. **Knowledge** - Choose a store layout and partition key for a write-heavy
   time-series workload, naming why partitioning by time fails.
2. **Engineering** - Design downsampling and retention that keep old data at the
   resolution it is read at, without hiding spikes.
3. **Interview** - Answer "pull or push?" by naming what each knows when a host goes
   silent.
4. **Practical** - Build a metrics system beside a running product and pass Submit.
5. **Communication** - Defend the direction of collection by naming what the other
   direction would have avoided.

Exercised: 1 by the build's `model`/`partitioning` predicates and Q2; 2 by Q3 and
Q4; 3 by Q4 and the pull/push table; 4 by the build; 5 by the two blueprints'
commentary.

## 3. Per-beat outline

| Beat | Lesson section | Notes |
|---|---|---|
| 1-2 Cold open | Untitled | Customer email as the only monitor; the timestamp-indexed table that fell over. Contrasted with a shortener's ratio without assuming the learner did Bitly. |
| 3 Think first | `[!NOTE]` | Which side to size, and what a 90-day query costs untouched. Paid off in the walkthrough's `history` variant. |
| 4 Mental model | "The numbers" + paragraph | Written once, read as ranges; store for the writes. |
| 5 Visual | `<Walkthrough>` "Written once, read as a range" | §4. |
| 6-7 Mechanics | "Time-series writes", "Downsampling and retention", "Pull or push" | The three new concepts. Engineering nugget on retention as a priced product decision. |
| 8 Trade-offs | "Trade-offs" | Collection direction first (the exercise's open decision). |
| 9-12 | What breaks, Scale, In production, Common mistakes | Production: Gorilla (26 h in memory, 1.37 bytes/point), Prometheus (pull, `up`, push gateway). |
| 13-16 | Interview, Connections, Recap, Your turn | One marked forward tease to 3.25. |
| Preview | "Next" | Tier 1 closes; teases Tier 2 at Checkpoint G. |

## 4. Diagram (§7)

One `<Walkthrough>`, two algorithms (`recent`, `history`) over a five-node data
path: fleet, ingest, store, query, dashboards. Steps 1-3 are shared (arrival, raw
append, rollup write); steps 4-5 branch on what a 15-minute graph and a 90-day
graph read. It is drawn push-shaped and its description says so; pull vs push is a
table, because putting both directions of the first edge on one topology would draw
a two-way arrow that means neither.

## 5. Component budget (§16)

- **Palette: Bitly's 14** (Groups A-D). No `kafka`, `message-queue`, `worker` or
  `cron-job` - all Group E, after Checkpoint D. The real-world ingest shape (a
  stream between agents and the store, a scheduled compaction job) is therefore
  described, not drawn; the lesson's trade-off table offers "rollups computed later
  by a scheduled job" as prose without naming the component.
- **`requiredComponentIds`: `browser`, `dns`, `load-balancer`, `app-server`,
  `nosql-database`.** The NoSQL store is the only new required type; the second
  `browser` and second `app-server` are enforced by the blueprints.
- **The fleet push edge goes app-server to app-server, with no load balancer in
  front of ingest.** `load-balancer` accepts only networking inputs, so compute
  cannot be routed through one. Real agents push through a balancer; here the
  ingest card's `instances` carries the redundancy. Recorded as a simplification.

## 6. Validation rules

None new; full registry. Fires here: `missing-input-connection` (a pull-shaped
collector with no dashboards feeding it - see §12), `component-relations` (a
dashboard wired straight to the store; the store fed from a browser),
`orphan-component`, `request-flow-cycle` (collector and fleet wired both ways).

## 7. Blueprints, starter graph, decorators

**Starter: the product, five nodes in tier columns** - browser, DNS, load balancer
over the fleet (20 instances), product database. Validates clean; the metrics
system is entirely absent, which the brief states.

**Two blueprints, differing on the first edge's direction:**

1. `rwe-t1-metrics-blueprint-push` - `fleet -> ingest` (instances >= 2) `-> tsdb`;
   a second browser reaches the store by any path, with a labelled `absent` block
   rejecting a route through the product's load balancer.
2. `rwe-t1-metrics-blueprint-pull` - `collector -> fleet`, `collector -> tsdb`,
   `dashboards -> collector` (the Prometheus shape, where the scraper answers
   queries).

Both require the store as `nosql-database` with `model: "wide-column"` and
`partitioning: "hash"`. **`key-value` is not accepted**, unlike Bitly: 3.11 defines
key-value as "fetched by exact key, nothing else", and every query here is a range.
Both predicates now produce a "Configured differently" drift report (open decision
11 resolved), so the NoSQL default `document` fails with an accurate message.

**Decorators**: four zones (Users, Edge, "Product fleet (being measured)", Product
data) so the learner knows which card is the 2,000 hosts; one comment with the
fleet's figures. No gap zone.

## 8. Hints

1. Orienting: two rates, which one picks the store.
2. Structural: who keeps the target list, who notices silence; both directions pass.
3. Directional: a setting matters, on one component more than one field does.
4. Directional: the canvas needs an arrow into a self-starting component (§12).

## 9. Quiz

| # | Kind | Difficulty | Under test |
|---|---|---|---|
| 1 | single | 1 | Batching: 200,000 points is 200 requests |
| 2 | single | 2 | Partitioning by day makes a moving hot spot |
| 3 | single | 2 | Rollups must keep max, not only the mean |
| 4 | matching | 3 | Four choices, four costs |
| 5 | single | 3 | Cardinality, not point rate |

Correct positions across the singles: 0, 3, 1, 2 (Bitly 1, 2, 0, 3; Rate Limiter
2, 0, 3, 1; Distributed Cache 3, 1, 2, 0) - every Tier 1 project opens on a
different letter. Q4 is a full derangement.

## 10. Playtest pass (§18.2)

| Move | Taught in |
|---|---|
| Read the product's request path | 3.2, 3.4, 3.8 |
| A second application tier beside the first, compute to compute | 3.5 (multi-service), 3.6 |
| Pick wide-column for range reads within a partition | 3.11 |
| Hash-partition, never by a growing key | 3.13 |
| Instances >= 2 so a lost machine leaves no gap | 3.8 |
| A dashboard browser as a second entry point | 3.2, Checkpoint D |
| Rollups as derived data | 3.16 |
| Index cost on writes (why the cold open failed) | 3.10 |
| Target discovery for pull | 3.9 |

Time-series writes, downsampling and pull vs push are the declared new concepts.

## 11. Simplifications

- The fleet is one card standing for 2,000 hosts.
- No load balancer in front of ingest (§5).
- Rollups computed in the ingest tier; the scheduled-job alternative is prose only.
- Raw and rollup data live in one store card; the lesson treats them as separate
  tables of it.

## 12. Flagged for a second pass

- **§15.2's Tier 1 row cites 3.19 (Group E) as reinforced, but Tier 1 unlocks at
  Checkpoint D.** Same class as 3.24 on the Rate Limiter row. Raised together as
  open decision 26.
- **The pull shape needs the dashboards to feed the collector.** A scraper is
  self-starting, but the canvas has no scheduler origin before Group E, so a
  collector with no inbound edge trips `missing-input-connection`, whose
  explanation ("no request can ever reach it") reads oddly for a scraper. Hint 4
  and the lesson's pull paragraph pre-empt it. Real fix would be letting a
  self-starting role be declared on `app-server`, which is engine work.
- **Two `browser` nodes** (users and engineers) is a first. Both blueprints need
  them distinct; a learner who reuses the product's browser gets a drift report
  that lists nothing missing, the same duplicate-count blindness Distributed
  Cache's spec §7 verified. The brief's "without going through the product's own
  servers" is the only pointer at a second entry point.
