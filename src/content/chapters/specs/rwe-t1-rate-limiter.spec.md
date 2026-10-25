# Chapter spec - RWE Tier 1: Rate Limiter

Authored under CURRICULUM.md §5, §6, §15 and §20, and QUIZ_FRAMEWORK.md §16.
Deliverable 1 of the 6 in pending-content.md's "Per-chapter deliverables".

- Chapter definition: `src/content/chapters/index.ts` (`rwe-t1-rate-limiter`)
- Lesson body: `public/content/chapters/rwe-t1-rate-limiter.mdx`
- Manifest row: `src/curriculum/manifest.ts`, slug `rwe-t1-rate-limiter`
  (`chapterDefinitionId` flipped from `null`)

**Wave.** `pending-content.md`'s Wave 5 ("RWE Tier 1 remainder"). Group D and
Checkpoint D, the wave's other items, are authored and in the tree.

Precedent: RWE Tier 1 Bitly. Everything Bitly's spec §0 and §2 established for the
RWE type (no `curriculumContext`, `validationRuleIds` inert, one exercise per
project, no gap zone) applies unchanged and is not re-argued here.

## 0. Type classification

**RWE Project** (§4). All ten §6-mandatory RWE sections present; three of four
optional ones used (Think first, Mental model folded into "The numbers", Core
mechanics, Preview of next). Mental model is the one-paragraph reading under the
numbers table ("the state is tiny and every request touches it"), not its own
heading - Bitly's precedent.

**New concepts: 2**, exactly §15.2's row: limiter algorithms compared under burst;
distributed counter state.

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Make a per-key limit hold across a fleet of machines, choosing where the check runs and where the count lives, and name what each choice costs. |
| Type | RWE Project |
| Difficulty | intermediate (manifest) |
| Estimated time | 60 minutes (manifest). Lesson ~2,000 words; the rest is Editor time. |
| Prerequisites | Checkpoint D (`checkpoint-r1-a-site-that-stays-up`), already in the manifest. |
| Unlocks | Nothing. Tier 1's four projects are unordered peers. |
| Building blocks introduced | None (§16: RWE needs no new components). |
| Reinforces | 3.5 gateway placement, 3.14 distributed state, 3.13 hot partition, 3.6 shared state. §15.2's row also cites 3.24 - see §12, it is outside the prerequisite chain. |
| Stages trained | §2 stage 5 (Design) and 6 (Trade-off articulation). |
| Interview relevance | High - "design a rate limiter" is a standalone canonical prompt. Feeds steps 1 (limited per what), 3 (check rate vs state size), 5 (algorithm, counter state), 7 (exactness vs a hop). |
| Production relevance | Every public API has one, and the per-machine-counter bug in the cold open is the most common way one silently does nothing. |
| Interview-canon note | "Infrastructure component as the product": the candidate designs a piece other systems call, so latency budget and failure posture matter more than the diagram. |

## 2. Learning objectives (§5.2)

1. **Knowledge** - Predict what a burst gets through under fixed window, sliding
   log, sliding window counter and token bucket, from the algorithm's state.
2. **Engineering** - Choose where a shared counter lives and how it is updated,
   naming the race a read-then-write limiter has and the hot-key cost of a shared
   store.
3. **Interview** - Answer "what happens when the counter store is down?" by naming
   fail open, why, and the local fallback, in under a minute.
4. **Practical** - Build a limiter whose count holds across the fleet and whose
   refusals never reach the data store, and pass Submit.
5. **Communication** - Defend checking at the gateway or in the application tier
   by naming what the other placement buys.

Exercised: 1 by the burst table and Q2; 2 by Q3 and Q5; 3 by Q4 and the interview
answer; 4 by the build; 5 by the two blueprints' commentary and Q4.

## 3. Per-beat outline (§5.3 RWE variant)

