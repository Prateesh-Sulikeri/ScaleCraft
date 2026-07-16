# Validation Agent Design: Component Relations, EdgeKind & Structural Rules

**Status:** Implemented (Track 1 — structural rules + per-component relations).
Track 2 (LLM-assisted deep review) is designed but blocked on a Gemini
billing/access issue and not yet built. This doc is the living reference —
update it in place as the design evolves, don't leave stale sections.

**Audience:** ScaleCraft maintainer; reference for milestone 5 (Stronger
Validation Agent).

---

## 1. Problem Statement: Taxonomy of Nonsensical Graphs

The known failure case from milestone 5's trigger (`MILESTONES.md`): a graph
with zero violations despite being visibly broken. Taxonomy of cases the
validation system needs to catch:

- **Orphan components** — a node with no edges at all. Category-agnostic.
  (`orphan-component.ts`)
- **Missing required input** — a node that declares an input port but has
  zero incoming edges, even though it has an outgoing one — the more
  misleading case, since it looks wired up. Discovered live: an API Gateway
  with an outgoing edge to a Load Balancer but nothing feeding into it.
  (`missing-input-connection.ts`)
- **Invalid relations** — an edge between two components that shouldn't be
  connected at all, connected with the wrong `EdgeKind`, or connected in the
  wrong *direction* (a Serverless Function feeding into a Load Balancer
  instead of the reverse). Originally three separate coarse rules
  (category-adjacency, backwards-request-flow, illegal-edge-kind); now one
  mechanism — see section 2.
- **Cycles in request-flow edges** — invalid only for request-flow
  specifically; cycles in replication/control/async edges are legitimate.
  (`request-flow-cycle.ts`)
- **Missing-companion patterns** — what the six original domain-specific
  rules mostly are (DLQ, read-replica, split-brain, single-instance-LB,
  permissive-firewall, no-direct-client-database). Kept as-is; these check
  something genuinely different (config values, cross-node counting) from
  connection legality.
