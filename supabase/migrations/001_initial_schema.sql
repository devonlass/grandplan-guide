-- GrandPlan Guide – Initial Schema
-- Run this in the Supabase SQL editor before seeding data.

-- ─────────────────────────────────────────
-- TABLES
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS account_plans (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company       text NOT NULL,
  account_rank  text NOT NULL CHECK (account_rank IN ('Strategic','Grow','Maintain','Micro','Lose')),
  account_manager text,
  csm           text,
  last_updated  timestamptz DEFAULT now(),
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS account_overview (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id         uuid UNIQUE NOT NULL REFERENCES account_plans(id) ON DELETE CASCADE,
  company_name    text,
  industry        text DEFAULT 'ship-owner',
  account_rank    text,
  health_score    integer DEFAULT 0,
  annual_revenue  numeric DEFAULT 0,
  revenue_trend   text,
  growth_potential text,
  vessel_count    integer DEFAULT 0,
  vessel_trend    text,
  active_users    integer DEFAULT 0,
  users_trend     text,
  renewal_date    date,
  account_owner   text,
  vessel_types    jsonb DEFAULT '[]'::jsonb,
  products        jsonb DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS customer_strategy (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id               uuid UNIQUE NOT NULL REFERENCES account_plans(id) ON DELETE CASCADE,
  business_priorities   jsonb DEFAULT '[]'::jsonb,
  key_challenges        jsonb DEFAULT '[]'::jsonb,
  industry_context      text,
  budget_cycle          text,
  decision_process      text,
  procurement_approach  text
);

CREATE TABLE IF NOT EXISTS strategy_config (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id                   uuid UNIQUE NOT NULL REFERENCES account_plans(id) ON DELETE CASCADE,
  unique_value_proposition  text,
  milestones                text,
  strategic_play            text DEFAULT 'land-expand'
);

CREATE TABLE IF NOT EXISTS opportunities (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id     uuid NOT NULL REFERENCES account_plans(id) ON DELETE CASCADE,
  name        text,
  value       text,
  timeline    text,
  probability text,
  status      text DEFAULT 'new' CHECK (status IN ('new','qualified','demo','proposal-sent','negotiation')),
  sort_order  integer DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS threats (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id    uuid NOT NULL REFERENCES account_plans(id) ON DELETE CASCADE,
  competitor text,
  note       text,
  level      text DEFAULT 'medium' CHECK (level IN ('high','medium','low')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS advantages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id    uuid NOT NULL REFERENCES account_plans(id) ON DELETE CASCADE,
  text       text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS team_members (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id    uuid NOT NULL REFERENCES account_plans(id) ON DELETE CASCADE,
  name       text,
  role       text CHECK (role IN ('account-manager','technical-account-manager','slt-sponsor','customer-support-manager','ps-consultant')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stakeholders (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id      uuid NOT NULL REFERENCES account_plans(id) ON DELETE CASCADE,
  name         text,
  title        text,
  role         text CHECK (role IN ('Decision Maker','Influencer','Champion','Blocker','User')),
  sentiment    text DEFAULT 'neutral' CHECK (sentiment IN ('positive','neutral','negative')),
  notes        text,
  last_contact date,
  contacted_by text,
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS execution_actions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id      uuid NOT NULL REFERENCES account_plans(id) ON DELETE CASCADE,
  action       text,
  owner        text,
  due_date     date,
  priority     text DEFAULT 'medium' CHECK (priority IN ('high','medium','low')),
  completed    boolean DEFAULT false,
  hubspot_task boolean DEFAULT false,
  quarter      text,
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quarterly_reviews (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id            uuid NOT NULL REFERENCES account_plans(id) ON DELETE CASCADE,
  quarter            text,
  what_worked        jsonb DEFAULT '[]'::jsonb,
  what_didnt         jsonb DEFAULT '[]'::jsonb,
  review_notes       text,
  revenue_from       numeric,
  revenue_to         numeric,
  health_score_from  integer,
  health_score_to    integer,
  nps_from           integer,
  nps_to             integer,
  active_users_from  integer,
  active_users_to    integer,
  next_priorities    jsonb DEFAULT '[]'::jsonb,
  created_at         timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS risks (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id    uuid NOT NULL REFERENCES account_plans(id) ON DELETE CASCADE,
  risk       text,
  impact     text DEFAULT 'medium' CHECK (impact IN ('high','medium','low')),
  likelihood text DEFAULT 'medium' CHECK (likelihood IN ('high','medium','low')),
  mitigation text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dependencies (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id    uuid NOT NULL REFERENCES account_plans(id) ON DELETE CASCADE,
  dependency text,
  status     text DEFAULT 'on-track' CHECK (status IN ('on-track','at-risk','blocked')),
  owner      text,
  created_at timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────

ALTER TABLE account_plans       ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_overview    ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_strategy   ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_config     ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities       ENABLE ROW LEVEL SECURITY;
ALTER TABLE threats             ENABLE ROW LEVEL SECURITY;
ALTER TABLE advantages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members        ENABLE ROW LEVEL SECURITY;
ALTER TABLE stakeholders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_actions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarterly_reviews   ENABLE ROW LEVEL SECURITY;
ALTER TABLE risks               ENABLE ROW LEVEL SECURITY;
ALTER TABLE dependencies        ENABLE ROW LEVEL SECURITY;

-- Authenticated users have full access (team-wide, no per-user scoping)
CREATE POLICY "auth_all_account_plans"      ON account_plans      FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_account_overview"   ON account_overview   FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_customer_strategy"  ON customer_strategy  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_strategy_config"    ON strategy_config    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_opportunities"      ON opportunities      FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_threats"            ON threats            FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_advantages"         ON advantages         FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_team_members"       ON team_members       FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_stakeholders"       ON stakeholders       FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_execution_actions"  ON execution_actions  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_quarterly_reviews"  ON quarterly_reviews  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_risks"              ON risks              FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_dependencies"       ON dependencies       FOR ALL TO authenticated USING (true) WITH CHECK (true);
