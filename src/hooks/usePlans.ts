import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { AccountPlan } from '@/types/database';

export function usePlans() {
  return useQuery<AccountPlan[]>({
    queryKey: ['plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('account_plans')
        .select('*')
        .order('last_updated', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function usePlan(id: string | undefined) {
  return useQuery<AccountPlan | null>({
    queryKey: ['plans', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('account_plans')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}
