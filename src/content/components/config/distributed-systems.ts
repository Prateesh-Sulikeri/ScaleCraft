import type { ComponentConfigSpec } from "../types";

export default [
  {
    id: "coordinator",
    category: "distributed-systems",
    label: "Coordinator",
    icon: "workflow",
    inputs: [{ id: "in", label: "Coordination" }],
    outputs: [{ id: "out", label: "Coordination" }],
    fields: [
      {
        kind: "enum",
        name: "consensusProtocol",
        label: "Consensus Protocol",
        default: "raft",
        options: ["raft", "paxos", "zab"],
      },
    ],
    summary: "Manages consensus and coordination between nodes",
    docs: "Runs a consensus protocol so a group of nodes can agree on shared state — leader election, distributed locks, configuration — even when some nodes fail. `consensusProtocol` names the actual algorithm (Raft, Paxos, or ZAB, per ZooKeeper's implementation).",
    // Only talks to other distributed-systems nodes via control signals —
    // never reachable from networking directly, which is exactly what
    // category-adjacency.ts used to check as a separate cross-cutting rule.
    relations: {
      inputs: { allowedCategories: ["distributed-systems"], allowedKinds: ["control"] },
      outputs: { allowedCategories: ["distributed-systems"], allowedKinds: ["control"] },
    },
  },
  {
    id: "leader",
    category: "distributed-systems",
    label: "Leader",
    icon: "crown",
    inputs: [{ id: "in", label: "Writes" }],
    outputs: [{ id: "out", label: "Replication" }],
    fields: [
      {
        kind: "number",
        name: "electionTimeoutMs",
        label: "Election Timeout Ms",
        default: 1000,
        min: 100,
        max: 10000,
        int: true,
      },
    ],
    summary: "The single node currently accepting writes",
    docs: "The one node in a replicated group currently accepting writes, which it then replicates out to followers. More than one Leader active at once without a Coordinator managing election is a split-brain waiting to happen.",
    // Writes only ever come from compute (an App Server mediating) — never
    // straight from networking (Browser/Client). This is the exact
    // structural fix for the reported "Browser wired straight into a
    // Leader" bug, declared here instead of in a separate adjacency rule.
    relations: {
      inputs: { allowedCategories: ["compute"], allowedKinds: ["request-flow"] },
      outputs: { allowedCategories: ["distributed-systems"], allowedKinds: ["replication"] },
    },
  },
  {
    id: "follower",
    category: "distributed-systems",
    label: "Follower",
    icon: "users",
    inputs: [{ id: "in", label: "Replication" }],
    outputs: [{ id: "out", label: "Reads" }],
    fields: [{ kind: "boolean", name: "readOnly", label: "Read Only", default: true }],
    summary: "Replicates a leader's state; may serve reads",
    docs: "Stays in sync with a Leader via replication and can take over if the Leader fails. Whether it's allowed to serve reads directly (`readOnly`) is a real tradeoff — faster reads at the cost of potentially stale ones, since replication isn't instant.",
    relations: {
      inputs: { allowedCategories: ["distributed-systems"], allowedKinds: ["replication"] },
      outputs: { allowedCategories: ["compute"], allowedKinds: ["request-flow"] },
    },
  },
  {
    id: "lock-service",
    category: "distributed-systems",
    label: "Lock Service",
    icon: "lock",
    inputs: [{ id: "in", label: "Acquire/Release" }],
    outputs: [],
    fields: [
      {
        kind: "number",
        name: "lockTtlSeconds",
        label: "Lock Ttl Seconds",
        default: 30,
        min: 1,
        max: 3600,
        int: true,
      },
    ],
    summary: "Grants exclusive access to a shared resource",
    docs: "Hands out locks so only one caller at a time can hold exclusive access to a shared resource across a distributed system, where a plain in-process mutex can't reach. `lockTtlSeconds` bounds how long a lock is held if its owner crashes without releasing it.",
    // Same reasoning as leader.ts above — never directly reachable from
    // networking, only through compute.
    relations: {
      inputs: { allowedCategories: ["compute"], allowedKinds: ["request-flow", "control"] },
    },
  },
] satisfies ComponentConfigSpec[];
