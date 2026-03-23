import { useState, useEffect } from "react";
import { SectionCard } from "./SectionCard";
import { FieldGroup } from "./FieldGroup";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, AlertTriangle, Lightbulb, Plus, X } from "lucide-react";
import { useCustomerStrategy, useUpdateCustomerStrategy } from "@/hooks/useCustomerStrategy";

interface Props {
  planId: string;
}

export const CustomerStrategy = ({ planId }: Props) => {
  const { data, isLoading } = useCustomerStrategy(planId);
  const { mutate: updateStrategy } = useUpdateCustomerStrategy();

  const [priorities,      setPriorities]      = useState<string[]>([]);
  const [challenges,      setChallenges]      = useState<string[]>([]);
  const [context,         setContext]         = useState("");
  const [budgetCycle,     setBudgetCycle]     = useState("");
  const [decisionProcess, setDecisionProcess] = useState("");
  const [procurement,     setProcurement]     = useState("");

  useEffect(() => {
    if (!data) return;
    setPriorities(Array.isArray(data.business_priorities) ? data.business_priorities : []);
    setChallenges(Array.isArray(data.key_challenges) ? data.key_challenges : []);
    setContext(data.industry_context ?? "");
    setBudgetCycle(data.budget_cycle ?? "");
    setDecisionProcess(data.decision_process ?? "");
    setProcurement(data.procurement_approach ?? "");
  }, [data]);

  const save = (updates: object) => updateStrategy({ planId, ...updates } as Parameters<typeof updateStrategy>[0]);

  const updatePriority = (i: number, val: string) => {
    const next = priorities.map((p, idx) => idx === i ? val : p);
    setPriorities(next);
  };
  const savePriorities = () => save({ business_priorities: priorities });
  const addPriority = () => {
    const next = [...priorities, ""];
    setPriorities(next);
    save({ business_priorities: next });
  };
  const removePriority = (i: number) => {
    const next = priorities.filter((_, idx) => idx !== i);
    setPriorities(next);
    save({ business_priorities: next });
  };

  const updateChallenge = (i: number, val: string) => {
    const next = challenges.map((c, idx) => idx === i ? val : c);
    setChallenges(next);
  };
  const saveChallenges = () => save({ key_challenges: challenges });
  const addChallenge = () => {
    const next = [...challenges, ""];
    setChallenges(next);
    save({ key_challenges: next });
  };
  const removeChallenge = (i: number) => {
    const next = challenges.filter((_, idx) => idx !== i);
    setChallenges(next);
    save({ key_challenges: next });
  };

  if (isLoading) return <SectionCard title="Customer Strategy"><div className="animate-pulse h-40 bg-muted rounded" /></SectionCard>;

  return (
    <SectionCard title="Customer Strategy" badge={
      <span className="text-xs text-muted-foreground font-normal">Their business goals & challenges</span>
    }>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Business Priorities */}
          <FieldGroup label="Business Priorities (Next 12 Months)">
            <ul className="space-y-2">
              {priorities.map((p, i) => (
                <li key={i} className="flex items-start gap-2 group">
                  <span className="mt-2 flex-shrink-0">
                    {i === 0 ? <Target className="w-4 h-4 text-accent" />
                      : i === 1 ? <TrendingUp className="w-4 h-4 text-accent" />
                      : <Lightbulb className="w-4 h-4 text-accent" />}
                  </span>
                  <Input
                    value={p}
                    onChange={(e) => updatePriority(i, e.target.value)}
                    onBlur={savePriorities}
                    className="h-8 text-sm bg-background flex-1"
                  />
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" onClick={() => removePriority(i)}>
                    <X className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </li>
              ))}
            </ul>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground mt-1" onClick={addPriority}>
              <Plus className="w-3 h-3 mr-1" /> Add priority
            </Button>
          </FieldGroup>

          {/* Key Challenges */}
          <FieldGroup label="Key Challenges & Pain Points">
            <ul className="space-y-2">
              {challenges.map((c, i) => (
                <li key={i} className="flex items-start gap-2 group">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mt-2 flex-shrink-0" />
                  <Input
                    value={c}
                    onChange={(e) => updateChallenge(i, e.target.value)}
                    onBlur={saveChallenges}
                    className="h-8 text-sm bg-background flex-1"
                  />
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" onClick={() => removeChallenge(i)}>
                    <X className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </li>
              ))}
            </ul>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground mt-1" onClick={addChallenge}>
              <Plus className="w-3 h-3 mr-1" /> Add challenge
            </Button>
          </FieldGroup>
        </div>

        {/* Industry Context */}
        <div className="bg-muted/30 rounded-lg p-4">
          <h4 className="text-sm font-medium mb-3">Industry & Competitive Context</h4>
          <Textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            onBlur={() => save({ industry_context: context })}
            placeholder="Describe the industry and competitive context…"
            className="bg-background resize-none text-sm leading-relaxed min-h-[80px]"
            rows={3}
          />
        </div>

        {/* Procurement Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FieldGroup label="Budget Cycle">
            <Input
              value={budgetCycle}
              onChange={(e) => setBudgetCycle(e.target.value)}
              onBlur={() => save({ budget_cycle: budgetCycle })}
              placeholder="e.g. October - December"
              className="text-sm h-8 bg-background"
            />
          </FieldGroup>
          <FieldGroup label="Decision Process">
            <Input
              value={decisionProcess}
              onChange={(e) => setDecisionProcess(e.target.value)}
              onBlur={() => save({ decision_process: decisionProcess })}
              placeholder="e.g. Committee-based, 6-8 week cycle"
              className="text-sm h-8 bg-background"
            />
          </FieldGroup>
          <FieldGroup label="Procurement Approach">
            <Input
              value={procurement}
              onChange={(e) => setProcurement(e.target.value)}
              onBlur={() => save({ procurement_approach: procurement })}
              placeholder="e.g. Centralized"
              className="text-sm h-8 bg-background"
            />
          </FieldGroup>
        </div>
      </div>
    </SectionCard>
  );
};
