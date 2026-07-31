import type { QuizQuestion } from "@/content/chapters/types";

/**
 * Placeholder fixture data, not curriculum content — QUIZ_FRAMEWORK.md's
 * banks are prose specifications for Opus to author as real QuizQuestion
 * objects (.claude/docs/pending-content.md), not shipped-JSON this repo
 * already contains. These three exist only so this dev page has something
 * to render: one graph per edge kind that isn't request-flow's default, so
 * ReadOnlyGraphSummary's color+dash styling (Phase 5) is actually exercised.
 * Layout convention matches QUIZ_FRAMEWORK.md §4: x in steps of ~180 from
 * 40, y rows at 100/240/380, request flow left to right.
 */
export const DIAGRAM_QUESTION_FIXTURES: QuizQuestion[] = [
  {
    id: "dev-fixture-request-flow",
    kind: "diagram",
    difficulty: 1,
    prompt: "*(dev fixture)* A client talks to an app server through a load balancer. Which edge kind connects them?",
    graph: {
      nodes: [
        { id: "n1", componentId: "client", position: { x: 40, y: 100 }, config: {} },
        { id: "n2", componentId: "load-balancer", position: { x: 220, y: 100 }, config: {} },
        { id: "n3", componentId: "app-server", position: { x: 400, y: 100 }, config: {} },
      ],
      edges: [
        { id: "e1", source: "n1", target: "n2", kind: "request-flow" },
        { id: "e2", source: "n2", target: "n3", kind: "request-flow" },
      ],
      entryPointIds: ["n1"],
    },
    options: [
      { id: "a", label: "request-flow", explanationMd: "Correct — a client-facing request path.", correct: true },
      { id: "b", label: "async", explanationMd: "Async is for queued/event-driven messaging, not a direct request.", correct: false },
    ],
  },
  {
    id: "dev-fixture-async",
    kind: "diagram",
    difficulty: 2,
    prompt: "*(dev fixture)* An app server hands work to a worker through a message queue. Which edge kind is that hand-off?",
    graph: {
      nodes: [
        { id: "n1", componentId: "app-server", position: { x: 40, y: 100 }, config: {} },
        { id: "n2", componentId: "message-queue", position: { x: 220, y: 100 }, config: {} },
        { id: "n3", componentId: "worker", position: { x: 400, y: 100 }, config: {} },
      ],
      edges: [
        { id: "e1", source: "n1", target: "n2", kind: "async" },
        { id: "e2", source: "n2", target: "n3", kind: "async" },
      ],
      entryPointIds: ["n1"],
    },
    options: [
      { id: "a", label: "async", explanationMd: "Correct — fire-and-forget through a queue.", correct: true },
      { id: "b", label: "request-flow", explanationMd: "A queue decouples producer and consumer in time; that's not a direct request path.", correct: false },
    ],
  },
  {
    id: "dev-fixture-replication",
    kind: "diagram",
    difficulty: 2,
    prompt: "*(dev fixture)* A SQL database replicates to a read replica, and an app server queries the cache. Which two edge kinds are shown?",
    graph: {
      nodes: [
        { id: "n1", componentId: "app-server", position: { x: 40, y: 100 }, config: {} },
        { id: "n2", componentId: "cache", position: { x: 220, y: 100 }, config: {} },
        { id: "n3", componentId: "sql-database", position: { x: 40, y: 240 }, config: {} },
        { id: "n4", componentId: "read-replica", position: { x: 220, y: 240 }, config: {} },
      ],
      edges: [
        { id: "e1", source: "n1", target: "n2", kind: "request-flow" },
        { id: "e2", source: "n3", target: "n4", kind: "replication" },
      ],
      entryPointIds: ["n1"],
    },
    options: [
      { id: "a", label: "request-flow and replication", explanationMd: "Correct — one direct query, one data-sync back-edge.", correct: true },
      { id: "b", label: "control and async", explanationMd: "Neither edge here is a health check or a queue hand-off.", correct: false },
    ],
  },
];
