import { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface SectionCardProps {
  title: string;
  children: ReactNode;
  badge?: ReactNode;
  defaultOpen?: boolean;
  action?: ReactNode;
}

export const SectionCard = ({ 
  title, 
  children, 
  badge, 
  defaultOpen = true,
  action 
}: SectionCardProps) => {
  return (
    <Collapsible defaultOpen={defaultOpen} className="section-card">
      <CollapsibleTrigger className="section-header w-full hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-3">
          <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform duration-200 group-data-[state=closed]:rotate-[-90deg]" />
          <h2 className="section-title">{title}</h2>
          {badge}
        </div>
        {action && <div onClick={(e) => e.stopPropagation()}>{action}</div>}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="section-body">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
};
