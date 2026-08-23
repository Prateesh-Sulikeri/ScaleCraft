# Chapter spec - 3.8 Horizontal Scaling

Authored under CURRICULUM.md §5 (chapter blueprint), §6 (mandatory sections),
§20 (author instructions). Deliverable 1 of the 6 in pending-content.md's
"Per-chapter deliverables". Lives beside the lesson so a reviewer can check the
prose against the intent that produced it.

- Chapter definition: `src/content/chapters/index.ts`
  (`bb-3-8-horizontal-scaling`)
- Lesson body: `public/content/chapters/bb-3-8-horizontal-scaling.mdx`
- Manifest row: `src/curriculum/manifest.ts`, slug `3-8-horizontal-scaling`
  (`chapterDefinitionId` flipped from `null` to the id above)

**Wave.** Same out-of-plan authoring order as 3.6 and 3.7 -
`pending-content.md` schedules Group B for Wave 4; this is the third Group B
chapter authored in this working tree, immediately after 3.7 (already
shipped). No sequencing rule (§18.2) is violated - the real prerequisite
(3.7) is already authored - only the wave-grouping plan remains out of order
relative to actual authoring order, same open note 3.6's and 3.7's own specs
already carried forward.

## 0. Type classification

CURRICULUM §14's own row states no explicit `Type:` field for 3.8, but §16's
own audit note lists 3.6-3.10 among "Concept chapters with no component" -
3.8 is inside that range, so Type: Concept, matching 3.6's and 3.7's own
precedent. New: none - CURRICULUM's own row says so explicitly ("a second
instance IS the lesson"). The chapter carries a real, Submit-gated Editor
exercise (a Config-shaped headroom fix), so a Practical objective is
included for the same reason 3.6's and 3.7's specs gave.

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Scale out vs. up, economically and operationally - duplicating a stateless instance behind an already-load-balanced tier is a config change, and how many instances is a headroom decision, not a guess. |
| Type | Concept (see §0 above). |
| Difficulty | foundational |
| Estimated time | 25 minutes (Reader + Editor combined), per CURRICULUM §14's own row and `manifest.ts`'s existing `estimatedMinutes: 25`. |
| Prerequisites | 3.7 Sessions & State Management - the real curriculum-order prerequisite, already shipped in this same working tree. `manifest.ts`'s `prerequisiteSlugs` already pointed at `3-7-sessions-and-state-management` before this chapter was authored - no pulled-forward exception needed. |
| Unlocks | 3.9 Service Discovery (this chapter's own forward tease and the immediate next chapter, per `manifest.ts` row order). |
| Building blocks introduced | None. Matches §16's own note that 3.6-3.10 are intentional no-component Concept chapters, and CURRICULUM's own row for 3.8 ("New: none - a second instance IS the lesson"). `load-balancer` (3.4) and the `app-server.instances` field (3.6) are both reused for a new job - sizing for a failure, not just proving duplication is safe. |
| Stages trained | Part 3's default (stages 2-4) plus a headroom-config stage, distinct from 3.6's "prove duplication is safe" config stage and 3.7's reconnection stage. |
| Interview relevance | High, steps 4 (high-level design - sizing the compute tier) and 7 (trade-offs - vertical vs. horizontal), per §14's own note. |
| Production relevance | Any product whose compute tier autoscales or runs enough instances that single-instance failure is routine rather than exceptional - Netflix's streaming backend is the in-lesson example. |

## 2. Learning objectives (§5.2)

Six objectives (§5.2's allowed range is 3-7); all five required categories
represented - Practical included deliberately, per §0 above.

1. **Knowledge** - Distinguish vertical scaling (a bigger instance) from
   horizontal scaling (more identical instances), and state which of each
   one's costs is structural rather than incidental.
2. **Knowledge** - Explain why duplicating a stateless instance behind an
   existing load balancer requires no new component or edge - a one-field
   config change, not new architecture, because 3.4 and 3.6 already did the
   real work.
3. **Engineering** - Compute an N+1 instance count from a stated peak load
   and a stated per-instance capacity, so that losing any single instance
   still leaves enough capacity.
4. **Practical** - Raise a starter graph's Application Server instance count
   to satisfy a stated headroom requirement, and pass Submit.
5. **Interview** - Answer "why not just get a bigger box?" without
   dismissing vertical scaling outright, naming when it's the honest simpler
   call and what it structurally can't do.
6. **Communication** - Predict what a client experiences when one of several
   health-checked instances stops responding, including the health check's
   real (non-instant) reaction time.

Each objective is exercised: 1 by "A bigger box, or more of the same box" +
"Both directions are real" + quiz Q1; 2 by "Why duplicating is a number, not
a project" + quiz Q2; 3 by "How many is enough" + quiz Q3; 4 by the fix
itself + hints; 5 by "In an interview" + quiz Q5; 6 by "Why duplicating is a
number, not a project" (health-check reaction time) + quiz Q4 (diagram).

## 3. Per-beat outline (§5.3, Concept type per §6)

| Beat | Section in the lesson | Notes |
|---|---|---|
| 1-2 Cold open / why this exists | Untitled opening, 2 paragraphs | Directly continues 3.7's own "Next" ("3.8 Horizontal Scaling picks up the other half of 3.6's own cliffhanger"). Felt failure: two instances are pegged at peak; the obvious first move (a bigger box) works once, then hits the same ceiling on a machine that's already about as big as anyone sells, and stays a single point of failure the whole time. |
| 3 Think first | "Think first" callout | Prediction prompt: what's different about how a bigger box vs. more boxes eventually runs out. Never graded. |
| 4-5 Mental model + visual explanation | "A bigger box, or more of the same box" | One-sentence anchor pair stated before the diagram; primary diagram is a Mermaid flowchart styled as the target topology (client -> LB -> three named app-server instances -> shared SQL Database), captioned per §7.2. |
| 6 Core mechanics | "Why duplicating is a number, not a project" | Duplicating needs no new component/edge (3.4's routing + 3.6's statelessness already cover it); health checks are named as the mechanism that makes this safe operationally, with the `control`-edge canvas gap (open decision 8) disclosed honestly in-prose, not just in `simplifications`. |
| 7 Internal mechanics | "How many is enough" | The N+1 headroom calculation: a stated peak (300 rps) and a stated per-instance capacity (150 rps) combine into a concrete instance count, the same back-of-envelope habit 1.1 taught, now aimed at a config field. |
| 8 Trade-offs | "Both directions are real" | Vertical vs. horizontal, both ways real: vertical is operationally simpler for a small predictable workload but hits a hardware ceiling and stays a single failure domain; horizontal has neither limit but depends on 3.4's routing and 3.6's statelessness already being in place. |
| 9 Failure modes (o) | Folded into "Both directions are real" and "Why duplicating is a number, not a project" | The single-failure-domain point (vertical) and the health-check reaction-time point (horizontal) are both stated where they're most relevant rather than split into a separate section - optional for Concept, declared per §6's written-justification rule. |
| 10 Scaling (o) | "What changes at scale" | Optional for Concept, kept: lens 7, and the bridge into 3.9 - hand-picking instance count stops working once autoscaling reacts to load on its own. |
| 11 Production examples | "In production" | Netflix - unused by any prior chapter (checked directly, see §6 below), and on-topic: a large fleet of small, identical, stateless instances where single-instance loss is routine, not incident-worthy. |
| 12 Common mistakes | "Common mistakes" | Four: reaching for a bigger box without naming its ceiling; sizing for average load with no headroom; treating "add an instance" as new engineering work; assuming the load balancer reacts to a dead instance instantly. |
| 13 Interview lens | "In an interview" | High relevance, steps 4 and 7 named explicitly. Mandatory §10.3 senior-answer line built only from this chapter's own vocabulary. |
| 14 Connections + Preview of next | Woven through prose / "Next" (forward) | Backward: 3.7 (direct continuation, quoted), 3.6 (statelessness precondition), 3.4 (the load balancer's routing job), 1.1 (the estimation habit), 2.3 (Group B's own motivating row) - past §19's >=2. Forward: 3.9 only, as the one marked tease (in "Next"). No separate "further out" advance-organizer mention - CURRICULUM's own row for 3.8 doesn't name one, unlike 3.7's row naming 3.14. |
| 15 Recap + knowledge check | "Recap" | Four retrieval anchors. QuizLauncher renders the knowledge check automatically. |
| 16 Transition brief | "Your turn" | States the starter graph (3.7's own passing system, already fully wired), the stated load numbers (300 rps peak, 150 rps tested per instance), the success condition (raise Instances so losing any one instance still covers peak, then Submit), and states explicitly that Validate is already clean going in - there's no rule violation to chase, only a headroom gap the blueprint alone gates. |

## 4. Declared omissions and justifications (§6's written-justification rule)

- **No separate Failure modes section.** Optional for Concept (§6). The two
  failure-relevant points (vertical's single-failure-domain risk; the
  horizontal load balancer's real, non-instant health-check reaction time)
  are each stated in the section where they're most load-bearing rather than
  gathered into a section that would restate them in fresher words, which
  §20.6 forbids.
- **No formal "Trade-off scenario" Editor exercise.** §11.1's own "Where
  used" column for that exercise type lists 3.7, 3.11, 3.19, 3.22 - not 3.8.
  Unlike 3.7, this chapter's vertical-vs-horizontal contrast is realized only
  in lesson prose ("Both directions are real") plus quiz Q5, which is
  faithful to the taxonomy rather than an extension of it - 3.8 was never
  named as an owner of that exercise type.
- **No everyday analogy beyond the diagram itself.** Same minimal-analogy
  choice 1.2/3.1/3.4/3.5/3.6/3.7 made; a second competing metaphor would
  violate §5.3 beat 4's "one model per chapter."
- **No §12 nugget devices.** Open decision 5 remains unresolved and, per its
  own "individual chapters should stop declaring this one by one" note
  (raised at 2.1), this chapter doesn't add another per-chapter ordinal to
  the count - the omission is simply consistent with every prior Group A/B
  chapter's own choice.
- **Only one production example**, matching every prior chapter's own
  precedent, not §13's allowed 1-3 - Netflix's fleet-scaling story is
  complete on its own without a second example diluting it.
- **The 300 rps / 150 rps-per-instance figures are illustrative, not real
  telemetry from any actual system.** CURRICULUM §10.1 step 3 bans precision
  theater for *interview* back-of-envelope estimates specifically (deriving
  a number from first principles and presenting it as more precise than the
  reasoning supports); this is a different thing - a worked numerical
  example handed to the learner as a given, the same way a problem
  statement states a starter graph's facts. Flagged in §12 below for a
  second reader to confirm this reading doesn't blur into the banned
  pattern.

## 5. Diagram (§7)

Primary diagram is a Mermaid **flowchart styled as the target topology**
(client, load balancer, three named app-server instances, one shared SQL
Database) - the same narrow, per-chapter exception open decision 3 already
established for 1.6, 3.4, and 3.7: the Reader cannot render a real
`ArchitectureGraph` block, so a static topology is authored as Mermaid,
styled to match, and justified because the real interactive version already
exists as this chapter's own `starterGraph`/`blueprints[0]` once Instances is
raised - the lesson diagram is only the static preview of what the learner
actually builds (a config change, not a new shape, so the diagram shows the
target shape rather than a before/after). Captioned narrowly for this
diagram only.

No `<Walkthrough>` was considered necessary: the diagram shows a static
target shape, not an ordering between requests over time - the same
reasoning 3.7's own spec gave for its own topology-Mermaid, applied here to
the same diagram type.

**The quiz's diagram-kind question (Q4) uses `control`-kind edges for
illustration, distinct from the lesson's own Mermaid diagram and from the
graded `starterGraph`/`blueprint`.** A `diagram`-kind `QuizQuestion.graph` is
documented as "rendered read-only, never used for matching"
(`src/content/chapters/types.ts`) - it never passes through
`component-relations`' edge-kind checks the way a learner-built graph does,
so it isn't subject to open decision 8's canvas-buildability gap the way a
graded exercise would be. QUIZ_FRAMEWORK.md §9's own bank Q6 already uses
`control` edges in exactly this way for the same illustrative purpose - this
question follows that precedent rather than establishing a new one. Flagged
in §12 for a second reader to confirm this reading is correct rather than a
quiet third instance of decision 8.

## 6. Component budget (§16) and cross-reference checks

§16's audit row for 3.8 is absent (same note as 3.6 and 3.7: "3.6-3.10... are
intentional"). No new component, no new edge kind.
`availableComponentIds`/`requiredComponentIds`: the full chain through 3.7 -
`browser`, `dns`, `firewall`, `reverse-proxy`, `api-gateway`,
`load-balancer`, `app-server`, `sql-database` - all required, unchanged from
3.7's own set, consistent with Part 3's running-example philosophy.

**Checked against 2.3's own Group table row for Group B, 2026-08-23 -
matches.** 2.3's row: "Copies of the app tier only work if a request can
land anywhere | 3.6-3.9." This chapter's own content extends the same
constraint one step further - not just that a request can land anywhere
(3.6), or that displaced state has somewhere to go (3.7), but that *enough*
copies exist to survive losing one. Third of the four remaining Group B rows
named in open decision 15 to be checked; only 3.9 remains open.

**On the §6 "engineered-cliffhanger" example citing "3.8 ends with two
servers and nothing routing between them; 3.4 resolves it" (CURRICULUM.md
§6, "Rules of use").** Read literally against current chapter numbering,
this doesn't parse as a claim about 3.8's own forward tease - 3.4 is already
taught by the time a learner reaches 3.8 (Group A precedes Group B), so 3.4
cannot be something 3.8 "ends" toward. The actually-shipped mechanism is the
one this chapter and 3.6/3.7's own "Next" sections already establish: 3.6
sets up two instances with nothing yet deciding how many or what happens on
failure; 3.7 resolves the state half; 3.8 resolves the routing/sizing half
using 3.4's already-taught load balancer, re-motivated rather than newly
introduced (CURRICULUM's own 3.8 row says this explicitly: "3.4 taught the
tool, 3.8 makes it inevitable"). The §6 parenthetical reads as drift from an
earlier draft's numbering, the same class of self-contradiction as open
decisions 1, 4, 6, and 7 (CURRICULUM.md rows disagreeing with each other or
with shipped content) - logged as a new addition to that class in
`pending-chapters.md` rather than resolved unilaterally, since it's a doc
edit, not a content decision this pass owns.

## 7. Validation rules (deliverable 4)

No new rule authored - §14's row names none for 3.8, and no existing rule
tests headroom above the bare capacity-2 floor (verified against
`src/validation-engine/rules/index.ts`). Writing a new rule is out of this
pass's scope per the `chapter-author` skill.

**`single-instance-load-balancer` does not fire on this chapter's starter
graph, and that's by design, not an oversight.** The rule's own predicate
(`src/validation-engine/rules/single-instance-load-balancer.ts`) flags
`capacity < 2`; the starter carries `instances: 2` (3.7's own passing
config), so Validate shows clean from the start. This chapter's own bar
(headroom for one failure, `instances >= 3`) is gated entirely by the
blueprint's config predicate, the same shape 3.4's own Config exercise used
for its algorithm-choice fix (a real, ungraded-by-rule judgment call, not a
Validate-time warning) - not a new gap, and the "Your turn" section states
outright that Validate starts clean so the learner isn't left hunting for a
warning that was never going to appear.

`validationRuleIds`: 3.6's own curated set unchanged (`no-direct-client-
database`, `component-relations`, `single-instance-load-balancer`,
`missing-input-connection`, `request-flow-cycle`) - `single-instance-load-
balancer` stays listed as a relevant rule for this chapter's own topic even
though it doesn't fire on the shipped starter, since it's the rule that
would catch a learner who *lowers* Instances below 2 while experimenting.
`orphan-component` (3.7's own namesake rule) is dropped - nothing is
disconnected in this chapter's starter.

## 8. Blueprint and starter graph (deliverable 3, part of it)

One blueprint, `bb-3-8-blueprint`: the full chain (`browser -> dns -> fw ->
proxy -> gateway -> lb -> app -> db`, all `request-flow`), with the `app`
alias's own config predicate raised from 3.6's `instances >= 2` to `instances
>= 3` - the headroom bar this chapter's own math derives.

Starter graph: the system as built through 3.7 - browser, DNS, firewall,
reverse proxy, API gateway, load balancer, one Application Server node at
`instances: 2` (3.7's own passing config, carried forward unchanged), one SQL
Database - every edge present, including Application Server -> SQL Database
(3.7's own fix, already applied in this running system). Nothing is
disconnected or miswired; the sole gap is the Instances value itself.
`entryPointIds: ["bb-3-8-browser"]`.

## 9. Hints (deliverable 3, part of it)

Three, orienting before directional, never the answer (§11.3):

1. *Orienting* - "Validate is already clean here - nothing is wired wrong.
   The gap is between what this system's stated peak load requires and what
   current capacity covers if one instance goes down right now."
2. *Directional* - "At 150 requests/second per instance and a 300
   requests/second peak, two instances is exactly enough today - with
   nothing left over if either one fails."
3. *Directional* - "Raise the Application Server's own Instances field until
   losing any single instance still leaves the survivors covering 300
   requests/second combined."

None states the exact target number or names `single-instance-load-balancer`
by name, matching every prior chapter's own discipline - the learner derives
3 from the stated math, hint 2 doesn't hand it over directly.

## 10. Quiz (deliverable 5)

Five questions, ids permanent, ramp 1/1/2/2/3, matching every sibling
chapter's own default.

Q1 models QUIZ_FRAMEWORK.md §9's own bank Q4 (tagged "(3.8)" - reserved for
this exact chapter: the hardware-ceiling/single-failure-domain framing),
reworded with fresh option labels rather than reproduced verbatim. Q2 is
original, exercising objective 2 (no new component/edge needed) - no bank
question isolates this exact mechanistic point. Q3 is original, built
directly against this chapter's own N+1 headroom math (objective 3) - no
bank question presents a headroom calculation. Q4 (`diagram` kind) adapts
bank Q6's own failure-prediction scenario to three instances and this
chapter's own numbers, realizing CURRICULUM's row's "predict (kill an
instance mid-simulation)" exercise as a degraded quiz question per
`pending-content.md`'s own named degradation path (no simulator UI exists -
same precedent 1.6, 1.7, and 1.9 already set). Q5 is original, exercising
objective 5 (the "why not a bigger box" interview follow-up) with a senior
answer that names vertical scaling's genuine cases rather than dismissing it
- bank Q4 states the two forces toward horizontal but doesn't pose the
interview-defense framing this question does.

**Position-clustering check.** Correct options sit at d, a, c, b, a across
all five questions - all four positions used, "a" the only repeat (Q2, Q5).
Checked against 3.6's own sequence (c, a, d, b, c) and 3.7's own sequence (b,
d, a, c, b) to avoid the sibling-clustering pattern the `chapter-author`
skill calls out explicitly - 3.6 opens on "c," 3.7 opens on "b," this chapter
opens on "d," so none of the three Group B chapters so far share an opening
letter.

Scope check: every question draws on this chapter's own material plus 3.4
(the load balancer's routing/health-check job, Q1/Q2/Q4), 3.6 (statelessness
as duplication's precondition, Q1/Q2), 3.7 (the running system's own current
state, referenced in Q2's own distractor), and 1.1 (the estimation habit
behind Q3's headroom math) - all already-taught. No question requires
anything from 3.9 onward; "autoscaling" doesn't appear in the quiz at all
(only in the lesson's own "What changes at scale" section, naming it as
future territory, not testing it).

## 11. Playtest pass (deliverable 6, §18.2's binding question)

*"Which prior chapter taught each move this exercise requires?"*

| Move | Taught by |
|---|---|
| Open a node's config panel and change a numeric field | 3.6's own first config-only fix - the identical gesture, applied to the same field on the same component. |
| Run Validate and read that nothing is flagged | 0.1's lesson, reused by every build chapter since; this chapter is the first where Validate starts and stays clean, which "Your turn" states explicitly so the learner isn't confused by the absence of a warning. |
| Reason from a stated peak load and a stated per-instance capacity to a raw instance count | Building on 1.1's own back-of-envelope habit (users -> QPS -> a concrete number), aimed here at a config field instead of an architecture sketch. |
| Add headroom (N+1) rather than stopping at the bare number | New in this chapter, deliberately - the lesson's "How many is enough" section and hint 2 both walk the reasoning explicitly rather than assuming the learner invents N+1 unprompted. |
| Recognize that duplicating a stateless instance behind an existing load balancer needs no new component or edge | Building directly on 3.4 (the load balancer's own routing job) and 3.6 (statelessness as the precondition) - this chapter's own core synthesis of both. |
| Predict what happens when one of several health-checked instances dies | Building on 3.4's own naming of health checks as the load balancer's failure-detection mechanism, now applied concretely via quiz Q4's diagram. |
| State a trade-off in 1.3's "we chose X, accepting Y, because Z" form for vertical vs. horizontal | 1.3 taught the form; 3.7 already applied it to a two-product comparison; this chapter applies it to a scaling-strategy comparison for the first time. |

No move is unsourced.

## 12. Items flagged for a second pass

- **The illustrative-example load numbers (§4).** A second reader should
  confirm that stating 300 rps / 150 rps-per-instance as a given worked
  example (not an estimation exercise) doesn't blur into the precision-
  theater pattern §10.1 step 3 bans for interview back-of-envelope
  reasoning specifically.
- **The `control`-edge quiz diagram reading (§5).** A second reader should
  confirm that a `diagram`-kind quiz question's read-only `graph` field is
  genuinely exempt from open decision 8's canvas-buildability gap (per
  QUIZ_FRAMEWORK.md §9's own bank Q6 precedent) rather than a quiet third
  instance of the same undisclosed gap.
- **The §6 "engineered-cliffhanger" parenthetical read as doc drift, not a
  missed requirement (§6 above).** A second reader should confirm the
  literal-reading argument holds - that CURRICULUM.md's own §6 "Rules of
  use" example ("3.8 ends with two servers and nothing routing between
  them; 3.4 resolves it") cannot describe this chapter's own forward tease
  given current chapter ordering, and is therefore stale text rather than a
  requirement this chapter failed to satisfy.
- **`single-instance-load-balancer` not firing on the starter graph (§7).**
  A second reader should confirm a Config exercise gated entirely by the
  blueprint, with no Validate-time warning at all, is a legitimate
  realization of §11.1's Config exercise type (matching 3.4's own algorithm-
  choice precedent) rather than an under-specified fix a learner could stall
  on without a rule pointing at anything.
- **Word count.** 1,307 words at final draft (`wc -w` on the raw `.mdx`) for
  a 25-minute chapter - close to 3.7's own 1,214/25min ratio and below
  3.1's 1,398/25min and 3.4's 1,356/25min ratios. Judged content-complete
  against all six objectives and every mandatory §6 section (see §3's beat
  table) rather than short by omission, per §20.6's "length follows
  content" rule - flagged for a second reader to confirm nothing
  load-bearing was cut short.
- **No formal density revision pass performed as a distinct drafting
  round** - matching every prior Group B chapter's own precedent of
  flagging a self-assessed density claim for the next reviewer to check
  rather than trust.

**Not done (out of `chapter-author` draft mode's scope):** no Opus audit
pass yet. `tsc`/`lint`/`vitest`/`build` not run - content-only pass.
