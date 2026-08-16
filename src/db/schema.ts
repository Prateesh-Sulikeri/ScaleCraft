import { pgTable, text, timestamp, jsonb, boolean, integer, primaryKey } from "drizzle-orm/pg-core";

/**
 * Cloud sync side of the local-first persistence model — see
 * .claude/docs/ARCHITECTURE.md ("Persistence"). IndexedDB is the primary
 * store for in-progress edits; this is what syncs it per authenticated user
 * for cross-device continuity and progress tracking. Every MVP user is
 * authenticated (no anonymous/guest mode), so there's no anon→account
 * migration to model.
 *
 * Every table here mirrors a src/persistence/db.ts Dexie table (current
 * shape only, not its version history — see
 * .claude/docs/pending-cloud-sync.md decision 5) plus a sync-bookkeeping
 * `updatedAt`, used for last-write-wins conflict resolution across devices
 * (decision 4). Complex/nested Dexie fields are stored as jsonb rather than
 * normalized, matching `savedGraphs.graph` below.
 */

export const savedGraphs = pgTable("saved_graphs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(), // Clerk user id
  /** Chapter id for a chapter attempt, or a sandbox-save id. */
  scopeId: text("scope_id").notNull(),
  /** Raw canvas state ({ nodes: AnyNodeType[]; edges: ArchitectureEdgeType[] }),
   * not the domain ArchitectureGraph — replaces the `graph` column (release
   * 6.1.0-alpha Phase 3.4, pending-6.1.0-poa.md). ArchitectureGraph doesn't
   * carry zones/comments/Start markers (see src/canvas/types.ts), so a save
   * that round-tripped through it lost them on every cross-device restore.
   * Under reconciliation the cloud can win over a device with local data, so
   * that lossy round-trip stopped being an acceptable tradeoff. No migration
   * of existing `graph` data - see the POA's Decision 2, no production data
   * worth preserving. */
  canvasState: jsonb("canvas_state").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/** Mirrors Dexie `customComponents` (id keyed, see db.ts). `id` is a
 * client-generated crypto.randomUUID(), so it's globally unique on its own —
 * same convention as savedGraphs.id above, userId is an ownership column,
 * not part of the key. */
export const customComponents = pgTable("custom_components", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  category: text("category").notNull(),
  label: text("label").notNull(),
  icon: text("icon").notNull(),
  summary: text("summary").notNull(),
  docs: text("docs").notNull(),
  hasInput: boolean("has_input").notNull(),
  hasOutput: boolean("has_output").notNull(),
  fields: jsonb("fields").notNull(), // CustomFieldSpec[]
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/** Mirrors Dexie `chapterProgress` (keyed by chapterId, see db.ts) — the
 * validation engine's completion record. Composite key adds userId since
 * chapterId alone isn't globally unique across accounts. */
export const chapterProgress = pgTable(
  "chapter_progress",
  {
    userId: text("user_id").notNull(),
    chapterId: text("chapter_id").notNull(),
    completedAt: timestamp("completed_at").notNull(),
    matchedBlueprintId: text("matched_blueprint_id"),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.chapterId] })],
);

/** Mirrors Dexie `curriculumProgress` (keyed by slug, see db.ts) — the
 * learner's own manual-completion/last-visited facts, kept distinct from
 * chapterProgress per db.ts's CurriculumProgress doc comment. */
export const curriculumProgress = pgTable(
  "curriculum_progress",
  {
    userId: text("user_id").notNull(),
    slug: text("slug").notNull(),
    manuallyCompletedAt: timestamp("manually_completed_at"),
    lastVisitedAt: timestamp("last_visited_at"),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.slug] })],
);

/** Mirrors Dexie `examAttempts` (compound-keyed [chapterDefinitionId,
 * attemptNumber], see db.ts) — unlimited attempts per chapter until passed. */
export const examAttempts = pgTable(
  "exam_attempts",
  {
    userId: text("user_id").notNull(),
    chapterDefinitionId: text("chapter_definition_id").notNull(),
    attemptNumber: integer("attempt_number").notNull(),
    submittedAt: timestamp("submitted_at").notNull(),
    score: integer("score").notNull(), // 0-100, rounded
    answers: jsonb("answers").notNull(), // ExamQuestionAnswer[]
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.chapterDefinitionId, table.attemptNumber] }),
  ],
);

/** Mirrors Dexie `deepCheckSessions` (auto-increment `id` locally, see
 * db.ts). Dexie's local numeric id is device-local and meaningless across
 * devices, so this table uses a client-generated crypto.randomUUID() `id`
 * (assigned at sync time) as the real primary key instead. */
export const deepCheckSessions = pgTable("deep_check_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  /** Same slot key as saves/chapterProgress — SANDBOX_SAVE_ID or
   * chapterSaveId(id), see db.ts. */
  saveId: text("save_id").notNull(),
  createdAt: timestamp("created_at").notNull(),
  critique: jsonb("critique").notNull(), // AiCritique, see src/ai/schema.ts
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
