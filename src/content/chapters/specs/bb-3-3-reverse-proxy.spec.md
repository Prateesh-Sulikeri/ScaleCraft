# Chapter spec - 3.3 Reverse Proxy

Authored under CURRICULUM.md §5 (chapter blueprint), §6 (mandatory sections),
§20 (author instructions). Deliverable 1 of the 6 in pending-content.md's
"Per-chapter deliverables". Lives beside the lesson so a reviewer can check the
prose against the intent that produced it.

- Chapter definition: `src/content/chapters/index.ts` (`bb-3-3-reverse-proxy`)
- Lesson body: `public/content/chapters/bb-3-3-reverse-proxy.mdx`
- Manifest row: `src/curriculum/manifest.ts`, slug `3-3-reverse-proxy`
  (`chapterDefinitionId` flipped from `null` to the id above)

**Wave.** Wave 3 (Part 2 + Group A Core Infrastructure), per
`pending-content.md`. Third and final Group A chapter, immediately after 3.2
DNS (same working tree, same session).

## 0. Type classification and the row it's read against

CURRICULUM §14's own row for 3.3 states no explicit `Type:` field (same
shape as 3.2's row, unlike 3.1's "Concept with a small build"). Classified
**Building Block** here, same reasoning 1.2/3.1/3.2 used for the identical
tension: the row's own "New: `reverse-proxy`" line introduces a real
registry component, and the row's own exercise is "build from skeleton" - a
genuine construction-family build, §4's Building Block definition exactly.
This makes Failure modes and Scaling considerations mandatory rather than
optional (§6), and both are genuinely present in this chapter's own
content, not merged away for padding.

**"Build from skeleton" realized as a Completion exercise, not a new
exercise shape.** The starter graph is correctly wired end to end except
for one missing node - the same "fault is pure absence" shape 3.1 and 3.2
each used for their own exercise, adapted here to a gap in the *middle* of
an existing chain rather than at either end. No new exercise taxonomy is
needed; §14's own wording ("build from skeleton") describes the same
mechanic from the content side.

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | The single-front-door pattern; what a proxy absorbs (TLS, compression, static serving) and why one entry point makes everything behind it swappable. |
| Type | Building Block (see §0 above). |
| Difficulty | foundational |
| Estimated time | 20 minutes (Reader + Editor combined), per CURRICULUM §14's own row. |
| Prerequisites | 3.2 DNS - the real curriculum-order prerequisite, already shipped in this same working tree. `manifest.ts`'s `prerequisiteSlugs` already pointed at `3-2-dns` before this chapter was authored - no pulled-forward exception needed, same shape 3.1 and 3.2 each reported for their own prerequisite. |
| Unlocks | 3.4 Load Balancer (this chapter's own immediate forward tease, CURRICULUM's own "an LB is a reverse proxy with a job"); 3.5 API Gateway (marked further-out tease); every later chapter that assumes a single, swappable front door already exists. |
| Building blocks introduced | `reverse-proxy`. Matches §16's audit row for 3.3 exactly. No new edge kind - the component's own registry contract accepts only `request-flow`, so this chapter (unlike 3.2 and 3.4) does not hit the `control`-edge gap open decision 8 names. |
| Stages trained | Part 3's default plus stage 2 (construction) - the fifth real build in the curriculum, after 1.2, 3.4, 3.1, and 3.2. |
| Interview relevance | Medium, per §14's own note - loop step 4 (high-level design), resurfacing at step 6 as a 502-diagnosis scenario. |
| Production relevance | Almost every internet-facing service sits behind exactly this pattern - one address, an arbitrary and changing number of things actually answering behind it. |

## 2. Learning objectives (§5.2)

