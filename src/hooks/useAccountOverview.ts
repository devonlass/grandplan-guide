import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { AccountOverview } from '@/types/database';

export function useAccountOverview(planId: string) {
  return useQuery<AccountOverview | null>({
    queryKey: ['account_overview', planId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('account_overview')
        .select('*')
        .eq('plan_id', planId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!planId,
  });
}

export function useUpdateAccountOverview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ planId, ...updates }: Partial<AccountOverview> & { planId: string }) => {
      const { error } = await supabase
        .from('account_overview')
        .update(updates)
        .eq('plan_id', planId);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['account_overview', variables.planId] });
    },
  });
}
