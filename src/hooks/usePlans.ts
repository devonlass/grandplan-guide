import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { AccountPlan } from '@/types/database';
import { fetchAllCompanies, fetchAllOwners, fetchFilesMetadata, type HubSpotCompany } from '@/lib/hubspot';
import { fileTypeFromName } from '@/hooks/useAttachments';

export function usePlans() {
  return useQuery<AccountPlan[]>({
    queryKey: ['plans'],
    queryFn: async () => {
      const PAGE = 1000;
      const all: AccountPlan[] = [];
      let from = 0;
      while (true) {
        const { data, error } = await supabase
          .from('account_plans')
          .select('*')
          .order('last_updated', { ascending: false })
          .range(from, from + PAGE - 1);
        if (error) throw error;
        if (!data || data.length === 0) break;
        all.push(...(data as AccountPlan[]));
        if (data.length < PAGE) break;
        from += PAGE;
      }
      return all;
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

// ─── Mutations ────────────────────────────────────────────────────────────────

interface CreatePlanInput {
  company: string;
  account_rank?: AccountPlan['account_rank'];
  account_manager?: string | null;
  csm?: string | null;
  hubspot_company_id?: string;
}

/**
 * Create a new account plan + seed the three required 1:1 child rows
 * (account_overview, customer_strategy, strategy_config).
 * Returns null (instead of throwing) if the company is already imported
 * (23505 unique_violation on hubspot_company_id).
 */
export function useCreatePlan() {
  return useMutation({
    mutationFn: async (input: CreatePlanInput): Promise<AccountPlan | null> => {
      // 1. Insert the account_plans row
      const { data: newPlan, error } = await supabase
        .from('account_plans')
        .insert({
          company:            input.company,
          account_rank:       input.account_rank ?? 'Grow',
          account_manager:    input.account_manager ?? null,
          csm:                input.csm ?? null,
          hubspot_company_id: input.hubspot_company_id ?? null,
        })
        .select()
        .single();

      // 23505 = unique_violation: already imported — skip gracefully
      if (error?.code === '23505') return null;
      if (error) throw error;

      // 2. Seed required 1:1 child rows so the plan detail page never 404s
      const planId = newPlan.id;
      const [ov, cs, sc] = await Promise.all([
        supabase.from('account_overview').insert({ plan_id: planId, company_name: input.company }),
        supabase.from('customer_strategy').insert({ plan_id: planId }),
        supabase.from('strategy_config').insert({ plan_id: planId }),
      ]);
      if (ov.error) throw ov.error;
      if (cs.error) throw cs.error;
      if (sc.error) throw sc.error;

      return newPlan as AccountPlan;
    },
    // No per-plan invalidation — caller handles it once after the full batch
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Map HubSpot property values to our account rank tiers.
 *
 * Priority order:
 *  1. account_rank — dedicated HubSpot property (grow/maintain/strategic/lose/micro).
 *     This is the authoritative source when populated.
 *  2. hs_lead_status — keyword scan as a secondary fallback.
 *  3. lifecyclestage — HubSpot's built-in stage as a last resort.
 *  4. Default → 'Grow'
 */
function mapToAccountRank(
  hsRank?: string,
  lifecyclestage?: string,
  hs_lead_status?: string,
): AccountPlan['account_rank'] {
  // 1. Direct match from the dedicated account_rank property (authoritative)
  if (hsRank) {
    const r = hsRank.trim().toLowerCase();
    if (r === 'strategic') return 'Strategic';
    if (r === 'grow')      return 'Grow';
    if (r === 'maintain')  return 'Maintain';
    if (r === 'micro')     return 'Micro';
    if (r === 'lose')      return 'Lose';
  }

  // 2. Keyword scan of hs_lead_status
  const status = (hs_lead_status ?? '').toLowerCase();
  if (status.includes('strategic')) return 'Strategic';
  if (status.includes('maintain'))  return 'Maintain';
  if (status.includes('micro'))     return 'Micro';
  if (status.includes('lose') || status.includes('churn')) return 'Lose';
  if (status.includes('grow'))      return 'Grow';

  // 3. Fall back to lifecycle stage
  const stage = (lifecyclestage ?? '').toLowerCase();
  switch (stage) {
    case 'customer':               return 'Grow';
    case 'opportunity':            return 'Grow';
    case 'salesqualifiedlead':     return 'Maintain';
    case 'marketingqualifiedlead': return 'Maintain';
    case 'lead':                   return 'Maintain';
    case 'subscriber':             return 'Micro';
    case 'other':                  return 'Micro';
    default:                       return 'Grow';
  }
}

/**
 * Bulk-import an array of HubSpot companies as new account plans.
 * Skips companies that are already imported (idempotent).
 * Resolves the HubSpot owner → account_manager name.
 * Maps lifecyclestage / hs_lead_status → account_rank.
 * Invalidates the plans query once after all inserts complete.
 */
export function useImportHubSpotCompanies() {
  const queryClient = useQueryClient();
  const { mutateAsync: createPlan } = useCreatePlan();
  return useMutation({
    mutationFn: async (companies: HubSpotCompany[]) => {
      let added = 0;
      let skipped = 0;

      // Batch-resolve all owners up-front (1 request instead of 1 per company).
      // Returns an empty Map if the token lacks crm.objects.owners.read scope.
      const ownerMap = await fetchAllOwners();

      // Create plans sequentially — safe for Supabase rate limits
      for (const company of companies) {
        // Skip companies with null/empty names (would violate NOT NULL constraint)
        const name = company.properties.name?.trim();
        if (!name) { skipped++; continue; }

        const ownerName = company.properties.hubspot_owner_id
          ? (ownerMap.get(company.properties.hubspot_owner_id) ?? null)
          : null;

        const rank = mapToAccountRank(
          company.properties.account_rank,
          company.properties.lifecyclestage,
          company.properties.hs_lead_status,
        );

        const csm = company.properties.customer_support_manager
          ? (ownerMap.get(company.properties.customer_support_manager) ?? null)
          : null;

        try {
          const result = await createPlan({
            company:            name,
            account_rank:       rank,
            account_manager:    ownerName,
            csm,
            hubspot_company_id: company.id,
          });
          if (result === null) skipped++; // already imported (23505)
          else added++;
        } catch (err: unknown) {
          // Log the real error code so we can diagnose — then skip and continue
          console.error(`Import skipped "${name}":`, err);
          skipped++;
        }
      }

      return { added, skipped };
    },
    // Single invalidation after the whole batch is done — no mid-loop refetch spam
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plans'] }),
  });
}

/**
 * Sync account_rank and account_manager for ALL already-imported plans by
 * updating every row that has a hubspot_company_id.
 *
 * Use this if you've already imported companies but the rank / AM fields
 * are wrong or blank — without needing to truncate and re-import.
 */
export function useSyncHubSpotProperties() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      // 1. Fetch fresh company data + owners from HubSpot
      const [companies, ownerMap] = await Promise.all([
        fetchAllCompanies(),
        fetchAllOwners(),
      ]);

      // 2. Build a lookup: hubspot_company_id → { rank, ownerName, csm }
      const syncMap = new Map<string, { rank: AccountPlan['account_rank']; ownerName: string | null; csm: string | null }>();
      for (const c of companies) {
        syncMap.set(c.id, {
          rank: mapToAccountRank(
            c.properties.account_rank,
            c.properties.lifecyclestage,
            c.properties.hs_lead_status,
          ),
          ownerName: c.properties.hubspot_owner_id
            ? (ownerMap.get(c.properties.hubspot_owner_id) ?? null)
            : null,
          csm: c.properties.customer_support_manager
            ? (ownerMap.get(c.properties.customer_support_manager) ?? null)
            : null,
        });
      }

      // 3. Build attachment lookup: hubspot_company_id → file IDs to sync
      //    Collect unique file IDs from hs_attachment_ids + contract across all companies
      const attachmentLookup = new Map<string, string[]>(); // company id → [fileId, ...]
      const allFileIds = new Set<string>();
      for (const c of companies) {
        const ids: string[] = [];
        if (c.properties.hs_attachment_ids) {
          c.properties.hs_attachment_ids.split(',').map(s => s.trim()).filter(Boolean).forEach(id => {
            ids.push(id);
            allFileIds.add(id);
          });
        }
        if (c.properties.contract) {
          const cid = c.properties.contract.trim();
          if (cid) { ids.push(cid); allFileIds.add(cid); }
        }
        if (ids.length > 0) attachmentLookup.set(c.id, ids);
      }

      // 4. Batch-fetch metadata for all unique file IDs (parallel, gracefully skips failures)
      const fileMetaMap = new Map<string, { name: string; url: string; size: number; ext: string }>();
      if (allFileIds.size > 0) {
        const metas = await fetchFilesMetadata([...allFileIds]);
        for (const f of metas) {
          fileMetaMap.set(f.id, { name: f.name, url: f.url, size: f.size, ext: f.extension });
        }
      }

      // 5. Fetch all existing plans that have a hubspot_company_id
      const { data: plans, error } = await supabase
        .from('account_plans')
        .select('id, hubspot_company_id')
        .not('hubspot_company_id', 'is', null);
      if (error) throw error;

      // 6. Update each plan — sequentially to respect Supabase rate limits
      let updated = 0;
      let attachmentsSynced = 0;
      for (const plan of plans ?? []) {
        const companyId = plan.hubspot_company_id as string;
        const props = syncMap.get(companyId);
        if (!props) continue;

        // Update core fields
        const { error: updateError } = await supabase
          .from('account_plans')
          .update({ account_rank: props.rank, account_manager: props.ownerName, csm: props.csm })
          .eq('id', plan.id);
        if (updateError) {
          console.error(`Sync failed for plan ${plan.id}:`, updateError);
        } else {
          updated++;
        }

        // Upsert attachments for this plan (skip silently if table doesn't exist yet)
        const fileIds = attachmentLookup.get(companyId) ?? [];
        for (const fileId of fileIds) {
          const meta = fileMetaMap.get(fileId);
          if (!meta) continue;
          const fullName = meta.ext ? `${meta.name}.${meta.ext}` : meta.name;
          try {
            const { error: attErr } = await supabase.from('attachments').upsert(
              {
                plan_id:         plan.id,
                name:            fullName,
                url:             meta.url,
                hubspot_file_id: fileId,
                file_type:       fileTypeFromName(fullName),
                file_size:       meta.size,
                source:          'hubspot',
              },
              { onConflict: 'plan_id,hubspot_file_id', ignoreDuplicates: false }
            );
            if (!attErr) attachmentsSynced++;
          } catch {
            // attachments table not yet created — skip silently
          }
        }
      }

      return { updated, attachmentsSynced };
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plans'] }),
  });
}
