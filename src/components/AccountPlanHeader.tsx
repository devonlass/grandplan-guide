import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, RefreshCw, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AccountDetail } from "@/hooks/useAccount";

const QuickStat = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div className="text-xs text-primary-foreground/60 uppercase tracking-wide mb-1">
      {label}
    </div>
    <div className="text-xl font-semibold">{value}</div>
  </div>
);

interface AccountPlanHeaderProps {
  account: AccountDetail | null;
}

export const AccountPlanHeader = ({ account }: AccountPlanHeaderProps) => {
  const navigate = useNavigate();

  const handleExportPDF = () => {
    console.log("Export PDF clicked — wire up a PDF library here e.g. jsPDF");
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return "—";
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  const formatDate = (date: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-GB", {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <header className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {/* Back button */}
              <button
                onClick={() => navigate("/")}
                className="text-primary-foreground/70 hover:text-primary-foreground flex items-center gap-1 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                All Accounts
              </button>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-6 h-6" />
              {account?.account_rank && (
                <Badge className="bg-accent text-accent-foreground">
                  {account.account_rank}
                </Badge>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">
              {account?.company ?? "Loading..."}
            </h1>
            <p className="text-primary-foreground/70 text-sm">
              Strategic Account Plan • {account?.account_manager ?? "—"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {account?.renewal_date && (
              <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Calendar className="w-4 h-4" />
                <span>Renewal: {formatDate(account.renewal_date)}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
              <RefreshCw className="w-4 h-4" />
              <span>Last Updated: {formatDate(account?.last_updated ?? null)}</span>
            </div>
            <Button variant="secondary" size="sm" className="gap-2" onClick={handleExportPDF}>
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="mt-6 pt-6 border-t border-primary-foreground/10 grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickStat label="Annual Value" value={formatCurrency(account?.annual_revenue ?? null)} />
          <QuickStat label="Health Score" value={account?.health_score ? `${account.health_score}/100` : "—"} />
          <QuickStat label="Industry" value={account?.industry ?? "—"} />
          <QuickStat label="Renewal" value={formatDate(account?.renewal_date ?? null)} />
        </div>
      </div>
    </header>
  );
};