# Chapter spec - 3.18 Event-Driven Architecture

Authored under CURRICULUM.md §5 (chapter blueprint), §6 (mandatory sections),
§20 (author instructions). Deliverable 1 of the 6 in pending-content.md's
"Per-chapter deliverables". Lives beside the lesson so a reviewer can check the
prose against the intent that produced it.

- Chapter definition: `src/content/chapters/index.ts`
  (`bb-3-18-event-driven-architecture`)
- Lesson body: `public/content/chapters/bb-3-18-event-driven-architecture.mdx`
- Manifest row: `src/curriculum/manifest.ts`, slug
  `3-18-event-driven-architecture` (`chapterDefinitionId` flipped from `null`
  to the id above)

**Wave.** Second Group E chapter, authored immediately after 3.17 in this same
working tree. `pending-content.md` puts Group E in Wave 6; the real prerequisite
(3.17) is authored and sits directly before it, so only the wave grouping is out
of order - the same note every Wave 3/4/5 chapter has carried.

## 0. Type classification

Building Block, per §4/§16 - CURRICULUM §14's own row states "**New:
`event-bus`, `kafka`**" and §16's audit table lists the same two. Consequence,
same as 3.11-3.17: Failure modes and Scaling considerations are **M**
(mandatory), not **o**, and both appear as full sections.

