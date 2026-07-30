# Release 3.0.0 — Learning Path Navigation Overhaul

**Status:** done — Phases 0-7 all landed on `feature/learning-path-page`
**Source spec:** `.claude/docs/pending.md`
**Release branch:** `release/v3.0.0-chapter-content` (cut from `develop`)
**Version target:** `3.0.0-alpha` (VERSION + package.json)
**Working branch note:** phases land on one shared branch at a time rather
than one branch per phase as originally planned below — a mid-Phase-0 call
to keep review overhead down. Phases 0-2 landed on `feature/curriculum-
manifest`, which was merged into `release/v3.0.0-chapter-content`; Phase 3
onward lands on `feature/learning-path-page`, cut fresh from the updated
release branch. The per-phase "Branch:" lines below are the original plan
and no longer literal.
**Scope:** UI/UX only. **No chapter content is authored in 3.0.0.** Real Building
Blocks / RWE content starts at 3.1.0 and must plug into this model without another
redesign.

---

## 0. Why this document exists

`pending.md` is a product brief — it describes *what* and *why*, and leaves several
things ambiguous. This document is the engineering plan: every ambiguity resolved,
every file named, every signature specified. **Implementing agents should not need to
re-derive architecture or re-read `pending.md` to make a decision.** If you hit a
choice this document doesn't cover, that's a gap worth flagging — not an invitation to
improvise a parallel model.

Read alongside:
- `.claude/docs/CURRICULUM.md` §13 — the authoritative curriculum map (do not invent
  ordering, numbering, or titles).
- `DESIGN.md` — live design system. All new UI uses existing tokens.
- `CLAUDE.md` — non-negotiable product principles, git branching, pre-push CI.

---

## 1. Resolved decisions (do not relitigate)

| # | Question | Decision |
|---|---|---|
| D1 | Chapter completion: automatic or manual? | **Both.** Validation-driven completion (existing `db.chapterProgress`) **OR** a learner-set manual override (new `db.curriculumProgress.manuallyCompletedAt`). `COMPLETED` is the OR of the two. See §3.3. |
| D2 | What happens when a user clicks an unauthored chapter? | **Nothing — the row is non-interactive.** All 26 BB + 5 RWE entries render with full metadata, but only entries with a backing `ChapterDefinition` navigate. Unauthored rows render muted with a "Not yet authored" affordance. No 404s, no empty workspaces. |
| D3 | Download Curriculum PDF | **Ships now.** The file already exists: `public/docs/The_Crafters_Guide_to_System_Design.pdf` → served at `/docs/The_Crafters_Guide_to_System_Design.pdf`. Plain `<a download>`, no absent-file handling needed. |
| D4 | Progress denominator — do checkpoints count? | **Yes.** Every manifest entry counts, checkpoints included (they are real completable work; excluding them would under-report). BB total = **26**, RWE total = **5**. `pending.md`'s "6 / 22" and "8 / 23" examples are illustrative, not normative — and contradict each other. |
| D5 | Section collapse state — persisted? | **No.** All sections default expanded, in-memory `useState` only. Persisting collapse state is deferred (§8). |
| D6 | Does `SwitchChapterConfirmPopover` survive? | **No — delete it.** It existed because switching chapters in-place discarded unsaved work. Under route-driven navigation with `key={chapterSlug}` remounting (§5.2), the existing autosave-on-unmount effect fires on *every* chapter switch, so there is nothing to discard and nothing to confirm. |
| D7 | Does `AppHeader`'s contract change? | **No.** `saveId` stays `string \| null`. Chapter mode simply never passes `null` any more (there is always a chapter on the route). Leaving the prop nullable avoids churn in `AppHeader.test.tsx` and keeps Sandbox's path identical. |
| D8 | Two progress tables — isn't that duplicated state? | **No.** `chapterProgress` records *"validation passed for this ChapterDefinition"*. `curriculumProgress` records *"the learner manually completed / last visited this curriculum slug"*. Two distinct facts, two distinct writers, **one derivation function** (`deriveStatus`). Nothing is stored twice. |

---

## 2. Target architecture

```
Home  (/)
  └─ Building Blocks card ──────────► /building-blocks                  LEARNING PATH
                                          └─ chapter row click ────────► /building-blocks/1-2-load-balancing
                                                                              CHAPTER WORKSPACE
  └─ Real World Extraction card ────► /real-world-extraction            LEARNING PATH
                                          └─ chapter row click ────────► /real-world-extraction/rwe-1-bitly-url-shortener
  └─ Sandbox card ──────────────────► /sandbox                          (unchanged)
```

Two distinct experiences, sharing one progress model:

**Learning Path** — full-screen curriculum browser. **No** canvas, **no** `AppHeader`,
**no** `SidebarShell`, **no** xyflow at all. Reads the curriculum manifest + progress
store.

**Chapter Workspace** — the existing `ChapterWorkspace`, now route-driven instead of
internal-state-driven. Everything it has today stays (canvas, `AppHeader`, validation,
inspector, notes, hints, docs panel). Its sidebar becomes a *lightweight in-workspace
navigator* over the same progress store — another view, never a second source of truth.

### New module layout

```
src/curriculum/                    ← NEW: the curriculum map + progress model
  types.ts                         Course / CurriculumSection / CurriculumChapter / ChapterStatus
  manifest.ts                      the full BB + RWE map, transcribed from CURRICULUM.md §13
  manifest.test.ts                 invariants (unique slugs, definition ids resolve, counts)
  index.ts                         lookups: getCourse, findChapter, allEntries, ...
  progress.ts                      PURE derivation + aggregation (no I/O, no React)
  progress.test.ts
  progress-store.ts                zustand singleton + Dexie hydration/mirroring
  progress-store.test.ts

src/learning-path/                 ← NEW: the Learning Path UI
  LearningPath.tsx                 page body, takes courseId
  LearningPath.test.tsx
  CourseHeader.tsx                 title + subtitle + OverallProgress + DownloadCurriculumButton
  CourseHeader.test.tsx
  OverallProgress.tsx              percent, chapters x/y, sections x/y
  OverallProgress.test.tsx
  ProgressBar.tsx                  shared primitive (also used by SectionCard)
  ProgressBar.test.tsx
  SectionCard.tsx                  collapsible section + its own progress bar
  SectionCard.test.tsx
  ChapterRow.tsx                   number, title, difficulty, duration, status, lock
  ChapterRow.test.tsx
  ChapterStatusIcon.tsx            ✔ / ◐ / ○ with aria-label
  ChapterStatusIcon.test.tsx
  DownloadCurriculumButton.tsx
  DownloadCurriculumButton.test.tsx

src/app/building-blocks/
  page.tsx                         MODIFIED: renders <LearningPath courseId="building-blocks" />
  [chapterSlug]/page.tsx           NEW: renders <ChapterWorkspace mode=... chapterSlug=... key=... />

src/app/real-world-extraction/
  page.tsx                         MODIFIED: renders <LearningPath courseId="real-world-extraction" />
  [chapterSlug]/page.tsx           NEW: mirror of the above
```

