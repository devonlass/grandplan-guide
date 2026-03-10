import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface Account {
  id: string;
  company: string;
  account_rank: "Strategic" | "Grow" | "Maintain" | "Micro" | "Lose";
  account_manager: string;
  csm: string;
  annual_revenue: number;
  renewal_date: string;
  health_score: number;
  growth_potential: string;
  last_updated: string;
}

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .order("last_updated", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setAccounts(data ?? []);
      }
      setLoading(false);
    };

    fetchAccounts();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel("accounts")
      .on("postgres_changes", { event: "*", schema: "public", table: "accounts" }, () => {
        fetchAccounts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return { accounts, loading, error };
};