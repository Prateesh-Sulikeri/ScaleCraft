# Chapter spec - RWE Tier 2: LeetCode

Authored under CURRICULUM.md §5, §6, §15 and §20, and QUIZ_FRAMEWORK.md §16.
Deliverable 1 of the 6 in pending-content.md's "Per-chapter deliverables".

- Chapter definition: `src/content/chapters/index.ts` (`rwe-t2-leetcode`)
- Lesson body: `public/content/chapters/rwe-t2-leetcode.mdx`
- Manifest row: `src/curriculum/manifest.ts`, slug `rwe-t2-leetcode`
  (`chapterDefinitionId` flipped from `null`)

**Wave.** `pending-content.md`'s Wave 7 ("RWE Tier 2 (all 5)").

Precedent: RWE Tier 1, plus Notification System's Tier 2 calls. Not re-argued here.

## 0. Type classification

**RWE Project** (§4). All ten §6-mandatory RWE sections present; three of four
optional ones used (Think first, Core mechanics as "Running a stranger's code",
Preview of next). Mental model is the paragraph under the numbers ("a CPU-bound,
untrusted, bursty workload behind an ordinary web product").

**New concepts: 2**, exactly §15.2's row: sandboxed execution (concept); fairness
under contest spikes.

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Build a judge that runs strangers' code where it can only hurt itself, absorbs a contest-start burst, and ranks fairly while behind, and name what each choice costs. |
| Type | RWE Project |
| Difficulty | intermediate (manifest) |
| Estimated time | 75 minutes (manifest). Lesson ~2,100 words. |
| Prerequisites | Checkpoint G. |
| Unlocks | Nothing directly. |
| Building blocks introduced | None (§16). |
| Reinforces | 3.5 gateway, 3.17 workers, 3.24 per-key limits, plus 3.19 (serverless and its ceilings), 3.15 (CDN TTL), 2.2. |
| Stages trained | §2 stages 5 and 6. |
| Interview relevance | High - "design LeetCode / an online judge" is common. Feeds steps 1 (untrusted code, contests), 3 (sandbox count), 5 (isolation, async path), 6 (14:30). |
| Production relevance | Any product that executes user code (judges, notebooks, CI, plugin platforms) makes the same isolation and blast-radius decisions. |
| Interview-canon note | "The hidden requirement": the candidate who treats this as CRUD with a run button misses both concepts; the grade is noticing them in step 1. |

## 2. Learning objectives (§5.2)

1. **Knowledge** - Name what each sandbox layer stops and leaves open, and why the
   judge fleet holds no credentials.
2. **Engineering** - Make judging fair under a backlog: accept-time ranking,
   per-contestant cap, CPU-time limits.
3. **Interview** - Answer "it's 14:30, what happens?" with the sandbox count, the
   async path and calendar provisioning.
4. **Practical** - Build the off-request-path judge; pass Submit.
5. **Communication** - Defend a judge fleet or a function per submission.

Exercised: 1 by the layer table, Q1 and Q4; 2 by the fairness section, Q2 and Q3;
3 by the interview answer and Q5; 4 by the build; 5 by the commentary and Q4.

## 3. Per-beat outline (§5.3 RWE variant)

| Beat | Lesson section | Notes |
|---|---|---|
| 1-2 Cold open | Untitled opening | Memory bomb kills a process; resubmit storm. Paid off in the walkthrough and the fairness section. |
| 3 Think first | `[!NOTE]` | Where the code runs; who ranks first when behind. |
| 4 Mental model | "The numbers" + paragraph | Steps 1-3. |
| 6-7 Core mechanics | "Running a stranger's code" | New concept 1. Threat list, layer table, the architectural layer. Engineering nugget. |
| 5 Visual | `<Walkthrough>` "Where the code runs" | §4 below. |
| 7 Deeper | "Fairness when the judge is behind" | New concept 2. Four decisions plus calendar provisioning. Production nugget. |
| 8 Trade-offs | "Trade-offs" | What runs the code leads. |
| 9-12 | What breaks, What changes at scale, In production, Common mistakes | Judge0 on isolate; Lambda on Firecracker. |
| 13 Interview lens | "In an interview" | Senior answer. |
| 14 Connections | "Connections" | 3.5, 3.24, 3.17, 3.19, 3.15, 2.2. |
| 15 Recap | "Recap" | Five anchors. |
| 16 Transition brief | "Your turn" | Symptoms, Stretch (machine speed per language), not told. |
| Preview | "Next" | Price Tracking Service. |

## 4. Diagram (§7)

One `<Walkthrough>`, two algorithms (`inline`, `fleet`), seven nodes: contestant,
gateway, load balancer, API, submissions, judge queue, sandboxed judges. The
`inline` variant is the cold open drawn on the same topology (queue and judges
unused, the API faulted at step 4, the route faulted at step 5 for the resubmit
storm); the `fleet` variant traces accept, enqueue, sandboxed run and the verdict
callback. The verdict edge is judge -> API, showing the no-credentials posture. DNS
is omitted and the description says why.

## 5. Component budget (§16)

- **Palette: all 27.**
- **`requiredComponentIds`: `browser`, `dns`, `api-gateway`, `load-balancer`,
  `app-server`, `message-queue`, `dead-letter-queue`.** Shared by both blueprints.
  The judge (`worker` or `serverless-function`) is what differs.

## 6. Validation rules

None new. `queue-without-dead-letter-queue` escalated (brief: "a submission the
judge itself keeps failing on is set aside"). `component-relations` catches a DLQ
fed by a worker and a queue fed by the browser. `single-instance-load-balancer`
pre-explains the `instances` predicate.

## 7. Blueprints, starter graph, decorators

**Starter: three nodes, one row** - browser, one API server at one instance,
relational database. Tier 2's smallest starter: the judge path, the edge and the
data store's durability all have to be built. Validates clean, cannot pass.

**Two blueprints, identical except for what runs the code:**

1. `rwe-t2-leetcode-blueprint-fleet` - judge is `worker`.
2. `rwe-t2-leetcode-blueprint-serverless` - judge is `serverless-function`.

Kept as two blueprints rather than one componentId array, because the choice is
the project's central decision and each deserves its own debrief commentary.

Both require: browser -> DNS, DNS reaches the gateway and the gateway reaches the
load balancer by any path (so a CDN, firewall or reverse proxy may sit in between),
LB -> API (`instances >= 2`), API reaches a store, API -> queue -> judge, queue ->
DLQ, and the judge reaches the store by any path - through the API (the reference
graphs' no-credentials posture) or directly.

**Decorators**: Client, Application, Data zones; one comment with the contest peak.

## 8. Hints

1. Orienting: list what shares a machine with contestant code.
2. Structural: where submission 9,000 waits at 14:30.
3. Directional: trace the verdict's path to durable storage.
4. Directional: settings, not boxes (`instances`).

## 9. Quiz

| # | Kind | Difficulty | Under test |
|---|---|---|---|
| 1 | single | 1 | Blast radius of judging on the API |
| 2 | single | 2 | Rank on accept time |
| 3 | single | 2 | Wall-clock vs CPU time limits |
| 4 | matching | 3 | Four choices, four costs |
| 5 | single | 3 | Calendar provisioning vs reactive autoscaling |

Correct positions across the singles: 2, 3, 0, 1. Q4 pairs are a full derangement.

## 10. Playtest pass (§18.2)

| Move | Taught in |
|---|---|
| Hostname resolution in front of the product | 3.2 |
| Gateway authentication and a per-key rate limit | 3.5, 3.24 |
| Load balancer over a stateless API with several instances | 3.4, 3.6, 3.8 |
| Moving slow work off the request path through a queue, with a DLQ | 3.17 |
| A serverless function triggered by a queue, and its timeout and concurrency limits | 3.19 |
| A CDN in front of identical, burst-read content (optional) | 3.15 |
| Assembling from a brief | Checkpoint G |

Not sourced from a prior chapter, by design: sandbox layers and contest fairness are
the declared new concepts.

## 11. Simplifications

- Sandbox layers are configuration of the judge machines; no canvas field
  represents them. Taught in prose, assessed by Q1 and Q4.
- Accept-time ranking, per-contestant caps and CPU-time limits are application
  behavior. Prose and Q2, Q3.
- Practice and contest traffic share one queue in both references; separating them
  is a trade-off row, not a requirement.
- Polling for the verdict is not drawn; it is an ordinary request through the
  existing path.

## 12. Flagged for a second pass

- **Neither new concept has a canvas field.** The build grades their architectural
  consequence (code off the request path, on its own compute, behind a queue), the
  quiz grades the concepts. Bitly's split, stated once more.
- **Drift lists a CDN as "extra"** when a learner who added one fails for another
  reason (verified on a graph with the verdict edge removed). The CDN is legitimate
  and appears in both reference graphs; the drift report has no notion of optional
  components.
