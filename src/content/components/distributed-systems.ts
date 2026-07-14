import { z } from "zod";
import type { ComponentDefinition } from "./types";

const coordinator: ComponentDefinition<{ consensusProtocol: "raft" | "paxos" | "zab" }> = {
  id: "coordinator",
  category: "distributed-systems",
  label: "Coordinator",
  icon: "workflow",
  inputs: [{ id: "in", label: "Coordination" }],
  outputs: [{ id: "out", label: "Coordination" }],
  configSchema: z.object({
    consensusProtocol: z.enum(["raft", "paxos", "zab"]),
  }),
  defaultConfig: { consensusProtocol: "raft" },
  summary: "Manages consensus and coordination between nodes",
  docs: "Runs a consensus protocol so a group of nodes can agree on shared state — leader election, distributed locks, configuration — even when some nodes fail. `consensusProtocol` names the actual algorithm (Raft, Paxos, or ZAB, per ZooKeeper's implementation).",
};

const leader: ComponentDefinition<{ electionTimeoutMs: number }> = {
  id: "leader",
  category: "distributed-systems",
  label: "Leader",
  icon: "crown",
  inputs: [{ id: "in", label: "Writes" }],
  outputs: [{ id: "out", label: "Replication" }],
  configSchema: z.object({
    electionTimeoutMs: z.number().int().min(100).max(10000),
  }),
  defaultConfig: { electionTimeoutMs: 1000 },
  summary: "The single node currently accepting writes",
  docs: "The one node in a replicated group currently accepting writes, which it then replicates out to followers. More than one Leader active at once without a Coordinator managing election is a split-brain waiting to happen.",
};

const follower: ComponentDefinition<{ readOnly: boolean }> = {
  id: "follower",
  category: "distributed-systems",
  label: "Follower",
  icon: "users",
  inputs: [{ id: "in", label: "Replication" }],
  outputs: [{ id: "out", label: "Reads" }],
  configSchema: z.object({
    readOnly: z.boolean(),
  }),
  defaultConfig: { readOnly: true },
  summary: "Replicates a leader's state; may serve reads",
  docs: "Stays in sync with a Leader via replication and can take over if the Leader fails. Whether it's allowed to serve reads directly (`readOnly`) is a real tradeoff — faster reads at the cost of potentially stale ones, since replication isn't instant.",
};

const lockService: ComponentDefinition<{ lockTtlSeconds: number }> = {
  id: "lock-service",
  category: "distributed-systems",
  label: "Lock Service",
  icon: "lock",
  inputs: [{ id: "in", label: "Acquire/Release" }],
  outputs: [],
  configSchema: z.object({
    lockTtlSeconds: z.number().int().min(1).max(3600),
  }),
  defaultConfig: { lockTtlSeconds: 30 },
  summary: "Grants exclusive access to a shared resource",
  docs: "Hands out locks so only one caller at a time can hold exclusive access to a shared resource across a distributed system, where a plain in-process mutex can't reach. `lockTtlSeconds` bounds how long a lock is held if its owner crashes without releasing it.",
};

export const distributedSystemsComponents: ComponentDefinition[] = [coordinator, leader, follower, lockService];
