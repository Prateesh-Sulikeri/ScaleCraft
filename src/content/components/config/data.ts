import type { ComponentConfigSpec } from "../types";

export default [
  {
    id: "sql-database",
    category: "data",
    label: "SQL Database",
    icon: "database",
    inputs: [{ id: "in", label: "Query" }],
    // An output port so a "replication" edge can be drawn out to a Read
    // Replica — see orphan-read-replica.ts, which requires exactly this.
    outputs: [{ id: "out", label: "Replication" }],
    fields: [
      { kind: "enum", name: "engine", label: "Engine", default: "postgres", options: ["postgres", "mysql"] },
    ],
    summary: "Durable, structured relational storage",
    docs: "Durable, structured, relational storage. Exposing this directly to clients bypasses the application server's authentication, authorization, and business logic.",
  },
  {
    id: "nosql-database",
    category: "data",
    label: "NoSQL Database",
    icon: "layers",
    inputs: [{ id: "in", label: "Query" }],
    outputs: [{ id: "out", label: "Replication" }],
    fields: [
      {
        kind: "enum",
        name: "model",
        label: "Model",
        default: "document",
        options: ["key-value", "document", "wide-column", "graph"],
      },
    ],
    summary: "Flexible-schema storage for high-scale workloads",
    docs: "Non-relational storage that trades some of a SQL database's consistency and query flexibility for horizontal scalability and a flexible schema. `model` determines the actual data shape and access pattern — a key-value store and a graph database solve very different problems.",
  },
  {
    id: "read-replica",
    category: "data",
    label: "Read Replica",
    icon: "copy",
    inputs: [{ id: "in", label: "Replication" }],
    outputs: [{ id: "out", label: "Read query" }],
    fields: [
      {
        kind: "number",
        name: "replicationLagBudgetMs",
        label: "Replication Lag Budget Ms",
        default: 1000,
        min: 0,
        max: 60000,
        int: true,
      },
    ],
    summary: "A read-only copy kept in sync via replication",
    docs: 'A read-only copy of a primary database, kept up to date via a replication stream rather than serving writes itself. Offloads read traffic from the primary, at the cost of `replicationLagBudgetMs` — however much staleness reads from it are allowed to tolerate. Needs a "replication"-kind edge in from a SQL or NoSQL Database, or it never receives any data.',
  },
  {
    id: "object-storage",
    category: "data",
    label: "Object Storage",
    icon: "archive",
    inputs: [{ id: "in", label: "Read/Write" }],
    outputs: [],
    fields: [
      {
        kind: "enum",
        name: "storageClass",
        label: "Storage Class",
        default: "standard",
        options: ["standard", "infrequent-access", "archive"],
      },
    ],
    summary: "Durable storage for large, unstructured blobs",
    docs: "Stores files, images, backups, and other large binary blobs as opaque objects rather than structured rows — not queryable the way a database is, but far cheaper at scale. `storageClass` trades retrieval latency for cost.",
  },
  {
    id: "search-engine",
    category: "data",
    label: "Search Engine",
    icon: "search",
    inputs: [{ id: "in", label: "Query/Index" }],
    outputs: [],
    fields: [{ kind: "number", name: "shards", label: "Shards", default: 1, min: 1, max: 100, int: true }],
    summary: "Indexed full-text and faceted search",
    docs: "A separately indexed store optimized for full-text search, filtering, and ranking — the kind of querying a relational database's indexes weren't built for. `shards` splits the index across nodes for scale.",
  },
] satisfies ComponentConfigSpec[];
