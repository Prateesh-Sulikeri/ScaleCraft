import { z } from "zod";

/**
 * Request-body validation for each POST /api/sync/* route. `userId` is never
 * part of any of these — it comes from the authenticated session (see
 * auth.ts), never trusted from the client body. Mirrors the Dexie record
 * shapes in src/persistence/db.ts; timestamps travel as epoch-ms numbers
 * (matching Dexie's own convention) and are converted to/from `Date` at the
 * DB boundary inside each route.
 */

const graphNodeSchema = z.object({
  id: z.string(),
  componentId: z.string(),
  position: z.object({ x: z.number(), y: z.number() }),
  config: z.unknown(),
});

const graphEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  kind: z.enum(["request-flow", "control", "replication", "async"]),
});

/** Domain ArchitectureGraph (src/lib/graph.ts) — the shape the client sends
 * after running toArchitectureGraph() on the canvas nodes/edges. */
export const architectureGraphSchema = z.object({
  nodes: z.array(graphNodeSchema),
  edges: z.array(graphEdgeSchema),
  entryPointIds: z.array(z.string()),
});

export const savesBodySchema = z.object({
  scopeId: z.string().min(1),
  graph: architectureGraphSchema,
});

const customFieldSpecSchema = z.looseObject({});

export const customComponentBodySchema = z.object({
  id: z.string().min(1),
  category: z.string().min(1),
  label: z.string().min(1),
  icon: z.string().min(1),
  summary: z.string(),
  docs: z.string(),
  hasInput: z.boolean(),
  hasOutput: z.boolean(),
  fields: z.array(customFieldSpecSchema),
});

export const chapterProgressBodySchema = z.object({
  chapterId: z.string().min(1),
  completedAt: z.number(),
  matchedBlueprintId: z.string().nullable(),
});

export const curriculumProgressBodySchema = z.object({
  slug: z.string().min(1),
  manuallyCompletedAt: z.number().nullable(),
  lastVisitedAt: z.number().nullable(),
});

const examQuestionAnswerSchema = z.object({
  questionId: z.string(),
  answer: z.unknown().nullable(),
  correct: z.boolean(),
});

export const examAttemptBodySchema = z.object({
  chapterDefinitionId: z.string().min(1),
  attemptNumber: z.number().int().nonnegative(),
  submittedAt: z.number(),
  score: z.number().int().min(0).max(100),
  answers: z.array(examQuestionAnswerSchema),
});

export const deepCheckSessionBodySchema = z.object({
  id: z.string().min(1),
  saveId: z.string().min(1),
  createdAt: z.number(),
  critique: z.looseObject({}),
});
