import { SectionCard } from "./SectionCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HubSpotBadge } from "./HubSpotBadge";
import { Calendar, User, Flag, Plus, X, StickyNote } from "lucide-react";
import { useExecutionActions, useAddExecutionAction, useUpdateExecutionAction, useDeleteExecutionAction } from "@/hooks/useExecutionPlan";
import { useTeamMembers } from "@/hooks/useOurStrategy";
import { useStakeholders } from "@/hooks/useStakeholders";
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

const getProgressStyle = (progress: ExecutionAction["progress"]) => {
  switch (progress) {
    case "completed":  return { badge: "bg-green-100 text-green-700",  dot: "bg-green-500",  label: "Completed"   };
    case "in-progress": return { badge: "bg-blue-100 text-blue-700",   dot: "bg-blue-500",   label: "In Progress" };
    case "stuck":      return { badge: "bg-red-100 text-red-700",      dot: "bg-red-500",    label: "Stuck"       };
    default:           return { badge: "bg-muted text-muted-foreground", dot: "bg-muted-foreground/40", label: "—" };
  }
};

export const ExecutionPlan = ({ planId }: Props) => {
  const { data: actions = [], isLoading } = useExecutionActions(planId);
  const { data: teamMembers = [] }   = useTeamMembers(planId);
  const { data: stakeholders = [] }  = useStakeholders(planId);
  const { mutate: addAction }    = useAddExecutionAction();
  const { mutate: updateAction } = useUpdateExecutionAction();
  const { mutate: deleteAction } = useDeleteExecutionAction();

  // Internal team names
  const teamNames = teamMembers.map((m) => m.name).filter((n): n is string => !!n);
  // Customer-side stakeholder names
  const stakeholderNames = stakeholders.map((s) => s.name).filter((n): n is string => !!n);
  // Any existing owner values not already covered (backwards-compat for old free-text entries)
  const knownNames = new Set([...teamNames, ...stakeholderNames]);
  const legacyOwners = actions
    .map((a) => a.owner)
    .filter((o): o is string => !!o && !knownNames.has(o));

  if (isLoading) return <SectionCard title="Quarterly Execution Plan"><div className="animate-pulse h-40 bg-muted rounded" /></SectionCard>;

  const quarter = actions[0]?.quarter ?? "Q1 2025";

  return (
    <SectionCard
      title="Quarterly Execution Plan"
      badge={<span className="text-xs text-muted-foreground font-normal">{quarter} Actions</span>}
    >
      <div className="space-y-4">
        {/* Summary Stats */}
        <div className="flex gap-4 pb-4 border-b border-border flex-wrap">
          <div className="text-sm">
            <span className="text-muted-foreground">Total:</span>{" "}
            <span className="font-medium">{actions.length}</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Completed:</span>{" "}
            <span className="font-medium text-green-600">{actions.filter((a) => a.progress === "completed" || a.completed).length}</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">In Progress:</span>{" "}
            <span className="font-medium text-blue-600">{actions.filter((a) => a.progress === "in-progress").length}</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Stuck:</span>{" "}
            <span className="font-medium text-destructive">{actions.filter((a) => a.progress === "stuck").length}</span>
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
                <th>Progress</th>
                <th>Notes</th>
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
                    <Select
                      value={action.owner ?? ""}
                      onValueChange={(v) => updateAction({ id: action.id, planId, owner: v === "__none__" ? "" : v })}
                    >
                      <SelectTrigger className="h-8 border-0 bg-transparent focus:ring-1 w-36 gap-1.5 text-sm">
                        <User className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        <SelectValue placeholder="Owner…" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border shadow-lg z-50">
                        <SelectItem value="__none__">
                          <span className="text-muted-foreground">Unassigned</span>
                        </SelectItem>

                        {teamNames.length > 0 && (
                          <SelectGroup>
                            <SelectLabel className="text-xs text-muted-foreground px-2 py-1">Internal Team</SelectLabel>
                            {teamNames.map((name) => (
                              <SelectItem key={name} value={name}>{name}</SelectItem>
                            ))}
                          </SelectGroup>
                        )}

                        {stakeholderNames.length > 0 && (
                          <SelectGroup>
                            <SelectLabel className="text-xs text-muted-foreground px-2 py-1">Stakeholders</SelectLabel>
                            {stakeholderNames.map((name) => (
                              <SelectItem key={name} value={name}>{name}</SelectItem>
                            ))}
                          </SelectGroup>
                        )}

                        {legacyOwners.length > 0 && (
                          <SelectGroup>
                            <SelectLabel className="text-xs text-muted-foreground px-2 py-1">Other</SelectLabel>
                            {legacyOwners.map((name) => (
                              <SelectItem key={name} value={name}>{name}</SelectItem>
                            ))}
                          </SelectGroup>
                        )}
                      </SelectContent>
                    </Select>
                  </td>
                  <td>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3 flex-shrink-0" />
                      <input
                        type="date"
                        value={action.due_date ?? ""}
                        onChange={(e) => updateAction({ id: action.id, planId, due_date: e.target.value })}
                        className="h-7 text-sm bg-background border-0 focus:outline-none focus:ring-1 focus:ring-ring rounded w-32 px-1 text-foreground"
                      />
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
                    <Select
                      value={action.progress ?? "__none__"}
                      onValueChange={(v) => updateAction({ id: action.id, planId, progress: v === "__none__" ? null : v as ExecutionAction["progress"] })}
                    >
                      <SelectTrigger className="h-8 border-0 bg-transparent p-0 w-32">
                        {(() => {
                          const s = getProgressStyle(action.progress);
                          return (
                            <Badge className={`${s.badge} gap-1.5`}>
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
                              {s.label}
                            </Badge>
                          );
                        })()}
                      </SelectTrigger>
                      <SelectContent className="bg-popover border shadow-lg z-50">
                        <SelectItem value="__none__">
                          <span className="text-muted-foreground">Not set</span>
                        </SelectItem>
                        <SelectItem value="completed">
                          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500" />Completed</span>
                        </SelectItem>
                        <SelectItem value="in-progress">
                          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500" />In Progress</span>
                        </SelectItem>
                        <SelectItem value="stuck">
                          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500" />Stuck</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <StickyNote className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <Input
                        value={action.notes ?? ""}
                        onChange={(e) => updateAction({ id: action.id, planId, notes: e.target.value })}
                        placeholder="Add note…"
                        className="h-7 text-sm bg-background border-0 focus-visible:ring-1 w-40 text-muted-foreground"
                      />
                    </div>
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
