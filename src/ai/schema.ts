import { z } from "zod";

/** Exactly per .claude/docs/validation_agent_design.md §10.4. */
export const aiCritiqueSchema = z.object({
  summary: z.string().max(600),
  sections: z
    .array(
      z.object({
        title: z.string().max(80),
        body: z.string().max(1500),
        relatedNodeIds: z.array(z.string()).default([]),
      }),
    )
    .max(6),
  tradeoffs: z
    .array(
      z.object({
        decision: z.string(),
        cost: z.string(),
        benefit: z.string(),
      }),
    )
    .max(5)
    .default([]),
});

export type AiCritique = z.infer<typeof aiCritiqueSchema>;

export type ParseAiResponseResult =
  | { status: "ok"; critique: AiCritique }
  | { status: "error"; message: string };

const FENCE_PATTERN = /^```(?:json)?\s*([\s\S]*?)\s*```$/;

function stripJsonFence(raw: string): string {
  const trimmed = raw.trim();
  const match = trimmed.match(FENCE_PATTERN);
  return match ? match[1].trim() : trimmed;
}

/**
 * On receipt: strip a ```json fence, JSON.parse, Zod-validate, then filter
 * `relatedNodeIds` against the real graph so a hallucinated (or injected —
 * see prompt.ts's guardrails) id can never reach canvas selection. Never
 * throws and never partially renders — a malformed or schema-invalid
 * response is a plain "error" result, not a thrown exception. This is the
 * enforceable half of §4.5.
 */
export function parseAiResponse(
  raw: string,
  realNodeIds: Iterable<string>,
): ParseAiResponseResult {
  const nodeIds = realNodeIds instanceof Set ? realNodeIds : new Set(realNodeIds);

  let json: unknown;
  try {
    json = JSON.parse(stripJsonFence(raw));
  } catch {
    return { status: "error", message: "The model returned something unusable." };
  }

  const result = aiCritiqueSchema.safeParse(json);
  if (!result.success) {
    return { status: "error", message: "The model returned something unusable." };
  }

  return {
    status: "ok",
    critique: {
      ...result.data,
      sections: result.data.sections.map((section) => ({
        ...section,
        relatedNodeIds: section.relatedNodeIds.filter((id) => nodeIds.has(id)),
      })),
    },
  };
}
