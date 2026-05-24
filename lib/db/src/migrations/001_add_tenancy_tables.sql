-- Migration 001: add landlordId to listings + tenancy domain tables
-- Safe to run multiple times (IF NOT EXISTS / IF NOT EXISTS guards throughout)

-- Enums (ignore error if already exists)
DO $$ BEGIN
  CREATE TYPE tenancy_status AS ENUM ('active', 'expired', 'terminated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE maintenance_priority AS ENUM ('low', 'medium', 'high', 'emergency');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE maintenance_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add landlord_id to existing listings table
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS landlord_id INTEGER REFERENCES users(id);

-- Tenancies: one active tenancy links a tenant user to a listing
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

-- Maintenance requests: submitted by tenants, visible to landlords
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

-- Rent payments: historical records per tenancy
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

-- Documents: per-tenancy document store
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
