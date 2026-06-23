/**
 * Elite Tenancy — n8n Integration Client
 *
 * Two surfaces:
 *   1. REST API client  — manage workflows / list executions (n8n API key required)
 *   2. Webhook trigger  — HTTP POST to n8n webhook URLs (works on all n8n plans)
 *
 * Required env vars:
 *   N8N_BASE_URL   = https://{instance}.app.n8n.cloud/api/v1
 *   N8N_API_KEY    = X-N8N-API-KEY value (from n8n Settings → API)
 *
 * Optional webhook env vars (fill in once you've created each workflow in n8n):
 *   N8N_WEBHOOK_NEW_ENQUIRY      = /webhook/new-enquiry
 *   N8N_WEBHOOK_NEW_APPLICATION  = /webhook/new-application
 *   N8N_WEBHOOK_NEW_VALUATION    = /webhook/new-valuation
 *   N8N_WEBHOOK_SUBSCRIPTION     = /webhook/subscription-event
 *   N8N_WEBHOOK_PAYMENT          = /webhook/payment-event
 *   N8N_WEBHOOK_VIEWING          = /webhook/viewing-scheduled
 *   N8N_WEBHOOK_TENANCY          = /webhook/tenancy-event
 *
 * Based on n8n Public API v1.1.1 (OpenAPI 3.0.0)
 */

import { logger } from "./logger";
import * as https from "node:https";
import * as http from "node:http";
import { URL } from "node:url";
import { sendWhatsAppText, toWhatsAppNumber, isWhatsAppConfigured } from "./whatsapp";
import { sendEmail, getAdminEmail, isEmailConfigured, adminDisputeEmail, landlordSubscriptionEmail } from "./email";

// ── Config helpers ─────────────────────────────────────────────────────────────

function getBaseUrl(): string {
  const url = process.env.N8N_BASE_URL;
  if (!url) throw new Error("N8N_BASE_URL is not configured");
  return url.replace(/\/$/, "");
}

/** Derive the webhook host: https://my.app.n8n.cloud/api/v1 → https://my.app.n8n.cloud */
function getWebhookHost(): string {
  const base = process.env.N8N_BASE_URL ?? "";
  try {
    const parsed = new URL(base);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return base.replace(/\/api\/v1\/?$/, "");
  }
}

function getApiKey(): string {
  const key = process.env.N8N_API_KEY;
  if (!key) throw new Error("N8N_API_KEY is not configured");
  return key;
}

export function isN8nConfigured(): boolean {
  return Boolean(process.env.N8N_BASE_URL && process.env.N8N_API_KEY);
}

// ── Typed responses (subset of n8n API v1.1.1) ────────────────────────────────

export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  tags?: Array<{ id: string; name: string }>;
}

export interface N8nWorkflowList {
  data: N8nWorkflow[];
  nextCursor: string | null;
}

export interface N8nExecution {
  id: string;
  workflowId: string;
  finished: boolean;
  mode: string;
  status: "success" | "error" | "canceled" | "running" | "waiting" | string;
  startedAt: string;
  stoppedAt?: string;
}

export interface N8nExecutionList {
  data: N8nExecution[];
  nextCursor: string | null;
}

export interface N8nVariable {
  id: string;
  key: string;
  value: string;
}

// ── HTTP helper (avoids fetch / RequestInit type conflicts with "types":["node"]) ──

interface SimpleRequestOptions {
  method?: string;
  body?: string;
  headers?: Record<string, string>;
}

