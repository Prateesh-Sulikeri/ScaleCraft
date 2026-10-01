# Chapter spec - Checkpoint R2: Building a Complete Backend

Authored under CURRICULUM.md §5, §6, §14 Part 4, §20. Deliverable 1 of 6.

- Chapter definition: `src/content/chapters/index.ts`
  (`bb-r2-building-a-complete-backend`)
- Lesson body: `public/content/chapters/bb-r2-building-a-complete-backend.mdx`
- Manifest row: slug `checkpoint-r2-building-a-complete-backend`
  (`chapterDefinitionId` flipped from `null`)

**Inherits R1's checkpoint precedent** (R1 spec §0, §12) unchanged: four-section
lesson, no diagram, no quiz, no starter graph, requirement list in
`problemStatement`, two blueprints differing only in how app-tier redundancy is
drawn. Where R2 departs from R1, it says so below.

## 0. Type classification

**Checkpoint** (§4). §6's Checkpoint column: cold open, Connections, Transition
brief, Preview of next - everything else prohibited. No new material (§4).

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Assemble a backend touching every Part 3 group from a product description: browse, search, order, notify, nightly reports, survive an instance failure. (§14) |
| Type | Checkpoint |
| Difficulty | advanced |
| Estimated time | 60 minutes (§14) |
| Prerequisites | 3.26 |
| Unlocks | R3; RWE Tier 2 (§17). |
| Building blocks introduced | None. |
| Stages trained | 5 (Design), with 4 and 6 in passing. |
| Interview relevance | High, indirectly: the closest Building Blocks gets to a full "design the backend" answer. Framed in two sentences of the cold open (§6 prohibits an Interview lens). |
| Production relevance | The composition: three paths and per-data-class stores are how real backends are shaped. |

## 2. Learning objectives

One per §5.2 category, all composition/retrieval:

1. **Knowledge** - Sort a brief's requirements into request, deferred and
   scheduled paths, and name the component each needs.
2. **Engineering** - Choose a different store per data class, justified by its
   consistency and failure behavior.
3. **Practical** - Assemble the backend on an empty canvas and pass Submit.
4. **Interview** - Answer "what happens when the order database dies?" against
   your own design.
5. **Communication** - Walk the design as three paths rather than a list of boxes.

Exercised by the build (1-3), the blueprint commentary (5), and hint 2 + the
orders requirement (4). No quiz (§22).

## 3. Per-beat outline

| Beat | Section | Notes |
|---|---|---|
| 1-2 | Opener | What changed since R1; the new skill is sorting work by *when* it happens. Two sentences of interview framing. |
| 14 | Connections | Four-row table (A-D collapsed into one row, then E, F, G), each a question. Three carry-forward warnings: time requirements are path requirements, failure requirements are answered by structure, two stores is not duplication. |
| 16 | Your turn | Product paragraph, ten requirements, "what you are not told". |
| Next | Next | R3: many designs pass, only taught mistakes fail. |

## 4. Declared omissions and justifications

- Eleven §6 sections prohibited for Checkpoint (R1 spec §4).
- No diagram: it would be the answer (R1 spec §5).
- No quiz (§22).
- `problemStatement` carries the full requirement list, as R1 did; calibration
  checked line by line - every bullet states an outcome or symptom, none names a
  component, field, edge kind or count of components.

## 5. Diagrams

None (§6).

## 6. Component budget and requirement mapping

`availableComponentIds` is **all 27**, per §14's "Palette: all 27" - which
includes `client`, absent since Part 1. Departure from every Part 3 palette,
deliberate.

`requiredComponentIds` (17), each mapped to a brief line:

| Requirement | Components |
|---|---|
| One domain, browser, international audience, same bundle | `browser`, `dns`, `cdn` |
| Perimeter closed, TLS once, auth + per-caller limit once | `firewall`, `reverse-proxy`, `api-gateway` |
| Sale peak, one machine dying drops nothing | `load-balancer`, `app-server` (instances >= 2, or two nodes) |
| Free-text search | `search-engine` |
| Popular pages read hundreds of times per change | `cache` |
| Catalog owned by one store | `sql-database` **or** `nosql-database` (blueprint, not required list) |
| Photos, 40 TB, not in the catalog store | `object-storage` |
| Email must not slow the order, never silently lost | `message-queue`, `dead-letter-queue`, sender = `worker` **or** `serverless-function` |
| Orders: automatic failover, nothing acknowledged lost, never two writers | `leader`, `follower` x2, `coordinator` |
| Nightly 25-minute report, on its own, off the leader and the shopper pool | `cron-job`, runner = `worker` **or** a separate `app-server`, reading from a `follower` |

