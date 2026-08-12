import "fake-indexeddb/auto";
import { describe, expect, it, vi } from "vitest";
import { db } from "./db";
import { listSessions, saveSession, deleteSession } from "./deepCheckSessions";
import type { AiCritique } from "@/ai/schema";

const critique: AiCritique = { summary: "s", sections: [], tradeoffs: [] };

describe("deepCheckSessions", () => {
  it("lists sessions for a saveId newest-first, excluding other saveIds", async () => {
    await db.deepCheckSessions.clear();
    await saveSession("sandbox", { ...critique, summary: "first" });
    await saveSession("sandbox", { ...critique, summary: "second" });
    await saveSession("chapter:other", { ...critique, summary: "unrelated" });

    const sessions = await listSessions("sandbox");

    expect(sessions.map((s) => s.critique.summary)).toEqual(["second", "first"]);
  });

  it("deletes a session by id", async () => {
    await db.deepCheckSessions.clear();
    await saveSession("sandbox", critique);
    const [saved] = await listSessions("sandbox");

    await deleteSession(saved);

    expect(await listSessions("sandbox")).toEqual([]);
  });

  it("retains only the newest 5 sessions per saveId, pruning on write", async () => {
    await db.deepCheckSessions.clear();
    const now = vi.spyOn(Date, "now");
    for (let i = 0; i < 7; i++) {
      now.mockReturnValueOnce(1000 + i);
      await saveSession("sandbox", { ...critique, summary: `session-${i}` });
    }
    now.mockRestore();

    const sessions = await listSessions("sandbox");

    expect(sessions.map((s) => s.critique.summary)).toEqual([
      "session-6",
      "session-5",
      "session-4",
      "session-3",
      "session-2",
    ]);
    expect(await db.deepCheckSessions.where("saveId").equals("sandbox").count()).toBe(5);
  });
});
