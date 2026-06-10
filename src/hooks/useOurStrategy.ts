import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { StrategyConfig, Opportunity, Threat, Advantage, TeamMember, AccountPlan } from '@/types/database';
import { fetchAllOwners, fetchCompanyTeamProperties } from '@/lib/hubspot';

// ─── Strategy Config (value prop, play, milestones) ───────────────────────────

export function useStrategyConfig(planId: string) {
  return useQuery<StrategyConfig | null>({
    queryKey: ['strategy_config', planId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategy_config')
        .select('*')
        .eq('plan_id', planId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!planId,
  });
}

export function useUpsertStrategyConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ planId, ...updates }: Partial<StrategyConfig> & { planId: string }) => {
      const { error } = await supabase
        .from('strategy_config')
        .upsert({ plan_id: planId, ...updates }, { onConflict: 'plan_id' });
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['strategy_config', variables.planId] });
    },
  });
}

// ─── Opportunities ─────────────────────────────────────────────────────────────

export function useOpportunities(planId: string) {
  return useQuery<Opportunity[]>({
    queryKey: ['opportunities', planId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('plan_id', planId)
        .order('sort_order');
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!planId,
  });
}

export function useAddOpportunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (planId: string) => {
      const { data, error } = await supabase
        .from('opportunities')
        .insert({ plan_id: planId, name: '', value: '', timeline: '', probability: '', status: 'new' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, planId) => {
      queryClient.invalidateQueries({ queryKey: ['opportunities', planId] });
    },
  });
}

export function useUpdateOpportunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, planId, ...updates }: Partial<Opportunity> & { id: string; planId: string }) => {
      const { error } = await supabase.from('opportunities').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['opportunities', variables.planId] });
    },
  });
}

export function useDeleteOpportunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, planId }: { id: string; planId: string }) => {
      const { error } = await supabase.from('opportunities').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['opportunities', variables.planId] });
    },
  });
}

// ─── Threats ───────────────────────────────────────────────────────────────────

export function useThreats(planId: string) {
  return useQuery<Threat[]>({
    queryKey: ['threats', planId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('threats')
        .select('*')
        .eq('plan_id', planId)
        .order('created_at');
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!planId,
  });
}

export function useAddThreat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (planId: string) => {
      const { data, error } = await supabase
        .from('threats')
        .insert({ plan_id: planId, competitor: '', note: '', level: 'medium' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, planId) => {
      queryClient.invalidateQueries({ queryKey: ['threats', planId] });
    },
  });
}

export function useUpdateThreat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, planId, ...updates }: Partial<Threat> & { id: string; planId: string }) => {
      const { error } = await supabase.from('threats').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['threats', variables.planId] });
    },
  });
}

export function useDeleteThreat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, planId }: { id: string; planId: string }) => {
      const { error } = await supabase.from('threats').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['threats', variables.planId] });
    },
  });
}

// ─── Advantages ────────────────────────────────────────────────────────────────

export function useAdvantages(planId: string) {
  return useQuery<Advantage[]>({
    queryKey: ['advantages', planId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('advantages')
        .select('*')
        .eq('plan_id', planId)
        .order('sort_order');
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!planId,
  });
}

export function useAddAdvantage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (planId: string) => {
      const { data, error } = await supabase
        .from('advantages')
        .insert({ plan_id: planId, text: '' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, planId) => {
      queryClient.invalidateQueries({ queryKey: ['advantages', planId] });
    },
  });
}

export function useUpdateAdvantage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, planId, text }: { id: string; planId: string; text: string }) => {
      const { error } = await supabase.from('advantages').update({ text }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['advantages', variables.planId] });
    },
  });
}

export function useDeleteAdvantage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, planId }: { id: string; planId: string }) => {
      const { error } = await supabase.from('advantages').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['advantages', variables.planId] });
    },
  });
}

// ─── Team Members ──────────────────────────────────────────────────────────────

export function useTeamMembers(planId: string) {
  return useQuery<TeamMember[]>({
    queryKey: ['team_members', planId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('plan_id', planId)
        .order('created_at');
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!planId,
  });
}

export function useAddTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (planId: string) => {
      const { data, error } = await supabase
        .from('team_members')
        .insert({ plan_id: planId, name: '', role: null })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, planId) => {
      queryClient.invalidateQueries({ queryKey: ['team_members', planId] });
    },
  });
}

export function useUpdateTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, planId, ...updates }: Partial<TeamMember> & { id: string; planId: string }) => {
      const { error } = await supabase.from('team_members').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team_members', variables.planId] });
    },
  });
}

export function useDeleteTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, planId }: { id: string; planId: string }) => {
      const { error } = await supabase.from('team_members').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team_members', variables.planId] });
    },
  });
}

// ─── Sync core team from HubSpot ───────────────────────────────────────────────

/**
 * Pulls Account Owner, CSM, TAM and SLT Sponsor from HubSpot and inserts any
 * roles not already present in team_members.
 * - AM and CSM come from the already-synced account_plans fields (no extra API call).
 * - TAM and SLT Sponsor are fetched from HubSpot company properties.
 * Returns { added, skipped } counts.
 */
export function useSyncCoreTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ plan }: { plan: AccountPlan }): Promise<{ added: number; skipped: number }> => {
      // 1. Build candidates from local plan data (no HubSpot call needed for AM + CSM)
      const candidates: { name: string; role: TeamMember['role'] }[] = [];

      if (plan.account_manager) {
        candidates.push({ name: plan.account_manager, role: 'account-manager' });
      }
      if (plan.csm) {
        candidates.push({ name: plan.csm, role: 'customer-support-manager' });
      }

      // 2. Fetch TAM + SLT Sponsor from HubSpot (only if company is linked)
      if (plan.hubspot_company_id) {
        const [teamProps, ownerMap] = await Promise.all([
          fetchCompanyTeamProperties(plan.hubspot_company_id),
          fetchAllOwners(),
        ]);

        if (teamProps.tam_id) {
          const name = ownerMap.get(teamProps.tam_id);
          if (name) candidates.push({ name, role: 'technical-account-manager' });
        }
        if (teamProps.slt_sponsor_id) {
          const name = ownerMap.get(teamProps.slt_sponsor_id);
          if (name) candidates.push({ name, role: 'slt-sponsor' });
        }
      }

      // 3. Fetch existing members to avoid duplicating roles
      const { data: existing } = await supabase
        .from('team_members')
        .select('role')
        .eq('plan_id', plan.id);

      const existingRoles = new Set((existing ?? []).map(m => m.role));

      // 4. Insert only the roles that aren't already covered
      const toInsert = candidates.filter(c => !existingRoles.has(c.role));
      const skipped  = candidates.length - toInsert.length;

      if (toInsert.length > 0) {
        const { error } = await supabase.from('team_members').insert(
          toInsert.map(c => ({ plan_id: plan.id, name: c.name, role: c.role }))
        );
        if (error) throw error;
      }

      return { added: toInsert.length, skipped };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team_members', variables.plan.id] });
    },
  });
}
