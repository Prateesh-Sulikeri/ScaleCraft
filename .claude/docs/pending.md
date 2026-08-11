# Release 5.0.0-alpha — Content Platform

Status: **build in progress - MDX pipeline landed, blocked on chapter content
for the next two steps** (see Build Log below). Compiled 2026-08-10/11 from
`.claude/docs/ScaleCraft_Future_Roadmap.md`'s
"Alpha 5.x — Content Platform" entry (two three-bullet brainstorm items: 5.0.0
Content Update, 5.1.0 Diagram Topology Update), turned into something buildable
through a live scoping conversation. This doc is the working release plan -
update it in place as tracks land, same convention prior release docs used.

Release 4 is complete (guided tour + Wave 1 curriculum content, shipped and
merged). Its own remaining loose ends live in `.claude/docs/pending-chapters.md`
(curriculum ledger, intentionally left open) and `.claude/docs/pending-polish.md`
(engineering polish/manual-QA items retired from `pending-guided-tour.md`).

---

## Final Plan

**One track**, Chapter Reader + Quiz only — Design Editor/sandbox untouched.

1. **MDX migration** — swap `react-markdown` (runtime AST parsing on every
   render) for compiled MDX (build-time compile to real React/JS, cost gone
   from the client). Incremental: pilot on the Load Balancer chapter first, not
   a big-bang rewrite of every chapter.
