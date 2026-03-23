import { useState, useEffect } from "react";
import { SectionCard } from "./SectionCard";
import { FieldGroup } from "./FieldGroup";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, ArrowRight, MessageSquare, Plus, X } from "lucide-react";
import { useQuarterlyReviews, useUpsertQuarterlyReview } from "@/hooks/useQuarterlyReview";
import type { QuarterlyReview as QR } from "@/types/database";

interface Props { planId: string; }

const MetricChange = ({ label, from, to, positive }: { label: string; from: string; to: string; positive: boolean }) => (
  <div className="text-center">
    <div className="text-xs text-muted-foreground mb-1">{label}</div>
    <div className="flex items-center justify-center gap-2">
      <span className="text-sm text-muted-foreground">{from}</span>
      <ArrowRight className="w-3 h-3 text-muted-foreground" />
      <span className={`text-sm font-semibold ${positive ? "text-green-600" : "text-destructive"}`}>{to}</span>
    </div>
  </div>
);

export const QuarterlyReview = ({ planId }: Props) => {
  const { data: reviews = [], isLoading } = useQuarterlyReviews(planId);
  const { mutate: upsertReview } = useUpsertQuarterlyReview();

  const review: QR | undefined = reviews[0];

  const [what_worked,     setWhatWorked]    = useState<string[]>([]);
  const [what_didnt,      setWhatDidnt]     = useState<string[]>([]);
  const [review_notes,    setReviewNotes]   = useState("");
  const [next_priorities, setNextPriorities]= useState<string[]>([]);
  const [revenue_from,    setRevenueFrom]   = useState("");
  const [revenue_to,      setRevenueTo]     = useState("");
  const [hs_from,         setHsFrom]        = useState("");
  const [hs_to,           setHsTo]          = useState("");
  const [nps_from,        setNpsFrom]       = useState("");
  const [nps_to,          setNpsTo]         = useState("");
  const [users_from,      setUsersFrom]     = useState("");
  const [users_to,        setUsersTo]       = useState("");
  const [quarter,         setQuarter]       = useState("Q4 2024");

  useEffect(() => {
    if (!review) return;
    setWhatWorked(Array.isArray(review.what_worked) ? review.what_worked : []);
    setWhatDidnt(Array.isArray(review.what_didnt) ? review.what_didnt : []);
    setReviewNotes(review.review_notes ?? "");
    setNextPriorities(Array.isArray(review.next_priorities) ? review.next_priorities : []);
    setRevenueFrom(review.revenue_from != null ? String(review.revenue_from) : "");
    setRevenueTo(review.revenue_to != null ? String(review.revenue_to) : "");
    setHsFrom(review.health_score_from != null ? String(review.health_score_from) : "");
    setHsTo(review.health_score_to != null ? String(review.health_score_to) : "");
    setNpsFrom(review.nps_from != null ? String(review.nps_from) : "");
    setNpsTo(review.nps_to != null ? String(review.nps_to) : "");
    setUsersFrom(review.active_users_from != null ? String(review.active_users_from) : "");
    setUsersTo(review.active_users_to != null ? String(review.active_users_to) : "");
    setQuarter(review.quarter ?? "Q4 2024");
  }, [review]);

  const save = (updates: object) => upsertReview({ planId, id: review?.id, ...updates } as Parameters<typeof upsertReview>[0]);

  const fmtRevenue = (v: string) => {
    const n = parseFloat(v);
    if (isNaN(n)) return v;
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
    return `$${n}`;
  };

  if (isLoading) return <SectionCard title="Quarterly Review"><div className="animate-pulse h-40 bg-muted rounded" /></SectionCard>;

  return (
    <SectionCard
      title="Quarterly Review"
      badge={<Badge variant="outline" className="text-xs">Last: {quarter}</Badge>}
      defaultOpen={false}
    >
      <div className="space-y-6">
        {/* Win/Loss Review */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              What Worked
            </h4>
            <ul className="space-y-2">
              {what_worked.map((item, i) => (
                <li key={i} className="flex items-start gap-2 group">
                  <span className="text-green-600 mt-2 text-xs">✓</span>
                  <Input value={item} onChange={(e) => { const next = what_worked.map((w, idx) => idx === i ? e.target.value : w); setWhatWorked(next); }} onBlur={() => save({ what_worked })} className="h-7 text-sm bg-background flex-1 border-0 focus-visible:ring-1" />
                  <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => { const next = what_worked.filter((_, idx) => idx !== i); setWhatWorked(next); save({ what_worked: next }); }}>
                    <X className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </li>
              ))}
            </ul>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground mt-1" onClick={() => { const next = [...what_worked, ""]; setWhatWorked(next); save({ what_worked: next }); }}>
              <Plus className="w-3 h-3 mr-1" /> Add item
            </Button>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-destructive">
              <XCircle className="w-4 h-4" />
              What Didn't Work
            </h4>
            <ul className="space-y-2">
              {what_didnt.map((item, i) => (
                <li key={i} className="flex items-start gap-2 group">
                  <span className="text-destructive mt-2 text-xs">✗</span>
                  <Input value={item} onChange={(e) => { const next = what_didnt.map((w, idx) => idx === i ? e.target.value : w); setWhatDidnt(next); }} onBlur={() => save({ what_didnt })} className="h-7 text-sm bg-background flex-1 border-0 focus-visible:ring-1" />
                  <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => { const next = what_didnt.filter((_, idx) => idx !== i); setWhatDidnt(next); save({ what_didnt: next }); }}>
                    <X className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </li>
              ))}
            </ul>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground mt-1" onClick={() => { const next = [...what_didnt, ""]; setWhatDidnt(next); save({ what_didnt: next }); }}>
              <Plus className="w-3 h-3 mr-1" /> Add item
            </Button>
          </div>
        </div>

        {/* QoQ Metrics */}
        <div className="bg-muted/30 rounded-lg p-4">
          <h4 className="text-sm font-medium mb-4">Quarter-over-Quarter Changes</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <MetricChange label="Revenue"       from={fmtRevenue(revenue_from)} to={fmtRevenue(revenue_to)} positive={parseFloat(revenue_to) > parseFloat(revenue_from)} />
            <MetricChange label="Health Score"  from={hs_from}    to={hs_to}    positive={parseFloat(hs_to) > parseFloat(hs_from)} />
            <MetricChange label="NPS"           from={nps_from}   to={nps_to}   positive={parseFloat(nps_to) > parseFloat(nps_from)} />
            <MetricChange label="Active Users"  from={users_from} to={users_to} positive={parseFloat(users_to) > parseFloat(users_from)} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {[
              { label: "Rev From ($)", val: revenue_from, set: setRevenueFrom, field: "revenue_from" },
              { label: "Rev To ($)",   val: revenue_to,   set: setRevenueTo,   field: "revenue_to" },
              { label: "HS From",      val: hs_from,      set: setHsFrom,      field: "health_score_from" },
              { label: "HS To",        val: hs_to,        set: setHsTo,        field: "health_score_to" },
              { label: "NPS From",     val: nps_from,     set: setNpsFrom,     field: "nps_from" },
              { label: "NPS To",       val: nps_to,       set: setNpsTo,       field: "nps_to" },
              { label: "Users From",   val: users_from,   set: setUsersFrom,   field: "active_users_from" },
              { label: "Users To",     val: users_to,     set: setUsersTo,     field: "active_users_to" },
            ].map(({ label, val, set, field }) => (
              <div key={field}>
                <label className="text-muted-foreground mb-1 block">{label}</label>
                <Input value={val} onChange={(e) => set(e.target.value)} onBlur={() => save({ [field]: parseFloat(val) || null })} className="h-7 text-sm bg-background" />
              </div>
            ))}
          </div>
        </div>

        {/* Next Quarter Focus */}
        <FieldGroup label="Next Quarter Focus Areas">
          <div className="flex flex-wrap gap-2 mb-2">
            {next_priorities.map((p, i) => (
              <div key={i} className="flex items-center gap-1 bg-accent/5 border border-accent/20 rounded-full px-3 py-1 group">
                <ArrowRight className="w-3 h-3" />
                <Input value={p} onChange={(e) => { const next = next_priorities.map((x, idx) => idx === i ? e.target.value : x); setNextPriorities(next); }} onBlur={() => save({ next_priorities })} className="h-5 text-xs bg-transparent border-0 p-0 focus-visible:ring-0 w-32" />
                <Button variant="ghost" size="icon" className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => { const next = next_priorities.filter((_, idx) => idx !== i); setNextPriorities(next); save({ next_priorities: next }); }}>
                  <X className="w-2.5 h-2.5 text-muted-foreground" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="rounded-full text-xs h-7 border-dashed" onClick={() => { const next = [...next_priorities, ""]; setNextPriorities(next); save({ next_priorities: next }); }}>
              <Plus className="w-3 h-3 mr-1" /> Add focus
            </Button>
          </div>
        </FieldGroup>

        {/* Notes */}
        <FieldGroup label="Review Notes">
          <div className="bg-muted/30 rounded-lg p-4">
            <MessageSquare className="w-4 h-4 inline mr-2 text-muted-foreground" />
            <Textarea
              value={review_notes}
              onChange={(e) => setReviewNotes(e.target.value)}
              onBlur={() => save({ review_notes })}
              placeholder="Notes from this quarter's review…"
              className="bg-transparent border-0 resize-none text-sm text-muted-foreground p-0 focus-visible:ring-0 min-h-[60px] mt-2"
              rows={3}
            />
          </div>
        </FieldGroup>
      </div>
    </SectionCard>
  );
};
