# Chapter spec - 3.17 Message Queues

Authored under CURRICULUM.md §5 (chapter blueprint), §6 (mandatory sections),
§20 (author instructions). Deliverable 1 of the 6 in pending-content.md's
"Per-chapter deliverables". Lives beside the lesson so a reviewer can check the
prose against the intent that produced it.

- Chapter definition: `src/content/chapters/index.ts` (`bb-3-17-message-queues`)
- Lesson body: `public/content/chapters/bb-3-17-message-queues.mdx`
- Manifest row: `src/curriculum/manifest.ts`, slug `3-17-message-queues`
  (`chapterDefinitionId` flipped from `null` to the id above)

**Wave.** First Group E chapter, authored immediately after Checkpoint R1 in
this same working tree. `pending-content.md` puts Group E in Wave 6; the real
prerequisite chain (R1, which gates Groups E and F per §17) is authored and sits
directly before it, so no sequencing rule (§18.2) is violated - only the wave
grouping is out of order relative to actual authoring order, the same note every
Wave 3/4/5 chapter's spec has carried.

## 0. Type classification

Building Block, per §4/§16 - CURRICULUM §14's own row states "**New:
`message-queue`, `worker`, `dead-letter-queue`; edge kind `async`**" and §16's
audit table lists the same three. Consequence, same as 3.11-3.16: Failure modes
and Scaling considerations are **M** (mandatory), not **o** - both appear as
full sections.

