import { z } from "zod";
import type { ComponentDefinition } from "./types";

const client: ComponentDefinition<Record<string, never>> = {
  id: "client",
  category: "networking",
  label: "Client",
  icon: "monitor",
  inputs: [],
  outputs: [{ id: "out", label: "Request" }],
  configSchema: z.object({}),
  defaultConfig: {},
  summary: "Issues requests into the system",
  docs: "The end user's device or application issuing requests into the system.",
};

const browser: ComponentDefinition<{ honorsCacheControl: boolean }> = {
  id: "browser",
  category: "networking",
  label: "Browser",
  icon: "app-window",
  inputs: [],
  outputs: [{ id: "out", label: "Request" }],
  configSchema: z.object({
    honorsCacheControl: z.boolean(),
  }),
  defaultConfig: { honorsCacheControl: true },
  summary: "A web browser issuing HTTP requests",
  docs: "A specific kind of Client that runs in a web browser — unlike a generic Client, it honors HTTP caching headers (Cache-Control, ETag) and can serve a repeat request from its own local cache without touching the network at all.",
};

const dns: ComponentDefinition<{ recordType: "A" | "CNAME" | "ALIAS"; ttlSeconds: number }> = {
  id: "dns",
  category: "networking",
  label: "DNS",
  icon: "compass",
  inputs: [{ id: "in", label: "Lookup" }],
  outputs: [{ id: "out", label: "Resolved address" }],
  configSchema: z.object({
    recordType: z.enum(["A", "CNAME", "ALIAS"]),
    ttlSeconds: z.number().int().min(0).max(86400),
  }),
  defaultConfig: { recordType: "A", ttlSeconds: 300 },
  summary: "Resolves domain names to IP addresses",
  docs: "Translates a human-readable domain name into the address of the system to actually contact. `ttlSeconds` controls how long resolvers cache that answer — a low TTL enables fast failover (e.g. during a deploy) at the cost of more lookup traffic.",
};

const cdn: ComponentDefinition<{ cacheTtlSeconds: number; cacheDynamicContent: boolean }> = {
  id: "cdn",
  category: "networking",
  label: "CDN",
  icon: "globe",
  inputs: [{ id: "in", label: "Request" }],
  outputs: [{ id: "out", label: "Origin request" }],
  configSchema: z.object({
    cacheTtlSeconds: z.number().int().min(0).max(604800),
    cacheDynamicContent: z.boolean(),
  }),
  defaultConfig: { cacheTtlSeconds: 3600, cacheDynamicContent: false },
  summary: "Caches static content close to the client",
  docs: "A geographically distributed edge cache sitting between the client and your origin infrastructure. Serves cacheable content from a nearby edge node, only forwarding a request to the origin on a cache miss.",
};

const reverseProxy: ComponentDefinition<{ terminatesTls: boolean }> = {
  id: "reverse-proxy",
  category: "networking",
  label: "Reverse Proxy",
  icon: "arrow-left-right",
  inputs: [{ id: "in", label: "Request" }],
  outputs: [{ id: "out", label: "Forwarded request" }],
  configSchema: z.object({
    terminatesTls: z.boolean(),
  }),
  defaultConfig: { terminatesTls: true },
  summary: "Forwards client requests to backend services",
  docs: "Sits in front of one or more backend servers and forwards client requests to them, hiding backend topology and, when `terminatesTls` is on, handling TLS at the edge instead of on every backend instance.",
};

const apiGateway: ComponentDefinition<{ requiresAuth: boolean; rateLimitPerMinute: number }> = {
  id: "api-gateway",
  category: "networking",
  label: "API Gateway",
  icon: "door-open",
  inputs: [{ id: "in", label: "Request" }],
  outputs: [{ id: "out", label: "Routed request" }],
  configSchema: z.object({
    requiresAuth: z.boolean(),
    rateLimitPerMinute: z.number().int().min(1).max(100000),
  }),
  defaultConfig: { requiresAuth: true, rateLimitPerMinute: 600 },
  summary: "Single entry point for routing, auth, rate limits",
  docs: "A single entry point in front of one or more backend services — commonly handles authentication, request routing, and rate limiting in one place instead of duplicating that logic in every service behind it.",
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
  summary: "Distributes requests across instances",
  docs: "Distributes incoming requests across multiple downstream instances to avoid overloading any single one.",
};

const firewall: ComponentDefinition<{ defaultPolicy: "allow-all" | "deny-all" | "allow-listed" }> = {
  id: "firewall",
  category: "networking",
  label: "Firewall",
  icon: "shield",
  inputs: [{ id: "in", label: "Traffic" }],
  outputs: [{ id: "out", label: "Filtered traffic" }],
  configSchema: z.object({
    defaultPolicy: z.enum(["allow-all", "deny-all", "allow-listed"]),
  }),
  defaultConfig: { defaultPolicy: "allow-listed" },
  summary: "Filters traffic in or out by security rules",
  docs: "Inspects and filters traffic against a set of rules before it reaches whatever's behind it. A Firewall configured to allow everything through is present in the diagram but doing nothing — see `defaultPolicy`.",
};

export const networkingComponents: ComponentDefinition[] = [
  client,
  browser,
  dns,
  cdn,
  reverseProxy,
  apiGateway,
  loadBalancer,
  firewall,
];
