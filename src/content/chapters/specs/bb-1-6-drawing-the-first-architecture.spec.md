# Chapter spec - 1.6 Drawing the First Architecture

Authored under CURRICULUM.md §5 (chapter blueprint), §6 (mandatory sections),
§20 (author instructions). Deliverable 1 of the 6 in pending-content.md's
"Per-chapter deliverables". Lives beside the lesson so a reviewer can check the
prose against the intent that produced it.

- Chapter definition: `src/content/chapters/index.ts`
  (`bb-1-6-drawing-the-first-architecture`)
- Lesson body: `public/content/chapters/bb-1-6-drawing-the-first-architecture.md`
- Manifest row: `src/curriculum/manifest.ts`, slug
  `1-6-drawing-the-first-architecture` (`chapterDefinitionId` flipped from
  `null` to the id above)

**Wave.** Sixth and final chapter of Wave 2 Part 1 (`pending-content.md`).
1.1-1.5 are authored on this same branch; no wave-gate re-check needed, this
is a continuation of an in-progress wave, not a new one.

**First Building Block chapter, not Concept/Process.** Every chapter so far
this wave (1.1-1.5) was Concept or Process with `hasEditorExercise: false`
and empty `availableComponentIds`/`blueprints`/`validationRuleIds`. This one
is CURRICULUM §4's Building Block type: real components, a real starter
graph, a real Fix exercise, and (per §6's mandatory-section table) Failure
modes and Scaling become **mandatory**, not optional - the first chapter in
this wave where that's true.

## 0. Blocking decision resolved before drafting (user-directed, 2026-08-09)

`pending-chapters.md`'s open decision #3 names 1.6 by name as blocked: §7.2
requires topology diagrams to be authored as ScaleCraft graph JSON so they
render in the product's own visual language, but `MarkdownRenderer.tsx`
(checked directly) has no block type for `ArchitectureGraph` JSON - only
`MermaidBlock` exists. 1.6 is a Building Block chapter whose primary diagram
(beat 5) is exactly a topology.

**Resolved for this chapter, not for §7.2 in general.** Asked the user
directly rather than working around it silently (this ledger's own standing
policy for open decisions). Chosen: author the primary diagram as Mermaid,
styled as the target topology (three labeled boxes, `request-flow` edges),
captioned per §7.2's caption rule. This is a narrow, declared exception to
§7.2's "graph JSON" preference, justified because the *real* interactive
version of this exact topology already exists and is what the learner
actually manipulates - the chapter's `starterGraph` and `blueprints[0]` below
are genuine `ArchitectureGraph`/`GraphPattern` values that render in the
canvas, get simulated, and get validated for real. The lesson-body diagram is
only the static preview shown before the prose that explains it (§8.1); it is
not the chapter's only or primary encounter with the topology.

**Not yet resolved:** whether §7.2 itself should be amended (e.g., a
sanctioned Mermaid-topology exception, or new engineering work to add a
graph-JSON markdown block). That remains open decision #3's job, and 3.4
(Load Balancer, later this wave) will need its own version of this same call
when it's authored - flagged in `pending-chapters.md` rather than assumed
settled by this precedent alone.

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Produce the minimal viable architecture from requirements: three components, one each for receiving a request, deciding what to do with it, and storing the result - and understand why the deciding step can never be skipped. |
| Type | Building Block. |
| Difficulty | foundational |
| Estimated time | 30 minutes (Reader + Editor combined), per CURRICULUM §14's own row - the first Part 1 estimate that includes real build time, not just Reader + knowledge check. |
| Prerequisites | 1.5 Numbers Every Engineer Should Know. |
| Unlocks | 1.7 Identifying Bottlenecks directly (a design with real components to find bottlenecks in); every later Building Block chapter, which all extend this three-tier shape rather than replace it; every RWE project's Phase A high-level design. |
| Building blocks introduced | `client`, `app-server`, `sql-database`; edge kind `request-flow`. Matches §16's audit row for 1.6 exactly - 3 components (the budget ceiling) and 1 new edge kind. |
| Stages trained | Part 1's default (§2) plus, for the first time, stage 2 (construction) - this is the first real build in the curriculum beyond 0.1's fix-it-loop tour. |
| Interview relevance | High - this is loop step 4 (§10.1): the first architecture, drawn before any deep dive. |
| Production relevance | Every production system, at any scale, still separates these three jobs somewhere - the shape doesn't go away as a system grows, more components get added around it. |

## 2. Learning objectives (§5.2)

Six objectives (§5.2's allowed range is 3-7); all five required categories
represented, plus a second Engineering objective specifically for the two
newly-mandatory beats (Failure modes, Scaling) this chapter type requires
that 1.1-1.5 didn't carry.

1. **Knowledge** - State the job each of the three primitive components does
   (client: issue the request; app server: mediate access and run business
   logic; database: durable storage) and why the app server sits between the
   other two.
2. **Engineering** - Decide why a client should never connect directly to a
   database, naming the concrete risk (unmediated access bypasses
   authentication, authorization, and business rules).
3. **Engineering** - Identify what breaks first in a one-app-server design
   (§9 lens 5) and state, qualitatively, what changes at 10x and 100x
   traffic (§9 lens 7).
4. **Practical** - Fix a starter graph that skips the app server: add the
   missing component, route both edges through it, and pass a clean
   Validate then Submit.
5. **Interview** - Produce a defensible first architecture (loop step 4) for
   a simple product in under a minute, naming each component's job as you
   draw it.
6. **Communication** - Explain, in your own words, why the
   `no-direct-client-database` validation failure fires and what it is
   protecting against.

Each objective is exercised: 1 by "The minimal shape" + "What each box does"
+ quiz Q1; 2 by "Why the database never talks to the client directly" + quiz
Q2/Q3; 3 by "What breaks first" + quiz Q4/Q5; 4 by the build itself; 5 by
"In an interview"; 6 by the build's Validate-read-fix cycle + quiz Q3.

## 3. Per-beat outline (§5.3, Building Block type per §6 - note Failure modes
and Scaling are now **M**, not "o")

| Beat | Section in the lesson | Notes |
|---|---|---|
| 1-2 Cold open / why this exists | Untitled opening, 2 short paragraphs | The felt pressure: the interviewer asks for the architecture after 1.1-1.5's groundwork, and most candidates either freeze or jump straight to naming a database before establishing what the boxes need to do. Beat 2 states why this exists: every real system does exactly three jobs regardless of scale, and naming a product before naming the jobs skips the question that decides whether the design is defensible. |
| 3 Think first | "Think first" callout | Prediction prompt: the fewest number of boxes a *real* working system needs, not a toy. Never graded. |
| 4-5 Mental model + visual explanation | "The minimal shape" | One-sentence anchor (three jobs, three boxes) + the primary diagram, per §0 authored as Mermaid rather than graph JSON. Diagram precedes the prose that explains it (§8.1); captioned on the one thing to notice (no edge skips the middle box). |
| 6 Core mechanics | "What each box does" | Three short entries, one per component, plus what `request-flow` means as an edge kind (synchronous - the sender waits on a response). |
| 7 Internal mechanics | "Why the database never talks to the client directly" | The one level down: mediation named concretely (who is asking, are they allowed, is the request itself legal), and the direct tie to `no-direct-client-database` firing the moment that edge exists on canvas. |
| 8 Trade-offs | "One instance, for now" | Genuine two-sided call: one app-server instance is the simplest correct answer for today's estimated scale (calls back to 1.4/1.5's numbers) and is also, honestly, the whole system's single weak point - which the next section names directly. |
| 9-10 Failure modes + Scaling | "What breaks first" | **Both mandatory for Building Block (§6)**, merged into one section since they're one continuous idea here (§6 permits merging adjacent short sections). Names lens 5 explicitly (an app-server crash answers nothing at all; a database crash still gets requests, they just all error - not the same failure) and lens 7 explicitly (10x: the app server runs out of headroom first; 100x: one instance can't serve the load, and something new is needed to route across more than one - a marked forward tease to 3.4, this chapter's one allowed further-out tease per §19). |
| 11 Production examples | "In production" | Instagram's early product: one app tier, one primary Postgres database, millions of users - the three-tier shape carrying real load because it hadn't yet hit its own ceiling, not because it was clever. Fresh example, distinct from 1.2's Basecamp, 1.3's S3, 1.5's Meta. |
| 12 Common mistakes | "Common mistakes" | Four: naming a product before naming the three jobs; wiring client straight to database "to save a hop"; assuming an app-server crash and a database crash fail identically; believing more app-server instances alone fixes the single point of failure. |
| 13 Interview lens | "In an interview" | High relevance. Names loop step 4 (0.4) explicitly; mandatory §10.3 senior-answer line built only from this chapter's own vocabulary. |
| 14 Connections + Preview of next | "Next" | Backward: 0.4 (loop step 4), 1.4 (the traffic estimate) and 1.5 (the latency ladder), all three named in "Next" itself. **Corrected by the Opus pass:** the draft's "Next" carried no backward references at all and the spec claimed §19 was cleared by references sitting in beats 8 and 13 instead; §19 scopes the >=2 to beat 14, and 1.4/1.5 both put them there. Forward: immediate-next preview to 1.7 (mandatory, distinct from the further-out 3.4 tease already spent in beat 9-10). |
| 15 Recap + knowledge check | "Recap" | Four retrieval anchors. QuizLauncher renders the knowledge check automatically. |
| 16 Transition brief | "Your turn" | States the starter graph's fault (client wired straight to the database, app server missing) without naming which rule will fire, names the success condition (clean Validate, then Submit), and states what's withheld: how many separate messages one bad edge produces is not previewed - reading and acting on Validate's own explanation is the exercise, same discipline 0.1 established. |

