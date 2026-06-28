# Ellie Intelligence System
## Elite Tenancy — Reputation & Automation Stack

> **Total saving: £111/month** — NiceJob (£60) + Cloutly (£22) + BrightLocal citations (£29)
> Built entirely on your existing tech stack. Zero new subscriptions.

---

## What's Already Built (activate with env vars only)

| Feature | Route | Status | Replaces |
|---|---|---|---|
| Review request email (day 7) | `GET /api/reviews/run-daily` | ✅ Live — cron 10:00 UTC | NiceJob email |
| 24h lead WhatsApp follow-up | `GET /api/automations/run-follow-ups` | ✅ Live — cron 08:00 UTC | NiceJob SMS |
| Ellie on website | `POST /api/ellie/chat` | ✅ Live | — |
| Ellie on WhatsApp | `POST /api/whatsapp/webhook` | ✅ Built — needs WA env vars | — |
| Lead auto-capture from chat | Inside `ellie.ts` | ✅ Live | — |

## What Was Just Built (deploy to activate)

| Feature | Route | Status | Replaces |
|---|---|---|---|
| Review WA request + 14/30-day follow-ups | `GET /api/reviews/run-followup` | 🆕 New — cron 10:30 UTC | NiceJob full sequence |
| GBP review monitoring | `GET /api/reputation/reviews` | 🆕 New — needs GBP env vars | Cloutly |
| AI review reply drafting | `POST /api/reputation/reviews/:id/draft` | 🆕 New — free AI, works now | Cloutly AI replies |
| Post reply to GBP | `POST /api/reputation/reviews/:id/reply` | 🆕 New — needs GBP env vars | Cloutly |
| NAP directory audit | `GET /api/reputation/nap` | 🆕 New — always available | BrightLocal citations |
| GBP social post (AI draft) | `POST /api/reputation/social/draft` | 🆕 New — free AI, works now | Social scheduling tool |
| GBP social post (publish) | `POST /api/reputation/social` | 🆕 New — needs GBP env vars | Social scheduling tool |
| Reputation health check | `GET /api/reputation/health` | 🆕 New — always available | — |

---

## Free AI Provider Chain (lib/ai.ts)

Ellie's AI uses a **4-provider free chain** — tries each in order, falls through to the next on failure:

```
1. Groq       — Llama 3.3 70B   — FREE (14,400 requests/day)  → GROQ_API_KEY
2. Gemini     — 2.5 Flash       — FREE (1M context)            → GEMINI_API_KEY
3. Cerebras   — Llama 3.3 70B   — FREE (1M tokens/day)         → CEREBRAS_API_KEY
4. OpenRouter — Llama 3.3 70B   — FREE tier                    → OPENROUTER_API_KEY
5. Vercel GW  — Llama 4 Maverick — paid fallback               → AI_GATEWAY_API_KEY ✅ already set
```

**To activate free providers:** Set any of these in Vercel Backend → Settings → Environment Variables.
Get keys at: console.groq.com | aistudio.google.com | cloud.cerebras.ai | openrouter.ai

---

## Env Vars Setup Checklist

### Phase 1 — Already Live (just verify these are set)
```
RESEND_API_KEY              resend.com free tier (3,000 emails/month)
AI_GATEWAY_API_KEY          already set ✅
WHATSAPP_ACCESS_TOKEN       Meta Business Suite → System Users → Access Token
WHATSAPP_PHONE_NUMBER_ID    Meta Business Suite → Phone Number → ID
WHATSAPP_VERIFY_TOKEN       any secret string you invent
```

### Phase 2 — Review Automation (set these now)
```
REVIEW_URL                  Your Google review link
                            Find: business.google.com → Get more reviews → copy link
                            Format: https://g.page/r/XXXXXXXXXXXXXXXXXX/review
                            ⚠️ Only available AFTER GBP verification is complete

REVIEW_TRIGGER_TOKEN        any secret string (protects POST /api/reviews/request)
                            Example: generate with: openssl rand -hex 32
```

### Phase 3 — GBP Direct Integration (set after GBP is verified)
```
GBP_LOCATION_NAME           accounts/{accountId}/locations/{locationId}
                            Find: business.google.com → ⋮ → Business Profile settings → Advanced settings

GBP_ACCESS_TOKEN            OAuth 2.0 token — generate at:
                            https://developers.google.com/oauthplayground
                            Step 1: Find "Google My Business API v4" → authorize
                            Step 2: Exchange code for tokens → copy access_token
                            ⚠️ Expires in 1 hour — set refresh token below to avoid manual renewal

GBP_REFRESH_TOKEN           from same OAuth Playground flow (copy refresh_token)
GBP_CLIENT_ID               Google Cloud Console → APIs & Services → Credentials → OAuth client ID
GBP_CLIENT_SECRET           same OAuth client → copy client secret
```

### Phase 4 — Free AI Providers (add any to boost capacity)
```
GROQ_API_KEY                console.groq.com — free, no card
GEMINI_API_KEY              aistudio.google.com → Get API key — free
CEREBRAS_API_KEY            cloud.cerebras.ai — free tier
OPENROUTER_API_KEY          openrouter.ai → Keys — free models available
```