- **Custom-component invisibility** — any rule keyed to a literal
  `componentId` doesn't apply to a user-authored custom component. Rules
  keyed on `category` (or a component's own declared `relations`) remain
  meaningful for them — see section 2's fallback design.
- **Architecturally weak but not enumerable** — "all the right pieces,
  still doesn't make sense as a whole." No fixed rule, no matter how many
  are added, can express this in general — see section 4.

---

## 2. Component Relations — the core mechanism (supersedes the original flat-matrix design)

### 2.1 What changed and why

The first version of this doc proposed a flat category-pair matrix
(`canvas/legal-edge-kinds.ts`) plus three separate cross-cutting rules
(category-adjacency, backwards-request-flow, illegal-edge-kind), each
independently approximating "is this connection legal." Building it
surfaced the real problem directly: a live test found an API Gateway with
an outgoing edge but nothing feeding into it, and neither the matrix nor
any of the three rules caught it — because all of them were guessing, from
the outside, at a property that's really specific to one component.

**The fix: components declare their own valid connections.** See
`content/components/types.ts`'s `ComponentRelations`:

```ts
type PortRelationConstraint = {
  allowedCategories?: ComponentCategory[];
  allowedKinds?: EdgeKind[];
};
type ComponentRelations = {
  inputs?: PortRelationConstraint;  // legal sources for an edge INTO this component
  outputs?: PortRelationConstraint; // legal targets for an edge OUT of this component
};
```

Every base-pack component (all 27, across all 6 `config/*.ts` files) now
declares this. A Load Balancer's own contract — `inputs: networking only`,
`outputs: compute only` — is what makes an App Server feeding into it fail
validation, not a generic "backwards" heuristic guessing at tiers.

This directly answers the "26 files, is this actually modular" pushback:
the rule *file* count stops growing every time a new mistake shape is
found. What grows instead is declarative data on the components
themselves — the same place `docs`/`summary`/`fields` already live, not a
new file per anti-pattern.

**Deliberately node-level, not port-level**: `GraphEdge` (`lib/graph.ts`)
has no concept of which specific port an edge attaches to, only
source/target node ids. A component with multiple input or output ports
gets one aggregate contract across all of them. If the graph model ever
gains port-level edges, this can be split per-port later without changing
the shape much — noted as a real limitation, not hidden.

### 2.2 The single rule: `component-relations.ts`

Replaced `category-adjacency.ts`, `backwards-request-flow.ts`, and
`illegal-edge-kind.ts` (all three deleted). Precedence per edge:

1. If either endpoint declares a relevant `relations` contract for that
   direction, it alone decides — pass or fail.
2. If **neither** endpoint declares one (every custom component, and any
   base-pack component someone forgot to contract), fall back to the
   coarse category+kind matrix in `canvas/legal-edge-kinds.ts`.

This is why `legal-edge-kinds.ts` wasn't deleted — its role changed from
primary mechanism to fallback, which is exactly what keeps custom
components meaningfully validated with zero authoring effort (see section
5 on why they don't get their own contract-authoring UI).

**Message quality, preserved despite the collapse**: `MatchResult` gained
an optional `detail?: string` field (CloudFormation Guard-style inline
messages, matching this codebase's own stated design lineage in
`validation-engine/types.ts`) so one rule covering several distinct failure
shapes can still produce a specific, tailored explanation per case instead
of one generic sentence for everything it catches. Collapsing rule *files*
was never meant to mean collapsing explanation *quality* — that would
violate the product's non-negotiable "explanation is the pedagogical
payload" principle from `CLAUDE.md`.

### 2.3 `missing-input-connection.ts` stayed separate

Unconditional on whether a contract exists — it only checks "does this
component declare an input port at all, and if so, does it have at least
one incoming edge (or Start-marker entry point)." Folding it into
`component-relations.ts` would've added no value and one more thing for
that rule's precedence logic to juggle.

### 2.4 Start-marker / orphan interaction (fixed)

`toArchitectureGraph` (`canvas/store.ts`) filters domain-graph edges to
`type === "component"` endpoints only — a Start marker's `targetId` is a
canvas-only pointer, never a real `GraphEdge`. Fixed by adding
`entryPointIds: string[]` to `ArchitectureGraph` (`lib/graph.ts`), populated
from Start markers' `targetId` fields, and consulted by both
`orphan-component.ts` and `missing-input-connection.ts` so a component
whose only connection is a Start marker isn't falsely flagged.

---

## 3. EdgeKind Visual System (implemented)

- Four `--edge-*` CSS custom properties (`globals.css`), same pattern as
  `--category-*`: cyan (request-flow), slate (control), teal (replication),
  fuchsia (async).
- `store.ts`'s `edgeStyle()` now sets both stroke color and a distinct dash
  pattern per kind (dotted/medium-dash/wide-dash) — two redundant channels,
  so kind is legible even for colorblind users or at small canvas scale.
  Animation stays request-flow-only (a real state distinction — "this is
  the live path" — not decoration, per `DESIGN_LANGUAGE.md`'s motion
  principle).
- `Canvas.tsx`'s `onConnect` is now a wrapper (not the raw store action)
  that looks up both endpoints' categories via `getComponent` and picks a
  category-aware default kind via `legal-edge-kinds.ts`'s `pickDefaultKind`,
  instead of always hardcoding `"request-flow"` — this was a required fix,
  not optional: without it, every new edge into a category pair where
  `request-flow` isn't legal would trip `component-relations.ts`
  immediately, before the user had done anything.

**Still open** (design/product calls, not resolved here): exact hex values
per theme, and whether `EdgeInspector`'s dropdown should pre-filter to only
show legal kinds for the selected edge's endpoints (not yet done — it still
shows all four unconditionally).

---

## 4. LLM-Assisted Track (designed, not yet built — blocked on Gemini access)

**Status**: blocked. Three different API keys against the same Google
account all returned `403 PERMISSION_DENIED: Your project has been denied
access`, most likely a billing-not-linked issue (see Google AI Studio
forum reports of the identical message). Nothing here can be built until
that's resolved on the Google Cloud side.

**Mechanism**: one structured critique call, not a multi-step agent — graph
JSON + docs for components present, JSON-only response. A tool-calling
agent loop was considered and rejected for v1: it multiplies cost and
complexity for no value this use case needs.

**Model**: Gemini Flash/Flash-Lite via `GEMINI_API_KEY`, free tier — same
mechanism this repo's own `graphify` tooling already uses.

**Availability is decoupled from rule-cleanliness — this was a real
correction mid-design, worth recording.** The original plan gated Deep
Check on the structural rules already passing clean, reasoning that this
would ration LLM calls to only the cases rules can't reach. That gate
turned out to rest on a false premise: it implicitly assumed the LLM
*needs* a rules-validated input to function correctly, as if it were a
second-stage checker trusting a first-stage guarantee. It isn't — an LLM
given the full graph reasons about it holistically, the same way a human
reviewer would, and is entirely capable of noticing a rules-missed
structural bug (like the API Gateway case) as part of the same holistic
pass. The rules-passing gate was actually only ever a *cost* optimization
("don't spend a call re-discovering what free rules already caught
instantly"), never a soundness requirement. Corrected design: keep a cost
throttle (daily cap + cache-by-canonicalized-graph-hash) as its own
independent guard, but don't gate the button's *availability* on rule
state — let it fire on whatever the user has, and let it catch what it
catches, including things rules missed.

**Severity: always `"warning"`, never `"error"`.** Chapter success is zero
`error`-severity violations; a hallucinated LLM finding must never be able
to fail a genuinely correct solution.

**Rate limit: a modest daily cap (5/day discussed), but it needs an
identity to count against, and there isn't one yet** — auth (milestone 9)
hasn't landed in the build sequence. Two options: defer this whole track
until auth exists and enforce the cap server-side per user (the safer,
originally planned order), or ship a soft client-side-only counter now as
a self-throttle for trusted invited testers, explicitly not a security
control.

**Mode scoping**:
- **Sandbox**: on — fully open-ended, where this earns its keep most.
- **Real World Extraction chapters**: on — `MILESTONES.md`'s own scope for
  RWE wants multiple valid architectures and anti-pattern-style validation,
  which can't be reduced to a blueprint diff.
- **Building Blocks chapters**: off — one prescribed shape and a reference
  solution means a blueprint diff is deterministic, free, and sufficient;
  an LLM opinion there is redundant noise.

**Fail-open**: if the rate limit is hit, skip the LLM pass silently and
show structural-rule results only. This track is additive, never a hard
dependency for validation to work at all.

---

## 5. Custom Components — deliberately reduced fidelity, not a bug

Confirmed exactly which layers apply to a custom, user-authored component
(`content/components/custom.ts`):

- ✅ `orphan-component`, `request-flow-cycle` — check any node/edge
  regardless of componentId or category.
- ✅ `component-relations`'s coarse fallback path — keys on `category`,
  which every custom component declares, so it's covered automatically.
- ❌ The six componentId-specific domain rules (DLQ, read-replica,
  single-instance-LB, permissive-firewall, split-brain-risk,
  no-direct-client-database) — keyed on a literal id a custom component
  will never match.
- ❌ `component-relations`'s precise contract path — requires a
  deliberately-authored `relations` field, which only base-pack components
  have.

**Decided: no UI for users to author their own contract, not now.**
Reasoning (see `.claude/docs/OPEN_QUESTIONS.md`'s new entry): this
product's own working conventions reject building for hypothetical future
need; a contract-authoring UI asks a *learner* to do the same relational
modeling work the engine team is doing, which isn't what a "make your own
component" feature is for; and custom components are already, unremarked,
a reduced-fidelity tier (none of the componentId-keyed rules apply to them
either). `CreateComponentModal.tsx` now says so explicitly rather than
leaving it as a silent, undocumented gap. Floated as a possible future paid
feature — logged in `OPEN_QUESTIONS.md`'s Business/sequencing section with
a real trigger, not built ahead of a monetization model that doesn't exist
yet.

---

## 6. Extensibility Checklist

**Adding a new base-pack component**: one object in the right
`config/*.ts` file, **plus a `relations` field** (see `registry.ts`'s
updated "adding a component" comment — this is the one thing that does NOT
happen automatically and is easy to forget). Skipping `relations` doesn't
break anything; the component just falls back to the coarse matrix like a
custom component would, silently getting less precise checking than its
siblings.

**Adding a new EdgeKind**: `EdgeKind` type (`lib/graph.ts`),
`EdgeInspector`'s dropdown + captions, `edgeStyle()`'s color/dash maps, a
new `--edge-*` CSS token, `legal-edge-kinds.ts`'s fallback matrix, and any
base-pack component whose `relations.allowedKinds` should include it.

**Adding a new ComponentCategory**: the type itself, category-color CSS +
`categoryColorVar`/`categoryLabel`/`categoryOrder`,
`DESIGN_LANGUAGE.md`'s color table, `legal-edge-kinds.ts`'s fallback
matrix, and any base-pack component whose `relations.allowedCategories`
should include it. Category-keyed rules (`orphan-component`,
`request-flow-cycle`, the fallback path) need no changes at all.

**Adding a new domain-specific rule** (config-value or cross-node-counting,
not connection legality): one new file in `validation-engine/rules/` + one
registry line in `rules/index.ts`. Engine itself never changes.

---

## 7. Genuinely Open Questions

1. Exact EdgeKind colors, final call (a first-pass default is live).
2. Whether `EdgeInspector`'s dropdown should pre-filter to legal kinds only.
3. Severity tuning for `orphan-component` and `missing-input-connection`
   (currently warning and error respectively) once real usage surfaces
   whether that split feels right.
4. Whether to ship the LLM track pre-auth with a soft counter, or wait for
   milestone 9 and enforce it properly server-side.
5. Custom-component contract authoring as a paid tier — deferred, see
   `OPEN_QUESTIONS.md`.

---

## Rollout Status

1. ~~Track 1 (structural rules + EdgeKind visuals + component relations)~~
   — **done**. Closes every case in milestone 5's "done when" bar,
   including the API Gateway case found during implementation that the
   original flat-matrix design didn't.
2. **Track 2 (LLM)** — designed, blocked on Gemini billing/access. Nothing
   to build until that's resolved.
