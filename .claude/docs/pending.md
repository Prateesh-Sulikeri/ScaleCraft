# Release 3.2.0 - infra clean-up

Plan of action. Original ask plus findings from a codebase pass before starting
implementation. Each item below gets its own `type/*` branch off
`release/v3.2.0-infra-clean-up`. Phases are ordered by dependency, not by the
order items were originally listed - bundle analysis moved to Phase 0 (its own
stated purpose is "know what's large before optimizing," so it needs to run
before the optimization phases, then again at the end to verify).

## Codebase-pass findings (context for every phase below)

- Chapter lesson markdown already lives outside `public/`, at
  `src/content/chapters/lessons/*.md`, read server-side via
  `fs.readFileSync` in `src/content/chapters/lessons.ts` (`getLessonMarkdown`,
  keyed by `ChapterDefinition.id`). It never ships in the client bundle today,
  but it's not in the target `public/content/` structure and isn't fetch-based.
- Component docs are further along than the rest: `ComponentDefinition.docsFile`
  (`src/content/components/types.ts`) already points at `public/docs/*.md`,
  fetched client-side by `docs-panel/DocsTabContent.tsx`. This is the pattern
  to generalize, not a parallel thing to rebuild - `docs`
  (the inline fallback string) stays as-is.
- No content manifest exists yet for components - only chapters have one
  (`chapterRegistry` in `src/content/chapters/index.ts`, currently one
  placeholder entry).
- Zero use of `next/dynamic` anywhere in `src/`. No code-splitting beyond
  whatever Next's App Router does automatically per route. `next.config.ts` is
  minimal (just `devIndicators: false`) - no bundle analyzer wired in.
- Biggest single UI file today: `src/app/DeepCheckPanel.tsx` at 512 lines -
  top candidate for its own chunk.
- Engines are `src/validation-engine/` (engine.ts, pattern.ts, chapter-outcome.ts,
  rules/) and `src/ai/run-deep-check.ts` + `src/ai/providers/`. Both are already
  reasonably contained, but freely import from and get imported by UI code
  (`DeepCheckPanel.tsx`, `QuestionPane.tsx`) - no enforced boundary today.
- `.claude/docs/pending-simulation-engine.md` (brainstorm, not yet scoped or
  scheduled) describes a future third engine. It's out of scope for 3.2.0, but
  the Engine interface/registry in Phase 3 should be shaped so that engine can
  plug in later without a rework - don't design it Validation/Deep-Check-specific.

**Decision (confirmed with user 2026-08-03):** engine extraction is a clean
module boundary inside this repo (`src/engines/`), not a real npm workspace
package. No `package.json` of its own, no monorepo tooling - matches
CLAUDE.md's "no monorepo tooling yet" and there's no current plan to release
the engine independently. Revisit only if that changes (e.g. reuse from the
separate textbook project).

---

## Phase 0. Bundle analysis baseline

- Install `rollup-plugin-visualizer`, wire into the build so a stats report is
  reproducible on demand. Run it once now, before any other phase, and save
  the output for comparison at the end (Phase 4). Branch:
  `chore/bundle-analysis-baseline`. Small.

## Phase 1. Content extraction

- `public/content/` directory structure: `chapters/`, `components/`,
  `examples/`, `glossary/`, `images/`. Move `src/content/chapters/lessons/*.md`
  into `public/content/chapters/` and relocate `public/docs/*.md` (component
  docs) into `public/content/components/` - one convention instead of two.
  `examples/`, `glossary/`, `images/` are created empty, ready for content that
  doesn't exist yet. Branch: `feature/content-directory-extraction`. Medium -
  touches `getLessonMarkdown` call sites and `DocsTabContent.tsx`'s fetch path.
- On-demand content manifests: add a components manifest alongside the
  existing chapter one (`chapterRegistry`), same shape/spirit - metadata in
  code, bodies fetched on demand from `public/content/`. Everything the UI
  renders comes from a manifest, not an ad hoc path string. Branch:
  `feature/content-manifests`. Medium. Depends on the directory move above.

## Phase 2. Content access layer

**Status: done.** All four items below landed across three branches instead
of four - the plan's ordering turned out to not quite match how the work
actually decomposed once each branch got underway. Recorded here so a future
read of this doc understands why the branch list doesn't 1:1 match the item
list above it.

- Migrate `getLessonMarkdown`'s `fs.readFileSync` to a client-side `fetch()`
  against `public/content/chapters/`, matching the pattern `docsFile` already
  uses for components. Branch: `feature/markdown-fetch-migration`. Medium.
  **Done.** Landed as `useMarkdownFile` (`src/lib/use-markdown-file.ts`), a
  shared fetch+cache hook - `DocsTabContent` was refactored onto it too, so
  component docs and chapter lessons stop duplicating the fetch logic.
