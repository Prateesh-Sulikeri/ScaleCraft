import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
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
});
