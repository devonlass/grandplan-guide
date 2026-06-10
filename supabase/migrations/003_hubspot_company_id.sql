-- Add hubspot_company_id to account_plans for deduplication during HubSpot import
ALTER TABLE account_plans
  ADD COLUMN IF NOT EXISTS hubspot_company_id text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_account_plans_hubspot_company_id
  ON account_plans (hubspot_company_id)
  WHERE hubspot_company_id IS NOT NULL;
