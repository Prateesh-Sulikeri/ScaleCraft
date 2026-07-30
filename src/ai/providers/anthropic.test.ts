import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";

const createMock = vi.fn();
const parseMock = vi.fn();
let lastConstructedOpts: unknown;

vi.mock("@anthropic-ai/sdk", async () => {
  const actual = await vi.importActual<typeof import("@anthropic-ai/sdk")>("@anthropic-ai/sdk");
  class MockAnthropic {
    messages = { create: createMock, parse: parseMock };
    constructor(opts: unknown) {
      lastConstructedOpts = opts;
    }
  }
  return { ...actual, default: MockAnthropic };
});

const { anthropicProvider } = await import("./anthropic");
const {
  AuthenticationError,
  RateLimitError,
  APIConnectionError,
  APIUserAbortError,
} = await import("@anthropic-ai/sdk");

describe("anthropicProvider", () => {
  beforeEach(() => {
    createMock.mockReset();
    parseMock.mockReset();
    lastConstructedOpts = undefined;
  });

  it("constructs the client with dangerouslyAllowBrowser and the caller's key", async () => {
    createMock.mockResolvedValue({ content: [{ type: "text", text: "hi" }] });

    const result = await anthropicProvider.complete({
      apiKey: "sk-ant-test",
      model: "claude-opus-5",
      system: "s",
      user: "u",
    });

    expect(result).toBe("hi");
    expect(lastConstructedOpts).toMatchObject({
      apiKey: "sk-ant-test",
      dangerouslyAllowBrowser: true,
    });
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "claude-opus-5",
        max_tokens: 16000,
        system: "s",
        messages: [{ role: "user", content: "u" }],
      }),
      expect.anything(),
    );
  });

  it("joins multiple text blocks into one string", async () => {
    createMock.mockResolvedValue({
      content: [
        { type: "text", text: "hello " },
        { type: "text", text: "world" },
      ],
    });

    const result = await anthropicProvider.complete({
      apiKey: "k",
      model: "claude-opus-5",
      system: "s",
      user: "u",
    });

    expect(result).toBe("hello world");
  });

  it("uses messages.parse with a Zod output_config when a schema is supplied", async () => {
    parseMock.mockResolvedValue({ parsed_output: { ok: true } });
    const schema = z.object({ ok: z.boolean() });

    const result = await anthropicProvider.complete({
      apiKey: "k",
      model: "claude-opus-5",
      system: "s",
      user: "u",
      schema,
    });

    expect(result).toBe(JSON.stringify({ ok: true }));
    expect(parseMock).toHaveBeenCalledTimes(1);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("maps AuthenticationError to kind 'auth'", async () => {
    createMock.mockRejectedValue(
      new AuthenticationError(401, {}, "invalid key", new Headers(), "authentication_error"),
    );

    await expect(
      anthropicProvider.complete({ apiKey: "bad", model: "claude-opus-5", system: "s", user: "u" }),
    ).rejects.toMatchObject({ kind: "auth" });
  });

  it("maps RateLimitError to kind 'rate-limit'", async () => {
    createMock.mockRejectedValue(
      new RateLimitError(429, {}, "slow down", new Headers(), "rate_limit_error"),
    );

    await expect(
      anthropicProvider.complete({ apiKey: "k", model: "claude-opus-5", system: "s", user: "u" }),
    ).rejects.toMatchObject({ kind: "rate-limit" });
  });

  it("maps APIConnectionError to kind 'network'", async () => {
    createMock.mockRejectedValue(new APIConnectionError({ message: "offline" }));

    await expect(
      anthropicProvider.complete({ apiKey: "k", model: "claude-opus-5", system: "s", user: "u" }),
    ).rejects.toMatchObject({ kind: "network" });
  });

  it("maps an unrecognized thrown error to kind 'unknown'", async () => {
    createMock.mockRejectedValue(new Error("something else"));

    await expect(
      anthropicProvider.complete({ apiKey: "k", model: "claude-opus-5", system: "s", user: "u" }),
    ).rejects.toMatchObject({ kind: "unknown" });
  });

  it("re-throws an APIUserAbortError unwrapped", async () => {
    const abortError = new APIUserAbortError();
    createMock.mockRejectedValue(abortError);

    await expect(
      anthropicProvider.complete({ apiKey: "k", model: "claude-opus-5", system: "s", user: "u" }),
    ).rejects.toBe(abortError);
  });
});
