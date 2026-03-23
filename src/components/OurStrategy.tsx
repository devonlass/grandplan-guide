import { useState, useMemo, useEffect } from "react";
import { SectionCard } from "./SectionCard";
import { FieldGroup } from "./FieldGroup";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, ArrowRight, Zap, Target, Shield, TrendingUp, Users, RefreshCw, Plus, X, UserCircle } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Cell } from "recharts";
import { Button } from "@/components/ui/button";
import {
  useStrategyConfig, useUpsertStrategyConfig,
  useOpportunities, useAddOpportunity, useUpdateOpportunity, useDeleteOpportunity,
  useThreats, useAddThreat, useUpdateThreat, useDeleteThreat,
  useAdvantages, useAddAdvantage, useUpdateAdvantage, useDeleteAdvantage,
  useTeamMembers, useAddTeamMember, useUpdateTeamMember, useDeleteTeamMember,
} from "@/hooks/useOurStrategy";

const playTypes = [
  { value: "land-expand",  label: "Land & Expand",   icon: TrendingUp, description: "Win initial deal, then grow footprint" },
  { value: "defend-grow",  label: "Defend & Grow",    icon: Shield,     description: "Protect base while expanding value" },
  { value: "cross-sell",   label: "Cross-sell",        icon: Target,     description: "Introduce new products/modules" },
  { value: "retention",    label: "Retention",         icon: RefreshCw,  description: "Secure renewal, minimize churn risk" },
  { value: "expand-users", label: "Expand Users",      icon: Users,      description: "Grow user base within account" },
];

const teamRoles = [
  { value: "account-manager",          label: "Account Manager" },
  { value: "technical-account-manager",label: "Technical Account Manager" },
  { value: "slt-sponsor",              label: "SLT Sponsor" },
  { value: "customer-support-manager", label: "Customer Support Manager" },
  { value: "ps-consultant",            label: "PS Consultant" },
];

const competitors = [
  { value: "bassnet",    label: "Bassnet" },
  { value: "sertica",    label: "Sertica" },
  { value: "mariapps",   label: "MariApps" },
  { value: "sap",        label: "SAP" },
  { value: "helm",       label: "Helm" },
  { value: "jibe",       label: "Jibe" },
  { value: "shipmanager",label: "ShipManager" },
  { value: "danaos",     label: "Danaos" },
  { value: "ibm-maximo", label: "IBM - Maximo" },
  { value: "frs",        label: "FRS" },
  { value: "arribatec",  label: "Arribatec Marine – InfoSHIP" },
  { value: "oceanly",    label: "Oceanly" },
  { value: "mespas",     label: "MESPAS" },
  { value: "other",      label: "Other" },
];

const stageOrder = ["new", "qualified", "demo", "proposal-sent", "negotiation"];
const stageLabels: Record<string, string> = {
  "new": "New", "qualified": "Qualified", "demo": "Demo",
  "proposal-sent": "Proposal Sent", "negotiation": "Negotiation",
};
const stageColors: Record<string, string> = {
  "new": "hsl(var(--muted-foreground))",
  "qualified": "hsl(var(--primary))",
  "demo": "hsl(var(--primary))",
  "proposal-sent": "#ca8a04",
  "negotiation": "#16a34a",
};

const parseValue = (v: string | null): number => {
  if (!v) return 0;
  const cleaned = v.replace(/[$,\s]/g, "").toUpperCase();
  const match = cleaned.match(/^([\d.]+)([KM])?$/);
  if (!match) return 0;
  const multipliers: Record<string, number> = { K: 1000, M: 1000000 };
  const num = parseFloat(match[1]);
  const suffix = match[2] as keyof typeof multipliers;
  return suffix ? num * multipliers[suffix] : num;
};

const parseProbability = (p: string | null): number => {
  if (!p) return 0;
  const num = parseFloat(p.replace("%", ""));
  return isNaN(num) ? 0 : num / 100;
};

