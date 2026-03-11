import { useState } from "react";
import { supabase } from "@/lib/supabase";

export const useHubSpotSync = () => {
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncedCount, setSyncedCount] = useState(0);

  const syncCompanies = async () => {
    setSyncing(true);
    setError(null);
    setSyncedCount(0);

    try {
      // Call the HubSpot Edge Function
      const { data, error: fnError } = await supabase.functions.invoke("hubspot-sync", {
        body: { action: "list-companies" },
      });

      if (fnError) throw fnError;

      const companies = data?.results ?? [];

      // Upsert each company into Supabase
      const accountsToUpsert = companies.map((c: any) => ({
        hubspot_company_id: c.id,
        company: c.properties?.name ?? "Unknown",
        industry: c.properties?.industry ?? null,
        annual_revenue: c.properties?.annualrevenue
          ? parseFloat(c.properties.annualrevenue)
          : null,
        last_updated: new Date().toISOString(),
      }));

      const { error: upsertError } = await supabase
        .from("accounts")
        .upsert(accountsToUpsert, {
          onConflict: "hubspot_company_id",
          ignoreDuplicates: false,
        });

      if (upsertError) throw upsertError;

      setSyncedCount(accountsToUpsert.length);
    } catch (err: any) {
      setError(err.message ?? "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  return { syncCompanies, syncing, error, syncedCount };
};