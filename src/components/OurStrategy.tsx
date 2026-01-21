import { useState } from "react";
import { SectionCard } from "./SectionCard";
import { FieldGroup } from "./FieldGroup";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, ArrowRight, Zap, Target, Shield, TrendingUp, Users, RefreshCw, Plus, X, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const playTypes = [
  { value: "land-expand", label: "Land & Expand", icon: TrendingUp, description: "Win initial deal, then grow footprint" },
  { value: "defend-grow", label: "Defend & Grow", icon: Shield, description: "Protect base while expanding value" },
  { value: "cross-sell", label: "Cross-sell", icon: Target, description: "Introduce new products/modules" },
  { value: "retention", label: "Retention", icon: RefreshCw, description: "Secure renewal, minimize churn risk" },
  { value: "expand-users", label: "Expand Users", icon: Users, description: "Grow user base within account" },
];

const teamRoles = [
  { value: "account-manager", label: "Account Manager" },
  { value: "technical-account-manager", label: "Technical Account Manager" },
  { value: "slt-sponsor", label: "SLT Sponsor" },
  { value: "customer-support-manager", label: "Customer Support Manager" },
  { value: "ps-consultant", label: "PS Consultant" },
];

const competitors = [
  { value: "bassnet", label: "Bassnet" },
  { value: "sertica", label: "Sertica" },
  { value: "mariapps", label: "MariApps" },
  { value: "sap", label: "SAP" },
  { value: "helm", label: "Helm" },
  { value: "jibe", label: "Jibe" },
  { value: "shipmanager", label: "ShipManager" },
  { value: "danaos", label: "Danaos" },
  { value: "ibm-maximo", label: "IBM - Maximo" },
  { value: "frs", label: "FRS" },
  { value: "arribatec", label: "Arribatec Marine – InfoSHIP" },
  { value: "oceanly", label: "Oceanly" },
  { value: "mespas", label: "MESPAS" },
  { value: "other", label: "Other" },
];

