import type { ComponentConfigSpec } from "../types";

export default [
  {
    id: "cache",
    category: "caching",
    label: "Cache",
    icon: "gauge",
    inputs: [{ id: "in", label: "Read/Write" }],
    outputs: [{ id: "out", label: "Miss → origin" }],
    fields: [
      {
        kind: "enum",
        name: "evictionPolicy",
        label: "Eviction Policy",
        default: "lru",
        options: ["lru", "lfu", "ttl"],
      },
      { kind: "number", name: "ttlSeconds", label: "Ttl Seconds", default: 300, min: 1, max: 86400, int: true },
    ],
    summary: "Fast in-memory store for frequently read data",
    docs: "An in-memory store sitting in front of a slower system of record, absorbing repeat reads so they don't hit it every time. `evictionPolicy` decides what gets dropped when it fills up; `ttlSeconds` bounds how long a stale entry can survive.",
  },
  {
    id: "distributed-cache",
    category: "caching",
    label: "Distributed Cache",
    icon: "boxes",
    inputs: [{ id: "in", label: "Read/Write" }],
    outputs: [{ id: "out", label: "Miss → origin" }],
    fields: [
      {
        kind: "number",
        name: "replicationFactor",
        label: "Replication Factor",
        default: 2,
        min: 1,
        max: 10,
        int: true,
      },
      {
        kind: "enum",
        name: "consistency",
        label: "Consistency",
        default: "eventual",
        options: ["eventual", "strong"],
      },
    ],
    summary: "A cache sharded and replicated across nodes",
    docs: "A cache whose data is partitioned and replicated across multiple nodes instead of living on one machine — survives a single node failing, at the cost of the same consistency-vs-latency tradeoff every distributed store faces.",
  },
] satisfies ComponentConfigSpec[];
