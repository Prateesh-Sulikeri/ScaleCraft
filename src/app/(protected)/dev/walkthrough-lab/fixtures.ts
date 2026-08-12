import type { WalkthroughProps } from "@/chapters/walkthrough/types";

/**
 * Dev-only fixtures for the authoring lab, not curriculum content. Three
 * shapes per .claude/docs/pending-diagram-pipeline.md P4.1: the real
 * migrated pilot (proves the lab matches shipped content), an 8-node
 * fan-out (previews auto-layout at RWE scale), and a deliberately broken
 * one (proves the issue panel actually surfaces mistakes).
 */
export const WALKTHROUGH_LAB_FIXTURES: { id: string; label: string; props: WalkthroughProps }[] = [
  {
    id: "load-balancer",
    label: "Load Balancer (migrated pilot, bb-3-4)",
    props: {
      title: "Load Balancing, one request end to end",
      description: "Switch the algorithm to see which instance gets picked.",
      algorithms: [
        { id: "round-robin", label: "Round Robin" },
        { id: "least-connections", label: "Least Connections" },
      ],
      nodes: [
        { id: "client", kind: "component", componentId: "client" },
        { id: "lb", kind: "component", componentId: "load-balancer" },
        { id: "app1", kind: "component", componentId: "app-server", label: "App Server 1" },
        { id: "app2", kind: "component", componentId: "app-server", label: "App Server 2" },
      ],
      edges: [
        { id: "req-lb", source: "client", target: "lb", kind: "request-flow" },
        { id: "req-app1", source: "lb", target: "app1", kind: "request-flow" },
        { id: "req-app2", source: "lb", target: "app2", kind: "request-flow" },
        { id: "hc-app1", source: "lb", target: "app1", kind: "control" },
        { id: "hc-app2", source: "lb", target: "app2", kind: "control" },
      ],
      steps: [
        { caption: "The client sends its request to the Load Balancer's one public address.", focus: "req-lb" },
        {
          caption: "The Load Balancer already knows both instances are healthy, from continuous health checks.",
          highlightNodeIds: ["lb", "app1", "app2"],
          highlightEdgeIds: ["hc-app1", "hc-app2"],
        },
        {
          caption: "Round-robin picks App Server 1 - it is simply next in the rotation.",
          focus: "req-app1",
          variants: {
            "least-connections": { caption: "Least-connections picks App Server 2 instead.", focus: "req-app2" },
          },
        },
      ],
    },
  },
  {
    id: "fan-out",
    label: "8-node fan-out (RWE-scale preview)",
    props: {
      title: "Fan-out at scale",
      description: "Client through a load balancer to three app servers, a cache, a database, and a queue.",
      nodes: [
        { id: "client", kind: "component", componentId: "client" },
        { id: "lb", kind: "component", componentId: "load-balancer" },
        { id: "app1", kind: "component", componentId: "app-server", label: "App Server 1" },
        { id: "app2", kind: "component", componentId: "app-server", label: "App Server 2" },
        { id: "app3", kind: "component", componentId: "app-server", label: "App Server 3" },
        { id: "cache", kind: "component", componentId: "cache" },
        { id: "db", kind: "component", componentId: "sql-database" },
        { id: "queue", kind: "component", componentId: "message-queue" },
      ],
      edges: [
        { id: "e-client-lb", source: "client", target: "lb", kind: "request-flow" },
        { id: "e-lb-app1", source: "lb", target: "app1", kind: "request-flow" },
        { id: "e-lb-app2", source: "lb", target: "app2", kind: "request-flow" },
        { id: "e-lb-app3", source: "lb", target: "app3", kind: "request-flow" },
        { id: "e-app1-cache", source: "app1", target: "cache", kind: "request-flow" },
        { id: "e-app1-db", source: "app1", target: "db", kind: "request-flow" },
        { id: "e-app2-cache", source: "app2", target: "cache", kind: "request-flow" },
        { id: "e-app3-cache", source: "app3", target: "cache", kind: "request-flow" },
        { id: "e-app1-queue", source: "app1", target: "queue", kind: "async" },
      ],
      steps: [
        { caption: "The client's request enters through the Load Balancer.", focus: "e-client-lb" },
        { caption: "The Load Balancer routes to one of three App Servers.", focus: ["e-lb-app1", "e-lb-app2", "e-lb-app3"] },
        {
          caption: "App Server 1 checks the cache, falls back to the database, and emits an event onto the queue.",
          focus: ["e-app1-cache", "e-app1-db", "e-app1-queue"],
        },
      ],
    },
  },
  {
    id: "broken",
    label: "Broken (bad componentId + bad focus id)",
    props: {
      title: "Deliberately broken",
      description: "Exercises the issue panel - do not use as an authoring template.",
      nodes: [
        { id: "client", kind: "component", componentId: "client" },
        { id: "lb", kind: "component", componentId: "not-a-real-component" },
        { id: "app1", kind: "component", componentId: "app-server" },
      ],
      edges: [
        { id: "e1", source: "client", target: "lb", kind: "request-flow" },
        { id: "e2", source: "lb", target: "app1", kind: "request-flow" },
      ],
      steps: [
        { caption: "This step focuses on an edge id that was never declared.", focus: "ghost-edge" },
        { caption: "Second step.", highlightNodeIds: ["app1"], highlightEdgeIds: [] },
      ],
    },
  },
];
