/**
 * HubSpot API client (proxied via Vite dev server to avoid CORS).
 * All calls go through /api/hubspot → https://api.hubapi.com
 *
 * Auth: HubSpot Private App token stored in VITE_HUBSPOT_API_TOKEN
 * Required scopes: crm.objects.contacts.read, crm.objects.companies.read
 */

const TOKEN = import.meta.env.VITE_HUBSPOT_API_TOKEN as string | undefined;

const BASE = "/api/hubspot";

const headers = (): HeadersInit => ({
  Authorization: `Bearer ${TOKEN ?? ""}`,
  "Content-Type": "application/json",
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HubSpotContact {
  id: string;
  properties: {
    firstname?: string;
    lastname?: string;
    jobtitle?: string;
    email?: string;
    phone?: string;
    company?: string;
    hs_lead_status?: string;
    notes_last_contacted?: string;   // ISO date string
    hubspot_owner_id?: string;
  };
}

export interface HubSpotOwner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fullName(c: HubSpotContact): string {
  const first = c.properties.firstname ?? "";
  const last  = c.properties.lastname  ?? "";
  return [first, last].filter(Boolean).join(" ") || "Unknown";
}

function isoToDate(iso: string | undefined): string | null {
  if (!iso) return null;
  return iso.split("T")[0]; // "2025-01-10"
}

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * Search HubSpot contacts by company name (case-insensitive contains).
 * Returns up to 100 contacts.
 */
export async function searchContactsByCompany(
  companyName: string
): Promise<HubSpotContact[]> {
  if (!TOKEN || TOKEN === "your-hubspot-private-app-token-here") {
    throw new Error("VITE_HUBSPOT_API_TOKEN is not configured in .env.local");
  }

  const body = {
    filterGroups: [
      {
        filters: [
          {
            propertyName: "company",
            operator: "CONTAINS_TOKEN",
            value: companyName,
          },
        ],
      },
    ],
    properties: [
      "firstname",
      "lastname",
      "jobtitle",
      "email",
      "company",
      "hs_lead_status",
      "notes_last_contacted",
      "hubspot_owner_id",
    ],
    limit: 100,
  };

  const res = await fetch(`${BASE}/crm/v3/objects/contacts/search`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HubSpot API error ${res.status}: ${text}`);
  }

  const json = await res.json();
  return (json.results ?? []) as HubSpotContact[];
}

/**
 * Fetch a single HubSpot owner by ID (to resolve the owner name).
 */
export async function getOwner(ownerId: string): Promise<HubSpotOwner | null> {
  if (!TOKEN || TOKEN === "your-hubspot-private-app-token-here") return null;

  const res = await fetch(`${BASE}/crm/v3/owners/${ownerId}`, {
    headers: headers(),
  });

  if (!res.ok) return null;
  return res.json();
}

// ─── Companies ────────────────────────────────────────────────────────────────

export interface HubSpotCompany {
  id: string;
  properties: {
    name: string;
    hubspot_owner_id?: string;
    industry?: string;
    hs_lead_status?: string;
    lifecyclestage?: string;
    account_rank?: string;               // grow | maintain | strategic | lose | micro
    customer_support_manager?: string;   // CSM owner ID
    hs_attachment_ids?: string;          // comma-separated HubSpot file IDs
    contract?: string;                   // HubSpot file ID for the primary contract
  };
}

// ─── Files ────────────────────────────────────────────────────────────────────

export interface HubSpotFile {
  id: string;
  name: string;
  extension: string;
  size: number;    // bytes
  url: string;     // direct download URL (may require auth for private files)
}

/**
 * Fetch metadata for a single HubSpot file.
 * Requires the `files` scope on the Private App.
 * Returns null on any error (missing scope, file not found, etc.).
 */
export async function fetchFileMetadata(fileId: string): Promise<HubSpotFile | null> {
  if (!TOKEN || TOKEN === "your-hubspot-private-app-token-here") return null;
  try {
    const res = await fetch(`${BASE}/files/v3/files/${fileId}`, {
      headers: headers(),
    });
    if (!res.ok) return null;
    return res.json() as Promise<HubSpotFile>;
  } catch {
    return null;
  }
}

/**
 * Fetch a short-lived signed URL for a HubSpot file (bypasses auth requirement).
 * Falls back to the direct URL from file metadata if this endpoint 403s.
 * Requires the `files` scope on the Private App.
 */
export async function fetchSignedUrl(fileId: string): Promise<string | null> {
  if (!TOKEN || TOKEN === "your-hubspot-private-app-token-here") return null;
  try {
    const res = await fetch(`${BASE}/files/v3/files/${fileId}/signed-url`, {
      headers: headers(),
    });
    if (!res.ok) return null;
    const json = await res.json() as { url?: string };
    return json.url ?? null;
  } catch {
    return null;
  }
}

/**
 * Resolve a list of HubSpot file IDs into full file metadata.
 * Skips any IDs that fail to resolve.
 */
export async function fetchFilesMetadata(fileIds: string[]): Promise<HubSpotFile[]> {
  const results = await Promise.all(fileIds.map(fetchFileMetadata));
  return results.filter((f): f is HubSpotFile => f !== null);
}

/**
 * Fetch ALL companies from HubSpot using cursor-based pagination.
 * Returns every company across all pages (100 per request).
 */
export async function fetchAllCompanies(): Promise<HubSpotCompany[]> {
  if (!TOKEN || TOKEN === "your-hubspot-private-app-token-here") {
    throw new Error("VITE_HUBSPOT_API_TOKEN is not configured in .env.local");
  }

  const results: HubSpotCompany[] = [];
  let after: string | undefined;

  do {
    const url =
      `${BASE}/crm/v3/objects/companies?limit=100&properties=name,hubspot_owner_id,industry,hs_lead_status,lifecyclestage,account_rank,customer_support_manager,hs_attachment_ids,contract` +
      (after ? `&after=${after}` : "");

    const res = await fetch(url, { headers: headers() });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HubSpot Companies API error ${res.status}: ${text}`);
    }

    const json = await res.json();
    results.push(...((json.results ?? []) as HubSpotCompany[]));
    after = json.paging?.next?.after as string | undefined;
  } while (after);

  return results;
}

