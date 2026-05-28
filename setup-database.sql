-- ============================================================
-- Elite Tenancy — Full Database Setup Script
-- Run this ONCE in Neon Console SQL Editor
-- Safe to re-run (all statements use IF NOT EXISTS)
-- ============================================================

-- ── Enums ────────────────────────────────────────────────────
DO $$ BEGIN CREATE TYPE listing_status AS ENUM ('active', 'let', 'pending', 'withdrawn'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'closed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('tenant', 'landlord', 'admin'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE tenancy_status AS ENUM ('active', 'expired', 'terminated'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE maintenance_priority AS ENUM ('low', 'medium', 'high', 'emergency'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE maintenance_status AS ENUM ('open', 'in_progress', 'resolved', 'closed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Core Tables ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  clerk_id      TEXT UNIQUE,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  role          user_role NOT NULL DEFAULT 'tenant',
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS listings (
  id               SERIAL PRIMARY KEY,
  landlord_id      INTEGER REFERENCES users(id),
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  description      TEXT NOT NULL,
  price            INTEGER NOT NULL,
  price_period     TEXT NOT NULL DEFAULT 'month',
  category         TEXT NOT NULL DEFAULT 'flat',
  city             TEXT NOT NULL,
  postcode         TEXT NOT NULL,
  address_line1    TEXT NOT NULL DEFAULT '',
  bedrooms         INTEGER NOT NULL DEFAULT 1,
  bathrooms        INTEGER NOT NULL DEFAULT 1,
  floor_area_sqm   INTEGER,
  furnished        BOOLEAN NOT NULL DEFAULT false,
  pets_allowed     BOOLEAN NOT NULL DEFAULT false,
  bills_included   BOOLEAN NOT NULL DEFAULT false,
  status           listing_status NOT NULL DEFAULT 'active',
  is_featured      BOOLEAN NOT NULL DEFAULT false,
  is_premium       BOOLEAN NOT NULL DEFAULT false,
  photos           TEXT[] NOT NULL DEFAULT '{}',
  ai_match_score   INTEGER,
  available_from   TEXT,
  view_count       INTEGER NOT NULL DEFAULT 0,
  enquiry_count    INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leads (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  message       TEXT,
  listing_id    INTEGER,
  listing_title TEXT,
  status        lead_status NOT NULL DEFAULT 'new',
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_articles (
  id                 SERIAL PRIMARY KEY,
  title              TEXT NOT NULL,
  slug               TEXT NOT NULL UNIQUE,
  excerpt            TEXT NOT NULL,
  content            TEXT NOT NULL,
  category           TEXT NOT NULL,
  author             TEXT NOT NULL,
  image_url          TEXT,
  read_time_minutes  INTEGER NOT NULL DEFAULT 5,
  tags               TEXT[] NOT NULL DEFAULT '{}',
  published_at       TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at         TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Tenancy Domain ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tenancies (
  id               SERIAL PRIMARY KEY,
  tenant_id        INTEGER NOT NULL REFERENCES users(id),
  landlord_id      INTEGER NOT NULL REFERENCES users(id),
  listing_id       INTEGER NOT NULL REFERENCES listings(id),
  monthly_rent     INTEGER NOT NULL,
  deposit_amount   INTEGER NOT NULL,
  lease_start      TEXT NOT NULL,
  lease_end        TEXT NOT NULL,
  tenancy_type     TEXT NOT NULL DEFAULT 'Assured Shorthold Tenancy',
  status           tenancy_status NOT NULL DEFAULT 'active',
  created_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS maintenance_requests (
  id               SERIAL PRIMARY KEY,
  tenant_id        INTEGER NOT NULL REFERENCES users(id),
  tenancy_id       INTEGER REFERENCES tenancies(id),
  listing_id       INTEGER REFERENCES listings(id),
  title            TEXT NOT NULL,
  description      TEXT NOT NULL,
  category         TEXT NOT NULL,
  priority         maintenance_priority NOT NULL DEFAULT 'medium',
  status           maintenance_status NOT NULL DEFAULT 'open',
  property_address TEXT,
  created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rent_payments (
  id          SERIAL PRIMARY KEY,
  tenancy_id  INTEGER NOT NULL REFERENCES tenancies(id),
  due_date    TEXT NOT NULL,
  paid_date   TEXT,
  amount      INTEGER NOT NULL,
  status      TEXT NOT NULL DEFAULT 'due',
  reference   TEXT NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
  id           SERIAL PRIMARY KEY,
  tenancy_id   INTEGER NOT NULL REFERENCES tenancies(id),
  name         TEXT NOT NULL,
  type         TEXT NOT NULL,
  uploaded_at  TEXT NOT NULL,
  size         TEXT NOT NULL,
  download_url TEXT NOT NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Messaging ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id               SERIAL PRIMARY KEY,
  landlord_id      INTEGER NOT NULL REFERENCES users(id),
  tenant_id        INTEGER NOT NULL REFERENCES users(id),
  listing_id       INTEGER REFERENCES listings(id),
  last_message_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (landlord_id, tenant_id, listing_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_landlord ON conversations(landlord_id);
CREATE INDEX IF NOT EXISTS idx_conversations_tenant ON conversations(tenant_id);

CREATE TABLE IF NOT EXISTS messages (
  id               SERIAL PRIMARY KEY,
  conversation_id  INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id        INTEGER NOT NULL REFERENCES users(id),
  content          TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 4000),
  read_at          TIMESTAMP,
  created_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(conversation_id, read_at) WHERE read_at IS NULL;

-- ── Payments ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stripe_customers (
  id                 SERIAL PRIMARY KEY,
  user_id            INTEGER NOT NULL UNIQUE REFERENCES users(id),
  stripe_customer_id TEXT NOT NULL UNIQUE,
  created_at         TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS listing_payments (
  id                    SERIAL PRIMARY KEY,
  listing_id            INTEGER REFERENCES listings(id),
  landlord_id           INTEGER NOT NULL REFERENCES users(id),
  stripe_session_id     TEXT NOT NULL UNIQUE,
  stripe_payment_intent TEXT,
  tier                  TEXT NOT NULL DEFAULT 'standard',
  amount_pence          INTEGER NOT NULL,
  status                TEXT NOT NULL DEFAULT 'pending',
  created_at            TIMESTAMP NOT NULL DEFAULT NOW(),
  paid_at               TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rent_mandates (
  id                    SERIAL PRIMARY KEY,
  tenancy_id            INTEGER NOT NULL REFERENCES tenancies(id),
  tenant_id             INTEGER NOT NULL REFERENCES users(id),
  stripe_customer_id    TEXT NOT NULL,
  stripe_payment_method TEXT NOT NULL,
  status                TEXT NOT NULL DEFAULT 'active',
  created_at            TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS completion_invoices (
  id                SERIAL PRIMARY KEY,
  tenancy_id        INTEGER NOT NULL REFERENCES tenancies(id),
  landlord_id       INTEGER NOT NULL REFERENCES users(id),
  stripe_invoice_id TEXT,
  amount_pence      INTEGER NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending',
  created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
  paid_at           TIMESTAMP
);

CREATE TABLE IF NOT EXISTS managed_subscriptions (
  id                     SERIAL PRIMARY KEY,
  tenancy_id             INTEGER NOT NULL REFERENCES tenancies(id),
  landlord_id            INTEGER NOT NULL REFERENCES users(id),
  stripe_subscription_id TEXT,
  management_fee_percent INTEGER NOT NULL DEFAULT 8,
  status                 TEXT NOT NULL DEFAULT 'active',
  created_at             TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS property_inspections (
  id              SERIAL PRIMARY KEY,
  tenancy_id      INTEGER NOT NULL REFERENCES tenancies(id),
  scheduled_date  TEXT NOT NULL,
  inspector_name  TEXT,
  status          TEXT NOT NULL DEFAULT 'scheduled',
  notes           TEXT,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS compliance_items (
  id              SERIAL PRIMARY KEY,
  listing_id      INTEGER NOT NULL REFERENCES listings(id),
  landlord_id     INTEGER NOT NULL REFERENCES users(id),
  type            TEXT NOT NULL,
  expiry_date     TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'valid',
  certificate_url TEXT,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listing_payments_landlord ON listing_payments(landlord_id);
CREATE INDEX IF NOT EXISTS idx_completion_invoices_landlord ON completion_invoices(landlord_id);
CREATE INDEX IF NOT EXISTS idx_managed_subs_landlord ON managed_subscriptions(landlord_id);
CREATE INDEX IF NOT EXISTS idx_compliance_landlord ON compliance_items(landlord_id);

-- ── Done ──────────────────────────────────────────────────────
SELECT 'Database setup complete. Tables created: ' || count(*)::text || ' tables.'
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
