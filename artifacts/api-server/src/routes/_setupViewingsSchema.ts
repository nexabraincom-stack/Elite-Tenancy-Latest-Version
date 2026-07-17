/**
 * TEMPORARY — one-time schema setup for the `viewings` table/enum.
 *
 * No DATABASE_URL is available in the environment building this feature to
 * run `drizzle-kit push` directly, so this applies the exact same schema via
 * a deployed endpoint instead (Vercel already has DATABASE_URL configured
 * for the running app).
 *
 * Gated by VIEWINGS_SETUP_TOKEN — a dedicated, single-purpose env var set
 * just for this (not the existing CRON_SECRET, which is Production-only and
 * marked Sensitive/write-only in Vercel, so it can't be reused here).
 * Idempotent: checks existence first and no-ops if the table is already
 * there. Strictly additive — only ever creates, never alters or drops
 * anything.
 *
 * DELETE THIS FILE (and its router.use() in routes/index.ts) once the
 * `viewings` table exists in every environment that needs it — preview
 * and production. It should not ship long-term. Also safe to delete the
 * VIEWINGS_SETUP_TOKEN env var from Vercel at that point.
 */
import { Router, type IRouter, type Request } from "express";
import { pool } from "@workspace/db";

const router: IRouter = Router();

function setupAuthorized(req: Request): boolean {
  const token = process.env.VIEWINGS_SETUP_TOKEN;
  if (!token) return false;
  return req.header("authorization") === `Bearer ${token}`;
}

router.post("/viewings/setup-schema", async (req, res): Promise<void> => {
  if (!setupAuthorized(req)) { res.status(401).json({ error: "Unauthorized" }); return; }

  try {
    const exists = await pool.query(`SELECT to_regclass('public.viewings') AS reg`);
    if (exists.rows[0]?.reg) {
      res.json({ ok: true, alreadyExists: true });
      return;
    }

    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE viewing_status AS ENUM ('confirmed', 'cancelled', 'completed', 'no_show');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS viewings (
        id serial PRIMARY KEY,
        listing_id integer NOT NULL REFERENCES listings(id),
        lead_id integer REFERENCES leads(id),
        tenant_name text NOT NULL,
        tenant_email text NOT NULL,
        tenant_phone text,
        notes text,
        scheduled_at timestamptz NOT NULL,
        duration_minutes integer NOT NULL DEFAULT 30,
        status viewing_status NOT NULL DEFAULT 'confirmed',
        manage_token text NOT NULL UNIQUE,
        day_before_reminder_sent_at timestamp,
        same_day_reminder_sent_at timestamp,
        cancelled_at timestamp,
        cancelled_by text,
        completed_at timestamp,
        created_at timestamp NOT NULL DEFAULT now()
      );
    `);

    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS viewings_slot_unique_idx
        ON viewings (listing_id, scheduled_at)
        WHERE status = 'confirmed';
    `);

    res.json({ ok: true, created: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
