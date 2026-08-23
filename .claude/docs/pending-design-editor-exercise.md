# Pending: Design Editor exercise audit + POA

**Status:** Audited 2026-08-23 on branch `fix/streak-counter`. No code or content
changed yet. Everything below is evidence + a phased plan; pick it up next session.

**Scope:** the Design Editor half of authored chapters only - the starter graph on
canvas and the brief in the QuestionPane sidebar. Not the Reader, not the quiz, not
the walkthrough diagrams (those use a different renderer, `src/chapters/walkthrough/`,
and are not affected).

---

## 0. How this was audited

Not by reading code alone. The dev server was already up, so the audit drove a real
browser (Playwright, reusing `e2e/.auth/user.json`) against
`/building-blocks/<slug>` for 3.1, 3.4, 3.9, 3.11 and 3.12 at a 1440x900 viewport,
captured screenshots, and read the live `.react-flow__viewport` transform and the
measured node boxes out of the DOM. Numbers below are measured, not inferred.

A second pass parsed every `starterGraph` in `src/content/chapters/index.ts` and
computed node-to-node gaps against the real rendered card size.

**Measured facts (load-bearing for everything else):**

| Fact | Value | Source |
|---|---|---|
| Component card width | **200px** (`data.width ?? 200`) | `src/canvas/ComponentNode.tsx:95` |
| Component card min height | **65px** | `src/canvas/ComponentNode.tsx:14` |
| Canvas pane at 1440x900 | **1116 x 842** | measured in-browser |
| `fitView` options | `{ padding: 0.1, maxZoom: 1 }` | `src/canvas/Canvas.tsx:724` |

---

## 1. Issue 1 - starter graphs are laid out edge-to-edge, so the edges vanish

### 1.1 Root cause: authored x-pitch equals the card width

Every Part 3 starter graph places nodes at an x-pitch of **200px**. The card is
**200px wide**. The gap between two adjacent cards is therefore **exactly 0px** -
the two cards touch. An edge between them has nowhere to be drawn, so React Flow
renders it as a ~2px dot between the two handles.

This is not a React Flow bug and not a `fitView` bug. `fitView` behaves correctly.
It is authored data.

Full scan of every `starterGraph` (gap = centre-to-centre distance minus the 200px
card width; "-" means no two nodes share that axis):

| Chapter | Nodes | Edges | Horizontal gap | Vertical gap | Bounding box | Measured fit zoom |
|---|---|---|---|---|---|---|
| 0.1 Welcome | 2 | 0 | 60px | - | 460 x 65 | - |
| 1.2 Designing the System | 2 | 1 | 120px | - | 520 x 65 | - |
| 3.1 Networking Fundamentals | 3 | 2 | 20px | - | 740 x 65 | 1.00 |
| 3.2 DNS | 3 | 2 | 20px | - | 640 x 65 | - |
| 3.3 Reverse Proxy | 5 | 3 | **0px** | - | 1240 x 65 | - |
| 3.4 Load Balancer | 4 | 3 | **0px** | - | 800 x 65 | 1.00 |
| 3.5 API Gateway | 6 | 4 | **0px** | - | 1400 x 65 | - |
| 3.6 Stateless Services | 8 | 7 | **0px** | - | 1600 x 65 | - |
| 3.7 Sessions & State | 8 | 6 | **0px** | - | 1600 x 65 | - |
| 3.8 Horizontal Scaling | 8 | 7 | **0px** | - | 1600 x 65 | - |
| 3.9 Service Discovery | 8 | 7 | **0px** | - | 1600 x 65 | 0.635 |
| 3.11 SQL vs. NoSQL | 9 | 7 | **0px** | 92px | 1600 x 245 | 0.635 |
| 3.12 Replication | 10 | 9 | **0px** | 92px | 1800 x 245 | 0.564 |

Nine of the thirteen editor chapters have a literal zero-pixel gap. 3.1 and 3.2 have
20px, which is not meaningfully better. Only 0.1 and 1.2 - the two oldest, authored
before the Part 3 template existed - have workable spacing. The 200px pitch was
copy-pasted forward from 3.3 onward and has been carried into every chapter since.

**Consequence:** the request chain reads as one unbroken strip of cards. The learner
cannot see which node connects to which, cannot tell a wired pair from an unwired
one, and - in a Fix-the-Architecture chapter whose entire premise is "find the wrong
edge" - cannot see the edges at all. This actively defeats 3.7, 3.12 and every other
fix/completion exercise.

### 1.2 Second, independent cause: the bounding box aspect ratio fights the pane