/** Minimal Node-native HTTP/HTTPS request, returns parsed JSON or throws. */
function nodeRequest<T>(url: string, opts: SimpleRequestOptions = {}): Promise<T> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const isHttps = parsed.protocol === "https:";
    const agent = isHttps ? https : http;

    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: opts.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(opts.headers ?? {}),
      } as Record<string, string>,
    };

    if (opts.body) {
      reqOptions.headers["Content-Length"] = String(Buffer.byteLength(opts.body));
    }

    const req = (agent as typeof https).request(reqOptions, (res) => {
      let data = "";
      res.on("data", (chunk: Buffer) => { data += chunk.toString(); });
      res.on("end", () => {
        const statusCode = res.statusCode ?? 0;
        if (statusCode === 204 || data === "") {
          resolve({} as T);
          return;
        }
        if (statusCode < 200 || statusCode >= 300) {
          reject(new Error(`n8n API error ${statusCode}: ${data.slice(0, 300)}`));
          return;
        }
        try {
          resolve(JSON.parse(data) as T);
        } catch {
          reject(new Error(`n8n API: invalid JSON response (${statusCode})`));
        }
      });
    });

    req.on("error", reject);
    req.setTimeout(10_000, () => { req.destroy(new Error("n8n API request timed out")); });

    if (opts.body) req.write(opts.body);
    req.end();
  });
}

/** Authenticated n8n REST API call. */
function n8nFetch<T>(path: string, opts: SimpleRequestOptions = {}): Promise<T> {
  return nodeRequest<T>(`${getBaseUrl()}${path}`, {
    ...opts,
    headers: {
      "X-N8N-API-KEY": getApiKey(),
      ...(opts.headers ?? {}),
    },
  });
}

// ── Workflow management ────────────────────────────────────────────────────────

export async function listWorkflows(cursor?: string, limit = 50): Promise<N8nWorkflowList> {
  const qs = new URLSearchParams({ limit: String(limit) });
  if (cursor) qs.set("cursor", cursor);
  return n8nFetch<N8nWorkflowList>(`/workflows?${qs}`);
}

export async function getWorkflow(id: string): Promise<N8nWorkflow> {
  return n8nFetch<N8nWorkflow>(`/workflows/${id}`);
}

export async function activateWorkflow(id: string): Promise<void> {
  await n8nFetch<void>(`/workflows/${id}/activate`, { method: "POST" });
}

export async function deactivateWorkflow(id: string): Promise<void> {
  await n8nFetch<void>(`/workflows/${id}/deactivate`, { method: "POST" });
}

// ── Executions ─────────────────────────────────────────────────────────────────

export async function listExecutions(
  workflowId?: string,
  status?: string,
  limit = 20,
): Promise<N8nExecutionList> {
  const qs = new URLSearchParams({ limit: String(limit) });
  if (workflowId) qs.set("workflowId", workflowId);
  if (status) qs.set("status", status);
  return n8nFetch<N8nExecutionList>(`/executions?${qs}`);
}

export async function getExecution(id: string): Promise<N8nExecution> {
  return n8nFetch<N8nExecution>(`/executions/${id}`);
}

// ── Variables ─────────────────────────────────────────────────────────────────

export async function listVariables(): Promise<{ data: N8nVariable[] }> {
  return n8nFetch<{ data: N8nVariable[] }>("/variables");
}

// ── Webhook trigger (no API key required — works on all n8n plans) ─────────────

/**
 * Fire an HTTP POST to an n8n Webhook Trigger node.
 *
 * @param webhookPath  Path portion only ("/webhook/new-enquiry") OR a full URL
 * @param payload      JSON body to send
 * @returns true if the webhook responded 2xx, false on any error (non-fatal)
 */
