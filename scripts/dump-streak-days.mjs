// Prints the day set stored in each Clerk user's publicMetadata.streakDays.
// Run: node scripts/dump-streak-days.mjs
import { readFileSync } from "node:fs";

const env = readFileSync(".env.local", "utf8");
const sk = env.match(/^CLERK_SECRET_KEY=(.*)$/m)?.[1].trim().replace(/^["']|["']$/g, "");
if (!sk) throw new Error("CLERK_SECRET_KEY not found in .env.local");

const res = await fetch("https://api.clerk.com/v1/users?limit=50", {
  headers: { Authorization: `Bearer ${sk}` },
});
const users = await res.json();

for (const u of users) {
  const sd = u.public_metadata?.streakDays;
  const email = u.email_addresses?.[0]?.email_address ?? u.id;
  if (!sd) {
    console.log(`${email}: no streakDays stored`);
    continue;
  }
  const bytes = Buffer.from(sd.bits, "base64");
  const days = [];
  for (let i = 0; i < bytes.length * 8; i++) {
    if (bytes[i >> 3] & (1 << (i & 7))) days.push(sd.base + i);
  }
  console.log(`${email}: ${days.length} day(s)`);
  for (const d of days) {
    console.log(`   ${d}  ${new Date(d * 86_400_000).toISOString().slice(0, 10)}`);
  }
}