The pane is 1116 x 842 (aspect **1.33**). A 10-node single-row chain is 1800 x 245
(aspect **7.3**). `fitView` fits the *bounding box*, so it is width-constrained: it
picks zoom 0.564, and the graph occupies a thin horizontal band with roughly **70% of
the canvas height empty**. At 0.564 the card labels shrink to ~6px and the
descriptions truncate to "Distributes requests a...". Screenshots confirm this for
3.9 (0.635) and 3.12 (0.564).

So the learner gets, simultaneously: cards too small to read, and a canvas that is
three-quarters empty. That combination is what reads as "zoomed in and cramped" -
the graph is dense in one axis and abandoned in the other.

Note `fitViewOptions.maxZoom: 1` is *not* the problem here (measured zoom is below 1
on the chapters that look worst). Raising it would only help 3.1-3.5.

### 1.3 What "fixed" should mean

Two design targets, both authoring-side:

1. **Minimum 120px horizontal gap** between adjacent cards (pitch 320px). 120px is
   enough for an edge with a visible direction, a mid-edge label, and a click target.
   Minimum 95px vertical gap (pitch 160px).
2. **Bounding-box aspect ratio ≤ ~2.5:1**, achieved by tiering the chain into rows
   instead of one long line. This is the change that gets fit zoom back to 1.0 and
   makes the cards readable.

Tiering should be **semantic, not serpentine**. A serpentine wrap of a linear chain
is compact but reads as noise. Grouping by architectural tier is compact *and*
teaches something. Worked example for 3.12 (10 nodes):

```
row 1 (client + edge, y=0):    browser -> dns -> firewall -> reverse-proxy
row 2 (routing + app, y=160):  api-gateway -> load-balancer -> app-server
row 3 (data, y=320):           sql-database   nosql-database   read-replica
```

At pitch 320/160 that is 1160 x 385 (aspect 3.0), and `fitView` lands at ~0.87
instead of 0.564. Dropping to 3 columns per row gives 840 x 545 (aspect 1.54) and
fit zoom clamps at the full 1.0. Exact column counts are a per-chapter judgment call;
the invariant test (Phase 3) enforces only the gaps and the aspect ceiling.

### 1.4 Rejected alternative: normalize at load time

An obvious shortcut is to run a spacing/auto-layout normalization inside
`loadGraph` (`src/canvas/store.tsx:461`), reusing the ideas already in
`src/chapters/walkthrough/layout.ts`. **Do not do this.** Reasons:

- Node positions are persisted per learner (`db.saves`, and cloud-synced since
  6.1.0). A runtime normalizer would fight every graph the learner has since
  dragged, and would have to distinguish "authored starter" from "learner-moved" on
  every restore.
- Starter positions are curriculum content. Making them non-authoritative moves a
  teaching decision (which components sit in which tier) out of the chapter spec and
  into a layout algorithm.
- The authored data is reviewable in a diff; a layout heuristic is not.

Fix the data, and gate it with a test.

---

## 2. Issue 2 - the brief reads as an essay, not an exercise

### 2.1 Where the brief comes from

`QuestionPane` (`src/chapters/QuestionPane.tsx:153`) renders
`ChapterDefinition.problemStatement` as markdown, then unconditionally renders
`learningObjectives` as a bulleted list below it. `problemStatement` is used for real
in exactly one place - this pane. The Reader only reads it as a *fallback* while the
MDX lesson is still fetching (`ChapterReader.tsx:85`). So it can be rewritten for the
editor without touching the lesson.

The current sidebar order is: title, difficulty/status, problem statement, learning
objectives, required-components count, validation summary, hints, further reading.

### 2.2 Finding A - no structure separates context from task

Every brief is one undifferentiated prose block. 3.12's opens with three sentences of
lesson recap ("This chapter is about giving reads somewhere else to go...") before the
task appears in a trailing clause. 3.9's is a five-sentence scenario with the actual
instruction ("Lower the DNS node's ttlSeconds until...") as the last clause.

The learner has to parse an essay to extract a goal. There is no "Goal", no "You're
done when", no visual separation. This is exactly what the user reported: it reads as
sentences, not as an exercise.

### 2.3 Finding B - the learning objectives print the answer, unconditionally

Every editor chapter carries a "Practical" objective that states the full solution,
and `QuestionPane` renders it directly under the brief with no disclosure:

| Chapter | Objective rendered in the editor |
|---|---|
| 1.2 | "Fix a starter graph that skips the app server: **add the missing component, route both edges through it**..." |
| 3.4 | "Fix a starter graph with an under-provisioned load balancer: **add a second instance, wire it identically**..." |
| 3.6 | "Fix a starter graph's under-provisioned load balancer **by raising the Application Server's own Instances field - not adding a second node**..." |
| 3.7 | "**Reconnect** a starter graph's disconnected SQL Database **to the Application Server with a request-flow edge**..." |
| 3.9 | "**Lower** a starter graph's DNS node **ttlSeconds** until it no longer outlasts a stated cutover downtime budget..." |
| 3.12 | "**Wire a Read Replica to receive a replication feed from a database and serve reads back to the Application Server**, correcting an illegal write-shaped edge..." |

