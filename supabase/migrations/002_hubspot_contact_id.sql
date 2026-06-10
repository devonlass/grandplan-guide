-- Add hubspot_contact_id to stakeholders for deduplication on sync
ALTER TABLE stakeholders
  ADD COLUMN IF NOT EXISTS hubspot_contact_id text;

-- Index for fast lookup during upsert
CREATE INDEX IF NOT EXISTS idx_stakeholders_hubspot_contact_id
  ON stakeholders (hubspot_contact_id)
  WHERE hubspot_contact_id IS NOT NULL;
