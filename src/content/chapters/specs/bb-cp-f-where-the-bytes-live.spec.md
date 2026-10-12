# Chapter spec - Checkpoint F: Where the Bytes Live

Authored under CURRICULUM.md §5, §6, §14 Part 4, §20, and the checkpoint
contract in `.claude/docs/pending-checkpoints.md`. Deliverable 1 of 6.

- Chapter definition: `src/content/chapters/index.ts` (`bb-cp-f-where-the-bytes-live`)
- Lesson body: `public/content/chapters/bb-cp-f-where-the-bytes-live.mdx`
- Manifest row: slug `checkpoint-f-where-the-bytes-live`, number `F`, after
  3.22; 3.23's `prerequisiteSlugs` now lists it with Checkpoint E.

## 0. Type classification

**Checkpoint, Extend flavor**: front door and application tier provided; the
storage tier is an empty zone, and the CDN is missing from the edge on purpose.
No new material.

## 1. Metadata

| Field | Value |
|---|---|
| Purpose | Give bytes, documents and money each a fitting home, split bytes by audience, give a sharded store one placement owner, and put the CDN back in front. |
| Type | Checkpoint (Extend) |
| Difficulty | intermediate |
| Estimated time | 30 minutes |
| Prerequisites | 3.22 |
| Unlocks | Group G (3.23), together with Checkpoint E |
| Building blocks introduced | None |
| Interview relevance | High: "where do the photos live?" is asked of any media design. |

## 2. Learning objectives

1. **Knowledge** - Place each kind of data and name its chapter.
2. **Engineering** - Decide when bytes need two homes, by audience.
3. **Practical** - Build the storage tier, restore the CDN, and pass Submit.
4. **Interview** - Photos and Sydney in two sentences.
5. **Communication** - Why placement is drawn as control, not a request.

## 3. Per-beat outline

| Beat | Section | Notes |
|---|---|---|
| 1-2 | Opener | One convenient store holding everything is the predictable failure; each line of the brief rules out a shortcut. |
| 14 | Connections | One row per Group F chapter, plus 3.11 and 3.15. States the canvas limit (buckets accept compute only) up front. |
| 16 | Your turn | Product, five requirements, "what you are not told". |
| Next | Next | 3.23 once Group E is done (same tease 3.22 used). |

## 4. Declared omissions

As R1 §4. Starter graph per the Extend flavor.

## 5. Diagrams

None.

## 6. Requirement mapping and component budget

Palette: 3.22's (16). Required: front door, CDN, app, SQL, NoSQL, object
storage, coordinator.

| Requirement | Answer | Chapter |
|---|---|---|
| Same photos for guests on four continents | CDN between DNS and the firewall | 3.15 |
| Photo bytes outside every database | Object Storage, keys in the listing record | 3.20 |
| ID scans, verification team only | A second Object Storage | 3.20 |
| Booking commits together | SQL Database | 3.10, 3.11 |
| Listings sharded, placement in one place | Three NoSQL nodes, Coordinator over `control` | 3.22 |

Interleaving pulls: 3.15 (the CDN is a rewire of the starter's DNS-to-firewall
edge) and 3.11's store choice.

## 7. Validation rules

Structural set, Group A warnings, `orphan-read-replica`.

## 8. Blueprints

One. Two `object-storage` nodes are required: "one bucket, one policy, two
audiences" is a mistake 3.20 names. Checked 2026-10-05: starter fails, reference
passes, a one-bucket variant fails.

## 9. Hints

Three: sort by bytes/documents/money; who decides placement, and the line
style; distance belongs at the front, plus the compute-only bucket rule.

## 10. Quiz

None (§22).

## 11. Playtest pass (§18.2)

CDN position (3.15, R1); app-to-bucket edge (3.20's own); separate buckets
(3.20's "What breaks" and "Common mistakes"); SQL for transactions (3.10);
coordinator over control with the app talking to nodes directly (3.22's own
blueprint).

## 12. Flagged

- Undrawable shapes (open decisions 8, 20): CDN-to-bucket origin and presigned
  browser uploads. Named in the lesson's Connections and the debrief rather
  than hidden.
- Bucket policy is not on the canvas; two buckets stand for two policies.
