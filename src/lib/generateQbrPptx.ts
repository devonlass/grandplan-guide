import PptxGenJS from "pptxgenjs";
import type { QBRData } from "@/hooks/useQBR";

// ── Brand colours (hex, no #) ─────────────────────────────────────────────────
const NAVY       = "0f3460";
const DARK_NAVY  = "061530";
const MID_NAVY   = "0a2240";
const ACCENT     = "4da6ff";
const WHITE      = "FFFFFF";
const GRAY       = "6b7280";
const LIGHT_BLUE = "a0b8d0";
const LABEL_COL  = "9ca3af";
const TEXT_COL   = "1a1a1a";
const SUBHD_BG   = "eff6ff";
const SUBHD_LINE = "bfdbfe";
const FOOTER_BG  = "f8fafc";
const FOOTER_BR  = "e2e8f0";

const W = 13.33;
const H = 7.5;

// ── Types ─────────────────────────────────────────────────────────────────────
interface SlideField {
  label: string;
  value: string;
  isSubheading?: boolean;
}

// ── Logo helper ───────────────────────────────────────────────────────────────
function tryAddLogo(
  slide: PptxGenJS.Slide,
  data: string,
  x: number,
  y: number,
  w: number,
  h: number
) {
  try {
    slide.addImage({ data, x, y, w, h });
  } catch {
    // silently ignore bad image data
  }
}

// ── Thin horizontal rule ──────────────────────────────────────────────────────
function addRule(slide: PptxGenJS.Slide, x: number, y: number, w: number, color: string) {
  slide.addShape("rect" as PptxGenJS.SHAPE_NAME, {
    x, y, w, h: 0.02,
    fill: { color },
    line: { color, width: 0 },
  });
}

// ── Footer strip ──────────────────────────────────────────────────────────────
function addFooter(slide: PptxGenJS.Slide, pageNum: number) {
  slide.addShape("rect" as PptxGenJS.SHAPE_NAME, {
    x: 0, y: H - 0.42, w: W, h: 0.42,
    fill: { color: FOOTER_BG },
    line: { color: FOOTER_BR, width: 1 },
  });
  slide.addText("SpecTec AMOS  ·  Confidential", {
    x: 0.35, y: H - 0.38, w: 6, h: 0.32,
    fontSize: 7, color: GRAY,
  });
  slide.addText(`${pageNum} of 10`, {
    x: W - 1.6, y: H - 0.38, w: 1.3, h: 0.32,
    fontSize: 7, color: GRAY, align: "right",
  });
}