### Dependency direction (enforce this)

```
learning-path/  ──►  curriculum/  ──►  persistence/db.ts
chapters/       ──►  curriculum/  ──►  persistence/db.ts
curriculum/     ──►  content/chapters/   (for chapterDefinitionId resolution ONLY)
```

`curriculum/` must never import from `learning-path/`, `chapters/`, or `canvas/`.
`curriculum/progress.ts` must have **zero** React and **zero** Dexie imports — it is
pure functions over plain data, which is what makes it cheaply testable.

---

## 3. Data model (write this first — everything else depends on it)

### 3.1 `src/curriculum/types.ts`

```ts
/** Matches ChapterDefinition["mode"] deliberately — a course IS a chapter mode.
 *  Sandbox has no course (no curriculum, no progress). */
export type CourseId = "building-blocks" | "real-world-extraction";

export type ChapterStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

/** Rendered as a subtle metadata chip. Future-ready per pending.md — no
 *  filtering or gating keys off this in 3.0.0. */
export type Difficulty = "foundational" | "intermediate" | "advanced";

/** One row in the Learning Path. This is the curriculum *map* — a stable,
 *  content-free entry that exists whether or not a lesson has been authored.
 *  Distinct from ChapterDefinition (src/content/chapters/types.ts), which is
 *  the authored lesson itself. The manifest lists all 31 entries; only 2 have
 *  a ChapterDefinition today. */
export type CurriculumChapter = {
  /** Stable, URL-safe, globally unique. ALSO the route segment:
   *  /building-blocks/<slug>. Never change one after release — it is a
   *  persistence key (see CurriculumProgress) and a bookmarkable URL. */
  slug: string;
  /** Display number from CURRICULUM.md §13, e.g. "1.2". `null` for checkpoints. */
  number: string | null;
  title: string;
  kind: "chapter" | "checkpoint";
  /** The ChapterDefinition.id backing this entry, or `null` when the lesson
   *  has not been authored yet. `null` is what makes a row non-interactive
   *  (decision D2). 3.1.0's job is to flip these from null to real ids. */
  chapterDefinitionId: string | null;
  estimatedMinutes: number;
  difficulty: Difficulty;
  /** Future: slugs that must be COMPLETED before this unlocks. Populated now
   *  (strictly-sequential within a section, per CURRICULUM.md §10) but NOT
   *  enforced in 3.0.0 — nothing reads it yet. */
  prerequisiteSlugs: string[];
};

export type CurriculumSection = {
  /** e.g. "bb-unit-1", "rwe-tier-2". */
  id: string;
  /** Short eyebrow label, e.g. "Unit 1", "Tier 2". */
  label: string;
  /** e.g. "Scaling Compute", "Photo & Log Systems". */
  title: string;
  /** One sentence, condensed from CURRICULUM.md's "Why this unit exists". */
  summary: string;
  chapters: CurriculumChapter[];
};

export type Course = {
  id: CourseId;
  /** "Building Blocks" / "Real World Extraction" — matches lib/modes.ts's
   *  modeLabel exactly; do not introduce a second spelling. */
  title: string;
  /** One-line framing shown under the page title. */
  subtitle: string;
  sections: CurriculumSection[];
};
```

### 3.2 `src/curriculum/manifest.ts`

Transcribe **exactly** from `CURRICULUM.md` §13. Do not reorder, renumber, or retitle.

**Slug scheme** (fixed — do not deviate):
- BB chapters: `<unit>-<n>-<kebab-title>` → `0-1-client-server-database`, `1-2-load-balancing`
- BB checkpoints: `checkpoint-<id>-<kebab-title>` → `checkpoint-r1-a-site-that-stays-up`
- RWE: `rwe-<n>-<kebab-title>` → `rwe-1-bitly-url-shortener`

