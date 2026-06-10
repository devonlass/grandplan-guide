import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, RefreshCw, ArrowLeft, ExternalLink, Anchor } from "lucide-react";

const industryLabels: Record<string, string> = {
  "ship-owner":   "Ship Owner",
  "ship-manager": "Ship Manager",
  "shipyard":     "Shipyard",
  "oil-gas":      "Oil & Gas",
  "partner":      "Partner",
  "government":   "Government",
  "defense":      "Defense",
  "land-based":   "Land Based",
};
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usePlan } from "@/hooks/usePlans";
import { useAccountOverview } from "@/hooks/useAccountOverview";
import { useOpportunities } from "@/hooks/useOurStrategy";
import { fetchPortalId } from "@/lib/hubspot";

interface Props {
  planId: string;
}

const rankBadgeColors: Record<string, string> = {
  Strategic: "bg-accent text-accent-foreground",
  Grow:      "bg-green-500 text-white",
  Maintain:  "bg-yellow-500 text-white",
  Micro:     "bg-muted text-muted-foreground",
  Lose:      "bg-destructive text-destructive-foreground",
};

const formatRevenue = (v: number | null | undefined) => {
  if (!v) return "—";
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
};

const formatDate = (d: string | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

const parseValue = (v: string | null): number => {
  if (!v) return 0;
  const cleaned = v.replace(/[$,\s]/g, "").toUpperCase();
  const match = cleaned.match(/^([\d.]+)([KM])?$/);
  if (!match) return 0;
  const multipliers: Record<string, number> = { K: 1_000, M: 1_000_000 };
  const num = parseFloat(match[1]);
  const suffix = match[2] as keyof typeof multipliers;
  return suffix ? num * multipliers[suffix] : num;
};

const parseProbability = (p: string | null): number => {
  if (!p) return 0;
  const num = parseFloat(p.replace("%", ""));
  return isNaN(num) ? 0 : num / 100;
};

const QuickStat = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div className="text-xs text-primary-foreground/60 uppercase tracking-wide mb-1">{label}</div>
    <div className="text-xl font-semibold">{value}</div>
  </div>
);

export const AccountPlanHeader = ({ planId }: Props) => {
  const navigate = useNavigate();
  const { data: plan }               = usePlan(planId);
  const { data: overview }           = useAccountOverview(planId);
  const { data: opportunities = [] } = useOpportunities(planId);
  const { data: portalId }           = useQuery({
    queryKey: ['hubspot-portal-id'],
    queryFn: fetchPortalId,
    staleTime: Infinity,
  });

  const hubspotUrl = plan?.hubspot_company_id && portalId
    ? `https://app.hubspot.com/contacts/${portalId}/company/${plan.hubspot_company_id}`
    : null;

  const weightedPipeline = opportunities.reduce((acc, opp) => {
    return acc + parseValue(opp.value) * parseProbability(opp.probability);
  }, 0);

  const formatPipeline = (v: number) => {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000)     return `$${(v / 1_000).toFixed(0)}K`;
    return v > 0 ? `$${v.toFixed(0)}` : "—";
  };

  const lastUpdated = plan?.last_updated
    ? new Date(plan.last_updated).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      })
    : null;

  return (
    <header className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            {/* Back link + rank badge */}
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-1.5 text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                All Plans
              </button>
              <span className="text-primary-foreground/30">|</span>
              <FileText className="w-4 h-4 text-primary-foreground/70" />
              {plan && (
                <Badge className={rankBadgeColors[plan.account_rank] ?? "bg-accent text-accent-foreground"}>
                  {plan.account_rank}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl md:text-3xl font-bold">
                {plan?.company ?? "Loading…"}
              </h1>
              {hubspotUrl && (
                <a
                  href={hubspotUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open in HubSpot"
                  className="flex items-center gap-1 text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  HubSpot
                </a>
              )}
            </div>
            <p className="text-primary-foreground/70 text-sm flex items-center gap-2 flex-wrap">
              <span>Strategic Account Plan</span>
              {overview?.industry && (
                <span className="inline-flex items-center gap-1 bg-primary-foreground/10 border border-primary-foreground/20 rounded-full px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
                  <Anchor className="w-3 h-3" />
                  {industryLabels[overview.industry] ?? overview.industry}
                </span>
              )}
              {plan?.account_manager && <span>• {plan.account_manager}</span>}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {overview?.renewal_date && (
              <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Calendar className="w-4 h-4" />
                <span>Renewal: {formatDate(overview.renewal_date)}</span>
              </div>
            )}
            {lastUpdated && (
              <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <RefreshCw className="w-4 h-4" />
                <span>Updated: {lastUpdated}</span>
              </div>
            )}
            <Button
              variant="secondary"
              size="sm"
              className="gap-2"
              onClick={() => console.log("Export PDF — wire up jsPDF here")}
            >
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="mt-6 pt-6 border-t border-primary-foreground/10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <QuickStat label="Support Revenue"  value={formatRevenue(overview?.annual_support_revenue)} />
          <QuickStat label="Licence Revenue"  value={formatRevenue(overview?.annual_licence_revenue)} />
          <QuickStat label="PS Revenue"       value={formatRevenue(overview?.annual_ps_revenue)} />
          <QuickStat label="Health Score"     value={overview?.health_score ? `${overview.health_score}/100` : "—"} />
          <QuickStat label="Wtd. Pipeline"    value={formatPipeline(weightedPipeline)} />
          <QuickStat label="Renewal"          value={formatDate(overview?.renewal_date)} />
        </div>
      </div>
    </header>
  );
};
