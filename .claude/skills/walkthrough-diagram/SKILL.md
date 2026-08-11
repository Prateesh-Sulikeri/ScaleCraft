---
name: walkthrough-diagram
description: Author a new interactive <Walkthrough> diagram for a ScaleCraft chapter's MDX lesson, using the release 5.1.0-alpha normalize/layout pipeline (src/chapters/walkthrough/). Validates to zero issues via walkthrough-invariants.test.ts before it's considered done. Use when asked to add, build, or author a step-by-step diagram/walkthrough for a specific chapter. Not for mermaid/static diagrams (see CURRICULUM.md §7.2) and not for full chapter authoring (lesson prose, quiz, hints - that's the chapter-author skill).
version: 1.0.0
user-invocable: true
argument-hint: "<diagram-description> | <optional-additional-notes>"
---

# walkthrough-diagram

Generates one `<Walkthrough>` block (`src/chapters/walkthrough/`) and inserts
it into a chapter's `.mdx` lesson, using the auto-layout + `normalizeWalkthrough`
pipeline built in release 5.1.0-alpha (`.claude/docs/pending-diagram-pipeline.md`).
The pipeline exists because MDX prop literals are invisible to
`npm run typecheck` - a typo'd id silently vanishes a node or edge at
runtime instead of failing a build. This skill's job is to never let that
happen: every diagram it produces is validated against
`walkthrough-invariants.test.ts` before the skill considers itself done.

**Read `CLAUDE.md`'s Curriculum authoring section and
`.claude/docs/CURRICULUM.md` §7 (Diagram standards) first, every
invocation** - this skill assumes those contracts (one primary diagram per
chapter, one-diagram-per-topology, "see before read") rather than restating
them.

## Parse the invocation

Split the input on the first unescaped `|`:

1. **`<diagram-description>`** (required, left of `|`). Must identify two
   things in plain language:
   - **Which chapter** - a chapter id (`bb-3-4-load-balancer`), a curriculum
     slug/number (`3.4`, `3-4-load-balancer`), or enough context to find it
     unambiguously. Resolve it against `src/curriculum/manifest.ts` and
     `src/content/chapters/index.ts` before doing anything else, the same
     way the `chapter-author` skill does. If it doesn't resolve, ask - don't
     guess.
   - **What the diagram shows** - the topology (which components, which
     relationships) and the story the steps should tell (what happens
     first, what the learner should notice at each beat).
2. **`<optional-additional-notes>`** (right of `|`, may be absent). Judgment
   calls and deviations from the defaults below - e.g. "hand-place these two
   nodes, auto-layout crowds them", "no algorithm variants, this isn't
   comparing strategies", "use custom nodes for the partitions, there's no
   registry component for those". If there's no `|`, there are no notes -
   proceed on defaults.

If the description is too vague to design a concrete node/edge/step list
from (e.g. names a chapter but not a topology), ask one clarifying question
rather than inventing content.

## Before designing anything

1. **Resolve the chapter's lesson file.** Check
   `ChapterDefinition.lessonFormat` in `src/content/chapters/index.ts`. If
   it's not `"mdx"` (still legacy `.md`), **stop and say so** - a
   `<Walkthrough>` only resolves through the MDX compile path
   (`compileLessonMdx`/`MdxContent.tsx`); it silently does nothing embedded
   in a `.md` file rendered by the legacy `react-markdown` path. Migrating a
   chapter to MDX is out of this skill's scope (see `pending.md`'s build
   order) - report the blocker and stop.
2. **Check for an existing diagram of the same topology** in the target
   `.mdx` file (mermaid blocks and any existing `<Walkthrough>`). Per
   `CURRICULUM.md` §7.2's one-diagram-per-topology rule: if one already
   draws what this description asks for, don't add a second - either this
   *is* that diagram (revise it in place) or the old static one should be
   removed in favor of this interactive one (matches the precedent set by
   the 3.4 migration - see the diagram pipeline doc's decision record).
   Flag which you're doing; don't silently duplicate.
3. **Read the registry**, don't guess ids: `src/content/components/registry.ts`
   and `src/content/components/config/*.ts` for real `componentId`s and each
   component's `allowedKinds` per edge direction. If the topology needs an
   edge kind a component pair doesn't allow (the 3.4 chapter hit exactly
   this with `control` edges between `load-balancer` and `app-server`),
   don't invent it - keep it prose/illustration-only and flag the engine gap
   in your report, the same way 3.4's spec did. Don't silently work around
   engine gaps.

## Design the diagram

- **Nodes**: prefer `kind: "component"` against a real registry id. Use
  `kind: "custom"` only for an illustration-only concept with no registry
  backing (e.g. a Kafka partition) - both render identically, so this is
  never a visual downgrade, just an honesty check on whether a real
  component exists. Add `label` overrides whenever two nodes share a
  component (e.g. "App Server 1" / "App Server 2") so captions can
  distinguish them.
