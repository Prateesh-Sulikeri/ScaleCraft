import { z } from "zod";
import type { ComponentDefinition } from "./types";

const messageQueue: ComponentDefinition<{
  deliveryGuarantee: "at-most-once" | "at-least-once" | "exactly-once";
}> = {
  id: "message-queue",
  category: "messaging",
  label: "Message Queue",
  icon: "list-ordered",
  inputs: [{ id: "in", label: "Publish" }],
  outputs: [{ id: "out", label: "Consume" }],
  configSchema: z.object({
    deliveryGuarantee: z.enum(["at-most-once", "at-least-once", "exactly-once"]),
  }),
  defaultConfig: { deliveryGuarantee: "at-least-once" },
  summary: "Decouples producers from consumers via a queue",
  docs: "Lets a producer hand off work without waiting for a consumer to be ready for it — decouples the two in time and load. `deliveryGuarantee` determines what happens on a failure partway through; anything but at-most-once needs a Dead Letter Queue for messages that keep failing.",
};

const kafka: ComponentDefinition<{ partitions: number; retentionHours: number }> = {
  id: "kafka",
  category: "messaging",
  label: "Kafka",
  icon: "waves",
  inputs: [{ id: "in", label: "Produce" }],
  outputs: [{ id: "out", label: "Consume" }],
  configSchema: z.object({
    partitions: z.number().int().min(1).max(1000),
    retentionHours: z.number().int().min(1).max(8760),
  }),
  defaultConfig: { partitions: 3, retentionHours: 168 },
  summary: "Partitioned log for high-throughput event streams",
  docs: "An append-only, partitioned log rather than a traditional queue — messages aren't removed on consumption, so multiple independent consumers can replay the same stream. `partitions` bounds parallelism; `retentionHours` bounds how far back a consumer can replay.",
};

const eventBus: ComponentDefinition<{ deliveryMode: "fan-out" | "point-to-point" }> = {
  id: "event-bus",
  category: "messaging",
  label: "Event Bus",
  icon: "radio",
  inputs: [{ id: "in", label: "Publish" }],
  outputs: [{ id: "out", label: "Subscribe" }],
  configSchema: z.object({
    deliveryMode: z.enum(["fan-out", "point-to-point"]),
  }),
  defaultConfig: { deliveryMode: "fan-out" },
  summary: "Publish/subscribe fan-out to listeners",
  docs: "Broadcasts an event to every interested subscriber rather than to one consumer at a time. `deliveryMode` picks between fanning an event out to every subscriber versus routing each message to exactly one.",
};

const deadLetterQueue: ComponentDefinition<{ maxRetries: number }> = {
  id: "dead-letter-queue",
  category: "messaging",
  label: "Dead Letter Queue",
  icon: "mail-warning",
  inputs: [{ id: "in", label: "Failed message" }],
  outputs: [],
  configSchema: z.object({
    maxRetries: z.number().int().min(0).max(20),
  }),
  defaultConfig: { maxRetries: 5 },
  summary: "Holds messages that failed processing repeatedly",
  docs: "Catches messages that failed to process after repeated attempts instead of silently dropping them or retrying forever — gives you somewhere to inspect and replay failures by hand. `maxRetries` is how many attempts happen before a message lands here.",
};

export const messagingComponents: ComponentDefinition[] = [messageQueue, kafka, eventBus, deadLetterQueue];
