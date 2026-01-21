import { useState } from "react";
import { SectionCard } from "./SectionCard";
import { FieldGroup } from "./FieldGroup";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, ArrowRight, Zap, Target, Shield, TrendingUp, Users, RefreshCw } from "lucide-react";

const playTypes = [
  { value: "land-expand", label: "Land & Expand", icon: TrendingUp, description: "Win initial deal, then grow footprint" },
  { value: "defend-grow", label: "Defend & Grow", icon: Shield, description: "Protect base while expanding value" },
  { value: "cross-sell", label: "Cross-sell", icon: Target, description: "Introduce new products/modules" },
  { value: "retention", label: "Retention", icon: RefreshCw, description: "Secure renewal, minimize churn risk" },
  { value: "expand-users", label: "Expand Users", icon: Users, description: "Grow user base within account" },
];

export const OurStrategy = () => {
  const [selectedPlay, setSelectedPlay] = useState("land-expand");
  const [milestones, setMilestones] = useState(
    "Secure EU Compliance win → Build case for AI add-on → Position for license expansion at renewal"
  );

  const currentPlay = playTypes.find(p => p.value === selectedPlay);

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
          <p className="text-sm leading-relaxed">
            Accelerate Acme's European expansion with our proven compliance automation suite, 
            reducing time-to-market by 40% while cutting regulatory risk. Unlike competitors, 
            our platform integrates natively with their existing SAP infrastructure.
          </p>
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
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-medium">EU Compliance Module</td>
                  <td>$450K</td>
                  <td>Q2 2025</td>
                  <td>75%</td>
                  <td><Badge className="status-pill status-active">In Progress</Badge></td>
                </tr>
                <tr>
                  <td className="font-medium">AI Customer Service Add-on</td>
                  <td>$280K</td>
                  <td>Q3 2025</td>
                  <td>40%</td>
                  <td><Badge className="status-pill bg-muted text-muted-foreground">Discovery</Badge></td>
                </tr>
                <tr>
                  <td className="font-medium">Enterprise License Expansion</td>
                  <td>$600K</td>
                  <td>Q4 2025</td>
                  <td>60%</td>
                  <td><Badge className="status-pill status-active">Proposal</Badge></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Competitive Position */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FieldGroup label="Competitive Threats">
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                <span><strong>TechCorp:</strong> Aggressive pricing, but weak on compliance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-warning mt-1">•</span>
                <span><strong>CloudFirst:</strong> Strong in EU, pursuing this account</span>
              </li>
            </ul>
          </FieldGroup>

          <FieldGroup label="Our Advantages">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                <span>5-year relationship, trusted advisor status</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                <span>Deep SAP integration expertise</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                <span>Proven ROI: 3.2x documented return</span>
              </li>
            </ul>
          </FieldGroup>
        </div>

        {/* Strategic Play - Editable */}
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
