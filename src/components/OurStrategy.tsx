import { useState, useMemo, useEffect } from "react";
import { SectionCard } from "./SectionCard";
import { FieldGroup } from "./FieldGroup";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, ArrowRight, Zap, Target, Shield, TrendingUp, Users, RefreshCw, Plus, X, UserCircle, Info, Sparkles, AlertCircle, ChevronRight, ClipboardCopy } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchAllOwners } from "@/lib/hubspot";
import { usePlan } from "@/hooks/usePlans";

const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;

async function generatePlaySuggestions(
  companyName: string,
  playType: string,
  playDescription: string,
  valueProposition: string,
  milestones: string,
): Promise<string[]> {
  if (!ANTHROPIC_KEY) throw new Error("Add VITE_ANTHROPIC_API_KEY to .env.local and restart.");

  const prompt = `You are an expert B2B enterprise software sales strategist specialising in maritime asset management (AMOS software by SpecTec).

Account: ${companyName}
Strategic Play: ${playType} — ${playDescription}
${valueProposition ? `Our Value Proposition: ${valueProposition}` : ""}
${milestones ? `Current Milestones: ${milestones}` : ""}

Generate 5 specific, actionable next steps the account team should take THIS QUARTER to execute the "${playType}" play successfully.

Each step should:
- Be concrete and completable within the quarter
- Be specific to maritime/AMOS software context
- Reference real sales/account management tactics (e.g. exec sponsor meeting, product demo, ROI review, health check, upsell discovery)
- Be 1 sentence, starting with an action verb

Return ONLY a valid JSON array of 5 strings. No explanation, no markdown, just the array.
Example: ["Book an exec sponsor meeting to...", "Prepare a ROI summary showing..."]`;

  const res = await fetch("/api/anthropic/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-allow-browser": "true",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) throw new Error(`AI error ${res.status}`);
  const data = await res.json();
  const text = data.content?.[0]?.text ?? "[]";
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("Could not parse suggestions");
  return JSON.parse(match[0]) as string[];
}
import {
  useStrategyConfig, useUpsertStrategyConfig,
  useThreats, useAddThreat, useUpdateThreat, useDeleteThreat,
  useAdvantages, useAddAdvantage, useUpdateAdvantage, useDeleteAdvantage,
  useTeamMembers, useAddTeamMember, useUpdateTeamMember, useDeleteTeamMember,
  useSyncCoreTeam,
} from "@/hooks/useOurStrategy";

const playTypes = [
  { value: "land-expand",  label: "Land & Expand",   icon: TrendingUp, description: "Win initial deal, then grow footprint" },
  { value: "defend-grow",  label: "Defend & Grow",    icon: Shield,     description: "Protect base while expanding value" },
  { value: "cross-sell",   label: "Cross-sell",        icon: Target,     description: "Introduce new products/modules" },
  { value: "retention",    label: "Retention",         icon: RefreshCw,  description: "Secure renewal, minimize churn risk" },
  { value: "expand-users", label: "Expand Users",      icon: Users,      description: "Grow user base within account" },
];

const teamRoles = [
  { value: "account-manager",          label: "Account Manager" },
  { value: "technical-account-manager",label: "Technical Account Manager" },
  { value: "slt-sponsor",              label: "SLT Sponsor" },
  { value: "customer-support-manager", label: "Customer Support Manager" },
  { value: "ps-consultant",            label: "PS Consultant" },
];

const competitors = [
  { value: "bassnet",    label: "Bassnet" },
  { value: "sertica",    label: "Sertica" },
  { value: "mariapps",   label: "MariApps" },
  { value: "sap",        label: "SAP" },
  { value: "helm",       label: "Helm" },
  { value: "jibe",       label: "Jibe" },
  { value: "shipmanager",label: "ShipManager" },
  { value: "danaos",     label: "Danaos" },
  { value: "ibm-maximo", label: "IBM - Maximo" },
  { value: "frs",        label: "FRS" },
  { value: "arribatec",  label: "Arribatec Marine – InfoSHIP" },
  { value: "oceanly",    label: "Oceanly" },
  { value: "mespas",     label: "MESPAS" },
  { value: "other",      label: "Other" },
];


interface Props { planId: string; }

