# Chapter spec - 3.23 Reliability Patterns

Authored under CURRICULUM.md §5, §6, §20. Deliverable 1 of 6.

- Chapter definition: `src/content/chapters/index.ts` (`bb-3-23-reliability-patterns`)
- Lesson body: `public/content/chapters/bb-3-23-reliability-patterns.mdx`
- Manifest row: slug `3-23-reliability-patterns` (`chapterDefinitionId` flipped
  from `null`)

**Wave.** First Group G chapter (Wave 7). Prerequisites 3.19 **and** 3.22 (§17:
Group G needs E and F), so this is the first chapter since R1 that may assume both
async systems and storage.

## 0. Type classification

**Building Block** (§14), introducing `lock-service` (§16). Every §6 Building
Block section is present.

Budget: one component, no new edge kind (`control` is 3.4's, first learner-built
in 3.22). One idea-cluster, stated in the lesson as "stop one dependency's latency
from spending capacity that belongs to everything else"; the lock is the row's
mandated second half, framed as the one failure that is not caller-vs-dependency.

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Timeouts, retries with backoff, idempotency, circuit breakers, bulkheads; distributed locks for mutual exclusion, resolving 3.19's cron-overlap cliffhanger. (§14) |
| Type | Building Block |
| Difficulty | advanced |
| Estimated time | 30 minutes |
| Prerequisites | 3.19, 3.22 |
| Unlocks | 3.24; with Group G, R2. RWE Payment System, Uber, Ticketmaster-class projects lean on idempotency and locks. |
| Building blocks introduced | `lock-service`. Agrees with §16. |
| Stages trained | 4, 5, 6 |
| Interview relevance | **High** - loop step 6 depth (§14). |
| Production relevance | Most cascading outages are a slow dependency plus retries; most duplicate-effect bugs are a retried write with no key. |

## 2. Learning objectives

| # | Category | Objective |
|---|---|---|
| 1 | Knowledge | Explain why a slow dependency holds more capacity than a dead one, using rate x latency. |
| 2 | Engineering | Set a timeout from a dependency's p99 and keep inner timeouts inside outer ones. |
| 3 | Engineering | Decide where retries belong and why retries at every layer multiply into a storm. |
| 4 | Practical | Add mutual exclusion to an overlapping scheduled job on the control path, and pass Submit. |
| 5 | Interview | Answer "what if this dependency gets slow?" with timeout, bulkhead and breaker, each named for what it limits. |
| 6 | Communication | Justify an idempotency key or a fencing token aloud by the failure each one closes. |

Exercised by: 1 -> "Slow is worse than dead" + walkthrough + Q2; 2 -> timeouts
section + Q1; 3 -> retries section + Q3; 4 -> build; 5 -> bulkhead/breaker
sections + Interview lens + Q5; 6 -> idempotency and lock sections + Q4, Q6.

## 3. Per-beat outline

