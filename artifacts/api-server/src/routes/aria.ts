import { Router, type IRouter } from "express";
import https from "node:https";

const router: IRouter = Router();

// ---------------------------------------------------------------------------
// AI Gateway (Vercel) — OpenAI-compatible endpoint routing to Gemini 2.0 Flash
// Uses Node.js https module to avoid TypeScript Response type collisions with
// the Express Response type when lib does not include "dom".
// ---------------------------------------------------------------------------
const AI_GATEWAY_BASE = "https://ai-gateway.vercel.sh/v1";
const GATEWAY_MODEL = "google/gemini-2.0-flash";

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

async function callGateway(
  apiKey: string,
  messages: Array<{ role: string; content: string }>,
): Promise<string> {
  const payload = JSON.stringify({
    model: GATEWAY_MODEL,
    messages,
    max_tokens: 400,
    temperature: 0.7,
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

const SYSTEM_PROMPT = `You are Aria, the AI assistant for Elite Tenancy — the UK's premier tenant-introduction service. You are warm, professional, knowledgeable, and concise.

About Elite Tenancy:
- Premium UK lettings platform connecting exceptional landlords with exceptional tenants
- No let, no fee — landlords pay ONLY when a tenancy completes (no upfront fees ever)
- Based in the UK, covering major cities: Manchester, London, Birmingham, Leeds, Edinburgh, Bristol, and more
- Tenant introduction service — NOT a traditional letting agency
- All tenants undergo rigorous referencing and screening
- Member of The Property Ombudsman

Pricing for Landlords (two simple plans — no hidden fees):
- Introduction Only: £395 per successful let. Includes professional photography, premium portal listings, six-stage tenant screening, Right to Rent check, tenancy agreement prep, deposit protection setup, and a dedicated account manager. Fee is due on the commencement date of the tenancy only.
- Premium Managed: 8% of monthly rent collected. Everything in Introduction Only PLUS ongoing property management, monthly rent collection, maintenance coordination, quarterly property inspections, annual rent reviews, 24/7 tenant emergency line, and full legal compliance updates.
- No let, no fee guarantee on both plans — if we don't find a tenant, you pay nothing.
- No admin fees, no renewal fees, no exit fees. The price you see is the price you pay.

For Tenants:
- Completely FREE to use — tenants never pay any fees
- AI-powered property matching available at /find-my-match
- Browse all listings at /listings

Key Features:
- AI-powered tenant matching (Gemini AI scores properties 0-100 against tenant requirements)
- Tenant portal: dashboard, my tenancy, rent history, maintenance requests, documents
- Landlord portal: dashboard, listings management, tenant management, finances, leads
- Blog with lettings insights and UK property market news

How to Register:
- Tenants: Click "Find a Room" or "Sign Up" — it's free
- Landlords: Click "List Your Property" or "For Landlords"
- Sign up takes under 2 minutes

Rules:
- Keep responses concise (2-4 sentences unless detail is requested)
- Use **bold** for key terms or numbers
- If asked for specific legal advice, recommend consulting a qualified solicitor
- Do not make up specific property details — direct users to /listings to browse
- Always be warm, helpful, and professional
- You can help with: finding properties, understanding the service, pricing questions, how to list, tenant rights, maintenance, the Renters Rights Act 2025
- Never discuss competitors negatively`;

// In-memory session store: sessionId → last N messages
// Each entry expires after 30 minutes of inactivity
const sessions = new Map<string, { messages: Array<{ role: "user" | "assistant"; text: string }>; lastUsed: number }>();

const SESSION_TTL_MS = 30 * 60 * 1000;
const MAX_HISTORY = 8;

function pruneExpiredSessions() {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.lastUsed > SESSION_TTL_MS) sessions.delete(id);
  }
}

router.post("/aria/chat", async (req, res): Promise<void> => {
  const { message, sessionId } = req.body;

  if (!message || typeof message !== "string") {
    res.status(400).json({ error: "message is required" });
    return;
  }

  if (message.length > 1000) {
    res.status(400).json({ error: "Message too long" });
    return;
  }

  const aiConfig = getAIConfig();
  if (aiConfig.mode === "unavailable") {
    res.status(503).json({ error: "AI service not available", reply: "The AI assistant is temporarily unavailable. Please try again later." });
    return;
  }

  pruneExpiredSessions();

  // Use server-side session history — never trust client-supplied history
  const sid = typeof sessionId === "string" && sessionId.length < 128 ? sessionId : null;
  const session = sid ? (sessions.get(sid) ?? { messages: [], lastUsed: Date.now() }) : { messages: [], lastUsed: Date.now() };
  session.lastUsed = Date.now();

  // Build OpenAI-format messages with system prompt + history + new user message
  const chatMessages: Array<{ role: string; content: string }> = [
    { role: "system", content: SYSTEM_PROMPT },
    ...session.messages.slice(-MAX_HISTORY).map((m) => ({ role: m.role, content: m.text })),
    { role: "user", content: message },
  ];

  let reply: string;
  try {
    reply = await callGateway(aiConfig.apiKey, chatMessages);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("429") || msg.includes("quota") || msg.includes("Too Many Requests")) {
      res.status(429).json({ error: "AI service busy", reply: "I'm a little busy right now — please try again in a moment!" });
    } else {
      console.error("[aria] AI Gateway error:", msg);
      res.status(502).json({ error: "AI error", reply: "Something went wrong. Please try again." });
    }
    return;
  }

  // Persist to server-side session
  session.messages.push({ role: "user", text: message });
  session.messages.push({ role: "assistant", text: reply });
  if (session.messages.length > MAX_HISTORY * 2) {
    session.messages = session.messages.slice(-MAX_HISTORY * 2);
  }
  if (sid) sessions.set(sid, session);

  res.json({ reply, sessionId: sid });
});

export default router;
