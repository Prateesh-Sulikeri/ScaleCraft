# Chapter spec - RWE Tier 2: Price Tracking Service

Authored under CURRICULUM.md §5, §6, §15 and §20, and QUIZ_FRAMEWORK.md §16.
Deliverable 1 of the 6 in pending-content.md's "Per-chapter deliverables".

- Chapter definition: `src/content/chapters/index.ts` (`rwe-t2-price-tracking-service`)
- Lesson body: `public/content/chapters/rwe-t2-price-tracking-service.mdx`
- Manifest row: `src/curriculum/manifest.ts`, slug `rwe-t2-price-tracking-service`
  (`chapterDefinitionId` flipped from `null`)

**Wave.** `pending-content.md`'s Wave 7 ("RWE Tier 2 (all 5)").

Precedent: RWE Tier 1, plus Notification System's Tier 2 calls. Not re-argued here.

## 0. Type classification

**RWE Project** (§4). All ten §6-mandatory RWE sections present; three of four
optional ones used (Think first, Core mechanics as "Spending a fetch budget",
Preview of next). Mental model is the paragraph under the numbers ("a budget you do
not control, against a catalog 28 times too big for it").

**New concepts: 2**, exactly §15.2's row: polite crawling/polling cadence; change
detection and alerting.

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Build a tracker that spends a rationed fetch budget by value, holds every retailer to its limit, and turns real price changes into alerts for exactly the affected watchers, and name what each choice costs. |
| Type | RWE Project |
| Difficulty | intermediate (manifest) |
| Estimated time | 80 minutes (manifest). Lesson ~2,300 words. |
| Prerequisites | Checkpoint G. |
| Unlocks | Nothing directly. |
| Building blocks introduced | None (§16). |
| Reinforces | 3.19 cron, 3.17 queues, 3.16 derived data, plus 3.18 fan-out/log, 3.24 and 3.23 reversed (obeying a limit, opening a circuit), 3.11 (wide-column history), 3.13 (log keyed by product). |
| Stages trained | §2 stages 5 and 6. |
| Interview relevance | Medium-High - a common "sounds easy" prompt whose step 3 changes the design. Feeds steps 1 (whose limits, how fresh), 3 (catalog vs budget), 5 (cadence, change detection), 6 (popular product drops). |
| Production relevance | Any crawler, aggregator or integration that polls third parties lives under someone else's rate limit. |
| Interview-canon note | "Estimation reshapes the design": the 28x result in step 3 is the whole project. |

## 2. Learning objectives (§5.2)

1. **Knowledge** - Size a fetch budget against a catalog and design a scored,
   adaptive cadence.
2. **Engineering** - Turn a fetch into an alert correctly: normalize, publish only
   real changes, match by index, alert once per crossing.
3. **Interview** - Answer "a popular product just dropped - what happens?" by
   tracing the change to matched watchers and a rate-limited hand-off.
4. **Practical** - Build the rate-governed, change-driven tracker; pass Submit.
5. **Communication** - Defend an event bus or a partitioned log for change events.

Exercised: 1 by the tier table, Q1 and Q4; 2 by the change section, Q3 and Q5; 3 by
the interview answer and the walkthrough's last three steps; 4 by the build; 5 by
the commentary and Q4.

## 3. Per-beat outline (§5.3 RWE variant)

| Beat | Lesson section | Notes |
|---|---|---|
| 1-2 Cold open | Untitled opening | Overlapping hourly runs, a 48-hour block during a sale. Paid off in the budget section and the walkthrough's hourly variant. |
| 3 Think first | `[!NOTE]` | Which products, how often, and matching without rereading every alert. |
| 4 Mental model | "The numbers" + paragraph | Steps 1-3; the 28x result. |
| 6-7 Core mechanics | "Spending a fetch budget" | New concept 1: scoring, adaptive interval, rate governor, back-off; tier table. Engineering nugget. |
| 5 Visual | `<Walkthrough>` "One check, one price drop" | §4 below. |
| 7 Deeper | "Detecting change and alerting" | New concept 2: normalize, compare, index match, hysteresis; derived consumers. Production nugget. |
| 8 Trade-offs | "Trade-offs" | Change carrier leads. |
| 9-12 | What breaks, What changes at scale, In production, Common mistakes | Camelcamelcamel (feeds over scraping), Googlebot (rate set from responses). |
| 13 Interview lens | "In an interview" | Senior answer. |
| 14 Connections | "Connections" | 3.19, 3.17, 3.18, 3.16, 3.24, 3.23. |
| 15 Recap | "Recap" | Five anchors. |
| 16 Transition brief | "Your turn" | Symptoms, Stretch (budget cut to 40/s), not told. |
| Preview | "Next" | Online Chess. |

## 4. Diagram (§7)

One `<Walkthrough>`, two algorithms (`hourly`, `adaptive`), ten nodes: tick,
planner, fetch queue, fetchers, retailer (`custom`, external), price-change bus,
alert matcher, watches, history writer, price history. The `hourly` variant faults
the retailer and the publish edge (the cold open's block and the unseen sale); the
`adaptive` variant traces the rate-governed fetch, the change event, the fan-out and
both consumers. Steps 5-7 are shared. The bus is drawn as an `event-bus` because the
walkthrough needs one carrier; the log alternative is a trade-off row and blueprint 2.

## 5. Component budget (§16)

- **Palette: all 27.**
- **`requiredComponentIds`: `browser`, `dns`, `load-balancer`, `app-server`,
  `cron-job`, `message-queue`, `worker`, `dead-letter-queue`.** The carrier
  (`event-bus` or `kafka`) differs.

## 6. Validation rules

None new. `queue-without-dead-letter-queue` escalated (brief: "a product whose page
keeps failing to parse is set aside"). `component-relations` catches a cron job with
an inbound edge and a fetcher wired to the DLQ directly. `single-instance-load-
balancer` pre-explains the `instances` predicate.

## 7. Blueprints, starter graph, decorators

**Starter: five nodes, two rows** - browser -> one web server (one instance) ->
relational database; hourly cron -> one fetcher worker -> the same database. The
fetcher in the application column is the cold open: the clock calls the work
directly. Validates clean, cannot pass.

**Two blueprints, differing on what carries change events:**

1. `rwe-t2-price-blueprint-bus` - `event-bus`.
2. `rwe-t2-price-blueprint-log` - `kafka`.

Both require: browser -> DNS, DNS reaches the LB by any path, LB -> web
(`instances >= 2`), web reaches the watches store; the tick reaches the fetch queue
**by any path** (a planner worker in between, or the cron job enqueueing directly -
both honest, and the two references show one each); fetch queue -> fetchers and ->
DLQ; fetchers -> carrier -> matcher (`worker` or `serverless-function`); and the
matcher reaches **the same watches alias** the website writes. That shared alias is
what grades "exactly the watchers they affect": a matcher reading some other store
fails (verified).

The history writer is in both reference graphs and not in either pattern: the brief
asks that history not block alerts, which the carrier's fan-out already guarantees,
and requiring a second consumer would grade a node count rather than a property.

**Decorators**: Triggers, Application, Data zones; one comment with the hourly
fetch-everything and the budget.

## 8. Hints

1. Orienting: divide the catalog by the budget.
2. Structural: what stands between a 12,000-product burst and a 120/s retailer.
3. Structural: which Group E shapes deliver one event to several readers.
4. Directional: settings, not boxes (`instances`).

## 9. Quiz

| # | Kind | Difficulty | Under test |
|---|---|---|---|
| 1 | single | 1 | Budget arithmetic (28 hours) |
| 2 | single | 2 | Queue plus fixed concurrency as the rate governor |
| 3 | single | 2 | Hysteresis on a flapping price |
| 4 | matching | 3 | Four choices, four costs |
| 5 | single | 3 | Index watches by product and target |

Correct positions across the singles: 1, 3, 2, 0. Q4 pairs are a full derangement.

## 10. Playtest pass (§18.2)

| Move | Taught in |
|---|---|
| A cron job starting scheduled work | 3.19 |
| A queue absorbing a burst, workers draining it at a fixed pace, a DLQ | 3.17 |
| One event to several independent consumers (bus), or a log with consumer groups | 3.18 |
| Derived views built from a stream of changes | 3.16 |
| Load balancer over a scaled web tier, DNS in front | 3.2, 3.4, 3.8 |
| Choosing a store for history | 3.11 |
| Assembling from a brief | Checkpoint G |

Not sourced from a prior chapter, by design: cadence scoring and change detection
are the declared new concepts.

## 11. Simplifications

- Retailers are outside the canvas; the fetchers' outbound requests have no edge.
- Per-retailer fetch pools are one card; the lesson says the concurrency is per
  retailer.
- Scoring, adaptive intervals, normalization and hysteresis are application logic.
- Alerts are handed to a notification pipeline that is not drawn (Notification
  System is its own project).

## 12. Flagged for a second pass

- **Neither new concept has a canvas field.** The build grades their architectural
  consequences (a rate governor between plan and fetch; a change stream into a
  matcher over the shared watches), the quiz grades the concepts.
- **A carrier with one consumer** passes, since the history writer is not required.
  Deliberate (§7 above); the debrief's reference graphs show two.
