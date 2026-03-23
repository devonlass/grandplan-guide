import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { StrategyConfig, Opportunity, Threat, Advantage, TeamMember } from '@/types/database';

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