// ── Content slide ─────────────────────────────────────────────────────────────
function addContentSlide(
  prs: PptxGenJS,
  num: number,
  title: string,
  owner: string,
  fields: SlideField[]
) {
  const slide = prs.addSlide();
  slide.background = { color: WHITE };

  // Header bar
  slide.addShape("rect" as PptxGenJS.SHAPE_NAME, {
    x: 0, y: 0, w: W, h: 1.1,
    fill: { color: NAVY },
    line: { color: NAVY, width: 0 },
  });

  // Section number circle
  slide.addShape("ellipse" as PptxGenJS.SHAPE_NAME, {
    x: 0.35, y: 0.2, w: 0.52, h: 0.52,
    fill: { color: ACCENT },
    line: { color: ACCENT, width: 0 },
  });
  slide.addText(String(num), {
    x: 0.35, y: 0.2, w: 0.52, h: 0.52,
    fontSize: 11, bold: true, color: DARK_NAVY,
    align: "center", valign: "middle",
  });

  // Section title + owner
  slide.addText(title, {
    x: 1.05, y: 0.1, w: 11.8, h: 0.56,
    fontSize: 15, bold: true, color: WHITE, valign: "middle",
  });
  slide.addText(owner, {
    x: 1.05, y: 0.65, w: 11.8, h: 0.32,
    fontSize: 8.5, color: ACCENT, valign: "middle",
  });

  addFooter(slide, num);

  // ── Content fields ──────────────────────────────────────────────────────────
  const TOP = 1.22;
  const BOTTOM = H - 0.52;
  let y = TOP;
  const PX = 0.35;
  const FW = W - 0.7;

  for (const f of fields) {
    if (y >= BOTTOM - 0.2) break; // overflow guard

    if (f.isSubheading) {
      // Subheading bar
      slide.addShape("rect" as PptxGenJS.SHAPE_NAME, {
        x: PX, y, w: FW, h: 0.27,
        fill: { color: SUBHD_BG },
        line: { color: SUBHD_LINE, width: 1 },
      });
      // Left accent stripe
      slide.addShape("rect" as PptxGenJS.SHAPE_NAME, {
        x: PX, y, w: 0.05, h: 0.27,
        fill: { color: ACCENT },
        line: { color: ACCENT, width: 0 },
      });
      slide.addText(f.label, {
        x: PX + 0.1, y, w: FW - 0.15, h: 0.27,
        fontSize: 8.5, bold: true, color: NAVY, valign: "middle",
      });
      y += 0.32;
    } else {
      // Field label
      slide.addText(f.label.toUpperCase(), {
        x: PX, y, w: FW, h: 0.2,
        fontSize: 6.5, bold: true, color: LABEL_COL, valign: "middle",
      });
      y += 0.21;

      // Field value
      const raw = f.value?.trim() || "—";
      const isEmpty = raw === "—";
      const lineCount = raw.split("\n").length;
      const valH = Math.min(Math.max(lineCount * 0.195, 0.25), 1.4);

      slide.addText(raw, {
        x: PX, y, w: FW, h: valH,
        fontSize: 9, color: isEmpty ? LABEL_COL : TEXT_COL,
        italic: isEmpty,
        valign: "top",
        wrap: true,
        breakLine: true,
      });
      y += valH + 0.16;
    }
  }
}

