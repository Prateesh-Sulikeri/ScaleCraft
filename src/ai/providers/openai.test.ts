import { describe, it, expect, vi } from "vitest";
import { openaiProvider } from "./openai";

describe("openaiProvider", () => {
  it("targets the OpenAI chat-completions endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ choices: [{ message: { content: "ok" } }] }), {
        status: 200,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await openaiProvider.complete({
      apiKey: "k",
      model: "gpt-5",
      system: "s",
      user: "u",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.openai.com/v1/chat/completions",
      expect.anything(),
    );
  });
});
