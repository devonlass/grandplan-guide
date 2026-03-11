import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface AccountDetail {
  id: string;
  company: string;
  account_rank: "Strategic" | "Grow" | "Maintain" | "Micro" | "Lose" | null;
  account_manager: string | null;
  csm: string | null;
  annual_revenue: number | null;
  renewal_date: string | null;
  health_score: number | null;
  growth_potential: string | null;
  num_vessels: number | null;
  active_users: number | null;
  account_owner: string | null;
  industry: string | null;
  hubspot_company_id: string | null;
  last_updated: string;
}

export const useAccount = (id: string | undefined) => {
  const [account, setAccount] = useState<AccountDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchAccount = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setAccount(data);
      }
      setLoading(false);
    };

    fetchAccount();
  }, [id]);

  return { account, loading, error };
};