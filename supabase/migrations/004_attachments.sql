-- Attachments table: stores file metadata for account plan documents.
-- Files can come from HubSpot (synced via hs_attachment_ids / contract property)
-- or be uploaded manually in the UI.

CREATE TABLE IF NOT EXISTS attachments (
  id                uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id           uuid        NOT NULL REFERENCES account_plans(id) ON DELETE CASCADE,
  name              text        NOT NULL,
  url               text,                        -- direct or signed download URL
  hubspot_file_id   text,                        -- HubSpot file ID (null for manual uploads)
  file_type         text,                        -- 'document' | 'image' | 'other'
  file_size         bigint,                      -- bytes
  source            text        NOT NULL DEFAULT 'manual',  -- 'hubspot' | 'manual'
  uploaded_at       timestamptz DEFAULT now(),
  created_at        timestamptz DEFAULT now()
);

-- Prevent duplicate HubSpot files per plan
CREATE UNIQUE INDEX IF NOT EXISTS idx_attachments_hubspot_file
  ON attachments (plan_id, hubspot_file_id)
  WHERE hubspot_file_id IS NOT NULL;

-- Fast lookup by plan
CREATE INDEX IF NOT EXISTS idx_attachments_plan_id
  ON attachments (plan_id);

ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage attachments"
  ON attachments FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
