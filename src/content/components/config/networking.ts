import type { ComponentConfigSpec } from "../types";

export default [
  {
    id: "client",
    category: "networking",
    label: "Client",
    icon: "monitor",
    inputs: [],
    outputs: [{ id: "out", label: "Request" }],
    fields: [],
    summary: "Issues requests into the system",
    docs: "The end user's device or application issuing requests into the system.",
    // No `inputs` relations — there's no input port at all, by design (a
    // Client is always an origin, never a destination).
    relations: {
      outputs: { allowedCategories: ["networking", "compute"], allowedKinds: ["request-flow"] },
    },
  },
  {
    id: "browser",
    category: "networking",
    label: "Browser",
    icon: "app-window",
    inputs: [],
    outputs: [{ id: "out", label: "Request" }],
    fields: [
      { kind: "boolean", name: "honorsCacheControl", label: "Honors Cache Control", default: true },
    ],
    summary: "A web browser issuing HTTP requests",
    docs: "A specific kind of Client that runs in a web browser — unlike a generic Client, it honors HTTP caching headers (Cache-Control, ETag) and can serve a repeat request from its own local cache without touching the network at all.",
    relations: {
      outputs: { allowedCategories: ["networking", "compute"], allowedKinds: ["request-flow"] },
    },
  },
  {
    id: "dns",
    category: "networking",
    label: "DNS",
    icon: "compass",
    inputs: [{ id: "in", label: "Lookup" }],
    outputs: [{ id: "out", label: "Resolved address" }],
    fields: [
      {
        kind: "enum",
        name: "recordType",
        label: "Record Type",
        default: "A",
        options: ["A", "CNAME", "ALIAS"],
      },
      { kind: "number", name: "ttlSeconds", label: "Ttl Seconds", default: 300, min: 0, max: 86400, int: true },
    ],
    summary: "Resolves domain names to IP addresses",
    docs: "Translates a human-readable domain name into the address of the system to actually contact. `ttlSeconds` controls how long resolvers cache that answer — a low TTL enables fast failover (e.g. during a deploy) at the cost of more lookup traffic.",
    relations: {
      inputs: { allowedCategories: ["networking", "compute"], allowedKinds: ["request-flow"] },
      outputs: { allowedCategories: ["networking", "compute"], allowedKinds: ["request-flow"] },
    },
  },
  {
    id: "cdn",
    category: "networking",
    label: "CDN",
    icon: "globe",
    inputs: [{ id: "in", label: "Request" }],
    outputs: [{ id: "out", label: "Origin request" }],
    fields: [
      {
        kind: "number",
        name: "cacheTtlSeconds",
        label: "Cache Ttl Seconds",
        default: 3600,
        min: 0,
        max: 604800,
        int: true,
      },
      { kind: "boolean", name: "cacheDynamicContent", label: "Cache Dynamic Content", default: false },
    ],
    summary: "Caches static content close to the client",
    docs: "A geographically distributed edge cache sitting between the client and your origin infrastructure. Serves cacheable content from a nearby edge node, only forwarding a request to the origin on a cache miss.",
    relations: {
      inputs: { allowedCategories: ["networking"], allowedKinds: ["request-flow"] },
      outputs: { allowedCategories: ["networking", "compute"], allowedKinds: ["request-flow"] },
    },
  },
  {
    id: "reverse-proxy",
    category: "networking",
    label: "Reverse Proxy",
    icon: "arrow-left-right",
    inputs: [{ id: "in", label: "Request" }],
    outputs: [{ id: "out", label: "Forwarded request" }],
    fields: [{ kind: "boolean", name: "terminatesTls", label: "Terminates Tls", default: true }],
    summary: "Forwards client requests to backend services",
    docs: "Sits in front of one or more backend servers and forwards client requests to them, hiding backend topology and, when `terminatesTls` is on, handling TLS at the edge instead of on every backend instance.",
    relations: {
      inputs: { allowedCategories: ["networking"], allowedKinds: ["request-flow"] },
      outputs: { allowedCategories: ["networking", "compute"], allowedKinds: ["request-flow"] },
    },
  },
  {
    id: "api-gateway",
    category: "networking",
    label: "API Gateway",
    icon: "door-open",
    inputs: [{ id: "in", label: "Request" }],
    outputs: [{ id: "out", label: "Routed request" }],
    fields: [
      { kind: "boolean", name: "requiresAuth", label: "Requires Auth", default: true },
      {
        kind: "number",
        name: "rateLimitPerMinute",
        label: "Rate Limit Per Minute",
        default: 600,
        min: 1,
        max: 100000,
        int: true,
      },
    ],
    summary: "Single entry point for routing, auth, rate limits",
    docs: "A single entry point in front of one or more backend services — commonly handles authentication, request routing, and rate limiting in one place instead of duplicating that logic in every service behind it.",
    // Inputs must come from the client-facing networking tier, never from
    // compute — a Gateway with nothing but an outgoing edge (traffic
    // "entering" from nowhere) is exactly the reported live bug this
    // contract system exists to close structurally, not just this once.
    relations: {
      inputs: { allowedCategories: ["networking"], allowedKinds: ["request-flow"] },
      outputs: { allowedCategories: ["networking", "compute"], allowedKinds: ["request-flow"] },
    },
  },
  {
    id: "load-balancer",
    category: "networking",
    label: "Load Balancer",
    icon: "shuffle",
    inputs: [{ id: "in", label: "Incoming" }],
    outputs: [{ id: "out", label: "Distributed" }],
    fields: [
      {
        kind: "enum",
        name: "algorithm",
        label: "Algorithm",
        default: "round-robin",
        options: ["round-robin", "least-connections"],
      },
    ],
    summary: "Distributes requests across instances",
    docs: "Distributes incoming requests across multiple downstream instances to avoid overloading any single one.",
    docsFile: "/docs/load-balancer.md",
    // Inputs restricted to networking (never compute) and outputs
    // restricted to compute (never back to networking) — this is what
    // makes a Serverless Function/App Server feeding INTO a Load Balancer
    // (the reported backwards-flow bug) fail this component's own declared
    // contract, with no separate "ordering" rule needed.
    relations: {
      inputs: { allowedCategories: ["networking"], allowedKinds: ["request-flow"] },
      outputs: { allowedCategories: ["compute"], allowedKinds: ["request-flow"] },
    },
  },
  {
    id: "firewall",
    category: "networking",
    label: "Firewall",
    icon: "shield",
    inputs: [{ id: "in", label: "Traffic" }],
    outputs: [{ id: "out", label: "Filtered traffic" }],
    fields: [
      {
        kind: "enum",
        name: "defaultPolicy",
        label: "Default Policy",
        default: "allow-listed",
        options: ["allow-all", "deny-all", "allow-listed"],
      },
    ],
    summary: "Filters traffic in or out by security rules",
    docs: "Inspects and filters traffic against a set of rules before it reaches whatever's behind it. A Firewall configured to allow everything through is present in the diagram but doing nothing — see `defaultPolicy`.",
    relations: {
      inputs: { allowedCategories: ["networking"], allowedKinds: ["request-flow"] },
      outputs: { allowedCategories: ["networking", "compute"], allowedKinds: ["request-flow"] },
    },
  },
] satisfies ComponentConfigSpec[];
