import { SectionCard } from "./SectionCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Shield, ExternalLink, Plus, X } from "lucide-react";
import { useRisks, useAddRisk, useUpdateRisk, useDeleteRisk, useDependencies, useAddDependency, useUpdateDependency, useDeleteDependency } from "@/hooks/useRisksAndDependencies";
import type { Risk, Dependency } from "@/types/database";

interface Props { planId: string; }

const getImpactColor = (level: "high" | "medium" | "low") => {
  switch (level) {
    case "high":   return "bg-destructive/10 text-destructive";
    case "medium": return "bg-yellow-100 text-yellow-700";
    default:       return "bg-muted text-muted-foreground";
  }
};

const getStatusColor = (status: Dependency["status"]) => {
  switch (status) {
    case "on-track": return "status-active";
    case "at-risk":  return "status-at-risk";
    default:         return "status-churned";
  }
};

export const RisksAndDependencies = ({ planId }: Props) => {
  const { data: risks = [],        isLoading: risksLoading }  = useRisks(planId);
  const { data: dependencies = [], isLoading: depsLoading }   = useDependencies(planId);
  const { mutate: addRisk }         = useAddRisk();
  const { mutate: updateRisk }      = useUpdateRisk();
  const { mutate: deleteRisk }      = useDeleteRisk();
  const { mutate: addDep }          = useAddDependency();
  const { mutate: updateDep }       = useUpdateDependency();
  const { mutate: deleteDep }       = useDeleteDependency();

  if (risksLoading || depsLoading) return <SectionCard title="Risks & Dependencies"><div className="animate-pulse h-40 bg-muted rounded" /></SectionCard>;

  return (
    <SectionCard title="Risks & Dependencies" defaultOpen={false}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risks */}
        <div>
          <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            Key Risks
          </h4>
          <div className="space-y-3">
            {risks.map((r) => (
              <div key={r.id} className="bg-muted/30 rounded-lg p-4 group relative">
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteRisk({ id: r.id, planId })}>
                  <X className="w-3 h-3 text-muted-foreground" />
                </Button>
                <Input value={r.risk ?? ""} onChange={(e) => updateRisk({ id: r.id, planId, risk: e.target.value })} placeholder="Describe risk…" className="h-7 text-sm font-medium bg-background border-0 focus-visible:ring-1 mb-2 pr-8" />
                <div className="flex gap-2 mb-2">
                  <Select value={r.impact} onValueChange={(v) => updateRisk({ id: r.id, planId, impact: v as Risk["impact"] })}>
                    <SelectTrigger className="h-7 border-0 bg-transparent p-0 w-auto">
                      <Badge className={`${getImpactColor(r.impact)} text-[10px] px-1.5 cursor-pointer`}>Impact: {r.impact}</Badge>
                    </SelectTrigger>
                    <SelectContent className="bg-popover border shadow-lg z-50">
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={r.likelihood} onValueChange={(v) => updateRisk({ id: r.id, planId, likelihood: v as Risk["likelihood"] })}>
                    <SelectTrigger className="h-7 border-0 bg-transparent p-0 w-auto">
                      <Badge className={`${getImpactColor(r.likelihood)} text-[10px] px-1.5 cursor-pointer`}>Likelihood: {r.likelihood}</Badge>
                    </SelectTrigger>
                    <SelectContent className="bg-popover border shadow-lg z-50">
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Mitigation: </span>
                  <Input value={r.mitigation ?? ""} onChange={(e) => updateRisk({ id: r.id, planId, mitigation: e.target.value })} placeholder="Describe mitigation…" className="h-6 text-xs bg-background border-0 focus-visible:ring-1 mt-1" />
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground mt-2" onClick={() => addRisk(planId)}>
            <Plus className="w-3 h-3 mr-1" /> Add risk
          </Button>
        </div>

        {/* Dependencies */}
        <div>
          <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-accent" />
            Internal Dependencies
          </h4>
          <div className="space-y-3">
            {dependencies.map((d) => (
              <div key={d.id} className="flex items-center justify-between bg-muted/30 rounded-lg p-4 group">
                <div className="flex-1 min-w-0 mr-3">
                  <Input value={d.dependency ?? ""} onChange={(e) => updateDep({ id: d.id, planId, dependency: e.target.value })} placeholder="Describe dependency…" className="h-7 text-sm font-medium bg-background border-0 focus-visible:ring-1 mb-1" />
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>Owner:</span>
                    <Input value={d.owner ?? ""} onChange={(e) => updateDep({ id: d.id, planId, owner: e.target.value })} placeholder="Team" className="h-5 text-xs bg-background border-0 focus-visible:ring-1 w-24 px-1" />
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Select value={d.status} onValueChange={(v) => updateDep({ id: d.id, planId, status: v as Dependency["status"] })}>
                    <SelectTrigger className="h-8 border-0 bg-transparent p-0 w-auto">
                      <Badge className={`status-pill ${getStatusColor(d.status)} cursor-pointer`}>{d.status.replace("-", " ")}</Badge>
                    </SelectTrigger>
                    <SelectContent className="bg-popover border shadow-lg z-50">
                      <SelectItem value="on-track">On track</SelectItem>
                      <SelectItem value="at-risk">At risk</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteDep({ id: d.id, planId })}>
                    <X className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground mt-2" onClick={() => addDep(planId)}>
            <Plus className="w-3 h-3 mr-1" /> Add dependency
          </Button>
        </div>
      </div>
    </SectionCard>
  );
};
