# Chapter spec - 3.6 Stateless Services

Authored under CURRICULUM.md §5 (chapter blueprint), §6 (mandatory sections),
§20 (author instructions). Deliverable 1 of the 6 in pending-content.md's
"Per-chapter deliverables". Lives beside the lesson so a reviewer can check the
prose against the intent that produced it.

- Chapter definition: `src/content/chapters/index.ts` (`bb-3-6-stateless-services`)
- Lesson body: `public/content/chapters/bb-3-6-stateless-services.mdx`
- Manifest row: `src/curriculum/manifest.ts`, slug `3-6-stateless-services`
  (`chapterDefinitionId` flipped from `null` to the id above)

**Wave.** `pending-content.md` schedules Group B for Wave 4 (paired with Group
C). Authored here on explicit user request ahead of that plan, immediately
after Group A (3.1-3.5, same working tree) - the real prerequisite (3.5) is
already shipped, so no sequencing rule (§18.2) is actually violated; only the
wave-grouping plan in `pending-content.md` is out of order. Noted, not
resolved unilaterally - a future session may want to reconcile
`pending-content.md`'s wave numbering with the ledger's actual authoring
order.

## 0. Type classification

CURRICULUM §14's own row states `Type: Concept` explicitly - unlike 1.2's or
3.1's rows, there is no ambiguity to resolve here. `New: none`. Failure modes
and Scaling considerations are therefore optional (§6), not mandatory; see §4
below for how each is handled. The chapter still carries a real, Submit-gated
Editor exercise (a config-only Fix), which is why a Practical learning
objective is included rather than exempted - the exemption in §5.2 is for
Concept chapters with no buildable exercise at all (0.2, 0.3), not for every
Concept chapter categorically.

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Why statelessness is the property that makes compute cheap to scale; what state hides in a "stateless" server. |
| Type | Concept (see §0 above). |
| Difficulty | foundational |
| Estimated time | 20 minutes (Reader + Editor combined), per CURRICULUM §14's own row - the shortest chapter in Group A/B. |
| Prerequisites | 3.5 API Gateway - the real curriculum-order prerequisite, already shipped in this same working tree. `manifest.ts`'s `prerequisiteSlugs` already pointed at `3-5-api-gateway` before this chapter was authored - no pulled-forward exception needed. |
| Unlocks | 3.7 Sessions & State Management (this chapter's own forward tease and the immediate next chapter); 3.8 Horizontal Scaling (named in `curriculumContext`, not teased in-lesson - see §19's one-tease rule in §3 below). |
| Building blocks introduced | None. Matches §16's audit row for 3.6 (absent from the table; 3.6 is listed among the intentional no-component Concept chapters at §16's own note). |
| Stages trained | Part 3's default (stages 2-4) plus a config-only construction stage, distinct from every prior chapter's topology-shaped build/fix. |
| Interview relevance | High, per §14's own note - step 4 vocabulary. |
| Production relevance | Any service that autoscales or sits behind more than one instance depends on this holding true, whether or not anyone on the team has said the word "stateless" out loud - Stripe's API tier is the in-lesson example. |

## 2. Learning objectives (§5.2)

Six objectives (§5.2's allowed range is 3-7); all five required categories
represented - Practical included deliberately, per §0 above.

1. **Knowledge** - State what makes a service stateless: any instance can
   answer any request because no response depends on a specific instance's
   memory of an earlier one.
2. **Knowledge** - Distinguish state that's safe to keep local (recomputable,
   disposable) from state that isn't (anything the next request needs to see
   correctly, regardless of which instance answers it).
3. **Engineering** - Decide, for a piece of app-tier state, whether pinning it
   to one instance or moving it to a shared store is the more honest call
   given the situation, and name the cost of each.
4. **Practical** - Fix a starter graph's under-provisioned load balancer by
   raising the Application Server's own Instances field - not adding a
   second node - and pass Submit.
5. **Interview** - Answer "is autoscaling free once you're stateless?"
   without overclaiming that displaced state disappears rather than
   relocates.
6. **Communication** - Explain, in 1.3's trade-off language, what pinning a
   user to one instance buys against what moving their state out of the app
   tier costs.

Each objective is exercised: 1 by "Any instance, same answer" + quiz Q1; 2 by
"What's actually not allowed to be local" + quiz Q3; 3 by "Where does it go,
then" + quiz Q4; 4 by the fix itself; 5 by "In an interview" + quiz Q5; 6 by
"Where does it go, then" (the same section carries both the Engineering
judgment and its 1.3-form statement) + quiz Q4.

