import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const runBugRetentionSweep = vi.fn();

vi.mock("@/bugs/retention", () => ({ runBugRetentionSweep }));

const request = (authorization?: string) =>
  new Request("https://scalecraft.test/api/cron/bug-retention", {
    headers: authorization ? { authorization } : {},
  });

beforeEach(() => {
  vi.stubEnv("CRON_SECRET", "s3cret-token");
  runBugRetentionSweep.mockReset();
});
afterEach(() => vi.unstubAllEnvs());

describe("GET /api/cron/bug-retention", () => {
  // The route deletes rows for every user, so an unauthenticated caller must
  // never reach the sweep - not merely be told off after it has run.
  it("refuses to sweep without the cron secret", async () => {
    const { GET } = await import("./route");
    expect((await GET(request())).status).toBe(401);
    expect((await GET(request("Bearer nope-wrong-token"))).status).toBe(401);
    expect(runBugRetentionSweep).not.toHaveBeenCalled();
  });

  it("runs the sweep and echoes what it deleted", async () => {
    const result = {
      clockStarted: 1,
      clockCleared: 0,
      imagesDeleted: 2,
      reportsPurged: 3,
      orphanImagesDeleted: 0,
    };
    runBugRetentionSweep.mockResolvedValue(result);

    const { GET } = await import("./route");
    const response = await GET(request("Bearer s3cret-token"));

    expect(response.status).toBe(200);
    // The whole output of this job is rows that no longer exist, so the counts
    // are the only visibility into it.
    await expect(response.json()).resolves.toEqual(result);
  });
});
