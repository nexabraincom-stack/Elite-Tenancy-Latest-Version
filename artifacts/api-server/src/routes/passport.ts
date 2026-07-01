import { Router, type IRouter } from "express";
import https from "node:https";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { db, renterPassportsTable, listingsTable } from "@workspace/db";
import { and, eq, lte, gte, desc, ilike } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/requireAuth";
import {
  isEmailConfigured,
  sendEmail,
  getAdminEmail,
  adminLeadEmail,
} from "../lib/email";
import { aiChat, isAIConfigured } from "../lib/ai";

/**
 * Play ④ — Two-way AI matching ("Renter Passport").
 *
 * Tenants build a passport → AI writes a landlord-facing persona + readiness
 * score, the passport is stored, and we return their best-matching live homes.
 * Landlords/admins get an AI-ranked pool of prospective tenants.
 *
 * Public submit is rate-limited in app.ts (aiLimiter on /api/passport).
 */

const AI_GATEWAY_BASE = "https://ai-gateway.vercel.sh/v1";
const GATEWAY_MODEL = "meta/llama-4-maverick";

const router: IRouter = Router();

interface PassportInput {
  name: string;
  email: string;
  phone: string | null;
  city: string;
  minBudget: number | null;
  maxBudget: number;
  bedrooms: number | null;
  moveInDate: string | null;
  occupants: string | null;
  employment: string | null;
  petsOwner: boolean;
  about: string | null;
  photoUrl: string | null;
}

// Only accept URLs actually issued by our own Vercel Blob store — this is a
// public, unauthenticated endpoint, so a free-text URL field would let anyone
// point the board at arbitrary off-site content.
const BLOB_URL_RE = /^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\//i;

function asStr(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
}
function asNum(v: unknown): number | null {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

/** Manual validation (api-server has no direct zod dependency). */
function validatePassport(b: Record<string, unknown>): { ok: true; data: PassportInput } | { ok: false; error: string } {
  const name = asStr(b?.name, 120);
  const email = asStr(b?.email, 160);
  const city = asStr(b?.city, 80);
  const maxBudget = asNum(b?.maxBudget);
  if (!name) return { ok: false, error: "Name is required" };
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: "A valid email is required" };
  if (!city) return { ok: false, error: "Preferred city is required" };
  if (!maxBudget || maxBudget <= 0) return { ok: false, error: "Max budget is required" };
  const bedroomsRaw = asNum(b?.bedrooms);
  const photoUrlRaw = asStr(b?.photoUrl, 500);
  return {
    ok: true,
    data: {
      name,
      email,
      city,
      maxBudget,
      phone: asStr(b?.phone, 40),
      minBudget: asNum(b?.minBudget),
      bedrooms: bedroomsRaw != null && bedroomsRaw >= 0 && bedroomsRaw <= 10 ? bedroomsRaw : null,
      moveInDate: asStr(b?.moveInDate, 60),
      occupants: asStr(b?.occupants, 120),
      employment: asStr(b?.employment, 160),
      petsOwner: b?.petsOwner === true || b?.petsOwner === "true",
      about: asStr(b?.about, 1200),
      photoUrl: photoUrlRaw && BLOB_URL_RE.test(photoUrlRaw) ? photoUrlRaw : null,
    },
  };
}

interface HttpResult { statusCode: number; body: string; }

function httpsPost(url: string, headers: Record<string, string>, payload: string): Promise<HttpResult> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request(
      { hostname: parsed.hostname, path: parsed.pathname + parsed.search, method: "POST", headers: { ...headers, "Content-Length": Buffer.byteLength(payload) } },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c: Buffer) => chunks.push(c));
        res.on("end", () => resolve({ statusCode: res.statusCode ?? 0, body: Buffer.concat(chunks).toString("utf8") }));
      },
    );
    req.on("error", reject);
    req.setTimeout(15_000, () => req.destroy(new Error("AI request timed out")));
    req.write(payload);
    req.end();
  });
}

