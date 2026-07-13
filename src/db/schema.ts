import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";

/**
 * Cloud sync side of the local-first persistence model — see
 * .claude/docs/ARCHITECTURE.md ("Persistence"). IndexedDB is the primary
 * store for in-progress edits; this is what syncs it per authenticated user
 * for cross-device continuity and progress tracking. Every MVP user is
 * authenticated (no anonymous/guest mode), so there's no anon→account
 * migration to model.
 */

export const savedGraphs = pgTable("saved_graphs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(), // Clerk user id
  /** Chapter id for a chapter attempt, or a sandbox-save id. */
  scopeId: text("scope_id").notNull(),
  graph: jsonb("graph").notNull(), // ArchitectureGraph JSON, see src/lib/graph.ts
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
