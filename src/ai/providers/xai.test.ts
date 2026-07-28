import { describe, it, expect, vi } from "vitest";
import { xaiProvider } from "./xai";

describe("xaiProvider", () => {
  it("targets the xAI chat-completions endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ choices: [{ message: { content: "ok" } }] }), {
        status: 200,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await xaiProvider.complete({
      apiKey: "k",
      model: "grok-4",
      system: "s",
      user: "u",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.x.ai/v1/chat/completions",
      expect.anything(),
    );
  });
});
