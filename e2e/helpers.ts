import { expect, type APIRequestContext } from "@playwright/test";

/** Wipes curriculum-progress slugs straight on the server, so a spec never
 *  depends on what a previous run left behind. Shared by any spec that
 *  needs a clean slate for specific slugs before asserting on them. */
export async function resetSlugs(request: APIRequestContext, slugs: string[]) {
  for (const slug of slugs) {
    const res = await request.post("/api/sync/curriculum-progress", {
      data: { slug, manuallyCompletedAt: null, lastVisitedAt: null },
    });
    expect(res.status(), `reset ${slug}`).toBe(200);
  }
}
