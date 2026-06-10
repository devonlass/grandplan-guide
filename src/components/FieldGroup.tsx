import { ReactNode } from "react";
import { HubSpotBadge } from "./HubSpotBadge";

interface FieldGroupProps {
  label: string;
  children: ReactNode;
  hubspotField?: string;
  className?: string;
  action?: ReactNode;
}

export const FieldGroup = ({ label, children, hubspotField, className = "", action }: FieldGroupProps) => {
  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-1.5">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        {hubspotField && <HubSpotBadge fieldName={hubspotField} />}
        {action && <span className="ml-auto">{action}</span>}
      </div>
      <div className="field-value">{children}</div>
    </div>
  );
};
