import { z } from "zod";
import type { ComponentDefinition } from "./types";

const sqlDatabase: ComponentDefinition<{ engine: "postgres" | "mysql" }> = {
  id: "sql-database",
  category: "data",
  label: "SQL Database",
  icon: "database",
  inputs: [{ id: "in", label: "Query" }],
  // An output port so a "replication" edge can be drawn out to a Read
  // Replica — see orphan-read-replica.ts, which requires exactly this.
  outputs: [{ id: "out", label: "Replication" }],
  configSchema: z.object({
    engine: z.enum(["postgres", "mysql"]),
  }),
  defaultConfig: { engine: "postgres" },
  summary: "Durable, structured relational storage",
  docs: "Durable, structured, relational storage. Exposing this directly to clients bypasses the application server's authentication, authorization, and business logic.",
};

const nosqlDatabase: ComponentDefinition<{ model: "key-value" | "document" | "wide-column" | "graph" }> = {
  id: "nosql-database",
  category: "data",
  label: "NoSQL Database",
  icon: "layers",
  inputs: [{ id: "in", label: "Query" }],
  outputs: [{ id: "out", label: "Replication" }],
  configSchema: z.object({
    model: z.enum(["key-value", "document", "wide-column", "graph"]),
  }),
  defaultConfig: { model: "document" },
  summary: "Flexible-schema storage for high-scale workloads",
  docs: "Non-relational storage that trades some of a SQL database's consistency and query flexibility for horizontal scalability and a flexible schema. `model` determines the actual data shape and access pattern — a key-value store and a graph database solve very different problems.",
};

const readReplica: ComponentDefinition<{ replicationLagBudgetMs: number }> = {
  id: "read-replica",
  category: "data",
  label: "Read Replica",
  icon: "copy",
  inputs: [{ id: "in", label: "Replication" }],
  outputs: [{ id: "out", label: "Read query" }],
  configSchema: z.object({
    replicationLagBudgetMs: z.number().int().min(0).max(60000),
  }),
  defaultConfig: { replicationLagBudgetMs: 1000 },
  summary: "A read-only copy kept in sync via replication",
  docs: "A read-only copy of a primary database, kept up to date via a replication stream rather than serving writes itself. Offloads read traffic from the primary, at the cost of `replicationLagBudgetMs` — however much staleness reads from it are allowed to tolerate. Needs a \"replication\"-kind edge in from a SQL or NoSQL Database, or it never receives any data.",
};

const objectStorage: ComponentDefinition<{ storageClass: "standard" | "infrequent-access" | "archive" }> = {
  id: "object-storage",
  category: "data",
  label: "Object Storage",
  icon: "archive",
  inputs: [{ id: "in", label: "Read/Write" }],
  outputs: [],
  configSchema: z.object({
    storageClass: z.enum(["standard", "infrequent-access", "archive"]),
  }),
  defaultConfig: { storageClass: "standard" },
  summary: "Durable storage for large, unstructured blobs",
  docs: "Stores files, images, backups, and other large binary blobs as opaque objects rather than structured rows — not queryable the way a database is, but far cheaper at scale. `storageClass` trades retrieval latency for cost.",
};

const searchEngine: ComponentDefinition<{ shards: number }> = {
  id: "search-engine",
  category: "data",
  label: "Search Engine",
  icon: "search",
  inputs: [{ id: "in", label: "Query/Index" }],
  outputs: [],
  configSchema: z.object({
    shards: z.number().int().min(1).max(100),
  }),
  defaultConfig: { shards: 1 },
  summary: "Indexed full-text and faceted search",
  docs: "A separately indexed store optimized for full-text search, filtering, and ranking — the kind of querying a relational database's indexes weren't built for. `shards` splits the index across nodes for scale.",
};

export const dataComponents: ComponentDefinition[] = [
  sqlDatabase,
  nosqlDatabase,
  readReplica,
  objectStorage,
  searchEngine,
];
