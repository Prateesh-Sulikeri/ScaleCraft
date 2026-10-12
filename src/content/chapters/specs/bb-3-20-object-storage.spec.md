# Chapter spec - 3.20 Object Storage

Authored under CURRICULUM.md §5 (chapter blueprint), §6 (mandatory sections),
§20 (author instructions). Deliverable 1 of the 6 in pending-content.md's
"Per-chapter deliverables".

- Chapter definition: `src/content/chapters/index.ts` (`bb-3-20-object-storage`)
- Lesson body: `public/content/chapters/bb-3-20-object-storage.mdx`
- Manifest row: `src/curriculum/manifest.ts`, slug `3-20-object-storage`
  (`chapterDefinitionId` flipped from `null`)

**Wave.** First Group F chapter. `pending-content.md` puts Group F in Wave 6
alongside Group E. **The prerequisite is Checkpoint R1, not 3.19**: §17 makes
Groups E and F parallel-eligible after R1, and `manifest.ts` already says so.
Nothing in this chapter assumes Group E (see §6).

## 0. Type classification

Building Block, per §14's "**New: `object-storage`**" and §16's audit row.
Failure modes and Scaling are therefore **M** and both appear in full. One new
component, no new edge kind (`request-flow` from 1.2), one idea-cluster: the
metadata/bytes split.

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Blobs don't belong in databases: metadata in the DB, bytes in object storage, served via CDN; presigned uploads at concept level. Per §14's row. |
| Type | Building Block |
| Difficulty | intermediate (`manifest.ts`) |
| Estimated time | 25 minutes (§14, `manifest.ts`) |
| Prerequisites | Checkpoint R1 (`prerequisiteSlugs: ["checkpoint-r1-a-site-that-stays-up"]`) |
| Unlocks | 3.21; RWE Instagram, YouTube, Google Drive, Strava (§15.2 Reinforces lists) |
| Building blocks introduced | `object-storage`. Agrees with §16. |
| Stages trained | 2 (component fluency), 5 (design judgment), 6 (operational reasoning) |
| Interview relevance | **High** for any media system (§14). Loop steps 3 (the estimate decides it) and 4 (where do the photos live). |
| Production relevance | Separate buckets by audience, default private, and treat signed-URL expiry as the access control. |

## 2. Learning objectives (§5.2)

| # | Category | Objective |
|---|---|---|
| 1 | Knowledge | Explain which database capabilities a stored file pays for without using, and why that makes blobs a placement problem. |
| 2 | Engineering | Split a record into metadata + bytes joined by a key; choose the write order that leaves an orphan rather than a dangling row. |
| 3 | Knowledge | Describe how a presigned URL authorizes a transfer without the app tier carrying it. |
| 4 | Practical | Add object storage from the tier that handles uploads without disturbing the request path; pass Submit. |
| 5 | Interview | Answer "where do the photos live?" with split, upload path, read path and an estimate. |
| 6 | Communication | Justify keeping small blobs in the database, naming the threshold. |

Exercised by: 1 -> cold open table + Think-first payoff + Q1; 2 -> "What you
give up" + Q3; 3 -> presigned section + sequence diagram + Q2, Q5; 4 -> the
build; 5 -> Interview lens; 6 -> the "boring alternative" paragraph + blueprint
commentary.

## 3. Per-beat outline (§5.3)

