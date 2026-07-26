import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_DATABASE_URL = process.env.DATABASE_URL;

beforeEach(() => {
  vi.resetModules();
  delete process.env.DATABASE_URL;
});

afterEach(() => {
  if (ORIGINAL_DATABASE_URL === undefined) {
    delete process.env.DATABASE_URL;
  } else {
    process.env.DATABASE_URL = ORIGINAL_DATABASE_URL;
  }
  vi.doUnmock("drizzle-orm/neon-http");
  vi.doUnmock("@neondatabase/serverless");
});

describe("getDb", () => {
  it("throws a specific error when DATABASE_URL is not set", async () => {
    const { getDb } = await import("./client");
    expect(() => getDb()).toThrow(/DATABASE_URL is not set/);
  });

  it("lazily constructs and caches the drizzle client when DATABASE_URL is set", async () => {
    process.env.DATABASE_URL = "postgres://user:pass@example.neon.tech/db";

    const fakeNeonClient = { __fakeNeonClient: true };
    const fakeDbClient = { __fakeDbClient: true };
    const neonMock = vi.fn().mockReturnValue(fakeNeonClient);
    const drizzleMock = vi.fn().mockReturnValue(fakeDbClient);

    vi.doMock("@neondatabase/serverless", () => ({ neon: neonMock }));
    vi.doMock("drizzle-orm/neon-http", () => ({ drizzle: drizzleMock }));

    const { getDb } = await import("./client");

    const db1 = getDb();
    const db2 = getDb();

    expect(neonMock).toHaveBeenCalledWith("postgres://user:pass@example.neon.tech/db");
    expect(drizzleMock).toHaveBeenCalledTimes(1); // cached — constructed exactly once
    expect(drizzleMock).toHaveBeenCalledWith(fakeNeonClient, { schema: expect.anything() });
    expect(db1).toBe(db2); // same cached singleton instance
    expect(db1).toBe(fakeDbClient);
  });
});
