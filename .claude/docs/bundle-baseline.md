# Bundle baseline (Phase 0, release 3.2.0)

Captured 2026-08-03, before any Phase 1-4 changes, for comparison at Phase 5.
Regenerate with `npm run analyze` (writes an interactive report to
`.next/diagnostics/analyze/`, gitignored - not committed, rerun on demand) or
`npx next build` + inspect `.next/static/chunks/`.

Next.js 16.2.10, Turbopack (this project's default bundler - no `--webpack`
flag anywhere in scripts). `@next/bundle-analyzer` (webpack-only) and
`rollup-plugin-visualizer` (Rollup/Vite-only) don't apply here; the built-in
`next experimental-analyze` command is the Turbopack-native equivalent, no
extra dependency.

## Headline numbers

- Total client JS across all chunks: **19M** (`.next/static/chunks/*.js`,
  uncompressed, all routes combined - not a single page's load).
- Largest individual chunk: **764K** (`.next/static/chunks/29h0rq6de699t.js`,
  Turbopack-hashed name, un-attributed - use `npm run analyze`'s interactive
  UI to trace it to source when doing the real work in Phase 4).
- Ten largest chunks range 220K-764K; several near-duplicates in the
  260K-308K band suggest shared deps (likely `@xyflow/react`, `mermaid`,
  `shiki` - all present in `dependencies` and all canvas/markdown-adjacent)
  aren't deduped or split cleanly today.

## Heaviest routes (by `next experimental-analyze` per-route data size, a size proxy)

1. `/sandbox` - ~772K
2. `/building-blocks/[chapterSlug]` - ~776K
3. `/real-world-extraction/[chapterSlug]` - ~776K
4. `/building-blocks/[chapterSlug]/lesson` - ~700K
5. `/real-world-extraction/[chapterSlug]/lesson` - ~700K
6. `/dev/diagram-question-lab` - ~684K

The three heaviest routes are exactly the ones that mount the canvas
(`Canvas.tsx`, React Flow, the docs panel with Markdown/Mermaid rendering) -
consistent with Phase 4's UI-module-chunking targets (Diagram Renderer,
Markdown Reader) actually being the load-bearing win, not a guess.

## What to check at Phase 5

- Total client JS should drop meaningfully once Phase 1-2 (content out of
  the bundle, into `public/content/` + fetch) and Phase 3 (engines lazy
  loaded) land.
- `/sandbox`, `/building-blocks/[chapterSlug]`, `/real-world-extraction/[chapterSlug]`
  should show the biggest per-route drop after Phase 4's module chunking.
- Re-run `npm run analyze` and this same `du -h .next/static/chunks` check;
  diff against the numbers above.
