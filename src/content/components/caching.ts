import { z } from "zod";
import type { ComponentDefinition } from "./types";

const cache: ComponentDefinition<{ evictionPolicy: "lru" | "lfu" | "ttl"; ttlSeconds: number }> = {
  id: "cache",
  category: "caching",
  label: "Cache",
  icon: "gauge",
  inputs: [{ id: "in", label: "Read/Write" }],
  outputs: [{ id: "out", label: "Miss → origin" }],
  configSchema: z.object({
    evictionPolicy: z.enum(["lru", "lfu", "ttl"]),
    ttlSeconds: z.number().int().min(1).max(86400),
  }),
  defaultConfig: { evictionPolicy: "lru", ttlSeconds: 300 },
  summary: "Fast in-memory store for frequently read data",
  docs: "An in-memory store sitting in front of a slower system of record, absorbing repeat reads so they don't hit it every time. `evictionPolicy` decides what gets dropped when it fills up; `ttlSeconds` bounds how long a stale entry can survive.",
};

const distributedCache: ComponentDefinition<{ replicationFactor: number; consistency: "eventual" | "strong" }> = {
  id: "distributed-cache",
  category: "caching",
  label: "Distributed Cache",
  icon: "boxes",
  inputs: [{ id: "in", label: "Read/Write" }],
  outputs: [{ id: "out", label: "Miss → origin" }],
  configSchema: z.object({
    replicationFactor: z.number().int().min(1).max(10),
    consistency: z.enum(["eventual", "strong"]),
  }),
  defaultConfig: { replicationFactor: 2, consistency: "eventual" },
  summary: "A cache sharded and replicated across nodes",
  docs: "A cache whose data is partitioned and replicated across multiple nodes instead of living on one machine — survives a single node failing, at the cost of the same consistency-vs-latency tradeoff every distributed store faces.",
};

export const cachingComponents: ComponentDefinition[] = [cache, distributedCache];