| Beat | Lesson section | Notes |
|---|---|---|
| 1-2 Cold open | Untitled opening | 470 vs 480: the setting is right and the system is wrong. Two short paragraphs. |
| 3 Think first | `[!NOTE]` | Asks what "60 across all eight" requires and what it costs the requests under their limit. Paid off in the walkthrough and "Shared counters" (the cost half). |
| 4 Mental model | "The numbers" + one paragraph | Tiny state, every request touches it. |
| 6-7 Core mechanics | "How a limiter counts, under a burst" | New concept 1. One burst trace across four algorithms in one table, rather than four prose descriptions. Engineering nugget. |
| 5 Visual | `<Walkthrough>` "Where the count lives" | §5 below. Placed after the algorithm table because the diagram's subject is the second concept (counter state); the algorithms have no topology to draw. |
| 7 Deeper | "Shared counters and what they cost" | New concept 2: race, hop, hot key, fail open. Production nugget. |
| 8 Trade-offs | "Trade-offs" | Placement is the exercise's open decision, so it leads the table. |
| 9-12 | What breaks, What changes at scale, In production, Common mistakes | Production: Cloudflare (approximate counter), GitHub (published budget). Lens 9 line for the startup. |
| 13 Interview lens | "In an interview" | Ends with the senior answer, built from this lesson's vocabulary only. |
| 14 Connections | "Connections" | 3.5, 3.6, 3.14, 3.13 backward; one marked forward tease to 3.24. |
| 15 Recap | "Recap" | Five anchors. Debrief = blueprint commentary. |
| 16 Transition brief | "Your turn" | One exercise, symptoms and rates only. |
| Preview | "Next" | The two remaining Tier 1 peers. |

Beat 5 sits after beat 6 here. §5.3 orders visual before mechanics; the reason
for the swap is that the primary diagram illustrates the *second* concept, and
"see before read" (§8.1) still holds - the walkthrough precedes the prose that
explains counter state.

## 4. Diagram (§7)

One `<Walkthrough>` with two algorithms (`local`, `shared`) over one six-node
topology: a script, two gateway machines, the counter store, load balancer, app.
Two `api-gateway` nodes stand for two machines of one tier, which is the only way
to make "each machine counts on its own" visible. In the `local` variant the
over-limit edges are drawn as faults; in `shared` the counter round trip is the
highlighted path. DNS is omitted and the description says why. The "Note:" caption
names the cost the next section prices.

The algorithm comparison is a table, not a diagram - it has no topology.

## 5. Component budget (§16)

- **Palette: Bitly's 14 plus `client`**. The callers are programs, not browsers,
  and `client` is home in 1.2. Groups A-D only; nothing before its home chapter.
- **`requiredComponentIds`: `client`, `dns`, `load-balancer`, `app-server`,
  `distributed-cache`.** The API Gateway is in the starter and required by only one
  blueprint, so it is not in the list. The data store is not required by type,
  because both blueprints accept either store.
- **`distributed-cache`, not `cache`.** The requirement "losing one machine that
  holds counters must not switch limiting off for every key" rules out a single
  machine. A learner who places `cache` gets a drift report naming the missing
  component, which is accurate.

## 6. Validation rules

None new; RWE runs the full registry. Rules that can fire here:

| Rule | Severity | Here |
|---|---|---|
| `component-relations` | error | Wiring the counter store from the client, or the load balancer into the gateway |
| `missing-input-connection` | error | A counter store or data store with an outgoing edge and nothing feeding it |
| `orphan-component` | warning | A counter store placed and never wired |
| `single-instance-load-balancer` | warning | The app tier left at one instance; pre-explains the `instances` predicate |
| `request-flow-cycle` | error | Unlikely; only if the app is wired back to the gateway |
| `no-direct-client-database` | error | **Live for the first time in RWE** - `client` is in this palette. Fires if the client is wired straight to a store, which is a real mistake here. |

## 7. Blueprints, starter graph, decorators

