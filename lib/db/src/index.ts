import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

// Warn loudly but do NOT throw at module scope — a module-level throw kills
// the entire serverless function before any request handler can run and return
// a meaningful error to the caller.  Routes that need the DB will fail at
// query time with a clear pg error instead.
if (!process.env.DATABASE_URL) {
  console.error(
    "[db] DATABASE_URL is not set — all database queries will fail. " +
    "Set the env var and redeploy.",
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? "",
  // Neon requires SSL; harmless on other Postgres providers
  ssl: process.env.DATABASE_URL?.includes("neon.tech") ||
       process.env.DATABASE_URL?.includes("sslmode=require")
    ? { rejectUnauthorized: false }
    : undefined,
});
export const db = drizzle(pool, { schema });

export * from "./schema";
