# Chapter spec - 3.21 File Storage

Authored under CURRICULUM.md §5, §6, §20. Deliverable 1 of 6.

- Chapter definition: `src/content/chapters/index.ts` (`bb-3-21-file-storage`)
- Lesson body: `public/content/chapters/bb-3-21-file-storage.mdx`
- Manifest row: slug `3-21-file-storage` (`chapterDefinitionId` flipped from
  `null`)

**Wave.** Second Group F chapter, directly after 3.20.

## 0. Type classification and the missing Editor exercise

**Concept**, per §14 ("Type: Concept. New: none") and §16's no-component list.
Failure modes and Scaling are **o**; Failure modes is included (it is the
motivating material), Scaling is folded into "Why 'just mount a disk' stops
working" (degrades with each instance added).

**No Editor exercise (`hasEditorExercise: false`).** §14's only exercise is
"trade-off (object vs. file vs. block ×3 workloads)". The registry has no block
or file storage component, and adding one only to draw the shape the chapter
argues against would be a component with no §16 home. §11.1's Trade-off type
needs a presented-graphs affordance the Editor lacks; pending-content.md's
degradation path applies - the lesson's workload table plus quiz Q3 (a
three-pair matching question that *is* the ×3 trade-off). Same resolution as
3.10 and 3.13; Practical is omitted under §5.2's Concept carve-out. Not a new
open decision: it is a Concept chapter whose row never asked for a build.

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | File/block semantics vs. object semantics; POSIX expectations; why "just mount a disk" stops working; when file storage is still right. (§14) |
| Type | Concept |
| Difficulty | intermediate |
| Estimated time | 20 minutes |
| Prerequisites | 3.20 |
| Unlocks | 3.22; RWE Google Drive (§15.2) |
| Building blocks introduced | None (§16) |
| Stages trained | 2, 5 |
| Interview relevance | Low-Medium (§14), concentrated in Drive/Dropbox-class questions; loop step 4. |
| Production relevance | A shared file server sits in every client's critical path; its outage is the pool's outage. |

## 2. Learning objectives (§5.2)

| # | Category | Objective |
|---|---|---|
| 1 | Knowledge | Distinguish block, file and object by unit addressed and operations promised. |
| 2 | Knowledge | Explain why POSIX promises across machines make the file server a bottleneck and dependency. |
| 3 | Engineering | Choose block/file/object for a workload and name the deciding property. |
| 4 | Interview | Answer "design Google Drive" with file semantics as metadata over objects. |
| 5 | Communication | Justify a shared file system for path-bound tooling, naming when that stops holding. |

Exercised by: 1 -> three-shapes table + Q1; 2 -> "What a file promises" + Q2,
Q4; 3 -> workload table + Q3; 4 -> Interview lens + Q5; 5 -> "When file storage
is still right".

## 3. Per-beat outline

| Beat | Section | Notes |
|---|---|---|
| 1-2 | Opener | `/var/uploads` on NFS across three instances: a half-written sitemap and a six-minute pool freeze. |
| 3 | Think first | A better file server with failover - which incident does it fix? Paid off at the end of "What a file promises". |
| 4-5 | "Three shapes, told apart by what you are allowed to do" | Table, then the storage-layout Mermaid (§7.1's "Storage layout" home). |
| 6-7 | "What a file promises, and what that costs over a network" + "Why 'just mount a disk' stops working" | Metadata round trips, close-to-open, fragile locks, the server in the critical path; block pins state, shared FS reintroduces it (3.6/3.8). |
| 8 | "When file storage is still right" | Path-bound tooling, many readers of large files, in-place edits; block under databases; workload table. |
| 9 | "What breaks" | Four. |
| 11 | "In production" | Facebook Haystack, GitLab Gitaly, lens 9 small CMS team. |
| 12-13 | Mistakes, Interview lens | Drive's file semantics over objects; senior answer. |
| 14-15 | Connections, Recap | 3.20, 3.6/3.8, 3.10. |
| 16 | "Your turn" | States there is no build and why. |
| Next | "Next" | 3.22 (next manifest row) - every store since 3.12 kept copies that disagreed. |

## 4. Declared omissions

1. Nugget boxes - decision 5.
2. No Editor exercise - §0.
3. Scaling section folded into the "mount a disk" section (§6 marks it **o**
   for Concept).
4. No RWE cross-reference beyond the Drive family named in the Interview lens.

## 5. Diagrams

One Mermaid flowchart, three subgraphs (block, file, object), captioned. Static
by design: there is no sequence to step through, and a walkthrough would need
block and file storage components that do not exist. The comparison itself is a
table (§20.6 scan value).

## 6. Cross-reference checks

- Palette = 3.20's, unchanged.
- **2.3's Group F row (decision 15) - second of three.** 3.21 does not restate
  "blobs outgrowing rows"; it rules out the other place blobs used to go.
- **3.20's Next paid off**: the teammate's shared-disk suggestion is the cold
  open.

## 7-9. Rules, blueprint, hints

No rules, no blueprint, no starter graph. Two hints, pointed at the quiz's
judgment (what the workload does to its data; better server vs. shared
mutation) - same as 3.13 carrying hints with no exercise.

## 10. Quiz

Five, ramp 1/2/2/2/3. Bank §13 Q3 -> Q1, Q4 -> Q2 (joke distractors "There is
no difference", "Reduce to 39 servers" replaced). Q3 matching (§14's ×3
trade-off; a full derangement: pair 0 -> options[2], 1 -> [0], 2 -> [1]). Q4
(the frozen pool) and Q5 (Drive folder rename) are original. Single-choice
correct letters b, d, a, c - opens on b against 3.20's c.

## 11. Playtest pass

No Editor exercise, so §18.2's question applies to the quiz: every question
draws only on this chapter plus 3.6, 3.8, 3.10 and 3.20, all in the
prerequisite chain.

## 12. Flagged

- Haystack's "several disk operations per read" and GitLab's NFS removal are
  stated at the level of their public write-ups.
- ~1,730 prose words (excluding Mermaid and table rows) against 20 minutes.
