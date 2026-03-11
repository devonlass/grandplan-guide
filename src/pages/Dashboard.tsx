import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Building2, Crown, Plus, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAccounts, Account } from "@/hooks/useAccounts";
import { useHubSpotSync } from "@/hooks/useHubSpotSync";
import { supabase } from "@/lib/supabase";

const rankColors: Record<Account["account_rank"], string> = {
  Strategic: "bg-primary text-primary-foreground",
  Grow: "bg-green-100 text-green-700",
  Maintain: "bg-yellow-100 text-yellow-700",
  Micro: "bg-muted text-muted-foreground",
  Lose: "bg-destructive/15 text-destructive",
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { accounts, loading, error } = useAccounts();
  const { syncCompanies, syncing, error: syncError, syncedCount } = useHubSpotSync();
  const [search, setSearch] = useState("");
  const [filterAM, setFilterAM] = useState("all");
  const [filterCSM, setFilterCSM] = useState("all");
  const [filterRank, setFilterRank] = useState("all");

  const uniqueAMs = useMemo(() => [...new Set(accounts.map((p) => p.account_manager))], [accounts]);
  const uniqueCSMs = useMemo(() => [...new Set(accounts.map((p) => p.csm))], [accounts]);
  const uniqueRanks = useMemo(() => [...new Set(accounts.map((p) => p.account_rank))], [accounts]);

  const filtered = useMemo(() => {
    return accounts.filter((plan) => {
      const matchesSearch = plan.company.toLowerCase().includes(search.toLowerCase());
      const matchesAM = filterAM === "all" || plan.account_manager === filterAM;
      const matchesCSM = filterCSM === "all" || plan.csm === filterCSM;
      const matchesRank = filterRank === "all" || plan.account_rank === filterRank;
      return matchesSearch && matchesAM && matchesCSM && matchesRank;
    });
  }, [accounts, search, filterAM, filterCSM, filterRank]);

  // Fixed: "New Plan" button now navigates to a new plan route
  const handleNewPlan = () => navigate("/plan/new");
  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/login"); };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Account Plans</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {accounts.length} account plans • {filtered.length} shown
              </p>
              {/* Sync status messages */}
              {syncedCount > 0 && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ Synced {syncedCount} companies from HubSpot
                </p>
              )}
              {syncError && (
                <p className="text-sm text-destructive mt-1">
                  Sync error: {syncError}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button className="gap-2" onClick={handleNewPlan}>
                <Plus className="w-4 h-4" />
                New Plan
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Sign out">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by company name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterAM} onValueChange={setFilterAM}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Account Manager" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Account Managers</SelectItem>
              {uniqueAMs.map((am) => (
                <SelectItem key={am!} value={am!}>{am}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterCSM} onValueChange={setFilterCSM}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="CSM" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All CSMs</SelectItem>
              {uniqueCSMs.map((csm) => (
                <SelectItem key={csm!} value={csm!}>{csm}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterRank} onValueChange={setFilterRank}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Account Rank" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ranks</SelectItem>
              {uniqueRanks.map((rank) => (
                <SelectItem key={rank} value={rank}>{rank}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-5 animate-pulse">
                <div className="h-4 bg-muted rounded w-2/3 mb-4" />
                <div className="h-3 bg-muted rounded w-1/3 mb-6" />
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-16 text-destructive">
            <p className="text-lg font-medium">Failed to load account plans</p>
            <p className="text-sm mt-1">Check your Supabase connection and try again.</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-lg font-medium">No account plans found</p>
            <p className="text-sm mt-1">
              {accounts.length === 0
                ? "Sync from HubSpot or create your first account plan"
                : "Try adjusting your search or filters"}
            </p>
            {accounts.length === 0 && (
              <div className="flex items-center justify-center gap-3 mt-4">
                <Button variant="outline" className="gap-2" onClick={syncCompanies} disabled={syncing}>
                  <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
                  {syncing ? "Syncing..." : "Sync from HubSpot"}
                </Button>
                <Button className="gap-2" onClick={handleNewPlan}>
                  <Plus className="w-4 h-4" />
                  New Plan
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Plan Cards */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((plan) => (
              <div
                key={plan.id}
                onClick={() => navigate(`/plan/${plan.id}`)}
                className="bg-card border border-border rounded-lg p-5 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground leading-tight">
                      {plan.company}
                    </h3>
                  </div>
                </div>

                {plan.account_rank && (
                  <Badge className={`${rankColors[plan.account_rank]} mb-4`}>
                    <Crown className="w-3 h-3 mr-1" />
                    {plan.account_rank}
                  </Badge>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account Manager</span>
                    <span className="font-medium text-foreground">{plan.account_manager}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CSM</span>
                    <span className="font-medium text-foreground">{plan.csm}</span>
                  </div>
                  {plan.health_score && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Health Score</span>
                      <span className="font-medium text-foreground">{plan.health_score}/100</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    Last updated {new Date(plan.last_updated).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;