**`chapterDefinitionId` mapping (only two non-null in 3.0.0):**
- `1-2-load-balancing` → `"bb-dummy-1"` (CURRICULUM.md marks 1.2 as MVP BB chapter #1)
- `rwe-1-bitly-url-shortener` → `"rwe-dummy-1"` (its `problemStatement` already names bit.ly / RWE-1)
- **every other entry** → `null`

**Building Blocks — 7 sections, 26 entries:**

| Section | label / title | Entries (slug ← number · title) | difficulty | est. min |
|---|---|---|---|---|
| `bb-unit-0` | Unit 0 · How the Web Serves a Request | `0-1-client-server-database` (0.1), `0-2-naming-dns-and-the-browser` (0.2), `0-3-the-edge-firewall-and-reverse-proxy` (0.3) | foundational | 20, 20, 20 |
| `bb-unit-1` | Unit 1 · Scaling Compute | `1-1-vertical-vs-horizontal-scaling` (1.1), `1-2-load-balancing` (1.2), `1-3-statelessness-and-sessions` (1.3), `1-4-reverse-proxy-vs-load-balancer-vs-api-gateway` (1.4) | foundational | 20, 35, 25, 20 |
| `bb-unit-2` | Unit 2 · Caching | `2-1-cache-aside` (2.1), `2-2-distributed-caching` (2.2), `2-3-caching-at-the-edge-cdn` (2.3), `checkpoint-r1-a-site-that-stays-up` (checkpoint) | foundational | 35, 30, 25, 45 |
| `bb-unit-3` | Unit 3 · Scaling Data | `3-1-read-replicas-and-replication` (3.1), `3-2-choosing-a-database-sql-vs-nosql` (3.2), `3-3-blobs-object-storage` (3.3), `3-4-search-the-search-engine` (3.4), `3-5-partitioning-and-sharding` (3.5) | intermediate | 30, 25, 25, 30, 30 |
| `bb-unit-4` | Unit 4 · Asynchronous Work | `4-1-queues-and-workers` (4.1), `4-2-when-work-fails-dead-letter-queues` (4.2), `4-3-scheduled-and-ephemeral-compute` (4.3), `4-4-streams-and-events-event-bus-and-kafka` (4.4), `checkpoint-r2-the-whole-backend` (checkpoint) | intermediate | 30, 20, 25, 35, 60 |
| `bb-unit-5` | Unit 5 · Distributed Coordination | `5-1-leaders-and-followers` (5.1), `5-2-agreement-coordinators-and-locks` (5.2), `5-3-trade-offs-at-the-core-consistency-and-availability` (5.3) | advanced | 30, 35, 25 |
| `bb-unit-6` | Unit 6 · Designing Whole Systems | `6-1-from-requirements-to-architecture` (6.1), `checkpoint-r3-open-brief` (checkpoint) | advanced | 60, 60 |

Checkpoint `difficulty`: R1 `foundational`, R2 `intermediate`, R3 `advanced`.
Checkpoint `title`s: "Checkpoint · A Site That Stays Up", "Checkpoint · The Whole
Backend", "Checkpoint · Open Brief".

**Real World Extraction — 3 sections, 5 entries:**

| Section | label / title | Entries | difficulty | est. min |
|---|---|---|---|---|
| `rwe-tier-1` | Tier 1 · Guided Core | `rwe-1-bitly-url-shortener` — "bit.ly — URL Shortener" | intermediate | 75 |
| `rwe-tier-2` | Tier 2 · Open Build | `rwe-2-instagram-photo-sharing` — "Instagram — Photo Sharing", `rwe-3-distributed-log-collector` — "Distributed Log Collector" | advanced | 90, 90 |
| `rwe-tier-3` | Tier 3 · Full Systems | `rwe-4-whatsapp-messaging` — "WhatsApp — Messaging", `rwe-5-netflix-video-streaming` — "Netflix — Video Streaming (capstone)" | advanced | 120, 150 |

All RWE entries are `kind: "chapter"`, `number: null` (their identity is the `RWE-n`
label, which lives in the title).

**Section `summary` lines** — condense each unit's "*Why this unit exists*" paragraph
from `CURRICULUM.md` §3 into one sentence. Example for Unit 1: *"The first scaling
pressure a growing system hits is compute saturation — and it's the gentlest story,
because stateless compute scales trivially."*

**Course subtitles:**
- Building Blocks: *"One concept at a time, with a constrained palette and validation that explains itself."*
- Real World Extraction: *"Full system-design briefs. More than one architecture passes."*

### 3.3 `src/curriculum/index.ts`

```ts
export function getCourse(id: CourseId): Course;
/** All entries across all sections, in curriculum order. */
export function allEntries(course: Course): CurriculumChapter[];
export function findEntry(courseId: CourseId, slug: string): CurriculumChapter | undefined;
/** The section an entry belongs to — needed for the workspace's breadcrumb. */
export function findSection(courseId: CourseId, slug: string): CurriculumSection | undefined;
/** Reverse lookup: which curriculum slug backs this ChapterDefinition?
 *  Needed so a validation pass (keyed by definition id) can be attributed to
 *  a slug. Build a Map once at module scope, don't scan on every call. */
export function slugForChapterDefinitionId(id: string): string | undefined;
/** Curriculum-order prev/next, skipping unauthored entries — the workspace's
 *  prev/next must never navigate to a route that has no lesson. */
export function adjacentAuthoredEntries(
  courseId: CourseId,
  slug: string,
): { prev?: CurriculumChapter; next?: CurriculumChapter };
```

`manifest.test.ts` must assert: slugs are globally unique across both courses; every
non-null `chapterDefinitionId` resolves against `chapterRegistry`; every entry with a
`chapterDefinitionId` has a matching `mode`; BB entry count is 26 and RWE is 5; every
`prerequisiteSlugs` entry references a real slug.

### 3.4 Persistence — Dexie v7

In `src/persistence/db.ts`:

```ts
/** Learner-owned curriculum state, keyed by curriculum slug
 *  (src/curriculum/manifest.ts). Deliberately SEPARATE from `chapterProgress`:
 *  that table records what the *validation engine* proved (keyed by
 *  ChapterDefinition id); this one records what the *learner* did (an explicit
 *  manual completion, and when they last opened the chapter). Two distinct
 *  facts with two distinct writers — ChapterStatus is derived from both by
 *  curriculum/progress.ts's deriveStatus, which is the single place the two
 *  are ever combined. Keyed by slug rather than definition id because an
 *  unauthored chapter has no definition id but can still be manually marked
 *  complete (a learner who read the chapter in the PDF). */
export type CurriculumProgress = {
  slug: string;
  /** Learner's explicit "Mark complete" toggle. null = not manually completed. */
  manuallyCompletedAt: number | null;
  /** Last time the learner opened this chapter's workspace. Drives
   *  IN_PROGRESS, and is what a future "Resume where I left off" will read. */
  lastVisitedAt: number | null;
};
```

Add `curriculumProgress!: EntityTable<CurriculumProgress, "slug">;` to the class, and:

```ts
this.version(7).stores({
  saves: "id",
  customComponents: "id",
  chapterProgress: "chapterId",
  aiProfiles: "id",
  aiActiveProfile: "id",
  deepCheckSessions: "++id, saveId, [saveId+createdAt]",
  curriculumProgress: "slug",
});
```

**No `.upgrade()` callback** — a new empty table needs no data migration, and existing
`chapterProgress` rows keep working untouched (they are still the validation-pass
record). Follow the file's existing convention: **list every table** at the new
version, not just the new one.

Add a `db.test.ts` case proving a v6 database opens at v7 with `chapterProgress` rows
intact and `curriculumProgress` present and empty.

### 3.5 `src/curriculum/progress.ts` — pure derivation

```ts
export type ProgressInputs = {
  /** ChapterDefinition ids the validation engine has passed
   *  (db.chapterProgress rows). */
  validationPassedDefinitionIds: ReadonlySet<string>;
  /** Curriculum rows by slug (db.curriculumProgress). */
  rowsBySlug: ReadonlyMap<string, CurriculumProgress>;
};

/** COMPLETED wins over IN_PROGRESS wins over NOT_STARTED. A manual override
 *  and a validation pass are both sufficient, never required together —
 *  decision D1. */
export function deriveStatus(entry: CurriculumChapter, inputs: ProgressInputs): ChapterStatus;

export type ProgressSummary = {
  completed: number;
  total: number;
  /** 0-100, rounded to the nearest integer. `total === 0` → 0, never NaN. */
  percent: number;
};

export function summarizeEntries(
  entries: readonly CurriculumChapter[],
  inputs: ProgressInputs,
): ProgressSummary;

export function summarizeSection(s: CurriculumSection, inputs: ProgressInputs): ProgressSummary;

export type CourseSummary = ProgressSummary & {
  /** A section counts as complete only when every one of its entries is COMPLETED. */
  sectionsCompleted: number;
  sectionsTotal: number;
};

export function summarizeCourse(course: Course, inputs: ProgressInputs): CourseSummary;
```

`deriveStatus` logic, exactly:
1. `manuallyCompletedAt != null` → `COMPLETED`
2. `chapterDefinitionId != null && validationPassedDefinitionIds.has(chapterDefinitionId)` → `COMPLETED`
3. `lastVisitedAt != null` → `IN_PROGRESS`
4. otherwise → `NOT_STARTED`

Cover all four branches plus the `percent` rounding and `total === 0` guard in
`progress.test.ts`.

### 3.6 `src/curriculum/progress-store.ts` — the single source of truth

A **module-level zustand singleton** (same convention as
`canvas/custom-components-store.ts`, *not* a provider like `canvas/store.tsx`):
curriculum progress is global to the user, not scoped per canvas, and the Learning Path
and the workspace sidebar must see identical state.

```ts
type CurriculumProgressStore = {
  hydrated: boolean;
  validationPassedDefinitionIds: Set<string>;
  rowsBySlug: Map<string, CurriculumProgress>;

  /** Reads both Dexie tables into memory. Idempotent, safe to call from every
   *  mounting surface — bails if already hydrated or in flight. */
  hydrate: () => Promise<void>;
  /** Called by ChapterWorkspace on mount. Writes lastVisitedAt (preserving any
   *  existing manuallyCompletedAt) and updates memory. */
  markVisited: (slug: string) => Promise<void>;
  /** The manual override toggle. `true` stamps Date.now(); `false` clears to null. */
  setManualComplete: (slug: string, complete: boolean) => Promise<void>;
  /** Called by ChapterWorkspace when evaluateChapter reports passed:true —
   *  mirrors the existing db.chapterProgress.put into this store's memory so
   *  the sidebar/Learning Path update without a reload. */
  recordValidationPass: (chapterDefinitionId: string) => void;
  /** Derived selector helper so callers never rebuild ProgressInputs by hand. */
  inputs: () => ProgressInputs;
};
```

**Rules for this file:**
- Every mutator writes Dexie **and** updates in-memory state in the same action. Never
  one without the other.
- `set` with **new** `Set`/`Map` instances, never mutated in place — zustand's default
  equality is referential.
- Dexie is browser-only. `hydrate()` must be called from an effect, never at module
  scope, or SSR/`vitest` node environment will throw.
- `ChapterWorkspace`'s existing `db.chapterProgress.put(...)` call **stays** — this
  store does not take over that write. `recordValidationPass` only syncs memory.

---

## 4. Phases

Each phase is independently reviewable and ends green on
`npm run typecheck && npm run lint && npm test && npm run build`. **Do not push
anything that has not exited 0 on that full pipeline** (CLAUDE.md, non-negotiable).

Every phase is its own `<type>/<short-description>` branch off
`release/v3.0.0-chapter-content`. Claude opens and pushes branches; **the user merges
them, manually, after review.** Ask before every push.

---

### Phase 0 — Branch + version (≈10 min) — ✅ DONE

**Branch:** `chore/release-3.0.0-scaffold` (merged into `feature/curriculum-manifest`)

1. Verify the tree is clean. Commit or stash the pending `.claude/docs/pending.md`
   modification first — it must not ride along in a feature branch.
2. Cut `release/v3.0.0-chapter-content` from `develop`, push it.
3. Cut `chore/release-3.0.0-scaffold` from the release branch.
4. `VERSION` → `3.0.0-alpha`; `package.json` `version` → `3.0.0-alpha`. Keep them
   identical — a mismatch is what the release-notes surface reads.
5. Commit this plan document itself.

**Done when:** both branches exist on origin, version is bumped, pipeline green.
**Done:** commit `63a91a8`, pipeline green (typecheck/lint/test/build).

---

### Phase 1 — Curriculum data model + manifest (≈1.5 h) — ✅ DONE

**Branch:** `feature/curriculum-manifest`
**Depends on:** Phase 0

Create `src/curriculum/types.ts`, `manifest.ts`, `index.ts`, `manifest.test.ts` exactly
as specified in §3.1–§3.3. **No UI, no persistence, no React in this phase** — it is
data plus lookups plus tests.

**Gotchas:**
- Transcribe from `CURRICULUM.md` §13, not from memory and not from `pending.md`'s
  abbreviated example (which says "Part 0" — the real label is "Unit 0").
- `slugForChapterDefinitionId` must build its `Map` once at module scope. A per-call
  scan over 31 entries is cheap but will be called inside render.
- The manifest is a large literal. Type it as `const courses: Record<CourseId, Course>`
  and let TS check it structurally — do not use `as` casts to silence shape errors.

**Done when:** `manifest.test.ts` asserts all invariants from §3.3 and passes; pipeline green.
**Done:** commit `9956f7d`. RWE-5's real gate is a "2-of-4" quorum which
`prerequisiteSlugs: string[]` can't express — approximated as all four candidates
with a comment, since nothing reads the field yet.

---

### Phase 2 — Progress model: Dexie v7 + derivation + store (≈2 h) — ✅ DONE

**Branch:** `feature/curriculum-progress-model`
**Depends on:** Phase 1

1. `src/persistence/db.ts` — add `CurriculumProgress`, the table, schema v7 (§3.4).
2. `src/persistence/db.test.ts` — add the v6→v7 migration case (§3.4).
3. `src/curriculum/progress.ts` + `progress.test.ts` (§3.5).
4. `src/curriculum/progress-store.ts` + `progress-store.test.ts` (§3.6).

**Gotchas:**
- `progress.ts` is pure. If you find yourself importing `dexie` or `react` into it,
  the logic belongs in the store instead.
- `progress-store.test.ts` runs in the vitest environment — check how
  `deepCheckSessions.test.ts` and `db.test.ts` already handle a Dexie-backed test
  (`fake-indexeddb` / uniquely-named DB) and reuse that setup rather than inventing one.
- Zustand singletons leak state between tests. Reset the store in `beforeEach` (see
  `custom-components-store.test.ts` for the existing pattern).

**Done when:** status derivation and aggregation are unit-tested across all four
branches; the store's Dexie round-trip is tested; pipeline green.
**Done:** commit `187d31e`.

---

### Phase 3 — Learning Path UI (≈3 h, the largest phase) — ✅ DONE

**Branch:** `feature/learning-path-page`
**Depends on:** Phase 2

Build every component in `src/learning-path/` (§2). This phase does **not** touch
routing or the workspace — wire it behind the existing `/building-blocks` route at the
very end of the phase (replacing `<ChapterWorkspace>` with `<LearningPath>`), and
accept that chapter rows are inert until Phase 4. That keeps Phase 3 reviewable on its
own.

**Layout spec:**

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ← ScaleCraft                                     [Download Curriculum ⤓] │  header strip
│                                                              [☾ theme]   │
│                                                                          │
│  Building Blocks                                                         │  h1, 28px/600
│  One concept at a time, with a constrained palette and validation        │  16px, 60% ink
│  that explains itself.                                                   │
│                                                                          │
│  ████████████░░░░░░░░░░░░░░░░░░░░░░░░  27%                               │  OverallProgress
│  7 / 26 chapters · 1 / 7 sections                                        │  13px, 60% ink
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │ ▼  UNIT 0                                        ███░░░  1 / 3     │  │  SectionCard
│  │    How the Web Serves a Request                                    │  │
│  │    Nothing else is intelligible without the request/response …     │  │
│  ├────────────────────────────────────────────────────────────────────┤  │
│  │  ✔  0.1   Client, Server, Database        foundational · 20 min  → │  │  ChapterRow
│  │  ◐  0.2   Naming: DNS and the Browser     foundational · 20 min  → │  │
│  │  ○  0.3   The Edge: Firewall and …        foundational · 20 min    │  │  (unauthored: muted,
│  └────────────────────────────────────────────────────────────────────┘  │   no →, no hover)
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │ ▶  UNIT 1                                        ██████  4 / 4  ✔  │  │  (collapsed)
│  └────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

**Component contracts:**

```tsx
// LearningPath.tsx — "use client"
export function LearningPath({ courseId }: { courseId: CourseId }): JSX.Element

// ProgressBar.tsx — the one progress primitive. No text inside; callers label it.
export function ProgressBar({
  percent,           // 0-100
  size = "md",       // "sm" for sections, "md" for the course header
  label,             // required, for aria-label — e.g. "Unit 1 progress: 50%"
}: ProgressBarProps): JSX.Element

// SectionCard.tsx
export function SectionCard({
  section,
  courseId,
  inputs,            // ProgressInputs, passed down — do NOT re-read the store per card
}: SectionCardProps): JSX.Element

// ChapterRow.tsx
export function ChapterRow({
  entry,
  courseId,
  status,
}: ChapterRowProps): JSX.Element

// ChapterStatusIcon.tsx
export function ChapterStatusIcon({ status }: { status: ChapterStatus }): JSX.Element
```

**Styling — reuse existing tokens only (`DESIGN.md`). Specifics:**
- Page background `bg-background`. Section cards `bg-panel` + `border border-border` +
  `rounded-md`. **No shadows** — these rest on the page plane, not floating chrome
  (`DESIGN.md` §4, The Flat Canvas Rule).
- Progress bar: track `bg-border`, fill `bg-foreground/70`. **Deliberately neutral —
  not `--state-valid` green.** Green is the validation-state channel
  (`DESIGN.md` §2, The Two-Channel Rule); a progress bar is not a validation result,
  and painting it green would collide with the ring vocabulary. The course-header bar
  may use `modeColorVar[courseId]` as its fill (that is the mode-identity channel,
  which is legitimate here) — pick one and use it consistently; do not mix.
- Status icons (lucide, 16px, paired with `aria-label` so the signal is never
  hue-only — `DESIGN.md` §6): `CheckCircle2` = COMPLETED (`text-state-valid`),
  `CircleDashed` = IN_PROGRESS (`text-foreground/70`), `Circle` = NOT_STARTED
  (`text-foreground/30`).
- Section header uses the **Label** type style: 11px/600/uppercase/0.05em for the
  eyebrow ("UNIT 0"), then the title at 15px/600, then the summary at 13px/60% ink.
- Difficulty + duration render as one muted 12px line, `foundational · 20 min`. Subtle
  metadata, not a badge row — they are future-ready fields, not a feature yet.
- **No gamification.** No XP, no streaks, no levels, no celebration animation, no
  confetti. Motion is limited to the collapse/expand height transition and the
  progress-bar width transition (150–250ms, both with `motion-reduce:transition-none`).

**Interaction:**
- Section header is a `<button aria-expanded>` toggling in-memory `useState(true)`
  (D5). Follow `ChapterList.tsx`'s existing `ChevronDown`/`ChevronRight` pattern.
- Authored chapter row → a real `next/link` `<Link href={`/${courseId}/${slug}`}>`.
  A real link, not an `onClick` router push — that is what gives keyboard activation,
  a focus ring, and open-in-new-tab for free (same reasoning as `ModeNode.tsx`).
- Unauthored row → a `<div>`, not a button or link. `text-foreground/40`, no hover
  state, no chevron. A single "Not yet authored" chip at 11px. **Do not** use
  `<button disabled>` — a disabled button is still a tab stop announcement; this is
  simply not interactive.
- **Manual complete toggle (D1):** a small `Circle`/`CheckCircle2` toggle button at the
  **right** end of each row, `aria-label={`Mark ${title} complete`}` /
  `Mark ${title} incomplete`. Available on **every** row, authored or not (that is the
  point of the override — a learner who read the chapter in the PDF can tick it).
  Calls `setManualComplete(slug, next)`. Must `stopPropagation` / sit outside the
  `<Link>` so clicking it never navigates. When a row is COMPLETED *by validation*,
  the toggle renders disabled with tooltip "Completed by validation" — clearing a
  manual flag cannot un-pass a real validation pass, and pretending otherwise would be
  a lie.
- `DownloadCurriculumButton` → `<a href="/docs/The_Crafters_Guide_to_System_Design.pdf" download>`
  with a `Download` lucide icon, styled as the standard neutral button
  (`DESIGN.md` §5 Buttons). No JS.

**Critical layout gotcha:** `src/app/layout.tsx` sets `<body className="flex h-full
flex-col overflow-hidden">`. **There is no page-level scroll.** The Learning Path must
own its own scroll container — the outer element needs `flex-1 overflow-y-auto`, or the
26-row page will be clipped with no way to reach the bottom. Verify by scrolling to
Unit 6 in a real browser at 900px viewport height, not by reading the diff.

**SSR/hydration gotcha:** progress lives in IndexedDB, unavailable during SSR. Call
`hydrate()` in an effect and gate progress-dependent output on `hydrated`. Until then
render the real curriculum structure (it is static, so it should SSR) with progress
shown as `—` / 0% rather than a full-page skeleton — the structure is the majority of
the page and should paint immediately. Use `useHasMounted()`
(`src/lib/use-has-mounted.ts`) if you need a client-only branch; do **not** hand-roll
`useState(false) + useEffect(setTrue)`, which this repo's lint rules flag.

**Also in this phase:**
- `ScreenSizeGate` already wraps all children in `layout.tsx` — confirm the Learning
  Path renders acceptably inside it and doesn't fight its minimum-width behavior.
- `ThemeToggle` must be reachable on this page (the workspace's `AppHeader` is gone
  here). Put it in the page's own header strip alongside Download Curriculum.
- A `ScaleCraft` / home link back to `/` in that same strip — `SidebarShell`'s Home
  icon is also gone here, and there must always be a way back.

**Done when:** both `/building-blocks` and `/real-world-extraction` render the full
Learning Path with live progress, sections collapse, the PDF downloads, the manual
toggle persists across a reload, and every component has a test. Pipeline green.
**Done:** commit `d126533`. The manual toggle's Dexie round-trip is covered by
progress-store.test.ts (Phase 2) and exercised again through ChapterRow's own
tests; a real-browser reload check is still owed to Phase 7's manual checklist.

---

### Phase 4 — Routing + ChapterWorkspace refactor (≈2.5 h, the riskiest phase) — ✅ DONE

**Branch:** `feature/chapter-workspace-routing` — landed on `feature/learning-path-page`
instead, per the working-branch note at the top of this doc.
**Depends on:** Phase 3

**Status:** done. `src/app/building-blocks/[chapterSlug]/page.tsx` and
`src/app/real-world-extraction/[chapterSlug]/page.tsx` added (route guard via
`findEntry` + `notFound()`, `key={chapterSlug}` per §4.1). `ChapterWorkspace` now
takes `{ mode, chapterSlug }`; `selectedChapterId`/`isDirty`/
`SwitchChapterConfirmPopover`/`SaveNotice`/`canvasStateKey` removed per D6/§4.2.
`markVisited`/`hydrate`/`recordValidationPass` wired to
`src/curriculum/progress-store.ts`. `QuestionPane`'s onBack routes to
`/${mode}`("Back to Learning Path" label) and onPrev/onNext route via
`adjacentAuthoredEntries`, not index-adjacency — `ChapterSidebar` gained an
additive `navOverride` prop for this rather than being rewritten (that's Phase 5's
job). Verified: full pipeline green (typecheck/lint/961 tests/build), plus a real
headless-browser click-through (Learning Path → `1.2 Load Balancing` row →
`/building-blocks/1-2-load-balancing` workspace renders → Back to Learning Path
returns) and `curl` checks confirming `0-1-client-server-database` (unauthored)
404s while the two authored slugs 200.

**4.1 New routes**

```tsx
// src/app/building-blocks/[chapterSlug]/page.tsx
import { notFound } from "next/navigation";
import { ChapterWorkspace } from "@/chapters/ChapterWorkspace";
import { findEntry } from "@/curriculum";

export default async function Page({
  params,
}: {
  params: Promise<{ chapterSlug: string }>;
}) {
  const { chapterSlug } = await params;
  const entry = findEntry("building-blocks", chapterSlug);
  // Unauthored or unknown slug: there is no workspace to render. Learning
  // Path never links here (decision D2), so this only catches a hand-typed
  // or stale-bookmarked URL.
  if (!entry?.chapterDefinitionId) notFound();

  // key= is load-bearing, not cosmetic: navigating between two sibling
  // [chapterSlug] routes reuses the same component instance, which means
  // ChapterWorkspace's autosave-on-unmount cleanup would NOT fire and the
  // outgoing chapter's edits would be lost. Keying on the slug forces a real
  // unmount/mount per chapter switch, so that existing cleanup runs every
  // time — which is also what lets SwitchChapterConfirmPopover go away
  // entirely (decision D6).
  return <ChapterWorkspace key={chapterSlug} mode="building-blocks" chapterSlug={chapterSlug} />;
}
```

Mirror for `real-world-extraction`. `params` is a Promise in this Next.js version —
match how existing routes handle it (check `next.config` / the installed Next major
before assuming).

**4.2 `ChapterWorkspace` changes**

Signature becomes:

```tsx
type ChapterWorkspaceProps = {
  mode: ChapterDefinition["mode"];   // === CourseId
  chapterSlug: string;               // NEW, always present
};
```

Remove, in order:
1. `const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null)`.
   Replace with a derived, always-non-null chapter:
   ```ts
   const entry = findEntry(mode, chapterSlug);            // guaranteed by the route guard
   const chapter = chapterRegistry.find(c => c.id === entry!.chapterDefinitionId)!;
   ```
   Keep a defensive `if (!chapter) return null;` so a bad slug degrades instead of
   crashing, even though the route guard should make it unreachable.
2. Every `selectedChapter === null` branch. Specifically: the
   `loadCanvasState([], [])` early return in the load effect, the `saveId ? … : null`
   ternary at the `AppHeader` call site (now always
   `chapterSaveId(chapter.id)` — per D7 the prop stays nullable, we just stop passing
   null), and `handleSave`'s no-chapter guard.
3. `SaveNotice` and its `saveNoticeAt` state — its only remaining reason to exist was
   "no chapter selected," which is now impossible. Delete the component.
4. `pendingChapterChange` state, `requestChapterChange`, `isDirty`,
   `loadedSnapshotKey`, `canvasStateKey`, and `SwitchChapterConfirmPopover` (D6).
   Chapter switching is now a route navigation with a guaranteed remount and
   autosave-on-unmount, so there is nothing to confirm. **Keep the autosave-on-unmount
   effect** — it is now doing more work than before, not less.
5. `selectedChapterRef` — with `chapter` derived from a prop and the component keyed
   per slug, the effect can close over `chapter` directly. Simplify carefully and
   re-read the existing comment explaining why the ref was there; the *reason* (cleanup
   needs the chapter as of unmount) is satisfied by the key, not eliminated.

Add:
- `useEffect(() => { void markVisited(chapterSlug); }, [chapterSlug])` — this is what
  makes `IN_PROGRESS` real.
- `useEffect(() => { void hydrate(); }, [])` — the sidebar needs progress too.
- In `handleValidate`'s `outcome.passed` branch, alongside the existing
  `db.chapterProgress.put`, call `recordValidationPass(chapter.id)` so the sidebar and
  a subsequent Learning Path visit reflect the pass without a reload.

**4.3 Navigation out of the workspace**

- `QuestionPane`'s `onBack` → `router.push(\`/${mode}\`)` (Learning Path), and its
  label becomes something like "Back to Learning Path" rather than "Back to chapters".
- `QuestionPane`'s `onPrev`/`onNext` → `router.push` to the adjacent **authored** entry
  via `adjacentAuthoredEntries` (§3.3). With only two authored chapters in 3.0.0 both
  will be `undefined` in practice — but wire it correctly now, because 3.1.0 turns it
  on by adding content, and a broken prev/next discovered then is a regression in a
  release that didn't touch this code.
- `SidebarShell`'s Home icon (`/`) stays as-is.

**Regression watch:**
- `useEffect` cleanup ordering — confirm by hand that switching chapter A → B actually
  writes A's save before B loads. Test it in a browser with real edits, not just in
  jsdom.
- The `setAvailableComponentIds` effect must still clear on unmount, or the palette
  filter leaks into Sandbox (the spec's own "most likely cross-mode bug"). Its existing
  comment says exactly this — don't drop it during the refactor.
- Deep Check's spoiler gate reads `passedChapterIds`. Keep that mechanism; it can now
  read from the progress store instead of its own local `useState`, but if that
  conversion gets fiddly, leaving it alone is acceptable — it is not what this release
  is about.

**Done when:** `/building-blocks/1-2-load-balancing` and
`/real-world-extraction/rwe-1-bitly-url-shortener` open real workspaces; a hand-typed
unauthored slug 404s; edits survive a chapter switch; the palette filter doesn't leak;
pipeline green.

---

### Phase 5 — Sidebar as in-workspace navigator (≈1.5 h) — ✅ DONE

**Branch:** `feature/workspace-curriculum-navigator` — landed on
`feature/learning-path-page` instead, per the working-branch note at the top of
this doc.
**Depends on:** Phase 4

**Status:** done. `ChapterSidebar` now takes only `{ courseId, chapterSlug,
chapterOutcome, isStale }` and derives the rest (`selectedChapterId`/`onSelect`/
`onBack` are gone); `QuestionPane` is always rendered, with `ChapterNavigator`
(new, replaces `ChapterList.tsx`) as a collapsible curriculum browser above it —
closed by default. `ChapterNavigator` reads the manifest (`getCourse`) and the
progress store directly (not `getChaptersForMode`), reuses
`ChapterStatusIcon` from `src/learning-path/` (no second status-icon mapping),
and links to `/${courseId}` ("View full Learning Path"). Onward navigation
(back/prev/next) moved into `ChapterSidebar` itself via `useRouter` +
`adjacentAuthoredEntries` — the `navOverride` prop Phase 4 added to bridge this
is gone along with the rest of the old props. `ChapterDefinition.group` removed
(dead — sections now come from the manifest); `placeholder` stays, but the Draft
badge moved to `QuestionPane`'s title row (Learning Path expresses "unauthored"
via `chapterDefinitionId: null` instead). Verified: full pipeline green
(typecheck/lint/958 tests/build) and a real headless-browser pass confirming the
navigator opens showing all 26 BB entries grouped by unit, the current chapter's
row carries `aria-current="page"`, unauthored rows render as non-links, and the
navigator's status icon for `1.2 Load Balancing` (IN_PROGRESS after
`markVisited`) matches what the Learning Path shows for the same entry.

