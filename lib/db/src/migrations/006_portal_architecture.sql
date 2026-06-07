-- Migration 006: Portal Architecture — 5 User Personas + Tenancy Takeover Pipeline
--               + "Who's Interested" Engine + Launch Discount Tracking
-- Idempotent — safe to run multiple times

-- ── 1. Tenant Rich Profiles ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tenant_profiles (
  id                    SERIAL PRIMARY KEY,
  user_id               INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  -- Budget (stored in pence, GBP)
  budget_min_pcm        INTEGER NOT NULL DEFAULT 0,
  budget_max_pcm        INTEGER NOT NULL,

  -- Move-in window
  target_move_in        DATE,
  flexible_move_in      BOOLEAN NOT NULL DEFAULT true,

  -- Employment
  employment_status     TEXT NOT NULL DEFAULT 'employed'
    CHECK (employment_status IN ('employed','self_employed','student','unemployed','retired','dss')),
  employer_name         TEXT,
  annual_income_pence   BIGINT,

  -- Lifestyle flags
  smoker                BOOLEAN NOT NULL DEFAULT false,
  has_pets              BOOLEAN NOT NULL DEFAULT false,
  couple                BOOLEAN NOT NULL DEFAULT false,
  has_children          BOOLEAN NOT NULL DEFAULT false,
  flatmates_ok          BOOLEAN NOT NULL DEFAULT true,

  -- Preferences
  preferred_cities      TEXT[]    NOT NULL DEFAULT '{}',
  preferred_postcodes   TEXT[]    NOT NULL DEFAULT '{}',
  room_type             TEXT      NOT NULL DEFAULT 'any'
    CHECK (room_type IN ('single','double','en_suite','studio','any')),
  furnished_pref        TEXT      NOT NULL DEFAULT 'any'
    CHECK (furnished_pref IN ('furnished','unfurnished','any')),
  bills_pref            BOOLEAN,               -- NULL = don't care
  min_term_months       INTEGER   NOT NULL DEFAULT 6,

  -- Visibility & trust
  is_active             BOOLEAN   NOT NULL DEFAULT true,
  is_verified           BOOLEAN   NOT NULL DEFAULT false,
  elite_score           INTEGER   NOT NULL DEFAULT 0
    CHECK (elite_score BETWEEN 0 AND 100),
  id_verified_at        TIMESTAMPTZ,
  income_verified_at    TIMESTAMPTZ,
  rtr_verified_at       TIMESTAMPTZ,          -- Right to Rent
  prev_landlord_ref     BOOLEAN   NOT NULL DEFAULT false,

  last_active_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tenant_profiles_active      ON tenant_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_budget      ON tenant_profiles(budget_min_pcm, budget_max_pcm);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_move_in     ON tenant_profiles(target_move_in);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_cities      ON tenant_profiles USING GIN(preferred_cities);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_postcodes   ON tenant_profiles USING GIN(preferred_postcodes);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_elite_score ON tenant_profiles(elite_score DESC);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_user        ON tenant_profiles(user_id);

-- ── 2. Landlord Extended Profiles ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS landlord_profiles (
  id                      SERIAL PRIMARY KEY,
  user_id                 INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  portfolio_size          INTEGER   NOT NULL DEFAULT 1,
  portfolio_postcodes     TEXT[]    NOT NULL DEFAULT '{}',
  hmo_licence_number      TEXT,
  hmo_expiry_date         DATE,
  gas_safety_expiry       DATE,
  epc_rating              TEXT      CHECK (epc_rating IN ('A','B','C','D','E','F','G')),
  is_accredited           BOOLEAN   NOT NULL DEFAULT false,
  accreditation_body      TEXT,                            -- NRLA|NLA|other
  preferred_tenant_types  TEXT[]    NOT NULL DEFAULT '{}', -- professional|student|dss|family
  auto_inquiry_enabled    BOOLEAN   NOT NULL DEFAULT false,
  inquiry_email           TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_landlord_profiles_user      ON landlord_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_landlord_profiles_postcodes ON landlord_profiles USING GIN(portfolio_postcodes);

-- ── 3. Letting Agent Profiles ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS letting_agent_profiles (
  id                SERIAL PRIMARY KEY,
  user_id           INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  agency_name       TEXT    NOT NULL,
  branch_id         TEXT    NOT NULL UNIQUE,   -- internal branch code
  company_reg       TEXT,                      -- Companies House number
  prs_number        TEXT,                      -- Property Redress Scheme ID
  tpo_number        TEXT,                      -- Property Ombudsman ID
  is_prs_verified   BOOLEAN NOT NULL DEFAULT false,
  max_seats         INTEGER NOT NULL DEFAULT 1,
  active_seats      INTEGER NOT NULL DEFAULT 0,
  logo_url          TEXT,
  branded_listings  BOOLEAN NOT NULL DEFAULT false,
  api_access        BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Agent sub-account seats (multi-user agency accounts)
CREATE TABLE IF NOT EXISTS agent_seats (
  id          SERIAL PRIMARY KEY,
  agency_id   INTEGER NOT NULL REFERENCES letting_agent_profiles(id) ON DELETE CASCADE,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        TEXT    NOT NULL DEFAULT 'agent'
    CHECK (role IN ('agent','manager','viewer')),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(agency_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_seats_agency ON agent_seats(agency_id);
CREATE INDEX IF NOT EXISTS idx_agent_seats_user   ON agent_seats(user_id);

-- ── 4. Home Owner (Live-in Landlord) Profiles ─────────────────────────────────
CREATE TABLE IF NOT EXISTS homeowner_profiles (
  id                         SERIAL PRIMARY KEY,
  user_id                    INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  property_type              TEXT    NOT NULL DEFAULT 'house'
    CHECK (property_type IN ('house','flat','bungalow','other')),
  total_rooms                INTEGER NOT NULL DEFAULT 1,
  available_rooms            INTEGER NOT NULL DEFAULT 1,
  -- Household composition
  household_size             INTEGER NOT NULL DEFAULT 1,
  owner_has_children         BOOLEAN NOT NULL DEFAULT false,
  owner_has_pets             BOOLEAN NOT NULL DEFAULT false,
  owner_gender               TEXT    CHECK (owner_gender IN ('male','female','non_binary','prefer_not')),
  -- Lodger preferences
  preferred_lodger_gender    TEXT    NOT NULL DEFAULT 'any'
    CHECK (preferred_lodger_gender IN ('male','female','any')),
  preferred_age_min          INTEGER NOT NULL DEFAULT 18,
  preferred_age_max          INTEGER NOT NULL DEFAULT 65,
  couples_ok                 BOOLEAN NOT NULL DEFAULT false,
  smokers_ok                 BOOLEAN NOT NULL DEFAULT false,
  pets_ok                    BOOLEAN NOT NULL DEFAULT false,
  students_ok                BOOLEAN NOT NULL DEFAULT true,
  professionals_ok           BOOLEAN NOT NULL DEFAULT true,
  dss_ok                     BOOLEAN NOT NULL DEFAULT false,
  -- Lifestyle flags
  live_in_flag               BOOLEAN NOT NULL DEFAULT true,
  quiet_household            BOOLEAN NOT NULL DEFAULT false,
  social_household           BOOLEAN NOT NULL DEFAULT false,
  remote_workers_ok          BOOLEAN NOT NULL DEFAULT true,
  bills_included             BOOLEAN NOT NULL DEFAULT true,
  rent_a_room_scheme         BOOLEAN NOT NULL DEFAULT false,  -- £7,500 tax-free scheme
  house_rules                TEXT,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_homeowner_profiles_user ON homeowner_profiles(user_id);

-- ── 5. Tenancy Takeovers (Lease Assignment Pipeline) ──────────────────────────
CREATE TABLE IF NOT EXISTS tenancy_takeovers (
  id                          SERIAL PRIMARY KEY,

  -- Parties
  assignor_user_id            INTEGER NOT NULL REFERENCES users(id),   -- outgoing tenant
  assignee_user_id            INTEGER          REFERENCES users(id),   -- incoming tenant (NULL until matched)
  landlord_user_id            INTEGER          REFERENCES users(id),
  agent_id                    INTEGER          REFERENCES letting_agent_profiles(id),
  listing_id                  INTEGER          REFERENCES listings(id),

  -- Approval workflow state machine
  approval_status             TEXT NOT NULL DEFAULT 'pending'
    CHECK (approval_status IN ('pending','landlord_review','approved','rejected','withdrawn')),
  landlord_consent_token      TEXT UNIQUE,                             -- secure 1-time link token
  consent_token_expires_at    TIMESTAMPTZ,
  landlord_consented_at       TIMESTAMPTZ,

  -- Contract financial details
  original_lease_start        DATE,
  original_lease_end          DATE,
  remaining_fixed_months      INTEGER,
  is_periodic                 BOOLEAN NOT NULL DEFAULT false,
  periodic_cycle_days         INTEGER          DEFAULT 30              -- 30 | 91 | 365
    CHECK (periodic_cycle_days IN (30, 91, 365)),
  monthly_rent_pence          BIGINT  NOT NULL,
  deposit_amount_pence        BIGINT  NOT NULL,

  -- Deed of Assignment
  deed_executed               BOOLEAN NOT NULL DEFAULT false,
  deed_executed_at            TIMESTAMPTZ,
  deed_document_url           TEXT,

  -- Deposit protection transfer
  deposit_scheme              TEXT
    CHECK (deposit_scheme IN ('DPS','TDS','MyDeposits') OR deposit_scheme IS NULL),
  deposit_transfer_initiated  BOOLEAN NOT NULL DEFAULT false,
  deposit_transfer_at         TIMESTAMPTZ,
  deposit_reference           TEXT,

  -- Room configuration snapshot (JSON)
  room_configuration          JSONB,

  -- Reminder tracking
  last_reminder_sent_at       TIMESTAMPTZ,
  reminder_count              INTEGER NOT NULL DEFAULT 0,

  notes                       TEXT,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_takeover_assignor  ON tenancy_takeovers(assignor_user_id);
CREATE INDEX IF NOT EXISTS idx_takeover_assignee  ON tenancy_takeovers(assignee_user_id);
CREATE INDEX IF NOT EXISTS idx_takeover_status    ON tenancy_takeovers(approval_status);
CREATE INDEX IF NOT EXISTS idx_takeover_token     ON tenancy_takeovers(landlord_consent_token)
  WHERE landlord_consent_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_takeover_listing   ON tenancy_takeovers(listing_id);

-- ── 6. "Who's Interested" — Tenant Interest Events ────────────────────────────
CREATE TABLE IF NOT EXISTS tenant_interests (
  id                    SERIAL PRIMARY KEY,
  tenant_user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id            INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,

  -- Type of micro-conversion
  interaction           TEXT NOT NULL DEFAULT 'interested'
    CHECK (interaction IN ('saved','interested','applied')),

  -- Affinity score computed at interest time (0.00–100.00)
  affinity_score        NUMERIC(5,2) NOT NULL DEFAULT 0,

  -- State machine: pending → seen → mutual | dismissed
  status                TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','seen','mutual','dismissed')),
  seen_by_landlord_at   TIMESTAMPTZ,
  mutual_at             TIMESTAMPTZ,

  -- Messaging gate: only unlocked after mutual interest
  messaging_unlocked    BOOLEAN NOT NULL DEFAULT false,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_user_id, listing_id)
);

CREATE INDEX IF NOT EXISTS idx_interest_listing   ON tenant_interests(listing_id, status);
CREATE INDEX IF NOT EXISTS idx_interest_tenant    ON tenant_interests(tenant_user_id);
CREATE INDEX IF NOT EXISTS idx_interest_affinity  ON tenant_interests(listing_id, affinity_score DESC)
  WHERE status NOT IN ('dismissed');

-- ── 7. Launch Discount Tracking (90-day free access) ─────────────────────────
CREATE TABLE IF NOT EXISTS launch_discounts (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  registered_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  free_until      TIMESTAMPTZ NOT NULL,       -- registered_at + 90 days
  warning_sent_at TIMESTAMPTZ,               -- Day 83 (7 days before billing)
  transitioned_at TIMESTAMPTZ,               -- when auto-moved to paid tier
  stripe_sub_id   TEXT,
  plan_id         TEXT NOT NULL DEFAULT 'starter'
);

CREATE INDEX IF NOT EXISTS idx_launch_discount_free_until ON launch_discounts(free_until)
  WHERE transitioned_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_launch_discount_warning    ON launch_discounts(warning_sent_at)
  WHERE warning_sent_at IS NULL AND transitioned_at IS NULL;
