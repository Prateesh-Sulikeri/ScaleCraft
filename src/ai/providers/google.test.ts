import { describe, it, expect, vi } from "vitest";
import { googleProvider } from "./google";

const okResponse = () =>
  new Response(
    JSON.stringify({ candidates: [{ content: { parts: [{ text: "hello" }] } }] }),
    { status: 200 },
  );

describe("googleProvider", () => {
  it("sends the expected request shape to the generateContent endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse());
    vi.stubGlobal("fetch", fetchMock);

    const result = await googleProvider.complete({
      apiKey: "my-key",
      model: "gemini-3-pro",
      system: "system prompt",
      user: "user prompt",
    });

    expect(result).toBe("hello");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro:generateContent?key=my-key",
    );
    const body = JSON.parse(init.body);
    expect(body.system_instruction).toEqual({ parts: [{ text: "system prompt" }] });
    expect(body.contents).toEqual([{ role: "user", parts: [{ text: "user prompt" }] }]);
  });

  it("maps a 401 response to an auth error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 401 })));

    await expect(
      googleProvider.complete({ apiKey: "bad", model: "m", system: "s", user: "u" }),
    ).rejects.toMatchObject({ kind: "auth" });
  });

  it("maps a 429 response to a rate-limit error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 429 })));

    await expect(
      googleProvider.complete({ apiKey: "k", model: "m", system: "s", user: "u" }),
    ).rejects.toMatchObject({ kind: "rate-limit" });
  });

  it("maps a thrown network error to a network error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    await expect(
      googleProvider.complete({ apiKey: "k", model: "m", system: "s", user: "u" }),
    ).rejects.toMatchObject({ kind: "network" });
  });

  it("maps a 400 API_KEY_INVALID body to an auth error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: { status: "UNAUTHENTICATED" } }), {
          status: 400,
        }),
      ),
    );

    await expect(
      googleProvider.complete({ apiKey: "bad", model: "m", system: "s", user: "u" }),
    ).rejects.toMatchObject({ kind: "auth" });
  });

  it("maps a non-JSON 200 response body to an unknown error instead of throwing raw", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("<html>not json</html>", { status: 200 })),
    );

    await expect(
      googleProvider.complete({ apiKey: "k", model: "m", system: "s", user: "u" }),
    ).rejects.toMatchObject({ kind: "unknown" });
  });
});
