# Chapter spec - 2.2 Where Can Things Go Wrong?

Authored under CURRICULUM.md §5 (chapter blueprint), §6 (mandatory sections),
§20 (author instructions). Deliverable 1 of the 6 in pending-content.md's
"Per-chapter deliverables". Lives beside the lesson so a reviewer can check the
prose against the intent that produced it.

- Chapter definition: `src/content/chapters/index.ts`
  (`bb-2-2-where-can-things-go-wrong`)
- Lesson body: `public/content/chapters/bb-2-2-where-can-things-go-wrong.mdx`
- Manifest row: `src/curriculum/manifest.ts`, slug
  `2-2-where-can-things-go-wrong` (`chapterDefinitionId` repointed from `null`
  in this change)

---

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Walk 2.1's request path a second time, breaking it at each stop, so the learner can predict what a user experiences from any given failure and name which failures their own monitoring cannot see. |
| Type | Concept |
| Difficulty | foundational |
| Estimated time | 20 minutes (Reader + walkthrough + knowledge check; no build - see §4). |
| Prerequisites | 2.1 From Browser to Backend. |
| Unlocks | 2.3, and through it Part 3. The failure vocabulary here is what Group G (3.23-3.26) later supplies machinery for. |
| Building blocks introduced | None. §16 assigns Part 2 no components; the lesson re-presents 2.1's five. |
| Stages trained | Stage 3 (the spatial map, §1.4), now read for failure rather than for structure. |
| Interview relevance | High - step 6, bottlenecks and failure (§14's own row). "What happens if X fails?" is the standard form. |
| Production relevance | This is the triage reflex: a report of "down" is converted into a claim about a segment of a path, for a set of users, before anyone touches a server. |

## 2. Learning objectives (§5.2)

Five objectives. Practical omitted, the same justified Concept-chapter carve-out
0.2, 0.3, 0.4 and 2.1 used - no components introduced, no construction-family
exercise.

1. **Knowledge** - Name what a user experiences when each stop on the request
   path fails, and which of those failures your own monitoring cannot see.
2. **Knowledge** - State why a client that times out cannot know whether its
   request succeeded.
3. **Engineering** - Choose a timeout for a given hop, naming what a shorter or
   longer one buys and spends, and why the budget shrinks inward.
4. **Interview** - Answer "what happens if X fails?" as a symptom, a blast
   radius and a detection path rather than a component name.
5. **Communication** - Translate a user report of "the site is down" into a
   specific claim about which segment of the path failed, and for whom.

Each objective is exercised: 1 by the `<Walkthrough>` + "Errors, hangs, and
disagreements" + quiz Q1/Q2; 2 by "How long until you find out" + quiz Q4; 3 by
"How long to wait" + quiz Q5; 4 by "In an interview", its §10.3 senior-answer
line, and Q5's interview framing; 5 by the cold open, "Down is a claim about a
path", the think-first prompt, and quiz Q3.

Two Knowledge objectives rather than one, on the 2.1 precedent: "knows what
each failure looks like to a user" and "knows a timeout proves nothing about
the work" are separately testable and separately missed, and the second is the
one candidates get wrong.

## 3. Per-beat outline (§5.3, Concept type per §6)

| Beat | Section in the lesson | Notes |
|---|---|---|
| 1-2 Cold open / why this exists | Untitled opening, 2 paragraphs | Paged at 2am for "the site is down" with every dashboard green, because the DNS provider is out and the request never became your problem. This is the exact scene 2.1's closing tease promised ("starting with the one that fails before your infrastructure is ever touched"). Second paragraph converts it to stakes: roughly eight stops, several outside your monitoring, one phrase for all of them. |
| 3 Think first | "Think first" callout | Prediction attached to prior material (§8.4): name three stops on 2.1's path that produce "site is down" while your servers are healthy. Answered by the beat-6 table rather than immediately. |
| 4 Mental model | "Down is a claim about a path" | The one-sentence anchor: "down" describes a journey that did not complete, not a machine that stopped. Grounded concretely (two users, two paths, two different answers to "is it up"). No external analogy - see §4 below. |
| 5 Visual explanation | `<Walkthrough>`, same section | Six steps, one break point each, over 2.1's exact topology. The highlight convention is the failure device: each step lights only the segment the request actually traversed, so the lit prefix grows as the break moves inward and the dark remainder is the part that never hears about it. Captioned per §7.2 on precisely that. See §5 below for why this is a `<Walkthrough>` and what it does about the failure-diagram rule. |
| 6 Core mechanics | "Errors, hangs, and disagreements" | The taxonomy (three bullets) plus a seven-row table mapping break point -> what the user gets -> what you see. The third column is the chapter's sharpest point and gets its own payoff paragraph: the two failures users feel worst are the two you see least, because monitoring starts where traffic arrives (§9 lens 8). |
| 7 Internal mechanics | "How long until you find out" | The one level down §20.2 asks for, on timeouts: (a) a timeout is the end of your patience, not evidence about the work, which is where the "disagreement" row comes from; (b) budgets stack and must shrink inward, with an inverted-pair failure spelled out; (c) retries multiply, up to 27 queries from one request across three layers. All three are decision-relevant, and the remedy is explicitly deferred to 3.23 rather than half-taught. |
| 8 Trade-offs | "How long to wait" | Timeout length, both sides costed in a three-column table, resolved through 1.3's reflex with its reversal condition named (genuinely long work does not belong on the request path at all). Two defensible answers, which is what quiz Q5 turns on. |
| 9-10 Failure modes + scaling | "Partly down" (merged) | §6 permits merging adjacent sections. Partial failure in its two shapes (some users / some functionality), then the degradation choice as design work rather than fallback, then the §9 lens 7 scale answer: at one server up and down are the only states; at a hundred something is always broken and the question becomes what fraction, for which users. Beat 10 is carried by that closing paragraph rather than declared omitted. |
| 11 Production examples | "In production" | Two, per §13's decision-not-company rule, one per half of the chapter. Meta 2021: the routes to their own DNS servers were withdrawn, so healthy machines became unreachable, and internal tooling behind the same names removed paths to recovery. GitHub 2018: a 43-second fault left writes on both sides, and they chose a day of degraded service over a day of nothing. Both are public postmortem material, stated at decision level with no implementation detail. |
| 12 Common mistakes | "Common mistakes" | Four: reading "down" as a claim about your servers, monitoring only the stops you own, treating a timeout as a failure, retrying at every layer. Each phrased as the concrete error rather than as a restatement of its section. |
| 13 Interview lens | "In an interview" | High relevance, so it is fuller than 2.1's. What step 6's standard question is actually testing, the weak answer, the three-part shape of a strong one, then the mandatory §10.3 senior-answer line built only from this chapter's vocabulary (timeout, hang, ambiguity, saturation, DNS) and ending by nominating the failure worth going deeper on. |
| 14 Connections | merged into "Next" | Backward: 2.1 (the path), 1.2 (the app-server-only-to-database rule, reread as blast radius), 1.3 (the trade-off reflex, used on timeout length), 0.4 (loop step 6). Four explicit backward connections, over §19's >=2. |
| 15 Recap + knowledge check | "Recap" | Five retrieval anchors; `QuizLauncher` renders the knowledge check automatically. |
| 16 Transition brief | "Your turn" | No build, palette untouched, the exercise is prediction and it runs in two places (the walkthrough and the knowledge check). Same no-build pattern 0.2/0.3/0.4/2.1 established. |
| Preview of next | folded into "Next" | Previews **2.3 Evolution of Modern Architectures** with pull generated by this chapter's own material: every stop you just learned to distrust is a stop somebody chose to add, and nobody drew this shape on day one. Verified against `manifest.ts` - 2.3 is the immediate next row, `prerequisiteSlugs: ["2-2-where-can-things-go-wrong"]`. |

## 4. Declared omissions and justifications (§6's written-justification rule)

- **No construction-family exercise (build/completion/fix).** The same
  exception 0.2, 0.3, 0.4 and 2.1 recorded (§11.1): §16 assigns Part 2 no
  components, so there is nothing to build with that would not be a forward
  dependency. `availableComponentIds`/`requiredComponentIds` are both `[]`, no
  `starterGraph`, `blueprints: []`, `hasEditorExercise: false`.
- **No everyday analogy in the mental-model beat.** §5.3 marks the analogy
  "where honest". The path framing is already plain language for itself, and
  every obvious candidate (a road trip, a phone call, a posted letter) breaks
  down at the point the chapter actually turns on - that a request can complete
  on one side and fail on the other with neither side able to tell. 0.3, 0.4
  and 2.1 declined for the same class of reason.
- **§12's nugget devices (Interview / Production / Engineering nuggets) -
  omitted, declared.** Fifth chapter to omit, fourth to declare. The reasoning
  has not changed and this spec is not re-arguing it: a device whose value is a
  fixed placement cannot begin partway through the curriculum. The equivalent
  content is carried inline (lens 5 and 8 in the beat-6 table and its payoff
  paragraph, lens 7 in "Partly down", the interview register in its own
  section). See `pending-chapters.md` open decision 5, now overdue. Per that
  decision's own note, individual chapters should stop declaring this one by
  one; this is a pointer, not a fresh argument.
- **§19's "Interview lens sections name which RWE projects exercise this
  chapter's material" - omitted, declared.** No RWE project is authored
  (`rwe-dummy-1` is a placeholder shell), so naming one would be a forward
  reference to content that does not exist and cannot be checked. 2.1 omitted
  this silently; declaring it here is the change. Revisit when Tier 1 lands -
  this chapter's material is load-bearing in every project that has a failure
  discussion, which is all of them.

## 5. `<Walkthrough>` as this chapter's exercise, and the failure-diagram gap

§14's 2.2 row gives the exercise as "predict-the-failure on the 2.1 trace
('DNS fails - what does the user see?')". That is realized in two places, the
same split 2.1 used: the `<Walkthrough>` walks the prediction stop by stop, and
the knowledge check makes the learner produce it themselves (Q1 matching, Q2
and Q3 as scenarios).

**Why a `<Walkthrough>` rather than a static diagram.** §7.2 names "a request
tracing a path" as exactly what the component exists for, and this chapter's
content *is* one path examined at six different break points. A static diagram
can show one failure; showing six would be six diagrams of one topology, which
§7.2 forbids in the other direction.

**Why this is not the same topology drawn twice.** §7.2's once-rule is
per-chapter ("a chapter draws a given topology exactly once"). This chapter
contains exactly one diagram. That it is deliberately 2.1's topology is the
pedagogical point - the chapter's thesis is that the map the learner just built
is also a map of failure - and the lesson says so in its own words ("2.1's
journey again, broken one stop at a time").

**The failure-diagram gap, declared.** §7.2 requires that failure diagrams
"show the failure (crossed-out node, red path), not just the happy path with a
caption saying 'imagine this fails.'" `<Walkthrough>` has no failure state:
`WalkthroughStep` offers only `focus`/`highlightNodeIds`/`highlightEdgeIds`,
and `WalkthroughNodeCard` has no faulted variant - checked directly against
`src/chapters/walkthrough/types.ts` and `WalkthroughNodeCard.tsx`. There is no
way to cross out a node or redden a path today.

What was done instead of ignoring the rule: the highlight semantics were
inverted to carry failure information. Each step lights **only the segment the
request actually traversed**, so the break point is where the lit path stops
and the dark remainder is precisely the set of stops that never learn a request
was coming. The diagram caption names that convention explicitly, so it is
readable rather than inferred, and step 6 lights only the app server and
database to show work that happened with a browser that was never told. That is
a real visual encoding of the failure, not the happy path with a disclaimer -
but it is a workaround for a missing capability and is recorded as such.
**Raised as a new open decision in `pending-chapters.md`** (a faulted node/edge
state for `<Walkthrough>`), same class as open decisions 3 and 8: an engine gap
found by content, not a content decision.

## 6. Component budget (§16)

None introduced. `availableComponentIds: []` - the palette is untouched and
nothing this chapter shows is buildable by the learner.

The lesson re-presents the five components 2.1 toured (`browser`, `dns`,
`reverse-proxy`, `app-server`, `sql-database`) and names `firewall`,
`load-balancer` and `api-gateway` in the beat-6 table row for "the edge". This
is §14's Part 2 header ("presented diagrams use components the learner hasn't
unlocked yet - explicitly labeled as a guided tour") and §18.2 rule 2's
sanctioned larger exception, identically to 2.1. The labeling requirement is
discharged in the paragraph immediately before the walkthrough ("Same tour
rules as last chapter: nothing here is on your palette, and every stop is built
in its own Part 3 chapter").

**The `control` edge kind, second instance.** This chapter draws the
browser-to-DNS `control` edge again, which §16 homes at 3.4. It does *not*
re-teach the distinction: 2.1 taught it and this chapter simply uses it. Open
decision 13 in `pending-chapters.md` already covers the call this needs when
Group A is authored; this is a second use of an exception already declared, not
a new one.

**Forward references.** Exactly one marked further-out tease (Group G / 3.23,
named twice as the home of the remedies: once in "How long until you find out"
and once in the Connections beat, as the same pointer rather than two separate
teases), plus §6's mandatory preview-of-next to 2.3. Same shape 2.1 used.
3.25 and 3.26 appear in `curriculumContext.notYetIntroducedConcepts` for Deep
Check's benefit but are **not** named in the lesson body.

## 7. Validation rules (deliverable 4)

None authored, none needed. `validationRuleIds: []` - there is no graph to
validate.

## 8. Quiz (deliverable 5)

Five questions, ids permanent. Ramp 1/1/2/2/3, matching 0.2's, 0.3's, 0.4's and
2.1's convention (2 level-1, 2 level-2, 1 level-3 of 5 rounds to
QUIZ_FRAMEWORK §3's rough 30/45/25). Ordinary chapter, so §2's 3-6 range
applies rather than the 10-15 condensed-chapter exception.

QUIZ_FRAMEWORK §7 tags four of its ten bank questions to 2.2 (Q3, Q4, Q6, Q10),
all four deliberately left unused by 2.1. Three are used here; the fourth is
absorbed rather than authored.

| This chapter | Bank source | What changed |
|---|---|---|
| Q1 `matching` | original | Built from this chapter's own beat-6 table. Matching was chosen over a fifth single-choice because the chapter's core claim is a mapping (break point -> symptom) and the format tests it directly. |
| Q2 `single` | §7 Q3 | Level lowered from the bank's 2 to 1: within 2.2 this is the chapter's own opening scene rather than a cross-part inference. Distractors rewritten from the bank's sketch into real misconceptions - a retried lookup producing a slow page, a certificate warning without a connection, and DNS caching confused with page caching. |
| Q3 `single` | §7 Q6 | Kept at level 2. Distractors rewritten so each names a specific reason it would have been visible in your own metrics, which is the actual discriminator ("error rate zero" is the evidence, not the scenery). |
| Q4 `single` | §7 Q4 | Kept at level 2, reframed onto a concrete payment write with the two-second timeout the lesson itself used, so the question tests the chapter's own numbers rather than an abstract. Option D rewritten from the bank's "timeouts only happen on reads" to the sharper misconception that the database knowing the outcome means the outcome is known. |
| Q5 `single` | original | Level-3 slot. Interview-framed timeout-length judgment, which is the only question testing objective 3. |

**Bank Q10 ("which failure gives the worst user experience") is deliberately
not authored as a question.** As written it ranks four items with one obviously
correct answer, which §1's reasoning-over-recall rule makes a weak question,
and its insight is load-bearing elsewhere in this chapter: it is the reason
"How long to wait" resolves toward the shorter timeout, and it is Q1's fourth
option ("a long wait, then a timeout, with no explanation behind it"). Recorded
here so a later author does not read its absence as an oversight.

**Position-clustering check** (the bug 0.1/0.2 shipped once). Four lettered
questions (Q2, Q3, Q4, Q5 - Q1 is `matching` and has no letter position).
Correct options sit at d, b, a, c - four distinct positions. Checked across
siblings per the chapter-author skill's cross-chapter note: 0.4, 1.3, 1.4 and
3.4 all put their Q1 answer at "b" and 2.1 deliberately opened at "c", so this
chapter's first lettered question opens at "d", a fourth distinct position for
a chapter-opening answer.

Q1's `options` array is a full derangement against `pairs`: options are ordered
`fast-error, disagreement, silence, hang` while pairs resolve to `silence,
hang, fast-error, disagreement`, so no pair's correct option sits at that
pair's own index.

Scope check: every question draws on 2.2's own material plus 2.1 (the path and
that resolution precedes connection), 1.2 (the app server as the only route to
the database) and 1.3 (the trade-off reflex). Nothing requires 2.3 or any Part
3 chapter. Where later material is adjacent (retry machinery in Q5's option B),
it appears only as a wrong answer whose explanation says why, never as
knowledge needed to answer.

## 9. Playtest pass (deliverable 6, §18.2's binding question)

*"Which prior chapter taught each move this exercise requires?"*

| Move | Taught by |
|---|---|
| Read a request path and know the order of its stops | 2.1, directly - this chapter uses the identical topology |
| Know that resolution completes before any connection exists (needed for Q2) | 2.1's "Resolve, connect, exchange" and its own quiz Q2 |
| Know that DNS is beside the path, not on it, and read a `control` edge (walkthrough step 1) | 2.1, taught explicitly in its walkthrough caption and tested in its quiz Q3 |
| Know that only the app server reaches the database (needed to place the fast-error row in Q1) | 1.2, directly, and as a validation rule the learner has already tripped |
| Apply the X/Y/Z trade-off statement and weigh two defensible answers (Q5) | 1.3, directly, and re-exercised in this chapter's "How long to wait" before the quiz asks for it |
| Answer a `matching` quiz question (Q1) | 0.2 shipped the first two (its Q2 and Q3); the format is not new on this chain |
| Step through a `<Walkthrough>` | 2.1, the immediate prerequisite, which introduced the format on this exact chain |
| Recognize step 6 of the Interview Loop as this chapter's home (interview lens) | 0.4, which taught all eight steps by name |

No move is unsourced, and unlike 2.1 there is no first-appearance item at all -
2.2 inherits every format its prerequisite already introduced.

## 10. Comparison to CURRICULUM §14's own row

2.2's row: "Purpose: revisit the same journey failure-first: every hop is a
failure point; timeouts, partial failure, and the meaning of 'the site is
down.' Prepares for: 1.2's ceiling-finding skill applied spatially; the
Reliability group. Interview: High: step 6. Exercise: predict-the-failure on
the 2.1 trace ('DNS fails - what does the user see?'). Est: 20."

All three named topics are present and each has its own home in the lesson:
timeouts in "How long until you find out" and "How long to wait", partial
failure in "Partly down", and the meaning of "down" in the mental-model beat
and the cold open. The exercise matches (see §5). Interview relevance is
treated as High, which is why the interview lens is fuller than 2.1's.

Two notes rather than divergences:

- **The row has no "Assumes" or "New" field**, unlike its neighbours. Read as
  Part 2's part-level defaults (assumes the prior chapter, introduces nothing),
  which is what `manifest.ts` already encodes: `prerequisiteSlugs:
  ["2-1-from-browser-to-backend"]`.
- **2.1's closing tease says 2.2 "walks this exact path again, backwards".**
  Taken literally that would mean reverse order, which contradicts the same
  sentence's next clause ("starting with the one that fails before your
  infrastructure is ever touched" - DNS, the *first* stop). This chapter
  follows the explicit clause and walks the path in forward order, starting at
  DNS. "Backwards" is read as failure-first rather than as reverse-order, which
  is also how §14 phrases it ("revisit the same journey failure-first"). No
  edit made to 2.1; the reading is consistent with both documents and only the
  one word is loose.

## 11. Note for the Opus pass

Not yet run - this is the Sonnet draft only. Five things worth a cold reader's
attention:

- **Prose word count is 2230** (`wc`-style count with the `<Walkthrough>` prop
  block excluded; 2573 including it), of which 258 are table cells. That is
  ~24% above 2.1's 1804 for the same 20-minute estimate. A density pass was run
  as a distinct step and cut ~80 words, most of it out of the two production
  examples (§13's "two sentences is usually enough") and the cold open. The
  overage is claimed as content rather than padding - 2.2 carries three
  idea-groups where 2.1 carried two (the symptom taxonomy, the timeout
  mechanics, and partial failure) - but a cold reader should test that claim
  rather than accept it. The most likely cut, if one is needed, is the
  "Partly down" scale paragraph, which is the only place the chapter reaches
  for beat 10.
- **"How long until you find out" has three sub-points, not one.** §20.2 asks
  for "one level of internal mechanics, not three". The defense is that all
  three are one level down on the same subject (a timeout) and each changes a
  decision: ambiguity changes what you log, stacking changes your config,
  multiplication changes whether you add a retry at all. Worth a second opinion
  - this is the section most likely to be over-depth.
- **The failure-diagram workaround in §5 is the judgment call most likely to be
  wrong.** §7.2 asks for a visibly failed node; the chapter substitutes a
  growing lit prefix and a caption naming the convention. If a cold reader
  thinks that reads as "the happy path with a disclaimer", the honest fix is a
  Mermaid failure diagram with real red styling as the primary and no
  walkthrough at all, not a caption tweak.
- **Both production examples are real incidents, stated from public
  postmortems.** Meta October 2021 and GitHub October 2018. Check them for
  factual drift, especially the 43-second figure and the six-hour figure - the
  chapter's argument does not depend on either number being exact, so if one is
  uncertain the safer edit is to drop the number rather than to soften the
  claim.
- **The taxonomy names (error / hang / disagreement) are invented for this
  chapter.** Declared in `simplifications`. They are used again in the recap
  and in Q1's option set, so renaming them is a four-place edit, not a one-word
  one.
