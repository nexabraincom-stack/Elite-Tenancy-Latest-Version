/**
 * Elite Tenancy — n8n Workflow Management Routes (Admin only)
 *
 * These endpoints let admins manage n8n workflows directly from the
 * Elite Tenancy dashboard without logging into n8n separately.
 *
 * All routes require: requireAuth() + role = 'admin'
 *
 * GET  /api/n8n/health                      → n8n connectivity check
 * GET  /api/n8n/workflows                   → list all workflows
 * GET  /api/n8n/workflows/:id               → get workflow details
 * POST /api/n8n/workflows/:id/activate      → activate workflow
 * POST /api/n8n/workflows/:id/deactivate    → deactivate workflow
 * GET  /api/n8n/executions                  → list recent executions
 * GET  /api/n8n/executions/:id             → get single execution
 * POST /api/n8n/test-webhook               → fire a test webhook
 */

import { Router, type IRouter, type Request, type Response } from "express";
import { requireAuth, requireRole } from "../middlewares/requireAuth";
import { logger } from "../lib/logger";
import {
  checkN8nHealth,
  listWorkflows,
  getWorkflow,
  activateWorkflow,
  deactivateWorkflow,
  listExecutions,
  getExecution,
  fireWebhook,
  isN8nConfigured,
} from "../lib/n8n";

const router: IRouter = Router();

// All n8n routes require authenticated admin
const adminAuth = [requireAuth(), requireRole("admin")];

// ── GET /api/n8n/health ────────────────────────────────────────────────────────
router.get("/n8n/health", adminAuth, async (_req: Request, res: Response): Promise<void> => {
  const health = await checkN8nHealth();
  const statusCode = health.reachable ? 200 : health.configured ? 503 : 424;
  res.status(statusCode).json({
    n8n: health,
    webhooksConfigured: {
      newEnquiry: Boolean(process.env.N8N_WEBHOOK_NEW_ENQUIRY),
      newApplication: Boolean(process.env.N8N_WEBHOOK_NEW_APPLICATION),
      newValuation: Boolean(process.env.N8N_WEBHOOK_NEW_VALUATION),
      subscription: Boolean(process.env.N8N_WEBHOOK_SUBSCRIPTION),
      payment: Boolean(process.env.N8N_WEBHOOK_PAYMENT),
      viewing: Boolean(process.env.N8N_WEBHOOK_VIEWING),
      tenancy: Boolean(process.env.N8N_WEBHOOK_TENANCY),
    },
  });
});

// ── GET /api/n8n/workflows ─────────────────────────────────────────────────────
router.get("/n8n/workflows", adminAuth, async (req: Request, res: Response): Promise<void> => {
  if (!isN8nConfigured()) {
    res.status(424).json({ error: "n8n is not configured. Set N8N_BASE_URL and N8N_API_KEY." });
    return;
  }

  const cursor = typeof req.query.cursor === "string" ? req.query.cursor : undefined;
  const limit = Math.min(parseInt(String(req.query.limit ?? "50")), 250);

  try {
    const result = await listWorkflows(cursor, limit);
    res.json(result);
  } catch (err) {
    logger.error({ err }, "Failed to list n8n workflows");
    res.status(502).json({ error: "Failed to fetch workflows from n8n" });
  }
});

// ── GET /api/n8n/workflows/:id ─────────────────────────────────────────────────
router.get("/n8n/workflows/:id", adminAuth, async (req: Request, res: Response): Promise<void> => {
  if (!isN8nConfigured()) {
    res.status(424).json({ error: "n8n is not configured" });
    return;
  }

  try {
    const workflow = await getWorkflow(String(req.params.id));
    res.json(workflow);
  } catch (err) {
    logger.error({ err, id: String(req.params.id) }, "Failed to get n8n workflow");
    res.status(502).json({ error: "Failed to fetch workflow from n8n" });
  }
});

// ── POST /api/n8n/workflows/:id/activate ──────────────────────────────────────
router.post("/n8n/workflows/:id/activate", adminAuth, async (req: Request, res: Response): Promise<void> => {
  if (!isN8nConfigured()) {
    res.status(424).json({ error: "n8n is not configured" });
    return;
  }

  try {
    await activateWorkflow(String(req.params.id));
    logger.info({ id: String(req.params.id), by: res.locals.user?.id }, "n8n workflow activated");
    res.json({ success: true, workflowId: String(req.params.id), active: true });
  } catch (err) {
    logger.error({ err, id: String(req.params.id) }, "Failed to activate n8n workflow");
    res.status(502).json({ error: "Failed to activate workflow" });
  }
});

// ── POST /api/n8n/workflows/:id/deactivate ────────────────────────────────────
router.post("/n8n/workflows/:id/deactivate", adminAuth, async (req: Request, res: Response): Promise<void> => {
  if (!isN8nConfigured()) {
    res.status(424).json({ error: "n8n is not configured" });
    return;
  }

  try {
    await deactivateWorkflow(String(req.params.id));
    logger.info({ id: String(req.params.id), by: res.locals.user?.id }, "n8n workflow deactivated");
    res.json({ success: true, workflowId: String(req.params.id), active: false });
  } catch (err) {
    logger.error({ err, id: String(req.params.id) }, "Failed to deactivate n8n workflow");
    res.status(502).json({ error: "Failed to deactivate workflow" });
  }
});

// ── GET /api/n8n/executions ────────────────────────────────────────────────────
router.get("/n8n/executions", adminAuth, async (req: Request, res: Response): Promise<void> => {
  if (!isN8nConfigured()) {
    res.status(424).json({ error: "n8n is not configured" });
    return;
  }

  const workflowId = typeof req.query.workflowId === "string" ? req.query.workflowId : undefined;
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const limit = Math.min(parseInt(String(req.query.limit ?? "20")), 100);

  try {
    const result = await listExecutions(workflowId, status, limit);
    res.json(result);
  } catch (err) {
    logger.error({ err }, "Failed to list n8n executions");
    res.status(502).json({ error: "Failed to fetch executions from n8n" });
  }
});

// ── GET /api/n8n/executions/:id ───────────────────────────────────────────────
router.get("/n8n/executions/:id", adminAuth, async (req: Request, res: Response): Promise<void> => {
  if (!isN8nConfigured()) {
    res.status(424).json({ error: "n8n is not configured" });
    return;
  }

  try {
    const execution = await getExecution(String(req.params.id));
    res.json(execution);
  } catch (err) {
    logger.error({ err, id: String(req.params.id) }, "Failed to get n8n execution");
    res.status(502).json({ error: "Failed to fetch execution from n8n" });
  }
});

// ── POST /api/n8n/test-webhook ─────────────────────────────────────────────────
// Fire a test payload to any n8n webhook URL to verify connectivity
router.post("/n8n/test-webhook", adminAuth, async (req: Request, res: Response): Promise<void> => {
  const { webhookPath, payload } = req.body as {
    webhookPath: string;
    payload?: Record<string, unknown>;
  };

  if (!webhookPath) {
    res.status(400).json({ error: "webhookPath is required" });
    return;
  }

  const testPayload = payload ?? {
    event: "test",
    source: "elite-tenancy-api",
    timestamp: new Date().toISOString(),
    message: "This is a test webhook from Elite Tenancy",
  };

  logger.info({ webhookPath, by: res.locals.user?.id }, "Firing test n8n webhook");

  const success = await fireWebhook(webhookPath, testPayload);
  res.json({ success, webhookPath, payload: testPayload });
});

export default router;
