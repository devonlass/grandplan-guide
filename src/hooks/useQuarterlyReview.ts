import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { QuarterlyReview } from '@/types/database';

export function useQuarterlyReviews(planId: string) {
  return useQuery<QuarterlyReview[]>({
    queryKey: ['quarterly_reviews', planId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quarterly_reviews')
        .select('*')
        .eq('plan_id', planId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!planId,
  });
}

export function useUpsertQuarterlyReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ planId, id, ...updates }: Partial<QuarterlyReview> & { planId: string }) => {
      if (id) {
        const { error } = await supabase.from('quarterly_reviews').update(updates).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('quarterly_reviews').insert({ plan_id: planId, ...updates });
        if (error) throw error;
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quarterly_reviews', variables.planId] });
    },
  });
}
