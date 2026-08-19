# Chapter spec - 2.1 From Browser to Backend

Authored under CURRICULUM.md §5 (chapter blueprint), §6 (mandatory sections),
§20 (author instructions). Deliverable 1 of the 6 in pending-content.md's
"Per-chapter deliverables". Lives beside the lesson so a reviewer can check the
prose against the intent that produced it.

- Chapter definition: `src/content/chapters/index.ts`
  (`bb-2-1-from-browser-to-backend`)
- Lesson body: `public/content/chapters/bb-2-1-from-browser-to-backend.mdx`
- Manifest row: `src/curriculum/manifest.ts`, slug `2-1-from-browser-to-backend`
  (`chapterDefinitionId` repointed from `null` in this change)

---

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Trace one request from a typed URL to the database and back, naming every stop in order, so each Part 3 component later installs itself at an address the learner already knows. |
| Type | Concept |
| Difficulty | foundational |
| Estimated time | 20 minutes (Reader + walkthrough + knowledge check; no build - see §4). |
| Prerequisites | 1.3 Defending the Design. 1.4 is optional and gates nothing, per `manifest.ts`'s own inline comment. |
| Unlocks | 2.2, and through it the rest of Part 2. The stop table is also the motivational spine of Group A (3.1-3.5). |
| Building blocks introduced | None. §16 assigns Part 2 no components; every stop on the tour is homed in 3.1-3.5. |
| Stages trained | Stage 3 (the spatial map, §1.4). |
| Interview relevance | Medium - step 4 fluency (§14's own row). "Walk me through a request" is the standard way into high-level design. |
| Production relevance | The stop list is the first thing anyone reaches for when triaging where a slow or failing request actually broke. |

## 2. Learning objectives (§5.2)

Five objectives. Practical omitted, the same justified Concept-chapter carve-out
0.2, 0.3 and 0.4 used - no components introduced, no construction-family
exercise.

1. **Knowledge** - Name the stops a request passes through from browser to
   database and back, in order.
2. **Knowledge** - State which phases finish before application code runs, and
   why DNS is not on the request path.
3. **Engineering** - Decide where TLS should terminate for a given system,
   naming what that choice buys and spends.
4. **Interview** - Answer "walk me through what happens when a user loads the
   page" as an ordered route rather than a diagram.
5. **Communication** - Name which stop of the journey a follow-up question is
   aimed at, and answer at that stop.

Each objective is exercised: 1 by the walkthrough + "Every stop, and who owns
it" + quiz Q1; 2 by "Resolve, connect, exchange" + "Before your code runs" +
quiz Q2/Q3; 3 by "Where TLS ends" + quiz Q4/Q5; 4 by "In an interview" and its
§10.3 senior-answer line; 5 by the same section plus the stop table, which is
what makes "which stop is this question about" answerable at all.

Two Knowledge objectives rather than one: the chapter's whole job is the map,
and "knows the stops" and "knows which of them run before your code" are
separately testable and separately missed.

## 3. Per-beat outline (§5.3, Concept type per §6)

| Beat | Section in the lesson | Notes |
|---|---|---|
| 1-2 Cold open / why this exists | Untitled opening, 2 paragraphs | An interviewer asks a candidate to walk through a request; the candidate starts at the app server and is stopped with "how did the request find your app server?" The failure is that 1.2's three boxes start one step too late, which is the chapter's thesis stated as a scene. The second paragraph converts it into the stakes: almost every Part 3 component installs itself along that one hidden arrow. |
| 3 Think first | "Think first" callout | Prediction prompt with a deliberately surprising answer: how many separate systems does a request touch before your app server sees it? |
| 4 Mental model | "Resolve, connect, exchange" opening paragraph | The one-sentence anchor is a three-phase sequence, and the payload is that the first two phases finish before application code runs - which is precisely why they are invisible on a diagram that starts at the app server. No external analogy; §5.3 marks the analogy "where honest", and the phase names are already the clearest frame for themselves (0.3/0.4 precedent for declining a forced metaphor). |
| 5 Visual explanation | `<Walkthrough>`, same section | Six-step trace, browser -> DNS (control) and browser -> reverse proxy -> app server -> SQL database (request-flow). Authored as a `<Walkthrough>` rather than a static diagram because §7.2 names "a request tracing a path" as exactly the case the component exists for - and because this realizes §14's "follow a simulated token through a presented graph" without a canvas simulator (see §5 below). Captioned per §7.2/§20.3 on the one thing to notice: the DNS edge is a different kind of edge. |
| 6 Core mechanics | "Every stop, and who owns it" | Nine-row table (stop / what it does / where you build it). This table *is* the spatial map §1.4 asks Part 2 for, and it carries most of the chapter's density by design. The paragraph under it applies §9 lens 9 (a two-person startup has five of the nine rows; the other three appear only when a specific force does), and the closing paragraph names "the edge" as the segment Group A spends five chapters on. |
| 7 Internal mechanics | "Before your code runs" | The one level down that §20.2 asks for, on the two phases the learner has just been told they ignore: resolution is usually free because TTL-cached answers mean it usually does not happen (cost: a DNS change is never instant), and connecting is priced per connection rather than per request (cost: handshake round trips, which is why connections are reused). Both are decision-relevant; neither is a networking lecture. Closes with the honest compression note (§20.2, and `pending-chapters.md` open decision 10's "state it in the prose, not only in `simplifications`"). |
| 8 Trade-offs | "Where TLS ends" | Where TLS terminates, with both sides costed in a two-row table, then resolved through 1.3's X/Y/Z reflex and its own reversal condition. Genuinely two-sided: the answer flips the moment the internal network stops being trustworthy, which is also what quiz Q5 tests. |
| 9 Failure modes | omitted | Optional for Concept (§6), and declared in §4 below - 2.2 is the failure-first pass over this exact journey. |
| 10 Scaling | omitted | Optional for Concept (§6), and declared in §4 below - 2.3 owns the evolution story. |
| 11 Production examples | "In production" | Two, per §13's decision-not-company rule. Cloudflare: customers move the resolve and connect phases into someone else's network, accepting a third party in every user's path. Google/QUIC: connection setup dominated on mobile links, so the handshakes were collapsed, at the cost of needing every intermediary to support it. Both map onto the chapter's own two halves rather than introducing a third frame. |
| 12 Common mistakes | "Common mistakes" | Four: starting the walk at the app server (the cold open's own failure), treating DNS as on the request path (stated as the concrete drawing error it produces, not as a restatement of the diagram caption), thinking the edge is one box, and assuming the response takes a different route home. |
| 13 Interview lens | "In an interview" | Medium relevance, so it stays compact: what the question is actually testing (order fluency, because every follow-up attaches to a stop), then the mandatory §10.3 senior-answer line, built only from this chapter's vocabulary plus 1.1's read:write ratio, and ending by proposing the next deep dive as §10.3 requires. |
| 14 Connections | merged into "Next" | Backward: 1.2 (the arrow this chapter opens up), 1.3 (the trade-off reflex, used on TLS termination), 0.4 (loop step 4). Three explicit backward connections, over §19's >=2. |
| 15 Recap + knowledge check | "Recap" | Five retrieval anchors; QuizLauncher renders the knowledge check automatically. |
| 16 Transition brief | "Your turn" | States there is no build, that no component reached the palette, and that the trace is the exercise - split across the walkthrough and the knowledge check. Same no-build pattern 0.2/0.3/0.4 established. |
| Preview of next | folded into "Next" | Previews **2.2 Where Can Things Go Wrong?** with real pull: every one of the stops just learned can fail, and most fail as the same thing from the user's side. Verified against `manifest.ts` - 2.2 is the immediate next row, `prerequisiteSlugs: ["2-1-from-browser-to-backend"]`. Exactly one forward tease (§19); the further-out pointers to 3.1-3.5 live inside the stop table as its own "where you build it" column, which is the table's function rather than a second tease. |

## 4. Declared omissions and justifications (§6's written-justification rule)

- **No construction-family exercise (build/completion/fix).** Same exception
  0.2, 0.3 and 0.4 recorded (§11.1): no components are introduced (§16 assigns
  Part 2 none), so there is nothing to build with that would not be a forward
  dependency. `availableComponentIds`/`requiredComponentIds` are both `[]`, no
  `starterGraph`, `blueprints: []`, `hasEditorExercise: false`.
- **Failure modes (beat 9) - omitted.** Permitted outright for Concept
  chapters by §6, and here it is load-bearing rather than convenient: 2.2 is
  defined by §14 as walking this identical journey failure-first ("every hop is
  a failure point; timeouts, partial failure, and the meaning of 'the site is
  down'"). Authoring failure modes here would consume the next chapter's entire
  reason to exist and blunt the preview that closes this one. The relevant bank
  questions (QUIZ_FRAMEWORK §7 Q3, Q4, Q6, Q10) are all tagged 2.2 and are
  deliberately left for it.
- **Scaling behavior (beat 10) - omitted.** Also permitted for Concept by §6.
  §14 assigns the scaling-evolution story to 2.3 ("one server -> tiers ->
  horizontal scale -> services"), and §7.1 homes the scaling-evolution diagram
  there too. Part 2's three chapters split cleanly: 2.1 the path, 2.2 the
  failures, 2.3 the evolution.
- **No everyday analogy in the mental-model beat.** §5.3 marks the analogy
  "where honest". Resolve/connect/exchange is already a plain-language frame
  for itself, and the obvious candidates (postal addressing, phone calls) all
  break down at the point the chapter actually cares about - that the first two
  phases are invisible to the application. 0.3 and 0.4 declined for the same
  reason.
- **§12's nugget devices (Interview / Production / Engineering nuggets) -
  omitted, declared.** This is the fourth chapter to do so and the third to
  declare it (0.2's Opus pass raised it, 3.4's declared it in its own spec §4).
  The equivalent content is carried inline: lens 9 in the stop-table paragraph,
  lens 1 throughout the "why this stop exists" column, the interview register
  in its own section. See `pending-chapters.md` open decision 5, which is now
  overdue rather than upcoming.

## 5. `<Walkthrough>` as this chapter's exercise, and what it replaces

§14's 2.1 row gives the exercise as "trace - order the stops, then follow a
simulated token through a presented graph." The second half of that has been
hitting `pending-content.md`'s named degradation path in every chapter that
asked for it (open decision 7 in `pending-chapters.md`: 1.6, 1.7 and 3.4 all
promised a simulator trace and shipped without one). This chapter does not
degrade it to a quiz question. It ships the trace as a real, steppable
`<Walkthrough>` in the lesson body - a presented graph with a token the learner
advances stop by stop, which is what the row actually asked for, just rendered
in the Reader rather than by a canvas simulator.

That is a genuine partial resolution of open decision 7 for trace-shaped
exercises specifically, and worth recording as such: release 5.1.0-alpha's
diagram pipeline landed the capability, and 2.1 is the first chapter whose §14
row it directly satisfies. It does *not* resolve the predict-then-check
simulator beats 1.7 and 3.4 wanted, which need a different mechanism.

The "order the stops" half is the quiz's `ordering` question (Q1), the same
realization 0.4 used for its own ordering exercise.

**§7.2's draw-a-topology-once rule.** The lesson body contains exactly one
diagram of this topology, the `<Walkthrough>`, and no static Mermaid twin.
Quiz Q3 renders a *different*, fuller graph (it adds a firewall between browser
and proxy) via `ReadOnlyGraphSummary`, which is assessment rather than a second
lesson diagram; the difference is deliberate rather than incidental, so the two
never read as the same picture maintained twice.

## 6. Component budget (§16)

None introduced. `availableComponentIds: []` - the palette is untouched and
nothing this chapter shows is buildable by the learner.

The lesson and quiz nonetheless *present* seven components the learner has not
unlocked (`browser`, `dns`, `firewall`, `reverse-proxy`, `load-balancer`,
`api-gateway`, plus `app-server`/`sql-database` which 1.2 already homed). This
is not an exception being carved: it is §14's Part 2 header, which states that
"presented diagrams use components the learner hasn't unlocked yet - explicitly
labeled as a guided tour," and §18.2 rule 2, which names Part 2's guided tour as
"the one sanctioned larger exception" to the one-forward-reference limit. The
lesson discharges the labeling requirement explicitly, in the paragraph
immediately before the walkthrough ("What follows is a tour... none of them is
on your palette yet"), and the stop table's third column names the owning
chapter for every row.

**The `control` edge kind, added by the Opus pass (2026-08-18).** §16's audit
homes edge kind `control` in 3.4, and this chapter both draws one (the
browser-to-DNS edge) and explains what it means. That is a second forward use
alongside the seven components, and the draft did not account for it. It is
covered by the same Part 2 sanction - a presented diagram is not a palette, and
the edge kind is part of what the diagram presents - but it goes further than
the components do, because the chapter *teaches* the distinction rather than
only showing it, and the quiz tests it (Q3). Declared here rather than left
implicit. The prose stays: "DNS is beside the request path, not on it" is this
chapter's own thesis and the `control` edge is how the diagram states it.
Consequence for Group A: 3.4 currently introduces `control` as new, and once
Group A lands it should reframe as "the edge kind you met in 2.1, now with a
real job" - and §16's audit row should say so. Recorded as an open decision in
`pending-chapters.md`.

Consequence worth flagging for whoever authors Group A: this chapter has now
pre-committed a one-line job description for `firewall` (3.1), `browser`/`dns`
(3.2), `reverse-proxy` (3.3), `load-balancer` (3.4) and `api-gateway` (3.5).
3.4 already exists and its framing (one address, many identical backends,
health-checked) matches the row written here, and was re-verified against
`bb-3-4-load-balancer.mdx` in the Opus pass. The other four should be checked
against this table when they are authored rather than diverging from it
silently.

## 7. Validation rules (deliverable 4)

None authored, none needed. `validationRuleIds: []` - there is no graph to
validate.

## 8. Quiz (deliverable 5)

Five questions, ids permanent. Ramp 1/1/2/2/3, matching 0.2's, 0.3's and 0.4's
convention (2 level-1, 2 level-2, 1 level-3 of 5 rounds to QUIZ_FRAMEWORK §3's
rough 30/45/25). This is an ordinary chapter, not a condensed one, so §2's 3-6
range applies rather than the 10-15 exception 1.1-1.3 used.

QUIZ_FRAMEWORK §7 tags exactly four of its ten bank questions to 2.1 (Q1, Q2,
Q5, Q9); the other six are 2.2's and 2.3's. All four are used here, reworked
rather than copied:

| This chapter | Bank source | What changed |
|---|---|---|
| Q1 `ordering` | §7 Q1 | Collapsed to five stops from the bank's six-item prose list, so the options stay inside §2's "4-6 items" ceiling and each option is a stop the lesson's own table names. |
| Q2 `single` | §7 Q2 | Distractors rewritten to be real positions rather than the bank's sketch: a load balancer's job and a CDN's job, both of which are genuinely confused with DNS and both of which the learner will meet later. |
| Q3 `diagram` | §7 Q5 | Same insight (why the DNS edge is `control`), different graph - a firewall is added so the quiz graph is not a duplicate of the lesson's walkthrough topology (see §5). Distractors rewritten to name specific misreadings of what an edge kind *is*. |
| Q4 `single` | §7 Q9 | Reframed from "where does TLS typically terminate" (recall) to "what is the strongest reason for putting it there" (judgment), per §1's reasoning-over-recall rule. |

Q5 is original and carries the level-3 slot: a scenario where the trusted
internal network the chapter's own trade-off depended on stops being
trustworthy, answered with 1.3's reflex. Two of its four options reach the
right *conclusion* and only one gets there by the right reasoning, which is
what makes it a level 3 rather than a second level 2.

**Position-clustering check** (the bug 0.1/0.2 shipped once, see
`pending-chapters.md`). Four lettered questions (Q2, Q3, Q4, Q5 - Q3 is
`diagram`-kind, which `evaluate.ts` grades as single-select and
`DiagramQuestion.tsx` renders through `SingleChoice`, so it counts). Correct
options sit at c, a, d, b - four distinct positions. Also checked across
siblings per the chapter-author skill's cross-chapter note: 0.4, 1.3, 1.4 and
3.4 all put their Q1 answer at "b", so this chapter's first lettered question
deliberately does not.

Q1's `options` array is a full derangement against `correctOrder`
(`dns, tls, edge, app-server, database` vs. an authored order of
`database, app-server, dns, edge, tls` - no option sits at its own correct
index). `Ordering.tsx` renders `options` in exactly the authored order with no
shuffle, so anything less would ship pre-solved.

Scope check: every question draws on 2.1's own material plus 1.2 (the app
server as the only path to the database), 1.3 (the trade-off reflex and its
five dimensions) and 0.4 (loop step 4). Nothing requires 2.2, 2.3 or any Part 3
chapter - where a later component is named in a distractor (load balancer in
Q2, CDN in Q2), it is named as the wrong answer with its home chapter cited,
never as knowledge the learner needed in order to answer.

## 9. Playtest pass (deliverable 6, §18.2's binding question)

*"Which prior chapter taught each move this exercise requires?"*

| Move | Taught by |
|---|---|
| Read a request-flow topology and follow a path through it | 1.2, which built exactly this shape on canvas and drew it in its own lesson |
| Know that the app server is the only component that reaches the database (needed to place the last two stops in Q1) | 1.2, directly and as a validation rule the learner has already tripped |
| Step through a `<Walkthrough>` (advance/rewind controls) | New format this chapter for a Part 0-2 learner - 3.4 is the only prior chapter with one and it is not on this prerequisite chain. The controls are self-describing and the diagram is explicitly decorative reinforcement (captions carry the content, per the component's own accessibility contract), so a learner who never touches the controls loses nothing. Same bar 0.3/0.4 applied to their own first-appearance question formats |
| Answer an `ordering` quiz question | 0.4 introduced the format and this chapter's prompt restates the mechanic |
| Answer a `diagram` quiz question | 1.2 shipped the first ones (its Q2 and Q4); the format is not new on this chain |
| Read an edge `kind` off a diagram and reason about what it means (Q3) | 1.2 taught that edge kind is semantic and that `no-direct-client-database` ignores the label; this chapter's walkthrough caption then names the `control` edge before the quiz asks about it |
| Apply the X/Y/Z trade-off statement and the five spend dimensions (Q4, Q5) | 1.3, directly, and re-exercised in this chapter's own "Where TLS ends" section before the quiz asks for it in a fresh scenario |
| Recognize that a changed premise invalidates a prior decision (Q5) | 1.3's "new evidence or only pressure" test, taught explicitly and applied here to a premise this chapter itself established |

No move is unsourced. The one first-appearance item (the `<Walkthrough>`
control strip) is a reading affordance, not a graded move.

## 10. Comparison to CURRICULUM §14's own row

2.1's row: "Purpose: trace DNS resolution, connection, TLS (conceptually), the
edge, the app tier, the database, and back. New: none (tour). Assumes: Part 1.
Prepares for: every Core Infrastructure chapter, which re-visits one stop each.
Interview: Medium: step 4 fluency. Exercise: trace - order the stops, then
follow a simulated token through a presented graph. Est: 20."

The shipped chapter matches the row, including the exercise, which is the first
time a §14 "simulated token" promise has been met rather than degraded (see §5).
"TLS (conceptually)" is honored literally: TLS appears as a phase that secures
the channel and as a termination-point decision, with handshake internals
declared out of scope in both the prose and `curriculumContext.simplifications`.

One divergence to note rather than reconcile: the row says "Assumes: Part 1,"
while `manifest.ts` lists only `1-3-defending-the-design` as the prerequisite,
because 1.4 is optional and gates nothing (its own inline comment says so). The
chapter is authored to assume 1.1-1.3 and nothing from 1.4, so both readings
hold.

## 11. Note for the Opus pass

Not yet run - this is the Sonnet draft only. Four things worth a cold reader's
attention:

- **Prose word count is 1727** (`wc -w` with the `<Walkthrough>` prop block
  excluded; 2023 including it), against a 20-minute estimate. That is above
  0.4's 1102 for 15 minutes and close to 1.2's 1755 for 25. A density pass was
  run as a distinct step and cut roughly 65 words, most of it by converting the
  TLS trade-off from four paragraphs into a two-row table and tightening both
  production examples to §13's two-sentence norm. If a reviewer wants more out,
  the first places to look are "Before your code runs" (the densest prose
  section, and the most cuttable if TTL mechanics are judged over-depth for a
  tour chapter) and the stop table's fourth column of prose beneath it - not
  the table itself, which is the chapter's actual payload.
- **The stop table pre-commits job descriptions for five unwritten chapters**
  (see §6). Worth confirming each one-liner is defensible as the framing 3.1,
  3.2, 3.3 and 3.5 will actually want, since diverging later is more expensive
  than fixing a table row now.
- **The tour label carries a lot of weight.** §18.2 rule 2 sanctions Part 2's
  forward references only because the chapter labels itself. That label is one
  paragraph, before the walkthrough. Worth checking it is prominent enough to
  do the job it is being credited with, and that no later section quietly
  assumes a tour component as taught.
- **Failure modes are omitted on the argument that 2.2 owns them**, and the
  "Next" section's pull depends on that being true. If a reviewer judges any
  part of this chapter to have already spent 2.2's material, that is a real
  finding, not a style note.

---

## 12. Opus proofread pass (2026-08-18)

Second-opinion editorial pass over the Sonnet draft, scoped to the six areas in
the chapter-author contract (content, content-structure, blueprints,
component-lists, submit validations, diagrams). Quiz, hints and the
`problemStatement`/`learningObjectives`/`curriculumContext` fields were left
untouched by instruction. No pipeline run (content-only pass). Structure and
voice kept; seven changes, all defects rather than preference.

**Claims about the curriculum's own shape (three, the material findings):**

1. **"Almost every component in Part 3 installs itself somewhere along that
   arrow."** False, and it is the cold open's stakes sentence. Group A lives on
   or beside the client-to-app-server arrow; Groups B-G (compute, data,
   caching, async, storage, reliability) hang off the far end of it. Rewritten
   to say exactly that, which is still a strong claim and is now a true one.
2. **"Group A of Part 3 is nothing but that segment, one chapter per stop."**
   Contradicted by the chapter's own thesis two paragraphs earlier: 3.2 (browser,
   DNS) is a Group A chapter and DNS is beside the request path, not on it. 3.1
   is Networking Fundamentals, broader than one stop. Rewritten to "3.1 and 3.2
   on the perimeter and the resolve phase that precedes it, then 3.3, 3.4 and
   3.5 walking the edge itself" - same payoff, accurate.
3. **Stop table: "TCP + TLS handshake ... No chapter of its own."** §14 gives
   3.1 "TCP vs. UDP at concept level, TLS termination". The row now reads "Not a
   component - the connect phase, everywhere; 3.1 covers it", which keeps the
   distinction the row exists to make (it is a phase, not a box) without
   under-promising 3.1.

**Factual accuracy (two):**

4. **QUIC / HTTP-3 conflation.** "Google shipped QUIC, now standardized as
   HTTP/3" merges two things: QUIC is the transport (RFC 9000); HTTP/3 (RFC
   9114) is HTTP carried over it. Now "the transport that now carries HTTP/3".
5. **Handshake arithmetic.** "A TLS handshake costs one or two more [round
   trips]. On a 100 ms round trip that is a third of a second" quotes the
   two-round-trip (TLS 1.2) worst case as the figure after offering a range.
   Now "one more on TLS 1.3, two on 1.2 ... 200 to 300 ms", which is both
   correct and more decision-relevant (it names what upgrading buys).

**Register (two):**

6. **`recursive resolver` had no gloss.** §20.1 requires every unavoidable term
   of art to be defined at first use, once, and this one carries the paragraph's
   whole argument about where answers get cached. Added a one-clause gloss ("the
   DNS service that does the lookup on your behalf and caches the result"),
   deliberately not a paragraph on how DNS works - that is 3.2's.
7. **The Client-to-Browser card swap was silent.** 1.2 taught a `client` and the
   walkthrough shows a `browser` card, unremarked. One clause added to the tour
   paragraph. The same paragraph is what discharges §18.2 rule 2's labeling
   requirement, so it also picked up "where you build it yourself" to make the
   tour framing explicit rather than implied.

Plus: the "Your turn" paragraph was rewrapped to the file's 79-column prose
wrap (two lines had drifted to 81 and 93 in the draft's density pass) and
tightened by ~10 words.

**Checked and deliberately left alone:**

- **"Before your code runs" over-depth.** The draft named this as the first
  place to cut. Judged correct as written against §20.2: TTL caching, per-
  connection handshake cost and connection reuse are exactly one level of
  internal mechanics, not three, and each changes a decision the learner makes
  (how fast a DNS cutover can be, why keep-alive exists, whether a TLS upgrade
  is worth it). Beat 7 is mandatory for Concept; cutting this would leave the
  chapter with no internal mechanics at all. The paragraph that follows already
  names the two compressions honestly and defers the deeper one to 3.2.
- **Length.** 1804 prose words after the pass (2100 including the
  `<Walkthrough>` prop block), up from the draft's 1727 - the gloss and the
  Client/Browser bridge cost more than the "Your turn" tightening returned.
  This is at the top of the budget for 20 minutes but not padded: 1.2 is 1755
  words for 25 minutes, but a third of those 25 minutes is canvas work, so 2.1
  is the heavier *read* of the two. Every §20.6 sweep found sentences that
  introduce, clarify or reinforce. If a later pass must cut, cut prose, not the
  stop table.
- **Failure modes.** No section spends 2.2's material. "Common mistakes" is
  four map-reading errors, not failures; the only failure mention in the whole
  chapter is one clause on Cloudflare's own outages, which is a trade-off cost
  attached to a production example. The "Next" tease is intact and unearned by
  anything above it.
- **Diagram, mechanically.** Read against `walkthrough/types.ts`,
  `normalize.ts` and `layout.ts` rather than by running the suite. All five
  node ids and four edge ids resolve; every `focus`/`highlightNodeIds`/
  `highlightEdgeIds` reference is declared; six steps clears the two-step
  minimum; the longest caption is 157 of `CAPTION_MAX_CHARS` 220; each caption
  names its highlighted node or edge in prose, which the `aria-hidden` diagram
  requires; no `request-flow` cycle; every `componentId` is in the registry and
  every caption uses the registry's own label ("Reverse Proxy", "Application
  Server", "SQL Database"). Auto-layout puts `dns` in column 0 beside `browser`
  (it touches no `request-flow` edge, so `firstNeighbor` places it), which is
  the intended "beside the path" read. Edge kinds are semantically right.
- **Caption placement.** The §7.2 caption sits *after* the walkthrough here and
  *before* it in 3.4. Left as-is: §8.1 wants the diagram before the prose that
  explains it, so 2.1's order is if anything the better of the two. Noted so
  the divergence is deliberate.
- **`blueprints: []`, `availableComponentIds: []`, `requiredComponentIds: []`,
  `validationRuleIds: []`, `hasEditorExercise: false`.** All correct. No
  components are introduced (§16 assigns Part 2 none), so there is nothing to
  build with that would not be a forward dependency, and with no graph there is
  nothing for a rule to check - confirmed against
  `src/validation-engine/rules/index.ts`, whose ten rules all require a graph.
  §16 wants no declared exception for the empty palette: the palette is
  genuinely empty and §14's Part 2 header sanctions the presented tour. Unlike
  0.1's scenery components, nothing here is placed on a canvas.
- **Section order and beats.** Matches §5.3 and the house pattern 0.2/0.4/1.3/
  3.4 all use (production, mistakes, interview, recap, your turn, next), with
  beat 14's connections folded into "Next". Three backward references (1.2, 1.3,
  0.4) against §19's minimum of two, each verified taught on this prerequisite
  chain: 1.3 teaches the X/Y/Z statement and the five spend dimensions, 1.1 the
  read:write ratio, 0.4 that step 4 is high-level design, 1.2 the three-box
  shape and the app-server-only-path-to-the-database rule.
- **"Next" previews 2.2 Where Can Things Go Wrong?** Verified against
  `manifest.ts`: 2.2 is the immediately following row and its
  `prerequisiteSlugs` is `["2-1-from-browser-to-backend"]`. This is the bug 0.2
  shipped once; it is not present here.
- **Stop table rows for the five unwritten Group A chapters.** Each checked
  against §14's own row. 3.4's ("spreads requests across identical app-server
  instances") re-verified against the authored `bb-3-4-load-balancer.mdx`, whose
  thesis is "one address, many identical backends" - it matches. 3.1, 3.2, 3.3
  and 3.5 match §14's purpose lines. The one under-promise found (TCP/TLS vs.
  3.1) is fix 3 above.

**Out of scope, noted not fixed** (quiz, hints and
`problemStatement`/`learningObjectives`/`curriculumContext` were off-limits by
instruction; both of these are notes for a later pass, not defects found and
left):

- Quiz Q1 lists "The edge accepts the request and forwards it inward" as one
  orderable stop, while the lesson's own "Common mistakes" says the edge is a
  segment several components share rather than one box. Defensible - the
  ordering question needs one item per phase, not one per component - but the
  two readings sit close enough together that a later pass may want the option
  label to say so ("the edge - whatever sits there - accepts the request").
- `curriculumContext.notYetIntroducedConcepts` lists the load balancer (3.4) as
  not yet introduced. True in curriculum order, but 3.4 is authored today and
  its `prerequisiteSlugs` points at 1.2, so a learner reaching 2.1 may already
  have done it. Harmless (the entry only under-claims what the learner knows)
  and it self-corrects when Group A lands and 3.4's prerequisite reverts to
  3.3, per `manifest.ts`'s own inline comment.