**Starter: four nodes, one row** - client, API Gateway, one app server at one
instance, relational database. Validates clean (Group D precedent: the gap is
absent components, not a broken one). Cannot pass: no `dns`, `load-balancer` or
`distributed-cache`.

**Two blueprints, differing on where the check runs:**

1. `rwe-t1-ratelimiter-blueprint-gateway` - the gateway asks a shared counter
   store before forwarding. Requires `gateway -> counters`.
2. `rwe-t1-ratelimiter-blueprint-service` - the application tier asks it, so the
   check can weight `/batch` by cost. Requires `app -> counters`; the hostname
   reaches the load balancer by any path (`via: "path"`), so keeping the gateway
   for auth is allowed.

Both require `instances >= 2` and a data store of either type.

**The counter store must not fall through to a database.** Each blueprint carries
two labelled `absent` blocks: one for an edge from the counter store to the
blueprint's own `store` alias, one for an edge to any other data node. Two blocks
because an absent block cannot re-bind a node the outer pattern already bound.
Without this, blueprint 2 would pass any design with an ordinary read cache behind
the app tier - a design with no limiter at all.

**Decorators**: three tier zones, one comment carrying today's measured figures. No
gap zone (RWE default).

## 8. Hints

1. Orienting: count how many places one key's requests are counted today.
2. Structural: a value every instance must agree on is state; where has shared
   state lived since Group B.
3. Directional: settings, not boxes (the `instances` predicate).
4. Directional: the counter store is in front of nothing (the `absent` blocks).

None names a component, a placement, or an algorithm.

## 9. Quiz

| # | Kind | Difficulty | Under test |
|---|---|---|---|
| 1 | single | 1 | Per-machine counters multiply the limit (bank §16 Q3, re-cast) |
| 2 | single | 2 | Which algorithm removes the boundary double without per-request memory |
| 3 | single | 2 | The read-then-write race |
| 4 | matching | 3 | Four choices, four costs |
| 5 | single | 3 | Hot key on the counter store |

Correct positions across the singles: 2, 0, 3, 1 (Bitly: 1, 2, 0, 3). Q4 pairs are
a full derangement. No ordering question.

## 10. Playtest pass (§18.2)

| Move | Taught in |
|---|---|
| Hostname resolved and fronting the API | 3.2 |
| Gateway as the entry point that sees the key | 3.5 |
| Load balancer in front of a scaled app tier | 3.4, 3.8 |
| Counters leave the machine because they are shared state | 3.6, 3.7 |
| A partitioned, replicated in-memory store reachable from the gateway or app | 3.14 |
| A store with no origin behind it | 3.14 (its own miss edge is what is withheld) - argued in this lesson's Connections |
| Choosing a data store for the API's own data | 3.11 |
| Assembling from a brief | Checkpoint D |

Not sourced from a prior chapter, by design: the algorithms and counter-state
mechanics are this project's declared new concepts, taught in the lesson.

## 11. Simplifications

- The gateway tier is eight machines drawn as one card; the lesson and brief say so.
- `rateLimitPerMinute` is one number per gateway card, not a per-plan table. The
  build does not grade it; per-plan limits are carried by the lesson.
- The token-bucket script running inside the store is described, not modelled.

## 12. Flagged for a second pass

- **§15.2's Tier 1 row cites 3.24 (Group G) as reinforced, but Tier 1 unlocks at
  Checkpoint D**, before Group G. Same class as open decision 21. This project is
  written standalone: it teaches both new concepts itself and names 3.24 only as a
  marked forward tease. Raised as open decision 26 (shared with Metrics
  Monitoring's 3.19 citation).
- **Overlap with 3.24.** A learner who took 3.24 first meets the algorithm table
  and the shared-counter idea again. Deliberate: the RWE angle is the limiter as a
  service (race, hot key, fail-open fallback, placement by cost), which 3.24 does
  not cover.
- **`no-direct-client-database` is reachable for the first time in RWE**, because
  `client` is in this palette. Correct behavior, noted for the record.
