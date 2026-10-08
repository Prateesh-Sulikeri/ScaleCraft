# Pending Polish

Consolidated leftovers from `pending*.md` docs that were assessed as >90% complete
and retired. Each section keeps the source doc's own item wording so nothing gets
lost in translation; the source file is deleted once its items land here.
Code comments still cite retired docs by name - read them from git history at
the commit listed for each.

------------------------------------------------------------------------

## From `pending-6.1.0-poa.md` + `pending-cloud-sync.md` + `pending-persistence-audit.md` (Release 6.1.0 Neon cloud sync)

Retired 2026-08-23. All three deleted together: the sync code
(`reconcile.ts`, `sync-status.ts`, `ResetOnSignOut.tsx`, the eleven Part 1 slug
redirects in `next.config.ts`) is confirmed present on `main` and `develop`, so
the build log, its audit companion and the close-out list have all been overtaken
by merged code. The audit's S1-S11 findings were either fixed or converted into
the "Explicitly NOT in 6.1.0" tradeoffs recorded in `ARCHITECTURE.md`.

One item was never ticked and outlives the docs (the zones cross-device e2e case
was confirmed working by the user, 2026-10-01):

- **The four Part 1 chapters authored in Phase 10 still have no Opus proofread
  pass recorded** in `pending-chapters.md`. Content-authoring work for the
  `chapter-author` skill, deliberately deferred by the engineering branch.

------------------------------------------------------------------------

## From `pending-diagram-pipeline.md` (Release 5.1.0 diagram authoring pipeline)

Retired 2026-08-23. Phases 0-4 are merged (`src/chapters/walkthrough/layout.ts`,
`normalize.ts`, and `src/content/chapters/walkthrough-invariants.test.ts` are all
on `main`). The `walkthrough-diagram` skill is now the live entry point for
authoring a diagram; this doc's Phase 5 and open questions are all that survive it.

**Phase 5 - deferred, do NOT build without the trigger:**
- **P5.1 Topology presets** (named expansions like `preset: "client-lb-n-servers"`):
  only if, after ~10 real diagrams, node/edge declarations are still the dominant
  authoring cost. Auto-layout plus `focus` may make this unnecessary indirection.
  Decide from evidence.
- **P5.2 Canvas-to-walkthrough export**: only if a Tier 4 RWE diagram (WhatsApp,
  Uber; 12-14 nodes) produces a layered layout that manual `column`/`position`
  overrides cannot rescue. The canvas already emits positions via
  `toArchitectureGraph`, so the export is mechanical if ever needed.

**Open questions carried from scoping:**

| # | Question | Trigger |
|---|---|---|
| 1 | Do RWE debrief reference solutions get walkthroughs, or is `ReadOnlyGraphSummary` enough? Swings scope by ~60 diagrams. Content call, user decides. | Before first RWE project is authored |
| 2 | Does layered LR survive a 12-14 node flagship? | First Tier 4 diagram (feeds P5.2) |
| 3 | Do `custom`-kind nodes join auto-layout or stay hand-placed? Current spec: they join (neighbor-column rule); revisit on first real use. | First `custom` diagram |
| 4 | Side-by-side topology comparison in an RWE debrief, or do `algorithms` variants cover it? | Next RWE debrief |

**One decision worth not losing:** walkthrough definitions stay **inline in MDX**,
next to the prose. Typed TS modules referenced by id were rejected (breaks prose
co-location; the invariants harness covers the real failure modes). This is the one
decision worth revisiting if the harness proves too loose - and it gets more
expensive to reverse as diagrams accumulate.

------------------------------------------------------------------------

## Retired 2026-10-01 (shipped in 5.0.0 / 7.1.0 / 7.2.0)

All seven were deleted together. Their feature branches are merged and gone,
and the user confirmed the guided tour, multi-device sync, sandbox
checkpointing and the bug triage path all work in production. Read any of them
from git at the commit shown (`git show <commit>:.claude/docs/<file>`):

| Doc | Last commit | What it recorded |
|---|---|---|
| `pending.md` | `156ad83` | Release 5.0.0 content platform: MDX pipeline, walkthrough renderer, glossary |
| `pending-design-editor-exercise.md` | `b27c2dc` | 320x160 starter-graph retrofit, `exerciseGoal`/`successCriteria` (superseded by the revamp) |
| `pending-starter-decorators.md` | `b27c2dc` | `starterDecorators` schema, zone palette and geometry, Reset to Default |
| `pending-streak-counter.md` | `b27c2dc` | `db.activeDays` + Clerk `publicMetadata` streak log and its decisions |
| `pending-save-sync.md` | `b27c2dc` | 5-minute Postgres checkpoint, revisions/`graphHash`, best-only `exam_attempts` |
| `pending-report-a-bug.md` | `5c630d0` | Bug data model, image-storage seam, `CenteredModal` portal, Escape stack |
| `pending-design-editor-revamp.md` | `5c630d0` | Release 7.2.0: D1-D20, derived pitch/zone constants, edge routing, `ReferenceGraphCanvas` |

What survives them:

- **Prod migrations verified 2026-10-01.** `0007` was applied 2026-08-23
  (hash, NOT NULL `total_attempts`, re-keyed PK all confirmed). `0008` had
  never been applied to prod and was applied that day. Lesson: there is no
  migrate-on-deploy, so check prod's migrations log at every release.
- **Two invariant gates must stay on.** In `authoring-invariants.test.ts`, "no
  starter graph packs two nodes closer than the minimum gap" and "no 4+ node
  starter graph exceeds a 2.5:1 aspect ratio". If one fails, it is an authoring
  regression - never skip it.
- **Debrief reference diagrams need a pass.** Decided 2026-10-01: they adopt the
  live canvas's direction-only handle rule (50 of the 57 same-side routes are in
  these figures), and the user has spotted further edge-bounding issues and
  inconsistencies across them. Needs its own scoping with the specific chapters.
  Re-validate against `e2e/design-editor-geometry.spec.ts` afterwards.
- **Re-measure `fitViewOptions.maxZoom: 1`** on the smallest starter graphs; 1.2
  may be right. Do not change it speculatively.
- **Quiz `diagram`-question upgrade** - deferred indefinitely (user call, 5.0.0).

------------------------------------------------------------------------

## From `pending-content-fixes.md` (Groups F/G, Checkpoints G/Final follow-ups)

Retired 2026-10-07 with every item done: the browser checks (3.25 gantt, 3.23/3.26
walkthroughs, G and Final click-through, both judgment calls), the cold review,
the component docs, and all seven engine gaps (config-mismatch drift,
`ruleSeverity`, `absent` drift, relation `exceptions`, walkthrough fault states,
the new config fields, the named missing-input headline). Details live in
`pending-chapters.md` decisions 8, 11, 14, 17, 19, 20, 23 and 25. What is still
unconfirmed:

- **Drawing the new edges by hand in the Design Editor.** Verified by importing
  graphs and by unit tests, not by dragging: browser/CDN -> object storage,
  SQL/NoSQL -> coordinator (should default to `control`), API Gateway -> cache,
  load balancer -> app server (`control` via the Edge Inspector), browser -> DNS.
- **Config exercises for 3.10, 3.13 and 3.23.** The fields exist
  (`indexing`, `partitioning`/`shardKey`, `callTimeoutMs`/`retries`/
  `retryBackoff`/`idempotencyKeys`) but no rule or blueprint gates them yet.
  Adding them is chapter authoring, not engineering.

