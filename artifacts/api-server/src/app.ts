import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { rateLimit } from "express-rate-limit";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./middlewares/clerkProxyMiddleware";
import router from "./routes";
import webhookRouter from "./routes/webhook";
import { logger } from "./lib/logger";

const app: Express = express();

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

app.use(express.json());
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

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/api", router);

export default app;
