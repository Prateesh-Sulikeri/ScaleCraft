// Closes a bug report: sets its status and closing notes and starts the
// retention clocks. The screenshot is not deleted here - it has a 7-day grace
// window, and the nightly sweep drops it when that runs out.
//
// Run: node scripts/close-bug.mjs <bug-id> [--status closed|resolved] [--notes "..."]
//
// A fetch against POST /api/bugs/[id]/close rather than a direct Drizzle call:
// image-storage.ts sits behind @/ aliases with no tsx in the toolchain, and the
// real use case is closing a production report from a laptop anyway. Reads
// CRON_SECRET and SCALECRAFT_BASE_URL from .env.local, like dump-streak-days.mjs.
import { readFileSync } from "node:fs";

function env(name) {
  const file = readFileSync(".env.local", "utf8");
  return file
    .match(new RegExp(`^${name}=(.*)$`, "m"))?.[1]
    .trim()
    .replace(/^["']|["']$/g, "");
}

const [id, ...rest] = process.argv.slice(2);
if (!id) {
  console.error('Usage: node scripts/close-bug.mjs <bug-id> [--status closed|resolved] [--notes "..."]');
  process.exit(1);
}

const flag = (name) => {
  const i = rest.indexOf(`--${name}`);
  return i === -1 ? undefined : rest[i + 1];
};

const status = flag("status") ?? "closed";
if (status !== "closed" && status !== "resolved") {
  console.error(`--status must be "closed" or "resolved", got "${status}"`);
  process.exit(1);
}

const secret = env("CRON_SECRET");
if (!secret) throw new Error("CRON_SECRET not found in .env.local");
const baseUrl = env("SCALECRAFT_BASE_URL") || "http://localhost:3000";

const notes = flag("notes");
const res = await fetch(`${baseUrl}/api/bugs/${id}/close`, {
  method: "POST",
  headers: { authorization: `Bearer ${secret}`, "content-type": "application/json" },
  body: JSON.stringify({ status, ...(notes === undefined ? {} : { closingNotes: notes }) }),
});

const body = await res.json().catch(() => ({}));
if (!res.ok) {
  console.error(`${res.status} ${res.statusText}: ${body.error ?? "(no body)"}`);
  process.exit(1);
}

console.log(`${body.id} -> ${body.status} (closed at ${body.closedAt})`);
console.log(`Report will be deleted 15 days from now. The reporter is shown that date.`);
