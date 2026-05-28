-- Migration 004: Stripe Connect marketplace + landlord subscription tiers
--               + refunds + disputes tracking
-- Idempotent — safe to run multiple times

-- ── Stripe Connect: landlord connected accounts (marketplace payouts) ─────────
CREATE TABLE IF NOT EXISTS landlord_connect_accounts (
  id                        SERIAL PRIMARY KEY,
  landlord_id               INTEGER NOT NULL UNIQUE REFERENCES users(id),
  stripe_connect_account_id TEXT NOT NULL UNIQUE,
  onboarding_complete       BOOLEAN NOT NULL DEFAULT false,
  payouts_enabled           BOOLEAN NOT NULL DEFAULT false,
  created_at                TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Connect transfers (payouts to landlords) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS connect_transfers (
  id                  SERIAL PRIMARY KEY,
  tenancy_id          INTEGER REFERENCES tenancies(id),
  landlord_id         INTEGER NOT NULL REFERENCES users(id),
  stripe_transfer_id  TEXT NOT NULL UNIQUE,
  amount_pence        INTEGER NOT NULL,
  status              TEXT NOT NULL DEFAULT 'pending', -- pending | paid | failed
  created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Landlord subscription plans (blueprint tiers: £19/49/99/199/mo) ──────────
CREATE TABLE IF NOT EXISTS landlord_subscriptions (
  id                      SERIAL PRIMARY KEY,
  landlord_id             INTEGER NOT NULL REFERENCES users(id),
  stripe_subscription_id  TEXT NOT NULL UNIQUE,
  plan_id                 TEXT NOT NULL, -- starter | growth | pro | elite
  status                  TEXT NOT NULL DEFAULT 'active', -- active | trialing | past_due | cancelled
  current_period_end      TIMESTAMP,
  cancel_at_period_end    BOOLEAN NOT NULL DEFAULT false,
  created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Payment refunds ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payment_refunds (
  id                      SERIAL PRIMARY KEY,
  landlord_id             INTEGER REFERENCES users(id),
  stripe_refund_id        TEXT NOT NULL UNIQUE,
  stripe_payment_intent   TEXT,
  amount_pence            INTEGER NOT NULL,
  reason                  TEXT, -- duplicate | fraudulent | requested_by_customer
  status                  TEXT NOT NULL DEFAULT 'pending', -- pending | succeeded | failed
  created_at              TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Payment disputes (chargebacks) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payment_disputes (
  id                      SERIAL PRIMARY KEY,
  landlord_id             INTEGER REFERENCES users(id),
  stripe_dispute_id       TEXT NOT NULL UNIQUE,
  stripe_payment_intent   TEXT,
  amount_pence            INTEGER NOT NULL,
  reason                  TEXT,
  status                  TEXT NOT NULL DEFAULT 'needs_response',
  due_by                  TIMESTAMP,
  created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Stripe price IDs for subscription plans (admin reference) ─────────────────
-- Populated manually after creating products in Stripe Dashboard
CREATE TABLE IF NOT EXISTS stripe_price_catalogue (
  id              SERIAL PRIMARY KEY,
  plan_id         TEXT NOT NULL UNIQUE, -- starter | growth | pro | elite
  stripe_price_id TEXT NOT NULL,
  amount_pence    INTEGER NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'gbp',
  interval        TEXT NOT NULL DEFAULT 'month',
  active          BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_connect_accounts_landlord   ON landlord_connect_accounts(landlord_id);
CREATE INDEX IF NOT EXISTS idx_connect_transfers_landlord  ON connect_transfers(landlord_id);
CREATE INDEX IF NOT EXISTS idx_landlord_subs_landlord      ON landlord_subscriptions(landlord_id);
CREATE INDEX IF NOT EXISTS idx_landlord_subs_status        ON landlord_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payment_refunds_landlord    ON payment_refunds(landlord_id);
CREATE INDEX IF NOT EXISTS idx_payment_disputes_status     ON payment_disputes(status);