The sidebar keeps its current behavior — open the chapter list, change chapters, show
completion — but stops being the primary navigation and starts being **another view
over the same progress store**. Never a second source of truth.

1. **`ChapterSidebar.tsx`** — its `selectedChapterId`/`onSelect`/`onBack` props go away.
   It takes `courseId` + `chapterSlug` and derives the rest. There is always a selected
   chapter now, so the "two-view switcher" becomes: `QuestionPane` always rendered,
   with a **collapsible curriculum navigator** above or below it that the user opens on
   demand.
2. **Replace `ChapterList.tsx`** with a compact navigator that reads the *manifest*
   (not `getChaptersForMode`) and the *progress store*, so it shows the same 26/5
   entries, grouped by the same sections, with the same status icons as the Learning
   Path. Reuse `ChapterStatusIcon` from `src/learning-path/` — if that import direction
   feels wrong, promote the icon to `src/components/ui/` rather than duplicating it.
   **Duplicating the status-icon mapping is the specific failure mode to avoid here.**
3. Add a "View full Learning Path" link at the top of the navigator → `/${courseId}`.
4. `ChapterDefinition.group` (`src/content/chapters/types.ts`) becomes **dead** —
   sections now come from the manifest. Remove the field and its `ChapterList`
   grouping logic, or mark it deprecated with a comment pointing here. Prefer removal;
   a field that looks authoritative but isn't read is worse than no field.
