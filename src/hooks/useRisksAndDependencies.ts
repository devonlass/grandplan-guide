import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Risk, Dependency } from '@/types/database';

// ─── Risks ─────────────────────────────────────────────────────────────────────

export function useRisks(planId: string) {
  return useQuery<Risk[]>({
    queryKey: ['risks', planId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('risks')
        .select('*')
        .eq('plan_id', planId)
        .order('created_at');
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!planId,
  });
}

export function useAddRisk() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (planId: string) => {
      const { data, error } = await supabase
        .from('risks')
        .insert({ plan_id: planId, risk: '', impact: 'medium', likelihood: 'medium', mitigation: '' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, planId) => {
      queryClient.invalidateQueries({ queryKey: ['risks', planId] });
    },
  });
}

export function useUpdateRisk() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, planId, ...updates }: Partial<Risk> & { id: string; planId: string }) => {
      const { error } = await supabase.from('risks').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['risks', variables.planId] });
    },
  });
}

export function useDeleteRisk() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, planId }: { id: string; planId: string }) => {
      const { error } = await supabase.from('risks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['risks', variables.planId] });
    },
  });
}

// ─── Dependencies ──────────────────────────────────────────────────────────────

export function useDependencies(planId: string) {
  return useQuery<Dependency[]>({
    queryKey: ['dependencies', planId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dependencies')
        .select('*')
        .eq('plan_id', planId)
        .order('created_at');
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!planId,
  });
}

export function useAddDependency() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (planId: string) => {
      const { data, error } = await supabase
        .from('dependencies')
        .insert({ plan_id: planId, dependency: '', status: 'on-track', owner: '' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, planId) => {
      queryClient.invalidateQueries({ queryKey: ['dependencies', planId] });
    },
  });
}

export function useUpdateDependency() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, planId, ...updates }: Partial<Dependency> & { id: string; planId: string }) => {
      const { error } = await supabase.from('dependencies').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dependencies', variables.planId] });
    },
  });
}

export function useDeleteDependency() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, planId }: { id: string; planId: string }) => {
      const { error } = await supabase.from('dependencies').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dependencies', variables.planId] });
    },
  });
}
