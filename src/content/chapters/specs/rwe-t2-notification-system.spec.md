# Chapter spec - RWE Tier 2: Notification System

Authored under CURRICULUM.md §5, §6, §15 and §20, and QUIZ_FRAMEWORK.md §16.
Deliverable 1 of the 6 in pending-content.md's "Per-chapter deliverables".

- Chapter definition: `src/content/chapters/index.ts` (`rwe-t2-notification-system`)
- Lesson body: `public/content/chapters/rwe-t2-notification-system.mdx`
- Manifest row: `src/curriculum/manifest.ts`, slug `rwe-t2-notification-system`
  (`chapterDefinitionId` flipped from `null`)

**Wave.** `pending-content.md`'s Wave 7 ("RWE Tier 2 (all 5)"). Group G and
Checkpoints G and Final, the wave's other items, are authored and in the tree.

Precedent: RWE Tier 1 (Bitly, Rate Limiter). No `curriculumContext`,
`validationRuleIds` inert, one exercise, tier zones with no gap zone, five-question
retrospective quiz. Not re-argued here.

## 0. Type classification

**RWE Project** (§4). All ten §6-mandatory RWE sections present; three of four
optional ones used (Think first, Core mechanics, Preview of next). Mental model is
the paragraph under the numbers table ("the expensive, slow, failure-prone part
happens on someone else's servers"), Tier 1's precedent.

**New concepts: 2**, exactly §15.2's row: multi-channel delivery (push/SMS/email);
user preference and dedup layer.

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Build a notification pipeline whose channels fail independently, whose failed messages are kept, and whose duplicate and preference checks stay off the database, and name what each choice costs. |
| Type | RWE Project |
| Difficulty | intermediate (manifest) |
| Estimated time | 75 minutes (manifest). Lesson ~2,300 words. |
| Prerequisites | Checkpoint G (`checkpoint-r2-building-a-complete-backend`), already in the manifest. |
| Unlocks | Nothing directly. Tier 3 unlocks at the Final Checkpoint (§17). |
| Building blocks introduced | None (§16). |
| Reinforces | 3.17 queue + worker + DLQ, 3.18 fan-out, 3.24 (reversed: respecting a provider's limit), plus 3.23 bulkheads/timeouts/backoff and 3.14. All inside Tier 2's prerequisite chain. |
| Stages trained | §2 stage 5 (Design) and 6 (Trade-off articulation). |
| Interview relevance | High - "design a notification system" is a canonical prompt. Feeds steps 1 (channels, urgency, user control), 3 (channel split, cost per SMS), 5 (isolation, dedup), 6 (provider outage). |
| Production relevance | Every consumer product has this service, and the shared-pool outage in the cold open is how most of them discover they need per-channel isolation. |
| Interview-canon note | "Composition of familiar parts": every component is Group E; the grade is whether the candidate sees which parts must not share a fate. |

## 2. Learning objectives (§5.2)

1. **Knowledge** - Explain why a shared queue and pool lets one slow provider stall
   every channel, using in-flight = rate x latency.
2. **Engineering** - Place dedup for upstream retries and for queue redelivery, and
   choose per channel whether a crash costs a duplicate or a loss.
3. **Interview** - Answer "what if the SMS provider is down?" naming isolation,
   timeouts, backoff and the DLQ, in under a minute.
4. **Practical** - Build a pipeline whose channels fail independently, whose failed
   messages are kept, and whose hot reads skip the database; pass Submit.
5. **Communication** - Defend a queue per channel or a log with a consumer group per
   channel by naming what the other buys.

Exercised: 1 by the cold open, the arithmetic paragraph and Q1; 2 by the dedup
table, Q2 and Q4; 3 by the interview answer and Q5; 4 by the build; 5 by the two
blueprints' commentary and Q4.

## 3. Per-beat outline (§5.3 RWE variant)

| Beat | Lesson section | Notes |
|---|---|---|
| 1-2 Cold open | Untitled opening | Two failures from one incident: the stall and the duplicates. Both paid off (isolation section, dedup section). |
| 3 Think first | `[!NOTE]` | Asks for both causes. |
| 4 Mental model | "The numbers" + one paragraph | Interview steps 1-3 in one table. |
| 6-7 Core mechanics | "What changes when the send leaves your system" | New concept 1: provider table, then the rate x latency arithmetic. Engineering nugget. |
| 5 Visual | `<Walkthrough>` "One event through a pipeline per channel" | §4 below. After the provider table, because the diagram needs the providers' behavior to mean anything; it still precedes the dedup prose it sets up. |
| 7 Deeper | "Preferences and duplicates" | New concept 2. Two dedup directions, the record/send ordering table. Production nugget. |
| 8 Trade-offs | "Trade-offs" | The transport choice leads, since it is the exercise's open decision. |
| 9-12 | What breaks, What changes at scale, In production, Common mistakes | LinkedIn ATC (one decision point), APNs collapse id (why duplicates concentrate on SMS). Small-product line for lens 9. |
| 13 Interview lens | "In an interview" | Senior answer from this lesson's vocabulary. |
| 14 Connections | "Connections" | 3.17, 3.18, 3.23, 3.24, 3.14. No forward tease (Tier 2 has no out-of-chain chapter to point at). |
| 15 Recap | "Recap" | Five anchors. Debrief = blueprint commentary. |
| 16 Transition brief | "Your turn" | Symptoms only, Stretch (marketing campaign vs login code), what you are not told. |
| Preview | "Next" | Job Scheduler, the closest peer. |

## 4. Diagram (§7)

One `<Walkthrough>` without algorithm variants: ten nodes, one event traced through
the per-channel design while the SMS provider hangs. The providers are `custom`
nodes (`radio`, `globe`, category networking) because they are outside the system
and outside the registry; the registry would refuse a worker -> networking edge, and
the diagram says plainly that providers are external. Fault state on the SMS
provider and its edge (step 5); step 6 shows push still flowing - the before/during
pair §7.2 asks for in a failure diagram. Email is absent on purpose: the user opted
out, which is the preference layer made visible.

The shared-queue design from the cold open is not drawn. It is the starter graph,
which the learner can poke, and §7.2 forbids drawing a topology twice.

## 5. Component budget (§16)

- **Palette: all 27.** Tier 2 unlocks at Checkpoint G, after every home chapter.
  First RWE palette with Groups E-G.
- **`requiredComponentIds`: `client`, `load-balancer`, `app-server`,
  `dead-letter-queue`.** What both blueprints share by id. The queue/log, the sender
  type (worker or serverless), the fast store type and the data store type all vary.

## 6. Validation rules

None new; RWE runs the full registry. **First RWE `ruleSeverity`**:
`queue-without-dead-letter-queue` is an error, because the brief requires failed
messages to be kept (§15.1's "unless the brief makes one a requirement"). That rule
does not see Kafka, so blueprint 2 requires the log -> DLQ edge explicitly.

| Rule | Severity | Here |
|---|---|---|
| `queue-without-dead-letter-queue` | **error** (escalated) | Any channel queue with no DLQ edge |
| `component-relations` | error | Wiring a DLQ from a worker (DLQ accepts messaging only), a cache from the client |
| `single-instance-load-balancer` | warning | Router left at one instance; pre-explains the `instances` predicate |
| `no-direct-client-database` | error | Callers wired straight to the store |
| `orphan-component`, `missing-input-connection` | warning / error | The usual |

## 7. Blueprints, starter graph, decorators

**Starter: six nodes, two rows** - callers (`client`), one Notification API at one
instance, one queue with its DLQ, one sender pool, one relational database. It
validates clean (the DLQ is already there) and cannot pass: one queue, one pool, no
load balancer, no fast store.

**Two blueprints, differing on what separates the channels:**

1. `rwe-t2-notify-blueprint-queues` - three distinct `message-queue` aliases each
   feeding a distinct sender alias. Injective binding means one shared queue or one
   shared pool cannot match. DLQs are enforced by the escalated rule, so a learner
   may use one shared DLQ or three; the pattern names one DLQ on any queue so drift never lists it as "not part of this approach" (verified).
2. `rwe-t2-notify-blueprint-log` - one `kafka` feeding three distinct sender aliases
   (consumer groups) plus a DLQ.

Both require: callers -> LB -> router (`instances >= 2`) -> fast store (`cache` or
`distributed-cache`), and the router reaching a data store by any path. Senders are
`worker` or `serverless-function` - a componentId array rather than more blueprints
(Checkpoint G's precedent).

**Decorators**: Callers, Application, Delivery, Failed sends, Data zones; one comment
with the peak split. No gap zone (RWE default).

## 8. Hints

1. Orienting: trace one hung SMS and list what waits behind it.
2. Structural: two hot, rarely-changing reads; which tier has answered those since
   Group D.
3. Directional, for open decision 27: if the drift report names nothing, count.
4. Directional: settings, not boxes (the `instances` predicate).

None names a component, a transport or a count.

## 9. Quiz

| # | Kind | Difficulty | Under test |
|---|---|---|---|
| 1 | single | 1 | Shared pool stall, as arithmetic (bank §16 Q4 re-cast) |
| 2 | single | 2 | Redelivery duplicates escape router dedup |
| 3 | single | 2 | Preference cache vs unsubscribe |
| 4 | matching | 3 | Four choices, four costs |
| 5 | single | 3 | Retry storm on provider recovery |

Correct positions across the singles: 3, 0, 2, 1. Opening letter d; Tier 2's five
projects open on d, a, c, b, d against Tier 1's b, c, d, a. Q4 pairs are a full
derangement.

## 10. Playtest pass (§18.2)

| Move | Taught in |
|---|---|
| A stateless router behind a load balancer, more than one instance | 3.4, 3.6, 3.8 |
| A queue, its consumers and a dead-letter queue | 3.17 |
| One event fanned out to several consumers; a log with consumer groups | 3.18 |
| Separate pools so one slow dependency cannot exhaust another's capacity | 3.23 (bulkheads) |
| Workers or serverless functions as senders | 3.17, 3.19 |
| A fast keyed store in front of the database for hot reads | 3.14 |
| Choosing a data store | 3.11 |
| Assembling from a brief | Checkpoint G |

Not sourced from a prior chapter, by design: provider behavior and the dedup layer
are this project's declared new concepts, taught in the lesson.

## 11. Simplifications

- Providers are outside the canvas. A sender's outbound call has no edge, because
  the registry admits none from compute to an external system; the lesson says so.
- One fast store holds both preferences and seen event ids; production often splits
  them. The canvas cannot tell the two roles apart.
- Per-channel rate caps, call timeouts and backoff are prose. `worker` has only
  `concurrency`; the per-call reliability fields exist on `app-server` alone.
- Marketing campaigns and priority are out of the build and live in the Stretch.

## 12. Flagged for a second pass

- **Open decision 27 bites here**: a graph with one or two channel queues fails Submit
  with a drift report that may list nothing. Hint 3 mitigates; the engine fix is
  still open.
- **The canvas cannot grade where dedup runs.** Blueprint matching sees a fast store
  reached by the router; sender-side dedup against the delivery log is invisible.
  Assessed by Q2 instead.
- **Kafka -> DLQ is drawn as the parking edge.** In production the consumer writes
  the parked message; the registry routes it from the log. Disclosed in blueprint 2's
  commentary.
