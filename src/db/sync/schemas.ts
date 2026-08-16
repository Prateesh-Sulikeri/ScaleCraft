import { z } from "zod";

/**
 * Request-body validation for each POST /api/sync/* route. `userId` is never
 * part of any of these — it comes from the authenticated session (see
 * auth.ts), never trusted from the client body. Mirrors the Dexie record
 * shapes in src/persistence/db.ts; timestamps travel as epoch-ms numbers
 * (matching Dexie's own convention) and are converted to/from `Date` at the
 * DB boundary inside each route.
 */

/** Raw canvas node/edge shape (src/canvas/types.ts's AnyNodeType /
 * ArchitectureEdgeType), not the lossy domain ArchitectureGraph (release
 * 6.1.0-alpha Phase 3.4, pending-6.1.0-poa.md — see schema.ts's
 * canvasState comment for why). Loosely validated, same convention as
 * `deepCheckSessionBodySchema`'s `critique` below: these are @xyflow/react
 * Node/Edge objects with many optional library-owned fields (style,
 * selected, dragging, width, height, ...) that this route has no business
 * re-deriving a strict schema for - only the fields sync logic itself
 * touches (`id`, the type discriminator, `source`/`target`) are checked. */
const canvasNodeSchema = z.looseObject({
  id: z.string(),
  type: z.enum(["component", "zone", "comment", "start"]),
});

const canvasEdgeSchema = z.looseObject({
  id: z.string(),
  source: z.string(),
  target: z.string(),
});

export const canvasStateSchema = z.object({
  nodes: z.array(canvasNodeSchema),
  edges: z.array(canvasEdgeSchema),
});

export const savesBodySchema = z.object({
  scopeId: z.string().min(1),
  canvasState: canvasStateSchema,
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
