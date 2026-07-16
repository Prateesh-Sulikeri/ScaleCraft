import type { ComponentConfigSpec } from "../types";

export default [
  {
    id: "message-queue",
    category: "messaging",
    label: "Message Queue",
    icon: "list-ordered",
    inputs: [{ id: "in", label: "Publish" }],
    outputs: [{ id: "out", label: "Consume" }],
    fields: [
      {
        kind: "enum",
        name: "deliveryGuarantee",
        label: "Delivery Guarantee",
        default: "at-least-once",
        options: ["at-most-once", "at-least-once", "exactly-once"],
      },
    ],
    summary: "Decouples producers from consumers via a queue",
    docs: "Lets a producer hand off work without waiting for a consumer to be ready for it — decouples the two in time and load. `deliveryGuarantee` determines what happens on a failure partway through; anything but at-most-once needs a Dead Letter Queue for messages that keep failing.",
    // Outputs allow "messaging" (to a Dead Letter Queue on repeated
    // failure — see queue-without-dead-letter-queue.ts) alongside the
    // normal "async" consume path to a Worker/Serverless Function.
    relations: {
      inputs: { allowedCategories: ["compute"], allowedKinds: ["request-flow", "async"] },
      outputs: { allowedCategories: ["compute", "messaging"], allowedKinds: ["async"] },
    },
  },
  {
    id: "kafka",
    category: "messaging",
    label: "Kafka",
    icon: "waves",
    inputs: [{ id: "in", label: "Produce" }],
    outputs: [{ id: "out", label: "Consume" }],
    fields: [
      { kind: "number", name: "partitions", label: "Partitions", default: 3, min: 1, max: 1000, int: true },
      {
        kind: "number",
        name: "retentionHours",
        label: "Retention Hours",
        default: 168,
        min: 1,
        max: 8760,
        int: true,
      },
    ],
    summary: "Partitioned log for high-throughput event streams",
    docs: "An append-only, partitioned log rather than a traditional queue — messages aren't removed on consumption, so multiple independent consumers can replay the same stream. `partitions` bounds parallelism; `retentionHours` bounds how far back a consumer can replay.",
    relations: {
      inputs: { allowedCategories: ["compute"], allowedKinds: ["request-flow", "async"] },
      outputs: { allowedCategories: ["compute", "messaging"], allowedKinds: ["async"] },
    },
  },
  {
    id: "event-bus",
    category: "messaging",
    label: "Event Bus",
    icon: "radio",
    inputs: [{ id: "in", label: "Publish" }],
    outputs: [{ id: "out", label: "Subscribe" }],
    fields: [
      {
        kind: "enum",
        name: "deliveryMode",
        label: "Delivery Mode",
        default: "fan-out",
        options: ["fan-out", "point-to-point"],
      },
    ],
    summary: "Publish/subscribe fan-out to listeners",
    docs: "Broadcasts an event to every interested subscriber rather than to one consumer at a time. `deliveryMode` picks between fanning an event out to every subscriber versus routing each message to exactly one.",
    relations: {
      inputs: { allowedCategories: ["compute"], allowedKinds: ["request-flow", "async"] },
      outputs: { allowedCategories: ["compute"], allowedKinds: ["async"] },
    },
  },
  {
    id: "dead-letter-queue",
    category: "messaging",
    label: "Dead Letter Queue",
    icon: "mail-warning",
    inputs: [{ id: "in", label: "Failed message" }],
    outputs: [],
    fields: [
      { kind: "number", name: "maxRetries", label: "Max Retries", default: 5, min: 0, max: 20, int: true },
    ],
    summary: "Holds messages that failed processing repeatedly",
    docs: "Catches messages that failed to process after repeated attempts instead of silently dropping them or retrying forever — gives you somewhere to inspect and replay failures by hand. `maxRetries` is how many attempts happen before a message lands here.",
    // Only ever fed BY another messaging component (a queue giving up on a
    // message) — never directly by compute.
    relations: {
      inputs: { allowedCategories: ["messaging"], allowedKinds: ["async"] },
    },
  },
] satisfies ComponentConfigSpec[];
