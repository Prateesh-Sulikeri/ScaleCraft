import { z } from "zod";
import type { ComponentDefinition } from "./types";

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
  summary: "Runs business logic and enforces access control",
  docs: "Runs application logic: authentication, authorization, and business rules. Should mediate all access to the database — clients should never reach it directly.",
};

const worker: ComponentDefinition<{ concurrency: number }> = {
  id: "worker",
  category: "compute",
  label: "Worker",
  icon: "cog",
  inputs: [{ id: "in", label: "Job" }],
  outputs: [{ id: "out", label: "Result" }],
  configSchema: z.object({
    concurrency: z.number().int().min(1).max(100),
  }),
  defaultConfig: { concurrency: 4 },
  summary: "Processes jobs asynchronously, off the request path",
  docs: "Pulls jobs off a queue and processes them outside the synchronous request/response cycle — the pattern that keeps slow work (sending email, resizing images, generating reports) from blocking a client's request.",
};

const cronJob: ComponentDefinition<{ scheduleIntervalMinutes: number }> = {
  id: "cron-job",
  category: "compute",
  label: "Cron Job",
  icon: "timer",
  inputs: [],
  outputs: [{ id: "out", label: "Triggered job" }],
  configSchema: z.object({
    scheduleIntervalMinutes: z.number().int().min(1).max(10080),
  }),
  defaultConfig: { scheduleIntervalMinutes: 60 },
  summary: "Runs on a fixed schedule, not on request",
  docs: "Triggers work on a fixed schedule rather than in response to an incoming request — nightly batch jobs, periodic cleanup, scheduled reports. Has no inbound edge for the same reason: nothing in the architecture calls it, a scheduler does.",
};

const serverlessFunction: ComponentDefinition<{ maxConcurrency: number; timeoutSeconds: number }> = {
  id: "serverless-function",
  category: "compute",
  label: "Serverless Function",
  icon: "zap",
  inputs: [{ id: "in", label: "Event" }],
  outputs: [{ id: "out", label: "Result" }],
  configSchema: z.object({
    maxConcurrency: z.number().int().min(1).max(10000),
    timeoutSeconds: z.number().int().min(1).max(900),
  }),
  defaultConfig: { maxConcurrency: 50, timeoutSeconds: 30 },
  summary: "Event-triggered compute that scales to zero",
  docs: "Short-lived compute that runs only in response to a triggering event and scales down to zero when idle — no capacity to provision or pay for between invocations, at the cost of cold-start latency and a hard `timeoutSeconds`.",
};

export const computeComponents: ComponentDefinition[] = [appServer, worker, cronJob, serverlessFunction];
