/**
 * Elite Tenancy — Ellie on WhatsApp (WF-02)
 *
 * Connects Ellie (the shared brain in ./ellie) to the WhatsApp Business
 * Cloud API (Meta Graph API). Ellie answers tenant/landlord enquiries 24/7
 * on WhatsApp with the exact same knowledge as the website chat.
 *
 * FEATURE-FLAGGED: these routes are only active when the WhatsApp env vars
 * are present. With no credentials set, the webhook returns a friendly
 * "not configured" response and changes nothing else about the backend.
 *
 * Endpoints:
 *   GET  /api/whatsapp/webhook   → Meta verification handshake
 *   POST /api/whatsapp/webhook   → inbound messages → Ellie → reply
 *
 * Required env vars (set in Vercel once you have a Meta WhatsApp number):
 *   WHATSAPP_VERIFY_TOKEN     = a secret string you invent (used in Meta dashboard)
 *   WHATSAPP_ACCESS_TOKEN     = Meta system-user access token
 *   WHATSAPP_PHONE_NUMBER_ID  = the phone number ID from Meta
 *   WHATSAPP_GRAPH_VERSION    = (optional) Graph API version, default v21.0
 */

import { Router, type IRouter, type Request, type Response } from "express";
import https from "node:https";
import { askEllie } from "./ellie";

const router: IRouter = Router();

function whatsappConfigured(): boolean {
  return Boolean(
    process.env.WHATSAPP_ACCESS_TOKEN &&
    process.env.WHATSAPP_PHONE_NUMBER_ID &&
    process.env.WHATSAPP_VERIFY_TOKEN,
  );
}

/** Convert Ellie's web markdown to WhatsApp formatting + tappable links. */
function toWhatsApp(text: string): string {
  return text
    // **bold** -> *bold* (WhatsApp uses single asterisk for bold)
    .replace(/\*\*(.*?)\*\*/g, "*$1*")
    // internal /paths -> full tappable URLs
    .replace(/(^|[\s(])(\/[a-z][a-z0-9/-]*)/g, "$1https://www.elitetenancy.co.uk$2");
}

/** Send a WhatsApp text message via Meta Graph API (node:https — bundles cleanly). */
function sendWhatsAppText(to: string, body: string): Promise<{ statusCode: number; body: string }> {
  return new Promise((resolve, reject) => {
    const version = process.env.WHATSAPP_GRAPH_VERSION || "v21.0";
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
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
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c: Buffer) => chunks.push(c));
        res.on("end", () =>
          resolve({ statusCode: res.statusCode ?? 0, body: Buffer.concat(chunks).toString("utf8") }),
        );
      },
    );
    req.on("error", reject);
    req.setTimeout(15_000, () => req.destroy(new Error("WhatsApp send timed out")));
    req.write(payload);
    req.end();
  });
}

// ── GET: Meta webhook verification handshake ──────────────────────────────────
router.get("/whatsapp/webhook", (req: Request, res: Response): void => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    res.status(200).send(String(challenge));
    return;
  }
  res.sendStatus(403);
});

// ── POST: inbound WhatsApp messages → Ellie → reply ───────────────────────────
router.post("/whatsapp/webhook", async (req: Request, res: Response): Promise<void> => {
  // Always 200 quickly-ish so Meta doesn't retry; we await Ellie first (a few seconds is fine).
  if (!whatsappConfigured()) {
    // Not configured yet — acknowledge so Meta verification/test pings succeed.
    res.sendStatus(200);
    return;
  }

  try {
    const entry = req.body?.entry?.[0];
    const change = entry?.changes?.[0]?.value;
    const msg = change?.messages?.[0];

    // Status callbacks (delivered/read) and non-text messages: just ack.
    if (!msg || msg.type !== "text" || !msg.from || !msg.text?.body) {
      res.sendStatus(200);
      return;
    }

    const from = String(msg.from);
    const text = String(msg.text.body);

    // Reuse Ellie's brain. Conversation key = sender's WhatsApp number,
    // so history is maintained per contact.
    const result = await askEllie(text, `wa:${from}`);
    const reply = toWhatsApp(result.reply);

    const send = await sendWhatsAppText(from, reply);
    if (send.statusCode < 200 || send.statusCode >= 300) {
      console.error("[whatsapp] send failed:", send.statusCode, send.body.slice(0, 200));
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("[whatsapp] webhook error:", err instanceof Error ? err.message : String(err));
    res.sendStatus(200); // never make Meta retry on our internal errors
  }
});

export default router;
