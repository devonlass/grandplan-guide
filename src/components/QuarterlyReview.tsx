import { SectionCard } from "./SectionCard";
import { FieldGroup } from "./FieldGroup";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, ArrowRight, MessageSquare } from "lucide-react";

// Fixed: moved MetricChange above QuarterlyReview so it's defined before use
const MetricChange = ({ 
  label, 
  from, 
  to, 
  positive 
}: { 
  label: string; 
  from: string; 
  to: string; 
  positive: boolean;
}) => (
  <div className="text-center">
    <div className="text-xs text-muted-foreground mb-1">{label}</div>
    <div className="flex items-center justify-center gap-2">
      <span className="text-sm text-muted-foreground">{from}</span>
      <ArrowRight className="w-3 h-3 text-muted-foreground" />
      {/* Fixed: replaced text-success with text-green-600 */}
      <span className={`text-sm font-semibold ${positive ? "text-green-600" : "text-destructive"}`}>
        {to}
      </span>
    </div>
  </div>
);

export const QuarterlyReview = () => {
  return (
    <SectionCard 
      title="Quarterly Review" 
      badge={<Badge variant="outline" className="text-xs">Last: Q4 2024</Badge>}
      defaultOpen={false}
    >
      <div className="space-y-6">
        {/* Win/Loss Review */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            {/* Fixed: replaced text-success with text-green-600 */}
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              What Worked
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                {/* Fixed: replaced text-success with text-green-600 */}
                <span className="text-green-600 mt-1">✓</span>
                <span>Executive alignment session drove CTO sponsorship</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Technical deep-dive with engineering built credibility</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Customer success story from similar enterprise resonated</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-destructive">
              <XCircle className="w-4 h-4" />
              What Didn't Work
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">✗</span>
                <span>Underestimated security team influence; engaged too late</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">✗</span>
                <span>Initial proposal too feature-heavy, not value-focused</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Key Metrics Change */}
        <div className="bg-muted/30 rounded-lg p-4">
          <h4 className="text-sm font-medium mb-4">Quarter-over-Quarter Changes</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricChange label="Revenue" from="$2.1M" to="$2.4M" positive />
            <MetricChange label="Health Score" from="78" to="82" positive />
            <MetricChange label="NPS" from="42" to="48" positive />
            <MetricChange label="Active Users" from="689" to="847" positive />
          </div>
        </div>

        {/* Next Quarter Focus */}
        <FieldGroup label="Next Quarter Focus Areas">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-accent/5 border-accent/20">
              <ArrowRight className="w-3 h-3 mr-1" />
              Close EU Compliance deal
            </Badge>
            <Badge variant="outline" className="bg-accent/5 border-accent/20">
              <ArrowRight className="w-3 h-3 mr-1" />
              Neutralize security blocker
            </Badge>
            <Badge variant="outline" className="bg-accent/5 border-accent/20">
              <ArrowRight className="w-3 h-3 mr-1" />
              Build AI module business case
            </Badge>
          </div>
        </FieldGroup>

        {/* Notes */}
        <FieldGroup label="Review Notes">
          <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground">
            <MessageSquare className="w-4 h-4 inline mr-2" />
            Strong quarter overall. Account momentum is positive. Critical to address security concerns 
            early in Q1 to avoid delays on EU expansion. CTO Walsh remains our strongest advocate—need 
            to leverage this relationship for internal selling.
          </div>
        </FieldGroup>
      </div>
    </SectionCard>
  );
};
