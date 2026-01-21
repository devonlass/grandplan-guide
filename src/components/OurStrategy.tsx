import { SectionCard } from "./SectionCard";
import { FieldGroup } from "./FieldGroup";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight, Zap } from "lucide-react";

export const OurStrategy = () => {
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

        {/* Strategic Play */}
        <div className="bg-muted/30 rounded-lg p-4">
          <h4 className="text-sm font-medium mb-3">This Quarter's Strategic Play</h4>
          <div className="flex items-center gap-3 text-sm">
            <span className="bg-accent/10 text-accent px-3 py-1 rounded-full font-medium">
              Land & Expand
            </span>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Secure EU Compliance win → Build case for AI add-on → Position for license expansion at renewal
            </span>
          </div>
        </div>
      </div>
    </SectionCard>
  );
};
