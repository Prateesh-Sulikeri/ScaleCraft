import type { ChapterDefinition } from "./types";

/**
 * Throwaway placeholder content — one dummy chapter per chapter mode, just
 * enough to exercise the chapter shell (ChapterWorkspace/ChapterSidebar/
 * ChapterNavigator/QuestionPane) end to end. This is NOT real curriculum
 * content: the actual Building Blocks / RWE chapters (per
 * .claude/docs/CURRICULUM.md) are Step 5/6 in .claude/docs/NEXT_STEPS.md,
 * authored once the stronger validation agent (Step 3) exists to back
 * `validationRuleIds`. Replace this file's contents then, don't extend it.
 */
export const chapterRegistry: ChapterDefinition[] = [
  {
    id: "bb-dummy-1",
    mode: "building-blocks",
    title: "Placeholder Chapter",
    placeholder: true,
    problemStatement:
      "This is placeholder content for the first Building Blocks chapter — " +
      "real lesson content (starting with load balancing, per CURRICULUM.md) " +
      "lands in a later step. For now, this exists only to prove the chapter " +
      "shell — list, question pane, filtered component picker — works.",
    learningObjectives: ["Placeholder objective — real objectives arrive with real content."],
    availableComponentIds: ["client", "load-balancer", "app-server"],
    requiredComponentIds: ["client", "load-balancer", "app-server"],
    // Scoped to the 4 general/structural rules only — not all 10, not none.
    // These never reference a specific not-yet-taught component; they check
    // whether the graph is coherent at all (nothing floating, no missing
    // inputs, no bad cycles, edges respect each component's own declared
    // legal connections), so they're safe at any curriculum stage. The 6
    // domain-specific rules left out (no-direct-client-database,
    // single-instance-load-balancer, permissive-firewall, split-brain-risk,
    // queue-without-dead-letter-queue, orphan-read-replica) are each keyed
    // to one specific component (database, firewall, queue, read-replica)
    // not even in this chapter's palette (client/load-balancer/app-server)
    // — turning those on would be pointless at best, premature at worst.
    // This is what actually catches a malformed wiring *between components
    // this chapter is already teaching* (e.g. a backwards Application
    // Server -> Load Balancer edge) without rejecting on content the
    // chapter hasn't introduced yet. Real per-chapter rule curation is
    // still Step 5's job once this is real content, not a throwaway
    // fixture — chapter-completion state (required components, blueprint
    // match) is a separate mechanism, unaffected by this list either way —
    // see chapter-outcome-violations.ts.
    validationRuleIds: ["orphan-component", "missing-input-connection", "request-flow-cycle", "component-relations"],
    // Throwaway, not real curriculum content — same convention as
    // `placeholder: true` above. Exists purely so there's something concrete
    // to click through end to end (QuestionPane's connected-count line, the
    // pass state, the Debrief) before Step 5 authors real chapters with real
    // blueprints. Step 5 replaces this, doesn't build on it.
    blueprints: [
      {
        id: "bb-dummy-1-blueprint-throwaway",
        label: "Client routed through a load balancer to an app server",
        require: {
          id: "bb-dummy-1-blueprint-throwaway",
          nodes: [
            { alias: "client", componentId: "client" },
            { alias: "lb", componentId: "load-balancer" },
            { alias: "app", componentId: "app-server" },
          ],
          edges: [
            { from: "client", to: "lb" },
            { from: "lb", to: "app" },
          ],
        },
        commentary:
          "**Throwaway fixture, not real curriculum content.** A client should " +
          "never depend on a single app server directly — routing through a " +
          "load balancer means a server can be replaced or scaled without the " +
          "client ever noticing.",
      },
    ],
    hints: [
      {
        id: "bb-dummy-1-hint-1",
        body: "This is a placeholder hint. Real hints are opt-in, never auto-shown — this one is no different.",
      },
    ],
    readingLinks: [],
    // Placeholder, same convention as the rest of this fixture — but real
    // enough to exercise Deep Check's Building Blocks framing (§10.7) end
    // to end. Approximates CURRICULUM.md's 3.4 Load Balancer entry, which
    // this chapter stands in for per this file's own header comment.
    curriculumContext: {
      position: "Building Blocks, Group A: Core Infrastructure — Chapter 3.4 of 44 (placeholder).",
      masteredConcepts: [
        "Networking fundamentals and the trust perimeter (3.1)",
        "DNS resolution and the reverse proxy's single-front-door pattern (3.2-3.3)",
      ],
      notYetIntroducedConcepts: [
        "Statelessness and session externalization (Group B)",
        "Distributed caching (Group D)",
        "Read replicas and data-layer scaling (Group C)",
        "Any queue/async/coordination concepts (Groups E-G)",
      ],
      simplifications: [
        "One load balancer in front of two app servers is the whole lesson — no health-check tuning, no multi-region failover.",
        "Balancing algorithm choice (round-robin vs. least-connections) is a config decision here, not a performance-tuning exercise.",
      ],
    },
    // A single unconnected node, not the solved blueprint — a starter graph
    // that already satisfied the required-components/blueprint check would
    // hand the exercise to the learner solved. Just enough that opening the
    // chapter for the first time doesn't drop the learner on a blank canvas.
    starterGraph: {
      nodes: [{ id: "bb-dummy-1-starter-client", componentId: "client", position: { x: 80, y: 120 }, config: {} }],
      edges: [],
      entryPointIds: [],
    },
  },
  {
    id: "rwe-dummy-1",
    mode: "real-world-extraction",
    title: "Placeholder Project",
    placeholder: true,
    problemStatement:
      "This is placeholder content for Real World Extraction Tier 1's Bitly project " +
      "(per CURRICULUM.md §15.2) — real content lands in a later step. For now, this " +
      "exists only to prove the chapter shell works in this mode too.",
    learningObjectives: ["Placeholder objective — real objectives arrive with real content."],
    availableComponentIds: ["client", "load-balancer", "app-server", "sql-database", "cache"],
    requiredComponentIds: ["client", "app-server", "sql-database"],
    // Moot either way — real-world-extraction chapters always run the full
    // rule registry regardless of this field (see chapter-outcome.ts).
    validationRuleIds: [],
    blueprints: [],
    hints: [],
    readingLinks: [],
    // Same reasoning as bb-dummy-1's starterGraph above.
    starterGraph: {
      nodes: [{ id: "rwe-dummy-1-starter-client", componentId: "client", position: { x: 80, y: 120 }, config: {} }],
      edges: [],
      entryPointIds: [],
    },
  },
];

export function getChaptersForMode(mode: ChapterDefinition["mode"]): ChapterDefinition[] {
  return chapterRegistry.filter((c) => c.mode === mode);
}
