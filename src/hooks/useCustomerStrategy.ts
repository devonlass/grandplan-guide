import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { CustomerStrategy } from '@/types/database';

export function useCustomerStrategy(planId: string) {
  return useQuery<CustomerStrategy | null>({
    queryKey: ['customer_strategy', planId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_strategy')
        .select('*')
        .eq('plan_id', planId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!planId,
  });
}

export function useUpdateCustomerStrategy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ planId, ...updates }: Partial<CustomerStrategy> & { planId: string }) => {
      const { error } = await supabase
        .from('customer_strategy')
        .update(updates)
        .eq('plan_id', planId);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer_strategy', variables.planId] });
    },
  });
}