export async function fireWebhook(
  webhookPath: string,
  payload: Record<string, unknown>,
): Promise<boolean> {
  if (!webhookPath) return false;

  const url = webhookPath.startsWith("http")
    ? webhookPath
    : `${getWebhookHost()}${webhookPath}`;

  return new Promise((resolve) => {
    try {
      const parsed = new URL(url);
      const isHttps = parsed.protocol === "https:";
      const agent = isHttps ? https : http;
      const body = JSON.stringify(payload);

      const req = (agent as typeof https).request(
        {
          hostname: parsed.hostname,
          port: parsed.port || (isHttps ? 443 : 80),
          path: parsed.pathname + parsed.search,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": String(Buffer.byteLength(body)),
          },
        },
        (res) => {
          // Drain the response body
          res.resume();
          const ok = (res.statusCode ?? 0) >= 200 && (res.statusCode ?? 0) < 300;
          if (!ok) {
            logger.warn({ webhookPath, status: res.statusCode }, "n8n webhook responded non-2xx");
          }
          resolve(ok);
        },
      );

      req.on("error", (err) => {
        logger.warn({ err, webhookPath }, "n8n webhook fire failed (non-fatal)");
        resolve(false);
      });

      // 5-second timeout — webhooks are fire-and-forget
      req.setTimeout(5_000, () => {
        req.destroy();
        logger.warn({ webhookPath }, "n8n webhook timed out (non-fatal)");
        resolve(false);
      });

      req.write(body);
      req.end();
    } catch (err) {
      logger.warn({ err, webhookPath }, "n8n webhook setup error (non-fatal)");
      resolve(false);
    }
  });
}

// ── Native automation engine — replaces N8N webhooks ─────────────────────────
//
// Same exported interface as before so no routes need changing.
// Automations run natively via WhatsApp (Meta Graph API) + Resend email.
// N8N REST API client above is kept for future use / re-integration.
//
// New env var required for admin alerts:
//   ADMIN_WHATSAPP_NUMBER  — your business WhatsApp in international format, e.g. "447700900000"

function adminWa(): string | null {
  return process.env.ADMIN_WHATSAPP_NUMBER ?? null;
}

