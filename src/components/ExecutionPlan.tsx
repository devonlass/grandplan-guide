import { SectionCard } from "./SectionCard";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { HubSpotBadge } from "./HubSpotBadge";
import { Calendar, User, Flag } from "lucide-react";

interface Action {
  id: string;
  action: string;
  owner: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
  hubspotTask?: boolean;
}

const actions: Action[] = [
  {
    id: "1",
    action: "Schedule executive business review with CTO Walsh",
    owner: "Sarah Chen",
    dueDate: "Jan 25, 2025",
    priority: "high",
    completed: false,
    hubspotTask: true,
  },
  {
    id: "2",
    action: "Prepare EU compliance ROI analysis for CPO Chen",
    owner: "Sarah Chen",
    dueDate: "Jan 30, 2025",
    priority: "high",
    completed: false,
    hubspotTask: true,
  },
  {
    id: "3",
    action: "Arrange SOC2 Type II documentation review with Security",
    owner: "James Miller",
    dueDate: "Feb 5, 2025",
    priority: "medium",
    completed: false,
  },
  {
    id: "4",
    action: "Demo AI customer service module to Product team",
    owner: "Sarah Chen",
    dueDate: "Feb 15, 2025",
    priority: "medium",
    completed: false,
    hubspotTask: true,
  },
  {
    id: "5",
    action: "Quarterly check-in with Champion (Amanda Foster)",
    owner: "Sarah Chen",
    dueDate: "Feb 1, 2025",
    priority: "low",
    completed: true,
  },
];

export const ExecutionPlan = () => {
  const getPriorityColor = (priority: Action["priority"]) => {
    switch (priority) {
      case "high": return "bg-destructive/10 text-destructive";
      case "medium": return "bg-warning/10 text-warning";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <SectionCard 
      title="Quarterly Execution Plan"
      badge={<span className="text-xs text-muted-foreground font-normal">Q1 2025 Actions</span>}
    >
      <div className="space-y-4">
        {/* Summary Stats */}
        <div className="flex gap-4 pb-4 border-b border-border">
          <div className="text-sm">
            <span className="text-muted-foreground">Total:</span>{" "}
            <span className="font-medium">{actions.length}</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Completed:</span>{" "}
            <span className="font-medium text-success">{actions.filter(a => a.completed).length}</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">High Priority:</span>{" "}
            <span className="font-medium text-destructive">{actions.filter(a => a.priority === "high" && !a.completed).length}</span>
          </div>
        </div>

        {/* Actions Table */}
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-10"></th>
                <th>Action</th>
                <th>Owner</th>
                <th>Due Date</th>
                <th>Priority</th>
                <th className="w-20">Sync</th>
              </tr>
            </thead>
            <tbody>
              {actions.map((action) => (
                <tr key={action.id} className={action.completed ? "opacity-60" : ""}>
                  <td>
                    <Checkbox checked={action.completed} />
                  </td>
                  <td>
                    <span className={action.completed ? "line-through text-muted-foreground" : "font-medium"}>
                      {action.action}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-3 h-3 text-muted-foreground" />
                      {action.owner}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {action.dueDate}
                    </div>
                  </td>
                  <td>
                    <Badge className={`${getPriorityColor(action.priority)} gap-1`}>
                      <Flag className="w-3 h-3" />
                      {action.priority}
                    </Badge>
                  </td>
                  <td>
                    {action.hubspotTask && (
                      <span className="text-[10px] text-hubspot font-medium">⟳ Task</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SectionCard>
  );
};