Every group is represented (§14: "requires >= 1 component from every group"):
A (edge stack), B (stateless redundant app tier - Group B introduced no
component), C (catalog store), D (cache, CDN, search), E (queue, DLQ, cron), F
(object storage, coordinator), G (leader, followers).

**Available and deliberately unmotivated:** `client`, `read-replica`,
`distributed-cache`, `event-bus`, `kafka`, `lock-service`, sharding. The report
reads from a follower, which is the replica's job here; one consumer of the order
event is not fan-out; a once-nightly job cannot overlap itself. Same posture as
R1 objective 5.

**The 25-minute report rules out a serverless runner** (3.19's timeout ceiling)
without the brief naming it.

## 7. Validation rules

All ten registry rules. New relative to R1: `split-brain-risk`,
`queue-without-dead-letter-queue` (both warnings, both enforced structurally by
the blueprint's coordinator and DLQ). `no-direct-client-database` is **live for
the first time since Part 1**, because `client` is in the palette.

Warnings cannot fail Submit (R1 spec §12). `permissive-firewall` remains
unenforced exactly as in R1 - a design with an `allow-all` firewall passes - and
this is the same flagged severity question (decision 11). `rateLimitPerMinute` is
not gated (3.24 gated it; a checkpoint gating a specific value from a brief that
states none would be a hidden requirement).

## 8. Blueprints

Two, identical except the shopper tier:

1. `bb-r2-blueprint-instances` - one `app-server` with `instances >= 2`.
2. `bb-r2-blueprint-two-nodes` - two `app-server` nodes behind the load balancer.

Both use `componentId` arrays for the three two-answer slots (catalog, sender,
report runner). Aliases bind injectively, so the report runner must be a
different node from the shopper tier - a learner who hangs the report off the
shopper pool fails, which is the brief's "must not touch the pool serving
shoppers". Two follower aliases bind to two distinct followers; the report reads
from either (`f1` is unconstrained between them).

R1's decision-11 mitigation carries over (threshold `gte 2`, the second
blueprint, hint 3). New drift risk: a design using **one** worker for both email
and the report fails (the two worker-capable aliases need two nodes) and reports
a mismatched connection rather than a missing component. That is the right
failure - one pool for both is a bulkhead violation 3.23 named - but the message
is generic; hint 3 covers it.

## 9. Hints

1. Sort requirements by when the work happens - three paths.
2. Data classes want different homes; the orders line is the one that needs
   failover.
3. Drift-shape catcher (R1's hint 3, widened to "connected in a way that answers a
   different requirement").

## 10. Quiz

None (§22).

## 11. Playtest pass (§18.2)

| Move | Taught in |
|---|---|
| Edge stack: DNS -> CDN -> firewall -> proxy -> gateway -> LB | 3.1-3.5, 3.15, R1 |
| Redundant stateless shopper tier | 3.6, 3.8 |
| Catalog in one store, cache in front with miss path | 3.10, 3.11, 3.14 |
| Search engine fed from the app tier | 3.16 |
| Photos in object storage written by the app tier | 3.20 |
| Queue + consumer + DLQ for the email | 3.17 |
| Cron Job with no input, triggering compute | 3.19 |
| Report runner apart from the shopper pool | 3.19, 3.23 (separate jobs service, bulkhead) |
| Ruling out serverless for a 25-minute job | 3.19 |
| Reads from a follower | 3.26 (`follower` -> compute) |
| Leader + two followers + coordinator, app asks coordinator | 3.26, 3.22 |
| Leaving read replica / event bus / Kafka / lock service out | 3.12, 3.18, 3.23 (each taught its motivating condition) |

No move unsourced.

## 12. Flagged

- **`client` re-enters the palette** for the first time since Part 1, per §14's
  "all 27". A learner may draw a Client instead of a Browser; the blueprint
  requires `browser`, which matches the brief ("in a browser").
- **Photos are served through the application tier** because neither the CDN nor
  the browser can connect to object storage (decision 20). Recorded in
  `simplifications`; RWE projects will hit it harder.
- **The largest blueprint in the curriculum** (21-22 nodes, 25-26 edges). If
  matching performance is ever a concern, this is the chapter to measure.
- Warning-severity anti-patterns pass R2 as they passed R1; R3 is where that
  changes (see R3 spec §7).
