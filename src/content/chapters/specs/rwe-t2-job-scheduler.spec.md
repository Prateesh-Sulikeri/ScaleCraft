# Chapter spec - RWE Tier 2: Job Scheduler

Authored under CURRICULUM.md §5, §6, §15 and §20, and QUIZ_FRAMEWORK.md §16.
Deliverable 1 of the 6 in pending-content.md's "Per-chapter deliverables".

- Chapter definition: `src/content/chapters/index.ts` (`rwe-t2-job-scheduler`)
- Lesson body: `public/content/chapters/rwe-t2-job-scheduler.mdx`
- Manifest row: `src/curriculum/manifest.ts`, slug `rwe-t2-job-scheduler`
  (`chapterDefinitionId` flipped from `null`)

**Wave.** `pending-content.md`'s Wave 7 ("RWE Tier 2 (all 5)").

Precedent: RWE Tier 1, plus Notification System's Tier 2 calls (all 27 available,
`queue-without-dead-letter-queue` escalated where the brief requires failed work to
be kept). Not re-argued here.

## 0. Type classification

**RWE Project** (§4). All ten §6-mandatory RWE sections present; three of four
optional ones used (Think first, Core mechanics as "Separating when from what",
Preview of next). Mental model is the paragraph under the numbers ("deciding when
vs doing").

**New concepts: 3**, exactly §15.2's row and at §15.1's ceiling: priority queues;
exactly-once-ish execution; misfire handling. Each has its own section.

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Build a scheduler whose dispatchers never enqueue a run twice and never lose one, whose urgent runs have their own capacity, and whose missed runs follow a per-schedule policy. |
| Type | RWE Project |
| Difficulty | intermediate (manifest) |
| Estimated time | 80 minutes (manifest). Lesson ~2,400 words; three new concepts. |
| Prerequisites | Checkpoint G. |
| Unlocks | Nothing directly. |
| Building blocks introduced | None (§16). |
| Reinforces | 3.19 (cron, the overlap hazard), 3.23 locks, 3.17 queues, plus 3.26 (election), 3.22 (coordinator), 3.10 (index), 3.13 (partitioning at 10x). |
| Stages trained | §2 stages 5 and 6. |
| Interview relevance | High - "design a distributed job scheduler / cron service" is a standard prompt. Feeds steps 1 (precision, retries, may a job run twice), 3 (the top-of-hour spike), 5 (dispatch coordination, delivery semantics), 6 (scheduler dies at 01:58). |
| Production relevance | Every SaaS with "schedule this" has one; the two-machine double-run is its classic first incident. |
| Interview-canon note | "Correctness under failure": the design is small and the grade is whether the candidate can say exactly what happens when each piece dies. |

## 2. Learning objectives (§5.2)

1. **Knowledge** - Explain why an urgent run waits behind the 09:00 wall with a
   priority queue but no reserved executors, and size the wait.
2. **Engineering** - Name the three places a run is duplicated and the answer to
   each, including why execution is only effectively once.
3. **Interview** - Answer "what if the scheduler is down from 01:58 to 02:21?"
   naming durable schedules, the failover path and a per-schedule misfire policy,
   in under a minute.
4. **Practical** - Build a scheduler with coordinated dispatch and per-priority
   capacity; pass Submit.
5. **Communication** - Defend an elected dispatcher or a claim per run by naming
   failover time and coordination cost.

Exercised: 1 by the 09:00 section and Q4; 2 by the duplicates table, Q1, Q2, Q5;
3 by the misfire table, the interview answer and Q3; 4 by the build; 5 by the commentary and Q4.

## 3. Per-beat outline (§5.3 RWE variant)

| Beat | Lesson section | Notes |
|---|---|---|
| 1-2 Cold open | Untitled opening | One machine misses, two machines double. Both paid off (walkthrough, exactly-once section). |
| 3 Think first | `[!NOTE]` | Asks for exactly-once and misfires. |
| 4 Mental model | "The numbers" + paragraph | Steps 1-3; when vs doing. |
| 6 Core mechanics | "Separating when from what" | Dispatcher, run row, queue, executors; why rows make misses recoverable. |
| 5 Visual | `<Walkthrough>` "Two dispatchers, one due run" | §4 below. |
| 7 Deeper | "Exactly once, and what it really means", "Priority, and the 09:00 wall", "Misfires" | The three new concepts, one section each. Production nugget, engineering nugget. |
| 8 Trade-offs | "Trade-offs" | Dispatch coordination leads (the exercise's open decision). |
| 9-12 | What breaks, What changes at scale, In production, Common mistakes | Airflow 2 (row-lock claims, multiple schedulers), Kubernetes CronJob (`startingDeadlineSeconds`, `concurrencyPolicy`). |
| 13 Interview lens | "In an interview" | Senior answer. |
| 14 Connections | "Connections" | 3.19, 3.23, 3.26, 3.17, 3.10, 3.13. |
| 15 Recap | "Recap" | Five anchors. |
| 16 Transition brief | "Your turn" | Symptoms, Stretch (one customer's 500,000 runs - 3.24 per-key fairness), not told. |
| Preview | "Next" | LeetCode. |

## 4. Diagram (§7)

One `<Walkthrough>` with two algorithms (`claim`, `elect`) over one eight-node
topology: tick, two dispatchers (two `app-server` nodes standing for two machines),
schedules, lock service, coordinator, run queue, executors. The lock service is
unused in `elect` and the coordinator in `claim`; captions name what is in play.
Step 4 is the failure (Dispatcher A faulted) and shows each design's recovery path.
Step 5 sets up the next section: neither design stops queue redelivery.

## 5. Component budget (§16)

- **Palette: all 27.**
- **`requiredComponentIds`: `client`, `cron-job`, `app-server`, `message-queue`,
  `worker`, `dead-letter-queue`.** Shared by both blueprints. Lock service and
  coordinator are each required by one.
- Executors are `worker` only, not `serverless-function`: p99 runs are 20 minutes
  and 3.19 taught the function's 15-minute ceiling.

## 6. Validation rules

None new. `queue-without-dead-letter-queue` escalated to error (brief: "a run that
keeps failing is recorded and set aside"). `component-relations` catches a cron with
an inbound edge (it has no input port) and a dispatcher wired to the lock with a
kind it refuses. `single-instance-load-balancer` is unreachable unless the learner
adds a load balancer.

## 7. Blueprints, starter graph, decorators

**Starter: eight nodes, three rows** - callers, tick, one API (one instance), the
dispatcher at **two** instances (the cold open's second machine), schedules, one
queue with DLQ, one executor pool. Validates clean, cannot pass.

**Two blueprints, differing on how dispatchers coordinate:**

1. `rwe-t2-jobs-blueprint-claim` - dispatcher -> `lock-service`, any edge kind.
2. `rwe-t2-jobs-blueprint-elect` - dispatcher -> `coordinator`, `control`.

Both require: callers reach the API by any path; the API reaches the store by any
path; tick -> dispatcher (`instances >= 2`) -> store directly (the dispatcher reads
the schedules the API writes - what makes misfires detectable); two distinct queues
each feeding a distinct executor pool (injective binding: two queues into one pool
cannot match); a DLQ on one of them (the escalated rule covers the other).

**Decorators**: Triggers, Application, Data, Runs zones; one comment on the two
uncoordinated dispatchers and minute 0. No gap zone.

## 8. Hints

1. Orienting: two failures, one cause - what each dispatcher knows about the other.
2. Structural: what is guaranteed free in 30 s when 60,000 runs are queued.
3. Directional: Group G closed 3.19's hazard two ways; either is complete.
4. Directional, decision 27: count when the report names nothing.

## 9. Quiz

| # | Kind | Difficulty | Under test |
|---|---|---|---|
| 1 | single | 1 | Uncoordinated dispatchers double a run |
| 2 | single | 2 | Execution duplicates need the customer's side (idempotency key) |
| 3 | single | 2 | Misfire policy for a health check |
| 4 | matching | 3 | Four choices, four costs |
| 5 | single | 3 | Fencing token after a GC pause |

Correct positions across the singles: 0, 2, 1, 3. Q4 pairs are a full derangement.
The bank (§16) has no Job Scheduler entry; all five are new.

## 10. Playtest pass (§18.2)

| Move | Taught in |
|---|---|
| A Cron Job as the tick that starts work | 3.19 |
| Two instances of the dispatcher, and the overlap hazard that creates | 3.19 |
| A lock around work that must run once | 3.23 |
| Electing one active node through a coordinator | 3.22, 3.26 |
| Queues, workers, DLQ | 3.17 |
| Separate pools so one class of work cannot exhaust another's capacity | 3.23 (bulkheads) |
| An indexed column making "what is due" cheap | 3.10 |
| Assembling from a brief | Checkpoint G |

Not sourced from a prior chapter, by design: priority as reserved capacity, the
three duplicate sources, and misfire policies are the declared new concepts.

## 11. Simplifications

- The tick is a Cron Job at its 1-minute minimum; the real dispatcher polls every few
  seconds. The lesson describes the poll, the canvas draws the tick.
- The run row plus queue send (an outbox) is described, not drawn.
- Fencing tokens, misfire thresholds and spread offsets have no canvas field. Prose
  and quiz only.
- A database row lock (`SKIP LOCKED`) is a real third answer to dispatch
  coordination and is indistinguishable on canvas from no coordination at all, so it
  cannot pass. The lesson names it under Airflow; the spec records it as the honest
  cost of grading coordination by topology.

## 12. Flagged for a second pass

- **Open decision 27**: two queues draining one pool fails with an empty drift
  report (verified). Hint 4 mitigates.
- **Open decision 11 shape**: a coordinator design with the dispatcher lowered to
  one instance is reported against the claim blueprint ("missing Lock Service")
  rather than as a misconfigured instance count (verified). Low risk: the starter
  already has two instances, so a learner has to lower it to hit this.
- **Three new concepts** is §15.1's ceiling; the lesson runs ~2,400 words against
  Tier 1's ~2,000. Density pass done; each concept has one section and one table.
