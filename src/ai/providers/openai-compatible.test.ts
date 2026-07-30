import { describe, it, expect, vi } from "vitest";
import { openaiCompatibleProvider } from "./openai-compatible";

describe("openaiCompatibleProvider", () => {
  it("uses the caller-supplied baseUrl for the request", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ choices: [{ message: { content: "ok" } }] }), {
        status: 200,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await openaiCompatibleProvider.complete({
      apiKey: "k",
      model: "local-model",
      system: "s",
      user: "u",
      baseUrl: "http://localhost:11434/v1",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:11434/v1/chat/completions",
      expect.anything(),
    );
  });

  it("rejects with an unknown-kind error when no baseUrl is supplied", async () => {
    await expect(
      openaiCompatibleProvider.complete({
        apiKey: "k",
        model: "m",
        system: "s",
        user: "u",
      }),
    ).rejects.toMatchObject({ kind: "unknown" });
  });
});
