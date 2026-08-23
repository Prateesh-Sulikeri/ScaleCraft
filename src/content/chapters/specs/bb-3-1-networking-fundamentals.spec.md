# Chapter spec - 3.1 Networking Fundamentals

Authored under CURRICULUM.md §5 (chapter blueprint), §6 (mandatory sections),
§20 (author instructions). Deliverable 1 of the 6 in pending-content.md's
"Per-chapter deliverables". Lives beside the lesson so a reviewer can check the
prose against the intent that produced it.

- Chapter definition: `src/content/chapters/index.ts` (`bb-3-1-networking-fundamentals`)
- Lesson body: `public/content/chapters/bb-3-1-networking-fundamentals.mdx`
- Manifest row: `src/curriculum/manifest.ts`, slug `3-1-networking-fundamentals`
  (`chapterDefinitionId` flipped from `null` to the id above)

**Wave.** Wave 3 (Part 2 + Group A Core Infrastructure), per
`pending-content.md`. Part 2 (2.1-2.3) is complete; this is the first Group A
chapter and the first chapter authored since the ledger's open decisions 12,
13 and 15 flagged what earlier chapters (2.1, 2.3) had already pre-committed
about it.

## 0. Type classification and the row it's read against

CURRICULUM §14's own row calls this "Type: Concept with a small build" -
not one of §4's five literal types. Following 1.2's own precedent for the
same tension (its §14 row implied Process; the chapter spec classified it
Building Block instead, with a written reason), this chapter is classified
**Building Block**: it introduces one real registry component (`firewall`,
§16's audit row), and its exercise is a genuine construction-family build
(completion + a real, Submit-gated config check), which is exactly §4's
Building Block definition ("Introduces 1-3 registry components... Full:
build/completion/fix, the default") rather than Concept's "no (or minimal)
new topology." Classifying it Building Block also means Failure modes and
Scaling considerations are mandatory rather than optional (§6) - both are
genuinely present in this chapter, not merged away, so the stricter
classification serves the content rather than padding it.

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Just enough networking to reason about everything above it: IP/ports, TCP vs. UDP at concept level, TLS termination (what the handshake buys, not where it should end - 2.1 already taught that trade-off), and the trust perimeter. |
| Type | Building Block (see §0 above). |
| Difficulty | foundational |
| Estimated time | 25 minutes (Reader + Editor combined), per CURRICULUM §14's own row. |
| Prerequisites | 2.3 Evolution of Modern Architectures - the real curriculum-order prerequisite. First Group A chapter with no pulled-forward exception needed: `manifest.ts`'s `prerequisiteSlugs` already pointed at `2-3-evolution-of-modern-architectures` before this chapter was authored. |
| Unlocks | 3.2 DNS (this chapter's own forward tease); every later edge component (3.3-3.5), which all assume a perimeter exists without re-teaching it. |
| Building blocks introduced | `firewall`. Matches §16's audit row for 3.1 exactly. |
| Stages trained | Part 3's default plus stage 2 (construction) - the third real build in the curriculum, after 1.2 and 3.4 (pulled forward). |
| Interview relevance | Medium - loop steps 4 (high-level design) and 6 (bottlenecks and failure), per §14's own note. |
| Production relevance | Every internet-facing system sits behind some default-deny boundary, self-hosted or managed (a cloud security group, at minimum) - this is table stakes before anything else in Group A. |

## 2. Learning objectives (§5.2)

Six objectives (§5.2's allowed range is 3-7); all five required categories
represented (Building Block, so Practical is not exempt the way Concept
chapters have been).

1. **Knowledge** - State what a firewall's `defaultPolicy` decides and why
   an allow-all policy filters nothing.
2. **Knowledge** - Distinguish TCP from UDP at the concept level and state
   why most request-response traffic needs TCP's delivery guarantees.
3. **Engineering** - Decide between default-deny and default-allow for a
   perimeter and name the real cost either way.
4. **Practical** - Add a Firewall to a starter graph between the client and
   the app tier, configure a real filtering policy, and pass Submit.
5. **Interview** - State, in under a minute, what a firewall is and is not
   protecting against.
6. **Communication** - Explain why a permissive firewall is a configuration
   bug rather than a topology bug, and what that implies about validating
   configuration alongside structure.

Each objective is exercised: 1 by "The trust perimeter" + "Two policies,
both real, one usually wrong here" + quiz Q1/Q2; 2 by "What it's actually
filtering" + quiz Q3; 3 by "Two policies, both real, one usually wrong
here"; 4 by the build itself; 5 by "In an interview"; 6 by "When the
perimeter itself breaks" + quiz Q5.

## 3. Per-beat outline (§5.3, Building Block type per §6)

| Beat | Section in the lesson | Notes |
|---|---|---|
| 1-2 Cold open / why this exists | Untitled opening, 3 short paragraphs | Directly continues 2.3's own planted seed ("3.1 Networking Fundamentals starts there, at the perimeter, with the first component whose entire job is deciding which traffic never gets in"). The felt pressure: every prior chapter's system has one address and nothing decides whether traffic reaching it is even allowed to. |
| 3 Think first | "Think first" callout | Prediction prompt: the simplest rule to put in front of every system, once. Never graded. |
| 4-5 Mental model + visual explanation | "The trust perimeter" | One-sentence anchor (bouncer, not lock) + the primary diagram, Mermaid per §5 below. Diagram precedes the prose that explains it (§8.1); captioned on what the firewall removes rather than adds. |
| 6 Core mechanics | "What it's actually filtering" | IP/port/protocol as the three fields a firewall decides on, TCP vs. UDP at concept level, and how the two connect (a policy is a one-sentence rule over exactly these fields). |
| 7 Internal mechanics | (folded into beat 6) | The TLS-handshake paragraph is the "one level down" - what the handshake buys, and why a firewall generally can't see inside it (a real, load-bearing distinction that sets up 3.3/3.5's different job). Not split into its own section at this chapter's density (§20.6), same precedent 3.4's spec §4 recorded for the same reason. |
| 8 Trade-offs | "Two policies, both real, one usually wrong here" | Genuine two-sided call: default-deny (operational tax per new service, nothing reaches the inside by omission) vs. default-allow (free onboarding, everything unblocked gets through). Both costs named; the lesson still states default-deny is right almost everywhere for a perimeter specifically, which is honest, not a false-balance dodge - §20.2 permits stating which side wins when the domain genuinely favors one. |
| 9 Failure modes | "When the perimeter itself breaks" | **Mandatory for Building Block (§6).** Two failure shapes, both attributed to the firewall doing exactly what it's configured to do: silent-open (`allow-all`, no alert) and loud-closed (a forgotten rule after a deploy, indistinguishable from any other outage to the user). |
| 10 Scaling | "At scale, the rule list is the system" | **Mandatory for Building Block (§6).** Lens 7 explicitly: 10x costs nothing extra (a lookup); 100x makes the rule list itself something to review, version and trust. Names the real production answer (managed per-service policies, AWS security groups by name) without teaching it as a new component. |
| 11 Production examples | "In production" | AWS Security Groups - a public, decision-level, default-deny-by-default claim. Chosen over Cloudflare deliberately: both 2.1's and 3.4's own "In production" sections already used Cloudflare, and a third use in as many chapters would read as reaching for the same company rather than the best-fit one for this decision. |
| 12 Common mistakes | "Common mistakes" | Four: leaving the default permissive; treating the firewall as authentication; setting rules once and never revisiting them; assuming the perimeter is the only defense (sets up Q5's defense-in-depth judgment). |
| 13 Interview lens | "In an interview" | Medium relevance. Names loop steps 4 and 6 explicitly; mandatory §10.3 senior-answer line built only from this chapter's own vocabulary (default-deny, allow-list, TCP, address/port/protocol - no DNS/reverse-proxy/gateway terms). |
| 14 Connections + Preview of next | "Recap" (backward) / "Next" (forward) | Backward: 2.1 (named the firewall as one of "the edge" stops and taught the TCP+TLS connect-phase cost this chapter references, not re-teaches), 2.3 (this chapter's opening line is 2.3's own closing line), 1.2 (the three-tier baseline the firewall now sits in front of) - three explicit connections, exceeding §19's >=2. Forward: 3.2 DNS, this chapter's one tease, and also the manifest's actual next chapter - no divergence to declare, unlike 3.4's pulled-forward tease. |
| 15 Recap + knowledge check | "Recap" | Four retrieval anchors. QuizLauncher renders the knowledge check automatically. |
| 16 Transition brief | "Your turn" | States the starter graph (client, app server, database - nothing between client and app server), the success condition (a wired-in Firewall with a real filtering policy, clean Validate, then Submit), and what's withheld (which rule fires and how many findings, same discipline 3.4 established). |

## 4. Declared omissions and justifications (§6's written-justification rule)

- **No separate "internal mechanics" section.** The TLS-handshake paragraph
  is folded into beat 6 ("What it's actually filtering") rather than split
  into its own section - at this chapter's density, splitting it would
  restate "a firewall can't see inside an encrypted channel" across two
  headers instead of stating it once at full strength (§20.6). Same
  reasoning 3.4's spec §4 gave for the identical omission.
- **No everyday analogy beyond the one-line "bouncer, not a lock" framing**
  in the mental-model beat - same minimal-analogy choice 1.2/3.4 made; the
  diagram carries the concrete shape.
- **No second (failure-scenario) diagram.** "When the perimeter itself
  breaks" states both failure shapes in prose, which reads faster than a
  second Mermaid diagram would justify at this chapter's density budget -
  same reasoning 1.6/3.4 gave for the same omission. Neither failure shape
  is really diagram-shaped anyway: one is an absence (nothing to draw), the
  other is a config value on an otherwise-correct topology.
- **No §12 nugget devices** (Interview / Production / Engineering boxed
  one-liners). Open decision 5 is still unresolved as of 2.3's own
  instance of it; this chapter is the fifth to omit and declare rather than
  make the call unilaterally. The decision itself stays open.
- **Only one production example**, matching 3.4's own precedent (also one)
  rather than §13's allowed 1-3 - AWS Security Groups is a complete,
  decision-level example on its own, and a second company for the same
  single decision (default-deny by default) would be restatement, not new
  information (§20.6).
- **Where TLS terminates is deliberately not re-taught.** 2.1's own "Where
  TLS ends" section already delivered the full edge-vs-app-server trade-off
  table, with the "In 1.3's terms" framing. Re-deriving it here would
  violate §20.6 (restating a point already made) and blur which chapter
  owns which piece of TLS - this chapter owns what a handshake buys
  (encryption, identity); 2.1 owns where it should end. The lesson names
  this split explicitly ("2.1 already priced the round trips; what matters
  here is what the handshake buys").

## 5. Diagram (§7, open decision 3)

**Fourth instance of the same narrow exception 1.6, 3.4 and (implicitly, via
its four stage diagrams) 2.3 established.** The Reader still cannot render a
ScaleCraft graph-JSON topology inline (open decision 3 remains open) - even
though every node in this chapter's diagram (`client`, `firewall`,
`app-server`, `sql-database`) is now a real, unlocked registry component,
the limitation is in the rendering pipeline, not in whether the components
are "real" yet. The primary diagram is therefore Mermaid, styled as the
target topology (`client -> firewall -> app-server -> sql-database`, with an
"outside/inside" subgraph boundary around the firewall), captioned narrowly
for this diagram only, per 1.6/3.4's own captioning discipline (no claim
about how `request-flow` behaves in general). The real interactive version
is the chapter's own `starterGraph`/blueprint, unlike Part 2's chapters
where no interactive version exists at all.

## 6. Component budget (§16)

§16's audit row for 3.1 is `firewall`, no new edge kind. This chapter is
`firewall`'s home. `availableComponentIds`/`requiredComponentIds`: `client`,
`firewall`, `app-server`, `sql-database` (the first, third and fourth
already available from 1.2, `firewall` newly introduced here), both lists
identical - matches 1.6/3.4's "no optional piece" precedent, since every
component has a specific job in the required blueprint. Nothing from
3.2-3.5 leaks in even as scenery.

## 7. Validation rules (deliverable 4)

No new rules authored - all six needed already exist and were verified
directly against `src/validation-engine/rules/`:

- **`permissive-firewall`** - the chapter's namesake rule. Reads the
  Firewall's own `defaultPolicy` config field directly (no topology
  involved) and fires when it equals `"allow-all"`. Severity `warning`, so
  (per open decision 11's own precedent) it does not by itself fail
  Validate's `passed` computation - the blueprint's config predicate (§8
  below) is what actually gates Submit.
- **`no-direct-client-database`**, **`component-relations`**,
  **`orphan-component`**, **`missing-input-connection`**,
  **`request-flow-cycle`** - the same structural/reused-concept set
  1.6/3.4 curated, included here as guards on the fixed state (a learner
  could plausibly mis-wire the new firewall straight past the client to the
  database, or skip it entirely) rather than because this chapter teaches
  anything new about them.

`validationRuleIds`: `["permissive-firewall", "no-direct-client-database",
"component-relations", "orphan-component", "missing-input-connection",
"request-flow-cycle"]`.

## 8. Blueprint and starter graph (deliverable 3, part of it)

One blueprint, `bb-3-1-blueprint`: `client -> firewall -> app-server ->
sql-database`, all edges `request-flow`. Single right answer at this scale,
matching 1.6/3.4's own "one target shape" precedent.

**The blueprint's `fw` node carries a config predicate** (`defaultPolicy
neq "allow-all"`), verified directly against `pattern.ts`'s
`ConfigPredicate`/`nodeMatchesPredicates` - a node whose config fails the
predicate simply can't bind that alias, so a firewall left at `allow-all`
makes the whole pattern fail to match even though the topology is otherwise
correct. This is a deliberate departure from 3.4's own precedent (there,
the namesake warning-severity rule did NOT gate Submit, because both
algorithm choices were genuinely defensible - see 3.4's spec §8 note 1 and
`pending-chapters.md`'s open decision 11). Here there is exactly one
correct answer (don't leave the perimeter permissive), so gating Submit on
it is honest rather than arbitrary - CURRICULUM §14's own row calls this
exercise "config (`permissive-firewall` rule teaches config-level
failure)," which this reads as a real check, not a lesson-only one.

Starter graph: client, app server, and database, correctly wired to each
other with `request-flow` edges - the exact three-tier baseline every
learner has already built (1.2). No firewall present. Nothing here is
illegally connected; the fault is pure absence, which is what makes this a
**Completion** exercise (§11.1) rather than a Fix - matches CURRICULUM
§14's own "Exercise: completion (add firewall)."

**One design note on the config half of the exercise.** The Firewall
component's own default `defaultPolicy` value is `"allow-listed"` (not
`"allow-all"`) - so a learner who drags a Firewall onto the canvas and
wires it correctly, touching no config at all, already passes both
Validate and Submit. The config lesson is real (the blueprint's predicate
and the `permissive-firewall` rule both exist and both work, verified
against the actual `pattern.ts`/`permissive-firewall.ts` source, not
assumed), but it only bites a learner who actively sets the field to
`allow-all` - out of curiosity, or because the lesson's "give it a policy
that actually filters something" phrasing invites checking what the other
options do before landing on one. This is an honest design, not a gap: the
"Common mistakes" bullet and Q2 both exist so a learner who never triggers
it on canvas still meets the failure mode in prose and assessment.

## 9. Hints (deliverable 3, part of it)

Three, orienting before directional, never the answer (§11.3):

1. *Orienting* - "Validate names what's connected and what isn't. Right now
   the client reaches the app server with nothing in between deciding
   whether it should."
2. *Directional* - "Add a Firewall node from the picker (`/` or
   right-click) and wire it between the Client and the Application Server."
3. *Directional* - "Open the Firewall's config panel and check
   `defaultPolicy`. One of the three options filters nothing at all - it's
   the one this chapter's own rule is named for."

None states which validation rule fires or what the correct config value
is by name - matches 1.6/3.4's precedent.

## 10. Quiz (deliverable 5)

Five questions, ids permanent, ramp 1/1/2/2/3. Q1 and Q2 are modeled on
QUIZ_FRAMEWORK.md §8's own Q1 and Q2 (the bank's already-published examples
for this exact chapter and rule) - reworded with fresh distractors rather
than copied verbatim, matching every other chapter's practice of modeling
on, not reproducing, bank content. Q3, Q4 and Q5 are original: Q3 tests
TCP-vs-UDP judgment (not in the bank), Q4 tests the TLS-handshake concept
distinct from 2.1's termination-location material, Q5 tests the
defense-in-depth judgment "Common mistakes" sets up and doubles as the
chapter's one High/Medium-relevance interview-shaped question at difficulty
3.

**Position-clustering check.** All five questions are `single`-kind (no
`diagram`/`matching`/`ordering` this chapter - QUIZ_FRAMEWORK doesn't
mandate format variety, only content-ramp and position variety). Correct
options sit at b, c, a, d, b - all four positions used, "b" the only
repeat (Q1 and Q5, twice of five), checked by eye. The chapter's own first
question (Q1) opens at "b", which is already heavily used by siblings
(0.4/1.3/1.4/3.4) - flagged below in §12 as a real judgment call rather
than an oversight, since every other letter was also already a repeat and
the actual constraint (§1 point 6 of QUIZ_FRAMEWORK, the per-chapter
invariant test) only forbids within-chapter clustering, not cross-chapter
repetition, which is a by-eye-only check per the chapter-author skill's
own note.

Scope check: every question draws on this chapter's own material plus 2.1
(TLS round-trip cost referenced, not re-taught; QUIC named once, matching
2.1's own naming of it) and 1.2 (three-tier baseline, referenced not
re-taught). No question requires anything from 3.2-3.5 or later.

## 11. Playtest pass (deliverable 6, §18.2's binding question)

*"Which prior chapter taught each move this exercise requires?"*

| Move | Taught by |
|---|---|
| Open the component picker and place a component | 0.1's tour, reused without a new tour in 1.2 and 3.4. |
| Connect two components and set an edge's kind | 0.1's tour - same gesture, no new UI. |
| Run Validate and read a structural explanation | 0.1's lesson and Fix exercise, reused by every build chapter since. |
| Read a config-value explanation (a warning tied to one field, not the topology) | New in this chapter - no prior chapter's namesake rule reads a config field with zero topology involved (3.4's namesake rule is structural; `permissive-firewall` is pure config). Flagged below in §12 for a second reader. |
| Reason about a component's job in a topology it hasn't been in before | 1.2 - the three-tier shape is the baseline this chapter extends, not replaces. |
| Reason about a new failure mode a new component introduces | Building on 1.2/3.4's own single-point-of-failure reasoning (§9 lens 5), applied to a component whose failure is invisible rather than loud. |
| Reason about what changes at 10x/100x for a perimeter specifically | New in this chapter (§9 lens 7), building on 1.2/3.4's own 10x/100x reasoning for their respective components. |
| Distinguish TCP from UDP and state what a TLS handshake buys | New in this chapter, deliberately scoped away from 2.1's own TLS-termination material (see §4). |

No move is unsourced.

## 12. Items flagged for a second pass

- **The config-gated blueprint (§8).** This is the first chapter whose
  Submit gate includes a `ConfigPredicate`, not just topology - verified
  directly against `pattern.ts`, but a second reader should confirm the
  mechanism actually behaves as described (a `defaultPolicy: "allow-all"`
  firewall genuinely fails the blueprint match) rather than trusting the
  source-reading alone, since this pass did not run the pipeline.
- **The Firewall's safe default (§8's design note).** A second reader
  should confirm the "Common mistakes" bullet and Q2 are pulling their full
  weight as the place most learners actually meet the permissive-firewall
  failure mode, since the starter graph and default config value mean the
  canvas exercise alone won't reliably surface it.
- **Q1's opening letter ("b").** Flagged honestly rather than silently
  left: every letter is now a repeat across siblings (0.4/1.3/1.4/3.4 at
  b, 2.1 at c, 2.2 at d, 2.3 at a), so this chapter can't introduce a fifth
  distinct opening letter. "b" was chosen only because Q1's correct
  distractor genuinely read best in that position, not because the
  cross-chapter check was skipped.
- **AWS Security Groups production example.** A second reader should
  confirm this stays a decision-not-company claim and doesn't drift toward
  implementation tourism.
- **Word count.** 1,398 words at draft (`wc -w` on the raw `.mdx`, no
  embedded JSON/JSX components to inflate the count the way 3.4's
  Walkthrough does). Proportionate to 3.4's ~1,333 prose words for 35
  minutes, scaled down for this chapter's 25.
- **No density revision pass performed as a distinct drafting round** -
  written once against §20.6 directly. Flagged per every prior chapter's
  own precedent of flagging a self-assessed density claim for the next
  reviewer to check rather than trust.

**Not done (out of `chapter-author` draft mode's scope):** no Opus audit
pass yet. `tsc`/`lint`/`vitest`/`build` not run - content-only pass.
