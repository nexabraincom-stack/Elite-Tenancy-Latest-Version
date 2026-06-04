import * as https from "node:https";

/**
 * Shared AI chat helper — Groq-first (free), Vercel AI Gateway fallback (paid).
 *
 * Both endpoints are OpenAI-compatible. Set GROQ_API_KEY to route inference to
 * Groq's free Llama 3.3 70B (14,400 req/day, no card). The paid Vercel AI
 * Gateway is used only when Groq is absent OR fails — so behaviour is identical
 * to before until a Groq key is added, and the Gateway always guards against any
 * Groq hiccup. Zero risk to existing features.
 */

interface ChatMessage { role: string; content: string }
interface ChatOptions { maxTokens?: number; temperature?: number }
interface PostResult { statusCode: number; body: string }

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/chat/completions";
const GATEWAY_MODEL = "meta/llama-4-maverick";

export function isAIConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY || process.env.AI_GATEWAY_API_KEY);
}

function post(url: string, apiKey: string, payload: string): Promise<PostResult> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (d: Buffer) => chunks.push(d));
        res.on("end", () => resolve({ statusCode: res.statusCode ?? 0, body: Buffer.concat(chunks).toString("utf8") }));
      },
    );
    req.on("error", reject);
    req.setTimeout(20_000, () => req.destroy(new Error("AI request timed out")));
    req.write(payload);
    req.end();
  });
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** Try one provider with brief retry on transient (429/5xx) errors. Returns content, or null on any failure. */
async function tryProvider(url: string, model: string, apiKey: string, messages: ChatMessage[], opts: ChatOptions): Promise<string | null> {
  const payload = JSON.stringify({ model, messages, max_tokens: opts.maxTokens ?? 600, temperature: opts.temperature ?? 0.7 });
  const backoff = [400, 1200];
  for (let attempt = 0; attempt < 3; attempt++) {
    let r: PostResult;
    try { r = await post(url, apiKey, payload); } catch { return null; }
    if (r.statusCode >= 200 && r.statusCode < 300) {
      try {
        const data = JSON.parse(r.body) as { choices?: Array<{ message?: { content?: string } }> };
        const content = data.choices?.[0]?.message?.content;
        return content ? content.trim() : null;
      } catch { return null; }
    }
    const transient = r.statusCode === 429 || (r.statusCode >= 500 && r.statusCode < 600);
    if (!transient || attempt === 2) return null;
    await sleep(backoff[attempt] ?? 1200);
  }
  return null;
}

/**
 * Groq-first chat completion with Vercel Gateway fallback.
 * Throws only if BOTH providers are unavailable/failed.
 */
export async function aiChat(messages: ChatMessage[], opts: ChatOptions = {}): Promise<string> {
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    const c = await tryProvider(GROQ_URL, GROQ_MODEL, groqKey, messages, opts);
    if (c) return c; // free path succeeded
  }
  const gwKey = process.env.AI_GATEWAY_API_KEY;
  if (gwKey) {
    const c = await tryProvider(GATEWAY_URL, GATEWAY_MODEL, gwKey, messages, opts);
    if (c) return c; // paid fallback
  }
  throw new Error("AI unavailable — all providers failed");
}
