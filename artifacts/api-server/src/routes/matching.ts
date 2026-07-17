import { Router, type IRouter } from "express";
import https from "node:https";
import { db } from "@workspace/db";
import { listingsTable } from "@workspace/db/schema";
import { eq, and, lte, gte } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { aiChat, isAIConfigured } from "../lib/ai";

const router: IRouter = Router();

// ---------------------------------------------------------------------------
// AI Gateway (Vercel) — OpenAI-compatible endpoint routing to Llama 4 Maverick
// Upgraded from Gemini 2.0 Flash — Llama 4 Maverick gives sharper tenant
// compatibility scoring and better structured JSON output for matching use.
// Uses Node.js https module to avoid TypeScript Response type collisions with
// the Express Response type when lib does not include "dom".
// ---------------------------------------------------------------------------
const AI_GATEWAY_BASE = "https://ai-gateway.vercel.sh/v1";
const GATEWAY_MODEL = "meta/llama-4-maverick";

function getAIConfig(): { mode: "gateway"; apiKey: string } | { mode: "unavailable" } {
  const gatewayKey = process.env.AI_GATEWAY_API_KEY;
  if (gatewayKey) return { mode: "gateway", apiKey: gatewayKey };
  return { mode: "unavailable" };
}

/** Minimal typed response wrapper returned by httpsPost */
interface HttpResult {
  statusCode: number;
  body: string;
}

function httpsPost(url: string, headers: Record<string, string>, payload: string): Promise<HttpResult> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request(
      {
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        method: "POST",
        headers: { ...headers, "Content-Length": Buffer.byteLength(payload) },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => resolve({ statusCode: res.statusCode ?? 0, body: Buffer.concat(chunks).toString("utf8") }));
      },
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

async function callGateway(apiKey: string, prompt: string): Promise<string> {
  const payload = JSON.stringify({
    model: GATEWAY_MODEL,
    messages: [{ role: "user", content: prompt }],
    max_tokens: 2048,
    temperature: 0.3,
  });

  const result = await httpsPost(
    `${AI_GATEWAY_BASE}/chat/completions`,
    {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    payload,
  );

  if (result.statusCode < 200 || result.statusCode >= 300) {
    throw new Error(`AI Gateway ${result.statusCode}: ${result.body.slice(0, 200)}`);
  }

  const data = JSON.parse(result.body) as {
    choices: Array<{ message: { content: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI Gateway returned empty content");
  return content.trim();
}

router.post("/matching/score", requireAuth(), async (req, res): Promise<void> => {
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

  const priorityWeights = req.body.priorityWeights as
    | { budget?: number; space?: number; moveIn?: number; lifestyle?: number }
    | undefined;

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

  if (!isAIConfigured()) {
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

  // Renter-stated importance (0-100 each, default neutral 50) for the four factors
  // we ask the model to score separately — lets the tenant weight the overall
  // score toward what matters most to them, and lets the UI show why.
  const weights = {
    budget: priorityWeights?.budget ?? 50,
    space: priorityWeights?.space ?? 50,
    moveIn: priorityWeights?.moveIn ?? 50,
    lifestyle: priorityWeights?.lifestyle ?? 50,
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

The tenant has told us how much each factor matters to them, on a 0-100 scale (50 = neutral, higher = more important):
${JSON.stringify(weights, null, 2)}

Below are available properties:
${JSON.stringify(listingSummaries, null, 2)}

For each property, provide:
1. An overall match score from 0-100 (100 = perfect match), weighted toward the factors the tenant said matter most
2. A 1-sentence "why it matches" explanation (max 120 chars, conversational and warm)
3. Up to 3 specific highlights relevant to this tenant's priorities
4. A breakdown of the SAME overall judgement into 4 named factors, each scored 0-100 independently of the weights above:
   - "budget": how well the price fits their stated budget range
   - "space": how well bedrooms/bathrooms/property type fit what they asked for
   - "moveInFit": how well the available-from date matches their ideal move-in date
   - "lifestyleFit": how well the property matches their stated lifestyle/priorities free-text

Respond ONLY with valid JSON in this exact format (no markdown):
{
  "matches": [
    {
      "id": <listing_id>,
      "score": <0-100>,
      "summary": "<one sentence why it matches>",
      "highlights": ["<highlight 1>", "<highlight 2>", "<highlight 3>"],
      "factors": { "budget": <0-100>, "space": <0-100>, "moveInFit": <0-100>, "lifestyleFit": <0-100> }
    }
  ]
}

Sort by score descending. Include all properties.`;

  let text: string;
  try {
    text = await aiChat([{ role: "user", content: prompt }], { maxTokens: 2048, temperature: 0.3 });
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

  let parsed: {
    matches: Array<{
      id: number; score: number; summary: string; highlights: string[];
      factors?: { budget: number; space: number; moveInFit: number; lifestyleFit: number };
    }>;
  };
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
