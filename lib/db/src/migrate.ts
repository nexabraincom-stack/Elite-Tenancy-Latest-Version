import { pool } from "./index";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { join, dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const MIGRATIONS = [
  "001_add_tenancy_tables.sql",
  "002_add_messaging.sql",
  "003_add_payments.sql",
];

export async function runMigrations(): Promise<void> {
  const client = await pool.connect();
  try {
    for (const file of MIGRATIONS) {
      const sql = readFileSync(join(__dirname, "migrations", file), "utf8");
      await client.query(sql);
    }
  } finally {
    client.release();
  }
}
