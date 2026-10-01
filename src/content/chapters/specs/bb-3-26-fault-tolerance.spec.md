# Chapter spec - 3.26 Fault Tolerance

Authored under CURRICULUM.md §5, §6, §20. Deliverable 1 of 6.

- Chapter definition: `src/content/chapters/index.ts` (`bb-3-26-fault-tolerance`)
- Lesson body: `public/content/chapters/bb-3-26-fault-tolerance.mdx`
- Manifest row: slug `3-26-fault-tolerance` (`chapterDefinitionId` flipped from
  `null`)

**Wave.** Fourth and final Group G chapter (Wave 7). **Completes Group G and
Part 3's chapters**; R2 is next.

## 0. Type classification

**Building Block** (§14), introducing `leader` and `follower` (§16), with the
`split-brain-risk` rule as the teaching instrument. Every §6 Building Block
section is present.

Budget: two components, no new edge kind (`replication` is 3.12's, `control`
3.4's). One idea-cluster: "the write role moves without a person, without loss,
and never to two machines" - leases, majority and terms are its three mechanisms,
all reused from 3.22/3.23.

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Surviving failure by design: redundancy, failover, leader/follower roles formalized, split brain, why an odd number; graceful degradation. (§14) |
| Type | Building Block |
| Difficulty | advanced |
| Estimated time | 35 minutes |
| Prerequisites | 3.25 |
| Unlocks | Checkpoint R2 |
| Building blocks introduced | `leader`, `follower`. Agrees with §16. |
| Stages trained | 4, 5, 6, 8 |
| Interview relevance | **High** - steps 6 and 8 (§14). |
| Production relevance | The difference between a 3-second failover and Tuesday's 40 minutes plus 31 lost applications. |

## 2. Learning objectives

| # | Category | Objective |
|---|---|---|
| 1 | Knowledge | Explain leader and follower as roles held on a lease, and what a term number fences. |
| 2 | Engineering | Size a consensus group by majority arithmetic and place it across failure domains. |
| 3 | Engineering | Predict what a failover loses under asynchronous vs majority-acknowledged replication. |
| 4 | Practical | Build a leader with two followers under a coordinator, with the app tier learning the leader from it, and pass Submit. |
| 5 | Interview | Answer "kill the leader - what happens?" step by step: detection, election, fencing, client redirect. |
| 6 | Communication | Justify graceful degradation aloud: which flows keep working during a failover and why. |

Exercised by: 1 -> "A role, not a machine" + walkthrough + Q5; 2 -> odd-number
table + partition diagram + Q1; 3 -> "The writes a failover can lose" + Q3; 4 ->
build; 5 -> walkthrough + Interview lens + Q6; 6 -> graceful degradation + Q6.
Q2 (diagram) and Q4 (timeout trade-off) cover split brain and detection.

## 3. Per-beat outline

| Beat | Section | Notes |
|---|---|---|
| 1-2 | Opener | 3.25's Tuesday: 40-minute manual promotion, old primary returns, 31 applications on the wrong machine. |
| 3 | Think first | An automatic promotion script on a network blip. Paid off at the end of "A role, not a machine" (split brain by automation). |
| 4 | "A role, not a machine" | Mental model; split brain defined from the Think-first. |
| 5-6 | "Failover, step by step" | `<Walkthrough>` (primary diagram, six steps) then the three mechanisms, each mapped to its source chapter. |
| 7 | "Why an odd number" | Majority table; partition Mermaid; failure domains. |
| 7-8 | "The writes a failover can lose", "Graceful degradation" | 3.12's sync/async at its consequence; degradation by priority (3.22, 3.23, 3.24 reused). |
| 8 | Trade-offs | Five rows. |
| 9 | What breaks | Six. |
| 10 | What changes at scale | Every stateful tier as a group; one leader per shard; region failover as a separate decision, GitHub 2018 back-referenced. |
| 11 | In production | Amazon Aurora (4-of-6 across 3 zones), Kubernetes/etcd (odd members). Lens 9: managed failover. |
| 12-13 | Mistakes, Interview lens | Senior answer from chapter vocabulary. |
| 14-15 | Connections, Recap | 3.12, 3.22, 3.23, 3.25. |
| 16 | Your turn | Outcomes only; predict-then-check on the learner's own board. |
| Next | Next | Checkpoint R2. |

## 4. Declared omissions and justifications

1. **§14's "predict-then-check (kill the leader)" has no simulator.** Delivered as
   the walkthrough (the check), the Your turn prediction prompt, and quiz Q6
   (pending-content.md's named degradation).
2. **The walkthrough uses custom nodes for the three database machines.** After
   failover Node B replicates to Node C, which `follower.relations.outputs`
   forbids, and a card cannot change role mid-walkthrough. Custom "Node A/B/C"
   cards with the role in the captions are honest (no registry edge is claimed)
   and carry the chapter's own thesis: the cards are machines, the role is a
   fact. Recorded under decision 8's family as a representability note, not a
   new decision.
3. Nugget boxes - decision 5.

## 5. Diagrams

- **Primary: `<Walkthrough>`** - App Server, Coordinator group, Nodes A/B/C; six
  steps from steady state through lease loss, election, redirect and fencing.
  Lit-path convention for the failure (decision 14).
- Mermaid flowchart: a 1-vs-2 partition across zones and which side can write.
- Tables: majority arithmetic, replication mode vs loss, trade-offs.

## 6. Component budget and cross-reference checks

- New: `leader`, `follower`. Palette = 3.25's + both = 26 (all but `client`).
- **Edge legality checked**: app -> leader `request-flow` (leader inputs compute
  request-flow); leader -> follower `replication`; coordinator -> leader /
  follower `control`; app -> coordinator `control` (3.22). Follower -> app reads
  are legal and not required.
- **2.3's Group G row (decision 15) - fourth of four; Group G closes, and with it
  all seven rows.** 3.26 is the row's literal case: enough boxes that one is
  always broken, so the design has to expect it.
- **§18.2 rule 3 ("leaders from replica ambiguity")** is the cold open exactly.
- **3.25's Next paid off** (the 02:14 alert and the forty minutes).
- **2.2's GitHub 2018 case** is back-referenced, not retold.
- **§14's note** ("3.12 taught replication as mechanism; this chapter teaches it
  as coordination") is the first sentence of Connections.

## 7. Validation rules

No new rules. `split-brain-risk` (warning) is curated for the first time: a
learner who adds two leaders and no coordinator sees its explanation. Also
`component-relations` (refuses e.g. leader -> app, follower -> leader),
`orphan-component`, `missing-input-connection`, `no-direct-client-database`.

Known gap: two leaders **with** a coordinator clear the rule, and the blueprint
(containment) still matches if one leader has two followers. Grading "exactly one
leader" would need `absent`, which drift cannot report (decision 11). The lesson
teaches one leader per group; the debrief commentary says so.

## 8. Blueprint and starter graph

- **One blueprint**: browser -> LB -> app; app -> leader (`request-flow`); leader
  -> two followers (`replication`); coordinator -> leader and both followers
  (`control`); app -> coordinator (`control`). Two follower aliases bind
  injectively.
- **Build-first starter** (§18.1: Groups E-G default to blank-canvas builds):
  browser, LB, app (3 instances), and an empty data tier with a 2x2 "Build here"
  zone. Validates clean; the missing tier is visible, not hidden.
- `electionTimeoutMs` and `readOnly` taught, not gated (decision 11).
- **Decorators.** Client, Application, Build here; one comment with Tuesday's
  timeline naming no component to add.

## 9. Hints

1. Orienting: three requirements in the goal, three questions - who may write,
   who decides, how the app finds out.
2. Directional: the role of accepting writes has to be able to move, and the
   decision about where it moves cannot be made by any of the machines involved.
3. Near-miss catcher: if Validate warns about split brain, count who can accept
   writes and ask what stops both.

## 10. Quiz

Six, ramp 1/2/2/2/3/3. Bank §14 Q9 (odd number) -> Q1, Q8 (split-brain diagram)
-> Q2 as a `diagram` question with the bank's graph re-laid at the 260 pitch,
Q10 (loss window) -> Q3, Q11 (graceful degradation) folded into Q6. Joke
distractors replaced ("odd numbers are lucky", "hardware ships in odd packs").
Q4 (election timeout) and Q5 (term fencing) original. Single-choice letters d, a,
c, b, a, c - opens on d against 3.25's b.

## 11. Playtest pass (§18.2)

| Move | Taught in |
|---|---|
| Wire app -> data store (`request-flow`) | 1.2 |
| Draw a `replication` edge from the write node to copies | 3.12 |
| Draw a `control` edge from the app tier to a coordinator | 3.22 |
| Draw coordinator -> member `control` edges | **This chapter** (walkthrough shows the lease edges) |
| Place leader and followers by role | **This chapter** |
| Read split-brain-risk's warning | **This chapter** |

No move unaccounted for.

## 12. Flagged

- Exactly-one-leader not gradable (above, decision 11 family).
- `leader.md` describes election as a mechanism rather than the role card -
  added to decision 22.
- Aurora's 4-of-6 quorum and etcd's member guidance are stated at the level of
  their published documentation.
- ~2,100 prose words against 35 minutes.