- Markdown cache: in-memory cache keyed by content path (+ version, see
  below), so repeat visits to the same chapter/component doc don't re-fetch.
  Branch: `feature/markdown-cache`. Small-medium.
  **Done, no separate branch.** The path-keyed cache is `useMarkdownFile`'s
  `markdownFileCache` Map, delivered as part of markdown-fetch-migration
  above (there was no cache left to add separately by the time that branch
  landed). The version half of this item waited for content-versioning,
  next.
- Version metadata per `.md`: a field in each manifest entry (not frontmatter
  parsing) marking content version, used to invalidate the cache above when
  authored content changes. Branch: `feature/content-versioning`. Small.
  **Done.** Added `ComponentDefinition.docsVersion` and
  `ChapterDefinition.lessonVersion`; `useMarkdownFile` now keys its cache on
  path+version and refetches on a version bump. This branch also absorbed
  the version-aware half of the markdown-cache item above.
- `ContentService` as the one API surface - `getChapter(id)`, `getComponent(id)`,
  `search()` - wrapping manifest lookup + fetch + cache. Nothing in the UI
  calls `fetch()` on content paths directly after this lands. Branch:
  `feature/content-service`. Medium. Depends on manifests + cache above.
  **Done.** `src/content/content-service.ts` - `getChapter`, `getComponent`,
  `useChapterLesson`, `useComponentDocs`, `search`. `DocsTabContent` and
  `ChapterReader` both go through it now. `search()` has no UI consumer yet
  (plain case-insensitive substring match over chapter/component metadata) -
  built ahead of a search feature, same as the empty `examples/`/`glossary/`
  dirs from Phase 1.
- Content types: same loader through `ContentService`, renderer chosen by
  content type (chapter/component/example/glossary all resolve through one
  path, `MarkdownRenderer` stays the shared renderer). Branch:
  `feature/content-type-renderers`. Medium.
  **Done, no separate branch, scope reduced.** Chapter and component content
  already resolve through one path (`content-service.ts`) and one renderer
  (`MarkdownRenderer`) as of the ContentService branch above - there was no
  remaining code change to make for those two types. `example` and
  `glossary` are explicitly **not** implemented: neither has ever had a type,
  a manifest, or a UI consumer, and nothing in `ARCHITECTURE.md` or
  `INITIAL_THOUGHTS.md` specifies what an "example" or "glossary entry"
  actually contains beyond the empty `public/content/examples/` and
  `public/content/glossary/` directories from Phase 1. Building a
  loader/renderer for either now would mean inventing a content model from
  nothing. **Trigger to revisit:** once there's an actual product decision on
  what examples/glossary content looks like (fields, whether they're single
  pages or a browsable index, etc.) - add that spec to `ARCHITECTURE.md`
  first, then this item can be reopened as a real branch.

## Phase 3. Engine package extraction

**Status: done.** All four items landed across two branches instead of
four - boundary, interface, and registry turned out to be inseparable in
practice (you can't land a clean `src/engines/` boundary without at least a
minimal interface and registry to enforce it through), so they were bundled.
Lazy-load stayed its own branch as planned, since it's a genuine, separately
reviewable follow-on. Also: before branching, `docs/phase-2-content-access-status`
(all of Phase 1/2) was merged into `release/v3.2.0-infra-clean-up` and pushed
(user-requested, confirmed 2026-08-03) so Phase 3 would branch from a release
branch that actually reflects completed prior work.

- Extract `src/validation-engine/` and `src/ai/run-deep-check.ts` (+
  `src/ai/providers/`) behind a single `src/engines/` boundary with an
  explicit public export surface - UI code imports only through that
  boundary, never engine internals directly. No workspace package (see
  decision above). Branch: `feature/engine-boundary`. Large - biggest
  refactor in this release, touches every call site in `DeepCheckPanel.tsx`
  and `QuestionPane.tsx`.
  **Done.** New `src/engines/` module (`types.ts`, `validation/`,
  `deep-check/`, `registry.ts`, `index.ts`). Reroutes 11 UI files
  (`AppHeader`, `sandbox/page`, `ValidationIndicator`, `ChapterWorkspace`,
  `chapter-outcome-violations`, `ChapterSidebar`, `QuestionPane`,
  `DeepCheckPanel`, `AiProfilesView`, `AiSettingsForm`, `DeepCheckButton`) to
  import from `@/engines`. Deliberate exceptions, left importing internals
  directly: `src/app/dev/blueprint-lab/BlueprintLabContent.tsx` (dev tool
  inspecting internals on purpose), `src/content/chapters/types.ts` (needs
  `GraphPattern` structurally for blueprint authoring, not "running" the
  engine), `src/ai/{prompt,settings,profiles,schema}.ts` (ai-domain support
  modules, not named in the extraction scope), and test files (fixture
  convenience). A new scoped `no-restricted-imports` ESLint rule enforces
  the boundary going forward.