## 4. Declared omissions and justifications (§6's written-justification rule)

- **Failure modes and Scaling - present, not omitted.** Unlike every prior
  Part 1 chapter, §6 makes both mandatory for Building Block. No omission to
  justify; noted here only to make the type-driven change explicit for a
  reviewer comparing this spec's shape to 1.1-1.5's.
- **No everyday analogy in the mental-model beat** - same choice
  0.3/0.4/1.1-1.5 made. The three-jobs framing is already concrete (receive,
  decide, store map directly onto the three components about to appear on
  canvas); a physical analogy would add a translation step the diagram
  itself doesn't need.
- **No simulator trace in the exercise, despite §14's 1.6 row.** §14 reads
  "Exercise: build + fix + simulator trace"; the chapter ships build + fix
  only. Added by the Opus pass - the draft neither built it nor declared the
  gap. Not resolved here, because adding a trace step is exercise/engineering
  work, not content: the Fix exercise as authored already exercises every
  learning objective, and the simulator is not wired into the chapter flow.
  Recorded as §14 drift in `pending-chapters.md`, the same class of doc-vs-
  shipped mismatch as open decision #1 (§14's 0.1 row).
- **No second (failure-scenario) diagram.** §7.1 lists a dedicated
  before/during/after failure diagram as typically homing in the Reliability
  group and RWE stretch content, not Part 1's first build. §7.2 caps at one
  primary diagram per chapter with supporting diagrams only where they
  genuinely add what prose can't; "What breaks first" is two short,
  sequential facts (app-server crash vs. database crash) that read faster as
  two sentences than as a second Mermaid diagram would justify at this
  chapter's density budget.

