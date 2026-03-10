import type { ReactNode } from "react";
import { SectionCard } from "./SectionCard";
import { FieldGroup } from "./FieldGroup";
import { Target, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";

const PriorityItem = ({ icon, text }: { icon: ReactNode; text: string }) => (
  <li className="flex items-start gap-2 text-sm">
    <span className="mt-0.5 flex-shrink-0">{icon}</span>
    <span>{text}</span>
  </li>
);

export const CustomerStrategy = () => {
  return (
    <SectionCard title="Customer Strategy" badge={
      <span className="text-xs text-muted-foreground font-normal">Their business goals & challenges</span>
    }>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FieldGroup label="Business Priorities (Next 12 Months)">
            <ul className="space-y-2">
              <PriorityItem 
                icon={<Target className="w-4 h-4 text-accent" />}
                text="Expand into European markets by Q3 2025"
              />
              <PriorityItem 
                icon={<TrendingUp className="w-4 h-4 text-accent" />}
                text="Reduce operational costs by 15%"
              />
              <PriorityItem 
                icon={<Lightbulb className="w-4 h-4 text-accent" />}
                text="Launch AI-powered customer service platform"
              />
            </ul>
          </FieldGroup>
          <FieldGroup label="Key Challenges & Pain Points">
            <ul className="space-y-2">
              <PriorityItem 
                icon={<AlertTriangle className="w-4 h-4 text-yellow-500" />}
                text="Legacy system integration slowing digital transformation"
              />
              <PriorityItem 
                icon={<AlertTriangle className="w-4 h-4 text-yellow-500" />}
                text="Talent shortage in cloud engineering"
              />
              <PriorityItem 
                icon={<AlertTriangle className="w-4 h-4 text-yellow-500" />}
                text="Compliance complexity in new markets"
              />
            </ul>
          </FieldGroup>
        </div>

        <div className="bg-muted/30 rounded-lg p-4">
          <h4 className="text-sm font-medium mb-3">Industry & Competitive Context</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Enterprise software sector experiencing consolidation. Key competitor TechCorp acquired smaller player last quarter, 
            increasing pressure on Acme to accelerate innovation. Regulatory changes (GDPR 2.0) creating compliance burden 
            but also opportunity for differentiation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FieldGroup label="Budget Cycle">
            <span className="text-sm">October - December (FY planning)</span>
          </FieldGroup>
          <FieldGroup label="Decision Process">
            <span className="text-sm">Committee-based, 6-8 week cycle</span>
          </FieldGroup>
          <FieldGroup label="Procurement Approach">
            <span className="text-sm">Centralized, vendor consolidation focus</span>
          </FieldGroup>
        </div>
      </div>
    </SectionCard>
  );
};