- **No hand-placed `position`, `column`, `viewBoxWidth`, or `viewBoxHeight`**
  unless the additional notes explicitly ask for one (a node auto-layout
  crowds, a topology auto-layout can't express). Omitting them and trusting
  `computeLayout` is the entire point of this release - don't default back
  to hand-placing out of habit.
- **Edges**: correct `kind` per real semantics (`request-flow` for the
  synchronous client-facing path, `control` for health/liveness,
  `replication` for copy propagation, `async` for queued/event hand-offs) -
  verified against the registry's `allowedKinds`, not assumed.
- **Steps** (minimum 2, `too-few-steps` otherwise):
  - Every caption names the node/edge it highlights in its own prose - the
    diagram is `aria-hidden`, the caption is the only accessible channel
    (see `types.ts`'s doc comment on `WalkthroughStep`). Budget 220 chars
    (`CAPTION_MAX_CHARS`).
  - Use `focus: "edge-id"` (or an array) when a step's highlight set is
    *exactly* that edge's endpoints plus the edge itself - the shorthand.
    Use explicit `highlightNodeIds`/`highlightEdgeIds` when it isn't (a
    node-only highlight, a highlight set that isn't a clean union). Mirror
    the 3.4 migration's precedent, don't force the shorthand where it
    doesn't fit.
  - Only add `algorithms`/`variants` if the diagram genuinely branches on a
    selectable strategy (round-robin vs. least-connections, cache-aside vs.
    write-through). A single algorithm is dead content -
    `walkthrough-invariants.test.ts` enforces >= 2 if `algorithms` is
    present at all, so don't add a 1-entry list.
- **Placement in the MDX**: insert right after the prose paragraph that
  introduces the concept the diagram illustrates, before deeper explanation
  - "see before read" (`CURRICULUM.md` §8.1) and "diagram precedes its
  explanation" (§7.2). Don't append at the end of the file regardless of
  where the relevant prose lives.

## Validate before calling it done

1. Edit the target `.mdx` file directly (git tracks it; this is a normal
   reversible edit, not a throwaway).
2. Run the repo-wide harness scoped to just this file's coverage:
   `npx vitest run src/content/chapters/walkthrough-invariants.test.ts`. Its
   failure message names the chapter file, the diagram's index within it,
   and every `code: message` - locate and fix from that directly, no
   debugger needed.
3. Iterate until it's green. **Never leave a `<Walkthrough>` in the working
   tree that this harness doesn't pass** - that's the one invariant this
   entire release exists to enforce.
4. If a browser is available this session, eyeball the diagram at
   `/dev/walkthrough-lab` (paste the props into the JSON editor - fastest
   way to see the auto-layout result and click through steps) or on the
   live chapter page. If not, fall back to the static compile-run-render
   check pattern logged in `pending-diagram-pipeline.md`'s completion log
   (compile the chapter via `renderMdx`, assert the expected labels/captions
   appear in the output) - say explicitly that this substitutes for a real
   visual pass, don't imply one happened.
5. Apply any deviations named in the additional notes, then re-validate.

## Constants

- **Never commit, push, or run the full CI pipeline unprompted.** The scoped
  `walkthrough-invariants.test.ts` run above *is* the validation step and is
  expected; `npm run typecheck && lint && test && build` together only runs
  if the user asks, per `CLAUDE.md`'s on-demand CI policy.
- **Never hand-place coordinates as a default.** If you find yourself adding
  `position` because auto-layout "looks a little off," that's a signal to
  reconsider the node/edge/column shape, not to override it - hand-placing
  defeats the release this skill exists to use.
- **Respect one-diagram-per-topology.** Never add a second diagram (static
  or walkthrough) for a topology the chapter already draws.
- **No new engine capability.** If the diagram needs an edge kind or
  component relationship the registry doesn't allow, don't add it to
  `allowedKinds` yourself - that's an engineering change outside this
  skill's scope. Flag it and keep the diagram to what's actually
  representable, same as 3.4's `control`-edge gap.
- **Report judgment calls.** Any place you substituted a close-enough
  componentId, chose `custom` over `component`, decided which existing
  diagram to replace, or picked `focus` vs. explicit arrays on a step that
  could go either way - name it in your final summary. Don't silently
  smooth over a decision the user might want to redirect.

## How to invoke this in a future session

- `/walkthrough-diagram 3.6 Caching: cache-aside read - client asks the App
  Server, App Server checks the cache first (miss), falls back to the SQL
  Database, then populates the cache for next time` - single-topology, no
  notes, all defaults.
- `/walkthrough-diagram For bb-3-13-sharding, a client write routed by hash
  to the correct shard among three shards | Use custom nodes for the shard
  labels, sharding has no dedicated registry component. No algorithm
  variants - this isn't comparing routing strategies.`
- Plain English also works - "add a walkthrough to 3.9 showing how a cache
  invalidation propagates" resolves the same way; you don't need the exact
  `|`-delimited syntax, just both required pieces of information somewhere
  in the request.
