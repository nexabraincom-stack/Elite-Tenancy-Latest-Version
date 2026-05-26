import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { listingsTable } from "@workspace/db/schema";
import { eq, and, lte, gte } from "drizzle-orm";

const router: IRouter = Router();

// ---------------------------------------------------------------------------
// AI Gateway (Vercel) — OpenAI-compatible endpoint routing to Gemini 2.0 Flash
// ---------------------------------------------------------------------------
const AI_GATEWAY_BASE = "https://ai-gateway.vercel.sh/v1";
const GATEWAY_MODEL = "google/gemini-2.0-flash";

function getAIConfig(): { mode: "gateway"; apiKey: string } | { mode: "unavailable" } {
  const gatewayKey = process.env.AI_GATEWAY_API_KEY;
  if (gatewayKey) return { mode: "gateway", apiKey: gatewayKey };
  return { mode: "unavailable" };
}

async function callGateway(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch(`${AI_GATEWAY_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GATEWAY_MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2048,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`AI Gateway ${response.status}: ${body.slice(0, 200)}`);
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI Gateway returned empty content");
  return content.trim();
}

router.post("/matching/score", async (req, res): Promise<void> => {
  const {
    city,
    minBudget,
    maxBudget,
    bedrooms,
    furnished,
    petsAllowed,
    billsIncluded,
    moveInDate,
    lifestyle,
    priorities,
  } = req.body;

  if (!maxBudget) {
    res.status(400).json({ error: "maxBudget is required" });
    return;
  }

  const conditions = [eq(listingsTable.status, "active")];
  if (city) {
    const { ilike } = await import("drizzle-orm");
    conditions.push(ilike(listingsTable.city, `%${city}%`));
  }
  if (maxBudget) conditions.push(lte(listingsTable.price, Number(maxBudget)));
  if (minBudget) conditions.push(gte(listingsTable.price, Number(minBudget)));
  if (bedrooms != null && bedrooms !== "") conditions.push(eq(listingsTable.bedrooms, Number(bedrooms)));
  if (furnished === true || furnished === "true") conditions.push(eq(listingsTable.furnished, true));
  if (petsAllowed === true || petsAllowed === "true") conditions.push(eq(listingsTable.petsAllowed, true));
  if (billsIncluded === true || billsIncluded === "true") conditions.push(eq(listingsTable.billsIncluded, true));

  const listings = await db.select().from(listingsTable).where(and(...conditions)).limit(20);

  if (listings.length === 0) {
    res.json({ matches: [] });
    return;
  }

  const aiConfig = getAIConfig();
  if (aiConfig.mode === "unavailable") {
    res.status(503).json({ error: "AI matching service is not available" });
    return;
  }

  const tenantProfile = {
    city: city || "any",
    budget: `£${minBudget || 0}–£${maxBudget}/month`,
    bedrooms: bedrooms != null && bedrooms !== "" ? (Number(bedrooms) === 0 ? "studio" : `${bedrooms} bedroom(s)`) : "any",
    furnished: furnished ? "yes" : "not specified",
    petsAllowed: petsAllowed ? "yes" : "not specified",
    billsIncluded: billsIncluded ? "preferred" : "not specified",
    moveInDate: moveInDate || "flexible",
    lifestyle: lifestyle || "not specified",
    priorities: priorities || "not specified",
  };

  const listingSummaries = listings.map((l) => ({
    id: l.id,
    title: l.title,
    city: l.city,
    postcode: l.postcode,
    price: l.price,
    bedrooms: l.bedrooms,
    bathrooms: l.bathrooms,
    category: l.category,
    furnished: l.furnished,
    petsAllowed: l.petsAllowed,
    billsIncluded: l.billsIncluded,
    description: l.description.slice(0, 200),
    availableFrom: l.availableFrom,
  }));

  const prompt = `You are an expert UK lettings agent for Elite Tenancy, a premium tenant introduction service.

A tenant is looking for a property with the following requirements:
${JSON.stringify(tenantProfile, null, 2)}

Below are available properties:
${JSON.stringify(listingSummaries, null, 2)}

For each property, provide:
1. A match score from 0–100 (100 = perfect match)
2. A 1-sentence "why it matches" explanation (max 120 chars, conversational and warm)
3. Up to 3 specific highlights relevant to this tenant's priorities

Respond ONLY with valid JSON in this exact format (no markdown):
{
  "matches": [
    {
      "id": <listing_id>,
      "score": <0-100>,
      "summary": "<one sentence why it matches>",
      "highlights": ["<highlight 1>", "<highlight 2>", "<highlight 3>"]
    }
  ]
}

Sort by score descending. Include all properties.`;

  let text: string;
  try {
    text = await callGateway(aiConfig.apiKey, prompt);
  } catch (aiErr: unknown) {
    const msg = aiErr instanceof Error ? aiErr.message : String(aiErr);
    if (msg.includes("429") || msg.includes("quota") || msg.includes("Too Many Requests")) {
      res.status(429).json({ error: "AI service temporarily unavailable. Please try again in a moment." });
    } else {
      console.error("[matching] AI Gateway error:", msg);
      res.status(502).json({ error: "AI service error", detail: msg });
    }
    return;
  }

  let parsed: { matches: Array<{ id: number; score: number; summary: string; highlights: string[] }> };
  try {
    const jsonText = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    parsed = JSON.parse(jsonText);
  } catch {
    res.status(500).json({ error: "Failed to parse AI response", raw: text.slice(0, 200) });
    return;
  }

  const listingMap = new Map(listings.map((l) => [l.id, l]));
  const enriched = parsed.matches
    .filter((m) => listingMap.has(m.id))
    .map((m) => ({
      ...m,
      listing: listingMap.get(m.id)!,
    }))
    .sort((a, b) => b.score - a.score);

  res.json({ matches: enriched });
});

export default router;
