import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import { SectionCard } from "./SectionCard";
import { FieldGroup } from "./FieldGroup";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, TrendingUp, Users, Ship, Package, Heart } from "lucide-react";
import { useAccountOverview, useUpdateAccountOverview } from "@/hooks/useAccountOverview";

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
  const [healthScore, setHealthScore] = useState<number>(0);

  useEffect(() => {
    setHealthScore(data?.health_score ?? 0);
  }, [data?.health_score]);

  if (isLoading) return <SectionCard title="Account Overview"><div className="animate-pulse h-40 bg-muted rounded" /></SectionCard>;
  if (!data) return <SectionCard title="Account Overview"><p className="text-muted-foreground text-sm">No overview data yet.</p></SectionCard>;

  const vesselTypes  = Array.isArray(data.vessel_types) ? data.vessel_types : [];
  const products     = Array.isArray(data.products)     ? data.products     : [];
  const totalVessels = vesselTypes.reduce((sum, v) => sum + (v.count ?? 0), 0);

  const healthColour =
    healthScore >= 75 ? "bg-green-500" :
    healthScore >= 50 ? "bg-yellow-400" :
    healthScore >= 25 ? "bg-orange-400" : "bg-red-500";

  return (
    <SectionCard title="Account Overview">
      <div className="space-y-6">

        {/* ── Key Metrics Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <MetricCard icon={<DollarSign className="w-5 h-5" />} label="Support Revenue"  value={formatRevenue(data.annual_support_revenue)} trend={data.revenue_trend ?? undefined} hubspot="deal_amount" />
          <MetricCard icon={<DollarSign className="w-5 h-5" />} label="Licence Revenue"  value={formatRevenue(data.annual_licence_revenue)} />
          <MetricCard icon={<DollarSign className="w-5 h-5" />} label="PS Revenue"        value={formatRevenue(data.annual_ps_revenue)} />
          <MetricCard icon={<TrendingUp className="w-5 h-5" />} label="Growth Potential"  value={data.growth_potential ?? "—"} hubspot="growth_potential" />
          <MetricCard icon={<Ship       className="w-5 h-5" />} label="Vessels"           value={data.vessel_count?.toString() ?? "—"} trend={data.vessel_trend ?? undefined} hubspot="num_vessels" />
          <MetricCard icon={<Users      className="w-5 h-5" />} label="Active Users"      value={data.active_users?.toString() ?? "—"} trend={data.users_trend ?? undefined} />
          <MetricCard icon={<Calendar   className="w-5 h-5" />} label="Renewal Date"      value={formatDate(data.renewal_date)} hubspot="renewal_date" />
        </div>

        {/* ── Health Score ── */}
        <div className="bg-muted/30 rounded-lg p-5 border border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Health Score</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-foreground">{healthScore}</span>
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
          </div>
          <div className="relative mb-3">
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${healthColour}`}
                style={{ width: `${healthScore}%` }}
              />
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={healthScore}
            onChange={(e) => setHealthScore(Number(e.target.value))}
            onMouseUp={() => updateOverview({ planId, health_score: healthScore })}
            onTouchEnd={() => updateOverview({ planId, health_score: healthScore })}
            className="w-full accent-primary cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>At risk</span>
            <span>Healthy</span>
          </div>
        </div>

        {/* ── Fleet Composition ── */}
        {vesselTypes.length > 0 && (
          <div className="pt-2 border-t border-border">
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

        {/* ── Products / Modules ── */}
        {products.length > 0 && (
          <div className="pt-2 border-t border-border">
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