export const OurStrategy = ({ planId }: Props) => {
  // ── config ──────────────────────────────────────────────────────────────────
  const { data: config } = useStrategyConfig(planId);
  const { mutate: upsertConfig } = useUpsertStrategyConfig();
  const { data: plan } = usePlan(planId);

  const [selectedPlay,      setSelectedPlay]      = useState("land-expand");
  const [milestones,        setMilestones]        = useState("");
  const [valueProposition,  setValueProposition]  = useState("");

  // ── AI suggestions ───────────────────────────────────────────────────────────
  const [aiSuggestions,  setAiSuggestions]  = useState<string[]>([]);
  const [aiLoading,      setAiLoading]      = useState(false);
  const [aiError,        setAiError]        = useState<string | null>(null);
  const [copiedIdx,      setCopiedIdx]      = useState<number | null>(null);

  const handleGenerateSuggestions = async () => {
    setAiLoading(true);
    setAiError(null);
    setAiSuggestions([]);
    const play = playTypes.find(p => p.value === selectedPlay);
    try {
      const results = await generatePlaySuggestions(
        plan?.company ?? "this account",
        play?.label ?? selectedPlay,
        play?.description ?? "",
        valueProposition,
        milestones,
      );
      setAiSuggestions(results);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Failed to generate suggestions");
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopySuggestion = (text: string, idx: number) => {
    const appended = milestones
      ? `${milestones.trimEnd()} → ${text}`
      : text;
    setMilestones(appended);
    saveConfig({ milestones: appended });
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  useEffect(() => {
    if (!config) return;
    setSelectedPlay(config.strategic_play ?? "land-expand");
    setMilestones(config.milestones ?? "");
    setValueProposition(config.unique_value_proposition ?? "");
  }, [config]);

  const saveConfig = (updates: object) => upsertConfig({ planId, ...updates } as Parameters<typeof upsertConfig>[0]);

  // ── threats ──────────────────────────────────────────────────────────────────
  const { data: threats = [] }   = useThreats(planId);
  const { mutate: addThreat }    = useAddThreat();
  const { mutate: updateThreat } = useUpdateThreat();
  const { mutate: deleteThreat } = useDeleteThreat();

  // ── advantages ───────────────────────────────────────────────────────────────
  const { data: advantages = [] }   = useAdvantages(planId);
  const { mutate: addAdvantage }    = useAddAdvantage();
  const { mutate: updateAdvantage } = useUpdateAdvantage();
  const { mutate: deleteAdvantage } = useDeleteAdvantage();

  // ── team members ─────────────────────────────────────────────────────────────
  const { data: coreTeam = [] }       = useTeamMembers(planId);
  const { mutate: addMember }         = useAddTeamMember();
  const { mutate: updateMember }      = useUpdateTeamMember();
  const { mutate: deleteMember }      = useDeleteTeamMember();
  const { mutate: syncTeam,
          isPending: syncingTeam }     = useSyncCoreTeam();

  const { data: ownerMap = new Map() } = useQuery({
    queryKey: ["hs-owners"],
    queryFn: fetchAllOwners,
    staleTime: Infinity,
  });
  const EXCLUDED_OWNERS = ["Dan Winter", "Carol Ma", "SpecTec Agent", "Henry Kilshaw", "Sales Ledger"];
  const ownerNames = useMemo(
    () => Array.from(ownerMap.values()).filter(n => !EXCLUDED_OWNERS.includes(n)).sort(),
    [ownerMap]
  );

  // ── derived ─────────────────────────────────────────────────────────────────
  const currentPlay = playTypes.find((p) => p.value === selectedPlay);

  return (
    <SectionCard title="Our Strategy" badge={
      <span className="text-xs text-muted-foreground font-normal">How we win & grow this account</span>
    }>
      <div className="space-y-6">
        {/* Value Proposition */}
        <div className="bg-primary/5 border border-primary/10 rounded-lg p-5">
          <h4 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Unique Value Proposition
          </h4>
          <Textarea
            value={valueProposition}
            onChange={(e) => setValueProposition(e.target.value)}
            onBlur={() => saveConfig({ unique_value_proposition: valueProposition })}
            placeholder="Describe what makes your solution uniquely valuable to this account..."
            className="bg-background/50 resize-none text-sm leading-relaxed min-h-[80px]"
            rows={3}
          />
        </div>

        {/* Competitive Position */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FieldGroup label="Competitive Threats">
            <div className="space-y-2">
              {threats.map((threat) => (
                <div key={threat.id} className="flex items-start gap-2 group">
                  <Select value={threat.level} onValueChange={(v) => updateThreat({ id: threat.id, planId, level: v as typeof threat.level })}>
                    <SelectTrigger className="w-16 h-8 text-xs bg-background"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover border shadow-lg z-50">
                      <SelectItem value="high"><span className="text-destructive">●</span></SelectItem>
                      <SelectItem value="medium"><span className="text-yellow-500">●</span></SelectItem>
                      <SelectItem value="low"><span className="text-muted-foreground">●</span></SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={threat.competitor ?? ""} onValueChange={(v) => updateThreat({ id: threat.id, planId, competitor: v })}>
                    <SelectTrigger className="w-32 h-8 text-sm font-medium bg-background"><SelectValue placeholder="Competitor" /></SelectTrigger>
                    <SelectContent className="bg-popover border shadow-lg z-50">
                      {competitors.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input value={threat.note ?? ""} onChange={(e) => updateThreat({ id: threat.id, planId, note: e.target.value })} placeholder="Threat details..." className="flex-1 h-8 text-sm bg-background" />
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteThreat({ id: threat.id, planId })}>
                    <X className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => addThreat(planId)}>
                <Plus className="w-3 h-3 mr-1" /> Add threat
              </Button>
            </div>
          </FieldGroup>

          <FieldGroup label="Our Advantages">
            <div className="space-y-2">
              {advantages.map((adv) => (
                <div key={adv.id} className="flex items-center gap-2 group">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <Input value={adv.text ?? ""} onChange={(e) => updateAdvantage({ id: adv.id, planId, text: e.target.value })} placeholder="Describe advantage..." className="flex-1 h-8 text-sm bg-background" />
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteAdvantage({ id: adv.id, planId })}>
                    <X className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => addAdvantage(planId)}>
                <Plus className="w-3 h-3 mr-1" /> Add advantage
              </Button>
            </div>
          </FieldGroup>
        </div>

        {/* Core Team */}
        <FieldGroup
          label="Core Team"
          hubspotField="TAM"
          action={
            plan?.hubspot_company_id || plan?.account_manager || plan?.csm ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 gap-1 text-xs text-hubspot hover:text-hubspot/80 hover:bg-hubspot/10 px-2"
                onClick={() => plan && syncTeam({ plan })}
                disabled={syncingTeam}
              >
                <RefreshCw className={`w-3 h-3 ${syncingTeam ? "animate-spin" : ""}`} />
                {syncingTeam ? "Syncing…" : "Pull from HubSpot"}
              </Button>
            ) : null
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {coreTeam.map((member) => (
              <div key={member.id} className="relative flex flex-col gap-3 bg-muted/30 border border-border rounded-xl p-4 group hover:border-primary/30 transition-colors">
                {/* Delete button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => deleteMember({ id: member.id, planId })}
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </Button>

                {/* Avatar + name */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <UserCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Name — dropdown from HubSpot owners + free type */}
                    <Select
                      value={ownerNames.includes(member.name ?? "") ? (member.name ?? "") : "__custom__"}
                      onValueChange={(v) => {
                        if (v !== "__custom__") updateMember({ id: member.id, planId, name: v });
                      }}
                    >
                      <SelectTrigger className="h-8 text-sm font-semibold bg-background border-border">
                        <SelectValue placeholder="Select person…">
                          {member.name || "Select person…"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-popover border shadow-lg z-50 max-h-60">
                        {ownerNames.map((name) => (
                          <SelectItem key={name} value={name}>{name}</SelectItem>
                        ))}
                        <SelectItem value="__custom__">— Type a name —</SelectItem>
                      </SelectContent>
                    </Select>
                    {/* Free-text fallback if not in owner list */}
                    {(!member.name || !ownerNames.includes(member.name)) && (
                      <Input
                        value={member.name ?? ""}
                        onChange={(e) => updateMember({ id: member.id, planId, name: e.target.value })}
                        placeholder="Or type name here…"
                        className="h-7 text-xs mt-1 bg-background"
                      />
                    )}
                  </div>
                </div>

                {/* Role dropdown */}
                <Select
                  value={member.role ?? ""}
                  onValueChange={(v) => updateMember({ id: member.id, planId, role: v as typeof member.role })}
                >
                  <SelectTrigger className="h-8 text-xs bg-background border-border">
                    <SelectValue placeholder="Select role…" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border shadow-lg z-50">
                    {teamRoles.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}

            {/* Add member button */}
            <button
              onClick={() => addMember(planId)}
              className="min-h-[110px] border-2 border-dashed border-border rounded-xl text-xs text-muted-foreground flex flex-col items-center justify-center gap-2 hover:border-primary/40 hover:text-primary transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add member
            </button>
          </div>
        </FieldGroup>

        {/* Strategic Play */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium">This Quarter's Strategic Play</h4>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs p-0 overflow-hidden">
                  <div className="p-3 bg-popover border rounded-lg shadow-lg space-y-2">
                    <p className="text-xs font-semibold text-foreground mb-2">Choose the play that best describes your goal for this account this quarter:</p>
                    {playTypes.map((play) => (
                      <div key={play.value} className="flex items-start gap-2">
                        <play.icon className="w-3.5 h-3.5 text-accent mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-xs font-medium text-foreground">{play.label}</span>
                          <span className="text-xs text-muted-foreground"> — {play.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Play Type</label>
              <Select value={selectedPlay} onValueChange={(v) => { setSelectedPlay(v); saveConfig({ strategic_play: v }); }}>
                <SelectTrigger className="w-full bg-background"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover border shadow-lg z-50">
                  {playTypes.map((play) => (
                    <SelectItem key={play.value} value={play.value}>
                      <div className="flex items-center gap-2">
                        <play.icon className="w-4 h-4 text-accent" />
                        <span>{play.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {currentPlay && <p className="text-xs text-muted-foreground mt-1.5">{currentPlay.description}</p>}
            </div>
            <div className="flex items-center justify-center">
              {currentPlay && (
                <div className="flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full">
                  <currentPlay.icon className="w-4 h-4" />
                  <span className="font-medium">{currentPlay.label}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Milestone Sequence (use → to separate steps)</label>
            <Textarea
              value={milestones}
              onChange={(e) => setMilestones(e.target.value)}
              onBlur={() => saveConfig({ milestones })}
              placeholder="Step 1 → Step 2 → Step 3"
              className="bg-background resize-none text-sm"
              rows={2}
            />
          </div>

          {/* ── AI Next Step Suggestions ── */}
          <div className="rounded-lg border border-accent/20 bg-accent/5 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-accent/15">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-foreground">AI-Suggested Next Steps</span>
                <span className="text-xs text-muted-foreground">for {playTypes.find(p => p.value === selectedPlay)?.label}</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs h-7 border-accent/40 text-accent hover:bg-accent/10"
                onClick={handleGenerateSuggestions}
                disabled={aiLoading}
              >
                <Sparkles className={`w-3 h-3 ${aiLoading ? "animate-spin" : ""}`} />
                {aiLoading ? "Thinking…" : aiSuggestions.length > 0 ? "Regenerate" : "Suggest steps"}
              </Button>
            </div>

            {aiError && (
              <div className="flex items-center gap-2 px-4 py-3 text-destructive text-xs">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {aiError}
              </div>
            )}

            {aiSuggestions.length > 0 && (
              <ul className="divide-y divide-accent/10">
                {aiSuggestions.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-accent/5 transition-colors group">
                    <ChevronRight className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                    <p className="flex-1 text-sm text-foreground leading-relaxed">{step}</p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          onClick={() => handleCopySuggestion(step, i)}
                        >
                          {copiedIdx === i
                            ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                            : <ClipboardCopy className="w-3.5 h-3.5 text-muted-foreground" />
                          }
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p className="text-xs">{copiedIdx === i ? "Added to milestones!" : "Append to milestone sequence"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </li>
                ))}
              </ul>
            )}

            {aiSuggestions.length === 0 && !aiLoading && !aiError && (
              <p className="px-4 py-3 text-xs text-muted-foreground">
                Click "Suggest steps" and Claude will generate 5 specific next steps tailored to your chosen play and account context.
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-border/50">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {milestones.split("→").map((step, index, arr) => (
                <span key={index} className="flex items-center gap-2">
                  <span className="bg-background px-3 py-1 rounded-md border border-border">{step.trim()}</span>
                  {index < arr.length - 1 && <ArrowRight className="w-4 h-4 text-accent flex-shrink-0" />}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
};