/**
 * Fetch ALL HubSpot owners and return a Map of owner ID → full name.
 * Used to resolve hubspot_owner_id → account_manager name during import.
 * Returns an empty Map on any error (e.g. 403 missing crm.objects.owners.read scope).
 */
export async function fetchAllOwners(): Promise<Map<string, string>> {
  if (!TOKEN || TOKEN === "your-hubspot-private-app-token-here") return new Map();
  const map = new Map<string, string>();
  let after: string | undefined;
  try {
    do {
      const url =
        `${BASE}/crm/v3/owners?limit=100` + (after ? `&after=${after}` : "");
      const res = await fetch(url, { headers: headers() });
      if (!res.ok) return map; // 403 or other — skip gracefully
      const json = await res.json();
      for (const owner of (json.results ?? []) as HubSpotOwner[]) {
        const name =
          [owner.firstName, owner.lastName].filter(Boolean).join(" ") ||
          owner.email;
        map.set(owner.id, name);
      }
      after = json.paging?.next?.after as string | undefined;
    } while (after);
  } catch {
    // Network error — return whatever we accumulated
  }
  return map;
}

// ─── Deals ────────────────────────────────────────────────────────────────────

export interface HubSpotDeal {
  id: string;
  properties: {
    dealname:                   string;
    amount:                     string | null;
    closedate:                  string | null;
    dealstage:                  string | null;
    pipeline:                   string | null;
    hubspot_owner_id:           string | null;
    hs_deal_stage_probability:  string | null;
    hs_is_closed:               string | null;
    hs_is_closed_won:           string | null;
  };
}

/**
 * Fetch open deals associated with a HubSpot company.
 * Requires crm.objects.deals.read scope.
 */
