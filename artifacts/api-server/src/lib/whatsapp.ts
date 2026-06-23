/**
 * Elite Tenancy — WhatsApp sender (Meta Graph API)
 *
 * Shared by routes/whatsapp.ts (inbound Ellie replies) and the automation
 * engine (lib/n8n.ts wrappers → outbound proactive notifications).
 *
 * Required env vars:
 *   WHATSAPP_ACCESS_TOKEN     Meta system-user access token
 *   WHATSAPP_PHONE_NUMBER_ID  The phone number ID from Meta
 *
 * Optional:
 *   ADMIN_WHATSAPP_NUMBER     Business WhatsApp number for admin alerts
 *                             (international format, no + sign: "447700900000")
 *   WHATSAPP_GRAPH_VERSION    default "v21.0"
 */

import * as https from "node:https";
import { logger } from "./logger";

export function isWhatsAppConfigured(): boolean {
  return Boolean(
    process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID,
  );
}

/**
 * Normalise a UK phone number to the international format Meta expects.
 * "07700900000" → "447700900000"
 * "+44 7700 900000" → "447700900000"
 * Returns null when the number can't be normalised safely.
 */
export function toWhatsAppNumber(phone: string): string | null {
  const clean = phone.replace(/[\s\-\(\)+]/g, "");
  if (/^07\d{9}$/.test(clean)) return "44" + clean.slice(1);
  if (/^447\d{9}$/.test(clean)) return clean;
  if (/^\d{10,15}$/.test(clean)) return clean; // already international
  return null;
}

export interface WhatsAppSendResult {
  ok: boolean;
  statusCode?: number;
  body?: string;
}

/**
 * Send a text message via Meta Graph API.
 * Never throws — failures are logged and resolve { ok: false }.
 */
export function sendWhatsAppText(to: string, body: string): Promise<WhatsAppSendResult> {
  return new Promise((resolve) => {
    if (!isWhatsAppConfigured()) {
      resolve({ ok: false });
      return;
    }

    const version = process.env.WHATSAPP_GRAPH_VERSION ?? "v21.0";
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID!;
    const token = process.env.WHATSAPP_ACCESS_TOKEN!;

    const payload = JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: { preview_url: true, body: body.slice(0, 4096) },
    });

    const req = https.request(
      {
        hostname: "graph.facebook.com",
        path: `/${version}/${phoneId}/messages`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Content-Length": String(Buffer.byteLength(payload)),
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c: Buffer) => chunks.push(c));
        res.on("end", () => {
          const statusCode = res.statusCode ?? 0;
          const responseBody = Buffer.concat(chunks).toString("utf8");
          const ok = statusCode >= 200 && statusCode < 300;
          if (!ok) {
            logger.warn({ statusCode, to, snippet: responseBody.slice(0, 200) }, "WhatsApp send non-2xx (non-fatal)");
          }
          resolve({ ok, statusCode, body: responseBody });
        });
      },
    );

    req.on("error", (err) => {
      logger.warn({ err, to }, "WhatsApp send error (non-fatal)");
      resolve({ ok: false });
    });
    req.setTimeout(15_000, () => {
      req.destroy();
      logger.warn({ to }, "WhatsApp send timed out (non-fatal)");
      resolve({ ok: false });
    });

    req.write(payload);
    req.end();
  });
}
