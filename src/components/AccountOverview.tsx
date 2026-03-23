import type { ReactNode } from "react";
import { SectionCard } from "./SectionCard";
import { FieldGroup } from "./FieldGroup";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Calendar, DollarSign, TrendingUp, Users, Anchor, Ship, Package } from "lucide-react";
import { useAccountOverview, useUpdateAccountOverview } from "@/hooks/useAccountOverview";

const industries = [
  { value: "ship-owner",  label: "Ship Owner" },
  { value: "ship-manager",label: "Ship Manager" },
  { value: "shipyard",    label: "Shipyard" },
  { value: "oil-gas",     label: "Oil & Gas" },
  { value: "partner",     label: "Partner" },
  { value: "government",  label: "Government" },
  { value: "defense",     label: "Defense" },
  { value: "land-based",  label: "Land Based" },
];

const formatRevenue = (v: number | null) => {
  if (!v) return "—";
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
};

const formatDate = (d: string | null) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

interface Props {
  planId: string;
}

export const AccountOverview = ({ planId }: Props) => {
  const { data, isLoading } = useAccountOverview(planId);
  const { mutate: updateOverview } = useUpdateAccountOverview();

  if (isLoading) return <SectionCard title="Account Overview"><div className="animate-pulse h-40 bg-muted rounded" /></SectionCard>;
  if (!data) return <SectionCard title="Account Overview"><p className="text-muted-foreground text-sm">No overview data yet.</p></SectionCard>;

  const vesselTypes = Array.isArray(data.vessel_types) ? data.vessel_types : [];
  const products    = Array.isArray(data.products)     ? data.products     : [];
  const totalVessels = vesselTypes.reduce((sum, v) => sum + (v.count ?? 0), 0);

  return (
    <SectionCard title="Account Overview">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Key Metrics Row */}
        <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-5 gap-4 pb-6 border-b border-border">
          <MetricCard icon={<DollarSign className="w-5 h-5" />} label="Annual Revenue"  value={formatRevenue(data.annual_revenue)} trend={data.revenue_trend ?? undefined}   hubspot="deal_amount" />
          <MetricCard icon={<TrendingUp  className="w-5 h-5" />} label="Growth Potential" value={data.growth_potential ?? "—"}                                                 hubspot="growth_potential" />
          <MetricCard icon={<Ship        className="w-5 h-5" />} label="Vessels"         value={data.vessel_count?.toString() ?? "—"}  trend={data.vessel_trend ?? undefined}  hubspot="num_vessels" />
          <MetricCard icon={<Users       className="w-5 h-5" />} label="Active Users"    value={data.active_users?.toString() ?? "—"}  trend={data.users_trend ?? undefined} />
          <MetricCard icon={<Calendar    className="w-5 h-5" />} label="Renewal Date"    value={formatDate(data.renewal_date)}                                                  hubspot="renewal_date" />
        </div>

        {/* Account Details */}
        <FieldGroup label="Account Name" hubspotField="company_name">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{data.company_name ?? "—"}</span>
          </div>
        </FieldGroup>

        <FieldGroup label="Industry" hubspotField="industry">
          <Select
            value={data.industry ?? "ship-owner"}
            onValueChange={(val) => updateOverview({ planId, industry: val })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent className="bg-popover border shadow-lg z-50">
              {industries.map((ind) => (
                <SelectItem key={ind.value} value={ind.value}>
                  <span className="flex items-center gap-2">
                    <Anchor className="w-3 h-3 text-muted-foreground" />
                    {ind.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldGroup>

        <FieldGroup label="Account Rank" hubspotField="account_rank">
          <Badge variant="default" className="bg-primary text-primary-foreground">
            {data.account_rank ?? "—"}
          </Badge>
        </FieldGroup>

        <FieldGroup label="Health Score" hubspotField="health_score">
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${data.health_score ?? 0}%` }} />
            </div>
            <span className="text-sm font-medium">{data.health_score ?? 0}/100</span>
          </div>
        </FieldGroup>

        {/* Vessel Type Breakdown */}
        {vesselTypes.length > 0 && (
          <div className="lg:col-span-4 pt-4 border-t border-border">
            <FieldGroup label="Fleet Composition by Vessel Type" hubspotField="vessel_types">
              <div className="mt-3 space-y-3">
                <div className="h-4 rounded-full overflow-hidden flex">
                  {vesselTypes.map((vessel) => {
                    const pct = totalVessels > 0 ? (vessel.count / totalVessels) * 100 : 0;
                    return (
                      <div
                        key={vessel.type}
                        className="h-full transition-all hover:opacity-80"
                        style={{ width: `${pct}%`, backgroundColor: vessel.color }}
                        title={`${vessel.type}: ${vessel.count} vessels (${pct.toFixed(1)}%)`}
                      />
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {vesselTypes.map((vessel) => (
                    <div key={vessel.type} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: vessel.color }} />
                      <div className="text-xs">
                        <span className="font-medium">{vessel.count}</span>
                        <span className="text-muted-foreground ml-1">{vessel.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FieldGroup>
          </div>
        )}

        {/* Products/Modules */}
        {products.length > 0 && (
          <div className="lg:col-span-4 pt-4 border-t border-border">
            <FieldGroup label="Current Products / Modules" hubspotField="products">
              <div className="flex flex-wrap gap-2 mt-2">
                {products.map((product) => (
                  <Badge
                    key={product.id}
                    variant={product.active ? "default" : "outline"}
                    className={product.active
                      ? "bg-accent/10 text-accent border border-accent/20"
                      : "bg-muted/50 text-muted-foreground border-dashed"
                    }
                  >
                    <Package className="w-3 h-3 mr-1" />
                    {product.label}
                    {!product.active && <span className="ml-1 text-[10px]">(opportunity)</span>}
                  </Badge>
                ))}
              </div>
            </FieldGroup>
          </div>
        )}

        <FieldGroup label="Account Owner" hubspotField="owner_id" className="lg:col-span-2">
          <span>{data.account_owner ?? "—"}</span>
        </FieldGroup>

        <FieldGroup label="Last Updated" className="lg:col-span-2">
          <span className="text-muted-foreground">{data.renewal_date ? `Renewal: ${formatDate(data.renewal_date)}` : "—"}</span>
        </FieldGroup>
      </div>
    </SectionCard>
  );
};

interface MetricCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  trend?: string;
  hubspot?: string;
}

const MetricCard = ({ icon, label, value, trend, hubspot }: MetricCardProps) => (
  <div className="bg-muted/30 rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-muted-foreground">{icon}</span>
      {hubspot && <span className="text-[10px] text-hubspot font-medium">⟳ HubSpot</span>}
    </div>
    <div className="text-2xl font-semibold mb-1">{value}</div>
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      {trend && <span className="text-xs font-medium text-green-600">{trend}</span>}
    </div>
  </div>
);
