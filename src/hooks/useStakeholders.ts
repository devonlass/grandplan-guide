import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { searchContactsByCompany, getOwner, mapContactToStakeholder } from '@/lib/hubspot';
import type { Stakeholder } from '@/types/database';

export function useStakeholders(planId: string) {
  return useQuery<Stakeholder[]>({
    queryKey: ['stakeholders', planId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stakeholders')
        .select('*')
        .eq('plan_id', planId)
        .order('created_at');
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!planId,
  });
}

export function useAddStakeholder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (planId: string) => {
      const { data, error } = await supabase
        .from('stakeholders')
        .insert({ plan_id: planId, name: '', title: '', role: 'Influencer', sentiment: 'neutral', notes: '', contacted_by: '' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, planId) => {
      queryClient.invalidateQueries({ queryKey: ['stakeholders', planId] });
    },
  });
}

export function useUpdateStakeholder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, planId, ...updates }: Partial<Stakeholder> & { id: string; planId: string }) => {
      const { error } = await supabase.from('stakeholders').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stakeholders', variables.planId] });
    },
  });
}

export function useDeleteStakeholder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, planId }: { id: string; planId: string }) => {
      const { error } = await supabase.from('stakeholders').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stakeholders', variables.planId] });
    },
  });
}

/**
 * Syncs contacts from HubSpot into the stakeholders table.
 * - Searches HubSpot contacts by the plan's company name
 * - Upserts by hubspot_contact_id (adds new contacts, skips existing ones)
 * - Preserves any manual edits to role/sentiment/notes on existing rows
 */
export function useHubSpotSync() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ planId, companyName }: { planId: string; companyName: string }) => {
      // 1. Fetch contacts from HubSpot
      const contacts = await searchContactsByCompany(companyName);
      if (contacts.length === 0) return { added: 0, skipped: 0 };

      // 2. Resolve owner names (batch — one owner lookup per unique owner ID)
      const ownerIds = [...new Set(contacts.map(c => c.properties.hubspot_owner_id).filter(Boolean))] as string[];
      const ownerMap: Record<string, string> = {};
      await Promise.all(
        ownerIds.map(async (ownerId) => {
          const owner = await getOwner(ownerId);
          if (owner) ownerMap[ownerId] = `${owner.firstName} ${owner.lastName}`.trim();
        })
      );

      // 3. Fetch existing hubspot_contact_ids for this plan to avoid duplicates
      const { data: existing } = await supabase
        .from('stakeholders')
        .select('hubspot_contact_id')
        .eq('plan_id', planId)
        .not('hubspot_contact_id', 'is', null);

      const existingIds = new Set((existing ?? []).map(r => r.hubspot_contact_id));

      // 4. Insert only new contacts
      const toInsert = contacts
        .filter(c => !existingIds.has(c.id))
        .map(c => ({
          plan_id: planId,
          ...mapContactToStakeholder(c, c.properties.hubspot_owner_id ? ownerMap[c.properties.hubspot_owner_id] : undefined),
        }));

      if (toInsert.length > 0) {
        const { error } = await supabase.from('stakeholders').insert(toInsert);
        if (error) throw error;
      }

      return { added: toInsert.length, skipped: contacts.length - toInsert.length };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stakeholders', variables.planId] });
    },
  });
}
