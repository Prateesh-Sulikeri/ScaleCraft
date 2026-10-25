# Chapter spec - RWE Tier 2: Online Chess

Authored under CURRICULUM.md §5, §6, §15 and §20, and QUIZ_FRAMEWORK.md §16.
Deliverable 1 of the 6 in pending-content.md's "Per-chapter deliverables".

- Chapter definition: `src/content/chapters/index.ts` (`rwe-t2-online-chess`)
- Lesson body: `public/content/chapters/rwe-t2-online-chess.mdx`
- Manifest row: `src/curriculum/manifest.ts`, slug `rwe-t2-online-chess`
  (`chapterDefinitionId` flipped from `null`)

**Wave.** `pending-content.md`'s Wave 7 ("RWE Tier 2 (all 5)").

Precedent: RWE Tier 1, plus Notification System's Tier 2 calls (all 27 available).
No `ruleSeverity` here: the brief has no queue, so there is nothing to escalate.

## 0. Type classification

**RWE Project** (§4). All ten §6-mandatory RWE sections present; three of four
optional ones used (Think first, Core mechanics as "Holding the connection", Preview
of next). Mental model is the paragraph under the numbers (two kinds of state with
opposite needs).

**New concepts: 2**, exactly §15.2's row: real-time move relay (long-lived
connection concept, seeded for WhatsApp); matchmaking state.

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Build a real-time tier where moves cross machines in under 100 ms, games survive the machine holding their connections, and each data class gets the durability it deserves, and name what each choice costs. |
| Type | RWE Project |
| Difficulty | intermediate (manifest) |
| Estimated time | 90 minutes (manifest). Lesson ~2,200 words. |
| Prerequisites | Checkpoint G. |
| Unlocks | Nothing directly. Seeds Tier 4 WhatsApp's connection tier (§15.2). |
| Building blocks introduced | None (§16). |
| Reinforces | 3.7 sessions, 3.9 discovery, 3.22 postures, plus 3.4 (least-connections), 3.6, 3.14, 3.11/3.13 (move log). |
| Stages trained | §2 stages 5 and 6. |
| Interview relevance | High - real-time games and chat are a standard archetype. Feeds steps 1 (real-time vs everything else), 3 (connections, move rate), 5 (connection tier, relay), 6 (server dies mid-game). |
| Production relevance | Every real-time product (chat, collaboration, games, live dashboards) has a connection tier and the same rebalancing and reconnect problems. |
| Interview-canon note | "Statefulness contained": the first project where a server must hold state, and the grade is how little. |

## 2. Learning objectives (§5.2)

1. **Knowledge** - Explain why a held connection is pinned state, how moves cross
   machines, and why long-lived connections need least-connections.
2. **Engineering** - Design an atomic, widening, expiring matchmaking pool.
3. **Interview** - Answer "a server dies mid-game?" with reconnect, resume and where
   the game lives.
4. **Practical** - Build the tier; pass Submit.
5. **Communication** - Defend replicated memory or a durable move log for live
   moves (3.22 per data class).

Exercised: 1 by the connection section, Q1-Q3; 2 by the matchmaking section and Q5;
3 by the walkthrough's failure steps and the interview answer; 4 by the build; 5 by
the commentary and Q4.

## 3. Per-beat outline (§5.3 RWE variant)

