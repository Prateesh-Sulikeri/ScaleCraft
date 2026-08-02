import type { EdgeKind } from "@/lib/graph";

/** Color + line pattern per kind (see globals.css's --edge-* tokens) — two
 * redundant channels so kind is legible even for colorblind users or at
 * small canvas scale, not color alone. Shared by the live canvas (store.tsx,
 * EdgeInspector.tsx) and read-only graph renders (ReadOnlyGraphSummary.tsx)
 * — one source of truth for what an edge kind looks like everywhere it's
 * drawn or described. */
export const EDGE_COLOR_VAR: Record<EdgeKind, string> = {
  "request-flow": "var(--edge-request-flow)",
  control: "var(--edge-control)",
  replication: "var(--edge-replication)",
  async: "var(--edge-async)",
};

export const EDGE_DASH_ARRAY: Partial<Record<EdgeKind, string>> = {
  control: "2 3",
  replication: "6 3",
  async: "3 6",
};

export const EDGE_KINDS: EdgeKind[] = ["request-flow", "control", "replication", "async"];

// Always-visible, not a dynamic hint — this is what the currently selected
// kind means, not a nudge toward help someone didn't ask for. See
// .claude/docs/ARCHITECTURE.md ("Architecture Graph") for the full model.
export const EDGE_KIND_CAPTIONS: Record<EdgeKind, string> = {
  "request-flow": "Client-facing request path - the only kind checked for cycles.",
  control: "Non-blocking control signal, e.g. a health check or heartbeat.",
  replication: "Data replicated between instances (a legitimate back-edge).",
  async: "Asynchronous messaging - queues, events, fire-and-forget.",
};