const formatCurrency = (v: number): string => {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000)    return `$${(v / 1000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
};

interface Props { planId: string; }

export const OurStrategy = ({ planId }: Props) => {
  // ── config ──────────────────────────────────────────────────────────────────
  const { data: config } = useStrategyConfig(planId);
  const { mutate: upsertConfig } = useUpsertStrategyConfig();

  const [selectedPlay,      setSelectedPlay]      = useState("land-expand");
  const [milestones,        setMilestones]        = useState("");
  const [valueProposition,  setValueProposition]  = useState("");

  useEffect(() => {
    if (!config) return;
    setSelectedPlay(config.strategic_play ?? "land-expand");
    setMilestones(config.milestones ?? "");
    setValueProposition(config.unique_value_proposition ?? "");
  }, [config]);

  const saveConfig = (updates: object) => upsertConfig({ planId, ...updates } as Parameters<typeof upsertConfig>[0]);

  // ── opportunities ────────────────────────────────────────────────────────────
  const { data: opportunities = [] } = useOpportunities(planId);
  const { mutate: addOpp }    = useAddOpportunity();
  const { mutate: updateOpp } = useUpdateOpportunity();
  const { mutate: deleteOpp } = useDeleteOpportunity();

  // ── threats ──────────────────────────────────────────────────────────────────
  const { data: threats = [] }   = useThreats(planId);
  const { mutate: addThreat }    = useAddThreat();
  const { mutate: updateThreat } = useUpdateThreat();
  const { mutate: deleteThreat } = useDeleteThreat();

  // ── advantages ───────────────────────────────────────────────────────────────
  const { data: advantages = [] }   = useAdvantages(planId);
  const { mutate: addAdvantage }    = useAddAdvantage();
  const { mutate: updateAdvantage } = useUpdateAdvantage();
  const { mutate: deleteAdvantage } = useDeleteAdvantage();

  // ── team members ─────────────────────────────────────────────────────────────
  const { data: coreTeam = [] }   = useTeamMembers(planId);
  const { mutate: addMember }     = useAddTeamMember();
  const { mutate: updateMember }  = useUpdateTeamMember();
  const { mutate: deleteMember }  = useDeleteTeamMember();

  // ── derived ─────────────────────────────────────────────────────────────────
  const currentPlay = playTypes.find((p) => p.value === selectedPlay);

  const pipelineMetrics = opportunities.reduce(
    (acc, opp) => {
      const value = parseValue(opp.value);
      const prob  = parseProbability(opp.probability);
      return { totalValue: acc.totalValue + value, weightedValue: acc.weightedValue + value * prob };
    },
    { totalValue: 0, weightedValue: 0 }
  );

  const pipelineChartData = useMemo(() => {
    const stageMap: Record<string, { total: number; weighted: number; count: number }> = {};
    stageOrder.forEach((s) => { stageMap[s] = { total: 0, weighted: 0, count: 0 }; });
    opportunities.forEach((opp) => {
      const v = parseValue(opp.value);
      const p = parseProbability(opp.probability);
      if (stageMap[opp.status]) {
        stageMap[opp.status].total    += v;
        stageMap[opp.status].weighted += v * p;
        stageMap[opp.status].count    += 1;
      }
    });
    return stageOrder
      .filter((s) => stageMap[s].count > 0)
      .map((s) => ({ stage: s, label: stageLabels[s], ...stageMap[s], fill: stageColors[s] }));
  }, [opportunities]);

  const chartConfig = { weighted: { label: "Weighted Value", color: "hsl(var(--primary))" } };

  return (
    <SectionCard title="Our Strategy" badge={
      <span className="text-xs text-muted-foreground font-normal">How we win & grow this account</span>
    }>
      <div className="space-y-6">
        {/* Value Proposition */}
        <div className="bg-primary/5 border border-primary/10 rounded-lg p-5">
          <h4 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Unique Value Proposition
          </h4>
          <Textarea
            value={valueProposition}
            onChange={(e) => setValueProposition(e.target.value)}
            onBlur={() => saveConfig({ unique_value_proposition: valueProposition })}
            placeholder="Describe what makes your solution uniquely valuable to this account..."
            className="bg-background/50 resize-none text-sm leading-relaxed min-h-[80px]"
            rows={3}
          />
        </div>

        {/* Growth Opportunities */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium">Growth Opportunities</h4>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Total Pipeline:</span>
                <span className="font-semibold">{formatCurrency(pipelineMetrics.totalValue)}</span>
              </div>
              <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
                <span className="text-muted-foreground">Weighted:</span>
                <span className="font-semibold text-primary">{formatCurrency(pipelineMetrics.weightedValue)}</span>
              </div>
            </div>
          </div>

          {pipelineChartData.length > 0 && (
            <div className="mb-6 p-4 bg-muted/20 rounded-lg border border-border/50">
              <h5 className="text-xs font-medium text-muted-foreground mb-3">Pipeline by Stage (Weighted Value)</h5>
              <ChartContainer config={chartConfig} className="h-[140px] w-full">
                <BarChart data={pipelineChartData} layout="vertical" margin={{ left: 0, right: 40, top: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="label" axisLine={false} tickLine={false} width={80} tick={{ fontSize: 11 }} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(_value, _name, item) => (
                          <div className="flex flex-col gap-1">
                            <span className="font-medium">{formatCurrency(item.payload.weighted)} weighted</span>
                            <span className="text-muted-foreground text-xs">{formatCurrency(item.payload.total)} total ({item.payload.count} opp{item.payload.count > 1 ? "s" : ""})</span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Bar dataKey="weighted" radius={[0, 4, 4, 0]} maxBarSize={24}>
                    {pipelineChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Opportunity</th><th>Value</th><th>Timeline</th><th>Probability</th><th>Status</th><th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {opportunities.map((opp) => (
                  <tr key={opp.id} className="group">
                    <td><Input value={opp.name ?? ""} onChange={(e) => updateOpp({ id: opp.id, planId, name: e.target.value })} placeholder="Opportunity name" className="h-8 text-sm font-medium bg-background border-0 focus-visible:ring-1" /></td>
                    <td><Input value={opp.value ?? ""} onChange={(e) => updateOpp({ id: opp.id, planId, value: e.target.value })} placeholder="$0" className="h-8 text-sm bg-background border-0 focus-visible:ring-1 w-24" /></td>
                    <td><Input value={opp.timeline ?? ""} onChange={(e) => updateOpp({ id: opp.id, planId, timeline: e.target.value })} placeholder="Q1 2025" className="h-8 text-sm bg-background border-0 focus-visible:ring-1 w-24" /></td>
                    <td><Input value={opp.probability ?? ""} onChange={(e) => updateOpp({ id: opp.id, planId, probability: e.target.value })} placeholder="0%" className="h-8 text-sm bg-background border-0 focus-visible:ring-1 w-16" /></td>
                    <td>
                      <Select value={opp.status} onValueChange={(v) => updateOpp({ id: opp.id, planId, status: v as typeof opp.status })}>
                        <SelectTrigger className="h-8 text-xs bg-background border-0 w-28"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-popover border shadow-lg z-50">
                          <SelectItem value="new"><Badge className="status-pill bg-muted text-muted-foreground">New</Badge></SelectItem>
                          <SelectItem value="qualified"><Badge className="status-pill status-active">Qualified</Badge></SelectItem>
                          <SelectItem value="demo"><Badge className="status-pill status-active">Demo</Badge></SelectItem>
                          <SelectItem value="proposal-sent"><Badge className="status-pill bg-yellow-100 text-yellow-700">Proposal Sent</Badge></SelectItem>
                          <SelectItem value="negotiation"><Badge className="status-pill bg-green-100 text-green-700">Negotiation</Badge></SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteOpp({ id: opp.id, planId })}>
                        <X className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground mt-2" onClick={() => addOpp(planId)}>
              <Plus className="w-3 h-3 mr-1" /> Add opportunity
            </Button>
          </div>
        </div>

        {/* Competitive Position */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FieldGroup label="Competitive Threats">
            <div className="space-y-2">
              {threats.map((threat) => (
                <div key={threat.id} className="flex items-start gap-2 group">
                  <Select value={threat.level} onValueChange={(v) => updateThreat({ id: threat.id, planId, level: v as typeof threat.level })}>
                    <SelectTrigger className="w-16 h-8 text-xs bg-background"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover border shadow-lg z-50">
                      <SelectItem value="high"><span className="text-destructive">●</span></SelectItem>
                      <SelectItem value="medium"><span className="text-yellow-500">●</span></SelectItem>
                      <SelectItem value="low"><span className="text-muted-foreground">●</span></SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={threat.competitor ?? ""} onValueChange={(v) => updateThreat({ id: threat.id, planId, competitor: v })}>
                    <SelectTrigger className="w-32 h-8 text-sm font-medium bg-background"><SelectValue placeholder="Competitor" /></SelectTrigger>
                    <SelectContent className="bg-popover border shadow-lg z-50">
                      {competitors.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input value={threat.note ?? ""} onChange={(e) => updateThreat({ id: threat.id, planId, note: e.target.value })} placeholder="Threat details..." className="flex-1 h-8 text-sm bg-background" />
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteThreat({ id: threat.id, planId })}>
                    <X className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => addThreat(planId)}>
                <Plus className="w-3 h-3 mr-1" /> Add threat
              </Button>
            </div>
          </FieldGroup>

          <FieldGroup label="Our Advantages">
            <div className="space-y-2">
              {advantages.map((adv) => (
                <div key={adv.id} className="flex items-center gap-2 group">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <Input value={adv.text ?? ""} onChange={(e) => updateAdvantage({ id: adv.id, planId, text: e.target.value })} placeholder="Describe advantage..." className="flex-1 h-8 text-sm bg-background" />
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteAdvantage({ id: adv.id, planId })}>
                    <X className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => addAdvantage(planId)}>
                <Plus className="w-3 h-3 mr-1" /> Add advantage
              </Button>
            </div>
          </FieldGroup>
        </div>

        {/* Core Team */}
        <FieldGroup label="Core Team" hubspotField="TAM">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {coreTeam.map((member) => (
              <div key={member.id} className="flex items-center gap-2 bg-muted/30 rounded-lg p-2 group">
                <UserCircle className="w-8 h-8 text-accent flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-1">
                  <Input value={member.name ?? ""} onChange={(e) => updateMember({ id: member.id, planId, name: e.target.value })} placeholder="Name" className="h-6 text-sm font-medium bg-background px-2" />
                  <Select value={member.role ?? ""} onValueChange={(v) => updateMember({ id: member.id, planId, role: v as typeof member.role })}>
                    <SelectTrigger className="h-6 text-xs bg-background px-2"><SelectValue placeholder="Select role" /></SelectTrigger>
                    <SelectContent className="bg-popover border shadow-lg z-50">
                      {teamRoles.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteMember({ id: member.id, planId })}>
                  <X className="w-3 h-3 text-muted-foreground" />
                </Button>
              </div>
            ))}
            <Button variant="ghost" className="h-auto min-h-[60px] border border-dashed border-border text-xs text-muted-foreground flex items-center justify-center gap-1" onClick={() => addMember(planId)}>
              <Plus className="w-3 h-3" /> Add member
            </Button>
          </div>
        </FieldGroup>

        {/* Strategic Play */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-4">
          <h4 className="text-sm font-medium">This Quarter's Strategic Play</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Play Type</label>
              <Select value={selectedPlay} onValueChange={(v) => { setSelectedPlay(v); saveConfig({ strategic_play: v }); }}>
                <SelectTrigger className="w-full bg-background"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover border shadow-lg z-50">
                  {playTypes.map((play) => (
                    <SelectItem key={play.value} value={play.value}>
                      <div className="flex items-center gap-2">
                        <play.icon className="w-4 h-4 text-accent" />
                        <span>{play.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {currentPlay && <p className="text-xs text-muted-foreground mt-1.5">{currentPlay.description}</p>}
            </div>
            <div className="flex items-center justify-center">
              {currentPlay && (
                <div className="flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full">
                  <currentPlay.icon className="w-4 h-4" />
                  <span className="font-medium">{currentPlay.label}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Milestone Sequence (use → to separate steps)</label>
            <Textarea
              value={milestones}
              onChange={(e) => setMilestones(e.target.value)}
              onBlur={() => saveConfig({ milestones })}
              placeholder="Step 1 → Step 2 → Step 3"
              className="bg-background resize-none text-sm"
              rows={2}
            />
          </div>

          <div className="pt-2 border-t border-border/50">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {milestones.split("→").map((step, index, arr) => (
                <span key={index} className="flex items-center gap-2">
                  <span className="bg-background px-3 py-1 rounded-md border border-border">{step.trim()}</span>
                  {index < arr.length - 1 && <ArrowRight className="w-4 h-4 text-accent flex-shrink-0" />}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
};
