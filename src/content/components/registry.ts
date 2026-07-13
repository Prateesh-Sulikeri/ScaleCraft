import { z } from "zod";
import type { ComponentDefinition } from "./types";

/**
 * The global component registry. Every chapter references components from
 * here by id via `availableComponentIds` — components are never redefined
 * per chapter. This is intentionally a small seed set for the scaffold; real
 * chapter content will grow this list.
 */

const client: ComponentDefinition<Record<string, never>> = {
  id: "client",
  category: "networking",
  label: "Client",
  icon: "monitor",
  inputs: [],
  outputs: [{ id: "out", label: "Request" }],
  configSchema: z.object({}),
  defaultConfig: {},
  docs: "The end user's device or application issuing requests into the system.",
};

const loadBalancer: ComponentDefinition<{ algorithm: "round-robin" | "least-connections" }> = {
  id: "load-balancer",
  category: "networking",
  label: "Load Balancer",
  icon: "shuffle",
  inputs: [{ id: "in", label: "Incoming" }],
  outputs: [{ id: "out", label: "Distributed" }],
  configSchema: z.object({
    algorithm: z.enum(["round-robin", "least-connections"]),
  }),
  defaultConfig: { algorithm: "round-robin" },
  docs: "Distributes incoming requests across multiple downstream instances to avoid overloading any single one.",
};

const appServer: ComponentDefinition<{ instances: number }> = {
  id: "app-server",
  category: "compute",
  label: "Application Server",
  icon: "server",
  inputs: [{ id: "in", label: "Request" }],
  outputs: [{ id: "out", label: "Query" }],
  configSchema: z.object({
    instances: z.number().int().min(1).max(20),
  }),
  defaultConfig: { instances: 1 },
  docs: "Runs application logic: authentication, authorization, and business rules. Should mediate all access to the database — clients should never reach it directly.",
};

const sqlDatabase: ComponentDefinition<{ engine: "postgres" | "mysql" }> = {
  id: "sql-database",
  category: "data",
  label: "SQL Database",
  icon: "database",
  inputs: [{ id: "in", label: "Query" }],
  outputs: [],
  configSchema: z.object({
    engine: z.enum(["postgres", "mysql"]),
  }),
  defaultConfig: { engine: "postgres" },
  docs: "Durable, structured, relational storage. Exposing this directly to clients bypasses the application server's authentication, authorization, and business logic.",
};

export const componentRegistry: ComponentDefinition[] = [
  client,
  loadBalancer,
  appServer,
  sqlDatabase,
];

export function getComponent(id: string): ComponentDefinition | undefined {
  return componentRegistry.find((c) => c.id === id);
}
