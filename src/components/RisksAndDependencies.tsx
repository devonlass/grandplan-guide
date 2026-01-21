import { SectionCard } from "./SectionCard";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, ExternalLink } from "lucide-react";

interface Risk {
  risk: string;
  impact: "high" | "medium" | "low";
  likelihood: "high" | "medium" | "low";
  mitigation: string;
}

interface Dependency {
  dependency: string;
  status: "on-track" | "at-risk" | "blocked";
  owner: string;
}

const risks: Risk[] = [
  {
    risk: "Security team blocks due to data residency concerns",
    impact: "high",
    likelihood: "medium",
    mitigation: "Proactively share EU data center roadmap; involve legal early",
  },
  {
    risk: "Budget cuts delay Q2 expansion decision",
    impact: "high",
    likelihood: "low",
    mitigation: "Build ironclad ROI case; secure CTO commitment in writing",
  },
  {
    risk: "Competitor CloudFirst wins EU compliance deal",
    impact: "medium",
    likelihood: "medium",
    mitigation: "Accelerate timeline; offer pilot pricing; leverage SAP advantage",
  },
];

const dependencies: Dependency[] = [
  {
    dependency: "EU data center launch (Product team)",
    status: "on-track",
    owner: "Product",
  },
  {
    dependency: "SOC2 Type II certification renewal",
    status: "on-track",
    owner: "Security",
  },
  {
    dependency: "SAP integration v2.0 release",
    status: "at-risk",
    owner: "Engineering",
  },
];

export const RisksAndDependencies = () => {
  const getImpactColor = (level: "high" | "medium" | "low") => {
    switch (level) {
      case "high": return "bg-destructive/10 text-destructive";
      case "medium": return "bg-warning/10 text-warning";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: Dependency["status"]) => {
    switch (status) {
      case "on-track": return "status-active";
      case "at-risk": return "status-at-risk";
      default: return "status-churned";
    }
  };

  return (
    <SectionCard title="Risks & Dependencies" defaultOpen={false}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risks */}
        <div>
          <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            Key Risks
          </h4>
          <div className="space-y-3">
            {risks.map((r, i) => (
              <div key={i} className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <span className="text-sm font-medium">{r.risk}</span>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <Badge className={`${getImpactColor(r.impact)} text-[10px] px-1.5`}>
                      Impact: {r.impact}
                    </Badge>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Mitigation:</span> {r.mitigation}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dependencies */}
        <div>
          <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-accent" />
            Internal Dependencies
          </h4>
          <div className="space-y-3">
            {dependencies.map((d, i) => (
              <div key={i} className="flex items-center justify-between bg-muted/30 rounded-lg p-4">
                <div>
                  <div className="text-sm font-medium">{d.dependency}</div>
                  <div className="text-xs text-muted-foreground">Owner: {d.owner}</div>
                </div>
                <Badge className={`status-pill ${getStatusColor(d.status)}`}>
                  {d.status.replace("-", " ")}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
};