- Engine interface (`run()` / `validate()` / `analyze()`) that both engines
  implement, shaped generically enough for the future simulation engine to
  adopt without a rework. Branch: `feature/engine-interface`. Medium. Depends
  on the boundary above.
  **Done, no separate branch.** `Engine<TInput, TConfig, TResult>` in
  `src/engines/types.ts` - one `run(input, config, signal?)` method both
  `validationEngine` and `deepCheckEngine` implement. Chapter- and settings-
  specific orchestration (`evaluateChapter`, `testConnection`) stays outside
  the interface as plain named exports - they're not generic across engines.
- Engine registry keyed off the interface. Branch: `feature/engine-registry`.
  Small-medium.
  **Done, no separate branch.** `src/engines/registry.ts`'s `getEngine(id)`,
  landed alongside the boundary above (eager at first, made lazy below).
- Lazy-load each engine at its call site via `next/dynamic` / dynamic
  `import()`, through the registry. Branch: `feature/engine-lazy-load`.
  Small. Depends on the registry.
  **Done.** `registry.ts`'s `getEngine()` now dynamically imports each
  engine module. Updated the 4 real invocation sites
  (`ChapterWorkspace`/`sandbox/page`'s validate buttons, `DeepCheckButton`'s
  run, `AiSettingsForm`'s test connection) - all already event-handler-
  triggered, so the added `await` is low-risk. `providers` (Settings/Help UI
  metadata) stays eager - the item is scoped to the `run()` call site, not
  provider metadata; splitting metadata from the 5 adapter implementations
  is a Phase 4 concern if bundle re-check shows it matters.

## Phase 4. UI code-splitting

**Status: done.** Both items landed as planned, one branch each.

- Route-based splitting audit across all 10 `page.tsx` entries under
  `src/app/` - identify which pages pull in heavy client subtrees that don't
  need to be in the initial route bundle, split via `next/dynamic`. Branch:
  `feature/route-based-splitting`. Medium.
  **Done.** Three conditionally-rendered subtrees qualified (default-closed
  or default-null, gated behind a user action): `DocsPanel` (sandbox and
  chapter-workspace routes - starts minimized, pulls in markdown rendering)
  and `ExamShell`/`ExamResults` (lesson routes, via `QuizLauncher` - most
  lesson visits never take the exam). All three now load via `next/dynamic`
  with `ssr: false`. `FocusModeBar` and Home's About/Release-notes modals
  were audited and left alone - too small to be worth the added chunk-load
  indirection. `LearningPath` and the two dev-only lab routes have no
  conditional subtree to split.
- Split named large UI modules into their own chunks via `next/dynamic`:
  Inspector, Question UI, Simulation (currently minimal - just
  `trace.ts`, low priority), Deep Check (`DeepCheckPanel.tsx`, 512 lines,
  highest-value target), Markdown Reader, Diagram Renderer. Branch:
  `feature/ui-module-chunking`. Medium-large.
  **Done.** `DeepCheckPanel` (dynamic + `ssr:false` at its
  `DeepCheckButton` call site - opens on demand, default closed).
  `QuestionPane` (dynamic, SSR kept, at its `ChapterSidebar` call site -
  always-visible content, so this is a chunk-splitting win rather than a
  deferred-load one; still pulls `Debrief`, `ReadOnlyGraphSummary`, and
  every quiz question renderer into their own chunk). `MarkdownRenderer`
  (dynamic, SSR kept, at its one remaining un-deferred call site,
  `ChapterReader`'s lesson body - pulls in react-markdown, the
  remark/rehype plugins, `CodeBlock`, and `MermaidBlock`). Audited and left
  alone: `EdgeInspector` (45 lines, no heavy deps), `trace.ts` (a pure
  function, not a UI module to split), and `MermaidBlock` ("Diagram
  Renderer" - already defers the actual `mermaid` package via its own
  dynamic `import()`, nothing left to do at the wrapper level).

## Phase 5. Verify

- Re-run the Phase 0 bundle analysis, diff against the baseline, confirm the
  split points actually moved weight out of the initial bundle. Run the full
  CI pipeline (`typecheck && lint && test && build`) before pushing the
  release branch. No new branch - this happens on `release/v3.2.0-infra-clean-up`
  itself before it's handed off for review.