Six objectives (§5.2's allowed range is 3-7); all five required categories
represented (Building Block, so Practical is not exempt).

1. **Knowledge** - State what a reverse proxy does when a request arrives
   and why one address in front of many backends makes the backend
   swappable.
2. **Knowledge** - Distinguish a reverse proxy from a forward proxy by
   which side it stands in front of.
3. **Engineering** - Decide what cross-cutting work belongs at the proxy
   layer (TLS termination, compression, static serving) versus a different
   layer entirely.
4. **Practical** - Add a Reverse Proxy to a starter graph between the
   firewall and the app tier, wire it correctly, and pass Submit.
5. **Interview** - Diagnose a healthy-backends-but-502-at-the-edge failure
   and state the first hypothesis in under a minute.
6. **Communication** - Explain, in 1.3's trade-off language, why one front
   door trades a single point of failure and an extra hop for backend
   swappability and centralized cross-cutting concerns.

Each objective is exercised: 1 by "One address, many things behind it" +
quiz Q2; 2 by "Common mistakes" + quiz Q1; 3 by "What happens when a
request arrives" + quiz Q3; 4 by the build itself; 5 by "In an interview" +
quiz Q5; 6 by "What one front door buys, and what it costs" + quiz Q4.

## 3. Per-beat outline (§5.3, Building Block type per §6)

| Beat | Section in the lesson | Notes |
|---|---|---|
| 1-2 Cold open / why this exists | Untitled opening, 2 short paragraphs | Directly continues 3.2's own already-shipped "Next" tease verbatim quoted, then names 2.3's Group A pressure and picks up "routed" - the one word of the triple 3.1 ("admitted") and 3.2 ("resolved") had not yet spent. Felt pressure: swapping the app server for several, differently-built ones, and asking what a client outside the network would need to know. |
| 3 Think first | "Think first" callout | Prediction prompt: what a client outside the network would need to change if the number of app servers behind today's one address doubled. Never graded. Pays off implicitly across the whole chapter - the answer ("nothing") is the chapter's own thesis. |
| 4-5 Mental model + visual explanation | "One address, many things behind it" | One-sentence anchor ("nobody outside ever learns how many machines, or what's running on them, actually answer") stated before the diagram, primary diagram (Mermaid, §5 below) immediately after, per §8.1. |
| 6 Core mechanics | "What happens when a request arrives" | Host/path matching, forwarding to the matched upstream. Explicitly points at 2.1's own already-priced TLS-termination trade-off rather than re-deriving it (see §4 below on the near-miss this avoided), then names compression and static serving as the two further things centralized here. |
| 7 Internal mechanics | (folded into beat 6) | Not split into its own section at this chapter's density, same reasoning 3.1/3.2's specs each gave for the identical fold. |
| 8 Trade-offs | "What one front door buys, and what it costs" | Genuine two-sided call, both costs and benefits named without hedging: swappability and centralized maintenance vs. an extra hop and a new single point of failure. Explicitly notes neither cost disappears by adding more proxies (tees up 3.4 without teaching it). |
| 9 Failure modes | "When the front door can't reach what's behind it" | **Mandatory for Building Block (§6).** References 2.2's already-taught "nothing downstream ever sees it" failure class for DNS/firewall, then adds the new failure this chapter owns: a 502/504 with healthy backends, caused by the proxy's own stale upstream config. Directly exercises quiz Q5 and the bank's own Q11. |
| 10 Scaling | "At scale, one box becomes the ceiling" | **Mandatory for Building Block (§6).** One paragraph, deliberately short: fine at 10x, the proxy itself becomes the ceiling at 100x or once a second backend group exists - the felt limitation 3.4 resolves (§18.2 rule 3's binding requirement that every advanced topic emerge from one). |
| 11 Production examples | "In production" | Google's Front End (GFE) - a public, decision-level claim (one address in front of nearly every Google service, terminating TLS and routing by hostname) chosen because 2.1/3.1/3.4 already used Cloudflare (twice) and AWS, and 3.2 already used Netflix - see §4 below for the full reasoning behind avoiding those four. |
| 12 Common mistakes | "Common mistakes" | Four: confusing reverse with forward; letting one client bypass the proxy "just once" (breaks swappability); treating the proxy as authentication (draws the same line 3.5 will formalize); assuming one proxy scales itself (tees up 3.4). |
| 13 Interview lens | "In an interview" | Medium relevance. Names loop step 4 and its step-6 resurfacing explicitly. Mandatory §10.3 senior-answer line built only from this chapter's own and prior-chapter vocabulary (502 diagnosis, the auth/rate-limiting boundary) - no forward reference. |
| 14 Connections + Preview of next | Backward references woven through prose (2.1, 2.2, 2.3, 1.3, 3.1, 3.2) / "Next" (forward) | Backward: 2.1 (stop-table row and TLS trade-off table, both referenced not re-taught), 2.2 (failure-class vocabulary), 2.3 (Group A pressure), 1.3 (trade-off reflex, named explicitly in the objective and the trade-offs section) - at least four explicit connections, exceeding §19's >=2. Forward: 3.4 in "Next" (immediate, matches manifest, quoting CURRICULUM's own "an LB is a reverse proxy with a job") plus 3.5 as a separately marked further-out tease inside "Next" itself - see §6 below on the two-tease divergence. |
| 15 Recap + knowledge check | "Recap" | Four retrieval anchors. QuizLauncher renders the knowledge check automatically. |
| 16 Transition brief | "Your turn" | States the starter graph (browser, DNS, firewall from 3.2, correctly wired; app server and database, correctly wired; nothing connecting the two halves), the success condition (Reverse Proxy added and wired into the gap, clean Validate, then Submit), and what's withheld (which specific check fires). |

## 4. Declared omissions and justifications (§6's written-justification rule)

- **TLS termination is referenced, never re-derived.** The single biggest
  authoring risk in this chapter, checked directly against 2.1's own
  shipped lesson body before writing a word of "What happens when a
  request arrives": 2.1's walkthrough already shows the Reverse Proxy
  terminating TLS and forwarding inward, and its own "Where TLS ends"
  section already carries the full two-row trade-off table (edge
  termination vs. re-encrypting inward, buys and spends both ways,
  explicitly in 1.3's trade-off language). This chapter states the fact
  ("2.1 already worked the TLS side of this in full") and moves straight to
  what it adds (compression, static serving, the routing decision itself)
  rather than restating a table that already exists. This is the same
  class of near-duplication 3.2's own process note caught for TTL/DNS
  content - caught here before drafting, by reading 2.1's actual lesson
  body first, not after a first draft repeated it.
- **No config predicate gates `terminatesTls` on Submit**, unlike 3.1's
  firewall gate. 2.1's own table presents both termination choices as
  genuinely defensible depending on whether the internal network is
  trusted - gating Submit on one value would contradict 2.1's own
  even-handed framing. Same reasoning 3.2's spec gave for leaving its DNS
  TTL field ungated (open decision 11's precedent): a real, context-
  dependent trade-off with no universally wrong default doesn't get a
  blueprint gate. The component's own default (`terminatesTls: true`)
  matches what 2.1's walkthrough already showed, so a learner who never
  touches the field lands on the same answer 2.1 already taught, without
  the blueprint needing to enforce it.
- **Host/path-based routing to multiple distinct backend pools is
  described at concept level, not exercised.** The buildable graph wires
  exactly one backend group, because the curriculum's running example has
  only ever had one. Recorded in `curriculumContext.simplifications` per
  §20.2's honesty requirement, and stated in-lesson ("the proxy routes to
  a single backend group in this build") per open decision 10's own
  lesson (a `simplifications` entry alone is not a disclosure surface -
  the Reader never renders it).
- **Authentication and rate limiting are named only to be excluded.**
  CURRICULUM §14's own 3.5 row exists specifically to "disambiguate the
  confused trio reverse proxy / LB / gateway the moment all three exist."
  Naming what this chapter's component does *not* do (in "Common mistakes"
  and the interview lens) draws that boundary a chapter early, matching
  §18.2 rule 2's forward-reference discipline (marked, not assumed) rather
  than silently letting the proxy's job blur into the gateway's.
- **No everyday analogy beyond the "one address, many things behind it"
  framing this chapter itself introduces.** Same minimal-analogy choice
  1.2/3.1/3.4 made; a second competing metaphor (a receptionist, a mail
  forwarding service) would violate §5.3 beat 4's "one model per chapter."
- **No second (failure-scenario) diagram.** "When the front door can't
  reach what's behind it" states the 502 failure in prose; the failure is
  a config mismatch, not a topology, so it isn't really diagram-shaped -
  same reasoning 3.1's and 3.2's specs each gave for the identical
  omission.
- **No §12 nugget devices.** Open decision 5 remains unresolved as of
  3.2's own instance of it (2026-08-22); this chapter is the seventh to
  omit and declare rather than make the call unilaterally.
- **Only one production example**, matching 3.1/3.2/3.4's own precedent,
  not §13's allowed 1-3. Google's GFE is a complete, decision-level example
  on its own, and a second company for the same single decision (one
  front door absorbing TLS and routing) would restate, not add (§20.6).
  **Company selection reasoning, checked against every prior chapter's own
  ledger entry:** Cloudflare is spent twice already (2.1, 3.4, per 3.4's
  own ledger note explaining why 3.1 avoided a third use); AWS is spent
  once (3.1); Netflix is spent once (3.2, immediately prior); Google
  itself is spent once (2.1, for QUIC) but for a genuinely different
  decision, and with two fresh companies (AWS, Netflix) authored between
  that use and this one - judged acceptable rather than reaching, unlike a
  third Cloudflare use would have been. Flagged in §12 for a second reader
  to confirm this reads as acceptable diversity rather than a repeat.

## 5. Diagram (§7, open decision 3)

**Sixth instance of the same narrow exception 1.6, 3.4, 2.3 (implicitly),
3.1 and 3.2 established.** The Reader still cannot render a ScaleCraft
graph-JSON topology inline (open decision 3 remains open). The primary
diagram is Mermaid, styled as the target topology (`browser -> dns ->
firewall -> reverse-proxy -> app-server -> sql-database`), captioned
narrowly for this diagram only, per every prior chapter's own captioning
discipline. Unlike 3.2's diagram, this one carries no buildability caveat -
every edge shown is the real, buildable `request-flow` kind, since
`reverse-proxy`'s registry contract has no `control`-edge tension to
disclose (see §1's building-blocks row above).

## 6. Component budget (§16) and the forward-tease divergence

§16's audit row for 3.3 is `reverse-proxy`, no new edge kind.
`availableComponentIds`/`requiredComponentIds`: `browser`, `dns`,
`firewall`, `reverse-proxy`, `app-server`, `sql-database` - `client`
deliberately excluded even though it remains available from 1.2
cumulatively, matching every prior Building Block chapter's "no optional
piece" precedent.

**Forward-tease divergence from 3.1's single-tease shape, same pattern
3.2 used.** CURRICULUM §14's own row for 3.3 names two forward connections
in its "Prepares for" field: 3.4 ("an LB is a reverse proxy with a job")
and 3.5. §19 permits "at most one tease per chapter, always marked" - the
sanctioned pattern (0.2/1.3, 0.3/1.11, 3.2/3.15) is one immediate tease
plus one separately marked further-out tease when a chapter's own brief
calls for it. 3.3 follows that pattern: 3.4 is the immediate "Next" tease
(matches the manifest's actual next chapter, quoting CURRICULUM's own
framing so the tease reads as inherited language, not invented), and 3.5
is named in the same "Next" section but explicitly marked "two chapters
out," which is honestly *closer* than 3.2's own further-out tease to 3.15
- flagged in §12 for a second reader to confirm two chapters still reads
as clearly non-immediate rather than blurring into a second unmarked
dependency.

**Verified against open decision 12's stop-table row for this chapter.**
2.1's own table gives the reverse proxy "The single front door: terminates
TLS, routes by host or path | 3.3." Both halves hold as written: this
chapter's mental model is explicitly "one address... for whatever is
actually behind it" (the front-door half) and "What happens when a
request arrives" states routing by host and path as the proxy's actual
mechanism (the second half) - no change needed to 2.1's row. See the
update to decision 12 in `pending-chapters.md`.

**Verified against open decision 15's Group A pressure line.** 2.3's own
row reads "traffic has to be resolved, admitted and routed before your
code sees it." This chapter's cold open explicitly states "Routed is this
chapter," the third and final word of the triple after 3.1's "Admitted"
and 3.2's "resolved" - all three words of 2.3's own sentence are now
individually spent, one per chapter, in the order 2.3 wrote them.

## 7. Validation rules (deliverable 4)

No new rule authored - §14's row names none for 3.3, and no existing rule
teaches anything reverse-proxy-specific (verified directly against
`src/validation-engine/rules/index.ts` - no rule in the registry mentions
proxying or routing). Curated set:

- **`no-direct-client-database`**, **`component-relations`**,
  **`orphan-component`**, **`missing-input-connection`**,
  **`request-flow-cycle`** - the same structural set 3.1/3.2 curated,
  guarding the fixed state (a learner could plausibly wire the new proxy
  node past the firewall, or skip it entirely, reconnecting the firewall
  straight to the app server).
- **`permissive-firewall` deliberately excluded**, unchanged from 3.2's
  own reasoning - the starter graph's inherited Firewall node is already
  configured `defaultPolicy: "allow-listed"`, carried forward unchanged
  from 3.1/3.2's own precedent, and this chapter doesn't teach firewall
  configuration.

**A learner who reconnects the firewall directly to the app server,
skipping the proxy, still passes every curated Validate rule** - nothing
in the structural set specifically requires a reverse proxy to exist.
This is not a gap: Submit gates on the blueprint, which requires the
`proxy` alias, so a bypassed proxy fails Submit even with a clean
Validate. Same shape 3.1's spec noted for its own config-only gate
(Validate and Submit can diverge on purpose) - flagged here for a second
reader since this is the first chapter where the divergence is topological
rather than a config value.

`validationRuleIds`: `["no-direct-client-database", "component-relations",
"orphan-component", "missing-input-connection", "request-flow-cycle"]`.

## 8. Blueprint and starter graph (deliverable 3, part of it)

One blueprint, `bb-3-3-blueprint`: `browser -> dns -> firewall ->
reverse-proxy -> app-server -> sql-database`, all edges `request-flow`.
Single right answer at this scale, matching every prior Building Block
chapter's own "one target shape" precedent. No config predicate (see §4
above for why `terminatesTls` is left ungated).

Starter graph: browser, DNS, and firewall - 3.2's own blueprint prefix,
correctly wired to each other exactly as 3.2 shipped it - plus app server
and database, correctly wired to each other exactly as every prior chapter
has shipped that pair. The firewall has no outgoing edge; the app server
has no incoming edge. Nothing here is illegally connected; the fault is
pure absence in the *middle* of an otherwise-complete chain, which is what
makes this a **Completion** exercise (§11.1) - matches CURRICULUM §14's
own "build from skeleton" wording, read as this chapter's own name for the
same mechanic 3.1/3.2 used. `entryPointIds: ["bb-3-3-browser"]`, since
the browser node is present and entry-capable from the start (unlike 3.2's
own starter graph, which had no entry-capable node until the learner added
one) - the gap this chapter's exercise fills sits in the middle of the
chain, not at its entry.

## 9. Hints (deliverable 3, part of it)

Three, orienting before directional, never the answer (§11.3):

1. *Orienting* - "Validate is telling you the firewall's output has
   nowhere to go yet, and the app server has nothing feeding it. One node
   fills both gaps at once."
2. *Directional* - "Add a Reverse Proxy node from the picker (`/` or
   right-click) and wire it between the Firewall and the Application
   Server - firewall to proxy, proxy to app server."
3. *Directional* - "Both new edges carry real traffic - request-flow, the
   same kind you've used since 1.2. Nothing about this component's config
   needs to change from its default."

None states which validation rule fires by name, and hint 3 deliberately
tells the learner not to touch `terminatesTls` rather than explaining why
- matching §11.3's "orienting, not the answer" discipline while still
being honest that the field exists (it's visible in the config panel
either way).

## 10. Quiz (deliverable 5)

Five questions, ids permanent, ramp 1/1/2/2/3, matching every sibling
chapter's own default. All five are `single`-kind.

Q1 is modeled on QUIZ_FRAMEWORK.md §8's own Q4 (the bank's published
forward-vs-reverse-proxy example) - reworded with fresh distractors rather
than reproduced. Q5 is modeled on the bank's own Q11 (the 502-with-
healthy-backends scenario, explicitly tagged "(3.3)" in the bank itself) -
reworded and given four fresh options rather than the bank's own three
distractors plus correct answer. Q2, Q3, and Q4 are original: Q2 tests the
architectural-job distinction against the three neighboring components'
jobs (DNS, load balancer, gateway - all named by number so the learner
locates each elsewhere rather than confusing them); Q3 tests the TLS
boundary this chapter deliberately doesn't re-derive (§4 above); Q4 tests
the trade-off judgment directly, in 1.3's own language.

