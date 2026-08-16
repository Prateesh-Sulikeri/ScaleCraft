import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Direct (unpooled) connection required — migrations use session-level
    // operations that pooled PgBouncer connections don't support.
    url: process.env.DATABASE_URL_UNPOOLED ?? "",
  },
});
