-- GrandPlan Guide – Seed Data
-- Run AFTER 001_initial_schema.sql.
-- Uses fixed UUIDs so cross-table references are consistent.

-- ─────────────────────────────────────────
-- ACCOUNT PLANS
-- ─────────────────────────────────────────
INSERT INTO account_plans (id, company, account_rank, account_manager, csm, last_updated) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Meridian Shipping Co.',      'Strategic', 'Sarah Johnson',  'David Park',      '2025-01-12T00:00:00Z'),
  ('22222222-2222-2222-2222-222222222222', 'Atlantic Maritime Group',    'Grow',      'Sarah Johnson',  'Emily Rodriguez', '2025-01-08T00:00:00Z'),
  ('33333333-3333-3333-3333-333333333333', 'Nordic Freight Lines',       'Maintain',  'James Mitchell', 'David Park',      '2024-12-20T00:00:00Z'),
  ('44444444-4444-4444-4444-444444444444', 'Pacific Trade Logistics',    'Grow',      'James Mitchell', 'Emily Rodriguez', '2024-12-15T00:00:00Z'),
  ('55555555-5555-5555-5555-555555555555', 'Global Vessel Partners',     'Micro',     'Rachel Kim',     'David Park',      '2024-11-30T00:00:00Z'),
  ('66666666-6666-6666-6666-666666666666', 'Oceanic Supply Chain Ltd.',  'Lose',      'Rachel Kim',     'Emily Rodriguez', '2025-01-10T00:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────
-- ACCOUNT OVERVIEW
-- ─────────────────────────────────────────
INSERT INTO account_overview (plan_id, company_name, industry, account_rank, health_score, annual_revenue, revenue_trend, growth_potential, vessel_count, vessel_trend, active_users, users_trend, renewal_date, account_owner, vessel_types, products) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'Meridian Shipping Co.', 'ship-owner', 'Strategic', 82,
  2400000, '+12%', 'High', 124, '+8', 847, '+23%', '2025-09-01',
  'Sarah Chen, Strategic Account Manager',
  '[{"type":"Tankers","count":42,"color":"hsl(var(--accent))"},{"type":"Bulk Carriers","count":35,"color":"hsl(var(--primary))"},{"type":"Container Ships","count":24,"color":"hsl(208, 79%, 51%)"},{"type":"Offshore Vessels","count":12,"color":"hsl(142, 71%, 45%)"},{"type":"Gas Carriers","count":8,"color":"hsl(var(--destructive))"},{"type":"Other","count":3,"color":"hsl(var(--muted-foreground))"}]',
  '[{"id":"fleet-management","label":"Fleet Management","active":true},{"id":"maintenance","label":"Maintenance & Repair","active":true},{"id":"procurement","label":"Procurement","active":true},{"id":"crewing","label":"Crewing","active":false},{"id":"hseq","label":"HSEQ","active":true},{"id":"dry-docking","label":"Dry Docking","active":false},{"id":"analytics","label":"Analytics & BI","active":true},{"id":"compliance","label":"Compliance","active":false}]'
),
('22222222-2222-2222-2222-222222222222', 'Atlantic Maritime Group',   'ship-manager', 'Grow',     71, 1800000, '+8%',  'Medium', 89,  '+5',  612, '+15%', '2025-06-01', 'Sarah Johnson',  '[]', '[]'),
('33333333-3333-3333-3333-333333333333', 'Nordic Freight Lines',       'ship-owner',   'Maintain', 65, 1200000, '+2%',  'Low',    54,  '0',   320, '+5%',  '2025-03-01', 'James Mitchell', '[]', '[]'),
('44444444-4444-4444-4444-444444444444', 'Pacific Trade Logistics',    'ship-manager', 'Grow',     74, 2100000, '+11%', 'High',   102, '+12', 745, '+20%', '2025-07-01', 'James Mitchell', '[]', '[]'),
('55555555-5555-5555-5555-555555555555', 'Global Vessel Partners',     'ship-owner',   'Micro',    48, 450000,  '-3%',  'Low',    18,  '-2',  95,  '-5%',  '2025-04-01', 'Rachel Kim',     '[]', '[]'),
('66666666-6666-6666-6666-666666666666', 'Oceanic Supply Chain Ltd.',  'land-based',   'Lose',     32, 320000,  '-15%', 'None',   0,   '0',   45,  '-30%', '2025-02-01', 'Rachel Kim',     '[]', '[]')
ON CONFLICT (plan_id) DO NOTHING;

