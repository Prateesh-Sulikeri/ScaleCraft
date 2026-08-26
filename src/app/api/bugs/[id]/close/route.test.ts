import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const returning = vi.fn();
type Written = { status: string; closedAt: Date; closingNotes?: string | null };
const set = vi.fn<(values: Written) => { where: () => { returning: typeof returning } }>(() => ({
  where: () => ({ returning }),
}));
const update = vi.fn(() => ({ set }));

vi.mock("@/db/client", () => ({ getDb: () => ({ update }) }));

function request(body: unknown, authorization = "Bearer s3cret-token") {
  return new Request("https://scalecraft.test/api/bugs/bug-1/close", {
    method: "POST",
    headers: { authorization, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const params = Promise.resolve({ id: "bug-1" });

beforeEach(() => {
  vi.stubEnv("CRON_SECRET", "s3cret-token");
  returning.mockReset().mockResolvedValue([{ id: "bug-1" }]);
  set.mockClear();
  update.mockClear();
});
afterEach(() => vi.unstubAllEnvs());

describe("POST /api/bugs/[id]/close", () => {
  it("closes the report and starts the retention clocks", async () => {
    const { POST } = await import("./route");
    const response = await POST(request({ status: "closed", closingNotes: "Fixed in 7.2.0." }), {
      params,
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      id: "bug-1",
      status: "closed",
      closedAt: expect.any(String),
    });

    const written = set.mock.calls[0]![0];
    expect(written).toMatchObject({ status: "closed", closingNotes: "Fixed in 7.2.0." });
    // Starting the clock here is what makes the deletion date the reporter is
    // shown exact rather than "sometime after the next sweep".
    expect(written.closedAt).toBeInstanceOf(Date);
    // Untouched on purpose: seenStatus left behind the new status is what
    // raises the reporter's unread badge.
    expect(written).not.toHaveProperty("seenStatus");
  });

  // The screenshot has a 7-day grace window, so there is nothing to delete in
  // this request. One code path does the deleting - the nightly sweep - which
  // has to handle a hand-SQL close correctly anyway.
  it("deletes nothing itself", async () => {
    const retention = await import("@/bugs/retention");
    expect(retention).not.toHaveProperty("deleteReportImage");

    const { POST } = await import("./route");
    const response = await POST(request({ status: "closed" }), { params });
    expect(await response.json()).toEqual({
      id: "bug-1",
      status: "closed",
      closedAt: expect.any(String),
    });
  });

  it("leaves existing closing notes alone when the body omits them", async () => {
    const { POST } = await import("./route");
    await POST(request({ status: "resolved" }), { params });
    expect(set.mock.calls[0]![0]).not.toHaveProperty("closingNotes");
  });

  it("requires the author token, and touches nothing without it", async () => {
    const { POST } = await import("./route");
    const response = await POST(request({ status: "closed" }, "Bearer wrong-token-here"), {
      params,
    });
    expect(response.status).toBe(401);
    expect(update).not.toHaveBeenCalled();
  });

  // Only the two terminal statuses: this route exists to finish a report, and
  // reopening one is a plain UPDATE the sweep's unstamp step picks up.
  it("rejects a non-terminal status", async () => {
    const { POST } = await import("./route");
    for (const status of ["open", "in-progress", "deleted"]) {
      const response = await POST(request({ status }), { params });
      expect(response.status, status).toBe(400);
    }
    expect(update).not.toHaveBeenCalled();
  });

  it("404s on an id that matched no row", async () => {
    returning.mockResolvedValue([]);
    const { POST } = await import("./route");
    const response = await POST(request({ status: "closed" }), { params });
    expect(response.status).toBe(404);
  });
});
