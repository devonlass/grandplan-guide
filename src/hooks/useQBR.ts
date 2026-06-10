import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface QBRData {
  quarter?: string;
  review_date?: string;
  // Branding
  spectec_logo?: string;
  client_logo?: string;
  // 1. Executive Summary
  exec_achievements?: string;
  exec_value_delivered?: string;
  exec_risks?: string;
  exec_forward_opportunity?: string;
  // 2. Customer Business Context
  ctx_fleet_changes?: string;
  ctx_strategic_initiatives?: string;
  ctx_top_priorities?: string;
  // 3. Value Realisation
  val_asset_reliability?: string;
  val_compliance?: string;
  val_operational_control?: string;
  val_procurement?: string;
  // 4. Support & SLA
  sla_performance?: string;
  sla_ticket_analysis?: string;
  sla_recurring_issues?: string;
  sla_actions_taken?: string;
  sla_forward_actions?: string;
  // 5. Adoption & Usage
  adopt_modules?: string;
  adopt_engagement?: string;
  adopt_maturity?: string;
  // 6. Product & Roadmap
  prod_releases?: string;
  prod_roadmap?: string;
  // 7. Commercial
  comm_contract?: string;
  comm_services?: string;
  comm_value?: string;
  // 8. Growth & Opportunities
  growth_opportunities?: string;
  growth_maturity_current?: string;
  growth_maturity_next?: string;
  // 9. Joint Success Plan
  jsp_priorities?: string;
  jsp_actions?: string;
  // 10. Close
  close_commitments?: string;
  close_next_qbr?: string;
  close_escalations?: string;
}

interface QBRRecord {
  id: string;
  plan_id: string;
  data: QBRData;
}

export const useQBR = (planId: string) =>
  useQuery({
    queryKey: ["qbr", planId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("qbr")
          .select("*")
          .eq("plan_id", planId)
          .maybeSingle();
        if (error) return null;
        return data as QBRRecord | null;
      } catch {
        return null;
      }
    },
    retry: false,
  });

export const useUpsertQBR = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      planId,
      id,
      data,
    }: {
      planId: string;
      id?: string;
      data: QBRData;
    }) => {
      const payload = { plan_id: planId, data, ...(id ? { id } : {}) };
      const { error } = await supabase
        .from("qbr")
        .upsert(payload, { onConflict: "plan_id" });
      if (error) throw error;
    },
    onSuccess: (_, { planId }) =>
      qc.invalidateQueries({ queryKey: ["qbr", planId] }),
  });
};
