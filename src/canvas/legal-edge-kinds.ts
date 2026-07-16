import type { ComponentCategory } from "@/content/components/types";
import type { EdgeKind } from "@/lib/graph";

/**
 * Which EdgeKinds are legal from a source category to a target category —
 * now a FALLBACK, not the primary mechanism. Base-pack components declare
 * their own precise relational contract (see
 * content/components/types.ts's `ComponentRelations`); this coarse matrix
 * only gets consulted by validation-engine/rules/component-relations.ts
 * when NEITHER endpoint of an edge has declared one — which is always true
 * for a custom, user-authored component (there is deliberately no UI for a
 * user to author their own contract — see .claude/docs/OPEN_QUESTIONS.md),
 * and also true for any base-pack component someone forgot to contract.
 * Also used to pick a sane default kind on connect (see canvas/Canvas.tsx's
 * onConnect wrapper) — one table backs both, so they can't drift apart.
 *
 * Fallback policy is DEFAULT-DENY: a (source, target) pair with no entry
 * here, or an entry that doesn't list the edge's actual kind, is illegal.
 * Default-allow was considered and rejected — it would silently let the
 * exact backwards-flow/evasion bug this table exists to catch back in for
 * any pair nobody got around to filling in (see
 * .claude/docs/validation_agent_design.md, section 2.3).
 *
 * This is a first-pass default informed by common architecture patterns,
 * not a final spec — the exact contents are domain knowledge and remain a
 * documented open question (see the design doc's section 6). Tune freely;
 * adding/removing a kind for a pair is a one-line change here, nothing else.
 */
export const legalEdgeKinds: Partial<Record<ComponentCategory, Partial<Record<ComponentCategory, EdgeKind[]>>>> = {
  networking: {
    networking: ["request-flow"],
    compute: ["request-flow"],
  },
  compute: {
    // control only, never request-flow — a request-flow edge back into
    // networking is exactly the reported backwards-LB bug (see
    // backwards-request-flow.ts); a control signal (e.g. a health check
    // pushed outward) is the one legitimate compute->networking case.
    networking: ["control"],
    compute: ["request-flow", "async"],
    data: ["request-flow", "async"],
    caching: ["request-flow"],
    messaging: ["async"],
    "distributed-systems": ["request-flow", "control"],
  },
  data: {
    data: ["replication"],
  },
  caching: {
    caching: ["replication"],
  },
  messaging: {
    compute: ["async", "control"],
    // Queue -> Dead Letter Queue is exactly this pair.
    messaging: ["async"],
  },
  "distributed-systems": {
    compute: ["control"],
    "distributed-systems": ["control", "replication"],
  },
};

/** Default-deny: an unlisted pair, or a kind not in the listed set, returns
 * an empty array — never falls back to "everything's fine." */
export function legalKindsFor(source: ComponentCategory, target: ComponentCategory): EdgeKind[] {
  return legalEdgeKinds[source]?.[target] ?? [];
}

/** Picks a sensible default kind for a freshly drawn edge between two
 * categories — the first legal kind for the pair, or "request-flow" as a
 * last resort if nothing is legal (the connection itself is then flagged by
 * component-relations.ts regardless of which kind is picked, so the
 * fallback only affects cosmetics, never correctness). Category-level only
 * — doesn't consult either endpoint's specific `relations` contract, so a
 * contracted component's default might still need a manual kind change via
 * the Edge Inspector; deliberately kept simple rather than duplicating
 * component-relations.ts's precedence logic just for a cosmetic default. */
export function pickDefaultKind(source: ComponentCategory, target: ComponentCategory): EdgeKind {
  return legalKindsFor(source, target)[0] ?? "request-flow";
}