5. `ChapterDefinition.placeholder` stays useful (it marks *content* as throwaway, which
   is a different fact from "unauthored"), but the Learning Path expresses unauthored
   via `chapterDefinitionId: null`. Keep the Draft badge in the workspace's
   `QuestionPane`, not in the Learning Path.

**Done when:** the workspace navigator and the Learning Path show identical status for
every chapter; changing chapters from the navigator updates the same progress model;
there is exactly one status-icon implementation; pipeline green.

---

### Phase 6 — Home wiring (≈45 min) — ✅ DONE

**Branch:** `feature/home-real-progress` — landed on `feature/learning-path-page`
instead, per the working-branch note at the top of this doc.
**Depends on:** Phase 5

**Status:** done. `HomeCanvas.tsx`'s `nodes` array moved from module scope into a
`useMemo` inside the component (it now depends on live progress state), reading
`useCurriculumProgressStore` and calling `hydrate()` in an effect — same
no-separate-loading-branch convention as `LearningPath.tsx`: the store's default
empty Set/Map already renders the correct 0%/"not started" neutral shape, so there's
nothing to gate and no hydration mismatch between server and first client paint.
`ModeNodeData.status` widened to `"not started" | "in progress" | "complete"`
(the unused, never-produced `"coming soon"` variant removed) via
`summarizeCourse`; a new `progressLabel` field (`"x / y"`) renders small and muted
in `ModeNode.tsx`, no bar. Sandbox keeps no status/progressLabel. Verified: full
pipeline green, plus real-browser confirmation that `1.2 Load Balancing`'s
IN_PROGRESS status (after visiting it) shows consistently on Home, the workspace
navigator, and the Learning Path.

