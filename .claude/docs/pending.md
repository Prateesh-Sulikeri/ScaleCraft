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

- Migrate `getLessonMarkdown`'s `fs.readFileSync` to a client-side `fetch()`
  against `public/content/chapters/`, matching the pattern `docsFile` already
  uses for components. Branch: `feature/markdown-fetch-migration`. Medium.
- Markdown cache: in-memory cache keyed by content path (+ version, see
  below), so repeat visits to the same chapter/component doc don't re-fetch.
  Branch: `feature/markdown-cache`. Small-medium.
- Version metadata per `.md`: a field in each manifest entry (not frontmatter
  parsing) marking content version, used to invalidate the cache above when
  authored content changes. Branch: `feature/content-versioning`. Small.
- `ContentService` as the one API surface - `getChapter(id)`, `getComponent(id)`,
  `search()` - wrapping manifest lookup + fetch + cache. Nothing in the UI
  calls `fetch()` on content paths directly after this lands. Branch:
  `feature/content-service`. Medium. Depends on manifests + cache above.
- Content types: same loader through `ContentService`, renderer chosen by
  content type (chapter/component/example/glossary all resolve through one
  path, `MarkdownRenderer` stays the shared renderer). Branch:
  `feature/content-type-renderers`. Medium.

## Phase 3. Engine package extraction

- Extract `src/validation-engine/` and `src/ai/run-deep-check.ts` (+
  `src/ai/providers/`) behind a single `src/engines/` boundary with an
  explicit public export surface - UI code imports only through that
  boundary, never engine internals directly. No workspace package (see
  decision above). Branch: `feature/engine-boundary`. Large - biggest
  refactor in this release, touches every call site in `DeepCheckPanel.tsx`
  and `QuestionPane.tsx`.
- Engine interface (`run()` / `validate()` / `analyze()`) that both engines
  implement, shaped generically enough for the future simulation engine to
  adopt without a rework. Branch: `feature/engine-interface`. Medium. Depends
  on the boundary above.
- Engine registry keyed off the interface. Branch: `feature/engine-registry`.
  Small-medium.
- Lazy-load each engine at its call site via `next/dynamic` / dynamic
  `import()`, through the registry. Branch: `feature/engine-lazy-load`.
  Small. Depends on the registry.

## Phase 4. UI code-splitting

- Route-based splitting audit across all 10 `page.tsx` entries under
  `src/app/` - identify which pages pull in heavy client subtrees that don't
  need to be in the initial route bundle, split via `next/dynamic`. Branch:
  `feature/route-based-splitting`. Medium.
- Split named large UI modules into their own chunks via `next/dynamic`:
  Inspector, Question UI, Simulation (currently minimal - just
  `trace.ts`, low priority), Deep Check (`DeepCheckPanel.tsx`, 512 lines,
  highest-value target), Markdown Reader, Diagram Renderer. Branch:
  `feature/ui-module-chunking`. Medium-large.

## Phase 5. Verify

- Re-run the Phase 0 bundle analysis, diff against the baseline, confirm the
  split points actually moved weight out of the initial bundle. Run the full
  CI pipeline (`typecheck && lint && test && build`) before pushing the
  release branch. No new branch - this happens on `release/v3.2.0-infra-clean-up`
  itself before it's handed off for review.
