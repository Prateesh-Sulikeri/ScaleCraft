import type { ComponentConfigSpec } from "../types";

export default [
  {
    id: "app-server",
    category: "compute",
    label: "Application Server",
    icon: "server",
    inputs: [{ id: "in", label: "Request" }],
    outputs: [{ id: "out", label: "Query" }],
    fields: [
      { kind: "number", name: "instances", label: "Instances", default: 1, min: 1, max: 20, int: true },
    ],
    summary: "Runs business logic and enforces access control",
    docs: "Runs application logic: authentication, authorization, and business rules. Should mediate all access to the database — clients should never reach it directly.",
    relations: {
      inputs: { allowedCategories: ["networking", "compute"], allowedKinds: ["request-flow"] },
      outputs: {
        allowedCategories: ["compute", "data", "caching", "messaging", "distributed-systems"],
        allowedKinds: ["request-flow", "async"],
      },
    },
  },
  {
    id: "worker",
    category: "compute",
    label: "Worker",
    icon: "cog",
    inputs: [{ id: "in", label: "Job" }],
    outputs: [{ id: "out", label: "Result" }],
    fields: [
      { kind: "number", name: "concurrency", label: "Concurrency", default: 4, min: 1, max: 100, int: true },
    ],
    summary: "Processes jobs asynchronously, off the request path",
    docs: "Pulls jobs off a queue and processes them outside the synchronous request/response cycle — the pattern that keeps slow work (sending email, resizing images, generating reports) from blocking a client's request.",
    // Primarily fed by a queue (async), but a direct compute->worker
    // invocation is also legitimate (request-flow), hence both kinds.
    relations: {
      inputs: { allowedCategories: ["messaging", "compute"], allowedKinds: ["async", "request-flow"] },
      outputs: { allowedCategories: ["data", "caching", "compute", "messaging"], allowedKinds: ["request-flow", "async"] },
    },
  },
  {
    id: "cron-job",
    category: "compute",
    label: "Cron Job",
    icon: "timer",
    inputs: [],
    outputs: [{ id: "out", label: "Triggered job" }],
    fields: [
      {
        kind: "number",
        name: "scheduleIntervalMinutes",
        label: "Schedule Interval Minutes",
        default: 60,
        min: 1,
        max: 10080,
        int: true,
      },
    ],
    summary: "Runs on a fixed schedule, not on request",
    docs: "Triggers work on a fixed schedule rather than in response to an incoming request — nightly batch jobs, periodic cleanup, scheduled reports. Has no inbound edge for the same reason: nothing in the architecture calls it, a scheduler does.",
    // No `inputs` relations — no input port at all, by design (see docs).
    relations: {
      outputs: { allowedCategories: ["compute", "messaging", "data"], allowedKinds: ["request-flow", "async"] },
    },
  },
  {
    id: "serverless-function",
    category: "compute",
    label: "Serverless Function",
    icon: "zap",
    inputs: [{ id: "in", label: "Event" }],
    outputs: [{ id: "out", label: "Result" }],
    fields: [
      {
        kind: "number",
        name: "maxConcurrency",
        label: "Max Concurrency",
        default: 50,
        min: 1,
        max: 10000,
        int: true,
      },
      {
        kind: "number",
        name: "timeoutSeconds",
        label: "Timeout Seconds",
        default: 30,
        min: 1,
        max: 900,
        int: true,
      },
    ],
    summary: "Event-triggered compute that scales to zero",
    docs: "Short-lived compute that runs only in response to a triggering event and scales down to zero when idle — no capacity to provision or pay for between invocations, at the cost of cold-start latency and a hard `timeoutSeconds`.",
    // Event-triggered by design — an API Gateway request (request-flow) or
    // a queue/event-bus message (async) are both legitimate triggers.
    // Never a direct target of raw networking (Client/Browser/LB) — see
    // load-balancer.ts's own outputs contract for the pairing this implies.
    relations: {
      inputs: { allowedCategories: ["networking", "messaging", "compute"], allowedKinds: ["request-flow", "async"] },
      outputs: {
        allowedCategories: ["compute", "data", "caching", "messaging", "distributed-systems"],
        allowedKinds: ["request-flow", "async"],
      },
    },
  },
] satisfies ComponentConfigSpec[];