## 5. Simplifications (transcribed to `curriculumContext.simplifications`)

- Only one app-server instance is ever in scope this chapter. The
  `instances` config field exists on the component (default 1) but the
  chapter does not ask the learner to touch it - running more than one
  instance, and what has to change to make that safe, is 3.4's job.
- "Mediation" (auth, authorization, business rules) is named as the app
  server's job, not implemented as real mechanics. What authentication or
  authorization actually consist of is out of this chapter's scope entirely
  - the point here is only that some layer must own that job and the client
  must not be it.
- The database is discussed as a single, undifferentiated store. SQL vs.
  NoSQL, replication, and read replicas are all later material (3.11, 3.12)
  and are not previewed here beyond the one marked 3.4 tease, which is about
  routing traffic, not storage.

## 6. Component budget (§16)

§16's audit row for 1.6 is exactly `client`, `app-server`, `sql-database` +
edge kind `request-flow` - this chapter is each component's home chapter, not
an exception. `availableComponentIds`/`requiredComponentIds`: all three, both
lists identical (the exercise requires using every available component - a
minimal three-tier build has no optional piece). No components appear in the
palette ahead of their home chapter; nothing from 3.x leaks in even as
scenery, unlike 0.1's declared exception for these same three ids (that
exception was narrow-and-scenery-only and is fully retired by this chapter
performing the real, formal introduction it always deferred to).

