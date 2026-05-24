import { Router, type IRouter } from "express";
import { db, leadsTable } from "@workspace/db";
import {
  SubmitLeadBody,
  SubmitContactBody,
  SubmitValuationBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/leads", async (req, res): Promise<void> => {
  const parsed = SubmitLeadBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid lead body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db
    .insert(leadsTable)
    .values({ ...parsed.data, status: "new" })
    .returning();

  res.status(201).json({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? null,
    message: row.message ?? null,
    listingId: row.listingId ?? null,
    listingTitle: row.listingTitle ?? null,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  });
});

router.post("/contact", async (req, res): Promise<void> => {
  const parsed = SubmitContactBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid contact body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await db.insert(leadsTable).values({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone ?? null,
    message: `[Contact: ${parsed.data.subject ?? "General"}] ${parsed.data.message}`,
    status: "new",
  });

  req.log.info({ email: parsed.data.email }, "Contact form submitted");
  res.json({ success: true, message: "Your message has been received. We will be in touch shortly." });
});

router.post("/valuation", async (req, res): Promise<void> => {
  const parsed = SubmitValuationBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid valuation body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await db.insert(leadsTable).values({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone ?? null,
    message: `[Valuation Request] ${parsed.data.address ?? ""} ${parsed.data.postcode}, ${parsed.data.propertyType ?? "unknown type"}, ${parsed.data.bedrooms ?? "?"} bedrooms. ${parsed.data.message ?? ""}`.trim(),
    status: "new",
  });

  req.log.info({ email: parsed.data.email }, "Valuation request submitted");
  res.json({ success: true, message: "Thank you! Our team will contact you with a free valuation within 24 hours." });
});

export default router;