| Beat | Lesson section | Notes |
|---|---|---|
| 1-2 | Untitled opener | Résumé PDFs in a bytes column, logos inline in listing documents. 2.2 of 2.4 TB, 11-hour backup, 40 s replica lag. Thesis: not a capacity problem. |
| 3 | `> [!NOTE]` Think first | Bigger instance, faster disks: which symptom does it fix? Paid off right after the table in the next section. |
| 4 | "The database stores facts about a file, not the file" | Anchor as heading; table of what a DB does vs what a PDF gets from it. |
| 5 | `<Walkthrough>` "One logo, two stores" | Primary diagram, see §5. |
| 6-7 | Mental model section + "Getting the bytes off your servers entirely" | Object semantics; presigned upload with a Mermaid sequence; reads split by audience (public via CDN, private via signed GET). |
| 8 | "What you give up" | No cross-store transaction (write order), immutability (versioned keys), first-byte latency; then §9 lens 3 - when the bytes column wins. |
| 9 | "What breaks" | Public bucket, long-lived signed URL, unbounded upload, orphans/dangling rows. |
| 10 | "What changes at scale" | 10x storage classes; 100x multipart + egress; 1000x build vs buy (back-reference 1.3's Dropbox). |
| 11 | "In production" | Pinterest (images out of MySQL), Discord (expiring signed attachment URLs), lens 9 two-person team. |
| 12 | "Common mistakes" | Four, all engineer decisions. |
| 13 | "In an interview" | High; steps 3/4; RWE projects named (§19); senior answer. |
| 14 | "Connections" | 3.15, 3.12, 3.14. |
| 15 | "Recap" | Five anchors. |
| 16 | "Your turn" | Symptoms + goal, never the component; says Validate is silent and why; discloses the compute-only canvas constraint. |
| Next | "Next" | 3.21 File Storage, which is the next manifest row; also the single marked forward tease. |

## 4. Declared omissions and justifications

1. **§12 nugget boxes absent** - standing open decision 5, ninth instance;
   content is inline.
2. **No §19 tease separate from Next.** Next and the tease coincide (3.21),
   as 3.17/3.18 did; a draft had a "Coming in 3.21" paragraph in Connections
   duplicating Next and it was cut in the density pass.
3. **The presigned-upload and CDN-origin shapes are taught but not
   buildable.** `object-storage.relations.inputs` allows `compute` only, so
   browser -> bucket and cdn -> bucket both fail `component-relations`. Not
   hacked around: the walkthrough draws only legal edges and its step 5
   caption says the board's origin path runs through the App Server; the
   upload shape is a Mermaid sequence; the lesson's presigned section, Your
   turn and hint 3 all disclose it (decision 10). Raised as **open decision
   20**.
4. **`storageClass` taught, not gated** - decision 11's config-predicate drift
   shape again; no single correct class for a mixed-age bucket.

## 5. Diagrams (§7)

- **Beat 5 - `<Walkthrough>`, six steps** (Browser, CDN, App Server, SQL
  Database, Object Storage; four `request-flow` edges, all registry-legal).
  The subject is a sequence (upload, then read, then the 40,000th read), so a
  walkthrough rather than a static picture. Auto-layout, no positions, no
  algorithms. Validated by `walkthrough-invariants.test.ts` (green).
- **Beat 6-7 - Mermaid sequence**, presigned upload. Non-topology ordering,
  and the one place the illegal-on-canvas browser -> bucket hop can be drawn
  honestly.
- **Storage layout (§7.1)** is covered by the beat-4 table rather than a
  picture of rows; 3.21 draws the block/file/object layout.

Each diagram has a `Note:` caption.

## 6. Component budget and cross-reference checks

- New: `object-storage` only. Palette = R1's palette + `object-storage`.
  **Group E components deliberately absent** - not in this chapter's
  prerequisite chain. `distributed-cache` available, not required (R1's
  reason).
- Edge legality checked against `config/data.ts`: `app-server -> object-storage`
  (`compute` + `request-flow`) validates. `cdn`/`browser` -> `object-storage`
  do not (decision 20).
- **2.3's Group F row (open decision 15) - first of three checked.** Row:
  "blobs outgrowing rows | 3.20-3.22". This chapter is that sentence
  literally.
- **3.19's Next paid off without depending on it.** 3.19 ended on logos
  inside listing documents; the cold open includes that (logos inline in
  listing documents) while standing on its own for an R1-path learner, whose
  R1 brief already mentioned logos every visitor downloads.

## 7. Validation rules

No new rules; R1's set: `no-direct-client-database`, `component-relations`
(rejects the two illegal shapes, with an explanation), `orphan-component`
(a dropped, unwired bucket), `missing-input-connection`, `orphan-read-replica`.

## 8. Blueprint and starter graph

- **One blueprint.** One right shape on this canvas; the production
  refinements are not drawable, so they cannot be alternative answers.
- **Clean starter, and its own argument** (3.16's standing request): the fault
  is in what rows and documents *contain* - a bytes column, an inline image -
  and the canvas draws stores, not their contents. 3.19's argument was what a
  process contains; this one is what a row contains. On the R1 path this is
  the second clean starter after 3.16 (R1 is blank-canvas). The brief and
  hint 1 both say Validate will be silent and why.
- Purely additive (one node, one edge), so `forbid`-blind drift (decision
  11(a)) is not in play, and an incomplete build reports an accurate
  "Missing: Object Storage".
- **Layout.** 3.16's tier columns; search moves to its own "Derived data"
  column at x=1100 aligned with the app server (§11.5's one-node-tier rule),
  and the one-slot gap sits directly above it. Four rows, widest column four.
- **Decorators.** Client, Edge, Application, Data, Cache tier, Build here,
  Derived data; one comment with the cold open's numbers, naming no component.

## 9. Hints

1. Orienting: Validate is right to be silent; ask whether each store's data
   uses what that store is good at.
2. Directional: keep describing each file, stop holding it - names the
   property (bytes under a name, no queries) not the component.
3. Directional + near-miss: start from the tier that handles uploads; the
   browser and edge cannot reach the new store on this canvas.

## 10. Quiz

Five, ramp 1/1/2/2/3, all `single`. Bank §13 Q1 -> Q1 and Q2 -> Q2 (joke
distractors "Images are not data", "Uploads can be free", "Users can be
tracked" replaced). Q3 (write order), Q4 (stale logo behind a CDN) and Q5
(private résumés, unguessable keys) are original. Correct letters c, a, d, b, a
- opens on c against 3.19's d and 3.16's a. Scope: nothing beyond R1 + this
chapter.

## 11. Playtest pass (§18.2)

| Move | Taught in |
|---|---|
| Read a 13-node architecture and find the tier that handles uploads | 2.1, rebuilt from blank in R1 |
| Add a component and wire a `request-flow` edge from the app tier to a store | 1.2 onward |
| Trust Submit's drift when Validate is silent | 3.15, 3.16 (both clean starters, said so) |
| Leave the request path, replica and cache untouched | R1 built them; brief says so |
| Recognize that bytes need a store of their own | **This chapter** (load-bearing: no existing store on the canvas fixes it) |

No move unaccounted for.

## 12. Flagged for a second pass

- **Open decision 20 (new).** The chapter's two signature production shapes
  are not drawable. One-line engine fix: add `networking` to
  `object-storage.relations.inputs.allowedCategories`. Until then the lesson
  discloses the gap in three places.
- **`object-storage.md` (component docs) has generation artifacts** - split
  words ("da\ndatasets", "mu\nmulti-region") and an em dash. Not edited here
  (global component docs, outside a chapter pass); flagged.
- **Discord's signed-URL change** is stated at the level of its public
  announcement (expiring attachment links against malware hosting). Worth a
  reviewer's source check.
- **Word count** ~1,890 prose words (excluding the walkthrough, Mermaid and table rows) against 25 minutes - same shape as 3.19's
  flag; the mandatory sections are most of it. A density pass cut the
  duplicate Connections tease and tightened the presigned and trade-off
  sections.
