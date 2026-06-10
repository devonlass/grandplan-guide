-- Rename annual_revenue → annual_support_revenue, add licence and PS revenue fields
ALTER TABLE account_overview
  RENAME COLUMN annual_revenue TO annual_support_revenue;

ALTER TABLE account_overview
  ADD COLUMN IF NOT EXISTS annual_licence_revenue numeric,
  ADD COLUMN IF NOT EXISTS annual_ps_revenue      numeric;
