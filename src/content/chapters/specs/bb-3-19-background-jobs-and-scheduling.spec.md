# Chapter spec - 3.19 Background Jobs & Scheduling

Authored under CURRICULUM.md §5 (chapter blueprint), §6 (mandatory sections),
§20 (author instructions). Deliverable 1 of the 6 in pending-content.md's
"Per-chapter deliverables". Lives beside the lesson so a reviewer can check the
prose against the intent that produced it.

- Chapter definition: `src/content/chapters/index.ts`
  (`bb-3-19-background-jobs-and-scheduling`)
- Lesson body:
  `public/content/chapters/bb-3-19-background-jobs-and-scheduling.mdx`
- Manifest row: `src/curriculum/manifest.ts`, slug
  `3-19-background-jobs-and-scheduling` (`chapterDefinitionId` flipped from
  `null` to the id above)

**Wave.** Third and final Group E chapter, authored immediately after 3.18 in
this same working tree. `pending-content.md` puts Group E in Wave 6; the real
prerequisite (3.18) is authored and sits directly before it, so only the wave
grouping is out of order - the same note every Wave 3/4/5 chapter has carried.
**This chapter completes Group E**, which closes open decision 15's Group E row
(see §6).

## 0. Type classification

Building Block, per §4/§16 - CURRICULUM §14's own row states "**New:
`cron-job`, `serverless-function`**" and §16's audit table lists the same two.
Consequence, same as 3.11-3.18: Failure modes and Scaling considerations are
**M** (mandatory), not **o**, and both appear as full sections.

