import { SectionCard } from "./SectionCard";
import { FieldGroup } from "./FieldGroup";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Calendar, DollarSign, TrendingUp, Users, Anchor } from "lucide-react";

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

export const AccountOverview = () => {
  return (
    <SectionCard title="Account Overview">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Key Metrics Row */}
        <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b border-border">
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
            <SelectContent>
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

        <FieldGroup label="Account Tier" hubspotField="account_tier">
          <Badge variant="default" className="bg-accent text-accent-foreground">
            Tier 1 - Strategic
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