/** Best-effort AI persona + readiness score. Falls back to a heuristic if AI is unavailable. */
async function buildPersona(p: PassportInput): Promise<{ persona: string; score: number }> {
  // Heuristic fallback score from profile completeness/strength.
  const heuristic = (): { persona: string; score: number } => {
    let s = 55;
    if (p.employment) s += 12;
    if (p.about && p.about.length > 40) s += 10;
    if (p.moveInDate) s += 6;
    if (p.occupants) s += 5;
    if (p.minBudget) s += 4;
    if (!p.petsOwner) s += 3;
    s = Math.min(96, s);
    const persona = `${p.name} is looking in ${p.city} with a budget up to £${p.maxBudget}/month${p.moveInDate ? `, ready to move ${p.moveInDate}` : ""}. ${p.employment ? p.employment + ". " : ""}${p.about ? p.about.slice(0, 160) : "Keen, responsive applicant."}`.trim();
    return { persona, score: s };
  };

  if (!isAIConfigured()) return heuristic();

  const prompt = `You are an expert UK lettings agent at Elite Tenancy. Write a concise, warm LANDLORD-FACING summary of this prospective tenant and rate how strong/ready an applicant they are.

Tenant:
${JSON.stringify(p, null, 2)}

Respond ONLY with valid JSON (no markdown):
{"persona":"<2 sentences, max 240 chars, professional and positive but honest>","score":<0-100 integer readiness/strength>}`;

  try {
    const content = (await aiChat([{ role: "user", content: prompt }], { maxTokens: 400, temperature: 0.4 }))
      .replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    const parsed = JSON.parse(content) as { persona?: string; score?: number };
    const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score))));
    if (parsed.persona && Number.isFinite(score)) return { persona: parsed.persona.slice(0, 280), score };
    return heuristic();
  } catch {
    return heuristic();
  }
}

// ── Public: client-upload token for a passport photo ─────────────────────────
// Standard @vercel/blob client-upload flow: the browser uploads the file
// directly to Blob storage using a short-lived token minted here, so the
// image never passes through this server. Requires BLOB_READ_WRITE_TOKEN to
// be set (auto-populated once Blob storage is connected in the Vercel
// project's Storage tab).
router.post("/passport/photo-upload", async (req, res): Promise<void> => {
  try {
    const jsonResponse = await handleUpload({
      body: req.body as HandleUploadBody,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
        addRandomSuffix: true,
        maximumSizeInBytes: 5 * 1024 * 1024,
      }),
      onUploadCompleted: async () => {},
    });
    res.json(jsonResponse);
  } catch (err) {
    req.log.error({ err }, "Passport photo upload token failed");
    res.status(400).json({ error: err instanceof Error ? err.message : "Upload failed" });
  }
});

// ── Public: submit a Renter Passport ─────────────────────────────────────────
router.post("/passport", async (req, res): Promise<void> => {
  const v = validatePassport((req.body ?? {}) as Record<string, unknown>);
  if (!v.ok) {
    res.status(400).json({ error: v.error });
    return;
  }
  const p = v.data;

  const { persona, score } = await buildPersona(p);

  let row;
  try {
    [row] = await db
      .insert(renterPassportsTable)
      .values({
        name: p.name,
        email: p.email,
        phone: p.phone ?? null,
        city: p.city,
        minBudget: p.minBudget ?? null,
        maxBudget: p.maxBudget,
        bedrooms: p.bedrooms ?? null,
        moveInDate: p.moveInDate ?? null,
        occupants: p.occupants ?? null,
        employment: p.employment ?? null,
        petsOwner: Boolean(p.petsOwner),
        about: p.about ?? null,
        photoUrl: p.photoUrl ?? null,
        aiPersona: persona,
        aiScore: score,
        status: "new",
      })
      .returning();
  } catch (err) {
    req.log.error({ err }, "Failed to save renter passport");
    res.status(500).json({ error: "Could not save your passport. Please try again." });
    return;
  }

  // Fire admin email alert (non-blocking)
  if (isEmailConfigured()) {
    const mail = adminLeadEmail({
      name: p.name,
      email: p.email,
      phone: p.phone ?? null,
      message: `Renter Passport — ${p.city}, up to £${p.maxBudget}/mo${p.bedrooms != null ? `, ${p.bedrooms} bed` : ""}. Readiness ${score}/100. ${persona}`,
      source: "renter-passport",
      listingTitle: null,
    });
    sendEmail({ to: getAdminEmail(), subject: mail.subject, html: mail.html, replyTo: p.email }).catch(() => {});
  }

  // Instant matching homes (simple, cost-free DB ranking — no per-listing AI)
  const conds = [eq(listingsTable.status, "active"), lte(listingsTable.price, p.maxBudget)];
  if (p.minBudget) conds.push(gte(listingsTable.price, p.minBudget));
  if (p.city) conds.push(ilike(listingsTable.city, `%${p.city}%`));
  if (p.bedrooms != null) conds.push(gte(listingsTable.bedrooms, p.bedrooms));

  let matches = await db
    .select()
    .from(listingsTable)
    .where(and(...conds))
    .orderBy(desc(listingsTable.isFeatured), desc(listingsTable.aiMatchScore))
    .limit(6);

  // Graceful fallback: if nothing in their city/budget, show featured homes
  if (matches.length === 0) {
    matches = await db
      .select()
      .from(listingsTable)
      .where(eq(listingsTable.status, "active"))
      .orderBy(desc(listingsTable.isFeatured), desc(listingsTable.aiMatchScore))
      .limit(6);
  }

  res.status(201).json({
    passport: { id: row.id, name: row.name, aiPersona: row.aiPersona, aiScore: row.aiScore },
    matches,
  });
});