export async function fetchDealsByCompany(companyId: string): Promise<HubSpotDeal[]> {
  if (!TOKEN || TOKEN === "your-hubspot-private-app-token-here") return [];
  try {
    const body = {
      filterGroups: [{
        filters: [{
          propertyName: "associations.company",
          operator: "EQ",
          value: companyId,
        }, {
          propertyName: "hs_is_closed",
          operator: "EQ",
          value: "false",
        }],
      }],
      properties: [
        "dealname", "amount", "closedate", "dealstage", "pipeline",
        "hubspot_owner_id", "hs_deal_stage_probability",
        "hs_is_closed", "hs_is_closed_won",
      ],
      sorts: [{ propertyName: "closedate", direction: "ASCENDING" }],
      limit: 50,
    };
    const res = await fetch(`${BASE}/crm/v3/objects/deals/search`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.results ?? []) as HubSpotDeal[];
  } catch {
    return [];
  }
}

/**
 * Fetch the HubSpot portal ID for this token.
 * Used to construct deep-links to HubSpot company records.
 */
export async function fetchPortalId(): Promise<number | null> {
  if (!TOKEN || TOKEN === "your-hubspot-private-app-token-here") return null;
  try {
    const res = await fetch(`${BASE}/integrations/v1/me`, { headers: headers() });
    if (!res.ok) return null;
    const json = await res.json() as { portalId?: number };
    return json.portalId ?? null;
  } catch {
    return null;
  }
}

// ─── Team properties ──────────────────────────────────────────────────────────

/**
 * Fetch the four owner-type properties SpecTec uses for the core account team.
 * Returns raw owner IDs — resolve names via fetchAllOwners().
 *
 * HubSpot property names (owner-type):
 *   hubspot_owner_id          → Account Owner (built-in)
 *   customer_support_manager  → CSM (custom)
 *   technical_account_manager → TAM (custom — update if your property name differs)
 *   slt_sponsor               → SLT Sponsor (custom — update if your property name differs)
 */
export async function fetchCompanyTeamProperties(companyId: string): Promise<{
  account_owner_id:  string | null;
  csm_id:            string | null;
  tam_id:            string | null;
  slt_sponsor_id:    string | null;
}> {
  const empty = { account_owner_id: null, csm_id: null, tam_id: null, slt_sponsor_id: null };
  if (!TOKEN || TOKEN === "your-hubspot-private-app-token-here") return empty;
  try {
    const props = "hubspot_owner_id,customer_support_manager,tam,slt_sponsor";
    const res = await fetch(
      `${BASE}/crm/v3/objects/companies/${companyId}?properties=${props}`,
      { headers: headers() }
    );
    if (!res.ok) return empty;
    const json = await res.json();
    const p = json.properties ?? {};
    return {
      account_owner_id: p.hubspot_owner_id         || null,
      csm_id:           p.customer_support_manager || null,
      tam_id:           p.tam                      || null,
      slt_sponsor_id:   p.slt_sponsor              || null,
    };
  } catch {
    return empty;
  }
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

/**
 * Convert a HubSpot contact into the shape expected by our stakeholders table.
 * hs_lead_status → role (best-effort mapping)
 */
export function mapContactToStakeholder(contact: HubSpotContact, contactedByName?: string) {
  const leadStatus = contact.properties.hs_lead_status?.toLowerCase() ?? "";

  let role: "Decision Maker" | "Influencer" | "Champion" | "Blocker" | "User" = "Influencer";
  if (leadStatus.includes("decision") || leadStatus.includes("exec"))  role = "Decision Maker";
  else if (leadStatus.includes("champion") || leadStatus.includes("advocate")) role = "Champion";
  else if (leadStatus.includes("block") || leadStatus.includes("detract"))     role = "Blocker";
  else if (leadStatus.includes("user") || leadStatus.includes("end"))          role = "User";

  return {
    hubspot_contact_id: contact.id,
    name:          fullName(contact),
    title:         contact.properties.jobtitle    ?? null,
    role,
    sentiment:     "neutral" as const,
    notes:         null,
    last_contact:  isoToDate(contact.properties.notes_last_contacted),
    contacted_by:  contactedByName ?? null,
  };
}
