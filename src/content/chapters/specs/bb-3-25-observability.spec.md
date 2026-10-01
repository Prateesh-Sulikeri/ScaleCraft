# Chapter spec - 3.25 Observability

Authored under CURRICULUM.md §5, §6, §20. Deliverable 1 of 6.

- Chapter definition: `src/content/chapters/index.ts` (`bb-3-25-observability`)
- Lesson body: `public/content/chapters/bb-3-25-observability.mdx`
- Manifest row: slug `3-25-observability` (`chapterDefinitionId` flipped from
  `null`)

**Wave.** Third Group G chapter (Wave 7).

## 0. Type classification

**Concept** (§14), New: none (§16). **No Editor exercise**
(`hasEditorExercise: false`), justified below. Failure modes and Scaling are **o**
for Concept; both included because "monitoring that shares a failure with
production" is the chapter's most important failure mode. Practical is omitted
per §5.2's carve-out for pure Concept chapters (3.10, 3.13, 3.21 precedent).

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | You can't operate what you can't see: logs, metrics, traces; SLIs/SLOs at concept level; what to alert on. (§14) |
| Type | Concept |
| Difficulty | advanced |
| Estimated time | 20 minutes |
| Prerequisites | 3.24 |
| Unlocks | 3.26; RWE Tier 1 Metrics Monitoring project. |
| Building blocks introduced | None. Agrees with §16. |
| Stages trained | 6, 7 |
| Interview relevance | **Medium** - production-heavy; distinguishes senior candidates (§14). |
| Production relevance | The difference between a 1-minute and a 17-minute detection time on the same incident. |

## 2. Learning objectives

| # | Category | Objective |
|---|---|---|
| 1 | Knowledge | Name which of metrics, logs and traces answers "that", "what" and "where", and use them in that order. |
| 2 | Engineering | Choose labels for a metric that narrow an incident without exploding cardinality. |
| 3 | Engineering | Derive an error budget from an SLO and decide what spending it should change. |
| 4 | Interview | Answer "how would you know it's broken?" with a symptom SLO, burn-rate paging, and trace propagation. |
| 5 | Communication | Justify paging on a user-facing symptom instead of a resource cause, naming what the cause alert would miss. |

Exercised by: 1 -> three-signals table + trace diagram + Q1; 2 -> metrics section
+ Q5; 3 -> SLO section + Q4; 4 -> Interview lens + Q3; 5 -> "What to alert on" +
Q3. Localizing a fault (§14's exercise) -> "Localizing a fault" + Q5.

## 3. Per-beat outline

| Beat | Section | Notes |
|---|---|---|
| 1-2 | Opener | 3.24's Monday: the data existed at 09:04, the first human knew at 09:20. |
| 3 | Think first | One alert; why CPU is wrong though it would have fired. Paid off by name in "What to alert on". |
| 4-5 | "Three signals, three questions" | Table (mental model), trace as a Mermaid gantt (primary diagram), trace id propagation. |
| 6-7 | Metrics; SLIs/SLOs | RED/USE, percentiles (1.1), cardinality; SLI/SLO/error budget arithmetic. |
| 7 | "What to alert on" | Symptoms over causes, burn rate, every page needs an action. |
| 7 | "Localizing a fault" | The narrowing method, worked on Monday (flowchart). |
| 8 | Trade-offs | Labels, logging volume, tracing, SLO tightness; head vs tail sampling. |
| 9 | What breaks | Six, including 2.2's Facebook case and 3.19's silent job. |
| 10 | What changes at scale | Journey SLOs; telemetry as a capacity problem; automated comparison. |
| 11 | In production | Google (error budgets gate launches), Uber (Jaeger). Lens 9. |
| 12-13 | Mistakes, Interview lens | Senior answer from chapter vocabulary only. |
| 14-15 | Connections, Recap | 1.1, 2.2, 3.17, 3.23, 3.24. |
| 16 | Your turn | States there is no canvas exercise and why; the quiz is the diagnosis exercise. |
| Next | Next | 3.26 - the alert fires in a minute, the failover takes forty. |

## 4. Declared omissions and justifications

1. **No Editor exercise.** §14's own exercise is "scenario (given symptoms + three
   dashboards, localize the fault)" - not construction. Telemetry has no
   registry component, and every component already "emits" it, so there is
   nothing to place or wire that would express the skill. Ships as quiz Q5 (the
   three-dashboard scenario, deliberately a different incident from the lesson's
   worked one, so it tests transfer) and the lesson's worked narrowing. Not a new
   open decision: §14 never promised a build.
2. **No `<Walkthrough>`.** Nothing topological is stepped through; a trace is a
   timeline (gantt) and the narrowing is a decision flow.
3. Nugget boxes - decision 5.

## 5. Diagrams

- **Primary: Mermaid gantt** of one trace: gateway, app, three search shard spans,
  one database span. Shows "where" in one picture and ties to 3.13's fan-out.
- Mermaid flowchart: Monday's narrowing, symptom -> endpoint -> client version ->
  logs.
- Tables: three signals; trade-offs.

The gantt uses `dateFormat x` with millisecond offsets; worth a visual check that
the axis renders as seconds.milliseconds.

## 6. Component budget and cross-reference checks

- Palette identical to 3.24's; no exercise, so it is informational only.
- **2.3's Group G row (decision 15)** - third of four, still matches: the cold
  open is the "something is always broken" premise asking how anyone finds out.
- **3.24's Next paid off** (the 09:20 support ticket).
- **2.2's "monitoring only the stops you own" and Facebook case** reused as a
  failure mode, not retold.
- **RWE Tier 1 Metrics Monitoring** named in the Interview lens (§19).

## 7. Validation rules

None (no exercise).

## 8. Blueprint and starter graph

None (no exercise).

## 9. Hints

Two, for the knowledge check: orienting ("which question - that, where, what - is
this scenario asking?") and directional ("slice the symptom before blaming the
biggest number on the dashboard").

## 10. Quiz

Five, ramp 1/2/2/2/3. Bank §14 Q6 (three signals) -> Q1 and Q7 (p99) -> Q2, joke
distractors replaced ("metrics are for managers", "regulators require it"). Q3
(alert choice), Q4 (error budget arithmetic) and Q5 (three-dashboard
localization, §14's exercise) original. Single-choice letters b, d, a, c, b -
opens on b against 3.24's c.

## 11. Playtest pass (§18.2)

Quiz scope only (no build):

| Move | Taught in |
|---|---|
| Read p50 vs p99 | 1.1 |
| Know a fan-out waits for its slowest member | 3.13 |
| Know retries and breakers produce signals | 3.23 |
| Compute 0.1% of 30 days | 1.1's estimation habits |
| Slice a symptom by label to localize | **This chapter** |

## 12. Flagged

- The gantt diagram's axis format should be checked in the browser once.
- Google's launch-freeze policy and Uber's Jaeger are described at the level of
  their published accounts.
- ~1,750 prose words against 20 minutes - over the estimate's implied length; the
  SLO and alerting sections carry content §14 names explicitly.
