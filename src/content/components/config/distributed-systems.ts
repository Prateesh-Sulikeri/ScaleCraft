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
    // Never reachable from networking directly — only compute (a service
    // registering/participating in coordination) or other
    // distributed-systems nodes, both via control signals. Originally
    // accepted only "distributed-systems", but nothing in the registry
    // outputs a "control"-kind edge from that category either — Coordinator
    // was completely unreachable by anything, a more severe version of the
    // same authoring-consistency bug as cache/read-replica/follower below.
    // Compute (app-server/serverless-function) now declares "control" as a
    // legal output kind specifically so this is satisfiable.
    relations: {
      inputs: { allowedCategories: ["compute", "distributed-systems"], allowedKinds: ["control"] },
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
    // Also accepts a control signal from a Coordinator (election
    // management, per this component's own docs below) — distinct from the
    // compute/request-flow writes path.
    relations: {
      inputs: {
        allowedCategories: ["compute", "distributed-systems"],
        allowedKinds: ["request-flow", "control"],
      },
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
    // Accepts "control" alongside "replication" — a Coordinator managing
    // election/failover also needs to reach a Follower directly, not just
    // the Leader.
    relations: {
      inputs: { allowedCategories: ["distributed-systems"], allowedKinds: ["replication", "control"] },
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