| Beat | Lesson section | Notes |
|---|---|---|
| 1-2 Cold open | Untitled opening | A million polls a second; 10 s of a bullet clock. Paid off in the walkthrough's two variants and Q1. |
| 3 Think first | `[!NOTE]` | Pinned connection; crossing machines. |
| 4 Mental model | "The numbers" + paragraph | Two kinds of state. |
| 6-7 Core mechanics | "Holding the connection" | New concept 1: pinned state, per-game channel, least-connections, heartbeats and resume. Engineering nugget. |
| 5 Visual | `<Walkthrough>` "One move, two connection servers" | §4 below. |
| 7 Deeper | "Matchmaking state" | New concept 2, then 3.22's postures per data class. Production nugget. |
| 8 Trade-offs | "Trade-offs" | Durability of live moves leads (the blueprint axis). |
| 9-12 | What breaks, What changes at scale, In production, Common mistakes | Lichess (lila-ws over Redis pub/sub), Discord gateway. |
| 13 Interview lens | "In an interview" | Senior answer. |
| 14 Connections | "Connections" | 3.7, 3.9, 3.22, 3.4, 3.14; one marked forward tease to Tier 4 WhatsApp (§15.2's "seeded for WhatsApp"). |
| 15 Recap | "Recap" | Five anchors. |
| 16 Transition brief | "Your turn" | Symptoms, Stretch (two million spectators), not told. |
| Preview | "Next" | Notification System, the contrast pair. |

## 4. Diagram (§7)

One `<Walkthrough>`, two algorithms (`poll`, `push`), seven nodes: two browsers, the
load balancer, two connection servers, the shared live-games store, the relational
store. Steps 2-3 differ per variant (the polling delay vs the channel relay); steps
4-5 are shared and show the failure (Connection server 2 faulted) and the resume on
server 1; step 6 writes the finished game.

The relay is drawn as both servers connecting to the shared store, because
`app-server` accepts only `request-flow` input (plus load-balancer health checks) and
no async edge can carry a published move into a connection server. The lesson's note
under the diagram says so. See §12.

## 5. Component budget (§16)

- **Palette: all 27.**
- **`requiredComponentIds`: `browser`, `dns`, `load-balancer`, `app-server`,
  `distributed-cache`.** `distributed-cache` rather than `cache`, from "if a machine
  holding live games dies, both players continue": a single-node cache is a single
  point of failure for every live game (verified: a `cache` design fails as missing
  the required component).

## 6. Validation rules

None new; no escalation. `single-instance-load-balancer` pre-explains the
`instances` predicate. `no-direct-client-database` does not apply (no `client`
needed). `component-relations` catches a browser wired to the cache.

## 7. Blueprints, starter graph, decorators

**Starter: three nodes, one row** - browser, one application server, relational
database: the polling design with games in memory. Validates clean, cannot pass.

**Two blueprints, differing on how durable a live move is:**

1. `rwe-t2-chess-blueprint-durable` - adds a second data store (`moves`) the
   connection servers reach. Listed **first** because its pattern contains the other:
   a design with a move log should get the commentary that describes it.
2. `rwe-t2-chess-blueprint-memory` - the shared store with `replicationFactor >= 2`
   is the only home of live games.

Both require browser -> DNS -> (any path) -> load balancer with
`algorithm = least-connections` -> connection servers (`instances >= 2`) ->
`distributed-cache`, and the servers reaching an accounts store.

**The `least-connections` predicate is the first concept-bearing config predicate in
RWE.** It is the one canvas-visible consequence of long-lived connections, so the
build grades it; the brief states the symptom ("connections even out within minutes,
not hours") and hint 4 points at settings. Verified: a round-robin design fails with
"Load Balancer: algorithm should be least-connections (is round-robin)".

**Decorators**: Players, Application, Data zones (not "Client": `client` is in the
palette and the spoiler gate counts a zone label naming it); one comment on the
polling load.

## 8. Hints

1. Orienting: the polling tax on a 40-move bullet clock.
2. Structural: a pinned connection, and where a game must live to be picked up.
3. Structural: sort the data by what losing it costs (3.22).
4. Directional: settings, not boxes, including the restart requirement.

## 9. Quiz

| # | Kind | Difficulty | Under test |
|---|---|---|---|
| 1 | single | 1 | The polling tax (average half the interval) |
| 2 | single | 2 | Crossing machines needs a channel, not stickiness |
| 3 | single | 2 | Round-robin vs least-connections after a restart |
| 4 | matching | 3 | Four choices, four costs |
| 5 | single | 3 | Atomic pairing |

Correct positions across the singles: 3, 1, 0, 2. Q4 pairs are a full derangement.

## 10. Playtest pass (§18.2)

| Move | Taught in |
|---|---|
| Hostname resolution | 3.2 |
| Load balancer algorithm choice (least-connections) | 3.4 |
| Keeping state off the server; where sessions live | 3.6, 3.7 |
| Several instances behind the balancer | 3.8 |
| Finding which instance holds what | 3.9 |
| A replicated, partitioned in-memory store | 3.14 |
| Choosing stores per data class; partitioning a write-heavy log | 3.11, 3.13 |
| Assigning a consistency posture per data class | 3.22 |
| Assembling from a brief | Checkpoint G |

Not sourced from a prior chapter, by design: held connections and matchmaking state
are the declared new concepts.

## 11. Simplifications

- WebSockets are not distinguishable from polling on the canvas; both are
  `request-flow` from the browser. The build grades the consequences (shared live
  state, least-connections), the quiz grades the concept.
- Pub/sub relay, the pool's sorted set and its atomic pop all live inside one
  `distributed-cache` card.
- Server-authoritative clocks and heartbeats are prose.

## 12. Flagged for a second pass

- **`app-server` accepts no `async` input, so a connection server cannot be drawn
  subscribing to an Event Bus or Kafka.** The relay is drawn through the shared store
  instead, which matches production (Redis pub/sub), but a learner who reaches for
  an event bus gets a `component-relations` error with no lesson-side reason. Tier 4
  WhatsApp will need the same shape at larger scale. Raised as **open decision 28**.
- **Blueprint order is load-bearing**: the durable blueprint must stay first, or
  every move-log design is debriefed with the in-memory commentary.