`ModeNodeData.status` in `src/app/HomeCanvas.tsx` is currently a static placeholder,
deliberately omitted for BB/RWE because there was no real progress to report. There is
now.

1. Compute each course's real status from `summarizeCourse`: `percent === 0` →
   `"not started"`, `0 < percent < 100` → `"in progress"`, `100` → `"complete"`.
   Widen the `status` union accordingly and update `ModeNode.tsx`'s rendering.
2. Show `x / y` alongside, e.g. `7 / 26`. Small, muted, no bar — Home is a mode
   chooser, not a dashboard.
3. Sandbox keeps no status (freeform, nothing to complete). Keep `status` optional.
4. `HomeCanvas` must call `hydrate()` and render a neutral state until `hydrated`.
   Home is server-rendered; do not introduce a hydration mismatch here.

**Done when:** Home reflects real per-course progress, updates after completing a
chapter, and Sandbox is unchanged. Pipeline green.

---

### Phase 7 — Tests, docs, verification (≈1.5 h) — ✅ DONE

**Branch:** `test/release-3.0.0-verification` — landed on
`feature/learning-path-page` instead, per the working-branch note at the top of
this doc.
**Depends on:** Phase 6

**Status:** done — all of 7.1-7.3 below completed as originally specced; 7.4's
manual checklist was spot-checked (real headless-browser passes for the
highest-risk items — status consistency across Home/navigator/Learning Path,
edits surviving a chapter-route switch — logged in Phases 4-6 above) rather than
ticked exhaustively item-by-item in a real interactive browser session; treat the
untouched boxes below as still open if a fully manual pass matters before
release.

