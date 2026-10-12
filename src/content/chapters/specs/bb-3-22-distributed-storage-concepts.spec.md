# Chapter spec - 3.22 Distributed Storage Concepts

Authored under CURRICULUM.md §5, §6, §20. Deliverable 1 of 6.

- Chapter definition: `src/content/chapters/index.ts`
  (`bb-3-22-distributed-storage-concepts`)
- Lesson body: `public/content/chapters/bb-3-22-distributed-storage-concepts.mdx`
- Manifest row: slug `3-22-distributed-storage-concepts` (`chapterDefinitionId`
  flipped from `null`)

**Wave.** Third and final Group F chapter. **Completes Group F**, closing open
decision 15's Group F row.

## 0. Type classification

**Concept with a small build** (§14), introducing `coordinator` (§16). Failure
modes and Scaling are **o** for Concept and both are included - this is the
curriculum's consistency home and both carry real content. Practical is
present because there is a build.

Budget: one component, no new edge kind (`control` is 3.4's), one idea-cluster
the row bundles deliberately - data spanning machines raises "who places it"
and "what does written mean", and the cold open is both failing at once.

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | How storage behaves once it spans machines: consistency spectrum, quorums, CAP honestly, PACELC, the coordinator role. (§14) |
| Type | Concept with a small build |
| Difficulty | intermediate |
| Estimated time | 30 minutes |
| Prerequisites | 3.21 |
| Unlocks | 3.23 (with 3.19); RWE Payment System, Online Auction, Uber, Robinhood, Google Docs, WhatsApp, Online Chess (§15.2) |
| Building blocks introduced | `coordinator`. Agrees with §16. |
| Stages trained | 2, 5, 6 |
| Interview relevance | **High** (§14) - senior follow-ups, loop steps 6-8. |
| Production relevance | Pick the consistency posture per data class; keep the coordinator off the data path so its outage stops placement changes, not traffic. |

## 2. Learning objectives

| # | Category | Objective |
|---|---|---|
| 1 | Knowledge | Coordinator's three jobs; control path, not data path. |
| 2 | Knowledge | Place strong / read-your-writes / eventual on one spectrum with 3.12/3.14/3.15's trade-offs on it. |
| 3 | Engineering | Predict what a quorum setting guarantees (W + R > N) and costs. |
| 4 | Practical | Add a coordinator with a control edge and bring an idle node into service; pass Submit. |
| 5 | Interview | Partition answer per data class, plus PACELC. |
| 6 | Communication | Justify a per-data-class choice, wrong answer vs slow/refused answer. |

Exercised by: 1 -> map section + sequence + Q1; 2 -> spectrum + Q2/Q3
background; 3 -> quorum table + sequence + Q4; 4 -> build; 5 -> CAP/PACELC +
Interview lens + Q3, Q6; 6 -> per-data-class table + Q5.

## 3. Per-beat outline

| Beat | Section | Notes |
|---|---|---|
| 1-2 | Opener | Fourth node added, map compiled into the app, 40-minute rollout, a seeker's application vanishes and returns. Thesis: two unanswered questions failing at once. |
| 3 | Think first | Rollout bug or a decision every multi-machine system makes? Paid off at the end of "What 'written' means" - it was two owners (a placement bug), and fixing that turns the spectrum into a choice. |
| 4-5 | "Somebody has to hold the map" | Three-jobs table, placement/reassignment Mermaid sequence (primary diagram), consensus at concept level. |
| 6-7 | "What 'written' means once there are copies", "Quorums" | Spectrum Mermaid; quorum table and quorum sequence. |
| 7-8 | "CAP, stated honestly", "The posture belongs to the data" | CAP without "pick two"; PACELC; per-data-class table; LWW vs merge. |
| 9 | "What breaks" | Five. |
| 10 | "What changes at scale" | Routine reassignment; cross-region latency forces per-class postures; the map as its own design problem. |
| 11 | "In production" | Dynamo (cart, AP, merge-on-read), Spanner (strong, commit wait); lens 9 single Postgres primary. |
| 12-13 | Mistakes, Interview lens | Senior answer with quorum numbers; RWE projects named. |
| 14-15 | Connections, Recap | 3.12, 3.13, 3.14/3.15, 3.20. |
| 16 | "Your turn" | Symptom (idle node) named as symptom, not fix; nudges toward edge kind without naming it. |
| Next | "Next" | 3.23 Reliability Patterns (next manifest row; also needs 3.19) - the third outcome of a remote call. |

## 4. Declared omissions and justifications

1. Nugget boxes - decision 5.
2. **§14's "trade-off scenarios ×4 (ledger, feed, cart, presence)" ships as
   quiz Q5 (matching), not presented graphs** - §11.1's affordance is
   missing; same degradation path as 3.18/3.19/3.21. The lesson's own
   per-data-class table deliberately uses **different** four examples
   (booking, view counter, username, search index) so Q5 tests transfer, not
   recall of the table.
3. **§14's row cites "3.17 eventual processing" as a consistency encounter,
   but 3.17 is not in this chapter's prerequisite chain** (§17: E and F are
   parallel after R1). The lesson uses 3.12, 3.14 and 3.15 only. Doc drift,
   recorded under open decision 21; CURRICULUM edit belongs in its own commit.
