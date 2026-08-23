# Chapter spec - 3.7 Sessions & State Management

Authored under CURRICULUM.md §5 (chapter blueprint), §6 (mandatory sections),
§20 (author instructions). Deliverable 1 of the 6 in pending-content.md's
"Per-chapter deliverables". Lives beside the lesson so a reviewer can check the
prose against the intent that produced it.

- Chapter definition: `src/content/chapters/index.ts`
  (`bb-3-7-sessions-and-state-management`)
- Lesson body:
  `public/content/chapters/bb-3-7-sessions-and-state-management.mdx`
- Manifest row: `src/curriculum/manifest.ts`, slug
  `3-7-sessions-and-state-management` (`chapterDefinitionId` flipped from
  `null` to the id above)

**Wave.** Same out-of-plan authoring order as 3.6 - `pending-content.md`
schedules Group B for Wave 4; this is the second Group B chapter authored in
this working tree, immediately after 3.6 (already shipped). No sequencing
rule (§18.2) is violated - the real prerequisite (3.6) is already authored -
only the wave-grouping plan remains out of order relative to actual
authoring order, same open note 3.6's own spec already carried forward.

## 0. Type classification

CURRICULUM §14's own row states no explicit `Type:` field for 3.7, but §16's
own audit note lists 3.6-3.10 among "Concept chapters with no component" -
3.7 is inside that range, so Type: Concept, matching 3.6's own precedent (no
reclassification needed). New: none. Failure modes and Scaling
considerations are therefore optional (§6); see §4 below for how each is
handled. The chapter carries a real, Submit-gated Editor exercise
(a Completion-shaped reconnection fix), so a Practical objective is included
for the same reason 3.6's spec §0 gave - the §5.2 Practical exemption is for
Concept chapters with no buildable exercise at all (0.2, 0.3), not every
Concept chapter categorically.

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Where session state actually goes once it leaves an instance's memory - sticky routing vs. an externalized store - and what each choice costs. |
| Type | Concept (see §0 above). |
| Difficulty | foundational |
| Estimated time | 25 minutes (Reader + Editor combined), per CURRICULUM §14's own row. |
| Prerequisites | 3.6 Stateless Services - the real curriculum-order prerequisite, already shipped in this same working tree. `manifest.ts`'s `prerequisiteSlugs` already pointed at `3-6-stateless-services` before this chapter was authored - no pulled-forward exception needed. |
| Unlocks | 3.8 Horizontal Scaling (this chapter's own forward tease and the immediate next chapter, per `manifest.ts` row order); 3.14 Caching (named as a separate, explicitly-marked advance-organizer mention in-lesson per CURRICULUM's own row for this chapter - not the one tease, see §6 below). |
| Building blocks introduced | None. Matches §16's own note that 3.6-3.10 are intentional no-component Concept chapters. `sql-database` (introduced 1.2) is reused in a second role - session store, not just business-data store - the "same component, second job" pattern §19 names explicitly, using this exact pairing as its own worked example. |
| Stages trained | Part 3's default (stages 2-4) plus a reconnection-style construction stage, distinct from 3.6's config-only stage and every prior topology-build/fix. |
| Interview relevance | High, per §14's own note - the classic "why not just use sticky sessions?" follow-up. |
| Production relevance | Any product where a login, cart, or multi-step flow must survive both a load balancer and autoscaling depends on this - Shopify's checkout flow is the in-lesson example. |

## 2. Learning objectives (§5.2)

