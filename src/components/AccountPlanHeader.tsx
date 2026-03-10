import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, RefreshCw } from "lucide-react";

// Fixed: moved QuickStat above AccountPlanHeader so it's defined before use
const QuickStat = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div className="text-xs text-primary-foreground/60 uppercase tracking-wide mb-1">
      {label}
    </div>
    <div className="text-xl font-semibold">{value}</div>
  </div>
);

export const AccountPlanHeader = () => {
  // Fixed: added placeholder handler for Export PDF button
  const handleExportPDF = () => {
    console.log("Export PDF clicked — wire up a PDF library here e.g. jsPDF");
  };

  return (
    <header className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-6 h-6" />
              <Badge className="bg-accent text-accent-foreground">Tier 1 Strategic</Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">
              Acme Corporation
            </h1>
            <p className="text-primary-foreground/70 text-sm">
              Strategic Account Plan • Q1 2025
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
              <Calendar className="w-4 h-4" />
              <span>Next Review: Apr 1, 2025</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
              <RefreshCw className="w-4 h-4" />
              <span>Last Updated: Jan 15, 2025</span>
            </div>
            {/* Fixed: added onClick handler */}
            <Button variant="secondary" size="sm" className="gap-2" onClick={handleExportPDF}>
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="mt-6 pt-6 border-t border-primary-foreground/10 grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickStat label="Annual Value" value="$2.4M" />
          <QuickStat label="Health Score" value="82/100" />
          <QuickStat label="Pipeline" value="$1.33M" />
          <QuickStat label="Renewal" value="Sep 2025" />
        </div>
      </div>
    </header>
  );
};