// ── Public: anonymised "Room Wanted" board ───────────────────────────────────
// Renters who built a passport are explicitly seeking to be found by landlords.
// We expose a PRIVACY-TRIMMED view (first name only, no email/phone) so landlords
// and agents can browse live demand. Full contact details stay landlord-gated.
router.get("/wanted", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      id: renterPassportsTable.id,
      name: renterPassportsTable.name,
      city: renterPassportsTable.city,
      minBudget: renterPassportsTable.minBudget,
      maxBudget: renterPassportsTable.maxBudget,
      bedrooms: renterPassportsTable.bedrooms,
      moveInDate: renterPassportsTable.moveInDate,
      occupants: renterPassportsTable.occupants,
      aiPersona: renterPassportsTable.aiPersona,
      aiScore: renterPassportsTable.aiScore,
      photoUrl: renterPassportsTable.photoUrl,
      verified: renterPassportsTable.verified,
      createdAt: renterPassportsTable.createdAt,
    })
    .from(renterPassportsTable)
    .where(eq(renterPassportsTable.approved, true))
    .orderBy(desc(renterPassportsTable.createdAt))
    .limit(60);

  // Anonymise (first name + initial) and drop obvious test rows
  const TEST_RE = /\b(test|check|smoke|demo|sample)\b/i;
  const wanted = rows
    .filter((r) => r.aiPersona && !TEST_RE.test(r.name))
    .map((r) => {
      const parts = r.name.trim().split(/\s+/);
      const displayName = parts[1] ? `${parts[0]} ${parts[1][0].toUpperCase()}.` : parts[0];
      return {
        id: r.id,
        displayName,
        city: r.city,
        minBudget: r.minBudget,
        maxBudget: r.maxBudget,
        bedrooms: r.bedrooms,
        moveInDate: r.moveInDate,
        occupants: r.occupants,
        aiPersona: r.aiPersona,
        aiScore: r.aiScore,
        photoUrl: r.photoUrl,
        verified: r.verified,
        createdAt: r.createdAt.toISOString(),
      };
    });

  res.json({ wanted });
});

// ── Landlord/Admin: AI-ranked pool of prospective tenants ────────────────────
router.get("/passports", requireAuth(), requireRole("landlord", "admin"), async (_req, res): Promise<void> => {
  const passports = await db
    .select({
      id: renterPassportsTable.id,
      name: renterPassportsTable.name,
      email: renterPassportsTable.email,
      phone: renterPassportsTable.phone,
      city: renterPassportsTable.city,
      minBudget: renterPassportsTable.minBudget,
      maxBudget: renterPassportsTable.maxBudget,
      bedrooms: renterPassportsTable.bedrooms,
      moveInDate: renterPassportsTable.moveInDate,
      occupants: renterPassportsTable.occupants,
      employment: renterPassportsTable.employment,
      petsOwner: renterPassportsTable.petsOwner,
      aiPersona: renterPassportsTable.aiPersona,
      aiScore: renterPassportsTable.aiScore,
      status: renterPassportsTable.status,
      photoUrl: renterPassportsTable.photoUrl,
      approved: renterPassportsTable.approved,
      verified: renterPassportsTable.verified,
      createdAt: renterPassportsTable.createdAt,
    })
    .from(renterPassportsTable)
    .orderBy(desc(renterPassportsTable.aiScore), desc(renterPassportsTable.createdAt))
    .limit(50);

  res.json({ passports });
});

// ── Admin: moderate a Renter Passport (Room Wanted board visibility + verified badge) ──
router.patch("/admin/passports/:id", requireAuth(), requireRole("admin"), async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid passport id" });
    return;
  }

  const b = (req.body ?? {}) as Record<string, unknown>;
  const updates: Partial<{ approved: boolean; verified: boolean }> = {};
  if (typeof b.approved === "boolean") updates.approved = b.approved;
  if (typeof b.verified === "boolean") updates.verified = b.verified;

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "Provide 'approved' and/or 'verified' as booleans" });
    return;
  }

  const [row] = await db
    .update(renterPassportsTable)
    .set(updates)
    .where(eq(renterPassportsTable.id, id))
    .returning({
      id: renterPassportsTable.id,
      name: renterPassportsTable.name,
      approved: renterPassportsTable.approved,
      verified: renterPassportsTable.verified,
    });

  if (!row) {
    res.status(404).json({ error: "Passport not found" });
    return;
  }

  res.json(row);
});

export default router;
