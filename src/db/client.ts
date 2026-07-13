import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

/**
 * Lazy by design: constructing this at module load time would crash the
 * whole app whenever DATABASE_URL isn't set, which is true for local dev
 * until a Neon project exists — see .claude/docs/OPEN_QUESTIONS.md. Only
 * throws when a caller actually tries to touch the database.
 */
let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (_db) return _db;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Cloud sync/persistence is unavailable until a Neon " +
        "project is provisioned — see .claude/docs/OPEN_QUESTIONS.md.",
    );
  }

  _db = drizzle(neon(url), { schema });
  return _db;
}