Checked against §20.4's budget: two new components (inside §18.1's "≤2/chapter"
for Groups E-G), **no** new edge kind (both components are wired with
`request-flow`, which 1.2 introduced), and one idea-cluster - what starts a
piece of work decides where it should live, and the two shapes that exist for
the two triggers the curriculum has not covered yet.

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | The rest of the compute taxonomy (cron, serverless) so learners stop reaching for an app server for everything; the cron-overlap hazard seeded for 3.23's lock service. Per CURRICULUM §14's own row. |
| Type | Building Block (see §0). |
| Difficulty | intermediate - matches `manifest.ts`'s existing `difficulty: "intermediate"` and §14's Group E heading. |
| Estimated time | 25 minutes (Reader + Editor combined), per §14's own row and `manifest.ts`'s existing `estimatedMinutes: 25`. Flagged in §12 - the chapter came in above that rate and the reason is structural, not padding. |
| Prerequisites | 3.18 (`manifest.ts`'s `prerequisiteSlugs: ["3-18-event-driven-architecture"]`). |
| Unlocks | 3.23 (which resolves this chapter's overlap cliffhanger with a lock service; `manifest.ts` lists 3.19 as one of its two prerequisites), and the RWE projects §14 pins to it: Job Scheduler, Price Tracking Service, Metrics Monitoring, Strava. |
| Building blocks introduced | `cron-job`, `serverless-function`. No new edge kind. Agrees with §16. |
| Stages trained | 2 (component fluency), 5 (design judgment under multiple defensible answers), 6 (operational reasoning - what fails when nobody is watching). |
| Interview relevance | **Medium** - §14's own row. Loop steps 4 (high-level design, where the follow-up "where does the nightly job live?" lands) and 7 (trade-offs, where "why not serverless for all of it" lands). |
| Production relevance | A scheduled job with no caller fails silently, so the operational contract is an alert on the run that did not appear rather than on the one that crashed. |

## 2. Learning objectives (§5.2)

Six objectives, all five categories present (Practical is mandatory here - this
is not a no-build Concept chapter).

| # | Category | Objective |
|---|---|---|
| 1 | Knowledge | Explain why a schedule held inside a horizontally scaled pool runs once per instance, and why an instance-id flag does not fix it. |
| 2 | Engineering | Decide which of the four triggers a given piece of work has, and pick the compute shape that matches. |
| 3 | Knowledge | Describe the two constraints that decide whether work fits a serverless function: the per-invocation timeout ceiling and the cold start on a path someone is waiting on. |
| 4 | Practical | Build a scheduled path and an on-demand path into an existing architecture without changing the request path either one replaces, and pass Submit. |
| 5 | Interview | Answer "where does the nightly report live?" by naming the trigger first and then what scheduled work gives up. |
| 6 | Communication | Justify keeping a job on the application server aloud, naming the operational cost of the narrower shape rather than defending the default. |

Where each is exercised (§5.2's "untested objectives get cut"): 1 -> the cold
open, the Think-first payoff in "A schedule is state" + quiz Q2; 2 -> the
four-triggers table and the walkthrough + quiz Q1; 3 -> "Scale to zero, and what
it costs" + quiz Q3 and Q4; 4 -> the build; 5 -> the Interview lens and its
senior answer; 6 -> "When the application server is still right" and the
blueprint commentary.

## 3. Per-beat outline (§5.3, Building Block type per §6)

| Beat | Section in the lesson | Notes |
|---|---|---|
| 1-2 Cold open / why this exists | Untitled opener | Three identical invoice sets at 02:00 from a timer inside a three-instance pool. No error anywhere - the failure is arithmetic against the instance count. Two sentences of thesis after it: the bug is that a schedule was stored in a thing that exists N times. |
| 3 Think first | `> [!NOTE]` callout | The obvious repair (only instance 0 runs the timer) stated as the prompt, with the follow-up that breaks it: the night instance 0 is mid-deploy. Paid off in the first paragraph of "A schedule is state". |
| 4 Mental model | "Don't ask what the code does, ask what wakes it up" | One anchor sentence as the heading, then the four-triggers table. The taxonomy is a table rather than a decision-tree diagram (§7.1 lists one for 3.19) - see §5. |
| 5 Visual explanation | `<Walkthrough>` + caption | Primary diagram, before its explanation (§8.1). See §5 below. |
| 6-7 Core + internal mechanics | "A schedule is state" + "Scale to zero, and what it costs" | Two headings, one per new component. The first covers what moving the schedule out buys (fires once, has a run history, survives the pool) and what it does not (a caller). The second covers scale-to-zero and its three constraints as a table. |
| 8 Trade-offs | "When the application server is still right" | Both directions: when a real scheduler beats crontab (job dependencies), and when a function's economics expire (the crossover rate). §9 lens 3 - the boring alternative, and when it wins. |
| 9 Failure modes | "What breaks" | The overlap Mermaid sequence, then five: overlap, the missed run, silent failure, cold start where someone is waiting, and the timeout mid-write. Overlap is §14's own mandated seed for 3.23. |
| 10 Scaling behavior | "What changes at scale" | 10x thirty jobs contending in one window with no dependency graph; 100x the quiet window stops existing and batch moves onto 3.18's stream; 1000x the taxonomy survives and the cron does not. |
| 11 Production examples | "In production" | Airbnb (Airflow - the schedule moved out of crontab when jobs began depending on each other) and Coca-Cola (vending telemetry on functions, with the crossover volume modelled rather than assumed), then §9 lens 9 - the two-person team's crontab, and the threshold that is the second job rather than traffic. |
| 12 Common mistakes | "Common mistakes" | Four, each an engineer's decision rather than a system behaviour, so as not to restate beat 9. |
| 13 Interview lens | "In an interview" | Medium relevance stated honestly as a follow-up rather than a section; steps 4 and 7 named; ends with the §10.3 "what a senior answer sounds like" paragraph. |
| 14 Connections | "Connections" | Three back-references (3.6/3.8, 3.17, 3.5) and the single §19 forward tease to 3.23. |
| 15 Recap + knowledge check | "Recap" | Five retrieval anchors. The knowledge-check pointer is appended by `appendKnowledgeCheckHeading`, not authored. |
| 16 Transition brief | "Your turn" | States both symptoms and both goals, never either fix; says outright that Validate will report nothing and why. |
| Preview of next | "Next" | 3.20 Object Storage, which `manifest.ts`'s row order puts directly after this chapter. Engineered cliffhanger per §6: the exercise the learner just completed writes image bytes into a document the catalogue reads on every page load. See §4's omission 2 for why "Next" and the §19 tease are different chapters here. |

Section order follows §5.3 with no reordering. Beats 1-2 are merged into the
untitled opener; beats 6-7 are split across two headings rather than merged,
because they carry one new component each.

## 4. Declared omissions and justifications (§6's written-justification rule)

1. **§12's nugget devices (Interview / Production / Engineering boxed
   one-liners) are absent.** Standing open decision 5 in `pending-chapters.md`,
   now at its eighth instance. That decision's own note asks individual
   chapters to stop re-arguing this one, so this is a pointer rather than a new
   argument: the equivalent content is inline (the interview register in "In an
   interview", the operational register in "In production", §9 lenses 1/3/5/7/9
   throughout).
2. **The §19 forward tease and the "Preview of next chapter" section name
   different chapters.** §19 allows one tease per chapter; §6 separately makes
   "Preview of next chapter" mandatory. They coincided in 3.17 and 3.18 because
   those chapters sat directly before their own successors in one group. This
   chapter ends Group E, and CURRICULUM §14's own row for it requires the
   cron-overlap hazard to be "seeded for 3.23's lock service" - a different
   chapter from the one that comes next. So Connections teases 3.23 (the tease
   budget, spent once) and Next previews 3.20 (the §6 section). Precedent: 3.16
   did exactly this, teasing 3.17 in Connections while sitting before Checkpoint
   R1. Neither mention is a dependency; both are marked.
3. **No RWE cross-reference in the Interview lens.** §19 asks for one; no
   authored lesson has one yet. Same shape as omission 1 - it belongs in one
   retrofit pass across every chapter, not started here.
4. **§14's "trade-off (four jobs -> right compute shape)" ships as the lesson's
   four-triggers table plus quiz Q1, not as presented graphs in the Editor.**
   §11.1's Trade-off scenario type needs a "2+ presented graphs, pick per
   scenario" affordance the Design Editor does not have; the degradation path is
   `pending-content.md`'s own named one. This is the same resolution 3.18 took
   for its own "x3 scenarios" phrasing. Q1 is literally §12's bank Q10, whose
   four jobs are the four §14's row asks for.
5. **`scheduleIntervalMinutes`, `maxConcurrency` and `timeoutSeconds` are taught
   and not gated.** Another instance under open decision 11, identical in shape
   to 3.18's `partitions`/`retentionHours` and 3.17's `maxRetries`: a failed
   config predicate reports as `missingComponents`, which would put "Missing:
   Cron Job" on a canvas with a Cron Job plainly on it. The reference graph
   carries the honest values (1440 minutes, platform defaults for the function)
   so the Debrief shows them without grading them.
6. **The scheduled close is drawn straight into the primary database rather than
   through a queue.** The lesson's own Common Mistakes section says a schedule
   that must not miss should trigger an enqueue, and a real nightly close of
   this size would often do that. It is not what the exercise asks for, because
   routing it through 3.17's notification queue would put unrelated work on a
   queue the brief explicitly asks the learner to leave alone, and because the
   chapter is teaching the trigger rather than the durability of the work.
   Recorded in `curriculumContext.simplifications` and disclosed in the lesson
   prose, per open decision 10's standing note that `simplifications` alone is
   not a disclosure surface.

## 5. Diagrams (§7)

Two, and the taxonomy that §7.1 would put in a third is a table instead.

**Beat 5 - `<Walkthrough>`, six steps.** The primary diagram: API Gateway, App
Server, SQL Database, Cron Job, Serverless Function and the listing document
store. Five edges, all `request-flow`. Chosen over a static diagram because the
chapter's subject is *when* work starts, which a snapshot of the same six boxes
cannot show: step 1 is the trigger the learner already has, step 2 is 02:00 with
nobody on the site, steps 3-4 are the upload path diverging at the gateway, step
5 is forty copies at once, and step 6 is the same board an hour later with the
function at zero and the pool still up. Step 6 is the one that needs a
walkthrough rather than a picture - "costs nothing right now" is a statement
about a moment in time. No hand-placed positions (auto-layout). No
`algorithms`/`variants`: nothing branches on a selectable strategy. **Open
decision 14 is not in play** - this chapter's failure diagram is Mermaid, and
the walkthrough has no failure step, which is the first Group E walkthrough that
avoids that gap rather than working around it. All six captions are inside
`normalize.ts`'s 220-character budget.

**Beat 9 - Mermaid, the overlap.** A `sequenceDiagram` with the scheduler, two
runs and the database, showing the 03:00 run starting while the 02:00 run is
still working the same rows and both writing invoices. Non-topology (no
components in it), so Mermaid per §7.2, and §7.1's own table names "State
transition | Lifecycle of a message/job/session | 3.17, 3.19" - this is that
lifecycle at the point it goes wrong. It satisfies §7.2's failure-diagram rule
by drawing the failure itself (two interleaved writes) rather than the happy
path with a caption saying to imagine it.

**§7.1's decision tree for 3.19 is a table instead.** §7.1 lists "Decision tree
| Selection procedures | 3.11, 3.19". The selection procedure here has exactly
one question ("what wakes it up?") with four answers, so a tree would be a
single root with four leaves - a picture of a table. §20.6's "prefer the format
with the highest scan value" decides it. Declared rather than silently skipped.

Both diagrams carry a one-line `Note:` caption (§7.2, §20.3), using the prefix
the 2026-08-24 cross-cutting pass normalized every chapter to.

## 6. Component budget (§16) and cross-reference checks

- **New this chapter:** `cron-job`, `serverless-function`. Exactly §16's row. No
  new edge kind.
- **`availableComponentIds`** is 3.18's palette plus those two. `kafka` and
  `distributed-cache` remain available-but-not-required for 3.18's and 3.14's
  own recorded reasons.
- **Every edge the chapter teaches is buildable**, checked directly against
  `src/content/components/config/compute.ts`, `networking.ts` and `data.ts`:
  `cron-job.relations.outputs` allows categories `compute`/`messaging`/`data`
  with kinds `request-flow`/`async`, and `sql-database.relations.inputs` allows
  `compute` + `request-flow`, so the scheduled write validates.
  `api-gateway.relations.outputs` allows `networking`/`compute` + `request-flow`
  and `serverless-function.relations.inputs` allows `networking` + `request-flow`,
  so the gateway-fronted function validates. `serverless-function.outputs` allows
  `data` + `request-flow` and `nosql-database.inputs` allows `compute` +
  `request-flow`, so the record write validates. Open decision 8 (`control`
  edges) is not in play.
- **`cron-job` declares no input port at all** (`inputs: []`, and its
  `relations` object has no `inputs` key). Two consequences worth recording:
  `missing-input-connection` names Cron Job in its own doc comment as a pure
  origin it never flags, and `component-relations` is what stops a learner
  wiring something *into* it. The chapter teaches the missing arrow as the point
  rather than as a quirk.
- **The reference graph declares two entry points.** `authoring-invariants.test.ts`
  requires every reference-graph node to be reachable forward from
  `entryPointIds`, and a Cron Job has no inbound edge by construction, so it is
  listed as a second entry point alongside the browser. That is correct rather
  than a workaround: a clock is a second thing that starts work, and the second
  Start badge says so on the Debrief diagram. First authored chapter to have
  two.
- **2.3's Group E row (open decision 15) - third of three chapters checked, and
  the row now closes.** 2.3's table promises Group E as "work that does not
  belong on the request path | 3.17-3.19". 3.17 stated the row, 3.18 extended it
  to more than one interested party, and this chapter closes it from the other
  side: the work in 3.17 and 3.18 was still *caused* by a request, and this is
  the work that no request caused at all. Group E is the fourth of the seven
  groups to fully resolve its own row, after A, B, C and D. Groups F and G
  remain open.
- **3.18's forward promise, paid off.** 3.18's Connections ends "Coming in 3.19:
  everything in this chapter and the last one is triggered by something a person
  did. Some work is triggered by nothing at all", and its "Next" states the
  06:00 report and "there is nothing on your canvas that a clock can talk to".
  The cold open is that report, and the primary diagram's caption is the missing
  arrow stated as the chapter's own point.
- **3.18's solved system survives intact as this chapter's starter graph** - the
  queue path, the bus and its three subscribers are all where 3.18 left them, at
  the same coordinates, so a learner recognizes their own 3.18 answer.

## 7. Validation rules (deliverable 4)

**No new rules.** 3.18's curated set, carried forward unchanged:

| Rule | Why it is in this chapter's set |
|---|---|
| `component-relations` | The one doing real work. A Cron Job has no input port, so any attempt to wire something into it fails here - which is the chapter's own thesis enforced by the engine rather than only stated in prose. It also gates the gateway-to-function pairing. |
| `orphan-component` | A learner who drops both new cards on the canvas before wiring either gets two warnings naming exactly what is incomplete. |
| `missing-input-connection` | Fires on a function wired outward before it is wired inward - and deliberately does *not* fire on the Cron Job, which is the distinction worth the learner seeing. |
| `queue-without-dead-letter-queue` | Guards 3.17's path, which this chapter asks the learner to leave intact rather than rebuild. |
| `no-direct-client-database`, `orphan-read-replica` | Carried forward; they guard the parts of the graph this exercise does not touch. |

## 8. Blueprint and starter graph (deliverable 3, part of it)

**One blueprint**, `bb-3-19-blueprint`. §11's rule is that multiple blueprints
are for chapters with genuinely multiple right answers. There is one right shape
here: the schedule outside the pool with nothing pointing at it, and the burst
path behind the front door that already routes. The two additions are
independent of each other, which is a reason for one blueprint requiring both
rather than two blueprints each requiring one - a build with only the scheduled
half is incomplete, not an alternative answer.

**The starter graph validates clean**, which is the run 3.18 broke. The
justification is specific to this chapter rather than carried forward, per
3.16's standing request: **this chapter's fault has no graph representation at
all.** A timer inside the application server process is not a node and not an
edge - it is something a process contains, and the canvas draws what components
connect to. 3.15's and 3.16's clean starters were about an absent component;
3.17's was about what one request handler does; this one is about what one
process holds. The transition brief says outright that Validate will report
nothing and why, the way 3.15's and 3.16's did.

**Two components are added and nothing is deleted or rewired.** The exercise is
purely additive, which matters for the same reason it did in 3.18:
`blueprint-drift.ts` is `forbid`-blind (open decision 11(a)), so an exercise
requiring a deletion cannot be graded honestly. Here nothing needs deleting -
the pool keeps serving requests and the request path is unchanged.

**Drift messages on an incomplete build are honest this time.** The blueprint's
two new aliases are each the only node of their component in the solution, so an
incomplete build reports `missingComponents: ["Cron Job"]` or `["Serverless
Function"]` accurately. The four-`worker` alias problem 3.18 flagged is
unchanged and inherited (the bus's three subscribers are still four indistinct
worker aliases), but this chapter adds nothing to it.

**Layout (§11.5).** Eight occupied columns at the 260x160 pitch, identical to
3.18's solution: client, edge (four rows), application (three), data (four),
handed-off work (three), derived data (one), announcements (one), subscribers
(three). Four distinct rows against a widest column of four, which is the gate's
own ceiling. Every `request-flow` edge advances left to right; the one exception
is `read-replica -> app-server`, which is `FEEDBACK_SOURCES`' declared
exemption.

The two components the learner adds belong in the **application column**, below
the pool, because both are application-tier compute: one runs application work
on a clock, the other runs one of the application's own request paths. That also
keeps the gateway-to-function edge inside a single tier rather than sending it
across the board - which it would have to do if the new cards sat in any column
right of Data, since the gateway is at the left edge of the compute region and
every downstream tier is to its right. Recorded because the alternative (a new
column inserted after Application, shifting six columns right onto a ~2,260px
board) was seriously considered and rejected on width.

**Decorators (§11.6).** 3.18's zones carried forward, with its magenta gap
column now holding the Event Bus under an "Announcements" band. The new gap zone
is **two slots in one column** (x=552, y=440, 176x308), directly under the
Application band with the 12px stack gap the geometry requires - exactly two
components are missing and a wider box would imply more. One slate comment
carries the already-public numbers from the cold open and the brief; it names no
component the learner has to add, per §11.2's calibration rule.

## 9. Hints (deliverable 3, part of it)

Three, ramping orienting -> directional, never the answer (§11.3):

1. Orienting: Validate is right to be silent - nothing is miswired, and both
   problems are about where work lives rather than how it is connected. Asks
   what actually starts each of the two, and whether the answer is a request.
2. Directional: names the property, not the component. Every card on the canvas
   today needs something upstream before it can act, which is why the close
   ended up inside the pool; what is needed is something whose entire job is
   starting by itself with nothing pointing at it.
3. Directional, and the one that catches the near-miss: the uploads *do* have a
   caller, and it is the front door that already routes - so this is a second
   destination behind an existing door, not a second door. Names the two
   properties (costs nothing while idle, leaves its result where the listing
   lives) without naming what provides them.

None names a component. Hint 2 is deliberately phrased as "nothing pointing at
it" rather than "scheduled", so a learner who skimmed the lesson still gets the
structural property rather than a label to search the palette for.

## 10. Quiz (deliverable 5)

**Five** questions, ramp 1/1/2/2/3, all `single`. One fewer than 3.10-3.18's
six, matching this chapter's shorter estimate and its single idea-cluster; §3's
sanctioned range is 3-6. The ramp is 40/40/20 against §3's "roughly 30/45/25" -
the closest five-question split to that shape without a second level-3 question,
and a second one would have had to test material this chapter deliberately
defers to 3.23.

**Both of QUIZ_FRAMEWORK.md §12's bank questions tagged (3.19) are spent**: bank
Q10 -> Q1 (the four-jobs sort, which is also §14's own trade-off exercise line),
bank Q11 -> Q5 (the overlap cliffhanger). With this chapter, **§12's bank is
fully consumed across 3.17, 3.18 and 3.19** - Q1-Q6 to 3.17, Q7-Q9 to 3.18,
Q10-Q11 here. Three questions are original: Q2 (the triple invoice, which is the
chapter's own cold open re-asked as diagnosis), Q3 (the timeout ceiling as a
shape constraint) and Q4 (cold start read off a latency pattern).

Both bank questions' own distractors were joke options under §1 point 3 ("Cost
only", "Language support", "Team preference", "Nothing - crons queue politely",
"The cron stops running", "The OS prevents overlap automatically") and were
replaced with positions a reasonable engineer might hold: duration as the
organizing question, cost as the organizing question, a scheduler that skips
rather than overlaps, a scheduler that kills a run at its own interval, and a
queue-shaped reading of a missed schedule. Q2's distractors are each a real
mechanism from a chapter the learner has already taken (overlap, load-balancer
routing, non-idempotent retry), each wrong here for a nameable reason.

Correct options sit at **d, a, c, b, a** - all four positions used, no letter
twice in a row. Checked by eye against the four preceding chapters, since
`quiz-invariants.test.ts` is per-chapter: 3.15 opens on d, 3.16 on a, 3.17 on b,
3.18 on c, so d is the least recent opener.

Scope check (§1 point 6): nothing depends on 3.20 or later. Q5's answer names
mutual exclusion as a property and "something outside both runs that only one
can hold" as its shape, never "lock service", "lease" or "distributed lock" -
those are 3.23's vocabulary and this is the seed, not the resolution.

## 11. Playtest pass (deliverable 6, §18.2's binding question)

"Which prior chapter taught each move this exercise requires?"

| Move | Taught in |
|---|---|
| Read a 20-node architecture and locate the application tier | 2.1, rebuilt from scratch in R1, extended in 3.17 and 3.18 |
| Add a component and wire it into an existing tier | 1.2 first, every Part 3 chapter since |
| Draw a `request-flow` edge into a database | 1.2, and every chapter with a data tier since |
| Recognize that the gateway routes by path and can route to more than one thing | 3.5, whose whole subject is the front door |
| Act on a Validate pass that reports nothing, and trust Submit's drift instead | 3.15 and 3.16, both of which shipped clean starters and said so in the brief |
| Know that the queue path and the bus path should be left alone | 3.17 and 3.18, which built them; the brief says so explicitly rather than relying on memory |
| Recognize that work with no caller needs somewhere outside the pool to live | **This chapter** (the new material, and it is load-bearing per §11.4 - nothing already on the canvas can be rewired to produce a trigger, because nothing on it starts by itself) |

No move is unaccounted for. The two genuinely new judgments - that a trigger
decides a shape, and that a schedule cannot live inside something that scales -
are the chapter's own thesis, which is §11.4's "barely solvable with the newest
material" condition met rather than dodged.

## 12. Items flagged for a second pass

- **Word count against the 25-minute estimate.** About 2,030 prose words
  excluding the walkthrough's prop literals, the Mermaid block and table cells,
  against §14's and `manifest.ts`'s 25 minutes. 3.17 and 3.18 both ran ~2,150 at
  35 minutes, so this chapter is above their rate. A density revision pass was
  run as a distinct round and cut roughly 20% (a six-sentence cold open to
  four, two trade-off paragraphs, the 1000x paragraph, the interview lead-in,
  the transition brief and the Next). What is left is close to the floor for a
  §6-complete Building Block chapter: the fifteen mandatory sections alone
  account for roughly 1,300 words before any of the two components' mechanics.
  **The call a reviewer owes**: either §14's and `manifest.ts`'s estimate moves
  to 30 minutes for this chapter, or a mandatory section gets cut here with
  written justification. Not resolved unilaterally - `estimatedMinutes` is a
  §14 row value, and CURRICULUM.md edits belong in their own commit.
- **Two Start badges on the Debrief diagram.** First authored chapter whose
  reference graph declares two entry points. `ReferenceGraphCanvas` ranks
  columns from `entryPointIds`, so a reviewer should look at whether the Cron
  Job lands in the leftmost column beside the browser (correct - it is a
  trigger) or somewhere that reads as a stray. Nothing in the gate covers where
  it lands, only that it is reachable.
- **A five-deep application column in the reference graph.** The reference graph
  places the two new cards at y=480 and y=640 under the pool, which is five rows
  in one column. The starter graph is unaffected (four rows, inside the gate's
  ceiling), and `authoring-invariants.test.ts`'s row gate only reads
  `starterGraph` - but the Debrief diagram will be taller than any shipped so
  far, and the gateway-to-function edge runs down past two cards.
- **The scheduled write goes straight to the primary.** Defended in §4's
  omission 6 and disclosed in the lesson, but a reviewer should decide whether a
  chapter whose own Common Mistakes section says "the schedule triggers an
  enqueue" should then grade a build that does not. The alternative puts
  unrelated work on 3.17's notification queue, which the brief asks the learner
  to leave alone.
- **Coca-Cola's crossover figure is stated qualitatively.** The production
  section names that they modelled the request volume above which an always-on
  fleet is cheaper, without quoting the number. That is deliberate - the public
  figures are from a conference talk and are not worth asserting to a decimal in
  teaching prose - but §20.1 prefers concrete numbers, so a reviewer may want a
  sourced figure or a different example.
- **Two forward-referenced terms were caught in the self-check and removed.**
  The draft described the instance-id flag as "a hand-written leader election
  with one member" and had the senior answer end on "I want a lock before that
  happens". `leader`/`follower` are homed at 3.26 and `lock-service` at 3.23
  (§16), so both were ScaleCraft-taught vocabulary used inline before their home
  chapters, which §18.2 rule 1 and §20.5 forbid - and §10.3 separately requires
  the senior answer to be built only from vocabulary the chapter itself teaches.
  Both are now phrased in the chapter's own terms ("the rule that decides which
  instance is in charge"; "something that lets only one of them proceed"). The
  concepts are still reachable - Connections teases 3.23 explicitly - but the
  labels are not spent here. Recorded because the terms are natural enough in
  this material that a later revision could reintroduce them without noticing.
- **No new open decisions raised.** Decision 5 gained an eighth instance
  (nuggets), decision 11 gained one (the three ungated config fields), decision
  15's Group E row is now fully checked and closed, and decision 14 was **not**
  hit for the first time in Group E - this chapter's failure diagram is Mermaid
  by design rather than a walkthrough working around a missing faulted state.