**Position-clustering check.** Correct options sit at c, a, d, b, c - all
four positions used, "c" the only repeat (twice of five), matching
3.1's own one-repeat pattern rather than 3.2's zero-repeat one. Checked by
eye per the chapter-author skill's own instruction (the invariant test is
per-chapter, not registry-wide).

Scope check: every question draws on this chapter's own material plus 2.1
(TLS trade-off, referenced not re-taught, Q3), 1.3 (trade-off language,
Q4), and forward-pointing-by-name-only references to 3.2/3.4/3.5 (Q2) that
name which chapter owns a *different* job without teaching that chapter's
content - the same "named, not explained" discipline every prior
cross-reference in this curriculum has used. No question requires
anything from 3.4 onward to be understood, only to be named.

## 11. Playtest pass (deliverable 6, §18.2's binding question)

*"Which prior chapter taught each move this exercise requires?"*

| Move | Taught by |
|---|---|
| Open the component picker and place a component | 0.1's tour, reused without a new tour in every build chapter since. |
| Connect two components and set an edge's kind | 0.1's tour - same gesture, no new UI. |
| Run Validate and read a structural explanation | 0.1's lesson and Fix exercise, reused by every build chapter since, most recently 3.2. |
| Recognize that a correctly-wired chain with one node missing from the middle is missing that node, not miswired | New in this chapter - 3.1 and 3.2 each taught the "fault is absence" shape at one end of the chain (nothing feeding in, or nothing fed out); this is the first time the gap sits between two already-correct halves. Built directly on both prior chapters' own version of the idea. |
| Reason about a new component's job in a topology it hasn't been in before | 1.2/3.1/3.2 - the browser-through-database shape this chapter extends is exactly what 3.2 shipped. |
| Reason about a new failure mode a new component introduces | 2.2 already taught the "nothing downstream ever sees it" failure class for DNS/firewall; this chapter adds the proxy's own signature failure (502 with healthy backends), building on that same vocabulary rather than introducing failure reasoning from scratch. |
| Reason about what changes at 10x/100x for a routing layer specifically | New in this chapter (§9 lens 7), building on 1.2/3.1/3.2's own 10x/100x reasoning for their respective components. |
| State a trade-off in 1.3's "we chose X, accepting Y, because Z" form for a new component | 1.3 taught the form; this chapter is the first to require applying it to a component the learner just built rather than one narrated for them. |