Six objectives (§5.2's allowed range is 3-7); all five required categories
represented - Practical included deliberately, per §0 above.

1. **Knowledge** - State the two ways displaced session state can go: pinned
   to the instance that first served it (sticky routing), or moved into a
   store every instance reaches the same way (externalizing).
2. **Knowledge** - Explain the mechanism of sticky routing precisely: the
   load balancer keys its routing decision on a stable client identifier: it
   is a routing change, not a data-location change, and the session data
   itself never moves.
3. **Engineering** - Decide, for a given product's traffic and failure
   profile, whether sticky routing or externalizing is the more honest
   default, and name the cost of each (the chapter's own two-product
   trade-off scenario).
4. **Practical** - Reconnect a starter graph's disconnected SQL Database to
   the Application Server with a request-flow edge, externalizing sessions
   into the store the system already requires, and pass Submit.
5. **Interview** - Answer "why not just use sticky sessions?" without
   dismissing it as strictly wrong, naming its real (if temporary) benefit
   and its real cost.
6. **Communication** - Explain why externalizing here requires no new
   component - the app server's existing database connection does the job -
   rather than assuming a dedicated session store is needed.

Each objective is exercised: 1 by "Pin it, or move it" + quiz Q1; 2 by "How
each one actually works" + quiz Q1; 3 by "Two products, two right answers" +
quiz Q3; 4 by the fix itself + quiz Q4; 5 by "In an interview" + quiz Q2; 6
by "How each one actually works" + "Common mistakes" + quiz Q4.

## 3. Per-beat outline (§5.3, Concept type per §6)

| Beat | Section in the lesson | Notes |
|---|---|---|
| 1-2 Cold open / why this exists | Untitled opening, 2 paragraphs | Directly continues 3.6's own "Next" ("3.7 Sessions & State Management builds the missing half"). Felt failure: the sticky-routing "fix" works until the pinned instance restarts, fails health checks, or gets pruned by an autoscaler - then every pinned user loses everything at once. |
| 3 Think first | "Think first" callout | Prediction prompt: what did sticky routing cost that the load balancer used to give for free. Never graded. |
| 4-5 Mental model + visual explanation | "Pin it, or move it" | One-sentence anchor pair stated before the diagram; primary diagram is a Mermaid flowchart styled as the target topology (client -> LB -> two app-server instances -> shared SQL Database), captioned per §7.2. |
| 6 Core mechanics | "How each one actually works" | Sticky as a load-balancer routing decision (mechanism named precisely: keys on a stable client identifier); externalizing as reuse of the app server's existing 1.2-era database connection for a second job. |
| 7 Internal mechanics | (folded into beat 6) | Same density-driven fold every prior Group B chapter's spec has used. |
| 8 Trade-offs | "Two products, two right answers" | The chapter's required trade-off scenario (§14's own parenthetical: "sticky vs. external, two products") realized as a table plus full both-ways cost accounting, per §11.1's design rule that a trade-off exercise never has a secretly correct option. |
| 9 Failure modes (o) | Folded into "Two products, two right answers" | The asymmetric-failure point (one instance's users lost under sticky vs. every session lost at once if the shared store goes down) is stated in the same paragraph as the trade-off costs, not split into a separate section - optional for Concept, declared per §6's written-justification rule. |
| 10 Scaling (o) | "What changes at scale" | Optional for Concept, kept (not padding): lens 7, and the direct bridge into 3.14's advance-organizer mention - the database's own new double duty is exactly why a faster, purpose-built store eventually replaces it. |
| 11 Production examples | "In production" | Shopify - unused by any prior chapter (checked directly, see §6 below), and the most on-topic example available: cart/session data externalized into a shared store, not a generic "stateless API" framing. |
| 12 Common mistakes | "Common mistakes" | Four: treating sticky as a full fix; assuming externalizing needs a new component; declaring victory without asking what got concentrated; picking one universal answer instead of reading the product's profile. |
| 13 Interview lens | "In an interview" | High relevance. Names the classic follow-up explicitly; mandatory §10.3 senior-answer line built only from this chapter's own vocabulary. |
| 14 Connections + Preview of next | Woven through prose / "Next" (forward) | Backward: 3.6 (direct continuation, quoted), 1.2 (the database connection being reused), 1.3 (trade-off form), 3.4/3.6 (the load balancer's routing decision), 2.3 (Group B's own motivating row) - past §19's >=2. Forward: 3.8 only as the one marked tease (in "Next"); 3.14 named separately as an explicitly-marked advance-organizer mention in "What changes at scale," not counted as a second tease - see §6 below. |
| 15 Recap + knowledge check | "Recap" | Four retrieval anchors. QuizLauncher renders the knowledge check automatically. |
| 16 Transition brief | "Your turn" | States the starter graph (3.6's own passing system, SQL Database now disconnected), the success condition (reconnect it with a request-flow edge, clean Validate, then Submit), and explicitly forecloses the "look for a sticky-session toggle" instinct - there is no such config field anywhere in the registry (see §7 below). |

## 4. Declared omissions and justifications (§6's written-justification rule)

- **No separate Failure modes section.** Optional for Concept (§6). The
  asymmetric-failure point is stated inline in the trade-offs paragraph;
  splitting it into its own section would restate the same point in fresher
  words, which §20.6 forbids.
- **The two-product comparison is realized as an in-lesson table plus prose,
  not a distinct Editor "Trade-off scenario" exercise with its own
  presented graphs to pick between.** §11.1 lists 3.7 as the first
  chapter using that exercise type, but the taxonomy's own mechanism ("2+
  presented graphs/configs, pick per scenario, read reasoning") is satisfied
  by the lesson's table format plus quiz Q3, which presents both products
  and asks the learner to judge the right pairing with full reasoning shown
  either way - the same non-Editor realization 3.6's own spec used for its
  shallower trade-off beat, scaled up to match this chapter's more central
  trade-off. No new Editor-side "present two graphs, pick one" affordance
  exists in the engine, and building one is out of this pass's scope per the
  `chapter-author` skill (content authoring, not engineering) - flagged in
  §12 below for a second reader to confirm this reading of §11.1 is
  reasonable rather than under-delivering the row's own promise.
- **No everyday analogy beyond the diagram itself.** Same minimal-analogy
  choice 1.2/3.1/3.4/3.5/3.6 made; a second competing metaphor would violate
  §5.3 beat 4's "one model per chapter."
- **No §12 nugget devices.** Open decision 5 remains unresolved; this
  chapter is the eighth to omit and declare rather than make the call
  unilaterally.
- **Only one production example**, matching every prior chapter's own
  precedent, not §13's allowed 1-3 - Shopify's session-externalization
  decision is complete on its own.
- **Sticky sessions are explained mechanically but not configurable on
  canvas.** No registry component exposes a session-affinity field (checked
  directly against `src/content/components/config/networking.ts`'s
  `load-balancer` entry - its only field is `algorithm`,
  `round-robin`/`least-connections`). This is the same gap 3.6's own spec
  already declared (§4, "Sticky sessions / session affinity is named but not
  built"); this chapter goes one level deeper on the mechanism in prose
  without pretending the engine can grade a learner's choice of routing
  policy. Stated honestly in the lesson's "How each one actually works"
  section, not just recorded here (§20.2's honesty requirement).

## 5. Diagram (§7)

Primary diagram is a Mermaid **flowchart styled as the target topology**
(client, load balancer, two named app-server instances, one shared SQL
Database) - not the usual sequence-diagram treatment 3.6 used, because this
diagram's content is a static shape (who connects to whom), not an ordering
between two requests over time. This is the same narrow, per-chapter
exception open decision 3 already established for 1.6 and 3.4: the Reader
cannot render a real `ArchitectureGraph` block, so a static topology is
authored as Mermaid, styled to match, and justified because the real
interactive version already exists as this chapter's own
`starterGraph`/`blueprints[0]` once the fix is applied - the lesson diagram
is only the static preview of what the learner actually builds. Captioned
narrowly for this diagram only, per 3.4's own lesson (open decision 3's
"caption for *this* diagram only" guidance).

A `<Walkthrough>` was considered and not used: the diagram shows a static
end-state, not a request being traced step by step, so there is no ordering
to spread across interactive steps - the same reasoning 3.6's own spec gave
for declining a Walkthrough, applied to the opposite diagram type. Flagged
for a second reader in §12.

## 6. Component budget (§16) and cross-reference checks

§16's audit row for 3.7 is absent (same note as 3.6: "3.6-3.10... are
intentional"). No new component, no new edge kind.
`availableComponentIds`/`requiredComponentIds`: the full chain through 3.6 -
`browser`, `dns`, `firewall`, `reverse-proxy`, `api-gateway`,
`load-balancer`, `app-server`, `sql-database` - all required, unchanged from
3.6's own set, consistent with Part 3's running-example philosophy.

**Checked against 2.3's own Group table row for Group B, 2026-08-23 -
matches.** 2.3's row: "Copies of the app tier only work if a request can
land anywhere | 3.6-3.9." This chapter's own content is the direct sequel to
3.6's statement of that constraint - it doesn't restate the constraint
itself, it resolves the fork 3.6 left open, which is exactly what a
second chapter under the same motivating row should do. Second of the six
remaining rows named in open decision 15 to be checked against Group B (3.6
was first); Groups C-G and the rest of Group B remain open as authored.

**On the "3.14" advance-organizer mention (§19, §20.2).** §19 caps forward
*teases* at one per chapter - a tease is an unresolved-pull device, not a
literal chapter-number mention. CURRICULUM's own row for 3.7 explicitly asks
for "an explicit note that a faster store arrives in 3.14 (advance
organizer)," which by definition is not a pull-generating tease: it forecloses
a "why not use something faster?" objection before it forms, rather than
manufacturing curiosity about 3.14 itself. Per the `chapter-author` skill's
own draft-mode instruction ("a tease to a chapter further out is a
*separate*, explicitly-marked 'further out' mention, not a replacement for
the immediate one"), 3.14 is named exactly once, in "What changes at scale,"
clearly marked as "not needed yet" rather than as something to look forward
to. The chapter's one real tease (3.8) is named only in "Next," matching
3.5's and 3.6's own precedent of keeping the single forward-pull device in
that section.

## 7. Validation rules (deliverable 4)

No new rule authored - §14's row names none for 3.7, and no existing rule
teaches session placement directly (verified against
`src/validation-engine/rules/index.ts`). Writing a new rule is out of this
pass's scope per the `chapter-author` skill.

**`orphan-component` is the namesake fault, reused generically rather than
a new session-specific rule.** The starter graph's SQL Database node has
zero incident edges (checked directly against
`src/validation-engine/rules/orphan-component.ts`'s `connectedNodeIds`
predicate: a node with no incident edges and absent from `entryPointIds`
is flagged). This is a real, already-registered, category-agnostic rule -
no new engine work needed - and it fires precisely because the fix this
chapter teaches (reconnect the database) is exactly what clears it.
`missing-input-connection` does not also fire for the same node: its own
guard explicitly skips a node with zero outgoing edges too (see the comment
in that rule's own source), leaving `orphan-component` as the only
issue raised - confirmed by reading both rule files directly, not assumed.

**Third instance for open decision 11's "namesake fault as warning
severity" thread.** `orphan-component` is `severity: "warning"`, so
`runChapterValidation`'s error-count-only `passed` computation (per decision
11) means this chapter's starter graph may show as "Validate: passed" with
one warning listed, the same shape 3.4's and 3.6's own namesake rules
produced. Submit still gates on the blueprint regardless (the SQL Database
must have the app-server edge), so the chapter still teaches "run Validate,
read what it says, fix it" correctly - but this is now the third
consecutive Group A/B chapter whose graded fault is warning-severity, adding
to the same still-unresolved call decision 11 has asked for since 3.4.
Recorded as an addition to decision 11 in `pending-chapters.md`, not a new
numbered decision.

`validationRuleIds`: `["no-direct-client-database", "component-relations",
"orphan-component", "missing-input-connection", "request-flow-cycle"]` -
3.6's own curated set minus `single-instance-load-balancer`, which is not
this chapter's concern (the starter graph already carries 3.6's own
passing `instances: 2`).

## 8. Blueprint and starter graph (deliverable 3, part of it)

One blueprint, `bb-3-7-blueprint`: the full chain (`browser -> dns -> fw ->
proxy -> gateway -> lb -> app -> db`, all `request-flow`), unconstrained on
the `app` alias's own config (3.6 already tested `instances >= 2`; this
chapter's own point is the missing edge, not the instance count, so the
predicate isn't repeated here).

Starter graph: the system as built through 3.6 - browser, DNS, firewall,
reverse proxy, API gateway, load balancer, one Application Server node at
`instances: 2` (3.6's own passing config), one SQL Database - with every
edge present *except* the Application Server -> SQL Database edge. The SQL
Database node sits on canvas with zero edges in or out, matching
`orphan-component`'s exact trigger condition (§7 above).
`entryPointIds: ["bb-3-7-browser"]`.

## 9. Hints (deliverable 3, part of it)

Three, orienting before directional, never the answer (§11.3):

1. *Orienting* - "Validate is naming a component with no connections at all
   - nothing here is about the load balancer's own routing algorithm."
2. *Directional* - "The SQL Database node has no edges in or out. Look at
   what used to connect to it."
3. *Directional* - "Draw a request-flow edge from the Application Server to
   the SQL Database - the same kind of connection 1.2 first taught. There's
   no sticky-session toggle to find anywhere on this canvas; that's not how
   this fix works."

None states which validation rule fires by name, matching every prior
chapter's own discipline. Hint 3 doubles as the mitigation for the "look for
a config toggle that doesn't exist" dead end the lesson's own "Your turn"
section also forecloses in prose.

## 10. Quiz (deliverable 5)

Five questions, ids permanent, ramp 1/1/2/2/3, matching every sibling
chapter's own default.

Q1 tests the mechanism of sticky routing precisely (a routing decision, not
a data-location change) - original, not modeled on a specific bank
question, since no bank question isolates this exact mechanistic point. Q2
models QUIZ_FRAMEWORK.md §9's own bank Q3 (tagged "(3.7)" - reserved for
this exact chapter), reworded with fresh option labels rather than
reproduced verbatim. Q3 is original, built directly against §14's own
"two products" parenthetical - no bank question presents a two-product
comparison, so this is new content built to exercise objective 3. Q4 is
original, exercising objective 6 (no new component needed). Q5 goes one
level past the bank's own Q8 (tagged "3.6-3.7," "where did the state go") -
where 3.6's own Q5 deliberately stopped at "a shared store" without naming
which one (reserving that for this chapter), Q5 here names the concentration
risk of the specific store this chapter's exercise builds, since that's now
taught material.

**Position-clustering check.** Correct options sit at b, d, a, c, b across
all five single-kind questions - all four positions used, "b" the only
repeat (Q1, Q5). Checked against 3.6's own sequence (c, a, d, b, c) to avoid
the sibling-clustering pattern the `chapter-author` skill calls out
explicitly (two chapters both defaulting to the same letter for their first
question) - 3.6 opens on "c," this chapter opens on "b," so the two don't
match at the position most likely to read as a pattern.

Scope check: every question draws on this chapter's own material plus 3.6
(the sticky/externalize fork itself, Q1/Q2), 1.2 (the database connection
being reused, Q4), and 1.3 (trade-off form, Q3) - all already-taught. No
question requires anything from 3.8 onward; "autoscaling" appears in Q3 as
a general engineering term already used in 3.6's own lesson prose, not a
forward-reference to 3.8's formal treatment (per the writing-register
distinction in `reference/draft.md`).

## 11. Playtest pass (deliverable 6, §18.2's binding question)

*"Which prior chapter taught each move this exercise requires?"*

| Move | Taught by |
|---|---|
| Draw a request-flow edge between two nodes on canvas | 1.2's own first build - the same gesture, applied to a connection that's currently missing rather than a graph built from nothing. |
| Run Validate and read a rule's explanation | 0.1's lesson, reused by every build chapter since, most recently 3.6. |
| Recognize that a disconnected component is a real fault, not decoration | `orphan-component` is a newly-encountered rule for the learner, but the underlying idea (every node must do a job or it isn't part of the architecture) is 3.6's own "the database was never the issue... the instances are what have to hold nothing" reasoning, now applied to a database instead of an app-server tier. |
| Decide that reconnecting an existing node, not adding a new one, is the correct fix | New in this chapter, deliberately - the lesson's "Your turn" and hint 3 both state it explicitly, foreclosing the "look for a config toggle" instinct the chapter's own mechanism discussion could otherwise invite. |
| Reason about which of two options (pin vs. move) fits a given product | New in this chapter (the chapter's own core concept), building directly on 3.6's own unresolved fork. |
| State a trade-off in 1.3's "we chose X, accepting Y, because Z" form for a two-option comparison | 1.3 taught the form; 3.6 already applied it to an architectural property; this chapter applies it to a genuine two-sided product comparison for the first time. |
| Reason about what changes at 10x/100x for a specific piece of state | Building on 1.2/3.1-3.6's own 10x/100x reasoning for their respective components/properties (§9 lens 7, optional but included per §4). |

No move is unsourced.

## 12. Items flagged for a second pass

- **The "Trade-off scenario" exercise-type reading (§4).** A second reader
  should confirm that realizing §11.1's own "2+ presented graphs/configs,
  pick per scenario" mechanism as an in-lesson table plus quiz Q3, rather
  than a new Editor-side pick-between-two-graphs affordance, is a faithful
  reading of the taxonomy row rather than an under-delivery of what 3.7 was
  specifically named for in that table.
- **The Mermaid-topology-over-sequence-diagram choice, opposite of 3.6's own
  call (§5).** A second reader should confirm the static end-state diagram
  is the right primary diagram here (versus, say, a two-panel comparison of
  both approaches) and that captioning it narrowly avoids over-claiming what
  a single Mermaid picture can show.
- **Shopify as the production example.** A second reader should confirm this
  reads as a genuine, checkable public claim (stateless app tier, shared
  session/cart store) rather than an unverifiable specific.
- **Word count.** 1,214 words at final draft (`wc -w` on the raw `.mdx`) for
  a 25-minute chapter - below 3.1's 1,398/25min and 3.4's 1,356/25min
  ratios, and below even 3.6's 1,272/20min ratio proportionally. Judged
  content-complete against all six objectives and every mandatory §6
  section (see §3's beat table) rather than short by omission, per §20.6's
  "length follows content" rule - but flagged for a second reader to confirm
  nothing load-bearing was cut short rather than genuinely absent from the
  material.
- **No formal density revision pass performed as a distinct drafting
  round** - the draft was written dense the first time given its already-low
  word count, rather than drafted long and trimmed. Flagged per every prior
  chapter's own precedent of flagging a self-assessed density claim for the
  next reviewer to check rather than trust.

**Not done (out of `chapter-author` draft mode's scope):** no Opus audit
pass yet. `tsc`/`lint`/`vitest`/`build` not run - content-only pass.