## 7. Validation rules (deliverable 4)

No new rules authored - all five needed already exist and are reused, not
extended:

- **`no-direct-client-database`** - the chapter's namesake rule (§14's own
  text: "the validation explanation is deliberately their first encounter
  with the core product loop"). Fires on the starter graph's `client ->
  sql-database` edge regardless of edge kind (the rule checks endpoints, not
  kind - see its own module comment on why a kind filter would be an
  evasion bug).
- **`component-relations`** - fires on the *same* edge for an independent,
  generic reason. **Corrected by the Opus pass:** the draft attributed this
  to `sql-database`'s input contract alone. Both endpoint contracts actually
  reject the edge - `client.relations.outputs.allowedCategories` is
  `["networking", "compute"]` (no `data`), and
  `sql-database.relations.inputs.allowedCategories` is `["compute",
  "caching"]` (no `networking`) - but `component-relations.ts` tests
  `!outputCategoryOk` first in its `detail` precedence chain, so the message
  the learner actually reads names the **Client's own output rules**, not the
  database's input rules. The overlap with `no-direct-client-database` is
  still intentional and still documented in `data.ts`'s own config comment;
  only the attribution was wrong. The learner sees two explanations for one
  edge: a generic categorical reason and a specific, named one. Both are real
  findings, not duplication - flagged in §12 below for a second reader to
  confirm this reads as reinforcing rather than confusing on a first real
  build.
- **`orphan-component`**, **`missing-input-connection`**,
  **`request-flow-cycle`** - the same three structural rules 0.1 curated,
  for the same reason: they fire on graph coherence, not on any concept
  this chapter hasn't taught, so none of them can surface an idea ahead of
  its home chapter. **Corrected by the Opus pass:** the draft claimed
  `missing-input-connection` is what reports the absent `app-server`. It
  cannot - the rule iterates `graph.nodes`, and `app-server` is not in the
  starter graph, so it returns zero findings there (the `client` declares
  `inputs: []` and is skipped; the `sql-database` has an incoming edge). The
  absent `app-server` is reported by `runChapterValidation`'s
  `missingRequiredComponentIds` check over `requiredComponentIds`
  (`chapter-outcome.ts`), which Validate surfaces independently of any rule.
  All three rules still earn their curation as guards on the intermediate
  states this fix passes through: `orphan-component` fires the moment the
  learner drops an unwired `app-server` on canvas, `missing-input-connection`
  fires if they then wire `app-server -> sql-database` without wiring the
  client into it, and `request-flow-cycle` catches a back-edge to the client.

`validationRuleIds`: `["no-direct-client-database", "component-relations",
"orphan-component", "missing-input-connection", "request-flow-cycle"]`.

## 8. Blueprint and starter graph (deliverable 3, part of it)

One blueprint, `bb-1-6-blueprint`: `client -> app-server -> sql-database`,
both edges `request-flow`. Single right answer at this scale - CURRICULUM
§14's own row describes one target shape, not a multi-approach chapter (that
pattern is reserved for RWE Phase B and Checkpoint R3 per the `Blueprint`
type's own doc comment).

Starter graph (deliberately broken, matching 0.1's own "two real, distinct
issues" pattern, not "find the bug" blind per §11.1):

1. `app-server` is absent entirely - a required component with nothing on
   canvas satisfying it.
2. The one edge present runs `client -> sql-database` directly, kind
   `request-flow` (the only kind a client may legally emit at all, per its
   own `relations.outputs.allowedKinds`) - so the edge is not illegal
   because of its *kind*, only because of what it connects. This is the
   more realistic and more instructive fault: an author who only checked
   "is this edge kind legal" would miss it entirely, which is exactly
   `no-direct-client-database`'s own module comment's stated reason for
   checking endpoints unconditionally on kind.

## 9. Hints (deliverable 3, part of it)

Three, orienting before directional, never the answer (§11.3):

1. *Orienting* - "Validate names what's on the canvas and what's missing.
   Of the three jobs - receive, decide, store - which one has no component
   doing it yet?"
2. *Directional* - "The picker (`/` or right-click) has all three
   components available. The missing one belongs between the two already
   present, not beside them."
3. *Directional* - "A `request-flow` edge already runs straight from the
   client to the database. Once the missing piece is placed, decide what
   happens to that edge rather than leaving it where it is."

None states which validation rule fires or what the fix looks like once
found - each only narrows where to look, matching 0.1's own precedent.

## 10. Quiz (deliverable 5)

Five questions, ids permanent, ramp 1/1/2/2/3 (matching 0.2-1.5's
convention). Q2 is modeled on QUIZ_FRAMEWORK §6's own Q7 - the bank's
explicit, already-published example for this exact chapter and rule
("the first validation rule the learner ever meets (1.6,
`no-direct-client-database`)") - reworded and re-laid-out rather than
copied verbatim, matching every other chapter's practice of modeling on,
not reproducing, bank content.

**Q1 · single · 1** (correct at `b`). What is the app server's job in the
three-tier shape you just built? Distractors: durable storage (that's the
database), issuing the original request (that's the client), and "both
storing and issuing" (conflates two other components' jobs into one that
does neither correctly).

**Q2 · diagram · 1** (modeled on QUIZ_FRAMEWORK §6 Q7). A shown graph:
client -> app-server -> sql-database (both `request-flow`), plus a second
edge client -> sql-database (`request-flow`). Which edge should not exist,
and why? Correct: the direct client-to-database edge, because it bypasses
the app server's authentication, authorization, and business logic - the
exact fault the chapter's own starter graph ships with, so passing this
question and passing the build test the identical piece of reasoning from
two different angles.

**Q3 · single · 2** (correct at `a`). Why does `no-direct-client-database`
fire on a client-to-database edge regardless of what kind the edge is
given? Correct: the rule checks which components an edge connects, not
what kind it's labeled - a `request-flow` edge is just as illegal as any
other kind, because the problem is the missing mediation, not the edge's
label. Distractors: a kind-based claim ("only `async` edges are checked"),
a directionality claim ("it only fires if the database initiates it" -
inverted and nonsensical given the database has no legal path to a
client), and a component-count claim ("it only fires once other rules have
already passed" - false, rules are independent).

**Q4 · single · 2** (correct at `c`). Today's design has exactly one
app-server instance. It crashes. What happens? Correct: nothing responds
at all - the app server is the only path to the database, so its absence
is total, not partial. Distractors: "reads keep working, only writes fail"
(no basis - there is no separate read path), "the database serves cached
responses" (no cache exists yet, that's 3.14), and "clients fall back to a
direct database connection" (a deliberate callback trap - nothing in this
architecture, or in any architecture that keeps `no-direct-client-database`
passing, permits that fallback).

**Q5 · single · 3** (correct at `d`). Traffic grows 100x using only
today's three components. What's the first real limitation? Correct: the
single app-server instance can't serve the load, and nothing yet decides
how to split traffic across more than one - textually supported by "What
breaks first"'s own 10x/100x reasoning, not asserted only here.
Distractors: "the database fails first" (plausible-sounding but contrary
to what the lesson actually establishes: the app server saturates first),
"the client can't send requests fast enough" (clients aren't the
bottleneck in this shape), and "nothing changes, the shape still works"
(directly contradicted by the chapter's own Scaling beat).

**Position-clustering check** (the bug 0.1/0.2 shipped once). Four
single-kind questions (Q1, Q3, Q4, Q5); correct options sit at b, a, c, d -
four distinct positions, checked by eye.

Scope check: every question draws on this chapter's own material plus
1.4/1.5 (the scale numbers referenced, already taught) and 0.4 (loop step
4, named not tested). No question requires anything from 1.7 onward.

## 11. Playtest pass (deliverable 6, §18.2's binding question)

*"Which prior chapter taught each move this exercise requires?"*

| Move | Taught by |
|---|---|
| Open the component picker and place a component | Tour steps from 0.1 (`open-picker`, `picker-tour`) - no tour runs in 1.6 itself, but the gesture was taught once already and 0.1's lesson names both entry points (`/` or right-click) |
| Connect two components and set an edge's kind | 0.1's tour (`fix-component`, `fix-edge`) - same gesture, no new UI |
| Run Validate and read a structural explanation | 0.1's lesson ("What validation actually does") and its own Fix exercise - the exact skill this chapter's Your turn reuses on a new fault |
| Recognize a validation failure as teaching content, not a score | 0.1's "Four ways to make this harder" bullet 1 |
| Reason about which component does which of three jobs | New in this chapter - the three-jobs framing is the material being taught, not assumed |
| Reason about single points of failure and what changes at 10x/100x | New in this chapter (§9 lenses 5, 7) - first explicit appearance; 1.1-1.5 had no system yet to apply either lens to |
| Recall the read:write ratio and scale numbers referenced in "One instance, for now" | 1.4 (the 1000:1 ratio, confirmed as the running case study's real number) and 1.5 (the latency ladder, referenced implicitly by "headroom" language, not by name) |
| Answer a `diagram`-kind quiz question | Verified real and working per `pending-chapters.md`'s own note on 0.2's ledger (Playwright-checked at `/dev/diagram-question-lab`, zero console errors) - first chapter to actually *author* one, though the UI was already confirmed functional before this chapter existed |

No move is unsourced. **Sequencing risk noted:** unlike 0.1, no tour walks
1.6's Fix exercise - the hint stack (§9 above) and the validation
explanations are the learner's only support, which is the intended
difficulty step up from 0.1 (a tour-guided fix) to a real, unguided one.

## 12. Items flagged for a second pass

Raised by the Sonnet draft for a second reader (Opus's audit scope now
explicitly includes blueprints, component lists, and submit validations for
Building Block chapters, so several of these are exactly what that pass
should check first):

- **The double-explanation on one edge (§7).** `no-direct-client-database`
  and `component-relations` both fire on the starter graph's one bad edge.
  Intentional and pre-existing (see `sql-database`'s own config comment),
  but this is the first chapter where a learner actually experiences it in
  a real exercise rather than as a documented design note - a second reader
  should confirm two stacked messages reads as reinforcing rather than
  confusing on someone's first real Fix exercise.
- **Mermaid-for-topology exception (§0).** Confirmed with the user directly
  before drafting, not inferred. A second reader should confirm the spec's
  framing (real interactive topology exists via `starterGraph`/blueprint;
  the lesson diagram is a static preview only) is the right way to record
  this rather than reading as working around §7.2 silently.
- **3.4 forward tease (§3, beat 9-10).** This is 1.6's one allowed
  further-out tease (§19). A second reader should confirm no earlier
  Part 1 chapter has already spent a tease on 3.4 (checked against
  `pending-chapters.md`'s own per-chapter tease records at draft time - none
  found - but worth a second look since 3.4 is about to be authored this
  same wave).
- **Word count.** [filled in after the lesson is written below - see the
  ledger entry for the final figure and its comparison to 1.1-1.5's].

## 13. Opus proofread pass (2026-08-09)

Scope: content, content-structure, blueprints, component lists, submit
validations, diagrams. Quiz, hints, and
`problemStatement`/`learningObjectives`/`curriculumContext` were out of scope
and left untouched. `lessonVersion` 1 -> 2.

**Changed (four lesson edits, two spec corrections):**

1. **Diagram caption (§7.2).** Was: "`request-flow` only ever runs client to
   app server to database - no edge skips the middle box. That is not a
   stylistic choice; it is the one rule this chapter's exercise checks." Two
   defects. First, it states a false *general* rule about the edge kind -
   `request-flow` legally runs between many pairs, and 3.4's client -> load
   balancer -> app server contradicts it directly; §7.2 warns that learners
   absorb edge semantics from every diagram they see. Second, "the one rule
   this chapter's exercise checks" is false (five rules are curated, and the
   starter graph's single bad edge trips two of them) and it contradicts this
   spec's own beat-16 withholding, which deliberately does not preview how
   many messages one bad edge produces. Rewritten to scope the claim to this
   diagram and drop the count.
2. **Instagram production example (§13, beat 11).** Was: "one application
   tier and a single primary Postgres database, serving millions of users
   ... The trade-off they accepted was exactly the one above: simplicity, in
   exchange for a single point of failure." Overclaimed: by the time
   Instagram served millions of users it ran many Django app servers behind a
   load balancer with Postgres split across machines, and it was not carrying
   a single point of failure at that scale. Rewritten to the defensible and
   better-teaching version - Instagram launched on exactly this shape, then
   grew by scaling the shape rather than replacing it - with a closing line
   that keeps §9 lens 9's guard against reading the example as "so you should
   too."
3. **"Next" backward connections (§19).** The section previewed 1.7 and named
   no prior chapter. §19 requires >=2 explicit prior-chapter connections in
   beat 14, and 1.4/1.5 both do this in "Next" itself. Added a backward
   paragraph naming 0.4, 1.4 and 1.5, matching those two chapters' shape.
4. **Senior-answer line vocabulary (§10.3).** "the first thing to saturate"
   -> "the first thing to run out of headroom". The lesson body never uses
   "saturate", "headroom" is the phrase it does use (and 1.4 already used it),
   and saturation is 1.7's material per §14. This spec's beat-13 note claims
   the senior line is built only from this chapter's own vocabulary; it now is.

Spec corrections are marked inline in §3 (beat 14) and §7 - both were factual
claims about the engine that do not survive reading the rule implementations.

**Checked and deliberately left alone:**

- **Blueprint.** `bb-1-6-blueprint`'s `require` is honest and is *not*
  satisfied by `starterGraph` (no `app-server` node, neither required edge
  present), so the exercise is not handed over solved. Correct edge kinds.
- **Component lists.** `availableComponentIds` == `requiredComponentIds` ==
  `["client", "app-server", "sql-database"]`, exactly §16's 1.6 row, with
  nothing leaking in. This really is the home chapter; no exception needed.
- **Submit validations.** All five ids resolve in
  `validation-engine/rules/index.ts`. Traced against the actual starter graph:
  `no-direct-client-database` and `component-relations` both fire on the one
  edge (two findings), the other three return zero there, and Validate reports
  the missing `app-server` via `missingRequiredComponentIds`. So the exercise
  is genuinely gated on what it claims - the spec's *narrative* about which
  mechanism does what was wrong, the curation was not.
- **The two-stacked-messages flag (§12).** Left as authored. Two findings on
  one edge is the correct product behavior, the lesson deliberately declines
  to preview the count, and the two explanations say different things (one
  generic and categorical, one specific and named). No change.
- **Mermaid-for-topology exception (§12).** Holds under a second read. It is
  the only diagram in the chapter, nothing in the lesson claims a graph-JSON
  diagram exists, and the framing is genuine rather than a workaround: the
  learner reaches the same topology as a real `ArchitectureGraph` inside the
  chapter, and the lesson explicitly points forward to building it.
- **3.4 forward tease (§12).** Confirmed first spend - no earlier Part 1
  ledger entry teases 3.4.
- **§6 mandatory sections.** Failure modes and Scaling are both genuinely
  present in "What breaks first", not gestured at, and the merge is §6-legal.
  §9 lenses 1, 5 and 7 all appear explicitly.
- **"Next" names 1.7**, matching `manifest.ts`. No em dash anywhere.
- **"route both edges through it"** in "Your turn" reads slightly oddly
  against a starter graph showing one edge, but the identical wording is in
  `problemStatement`, which is out of this pass's scope - editing only one of
  the two would create a divergence. Noted, not changed.
