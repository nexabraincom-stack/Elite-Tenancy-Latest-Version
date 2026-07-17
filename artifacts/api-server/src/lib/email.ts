/**
 * Elite Tenancy — Email service (Resend)
 *
 * Thin, dependency-free wrapper over the Resend REST API
 * (https://api.resend.com/emails) using Node's native https — matching the
 * style of lib/n8n.ts so we don't add a package.
 *
 * Env vars:
 *   RESEND_API_KEY      (required) — re_... key from resend.com
 *   RESEND_FROM         sender, default "Elite Tenancy <hello@elitetenancy.co.uk>"
 *   ADMIN_NOTIFY_EMAIL  inbox that receives lead alerts, default nexabrain.com@gmail.com
 *
 * Domain note: customer-facing sends (autoresponder, review requests) require the
 * elitetenancy.co.uk domain to be verified in Resend. Admin alerts to the account
 * owner's address work immediately. All sends are non-blocking + logged on failure.
 */

import * as https from "node:https";
import { logger } from "./logger";
import { formatLondonDateTime } from "./viewingAvailability";

const RESEND_HOST = "api.resend.com";

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

function getFrom(): string {
  return process.env.RESEND_FROM ?? "Elite Tenancy <hello@elitetenancy.co.uk>";
}

export function getAdminEmail(): string {
  return process.env.ADMIN_NOTIFY_EMAIL ?? "nexabrain.com@gmail.com";
}

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  ok: boolean;
  id?: string;
  error?: string;
}

/** POST an email via Resend. Resolves { ok:false, error } instead of throwing. */
export function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  return new Promise((resolve) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      resolve({ ok: false, error: "RESEND_API_KEY not configured" });
      return;
    }

    const body = JSON.stringify({
      from: getFrom(),
      to: Array.isArray(input.to) ? input.to : [input.to],
      subject: input.subject,
      html: input.html,
      ...(input.text ? { text: input.text } : {}),
      ...(input.replyTo ? { reply_to: input.replyTo } : {}),
    });

    const req = https.request(
      {
        hostname: RESEND_HOST,
        port: 443,
        path: "/emails",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "Content-Length": String(Buffer.byteLength(body)),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (c: Buffer) => { data += c.toString(); });
        res.on("end", () => {
          const status = res.statusCode ?? 0;
          if (status >= 200 && status < 300) {
            let id: string | undefined;
            try { id = JSON.parse(data).id; } catch { /* ignore */ }
            resolve({ ok: true, id });
          } else {
            logger.warn({ status, body: data.slice(0, 300) }, "Resend send failed (non-fatal)");
            resolve({ ok: false, error: `Resend ${status}: ${data.slice(0, 200)}` });
          }
        });
      },
    );

    req.on("error", (err) => {
      logger.warn({ err }, "Resend request error (non-fatal)");
      resolve({ ok: false, error: err instanceof Error ? err.message : String(err) });
    });
    req.setTimeout(10_000, () => {
      req.destroy();
      resolve({ ok: false, error: "Resend request timed out" });
    });

    req.write(body);
    req.end();
  });
}

// ── Branded HTML shell ──────────────────────────────────────────────────────

const BRAND_GREEN = "#15302a";
const BRAND_GOLD = "#b8923f";
const IVORY = "#faf7f1";

function shell(title: string, inner: string): string {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:${IVORY};font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#1f2d28;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${IVORY};padding:28px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e7e1d4;border-radius:14px;overflow:hidden;">
        <tr><td style="background:${BRAND_GREEN};padding:22px 30px;">
          <span style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:bold;color:#ffffff;letter-spacing:.5px;">Elite Tenancy</span>
          <span style="float:right;color:${BRAND_GOLD};font-size:11px;letter-spacing:2px;text-transform:uppercase;padding-top:8px;">Premium UK Lettings</span>
        </td></tr>
        <tr><td style="padding:32px 30px;">
          <h1 style="font-family:Georgia,serif;font-size:21px;color:${BRAND_GREEN};margin:0 0 16px;">${title}</h1>
          ${inner}
        </td></tr>
        <tr><td style="background:${IVORY};padding:18px 30px;border-top:1px solid #e7e1d4;">
          <p style="font-size:11px;color:#8a8275;margin:0;line-height:1.6;">Elite Tenancy Ltd · Member of The Property Ombudsman · We only charge on successful completion — no upfront fees.<br/><a href="https://www.elitetenancy.co.uk" style="color:${BRAND_GOLD};text-decoration:none;">www.elitetenancy.co.uk</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table></body></html>`;
}

function btn(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:${BRAND_GREEN};color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 26px;border-radius:8px;">${label}</a>`;
}

