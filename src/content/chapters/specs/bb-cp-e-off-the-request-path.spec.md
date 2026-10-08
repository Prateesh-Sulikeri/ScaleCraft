# Chapter spec - Checkpoint E: Off the Request Path

Authored under CURRICULUM.md §5, §6, §14 Part 4, §20, and the checkpoint
contract in `.claude/docs/pending-checkpoints.md`. Deliverable 1 of 6.

- Chapter definition: `src/content/chapters/index.ts` (`bb-cp-e-off-the-request-path`)
- Lesson body: `public/content/chapters/bb-cp-e-off-the-request-path.mdx`
- Manifest row: slug `checkpoint-e-off-the-request-path`, number `E`, after
  3.19; 3.23's `prerequisiteSlugs` now lists it with Checkpoint F.

## 0. Type classification

**Checkpoint, Extend flavor**: the synchronous system a diner uses is provided;
the asynchronous half is an empty zone. No new material.

## 1. Metadata

| Field | Value |
|---|---|
| Purpose | Sort a brief's work by who waits for it, and give each kind its Group E shape inside a running system. |
| Type | Checkpoint (Extend) |
| Difficulty | intermediate |
| Estimated time | 35 minutes |
| Prerequisites | 3.19 |
| Unlocks | Group G (3.23), together with Checkpoint F |
| Building blocks introduced | None |
| Interview relevance | High: "what happens when the provider is down?" Framed in the cold open. |

## 2. Learning objectives

1. **Knowledge** - Sort work by who waits; name the shape and chapter.
2. **Engineering** - Task for one consumer vs. fact for every subscriber.
3. **Practical** - Build the async half and pass Submit.
4. **Interview** - Answer the provider-outage question against your design.
5. **Communication** - Each path in one sentence: trigger, carrier, why nobody waits.

## 3. Per-beat outline

| Beat | Section | Notes |
|---|---|---|
| 1-2 | Opener | A 3.4 s booking; the skill is sorting before drawing. |
| 14 | Connections | One row per chapter, plus 3.16's index and 3.17's "does success depend on it?" rule. |
| 16 | Your turn | Product, four requirements, a note that several taught shapes pass. |
| Next | Next | 3.20 if Group F is still ahead (E and F are parallel). |

## 4. Declared omissions

As R1 §4. Starter graph per the Extend flavor.

## 5. Diagrams

None.

## 6. Requirement mapping and component budget

Palette: 3.19's (21). Required is only what every passing design contains:
front door, app, SQL, search, queue, DLQ, cron job, serverless function.
`event-bus`, `kafka` and `worker` are not required because each has an
accepted alternative (below).

| Requirement | Answer | Chapter |
|---|---|---|
| Booking fast; SMS slow and flaky; never silently lost | Queue (not at-most-once) to a consumer, DLQ | 3.17 |
| Three teams need every booking; a fourth next quarter | Event Bus or Kafka to three subscribers | 3.18 |
| Free-tables count in search | One subscriber writes to the search index | 3.16, 3.18 |
| 03:00 billing, once, no caller | Cron Job reaching the database | 3.19 |
| Tills' burst off the diner pool, idle cost zero | Gateway to a Serverless Function reaching the database | 3.19 |

Interleaving pull: 3.16's search index updated off the request path.

## 7. Validation rules

Structural set, Group A warnings, `orphan-read-replica`, and
`queue-without-dead-letter-queue` (3.17).

## 8. Blueprints

One blueprint with alternatives inside it: componentId arrays accept Event Bus
or Kafka for the broadcast and Worker or Serverless Function for each consumer.
The nightly job and burst handler reach the database by `via: "path"`, so direct
or through a worker both pass. Checked 2026-10-05: starter fails, reference
passes, the Kafka variant passes.

## 9. Hints

Three: sort by who waits; task vs. fact (the fourth team is the tell); no caller
vs. a bursty caller, plus the line-style reminder.

## 10. Quiz

None (§22).

## 11. Playtest pass (§18.2)

Queue, consumer, DLQ and the async edge (3.17, same shape as its blueprint);
bus fan-out to three subscribers (3.18, same count); subscriber writing to
search (3.17's notifier-to-search edge); Cron Job to the database (3.19's own
edge); gateway to a function (3.19's own edge).

## 12. Flagged

- Bus `deliveryMode: point-to-point` is not rejected (Kafka has no such field,
  so a predicate would break the Kafka alternative). The debrief and 3.18 carry
  it.
- Idempotent consumers are assumed, not drawn; recorded in `simplifications`.
