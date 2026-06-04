import * as https from "node:https";

/**
 * Shared AI chat helper — prioritised multi-provider chain.
 *
 * Every provider below is OpenAI-compatible. A provider is only used when its
 * API key env var is set, tried in order (free providers first, the paid Vercel
 * AI Gateway last as a guaranteed fallback). Add ANY free key to activate that
 * provider — no code change needed. Behaviour is unchanged until you add keys.
 *
 * Free keys (no card):
 *   GROQ_API_KEY        → console.groq.com           (Llama 3.3 70B, 14,400/day)
 *   GEMINI_API_KEY      → aistudio.google.com        (Gemini 2.5 Flash, 1M ctx)
 *   CEREBRAS_API_KEY    → cloud.cerebras.ai          (Llama 3.3 70B, 1M tok/day)
 *   OPENROUTER_API_KEY  → openrouter.ai              (many free models)
 * Paid fallback:
 *   AI_GATEWAY_API_KEY  → Vercel AI Gateway          (Llama 4 Maverick)
 */

interface ChatMessage { role: string; content: string }
interface ChatOptions { maxTokens?: number; temperature?: number }
interface PostResult { statusCode: number; body: string }
interface Provider { name: string; envKey: string; url: string; model: string; free: boolean }

const PROVIDERS: Provider[] = [
  { name: "Groq",           envKey: "GROQ_API_KEY",       url: "https://api.groq.com/openai/v1/chat/completions",                            model: "llama-3.3-70b-versatile",               free: true },
  { name: "Gemini",         envKey: "GEMINI_API_KEY",     url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",  model: "gemini-2.5-flash",                      free: true },
  { name: "Cerebras",       envKey: "CEREBRAS_API_KEY",   url: "https://api.cerebras.ai/v1/chat/completions",                               model: "llama-3.3-70b",                         free: true },
  { name: "OpenRouter",     envKey: "OPENROUTER_API_KEY", url: "https://openrouter.ai/api/v1/chat/completions",                             model: "meta-llama/llama-3.3-70b-instruct:free", free: true },
  { name: "Vercel Gateway", envKey: "AI_GATEWAY_API_KEY", url: "https://ai-gateway.vercel.sh/v1/chat/completions",                          model: "meta/llama-4-maverick",                 free: false },
];

export function isAIConfigured(): boolean {
  return PROVIDERS.some((p) => Boolean(process.env[p.envKey]));
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
async function tryProvider(p: Provider, apiKey: string, messages: ChatMessage[], opts: ChatOptions): Promise<string | null> {
  const payload = JSON.stringify({ model: p.model, messages, max_tokens: opts.maxTokens ?? 600, temperature: opts.temperature ?? 0.7 });
  const backoff = [400, 1200];
  for (let attempt = 0; attempt < 3; attempt++) {
    let r: PostResult;
    try { r = await post(p.url, apiKey, payload); } catch { return null; }
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
 * Multi-provider chat completion. Tries each configured provider in priority
 * order (free first, paid Gateway last). Throws only if every provider is
 * unconfigured or fails.
 */
export async function aiChat(messages: ChatMessage[], opts: ChatOptions = {}): Promise<string> {
  for (const p of PROVIDERS) {
    const key = process.env[p.envKey];
    if (!key) continue;
    const content = await tryProvider(p, key, messages, opts);
    if (content) return content;
  }
  throw new Error("AI unavailable — no provider configured or all failed");
}