const esc = (s: string) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ── Templates ───────────────────────────────────────────────────────────────

export interface LeadLike {
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  source: string;
  listingTitle?: string | null;
}

/** Internal alert to the business inbox for every new enquiry. */
export function adminLeadEmail(lead: LeadLike): { subject: string; html: string } {
  const rows = [
    ["Name", lead.name],
    ["Email", lead.email],
    ["Phone", lead.phone || "—"],
    ["Source", lead.source],
    ["Listing", lead.listingTitle || "—"],
    ["Message", lead.message || "—"],
  ]
    .map(
      ([k, v]) =>
        `<tr><td style="padding:7px 12px;background:${IVORY};font-weight:600;font-size:13px;width:90px;">${k}</td><td style="padding:7px 12px;font-size:13px;border-bottom:1px solid #eee;">${esc(v as string)}</td></tr>`,
    )
    .join("");
  return {
    subject: `🔔 New ${lead.source} enquiry — ${lead.name}`,
    html: shell(
      "New enquiry received",
      `<p style="font-size:14px;line-height:1.6;margin:0 0 18px;">A new enquiry just came in via the website. Respond quickly to maximise conversion.</p>
       <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:8px;overflow:hidden;margin-bottom:22px;">${rows}</table>
       ${btn("mailto:" + esc(lead.email), "Reply to " + esc(lead.name))}`,
    ),
  };
}

/** Friendly autoresponder to the customer (needs verified domain). */
export function customerAckEmail(name: string): { subject: string; html: string } {
  return {
    subject: "We've received your enquiry — Elite Tenancy",
    html: shell(
      `Thank you, ${esc(name)}`,
      `<p style="font-size:14px;line-height:1.7;margin:0 0 16px;">Thank you for getting in touch with <strong>Elite Tenancy</strong>. Your enquiry has reached our team and a dedicated lettings specialist will be in contact within <strong>24 hours</strong>.</p>
       <p style="font-size:14px;line-height:1.7;margin:0 0 16px;">In the meantime, our AI assistant <strong>Ellie</strong> is available around the clock on our website to answer questions and surface matching homes instantly.</p>
       <p style="margin:0 0 24px;">${btn("https://www.elitetenancy.co.uk/listings", "Browse premium homes")}</p>
       <p style="font-size:13px;color:#6b6256;line-height:1.6;margin:0;">Warm regards,<br/>The Elite Tenancy Team</p>`,
    ),
  };
}

/** Admin alert when a Stripe payment dispute is opened. */
export function adminDisputeEmail(data: {
  amount: number;
  currency: string;
  referenceId?: string;
}): string {
  const amount = `£${(data.amount / 100).toFixed(2)} ${data.currency.toUpperCase()}`;
  return shell(
    "⚠️ Payment Dispute Opened — Action Required",
    `<p style="font-size:14px;line-height:1.7;margin:0 0 16px;color:#b91c1c;font-weight:600;">A payment dispute has been raised. You must submit evidence before the deadline or the funds will be automatically returned.</p>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #fee2e2;border-radius:8px;overflow:hidden;margin-bottom:22px;">
       <tr><td style="padding:7px 12px;background:#fef2f2;font-weight:600;font-size:13px;width:100px;">Amount</td><td style="padding:7px 12px;font-size:13px;border-bottom:1px solid #fee2e2;">${esc(amount)}</td></tr>
       <tr><td style="padding:7px 12px;background:#fef2f2;font-weight:600;font-size:13px;">Dispute ID</td><td style="padding:7px 12px;font-size:13px;">${esc(data.referenceId ?? "—")}</td></tr>
     </table>
     ${btn("https://dashboard.stripe.com/disputes", "View in Stripe Dashboard →")}`,
  );
}

