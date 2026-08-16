// Applies drizzle/ migrations via the HTTP driver (drizzle-orm/neon-http),
// matching src/db/client.ts's runtime driver. `drizzle-kit migrate`'s
// websocket path is best-effort here - some networks (e.g. WSL2 without a
// working default route to Neon's IPv6 addresses) fail the websocket
// handshake even though HTTP works fine, so this sidesteps that.
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

const url = process.env.DATABASE_URL_UNPOOLED;
if (!url) {
  throw new Error("DATABASE_URL_UNPOOLED is not set");
}

const db = drizzle(neon(url));
await migrate(db, { migrationsFolder: "./drizzle" });
console.log("Migrations applied.");
