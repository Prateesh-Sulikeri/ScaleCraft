# Chapter spec - 3.24 Rate Limiting

Authored under CURRICULUM.md §5, §6, §20. Deliverable 1 of 6.

- Chapter definition: `src/content/chapters/index.ts` (`bb-3-24-rate-limiting`)
- Lesson body: `public/content/chapters/bb-3-24-rate-limiting.mdx`
- Manifest row: slug `3-24-rate-limiting` (`chapterDefinitionId` flipped from
  `null`)

**Wave.** Second Group G chapter (Wave 7).

## 0. Type classification

**Concept, config-weighted** (§14: "rate limiting is gateway/proxy config, not a
new box"). New: none (§16 lists 3.24 among the no-component Concept chapters).
§11.1 lists 3.24 under Config, and the exercise is one: the gateway is the
component under scrutiny, the fix is its `rateLimitPerMinute`. Failure modes and
Scaling are **o** for Concept; both are included because the chapter's own
mistakes (a limit that limits nothing, a limiter that fails closed) are its
failure modes. Practical is present because there is an exercise.

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Protecting systems from clients (and from themselves): fairness vs survival, the four algorithms at concept level, placement edge vs service, counting across many gateways. (§14) |
| Type | Concept (config-weighted) |
| Difficulty | advanced |
| Estimated time | 25 minutes |
| Prerequisites | 3.23 |
| Unlocks | 3.25; RWE Tier 1 Rate Limiter project leans on this chapter entirely. |
| Building blocks introduced | None. Agrees with §16. |
| Stages trained | 4, 5, 6 |
| Interview relevance | **High** - a standalone interview question and an RWE Tier 1 project (§14); loop step 6 follow-up on most designs. |
| Production relevance | Every public API ships one; most incidents involving one are a limit nobody sized. |

## 2. Learning objectives

| # | Category | Objective |
|---|---|---|
| 1 | Knowledge | Distinguish a per-caller limit (fairness) from a global one (survival), and name what each cannot stop. |
| 2 | Engineering | Predict a token bucket's admissions from its capacity and refill rate, and pick an algorithm by the burst behavior required. |
| 3 | Engineering | Place a limit at the first stop that knows enough to decide, and say why per-caller limits live at the gateway. |
| 4 | Practical | Configure the gateway's per-caller limit between the heaviest legitimate caller and a misbehaving client, and pass Submit. |
| 5 | Interview | Answer "how do you rate limit across many gateway machines?" with shared vs synced counters and the cost of each. |
| 6 | Communication | Justify load shedding by priority aloud, naming which flow survives and why. |

Exercised by: 1 -> fairness/survival table + per-caller vs global section + Q1;
2 -> algorithms tables + Q2; 3 -> placement diagram + Q3; 4 -> build; 5 ->
"Counting across many gateways" + Q4; 6 -> load shedding + Interview lens + Q5.

## 3. Per-beat outline

| Beat | Section | Notes |
|---|---|---|
| 1-2 | Opener | A client release with 3.23's retry storm built in; the gateway's limit is 100,000/min and blocks no one. |
| 3 | Think first | Pick the number, and say what it alone cannot protect against. Paid off by name in "Per caller, or for everyone" (both halves). |
| 4-5 | "A limit is an admission decision" | Fairness vs survival table; placement flowchart (primary diagram); "reject as early as possible, at the first stop that knows enough". |
| 6 | "How a limiter counts" | Four-algorithm table; token bucket worked table; 429 + Retry-After. |
| 7 | "Counting across many gateways" | Shared counter, local + sync, sticky routing. |
| 8 | "Per caller, or for everyone" | Trade-off table; load shedding by priority. |
| 9 | What breaks | Six. |
| 10 | What changes at scale | Limit tables; cost units and latency-driven budgets; edge absorbs floods, limiter state as 3.22's trade-off. |
| 11 | In production | Stripe (four layered limiters, load shedding), Shopify (cost-based leaky bucket). Lens 9. |
| 12-13 | Mistakes, Interview lens | Senior answer with numbers. |
| 14-15 | Connections, Recap | 3.5, 3.23, 3.14. |
| 16 | Your turn | Config chapter: names the gateway, gives the two bounding numbers, never the value. Discloses decision 11's drift message shape. |
| Next | Next | 3.25 - seventeen minutes before anyone knew. |

## 4. Declared omissions and justifications

1. **§14's "simulate burst traffic" is not available** - there is no simulator
   prompt UI (pending-content.md's named degradation). The burst is the lesson's
   token-bucket table and quiz Q2 instead.
2. **§14's "trade-off (per-user vs. global)" ships as a lesson table and quiz
   Q1/Q5**, the same degradation path 3.18, 3.19, 3.21 and 3.22 used.
3. **Placement is taught, not built.** Moving a limit between stops has no canvas
   expression (no proxy or CDN rate-limit field), and a "route this path through
   the gateway" exercise would need the learner to delete a bypass edge, which
   only `forbid`/`absent` can grade - and drift is blind to both (decision 11's
   fourth shape). One honest config exercise beats a placement exercise with a
   blank failure report.
4. **The shared counter store is not drawn.** `api-gateway.relations.outputs`
   reaches only networking/compute, so gateway -> distributed cache fails
   `component-relations`. Taught in prose; recorded in `simplifications`.
5. Nugget boxes - decision 5.

## 5. Diagrams

- **Primary: Mermaid flowchart** of the four placement stops and what each knows.
  Not a `<Walkthrough>`: placement is a ranking of stops, not a sequence, and two
  of the four stops (edge per-IP, dependency concurrency) are not registry
  components with limit fields.
- Two tables doing diagram work: the algorithm comparison and the token-bucket
  second-by-second trace.

## 6. Component budget and cross-reference checks

- Palette identical to 3.23's (24). No new component.
- **Config bounds come from the brief, not invented.** 240/min (heaviest real
  caller) and 1,200/min (a phone retrying every 50 ms) are stated in the
  problem statement, lesson and Your turn.
- **2.3's Group G row (decision 15)** - second of four; still matches. One client
  bug among thousands of healthy phones is "something always broken" arriving
  from outside.
- **3.5's warning paid off in reverse** ("a `rateLimitPerMinute` set too low
  throttles legitimate traffic").
- **3.23's Next paid off** (the mobile release retrying immediately and forever).

## 7. Validation rules

No new rules. Curated: `component-relations`, `orphan-component`,
`missing-input-connection`, `no-direct-client-database`. **No rule can see a
rate-limit value**; a rule flagging an "effectively unlimited" gateway would need a
threshold with no principled value, so none is proposed.

## 8. Blueprint and starter graph

- **One blueprint**: browser -> gateway -> LB -> app -> search, app -> SQL DB; the
  gateway carries `rateLimitPerMinute gte 240` and `lt 1200`. The registry
  default (600) is inside the band - a learner who resets the field passes, which
  is correct: 600 is a defensible value.
- **Open decision 11, fifth config-predicate instance, mitigated.** A value
  outside the band reports "Missing: API Gateway" with the gateway on the board.
  Mitigations: the band is wide (a 5x range), Your turn states the drift shape
  outright, and hint 3 repeats it. Unlike R1 there is no warning rule to explain
  the failure during Validate.
- **Clean starter**: a config fault is invisible to every rule. Brief, Your turn
  and hint 1 say so.
- **Layout.** Browser (x=60), gateway (x=320), LB over app (x=580), search over
  SQL DB (x=840). Two rows, widest column two.
- **Decorators.** Client, Application (spans gateway, LB, app), Data. No gap zone
  (config fix on a present node, §11.6). One comment with the two bounding rates.

## 9. Hints

1. Orienting: nothing is miswired; the gateway is counting, the question is what
   it counts up to.
2. Directional: the brief's two numbers bound the answer.
3. Near-miss catcher: the "missing while visible" drift shape.

## 10. Quiz

Five, ramp 1/2/2/2/3. Bank §14 Q4 (token bucket) -> Q2, Q5 (placement) -> Q3,
joke distractors replaced ("the bucket crashes", "neither if you have
autoscaling" reworked as a real autoscaling position). Q1, Q4, Q5 original.
Single-choice letters c, a, d, b, c - opens on c against 3.23's a.

## 11. Playtest pass (§18.2)

| Move | Taught in |
|---|---|
| Open a node's config and change a number | 3.4 (algorithm), 3.8 (instances) |
| Know `rateLimitPerMinute` caps one caller's requests | 3.5 |
| Pick a limit between legitimate peak and abusive rate | **This chapter** |
| Read "Missing: X" with X visible as a config mismatch | This chapter's Your turn and hint 3 (and R1's hint 3) |

No move unaccounted for.

## 12. Flagged

- Decision 11, fifth config-predicate instance (above).
- Stripe's four limiters and Shopify's cost-based bucket are stated at the level
  of their own published engineering posts.
- ~1,800 prose words against 25 minutes.