/** Landlord onboarding email after subscription change. */
export function landlordSubscriptionEmail(name: string, planId: string): { subject: string; html: string } {
  const planLabel = planId.charAt(0).toUpperCase() + planId.slice(1);
  return {
    subject: `Your Elite Tenancy ${planLabel} plan is now active`,
    html: shell(
      `Welcome to the ${planLabel} plan, ${esc(name)}`,
      `<p style="font-size:14px;line-height:1.7;margin:0 0 16px;">Your <strong>${planLabel}</strong> subscription is now active. You can start listing premium properties and connecting with verified tenants immediately.</p>
       <p style="font-size:14px;line-height:1.7;margin:0 0 22px;">Head to your landlord dashboard to create your first listing and explore all the tools available to you.</p>
       <p style="margin:0 0 24px;">${btn("https://www.elitetenancy.co.uk/landlord/dashboard", "Go to my dashboard")}</p>
       <p style="font-size:13px;color:#6b6256;line-height:1.6;margin:0;">Questions? Our team is here to help — reply to this email any time.<br/>The Elite Tenancy Team</p>`,
    ),
  };
}

/** Landlord alert: their tenant wants to take in a lodger and needs consent. */
export function lodgerConsentRequestEmail(data: {
  landlordName: string;
  tenantName: string;
  propertyAddress: string;
  rentPcm: number;
  reviewUrl: string;
}): { subject: string; html: string } {
  return {
    subject: `${esc(data.tenantName)} would like to take in a lodger — your consent is needed`,
    html: shell(
      "A lodger consent request needs your response",
      `<p style="font-size:14px;line-height:1.7;margin:0 0 16px;">${esc(data.tenantName)}, your tenant at <strong>${esc(data.propertyAddress)}</strong>, has asked to take in a lodger at £${(data.rentPcm / 100).toFixed(0)}/month.</p>
       <p style="font-size:14px;line-height:1.7;margin:0 0 16px;">Under the Renters' Rights Act 2026, you can't unreasonably refuse a request like this — but you can still decline for genuine reasons (e.g. it would breach your mortgage or insurance terms). Please review and respond.</p>
       <p style="margin:0 0 24px;">${btn(data.reviewUrl, "Review the request")}</p>
       <p style="font-size:13px;color:#6b6256;line-height:1.6;margin:0;">The Elite Tenancy Team</p>`,
    ),
  };
}

/** Tenant notification: landlord approved or declined their lodger request. */
export function lodgerConsentDecisionEmail(data: {
  tenantName: string;
  approved: boolean;
  note?: string | null;
  dashboardUrl: string;
}): { subject: string; html: string } {
  return {
    subject: data.approved
      ? "Your landlord has approved your lodger request"
      : "Your landlord has responded to your lodger request",
    html: shell(
      data.approved ? "Good news — you're all set" : "Your landlord's response",
      `<p style="font-size:14px;line-height:1.7;margin:0 0 16px;">${esc(data.tenantName)}, your landlord has ${data.approved ? "<strong>approved</strong>" : "<strong>declined</strong>"} your request to take in a lodger.</p>
       ${data.note ? `<p style="font-size:14px;line-height:1.7;margin:0 0 16px;">Their note: "${esc(data.note)}"</p>` : ""}
       ${data.approved ? `<p style="font-size:14px;line-height:1.7;margin:0 0 16px;">You can now generate your lodger licence agreement from your dashboard.</p>` : ""}
       <p style="margin:0 0 24px;">${btn(data.dashboardUrl, "Go to my dashboard")}</p>
       <p style="font-size:13px;color:#6b6256;line-height:1.6;margin:0;">The Elite Tenancy Team</p>`,
    ),
  };
}

/** Sent immediately when a tenant books a viewing (needs verified domain). */
export function viewingConfirmationEmail(data: {
  tenantName: string;
  listingTitle: string;
  scheduledAt: Date;
  manageUrl: string;
}): { subject: string; html: string } {
  const when = formatLondonDateTime(data.scheduledAt);
  return {
    subject: `Viewing confirmed — ${data.listingTitle}, ${when}`,
    html: shell(
      `Your viewing is confirmed, ${esc(data.tenantName)}`,
      `<p style="font-size:14px;line-height:1.7;margin:0 0 16px;">You're booked in to view <strong>${esc(data.listingTitle)}</strong> on <strong>${esc(when)}</strong>.</p>
       <p style="font-size:14px;line-height:1.7;margin:0 0 22px;">We'll send you a reminder closer to the time. Need to change your mind or the time doesn't work any more? You can cancel any time.</p>
       <p style="margin:0 0 24px;">${btn(data.manageUrl, "Manage my booking")}</p>
       <p style="font-size:13px;color:#6b6256;line-height:1.6;margin:0;">See you soon,<br/>The Elite Tenancy Team</p>`,
    ),
  };
}