3.12 is the clearest case: this objective gives away strictly more than hint 3 does,
and hint 3 is behind a click. The chapter's hint ladder is dead on arrival.

This violates two binding rules:
- CURRICULUM §11.2 ("Deliberately omitted... the gap the learner must bridge is the
  exercise").
- CLAUDE.md / §11.3, hints are opt-in and a learner "who never asks for a hint must
  still be able to fail, read the explanation, and reason their own way to a fix."
  An always-visible objective that names the fix removes that path entirely.

Objectives are the *lesson's* framing device and the learner has already read them
there. They should not be in the editor at all.

### 2.4 Finding C - task calibration is inconsistent and undeclared

There is no rule for how much the brief may say, so it varies chapter to chapter:

- **Names the exact field and direction:** 3.6 ("the app server's own Instances field
  is still 1"), 3.9 ("Lower the DNS node's ttlSeconds"), 3.7 ("Connect the Application
  Server to the SQL Database with a request-flow edge").
- **Withholds deliberately and says so:** 3.1 ("Which specific check fires if you
  don't... isn't previewed - run Validate"), 3.2, 3.4 ("Run Validate, read what it
  reports, and use that to decide what's missing").
- **Withholds by accident, buried in recap:** 3.12.

§11.4 asks for a difficulty ramp where "scaffold fades." What exists is noise, not a
ramp. 3.7 and 3.9 (later) hand over more than 3.4 (earlier).

### 2.5 Finding D - no observable success criteria are surfaced

§11.2 requires each chapter to declare "expected deliverables... stated in the
transition brief as observable success criteria ('requests reach either server;
killing one instance doesn't drop traffic')." No chapter surfaces these in the
editor. The only completion signal the pane shows is a raw counter
("7 / 10 required components connected") and a validation summary line. The learner
knows how many boxes are missing but never what "done" looks like in system terms.

### 2.6 Finding E - the brief duplicates the lesson

The learner arrives via "Your turn" at the end of the lesson, having just read the
material. Briefs that re-narrate the chapter's thesis (3.12, 3.11, 3.8) spend the
sidebar's scarce space on recap. CURRICULUM §20.6 (information density, binding,
outranks every other style preference) applies to the brief as much as to the lesson.

---

## 3. Plan of action

Phased so each phase is independently reviewable and independently mergeable.
Branch: `fix/design-editor-exercise` off the current release branch.

### Phase 0 - decisions to make before writing anything

These are the only things blocking. Everything else is mechanical.

| # | Decision | Options | Recommendation |
|---|---|---|---|
| D1 | Brief structure: convention or schema? | (a) keep `problemStatement: string`, mandate a markdown micro-structure; (b) add `exerciseGoal: string` + `successCriteria: string[]` to `ChapterDefinition` and give QuestionPane real headings | **(b)** - it is enforceable by an invariant test, it renders with real headings, and it costs the same authoring pass either way. `problemStatement` stays as the (shortened) scenario. |
| D2 | Do learning objectives stay in the editor? | (a) remove the block entirely; (b) filter out the Practical objective; (c) collapse behind a disclosure | **(a)** - the learner just read them in the lesson. (b) needs an objective-category field that does not exist. |
| D3 | How much may the brief give away? | needs a declared rule in CURRICULUM §11.2 | Propose: the brief names the **symptom and the goal**, never the **component, field, or edge kind** that fixes it. Fix chapters ship symptoms (§11.1 already says this); Config chapters may name the component but not the direction or target value. |
| D4 | Tier layout per chapter - who decides the rows? | (a) author decides per chapter, test enforces gaps + aspect only; (b) a shared tier table (edge / routing / app / data) applied uniformly | **(a)** with (b) as the default starting point. |
| D5 | Is the em-dash rule being honoured in new briefs? | CLAUDE.md personal preference: use `-`, never `—` | Yes, and `authoring-invariants.test.ts:75` already enforces it. Keep. |

Note D3 changes a doc, so per CLAUDE.md it lands as **its own commit** editing
CURRICULUM §11.2 / §11.4, before any chapter content is rewritten. Never author
around the framework silently.

### Phase 1 - starter graph layout (issue 1)

1. Retrofit all 11 under-spaced chapters (3.1 through 3.12) to pitch **320 x 160**
   (gaps 120 / 95) with semantic tiering per D4. 0.1 and 1.2 get a light pass to the
   same pitch for consistency.
2. Re-check each chapter's bounding box against the ≤2.5:1 aspect target.
3. Verify in-browser at 1440x900 that fit zoom is ≥0.8 for every chapter and that
   every edge is visibly drawn. Reuse the Playwright approach from §0 - a throwaway
   script reading `.react-flow__viewport`'s transform is enough, this does not need
   to become a committed spec.

Content-only. No engine change. Positions are the only field touched, so blueprints,
rules, quizzes and hints are all untouched and the existing tests should stay green.

**Watch out:** `authoring-invariants.test.ts:103` asserts no starter graph already
completes its chapter. Moving nodes cannot break that (it is edge/config-based), but
re-run it.

### Phase 2 - the exercise brief (issue 2)

Depends on D1/D2/D3.

1. `ChapterDefinition`: add `exerciseGoal` and `successCriteria` (per D1b).
2. `QuestionPane`: render `Goal` / `Your task` and `You're done when` as headed
   sections; **remove the Learning objectives block** (D2a). Update
   `QuestionPane.test.tsx` accordingly.
3. Rewrite the brief for all 13 editor chapters under D3's calibration rule. Shorten
   the recap (Finding E) - the scenario should be 2-3 sentences, not 6.

Worked example, 3.12 Replication, as the template:

> **Scenario.** Reads and writes both go through the one primary database, and reads
> outnumber writes by an order of magnitude. A Read Replica is already on the canvas,
> wired the same way every other data component in this system was wired.
>
> **Goal.** Give reads their own path to a copy of the primary - without letting
> anything write to that copy.
>
> **You're done when.**
> - The Read Replica's data comes from the primary, not from the application tier.
> - The Application Server can serve reads from the replica.
> - Validate reports zero issues, and Submit passes.

Note what that does *not* say: it never names `replication` as the edge kind, never
says "delete the existing edge", never says which direction. That is hint 2's and
hint 3's job, and they still work.

Worked example, 3.9 Service Discovery (a Config chapter, so D3 permits naming the
component but not the value):

> **Scenario.** The public DNS record still carries the 300-second default TTL from
> 3.2. Ops is cutting the whole stack over to new infrastructure with a 30-second
> downtime budget.
>
> **Goal.** Make sure no client is still hitting the old address once the cutover
> window has closed.
>
> **You're done when.** The DNS node's cached answers cannot outlive the deploy's own
> downtime budget, Validate is clean, and Submit passes.

### Phase 3 - regression gates

Add to `src/content/chapters/authoring-invariants.test.ts`:

- **Spacing gate:** for every `starterGraph`, no two nodes may sit closer than 120px
  horizontally (when within 40px vertically) or 95px vertically (when within 40px
  horizontally). This is the test that stops the 200px pitch coming back.
- **Aspect gate:** bounding box aspect ratio ≤ 2.5:1 for graphs of 4+ nodes.
- **Brief gate (if D1b lands):** every chapter with `hasEditorExercise !== false` and
  a `starterGraph` must declare a non-empty `exerciseGoal` and at least two
  `successCriteria`.
- **Spoiler gate (best-effort):** flag any `successCriteria` or `exerciseGoal` string
  containing an `availableComponentIds` display name that is not already present in
  the starter graph. Heuristic, not proof - it catches the 3.4/3.12 class of leak.

### Phase 4 - doc + ledger

- CURRICULUM §11.2 / §11.4 updated with D3's calibration rule and the layout
  standard (own commit, per Phase 0).
- `.claude/docs/pending-chapters.md`: append a note per touched chapter. Thirteen
  chapters is a lot of rows - a single dated "layout + brief retrofit" entry naming
  all thirteen is acceptable here, since no chapter's teaching content changes.
- `DESIGN.md`: record the 320 x 160 starter-graph pitch as the canvas layout standard.

---

## 4. Not in scope (raised, deliberately deferred)

- **The canvas pane's own aspect.** 842px of height for a graph that is 245px tall is
  wasteful, but the fix is tiering the graph (Phase 1), not resizing the pane. If
  tiered graphs still leave the pane empty, revisit then.
- **`fitViewOptions.maxZoom: 1`.** Correct today. Once graphs are tiered, small
  chapters (3.1, 3.2 - 3 nodes) will clamp at 1.0 and sit small in a large pane.
  Worth re-measuring after Phase 1; raising it to 1.2 may be right, but do not change
  it speculatively.
- **Walkthrough diagrams** (`src/chapters/walkthrough/`). Separate renderer, separate
  geometry constants (`NODE_WIDTH = 148`, its own COL_GAP/ROW_GAP), already has a
  normalization + invariants harness. Not affected by anything here.
- **`rwe-dummy-1`.** Placeholder content, single node. Skip until real RWE content
  lands.