// ── Cover / closing shared header ─────────────────────────────────────────────
function addCoverHeader(
  slide: PptxGenJS.Slide,
  spectecLogo: string | undefined,
  clientLogo: string | undefined,
  companyName: string
) {
  // Dark top bar
  slide.addShape("rect" as PptxGenJS.SHAPE_NAME, {
    x: 0, y: 0, w: W, h: 1.55,
    fill: { color: DARK_NAVY },
    line: { color: DARK_NAVY, width: 0 },
  });

  // SpecTec logo or wordmark
  if (spectecLogo) {
    tryAddLogo(slide, spectecLogo, 0.35, 0.2, 2.6, 0.9);
  } else {
    slide.addText("SpecTec", { x: 0.4, y: 0.22, w: 2.5, h: 0.6, fontSize: 22, bold: true, color: WHITE });
    slide.addText("ASSET MANAGEMENT SOFTWARE", { x: 0.4, y: 0.82, w: 3.5, h: 0.25, fontSize: 6.5, color: ACCENT, charSpacing: 2 });
  }

  // Client logo or name
  if (clientLogo) {
    tryAddLogo(slide, clientLogo, 10.0, 0.2, 2.9, 0.9);
  } else {
    slide.addText(companyName, { x: 8.5, y: 0.4, w: 4.5, h: 0.65, fontSize: 14, bold: true, color: WHITE, align: "right" });
  }

  // Separator rule
  addRule(slide, 0.4, 1.6, W - 0.8, "1e3a5f");
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function generateQbrPptx(d: QBRData, companyName: string) {
  const prs = new PptxGenJS();
  prs.layout = "LAYOUT_WIDE";
  prs.title = `QBR – ${companyName} – ${d.quarter ?? ""}`;
  prs.author = "SpecTec AMOS";
  prs.company = "SpecTec";

  // ── Cover slide ─────────────────────────────────────────────────────────────
  const cover = prs.addSlide();
  cover.background = { color: MID_NAVY };

  addCoverHeader(cover, d.spectec_logo, d.client_logo, companyName);

  // "Prepared for" eyebrow
  cover.addText("PREPARED FOR", {
    x: 0.7, y: 1.95, w: 10, h: 0.28,
    fontSize: 7.5, bold: true, color: LIGHT_BLUE, charSpacing: 3,
  });

  // Main title
  cover.addText("Quarterly\nBusiness Review", {
    x: 0.7, y: 2.2, w: 10, h: 2.0,
    fontSize: 40, bold: true, color: WHITE, lineSpacingMultiple: 1.15,
  });

  // Accent stripe
  slide_addAccent(cover, 0.7, 4.35);

  // Company name
  cover.addText(companyName, {
    x: 0.7, y: 4.55, w: 10, h: 0.55,
    fontSize: 16, color: LIGHT_BLUE,
  });

  // Meta pills
  const pills = [
    d.quarter ? `Quarter: ${d.quarter}` : "Quarter: —",
    d.review_date ? `Date: ${d.review_date}` : "Date: —",
    "Confidential",
  ];
  let px = 0.7;
  const py = 5.45;
  for (const text of pills) {
    const pw = text.length * 0.115 + 0.45;
    cover.addShape("rect" as PptxGenJS.SHAPE_NAME, {
      x: px, y: py, w: pw, h: 0.32,
      fill: { color: "1e3a5f" },
      line: { color: "2d5a8e", width: 1 },
    });
    cover.addText(text, {
      x: px, y: py, w: pw, h: 0.32,
      fontSize: 8, color: LIGHT_BLUE, align: "center", valign: "middle",
    });
    px += pw + 0.14;
  }

  // ── 10 Section slides ────────────────────────────────────────────────────────
  addContentSlide(prs, 1, "Executive Summary", "Account Manager", [
    { label: "Key Achievements This Quarter",       value: d.exec_achievements ?? "" },
    { label: "Value Delivered (Business Outcomes)", value: d.exec_value_delivered ?? "" },
    { label: "Key Risks or Challenges",             value: d.exec_risks ?? "" },
    { label: "Forward-Looking Opportunity",         value: d.exec_forward_opportunity ?? "" },
  ]);

  addContentSlide(prs, 2, "Customer Business Context & Priorities", "Account Manager", [
    { label: "Fleet / Operations / Regulatory Changes",  value: d.ctx_fleet_changes ?? "" },
    { label: "Strategic Initiatives",                    value: d.ctx_strategic_initiatives ?? "" },
    { label: "Confirmed Top 3–5 Priorities",             value: d.ctx_top_priorities ?? "" },
  ]);

  addContentSlide(prs, 3, "Value Realisation Review", "Account Manager + Customer Success Manager", [
    { label: "Asset Reliability",                             isSubheading: true, value: "" },
    { label: "Downtime Trends & Maintenance Effectiveness",   value: d.val_asset_reliability ?? "" },
    { label: "Compliance & Audit Readiness",                  isSubheading: true, value: "" },
    { label: "Audit Outcomes / Regulatory Alignment",         value: d.val_compliance ?? "" },
    { label: "Operational Control",                           isSubheading: true, value: "" },
    { label: "Standardisation & Visibility Improvements",     value: d.val_operational_control ?? "" },
    { label: "Procurement & Cost Control",                    isSubheading: true, value: "" },
    { label: "Planning vs Reactive Spend / Inventory",        value: d.val_procurement ?? "" },
  ]);

  addContentSlide(prs, 4, "Customer Support & SLA Review", "Customer Support Manager", [
    { label: "SLA Performance",                               isSubheading: true, value: "" },
    { label: "Attainment vs Target / Response Trends",        value: d.sla_performance ?? "" },
    { label: "Ticket Analysis",                               isSubheading: true, value: "" },
    { label: "Volume, Breakdown by Type, Root Causes",        value: d.sla_ticket_analysis ?? "" },
    { label: "Key Insights — Recurring Issues & Themes",      value: d.sla_recurring_issues ?? "" },
    { label: "Actions Taken",                                 isSubheading: true, value: "" },
    { label: "Structural Fixes & Process Improvements",       value: d.sla_actions_taken ?? "" },
    { label: "Forward Actions",                               isSubheading: true, value: "" },
    { label: "Planned Initiatives to Reduce Ticket Volume",   value: d.sla_forward_actions ?? "" },
  ]);

  addContentSlide(prs, 5, "Adoption & Usage", "Customer Success Manager", [
    { label: "Module Adoption",            value: d.adopt_modules ?? "" },
    { label: "User Engagement Levels",     value: d.adopt_engagement ?? "" },
    { label: "Process Maturity Assessment", value: d.adopt_maturity ?? "" },
  ]);

  addContentSlide(prs, 6, "Product Updates & Roadmap", "AM / Product / TAM", [
    { label: "Key Releases Since Last Review",                 value: d.prod_releases ?? "" },
    { label: "Upcoming Roadmap Items (Relevant to Customer)",  value: d.prod_roadmap ?? "" },
  ]);

  addContentSlide(prs, 7, "Commercial Overview", "Account Manager", [
    { label: "Current Contract / Tier",        value: d.comm_contract ?? "" },
    { label: "Services in Use",                value: d.comm_services ?? "" },
    { label: "Value vs Investment Summary",     value: d.comm_value ?? "" },
  ]);

  addContentSlide(prs, 8, "Growth & Opportunity Discussion", "Account Manager", [
    { label: "Identified Opportunities",                     isSubheading: true, value: "" },
    { label: "Additional Modules / Integrations / Training", value: d.growth_opportunities ?? "" },
    { label: "Maturity Pathway",                             isSubheading: true, value: "" },
    { label: "Current State",                                value: d.growth_maturity_current ?? "" },
    { label: "Next Stage of Value",                          value: d.growth_maturity_next ?? "" },
  ]);

  addContentSlide(prs, 9, "Joint Success Plan", "Account Manager + Customer", [
    { label: "Top 3–5 Agreed Priorities",                     value: d.jsp_priorities ?? "" },
    { label: "Agreed Actions (Owner | Action | Metric)",      value: d.jsp_actions ?? "" },
  ]);

  addContentSlide(prs, 10, "Close & Alignment", "Account Manager", [
    { label: "Key Commitments Recap",                         value: d.close_commitments ?? "" },
    { label: "Next QBR Date",                                 value: d.close_next_qbr ?? "" },
    { label: "Escalations / Executive Involvement Required",  value: d.close_escalations ?? "" },
  ]);

  // ── Closing slide ────────────────────────────────────────────────────────────
  const closing = prs.addSlide();
  closing.background = { color: MID_NAVY };

  addCoverHeader(closing, d.spectec_logo, d.client_logo, companyName);

  closing.addText("Thank You", {
    x: 0, y: 2.3, w: W, h: 1.5,
    fontSize: 52, bold: true, color: WHITE, align: "center",
  });

  slide_addAccent(closing, (W - 1.1) / 2, 4.0);

  closing.addText("Prepared by SpecTec AMOS  ·  Confidential", {
    x: 0, y: 4.25, w: W, h: 0.4,
    fontSize: 10.5, color: LIGHT_BLUE, align: "center",
  });
  closing.addText(`${companyName}  ·  ${d.quarter ?? ""}`, {
    x: 0, y: 4.7, w: W, h: 0.4,
    fontSize: 10, color: GRAY, align: "center",
  });

  // ── Save ─────────────────────────────────────────────────────────────────────
  const fileName = `QBR-${companyName.replace(/[^a-z0-9]/gi, "-")}-${(d.quarter ?? "Draft").replace(/\s+/g, "-")}.pptx`;
  await prs.writeFile({ fileName });
}

// ── Accent stripe helper ──────────────────────────────────────────────────────
function slide_addAccent(slide: PptxGenJS.Slide, x: number, y: number) {
  slide.addShape("rect" as PptxGenJS.SHAPE_NAME, {
    x, y, w: 1.1, h: 0.07,
    fill: { color: ACCENT },
    line: { color: ACCENT, width: 0 },
  });
}
