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
 *  the authored lesson itself. The manifest lists all 72 entries (40
 *  Building Blocks + 32 Real World Extraction, since Release 6.1.0-alpha
 *  Phase 10 condensed Part 1 from 11 chapters to 4 - was 79/47 before). */
export type CurriculumChapter = {
  /** Stable, URL-safe, globally unique. ALSO the route segment:
   *  /building-blocks/<slug>. Never change one after release — it is a
   *  persistence key (see CurriculumProgress) and a bookmarkable URL. */
  slug: string;
  /** Display number from CURRICULUM.md §14/§23, e.g. "1.2". Checkpoints use
   *  "R1"/"R2"/"R3" (CURRICULUM.md Part 4) instead of a section number. */
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
   *  (strictly-sequential within a section, per CURRICULUM.md §17) but NOT
   *  enforced in 3.0.0 — nothing reads it yet. */
  prerequisiteSlugs: string[];
  /** RWE-only domain chip (e.g. "Messaging", "Location & mobility") per
   *  CURRICULUM.md §15.2's roster table. `null` for every Building Blocks
   *  entry — domain groups only exist to help learners follow an RWE thread
   *  vertically across tiers. */
  domain: string | null;
};

export type CurriculumSection = {
  /** e.g. "bb-group-a", "rwe-tier-2". */
  id: string;
  /** Short eyebrow label, e.g. "Group A", "Tier 2". */
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