No move is unsourced.

## 12. Items flagged for a second pass

- **The TLS-reference boundary (§4).** The single most load-bearing
  judgment call in this chapter - a second reader should confirm "2.1
  already worked the TLS side of this in full" reads as a genuine
  reference rather than a hand-wave, and that nothing in "What happens
  when a request arrives" quietly re-teaches content 2.1 already owns.
- **The two-tease divergence and "two chapters out" wording (§6).** A
  second reader should confirm marking 3.5 "two chapters out" (closer than
  3.2's own "several chapters out" to 3.15) still reads as clearly
  non-immediate rather than as a second unmarked forward dependency
  alongside 3.4.
- **Google as the production example, given 2.1 already used it once for
  a different decision (§4).** A second reader should confirm this reads
  as acceptable diversity (two fresh companies authored in between) rather
  than reaching for a company already spent.
- **The bypass-the-proxy Validate/Submit divergence (§7).** A second
  reader should confirm a learner who reconnects the firewall directly to
  the app server gets a clean Validate but a Submit failure whose
  blueprint-drift message is legible, not confusing (open decision 11
  already flagged blueprint-drift copy as weak for a duplicate-node case;
  this is a different case - a missing node, not a duplicate one - but
  worth checking the message reads sensibly here too).
- **Word count.** 1,227 words at final revision (`wc -w` on the raw
  `.mdx`). Proportionate to 3.2's 1,159 words for the same 20-minute
  estimate - slightly higher, consistent with this chapter carrying one
  more failure-mode paragraph (the 502 scenario) than 3.2's own failure
  section needed.
- **No density revision pass performed as a distinct drafting round** -
  written once against §20.6 directly, aiming to reference rather than
  restate 2.1's TLS content from the first draft rather than catching it
  in a rewrite (unlike 3.2's own process, which caught its duplication
  after a first draft). Flagged per every prior chapter's own precedent of
  flagging a self-assessed density claim for the next reviewer to check
  rather than trust.

**Not done (out of `chapter-author` draft mode's scope):** no Opus audit
pass yet. `tsc`/`lint`/`vitest`/`build` not run - content-only pass.
