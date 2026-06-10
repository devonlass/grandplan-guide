import { useState, useEffect, useRef } from "react";
import { SectionCard } from "./SectionCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Download, FileDown, Presentation, X, ImageIcon } from "lucide-react";
import { useQBR, useUpsertQBR } from "@/hooks/useQBR";
import type { QBRData } from "@/hooks/useQBR";
import { usePlan } from "@/hooks/usePlans";
import { generateQbrPptx } from "@/lib/generateQbrPptx";
import { SPECTEC_LOGO_DEFAULT } from "@/lib/logoDefaults";

interface Props {
  planId: string;
}

// ── Logo upload widget ────────────────────────────────────────────────────────

const LogoUpload = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (b64: string) => void;
}) => {
  const ref = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) onChange(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </label>
      <div
        className={`relative border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors
          ${value ? "border-border bg-muted/10" : "border-border/50 bg-muted/5 hover:bg-muted/20 hover:border-border"}`}
        style={{ minHeight: 80 }}
        onClick={() => !value && ref.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file?.type.startsWith("image/")) handleFile(file);
        }}
      >
        {value ? (
          <>
            <img
              src={value}
              alt={label}
              className="max-h-16 max-w-full object-contain p-2"
            />
            <button
              className="absolute top-1 right-1 bg-background border border-border rounded-full p-0.5 hover:bg-destructive hover:text-destructive-foreground transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
            >
              <X className="w-3 h-3" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground py-3">
            <ImageIcon className="w-6 h-6 opacity-40" />
            <span className="text-xs">Click or drag to upload</span>
          </div>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
};

// ── Small helpers ─────────────────────────────────────────────────────────────

const Field = ({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  placeholder?: string;
  rows?: number;
}) => (
  <div className="space-y-1">
    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
      {label}
    </label>
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      rows={rows}
      className="text-sm bg-background/50 resize-none leading-relaxed"
    />
  </div>
);

const Sub = ({ title }: { title: string }) => (
  <h4 className="text-sm font-semibold text-foreground border-b border-border pb-1 mb-3">
    {title}
  </h4>
);

// ── PDF generator ─────────────────────────────────────────────────────────────

const pdfSection = (num: number, title: string, owner: string, content: string) => `
  <div class="section${num > 1 ? " page-break" : ""}">
    <div class="section-hdr">
      <span class="section-num">${num}</span>
      <div>
        <div class="section-title">${title}</div>
        <div class="section-owner">${owner}</div>
      </div>
    </div>
    ${content}
  </div>`;

const pdfField = (label: string, value: string) =>
  `<div class="field">
    <div class="field-label">${label}</div>
    <div class="field-value${!value?.trim() ? " field-empty" : ""}">${
      value?.trim() ? value.replace(/\n/g, "<br/>") : "—"
    }</div>
  </div>`;

const pdfSub = (title: string) =>
  `<div class="subsection-title">${title}</div>`;

const logoTag = (src: string, alt: string, maxH = 56) =>
  src ? `<img src="${src}" alt="${alt}" style="max-height:${maxH}px;max-width:160px;object-fit:contain;" />` : "";

function generatePrintDoc(d: QBRData, companyName: string) {
  const spectecLogoHtml = d.spectec_logo
    ? logoTag(d.spectec_logo, "SpecTec")
    : `<div style="font-size:18pt;font-weight:800;letter-spacing:-0.5px;color:#fff;">
        Spec<span style="color:#4da6ff;">Tec</span>
        <div style="font-size:7pt;font-weight:400;letter-spacing:0.2em;opacity:0.7;margin-top:2px;text-transform:uppercase;">Asset Management Software</div>
       </div>`;

  const clientLogoHtml = d.client_logo
    ? logoTag(d.client_logo, companyName, 52)
    : `<div style="font-size:13pt;font-weight:700;color:#fff;opacity:0.9;">${companyName}</div>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>QBR – ${companyName} – ${d.quarter ?? ""}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 9.5pt; color: #1a1a1a; background: #fff; }

    /* ── Cover ── */
    .cover {
      background: linear-gradient(135deg, #0a2240 0%, #0f3460 60%, #1a4f80 100%);
      color: #fff;
      padding: 0;
    }
    .cover-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 28px 40px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.12);
    }
    .cover-body {
      padding: 28px 40px 32px;
    }
    .cover-eyebrow {
      font-size: 8pt;
      font-weight: 600;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      opacity: 0.55;
      margin-bottom: 10px;
    }
    .cover-title {
      font-size: 26pt;
      font-weight: 800;
      line-height: 1.1;
      letter-spacing: -0.5px;
    }
    .cover-accent {
      width: 48px;
      height: 4px;
      background: #4da6ff;
      border-radius: 2px;
      margin: 14px 0;
    }
    .cover-company {
      font-size: 15pt;
      font-weight: 400;
      opacity: 0.85;
    }
    .cover-meta {
      margin-top: 20px;
      display: flex;
      gap: 0;
    }
    .cover-meta-pill {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 4px;
      padding: 5px 14px;
      font-size: 8.5pt;
      margin-right: 8px;
    }
    .cover-meta-pill strong { font-weight: 700; }

    /* ── Sections ── */
    .section { padding: 20px 40px; border-bottom: 1px solid #e5e7eb; }
    .section-hdr { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
    .section-num {
      background: #0f3460; color: #fff; width: 26px; height: 26px;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 9pt; font-weight: 700; flex-shrink: 0;
    }
    .section-title { font-size: 11.5pt; font-weight: 700; color: #0f3460; line-height: 1.3; }
    .section-owner { font-size: 8pt; color: #6b7280; margin-top: 2px; }

    /* ── Fields ── */
    .field { margin-bottom: 14px; }
    .field-label { font-size: 7.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #6b7280; margin-bottom: 4px; }
    .field-value { font-size: 9.5pt; line-height: 1.6; white-space: pre-wrap; }
    .field-empty { color: #9ca3af; font-style: italic; }

    /* ── Sub-sections ── */
    .subsection-title {
      font-size: 8.5pt; font-weight: 700; color: #0f3460;
      background: #f0f4fa; padding: 5px 10px;
      border-left: 3px solid #4da6ff; margin: 14px 0 10px;
    }

    /* ── Footer ── */
    .footer {
      padding: 14px 40px;
      display: flex; align-items: center; justify-content: space-between;
      font-size: 7.5pt; color: #9ca3af; border-top: 1px solid #e5e7eb;
    }
    .footer-brand { font-weight: 700; color: #6b7280; }

    /* ── Print / Screen ── */
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page-break { page-break-before: always; }
      .no-break { page-break-inside: avoid; }
      .print-btn { display: none !important; }
    }
    @media screen {
      body { max-width: 900px; margin: 0 auto; box-shadow: 0 0 32px rgba(0,0,0,0.15); }
      .print-btn {
        position: fixed; top: 16px; right: 16px;
        background: #0f3460; color: #fff; border: none;
        padding: 10px 22px; border-radius: 6px;
        font-size: 10pt; font-weight: 600; cursor: pointer; z-index: 100;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      }
      .print-btn:hover { background: #1a4f80; }
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">⬇ Print / Save PDF</button>

  <div class="cover">
    <div class="cover-top">
      ${spectecLogoHtml}
      ${clientLogoHtml}
    </div>
    <div class="cover-body">
      <div class="cover-eyebrow">Prepared for</div>
      <div class="cover-title">Quarterly<br/>Business Review</div>
      <div class="cover-accent"></div>
      <div class="cover-company">${companyName}</div>
      <div class="cover-meta">
        <div class="cover-meta-pill">Quarter: <strong>${d.quarter ?? "—"}</strong></div>
        <div class="cover-meta-pill">Date: <strong>${d.review_date ?? "—"}</strong></div>
        <div class="cover-meta-pill">Confidential</div>
      </div>
    </div>
  </div>

  ${pdfSection(1, "Executive Summary", "Account Manager", `
    ${pdfField("Key Achievements This Quarter", d.exec_achievements ?? "")}
    ${pdfField("Value Delivered (Business Outcomes)", d.exec_value_delivered ?? "")}
    ${pdfField("Key Risks or Challenges", d.exec_risks ?? "")}
    ${pdfField("Forward-Looking Opportunity", d.exec_forward_opportunity ?? "")}
  `)}

  ${pdfSection(2, "Customer Business Context & Priorities", "Account Manager", `
    ${pdfField("Changes in Fleet / Operations / Regulatory Environment", d.ctx_fleet_changes ?? "")}
    ${pdfField("Strategic Initiatives (ESG, Digitalisation, Cost Control)", d.ctx_strategic_initiatives ?? "")}
    ${pdfField("Top 3–5 Priorities (Confirmed)", d.ctx_top_priorities ?? "")}
  `)}

  ${pdfSection(3, "Value Realisation Review", "Account Manager + Customer Success Manager", `
    ${pdfSub("Asset Reliability")}
    ${pdfField("Downtime Trends & Maintenance Effectiveness", d.val_asset_reliability ?? "")}
    ${pdfSub("Compliance & Audit Readiness")}
    ${pdfField("Audit Outcomes / Regulatory Alignment", d.val_compliance ?? "")}
    ${pdfSub("Operational Control")}
    ${pdfField("Standardisation & Visibility Improvements", d.val_operational_control ?? "")}
    ${pdfSub("Procurement & Cost Control")}
    ${pdfField("Planning vs Reactive Spend / Inventory Visibility", d.val_procurement ?? "")}
  `)}

  ${pdfSection(4, "Customer Support & SLA Review", "Customer Support Manager", `
    ${pdfSub("SLA Performance")}
    ${pdfField("SLA Attainment vs Target / Response & Resolution Trends", d.sla_performance ?? "")}
    ${pdfSub("Ticket Analysis")}
    ${pdfField("Volume Trends & Breakdown by Type / Root Causes", d.sla_ticket_analysis ?? "")}
    ${pdfSub("Key Insights")}
    ${pdfField("Recurring Issues & Systemic Themes", d.sla_recurring_issues ?? "")}
    ${pdfSub("Actions Taken")}
    ${pdfField("Structural Fixes & Process Improvements Implemented", d.sla_actions_taken ?? "")}
    ${pdfSub("Forward Actions")}
    ${pdfField("Planned Initiatives to Reduce Ticket Volume", d.sla_forward_actions ?? "")}
  `)}

  ${pdfSection(5, "Adoption & Usage", "Customer Success Manager", `
    ${pdfField("Module Adoption", d.adopt_modules ?? "")}
    ${pdfField("User Engagement Levels", d.adopt_engagement ?? "")}
    ${pdfField("Process Maturity Assessment", d.adopt_maturity ?? "")}
  `)}

  ${pdfSection(6, "Product Updates & Roadmap", "AM / Product / TAM", `
    ${pdfField("Key Releases Since Last Review", d.prod_releases ?? "")}
    ${pdfField("Upcoming Roadmap Items (Relevant to This Customer)", d.prod_roadmap ?? "")}
  `)}

  ${pdfSection(7, "Commercial Overview", "Account Manager", `
    ${pdfField("Current Contract / Tier", d.comm_contract ?? "")}
    ${pdfField("Services in Use (Support, PS, APM)", d.comm_services ?? "")}
    ${pdfField("Value vs Investment Summary", d.comm_value ?? "")}
  `)}

  ${pdfSection(8, "Growth & Opportunity Discussion", "Account Manager", `
    ${pdfSub("Identified Opportunities")}
    ${pdfField("Additional Modules / Integrations / Training Needs", d.growth_opportunities ?? "")}
    ${pdfSub("Maturity Pathway")}
    ${pdfField("Current State", d.growth_maturity_current ?? "")}
    ${pdfField("Next Stage of Value", d.growth_maturity_next ?? "")}
  `)}

  ${pdfSection(9, "Joint Success Plan", "Account Manager + Customer", `
    ${pdfField("Top 3–5 Priorities Agreed", d.jsp_priorities ?? "")}
    ${pdfField("Agreed Actions (Owner | Action | Success Metric)", d.jsp_actions ?? "")}
  `)}

  ${pdfSection(10, "Close & Alignment", "Account Manager", `
    ${pdfField("Recap Key Commitments", d.close_commitments ?? "")}
    ${pdfField("Next QBR Date", d.close_next_qbr ?? "")}
    ${pdfField("Escalations / Executive Involvement Required", d.close_escalations ?? "")}
  `)}

  <div class="footer">
    <span class="footer-brand">SpecTec AMOS &nbsp;·&nbsp; Powered by GrandPlan</span>
    <span>Confidential &nbsp;·&nbsp; ${new Date().getFullYear()}</span>
  </div>

  <script>setTimeout(() => window.print(), 600);<\/script>
</body>
</html>`;

  return html;
}

function openPrintPreview(d: QBRData, companyName: string) {
  const html = generatePrintDoc(d, companyName);
  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

function downloadHtml(d: QBRData, companyName: string) {
  // Strip the auto-print script so the downloaded file doesn't print on open
  const html = generatePrintDoc(d, companyName).replace(
    /<script>setTimeout[\s\S]*?<\/script>/,
    ""
  );
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `QBR-${companyName.replace(/[^a-z0-9]/gi, "-")}-${(d.quarter ?? "Draft").replace(/\s+/g, "-")}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Main component ────────────────────────────────────────────────────────────

export const QBRTemplate = ({ planId }: Props) => {
  const { data: record, isLoading } = useQBR(planId);
  const { mutate: upsert } = useUpsertQBR();
  const { data: plan } = usePlan(planId);

  const [d, setD] = useState<QBRData>({});
  const [pptxBusy, setPptxBusy] = useState(false);

  useEffect(() => {
    if (record?.data) {
      // Pre-populate SpecTec logo if not already set for this plan
      setD({ spectec_logo: SPECTEC_LOGO_DEFAULT, ...record.data });
    }
  }, [record]);

  const save = (updates: Partial<QBRData>) => {
    const next = { ...d, ...updates };
    setD(next);
    upsert({ planId, id: record?.id, data: next });
  };

  const f = (key: keyof QBRData) => ({
    value: (d[key] as string) ?? "",
    onChange: (v: string) => setD((prev) => ({ ...prev, [key]: v })),
    onBlur: () => save({ [key]: d[key] }),
  });

  const company = plan?.company ?? "Customer";

  const handlePptx = async () => {
    setPptxBusy(true);
    try {
      await generateQbrPptx(d, company);
    } finally {
      setPptxBusy(false);
    }
  };

  if (isLoading)
    return (
      <SectionCard title="QBR Template">
        <div className="animate-pulse h-40 bg-muted rounded" />
      </SectionCard>
    );

  return (
    <SectionCard
      title="QBR Template"
      badge={
        <Badge variant="outline" className="text-xs">
          {d.quarter ?? "Set quarter below"}
        </Badge>
      }
      defaultOpen={false}
      action={
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs"
            onClick={() => openPrintPreview(d, company)}
          >
            <Download className="w-3.5 h-3.5" />
            Print / PDF
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs"
            onClick={() => downloadHtml(d, company)}
          >
            <FileDown className="w-3.5 h-3.5" />
            Save HTML
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs"
            disabled={pptxBusy}
            onClick={handlePptx}
          >
            <Presentation className="w-3.5 h-3.5" />
            {pptxBusy ? "Building…" : "Download PPTX"}
          </Button>
        </div>
      }
    >
      <div className="space-y-8">

        {/* ── Branding ── */}
        <div className="space-y-3">
          <Sub title="Branding" />
          <div className="grid grid-cols-2 gap-6">
            <LogoUpload
              label="SpecTec Logo"
              value={d.spectec_logo ?? SPECTEC_LOGO_DEFAULT}
              onChange={(b64) => save({ spectec_logo: b64 || SPECTEC_LOGO_DEFAULT })}
            />
            <LogoUpload
              label="Client Logo"
              value={d.client_logo ?? ""}
              onChange={(b64) => save({ client_logo: b64 || undefined })}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Logos appear in the PDF cover header. SpecTec logo is pre-loaded. Upload a client logo (PNG or SVG) to brand each QBR.
          </p>
        </div>

        {/* ── Meta ── */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Quarter
            </label>
            <Input
              value={d.quarter ?? ""}
              onChange={(e) => setD((prev) => ({ ...prev, quarter: e.target.value }))}
              onBlur={() => save({ quarter: d.quarter })}
              placeholder="e.g. Q2 2025"
              className="h-8 text-sm bg-background"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Review Date
            </label>
            <input
              type="date"
              value={d.review_date ?? ""}
              onChange={(e) => setD((prev) => ({ ...prev, review_date: e.target.value }))}
              onBlur={() => save({ review_date: d.review_date })}
              className="h-8 text-sm bg-background border border-input rounded-md px-3 w-full focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
            />
          </div>
        </div>

        {/* Section 1 */}
        <div className="space-y-4">
          <Sub title="1 · Executive Summary  —  AM" />
          <Field label="Key Achievements This Quarter" placeholder="What was delivered and achieved?" {...f("exec_achievements")} />
          <Field label="Value Delivered (Business Outcomes)" placeholder="Outcomes, not activities…" {...f("exec_value_delivered")} />
          <Field label="Key Risks or Challenges" placeholder="Issues that need attention…" {...f("exec_risks")} rows={2} />
          <Field label="Forward-Looking Opportunity" placeholder="What's the strategic opportunity ahead?" {...f("exec_forward_opportunity")} rows={2} />
        </div>

        {/* Section 2 */}
        <div className="space-y-4">
          <Sub title="2 · Customer Business Context & Priorities  —  AM" />
          <Field label="Changes in Fleet / Operations / Regulatory Environment" placeholder="Anything new in their world since last QBR?" {...f("ctx_fleet_changes")} />
          <Field label="Strategic Initiatives" placeholder="ESG, digitalisation, cost control, etc." {...f("ctx_strategic_initiatives")} />
          <Field label="Confirmed Top 3–5 Priorities" placeholder="1. …&#10;2. …&#10;3. …" {...f("ctx_top_priorities")} />
        </div>

        {/* Section 3 */}
        <div className="space-y-4">
          <Sub title="3 · Value Realisation Review  —  AM + CSM" />
          <Field label="Asset Reliability — Downtime Trends & Maintenance Effectiveness" {...f("val_asset_reliability")} />
          <Field label="Compliance & Audit Readiness — Audit Outcomes / Regulatory Alignment" {...f("val_compliance")} />
          <Field label="Operational Control — Standardisation & Visibility Improvements" {...f("val_operational_control")} />
          <Field label="Procurement & Cost Control — Planning vs Reactive / Inventory Visibility" {...f("val_procurement")} />
        </div>

        {/* Section 4 */}
        <div className="space-y-4">
          <Sub title="4 · Customer Support & SLA Review  —  Customer Support Manager" />
          <Field label="SLA Performance — Attainment vs Target, Response & Resolution Trends" placeholder="SLA %: …&#10;Trend vs last quarter: …" {...f("sla_performance")} />
          <Field label="Ticket Analysis — Volume, Breakdown by Type, Root Causes" placeholder="Volume: …&#10;Support / Defects / Feature Requests: …&#10;Top causes: …" {...f("sla_ticket_analysis")} />
          <Field label="Recurring Issues & Systemic Themes" placeholder="Configuration, training, data quality…" {...f("sla_recurring_issues")} rows={2} />
          <Field label="Actions Taken — Structural Fixes & Process Improvements" {...f("sla_actions_taken")} rows={2} />
          <Field label="Forward Actions — Planned Initiatives to Reduce Ticket Volume" {...f("sla_forward_actions")} rows={2} />
        </div>

        {/* Section 5 */}
        <div className="space-y-4">
          <Sub title="5 · Adoption & Usage  —  CSM" />
          <Field label="Module Adoption" placeholder="Which modules are being used? What's not adopted?" {...f("adopt_modules")} />
          <Field label="User Engagement Levels" placeholder="Active users, login frequency, depth of use…" {...f("adopt_engagement")} rows={2} />
          <Field label="Process Maturity Assessment" placeholder="Where are they on the maturity curve?" {...f("adopt_maturity")} rows={2} />
        </div>

        {/* Section 6 */}
        <div className="space-y-4">
          <Sub title="6 · Product Updates & Roadmap  —  AM / Product / TAM" />
          <Field label="Key Releases Since Last Review" placeholder="Highlight features relevant to this customer…" {...f("prod_releases")} />
          <Field label="Upcoming Roadmap Items (Relevant to Customer Priorities)" {...f("prod_roadmap")} />
        </div>

        {/* Section 7 */}
        <div className="space-y-4">
          <Sub title="7 · Commercial Overview  —  AM" />
          <Field label="Current Contract / Tier" placeholder="Contract value, renewal date, tier…" {...f("comm_contract")} rows={2} />
          <Field label="Services in Use" placeholder="Support tier, Professional Services, APM…" {...f("comm_services")} rows={2} />
          <Field label="Value vs Investment Summary" placeholder="ROI narrative for the customer…" {...f("comm_value")} />
        </div>

        {/* Section 8 */}
        <div className="space-y-4">
          <Sub title="8 · Growth & Opportunity Discussion  —  AM" />
          <Field label="Identified Opportunities" placeholder="Additional modules, integrations, training, process improvements…" {...f("growth_opportunities")} />
          <Field label="Maturity Pathway — Current State" {...f("growth_maturity_current")} rows={2} />
          <Field label="Maturity Pathway — Next Stage of Value" {...f("growth_maturity_next")} rows={2} />
        </div>

        {/* Section 9 */}
        <div className="space-y-4">
          <Sub title="9 · Joint Success Plan  —  AM + Customer" />
          <Field
            label="Top 3–5 Agreed Priorities"
            placeholder="1. …&#10;2. …&#10;3. …"
            {...f("jsp_priorities")}
          />
          <Field
            label="Agreed Actions (Owner | Action | Success Metric)"
            placeholder="SpecTec | … | …&#10;Customer | … | …"
            rows={5}
            {...f("jsp_actions")}
          />
        </div>

        {/* Section 10 */}
        <div className="space-y-4">
          <Sub title="10 · Close & Alignment  —  AM" />
          <Field label="Key Commitments Recap" placeholder="What did both parties agree to?" {...f("close_commitments")} rows={2} />
          <Field label="Next QBR Date" placeholder="e.g. Q3 2025 — September" {...f("close_next_qbr")} rows={1} />
          <Field label="Escalations / Executive Involvement Required" placeholder="Any issues requiring escalation?" {...f("close_escalations")} rows={2} />
        </div>
      </div>
    </SectionCard>
  );
};