-- ─────────────────────────────────────────
-- CUSTOMER STRATEGY
-- ─────────────────────────────────────────
INSERT INTO customer_strategy (plan_id, business_priorities, key_challenges, industry_context, budget_cycle, decision_process, procurement_approach) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  '["Expand into European markets by Q3 2025","Reduce operational costs by 15%","Launch AI-powered customer service platform"]',
  '["Legacy system integration slowing digital transformation","Talent shortage in cloud engineering","Compliance complexity in new markets"]',
  'Enterprise software sector experiencing consolidation. Key competitor TechCorp acquired smaller player last quarter, increasing pressure on Acme to accelerate innovation. Regulatory changes (GDPR 2.0) creating compliance burden but also opportunity for differentiation.',
  'October - December (FY planning)', 'Committee-based, 6-8 week cycle', 'Centralized, vendor consolidation focus'
),
('22222222-2222-2222-2222-222222222222', '["Expand fleet operations","Improve maintenance efficiency"]',          '["Budget constraints","Aging fleet management systems"]', 'Growing mid-market player looking to expand.',                     'Q3 planning',    'Manager-led decision',   'Decentralized'),
('33333333-3333-3333-3333-333333333333', '["Maintain operational stability","Control costs"]',                   '["Aging infrastructure","Staff turnover"]',               'Stable operator focused on cost containment.',                    'Q4 planning',    'Single decision maker',  'Central procurement'),
('44444444-4444-4444-4444-444444444444', '["Grow Pacific routes","Digital transformation"]',                    '["Regulatory compliance","Competition from regional players"]', 'Fast-growing logistics operator in Asia-Pacific.',             'Q2 planning',    'Committee decision',     'Hybrid procurement'),
('55555555-5555-5555-5555-555555555555', '["Maintain current operations"]',                                     '["Budget limitations","Staff constraints"]',               'Small operator with limited budget.',                             'Annual planning','Owner decision',          'Direct purchasing'),
('66666666-6666-6666-6666-666666666666', '["Evaluate alternatives","Cost reduction"]',                         '["Dissatisfied with current solution","Budget under pressure"]', 'Account at risk of churn.',                                  'Immediate',      'Board-level decision',   'Open tender')
ON CONFLICT (plan_id) DO NOTHING;

-- ─────────────────────────────────────────
-- STRATEGY CONFIG (Meridian)
-- ─────────────────────────────────────────
INSERT INTO strategy_config (plan_id, unique_value_proposition, milestones, strategic_play) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'Accelerate Acme''s European expansion with our proven compliance automation suite, reducing time-to-market by 40% while cutting regulatory risk. Unlike competitors, our platform integrates natively with their existing SAP infrastructure.',
  'Secure EU Compliance win → Build case for AI add-on → Position for license expansion at renewal',
  'land-expand'
)
ON CONFLICT (plan_id) DO NOTHING;

-- ─────────────────────────────────────────
-- OPPORTUNITIES (Meridian)
-- ─────────────────────────────────────────
INSERT INTO opportunities (plan_id, name, value, timeline, probability, status, sort_order) VALUES
  ('11111111-1111-1111-1111-111111111111', 'EU Compliance Module',          '$450K', 'Q2 2025', '75%', 'demo',          1),
  ('11111111-1111-1111-1111-111111111111', 'AI Customer Service Add-on',    '$280K', 'Q3 2025', '40%', 'new',           2),
  ('11111111-1111-1111-1111-111111111111', 'Enterprise License Expansion',  '$600K', 'Q4 2025', '60%', 'proposal-sent', 3);

-- ─────────────────────────────────────────
-- THREATS (Meridian)
-- ─────────────────────────────────────────
INSERT INTO threats (plan_id, competitor, note, level) VALUES
  ('11111111-1111-1111-1111-111111111111', 'sertica',  'Aggressive pricing, but weak on compliance', 'high'),
  ('11111111-1111-1111-1111-111111111111', 'mariapps', 'Strong in EU, pursuing this account',         'medium');

-- ─────────────────────────────────────────
-- ADVANTAGES (Meridian)
-- ─────────────────────────────────────────
INSERT INTO advantages (plan_id, text, sort_order) VALUES
  ('11111111-1111-1111-1111-111111111111', '5-year relationship, trusted advisor status', 1),
  ('11111111-1111-1111-1111-111111111111', 'Deep SAP integration expertise',              2),
  ('11111111-1111-1111-1111-111111111111', 'Proven ROI: 3.2x documented return',          3);