export const OurStrategy = () => {
  const [selectedPlay, setSelectedPlay] = useState("land-expand");
  const [milestones, setMilestones] = useState(
    "Secure EU Compliance win → Build case for AI add-on → Position for license expansion at renewal"
  );
  const [valueProposition, setValueProposition] = useState(
    "Accelerate Acme's European expansion with our proven compliance automation suite, reducing time-to-market by 40% while cutting regulatory risk. Unlike competitors, our platform integrates natively with their existing SAP infrastructure."
  );
  const [threats, setThreats] = useState([
    { id: 1, competitor: "sertica", note: "Aggressive pricing, but weak on compliance", level: "high" },
    { id: 2, competitor: "mariapps", note: "Strong in EU, pursuing this account", level: "medium" },
  ]);
  const [advantages, setAdvantages] = useState([
    { id: 1, text: "5-year relationship, trusted advisor status" },
    { id: 2, text: "Deep SAP integration expertise" },
    { id: 3, text: "Proven ROI: 3.2x documented return" },
  ]);
  const [opportunities, setOpportunities] = useState([
    { id: 1, name: "EU Compliance Module", value: "$450K", timeline: "Q2 2025", probability: "75%", status: "in-progress" },
    { id: 2, name: "AI Customer Service Add-on", value: "$280K", timeline: "Q3 2025", probability: "40%", status: "discovery" },
    { id: 3, name: "Enterprise License Expansion", value: "$600K", timeline: "Q4 2025", probability: "60%", status: "proposal" },
  ]);
  const [coreTeam, setCoreTeam] = useState([
    { id: 1, name: "Sarah Chen", role: "account-manager" },
    { id: 2, name: "Michael Torres", role: "technical-account-manager" },
    { id: 3, name: "Emma Wilson", role: "customer-support-manager" },
    { id: 4, name: "David Kim", role: "ps-consultant" },
  ]);

  const currentPlay = playTypes.find(p => p.value === selectedPlay);

  const addTeamMember = () => {
    setCoreTeam([...coreTeam, { id: Date.now(), name: "", role: "" }]);
  };

  const removeTeamMember = (id: number) => {
    setCoreTeam(coreTeam.filter(m => m.id !== id));
  };

  const updateTeamMember = (id: number, field: string, value: string) => {
    setCoreTeam(coreTeam.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const addThreat = () => {
    setThreats([...threats, { id: Date.now(), competitor: "", note: "", level: "medium" }]);
  };

  const removeThreat = (id: number) => {
    setThreats(threats.filter(t => t.id !== id));
  };

  const updateThreat = (id: number, field: string, value: string) => {
    setThreats(threats.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const addAdvantage = () => {
    setAdvantages([...advantages, { id: Date.now(), text: "" }]);
  };

  const removeAdvantage = (id: number) => {
    setAdvantages(advantages.filter(a => a.id !== id));
  };

  const updateAdvantage = (id: number, text: string) => {
    setAdvantages(advantages.map(a => a.id === id ? { ...a, text } : a));
  };

  const addOpportunity = () => {
    setOpportunities([...opportunities, { id: Date.now(), name: "", value: "", timeline: "", probability: "", status: "discovery" }]);
  };

  const removeOpportunity = (id: number) => {
    setOpportunities(opportunities.filter(o => o.id !== id));
  };

  const updateOpportunity = (id: number, field: string, value: string) => {
    setOpportunities(opportunities.map(o => o.id === id ? { ...o, [field]: value } : o));
  };

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
            placeholder="Describe what makes your solution uniquely valuable to this account..."
            className="bg-background/50 resize-none text-sm leading-relaxed min-h-[80px]"
            rows={3}
          />
        </div>

        {/* Growth Opportunities */}
        <div>
          <h4 className="text-sm font-medium mb-4">Growth Opportunities</h4>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Opportunity</th>
                  <th>Value</th>
                  <th>Timeline</th>
                  <th>Probability</th>
                  <th>Status</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {opportunities.map((opp) => (
                  <tr key={opp.id} className="group">
                    <td>
                      <Input
                        value={opp.name}
                        onChange={(e) => updateOpportunity(opp.id, "name", e.target.value)}
                        placeholder="Opportunity name"
                        className="h-8 text-sm font-medium bg-background border-0 focus-visible:ring-1"
                      />
                    </td>
                    <td>
                      <Input
                        value={opp.value}
                        onChange={(e) => updateOpportunity(opp.id, "value", e.target.value)}
                        placeholder="$0"
                        className="h-8 text-sm bg-background border-0 focus-visible:ring-1 w-24"
                      />
                    </td>
                    <td>
                      <Input
                        value={opp.timeline}
                        onChange={(e) => updateOpportunity(opp.id, "timeline", e.target.value)}
                        placeholder="Q1 2025"
                        className="h-8 text-sm bg-background border-0 focus-visible:ring-1 w-24"
                      />
                    </td>
                    <td>
                      <Input
                        value={opp.probability}
                        onChange={(e) => updateOpportunity(opp.id, "probability", e.target.value)}
                        placeholder="0%"
                        className="h-8 text-sm bg-background border-0 focus-visible:ring-1 w-16"
                      />
                    </td>
                    <td>
                      <Select value={opp.status} onValueChange={(v) => updateOpportunity(opp.id, "status", v)}>
                        <SelectTrigger className="h-8 text-xs bg-background border-0 w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border shadow-lg z-50">
                          <SelectItem value="discovery">
                            <Badge className="status-pill bg-muted text-muted-foreground">Discovery</Badge>
                          </SelectItem>
                          <SelectItem value="in-progress">
                            <Badge className="status-pill status-active">In Progress</Badge>
                          </SelectItem>
                          <SelectItem value="proposal">
                            <Badge className="status-pill status-active">Proposal</Badge>
                          </SelectItem>
                          <SelectItem value="negotiation">
                            <Badge className="status-pill bg-warning/20 text-warning">Negotiation</Badge>
                          </SelectItem>
                          <SelectItem value="closed-won">
                            <Badge className="status-pill bg-success/20 text-success">Closed Won</Badge>
                          </SelectItem>
                          <SelectItem value="closed-lost">
                            <Badge className="status-pill bg-destructive/20 text-destructive">Closed Lost</Badge>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeOpportunity(opp.id)}
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground mt-2" onClick={addOpportunity}>
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
                  <Select value={threat.level} onValueChange={(v) => updateThreat(threat.id, "level", v)}>
                    <SelectTrigger className="w-16 h-8 text-xs bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border shadow-lg z-50">
                      <SelectItem value="high">
                        <span className="text-destructive">●</span>
                      </SelectItem>
                      <SelectItem value="medium">
                        <span className="text-warning">●</span>
                      </SelectItem>
                      <SelectItem value="low">
                        <span className="text-muted-foreground">●</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={threat.competitor} onValueChange={(v) => updateThreat(threat.id, "competitor", v)}>
                    <SelectTrigger className="w-32 h-8 text-sm font-medium bg-background">
                      <SelectValue placeholder="Competitor" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border shadow-lg z-50">
                      {competitors.map((comp) => (
                        <SelectItem key={comp.value} value={comp.value}>
                          {comp.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={threat.note}
                    onChange={(e) => updateThreat(threat.id, "note", e.target.value)}
                    placeholder="Threat details..."
                    className="flex-1 h-8 text-sm bg-background"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeThreat(threat.id)}
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={addThreat}>
                <Plus className="w-3 h-3 mr-1" /> Add threat
              </Button>
            </div>
          </FieldGroup>

          <FieldGroup label="Our Advantages">
            <div className="space-y-2">
              {advantages.map((adv) => (
                <div key={adv.id} className="flex items-center gap-2 group">
                  <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                  <Input
                    value={adv.text}
                    onChange={(e) => updateAdvantage(adv.id, e.target.value)}
                    placeholder="Describe advantage..."
                    className="flex-1 h-8 text-sm bg-background"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeAdvantage(adv.id)}
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={addAdvantage}>
                <Plus className="w-3 h-3 mr-1" /> Add advantage
              </Button>
            </div>
          </FieldGroup>
        </div>

        {/* Core Team */}
        <FieldGroup label="Core Team">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {coreTeam.map((member) => (
              <div key={member.id} className="flex items-center gap-2 bg-muted/30 rounded-lg p-2 group">
                <UserCircle className="w-8 h-8 text-accent flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-1">
                  <Input
                    value={member.name}
                    onChange={(e) => updateTeamMember(member.id, "name", e.target.value)}
                    placeholder="Name"
                    className="h-6 text-sm font-medium bg-background px-2"
                  />
                  <Select value={member.role} onValueChange={(v) => updateTeamMember(member.id, "role", v)}>
                    <SelectTrigger className="h-6 text-xs bg-background px-2">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border shadow-lg z-50">
                      {teamRoles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeTeamMember(member.id)}
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </Button>
              </div>
            ))}
            <Button 
              variant="ghost" 
              className="h-auto min-h-[60px] border border-dashed border-border text-xs text-muted-foreground flex items-center justify-center gap-1"
              onClick={addTeamMember}
            >
              <Plus className="w-3 h-3" /> Add member
            </Button>
          </div>
        </FieldGroup>

        <div className="bg-muted/30 rounded-lg p-4 space-y-4">
          <h4 className="text-sm font-medium">This Quarter's Strategic Play</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Play Type Selector */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Play Type</label>
              <Select value={selectedPlay} onValueChange={setSelectedPlay}>
                <SelectTrigger className="w-full bg-background">
                  <SelectValue />
                </SelectTrigger>
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
              {currentPlay && (
                <p className="text-xs text-muted-foreground mt-1.5">{currentPlay.description}</p>
              )}
            </div>

            {/* Current Play Display */}
            <div className="flex items-center justify-center">
              {currentPlay && (
                <div className="flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full">
                  <currentPlay.icon className="w-4 h-4" />
                  <span className="font-medium">{currentPlay.label}</span>
                </div>
              )}
            </div>
          </div>

          {/* Milestone Sequence */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">
              Milestone Sequence (use → to separate steps)
            </label>
            <Textarea
              value={milestones}
              onChange={(e) => setMilestones(e.target.value)}
              placeholder="Step 1 → Step 2 → Step 3"
              className="bg-background resize-none text-sm"
              rows={2}
            />
          </div>

          {/* Visual Milestone Display */}
          <div className="pt-2 border-t border-border/50">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {milestones.split("→").map((step, index, arr) => (
                <span key={index} className="flex items-center gap-2">
                  <span className="bg-background px-3 py-1 rounded-md border border-border">
                    {step.trim()}
                  </span>
                  {index < arr.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-accent flex-shrink-0" />
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
};