| Beat | Section | Notes |
|---|---|---|
| 1-2 | Opener | One search shard at 4 s takes down the job-detail page, which never calls search. |
| 3 | Think first | Smallest change to keep job-detail up. Paid off by name in "Bulkheads" ("This is the Think-first answer"). |
| 4 | "Slow is worse than dead" | Three outcomes of a call; rate x latency table (Little's law glossed in a clause). |
| 5 | Walkthrough | Primary diagram, six steps, story of the storm then the contained version. |
| 6-7 | Timeouts, Retries, Idempotency keys, Circuit breakers, Bulkheads | Each section is one mechanism and what it limits; summary table at the end of Bulkheads. Idempotency sequence and breaker state diagram. |
| 6-7 | "One run at a time" | Lease, renewal, fencing token; lock service on 3.22's consensus group, control path. |
| 8 | Trade-offs | Five rows, cost both ways. |
| 9 | What breaks | Seven. |
| 10 | What changes at scale | Shared libraries/proxies; fan-out p99 (3.13); retry storm as the outage pattern, cell isolation. |
| 11 | In production | Amazon (single-layer retries, jitter in SDKs), Netflix (Hystrix breakers + bulkheads), Google Chubby (lock service). Lens 9: DB advisory lock for a two-person team. |
| 12-13 | Common mistakes, Interview lens | Senior answer built only from this chapter's vocabulary. |
| 14-15 | Connections, Recap | 2.2, 3.17, 3.19, 3.22. |
| 16 | Your turn | Symptom in time, not wiring; points at "which part does the sweep". |
| Next | Next | 3.24 Rate Limiting - the same storm from the client side. |

## 4. Declared omissions and justifications

1. **§14's "fix (retry storm described; add backoff + idempotency config)" is
   not built.** No registry component has a timeout, retry, backoff or
   idempotency field (`app-server` has only `instances`; `serverless-function`'s
   `timeoutSeconds` is an execution ceiling, not a call timeout). Same class as
   open decisions 17 and 19 (a §14 config exercise with no schema), raised as
   **open decision 23** and resolved by editing §14's row to match. The retry storm ships as the walkthrough, the retries
   section, and quiz Q2/Q3/Q5; the build is the lock half of the row.
2. **No `<Walkthrough>` for the lock.** The overlap is a timing story between two
   runs of one job, which a sequence diagram carries and a topology stepper
   cannot (both runs are the same card). Mermaid sequence instead.
3. Nugget boxes - decision 5, as every chapter since.

## 5. Diagrams

- **Primary: `<Walkthrough>`** - browser, gateway, app pool, search, SQL DB; six
  steps from healthy to storm to contained. Uses 2.2's lit-path-stops-at-the-break
  convention for step 5 (decision 14: no failure state exists). Every edge is
  registry-legal.
- Mermaid sequence: idempotency key on a lost response.
- Mermaid state diagram: breaker Closed/Open/HalfOpen.
- Mermaid sequence: lease expiry during a pause, fencing token rejection.
- Two tables (slots held; pattern -> what it limits) and the trade-offs table.

All captioned with what to notice.

## 6. Component budget and cross-reference checks

- New: `lock-service`. Palette = 3.19's (all Group E) + 3.20's `object-storage` +
  3.22's `coordinator` + `lock-service` = 24. First palette holding both groups.
- **Edge legality drove the starter.** `cron-job.relations.outputs` reaches only
  compute/messaging/data, and `lock-service.relations.inputs` accepts only
  `compute`. So the scheduler cannot take a lock itself; something on the compute
  side must. `worker` has no `distributed-systems` output, and a 70-minute sweep
  exceeds `serverless-function`'s 900 s ceiling (taught in 3.19), which leaves
  `app-server`. The starter therefore models the sweep as a separate jobs service
  (its own `app-server`) the scheduler calls - a change from 3.19's simplification
  (one cron card as scheduler and job), disclosed in `simplifications`. The lesson
  turns it into the point: "the scheduler only fires".
- **app -> lock-service accepts `control` or `request-flow`.** The blueprint
  accepts either kind; the lesson calls acquiring a lock a control-path request.
  Rejecting a default `request-flow` draw would make the drift report the
  feedback surface for an edge-kind nuance that is not this chapter's subject.
- **2.3's Group G row (decision 15): "enough boxes that something is always
  broken".** First of four checked - matches: the cold open is one bad disk among
  many healthy machines.
- **2.2's "Group G's entire subject (3.23)" pointer** - retry budgets, idempotency
  and circuit breakers - all three delivered.
- **3.19's Connections tease paid off** ("two runs of the same job, on the same
  rows... a component of its own").
- **3.22's Next paid off** ("a third outcome - you waited and heard nothing").

## 7. Validation rules

No new rules. `component-relations` does the real work: a learner wiring the
Cron Job straight to the new component is refused with an explanation, which is
the "the scheduler only fires" point. `orphan-component` catches the new
component dropped and not wired. `missing-input-connection`,
`no-direct-client-database` carried.

## 8. Blueprint and starter graph

- **One blueprint**: browser -> LB -> web pool -> SQL DB; cron -> jobs service ->
  SQL DB; jobs service -> lock service (`control` or `request-flow`). Two
  `app-server` aliases bind injectively, so the lock must hang off the jobs
  service, not the web pool.
- **Clean starter, justified fresh.** The fault is temporal (two concurrent runs)
  and has no graph representation. Brief, Your turn and hint 1 say Validate will
  be silent. Third clean starter in Group E-G (3.19, 3.20); 3.22 broke the run.
- `lockTtlSeconds` is taught (lease vs job length) and **not gated** - a failed
  config predicate reports "Missing: Lock Service" (decision 11). Quiz Q6 tests it.
- The jobs service has `instances: 2`, deliberately: shrinking it to one does not
  help, because one process runs two overlapping invocations just as well.
- **Layout.** First column (x=60): browser, cron. LB (x=320), then web pool and
  jobs service (x=580), gap slot under the jobs service, SQL DB (x=840). Two rows,
  widest column two.
- **Decorators.** Client and Schedule (stacked, slate), Application (purple,
  spanning LB and both pools), Build here, Data; one comment with the run
  timings, naming no component to add.

## 9. Hints

1. Orienting: Validate is silent because the fault is in time; ask what both runs
   would have to consult, and whether it can live inside either.
2. Directional: the three tempting fixes 3.19 already ruled out; something
   outside both runs that one can hold and that frees itself.
3. Near-miss catcher: if the connection is refused, the scheduler only fires -
   the card doing the sweep must ask.

## 10. Quiz

Six, ramp 1/1/2/2/3/3. Bank §14 Q1 (timeouts) -> Q1, Q2 (idempotency keys) -> Q4,
Q3 (circuit breaker) -> Q5; joke distractors replaced ("punishing the dependency",
"banks require UUIDs"). Q2 is a matching question (pattern -> what it limits),
Q3 retry multiplication, Q6 lease + fencing. Matching is a full derangement
(0 -> [1], 1 -> [3], 2 -> [0], 3 -> [2]). Single-choice letters a, c, d, b, a -
opens on a against 3.22's d.

## 11. Playtest pass (§18.2)

| Move | Taught in |
|---|---|
| Read a Cron Job as a trigger with no input | 3.19 |
| Recognize two overlapping runs as a mutual-exclusion problem | 3.19 (failure list: "something outside both runs that only one can hold") |
| Know the scheduler cannot hold the exclusion itself | **This chapter** ("the scheduler only fires"), enforced by `component-relations` |
| Wire from an Application Server to a distributed-systems component on the control path | 3.22 (app -> coordinator) |
| Change an edge's kind | 3.12, 3.22 |
| Place the new component | **This chapter** |

No move unaccounted for.

## 12. Flagged

- **Open decision 23 (new):** §14's 3.23 row and §11.1 promise backoff /
  idempotency config the registry has no fields for.
- **`lock-service.md`** has a generation artifact ("state state-changing");
  `leader.md` is titled "Leader Election Component" and describes the election
  mechanism rather than the role card. Added to decision 22 (global component
  docs), not edited here.
- Little's law is named in a parenthesis and used once; it has no home chapter
  and is general engineering vocabulary under the register rule.
- ~2,250 prose words against 30 minutes - the longest Group G chapter, carrying
  five patterns plus the lock.
