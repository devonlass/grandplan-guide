import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const HUBSPOT_API_KEY = Deno.env.get("HUBSPOT_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { action, companyId } = await req.json();

    // ── Fetch a single company from HubSpot ──
    if (action === "get-company") {
      const res = await fetch(
        `https://api.hubapi.com/crm/v3/objects/companies/${companyId}?properties=name,industry,annualrevenue,hs_lead_status`,
        { headers: { Authorization: `Bearer ${HUBSPOT_API_KEY}` } }
      );
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Fetch all companies from HubSpot ──
    if (action === "list-companies") {
      const res = await fetch(
        `https://api.hubapi.com/crm/v3/objects/companies?properties=name,industry,annualrevenue,hs_lead_status&limit=100`,
        { headers: { Authorization: `Bearer ${HUBSPOT_API_KEY}` } }
      );
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Fetch contacts for a company ──
    if (action === "get-contacts") {
      const res = await fetch(
        `https://api.hubapi.com/crm/v3/objects/companies/${companyId}/associations/contacts`,
        { headers: { Authorization: `Bearer ${HUBSPOT_API_KEY}` } }
      );
      const associations = await res.json();

      const contactIds = associations.results?.map((r: any) => r.id) ?? [];
      const contacts = await Promise.all(
        contactIds.map(async (id: string) => {
          const r = await fetch(
            `https://api.hubapi.com/crm/v3/objects/contacts/${id}?properties=firstname,lastname,jobtitle,email`,
            { headers: { Authorization: `Bearer ${HUBSPOT_API_KEY}` } }
          );
          return r.json();
        })
      );
      return new Response(JSON.stringify(contacts), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Fetch deals for a company ──
    if (action === "get-deals") {
      const res = await fetch(
        `https://api.hubapi.com/crm/v3/objects/companies/${companyId}/associations/deals`,
        { headers: { Authorization: `Bearer ${HUBSPOT_API_KEY}` } }
      );
      const associations = await res.json();

      const dealIds = associations.results?.map((r: any) => r.id) ?? [];
      const deals = await Promise.all(
        dealIds.map(async (id: string) => {
          const r = await fetch(
            `https://api.hubapi.com/crm/v3/objects/deals/${id}?properties=dealname,amount,dealstage,closedate,probability`,
            { headers: { Authorization: `Bearer ${HUBSPOT_API_KEY}` } }
          );
          return r.json();
        })
      );
      return new Response(JSON.stringify(deals), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: corsHeaders,
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});