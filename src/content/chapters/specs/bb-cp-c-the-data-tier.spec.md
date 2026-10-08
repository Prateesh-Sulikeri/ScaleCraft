# Chapter spec - Checkpoint C: The Data Tier

Authored under CURRICULUM.md §5, §6, §14 Part 4, §20, and the checkpoint
contract in `.claude/docs/pending-checkpoints.md`. Deliverable 1 of 6.

- Chapter definition: `src/content/chapters/index.ts` (`bb-cp-c-the-data-tier`)
- Lesson body: `public/content/chapters/bb-cp-c-the-data-tier.mdx`
- Manifest row: slug `checkpoint-c-the-data-tier`, number `C`, after 3.13;
  3.14's `prerequisiteSlugs` now points here.

## 0. Type classification

**Checkpoint, Extend flavor**: the front door and application tier are provided
as a starter graph, the data tier is an empty "Build here" zone. §6's
Checkpoint column applies; no new material.

## 1. Metadata

| Field | Value |
|---|---|
| Purpose | Place a marketplace's data in stores chosen by guarantee and shape, inside a running system, and size the fleet for this year's peak. |
| Type | Checkpoint (Extend) |
| Difficulty | intermediate |
| Estimated time | 30 minutes |
| Prerequisites | 3.13 |
| Unlocks | Group D (3.14) |
| Building blocks introduced | None |
| Interview relevance | High: "where does this data live?" is asked of every design. Framed in the cold open. |

## 2. Learning objectives

1. **Knowledge** - Name the store for each kind of data and the chapter behind it.
2. **Engineering** - Decide which reads tolerate replication lag.
3. **Practical** - Build the data tier inside an existing system and pass Submit.
4. **Interview** - Answer "why didn't you shard?" from the brief.
5. **Communication** - One sentence per store: what lives there and why.

## 3. Per-beat outline

| Beat | Section | Notes |
|---|---|---|
| 1-2 | Opener | Group C's builds changed one store at a time; now the whole column is empty. |
| 14 | Connections | One row per chapter. 3.13's row is load-bearing: the brief rules sharding out. Names the one fleet line without giving the number. |
| 16 | Your turn | Product, six requirements, "what you are not told". |
| Next | Next | 3.14, via the dashboards' repeated aggregates. |

## 4. Declared omissions

As R1 §4. The `starterGraph` departs from R1's blank canvas on purpose (Extend
flavor): the learner's effort goes into the data tier, and the provided tiers
show where it fits.

## 5. Diagrams

None.

## 6. Requirement mapping and component budget

Palette: 3.13's (10). All required.

| Requirement | Answer | Chapter |
|---|---|---|
| Order, payment, reservation commit together | SQL Database | 3.10 |
| Listings vary by category, read whole by ID | NoSQL Database, `model: document` | 3.11 |
| History and dashboards read 20:1, off the checkout store | Read Replica fed by `replication` from the SQL primary | 3.12 |
| A buyer sees their own new order at once | Read from the primary (read-your-writes) | 3.12 |
| 1,200 rps peak, 300 per instance, survive one loss | `instances >= 5` | 3.8 |
| Fits on one machine for two years | No sharding | 3.13 |

Interleaving pull: 3.8's sizing on the provided fleet (starter at 2 instances,
enough to keep `single-instance-load-balancer` quiet).

## 7. Validation rules

Structural set plus `orphan-read-replica` (3.12) and Group A's two warnings.

## 8. Blueprints

One: the data tier has one honest shape for this brief. The replica must hang
off the SQL primary, because the read-heavy data (orders history) lives there.
Read-your-writes cannot be distinguished on the canvas (the app-to-primary edge
exists for writes anyway); the commentary names it. Checked 2026-10-05: starter
fails, reference passes.

## 9. Hints

Three: sort the data by three questions; which read may lag; the fleet line plus
the config-drift message.

## 10. Quiz

None (§22).

## 11. Playtest pass (§18.2)

ACID and the relational store (3.10); document model by shape and access
pattern (3.11, the same `model` field and value); replica via `replication` and
the read-back edge direction (3.12, the same edges); N+1 (3.8); not sharding
(3.13's "last lever" framing).

## 12. Flagged

- A learner who adds extra NoSQL nodes "to shard" still passes (containment);
  the debrief explains why it was not needed.