Checked against §20.4's budget: two new components (inside §18.1's "≤2/chapter"
for Groups E-G, which sanctions three for 3.17 only), **no** new edge kind
(`async`, introduced in 3.17, carries every new edge here), and one
idea-cluster - a message addressed to one owner versus a message announced to an
audience, and what a durable audience costs.

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Queue semantics cover a task and not a fact: pub/sub, event buses and the log, with consumer groups, retention and partition ordering. Per CURRICULUM §14's own row. |
| Type | Building Block (see §0). |
| Difficulty | intermediate - matches `manifest.ts`'s existing `difficulty: "intermediate"` and §14's Group E heading. |
| Estimated time | 35 minutes (Reader + Editor combined), per §14's own row and `manifest.ts`'s existing `estimatedMinutes: 35`. |
| Prerequisites | 3.17 (`manifest.ts`'s `prerequisiteSlugs: ["3-17-message-queues"]`). |
| Unlocks | 3.19 (the rest of the compute taxonomy), 3.22 (where "three subscribers at three positions in one stream" gets its formal vocabulary), 3.23 (idempotency and retries as named patterns), and every RWE project with more than one consumer of the same write. |
| Building blocks introduced | `event-bus`, `kafka`. No new edge kind. Agrees with §16. |
| Stages trained | 2 (component fluency), 3 (request-path reasoning), 5 (design judgment under multiple defensible answers). |
| Interview relevance | **High** - §14's own row calls it a senior differentiator; loop steps 4 (high-level design) and 5 (deep dive). |
| Production relevance | Consumer lag per group is the number an on-call engineer watches for anything event-driven, and an event schema is a contract with teams whose names the publisher may not know. |

## 2. Learning objectives (§5.2)

Six objectives, all five categories present (Practical is mandatory here - this
is not a no-build Concept chapter).

| # | Category | Objective |
|---|---|---|
| 1 | Knowledge | Explain why a queue and a bus behave differently for the same message, in terms of who the message is addressed to. |
| 2 | Engineering | Decide whether a given message is a task or a fact, and route it to the shape whose delivery semantics match. |
| 3 | Knowledge | Describe what a log keeps that a bus does not, and what offsets and consumer groups let a consumer do as a result. |
| 4 | Practical | Build a fan-out path that delivers every published event to three independent services without the producer naming any of them, and pass Submit. |
| 5 | Interview | Answer "how do you guarantee ordering?" by naming the partition key and stating what ordering you are not getting. |
| 6 | Communication | Justify choosing one announcement over three addressed hand-offs aloud, naming whose code stops changing and what visibility is given up in exchange. |

Where each is exercised (§5.2's "untested objectives get cut"): 1 -> the cold
open and the mental-model section + quiz Q1; 2 -> the mental-model section and
the three-shapes table + quiz Q2; 3 -> the log section and its Mermaid diagram +
quiz Q3/Q5; 4 -> the build; 5 -> the partition-key paragraph and the senior
answer + quiz Q4; 6 -> the Think-first payoff, the trade-offs section and the
blueprint commentary.

## 3. Per-beat outline (§5.3, Building Block type per §6)

| Beat | Section in the lesson | Notes |
|---|---|---|
| 1-2 Cold open / why this exists | Untitled opener + first Mermaid | Three weeks of fraud screening that looked at 31% of publishes, syndication 34%, notifications the rest, and one listing that went live unheld. No errors anywhere - the failure is arithmetic, not reliability. The diagram is the wrong shape, captioned as legal-but-wrong. |
| 3 Think first | `> [!NOTE]` callout | The obvious repair (one queue per service) stated as the prompt, with the follow-up that makes it fail: who changes when a fourth service arrives. Paid off in the second half of the mental-model section. |
| 4 Mental model | "A task is addressed; a fact is announced" | One anchor sentence, and the analogy is carried by the two words themselves rather than a separate metaphor - a task has an owner, a fact has an audience. |
| 5 Visual explanation | `<Walkthrough>` + caption | Primary diagram, before its explanation (§8.1). See §5 below. |
| 6-7 Core + internal mechanics | "The bus has no memory" + the log Mermaid | The bus's real limitation stated first (routes and forgets), then the log as the thing that removes it: retention, offsets, consumer groups, partition ordering, and the partition key as 3.13's shard key again. |
| 8 Trade-offs | "Three shapes, three jobs" | The queue/bus/log table (§14's "trade-off (queue vs. bus vs. log)"), then the cost ladder and the one question that decides whether to climb it. |
| 9 Failure modes | "What breaks" | Five: the event nobody received, the schema change that breaks three consumers at once, fan-out amplification, the distributed monolith, ordering assumed rather than arranged. |
| 10 Scaling behavior | "What changes at scale" | 10x partitions bound consumers; 100x contracts rather than throughput; 1000x the log as the system of record, with retention as a storage and compliance bill. |
| 11 Production examples | "In production" | LinkedIn (Kafka's origin; an organizational bottleneck, not a technical one) and Uber (live and replayed consumers of one trip stream), then §9 lens 9 - three function calls in one transaction, and the org-chart threshold where that stops being right. |
| 12 Common mistakes | "Common mistakes" | Four, each an engineer's decision rather than a system behaviour, so as not to restate beat 9. |
| 13 Interview lens | "In an interview" | Steps 4 and 5 named; the three standard probes named; ends with the §10.3 "what a senior answer sounds like" paragraph. |
| 14 Connections | "Connections" | Three back-references (3.17, 3.16, 3.13) and the single §19 forward tease to 3.19. |
| 15 Recap + knowledge check | "Recap" | Five retrieval anchors. The knowledge-check pointer is appended by `appendKnowledgeCheckHeading`, not authored. |
| 16 Transition brief | "Your turn" | States the symptom and the goal, never the fix; says outright what Validate will report and why that is not the interesting part. |
| Preview of next | "Next" | 3.19, which `manifest.ts` confirms is the next row (`prerequisiteSlugs: ["3-18-event-driven-architecture"]`). Engineered cliffhanger per §6: everything in Group E so far starts with a person pressing a button, and there is nothing on the canvas a clock can talk to. |

Section order follows §5.3 with no reordering. Beats 1-2, 6-7 and 9-10 are each
merged into one heading, which §6's "Rules of use" allows for adjacent sections.

## 4. Declared omissions and justifications (§6's written-justification rule)

1. **§12's nugget devices (Interview / Production / Engineering boxed
   one-liners) are absent.** Standing open decision 5 in `pending-chapters.md`,
   now at its seventh instance. That decision's own note asks individual
   chapters to stop re-arguing this one, so this is a pointer rather than a new
   argument: the equivalent content is inline (the interview register in "In an
   interview", the operational register in "In production", §9 lenses 1/5/7
   throughout).
2. **No RWE cross-reference in the Interview lens.** §19 asks for one; no
   authored lesson has one yet. Same shape as omission 1 - it belongs in one
   retrofit pass across every chapter, not started here.
3. **`kafka` is introduced and taught but is not in the blueprint.** §16 homes
   it here and the lesson teaches it properly (retention, offsets, consumer
   groups, partition ordering, and a diagram of its own), but the exercise does
   not require it. Reasoning in §6 and §8 below; recorded in
   `curriculumContext.simplifications`. Precedent: 3.14 introduced
   `distributed-cache` on exactly these terms, and R1 kept `nosql-database`
   available-but-not-required for the same reason - requiring a component the
   brief gives no motivation for is the cargo-culting the curriculum warns
   against.
4. **The `partitions` and `retentionHours` config fields are taught and not
   gated.** Another instance under open decision 11, identical in shape to
   3.17's `maxRetries`/`deliveryGuarantee` and 3.14's `ttlSeconds`: a failed
   config predicate reports as `missingComponents`, and there is no
   defensible single correct partition count for a job board at this scale
   anyway.
5. **§14's "×3 scenarios" phrasing for the trade-off exercise is delivered as
   the lesson's three-shapes table plus quiz Q2, Q3 and Q5, not as three
   presented graphs in the Editor.** §11.1's Trade-off scenario type needs a
   "2+ presented graphs, pick per scenario" affordance the Design Editor does
   not have; the degradation path is `pending-content.md`'s own named one
   (simulator- and affordance-dependent beats become quiz questions). Q2 is the
   task-or-fact call, Q3 is the case for a log, Q5 is the case against reaching
   for one without a replay requirement.

## 5. Diagrams (§7)

Three, in a real progression - the wrong shape, the right shape, then the shape
that keeps history. §7.1's own table names "Queue / stream topology" for 3.18,
and the third diagram is a data-layout picture rather than a second topology.

**Beat 2 - Mermaid, the wrong shape.** One App Server, one Message Queue, three
consumers. Authored as Mermaid rather than ScaleCraft graph JSON under the
narrow, per-chapter exception open decision 3 has now been applied for by 1.6,
3.4 and others: the Reader still cannot render a graph-JSON block. Declared
here rather than assumed. The caption does the work the picture cannot: every
edge in it is legal and each service really is connected, so what is wrong is
the arithmetic, not the wiring. This is the only place in the chapter that
topology appears - it is deliberately absent from the starter graph (§8).

**Beat 5 - `<Walkthrough>`, six steps.** The primary diagram: App Server, Event
Bus, three subscribers (Fraud Screening, Partner Syndication, Analytics Rollup)
and the NoSQL Database the rollup writes into. Five edges, four `async` and one
`request-flow`. Chosen over a static diagram because the whole point is a
sequence - one publish becoming three deliveries that never compete - which a
snapshot of the same boxes cannot show. Step 5 is the failure step and hits open
decision 14 again (`<Walkthrough>` has no faulted state): handled with 2.2's
inversion convention, lighting only the paths that still run, with the caption
naming the convention rather than leaving it to be inferred. Step 6 is the
payoff and highlights the single edge leaving the App Server. No hand-placed
positions - auto-layout. No `algorithms`/`variants`: nothing here branches on a
selectable strategy. Validated green against
`walkthrough-invariants.test.ts`.

**Beat 7 - Mermaid, the log's layout.** One topic, three partitions, two
consumer groups reading the same partitions at different positions. Non-topology
(no components in it at all), so Mermaid per §7.2, and not a second drawing of
the walkthrough's topology. It carries four teaching points at once - partitions,
offsets, consumer groups and the independence of groups - which is why it earns
a third diagram in a chapter where two would be the norm.

All three carry a one-line `Note:` caption (§7.2, §20.3), using the prefix the
2026-08-24 cross-cutting pass normalized every chapter to.

## 6. Component budget (§16) and cross-reference checks

- **New this chapter:** `event-bus`, `kafka`. Exactly §16's row. No new edge
  kind - `async` came in at 3.17 and carries everything here.
- **`availableComponentIds`** is 3.17's palette plus those two.
  `distributed-cache` remains available-but-not-required for 3.14's own recorded
  reason; `kafka` joins it on the terms in §4's omission 3.
- **Every edge the chapter teaches is buildable**, checked directly against
  `src/content/components/config/`: `app-server.relations.outputs` allows
  category `messaging` + kind `async`; `event-bus.relations.inputs` allows
  `compute` + `async`; `event-bus.relations.outputs` allows `compute` + `async`;
  `worker.relations.inputs` allows `messaging` + `async`. The walkthrough's
  `worker -> nosql-database` write is `request-flow`, which both ends allow
  (`worker.outputs`: `data` + `request-flow`; `nosql-database.inputs`: `compute`
  + `request-flow`). Open decision 8 (`control` edges) is not in play.
- **`event-bus` cannot feed a data component directly.** `event-bus.outputs`
  allows category `compute` only, so a subscriber is always a compute node. That
  is correct semantics rather than a limitation - a database does not subscribe
  to anything - and it is why the walkthrough's rollup writes to the store
  rather than the bus writing to it.
- **`queue-without-dead-letter-queue` does not fire for `event-bus` or
  `kafka`**, checked directly against the rule: it keys on
  `componentId === "message-queue"`. So adding the bus raises no dead-letter
  obligation the chapter has not argued for, and the rule stays in the set
  purely to guard the 3.17 path the brief asks the learner to leave alone.
- **2.3's Group E row (open decision 15), second of three chapters checked.**
  2.3's table promises Group E as "work that does not belong on the request path
  | 3.17-3.19". 3.17 stated the row; this chapter does not restate it, it
  extends it one step - the work is already off the request path, and the new
  pressure is that more than one party wants it. That is the correct job for a
  second chapter under one motivating row (the same judgment 3.7 and 3.11 made
  under their own rows). 3.19 keeps Group E open.
- **3.17's forward promise, paid off.** 3.17's Connections ends "Coming in 3.18:
  a queue delivers each message to exactly one consumer, which is correct for
  work and wrong the moment three different services each need to know that the
  same thing happened", and its "Next" repeats it with the stealing metaphor.
  The cold open is that sentence turned into three percentages, and the
  mental-model section is its resolution.

## 7. Validation rules (deliverable 4)

**No new rules.** 3.17's curated set, carried forward unchanged:

| Rule | Why it is in this chapter's set |
|---|---|
| `orphan-component` | The one doing real work at the start. Three deployed-but-unwired services are three warnings on the starter graph, and the rule's own explanation ("no incoming or outgoing connections at all, so it plays no part in the architecture as drawn") is the learner's first confirmation the board is incomplete. |
| `component-relations` | The gate on the fan-out's shape. A learner who tries to subscribe the search engine or a database directly to the bus is stopped by `event-bus.outputs` allowing `compute` only. |
| `missing-input-connection` | Fires the moment a learner wires a subscriber's output before its input - the "looks wired, can never receive" shape. |
| `queue-without-dead-letter-queue` | Guards 3.17's path, which this chapter asks the learner to leave intact rather than rebuild. If they delete the dead letter queue while rearranging, it says so. |
| `no-direct-client-database`, `orphan-read-replica` | Carried forward; they guard the parts of the graph this exercise does not touch. |

## 8. Blueprint and starter graph (deliverable 3, part of it)

**One blueprint**, `bb-3-18-blueprint`. §11's rule is that multiple blueprints
are for chapters with genuinely multiple right answers. The honest reading here
is that there is one right *shape* - one hand-off leaving the application tier,
fanning out on the far side - even though two components in the palette
(`event-bus`, `kafka`) could carry it. The blueprint requires `event-bus`
specifically rather than either-of because the chapter's own trade-off section
argues that a log without a replay requirement is over-buying, and a blueprint
that accepted both would contradict the lesson it is grading. A learner who
adds Kafka as well still passes - matching is containment - and the drift
report's `extraComponentIds` is the only place it shows up.

**The starter graph does not validate clean**, which breaks the run at 3.15,
3.16 and 3.17. Three `worker` nodes - fraud screening, partner syndication and
the analytics rollup - sit on the canvas with no edges at all, so
`orphan-component` reports three warnings before the learner touches anything.
That is deliberate: 3.16's spec asked for a real justification for a third
clean starter and 3.17's supplied one, but a fourth would have taught that
Validate is decorative.

**The wrong shape is not on the canvas.** The three services' three weeks on the
shared queue is drawn in the lesson and described in the brief, but the starter
graph shows them disconnected instead. Two reasons, both recorded because the
opposite choice was seriously considered: (a) three consumers on one queue is a
completely legal topology that no rule can object to, so shipping it as the
starter would have taught that Validate catches semantic errors, which is the
opposite of this chapter's own point; and (b) fixing it would require the
learner to *delete* edges, and `blueprint-drift.ts` is `forbid`-blind (open
decision 11(a)), so a build that left them in place would pass with no way for
the engine to say otherwise. 3.15 declined a required deletion for exactly this
reason. Presenting them as unwired makes the exercise purely additive and makes
the engine's feedback honest.

**Four `worker` aliases.** The blueprint binds the queue's notification consumer
plus three bus subscribers, and `pattern.ts`'s backtracking search uses injective
bindings, so four distinct worker nodes are genuinely required. Flagged in §12:
`blueprint-drift.ts`'s best-effort report binds every alias to its *first*
structural candidate, so a learner who draws only two of the three subscriptions
gets "Event Bus -> Worker (async)" listed more than once rather than a count.
Another instance of open decision 11's drift-message problem, mitigated the way
R1 mitigated its own: the only way to reach that message is an incomplete build,
and hint 3 names the failure shape without naming the component.

**Layout (§11.5).** Six occupied columns at the 260x160 pitch: client, edge
(four rows), application (three), data (four), handed-off work (three), derived
data (one), then the gap column and the three waiting services. Four distinct
rows against a widest column of four, which is the gate's own ceiling. Every
`request-flow` edge advances left to right; the one exception is
`read-replica -> app-server`, which is `FEEDBACK_SOURCES`' declared exemption.

**Decorators (§11.6).** 3.17's zones carried forward, with its former magenta
gap column now holding the queue trio under a "Handed-off work" band, and a new
purple "Deployed, receiving nothing" band over the three waiting services. The
gap zone is deliberately **one slot**, not a column: exactly one component is
missing, and a four-slot box would have implied four. One slate comment carries
the already-public numbers from the cold open; it names no component the learner
has to add, per §11.2's calibration rule.

## 9. Hints (deliverable 3, part of it)

Three, ramping orienting -> directional, never the answer (§11.3):

1. Orienting: Validate is right that three services are connected to nothing;
   the question is what to connect them *to*. Asks what all three want out of a
   publish, and whether it is the same thing the notification consumer wants.
2. Directional: names why the team's own attempt failed (that hand-off gives
   each message to one consumer) and states the property needed instead - one
   write, read by everybody who asked, independently.
3. Directional, and the one that catches the near-miss: count the lines leaving
   the application tier afterwards. Three of them means the list of interested
   parties moved *into* the publish handler. This is the hint that separates a
   correct answer from three queues.

None names a component. Hint 2 describes the queue's semantics without calling
it a queue, so a learner who has not read the lesson carefully still gets the
property rather than the label.

## 10. Quiz (deliverable 5)

Six questions, ramp 1/1/2/2/3/3 (matching 3.10-3.17), five `single` and one
`diagram`. **All three of QUIZ_FRAMEWORK.md §12's bank questions tagged (3.18)
are spent**: bank Q7 -> Q1 (re-set at difficulty 1, as the chapter's own cold
open makes it comprehension rather than application), Q9 -> Q4, Q8 -> Q5. Bank
Q10-Q11 belong to 3.19 and are untouched. Three questions are original: Q2 (the
task-or-fact sort), Q3 (the diagram question, on the bus's lack of history), and
Q6 (the distributed monolith).

Every one of the bank's own distractors for Q7/Q8/Q9 was a joke option under §1
point 3 ("Queues are too slow", "It is the right shape", "Nothing different",
"Write events back in time", "Ordering is impossible", "Sort on read") and was
replaced with a position a reasonable engineer might hold: consumers competing
for CPU, at-least-once conflated with fan-out, concurrency as the fix for a
semantic split, replay excusing idempotence, one group's replay slowing
another's, and three wrong partition keys that each order something real but not
the thing that was asked for.

Correct options sit at **c, a, d, b, c, a** - all four positions used, no letter
twice in a row. Checked by eye against the four preceding chapters, since
`quiz-invariants.test.ts` is per-chapter: 3.14 opens on c, 3.15 on d, 3.16 on a,
3.17 on b, so every opener is spoken for and c is the least recent.

Scope check (§1 point 6): nothing in the quiz depends on 3.19 or later. Q6's
compensating-action question is answered with 3.17's own request-path test
rather than with saga or outbox vocabulary, neither of which the curriculum
teaches.

## 11. Playtest pass (deliverable 6, §18.2's binding question)

"Which prior chapter taught each move this exercise requires?"

| Move | Taught in |
|---|---|
| Read a 19-node architecture and locate the tier that publishes | 2.1, rebuilt from scratch in R1, extended in 3.17 |
| Add a component and wire it into an existing tier | 1.2 first, every Part 3 chapter since |
| Draw an `async` edge and know what it means | 3.17, which introduced the kind and its semantics |
| Act on an `orphan-component` warning | 3.7, whose namesake fault is the same rule |
| Recognize that one hand-off can serve many readers | **This chapter** (the new material, and it is load-bearing per §11.4 - nothing in the starter can be rewired to produce it) |
| Know that the notification path should be left alone | 3.17, which built it and argued for every piece of it; the brief says so explicitly rather than relying on memory |
| Read a validation explanation and act on it without a hint | 0.1 onward |

No move is unaccounted for. The one genuinely new judgment - that a fact needs a
different hand-off from a task - is the chapter's own thesis, which is §11.4's
"barely solvable with the newest material" condition met rather than dodged.

## 12. Items flagged for a second pass

- **The four-worker blueprint's drift message.** Described in §8. A learner who
  draws two of the three subscriptions sees a repeated
  "Event Bus -> Worker (async)" rather than "one more subscription needed".
  Worth watching in playtest; the underlying fix is open decision 11's, still
  unscheduled.
- **Three identical Worker cards.** `GraphNode` has no label field, so fraud
  screening, partner syndication and the analytics rollup are three
  indistinguishable cards on the canvas. Nothing in the exercise depends on
  telling them apart - all three take the same edge - but a learner reading the
  brief may look for the labels. Recorded in `simplifications`. If the engine
  ever grows per-node labels, this chapter is the first one that would use
  them.
- **Board width.** The starter spans x=60 to x=1880 plus decorators, the widest
  authored starter graph so far (3.17's was 1100 of nodes plus comments at
  1620). §11.5's own answer is that the canvas opens at a readable floor zoom
  and pans rather than fitting, but this is the chapter that tests that claim
  hardest.
- **`kafka` in the palette but out of the blueprint.** Defended in §4 and §8,
  and it is the same shape as 3.14's `distributed-cache`. A reviewer should
  still decide whether a component the learner is taught, shown a diagram of,
  and quizzed on twice should be buildable-but-optional, or whether §16's row
  for this chapter should have homed it in 3.19 or later with a replay-shaped
  exercise of its own.
- **Word count.** About 2,300 prose words excluding the walkthrough's prop
  literals and the two Mermaid blocks, against a 35-minute estimate - roughly
  the same rate as 3.17 (2,371 for the same estimate). A density revision pass
  was run as a distinct round: cut a paragraph restating the bus's decoupling
  claim that the walkthrough's caption had already made, collapsed a
  four-sentence lead-in to the log section into the two that carried
  information, and moved the consumer-group/ordering/retention points out of
  prose into a bullet list where they scan.
- **No new open decisions raised.** Decision 5 gained a seventh instance
  (nuggets), decision 11 gained two (the ungated `partitions`/`retentionHours`,
  and the four-alias drift shape above), decision 14 was hit again with no new
  shape (the walkthrough's failure step), decision 3 was applied again for the
  beat-2 Mermaid topology, and decision 15's Group E row is now checked for its
  second chapter.
