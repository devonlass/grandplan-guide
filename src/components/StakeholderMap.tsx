import { SectionCard } from "./SectionCard";
import { HubSpotBadge } from "./HubSpotBadge";
import { Badge } from "@/components/ui/badge";
import { User, ThumbsUp, ThumbsDown, Minus, Crown, Users } from "lucide-react";

interface Stakeholder {
  name: string;
  title: string;
  role: "Decision Maker" | "Influencer" | "Champion" | "Blocker" | "User";
  sentiment: "positive" | "neutral" | "negative";
  notes: string;
  lastContact: string;
  contactedBy: string;
}

const stakeholders: Stakeholder[] = [
  {
    name: "Jennifer Walsh",
    title: "Chief Technology Officer",
    role: "Decision Maker",
    sentiment: "positive",
    notes: "Strong advocate for our platform. Key sponsor.",
    lastContact: "Jan 10, 2025",
    contactedBy: "",
  },
  {
    name: "Michael Torres",
    title: "VP of Engineering",
    role: "Influencer",
    sentiment: "positive",
    notes: "Impressed with SAP integration demo. Pushing for expansion.",
    lastContact: "Jan 8, 2025",
    contactedBy: "",
  },
  {
    name: "Lisa Chen",
    title: "Chief Procurement Officer",
    role: "Influencer",
    sentiment: "neutral",
    notes: "Focused on cost reduction. Need ROI data for Q2.",
    lastContact: "Dec 15, 2024",
    contactedBy: "",
  },
  {
    name: "Robert Kim",
    title: "Director of IT Security",
    role: "Blocker",
    sentiment: "negative",
    notes: "Concerns about data residency in EU. Requires SOC2 Type II.",
    lastContact: "Dec 20, 2024",
    contactedBy: "",
  },
  {
    name: "Amanda Foster",
    title: "Product Manager",
    role: "Champion",
    sentiment: "positive",
    notes: "Day-to-day contact. Actively promoting internally.",
    lastContact: "Jan 12, 2025",
    contactedBy: "",
  },
];

export const StakeholderMap = () => {
  const getRoleIcon = (role: Stakeholder["role"]) => {
    switch (role) {
      case "Decision Maker": return <Crown className="w-3 h-3" />;
      case "Champion": return <ThumbsUp className="w-3 h-3" />;
      case "Blocker": return <ThumbsDown className="w-3 h-3" />;
      default: return <User className="w-3 h-3" />;
    }
  };

  const getRoleColor = (role: Stakeholder["role"]) => {
    switch (role) {
      case "Decision Maker": return "bg-primary text-primary-foreground";
      case "Champion": return "bg-success/10 text-success";
      case "Blocker": return "bg-destructive/10 text-destructive";
      case "Influencer": return "bg-accent/10 text-accent";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getSentimentIcon = (sentiment: Stakeholder["sentiment"]) => {
    switch (sentiment) {
      case "positive": return <ThumbsUp className="w-4 h-4 text-success" />;
      case "negative": return <ThumbsDown className="w-4 h-4 text-destructive" />;
      default: return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <SectionCard 
      title="Stakeholder Map" 
      badge={<HubSpotBadge fieldName="contacts" />}
    >
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name & Title</th>
              <th>Role</th>
              <th>Sentiment</th>
              <th>Notes</th>
              <th>Last Contact</th>
              <th>Contacted By</th>
            </tr>
          </thead>
          <tbody>
            {stakeholders.map((s) => (
              <tr key={s.name}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Users className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.title}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <Badge className={`${getRoleColor(s.role)} gap-1`}>
                    {getRoleIcon(s.role)}
                    {s.role}
                  </Badge>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    {getSentimentIcon(s.sentiment)}
                    <span className="text-sm capitalize">{s.sentiment}</span>
                  </div>
                </td>
                <td className="max-w-xs">
                  <span className="text-sm text-muted-foreground">{s.notes}</span>
                </td>
                <td>
                  <span className="text-sm text-muted-foreground">{s.lastContact}</span>
                </td>
                <td>
                  <span className="text-sm text-muted-foreground">{s.contactedBy || "—"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
};