This is also the curriculum's only 3-component chapter. §18.1's Groups E-G row
sanctions it explicitly ("≤3 (3.17 only)") and §14 states the justification: the
trio is one cohesive pattern, and `queue-without-dead-letter-queue` enforces its
unity in the engine rather than in prose. Checked against §20.4's "≤2-3 new
components / 1 new edge kind / one new idea-cluster" budget: three components,
one edge kind (`async`), one cluster (work that outlives the request that
started it, and what happens when it fails).

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Move work off the request path: what a queue actually promises, what a consumer owes in return, and where a job goes when it can never succeed. Per CURRICULUM §14's own row. |
| Type | Building Block (see §0). |
| Difficulty | intermediate - matches `manifest.ts`'s existing `difficulty: "intermediate"` and §14's Group E heading. |
| Estimated time | 35 minutes (Reader + Editor combined), per §14's own row and `manifest.ts`'s existing `estimatedMinutes: 35`. |
| Prerequisites | Checkpoint R1 (`manifest.ts`'s `prerequisiteSlugs: ["checkpoint-r1-a-site-that-stays-up"]`). §17 gates Groups E and F on R1 only, not on each other - the one sanctioned branch in Part 3. |
| Unlocks | 3.18 (event-driven architecture, whose entire motivation is this chapter's one-consumer semantics), 3.19 (background jobs), 3.23 (retries and idempotency formalized as patterns), and every RWE project with a write path that fans out. |
| Building blocks introduced | `message-queue`, `worker`, `dead-letter-queue`, plus edge kind `async`. Agrees with §16. |
| Stages trained | 2 (component fluency), 3 (request-path reasoning), 4 (failure reasoning). |
| Interview relevance | **High** - §14's own row: steps 4 (high-level design) and 5 (deep dive). |
| Production relevance | Queue depth and oldest-message age are the two numbers an on-call engineer actually watches for anything asynchronous; the dead letter queue is the operational contract that decides whether failures are visible or silent. |

## 2. Learning objectives (§5.2)

Six objectives, all five categories present (§5.2 requires each at least once;
Practical is mandatory here because this is not a no-build Concept chapter).

| # | Category | Objective |
|---|---|---|
| 1 | Knowledge | Explain why a queue's durability is what makes it safe to answer a user before the work is finished. |
| 2 | Engineering | Decide whether a job belongs off the request path by asking whether the user's success depends on its result, rather than whether it is slow. |
| 3 | Knowledge | Describe what at-least-once delivery obliges a consumer to do, and name two ways to make a job safe to run twice. |
| 4 | Practical | Build a queue-and-consumer path that takes work off the request path and gives repeatedly-failing jobs somewhere to land, and pass Submit. |
| 5 | Interview | Answer "what happens when the consumer fails?" by naming redelivery, backoff, and the point at which a message stops being retried. |
| 6 | Communication | Justify moving one specific job off the request path aloud, naming the latency it removes and the new state the interface now has to represent. |

Where each is exercised (§5.2's "untested objectives get cut"): 1 -> lesson's
durability paragraph + quiz Q2; 2 -> the trade-offs section's closing test +
quiz Q1; 3 -> the delivery-semantics table + quiz Q3; 4 -> the build; 5 ->
the interview lens's senior answer + quiz Q4/Q6; 6 -> the interview lens plus
the "done becomes a state the UI has to represent" trade-off row.

## 3. Per-beat outline (§5.3, Building Block type per §6)

| Beat | Section in the lesson | Notes |
|---|---|---|
| 1-2 Cold open / why this exists | Untitled opener | R1's job board, 4.2 s p95 publish of which 40 ms is the listing's own write, plus last Tuesday's mail-provider outage failing publishes for listings already saved. Two pressures: latency and coupling. |
| 3 Think first | `> [!NOTE]` callout | Two-part prompt: how many of the four jobs must finish before "Published", then the harder half - what has to be true before you are willing to say "published" with the emails unsent. Paid off by the durability paragraph. |
| 4 Mental model | "Hand off the work instead of doing it" | One anchor ("a queue turns a call into a note"), one analogy (kitchen ticket rail). One model, per §5.3. |
| 5 Visual explanation | `<Walkthrough>` + caption | Primary diagram, before its explanation (§8.1). See §5 below. |
| 6-7 Core + internal mechanics | "What the queue actually promises" | Durability, decoupled rates, the delivery-semantics table, then the ack/visibility mechanic that produces all three and the idempotence obligation that follows. |
| 8 Trade-offs | "Trade-offs" | Four-row table, then the decision under all four (does this job belong off the request path at all) with a counter-example that fails the test (password reset). |
| 9 Failure modes | "What breaks" | Four: the queue that never drains, duplicate side effects, the poison-message crash loop, lost ordering. |
| 10 Scaling behavior | "What changes at scale" | 10x consumers pull (3.8 without a load balancer), 100x split by latency class, 1000x the broker as its own failure domain, closing on the question 3.18 answers. |
| 11 Production examples | "In production" | Amazon/SQS and Stripe webhooks, then §9 lens 9 (the two-person team's `jobs` table). |
| 12 Common mistakes | "Common mistakes" | Four, each an engineer's decision rather than a system behaviour, to avoid restating beat 9. |
| 13 Interview lens | "In an interview" | Steps 4 and 5 named explicitly; ends with the §10.3 "what a senior answer sounds like" paragraph. |
| 14 Connections | "Connections" | Three back-references (3.16, 3.6, 3.8) and the single §19 forward tease to 3.18. |
| 15 Recap + knowledge check | "Recap" | Five retrieval anchors. The knowledge-check pointer is appended by `appendKnowledgeCheckHeading`, not authored. |
| 16 Transition brief | "Your turn" | Restates the symptom (not the fix), names what success looks like, and hands off to the Editor. |
| Preview of next | "Next" | 3.18, which `manifest.ts` confirms is the next row (`prerequisiteSlugs: ["3-17-message-queues"]`). Engineered cliffhanger per §6: the queue's one-consumer semantics stated as a wall, not a table of contents. |

Section order follows §5.3 with no reordering. Beats 6-7 and 9-10 are each
merged into one heading, which §6's "Rules of use" allows for adjacent sections.

## 4. Declared omissions and justifications (§6's written-justification rule)

1. **§12's nugget devices (Interview / Production / Engineering boxed
   one-liners) are absent.** Standing open decision 5 in `pending-chapters.md`,
   now at its sixth instance. Unchanged reasoning: a device whose value is a
   fixed placement cannot begin partway through the curriculum, and the
   equivalent content is inline (the interview register in "In an interview",
   the operational register in "In production" and the dead-letter-queue
   paragraph, §9 lenses 1/5/7 throughout). That decision's own note asks
   individual chapters to stop re-declaring this one, so this is a pointer, not
   a new argument.
2. **No RWE cross-reference in the Interview lens.** §19 asks for one; no
   authored lesson has one yet (checked at 3.16 by grep across every authored
   `.mdx`). Same shape as omission 1 - it belongs in one retrofit pass across
   every chapter, not started here.
3. **The `config` half of §14's exercise line ("retry/backoff") is taught but
   not gated.** The canvas can express it only through `dead-letter-queue`'s
   `maxRetries` (default 5) and `message-queue`'s `deliveryGuarantee` (default
   at-least-once). Both defaults are already the values the lesson argues for,
   so a config predicate would grade a dropdown the learner had no reason to
   touch, and a failed config predicate reports as `missingComponents` rather
   than as a config error (open decision 11's known drift shape). Backoff and
   jitter have no canvas representation at all. Recorded in `simplifications`.
4. **The "fix (missing DLQ)" half of §14's exercise line is delivered inside
   the build, not as a separate broken starter graph.** The starter has no
   queue, so there is nothing to break yet; the moment the learner adds one and
   wires a consumer, `queue-without-dead-letter-queue` fires with the
   poison-message explanation. That is the same productive-failure mechanism
   §11.1 asks for, arrived at by the learner's own edit rather than pre-planted.
5. **Three of the publish handler's four jobs are prose only.** Emails,
   thumbnails and analytics rows have no registry component and are not
   drawable; the fourth (the index update) is. The lesson and the brief describe
   all four and the canvas models the consumer once, rather than inventing
   components (§20.5's never-fork rule, one level up).

## 5. Diagrams (§7)

Two, and §7.1's own table names both for this chapter ("Queue / stream topology
| 3.17" and "State transition | Lifecycle of a message/job/session | 3.17").

**Primary (beat 5) - `<Walkthrough>`, six steps.** Six component nodes (Browser,
App Server, SQL Database, Message Queue, Worker, Dead Letter Queue), six edges,
three of them `async`. Chosen over a static diagram per §7.2's own rule and the
author-reference's stronger form: the topology's whole point is a *sequence* -
where the response goes out relative to the work, which is invisible in a
snapshot. Steps 1-2 put the response on the wire before any job runs, 3-4 show
arrival rate and processing rate coming apart, 5 shows redelivery, 6 shows the
exhausted message moving aside. No `algorithms`/`variants`: nothing here
branches on a selectable strategy, and `walkthrough-invariants.test.ts` requires
≥2 if the field is present at all. No hand-placed positions - auto-layout.

**Secondary (beat 7) - Mermaid state diagram, message lifecycle.** Non-topology,
so Mermaid per §7.2, and not a second drawing of the walkthrough's topology
(that rule is about topology, and this diagram has no components in it at all).
Queued -> InFlight -> Done, with the two edges that matter: InFlight back to
Queued on no-ack, and Queued to DeadLetter on exhausted attempts. Its caption
names what to notice: the only way out of the retry loop is the dead letter
queue, and the only way out of that is a person.

Both carry a one-line `Note:` caption (§7.2, §20.3), using the `Note:` prefix
the 2026-08-24 cross-cutting pass normalized every chapter to.

**Progression (§7.2's "start minimal, evolve").** The chapter's diagram sequence
goes from a six-node topology to a four-state lifecycle - narrowing rather than
accumulating. That is the honest shape here: the second question is not "what
does the system look like now" but "what happens to one message", and drawing a
larger topology to answer it would add nodes that teach nothing.

## 6. Component budget (§16) and cross-reference checks

- **New this chapter:** `message-queue`, `worker`, `dead-letter-queue`, edge kind
  `async`. Exactly §16's row, and §18.1's sanctioned 3-component exception.
- **`availableComponentIds`** is R1's cumulative palette plus those three.
  Nothing appears before its home chapter. `distributed-cache` remains
  available-but-not-required for 3.14's own recorded reason.
- **`async` is fully buildable**, checked directly against
  `src/content/components/config/`: `app-server.relations.outputs` allows
  category `messaging` + kind `async`; `message-queue.relations.outputs` allows
  `compute` and `messaging` + `async`; `dead-letter-queue.relations.inputs`
  allows `messaging` + `async`. Unlike the `control` edge kind (open decision
  8), nothing about this chapter's new edge kind is illustrative-only.
- **`worker -> search-engine` is legal and is deliberately `request-flow`.**
  `search-engine.relations.inputs` allows category `compute` + kind
  `request-flow` only; `worker.relations.outputs` allows `data` +
  `request-flow`. This is not a workaround - it is the chapter's sharpest point,
  and the blueprint commentary spends a paragraph on it: the consumer's write
  into the index is a genuinely blocking call, so drawing it dashed would be a
  lie. What changed is not the call's nature but who is waiting for it.
- **2.3's Group E row (open decision 15), first of three chapters checked.**
  2.3's table promises Group E as "work that does not belong on the request path
  | 3.17-3.19". The cold open is that sentence made concrete (4.2 s of which 40
  ms is the user's own work) and the trade-offs section states the test in those
  exact terms. Matches; recorded in the ledger.
- **3.16's forward promise, paid off.** 3.16's Connections ends "Coming in 3.17:
  the machinery for the arrow this chapter could not draw", and R1's Next
  repeats it. The lesson pays it off twice: in the paragraph after the
  walkthrough (naming `async` as the edge 3.16 lacked) and in the exercise,
  where the indexing path is redrawn through the consumer.

## 7. Validation rules (deliverable 4)

**No new rules.** 3.14's curated set carried forward plus
`queue-without-dead-letter-queue`, which already exists in
`src/validation-engine/rules/` and has existed since before any Group E content:

| Rule | Why it is in this chapter's set |
|---|---|
| `queue-without-dead-letter-queue` | The chapter's teaching instrument. Config-aware (it only fires for a `deliveryGuarantee` that can retry), and its explanation is the poison-message argument in the learner's own words. Fires during the build, not at Submit. |
| `component-relations` | The gate on the new edge kind. A learner who draws `app -> queue` as `request-flow`, or tries `queue -> search-engine`, is stopped by the components' own declared contracts. |
| `orphan-component` | A queue or consumer dropped on the canvas and left unwired. |
| `missing-input-connection` | A consumer wired to its destination but not to a source - the "looks wired, can never receive" shape this rule exists for. |
| `no-direct-client-database`, `orphan-read-replica` | Carried forward; they guard the parts of the graph this exercise does not touch. |

The starter graph fires none of them: it is R1's reference system, which
validates clean. The set earns its place during the build rather than at the
start, which is now the third consecutive chapter with that shape (see §12).

## 8. Blueprint and starter graph (deliverable 3, part of it)

**One blueprint**, `bb-3-17-blueprint`. §11's rule is that multiple blueprints
are for chapters with genuinely multiple right answers; this chapter has one
shape. It requires R1's whole system plus the three new components and four new
edges: `app -> queue` (async), `queue -> worker` (async), `queue -> dlq`
(async), `worker -> search` (request-flow).

**Why `worker -> search` is required rather than left open.** The brief's second
success criterion states the outcome ("the search index still receives every
published listing, but the recruiter's request no longer waits on it"), so the
learner is told the goal without being told the edge. A build that adds the
queue trio but leaves the index write on the request path has not solved the
problem the brief describes, and 3.16's undrawn arrow would go unpaid. A learner
who also wires `worker -> sql-database` still passes - matching is containment,
not equivalence.

**The starter graph is R1's own reference system** (which is 3.16's solved
graph, with the search index at the bottom-right slot 3.16 marked as its gap).
It validates clean, deliberately, for the third chapter running. The argument is
different each time, though: 3.15 was "distance is not a wiring fault", 3.16 was
"look at what each component is organized around", and this one is "the fault is
in what one request handler does, which no rule can see". Both hint 1 and the
transition brief say Validate will be quiet before the learner discovers it.

**Decorators (§11.6).** 3.16's zones carried forward with two changes: its
former magenta gap slot is now the search index, and since cache and index share
a row and the emerald data colour, §11.6's merge rule collapses them into one
zone labelled "Derived data" (a term 3.16 taught). The new magenta "Build here"
zone spans the whole unused row below - warranted because the fix is genuinely
missing nodes in identifiable empty space, not a rewire. Two slate comments
carry the two already-public facts from the brief (the 4.2 s budget, last
Tuesday's outage); neither names a component the learner has to add, per §11.2's
calibration rule.

## 9. Hints (deliverable 3, part of it)

Three, ramping orienting -> directional, never the answer (§11.3):

1. Orienting: Validate is quiet because the fault is in what one request does,
   not in what connects to what. Decide which of the four jobs the recruiter is
   actually waiting for.
2. Directional: the other three still have to happen, so they need somewhere to
   be recorded that survives the request ending, and something on the other side
   that reads that record at its own pace.
3. Directional, and pre-empts the third component without naming it: once the
   pair exists, Validate will start talking about a job that fails every attempt
   and has nowhere to go. Also flags that the canvas will refuse the dashed kind
   where a hand-off is not genuinely one-way.

None names a component. Hint 3 tells the learner that the engine will explain
the missing piece, which is the hints-versus-explanations split in
`ARCHITECTURE.md` working as intended: the hint points at where to look, the
rule's explanation says what is wrong.

## 10. Quiz (deliverable 5)

Six questions, ramp 1/1/2/2/3/3 (matching 3.10-3.16), five `single` and one
`diagram`. **All six of QUIZ_FRAMEWORK.md §12's bank questions tagged (3.17) are
spent**: bank Q1 -> Q1, Q2 -> Q2, Q3 -> Q3, Q4 -> Q4 (the diagram question,
topology carried over near-verbatim), Q5 -> Q5, Q6 -> Q6. Bank Q7-Q11 belong to
3.18 and 3.19 and are untouched.

Distractors were rewritten wherever the bank's own were joke options under §1
point 3 ("Emails are unimportant", "Email servers are always down", "HTTP cannot
trigger email", "The queue deletes itself", "Adding CPU"). Each replacement is a
position a reasonable engineer might hold: reliability as the criterion for
moving work off the path, priority as the criterion, a queue as a load shedder,
finishing inside the visibility timeout as a substitute for idempotence.

Correct options sit at **b, d, c, a, d, b** - all four positions used, no letter
twice in a row. Checked against the three preceding chapters by eye, since
`quiz-invariants.test.ts` is per-chapter: 3.14 opens on c, 3.15 on d, 3.16 on a,
so b is unused by any recent neighbour.

Scope check (§1 point 6): nothing in the quiz depends on 3.18 or later. Q6's
retry storm is seeded here and formalized in 3.23, which is the bank's own note
and matches §19's forward-tease discipline (the question tests the behaviour,
never the pattern name).

## 11. Playtest pass (deliverable 6, §18.2's binding question)

"Which prior chapter taught each move this exercise requires?"

| Move | Taught in |
|---|---|
| Read a 13-node architecture and locate the application tier | 2.1, then rebuilt from scratch in R1 |
| Add a component and wire it into an existing tier | 1.2 first, every Part 3 chapter since |
| Recognize that a clean Validate does not mean a correct design | 3.15 and 3.16, both with clean starter graphs; 3.14's unasked cache |
| Decide what belongs on the request path | **This chapter** (the new material, and it is load-bearing per §11.4) |
| Draw an edge whose kind is not `request-flow` | 3.12 (`replication`), so the idea that edge kind carries meaning is not new - only this kind is |
| Understand that the index is fed by the application tier, not the database | 3.16, whose entire closing section is this constraint |
| Read a validation explanation and act on it without a hint | 0.1 onward; the `queue-without-dead-letter-queue` explanation is the primary text for the third component |

No move is unaccounted for. The one genuinely new judgment (what belongs on the
request path) is exactly the chapter's own thesis, which is §11.4's "barely
solvable with the newest material" condition met rather than dodged.

## 12. Items flagged for a second pass

- **Third consecutive clean starter graph.** 3.16's spec flagged this as "now a
  pattern rather than a novelty" and said a third would need real justification.
  Here is the justification: this chapter's fault is behavioural (what one
  handler does inside one request) and there is no graph edit that could express
  it, because the four jobs have no components. A reviewer should still decide
  whether three in a row trains a learner to stop reading Validate. Group F
  opens with 3.20, whose §14 row is an explicit fix chapter with described
  symptoms - the streak breaks there naturally.
- **Word count.** 2,371 prose words excluding the walkthrough's prop literals
  and the mermaid block, ~2,140 excluding table cells, against a 35-minute
  estimate: about 61-68 words per minute depending on which count you use,
  between 3.14's 56 and 3.15's 69. A density revision pass was run as a distinct
  round (cut a self-acknowledged repeat of the retry storm in "What breaks",
  replaced an idempotence bullet in "Common mistakes" that duplicated the
  failure-modes section, tightened the durability paragraph).
- **`hasEditorExercise` and the three-component load.** This is the only chapter
  in the curriculum introducing three components at once, and the exercise asks
  for all three plus four edges in one pass. §11.4 wants an exercise "barely
  solvable"; a playtest should check that "barely" has not become "not".
- **The blueprint requires `worker -> search-engine`.** Defended in §8, but it
  is the most prescriptive single edge this chapter grades, and a learner who
  reads criterion 2 as "the index is fine as it is" will fail Submit with a
  missing-edge report rather than an explanation. Worth watching in playtest.
- **No new open decisions raised.** Decision 5 gained a sixth instance
  (nuggets), decision 11 gained one (the ungated `maxRetries` /
  `deliveryGuarantee` fields), and decision 15's Group E row is now checked for
  its first chapter. Decision 8 (`control` edges) is explicitly *not* touched:
  `async` is fully buildable, which is worth recording because it is the first
  new edge kind since 3.12 that did not hit that wall.
