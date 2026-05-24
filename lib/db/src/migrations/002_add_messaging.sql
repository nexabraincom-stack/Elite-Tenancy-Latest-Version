-- Migration 002: Real-time in-app messaging (conversations + messages)
-- Idempotent — safe to run multiple times

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