-- ─────────────────────────────────────────
-- TEAM MEMBERS (Meridian)
-- ─────────────────────────────────────────
INSERT INTO team_members (plan_id, name, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Sarah Chen',     'account-manager'),
  ('11111111-1111-1111-1111-111111111111', 'Michael Torres', 'technical-account-manager'),
  ('11111111-1111-1111-1111-111111111111', 'Emma Wilson',    'customer-support-manager'),
  ('11111111-1111-1111-1111-111111111111', 'David Kim',      'ps-consultant');

-- ─────────────────────────────────────────
-- STAKEHOLDERS (Meridian)
-- ─────────────────────────────────────────
INSERT INTO stakeholders (plan_id, name, title, role, sentiment, notes, last_contact, contacted_by) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Jennifer Walsh',  'Chief Technology Officer',   'Decision Maker', 'positive', 'Strong advocate for our platform. Key sponsor.',                          '2025-01-10', ''),
  ('11111111-1111-1111-1111-111111111111', 'Michael Torres',  'VP of Engineering',           'Influencer',     'positive', 'Impressed with SAP integration demo. Pushing for expansion.',             '2025-01-08', ''),
  ('11111111-1111-1111-1111-111111111111', 'Lisa Chen',       'Chief Procurement Officer',   'Influencer',     'neutral',  'Focused on cost reduction. Need ROI data for Q2.',                        '2024-12-15', ''),
  ('11111111-1111-1111-1111-111111111111', 'Robert Kim',      'Director of IT Security',     'Blocker',        'negative', 'Concerns about data residency in EU. Requires SOC2 Type II.',             '2024-12-20', ''),
  ('11111111-1111-1111-1111-111111111111', 'Amanda Foster',   'Product Manager',             'Champion',       'positive', 'Day-to-day contact. Actively promoting internally.',                      '2025-01-12', '');

-- ─────────────────────────────────────────
-- EXECUTION ACTIONS (Meridian)
-- ─────────────────────────────────────────
INSERT INTO execution_actions (plan_id, action, owner, due_date, priority, completed, hubspot_task, quarter) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Schedule executive business review with CTO Walsh',          'Sarah Chen',  '2025-01-25', 'high',   false, true,  'Q1 2025'),
  ('11111111-1111-1111-1111-111111111111', 'Prepare EU compliance ROI analysis for CPO Chen',            'Sarah Chen',  '2025-01-30', 'high',   false, true,  'Q1 2025'),
  ('11111111-1111-1111-1111-111111111111', 'Arrange SOC2 Type II documentation review with Security',   'James Miller','2025-02-05', 'medium', false, false, 'Q1 2025'),
  ('11111111-1111-1111-1111-111111111111', 'Demo AI customer service module to Product team',            'Sarah Chen',  '2025-02-15', 'medium', false, true,  'Q1 2025'),
  ('11111111-1111-1111-1111-111111111111', 'Quarterly check-in with Champion (Amanda Foster)',           'Sarah Chen',  '2025-02-01', 'low',    true,  false, 'Q1 2025');

-- ─────────────────────────────────────────
-- QUARTERLY REVIEW (Meridian – Q4 2024)
-- ─────────────────────────────────────────
INSERT INTO quarterly_reviews (plan_id, quarter, what_worked, what_didnt, review_notes, revenue_from, revenue_to, health_score_from, health_score_to, nps_from, nps_to, active_users_from, active_users_to, next_priorities) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'Q4 2024',
  '["Executive alignment session drove CTO sponsorship","Technical deep-dive with engineering built credibility","Customer success story from similar enterprise resonated"]',
  '["Underestimated security team influence; engaged too late","Initial proposal too feature-heavy, not value-focused"]',
  'Strong quarter overall. Account momentum is positive. Critical to address security concerns early in Q1 to avoid delays on EU expansion. CTO Walsh remains our strongest advocate—need to leverage this relationship for internal selling.',
  2100000, 2400000, 78, 82, 42, 48, 689, 847,
  '["Close EU Compliance deal","Neutralize security blocker","Build AI module business case"]'
);

-- ─────────────────────────────────────────
-- RISKS (Meridian)
-- ─────────────────────────────────────────
INSERT INTO risks (plan_id, risk, impact, likelihood, mitigation) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Security team blocks due to data residency concerns', 'high',   'medium', 'Proactively share EU data center roadmap; involve legal early'),
  ('11111111-1111-1111-1111-111111111111', 'Budget cuts delay Q2 expansion decision',             'high',   'low',    'Build ironclad ROI case; secure CTO commitment in writing'),
  ('11111111-1111-1111-1111-111111111111', 'Competitor CloudFirst wins EU compliance deal',       'medium', 'medium', 'Accelerate timeline; offer pilot pricing; leverage SAP advantage');

-- ─────────────────────────────────────────
-- DEPENDENCIES (Meridian)
-- ─────────────────────────────────────────
INSERT INTO dependencies (plan_id, dependency, status, owner) VALUES
  ('11111111-1111-1111-1111-111111111111', 'EU data center launch (Product team)', 'on-track', 'Product'),
  ('11111111-1111-1111-1111-111111111111', 'SOC2 Type II certification renewal',   'on-track', 'Security'),
  ('11111111-1111-1111-1111-111111111111', 'SAP integration v2.0 release',         'at-risk',  'Engineering');
