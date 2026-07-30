import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ArchitectureGraph } from "@/lib/graph";
import type { DeepCheckContext } from "./prompt";
import { DEEP_CHECK_USER_TRIGGER } from "./prompt";
import { DEFAULT_AI_SETTINGS } from "./settings";
import { AiProviderError } from "./providers/types";

const completeMock = vi.fn();

vi.mock("./providers", async () => {
  const actual = await vi.importActual<typeof import("./providers")>("./providers");
  return {
    ...actual,
    getProvider: vi.fn(() => ({
      id: "anthropic",
      label: "Anthropic",
      defaultModel: "claude-opus-5",
      suggestedModels: [],
      complete: completeMock,
    })),
  };
});

const { runDeepCheck, testConnection } = await import("./run-deep-check");

const graph: ArchitectureGraph = {
  nodes: [{ id: "n1", componentId: "load-balancer", position: { x: 0, y: 0 }, config: {} }],
  edges: [],
  entryPointIds: [],
};

function baseCtx(): DeepCheckContext {
  return { graph, components: [], violations: [], passed: false };
}

const validCritique = { summary: "All good", sections: [], tradeoffs: [] };

describe("runDeepCheck", () => {
  beforeEach(() => {
    completeMock.mockReset();
  });

  it("happy path: calls the resolved adapter with the assembled prompts and returns an ok critique", async () => {
    completeMock.mockResolvedValue(JSON.stringify(validCritique));

    const result = await runDeepCheck(baseCtx(), DEFAULT_AI_SETTINGS);

    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.critique.summary).toBe("All good");
    }
    expect(completeMock).toHaveBeenCalledTimes(1);
    const [req] = completeMock.mock.calls[0];
    expect(req.system).toContain("Senior Staff Engineer");
    expect(req.user).toBe(DEEP_CHECK_USER_TRIGGER);
    expect(req.apiKey).toBe(DEFAULT_AI_SETTINGS.apiKey);
    expect(req.model).toBe(DEFAULT_AI_SETTINGS.model);
    expect(req.schema).toBeDefined();
  });

  it("maps an adapter auth failure to status:error with the provider-specific message, not a generic string", async () => {
    completeMock.mockRejectedValue(new AiProviderError("auth", "The API key was rejected."));

    const result = await runDeepCheck(baseCtx(), DEFAULT_AI_SETTINGS);

    expect(result).toEqual({ status: "error", kind: "auth", message: "The API key was rejected." });
  });

  it("returns status:error with no partial critique when the adapter returns malformed JSON", async () => {
    completeMock.mockResolvedValue("{not json");

    const result = await runDeepCheck(baseCtx(), DEFAULT_AI_SETTINGS);

    expect(result.status).toBe("error");
    expect(result).not.toHaveProperty("critique");
  });

  it("lets an aborted call propagate rather than forcing a result through", async () => {
    const abortError = new DOMException("aborted", "AbortError");
    completeMock.mockRejectedValue(abortError);

    await expect(runDeepCheck(baseCtx(), DEFAULT_AI_SETTINGS)).rejects.toBe(abortError);
  });

  it("threads the AbortSignal through to the adapter", async () => {
    completeMock.mockResolvedValue(JSON.stringify(validCritique));
    const controller = new AbortController();

    await runDeepCheck(baseCtx(), DEFAULT_AI_SETTINGS, controller.signal);

    expect(completeMock.mock.calls[0][0].signal).toBe(controller.signal);
  });
});

describe("testConnection", () => {
  beforeEach(() => {
    completeMock.mockReset();
  });

  it("returns ok on a successful round-trip", async () => {
    completeMock.mockResolvedValue("OK");

    const result = await testConnection(DEFAULT_AI_SETTINGS);

    expect(result).toEqual({ status: "ok" });
  });

  it("reuses the same error mapping as runDeepCheck on an auth failure", async () => {
    completeMock.mockRejectedValue(new AiProviderError("auth", "The API key was rejected."));

    const result = await testConnection(DEFAULT_AI_SETTINGS);

    expect(result).toEqual({ status: "error", kind: "auth", message: "The API key was rejected." });
  });
});
