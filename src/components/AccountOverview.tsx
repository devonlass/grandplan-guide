import { SectionCard } from "./SectionCard";
import { FieldGroup } from "./FieldGroup";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Calendar, DollarSign, TrendingUp, Users, Anchor, Ship, Package } from "lucide-react";

const industries = [
  { value: "ship-owner", label: "Ship Owner" },
  { value: "ship-manager", label: "Ship Manager" },
  { value: "shipyard", label: "Shipyard" },
  { value: "oil-gas", label: "Oil & Gas" },
  { value: "partner", label: "Partner" },
  { value: "government", label: "Government" },
  { value: "defense", label: "Defense" },
  { value: "land-based", label: "Land Based" },
];

const products = [
  { id: "fleet-management", label: "Fleet Management", active: true },
  { id: "maintenance", label: "Maintenance & Repair", active: true },
  { id: "procurement", label: "Procurement", active: true },
  { id: "crewing", label: "Crewing", active: false },
  { id: "hseq", label: "HSEQ", active: true },
  { id: "dry-docking", label: "Dry Docking", active: false },
  { id: "analytics", label: "Analytics & BI", active: true },
  { id: "compliance", label: "Compliance", active: false },
];

const vesselTypes = [
  { type: "Tankers", count: 42, color: "hsl(var(--accent))" },
  { type: "Bulk Carriers", count: 35, color: "hsl(var(--primary))" },
  { type: "Container Ships", count: 24, color: "hsl(var(--warning))" },
  { type: "Offshore Vessels", count: 12, color: "hsl(var(--success))" },
  { type: "Gas Carriers", count: 8, color: "hsl(var(--destructive))" },
  { type: "Other", count: 3, color: "hsl(var(--muted-foreground))" },
];

export const AccountOverview = () => {
  return (
    <SectionCard title="Account Overview">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Key Metrics Row */}
        <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-5 gap-4 pb-6 border-b border-border">
          <MetricCard
            icon={<DollarSign className="w-5 h-5" />}
            label="Annual Revenue"
            value="$2.4M"
            trend="+12%"
            hubspot="deal_amount"
          />
          <MetricCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Growth Potential"
            value="High"
            hubspot="growth_potential"
          />
          <MetricCard
            icon={<Ship className="w-5 h-5" />}
            label="Vessels"
            value="124"
            trend="+8"
            hubspot="num_vessels"
          />
          <MetricCard
            icon={<Users className="w-5 h-5" />}
            label="Active Users"
            value="847"
            trend="+23%"
          />
          <MetricCard
            icon={<Calendar className="w-5 h-5" />}
            label="Renewal Date"
            value="Sep 2025"
            hubspot="renewal_date"
          />
        </div>

        {/* Account Details */}
        <FieldGroup label="Account Name" hubspotField="company_name">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">Acme Corporation</span>
          </div>
        </FieldGroup>

        <FieldGroup label="Industry" hubspotField="industry">
          <Select defaultValue="ship-owner">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent className="bg-popover border shadow-lg z-50">
              {industries.map((industry) => (
                <SelectItem key={industry.value} value={industry.value}>
                  <span className="flex items-center gap-2">
                    <Anchor className="w-3 h-3 text-muted-foreground" />
                    {industry.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldGroup>

        <FieldGroup label="Account Rank" hubspotField="account_rank">
          <Badge variant="default" className="bg-primary text-primary-foreground">
            Strategic
          </Badge>
        </FieldGroup>

        <FieldGroup label="Health Score" hubspotField="health_score">
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
              <div className="w-4/5 h-full bg-success rounded-full" />
            </div>
            <span className="text-sm font-medium">82/100</span>
          </div>
        </FieldGroup>

        {/* Vessel Type Breakdown */}
        <div className="lg:col-span-4 pt-4 border-t border-border">
          <FieldGroup label="Fleet Composition by Vessel Type" hubspotField="vessel_types">
            <div className="mt-3 space-y-3">
              {/* Stacked bar visualization */}
              <div className="h-4 rounded-full overflow-hidden flex">
                {vesselTypes.map((vessel, index) => {
                  const totalVessels = vesselTypes.reduce((sum, v) => sum + v.count, 0);
                  const percentage = (vessel.count / totalVessels) * 100;
                  return (
                    <div
                      key={vessel.type}
                      className="h-full transition-all hover:opacity-80"
                      style={{ 
                        width: `${percentage}%`, 
                        backgroundColor: vessel.color,
                      }}
                      title={`${vessel.type}: ${vessel.count} vessels (${percentage.toFixed(1)}%)`}
                    />
                  );
                })}
              </div>
              
              {/* Legend */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {vesselTypes.map((vessel) => {
                  const totalVessels = vesselTypes.reduce((sum, v) => sum + v.count, 0);
                  const percentage = (vessel.count / totalVessels) * 100;
                  return (
                    <div key={vessel.type} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-sm flex-shrink-0" 
                        style={{ backgroundColor: vessel.color }}
                      />
                      <div className="text-xs">
                        <span className="font-medium">{vessel.count}</span>
                        <span className="text-muted-foreground ml-1">{vessel.type}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </FieldGroup>
        </div>

        {/* Products/Modules Section */}
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

        <FieldGroup label="Account Owner" hubspotField="owner_id" className="lg:col-span-2">
          <span>Sarah Chen, Strategic Account Manager</span>
        </FieldGroup>

        <FieldGroup label="Last Updated" className="lg:col-span-2">
          <span className="text-muted-foreground">Q4 2024 Review - January 15, 2025</span>
        </FieldGroup>
      </div>
    </SectionCard>
  );
};

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: string;
  hubspot?: string;
}

const MetricCard = ({ icon, label, value, trend, hubspot }: MetricCardProps) => {
  return (
    <div className="bg-muted/30 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-muted-foreground">{icon}</span>
        {hubspot && (
          <span className="text-[10px] text-hubspot font-medium">⟳ HubSpot</span>
        )}
      </div>
      <div className="text-2xl font-semibold mb-1">{value}</div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        {trend && (
          <span className="text-xs font-medium text-success">{trend}</span>
        )}
      </div>
    </div>
  );
};