4. **Storage-node heartbeats are not buildable** - `nosql-database` has no
   control output and `coordinator.relations.outputs` reaches only
   `distributed-systems`. Drawn in the Mermaid sequence, stated in the
   blueprint commentary and in `simplifications`. Fourth instance under open
   decision 8.
5. **No `<Walkthrough>`.** The placement story needs coordinator <-> storage
   edges the registry disallows (item 4), and the walkthrough skill forbids
   illegal edges. Sequence diagrams carry it; the canvas itself is the
   topology diagram (§8.3).

## 5. Diagrams

Three Mermaid diagrams, each captioned: placement/reassignment sequence
(primary), consistency spectrum (§7.1's home for it is 3.22), quorum read/write
sequence. Plus the quorum table.

## 6. Component budget and cross-reference checks

- New: `coordinator`. Palette = 3.21's + `coordinator`.
- Edge legality: `app-server.relations.outputs` allows `distributed-systems` +
  `control`; `coordinator.relations.inputs` allows `compute` + `control`. So
  app -> coordinator validates **only as `control`** - a default `request-flow`
  draw fails `component-relations` with an explanation, which is the chapter's
  control-plane point enforced by the engine. **First chapter where a learner
  builds a `control` edge that validates** - a positive data point for
  decision 8.
- **2.3's Group F row (decision 15) - third of three; Group F closes.** 3.20
  stated the row, 3.21 ruled out the shared disk, and 3.22 is what happens to
  storage once it has outgrown one machine of any kind.
- **3.21's Next paid off** ("every store since 3.12 kept copies" is the
  spectrum section's opening line).
- **3.13's open thread paid off**: 3.13 split data by key without saying who
  holds the map.

## 7. Validation rules

No new rules. `component-relations` (the control-kind gate),
`orphan-component` (the idle node, the starter's visible symptom),
`missing-input-connection`, `no-direct-client-database`. `split-brain-risk`
not curated - no `leader` in palette.

## 8. Blueprint and starter graph

- **One blueprint**: app -> four NoSQL nodes (`request-flow`) + app ->
  coordinator (`control`).
- **The starter is not clean**, ending the 3.19/3.20 run: one
  `orphan-component` warning on node 4. It is the symptom, explicitly not the
  fix - the brief, Your turn and hint 1 all say wiring it by hand is what the
  redeploy did. A learner who only wires node 4 clears Validate and fails
  Submit with an accurate "Missing: Coordinator".
- **Four NoSQL aliases** inherit decision 11's duplicate-alias drift note
  (a missing s4 edge reports as a mismatched connection rather than by name).
- **Layout.** Client (x=60), Application (x=320: LB, app, then the gap slot),
  Shards (x=580, four rows). The coordinator's gap sits under the app server
  because the app tier consults it, not stacked with the data.
- **Decorators.** Client, Application, Build here, Shards; one comment with the
  rollout timeline, naming no component.

## 9. Hints

1. Orienting: the warning is a symptom; where does the placement answer live
   and how many copies of it exist?
2. Directional: one place that owns the answer and never holds data.
3. Near-miss catcher: if the connection is rejected, read the explanation and
   look at the edge's kind.

## 10. Quiz

Six, ramp 1/1/2/2/3/3 (33/33/33 against §3's 30/45/25; the two level-3
questions are the bank's own judgment items). **All six bank §13 questions
tagged 3.22 spent** (Q8, Q10, Q5, Q7, Q6, Q9), so §13 is fully consumed across
3.20-3.22. Joke distractors replaced ("Encrypting replicas", "Consistency is
always best", "Partitions between regions cannot happen" reworked as a real
"dedicated link" position, "Neither without the cloud"). Matching Q5 is a full
derangement (0 -> [2], 1 -> [3], 2 -> [0], 3 -> [1]). Single-choice letters
d, b, a, c, b - opens on d against 3.21's b.

## 11. Playtest pass (§18.2)

| Move | Taught in |
|---|---|
| Read a sharded store as several database nodes behind one app tier | 3.13 |
| Wire `request-flow` from the app tier to a database | 1.2 |
| Change an edge's kind in the Edge Inspector | 3.12 (replication), the first chapter whose build needed a non-default kind |
| Know `control` means a signal about the system, not data | 3.4 (introduced), 3.9 (load-bearing) - illustrative until now |
| Recognize an orphan warning as a symptom | 3.7 (orphan-component as namesake fault) |
| Add one owner of placement on the control path | **This chapter** |

No move unaccounted for. Note: 3.12 sits on the prerequisite chain (R1 needs
Groups A-D), so the edge-kind move is taught.

## 12. Flagged

- **Open decision 21 (new)**: §14's 3.22 row cites 3.17, which is outside the
  prerequisite chain.
- **`coordinator.md` component docs describe a saga/workflow orchestrator**,
  contradicting the registry's own `docs` string (consensus) and this chapter
  (placement). A learner opening the component's docs reads a different
  component. Raised as **open decision 22**; not edited here (global component
  docs).
- **Spanner's commit-wait and Dynamo's resurrected deletes** are stated at the
  level of the published papers.
- ~1,910 prose words (excluding Mermaid and table rows) against 30 minutes - the heaviest Group F chapter, by
  design (§14: "the curriculum's consistency home").