export const N8N_EVENTS = {
  /** WF-01: New enquiry / lead — WhatsApp alert to admin + welcome to customer */
  async newEnquiry(payload: {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    message?: string | null;
    listingId?: number | null;
    listingTitle?: string | null;
    source: "lead" | "contact" | "valuation";
  }): Promise<void> {
    const admin = adminWa();
    const sourceLabel = payload.source === "valuation" ? "valuation" : payload.source === "contact" ? "contact" : "lead";

    // Admin WhatsApp alert
    if (admin && isWhatsAppConfigured()) {
      sendWhatsAppText(admin, [
        `🔔 *New ${sourceLabel} enquiry*`,
        `👤 ${payload.name}`,
        `📧 ${payload.email}`,
        `📞 ${payload.phone ?? "—"}`,
        `🏠 ${payload.listingTitle ?? "General enquiry"}`,
        payload.message ? `💬 ${payload.message.slice(0, 200)}` : "",
        `\nhttps://www.elitetenancy.co.uk/admin`,
      ].filter(Boolean).join("\n")).catch(() => {});
    }

    // WhatsApp welcome to the customer (Ellie introduction)
    if (payload.phone && isWhatsAppConfigured()) {
      const to = toWhatsAppNumber(payload.phone);
      if (to) {
        sendWhatsAppText(to, [
          `Hi ${payload.name} 👋`,
          ``,
          `Thanks for reaching out to *Elite Tenancy*! I'm Ellie, your personal lettings assistant.`,
          ``,
          `Your enquiry is with us and a specialist will be in touch within 24 hours.`,
          ``,
          `In the meantime, I'm here 24/7 — just reply to this message with any questions about our premium homes!`,
          ``,
          `https://www.elitetenancy.co.uk/listings`,
        ].join("\n")).catch(() => {});
      }
    }
  },

  /** WF-02: Tenant application — WhatsApp alert to admin */
  async tenantApplication(payload: {
    applicationId: number;
    tenantId: string;
    tenantName: string;
    tenantEmail: string;
    listingId: number;
    listingTitle?: string;
  }): Promise<void> {
    const admin = adminWa();
    if (admin && isWhatsAppConfigured()) {
      sendWhatsAppText(admin, [
        `⭐ *High-intent tenant application*`,
        ``,
        `🏠 Listing: ${payload.listingTitle ?? `#${payload.listingId}`}`,
        `👤 Tenant: ${payload.tenantName}`,
        `📧 ${payload.tenantEmail}`,
        ``,
        `Review their profile: https://www.elitetenancy.co.uk/admin/listings/${payload.listingId}`,
      ].join("\n")).catch(() => {});
    }
  },

  /** WF-03: Viewing scheduled — placeholder for future Vercel Workflow reminder sequence */
  async viewingScheduled(payload: {
    viewingId: number;
    tenantId: string;
    landlordId: string;
    listingId: number;
    viewingDate: string;
  }): Promise<void> {
    logger.info({ payload }, "Viewing scheduled — reminder automation not yet implemented");
  },

  /** Subscription plan change — WhatsApp admin alert + onboarding email to landlord */
  async subscriptionEvent(payload: {
    landlordId: string;
    planId: string;
    status: string;
    subscriptionId: string;
    landlordEmail?: string;
    landlordName?: string;
  }): Promise<void> {
    const admin = adminWa();
    if (admin && isWhatsAppConfigured()) {
      sendWhatsAppText(admin, [
        `💼 *Subscription ${payload.status}*`,
        ``,
        `👤 Landlord ID: ${payload.landlordId}`,
        `📋 Plan: ${payload.planId}`,
        `🔄 Status: ${payload.status}`,
        `🆔 ${payload.subscriptionId}`,
      ].join("\n")).catch(() => {});
    }

    // Onboarding email to landlord (caller can optionally pass email/name)
    if (payload.landlordEmail && payload.status === "active" && isEmailConfigured()) {
      const { subject, html } = landlordSubscriptionEmail(payload.landlordName ?? "Landlord", payload.planId);
      sendEmail({ to: payload.landlordEmail, subject, html }).catch(() => {});
    }
  },

  /** Payment event — WhatsApp + email admin alert for disputes */
  async paymentEvent(payload: {
    type: "payment_succeeded" | "payment_failed" | "refund" | "dispute";
    amount: number;
    currency: string;
    landlordId?: string;
    tenantId?: string;
    referenceId?: string;
  }): Promise<void> {
    if (payload.type !== "dispute") return; // Only disputes need immediate alerting

    const admin = adminWa();
    const amountStr = `£${(payload.amount / 100).toFixed(2)} ${payload.currency.toUpperCase()}`;

    if (admin && isWhatsAppConfigured()) {
      sendWhatsAppText(admin, [
        `⚠️ *PAYMENT DISPUTE OPENED*`,
        ``,
        `💷 Amount: ${amountStr}`,
        `🆔 Dispute: ${payload.referenceId ?? "—"}`,
        ``,
        `*Submit evidence immediately or funds will be returned automatically.*`,
        ``,
        `https://dashboard.stripe.com/disputes`,
      ].join("\n")).catch(() => {});
    }

    if (isEmailConfigured()) {
      sendEmail({
        to: getAdminEmail(),
        subject: `⚠️ Payment dispute opened — ${amountStr}`,
        html: adminDisputeEmail(payload),
      }).catch(() => {});
    }
  },

  /** Tenancy lifecycle event — placeholder for future Vercel Workflow sequences */
  async tenancyEvent(payload: {
    tenancyId: number;
    type: "created" | "signed" | "ended" | "renewed";
    landlordId?: string;
    tenantId?: string;
  }): Promise<void> {
    logger.info({ payload }, "Tenancy event — automation not yet implemented");
  },
};

// ── Health check ───────────────────────────────────────────────────────────────

export async function checkN8nHealth(): Promise<{
  configured: boolean;
  reachable: boolean;
  error?: string;
}> {
  if (!isN8nConfigured()) return { configured: false, reachable: false };
  try {
    await listWorkflows(undefined, 1);
    return { configured: true, reachable: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return { configured: true, reachable: false, error };
  }
}
