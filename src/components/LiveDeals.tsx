import { useQuery } from "@tanstack/react-query";
import { SectionCard } from "./SectionCard";
import { TrendingUp, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { fetchDealsByCompany, fetchAllOwners, fetchPortalId } from "@/lib/hubspot";
import { usePlan } from "@/hooks/usePlans";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatAmount = (v: string | null) => {
  if (!v) return "—";
  const n = parseFloat(v);
  if (isNaN(n)) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
};

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatStage = (stage: string | null) => {
  if (!stage) return "—";
  return stage
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, c => c.toUpperCase());
};

const stageColor = (stage: string | null, prob: string | null) => {
  const p = parseFloat(prob ?? "0");
  if (p >= 0.8)  return "bg-green-100 text-green-700";
  if (p >= 0.5)  return "bg-blue-100 text-blue-700";
  if (p >= 0.2)  return "bg-yellow-100 text-yellow-700";
  return "bg-muted text-muted-foreground";
};

// ─── Component ────────────────────────────────────────────────────────────────

interface Props { planId: string; }

export const LiveDeals = ({ planId }: Props) => {
  const { data: plan } = usePlan(planId);

  const companyId = plan?.hubspot_company_id ?? null;

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ["hs-deals", companyId],
    queryFn: () => fetchDealsByCompany(companyId!),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 min
  });

  const { data: ownerMap = new Map() } = useQuery({
    queryKey: ["hs-owners"],
    queryFn: fetchAllOwners,
    staleTime: Infinity,
  });

  const { data: portalId } = useQuery({
    queryKey: ["hubspot-portal-id"],
    queryFn: fetchPortalId,
    staleTime: Infinity,
  });

  const dealUrl = (dealId: string) =>
    portalId ? `https://app.hubspot.com/contacts/${portalId}/deal/${dealId}` : null;

  if (!companyId) return null;

  return (
    <SectionCard
      title="Live Pipeline"
      badge={
        <span className="flex items-center gap-1 text-xs text-muted-foreground font-normal">
          <TrendingUp className="w-3 h-3" />
          {isLoading ? "…" : `${deals.length} open deal${deals.length !== 1 ? "s" : ""} from HubSpot`}
        </span>
      }
    >
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && deals.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">
          No open deals found in HubSpot for this company.
        </p>
      )}

      {!isLoading && deals.length > 0 && (
        <div className="space-y-2">
          {deals.map(deal => {
            const url = dealUrl(deal.id);
            const ownerName = deal.properties.hubspot_owner_id
              ? ownerMap.get(deal.properties.hubspot_owner_id) ?? null
              : null;

            return (
              <div
                key={deal.id}
                className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                {/* Deal name + owner */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{deal.properties.dealname}</p>
                    {url && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open deal in HubSpot"
                        className="text-muted-foreground hover:text-primary flex-shrink-0"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  {ownerName && (
                    <p className="text-xs text-muted-foreground">{ownerName}</p>
                  )}
                </div>

                {/* Stage badge */}
                <Badge className={`text-xs flex-shrink-0 ${stageColor(deal.properties.dealstage, deal.properties.hs_deal_stage_probability)}`}>
                  {formatStage(deal.properties.dealstage)}
                </Badge>

                {/* Amount */}
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold">{formatAmount(deal.properties.amount)}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(deal.properties.closedate)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
};