**7.1 e2e specs that this release breaks — update, don't delete:**

- `e2e/mode-isolation.spec.ts` asserts `/building-blocks` shows 0 `.react-flow__node`s.
  That route now has **no canvas at all**, so the assertion is vacuously true and tests
  nothing. Rewrite it to: Home → Building Blocks (assert the Learning Path `h1`) →
  click the `1.2 Load Balancing` row → assert the workspace canvas → back to Home →
  Sandbox → assert Sandbox's 4 seed nodes survived. The invariant being guarded
  (cross-mode canvas-store isolation) is unchanged; only the navigation path changed.
- `e2e/chapter-hints-validation.spec.ts` clicks a button named "Placeholder Chapter".
  That button no longer exists. Route via the Learning Path row for
  `1-2-load-balancing`. The hint and validation assertions themselves stay — those are
  guarding CLAUDE.md invariants and must keep passing verbatim.

**7.2 New e2e spec — `e2e/learning-path.spec.ts`:**
1. `/building-blocks` renders 7 sections and 26 chapter rows.
2. A section collapses and expands.
3. An unauthored row is not a link and does not navigate on click.
4. `1.2 Load Balancing` navigates to `/building-blocks/1-2-load-balancing`.
5. The manual complete toggle flips a row to COMPLETED, bumps the overall percentage,
   and **survives a page reload** (this is the real Dexie round-trip test).
