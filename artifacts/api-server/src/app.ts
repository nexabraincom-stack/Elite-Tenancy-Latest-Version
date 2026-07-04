import * as Sentry from "@sentry/node";
import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { rateLimit } from "express-rate-limit";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import { createProxyMiddleware } from "http-proxy-middleware";
import type { RequestHandler } from "express";
import type { IncomingHttpHeaders } from "http";
import router from "./routes";
import webhookRouter from "./routes/webhook";
import { logger } from "./lib/logger";

// ── Clerk proxy helpers (inlined to avoid ESM inter-module resolution issues) ─
const CLERK_FAPI = "https://frontend-api.clerk.dev";
const CLERK_PROXY_PATH = "/api/__clerk";

function getClerkProxyHost(req: { headers: IncomingHttpHeaders }): string | undefined {
  const forwarded = req.headers["x-forwarded-host"];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const firstHop = raw?.split(",")[0]?.trim();
  return firstHop || req.headers.host?.trim() || undefined;
}

function clerkProxyMiddleware(): RequestHandler {
  if (process.env.NODE_ENV !== "production") return (_req, _res, next) => next();
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) return (_req, _res, next) => next();
  return createProxyMiddleware({
    target: CLERK_FAPI,
    changeOrigin: true,
    pathRewrite: (path: string) => path.replace(new RegExp(`^${CLERK_PROXY_PATH}`), ""),
    on: {
      proxyReq: (proxyReq, req) => {
        const protocol = req.headers["x-forwarded-proto"] || "https";
        const host = getClerkProxyHost(req) || "";
        proxyReq.setHeader("Clerk-Proxy-Url", `${protocol}://${host}${CLERK_PROXY_PATH}`);
        proxyReq.setHeader("Clerk-Secret-Key", secretKey);
        const xff = req.headers["x-forwarded-for"];
        const clientIp = (Array.isArray(xff) ? xff[0] : xff)?.split(",")[0]?.trim() || req.socket?.remoteAddress || "";
        if (clientIp) proxyReq.setHeader("X-Forwarded-For", clientIp);
      },
    },
  }) as RequestHandler;
}

const app: Express = express();

// Vercel's edge sits exactly one hop in front of this function and sets its
// own trustworthy X-Forwarded-For header. Without this, Express's req.ip
// getter ignores that header entirely (default trust proxy = 0 hops) and
// falls back to the constant proxy socket address for every request, which
// collapses every real visitor into the same express-rate-limit bucket
// below — the limiters silently stop being per-client. `1` (not `true`)
// trusts exactly that one hop and no further, so a client can't spoof their
// own IP by forging extra X-Forwarded-For entries.
app.set("trust proxy", 1);

// ── Security headers ─────────────────────────────────────────────────────────
// Manually set the critical security headers that helmet would provide,
// without adding the helmet dependency. Keeps the bundle lean.
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.removeHeader("X-Powered-By");
  next();
});

// ── Health check — registered FIRST, before any middleware that could crash ───
// Exposed at both /health (direct) and /api/health (via frontend proxy rewrite)
// so uptime monitors hitting either URL get a valid response.
app.get(["/health", "/api/health"], (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Logging ──────────────────────────────────────────────────────────────────
// ts-expect-error: pino-http default import callable via esModuleInterop;
// TypeScript 5.9 esnext bundler mode requires this bypass for export= modules
app.use(
  // @ts-ignore
  pinoHttp({
    logger,
    serializers: {
      req(req: { id: unknown; method: string; url?: string }) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res: { statusCode: number }) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

// ── Stripe webhook — MUST be before express.json() (needs raw body) ──────────
// Mounted directly (not under /api) so Stripe can reach it easily
app.use("/api/webhooks", webhookRouter);

// ── Clerk proxy (must be before express.json) ─────────────────────────────────
app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

// ── CORS — explicit allowlist only (no origin reflection with credentials) ────
const rawOrigins = process.env.ALLOWED_ORIGINS ?? "";
const allowedOrigins = rawOrigins
  ? rawOrigins.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://localhost:4173"];

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      // Allow server-to-server (no Origin header) and explicitly listed origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' not allowed`));
      }
    },
  }),
);

// A rejected origin above calls next(err), which would otherwise fall
// through to the generic Express/Sentry error handler as an unhandled
// "Internal Server Error" — indistinguishable from a real crash, and it
// would pollute Sentry with routine, expected CORS rejections. Return a
// clean 403 instead.
app.use((
  err: Error,
  _req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  if (err && err.message?.startsWith("CORS:")) {
    res.status(403).json({ error: "Origin not allowed" });
    return;
  }
  next(err);
});

app.use(
  express.json({
    // Stash the raw bytes alongside the parsed body — the WhatsApp inbound
    // webhook needs them to verify Meta's X-Hub-Signature-256 HMAC, and
    // express.json() doesn't otherwise expose the pre-parse buffer.
    verify: (req, _res, buf) => {
      (req as express.Request & { rawBody?: Buffer }).rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: true }));

// ── Malformed-JSON guard ──────────────────────────────────────────────────────
// express.json() throws a SyntaxError on invalid bodies, which Express would
// otherwise render as a 500 HTML page. Catch it and return a clean JSON 400.
app.use((
  err: Error & { type?: string; status?: number },
  _req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  if (err && (err.type === "entity.parse.failed" || err instanceof SyntaxError)) {
    res.status(400).json({ error: "Invalid JSON in request body" });
    return;
  }
  next(err);
});

// ── Clerk auth middleware ─────────────────────────────────────────────────────
app.use(
  clerkMiddleware((req) => ({
    publishableKey: publishableKeyFromHost(
      getClerkProxyHost(req) ?? "",
      process.env.CLERK_PUBLISHABLE_KEY,
    ),
  })),
);

// ── Rate limiting for AI endpoints ───────────────────────────────────────────
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,      // 1 minute window
  max: 20,                   // 20 requests per IP per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests — please slow down." },
});

app.use("/api/ellie/chat", aiLimiter);
app.use("/api/matching/score", aiLimiter);
app.use("/api/passport", aiLimiter);
app.use("/api/verify", aiLimiter);
app.use("/api/rtr/check", aiLimiter);

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/api", router);

// ── 404 catch-all — must be after all routes, before error handlers ──────────
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// ── Sentry error handler — must be after all routes ──────────────────────────
// Captures unhandled Express errors and sends them to Sentry before the
// generic error handler runs. Must come before any other error middleware.
Sentry.setupExpressErrorHandler(app);

export default app;