## 3. Per-beat outline (§5.3, Concept type per §6)

| Beat | Section in the lesson | Notes |
|---|---|---|
| 1-2 Cold open / why this exists | Untitled opening, 2 paragraphs | Directly continues 3.5's own "Next" ("3.6 Stateless Services names the assumption Group A has been quietly making the whole time"). Felt failure: a cart addition held in one instance's memory vanishes when the next request lands on a different one. |
| 3 Think first | "Think first" callout | Prediction prompt: what would have to be true about instance A and B for the reload not to lose the cart. Never graded. |
| 4-5 Mental model + visual explanation | "Any instance, same answer" | One-sentence anchor stated before the diagram; primary diagram is a Mermaid **sequence** diagram (not the usual topology-Mermaid narrow exception - §7.1's own catalog homes sequence diagrams at "ordering between parties matters," which is exactly this case, so no open-decision-3 exception is being invoked here). Captioned per §7.2. |
| 6 Core mechanics | "What's actually not allowed to be local" | The two-way state taxonomy: disposable/recomputable (safe) vs. request-deciding (not safe), plus the "the database was never the issue" correction. |
| 7 Internal mechanics | (folded into beat 6) | Not split into its own section at this chapter's density - same reasoning every prior chapter's spec gave for the identical fold. |
| 8 Trade-offs | "Where does it go, then" | Genuine two-sided call: pin to one instance (cheap now, re-couples availability) vs. externalize (correct under load balancing, costs a hop). Kept shallow and explicitly marked as a fork 3.7 resolves - see §4's note on scope. |
| 9 Failure modes (o) | Folded into the cold open | The cold open's cart-vanishing scenario **is** the chapter's failure mode; no separate section, declared per §6's written-justification rule since Failure modes is optional for Concept. |
| 10 Scaling (o) | "Why this is worth the constraint" | Optional for Concept, kept anyway (not padding): lens 7, and the direct bridge to 3.8's own "Prepares for" line - a newly autoscaled instance can take traffic immediately only because nothing is missing. |
| 11 Production examples | "In production" | Stripe - unused as of 3.5's own company tally (Cloudflare x2, AWS, Netflix, Google, Uber each once). Who/why/when/trade-off format: interchangeable instances behind an LB buy spike-safe scaling; the cost is externalized-state infrastructure run regardless of instance count. |
| 12 Common mistakes | "Common mistakes" | Four: relying on the LB "usually" returning the same user; conflating "stateless" with "no state anywhere"; overcorrecting against a harmless local cache; treating pinning as a fix rather than a stopgap (ties to the one forward tease). |
| 13 Interview lens | "In an interview" | High relevance. Names loop step 4 explicitly; mandatory §10.3 senior-answer line built only from this chapter's own vocabulary (no 3.7-specific store names). |
| 14 Connections + Preview of next | Woven through prose / "Next" (forward) | Backward: 1.2 (three-tier shape, the database's role), 1.3 (trade-off form), 3.4 (load balancer's "identical instances" assumption, and its own namesake rule reused here), 3.5 (its own "Next" tease, quoted), 2.3 (Group B's own motivating row, quoted - see §6 below) - well past §19's >=2. Forward: 3.7 only, the chapter's one marked tease (in "Next" and in the trade-offs/common-mistakes prose, all pointing at the same single chapter - see §6 below on why naming 3.7 more than once is still "one tease," not several). |
| 15 Recap + knowledge check | "Recap" | Four retrieval anchors. QuizLauncher renders the knowledge check automatically. |
| 16 Transition brief | "Your turn" | States the starter graph (the full system as built through 3.5, correctly wired end to end), the success condition (Instances raised on the existing Application Server node, clean Validate, then Submit), and explicitly forecloses the "add a second node" instinct 3.4 taught, per §6's own drift-report note below. |

## 4. Declared omissions and justifications (§6's written-justification rule)

- **No separate Failure modes section.** Optional for Concept (§6). The cold
  open's cart-vanishing scenario already delivers what a dedicated section
  would restate - splitting it out would violate §20.6 (one idea stated
  twice in fresher words).
- **The Trade-offs section is deliberately shallow, not a Trade-off-scenario
  Editor exercise.** §11.1's own usage list for that exercise type names
  "3.7, 3.11, 3.19, 3.22, all RWE Phase B" - 3.6 is not on it. This is the
  framework's own intended shape for this chapter, not a gap being narrowed
  - confirmed by reading §11.1 directly rather than assumed. §14's own
    "Exercise: trade-off + small fix" is realized as lesson prose + quiz Q4
    (the "trade-off pick" pattern 0.2 already established for Concept
    chapters) plus the buildable config fix (Q4 above) for "small fix."
- **No everyday analogy beyond the diagram itself.** Same minimal-analogy
  choice 1.2/3.1/3.4/3.5 made; a second competing metaphor would violate
  §5.3 beat 4's "one model per chapter."
- **No §12 nugget devices.** Open decision 5 remains unresolved; this
  chapter is the seventh to omit and declare rather than make the call
  unilaterally.
- **Only one production example**, matching every prior chapter's own
  precedent, not §13's allowed 1-3 - Stripe's stateless-API decision is
  complete on its own; a second company for the same decision would
  restate, not add (§20.6).
- **Sticky sessions / session affinity is named but not built.** No
  registry component has a config field representing it, and its full
  mechanics and cost belong to 3.7 (§14's own row: "sticky sessions vs.
  externalized store"). Named once, marked as a forward pointer, never
  explained beyond "pin a user's repeat requests to one instance" - see
  `curriculumContext.simplifications` and the honesty note in §20.2 (a
  `simplifications` entry alone doesn't discharge the requirement; the
  lesson prose states it too).

## 5. Diagram (§7)

Primary diagram is a Mermaid **sequence diagram** (client, load balancer, two
named app-server instances; two requests, two different instances, a `Note`
marking where the cart addition lives and where it's missing). This is not
an instance of open decision 3's topology-diagram workaround - §7.1's own
diagram catalog homes sequence diagrams at "ordering between parties
matters," and that's precisely what this diagram shows (two requests
arriving at different points in time, routed to different instances) rather
than a static topology. Captioned per §7.2 ("the load balancer's routing
decision is the same both times... what changed is that the second request
needed the first one's memory").

A `<Walkthrough>` was considered (the scenario is naturally temporal) and
deliberately not used: every sibling Group A chapter used a static diagram
for its primary explanation, a Walkthrough is comparatively heavier
authoring surface, and a two-step sequence diagram already satisfies §7.2's
"see before read" and captioning rules without needing the stepping
mechanism (there's no benefit here from spreading two beats across
multiple interactive steps - see full guidance in §7.2 and the dedicated
`walkthrough-diagram` skill this pass did not invoke). Flagged for a second
reader in §12.

## 6. Component budget (§16) and cross-reference checks

§16's audit row for 3.6 is absent (§16's own note: "Concept chapters with no
component... 3.6-3.10, 3.13... are intentional"). No new component, no new
edge kind. `availableComponentIds`/`requiredComponentIds`: the full chain
through 3.5 - `browser`, `dns`, `firewall`, `reverse-proxy`, `api-gateway`,
`load-balancer`, `app-server`, `sql-database` - all required, matching the
"no optional piece" precedent every prior Building Block chapter set, and
consistent with Part 3's stated running-example philosophy (CURRICULUM §14's
own intro to the part: "one product... recurs across groups so each block
extends a familiar system").

**Checked against 2.3's own Group table row for Group B, 2026-08-22 -
matches.** 2.3's row: "Copies of the app tier only work if a request can
land anywhere | 3.6-3.9." This chapter's cold open and mental-model section
state exactly that constraint, and 2.3's own foreshadowing paragraph
("nothing a user depends on may live in one instance's memory... that
constraint is a chapter of its own (3.6)") is paraphrased, not
contradicted, in this chapter's mental-model beat. First of the seven
group-table rows named in open decision 15 to be checked against Group B;
recorded in the update to that decision in `pending-chapters.md`.

**On the single "3.7" forward reference appearing more than once (§19).**
§19 caps forward *teases* at one per chapter, meaning one unresolved-pull
device, not one literal mention of a future chapter's number. The same
single target (3.7) is named in the Trade-offs section (as the chapter that
"builds the second [road] properly"), a Common-mistakes bullet ("3.7 covers
what it costs"), the Recap, and "Next" - all pointing at the same one
chapter, none introducing a second distinct tease, matching 3.5's own
precedent of naming its single tease (3.6) in both its metadata and its
"Next" section. 3.8 is named only in `curriculumContext` (a metadata field,
never rendered as lesson prose), not in the lesson itself - so the lesson
carries exactly one forward-facing chapter name throughout.

## 7. Validation rules (deliverable 4)

No new rule authored - §14's row names none for 3.6, and no existing rule
teaches statelessness directly (verified against
`src/validation-engine/rules/index.ts`). Writing a new rule is out of this
pass's scope per the `chapter-author` skill (content authoring, not
engineering); if the curriculum later wants a rule that reads something
state-shaped, it needs a new component config field first (no existing
field represents "this instance holds request-deciding local state"), which
is real engine work, not a content-authoring gap to hack around.

**`single-instance-load-balancer` is reused for a second, different reason
than 3.4's.** 3.4's own blueprint (`bb-3-4-blueprint`) requires *two
distinct app-server nodes*, deliberately - its problemStatement even says
"a second box, not a higher Instances count," because 3.4's lesson is about
needing a real second, health-checked copy. This chapter's blueprint
(`bb-3-6-blueprint`) requires the *opposite* shape on purpose: one
app-server node with a `config` predicate (`instances >= 2`) - because this
chapter's own point is that capacity is now a number, not a topology
change. Both blueprints reuse the same underlying rule (which sums
`instances` across all downstream targets, so either shape clears
`singleInstanceLoadBalancer`'s own warning) for two deliberately different
teaching purposes - the same "same component/rule, second job" pattern §19
asks authors to call out for components, applied here to a rule instead.
The rule's own explanation text ("no load distribution and no failover... a
pass-through") is 3.4's own framing, not restated as if it were about
statelessness - the lesson's prose carries this chapter's own reasoning
separately, so the rule isn't misrepresented.

**A new, related finding for open decision 11.** `blueprint-drift.ts`'s
`missingComponents` check (verified directly) tests each blueprint node's
config predicate against *individual* candidate nodes - it does not sum
`instances` across multiple nodes the way the validation rule itself does.
A learner who does 3.4's own fix here instead (adds a second Application
Server node, each left at the default `instances: 1`) would clear the
`single-instance-load-balancer` warning (capacity sums to 2) but fail this
chapter's blueprint match, and the drift report would read "Missing:
Application Server" despite two being present on canvas - confusing,
same class of finding decision 11 already named for a different
config/topology mismatch. **Not hacked around**: the lesson's "Your turn"
section and hint 3 both explicitly instruct against adding a second node
before this can bite, which is the same mitigation 3.4's own
problemStatement used for its own, opposite instinct. Recorded as an
addition to decision 11 in `pending-chapters.md`, not a new numbered
decision - same underlying blueprint-drift/config-predicate gap.

`validationRuleIds`: `["single-instance-load-balancer",
"no-direct-client-database", "component-relations", "orphan-component",
"missing-input-connection", "request-flow-cycle"]`.

## 8. Blueprint and starter graph (deliverable 3, part of it)

One blueprint, `bb-3-6-blueprint`: the full chain (`browser -> dns -> fw ->
proxy -> gateway -> lb -> app -> db`, all `request-flow`), with the `app`
alias carrying a `config` predicate (`instances gte 2`) instead of requiring
a second node - see §7 above for why this is the deliberate, opposite
choice from 3.4's own blueprint shape.

Starter graph: the complete system as built through 3.5 (browser, DNS,
firewall, reverse proxy, API gateway, load balancer, one app server, one
database), every node and edge correctly wired - the first chapter in this
curriculum whose starter graph has zero topological faults. The sole fault
is the Application Server's own `config: { instances: 1 }`, which is what
makes this the curriculum's first purely config-only Fix exercise (3.1's
`permissive-firewall` gate is also config-only, but paired with a missing
node, i.e. a Completion exercise; this chapter's starter graph is otherwise
already complete). `entryPointIds: ["bb-3-6-browser"]`.

## 9. Hints (deliverable 3, part of it)

Three, orienting before directional, never the answer (§11.3):

1. *Orienting* - "Validate is naming the load balancer's own capacity, not
   anything wired wrong - every edge in this graph is already correct."
2. *Directional* - "Open the Application Server's config panel (click the
   node) and look at Instances. It's still 1."
3. *Directional* - "Raise Instances to 2 or more on that same node - don't
   add a second Application Server node, that's a different exercise's
   fix."

None states which validation rule fires by name, matching every prior
chapter's own discipline. Hint 3 doubles as the mitigation named in §7's new
finding for decision 11.

## 10. Quiz (deliverable 5)

Five questions, ids permanent, ramp 1/1/2/2/3, matching every sibling
chapter's own default.

Q1 models QUIZ_FRAMEWORK.md §9's own Q1 (the bank's published definition
question, explicitly tagged for this chapter) - reworded with fresh
distractors rather than reproduced verbatim. Q2-Q5 are original but each
checked against the bank's own per-question chapter tags before being
scoped: bank Q2/Q3 (sticky-session cost accounting) are tagged "(3.7)," not
"(3.6)," so this chapter's own quiz does not draw on them - Q4 here tests
the same *shallow* pinning-vs-externalizing trade-off without the sticky
-session cost specifics the bank reserves for 3.7. Q3 and Q5 are original,
built to exercise objectives 2 and 5 respectively; Q5 is a scoped-down
version of the bank's own Q8 (tagged "3.6-3.7"), stopping at "state
relocated to a shared store" without naming which store, since naming one
is 3.7's job.

**Position-clustering check.** Correct options sit at c, a, d, b, c across
all five single-kind questions - all four positions used, "c" the only
repeat (Q1, Q5). Checked by eye per the chapter-author skill's own
instruction.

Scope check: every question draws on this chapter's own material plus 3.4
(load balancer capacity/failover, Q1/Q2), 1.3 (trade-off form, Q4), and
2.3/3.5 (the running system, referenced not re-taught) - all
already-taught. No question requires anything from 3.7 onward; verified
directly against QUIZ_FRAMEWORK.md §9's own per-question chapter tags
rather than assumed.

## 11. Playtest pass (deliverable 6, §18.2's binding question)

*"Which prior chapter taught each move this exercise requires?"*

| Move | Taught by |
|---|---|
| Open a node's config panel and change a field | 3.1's own `defaultPolicy` config exercise - same gesture, different field. |
| Run Validate and read a rule's explanation | 0.1's lesson, reused by every build chapter since, most recently 3.4/3.5. |
| Recognize that a load-balancer-over-one-instance warning is about capacity, not wiring | 3.4 already taught this exact rule and its meaning; this chapter reuses the recognition, not re-teaches it. |
| Decide that a config change, not a topology change, is the correct fix here | New in this chapter, deliberately - the lesson's "Your turn" and hint 3 both state it explicitly rather than leaving it to be inferred, since 3.4 trained the opposite instinct (add a node) for the same rule. |
| Reason about what state is safe to keep local vs. not | New in this chapter (the chapter's own core concept), building on 1.2's database-as-real-state baseline. |
| State a trade-off in 1.3's "we chose X, accepting Y, because Z" form for a new decision | 1.3 taught the form; 3.3/3.5 already applied it to a component; this chapter applies it to an architectural property instead of a component for the first time. |
| Reason about what changes at 10x/100x for the compute tier specifically | Building on 1.2/3.1-3.5's own 10x/100x reasoning for their respective components/properties (§9 lens 7, optional but included per §4). |

No move is unsourced.

## 12. Items flagged for a second pass

- **The sequence-diagram choice over a Walkthrough (§5).** A second reader
  should confirm the two-instance, two-request sequence diagram reads
  clearly without interactivity, and that choosing it over a `<Walkthrough>`
  was the right call rather than an under-investment in this chapter's
  primary diagram.
- **The reused-rule, opposite-blueprint design (§7).** The single most
  load-bearing judgment call in this chapter - a second reader should
  confirm the config-predicate blueprint actually behaves as described
  (verified by reading `pattern.ts`/`blueprint-drift.ts` directly, not by
  running the pipeline) and that the lesson's explicit "don't add a second
  node" instruction is prominent enough to prevent the confusing drift
  message named as a new finding for open decision 11.
- **Stripe as the production example.** A second reader should confirm this
  reads as a genuine, checkable public claim (stateless API tier behind a
  load balancer) rather than an unverifiable specific, and that avoiding
  "idempotency" (a related but separate concept, deliberately cut per §20.4's
  one-idea-cluster rule) didn't leave the example feeling thin.
- **Word count.** 1,272 words at final revision (`wc -w` on the raw `.mdx`).
  Below 3.5's 1,356/25min and 3.1's 1,398/25min ratios, proportionate to
  this chapter's shorter 20-minute estimate and its Concept type (no
  mandatory Failure modes/Scaling sections) - judged acceptable rather than
  padded to hit a higher number, per §20.6's "length follows content, not
  the time estimate" rule; flagged for a second reader to confirm nothing
  load-bearing was cut short.
- **No density revision pass performed as a distinct drafting round** - a
  light trim pass was done on the Trade-offs section only. Flagged per
  every prior chapter's own precedent of flagging a self-assessed density
  claim for the next reviewer to check rather than trust.

**Not done (out of `chapter-author` draft mode's scope):** no Opus audit
pass yet. `tsc`/`lint`/`vitest`/`build` not run - content-only pass.
