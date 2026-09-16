import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { requireAuthorToken } from "./author-auth";

const request = (authorization?: string) =>
  new Request("https://scalecraft.test/api/cron/bug-retention", {
    headers: authorization ? { authorization } : {},
  });

beforeEach(() => vi.stubEnv("CRON_SECRET", "s3cret-token"));
afterEach(() => vi.unstubAllEnvs());

describe("requireAuthorToken", () => {
  it("admits a correct bearer token", () => {
    expect(requireAuthorToken(request("Bearer s3cret-token"))).toBeNull();
  });

  it("rejects a wrong token, a missing header, and a bare token", async () => {
    for (const header of [undefined, "Bearer wrong-token", "s3cret-token", "Basic s3cret-token"]) {
      const response = requireAuthorToken(request(header));
      expect(response?.status, `header: ${header}`).toBe(401);
    }
  });

  // The routes behind this guard delete rows, so an unconfigured deployment has
  // to be closed rather than open. Fails as 503 rather than 401 because the
  // fault is the server's, not the caller's.
  it("fails closed when CRON_SECRET is unset, even for an empty bearer", () => {
    vi.stubEnv("CRON_SECRET", "");
    expect(requireAuthorToken(request("Bearer "))?.status).toBe(503);
    expect(requireAuthorToken(request())?.status).toBe(503);
  });

  // timingSafeEqual throws on a length mismatch instead of returning false, so
  // a short or long token must be caught before it reaches the comparison.
  it("rejects tokens of the wrong length without throwing", () => {
    expect(requireAuthorToken(request("Bearer s3cret"))?.status).toBe(401);
    expect(requireAuthorToken(request("Bearer s3cret-token-plus-more"))?.status).toBe(401);
  });
});
