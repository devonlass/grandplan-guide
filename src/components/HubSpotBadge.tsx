import { RefreshCw } from "lucide-react";

interface HubSpotBadgeProps {
  fieldName?: string;
}

export const HubSpotBadge = ({ fieldName }: HubSpotBadgeProps) => {
  return (
    <span className="hubspot-sync-badge" title={fieldName ? `Syncs to HubSpot: ${fieldName}` : "Syncs to HubSpot"}>
      <RefreshCw className="w-3 h-3" />
      HubSpot
    </span>
  );
};
