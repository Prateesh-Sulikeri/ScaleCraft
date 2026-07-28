import { describe, it, expect, vi, beforeEach } from "vitest";
import { chatCompletionsComplete } from "./openai-compatible-fetch";

describe("chatCompletionsComplete", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("sends the expected request shape", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ choices: [{ message: { content: "hello" } }] }), {
        status: 200,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await chatCompletionsComplete({
      baseUrl: "https://api.example.com/v1",
      apiKey: "sk-test",
      model: "some-model",
      system: "system prompt",
      user: "user prompt",
    });

    expect(result).toBe("hello");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.example.com/v1/chat/completions");
    expect(init.headers["Authorization"]).toBe("Bearer sk-test");
    expect(init.headers["Content-Type"]).toBe("application/json");
    const body = JSON.parse(init.body);
    expect(body.model).toBe("some-model");
    expect(body.messages).toEqual([
      { role: "system", content: "system prompt" },
      { role: "user", content: "user prompt" },
    ]);
    expect(body.response_format).toEqual({ type: "json_object" });
  });

  it("maps a 401 response to an auth error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("{}", { status: 401 })),
    );

    await expect(
      chatCompletionsComplete({
        baseUrl: "https://api.example.com/v1",
        apiKey: "bad-key",
        model: "m",
        system: "s",
        user: "u",
      }),
    ).rejects.toMatchObject({ kind: "auth" });
  });

  it("maps a 429 response to a rate-limit error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("{}", { status: 429 })),
    );

    await expect(
      chatCompletionsComplete({
        baseUrl: "https://api.example.com/v1",
        apiKey: "k",
        model: "m",
        system: "s",
        user: "u",
      }),
    ).rejects.toMatchObject({ kind: "rate-limit" });
  });

  it("maps a thrown network error to a network error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    await expect(
      chatCompletionsComplete({
        baseUrl: "https://api.example.com/v1",
        apiKey: "k",
        model: "m",
        system: "s",
        user: "u",
      }),
    ).rejects.toMatchObject({ kind: "network" });
  });

  it("re-throws an AbortError unwrapped rather than mapping it", async () => {
    const abortError = new DOMException("aborted", "AbortError");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(abortError));

    await expect(
      chatCompletionsComplete({
        baseUrl: "https://api.example.com/v1",
        apiKey: "k",
        model: "m",
        system: "s",
        user: "u",
      }),
    ).rejects.toBe(abortError);
  });

  it("maps any other non-ok status to an unknown error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("{}", { status: 500 })),
    );

    await expect(
      chatCompletionsComplete({
        baseUrl: "https://api.example.com/v1",
        apiKey: "k",
        model: "m",
        system: "s",
        user: "u",
      }),
    ).rejects.toMatchObject({ kind: "unknown" });
  });
});
