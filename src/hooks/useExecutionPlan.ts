import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ExecutionAction } from '@/types/database';

export function useExecutionActions(planId: string) {
  return useQuery<ExecutionAction[]>({
    queryKey: ['execution_actions', planId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('execution_actions')
        .select('*')
        .eq('plan_id', planId)
        .order('created_at');
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!planId,
  });
}

export function useAddExecutionAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (planId: string) => {
      const { data, error } = await supabase
        .from('execution_actions')
        .insert({ plan_id: planId, action: '', owner: '', priority: 'medium', completed: false, hubspot_task: false, quarter: 'Q1 2025' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, planId) => {
      queryClient.invalidateQueries({ queryKey: ['execution_actions', planId] });
    },
  });
}

export function useUpdateExecutionAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, planId, ...updates }: Partial<ExecutionAction> & { id: string; planId: string }) => {
      const { error } = await supabase.from('execution_actions').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['execution_actions', variables.planId] });
    },
  });
}

export function useDeleteExecutionAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, planId }: { id: string; planId: string }) => {
      const { error } = await supabase.from('execution_actions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['execution_actions', variables.planId] });
    },
  });
}
