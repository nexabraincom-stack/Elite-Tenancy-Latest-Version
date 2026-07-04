import { Router, type IRouter } from "express";
import { pool } from "@workspace/db";

const router: IRouter = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = ["tenant", "landlord", "agent"] as const;

// Pure informational waitlist capture for the US market — no live service is
// offered yet (no US entity/licensing), so this endpoint only ever stores an
// email + interest and never triggers any tenancy/listing/matching workflow.
router.post("/usa-waitlist", async (req, res): Promise<void> => {
  const { email, role, cityState } = req.body as {
    email?: string;
    role?: string;
    cityState?: string;
  };

  if (!email || !EMAIL_RE.test(email)) {
    res.status(400).json({ error: "A valid email address is required" });
    return;
  }
  if (role && !ROLES.includes(role as (typeof ROLES)[number])) {
    res.status(400).json({ error: "role must be tenant, landlord, or agent" });
    return;
  }

  await pool.query(
    `INSERT INTO usa_waitlist (email, role, city_state)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE
       SET role       = COALESCE(EXCLUDED.role, usa_waitlist.role),
           city_state = COALESCE(EXCLUDED.city_state, usa_waitlist.city_state)`,
    [email.toLowerCase().trim(), role ?? null, cityState?.trim() || null],
  );

  req.log.info({ email }, "USA waitlist signup");
  res.status(201).json({
    success: true,
    message: "You're on the list — we'll email you when Elite Tenancy launches in your area.",
  });
});

export default router;
