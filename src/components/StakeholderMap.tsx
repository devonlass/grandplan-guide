import { SectionCard } from "./SectionCard";
import { HubSpotBadge } from "./HubSpotBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, ThumbsUp, ThumbsDown, Minus, Crown, Users, Plus, X } from "lucide-react";
import { useStakeholders, useAddStakeholder, useUpdateStakeholder, useDeleteStakeholder } from "@/hooks/useStakeholders";
import type { Stakeholder } from "@/types/database";

interface Props {
  planId: string;
}

const getRoleIcon = (role: Stakeholder["role"]) => {
  switch (role) {
    case "Decision Maker": return <Crown className="w-3 h-3" />;
    case "Champion":       return <ThumbsUp className="w-3 h-3" />;
    case "Blocker":        return <ThumbsDown className="w-3 h-3" />;
    default:               return <User className="w-3 h-3" />;
  }
};

const getRoleColor = (role: Stakeholder["role"]) => {
  switch (role) {
    case "Decision Maker": return "bg-primary text-primary-foreground";
    case "Champion":       return "bg-green-100 text-green-700";
    case "Blocker":        return "bg-destructive/10 text-destructive";
    case "Influencer":     return "bg-accent/10 text-accent";
    default:               return "bg-muted text-muted-foreground";
  }
};

const getSentimentIcon = (sentiment: Stakeholder["sentiment"]) => {
  switch (sentiment) {
    case "positive": return <ThumbsUp className="w-4 h-4 text-green-600" />;
    case "negative": return <ThumbsDown className="w-4 h-4 text-destructive" />;
    default:         return <Minus className="w-4 h-4 text-muted-foreground" />;
  }
};

export const StakeholderMap = ({ planId }: Props) => {
  const { data: stakeholders = [], isLoading } = useStakeholders(planId);
  const { mutate: addStakeholder }    = useAddStakeholder();
  const { mutate: updateStakeholder } = useUpdateStakeholder();
  const { mutate: deleteStakeholder } = useDeleteStakeholder();

  if (isLoading) return <SectionCard title="Stakeholder Map"><div className="animate-pulse h-40 bg-muted rounded" /></SectionCard>;

  return (
    <SectionCard title="Stakeholder Map" badge={<HubSpotBadge fieldName="contacts" />}>
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
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {stakeholders.map((s) => (
              <tr key={s.id} className="group">
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <Input value={s.name ?? ""} onChange={(e) => updateStakeholder({ id: s.id, planId, name: e.target.value })} placeholder="Name" className="h-6 text-sm font-medium bg-background px-2 border-0 focus-visible:ring-1" />
                      <Input value={s.title ?? ""} onChange={(e) => updateStakeholder({ id: s.id, planId, title: e.target.value })} placeholder="Title" className="h-5 text-xs text-muted-foreground bg-background px-2 border-0 focus-visible:ring-1" />
                    </div>
                  </div>
                </td>
                <td>
                  <Select value={s.role ?? "Influencer"} onValueChange={(v) => updateStakeholder({ id: s.id, planId, role: v as Stakeholder["role"] })}>
                    <SelectTrigger className="h-8 w-36 border-0 bg-transparent p-0">
                      <Badge className={`${getRoleColor(s.role)} gap-1 cursor-pointer`}>
                        {getRoleIcon(s.role)}
                        {s.role ?? "Influencer"}
                      </Badge>
                    </SelectTrigger>
                    <SelectContent className="bg-popover border shadow-lg z-50">
                      {["Decision Maker","Influencer","Champion","Blocker","User"].map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td>
                  <Select value={s.sentiment ?? "neutral"} onValueChange={(v) => updateStakeholder({ id: s.id, planId, sentiment: v as Stakeholder["sentiment"] })}>
                    <SelectTrigger className="h-8 w-28 border-0 bg-transparent p-0">
                      <div className="flex items-center gap-2">
                        {getSentimentIcon(s.sentiment)}
                        <span className="text-sm capitalize">{s.sentiment ?? "neutral"}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-popover border shadow-lg z-50">
                      <SelectItem value="positive">Positive</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="negative">Negative</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="max-w-xs">
                  <Input value={s.notes ?? ""} onChange={(e) => updateStakeholder({ id: s.id, planId, notes: e.target.value })} placeholder="Notes…" className="h-7 text-sm text-muted-foreground bg-background border-0 focus-visible:ring-1" />
                </td>
                <td>
                  <Input value={s.last_contact ?? ""} onChange={(e) => updateStakeholder({ id: s.id, planId, last_contact: e.target.value })} placeholder="YYYY-MM-DD" className="h-7 text-sm text-muted-foreground bg-background border-0 focus-visible:ring-1 w-28" />
                </td>
                <td>
                  <Input value={s.contacted_by ?? ""} onChange={(e) => updateStakeholder({ id: s.id, planId, contacted_by: e.target.value })} placeholder="—" className="h-7 text-sm text-muted-foreground bg-background border-0 focus-visible:ring-1 w-24" />
                </td>
                <td>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteStakeholder({ id: s.id, planId })}>
                    <X className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground mt-2" onClick={() => addStakeholder(planId)}>
          <Plus className="w-3 h-3 mr-1" /> Add stakeholder
        </Button>
      </div>
    </SectionCard>
  );
};
