# ScaleCraft Quiz Framework

Status: **v1.0, 2026-07-31.** Companion to [[CURRICULUM]] (which owns where quizzes
attach and what mastery means - see its §22). This document owns everything else:
philosophy, question formats, authoring rules, the diagram-question specification,
and one quiz bank per major curriculum section.

Question banks here are written at full interview quality and are usable as-is, but
they are also *specifications by example*: a lesson author extending a bank must
match the formats, difficulty ramp, and explanation rules defined in §1-4.

---

## 1. Quiz philosophy

These are not school exams. They are **engineering conversations** - each question
should feel like an interviewer's follow-up or a design-review challenge, never a
vocabulary drill.

1. **Reasoning over recall.** Every question puts the learner in a scenario and asks
   them to predict, choose, diagnose, or rank. Trivia ("what year was Kafka
   released?", "what does TTL stand for?") is banned. If a question can be answered
   by string-matching the lesson, cut it.
2. **Every answer explains.** Each option - chosen or not, right or wrong - carries a
   written explanation (`explanationMd`). This is the validation philosophy applied
   to assessment: a bare "wrong" is a bug.
3. **Wrong options are real positions.** Distractors are things a reasonable engineer
   might actually believe, each wrong for an articulable reason. No joke options, no
   "all of the above."
4. **Scored, not gamified.** Delivery is a full-screen exam: submit once at the end,
   scored against an 80% pass threshold, unlimited attempts until passed, then locked
   to view-only (see `.claude/docs/pending-quiz-ui.md` addendum, 2026-07-31, and the
   2026-07-31 unlimited-attempts follow-up). A visible score and pass/fail
   line is not scoring *theater* - there are still no points, streaks, badges, or
   celebration animation; the score exists to gate completion honestly, not to
   entertain.
5. **Progressively harder.** Each bank ramps: comprehension first, then application,
   then judgment (the hardest questions have more than one defensible-sounding
   option and the explanation is the real payload).
6. **Scope-honest.** A question may draw only on its section + the prerequisite
   chain ([[CURRICULUM]] §18.2). Question 12 of the Data bank may assume caching was
   NOT yet taught if the learner took Data before Performance - banks note any
   ordering sensitivity.

## 2. Question formats and schema

All formats are auto-gradeable (no free-text grading in scope). Target schema on
`ChapterDefinition` (the one schema ask, shared with staged chapters -
[[CURRICULUM]] §21.1):

> **Superseded by code (2026-07-31):** the snippet below is the original schema
> sketch. The shipped `QuizQuestion`/`QuizOption` types
> (`src/content/chapters/types.ts`) add a stable `id` to each option and use typed
> `correctOrder: string[]` / `pairs: [string, string][]` (referencing option ids)
> for `ordering`/`matching`, instead of the `label = "item -> match"` string
> convention sketched here. That code is authoritative for the shape; author
> matching/ordering questions against the typed fields, not this snippet.

```ts
type QuizQuestion = {
  id: string;
  kind: "single" | "multi" | "matching" | "ordering" | "diagram" | "estimate";
  difficulty: 1 | 2 | 3;            // ramp position, not a score
  prompt: string;                    // markdown
  /** For kind "diagram": rendered read-only on the canvas. */
  graph?: ArchitectureGraph;
  options: { label: string; explanationMd: string; correct: boolean }[];
  // matching/ordering reuse options: label = "item -> match" / correct order index
};
```

| Kind | Use for | Notes |
|---|---|---|
| `single` | Scenario judgment, prediction, diagnosis | The default |
| `multi` | "Which of these apply" with 2+ correct | Prompt must say "select all" |
| `matching` | Duties-to-components, NFRs-to-products | 3-5 pairs max |
| `ordering` | Sequences, request paths, process steps | 4-6 items max |
| `diagram` | Read a shown graph: predict, spot the flaw, trace | Graph spec in §4 |
| `estimate` | Capacity questions with order-of-magnitude buckets | Buckets, never precise figures |

Bank sizes: chapter quizzes stay small (3-6 questions, drawn from or modeled on
these banks); the banks below are section-level (10-14 each) and also back the
optional Review affordance and RWE retrospective quizzes.

**Condensed-chapter exception:** a chapter that deliberately condenses
several prior source chapters into one (e.g. Building Blocks Part 1's
1.1-1.3, each absorbing what used to be 3-5 separate chapters, regardless of
whether the condensed chapter's own type is Process or Building Block)
carries a proportionally larger quiz: 10-15 questions, with at least one
question covering each absorbed topic, so compression doesn't also compress
assessment coverage. This is scoped to condensed chapters specifically, not
a blanket raise - an ordinary 3-question Part 3 block chapter is still
correctly sized at 3-6.

## 3. Authoring rules

- Prompt states a concrete situation in ≤4 sentences; the question is one sentence.
- One concept under test per question; the scenario may touch others, the *decision*
  may not.
- Explanations: 1-3 sentences per option; the correct option's explanation teaches
  the principle, wrong options' explanations name the misconception.
- Difficulty ramp per bank: roughly 30% level 1, 45% level 2, 25% level 3.
- Interview framing encouraged: "the interviewer asks...", "your teammate
  proposes..." - but production scenarios ("you get paged at 2am...") must appear in
  every bank too (both registers, per [[CURRICULUM]] §1.5).
- In this document, ✓ marks the correct option(s); per-option explanation text
  beyond the "Why" line is authored at lesson time following these rules.

## 4. Diagram question specification

Whenever a diagram improves a question, provide all three:

1. **Purpose** - what the learner must read off the graph.
2. **Layout** - one line describing arrangement (left-to-right request flow, etc.).
3. **Graph JSON** - a valid `ArchitectureGraph`: `nodes[{id, componentId, position,
   config}]`, `edges[{id, source, target, kind}]`, `entryPointIds`. Component ids
   must come from the registry (client, browser, dns, firewall, reverse-proxy,
   load-balancer, api-gateway, app-server, worker, cron-job, serverless-function,
   sql-database, nosql-database, read-replica, object-storage, search-engine,
   cache, distributed-cache, cdn, message-queue, kafka, event-bus,
   dead-letter-queue, coordinator, leader, follower, lock-service). Edge `kind` is
   semantic - request-flow / control / replication / async - and questions may hinge
   on it. Screenshots are generated straight from these graphs.

Layout convention used below: request flow runs left to right, x in steps of ~180
from 40, y rows at 100/240/380. `config: {}` throughout (config-dependent questions
state config in the prompt).

---

## 5. Bank: Foundations (Part 0)

**Q1 · single · 1** - A teammate says "system design is about knowing lots of AWS
services." What is the best correction?
- A. It is about memorizing standard architectures for common products
- B. ✓ It is about reasoning under constraints - latency, throughput, availability,
  durability, cost - and defending the trade-offs between them
- C. It is about writing scalable code
- D. It is mostly about databases
Why: services and patterns change; the five forces and trade-off reasoning are the
stable discipline (0.2).

**Q2 · matching · 1** - Match each concern to its force: "p99 response time" ->
latency; "requests per second the system survives" -> throughput; "fraction of time
the system answers at all" -> availability; "data still exists after a crash" ->
durability; "the bill" -> cost.
Why: the five forces become non-functional requirements in Part 1; naming them
precisely is the vocabulary gate.

**Q3 · single · 1** - In a system design *interview*, which is most valued?
- A. Producing the single correct architecture
- B. Exhaustive depth on every component
- C. ✓ Structured breadth-first reasoning, clear communication, and named trade-offs
- D. Speed of drawing
Why: interviews sample reasoning and communication; there is no single correct
architecture (0.3).

**Q4 · single · 2** - Which statement about production engineering vs. interviews is
TRUE?
- A. Production rewards the cleverest architecture
- B. ✓ Production rewards boring, operable choices; interviews reward visible
  reasoning about alternatives
- C. Interview skills and production skills are unrelated
- D. Production designs never involve estimation
Why: the registers differ and ScaleCraft labels which is which (0.3, curriculum
§1.5).

**Q5 · ordering · 2** - Order the design lifecycle: clarify -> requirements ->
estimate -> high-level design -> deep dive -> bottlenecks and failure -> trade-offs
and alternatives -> evolve and defend.
Why: the Interview Loop (curriculum §10.1) is the map of Part 1; ordering it is the
first retrieval of the whole workflow.

**Q6 · single · 2** - An interviewer opens with "Design a photo-sharing app." What
is the strongest first move?
- A. Draw client, server, database immediately
- B. Ask what database they prefer
- C. ✓ Ask clarifying questions - who uses it, what scale, which features are in
  scope
- D. Estimate storage for 1B photos
Why: jumping to boxes before scope is the most common candidate mistake (0.4 ->
1.1).

**Q7 · single · 2** - Your CRUD todo app has 200 users and one server at 3% CPU.
The strongest engineering position is:
- A. Add a load balancer now to be safe
- B. Migrate to microservices before growth arrives
- C. ✓ Change nothing - complexity is a cost, and no force is under pressure
- D. Shard the database preemptively
Why: architecture responds to forces; adding machinery without pressure is pure
cost (0.2's forces, §9 lens 3).

**Q8 · single · 3** - Two designs meet the same requirements. Design X is simpler;
design Y handles 100x future growth. The senior framing is:
- A. Always pick Y - growth always comes
- B. Always pick X - simplicity always wins
- C. ✓ Ask what growth is actually expected and what migrating X->Y later would
  cost; pick based on that answer
- D. Flip a coin since both meet requirements
Why: the trade-off is real and its resolution depends on facts you must ask for -
the reflex 1.8 trains.

**Q9 · single · 2** - Why does ScaleCraft make you predict before revealing
("Think first"), even though you might guess wrong?
- A. To measure you against other learners
- B. ✓ Committing to a prediction and then seeing the outcome produces deeper
  learning than reading the answer - being wrong first is productive
- C. To slow the lesson down
- D. To identify weak learners for extra hints
Why: productive failure and the testing effect are load-bearing curriculum
principles (§1.3); there is no measuring or auto-hinting anywhere.

**Q10 · single · 3** - A candidate answers every follow-up with "it depends." The
interviewer's likely read, and the fix:
- A. Good - it always does depend; no fix needed
- B. ✓ Non-committal; the fix is "it depends on X: if X is A I'd do P because...,
  if B then Q" - name the variable and commit per branch
- C. The candidate should pick one answer and defend it against all follow-ups
- D. The candidate should ask the interviewer to decide
Why: senior answers make the dependency explicit and still commit (0.3, §10.3).

---

## 6. Bank: Engineering Process (Part 1)

**Q1 · multi · 1** - "Design a URL shortener." Select ALL clarifying questions that
would materially change the design:
- A. ✓ What is the expected read:write ratio?
- B. ✓ Do short links expire?
- C. What programming language should I use?
- D. ✓ Do we need click analytics?
Why: A drives caching/replication, B drives storage/cleanup, D adds an async
subsystem; language is not an architecture question (1.1).

**Q2 · single · 1** - Which is a NON-functional requirement?
- A. Users can upload photos
- B. Users can follow each other
- C. ✓ The feed loads in under 200 ms at p99
- D. Users can comment
Why: NFRs are the "how well" promises; they, not features, drive architecture
(1.3).

**Q3 · estimate · 2** - 10M daily active users each make ~20 requests/day. Average
request rate, order of magnitude?
- A. ~20 QPS
- B. ✓ ~2,000 QPS
- C. ~200,000 QPS
- D. ~2M QPS
Why: 2×10^8 requests over ~10^5 seconds/day ≈ 2×10^3. Powers of ten, not
calculators (1.4).

**Q4 · estimate · 2** - Peak traffic is usually estimated relative to average as:
- A. Equal to average
- B. ✓ A small multiple (2-10x) of average, chosen from the product's usage pattern
- C. Always exactly 100x
- D. Irrelevant to design
Why: the multiplier is a judgment from usage shape (lunchtime spikes, event
bursts); knowing to apply one is the skill (1.4).

**Q5 · single · 2** - Reading 1 MB sequentially from SSD vs. from RAM. Roughly:
- A. The same
- B. SSD ~2x slower
- C. ✓ SSD on the order of 10-100x slower
- D. SSD ~1,000,000x slower
Why: the ratio, not the microseconds, is what changes designs - it is why caches
exist (1.5).

**Q6 · single · 1** - A cross-continent round trip (~150 ms) compared to a
within-datacenter round trip (~0.5-1 ms) explains which design instinct?
- A. Compress all payloads
- B. ✓ Place data near users (CDNs, regions) because distance is a latency floor no
  code removes
- C. Use faster CPUs
- D. Batch database writes
Why: physics sets the floor; geography is a first-class design tool (1.5 -> 3.15).

**Q7 · diagram · 2** - *Purpose:* first-architecture reading. *Layout:*
left-to-right: client -> app-server -> sql-database, plus a second edge client ->
sql-database.
```json
{"nodes":[
 {"id":"c1","componentId":"client","position":{"x":40,"y":100},"config":{}},
 {"id":"s1","componentId":"app-server","position":{"x":220,"y":100},"config":{}},
 {"id":"d1","componentId":"sql-database","position":{"x":400,"y":100},"config":{}}],
 "edges":[
 {"id":"e1","source":"c1","target":"s1","kind":"request-flow"},
 {"id":"e2","source":"s1","target":"d1","kind":"request-flow"},
 {"id":"e3","source":"c1","target":"d1","kind":"request-flow"}],
 "entryPointIds":["c1"]}
```
Which edge should not exist, and why?
- A. e1 - clients should reach the database through DNS
- B. e2 - servers should not talk to databases directly
- C. ✓ e3 - clients talking straight to the database bypasses authentication,
  authorization, and business logic
- D. All edges are fine
Why: the app tier exists to mediate; this is the first validation rule the learner
ever meets (1.6, `no-direct-client-database`).

**Q8 · single · 2** - One app server (can serve 1,000 QPS) and one database (can
serve 5,000 QPS of this workload). Traffic grows steadily. What breaks first?
- A. The database
- B. ✓ The app server
- C. Both at once
- D. The network
Why: bottleneck = lowest ceiling on the path; finding it is a mechanical check
before it is an instinct (1.7).

**Q9 · single · 3** - Your design review proposes adding a cache to fix p99
latency. The strongest FIRST question is:
- A. Redis or Memcached?
- B. What TTL?
- C. ✓ Is the latency actually coming from repeated reads a cache would absorb -
  what does the p99 breakdown say?
- D. How big should the cache be?
Why: deep dives target the subsystem the evidence stresses; tool choice before
diagnosis is the classic mistake (1.9, 1.7).

**Q10 · single · 2** - The interviewer says: "Your design is fine, but what would
you change if writes grew 100x?" This follow-up is best read as:
- A. A signal the design is wrong
- B. ✓ An invitation to demonstrate evolution thinking - walk the write path and
  name what saturates first and its fix
- C. A trick question to be deflected
- D. A request to restart the design
Why: follow-ups are invitations; the loop's step 8 is where seniority shows (1.10,
§10.2).

**Q11 · single · 3** - You realize mid-interview that a choice you made 10 minutes
ago is wrong. The strongest move:
- A. Say nothing and hope it isn't noticed
- B. Defend it if challenged - changing course looks weak
- C. ✓ Flag it yourself, state why it is wrong and what you'd change - self-
  correction is senior signal
- D. Restart the whole design
Why: interviews reward honest reasoning over the appearance of infallibility
(1.10).

**Q12 · ordering · 2** - Order a 45-minute interview's time allocation as taught:
clarify + requirements (~5-10) -> estimation (~5) -> high-level design (~10-15) ->
deep dives (~10-15) -> wrap-up: bottlenecks, trade-offs, evolution (~5).
Why: driving the interview includes owning the clock (1.11).

---

## 7. Bank: Journey of a Request (Part 2)

**Q1 · ordering · 1** - Order what happens when you hit enter on a URL: DNS
resolution -> TCP connection (+ TLS handshake) -> request through the edge
(firewall/proxy) -> app server handles -> database queried -> response returns.
Why: the spatial map every later chapter slots into (2.1).

**Q2 · single · 1** - DNS's job in one sentence:
- A. It encrypts traffic to the server
- B. ✓ It translates a name into an address before any connection is made
- C. It balances load between servers
- D. It caches web pages
Why: resolution precedes connection; DNS is consulted, not on the request data
path (2.1).

**Q3 · single · 2** - DNS is globally down for your domain, but all your servers
are healthy. A user who has never visited before sees:
- A. A slow page
- B. ✓ Complete failure to reach the site - the name never becomes an address
- C. A security warning
- D. The page loads normally
Why: every hop is a failure point, and the first hop fails before your
infrastructure is ever touched (2.2).

**Q4 · single · 2** - A request times out after the app server queried the
database, but the client saw an error. Which is TRUE?
- A. The write definitely failed
- B. The write definitely succeeded
- C. ✓ The write may have succeeded or failed - the client cannot tell from a
  timeout
- D. Timeouts only happen on reads
Why: partial failure and ambiguity are THE distributed-systems facts; this
question seeds idempotency (2.2 -> 3.23).

**Q5 · diagram · 2** - *Purpose:* trace reading with edge kinds. *Layout:*
left-to-right: browser -> reverse-proxy -> app-server -> sql-database; dns above
the browser connected by a control edge.
```json
{"nodes":[
 {"id":"b1","componentId":"browser","position":{"x":40,"y":240},"config":{}},
 {"id":"n1","componentId":"dns","position":{"x":40,"y":100},"config":{}},
 {"id":"p1","componentId":"reverse-proxy","position":{"x":220,"y":240},"config":{}},
 {"id":"s1","componentId":"app-server","position":{"x":400,"y":240},"config":{}},
 {"id":"d1","componentId":"sql-database","position":{"x":580,"y":240},"config":{}}],
 "edges":[
 {"id":"e1","source":"b1","target":"n1","kind":"control"},
 {"id":"e2","source":"b1","target":"p1","kind":"request-flow"},
 {"id":"e3","source":"p1","target":"s1","kind":"request-flow"},
 {"id":"e4","source":"s1","target":"d1","kind":"request-flow"}],
 "entryPointIds":["b1"]}
```
Why is the browser-to-DNS edge a `control` edge rather than `request-flow`?
- A. DNS is optional
- B. ✓ DNS lookup happens before and outside the request path - the page data
  never flows through DNS
- C. Control edges are faster
- D. It is a rendering choice with no meaning
Why: not every arrow is the same kind of arrow; edge semantics carry meaning the
validator and simulator rely on (2.1, curriculum §7.2).

**Q6 · single · 2** - "The site is down" is reported by users in one country;
your dashboards show all servers healthy. The most likely failure class:
- A. Database corruption
- B. ✓ A path problem between those users and you - DNS, routing, or a regional
  edge failure
- C. A bug in the application code
- D. Disk full on the app server
Why: "down" is a statement about a path, not just about servers (2.2).

**Q7 · single · 2** - Why did architectures evolve from one big server toward
tiers and horizontal scale, rather than ever-bigger machines?
- A. Big machines stopped being manufactured
- B. ✓ Vertical scaling hits cost and ceiling limits, and one machine is one
  failure domain - splitting tiers scales and fails independently
- C. Fashion
- D. Programming languages required it
Why: the evolution story is forces, not fashion; it previews Part 3's whole arc
(2.3).

**Q8 · single · 3** - A two-person startup asks whether to launch as microservices
"because that's what Netflix does." Strongest answer:
- A. Yes - it will save a migration later
- B. ✓ No - a monolith is operable by a tiny team and today's forces don't demand
  service isolation; split when a force does
- C. Yes - monoliths cannot scale
- D. No - microservices are always wrong
Why: same problem, different right answers at different scale (§9 lens 9; 2.3).

**Q9 · single · 2** - In the journey, where does TLS typically terminate in a
tiered architecture, and why there?
- A. At the database, closest to the data
- B. ✓ At the edge (reverse proxy), so internal hops are simpler and certificates
  are managed in one place
- C. At the client only
- D. TLS never terminates
Why: the single-front-door pattern absorbs cross-cutting concerns (2.1 -> 3.3).

**Q10 · single · 3** - Of these, which failure gives the WORST user experience,
and is therefore designed against first?
- A. A clear, fast error page
- B. ✓ A hang - seconds of nothing, no feedback, unknown outcome
- C. Slightly stale data
- D. A retried request that succeeds
Why: timeouts and fail-fast exist because ambiguity and hanging are worse than
clean failure - the instinct behind 3.23's patterns (2.2).

---

## 8. Bank: Core Infrastructure (3.1-3.5)

**Q1 · single · 1** - The firewall's architectural job is:
- A. Encrypting traffic
- B. ✓ Defining the trust perimeter - only sanctioned entry points reach what is
  inside
- C. Speeding up requests
- D. Load balancing
Why: perimeter thinking is why later topologies keep one front door (3.1).

**Q2 · single · 2** - Your firewall allows inbound traffic on every port "to keep
things flexible." The validation explanation will say this is wrong because:
- A. It slows traffic down
- B. ✓ The perimeter now fails open - every internal component is directly
  reachable and architecture-level guarantees about entry points vanish
- C. Firewalls only support one port
- D. It breaks DNS
Why: architecture includes configuration; a permissive perimeter is a topology
bug expressed as config (3.1, `permissive-firewall`).

**Q3 · single · 2** - DNS answers are cached with TTLs. The direct design
consequence:
- A. DNS is unreliable
- B. ✓ Changing where a name points propagates gradually - old answers keep
  arriving until TTLs expire
- C. DNS gets faster every year
- D. Names can only point to one address forever
Why: the learner's first staleness trade-off, met before "caching" is formally
taught - an advance organizer for 3.14 (3.2).

**Q4 · single · 1** - A reverse proxy differs from a forward proxy in that it:
- A. Runs on the client's machine
- B. ✓ Stands in front of servers, presenting one address for whatever is behind
  it
- C. Only handles DNS
- D. Cannot serve TLS
Why: one front door makes everything behind it swappable and invisible (3.3).

**Q5 · diagram · 2** - *Purpose:* spot the cargo-cult LB. *Layout:* client ->
load-balancer -> single app-server -> sql-database.
```json
{"nodes":[
 {"id":"c1","componentId":"client","position":{"x":40,"y":240},"config":{}},
 {"id":"lb1","componentId":"load-balancer","position":{"x":220,"y":240},"config":{}},
 {"id":"s1","componentId":"app-server","position":{"x":400,"y":240},"config":{}},
 {"id":"d1","componentId":"sql-database","position":{"x":580,"y":240},"config":{}}],
 "edges":[
 {"id":"e1","source":"c1","target":"lb1","kind":"request-flow"},
 {"id":"e2","source":"lb1","target":"s1","kind":"request-flow"},
 {"id":"e3","source":"s1","target":"d1","kind":"request-flow"}],
 "entryPointIds":["c1"]}
```
What will validation flag, and what is the reasoning?
- A. Nothing - the graph is fine
- B. The LB should connect to the database too
- C. ✓ A load balancer over one instance balances nothing - it adds a hop and a
  failure point without adding capacity or redundancy
- D. The client should connect directly to the app server as well
Why: components earn their place by resolving a force; this one resolves none
(3.4, `single-instance-load-balancer`).

**Q6 · single · 2** - What do health checks buy a load balancer?
- A. Faster responses on every request
- B. ✓ The ability to stop routing to a dead or sick instance before users hit it
- C. Encryption between LB and servers
- D. Sticky sessions
Why: without membership knowledge, an LB spreads traffic across corpses -
`control` edges exist for exactly this behavior (3.4).

**Q7 · single · 3** - Workload A: uniform, fast, stateless requests. Workload B:
requests with wildly variable duration (some take 30 s). Best algorithm pairing:
- A. Both round-robin
- B. Both least-connections
- C. ✓ A: round-robin (cheap and fair under uniformity); B: least-connections
  (long requests pile up unevenly under round-robin)
- D. Random for both
Why: algorithm choice is workload-dependent - both configs are valid somewhere,
which is the chapter's real lesson (3.4).

**Q8 · matching · 2** - Match duty to component: "TLS termination + static
serving + one front door" -> reverse-proxy; "spread traffic across identical
instances, health-checked" -> load-balancer; "client-facing policy: routing,
authentication, rate limits" -> api-gateway.
Why: the most-confused trio in system design, disambiguated the moment all three
exist (3.5).

**Q9 · single · 2** - When is an API gateway overkill?
- A. Never - always add one
- B. ✓ A single internal service with one client and no cross-cutting policy -
  the gateway adds a hop and an operational surface for nothing
- C. Whenever you already have a load balancer
- D. When you use HTTPS
Why: same reasoning as Q5 - machinery must resolve a force (3.5, §9 lens 3).

**Q10 · single · 3** - An interviewer asks: "Your gateway does auth and rate
limiting. It is now the bottleneck. What do you do?" Strongest answer:
- A. Remove the gateway - it was a mistake
- B. Move auth into every service
- C. ✓ Scale the gateway horizontally behind the LB like any stateless tier, and
  verify its policy checks (auth lookups, counters) aren't secretly stateful
- D. Buy a bigger gateway machine only
Why: the gateway is compute like any other - IF its state is external; the
follow-up tests whether "stateless scales" became a reflex (3.5 + 3.6 preview).

**Q11 · single · 2** - You get paged: after a deploy, every request returns 502
from the proxy, but app servers show zero traffic. First hypothesis:
- A. Database is down
- B. ✓ The proxy's upstream configuration no longer matches where the app
  servers actually are (wrong port/address/health-check path)
- C. DNS TTL expired
- D. Clients are attacking you
Why: 502 = the front door cannot reach what's behind it; localize between hops
using the journey map (2.2's skill applied; 3.3).

---

## 9. Bank: Compute (3.6-3.9)

**Q1 · single · 1** - "Stateless service" means:
- A. The service stores no data anywhere
- B. ✓ Any instance can serve any request because no request depends on
  instance-local memory of previous requests
- C. The service has no configuration
- D. The service never fails
Why: state exists - it just lives elsewhere; that displacement is what makes
copies interchangeable (3.6).

**Q2 · single · 2** - Users report being randomly logged out. You run two app
servers behind round-robin. Root cause, most likely:
- A. The database is slow
- B. ✓ Sessions live in per-instance memory; successive requests land on the
  other instance, which has never heard of the user
- C. The LB is broken
- D. Users are clearing cookies
Why: the classic statelessness violation - horizontal scaling's hidden
precondition surfacing as a user-visible bug (3.7).

**Q3 · single · 2** - Sticky sessions "fix" Q2. What did you silently give up?
Select the strongest answer:
- A. Nothing - sticky sessions are free
- B. ✓ Even load distribution and clean failover: an instance's death now logs
  out everyone pinned to it, and hot users pin load unevenly
- C. TLS support
- D. The ability to use a database
Why: sticky sessions trade correctness pressure for availability pressure - a
real option with a real cost, not a wrong answer (3.7).

**Q4 · single · 1** - Vertical vs. horizontal scaling: the two limits that
eventually force horizontal are:
- A. Software licenses and rack space
- B. ✓ A hardware ceiling (there is no 100x bigger machine) and a
  single-failure-domain risk (one box = one outage)
- C. DNS and TLS
- D. Language runtime limits
Why: the fork-in-the-road concept of the discipline (3.8).

**Q5 · single · 2** - You add a second app server. Before an LB exists, what is
the actual problem?
- A. The servers will conflict with each other
- B. ✓ Nothing routes between them sensibly - clients know one address, and
  nothing decides which instance gets which request
- C. Two servers cost too much
- D. Databases only accept one connection
Why: the engineered cliffhanger - the learner should want the LB before being
handed it retroactively justified (3.8, resolved by 3.4).

**Q6 · diagram · 2** - *Purpose:* failover prediction. *Layout:* client -> LB ->
two app servers (rows y=140/340) -> shared sql-database; control edges LB -> each
server.
```json
{"nodes":[
 {"id":"c1","componentId":"client","position":{"x":40,"y":240},"config":{}},
 {"id":"lb1","componentId":"load-balancer","position":{"x":220,"y":240},"config":{}},
 {"id":"s1","componentId":"app-server","position":{"x":400,"y":140},"config":{}},
 {"id":"s2","componentId":"app-server","position":{"x":400,"y":340},"config":{}},
 {"id":"d1","componentId":"sql-database","position":{"x":580,"y":240},"config":{}}],
 "edges":[
 {"id":"e1","source":"c1","target":"lb1","kind":"request-flow"},
 {"id":"e2","source":"lb1","target":"s1","kind":"request-flow"},
 {"id":"e3","source":"lb1","target":"s2","kind":"request-flow"},
 {"id":"e4","source":"s1","target":"d1","kind":"request-flow"},
 {"id":"e5","source":"s2","target":"d1","kind":"request-flow"},
 {"id":"e6","source":"lb1","target":"s1","kind":"control"},
 {"id":"e7","source":"lb1","target":"s2","kind":"control"}],
 "entryPointIds":["c1"]}
```
Server s1 dies. Assuming stateless servers and working health checks, users
experience:
- A. Half of all requests fail until s1 is replaced
- B. ✓ At most a brief blip until the health check marks s1 down; then all
  traffic flows to s2 at higher load
- C. Total outage
- D. Nothing changes at all, even capacity
Why: statelessness + health-checked balancing = graceful instance loss; capacity
halves, availability holds - and noticing the capacity cost is the level-3 read
(3.6+3.4 converging).

**Q7 · single · 2** - Instances now scale up and down automatically. Hardcoding
instance addresses in the proxy config breaks because:
- A. Config files have size limits
- B. ✓ Membership is now dynamic - the set of healthy instances changes faster
  than any hand-edited list; something must track it (registry + health)
- C. Proxies cannot reload config
- D. Autoscaling is incompatible with proxies
Why: service discovery is the answer to "who is alive right now?" (3.9).

**Q8 · single · 3** - An interviewer follow-up: "You said your services are
stateless. Where did the state GO, and what did that cost?" Strongest answer:
- A. There is no state anywhere
- B. ✓ Into shared stores - sessions, files, and data now live in external
  systems, which concentrates load there and makes those stores the new thing to
  scale
- C. Into the load balancer
- D. Into client cookies exclusively, always
Why: statelessness relocates the problem rather than deleting it - Part 3's next
groups are exactly about the stores it relocated to (3.6-3.7; senior signal per
§10.3).

**Q9 · single · 2** - 2am page: after autoscaling added three instances, they
receive traffic but every request they serve errors; old instances are fine.
Most likely:
- A. The LB is over capacity
- B. ✓ The new instances are unhealthy in a way the health check doesn't detect
  (bad config/secret/dependency) - the check says alive, the app says broken
- C. DNS failure
- D. The database rejected the new instances' IPs
Why: health checks only verify what they check - a production nugget about the
gap between liveness and readiness (3.9, 3.4).

**Q10 · single · 3** - When is a stateFUL service the right call, not a smell?
- A. Never
- B. ✓ When the state IS the product and moving it would dominate every request -
  live connections, in-memory game worlds, low-latency counters
- C. Whenever the team is small
- D. Only in monoliths
Why: honest inversion - WhatsApp's connection tier will invert this chapter's
default, and the curriculum plants that flag early (3.6; RWE Tier 4).

---

## 10. Bank: Data (3.10-3.13)

**Q1 · single · 1** - An index makes reads faster by:
- A. Storing the table in RAM
- B. ✓ Maintaining a sorted structure that turns scans into lookups - paid for
  with extra work on every write
- C. Compressing the data
- D. Duplicating the database
Why: the read/write trade-off in miniature; "indexes are free" is the
misconception under test (3.10).

**Q2 · single · 2** - Your query is fast at 10k rows and unusable at 100M rows.
The FIRST thing to check:
- A. Network latency
- B. ✓ Whether the query is scanning instead of using an index - growth turns
  scans from invisible to catastrophic
- C. The programming language
- D. RAM size on the client
Why: "slow" vs. "gets slower per unit of growth" - lens 6 applied to the
database (3.10, §9).

**Q3 · single · 2** - Which requirement makes a relational store nearly
non-negotiable?
- A. Storing user profiles
- B. ✓ Multi-row transactions that must succeed or fail together (e.g. debit one
  account, credit another)
- C. High read volume
- D. Storing JSON
Why: ACID across rows is the relational superpower; most other needs have
options both ways (3.11).

**Q4 · single · 3** - A teammate says "we need NoSQL because we'll be big." The
strongest response:
- A. Agree - scale means NoSQL
- B. ✓ Ask for the data shape and access patterns first; relational stores with
  replicas and caching carry most products very far, and joins/transactions are
  expensive to give up
- C. Refuse - NoSQL is never right
- D. Use both from day one
Why: store choice is a decision procedure over shape + access + scale, not a
prophecy (3.11 - one of its three scenarios is "either, and here's why the
question matters less than you think").

**Q5 · diagram · 2** - *Purpose:* replication topology reading. *Layout:*
app-server -> sql-database (primary); replication edge primary -> read-replica;
app-server -> read-replica for reads.
```json
{"nodes":[
 {"id":"s1","componentId":"app-server","position":{"x":220,"y":240},"config":{}},
 {"id":"d1","componentId":"sql-database","position":{"x":400,"y":140},"config":{}},
 {"id":"r1","componentId":"read-replica","position":{"x":400,"y":340},"config":{}}],
 "edges":[
 {"id":"e1","source":"s1","target":"d1","kind":"request-flow"},
 {"id":"e2","source":"d1","target":"r1","kind":"replication"},
 {"id":"e3","source":"s1","target":"r1","kind":"request-flow"}],
 "entryPointIds":["s1"]}
```
A user updates their profile, then immediately reloads the page and sees the OLD
name. Using the diagram, why?
- A. The write failed
- B. ✓ The write went to the primary (e1); the reload read from the replica (e3)
  before replication (e2) caught up - replication lag
- C. The replica rejected the read
- D. The browser cached the page
Why: read-your-writes is the first consistency phenomenon, made spatial - the
learner points at the lagging edge (3.12).

**Q6 · single · 2** - Writing to a read replica is wrong because:
- A. Replicas are slower at writes
- B. ✓ The replica's contents are defined as a copy of the primary - a write
  there either fails or forks the data into two divergent histories
- C. Replicas have no disks
- D. It is fine, actually
Why: role discipline is what makes replication sound; the validator teaches this
with its own explanation (3.12).

**Q7 · single · 2** - Sync vs. async replication - the honest one-line trade:
- A. Sync is always safer, async always faster, choose safer
- B. ✓ Sync buys no-data-loss at the price of write latency and availability
  coupling; async buys fast writes at the price of a loss window on failover
- C. They are equivalent in practice
- D. Async loses data constantly
Why: both are legitimate postures with a named cost - CP/AP reasoning seeded at
the mechanism level (3.12 -> 3.22).

**Q8 · single · 3** - You shard a social app's posts by `user_id`. A celebrity
with 100M followers posts. What breaks, and why did the shard key cause it?
- A. Nothing - sharding absorbs all load
- B. ✓ The celebrity's shard becomes a hot partition: every read for that post
  hammers one shard while the others idle - the key concentrated a skewed
  workload
- C. All shards fail equally
- D. The post is lost
Why: shard-key choice is workload analysis, not formality; hot keys are its
canonical failure (3.13).

**Q9 · single · 3** - Range-sharding by timestamp for an append-heavy event
table. The predictable pathology:
- A. Reads become impossible
- B. ✓ All new writes land on the newest shard - a permanently moving hot spot;
  hash-sharding trades that for losing cheap range scans
- C. Old shards fill up forever
- D. Timestamps cannot be sharded
Why: range vs. hash is the chapter's central trade-off, each breaking a
different access pattern (3.13).

**Q10 · single · 2** - When is sharding the WRONG next move?
- A. When data exceeds one machine
- B. ✓ When replicas + caching + indexing haven't been exhausted - sharding
  buys capacity at a permanent complexity cost (cross-shard queries, resharding
  pain) that cheaper tools defer
- C. When using NoSQL
- D. Sharding is always right eventually
Why: reach for the highest-leverage, lowest-machinery tool first - the ordering
logic of Part 3 itself (3.13, §1.4).

**Q11 · single · 3** - Interviewer: "Your sharded design needs a query that
touches all shards. Walk me through the cost." Strongest answer:
- A. Cross-shard queries are impossible
- B. ✓ Scatter-gather: fan out to every shard, wait for the slowest, merge -
  latency becomes the p99 of N machines and grows with shard count; design
  around it by denormalizing or maintaining a separate index
- C. The database handles it invisibly at no cost
- D. Route it to the largest shard
Why: cross-shard pain is where sharding's bill arrives; naming the
tail-latency mechanism is the senior read (3.13, 1.5's ratios).

---

## 11. Bank: Performance (3.14-3.16)

**Q1 · single · 1** - Cache-aside, in order:
- A. Write to cache, cache writes to DB
- B. ✓ Check cache; on miss, read DB, populate cache, return; on hit, return
- C. Read DB, then check cache
- D. The cache subscribes to the database
Why: the pattern lives in application code - "where does cache-aside logic
live?" is its own quiz favorite (the app, not the cache) (3.14).

**Q2 · single · 2** - A cache with TTL 60 s fronts product prices. What is the
honest statement to the business?
- A. Prices are always current
- B. ✓ A price change may show stale for up to ~60 s - we bought a large read
  reduction with a bounded staleness window
- C. Prices update instantly but cost more
- D. The cache eliminates the database
Why: every cache is a staleness contract; stating the bound is the engineering
habit (3.14).

**Q3 · diagram · 2** - *Purpose:* diagnose inconsistent reads. *Layout:* client
-> LB -> two app servers, each with its OWN cache node beside it, both servers
-> shared DB.
```json
{"nodes":[
 {"id":"c1","componentId":"client","position":{"x":40,"y":240},"config":{}},
 {"id":"lb1","componentId":"load-balancer","position":{"x":200,"y":240},"config":{}},
 {"id":"s1","componentId":"app-server","position":{"x":380,"y":140},"config":{}},
 {"id":"s2","componentId":"app-server","position":{"x":380,"y":340},"config":{}},
 {"id":"k1","componentId":"cache","position":{"x":560,"y":80},"config":{}},
 {"id":"k2","componentId":"cache","position":{"x":560,"y":400},"config":{}},
 {"id":"d1","componentId":"sql-database","position":{"x":740,"y":240},"config":{}}],
 "edges":[
 {"id":"e1","source":"c1","target":"lb1","kind":"request-flow"},
 {"id":"e2","source":"lb1","target":"s1","kind":"request-flow"},
 {"id":"e3","source":"lb1","target":"s2","kind":"request-flow"},
 {"id":"e4","source":"s1","target":"k1","kind":"request-flow"},
 {"id":"e5","source":"s2","target":"k2","kind":"request-flow"},
 {"id":"e6","source":"s1","target":"d1","kind":"request-flow"},
 {"id":"e7","source":"s2","target":"d1","kind":"request-flow"}],
 "entryPointIds":["c1"]}
```
Users see a value flip between old and new on every refresh. Why, and what is
the fix?
- A. The DB is corrupt; restore a backup
- B. ✓ Each server has a private cache holding different generations of the
  value; consecutive requests hit different servers - consolidate into one
  shared distributed cache
- C. The LB should cache instead
- D. TTLs must be zero
Why: three chapters converge (LB routing + per-instance state + staleness);
predicting this failure is the payoff of the sequencing (3.14).

**Q4 · single · 3** - A cache key for your homepage expires under heavy traffic;
2,000 requests miss simultaneously and all hit the database. Name and fix:
- A. Cache poisoning; add auth
- B. ✓ Cache stampede; serve stale while one request refreshes (or lock the
  refresh, or jitter TTLs)
- C. Replication lag; add replicas
- D. Hot partition; reshard
Why: the stampede is caching's classic emergent failure - concept-level here,
load-bearing in RWE Tier 1's Distributed Cache project (3.14).

**Q5 · single · 2** - What belongs on a CDN? Select the strongest rule:
- A. Everything, always
- B. ✓ Content many users receive identically and that tolerates its update
  path: static assets, media, versioned bundles - not per-user dynamic responses
  (without careful design)
- C. Only images
- D. Nothing user-facing
Why: the CDN question is a cacheability question at geographic scale (3.15).

**Q6 · single · 2** - Why are CDNs steered by DNS?
- A. DNS is the only global protocol
- B. ✓ Resolution is the earliest moment a user can be directed to a nearby
  edge - the name resolves differently depending on where you ask from
- C. CDNs cannot use IP addresses
- D. It is legacy behavior
Why: closes the loop opened in 3.2 - DNS as the first routing decision (3.15).

**Q7 · single · 2** - `WHERE title LIKE '%term%'` works in dev and dies in prod
because:
- A. LIKE is deprecated
- B. ✓ A leading-wildcard match cannot use a normal index - it scans every row,
  and scan cost grows with the table
- C. Databases block the % character at scale
- D. The query needs more RAM only
Why: the felt limitation that motivates inverted indexes (3.16).

**Q8 · single · 2** - A search engine alongside the primary DB introduces which
new obligation?
- A. Nothing new - it syncs itself
- B. ✓ Derived data: the index must be kept in sync with the source of truth,
  and the sync path is a design decision (and cannot sanely be synchronous)
- C. The DB must be NoSQL
- D. Search replaces the database
Why: first encounter with derived data - the conceptual bridge into the async
group, felt before the machinery is taught (3.16 -> 3.17).

**Q9 · single · 3** - Search results may lag reality by ~10 s in your product.
The interviewer asks if that's acceptable. Strongest answer:
- A. No - search must be real-time always
- B. ✓ Usually yes - state the freshness SLO explicitly, note which flows break
  under lag (e.g. "find the thing I just posted") and handle those reads from
  the primary
- C. Yes, and lag can be unbounded
- D. Make indexing synchronous to remove the lag
Why: freshness is an NFR to negotiate, not an absolute; the read-your-writes
carve-out echoes 3.12 (3.16, 1.3).

**Q10 · single · 3** - 100 req/s hit a DB query averaging 30 ms. You add a cache
with a 95% hit rate. DB load from this query becomes roughly:
- A. Unchanged
- B. 50 req/s
- C. ✓ 5 req/s - only misses reach the DB
- D. 0 req/s
Why: hit rate is the multiplier that turns caches into capacity; doing this
arithmetic instantly is 1.4's skill applied (3.14).

---

## 12. Bank: Asynchronous Systems (3.17-3.19)

**Q1 · single · 1** - Signup sends a welcome email. Why does the email NOT
belong on the request path?
- A. Emails are unimportant
- B. ✓ The user's success does not depend on the email having been sent - they
  wait on (and can be failed by) work that isn't theirs
- C. Email servers are always down
- D. HTTP cannot trigger email
Why: "what belongs on the request path" is THE async question (3.17).

**Q2 · single · 2** - A queue between web tier and workers absorbs a traffic
spike by:
- A. Making workers faster
- B. ✓ Decoupling intake rate from processing rate - the queue depth grows and
  drains instead of requests failing
- C. Dropping excess requests silently
- D. Adding CPU
Why: the buffer role; also plants the follow-up "what if it never drains?"
(backpressure, met again in RWE) (3.17).

**Q3 · single · 2** - At-least-once delivery means workers MUST be:
- A. Fast
- B. ✓ Idempotent - a message may arrive twice, and processing it twice must
  not double its effect
- C. Stateless
- D. Single-threaded
Why: delivery semantics and idempotency are inseparable; hammered again in
Payment System and WhatsApp (3.17 -> 3.23).

**Q4 · diagram · 2** - *Purpose:* spot the missing DLQ. *Layout:* app-server ->
message-queue -> worker -> sql-database, async edges on the queue path.
```json
{"nodes":[
 {"id":"s1","componentId":"app-server","position":{"x":40,"y":240},"config":{}},
 {"id":"q1","componentId":"message-queue","position":{"x":220,"y":240},"config":{}},
 {"id":"w1","componentId":"worker","position":{"x":400,"y":240},"config":{}},
 {"id":"d1","componentId":"sql-database","position":{"x":580,"y":240},"config":{}}],
 "edges":[
 {"id":"e1","source":"s1","target":"q1","kind":"async"},
 {"id":"e2","source":"q1","target":"w1","kind":"async"},
 {"id":"e3","source":"w1","target":"d1","kind":"request-flow"}],
 "entryPointIds":["s1"]}
```
A malformed message crashes the worker every time it is processed. In this
topology, what happens, and what is missing?
- A. The message is discarded after one failure; nothing is missing
- B. ✓ The message returns to the queue and crash-loops the worker forever,
  starving everything behind it - a dead letter queue must catch messages that
  exhaust their retries
- C. The queue deletes itself
- D. The database rolls back
Why: poison messages are the failure-handling-is-first-class lesson; the rule
`queue-without-dead-letter-queue` encodes it (3.17).

**Q5 · single · 2** - What does a human DO with a dead letter queue?
- A. Nothing - it is a trash can
- B. ✓ Inspect it: diagnose the poison messages, fix the bug or the data, and
  replay or discard deliberately - it is a triage inbox, and it needs an alert
  on depth
- C. Delete it nightly
- D. Route it back to the main queue automatically
Why: DLQs are an operational contract, not just a topology box - the production
register (3.17, §12's production nugget).

**Q6 · single · 3** - Retries with no backoff against a struggling service
produce:
- A. Faster recovery
- B. ✓ A retry storm - the service's load multiplies exactly when it can least
  afford it; exponential backoff with jitter spreads the pressure
- C. No effect
- D. Automatic failover
Why: well-intended resilience becoming the attack; seeded here, formalized in
3.23 (3.17).

**Q7 · single · 2** - One producer, three services each needing every event.
Why is a single work queue the wrong shape?
- A. Queues are too slow
- B. ✓ Queue semantics deliver each message to ONE consumer - the three
  services would steal events from each other; fan-out needs pub/sub or a log
- C. Three services cannot share infrastructure
- D. It is the right shape
Why: the contrast that motivates the event bus - baseline first, contrast
second (3.18).

**Q8 · single · 3** - Kafka retains events for 7 days. A new consumer service
starts today. What can it do that a message-queue consumer cannot, and what
does it cost?
- A. Nothing different
- B. ✓ Replay: it can read history from any offset and rebuild its state -
  paid for in storage, and in consumers owning their own position/ordering
  semantics
- C. Skip idempotency entirely
- D. Write events back in time
Why: the log's replay superpower is why it eats the world; consumer-side
responsibility is its bill (3.18).

**Q9 · single · 2** - Kafka guarantees ordering within a partition only. Your
per-user events must stay ordered. Design consequence:
- A. Use one partition for everything
- B. ✓ Partition by user id - each user's events serialize in one partition
  while users spread across partitions for parallelism
- C. Ordering is impossible
- D. Sort on read
Why: 3.13's shard-key reasoning on a new substrate - same idea, different
machinery, called out as such (3.18).

**Q10 · single · 2** - Which job fits which compute shape? Nightly report =
cron; image resize on upload = serverless/worker; always-on API = app server.
The organizing question is:
- A. Cost only
- B. ✓ The trigger and duty cycle: scheduled, event-driven-bursty, or
  continuous - matching shape to trigger avoids an app server for everything
- C. Language support
- D. Team preference
Why: the compute taxonomy in one line (3.19).

**Q11 · single · 3** - Your nightly cleanup cron now takes 70 minutes; it is
scheduled hourly. What breaks, and what is the eventual fix called?
- A. Nothing - crons queue politely
- B. ✓ Runs overlap: two instances mutate the same data concurrently -
  detected with a lock (formalized by the lock service in 3.23), or fixed by
  rethinking the schedule/scope
- C. The cron stops running
- D. The OS prevents overlap automatically
Why: the cron-overlap cliffhanger, planted here and resolved a group later -
textbook spacing (3.19 -> 3.23).

---

## 13. Bank: Storage (3.20-3.22)

**Q1 · single · 1** - User-uploaded images belong in object storage rather than
the database because:
- A. Databases cannot store binary
- B. ✓ Blobs bloat backups, thrash caches, and monopolize DB I/O while needing
  none of the database's powers (queries, transactions) - store bytes in object
  storage, keep the metadata + URL in the DB
- C. Object storage is always faster
- D. Images are not data
Why: the metadata/bytes split is the chapter's one strong idea (3.20).

**Q2 · single · 2** - Presigned upload URLs exist so that:
- A. Uploads are encrypted
- B. ✓ Clients upload straight to object storage with a scoped, expiring
  credential - the app tier authorizes but never carries the bytes
- C. Users can be tracked
- D. Uploads can be free
Why: keeping bulk bytes off your compute path is a shape, not a trick - it
reappears in Drive, Instagram, YouTube (3.20).

**Q3 · single · 2** - Object storage vs. file storage - the semantic line:
- A. Size limits
- B. ✓ Objects are immutable-ish wholes fetched by key over HTTP; files support
  in-place edits, directories, and POSIX expectations - partial writes and
  renames mean file semantics
- C. Cloud vs. on-premise
- D. There is no difference
Why: choosing by semantics rather than fashion; the trade-off exercise's rule
(3.21).

**Q4 · single · 2** - A shared filesystem mounted by 40 app servers starts
corrupting concurrent writes. The architectural reading:
- A. Buy faster disks
- B. ✓ POSIX-style shared mutable state does not distribute - the fix is to
  change the data's shape (objects + metadata, or a real distributed store),
  not the disk
- C. Add more mounts
- D. Reduce to 39 servers
Why: "just mount a disk" stopping working is the felt limitation that motivates
distributed storage concepts (3.21 -> 3.22).

**Q5 · single · 2** - CAP, stated honestly:
- A. Pick any two of consistency, availability, partition tolerance
- B. ✓ Partitions happen whether you like it or not; when one does, you choose
  between serving consistently (refusing some requests) and serving available
  (risking stale/divergent answers)
- C. Consistency is always best
- D. CAP no longer applies to modern databases
Why: "pick two" is the famous mis-statement; partition tolerance is not
optional (3.22).

**Q6 · matching · 3** - Match posture to product: bank ledger -> CP-ish (refuse
rather than mis-state balances); social feed -> AP-ish (stale is fine, down is
not); shopping cart -> AP-ish with merge-on-read; presence indicator -> AP-ish
(approximation is the product).
Why: mapping product requirements to consistency requirements is the skill;
each pairing has a reason, not a rule (3.22).

**Q7 · single · 3** - A write quorum of W=2 and read quorum of R=2 over N=3
replicas gives you:
- A. Nothing useful
- B. ✓ Overlap: any read intersects any write's replica set (W+R > N), so reads
  see the latest acknowledged write - at the price of latency coupling to the
  second-slowest replica
- C. Guaranteed availability under any failure
- D. Automatic sharding
Why: quorum intuition at concept level - the mechanism behind "tunable
consistency" (3.22).

**Q8 · single · 2** - The coordinator's job in a distributed store is:
- A. Serving user queries faster
- B. ✓ Tracking what lives where and who is responsible - placement, membership,
  and reassignment when nodes come and go
- C. Caching hot keys
- D. Encrypting replicas
Why: somebody must hold the map; making that role visible is why the component
exists (3.22).

**Q9 · single · 3** - Interviewer: "Your product spans two regions. A network
partition splits them mid-write. Walk me through your options." The strongest
structure:
- A. Partitions between regions cannot happen
- B. ✓ Name the posture per data class: which writes pause (CP: e.g. payments)
  and which continue with reconciliation later (AP: e.g. likes) - one system,
  different answers per requirement
- C. Choose CP for everything to be safe
- D. Choose AP for everything to stay up
Why: per-data-class postures is the senior answer; whole-system absolutism is
the common mistake (3.22, §10.3).

**Q10 · single · 2** - Durability vs. availability - a system can be:
- A. They are the same property
- B. ✓ Down but durable (data safe, service unreachable) or up but undurable
  (serving fine, one disk failure from loss) - they fail independently and are
  bought with different machinery
- C. Only one at a time
- D. Neither without the cloud
Why: disentangling the forces users conflate as "reliable" (0.2's vocabulary,
matured; 3.22).

---

## 14. Bank: Reliability (3.23-3.26)

**Q1 · single · 2** - Every network call in your system now has a timeout. What
did you actually buy?
- A. Faster responses
- B. ✓ Bounded waiting - failure becomes a known state you can respond to,
  instead of a hang that propagates upstream
- C. Fewer failures
- D. Free retries
Why: timeouts convert ambiguity into decisions - the foundation every other
pattern builds on (3.23, 2.2's hang question matured).

**Q2 · single · 2** - Idempotency keys on a payment endpoint exist because:
- A. They speed up processing
- B. ✓ Retries (client or infrastructure) can deliver the same request twice;
  the key lets the server detect the duplicate and return the original result
  instead of charging twice
- C. They encrypt card data
- D. Banks require UUIDs
Why: at-least-once + retries make duplicates a certainty, not an edge case
(3.23; load-bearing in Payment System).

**Q3 · single · 3** - A circuit breaker "opens" after N failures to a
dependency. The point is:
- A. Punishing the dependency
- B. ✓ Failing fast and shedding load: callers stop queueing doomed requests,
  the struggling dependency gets air, and the breaker probes for recovery -
  protection in both directions
- C. Alerting the on-call
- D. Restarting the dependency
Why: the breaker is backpressure formalized; "protects both sides" is the
understanding under test (3.23).

**Q4 · single · 2** - Token bucket with capacity 10, refill 1/s. A client idle
for a minute sends 15 requests at once. Outcome:
- A. All 15 pass
- B. All 15 rejected
- C. ✓ ~10 pass immediately (the accumulated burst allowance), the rest are
  limited to the refill rate
- D. The bucket crashes
Why: burst tolerance is the token bucket's signature - and the reason it is
chosen over fixed windows (3.24).

**Q5 · single · 2** - Rate limiting at the API gateway vs. inside each service:
- A. Inside services only - closest to the work
- B. ✓ At the edge first: reject before work is done and before load spreads;
  service-level limits then guard internal budgets - both, with the edge as the
  front line
- C. Gateway only, never in services
- D. Neither if you have autoscaling
Why: placement is the design decision; "reject as early as possible" is the
principle (3.24).

**Q6 · single · 2** - Logs vs. metrics vs. traces - the one-line division:
- A. Three names for the same data
- B. ✓ Metrics say THAT something is wrong (cheap, aggregated), logs say WHAT
  happened (per-event detail), traces say WHERE in the request path it happened
  (cross-service causality)
- C. Logs are legacy; use only traces
- D. Metrics are for managers
Why: knowing which signal answers which question is the whole skill (3.25).

**Q7 · single · 3** - Your p50 latency is flat but p99 tripled. Alerting only on
averages, you'd have missed it. Why does p99 matter?
- A. It doesn't - 1% is negligible
- B. ✓ Tail latency hits your heaviest users and compounds across fan-out (a
  page touching 10 services experiences roughly the sum of their tails) - and
  averages arithmetically hide it
- C. p99 is easier to measure
- D. Regulators require it
Why: percentile literacy separates operators from spectators (3.25; 1.5's
ratios applied to SLOs).

**Q8 · diagram · 3** - *Purpose:* split-brain recognition. *Layout:* two leader
nodes side by side, each replicating to one follower; no coordinator.
```json
{"nodes":[
 {"id":"l1","componentId":"leader","position":{"x":220,"y":140},"config":{}},
 {"id":"l2","componentId":"leader","position":{"x":220,"y":340},"config":{}},
 {"id":"f1","componentId":"follower","position":{"x":400,"y":140},"config":{}},
 {"id":"f2","componentId":"follower","position":{"x":400,"y":340},"config":{}}],
 "edges":[
 {"id":"e1","source":"l1","target":"f1","kind":"replication"},
 {"id":"e2","source":"l2","target":"f2","kind":"replication"}],
 "entryPointIds":["l1","l2"]}
```
Validation flags this cluster. What is the failure being prevented?
- A. Too few followers
- B. ✓ Split brain: two nodes each believing they may accept writes produces
  two divergent histories that cannot be merged - there must be exactly one
  writer, agreed on by a quorum
- C. Replication edges pointing the wrong way
- D. Leaders may not coexist with followers
Why: the `split-brain-risk` rule's explanation carries the chapter's core idea;
divergence, not downtime, is the catastrophe (3.26).

**Q9 · single · 2** - Why do consensus clusters run an ODD number of voters?
- A. Odd numbers are lucky
- B. ✓ Majority quorum: 5 nodes tolerate 2 failures; adding a 6th tolerates no
  more (still needs 4) while adding cost and one more failure source - even
  counts also invite clean 50/50 splits
- C. Hardware ships in odd packs
- D. It is arbitrary convention
Why: quorum arithmetic at concept level - the "why an odd number" follow-up is
an interview staple (3.26).

**Q10 · single · 3** - The leader dies. Failover promotes a follower that was
500 ms behind on async replication. What is the honest consequence?
- A. Nothing - failover is free
- B. ✓ Up to 500 ms of acknowledged writes are gone; the system chose
  availability (fast async writes, quick failover) and this loss window is the
  price - sync replication would have traded write latency for closing it
- C. The old leader's disk restores them automatically
- D. Clients resend everything automatically
Why: 3.12's sync/async trade-off arriving at its consequence; connecting the
two chapters is the level-3 read (3.26).

**Q11 · single · 2** - Graceful degradation means:
- A. Failing slowly
- B. ✓ Shedding the optional to protect the essential - e.g. recommendations go
  static and search gets slower, but checkout keeps working
- C. Showing a nice error page
- D. Restarting components in order
Why: partial service beats binary up/down; requires knowing which flows are
essential - a requirements question in disguise (3.26, 1.2).

---

## 15. Bank: Checkpoints (R1-R3)

Checkpoints have no attached quiz (the build is the assessment). This bank backs
the optional Review affordance and pre-checkpoint self-checks. Questions are
integrative by design.

**Q1 · single · 2** *(pre-R1)* - Your R1 stack: CDN, LB, 3 app servers,
distributed cache, primary DB + replica, search. A full cache flush at peak
traffic causes what FIRST?
- A. Nothing - the cache refills silently
- B. ✓ The database absorbs the entire read load that the cache had been
  eating - if the cache's hit rate was carrying it past its ceiling, the DB
  saturates (the stampede writ large)
- C. The LB fails
- D. Search goes stale
Why: R1's stack is a chain of load transformations; knowing what each layer
absorbs is what "assembled from memory" means (3.14, 1.7).

**Q2 · ordering · 2** *(pre-R1)* - Order this request's hops: browser -> DNS
(resolve) -> CDN (miss) -> firewall/LB -> app server -> distributed cache
(miss) -> replica (read) -> back out.
Why: the full journey through everything Groups A-D built (2.1 matured).

**Q3 · single · 3** *(pre-R2)* - E-commerce brief: browse, search, order,
email receipts, nightly reports. Which flows are SYNCHRONOUS by requirement,
and which must not be?
- A. All synchronous - users are waiting
- B. ✓ Browse/search/order-acceptance are sync (the user waits); receipt email
  and reports must be async (the user's success doesn't depend on them; spikes
  must not couple)
- C. All async for scale
- D. Only reports are sync
Why: partitioning a real product's flows by sync/async is R2's core act (3.17's
question at system scale).

**Q4 · single · 3** *(pre-R2)* - In your R2 design, the interviewer asks "what
breaks first on Black Friday?" The strongest ANSWER SHAPE (any specific answer
can be right):
- A. "Nothing - it autoscales"
- B. ✓ Name the lowest-ceiling component on the hottest path, state the
  symptom, and give the pre-planned response ("checkout DB writes saturate
  first; queue depth alarms; we shed report generation and scale workers")
- C. "The cloud provider handles it"
- D. "Everything equally"
Why: checkpoint-level mastery is the reasoning pattern, not a memorized
component (1.7 + §9 lens 5, at composition scale).

**Q5 · single · 3** *(pre-R3)* - R3 validates anti-patterns only: many designs
pass. A passing design still gets two warning-severity notes. The right
reading:
- A. Warnings are errors you can ignore at your peril - fix them all
- B. ✓ Warnings are named trade-offs: the design is legitimate, and these are
  its costs - be able to defend or revise, either is engineering
- C. The validator is broken
- D. Passing with warnings is failing
Why: the posture shift IS the lesson - from "build the shape" to "own your
choices" (R3, curriculum §18.1).

**Q6 · multi · 3** *(pre-R3)* - Select ALL that are taught anti-patterns (would
fail R3) rather than judgment calls (warnings):
- A. ✓ Client wired directly to the database
- B. ✓ Queue with no dead letter queue
- C. Choosing pull-based feed generation over push
- D. ✓ Two leaders accepting writes for the same data
- E. Choosing SQL over NoSQL for the catalog
Why: separating "wrong" from "a choice with costs" is exactly the discrimination
R3 (and every interview) demands (curriculum §11.1's trade-off rule).

---

## 16. Bank: Real World Extraction

Section-level bank: retrospective-style questions keyed to the roster's
recurring intellectual centers. Per-project retrospective quizzes (4-6
questions, referencing the learner's own submitted design where detectable)
are authored per project following these models.

**Q1 · single · 2** *(Bitly)* - Reads (redirects) outnumber writes (shortens)
1000:1. This asymmetry should drive the design toward:
- A. Sharding the write path first
- B. ✓ An aggressively cached read path (hot URLs from cache/CDN) with a
  modest, correct write path - optimize where the traffic is
- C. Making shortening asynchronous
- D. Read and write symmetry
Why: read/write asymmetry is Tier 1's first lesson in letting measured shape
drive architecture (1.4's estimation paying off).

**Q2 · single · 3** *(Bitly)* - 301 (permanent) vs. 302 (temporary) redirects:
choosing 301 costs you:
- A. Latency - 301 is slower
- B. ✓ Analytics and control: browsers cache 301s and stop hitting your
  servers, so you can't count clicks or change the destination later
- C. Nothing - always use 301
- D. SEO ranking
Why: an HTTP status code as a business trade-off - tiny surface, real
consequence (RWE-Bitly's new concept).

**Q3 · single · 2** *(Rate Limiter)* - Your limiter's counters live
per-instance; the service runs 6 instances behind an LB. A client limited to
100 req/min can actually achieve:
- A. 100 req/min
- B. ✓ Up to ~600 req/min - each instance enforces its own count; correct
  limiting needs shared state (the distributed cache reappears)
- C. 0 req/min
- D. 16 req/min
Why: Tier 1 projects exist to make Part 3 components load-bearing in new roles
(3.14 + 3.24 composed).

**Q4 · single · 3** *(Notification System)* - A notification triggers push, SMS,
and email through one queue with one worker pool. What is the composition flaw?
- A. Queues cannot carry three message types
- B. ✓ Channel fates are coupled: an SMS provider outage backs up the shared
  queue and delays push and email too - per-channel queues/workers isolate
  failure domains
- C. Workers cannot send email
- D. Nothing - one queue is ideal
Why: blast-radius thinking applied to topology - the composition IS the lesson
in Tier 2 (3.17 + 2.2 matured).

**Q5 · single · 3** *(Payment System)* - Why is the ledger append-only (record
corrections as new entries) rather than updating balances in place?
- A. Databases are faster at appends
- B. ✓ An immutable history is auditable, replayable, and makes concurrent
  mutation bugs structurally impossible - the balance is derived, not stored
  truth
- C. Regulations ban UPDATE statements
- D. It saves storage
Why: Tier 3's correctness-critical systems shift the learner from "make it
scale" to "make it provably right" (3.22 CP posture + 3.23 idempotency).

**Q6 · single · 3** *(IRCTC)* - 10M users want 100k train seats at 10:00:00 AM
sharp. Why is a queue-based virtual waiting room the standard answer rather
than autoscaling the booking path?
- A. Autoscaling is too expensive
- B. ✓ The bottleneck is seat contention, not compute - a million concurrent
  transactions on the same inventory rows collapse the database no matter how
  many app servers exist; admission control serializes demand to what the
  contended resource can honestly serve
- C. Queues are more modern
- D. Users prefer waiting
Why: recognizing WHICH resource is contended (state, not compute) is the
senior diagnosis (3.13 hot rows + 3.24 admission, composed).

**Q7 · single · 3** *(Instagram)* - Push (precompute followers' feeds on post)
vs. pull (assemble on read): the celebrity problem breaks WHICH posture, and
how?
- A. Pull - reading is too slow for celebrities
- B. ✓ Push - one celebrity post fans out to 100M feed writes; hybrid designs
  push for normal users and pull for high-follower accounts
- C. Both equally
- D. Neither - celebrities need separate apps
Why: the roster's canonical both-postures-pass trade-off; the hybrid is
earned, not memorized (Tier 4's intellectual center).

**Q8 · single · 3** *(WhatsApp)* - WhatsApp's connection servers are stateful
(they hold live sockets). Every earlier chapter said prefer stateless. Why is
this not a contradiction?
- A. WhatsApp's engineers disagree with the curriculum
- B. ✓ The connection IS irreducible state - a live socket cannot live in a
  shared store; the discipline moves to containing it (map user->server,
  reconnect protocol, everything else still stateless)
- C. Statelessness was wrong all along
- D. Messaging apps are exempt from design principles
Why: Tier 4 inverts a foundational assumption ON PURPOSE - understanding when
a principle yields is deeper mastery of the principle (3.6 inverted).

**Q9 · single · 3** *(WhatsApp)* - "Sent" vs. "delivered" vs. "read" ticks are
really a lesson in:
- A. UI design
- B. ✓ End-to-end acknowledgment stages across an unreliable path - each tick
  is an ack from a different hop, and duplicates/reordering between them are
  why idempotent, ordered per-conversation delivery matters
- C. Database triggers
- D. Push notification APIs
Why: a two-pixel UI detail encoding the entire delivery-semantics stack
(3.17/3.18 composed end to end).

**Q10 · single · 3** *(YouTube)* - Why must ~all video bytes come from the CDN
edge, with the origin shielded?
- A. Origins cannot store video
- B. ✓ Video dominates bytes by orders of magnitude: serving it from origin
  melts both the origin and its network bill - the origin's job is to be the
  cold-miss source of truth, hit rarely
- C. CDNs are legally required for video
- D. Latency does not matter for video
Why: delivery economics as architecture - the warning rules fire when the
origin sits on the hot path (Tier 4; 3.15's foreshadow cashed).

**Q11 · single · 3** *(Uber)* - Driver locations update every ~4 s from
millions of drivers. Which posture and store shape fit this firehose?
- A. CP with a relational ledger - locations are precious
- B. ✓ AP with an in-memory, geo-indexed store - each update supersedes the
  last, loss of one ping is harmless, and staleness beyond seconds is
  self-healing
- C. Object storage - locations are blobs
- D. A single Kafka partition for global ordering
Why: data whose value decays in seconds justifies opposite choices from data
whose value is permanent - postures per data class (3.22's lesson in the
wild).

**Q12 · single · 3** *(Web Crawler)* - Your crawler is polite (per-domain rate
limits) and dedup'd. The frontier still grows faster than you crawl.
The design question this forces:
- A. Crawl faster and drop politeness
- B. ✓ Prioritization: the frontier is effectively infinite, so the real
  product is the ordering function (freshness, importance, recrawl cadence) -
  crawling everything was never the goal
- C. Buy more machines until it fits
- D. Stop accepting new URLs
Why: Tier 5's signature move - the naive metric (crawl it all) dissolves and a
judgment call becomes the architecture (frontier management as the new
concept).

**Q13 · single · 3** *(retrospective, any project)* - Your Phase B design
passed with a warning: "cache-aside on the read path: stale window up to
TTL." The debrief's reference solution used invalidation-on-write instead.
The right takeaway:
- A. Your design was wrong and should be redone
- B. ✓ Both are valid postures: you bought simplicity and paid staleness; the
  reference bought freshness and paid write-path complexity - be able to say
  which your product's requirements prefer
- C. References are always superior
- D. Warnings mean the validator disagrees with itself
Why: the debrief's job is calibration against alternatives, not correction -
stage 7 (critique) in action (curriculum §15.1).

---

## 17. Coverage and maintenance

- Every §5-16 bank maps 1:1 to a curriculum section; when a chapter is added or
  resequenced in [[CURRICULUM]], its bank is reviewed in the same change.
- Chapter-level quizzes (3-6 questions) are drawn from or modeled on the owning
  bank; a bank question testing material later than its section is a bug
  ([[CURRICULUM]] §18.2 applies to questions).
- Diagram questions must keep their graph JSON valid against the live registry -
  component renames are breaking changes to this document too.
- Question ids, once shipped, are persistence keys (per-question completion is
  persisted alongside chapter progress) - never reuse an id for a different
  question.
