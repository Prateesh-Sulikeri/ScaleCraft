import type { BugDetail, BugSummary, CreateBugInput } from "./types";

/**
 * Fetch wrappers for /api/bugs. Unlike streak-days.ts's fire-and-forget
 * posture, these throw on failure: every one of them backs a visible UI state
 * the user is waiting on, so a swallowed error would render as an empty list
 * or a form that silently did nothing.
 */

async function errorFrom(res: Response, fallback: string): Promise<Error> {
  try {
    const body = (await res.json()) as { error?: string };
    return new Error(body.error || fallback);
  } catch {
    return new Error(fallback);
  }
}

export async function fetchBugs(signal?: AbortSignal): Promise<BugSummary[]> {
  const res = await fetch("/api/bugs", { signal });
  if (!res.ok) throw await errorFrom(res, "Could not load your reported bugs.");
  const data = (await res.json()) as { bugs?: BugSummary[] };
  return data.bugs ?? [];
}

export async function fetchBug(id: string, signal?: AbortSignal): Promise<BugDetail> {
  const res = await fetch(`/api/bugs/${encodeURIComponent(id)}`, { signal });
  if (!res.ok) throw await errorFrom(res, "Could not load this bug.");
  const data = (await res.json()) as { bug: BugDetail };
  return data.bug;
}

export async function createBug(input: CreateBugInput): Promise<BugSummary> {
  const res = await fetch("/api/bugs", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw await errorFrom(res, "Could not submit your report.");
  const data = (await res.json()) as { bug: BugSummary };
  return data.bug;
}

/** The badge number. Its own tiny endpoint so a page can render the badge
 *  without paying for the list it has not opened. */
export async function fetchUnreadBugCount(signal?: AbortSignal): Promise<number> {
  const res = await fetch("/api/bugs/unread-count", { signal });
  if (!res.ok) throw await errorFrom(res, "Could not check for bug updates.");
  const data = (await res.json()) as { count?: number };
  return data.count ?? 0;
}

/** Acknowledges one report's status change and returns the user's remaining
 *  unread count, so the badge is corrected by the server rather than by a
 *  local decrement that can drift from it. */
export async function markBugSeen(id: string): Promise<number> {
  const res = await fetch(`/api/bugs/${encodeURIComponent(id)}/seen`, { method: "POST" });
  if (!res.ok) throw await errorFrom(res, "Could not mark this update as seen.");
  const data = (await res.json()) as { count?: number };
  return data.count ?? 0;
}

export function bugImageUrl(id: string): string {
  return `/api/bugs/${encodeURIComponent(id)}/image`;
}

/** Reads a picked file into the base64 the create endpoint expects. Strips the
 *  `data:<mime>;base64,` prefix FileReader adds - the API stores raw base64 so
 *  a future object-storage backend is handed bytes, not a data URL. */
export function readImageAsBase64(file: File): Promise<{ mimeType: string; dataBase64: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that image."));
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const comma = result.indexOf(",");
      if (comma === -1) {
        reject(new Error("Could not read that image."));
        return;
      }
      resolve({ mimeType: file.type, dataBase64: result.slice(comma + 1) });
    };
    reader.readAsDataURL(file);
  });
}
