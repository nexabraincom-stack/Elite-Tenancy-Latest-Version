-- Lodger licence workflow: a tenant renting a whole property takes in a
-- lodger with the landlord's written consent, captured in-app. Legally
-- distinct from a tenancy -- the lodger is an "excluded occupier" under the
-- Protection from Eviction Act 1977, licensed by the host tenant, not the
-- landlord. The landlord's role is limited to consenting to the original
-- tenancy permitting it (Renters' Rights Act 2026 "cannot unreasonably
-- refuse" standard).

DO $$ BEGIN
  CREATE TYPE lodger_licence_status AS ENUM (
    'pending_landlord_consent',
    'consent_approved',
    'consent_declined',
    'active',
    'ended'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS lodger_licences (
  id SERIAL PRIMARY KEY,
  tenancy_id INTEGER NOT NULL REFERENCES tenancies(id),
  host_tenant_id INTEGER NOT NULL REFERENCES users(id),
  lodger_name TEXT NOT NULL,
  lodger_email TEXT NOT NULL,
  lodger_phone TEXT,
  lodger_user_id INTEGER REFERENCES users(id),
  room_description TEXT NOT NULL,
  rent_pcm INTEGER NOT NULL,
  bills_included BOOLEAN NOT NULL DEFAULT false,
  move_in_date TEXT,
  status lodger_licence_status NOT NULL DEFAULT 'pending_landlord_consent',
  landlord_consent_decided_at TIMESTAMP,
  landlord_consent_note TEXT,
  agreement_content TEXT,
  agreement_generated_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lodger_licences_tenancy ON lodger_licences(tenancy_id);
CREATE INDEX IF NOT EXISTS idx_lodger_licences_host_tenant ON lodger_licences(host_tenant_id);
