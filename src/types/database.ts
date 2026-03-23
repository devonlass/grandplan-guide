// TypeScript types matching the Supabase database schema.

export interface VesselType {
  type: string;
  count: number;
  color: string;
}

export interface ProductModule {
  id: string;
  label: string;
  active: boolean;
}

export interface AccountPlan {
  id: string;
  company: string;
  account_rank: 'Strategic' | 'Grow' | 'Maintain' | 'Micro' | 'Lose';
  account_manager: string | null;
  csm: string | null;
  last_updated: string;
  created_at: string;
}

export interface AccountOverview {
  id: string;
  plan_id: string;
  company_name: string | null;
  industry: string | null;
  account_rank: string | null;
  health_score: number | null;
  annual_revenue: number | null;
  revenue_trend: string | null;
  growth_potential: string | null;
  vessel_count: number | null;
  vessel_trend: string | null;
  active_users: number | null;
  users_trend: string | null;
  renewal_date: string | null;
  account_owner: string | null;
  vessel_types: VesselType[];
  products: ProductModule[];
}

export interface CustomerStrategy {
  id: string;
  plan_id: string;
  business_priorities: string[];
  key_challenges: string[];
  industry_context: string | null;
  budget_cycle: string | null;
  decision_process: string | null;
  procurement_approach: string | null;
}

export interface StrategyConfig {
  id: string;
  plan_id: string;
  unique_value_proposition: string | null;
  milestones: string | null;
  strategic_play: string | null;
}

export interface Opportunity {
  id: string;
  plan_id: string;
  name: string | null;
  value: string | null;
  timeline: string | null;
  probability: string | null;
  status: 'new' | 'qualified' | 'demo' | 'proposal-sent' | 'negotiation';
  sort_order: number;
  created_at: string;
}

export interface Threat {
  id: string;
  plan_id: string;
  competitor: string | null;
  note: string | null;
  level: 'high' | 'medium' | 'low';
  created_at: string;
}

export interface Advantage {
  id: string;
  plan_id: string;
  text: string | null;
  sort_order: number;
  created_at: string;
}

export interface TeamMember {
  id: string;
  plan_id: string;
  name: string | null;
  role: 'account-manager' | 'technical-account-manager' | 'slt-sponsor' | 'customer-support-manager' | 'ps-consultant' | null;
  created_at: string;
}

export interface Stakeholder {
  id: string;
  plan_id: string;
  name: string | null;
  title: string | null;
  role: 'Decision Maker' | 'Influencer' | 'Champion' | 'Blocker' | 'User' | null;
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  notes: string | null;
  last_contact: string | null;
  contacted_by: string | null;
  created_at: string;
}

export interface ExecutionAction {
  id: string;
  plan_id: string;
  action: string | null;
  owner: string | null;
  due_date: string | null;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  hubspot_task: boolean;
  quarter: string | null;
  created_at: string;
}

export interface QuarterlyReview {
  id: string;
  plan_id: string;
  quarter: string | null;
  what_worked: string[];
  what_didnt: string[];
  review_notes: string | null;
  revenue_from: number | null;
  revenue_to: number | null;
  health_score_from: number | null;
  health_score_to: number | null;
  nps_from: number | null;
  nps_to: number | null;
  active_users_from: number | null;
  active_users_to: number | null;
  next_priorities: string[];
  created_at: string;
}

export interface Risk {
  id: string;
  plan_id: string;
  risk: string | null;
  impact: 'high' | 'medium' | 'low';
  likelihood: 'high' | 'medium' | 'low';
  mitigation: string | null;
  created_at: string;
}

export interface Dependency {
  id: string;
  plan_id: string;
  dependency: string | null;
  status: 'on-track' | 'at-risk' | 'blocked';
  owner: string | null;
  created_at: string;
}