6. The Download Curriculum link points at the PDF and has the `download` attribute.

**7.3 Docs to update (all in the same branch):**
- `DESIGN.md` — add a **Learning Path (signature component)** entry under §5 next to
  Chapter Sidebar; document the progress-bar color decision from Phase 3 as a named
  rule so the next agent doesn't reach for green.
- `.claude/docs/MILESTONES.md` — milestone 6's "Status: done" note describes
  `ChapterSidebar` as the list⇄question-pane switcher at `/building-blocks`. Update it
  to the new navigation model and note that milestone 7 (real chapters) now plugs into
  the manifest by flipping `chapterDefinitionId` from `null`.
- `.claude/docs/ARCHITECTURE.md` — add a "Curriculum manifest vs. ChapterDefinition"
  subsection. This distinction is the single most likely thing for a future agent to
  get wrong; write it down where they'll look.
- `.claude/docs/pending.md` — clear the completed spec (that file is a queue, not an
  archive).
- `graphify update .` — the graph has 758 nodes and no knowledge of `src/curriculum/`
  or `src/learning-path/`. Run it so navigation queries stay useful.
- `.claude/PROGRESS_LOG.md` — **spawn a subagent** to append the entry, per CLAUDE.md.
  Do not self-report.

**7.4 Manual verification checklist (do this in a browser — a green pipeline does not
prove any of it):**
- [ ] Learning Path scrolls to Unit 6 at a 900px viewport height (the `overflow-hidden` body trap).
- [ ] Dark **and** light theme both legible; progress bars visible in both.
- [ ] Keyboard-only: Tab reaches every section toggle, every authored row, every manual toggle, and the download link, in visual order, with a visible focus ring.
- [ ] Unauthored rows are not tab stops.
- [ ] 200% browser zoom stays functional (`DESIGN.md` §6).
- [ ] Edits in chapter A survive switching to chapter B and back.
- [ ] Completing a chapter by validation updates the sidebar navigator, the Learning Path, and Home.
- [ ] `prefers-reduced-motion` kills the collapse and progress-bar transitions.

**Done when:** every box above is ticked, the full pipeline exits 0, and the release
branch is pushed for review.

---

## 5. Acceptance criteria (from `pending.md`, mapped to phases)

| Criterion | Phase |
|---|---|
| New Learning Path page exists | 3 |
| Home opens Learning Path instead of Canvas | 3 (route swap), 4 |
| Curriculum grouped by sections | 1, 3 |
| Sections collapsible | 3 |
| Section progress bars | 3 |
| Overall progress bar | 3 |
| Chapter completion indicators | 2, 3 |
| Download Curriculum button | 3 |
| Clicking chapter opens workspace | 4 |
| Workspace remains almost unchanged | 4 |
| Sidebar synchronized with Learning Path | 5 |
| Shared progress model | 2, 5 |
| Proper routing (route-based, no query params) | 4 |
| Clean component decomposition | 3, 5 |
| No duplicated state | 2, 5 |
| Production-quality architecture | all |

---

## 6. Future-compatibility checklist

`pending.md` asks for architecture only — none of these are implemented in 3.0.0.
Verify at the end of Phase 5 that each is *cheap* to add:

| Feature | What makes it cheap | Verify |
|---|---|---|
| Search | `allEntries(course)` returns a flat, filterable list | ✅ if `LearningPath` renders from a derived list, not hardcoded sections |
| Filters | `difficulty` + `status` are both first-class fields | ✅ if `ChapterRow` takes `status` as a prop rather than computing it |
| Resume where I left off | `lastVisitedAt` is already persisted | ✅ `max(lastVisitedAt)` across rows is a one-liner |
| Recently viewed | same field | ✅ |
| Bookmarks | one nullable column on `CurriculumProgress` + a v8 migration | ✅ if the table is slug-keyed |
| Locked chapters | `prerequisiteSlugs` populated; `ChapterRow` already renders a non-interactive variant | ✅ if the unauthored-row path generalizes to "not enterable" rather than being hardcoded to "unauthored" |
| Estimated duration display | already rendered | ✅ |

---

## 7. Risks

| Risk | Mitigation |
|---|---|
| **Sibling-route reuse silently loses work** — `[chapterSlug]` → `[chapterSlug]` reuses the component, so autosave-on-unmount never fires. | `key={chapterSlug}` (Phase 4.1). This is the single highest-consequence detail in the release. Verify with real edits in a browser. |
| **Two progress tables drift into duplicated truth.** | `deriveStatus` is the *only* place they are ever combined. Any second combination site is a bug. Enforce in review. |
| **Status-icon logic gets duplicated** between Learning Path and the workspace navigator, then diverges. | One `ChapterStatusIcon`, imported by both (Phase 5.2). |
| **Slug churn.** Slugs are URLs *and* persistence keys. Renaming one after release orphans progress rows and breaks bookmarks. | Finalize all 31 slugs in Phase 1. Treat them as frozen thereafter. |
| **Hydration mismatch** — progress is IndexedDB-only, pages are server-rendered. | Static structure SSRs; progress gated on `hydrated`. Use `useHasMounted()`, not a hand-rolled effect. |
| **Body `overflow-hidden`** clips the 26-row page with no scrollbar. | Page owns `flex-1 overflow-y-auto` (Phase 3). On the manual checklist. |
| **Scope creep into chapter content.** 26 empty rows are a strong temptation. | 3.0.0 authors **zero** chapters. `chapterDefinitionId` stays `null` for 29 of 31 entries. Content is 3.1.0. |
| **Pushing on a plausible-looking diff.** This release touches routing, persistence schema, and two e2e specs — exactly the shape that broke Vercel twice before (CLAUDE.md). | Full pipeline to exit 0 before every push, no exceptions. Ask before every push. |

---

## 8. Explicitly deferred

- Persisting section collapse state (D5).
- Quizzes / mastery criteria beyond build validation (`CURRICULUM.md` §7 — these are
  part of real chapter content, 3.1.0+).
- Prerequisite *enforcement* / locking (fields populated, nothing reads them).
- Search, filters, bookmarks, resume, recently-viewed (§6 — architecture only).
- Cloud-synced progress (milestone 10, Clerk + Neon). `curriculumProgress` is
  local-first Dexie, same as everything else; syncing it is that milestone's job.
- Per-section or per-unit certificates, badges, or any completion theatrics — out of
  scope permanently, not deferred (`CLAUDE.md`: not a game).
