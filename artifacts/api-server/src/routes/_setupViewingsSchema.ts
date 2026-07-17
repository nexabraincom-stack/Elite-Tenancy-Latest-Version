/**
 * TEMPORARY — one-time schema setup for the `viewings` table/enum.
 *
 * No DATABASE_URL is available in the environment building this feature to
 * run `drizzle-kit push` directly, so this applies the exact same schema via
 * a deployed endpoint instead (Vercel already has DATABASE_URL configured
 * for the running app).
 *
 * Gated by CRON_SECRET — the same env var and Authorization-header check
 * already used by the existing cron endpoints (automations.ts, rtr.ts) —
 * rather than a new hardcoded value. Idempotent: checks existence first and
 * no-ops if the table is already there. Strictly additive — only ever
 * creates, never alters or drops anything.
 *
 * DELETE THIS FILE (and its router.use() in routes/index.ts) once the
 * `viewings` table exists in every environment that needs it — preview
 * and production. It should not ship long-term.
 */
import { Router, type IRouter, type Request } from "express";
import { pool } from "@workspace/db";

const router: IRouter = Router();

function cronAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.header("authorization") === `Bearer ${secret}`;
}

router.post("/viewings/setup-schema", async (req, res): Promise<void> => {
  if (!cronAuthorized(req)) { res.status(401).json({ error: "Unauthorized" }); return; }

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