2. **Walkthrough diagrams** — new, purpose-built lightweight spatial renderer
   (SVG/CSS positions, *not* React Flow — keeps the codebase's existing bias
   against dragging canvas weight into read-only surfaces, see
   `ReadOnlyGraphSummary`'s own doc comment). Step-driven via a generalized
   version of the Guided Tour's step engine (`src/tour/TourController.tsx`) -
   step index -> highlighted node/edge -> caption -> prev/next, matching the
   confirmed AlgoMaster.io reference (`algomaster.io/learn/system-design/load-balancers`:
   a discrete step-indexed walkthrough with a step counter, not continuous
   animation). Two node kinds: `{ kind: "component", componentId }` (real
   registry entry, e.g. Load Balancer - identical card/icon/color to the
   sandbox) and `{ kind: "custom", icon, label, category }` (illustration-only,
   e.g. Kafka partition - rendered through the same shared visual primitive so
   it never reads as a second system).
3. **Pilot** — Load Balancer walkthrough, registry-only (`component` kind
   only, no `custom` yet), built on the same migrated chapter. **Blocked on
   real content:** 3.4 Load Balancer is currently placeholder (`bb-dummy-1.md`,
   deferred to Wave 2 per `pending-chapters.md`) - confirmed 2026-08-11 to
   author real lesson/quiz/hints/blueprints via the chapter-author skill
   *before* the MDX/walkthrough pilot builds on it, rather than piloting
   against dummy text.
4. **Glossary** — `<Ref id="...">term</Ref>` authored explicitly per mention
   (no auto-detection - fragile for real content, explicit is cheap on
   hand-authored prose anyway), plain Markdown content (not MDX - short
   reference snippets, not mini-lessons) in `src/content/concepts/` (same
   barrel convention as `componentRegistry`), reusing the existing
   `MarkdownRenderer`/`remark-callouts` pipeline as-is. Tap-to-open everywhere,
   hover-preview layered on top only for pointer devices
   (`@media (hover: hover)`).
5. **Build order** — MDX pipeline -> migrate Load Balancer chapter -> walkthrough
   renderer -> Load Balancer walkthrough -> glossary (parallel, independent) ->
   quiz `diagram` questions upgraded to the spatial renderer -> `custom`-node
   kind for internal-mechanism diagrams (Kafka etc.) as a follow-up once the
   simple case is proven.
6. **Versioning** — major bump, `VERSION` becomes `5.0.0-alpha`, matching the
   roadmap's own "Alpha 5.x" naming.

**Both previously-open defaults confirmed 2026-08-11:**
- Walkthrough renderer is hand-rolled (SVG/CSS), not React Flow read-only mode -
  matches the codebase's existing bias against React Flow outside the editable
  canvas.
- Quiz `diagram` questions **do get upgraded** to the new spatial walkthrough
  renderer once it exists (reversing the earlier "stays text-list" default) -
  visual consistency with lesson content wins over "trace it from text" as a
  standalone comprehension check.

**Branch plan:** `release/v5.0.0-content-platform`, cut from `develop`
(currently up to date with `origin/develop`, `0c25281`). Individual `feature/*`
branches per unit of work underneath it, per `CLAUDE.md`'s branching
convention. Claude pushes, never merges.

---

## Build Log (updated as each unit lands - append here, don't wait for release end)

### 2026-08-11 — MDX pipeline (`feature/mdx-pipeline`, step 1 of the Build order) - done

Server-compiles per the "preserve current logic" decision above, not static
per-chapter imports. Per-chapter opt-in via a new `ChapterDefinition.lessonFormat?:
"md" | "mdx"` field (default `"md"`) - nothing is migrated yet, this is
infrastructure only.

- **Shared plugin config extracted** (`markdown-plugins.ts`, `markdown-components.tsx`
  under `src/canvas/docs-panel/markdown/`) so the legacy react-markdown path and
  the new MDX path can't drift - `MarkdownRenderer.tsx` now imports from these
  instead of holding its own copy.
- **`/api/lessons/[chapterId]` route** reads a chapter's `.mdx` source from
  `public/content/chapters/` via `fs` (not fetched), splits it at "## Next"
  with the *existing* `splitMarkdownAtNextSection` (moved, unchanged, to
  `src/chapters/split-markdown.ts` so both the client and this server route can
  use it), compiles each half via `@mdx-js/mdx`'s `compile()`, returns
  `{ raw, beforeCompiled, nextCompiled }`. TOC extraction and YourTurnCard
  placement in `ChapterReader.tsx` still run against `raw` exactly as before -
  confirms the "minimal rewrite" goal held.
- **`useChapterLessonMdx` + `MdxContent.tsx`** on the client: fetch the
  compiled JSON, `run()` it (evaluate only, no parsing) via `@mdx-js/mdx`,
  render with the same `markdownComponents` map as the legacy path.
  `ChapterReader.tsx` branches on `chapter.lessonFormat === "mdx"` to pick
  between this and the legacy `useChapterLesson`/`MarkdownRenderer` pair -
  both code paths coexist, nothing forces a chapter to migrate.
- **Real bugs found and fixed while building this** (round-trip tests in
  `compile-lesson-mdx.test.ts` caught both, not manual review):
  - `getChapter` (from `content-service.ts`, `"use client"`) can't be called
    from a server Route Handler - the route now looks the chapter up directly
    via `chapterRegistry`.
  - `rehypeRaw` (needed by the *legacy* pipeline so react-markdown can
    understand literal HTML) is incompatible with MDX's own native JSX
    parsing - it crashes on MDX's `mdxJsxFlowElement`/`mdxJsxTextElement`
    nodes. `rehypeSanitize` doesn't recognize those nodes either and silently
    drops them. Fix: a separate `mdxRehypePlugins` export (just `rehypeSlug`)
    used only by the MDX compile path - sanitizing doesn't apply anyway since
    lesson content is first-party-authored, never user input.
- **Found, not fixed (pre-existing, already tracked):** GitHub-style callouts
  (`> [!NOTE] ...`) are currently broken on the *legacy* react-markdown path -
  `rehypeRaw` camelCases the `data-callout` hast property before
  `rehypeSanitize` runs, so the schema's literal-string match misses it and
  the property gets stripped. Already documented in
  `MarkdownRenderer.test.tsx` with a deliberately-not-fixed tracking test
  ("this repo's rule against unrelated fixes without approval"). Not touched
  here. Side effect worth knowing: because the MDX path drops `rehypeRaw`
  entirely (see above), **migrated chapters won't have this bug** - callouts
  will render correctly in MDX chapters even though they're still broken in
  every not-yet-migrated one.
- **Verified:** `tsc --noEmit`, `eslint`, full `vitest run` (189 files/1644
  tests), `next build` all clean. Manually smoke-tested the route + lesson
  page against a throwaway `.mdx` fixture on the placeholder chapter (`bb-dummy-1`,
  temporarily flagged `lessonFormat: "mdx"`, reverted after) - confirmed the
  API compiles real MDX syntax (GFM tables, code fences, raw `<details>`) and
  the lesson page renders without a server error. **Gap:** no browser tool
  available in this session to visually confirm the client-side `run()`
  render - only the compile step and page-load-without-error were verified
  this way, not what actually paints in a real browser. Worth an eyeball pass
  next session before trusting this further.

**Next:** task 8 (author real 3.4 Load Balancer content via the chapter-author
skill) blocks both "migrate Load Balancer chapter to MDX" and the walkthrough
pilot - do that next, not more pipeline work.

---

## Scoping trail (how the Final Plan was reached - kept for context, not re-litigated)

### 2026-08-10 — Source and opening state of the world

Source bullets, verbatim:
```
## Alpha 5.0.0 — Content Update
-   Migrate Markdown → MDX
-   Enable interactive content
-   Prepare for embedded React components

## Alpha 5.1.0 — Diagram Topology Update
-   Improve chapter flow diagrams
-   Better rendering architecture
-   Cleaner diagram maintenance
```

**Lesson rendering, verified against code:** `src/canvas/docs-panel/markdown/MarkdownRenderer.tsx`
— plain `react-markdown` + `remark-gfm` + `rehype-raw` + `rehype-sanitize` +
`rehype-slug`, plus a first-party `remark-callouts` plugin for `Callout` blocks.
No MDX, no `.mdx` files, anywhere in the repo at scoping time.

**Diagrams, verified against code:** fenced ` ```mermaid ` blocks, intercepted in
`MarkdownRenderer.tsx`'s `pre` override and handed to `MermaidBlock.tsx`. Notable
mismatch against `CURRICULUM.md` §7.2/§20.3, which instructs authors to write
topology diagrams as ScaleCraft graph JSON (the Design Editor's own domain model)
— the curriculum spec's stated format and the actual shipped renderer (Mermaid)
were two different things. This mismatch is most of what 5.1.0 turned out to be
about.

### 2026-08-10 — First round of answers

1. **MDX payoff:** interactive step-wise walkthrough diagrams (e.g. "how a load
   balancer routes a request," "how Kafka partitions/replicates"), inspired by
   HelloInterview/AlgoMaster-style explainers - not static images. A perf claim
   ("browser HTML parsing disappears") was corrected in conversation: the real
   mechanism is `react-markdown` parsing Markdown to an AST at runtime in the
   browser on every render, vs. MDX compiling to real React/JS at build time -
   real win, different mechanism than stated.
   **Also surfaced:** a glossary/inline-reference system - recurring concepts
   (e.g. "forces of system design") authored once, referenced inline, opening a
   tooltip/modal on demand so learners don't have to jump back and forth across
   chapters. Distinct 5.0.0 deliverable, not the same component as walkthroughs.
2. **Diagram engine direction:** reuse the canvas wherever possible - Mermaid is
   out, static images are out, must be genuinely interactive and easy to author.
   Recommendation floated (and it stuck): generalize the existing Guided Tour
   step-engine (`TourController`/`TourOverlay`, Release 4) rather than build a
   second step-sequencing system - it already solves step index, spotlighting,
   prev/next, captions/pacing.
3. **Scope boundary confirmed:** Chapter Reader only at first mention, expanded
   2026-08-11 (see below) to also cover Quiz `diagram` questions - Design Editor
   / Sandbox canvas itself stays untouched either way.
4. **Bundling confirmed:** 5.0.0 (MDX + glossary) and 5.1.0 (diagrams) ship as
   one track, not two - diagrams likely being MDX-embedded React components
   means they weren't independent anyway.
5. **Versioning confirmed:** major bump, `5.0.0-alpha`.

### 2026-08-11 — Reference confirmed, scope corrected, renderer choice surfaced

**AlgoMaster.io reference checked directly** (`algomaster.io/learn/system-design/load-balancers`
via WebFetch - text-converted, so animation claims from search-result summaries
couldn't be independently verified, but structural evidence could): their load
balancer diagram is a **discrete step-indexed walkthrough with a step counter
("6 / 6")**, not continuous animation - Client -> Load Balancer -> Backend
Instance, steps = "Connect and send request" -> "Apply listener, TLS, routing,
policy" -> "Select healthy backend" -> "Forward request" -> "Response," each step
updating highlighted state. Direct match for the Tour-engine-reuse
recommendation above.

**Scope correction (user-flagged):** an earlier proposal draft over-referenced
"the sandbox" while discussing visual consistency, which read as if sandbox code
was in scope - it wasn't. Clarified: reusing `componentRegistry`'s existing
icon/color/label data (also used by the sandbox) is reading shared data, not
touching sandbox code. **User then confirmed the actual surfaces are Chapter
Reader *and* Quiz, not the sandbox** - this is what corrected and finalized
question 3/5 from the first round above.

**Renderer choice surfaced by checking existing code, not assumed:** the quiz
framework already has a `"diagram"` question kind (`QUIZ_FRAMEWORK.md` §4),
rendered by `src/chapters/quiz/DiagramQuestion.tsx` via
`src/chapters/ReadOnlyGraphSummary.tsx`. Read directly: `ReadOnlyGraphSummary` is
explicitly a **plain text list** ("Client → Load Balancer" rows with a category
dot and an edge-kind glyph), not spatial at all - its own doc comment states
React Flow was deliberately avoided there to dodge bundle weight for a read-only
aside, "there's no viewport to fit, it's a list, not a canvas." That's
structurally incompatible with what an AlgoMaster-style walkthrough needs
(real spatial layout, a specific node lighting up at step 3), which is why the
Final Plan above calls for a **new**, purpose-built lightweight spatial renderer
rather than reusing `ReadOnlyGraphSummary` as-is or reaching for full React Flow
- consistent with the codebase's existing precedent of avoiding React Flow
outside the actual editable canvas.

**Proposal made, adopted into the Final Plan above (data model, pilot,
glossary format/storage/UX, build order)** - see Final Plan for the resolved
version; not duplicated here.