---

## Review Request Sequence (NiceJob replacement)

```
Tenant signs tenancy agreement → enters tenanciesTable (status=active)

Day 7  — run-daily cron (10:00 UTC)
         → sends review request EMAIL (Resend)
         → sends review request WHATSAPP (if phone in leadsTable)
         → marks tenanciesTable.reviewRequestedAt = NOW()

Day 14 — run-followup cron (10:30 UTC)
         → finds tenancies where reviewRequestedAt was 7-9 days ago
         → sends WHATSAPP follow-up (shorter, warmer message)

Day 30 — run-followup cron (10:30 UTC)
         → finds tenancies where reviewRequestedAt was 21-24 days ago
         → sends FINAL WHATSAPP nudge (last one, we promise!)
```

**Key:** WhatsApp messages only send if the tenant's phone was captured anywhere in leadsTable (Ellie chat lead capture, contact form, n8n webhook). No schema change needed.

---

## Review Monitoring + Reply Workflow (Cloutly replacement)

```
Admin Dashboard → GET /api/reputation/reviews
  ↓
Lists all GBP reviews (sorted: unanswered first, then newest)
Shows: reviewer name, stars, comment, age, reply status

For each unanswered review:
  POST /api/reputation/reviews/:reviewId/draft
    body: { reviewText, reviewerName, starRating }
    ↓ Free AI drafts a reply (tone adjusts to star rating)
    ↓ Returns draft text

Admin edits draft if needed, then:
  POST /api/reputation/reviews/:reviewId/reply
    body: { comment: "..." }
    ↓ Posts reply directly to GBP via API
```

---

## NAP Audit (BrightLocal citations replacement)

`GET /api/reputation/nap` returns:

- **Canonical NAP**: The single source of truth for your business info
- **18 directories** categorised by priority (critical/high/medium/low)
- **Edit URL** for each directory (click → go directly to the edit page)
- **Consistency score**: percentage of directories verified
- **Next 5 actions**: your prioritised to-do list

**Update status:** When you verify a directory, change its `status` to `"verified"` in `reputation.ts` and redeploy. Admin UI tracking is on the roadmap.

**What BrightLocal does that this doesn't:** BrightLocal can AUTO-PUSH your NAP to directories via their paid partnerships with Yext/Neustar/Localeze data networks. This cannot be replicated for free. Manual updates (or Yext at £39/mo) are the only free-tier options. For 1 location, manual is fine.

---

## GBP Social Posts (scheduling tool replacement)

```
POST /api/reputation/social/draft
  body: {
    postType: "listing" | "legal_update" | "company_news" | "local_tip",
    listingTitle: "2-bed flat in East Ham",
    listingCity: "East Ham",
    listingPrice: 1400,
    listingType: "flat"
  }
  → AI generates 150-250 word GBP post
  → Returns draft + character count

POST /api/reputation/social
  body: {
    summary: "...",
    callToActionUrl: "https://www.elitetenancy.co.uk/listings",
    callToActionType: "LEARN_MORE"  // or BOOK, ORDER, SHOP, SIGN_UP, CALL
  }
  → Publishes directly to GBP
```

---

## Ellie's Role in the Reputation System

Ellie (the website chatbot) feeds the reputation system in 3 ways:

1. **Lead phone capture** — when tenants chat with Ellie and share their phone number, it's saved to leadsTable. The review automation then uses this phone for WhatsApp sends. No manual input needed.

2. **Review intent detection** — if a tenant mentions a negative experience in chat, Ellie escalates to phone/email and a complaint is flagged before it becomes a Google review.

3. **WhatsApp continuity** — Ellie runs on WhatsApp too (same brain). If a tenant replies to the review WhatsApp asking about something else, Ellie handles it with full context.

---

## Cost Comparison

| Tool | Cost | Ellie equivalent | Cost |
|---|---|---|---|
| NiceJob | £60/mo | reviews.ts + automations.ts + WhatsApp lib | £0 |
| Cloutly | £22/mo | reputation.ts (GBP API + AI drafts) | £0 |
| BrightLocal (citations) | £29/mo | reputation.ts NAP audit + manual | £0 |
| Birdeye (full) | £235+/mo | All of the above combined | £0 |
| **Total saved** | **£111–£235/mo** | **Ellie Intelligence System** | **£0** |

The only cost is Resend (3,000 free emails/month, then £15/mo for 50k) and AI tokens (Groq/Gemini/Cerebras are free; Vercel Gateway is the paid fallback already configured).

---

## Files Modified

```
artifacts/api-server/src/routes/reputation.ts   ← NEW  — GBP + AI + NAP audit
artifacts/api-server/src/routes/reviews.ts       ← UPDATED — WhatsApp + 3-step sequence
artifacts/api-server/src/routes/index.ts         ← UPDATED — registers reputationRouter
artifacts/api-server/vercel.json                 ← UPDATED — adds run-followup cron at 10:30 UTC
```
