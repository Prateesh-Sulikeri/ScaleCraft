# Prior Art & Research Notes

Findings from a research pass done before any code was written (2026-07-13). Kept for
posterity — re-verify time-sensitive claims (pricing, licensing) before relying on them
again months later.

## Competitive landscape

The space splits into three clusters, and no existing product combines all three traits
ScaleCraft is aiming for.

**Static/course content, no live validation.** systemdesign.one and ByteByteGo are
diagram-heavy explainer content — good teaching, zero hands-on construction. Educative's
"Grokking the System Design Interview" scaffolds from building blocks to end-to-end
challenges (structurally close to our chapter progression) but "interactivity" is guided
reading with an AI Q&A partner, not a validated construction canvas. LeetCode System
Design has no visualization at all.

**AI-graded interview practice.** Codemia.io has a diagramming canvas with AI feedback on
scalability/bottlenecks after submission — closest existing product to "explanatory
validation," but interview-prep framed: one-shot submissions, no simulation, no
curriculum progression.

**Live simulators (closest prior art).** SysSimulator runs a real discrete-event
simulation in WASM — live p50/p95/p99, RPS, cost estimates, 57 pre-built blueprints,
chaos scenarios (crashes, partitions, traffic spikes). Genuinely impressive engineering,
but pedagogically flat: one open canvas from minute one, hint-based nudges instead of
"why this violates a principle" reasoning, no curriculum tie-in. Paperdraw is similar and
earlier-stage.

**Gap:** nobody combines a constrained, curriculum-paced onboarding mode with live
simulation *and* reasoning-based validation *and* an explicit progression into open
sandbox. That combination is the actual bet ScaleCraft is making — see
[[ARCHITECTURE]] and [[MVP_SCOPE]] for how it's built.

## Game UX precedent

Zachtronics games (Opus Magnum, SpaceChem, TIS-100, Shenzhen I/O, Exapunks) establish the
core mechanic: combine simple reusable components into a system that *runs* against test
cases, scored on more than pass/fail. Their teaching power comes from three things worth
carrying over:

1. Narrow onboarding puzzles introduce one primitive at a time before combining them.
2. Validation is *execution*, not a checklist — the system runs and visibly
   succeeds/fails, making cause-and-effect legible.
3. Complexity increases via genuinely new subsystems unlocked over time (Factorio: oil,
   trains, logistics bots), forcing re-architecture rather than "more of the same" — a
   good model for chapter-by-chapter component unlocking.

## Canvas/graph library decision

Compared React Flow (xyflow), tldraw SDK, Rete.js, litegraph.js, Konva/Fabric,
JointJS, mxGraph/maxGraph. **React Flow (`@xyflow/react`) wins clearly**:

- MIT licensed (core), funded via a paid Pro tier that gates advanced *examples*, not
  core functionality.
- Native DAG semantics: typed handles, `isValidConnection` hooks — fits validation
  overlays directly.
- Nodes/edges are plain React components — every ScaleCraft component can host its own
  config UI and docs panel natively, which is a hard requirement.
- Documented patterns for animating tokens along edges (SVG `animateMotion` /
  `offsetPath`) — exactly the "packet moving LB→app→DB" simulation need.
- Comfortably handles thousands of nodes with virtualization — far beyond what a
  system-design canvas will ever need.

Runners-up and why they lost: tldraw is a whiteboard SDK first (graph semantics bolted
on via bindings) and its commercial-production license requires payment or a watermark;
Rete.js is oriented at visual-programming/dataflow execution UIs with a smaller
ecosystem; litegraph.js's standalone package was archived in 2025; Konva/Fabric are
canvas-only (no native way to host real DOM/React inside a node without a synced overlay
layer); JointJS+ and mxGraph/maxGraph are either commercially licensed or stalled in
pre-1.0.

## Validation engine design precedent

Every mature rule-checking tool converges on the same shape: **a matcher** that binds a
pattern against structured data, **a pass/fail**, and **a human-readable explanation
authored with the rule, not bolted on after**.

- **AWS CloudFormation Guard** is the closest analog to "explanatory feedback": its DSL
  lets you attach a `<<message>>` directly to a clause, so the explanation lives next to
  the logic. Pattern to copy: `rule.check(graph) -> { pass, message, offendingNodes }`.
- **ESLint's rule architecture** is the best model for pluggability: each rule is an
  isolated object reacting to a central traversal, reporting via
  `context.report({ node, messageId, data })`. Translated: a central graph
  traversal/query engine, rules as plain `{ id, appliesToChapter, match(graph), explain }`
  objects the engine invokes uniformly.
- **rustc's diagnostics** separate a short label (what's wrong) from a longer
  explanation reachable on demand, plus a stable reference to the offending span. We
  should do the same: short message + long "why this matters" + a reference to the
  offending node/edge for canvas highlighting.
- Graph pattern-matching (Cypher-style `MATCH (db)<-[:CONNECTS_TO]-(c) WHERE ...`) is the
  right *conceptual* shape for expressing structural rules, but at ScaleCraft's scale a
  real graph database is unnecessary — an in-process adjacency-list traversal with
  predicate functions is sufficient; only the *expression style* of Cypher is worth
  borrowing.

## Application stack precedent

Excalidraw is the closest architectural sibling: diagram elements are plain serializable
JSON, the client is the source of truth, sync is layered on top rather than being
foundational — a genuine local-first design. Exercism and CodeCrafters both separate
curriculum content from execution infra, and CodeCrafters in particular proves a
lean/solo team should not build custom infra for compute or grading — lean on managed
platforms and spend engineering effort on pedagogy and content.

Full findings (including the specific licensing/pricing figures gathered for Neon vs.
Supabase, Clerk, and Vercel) informed [[TECH_STACK]] — see that doc for the final calls
rather than re-deriving them here.
