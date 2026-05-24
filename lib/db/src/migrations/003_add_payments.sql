-- Migration 003: Stripe payment records + managed lettings
-- Idempotent — safe to run multiple times

-- Stripe customer records (one per user)
CREATE TABLE IF NOT EXISTS stripe_customers (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL UNIQUE REFERENCES users(id),
  stripe_customer_id TEXT NOT NULL UNIQUE,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Listing payment transactions (landlord pays to list)
CREATE TABLE IF NOT EXISTS listing_payments (
  id                    SERIAL PRIMARY KEY,
  listing_id            INTEGER REFERENCES listings(id),
  landlord_id           INTEGER NOT NULL REFERENCES users(id),
  stripe_session_id     TEXT NOT NULL UNIQUE,
  stripe_payment_intent TEXT,
  tier                  TEXT NOT NULL DEFAULT 'standard', -- standard | professional | premium
  amount_pence          INTEGER NOT NULL,
  status                TEXT NOT NULL DEFAULT 'pending', -- pending | paid | refunded
  created_at            TIMESTAMP NOT NULL DEFAULT NOW(),
  paid_at               TIMESTAMP
);

-- Stripe BACS Direct Debit mandates (tenant rent collection)
CREATE TABLE IF NOT EXISTS rent_mandates (
  id                    SERIAL PRIMARY KEY,
  tenancy_id            INTEGER NOT NULL REFERENCES tenancies(id),
  tenant_id             INTEGER NOT NULL REFERENCES users(id),
  stripe_customer_id    TEXT NOT NULL,
  stripe_payment_method TEXT NOT NULL,
  status                TEXT NOT NULL DEFAULT 'active', -- active | cancelled | expired
  created_at            TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Completion fee invoices (charged to landlord when tenancy confirmed)
CREATE TABLE IF NOT EXISTS completion_invoices (
  id                    SERIAL PRIMARY KEY,
  tenancy_id            INTEGER NOT NULL REFERENCES tenancies(id),
  landlord_id           INTEGER NOT NULL REFERENCES users(id),
  stripe_invoice_id     TEXT,
  amount_pence          INTEGER NOT NULL,
  status                TEXT NOT NULL DEFAULT 'pending', -- pending | sent | paid
  created_at            TIMESTAMP NOT NULL DEFAULT NOW(),
  paid_at               TIMESTAMP
);

-- Managed lettings subscriptions
CREATE TABLE IF NOT EXISTS managed_subscriptions (
  id                    SERIAL PRIMARY KEY,
  tenancy_id            INTEGER NOT NULL REFERENCES tenancies(id),
  landlord_id           INTEGER NOT NULL REFERENCES users(id),
  stripe_subscription_id TEXT,
  management_fee_percent INTEGER NOT NULL DEFAULT 8, -- 8% of monthly rent (matches public pricing)
  status                TEXT NOT NULL DEFAULT 'active', -- active | paused | cancelled
  created_at            TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Managed property inspections
CREATE TABLE IF NOT EXISTS property_inspections (
  id                    SERIAL PRIMARY KEY,
  tenancy_id            INTEGER NOT NULL REFERENCES tenancies(id),
  scheduled_date        TEXT NOT NULL,
  inspector_name        TEXT,
  status                TEXT NOT NULL DEFAULT 'scheduled', -- scheduled | completed | cancelled
  notes                 TEXT,
  created_at            TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Compliance items (Gas Safe, EICR, EPC)
CREATE TABLE IF NOT EXISTS compliance_items (
  id                    SERIAL PRIMARY KEY,
  listing_id            INTEGER NOT NULL REFERENCES listings(id),
  landlord_id           INTEGER NOT NULL REFERENCES users(id),
  type                  TEXT NOT NULL, -- gas_safe | eicr | epc | fire_alarm | co_detector
  expiry_date           TEXT NOT NULL,
  status                TEXT NOT NULL DEFAULT 'valid', -- valid | expiring_soon | expired
  certificate_url       TEXT,
  created_at            TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listing_payments_landlord ON listing_payments(landlord_id);
CREATE INDEX IF NOT EXISTS idx_completion_invoices_landlord ON completion_invoices(landlord_id);
CREATE INDEX IF NOT EXISTS idx_managed_subs_landlord ON managed_subscriptions(landlord_id);
CREATE INDEX IF NOT EXISTS idx_compliance_landlord ON compliance_items(landlord_id);
