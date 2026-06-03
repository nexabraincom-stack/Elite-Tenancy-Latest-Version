import { Router, type IRouter } from "express";
import https from "node:https";

/**
 * Companies House verification — anti-scam landlord/company check.
 *
 * Uses the FREE official Companies House Public Data API
 * (https://developer.company-information.service.gov.uk). No per-search fee;
 * 600 requests / 5 min. Data returned is already public.
 *
 * Env: COMPANIES_HOUSE_API_KEY  (free key from the CH developer portal)
 *
 * Public endpoint, rate-limited in app.ts (aiLimiter on /api/verify).
 */

const CH_HOST = "api.company-information.service.gov.uk";
const router: IRouter = Router();

interface ChResult { status: number; body: string; }

function chGet(path: string, apiKey: string): Promise<ChResult> {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${apiKey}:`).toString("base64");
    const req = https.request(
      { hostname: CH_HOST, path, method: "GET", headers: { Authorization: `Basic ${auth}` } },
      (res) => {
        let d = "";
        res.on("data", (c: Buffer) => (d += c.toString()));
        res.on("end", () => resolve({ status: res.statusCode ?? 0, body: d }));
      },
    );
    req.on("error", reject);
    req.setTimeout(10_000, () => req.destroy(new Error("Companies House timed out")));
    req.end();
  });
}

router.get("/verify/company/:number", async (req, res): Promise<void> => {
  const apiKey = process.env.COMPANIES_HOUSE_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "Company verification is not configured yet." });
    return;
  }
  const number = String(req.params.number || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!number || number.length < 6 || number.length > 8) {
    res.status(400).json({ error: "Enter a valid 8-character company number (e.g. 12345678)." });
    return;
  }

  try {
    const profile = await chGet(`/company/${number}`, apiKey);
    if (profile.status === 404) {
      res.status(404).json({ found: false, message: "No company found with that number." });
      return;
    }
    if (profile.status === 401) {
      res.status(503).json({ error: "Verification service key invalid." });
      return;
    }
    if (profile.status < 200 || profile.status >= 300) {
      res.status(502).json({ error: `Companies House error ${profile.status}` });
      return;
    }
    const p = JSON.parse(profile.body) as {
      company_name?: string; company_status?: string; type?: string;
      date_of_creation?: string; registered_office_address?: Record<string, string>;
    };

    // Officers (directors) — best-effort
    let officers: Array<{ name: string; role: string; appointedOn?: string }> = [];
    try {
      const off = await chGet(`/company/${number}/officers?items_per_page=20`, apiKey);
      if (off.status >= 200 && off.status < 300) {
        const od = JSON.parse(off.body) as { items?: Array<{ name?: string; officer_role?: string; appointed_on?: string; resigned_on?: string }> };
        officers = (od.items ?? [])
          .filter((o) => !o.resigned_on)
          .map((o) => ({ name: o.name ?? "—", role: o.officer_role ?? "officer", appointedOn: o.appointed_on }));
      }
    } catch { /* officers optional */ }

    const addr = p.registered_office_address ?? {};
    const addressLine = [addr.address_line_1, addr.address_line_2, addr.locality, addr.postal_code, addr.country]
      .filter(Boolean).join(", ");

    res.json({
      found: true,
      companyNumber: number,
      name: p.company_name ?? "—",
      status: p.company_status ?? "unknown",
      active: p.company_status === "active",
      type: p.type ?? "—",
      incorporatedOn: p.date_of_creation ?? null,
      address: addressLine || "—",
      officers,
    });
  } catch (err) {
    req.log.error({ err }, "Companies House verification failed");
    res.status(502).json({ error: "Verification temporarily unavailable. Please try again." });
  }
});

export default router;