/** Day-before reminder (needs verified domain). */
export function viewingDayBeforeReminderEmail(data: {
  tenantName: string;
  listingTitle: string;
  scheduledAt: Date;
  manageUrl: string;
}): { subject: string; html: string } {
  const when = formatLondonDateTime(data.scheduledAt);
  return {
    subject: `Reminder: your viewing tomorrow — ${data.listingTitle}`,
    html: shell(
      `See you tomorrow, ${esc(data.tenantName)}`,
      `<p style="font-size:14px;line-height:1.7;margin:0 0 16px;">Just a reminder — your viewing of <strong>${esc(data.listingTitle)}</strong> is <strong>tomorrow, ${esc(when)}</strong>.</p>
       <p style="font-size:14px;line-height:1.7;margin:0 0 22px;">If anything's changed and you can no longer make it, please let us know as early as you can so someone else can take the slot.</p>
       <p style="margin:0 0 24px;">${btn(data.manageUrl, "View or cancel my booking")}</p>
       <p style="font-size:13px;color:#6b6256;line-height:1.6;margin:0;">The Elite Tenancy Team</p>`,
    ),
  };
}

/** Same-day reminder (needs verified domain). */
export function viewingSameDayReminderEmail(data: {
  tenantName: string;
  listingTitle: string;
  scheduledAt: Date;
  manageUrl: string;
}): { subject: string; html: string } {
  const when = formatLondonDateTime(data.scheduledAt);
  return {
    subject: `Reminder: your viewing today — ${data.listingTitle}`,
    html: shell(
      `Today's the day, ${esc(data.tenantName)}`,
      `<p style="font-size:14px;line-height:1.7;margin:0 0 16px;">Just a reminder — your viewing of <strong>${esc(data.listingTitle)}</strong> is <strong>today, ${esc(when)}</strong>.</p>
       <p style="font-size:14px;line-height:1.7;margin:0 0 22px;">Running late or can't make it after all? Please let us know as soon as you can.</p>
       <p style="margin:0 0 24px;">${btn(data.manageUrl, "View or cancel my booking")}</p>
       <p style="font-size:13px;color:#6b6256;line-height:1.6;margin:0;">The Elite Tenancy Team</p>`,
    ),
  };
}

/** Internal alert when a tenant self-cancels, so no one turns up expecting them. */
export function viewingCancelledAdminAlertEmail(data: {
  tenantName: string;
  listingTitle: string;
  scheduledAt: Date;
  cancelledBy: "tenant" | "admin";
}): { subject: string; html: string } {
  const when = formatLondonDateTime(data.scheduledAt);
  return {
    subject: `Viewing cancelled — ${esc(data.tenantName)}, ${data.listingTitle}`,
    html: shell(
      "A viewing has been cancelled",
      `<p style="font-size:14px;line-height:1.7;margin:0 0 16px;"><strong>${esc(data.tenantName)}</strong>'s viewing of <strong>${esc(data.listingTitle)}</strong>, originally <strong>${esc(when)}</strong>, has been cancelled by the ${esc(data.cancelledBy)}.</p>
       <p style="font-size:14px;line-height:1.7;margin:0;">That slot is now free again.</p>`,
    ),
  };
}

/** Post-placement review request (needs verified domain). */
export function reviewRequestEmail(name: string, reviewUrl: string): { subject: string; html: string } {
  return {
    subject: `${esc(name)}, how was your Elite Tenancy experience?`,
    html: shell(
      `We'd love your feedback, ${esc(name)}`,
      `<p style="font-size:14px;line-height:1.7;margin:0 0 16px;">We hope you're settling in beautifully. Your experience matters enormously to us — and to the next family searching for a home they'll love.</p>
       <p style="font-size:14px;line-height:1.7;margin:0 0 22px;">Would you take 30 seconds to share a quick review? It genuinely helps other tenants and landlords trust Elite Tenancy.</p>
       <p style="margin:0 0 24px;">${btn(reviewUrl, "Leave a quick review ★★★★★")}</p>
       <p style="font-size:13px;color:#6b6256;line-height:1.6;margin:0;">With gratitude,<br/>The Elite Tenancy Team</p>`,
    ),
  };
}
