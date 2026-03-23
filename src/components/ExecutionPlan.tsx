import { SectionCard } from "./SectionCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HubSpotBadge } from "./HubSpotBadge";
import { Calendar, User, Flag, Plus, X } from "lucide-react";
import { useExecutionActions, useAddExecutionAction, useUpdateExecutionAction, useDeleteExecutionAction } from "@/hooks/useExecutionPlan";
import type { ExecutionAction } from "@/types/database";

interface Props {
  planId: string;
}

const getPriorityColor = (priority: ExecutionAction["priority"]) => {
  switch (priority) {
    case "high":   return "bg-destructive/10 text-destructive";
    case "medium": return "bg-yellow-100 text-yellow-700";
    default:       return "bg-muted text-muted-foreground";
  }
};

export const ExecutionPlan = ({ planId }: Props) => {
  const { data: actions = [], isLoading } = useExecutionActions(planId);
  const { mutate: addAction }    = useAddExecutionAction();
  const { mutate: updateAction } = useUpdateExecutionAction();
  const { mutate: deleteAction } = useDeleteExecutionAction();

  if (isLoading) return <SectionCard title="Quarterly Execution Plan"><div className="animate-pulse h-40 bg-muted rounded" /></SectionCard>;

  const quarter = actions[0]?.quarter ?? "Q1 2025";

  return (
    <SectionCard
      title="Quarterly Execution Plan"
      badge={<span className="text-xs text-muted-foreground font-normal">{quarter} Actions</span>}
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
            <span className="font-medium text-green-600">{actions.filter((a) => a.completed).length}</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">High Priority:</span>{" "}
            <span className="font-medium text-destructive">{actions.filter((a) => a.priority === "high" && !a.completed).length}</span>
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
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {actions.map((action) => (
                <tr key={action.id} className={`group ${action.completed ? "opacity-60" : ""}`}>
                  <td>
                    <Checkbox
                      checked={action.completed}
                      onCheckedChange={(checked) => updateAction({ id: action.id, planId, completed: !!checked })}
                    />
                  </td>
                  <td>
                    <Input
                      value={action.action ?? ""}
                      onChange={(e) => updateAction({ id: action.id, planId, action: e.target.value })}
                      placeholder="Describe action…"
                      className={`h-8 text-sm bg-background border-0 focus-visible:ring-1 ${action.completed ? "line-through text-muted-foreground" : "font-medium"}`}
                    />
                  </td>
                  <td>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <Input value={action.owner ?? ""} onChange={(e) => updateAction({ id: action.id, planId, owner: e.target.value })} placeholder="Owner" className="h-7 text-sm bg-background border-0 focus-visible:ring-1 w-28" />
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3 flex-shrink-0" />
                      <Input value={action.due_date ?? ""} onChange={(e) => updateAction({ id: action.id, planId, due_date: e.target.value })} placeholder="YYYY-MM-DD" className="h-7 text-sm bg-background border-0 focus-visible:ring-1 w-28" />
                    </div>
                  </td>
                  <td>
                    <Select value={action.priority} onValueChange={(v) => updateAction({ id: action.id, planId, priority: v as ExecutionAction["priority"] })}>
                      <SelectTrigger className="h-8 border-0 bg-transparent p-0 w-28">
                        <Badge className={`${getPriorityColor(action.priority)} gap-1`}>
                          <Flag className="w-3 h-3" />
                          {action.priority}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent className="bg-popover border shadow-lg z-50">
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td>
                    {action.hubspot_task && <span className="text-[10px] text-hubspot font-medium">⟳ Task</span>}
                  </td>
                  <td>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteAction({ id: action.id, planId })}>
                      <X className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground mt-2" onClick={() => addAction(planId)}>
            <Plus className="w-3 h-3 mr-1" /> Add action
          </Button>
        </div>
      </div>
    </SectionCard>
  );
};
