import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";
import { chatCompletionsComplete } from "./openai-compatible-fetch";

const testSchema = z.object({ summary: z.string() });

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

  it("maps a non-JSON 200 response body to an unknown error instead of throwing raw", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("<html>not json</html>", { status: 200 })),
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

  it("strips a trailing slash from baseUrl so the request URL has no double slash", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ choices: [{ message: { content: "ok" } }] }), {
        status: 200,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await chatCompletionsComplete({
      baseUrl: "https://api.example.com/v1/",
      apiKey: "k",
      model: "m",
      system: "s",
      user: "u",
    });

    expect(fetchMock.mock.calls[0][0]).toBe("https://api.example.com/v1/chat/completions");
  });

  it("maps a 400 with xAI's bare-string bad-key body to kind 'auth' (confirmed against the real xAI API)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ code: "invalid-argument", error: "Incorrect API key provided." }),
          { status: 400 },
        ),
      ),
    );

    await expect(
      chatCompletionsComplete({ baseUrl: "https://api.x.ai/v1", apiKey: "bad", model: "m", system: "s", user: "u" }),
    ).rejects.toMatchObject({ kind: "auth", message: "Incorrect API key provided." });
  });

  it("maps a 400 with OpenAI's nested-object bad-key body to kind 'auth'", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ error: { message: "Incorrect API key provided: sk-***.", type: "invalid_request_error" } }),
          { status: 400 },
        ),
      ),
    );

    await expect(
      chatCompletionsComplete({ baseUrl: "https://api.example.com/v1", apiKey: "bad", model: "m", system: "s", user: "u" }),
    ).rejects.toMatchObject({ kind: "auth" });
  });

  it("leaves a 400 with an unrelated message as kind 'unknown', not auth", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "model 'nonexistent' does not exist" }), { status: 400 }),
      ),
    );

    await expect(
      chatCompletionsComplete({ baseUrl: "https://api.example.com/v1", apiKey: "k", model: "m", system: "s", user: "u" }),
    ).rejects.toMatchObject({ kind: "unknown" });
  });

  it("sends a strict json_schema response_format when a schema is provided, derived from the Zod schema", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ choices: [{ message: { content: "{}" } }] }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await chatCompletionsComplete({
      baseUrl: "https://api.example.com/v1",
      apiKey: "k",
      model: "m",
      system: "s",
      user: "u",
      schema: testSchema,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.response_format.type).toBe("json_schema");
    expect(body.response_format.json_schema.strict).toBe(true);
    expect(body.response_format.json_schema.schema).toMatchObject({
      type: "object",
      properties: { summary: { type: "string" } },
    });
    // The $schema key is a JSON-Schema-tooling artifact, not something a
    // provider's response_format body expects — must be dropped.
    expect(body.response_format.json_schema.schema).not.toHaveProperty("$schema");
  });

  it("falls back to json_object mode and retries once when strict json_schema mode is rejected with a non-auth error", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: "response_format not supported" }), { status: 400 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ choices: [{ message: { content: "recovered" } }] }), { status: 200 }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const result = await chatCompletionsComplete({
      baseUrl: "https://api.example.com/v1",
      apiKey: "k",
      model: "m",
      system: "s",
      user: "u",
      schema: testSchema,
    });

    expect(result).toBe("recovered");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const secondBody = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(secondBody.response_format).toEqual({ type: "json_object" });
  });

  it("does not retry when the schema-mode attempt fails with an auth error — a bad key won't be fixed by dropping the schema", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 401 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      chatCompletionsComplete({
        baseUrl: "https://api.example.com/v1",
        apiKey: "bad",
        model: "m",
        system: "s",
        user: "u",
        schema: testSchema,
      }),
    ).rejects.toMatchObject({ kind: "auth" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
